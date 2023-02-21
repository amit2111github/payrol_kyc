const { Sequelize } = require("../models/index.js");
const db = require("../models/index.js");
const { sequelize } = db;
const { Op } = Sequelize;
const { models } = sequelize;
const { User, LeaveType, RequestedLeave } = models;
exports.getAllLeaves = async (req, res) => {
  try {
    const { id } = req.body;
    let did = await User.findOne({ raw: true, where: { id } });
    did = did.department_id;
    const allUser = await User.findAll({
      raw: true,
      where: { department_id: did },
      attributes: ["id"],
    });
    let output = [];
    allUser.forEach((user) => {
      if (user.id != id) output.push(user.id);
    });
    console.log(output);
    const leaves = await RequestedLeave.findAll({
      where: { user_id: { [Op.in]: output } },
      include: [
        { model: User, as: "user" },
        { model: LeaveType, as: "leave_type" },
      ],
    });
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
