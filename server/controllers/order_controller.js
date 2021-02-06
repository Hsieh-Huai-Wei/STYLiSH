const Order = require('../models/order_model');
const { SECRET, TAPPAY_PARTNER_KEY } = process.env;
const User = require('../models/user_model');
const Product = require('../models/product_model');
const jwt = require('jsonwebtoken');
const axios = require('axios').default;

async function payByTapPay(req_body, id, order_num, cartList) {
  try {
    const post_data = {
      prime: req_body.prime,
      partner_key: TAPPAY_PARTNER_KEY,
      merchant_id: 'AppWorksSchool_CTBC',
      order_number: order_num,
      amount: 1,
      currency: 'TWD',
      details: JSON.stringify(cartList),
      cardholder: {
        id: id,
        name: req_body.recipient_name,
        phone_number: req_body.recipient_phone,
      },
      remember: false,
    };
    const pay_status = await axios.post('https://sandbox.tappaysdk.com/tpc/payment/pay-by-prime', post_data, {
      headers: {
        'x-api-key':
          'partner_PHgswvYEk4QY6oy3n8X3CwiQCVQmv91ZcFoD5VrkGFXo8N7BFiLUxzeG',
      },
    });
    return pay_status;
  } catch (error) {
    console.error(error);
    return {error: pay_status};
  }
}

const createOrder = async (req, res, next) => {
  try {
    const decode = jwt.verify(req.body.token, SECRET);
    const user_inf = await User.getUserID(decode.userEmail);
    if (user_inf.length === 0) return res.status(404).json({ error: '查無此用戶，請確認是否為會員！' });
    const order_num = Math.round(Math.random() * 1e5) + 1;
    if (req.body.prime) {
      const pay_status = await payByTapPay(req.body, user_inf[0].id, order_num, req.body.cart);
      if (pay_status.error || pay_status.status !== 200) return res.status(404).json({error: '信用卡付款失敗'});
    };
    const cart = req.body.cart
    const cart_list = JSON.stringify(cart);
    const payment_inf = {
      order_number: order_num,
      user_id: user_inf[0].id,
      prime: 'paid',
      location: req.body.location,
      shipping: req.body.shipping,
      name: req.body.recipient_name,
      phone: req.body.recipient_phone,
      address: req.body.recipient_address,
      time: req.body.recipient_time,
      price: req.body.total_price,
      cart: cart_list
    };
    const insert_order = await Order.insertOrder(payment_inf);
    if (insert_order.length === 0) return res.status(400).json({error: '訂單建立失敗，請聯繫客服人員！'})
    cart.forEach(async (cart) => {
      try {
        const update_product = new Array();
        update_product.push(cart.count);
        update_product.push(cart.color_code);
        update_product.push(cart.size);
        update_product.push(cart.product_id);
        await Product.updateVariants(update_product, cart.length);
      } catch (error) {
        next(error);
      }
    });
    const result = new Object();
    result.data = {
      phone_number: order_num
    };
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder
};
