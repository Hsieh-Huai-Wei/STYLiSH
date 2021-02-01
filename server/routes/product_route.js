const router = require('express').Router();
const { wrapAsync } = require('../../util/util');
const { getProducts, getStocks } = require('../contorllers/product_controller');

router.route('/products/:category').get(wrapAsync(getProducts));
router.route('/products/stock').post(wrapAsync(getStocks));

module.exports = router;