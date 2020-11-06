const Notification = require('./../models/notificationModel');
const catchAsync = require('./../utils/catchAsync');

module.exports = async (
  senderID,
  receiverId,
  message,
  options = { type: false, affectedDoc: false, endPoint: false },
  model = Notification
) => {
  await model.create({
    sender: senderID,
    receiver: receiverId,
    message,
    type: options.type ? options.type : undefined,
    document: options.affectedDoc ? options.affectedDoc : undefined,
    endPoint: options.endPoint ? options.endPoint : undefined,
  });
};
