require('dotenv').config();
const { HOST_S3 } = process.env;
const Marketing = require('../models/marketing_model');
const redis = require('../../util/redis');

const createCampaign = async (req, res, next) => {
  try {
    const searchResult = await Marketing.searchCampaign(req.body.number);
    if (searchResult.length === 0) return res.status(400).json({ error: '此推廣產品已存在!' });
    const pictures = req.files['pictures'][0].key.split('/')[1];
    const product_inf = {
      story: req.body.story,
      picture: pictures,
      product_id: searchResult[0].id
    };
    await Marketing.createCampaign(product_inf);
    res.status(201).json({ msg: '此推廣產品建立成功!' });
  } catch (error) {
    next(error);
  }
};

async function getCampaigns (page_req) {
  try {
    const products = new Object();
    const campaignsCount = await Marketing.countCampaigns();
    if (campaignsCount === 0) return campaignsCount;
    const allCamPages = Math.floor((campaignsCount - 1) / 6);
    let paging = 0;
    if (isNaN(page_req) || page_req <= 0) {
      paging = 0;
    } else if (page_req > 0) {
      paging = parseInt(page_req);
    } else {
      paging = 0;
    }
    if (paging < allCamPages) {
      products.next_paging = paging + 1;
    }
    const limit = 6;
    const campaign_inf = await Marketing.getCampaigns(limit, paging);
    campaign_inf.forEach(detail => {
      const pictures_urls = new Array();
      pictures_urls.push(
        HOST_S3 + 'uploads/' + detail.picture
      );
      detail.picture = pictures_urls;
    });
    products.data = campaign_inf;
    redis.set('campaigns', JSON.stringify(products));
    return products;
  } catch (error) {
    console.log(error);
    return {error: '伺服器似乎有狀況，請稍後再測試!'};
  }
}

const getCampaignsFromRedis = async (req, res, next) => {
  try {
    const cache = await redis.getCache('campaigns');
    if (cache.data.length === 0) {
      const campaigns = await getCampaigns();
      if (campaigns.error) return res.status(500).json({error: campaigns.error});
      if (campaigns === 0) return res.status(400).json({msg: '尚未建立推廣產品！'});
      res.status(200).json(campaigns);
    };
    res.status(200).json(cache);
  } catch (error) {
    const campaigns = await getCampaigns();
    if (campaigns.error) return res.status(500).json({msg: campaigns.error});
    if (campaigns === 0) return res.status(200).json({msg: '尚未建立推廣產品！'});
    res.status(200).json(campaigns);
  }
};

module.exports = {
  createCampaign,
  getCampaignsFromRedis,
};
