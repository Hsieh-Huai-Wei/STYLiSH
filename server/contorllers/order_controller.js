const Order = require("../models/order_model");
const axios = require("axios").default;
const createOrder = async (req, res) => {
  // { prime:
  //   '04a3a018923b3d97f59d76fb3975afa9f508744d7973bd2b5c4a608508e14100',
  //  total_price: 130,
  //  location: 'taiwan',
  //  shipping: 'credit_card',
  //  recipient_name: '1',
  //  recipient_email: '2',
  //  recipient_phone: '3',
  //  recipient_address: '4',
  //  recipient_time: 'anytime',
  //  cart: [ [Object], [Object] ] },
  console.log(req.body)
  return;
  let prime = req.body.prime;
  let orderNumber = Math.round(Math.random() * 1e10) + 1;

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
    .then(async (response) => {
      let userId = req.body.user_id;
      const result = await Order.checkout(userId);
      let paymentInf = {
        order_number: response.data.order_number,
        user_id: result[0].id,
        payment_status: "paid",
        price: req.body.totalPrice,
      };
      await Order.insertOrder(paymentInf);
      await Order.selectOrder(paymentInf);
      data = {};
      data.number = result[0].order_number;
      let results = {};
      results.data = data;
      res.json(results);
    });
  };

module.exports = {
  createOrder
}
