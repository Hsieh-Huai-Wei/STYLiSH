const router = require('express').Router();
const { wrapAsync } = require('../../util/util');
const { getCampaignsFromRedis } = require('../contorllers/marketing_contorller');

router.route('/marketing/campaigns').get(wrapAsync(getCampaignsFromRedis));

module.exports = router;