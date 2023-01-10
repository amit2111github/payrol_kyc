const express = require('express');
const {
  getEducationDetails,
  getKycDetails,
  getAddressDetails,
  getAccountDetails,
  getAllLeaves,
  changeLeaveStatus,
  addSalaryOfOneEmployee,
  getSalaryOFEmployee,
} = require('../controllers/admin.js');

const {
  isSignedIn,
  isAuthenticated,
  isAdmin,
} = require('../controllers/user.js');
const router = express.Router();

router.post(
  '/education',
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getEducationDetails
);
router.post('/kyc', isSignedIn, isAuthenticated, isAdmin, getKycDetails);
router.post(
  '/address',
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getAddressDetails
);
router.post(
  '/acccountDetails',
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getAccountDetails
);
router.post('/leave/see', isSignedIn, isAuthenticated, isAdmin, getAllLeaves);

router.post(
  '/leave/changestatus',
  isSignedIn,
  isAuthenticated,
  isAdmin,
  changeLeaveStatus
);
router.post(
  '/salary/add',
  isSignedIn,
  isAuthenticated,
  isAdmin,
  addSalaryOfOneEmployee
);
router.post(
  '/salary/see',
  isSignedIn,
  isAuthenticated,
  isAdmin,
  getSalaryOFEmployee
);
module.exports = router;
