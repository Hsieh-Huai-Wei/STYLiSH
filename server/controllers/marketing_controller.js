require('dotenv').config();
const { HOST_S3, CACHE_CAMPAIGN_KEY } = process.env;
const Marketing = require('../models/marketing_model');
const Redis = require('../../util/redis');

const createCampaign = async (req, res, next) => {
  try {
    const campaigns = await Marketing.searchCampaign(req.body.number);
    if (campaigns.length === 0) return res.status(400).json({ error: '此推廣產品已存在!' });
    const pictures = req.files['pictures'][0].key.split('/')[1];
    const product_inf = {
      story: req.body.story,
      picture: pictures,
      product_id: searchResult[0].id
    };
    await Marketing.createCampaign(product_inf);
    try {
      if (Redis.redisClient.ready) {
        await Redis.del(CACHE_CAMPAIGN_KEY);
      }
    } catch (error) {
      console.error(`Delete campaign cache error: ${error}`);
    }
    res.status(201).send('此推廣產品建立成功');
  } catch (error) {
    next(error);
  }
};

const getCampaigns = async (req, res, next) => {
  let cacheCampaigns;
  try {
    if (Redis.redisClient.ready) {
      cacheCampaigns = await Redis.get(CACHE_CAMPAIGN_KEY);
    } 
  } catch (error) {
    console.error(`Get campaign cache error: ${error}`);
  }
  if (cacheCampaigns) {
    console.log('Campaigns from redis.');
    res.status(200).json({data: JSON.parse(cacheCampaigns)});
    return;
  };

  const campaigns = await Marketing.getCampaigns();
  campaigns.map(detail => {
    return detail.picture = HOST_S3 + 'uploads/' + detail.picture;
  });

  try {
    await Redis.set(CACHE_CAMPAIGN_KEY, JSON.stringify(campaigns));
  } catch (error) {
    console.error(`Set campaign cache error: ${error}`);
  }
  res.status(200).json({data: campaigns})
};

module.exports = {
  createCampaign,
  getCampaigns,
};
