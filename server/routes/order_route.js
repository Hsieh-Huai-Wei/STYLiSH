const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const { checkout } = require('../models/order_model');

router.route('/order/checkout').post(wrapAsync(checkout));

module.exports = router;