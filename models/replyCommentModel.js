const mongoose = require('mongoose');

const replyCommentSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, 'Comment reply must have message'],
      trim: [true],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    likes: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    createdAt: {
      type: Date,
      required: [true, 'Comment reply must have timestamp'],
      default: Date.now(),
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

const ReplyComment = mongoose.model(
  'ReplyComment',
  replyCommentSchema,
  'replies'
);

module.exports = ReplyComment;
