const express = require('express');
const { kyc, getKycDetails } = require('../controllers/kyc.js');
const { isSignedIn, isAuthenticated } = require('../controllers/user.js');
const router = express.Router();

router.post('/create', isSignedIn, isAuthenticated, kyc);
router.post('/', isSignedIn, isAuthenticated, getKycDetails);

module.exports = router;
