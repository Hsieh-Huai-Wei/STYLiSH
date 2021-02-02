const { query } = require('../../util/dbcon');

const checkProduct = async (data) => {
  return await query('SELECT number FROM stylish.product WHERE number = ?', [data]);
};

const selectColor = async (data) => {
  return await query('SELECT id FROM stylish.color WHERE code = ? ', [data]);
};
const selectSize = async (data) => {
  return await query('SELECT id FROM stylish.size WHERE size = ?', [data]);
};

const selectProduct = async (data) => {
  return await query('SELECT id FROM stylish.product WHERE number = ?', [data]);
};

const selectVariant = async (data) => {
  return await query('SELECT id, color_id, size_id, product_id FROM variants WHERE color_id = ? AND size_id = ? AND product_id = ?', [data.color, data.size, data.id]);
};

const updateVariant = async (data) => {
  return await query('UPDATE variants SET stock = ? WHERE variants.id = ?', [data.stock, data.id]);
};

const insertVariant = async (data) => {
  return await query('INSERT INTO variants SET color_id = ?, size_id = ?, product_id = ?, stock = ?', [data.color, data.size, data.id, data.stock]);
};

const selectClass = async (classification) => {
  return await query('SELECT id FROM stylish.attributes WHERE class = ?', [classification]);
};

const insertProduct = async (data, class_id) => {
  return await query('INSERT INTO product SET number = ?,attributes_id = ?, title = ?, description = ?, price = ?, texture = ?, wash = ?, place = ?, note = ?, story = ?, main_image = ?, images = ?', [ data.id, class_id, data.title, data.description, data.price, data.texture, data.wash, data.place, data.note, data.story, data.main_image, data.images, ]);
};

// catch use query url
function bindSorting(category, keyword, id) {
  console.log(category, keyword, id)
  let sql = '';
  if (category === 'women') {
    const id = 1;
    sql += `WHERE p.attributes_id = ${id}`;
  } else if (category === 'men') {
    const id = 2;
    sql += `WHERE p.attributes_id = ${id}`;
  } else if (category === 'accessories') {
    const id = 3;
    sql += `WHERE p.attributes_id = ${id}`;
  } else if (category === 'all') {
    return sql;
  } else if (category === 'search') {
    sql += `WHERE p.title LIKE '%${keyword}%'`;
  } else if (category === 'details') {
    sql += `WHERE p.number = ${id} `;
  } else {
    const err = new Error('...');
    throw err;
  }
  return sql;
}

// How many products in database
const countProducts = async (category, keyword, id) => {
  let sql = 'SELECT COUNT(id) AS count FROM product AS p ';
  sql += bindSorting(category, keyword, id);
  const result = await query(sql);
  return result[0].count;
};

const getProducts = async (category, paging, keyword, id) => {
  const limit = 6;
  const offset = paging * limit;
  let sql = `
    SELECT 
      p.number AS id, p.title, p.description, p.price, p.texture, p.wash, p.place, p.note, p.story, p.main_image, p.images
    FROM product AS p `;
  sql += bindSorting(category, keyword, id);
  sql += ' ORDER BY p.id ASC LIMIT ? OFFSET ?';
  return await query(sql, [limit, offset]);
};

const getSize = async (product) => {
  return await query('SELECT size.size, product.number FROM variants INNER JOIN size ON variants.size_id = size.id INNER JOIN product ON variants.product_id = product.id WHERE product.number IN (?) GROUP BY product.id, size.id;', [product]);
};

const getColor = async (product) => {
  return await query('SELECT color.code, color.name, product.number FROM variants INNER JOIN color ON variants.color_id = color.id INNER JOIN product ON variants.product_id = product.id WHERE product.number IN (?) GROUP BY product.id, color.id;', [product]);
  
};

const getVariants = async (product) => {
  return await query('SELECT color.code, size.size, stock, product.number FROM variants INNER JOIN color ON variants.color_id = color.id INNER JOIN size ON variants.size_id = size.id INNER JOIN product ON variants.product_id = product.id WHERE product.number IN (?) GROUP BY product.id, color.id, size.id, stock;', [product]);
};

const getStock = async (cart, length) => {
  let sql = 'SELECT number, size, code, stock FROM stylish.variants INNER JOIN stylish.product ON product.id = variants.product_id INNER JOIN stylish.size on size.id = variants.size_id INNER JOIN stylish.color ON color.id = variants.color_id WHERE (product.number = ? AND size.size = ? AND color.code = ?)';
  for (let i=0 ; i<length-1; i++) {
    sql += 'OR (product.number = ? AND size.size = ? AND color.code = ? )'
  };
  sql += ';'
  return await query(sql, cart)
};




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
  countProducts,
  getProducts,
  getSize,
  getColor,
  getVariants,
  getStock
};