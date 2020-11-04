const express = require('express');
const notificationController = require('./../controllers/notificationController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.use(authController.protect);

router.route('/').get(notificationController.getUserNotification);

module.exports = router;
