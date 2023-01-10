const express = require('express');
const { getEducationDetails } = require('../controllers/education.js');
const { isSignedIn, isAuthenticated } = require('../controllers/user.js');
const router = express.Router();

router.post('/', isSignedIn, isAuthenticated, getEducationDetails);

module.exports = router;
