const { Sequelize } = require('../models/index.js');
const db = require('../models/index.js');
const { sequelize } = db;
const { models } = sequelize;
const { Op } = Sequelize;
const {
  Education,
  User,
  Address,
  Kyc,
  LeaveType,
  Salary,
  RequestedLeave,
  AccountDetails,
} = models;
exports.getEducationDetails = async (req, res) => {
  try {
    const { user_code, company_id } = req.body;
    const user = await User.findOne({ raw: true, where: { user_code } });
    if (user.company_id != company_id)
      return res.json({ error: 'Access Denied' });
    const data = await Education.findAll({
      raw: true,
      where: { user_id: user.id },
    });
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.json({ error: 'Failed to get Education Details' });
  }
};
exports.getAddressDetails = async (req, res) => {
  try {
    const { user_code, company_id } = req.body;

    const user = await User.findOne({ raw: true, where: { user_code } });
    if (user.company_id != company_id)
      return res.json({ error: 'Access Denied' });
    const data = await Address.findAll({
      raw: true,
      where: { user_id: user.id },
    });
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.json({ error: 'Failed to get Address Details' });
  }
};
exports.getKycDetails = async (req, res) => {
  try {
    const { user_code, company_id } = req.body;
    const user = await User.findOne({ raw: true, where: { user_code } });
    if (user.company_id != company_id)
      return res.json({ error: 'Access Denied' });
    const data = await Kyc.findAll({
      raw: true,
      where: { user_id: user.id },
    });
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.json({ error: 'Failed to get kyc Details' });
  }
};
exports.getAccountDetails = async (req, res) => {
  try {
    const { user_code, company_id } = req.body;
    const user = await User.findOne({ raw: true, where: { user_code } });
    if (user.company_id != company_id)
      return res.json({ error: 'Access Denied' });
    const data = await AccountDetails.findAll({
      raw: true,
      where: { user_id: user.id },
    });
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.json({ error: 'Failed to get Account Details' });
  }
};

exports.getAllLeaves = async (req, res) => {
  try {
    const { id, company_id } = req.body;
    const allUser = await User.findAll({
      raw: true,
      where: { company_id },
      attributes: ['id'],
    });
    let output = [];
    allUser.forEach((user) => {
      if (user.id != id) output.push(user.id);
    });
    const leaves = await RequestedLeave.findAll({
      where: { user_id: { [Op.in]: output } },
      include: [
        { model: User, as: 'user' },
        { model: LeaveType, as: 'leave_type' },
      ],
    });
    return res.json(leaves);
  } catch (err) {
    console.log(err);
    return res.json({ error: 'Oops failed to get requested leaves' });
  }
};

exports.changeLeaveStatus = async (req, res) => {
  try {
    const { requestedLeaveId, status, rejection_reason } = req.body;
    const data = await RequestedLeave.update(
      { status, rejection_reason: rejection_reason ? rejection_reason : null },
      { where: { id: requestedLeaveId, status: { [Op.ne]: 'approved' } } }
    );
    return res.json({ msg: 'Status Changed Successfully' });
  } catch (err) {
    console.log(err);
    return res.json({ error: 'Oops something went wrong' });
  }
};

exports.addSalaryOfOneEmployee = async (req, res) => {
  try {
    let { user_code, company_id, salary } = req.body;
    const user = await User.findOne({
      raw: true,
      where: { user_code, company_id },
    });
    if (!user) return res.json({ error: 'Invalid user code.' });
    const types = salary.map((currentSalary) => currentSalary.type);
    let userSalary = await Salary.findAll({
      where: { user_id: user.id, type: { [Op.in]: types } },
      raw: true,
    });
    if (userSalary && userSalary.length > 0) {
      userSalary = userSalary.map((current) => current.id);
      await Salary.destroy({ where: { id: { [Op.in]: userSalary } } });
      console.log('Deleted them');
    }
    salary = salary.map((currentSalary) => ({
      ...currentSalary,
      user_id: user.id,
    }));
    const data = await Salary.bulkCreate(salary);
    return res.json({ msg: 'Salary Added Successfully.' });
  } catch (err) {
    console.log(err);
    return res.json({ error: 'Failed to add salary of employee' });
  }
};

exports.getSalaryOFEmployee = async (req, res) => {
  try {
    const { user_code, company_id } = req.body;
    const user = await User.findOne({
      raw: true,
      where: { user_code, company_id },
    });
    const data = await Salary.findAll({ where: { user_id: user.id } });
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.json({ error: 'Failed to get Salary' });
  }
};
