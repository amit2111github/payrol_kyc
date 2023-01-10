const express = require('express');
const {
  isSignedIn,
  isAuthenticated,
  getAllLeave,
  takeLeave,
  getRequestedLeave,
  getSalary,
} = require('../controllers/user');
const router = express.Router();

router.post('/leave', isSignedIn, isAuthenticated, getAllLeave);
router.post('/leave/take', isSignedIn, isAuthenticated, takeLeave);
router.post('/leave/requested', isSignedIn, isAuthenticated, getRequestedLeave);
router.post('/salary/see', isSignedIn, isAuthenticated, getSalary);

module.exports = router;
