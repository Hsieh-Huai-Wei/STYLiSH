const router = require('express').Router();
const { wrapAsync } = require('../../util/util');

const { dashboard } = require("../models/midterm_model");

router.route('/dashboard').get(wrapAsync(dashboard));

module.exports = router;
