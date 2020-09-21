const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const { checkout } = require("../contorllers/order_controller");

router.route('/order/checkout').post(wrapAsync(checkout));

module.exports = router;