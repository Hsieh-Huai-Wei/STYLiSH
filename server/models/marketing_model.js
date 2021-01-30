const { query } = require('../../util/dbcon');

const countCampaigns = async () => {
  const result = await query('SELECT COUNT(id) AS count FROM campaigns');
  return result[0].count;
};

const getCampaigns = async (limit, paging) => {
  const offset = limit*paging;
  const result = await query('SELECT product_id, picture, story FROM stylish.campaigns ORDER BY campaigns.id ASC LIMIT ? OFFSET ?', [limit, offset]);
  return result;
};

const option = async (data) => {
  const result = await query('SELECT * FROM stock.history_price WHERE(date between ? and ?) AND (close between ? and ?) ORDER BY stock_id, date DESC;', [data.start, data.end, data.lower, data.upper]);
  return result;
};

const searchCampaign = async (data) => {
  const result = await query('SELECT id FROM stylish.product WHERE number = ? ;', [data.productID]);
  return result;
};

const createCampaign = async (data) => {
  const result = await query(
    'INSERT INTO campaigns SET product_id = ?, picture = ?, story = ?',
    [data.id, data.pictures, data.story]
  );
  return result;
};

module.exports = {
  countCampaigns,
  option,
  searchCampaign,
  createCampaign,
  getCampaigns
};