const express = require('express');
const notificationController = require('./../controllers/notificationController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.use(authController.protect);

router.route('/').get(notificationController.getUserNotification);

router.route('/unread').get(notificationController.getUnreadNotifications);
router.route('/read').get(notificationController.getReadNotifications);
router
  .route('/:notificationID/markAsRead')
  .patch(notificationController.markAsRead);

module.exports = router;
