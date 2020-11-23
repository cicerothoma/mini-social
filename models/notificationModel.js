const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    sender: {
      // Notification creator
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    receiver: {
      // ID of the receiver of the notification
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    message: String, // any description of the notification message
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    replyComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReplyComment',
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'reply'],
      message: ['type should be either like, comment or reply'],
    },
    readBy: {
      readerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      readAt: Date,
    },
    created_at: {
      type: Date,
      default: Date.now(),
      immutable: true,
    },
    endPoint: String,
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
  }
);

notificationSchema.virtual('isRead').get(function () {
  if (String(this.receiver) === String(this.readBy.readerID)) {
    return true;
  }
  return false;
});

notificationSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'comment',
  })
    .populate({ path: 'post' })
    .populate({ path: 'replyComment' });
  next();
});

const Notification = mongoose.model(
  'Notification',
  notificationSchema,
  'notifications'
);

module.exports = Notification;
