const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }, // Notification creator
  receiver: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Ids of the receivers of the notification
  message: String, // any description of the notification message
  document: {
    type: mongoose.Schema.Types.ObjectId,
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
      },
    },
  ],
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model(
  'Notification',
  notificationSchema,
  'notifications'
);

module.exports = Notification;
