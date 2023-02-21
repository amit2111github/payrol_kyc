const db = require("../models/index.js");
const { sequelize } = db;
const { models } = sequelize;
// console.log(models);
const { Education } = models;
exports.getEducationDetails = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await Education.findAll({ raw: true, where: { user_id: id } });
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.json({ error: "Failed to get Education Details" });
  }
};
