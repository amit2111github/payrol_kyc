const { Sequelize } = require("../models/index.js");
const db = require("../models/index.js");
const { sequelize } = db;
const { models } = sequelize;
const { Op } = Sequelize;
const axios = require("axios");
const imageUrl = "http://localhost:5000/";
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
      return res.json({ error: "Access Denied" });
    const data = await Education.findAll({
      where: { user_id: user.id },
    });
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.json({ error: "Failed to get Education Details" });
  }
};
exports.getAddressDetails = async (req, res) => {
  try {
    const { user_code, company_id } = req.body;

    const user = await User.findOne({ raw: true, where: { user_code } });
    if (user.company_id != company_id)
      return res.json({ error: "Access Denied" });
    const data = await Address.findAll({
      raw: true,
      where: { user_id: user.id },
    });
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.json({ error: "Failed to get Address Details" });
  }
};
exports.getKycDetails = async (req, res) => {
  try {
    const { user_code, company_id } = req.body;
    const user = await User.findOne({ raw: true, where: { user_code } });
    if (user.company_id != company_id)
      return res.json({ error: "Access Denied" });
    const data = await Kyc.findOne({
      where: { user_id: user.id },
    });
    let urls = [
      data.dataValues.pan_proof,
      data.dataValues.aadhar_proof,
      data.dataValues.live_photo,
    ];
    const url = await Promise.all(
      urls.map((cur) => {
        var config = {
          method: "post",
          url: imageUrl + "signed-url/",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify({ Key: cur }),
        };

        return axios(config)
          .then((data) => data.data.url)
          .catch(function (error) {
            throw error;
          });
      })
    );

    data.dataValues.pan_proof = url[0];
    data.dataValues.aadhar_proof = url[1];
    data.dataValues.live_photo = url[2];
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.json({ error: "Failed to get kyc Details" });
  }
};
exports.getAccountDetails = async (req, res) => {
  try {
    const { user_code, company_id } = req.body;
    const user = await User.findOne({ raw: true, where: { user_code } });
    if (user.company_id != company_id)
      return res.json({ error: "Access Denied" });
    const data = await AccountDetails.findOne({
      where: { user_id: user.id },
    });
    var config = {
      method: "post",
      url: imageUrl + "signed-url/",
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify({ Key: data?.dataValues?.passbook_photo }),
    };

    let url = await axios(config);
    url = await url.data.url;
    data.dataValues.passbook_photo = url;
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.json({ error: "Failed to get Account Details" });
  }
};

exports.getAllLeaves = async (req, res) => {
  try {
    const { id, company_id } = req.body;
    const allUser = await User.findAll({
      raw: true,
      where: { company_id },
      attributes: ["id"],
    });
    let output = [];
    allUser.forEach((user) => {
      if (user.id != id) output.push(user.id);
    });
    const leaves = await RequestedLeave.findAll({
      where: { user_id: { [Op.in]: output } },
      include: [
        { model: User, as: "user" },
        { model: LeaveType, as: "leave_type" },
      ],
    });
    console.log(leaves);
    const urls = await Promise.all(
      leaves.map((cur) => {
        var config = {
          method: "post",
          url: imageUrl + "signed-url/",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify({ Key: cur.dataValues.attachment }),
        };
        return axios(config)
          .then((data) => data.data.url)
          .catch(function (error) {
            throw error;
          });
      })
    );
    for (let i = 0; i < leaves.length; i++) {
      leaves[i].dataValues.attachment = urls[i];
    }
    return res.json(leaves);
  } catch (err) {
    console.log(err);
    return res.json({ error: "Oops failed to get requested leaves" });
  }
};

exports.changeLeaveStatus = async (req, res) => {
  try {
    const { requestedLeaveId, status, rejection_reason } = req.body;
    const data = await RequestedLeave.update(
      { status, rejection_reason: rejection_reason ? rejection_reason : null },
      { where: { id: requestedLeaveId, status: { [Op.ne]: "approved" } } }
    );
    return res.json({ msg: "Status Changed Successfully" });
  } catch (err) {
    console.log(err);
    return res.json({ error: "Oops something went wrong" });
  }
};

exports.addSalaryOfOneEmployee = async (req, res) => {
  try {
    let { user_code, company_id, salary } = req.body;
    const user = await User.findOne({
      raw: true,
      where: { user_code, company_id },
    });
    if (!user) return res.json({ error: "Invalid user code." });
    const types = salary.map((currentSalary) => currentSalary.type);
    let userSalary = await Salary.findAll({
      where: { user_id: user.id, type: { [Op.in]: types } },
      raw: true,
    });
    if (userSalary && userSalary.length > 0) {
      userSalary = userSalary.map((current) => current.id);
      await Salary.destroy({ where: { id: { [Op.in]: userSalary } } });
      console.log("Deleted them");
    }
    salary = salary.map((currentSalary) => ({
      ...currentSalary,
      user_id: user.id,
    }));
    const data = await Salary.bulkCreate(salary);
    return res.json({ msg: "Salary Added Successfully." });
  } catch (err) {
    console.log(err);
    return res.json({ error: "Failed to add salary of employee" });
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
    return res.json({ error: "Failed to get Salary" });
  }
};

exports.getAllKycDetails = async (req, res) => {
  try {
    const { company_id } = req.body;
    const users = await User.findAll({ raw: true, where: { company_id } });
    let list = [];
    users.forEach((cur) => list.push(cur.id));
    const data = await Kyc.findAll({
      where: { user_id: { [Op.in]: list } },
      include: [{ model: User, as: "user_id_as" }],
    });
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.json({ error: "Failed to Fetch all kyc details of employees." });
  }
};

exports.updateKyc = async (req, res) => {
  try {
    const { id, company_id, kycId, ...other } = req.body;
    const data = await Kyc.update({ ...other }, { where: { id: kycId } });
    return res.json({ msg: "Update Successfully" });
  } catch (err) {
    console.log(err);
    return res.json({ error: "Failed to Update Kyc" });
  }
};
