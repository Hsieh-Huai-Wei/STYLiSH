require("dotenv").config();
const { HOST_S3 } = process.env;
const Marketing = require("../models/marketing_model");
const redis = require("../../util/redis");

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
  const searchResult = await Marketing.searchCampaign(data);
  if (searchResult.length === 0) {
    const err = new Error("No campaign in Redis.");
    err.status = 400;
    next(err);
  } else {
    let productId = searchResult[0].id;
    await Marketing.createCampaign(productId, data.pictures, data.story);
    try {
      redis.del("campaigns", (err, res) => {
        if (err) throw err;
      });
    } catch (e) {
      console.log("Delete cache failed");
    }
    res.send("OK");
  }
};

const getCampaigns = async (req, res, next) => {
  try {
    const cache = await redis.getCache("campaigns");
    console.log("from redis");
    return res.json(cache);
  } catch (e) {
    console.log("from db");
    let campaignsObjS = {};
    let campaignsCount = await Marketing.countCam();
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
    let limit = 6;
    let campaignsObj = await Marketing.resultCam(limit, paging);
    for (let i = 0; i < campaignsObj.length; i++) {
      let picturesArray = [];
      let x = campaignsObj[i].picture.split(",").length;
      for (let j = 0; j < x; j++) {
        picturesArray.push(
          HOST_S3 + "uploads/" + campaignsObj[i].picture.split(",")[j]
        );
      }
      campaignsObj[i].picture = picturesArray;
    }
    campaignsObjS.data = campaignsObj;
    redis.set("campaigns", JSON.stringify(campaignsObjS));
    res.json(campaignsObjS);
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
};
