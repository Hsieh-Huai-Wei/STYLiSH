require("dotenv").config();
const mysql = require("mysql");
const { HOST, USERNAME2, PASSWORD, DATABASE } = process.env;

// DB connection
const con = mysql.createConnection({
  host: HOST, // MYSQL HOST NAME
  user: USERNAME2, // MYSQL USERNAME
  password: PASSWORD, // MYSQL PASSWORD
  database: DATABASE, // MYSQL DB NAME
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

// catch use query url
function sorting (category, keyword, id) {
  let sql = "";
  if (category === "women") {
    let id = 1;
    sql += `WHERE p.attributes_id = ${id}`;
  } else if (category === "men") {
    let id = 2;
    sql += `WHERE p.attributes_id = ${id}`;
  } else if (category === "accessories") {
    let id = 3;
    sql += `WHERE p.attributes_id = ${id}`;
  } else if (category === "all") {
  } else if (category === "search") {
    sql += `WHERE p.title LIKE "%${keyword}%"`;
  } else if (category === "details") {
    sql += `WHERE p.id = ${id}`;
  } else {
    const err = new Error("...");
    throw err;
  }
  return sql;
}

// How many products in database
function countP (category, keyword, id) {
  return new Promise((resolve, reject) => {
    let sql = `SELECT COUNT(id) AS count FROM product AS p `;
    sql += sorting(category, keyword, id);
    con.query(sql, (err, results) => {
      if (err) throw err;
      resolve(JSON.parse(JSON.stringify(results[0].count)));
    });
  });
};

function resultP (category, paging, keyword, id) {
  return new Promise((resolve, reject) => {
    let limit = 6;
    let sql = `
      SELECT 
        p.number AS id, p.title, p.description, p.price, p.texture, p.wash, p.place, p.note, p.story, p.main_image, p.images
      FROM product AS p `;
    sql += sorting(category, keyword, id);
    // use LIMIT can define "how many data will be display"
    // use OFFSET can define "how many data will be pass (from start)"
    sql += ` ORDER BY p.id ASC LIMIT ${limit} OFFSET ${paging * limit}`;

    con.query(sql, (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

function resultS (productF) {
  return new Promise((resolve, reject) => {
    sql = `SELECT 
          size.size, product.number
          FROM 
          variants 
          INNER JOIN size ON variants.size_id = size.id
          INNER JOIN product ON variants.product_id = product.id
          WHERE product.number IN (?)
          GROUP BY product.id, size.id
           `;
    con.query(sql, [productF], (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

function resultC (productF) {
  return new Promise((resolve, reject) => {
    sql = `SELECT 
          color.code, color.name, product.number
          FROM 
          variants 
          INNER JOIN color ON variants.color_id = color.id
          INNER JOIN product ON variants.product_id = product.id
          WHERE product.number IN (?)
          GROUP BY product.id, color.id
           `;

    con.query(sql, [productF], (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

function resultV (productF) {
  return new Promise((resolve, reject) => {
    sql = `SELECT 
          color.code, size.size, stock, product.number
          FROM 
          variants 
          INNER JOIN color ON variants.color_id = color.id
          INNER JOIN size ON variants.size_id = size.id
          INNER JOIN product ON variants.product_id = product.id
          WHERE product.number IN (?)
          GROUP BY product.id, color.id, size.id, stock
           `;
    con.query(sql, [productF], (err, results) => {
      if (err) {
        return reject(err);
      }
      return resolve(results);
    });
  });
};

const createProduct = async (req, res) => {
  let checkProduct = req.body.id;
  sql = `SELECT number FROM stylish.product WHERE number = "${checkProduct}"; `;
  con.query(sql, function (err, result) {
    if (result.length === 1) {
      var sql = `SELECT id FROM stylish.color WHERE code = "${req.body.color_code}";`;
      con.query(sql, function (err, result) {
        if (err) reject(err);
        let colorCode = result[0].id;

        var sql = `SELECT id FROM stylish.size WHERE size = "${req.body.sizes}";`;
        con.query(sql, function (err, result) {
          if (err) reject(err);
          let sizeS = result[0].id;

          var sql = `SELECT id FROM stylish.product WHERE number = "${req.body.id}";`;
          con.query(sql, function (err, result) {
            if (err) reject(err);
            let productI = result[0].id;

            var sql = `SELECT id, color_id, size_id, product_id FROM variants WHERE color_id = "${colorCode}" AND size_id = "${sizeS}" AND product_id = "${productI}"`;
            con.query(sql, function (err, result) {
              if (result.length >= 1) {
                sql = `UPDATE variants SET stock = "${req.body.stock}" WHERE variants.id = "${result[0].id}"`;
                con.query(sql, function (err, result) {
                  if (err) throw err;
                  res.send("variants update OK");
                });
              } else if (result.length === 0) {
                sql = `INSERT INTO variants SET color_id = "${colorCode}", size_id = "${sizeS}", product_id = "${productI}", stock = "${req.body.stock}"`;
                con.query(sql, function (err, result) {
                  if (err) throw err;
                  res.send("variants insert OK");
                });
              } else {
                throw err;
              }
            });
          });
        });
      });
    } else if (result.length === 0) {
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
        // result = result + "/" + images[i]["filename"];
        result.push(images[i].key.split("/")[1]);
      }
      //array transfer to string
      data.images = result.toString();
      //insert data function

      function productTable(data) {
        var sql = `SELECT id FROM stylish.attributes WHERE class = "${req.body.class}";`;
        con.query(sql, function (err, result) {
          if (err) reject(err);
          let classId = result[0].id;

          var sql =
            "INSERT INTO product SET number = ?,attributes_id = ?, title = ?, description = ?, price = ?, texture = ?, wash = ?, place = ?, note = ?, story = ?, main_image = ?, images = ?";
          con.query(
            sql,
            [
              data.id,
              classId,
              data.title,
              data.description,
              data.price,
              data.texture,
              data.wash,
              data.place,
              data.note,
              data.story,
              data.main_image,
              data.images,
            ],
            function (err) {
              if (err) throw err;
            }
          );
          return new Promise((resolve, reject) => {
            resolve("product table record inserted");
          });
        });
      }

      function variantsTable(data) {
        //search color table and catch correct id
        var sql = `SELECT id FROM stylish.color WHERE code = "${req.body.color_code}";`;
        con.query(sql, function (err, result) {
          return new Promise((resolve, reject) => {
            if (err) reject(err);
            let colorCode = result[0].id;

            var sql = `SELECT id FROM stylish.size WHERE size = "${req.body.sizes}";`;
            con.query(sql, function (err, result) {
              if (err) reject(err);
              let sizeS = result[0].id;

              var sql = `SELECT id FROM stylish.product WHERE number = "${req.body.id}";`;
              con.query(sql, function (err, result) {
                if (err) reject(err);
                let productI = result[0].id;

                var sql =
                  "INSERT INTO variants SET color_id = ?, size_id = ?, product_id = ?, stock = ?";
                con.query(
                  sql,
                  [colorCode, sizeS, productI, data.stock],
                  function (err) {
                    if (err) reject(err);

                    resolve("overall table record inserted");
                  }
                );
              });
            });
          });
        });
      }

      //run insertData
      async function insertData() {
        await productTable(data);
        await variantsTable(data);
      }

      insertData();

      res.send("OK");
    } else {
      throw err;
    }
  });
};

// redis以前 product
const getProducts = async (req, res, next) => {
  try {
    // const hostName = `https://www.raymond0116.xyz/`
    const hostName = `https://as-raymond0116-image.s3.us-east-2.amazonaws.com/`;

    let productObjS = {};
    // let productCount = await countP(req.params.category);

    let productCount = await countP(
      req.params.category,
      req.query.keyword,
      req.query.id
    );

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
        await resultP(
          req.params.category,
          paging,
          req.query.keyword,
          req.query.id
        )
      )
    );

    let productF = productObj.map((obj) => obj.id); //五筆資料
    let sizeObj = JSON.parse(JSON.stringify(await resultS(productF)));
    let colorObj = JSON.parse(JSON.stringify(await resultC(productF)));
    let variantsObj = JSON.parse(JSON.stringify(await resultV(productF)));
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

    // console.log(variantsObj)
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
  getProducts
};