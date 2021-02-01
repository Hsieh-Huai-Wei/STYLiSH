const { query } = require('../../util/dbcon');

const countCampaigns = async () => {
  const result = await query('SELECT COUNT(id) AS count FROM campaigns');
  return result[0].count;
};

const getCampaigns = async () => {
  return await query('SELECT product_id, picture, story FROM stylish.campaigns;')
};

const searchCampaign = async (id) => {
  return await query('SELECT id FROM stylish.product WHERE number = ? ;', [id]);
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