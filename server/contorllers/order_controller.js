const Order = require('../models/order_model');
const axios = require('axios').default;

function verifyData(data) {
  if (data.email.split('@').length !== 2) {
    const result = {
      error: '信箱驗證失敗！'
    };
    return result;
  };
  const result = {
    msg: '信箱成功失敗！'
  };
  return result;
}

const createOrder = async (req, res) => {

  const checkResult = verifyData(res.body.recipient_email);
  if (checkResult.error) return res.status(400).send(checkResult);
  const prime = req.body.prime;
  const orderNumber = Math.round(Math.random() * 1e10) + 1;

  const post_data = {
    prime: prime,
    partner_key:
      'partner_PHgswvYEk4QY6oy3n8X3CwiQCVQmv91ZcFoD5VrkGFXo8N7BFiLUxzeG',
    merchant_id: 'AppWorksSchool_CTBC',
    order_number: orderNumber,
    amount: 1,
    currency: 'TWD',
    details: 'An apple and a pen.',
    cardholder: {
      phone_number: '+886923456789',
      name: 'jack',
      email: 'example@gmail.com',
    },
    remember: false,
  };

  axios
    .post('https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime', post_data, {
      headers: {
        'x-api-key':
          'partner_PHgswvYEk4QY6oy3n8X3CwiQCVQmv91ZcFoD5VrkGFXo8N7BFiLUxzeG',
      },
    })
    .then(async () => {
      await Order.checkout(req.body.recipient_email);
      const paymentInf = {
        order_number: orderNumber,
        user_id: 74,
        prime: 'paid',
        location: req.body.location,
        shipping: req.body.shipping,
        name: req.body.recipient_name,
        email: req.body.recipient_email,
        phone: req.body.recipient_phone,
        address: req.body.recipient_address,
        time: req.body.recipient_time,
        price: req.body.total_price,
        cart: JSON.stringify(req.body.cart)
      };
      await Order.insertOrder(paymentInf);
      await Order.selectOrder(paymentInf);
      const result = new Object();
      result.data = {
        'number': orderNumber
      };
      res.status(200).json(result);
    });
  };

module.exports = {
  createOrder
};
