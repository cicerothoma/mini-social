const Notification = require('./../models/notificationModel');
const sendResponse = require('./../utils/sendResponse');
const falsyData = require('./../utils/falsyData');
const catchAsync = require('./../utils/catchAsync');

exports.getUserNotification = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  const notifications = await Notification.find({ receiver: userID });
  sendResponse(notifications, res, 200, { result: true });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const userID = req.user._id;
  const notification = await Notification.findById(req.params.notificationID);
  if (!notification) {
    return falsyData(
      next,
      `Can't find notification with id: ${req.params.notificationID}`,
      404
    );
  }
  if (!notification.receiver.includes(userID)) {
    return falsyData(next, `You're not allowed to read this notification`, 403);
  }
  notification.readBy.push({ readerID: userID, readAt: Date.now() });
  await notification.update({ readBy: notification.readBy });
  sendResponse(null, res, 200, { message: 'Notification Read' });
});
