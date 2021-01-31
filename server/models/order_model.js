const { query } = require('../../util/dbcon');

const checkout = async (data) => {
  return await query('SELECT id FROM stylish.user WHERE email = ?', [data]);
};

const insertOrder = async (data) => {
  return await query('INSERT INTO new_orders SET ?', data);
};

const selectOrder = async (data) => {
  return await query('SELECT order_number FROM new_orders AS number WHERE order_number = ?', [data.order_number]);
};

module.exports = {
  checkout,
  insertOrder,
  selectOrder,
};