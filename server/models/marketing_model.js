const { query } = require("../../util/dbcon");
const redis = require('../../util/redis')

const hostName = `https://as-raymond0116-image.s3.us-east-2.amazonaws.com/`;

const countCam = async () => {
  const result = await query('SELECT COUNT(id) AS count FROM campaigns');
  return result[0].count;
};

const resultCam = async (limit, paging) => {
  const offset = limit*paging;
  console.log(offset)
  console.log(`SELECT product_id, picture, story FROM stylish.campaigns ORDER BY campaigns.id ASC LIMIT ${limit} OFFSET ${offset}`)
  const result = await query('SELECT product_id, picture, story FROM stylish.campaigns ORDER BY campaigns.id ASC LIMIT ? OFFSET ?', [limit, offset]);
  return result;
};

const option = async (data) => {
  const result = await query('SELECT * FROM stock.history_price WHERE(date between ? and ?) AND (close between ? and ?) ORDER BY stock_id, date DESC;', [data.start, data.end, data.lower, data.upper]);
  return result;
};

const searchCampaign = async (data) => {
  const result = await query('SELECT id FROM stylish.product WHERE number = ? ;', [data.productID]);
  return result;
};

const createCampaign = async (productId, data) => {
  const result = await query(
    "INSERT INTO campaigns SET product_id = ?, picture = ?, story = ?",
    [productId, data.pictures, data.story]
  );
  return result;
};

const getCampaigns = async (req, res, next) => {
  try {
    const cache = await redis.getCache('campaigns')
    console.log('from redis')
    return res.json(cache);
  } catch (e) {
    console.log('from db')
    console.log(e)
    let campaignsObjS = {};
    console.log('here')
    let campaignsCount = await query('SELECT COUNT(id) AS count FROM campaigns');
    console.log('campaignsCount',campaignsCount)
    console.log(1)
    let allCamPages = Math.floor((campaignsCount - 1) / 6);
    console.log(2)
    if (isNaN(req.query.paging) || req.query.paging <= 0) {
      paging = 0;
    } else if (req.query.paging > 0) {
      paging = parseInt(req.query.paging);
    } else {
      paging = 0;
    }
    console.log(3)
    if (paging < allCamPages) {
      console.log(4)
      campaignsObjs.next_paging = paging + 1;
    }
    console.log(5)
    let campaignsObj = JSON.parse(JSON.stringify(await resultCam()));
    console.log(6)
    for (let i = 0; i < campaignsObj.length; i++) {
      let picturesArray = [];
      let x = campaignsObj[i].picture.split(",").length;
      for (let j = 0; j < x; j++) {
        picturesArray.push(
          hostName + "uploads/" + campaignsObj[i].picture.split(",")[j]
        );
      }
      campaignsObj[i].picture = picturesArray;
    }
    campaignsObjS.data = campaignsObj;
    redis.set('campaigns', JSON.stringify(campaignsObjS))
    res.json(campaignsObjS);
  }
};

module.exports = {
  countCam,
  resultCam,
  option,
  searchCampaign,
  createCampaign,
  getCampaigns
};