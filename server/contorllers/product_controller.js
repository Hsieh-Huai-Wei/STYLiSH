require('dotenv').config();
const { HOST_S3 } = process.env;
const Product = require('../models/product_model');

function findProductData(product_detail) {
  const product_inf = new Object();
  const color = await Product.selectColor(product_detail.color_code);
  const size = await Product.selectSize(product_detail.sizes);
  const product_number = await Product.selectProduct(product_detail.id);
  product_inf = {
    color: color[0].id,
    size: size[0].id,
    id: product_number[0].id,
  }
  return product_inf;
};

const createProduct = async (req, res) => {
  const product = await Product.checkProduct(req.body.id);
  if (product.length === 1) {
    const product_inf = findProductData(req.body);
    const variant = await Product.selectVariant(product_inf);
    product_inf.stock = product_detail.stock;
    if (variant.length >= 1) {
      await Product.updateVariant(product_inf);
      res.send('variants update OK');
    } else if (variant.length === 0) {
      await Product.insertVariant(product_inf);
      res.send('variants insert OK');
    }
  } else if (product.length === 0) {
    const data = {
      id: req.body.id,
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      texture: req.body.texture,
      wash: req.body.wash,
      place: req.body.place,
      note: req.body.note,
      story: req.body.story,
      color_code: req.body.color_code,
      size: req.body.sizes,
      stock: req.body.stock,
      main_image: req.files['main_image'][0].key.split('/')[1],
    };
    //you cannot save array to mysql, so you need to transfer to string
    const images_urls = new Array();
    //because req.files is a array (contain object)
    const images = req.files['images'];
    images.forEach(image => images_urls.push(image.key.split('/')[1]));
    //array transfer to string
    data.images = images_urls.toString();
    //insert data function
    const classification = await Product.selectClass(req.body.class);
    const class_id = classification[0].id;
    await Product.insertProduct(data, class_id);
    const product_inf = findProductData(data);
    product_inf.stock = data.stock;
    await Product.insertVariant(product_inf);
    res.send('overall table record inserted');
  } else {
    throw err;
  }
};

const getProducts = async (req, res, next) => {
  try {
    const products = new Object();
    const count = await Product.countP(
      req.params.category,
      req.query.keyword,
      req.query.id
    );
    const all_pages = Math.floor((count - 1) / 6);
    if (isNaN(req.query.paging) || req.query.paging <= 0) {
      paging = 0;
    } else if (req.query.paging > 0) {
      paging = parseInt(req.query.paging);
    } else {
      paging = 0;
    }
    if (paging < all_pages) {
      products.next_paging = paging + 1;
    }
    const product_list = await Product.resultP(
      req.params.category,
      paging,
      req.query.keyword,
      req.query.id
    );
    const product_id = product_list.map(product => product.id);
    const product_size = await Product.resultS(product_id);
    const product_color = await Product.resultC(product_id);
    const product_variants = await Product.resultV(product_id);

    product_list.forEach(product => {
      product.main_image = HOST_S3 + 'uploads/' + product.main_image;
      const pictures_urls = new Array();
      const pictures = product.images.split(',');
      pictures.forEach(picture => {
        pictures_urls.push(
          HOST_S3 + 'uploads/' + picture
        );
      });
      product.images = pictures_urls;
      product.sizes = new Array();
      for (size of product_size) {
        if (size.number === product.id) {
          product.sizes.push(size.size);
        }
      }
      product.colors = new Array();
      for (color of product_color) {
        if (color.number === product.id) {
          data = {};
          data.code = color.code;
          data.name = color.name;
          product.colors.push(data);
        }
      }
      product.variants = new Array();
      for (variant of product_variants) {
        if (variant.number === product.id) {
          data = new Object();
          data.color_code = variant.code;
          data.size = variant.size;
          data.stock = variant.stock;
          product.variants.push(data);
        }
      }
    });

    if (req.params.category === 'details') {
      products.data = product_list[0];
      res.json(products);
    } else {
      products.data = product_list;
      res.json(products);
    }
  } catch (e) {
    res.sendStatus(500);
  }
};

module.exports = {
  createProduct,
  getProducts,
};
