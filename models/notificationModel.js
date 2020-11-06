const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }, // Notification creator
    receiver: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Ids of the receivers of the notification
    message: String, // any description of the notification message
    document: {
      type: mongoose.Schema.Types.ObjectId,
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'reply'],
      message: ['type should be either like, comment or reply'],
    },
    readBy: [
      {
        readerID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
          immutable: true,
        },
      },
    ],
    created_at: {
      type: Date,
      default: Date.now,
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

const Notification = mongoose.model(
  'Notification',
  notificationSchema,
  'notifications'
);

module.exports = Notification;
