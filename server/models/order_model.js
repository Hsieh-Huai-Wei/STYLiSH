const { query } = require("../../util/dbcon");

const checkout = async (data) => {
  const result = await query('SELECT id FROM stylish.user WHERE email = ?', [data])
  return result;
};

const insertOrder = async (data) => {
  const result = await query("INSERT INTO new_orders SET ?", [data]);
  return result;
};

const selectOrder = async (data) => {
  const result = await query("SELECT order_number FROM new_orders AS number WHERE order_number = ?", [data.order_number]);
  return result;
};

module.exports = {
  checkout,
  insertOrder,
  selectOrder,
};