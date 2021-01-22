const Product = require("../models/product_model");

const createProduct = async (req, res) => {
  const checkProduct = req.body.id;
  const check = await Product.checkProduct(checkProduct);
  if (check.length === 1) {
    const userCode = req.body.color_code;
    const checkCode = await Product.selectColor(userCode);
    const colorCode = checkCode[0].id;
    const userSize = req.body.sizes;
    const checkSize = await Product.selectSize(userSize);
    const size = checkSize[0].id;
    const checkProductId = await Product.selectProduct(checkProduct);
    const productId = checkProductId[0].id;
    const checkVariant = await Product.selectVariant(colorCode, size, productId);
    const userStock = req.body.stock;
    if (checkVariant.length >= 1) {
      const id = checkProductId[0].id;
      await Product.updateVariant(userStock, id);
      res.send("variants update OK");
    } else if (checkVariant.length === 0) {
      await Product.insertVariant(colorCode, size, productId, userStock);
      res.send("variants insert OK");
    } else {
    }
  } else if (check.length === 0) {
    let data = {
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
      main_image: req.files["main_image"][0].key.split("/")[1],
    };
    //you cannot save array to mysql, so you need to transfer to string
    let result = [];
    //because req.files is a array (contain object)
    let images = req.files["images"];
    for (let i = 0; i < images.length; i++) {
      result.push(images[i].key.split("/")[1]);
    }
    //array transfer to string
    data.images = result.toString();
    //insert data function
    const userClass = req.body.class;
    const classResult = await Product.selectClass(userClass);
    const classId = classResult[0].id;
    await Product.insertProduct(data, classId)
    const userCode = req.body.color_code;
    const checkCode = await Product.selectColor(userCode);
    const colorCode = checkCode[0].id;
    const userSize = req.body.sizes;
    const checkSize = await Product.selectSize(userSize);
    const size = checkSize[0].id;
    const checkProductId = await Product.selectProduct(checkProduct);
    const productId = checkProductId[0].id;
    await Product.insertVariant(colorCode, size, productId, data.stock);
    res.send("overall table record inserted");
  } else {
    throw err;
  }
};

// redis以前 product
const getProducts = async (req, res, next) => {
  try {
    const hostName = `https://as-raymond0116-image.s3.us-east-2.amazonaws.com/`;
    let productObjS = {};
    let productCount = await Product.countP(
      req.params.category,
      req.query.keyword,
      req.query.id
    );
    console.log(req)
    console.log(req.params)
    let allPages = Math.floor((productCount - 1) / 6);
    // define user query paging
    if (isNaN(req.query.paging) || req.query.paging <= 0) {
      paging = 0;
    } else if (req.query.paging > 0) {
      paging = parseInt(req.query.paging);
    } else {
      paging = 0;
    }
    // insert "next_paging" display
    if (paging < allPages) {
      productObjS.next_paging = paging + 1;
    }
    let productObj = JSON.parse(
      JSON.stringify(
        await Product.resultP(
          req.params.category,
          paging,
          req.query.keyword,
          req.query.id
        )
      )
    );
    let productF = productObj.map((obj) => obj.id); //五筆資料
    let sizeObj = JSON.parse(JSON.stringify(await Product.resultS(productF)));
    let colorObj = JSON.parse(JSON.stringify(await Product.resultC(productF)));
    let variantsObj = JSON.parse(JSON.stringify(await Product.resultV(productF)));
    for (let i = 0; i < productObj.length; i++) {
      productObj[i].main_image =
        hostName + "uploads/" + productObj[i].main_image;
    }
    for (let i = 0; i < productObj.length; i++) {
      let imagesArray = [];
      for (let j = 0; j < productObj[i].images.split(",").length; j++) {
        imagesArray.push(
          hostName + "uploads/" + productObj[i].images.split(",")[j]
        );
      }
      productObj[i].images = imagesArray;
    }
    for (let i = 0; i < productObj.length; i++) {
      productObj[i].sizes = [];
      for (item of sizeObj) {
        if (item.number === productObj[i].id) {
          productObj[i].sizes.push(item.size);
        }
      }

      productObj[i].colors = [];
      for (item of colorObj) {
        if (item.number === productObj[i].id) {
          data = {};
          data.code = item.code;
          data.name = item.name;
          productObj[i].colors.push(data);
        }
      }

      productObj[i].variants = [];
      for (item of variantsObj) {
        if (item.number === productObj[i].id) {
          data = {};
          data.color_code = item.code;
          data.size = item.size;
          data.stock = item.stock;
          productObj[i].variants.push(data);
        }
      }
    }
    if (req.params.category === "details") {
      productObjS.data = productObj[0];
      res.json(productObjS);
    } else {
      productObjS.data = productObj;
      res.json(productObjS);
    }
  } catch (e) {
    res.sendStatus(500);
  }
};

module.exports = {
  createProduct,
  getProducts,
};
