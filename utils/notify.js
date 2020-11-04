const Notification = require('./../models/notificationModel');
const catchAsync = require('./../utils/catchAsync');

module.exports = async (
  senderID,
  receiverId,
  message,
  model = Notification
) => {
  await model.create({
    sender: senderID,
    receiver: receiverId,
    message,
  });
};
