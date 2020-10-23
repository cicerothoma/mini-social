const express = require('express');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/signup').post(authController.signUp);

module.exports = router;
