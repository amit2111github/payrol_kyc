const express = require('express');
const { getAccountDetails } = require('../controllers/accountDetails.js');
const { isSignedIn, isAuthenticated } = require('../controllers/user.js');
const router = express.Router();

router.post('/', isSignedIn, isAuthenticated, getAccountDetails);

module.exports = router;
