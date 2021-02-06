require('dotenv').config();
const { HOST_S3 } = process.env;
const Product = require('../models/product_model');

const createProduct = async (req, res, next) => {
  try {
    const product = await Product.checkProduct(req.body.id);
    if (product.length === 1) {
      const product_inf = {
        product: product[0].id,
        color: req.body.color_code,
        size: req.body.sizes,
      };
      const product_data = await Product.findIdByProductId(product_inf);
      product_inf.color = product_data[0].size_id;
      product_inf.size = product_data[0].color_id;
      const variant_id = await Product.selectVariant(product_inf);
      if (variant_id.length >= 1) {
        await Product.updateVariantById(variant_id[0].id, req.body.stock);
        res.status(201).json({msg: '此產品數量已成功更新!'});
      } else if (variant_id.length === 0) {
        await Product.insertVariant(product_inf, req.body.stock);
        res.status(201).json({msg: '此產品已成功新增!'});
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
      const images_urls = new Array();
      const images = req.files['images'];
      images.forEach(image => images_urls.push(image.key.split('/')[1]));
      data.images = images_urls.toString();
      const classification = await Product.selectClass(req.body.class);
      const class_id = classification[0].id;
      await Product.insertProduct(data, class_id);
      const product_ids = await Product.findIdByProductInf(data);
      product_ids[0].stock = data.stock;
      await Product.newVariant(product_ids[0]);
      res.status(201).json({msg: '此產品已成功建立!'});
    }
  } catch (error) {
    console.error(`Product create fail : ${error}`);
    res.status(404).json({error: '產品建立失敗，請重新再試！'});
  }
};

const getProducts = async (req, res, next) => {
  try {
    const products = new Object();
    const count = await Product.countProducts(
      req.params.category,
      req.query.keyword,
      req.query.id
    );
    if (count === 0) return res.status(200).json({ error: '尚無產品上架!'});
    const all_pages = Math.floor((count - 1) / 6);
    let paging = 0;
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
    const product_list = await Product.getProducts(
      req.params.category,
      paging,
      req.query.keyword,
      req.query.id
    );
    if (product_list.length === 0) return res.status(200).json({error: '尚無產品上架!'});
    const product_id = product_list.map(product => product.id);
    const product_size = await Product.getSize(product_id);
    const product_color = await Product.getColor(product_id);
    const product_variants = await Product.getVariants(product_id);

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
      for (const size of product_size) {
        if (size.number === product.id) {
          product.sizes.push(size.size);
        }
      }
      product.colors = new Array();
      for (const color of product_color) {
        if (color.number === product.id) {
          const data = new Object();
          data.code = color.code;
          data.name = color.name;
          product.colors.push(data);
        }
      }
      product.variants = new Array();
      for (const variant of product_variants) {
        if (variant.number === product.id) {
          const data = new Object();
          data.color_code = variant.code;
          data.size = variant.size;
          data.stock = variant.stock;
          product.variants.push(data);
        }
      }
    });

    if (req.params.category === 'details') {
      products.data = product_list[0];
      res.status(200).json(products);
    } else {
      products.data = product_list;
      res.status(200).json(products);
    }
  } catch (error) {
    next(error);
  }
};

const getStocks = async (req, res, next) => {
  try {
    let cart_list = new Array();
    const cart = req.body;
    const cart_length = req.body.length;
    cart.forEach(product => {
      const temp_arr = Object.values(product);
      cart_list = cart_list.concat(temp_arr);
    });
    const products = await Product.getStock(cart_list, cart_length);
    res.status(200).json({data: products})
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getProducts,
  getStocks
};
