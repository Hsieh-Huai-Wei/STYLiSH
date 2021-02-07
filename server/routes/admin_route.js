const router = require('express').Router();
const { uploads } = require('../../util/util')

const cpUpload = uploads.fields([
  { name: 'main_image', maxCount: 1 },
  { name: 'images', maxCount: 8 },
  { name: 'pictures', maxCount: 8 },
]);

const { createProduct } = require('../controllers/product_controller');
const { createCampaign } = require('../controllers/marketing_controller');

router.route('/admin/product').post(cpUpload, createProduct);
router.route('/admin/campaign').post(cpUpload, createCampaign);

module.exports = router;