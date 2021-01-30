const router = require('express').Router();
const { wrapAsync } = require('../../util/util');
const { getFromRedis } = require('../contorllers/marketing_contorller');

router.route('/marketing/campaigns').get(wrapAsync(getCampaigns));

module.exports = router;