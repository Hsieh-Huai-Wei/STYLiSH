const { query } = require('../../util/dbcon');

const countCampaigns = async () => {
  const result = await query('SELECT COUNT(id) AS count FROM campaigns');
  return result[0].count;
};

const getCampaigns = async (limit, paging) => {
  const offset = limit*paging;
  return await query('SELECT product_id, picture, story FROM stylish.campaigns ORDER BY campaigns.id ASC LIMIT ? OFFSET ?', [limit, offset]);
};

const searchCampaign = async (data) => {
  return await query('SELECT id FROM stylish.product WHERE number = ? ;', [data.productID]);
};

const createCampaign = async (data) => {
  return await query('INSERT INTO campaigns SET  ?', [data]);
};

module.exports = {
  countCampaigns,
  searchCampaign,
  createCampaign,
  getCampaigns
};