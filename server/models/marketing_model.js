const { query } = require('../../util/dbcon');

const getCampaigns = async () => {
  return await query('SELECT campaigns.picture, campaigns.story, product.number FROM stylish.campaigns INNER JOIN stylish.product ON campaigns.product_id = product.id;')
};

const searchCampaign = async (id) => {
  return await query('SELECT id FROM stylish.product WHERE number = ? ;', [id]);
};

const createCampaign = async (data) => {
  return await query('INSERT INTO campaigns SET  ?', data);
};

module.exports = {
  searchCampaign,
  createCampaign,
  getCampaigns
};