const { query } = require("../../util/dbcon");

const checkout = async (data) => {
  const result = await query('SELECT id FROM stylish.user WHERE number = ?', [data])
  return result;
};

const insertOrder = async (data) => {
  const result = await query("INSERT INTO orders SET ?", [data]);
  return result;
};

const selectOrder = async (data) => {
  const result = await query("SELECT order_number FROM orders AS number WHERE order_number = ?", [data.order_number]);
  return result;
};

module.exports = {
  checkout,
  insertOrder,
  selectOrder,
};