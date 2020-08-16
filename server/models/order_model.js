require("dotenv").config();
const mysql = require("mysql");
const { HOST, USERNAME2, PASSWORD, DATABASE } = process.env;
const axios = require("axios").default;

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

const checkout = async (req, res) => {
  let prime = req.body.prime;
  let orderNumber = Math.round(Math.random() * 1e10) + 1;
  // console.log(req.body)
  const post_data = {
    prime: prime,
    partner_key:
      "partner_PHgswvYEk4QY6oy3n8X3CwiQCVQmv91ZcFoD5VrkGFXo8N7BFiLUxzeG",
    merchant_id: "AppWorksSchool_CTBC",
    order_number: orderNumber,
    amount: 1,
    currency: "TWD",
    details: "An apple and a pen.",
    cardholder: {
      phone_number: "+886923456789",
      name: "jack",
      email: "example@gmail.com",
    },
    remember: false,
  };

  axios
    .post("https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime", post_data, {
      headers: {
        "x-api-key":
          "partner_PHgswvYEk4QY6oy3n8X3CwiQCVQmv91ZcFoD5VrkGFXo8N7BFiLUxzeG",
      },
    })
    .then((response) => {
      // sql = "INSERT INTO order SET order_number = ?, payment_status = ?";
      sql = `SELECT id FROM stylish.user WHERE number = "${req.body.user_id}";`;
      con.query(sql, (err, result) => {
        if (err) throw err;
        let paymentInf = {
          order_number: response.data.order_number,
          user_id: result[0].id,
          payment_status: "paid",
          price: req.body.totalPrice
        };
        sql = `INSERT INTO orders SET ?`;
        con.query(sql, paymentInf, function (err, result) {
          if (err) throw err;
          sql = `SELECT order_number FROM orders AS number WHERE order_number=${paymentInf.order_number}`;
          con.query(sql, function (err, result) {
            if (err) throw err;
            data = {};
            data.number = result[0].order_number;
            let results = {};
            results.data = data;
            res.json(results);
          });
        });
      })

    });
};

module.exports = {
  checkout
};