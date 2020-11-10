const Notification = require('./../models/notificationModel');

module.exports = async (
  senderID,
  receiverId,
  message,
  options = {
    type: false,
    comment: false,
    post: false,
    replyComment: false,
    endPoint: false,
  },
  model = Notification
) => {
  await model.create({
    sender: senderID,
    receiver: receiverId,
    message,
    type: options.type ? options.type : undefined,
    comment: options.comment ? options.comment : undefined,
    post: options.post ? options.post : undefined,
    replyComment: options.replyComment ? options.replyComment : undefined,
    endPoint: options.endPoint ? options.endPoint : undefined,
  });
};
