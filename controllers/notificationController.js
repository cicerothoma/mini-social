const Notification = require('./../models/notificationModel');
const sendResponse = require('./../utils/sendResponse');
const falsyData = require('./../utils/falsyData');
const catchAsync = require('./../utils/catchAsync');

exports.addNewNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.create(req.body);
  sendResponse(notification, res, 200);
});

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
  if (String(userID) !== String(notification.receiver)) {
    return falsyData(next, `You're not allowed to read this notification`, 403);
  }
  notification.readBy = { readerID: userID, readAt: Date.now() };
  await notification.updateOne({ readBy: notification.readBy });
  sendResponse(null, res, 200, { message: 'Notification Read' });
});

exports.getUnreadNotifications = catchAsync(async (req, res, next) => {
  const unreadNotifications = await Notification.find({
    receiver: req.user._id,
    readBy: { $exists: false },
  });
  sendResponse(unreadNotifications, res, 200, { result: true });
});
exports.getReadNotifications = catchAsync(async (req, res, next) => {
  const readNotifications = await Notification.find({
    receiver: req.user._id,
    readBy: { $exists: true },
    $expr: { $eq: ['$receiver', '$readBy.readerID'] },
  });
  sendResponse(readNotifications, res, 200, { result: true });
});
