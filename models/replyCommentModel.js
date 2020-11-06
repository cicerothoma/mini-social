const mongoose = require('mongoose');

const replyCommentSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: [true, 'Comment reply must have message'],
      trim: [true],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
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

replyCommentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name username email profileImage',
  });
  next();
});

const ReplyComment = mongoose.model(
  'ReplyComment',
  replyCommentSchema,
  'replies'
);

module.exports = ReplyComment;
