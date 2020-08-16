const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const { getProducts } = require('../models/product_model');

router.route('/products/:category').get(wrapAsync(getProducts));

module.exports = router;