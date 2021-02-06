const router = require('express').Router();
const { wrapAsync } = require('../../util/util');
const { getCampaignsFromRedis } = require('../controllers/marketing_controller');

router.route('/marketing/campaigns').get(wrapAsync(getCampaignsFromRedis));

module.exports = router;