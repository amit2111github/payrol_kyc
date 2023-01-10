const jwt = require('jsonwebtoken');
const { secret } = require('../config/vars.js');
const db = require('../models/index.js');
const { sequelize } = db;
const { models } = sequelize;
const { UserLeave, LeaveType, Salary, RequestedLeave } = models;

exports.isSignedIn = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const user = jwt.verify(token, secret);
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'You are not signed in.' });
  }
};
exports.isAuthenticated = (req, res, next) => {
  try {
    const user =
      req.user &&
      req.user.id == req.body.id &&
      req.body.company_id == req.user.company_id;
    if (!user) {
      return res.status(400).json({ error: 'Access Denied.' });
    }
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'Authorization required.' });
  }
};
exports.isAdmin = (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'ADMIN') {
      return res.status(400).json({ error: 'Admin permission required.' });
    }
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'Authorization required.' });
  }
};

exports.getAllLeave = async (req, res) => {
  try {
    const { id } = req.body;
    let data = await UserLeave.findAll({
      where: { user_id: id },
      include: [
        {
          model: LeaveType,
          as: 'leave_type',
        },
      ],
    });
    data = data.map((leave) => leave.dataValues);
    const prevYearLeave = data.filter(
      (leave) => +leave.to.substring(0, 4) == new Date().getFullYear() - 1
    );
    let output = data.filter(
      (leave) => leave.to.substring(0, 4) == new Date().getFullYear()
    );
    if (output.length == 0 && prevYearLeave.length > 0) {
      const leaveToreCreate = prevYearLeave.map((leave) => {
        const obj = {
          user_id: id,
          leave_id: leave.leave_id,
          used: 0,
          assigned: leave.assigned + leave.assigned - leave.used,
          from: new Date(),
          to: new Date().getFullYear() + '-' + 12 + '-' + 31,
        };
        return obj;
      });
      await UserLeave.bulkCreate(leaveToreCreate);
      data = await UserLeave.findAll({
        where: { user_id: id },
        include: [
          {
            model: LeaveType,
            as: 'leave_type',
          },
        ],
      });
      data = data.map((leave) => leave.dataValues);
      output = data.filter(
        (leave) => leave.to.substring(0, 4) == new Date().getFullYear()
      );
    }
    return res.json(output);
  } catch (err) {
    console.log(err);
    return res.json({ error: 'Failed to get Leaves' });
  }
};

exports.takeLeave = async (req, res) => {
  try {
    const { id, leave_id, from, to, description, attachment } = req.body;
    let numberOfDays = new Date(to).getTime() - new Date(from).getTime();
    numberOfDays = numberOfDays / 1000 / 60 / 60 / 24;
    numberOfDays++;
    let userAvailabeLeave = await UserLeave.findAll({
      where: { user_id: id, leave_id },
      raw: true,
    });
    if (!userAvailabeLeave || userAvailabeLeave.length == 0) {
      return res.status(400).json({ error: 'This Leave has been expired.' });
    }
    const prevYearLeave = userAvailabeLeave.filter(
      (leave) => +leave.to.substring(0, 4) == new Date().getFullYear() - 1
    );
    userAvailabeLeave = userAvailabeLeave.filter(
      (leave) => +leave.to.substring(0, 4) == new Date().getFullYear()
    );

    if (userAvailabeLeave.length == 0) {
      const data = await UserLeave.create({
        user_id: id,
        leave_id,
        used: 0,
        assigned:
          prevYearLeave[0].assigned +
          prevYearLeave[0].assigned -
          prevYearLeave[0].used,
        from: new Date(),
        to: new Date().getFullYear() + '-' + 12 + '-' + 31,
      });
      userAvailabeLeave = data.dataValues;
    } else userAvailabeLeave = userAvailabeLeave[0];
    if (userAvailabeLeave.used + numberOfDays > userAvailabeLeave.assigned) {
      return res.json({
        error:
          'You can only take upto ' +
          (userAvailabeLeave.assigned - userAvailabeLeave.used) +
          ' leaves',
      });
    }
    const data = await sequelize.transaction(async (t) => {
      const updatedUserLeave = await UserLeave.update(
        { used: userAvailabeLeave.used + numberOfDays },
        { where: { id: userAvailabeLeave.id } },
        { transaction: t }
      );
      const requestLeave = await RequestedLeave.create(
        {
          leave_id,
          user_id: id,
          from,
          to,
          description: description ? description : null,
          attachment: attachment ? attachment : null,
        },
        { transaction: t }
      );
      return { updatedUserLeave, requestLeave };
    });
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.json('Oops something went wrong');
  }
};

exports.getRequestedLeave = async (req, res) => {
  try {
    const { id } = req.body;
    const output = await RequestedLeave.findAll({
      where: { user_id: id },
      include: [
        {
          model: LeaveType,
          as: 'leave_type',
        },
      ],
    });
    return res.json(output);
  } catch (err) {
    console.log(err);
    return res.json({ error: 'Failed to fetch Requested Leaves' });
  }
};

exports.isManager = (req, res, next) => {
  try {
    const user = req.user;
    if (user.role !== 'MANAGER') {
      return res.status(400).json({ error: 'Manager permission required.' });
    }
    next();
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: 'Authorization required.' });
  }
};

exports.getSalary = async (req, res) => {
  try {
    const { id } = req.body;
    const data = await Salary.findAll({ where: { user_id: id } });
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.json({ error: 'Failed to get Salary' });
  }
};
