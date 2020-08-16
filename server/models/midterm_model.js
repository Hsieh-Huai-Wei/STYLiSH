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

const dashboard = async (req, res) => {
  try {
    let sql = `SELECT total, list FROM stylish.ordermidterm`;
    con.query(sql, async function (err, result) {
      if (err) next(err);

      let results = [];
      for (let i = 0; i < result.length; i++) {
        let data = {};
        data.total = result[i].total;
        data.list = JSON.parse(result[i].list)
        results.push(data)
      }

      let ans = {};

      // totalRevenus
      function totalRevenus(results) {
        return new Promise((reslove, reject) => {
          const totalRevenus = results.reduce((arr, { total }) => {
            return arr + total
          }, 0);
          reslove(totalRevenus);
        })
      }

      // productsDivideByColor
      function productsDivideByColor(results) {
        return new Promise((reslove, reject) => {
          let resultss = [];
          for (let i = 0; i < results.length; i++) {
            for (let j = 0; j < results[i].list.length; j++) {
              resultss.push(results[i].list[j])
            }
          }
          const productsDivideByColor = resultss.reduce((arr, { color, qty }) => {
            const colorCode = arr.find((obj) => obj.colorCode === color.code);
            if (colorCode) {
              let newQty = parseInt(qty);
              let oddQty = parseInt(colorCode.count)
              colorCode.count = oddQty + newQty
            } else {
              arr.push({ colorName: color.name, colorCode: color.code, count: qty });
            }
            return arr;
          }, []);
          reslove(productsDivideByColor);
        })
      }

      //productsInPriceRange
      function productsInPriceRange(results) {
        return new Promise((reslove, reject) => {
          let resultss = [];
          for (let i = 0; i < results.length; i++) {
            for (let j = 0; j < results[i].list.length; j++) {
              resultss.push(results[i].list[j])
            }
          }
          let productsInPriceRange = [];
          for (let i = 0; i < resultss.length; i++) {
            productsInPriceRange.push(resultss[i].price)
          }
          reslove(productsInPriceRange);
        })
      }

      //top5ProductsDividedBySize
      function top5ProductsDividedBySize(results) {
        return new Promise((reslove, reject) => {
          let resultss = [];
          for (let i = 0; i < results.length; i++) {
            for (let j = 0; j < results[i].list.length; j++) {
              resultss.push(results[i].list[j])
            }
          }
          const findSize = resultss.reduce((arr, { id, size, qty }) => {
            const sizeCode = arr.find((obj) => obj.size === size && obj.id === id);
            if (sizeCode) {
              let newQty = parseInt(qty);
              let oddQty = parseInt(sizeCode.count)
              sizeCode.count = oddQty + newQty
            } else {
              arr.push({ id: id, count: qty, size: size });
            }
            return arr;
          }, []);

          let countS = []
          let countM = []
          let countL = []
          for (let i = 0; i < findSize.length; i++) {
            if (findSize[i].size === "L") {
              countL.push(findSize[i])
            } else if (findSize[i].size === "S") {
              countS.push(findSize[i])
            } else {
              countM.push(findSize[i])
            }
          }

          const sizeL = countL.sort(function (a, b) {
            if (a.count < b.count) { // a > b  等於 a - b > 0
              return 1; // 正數時，後面的數放在前面
            } else {
              return -1 // 負數時，前面的數放在前面
            }
          });

          const sizeS = countS.sort(function (a, b) {
            if (a.count < b.count) { // a > b  等於 a - b > 0
              return 1; // 正數時，後面的數放在前面
            } else {
              return -1 // 負數時，前面的數放在前面
            }
          });

          const sizeM = countM.sort(function (a, b) {
            if (a.count < b.count) { // a > b  等於 a - b > 0
              return 1; // 正數時，後面的數放在前面
            } else {
              return -1 // 負數時，前面的數放在前面
            }
          });

          let sizeLL = [];
          let sizeSS = [];
          let sizeMM = [];
          for (let i = 0; i < 5; i++) {
            sizeLL.push(sizeL[i])
            sizeSS.push(sizeS[i])
            sizeMM.push(sizeM[i])
          }

          const resultL = {
            "ids": sizeLL.map((obj) => obj.id),
            "count": sizeLL.map((obj) => obj.count),
            "size": "L"
          };

          const resultM = {
            "ids": sizeMM.map((obj) => obj.id),
            "count": sizeMM.map((obj) => obj.count),
            "size": "M"
          };

          const resultS = {
            "ids": sizeSS.map((obj) => obj.id),
            "count": sizeSS.map((obj) => obj.count),
            "size": "S"
          };

          let top5ProductsDividedBySize = [];
          top5ProductsDividedBySize.push(resultS);
          top5ProductsDividedBySize.push(resultM);
          top5ProductsDividedBySize.push(resultL);

          reslove(top5ProductsDividedBySize);
        })
      }

      const totalRevenusResult = await totalRevenus(results);
      const productsDivideByColorResult = await productsDivideByColor(results);
      const productsInPriceRangeResult = await productsInPriceRange(results);
      const top5ProductsDividedBySizeResult = await top5ProductsDividedBySize(results);
      ans.totalRevenus = totalRevenusResult;
      ans.productsDivideByColor = productsDivideByColorResult;
      ans.productsInPriceRange = productsInPriceRangeResult;
      ans.top5ProductsDividedBySize = top5ProductsDividedBySizeResult;
      res.json(ans)
    });
  } catch (e) {
    res.sendStatus(500);
  }
};


module.exports = {
  dashboard
};