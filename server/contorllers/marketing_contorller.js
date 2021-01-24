require('dotenv').config();
const { HOST_S3 } = process.env;
const Marketing = require('../models/marketing_model');
const redis = require('../../util/redis');

const createCampaign = async (req, res, next) => {
  const picture_urls = new Array();
  const pictures = req.files['pictures'];
  pictures.forEach(picture => picture_urls.push(picture['filename']));
  const product_inf = {
    story: req.body.story,
    pictures: picture_urls.toString(),
    id: req.body.number
  };
  const searchResult = await Marketing.searchCampaign(product_inf);
  if (searchResult.length === 0) {
    const err = new Error('No campaign in Redis.');
    err.status = 400;
    next(err);
  } else {
    await Marketing.createCampaign(product_inf);
    try {
      redis.del('campaigns', (err, res) => {
        if (err) throw err;
      });
    } catch (error) {
      console.log('Delete cache failed');
    }
    res.send('OK');
  }
};

const getCampaigns = async (req, res, next) => {
  try {
    const cache = await redis.getCache('campaigns');
    return res.json(cache);
  } catch (error) {
    const products = new Object();
    const campaignsCount = await Marketing.countCam();
    const allCamPages = Math.floor((campaignsCount - 1) / 6);
    if (isNaN(req.query.paging) || req.query.paging <= 0) {
      paging = 0;
    } else if (req.query.paging > 0) {
      paging = parseInt(req.query.paging);
    } else {
      paging = 0;
    }
    if (paging < allCamPages) {
      products.next_paging = paging + 1;
    }
    const limit = 6;
    const campaign_inf = await Marketing.resultCam(limit, paging);
    campaign_inf.forEach(detail => {
      const pictures_urls = new Array();
      const pictures = detail.picture.split(',').length;
      pictures.forEach(picture => {
        pictures_urls.push(
          HOST_S3 + 'uploads/' + picture
        );
      });
      detail.picture = pictures_urls;
    })
    products.data = campaign_inf;
    redis.set('campaigns', JSON.stringify(products));
    res.json(products);
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
};
