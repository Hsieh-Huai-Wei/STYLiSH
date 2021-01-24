const { query } = require('../../util/dbcon');

const checkProduct = async (data) => {
  const result = await query('SELECT number FROM stylish.product WHERE number = ?', [data]);
  return result;
}

const selectColor = async (data) => {
  const result = await query('SELECT id FROM stylish.color WHERE code = ? ', [data]);
  return result;
}
const selectSize = async (data) => {
  const result = await query('SELECT id FROM stylish.size WHERE size = ?', [data]);
  return result;
}
const selectProduct = async (data) => {
  const result = await query('SELECT id FROM stylish.product WHERE number = ?', [data]);
  return result;
}

const selectVariant = async (colorCode, size, productId) => {
  const result = await query('SELECT id, color_id, size_id, product_id FROM variants WHERE color_id = ? AND size_id = ? AND product_id = ?', [colorCode, size, productId]);
  return result;
}

const updateVariant = async (userStock, id) => {
  const result = await query('UPDATE variants SET stock = ? WHERE variants.id = ?', [userStock, id]);
  return result;
}

const insertVariant = async (colorCode, size, productId, userStock) => {
  const result = await query('INSERT INTO variants SET color_id = ?, size_id = ?, product_id = ?, stock = ?', [colorCode, size, productId, userStock]);
  return result;
}

const selectClass = async (userClass) => {
  const result = await query('SELECT id FROM stylish.attributes WHERE class = ?', [userClass]);
  return result;
}

const insertProduct = async (data, classId) => {
  const result = await query('INSERT INTO product SET number = ?,attributes_id = ?, title = ?, description = ?, price = ?, texture = ?, wash = ?, place = ?, note = ?, story = ?, main_image = ?, images = ?', [ data.id, classId, data.title, data.description, data.price, data.texture, data.wash, data.place, data.note, data.story, data.main_image, data.images, ]);
  return result;
}

// catch use query url
function sorting(category, keyword, id) {
  let sql = '';
  if (category === 'women') {
    let id = 1;
    sql += `WHERE p.attributes_id = ${id}`;
  } else if (category === 'men') {
    let id = 2;
    sql += `WHERE p.attributes_id = ${id}`;
  } else if (category === 'accessories') {
    let id = 3;
    sql += `WHERE p.attributes_id = ${id}`;
  } else if (category === 'all') {
  } else if (category === 'search') {
    sql += `WHERE p.title LIKE '%${keyword}%'`;
  } else if (category === 'details') {
    sql += `WHERE p.id = ${id} `;
  } else {
    const err = new Error('...');
    throw err;
  }
  return sql;
}

// How many products in database
const countP = async (category, keyword, id) => {
  let sql = `SELECT COUNT(id) AS count FROM product AS p `;
  sql += sorting(category, keyword, id);
  const result = await query(sql)
  return JSON.parse(JSON.stringify(result[0].count));
}

const resultP = async (category, paging, keyword, id) => {
  const limit = 6;
  const offset = paging * limit;
  let sql = `
    SELECT 
      p.number AS id, p.title, p.description, p.price, p.texture, p.wash, p.place, p.note, p.story, p.main_image, p.images
    FROM product AS p `;
  sql += sorting(category, keyword, id);
  sql += ' ORDER BY p.id ASC LIMIT ? OFFSET ?';
  const result = await query(sql, [limit, offset]);
  return result;
}

const resultS = async (productF) => {
  const result = await query('SELECT size.size, product.number FROM variants INNER JOIN size ON variants.size_id = size.id INNER JOIN product ON variants.product_id = product.id WHERE product.number IN (?) GROUP BY product.id, size.id;', [productF]);
  return result;
}

const resultC = async (productF) => {
  const result = await query('SELECT color.code, color.name, product.number FROM variants INNER JOIN color ON variants.color_id = color.id INNER JOIN product ON variants.product_id = product.id WHERE product.number IN (?) GROUP BY product.id, color.id;', [productF]);
  return result;
}



const resultV = async (productF) => {
  const result = await query('SELECT color.code, size.size, stock, product.number FROM variants INNER JOIN color ON variants.color_id = color.id INNER JOIN size ON variants.size_id = size.id INNER JOIN product ON variants.product_id = product.id WHERE product.number IN (?) GROUP BY product.id, color.id, size.id, stock;', [productF]);
  return result;
}

module.exports = {
  checkProduct,
  selectColor,
  selectSize,
  selectProduct,
  selectVariant,
  updateVariant,
  insertVariant,
  selectClass,
  insertProduct,
  countP,
  resultP,
  resultS,
  resultC,
  resultV,
};