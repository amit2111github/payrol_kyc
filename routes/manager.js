const express = require('express');
const router = express.Router();
const { getAllLeaves, changeLeaveStatus } = require('../controllers/manager');
const {
  isSignedIn,
  isAuthenticated,
  isManager,
} = require('../controllers/user');

router.post('/leave/see', isSignedIn, isAuthenticated, isManager, getAllLeaves);
router.post(
  '/leave/changestatus',
  isSignedIn,
  isAuthenticated,
  isManager,
  changeLeaveStatus
);
module.exports = router;
