const router = require('express').Router();
require('dotenv').config();
const { secretAccessKey, accessKeyId, REGION } = process.env;
const multer = require('multer');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

aws.config.update({
  secretAccessKey: secretAccessKey,
  accessKeyId: accessKeyId,
  region: REGION,
});

const s3 = new aws.S3();

const uploads = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'as-raymond0116-image',
    acl: 'public-read',
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = uniqueSuffix + '.' + file.mimetype.split('/')[1];
      const fullPath = 'uploads/' + filename;
      cb(null, fullPath);
    },
  }),
});

const cpUpload = uploads.fields([
  { name: 'main_image', maxCount: 1 },
  { name: 'images', maxCount: 8 },
  { name: 'pictures', maxCount: 8 },
]);

const { createProduct } = require('../contorllers/product_controller');
const { createCampaign } = require('../contorllers/marketing_contorller');

router.route('/admin/product').post(cpUpload, createProduct);
router.route('/admin/campaign').post(cpUpload, createCampaign);

module.exports = router;