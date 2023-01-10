const db = require('../models/index.js');
const { sequelize } = db;
const { models } = sequelize;
const { Address } = models;
exports.getAddressDetails = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await Address.findAll({ where: { user_id: id } });
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.json({ error: 'Failed to get Account Details' });
  }
};
