const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const { getCampaigns } = require('../models/marketing_model');

router.route('/marketing/campaigns').get(wrapAsync(getCampaigns));

module.exports = router;