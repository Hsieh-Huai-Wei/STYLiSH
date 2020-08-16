require("dotenv").config();
const mysql = require("mysql");
const { HOST, USERNAME2, PASSWORD, DATABASE } = process.env;

// DB connection
const con = mysql.createConnection({
  host: HOST, // MYSQL HOST NAME
  user: USERNAME2, // MYSQL USERNAME
  password: PASSWORD, // MYSQL PASSWORD
  database: DATABASE, // MYSQL DB NAME
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});


const hostName = `https://as-raymond0116-image.s3.us-east-2.amazonaws.com/`;


countCam = () => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT
        COUNT(id) AS count
      FROM campaigns`;
    con.query(sql, (err, results) => {
      if (err) throw err;
      resolve(JSON.parse(JSON.stringify(results[0].count)));
    });
  });
};

resultCam = () => {
  return new Promise((resolve, reject) => {
    let limit = 6;
    let sql = `
      SELECT 
        product_id, picture, story
      FROM campaigns `;
    sql += ` ORDER BY campaigns.id ASC LIMIT ${limit} OFFSET ${paging * limit}`;
    con.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

const createCampaign = async (req, res, next) => {
  let data = {
    story: req.body.story,
  };

  let result = [];
  let pictures = req.files["pictures"];
  for (let i = 0; i < pictures.length; i++) {
    result.push(pictures[i]["filename"]);
  }
  data.pictures = result.toString();
  data.productID = req.body.number;

  // insertMarketingData(data, next);
  var sql = `SELECT id FROM stylish.product WHERE number = "${data.productID}";`;
  con.query(sql, function (err, result) {
    if (err) next(err);
    if (result.length === 0) {
      const err = new Error("NOOOOOOOOOO");
      err.status = 400;
      next(err);
    } else {
      let productId = result[0].id;
      var sql =
        "INSERT INTO campaigns SET product_id = ?, picture = ?, story = ?";
      con.query(sql, [productId, data.pictures, data.story], function (err) {
        if (err) next(err);
        // console.log("campaigns table record inserted");
        res.send("OK");
      });
    }
  });
};

const getCampaigns = async (req, res, next) => {
  try {
    let campaignsObjS = {};
    let campaignsCount = await countCam();
    let allCamPages = Math.floor((campaignsCount - 1) / 6);
    if (isNaN(req.query.paging) || req.query.paging <= 0) {
      paging = 0;
    } else if (req.query.paging > 0) {
      paging = parseInt(req.query.paging);
    } else {
      paging = 0;
    }
    if (paging < allCamPages) {
      campaignsObjs.next_paging = paging + 1;
    }

    let campaignsObj = JSON.parse(JSON.stringify(await resultCam()));

    for (let i = 0; i < campaignsObj.length; i++) {
      //length = 3
      let picturesArray = [];
      let x = campaignsObj[i].picture.split(",").length;
      // console.log(x) //2
      for (let j = 0; j < x; j++) {
        // for (let j = 0; j < productObj[i].images.split(",").length; j++) {
        picturesArray.push(
          hostName + "uploads/" + campaignsObj[i].picture.split(",")[j]
        );
      }
      campaignsObj[i].picture = picturesArray;
    }

    campaignsObjS.data = campaignsObj;
    res.json(campaignsObjS);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
};

module.exports = {
  createCampaign,
  getCampaigns
};