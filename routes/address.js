const express = require('express');
const { getAddressDetails } = require('../controllers/address.js');
const { isSignedIn, isAuthenticated } = require('../controllers/user.js');
const router = express.Router();

router.post('/', isSignedIn, isAuthenticated, getAddressDetails);

module.exports = router;
