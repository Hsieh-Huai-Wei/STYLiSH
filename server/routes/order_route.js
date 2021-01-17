const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const { createOrder } = require("../contorllers/order_controller")

router.route('/order/checkout').post(wrapAsync(createOrder));

module.exports = router;