const router = require('express').Router();

require("dotenv").config();
const { secretAccessKey, accessKeyId } = process.env;

//multer module
const multer = require("multer");
// const singleUpload = uploads.single("image");

// AWS S3
const aws = require("aws-sdk");
const multerS3 = require("multer-s3");

aws.config.update({
  secretAccessKey: secretAccessKey,
  accessKeyId: accessKeyId,
  region: "ap-northeast-2",
});

const s3 = new aws.S3();

var uploads = multer({
  storage: multerS3({
    s3: s3,
    bucket: "as-raymond0116-image",
    acl: "public-read",
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = uniqueSuffix + "." + file.mimetype.split("/")[1];
      const fullPath = "uploads/" + filename;
      cb(null, fullPath);
    },
  }),
});

var cpUpload = uploads.fields([
  { name: "main_image", maxCount: 1 },
  { name: "images", maxCount: 8 },
  { name: "pictures", maxCount: 8 },
]);

// app.post("/image-upload", function (req, res) {
//   singleUpload(req, res, function (err) {
//     return res.json({ imageUrl: req.file });
//   });
// });

const { createProduct } = require('../models/product_model');
const { createCampaign } = require('../models/marketing_model');

router.route('/admin/product').post(cpUpload, createProduct);
router.route('/admin/campaign').post(cpUpload, createCampaign);

module.exports = router;