const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, 'Comment must have message'],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      required: [true, 'Comment Must Have TimeStamp'],
      immutable: true,
    },
    post: {
      type: mongoose.Schema.ObjectId,
      required: [true, 'Comment Must Belong To a Post'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Comment must belong to a user'],
    },
    replyComment: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'ReplyComment' },
    ],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strict: true,
  }
);

// Query Middleware
commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name username email profileImage',
  }).populate({
    path: 'replyComment',
    select: 'message user likes createdAt',
  });
  next();
});

const Comment = mongoose.model('Comment', commentSchema, 'comments');

module.exports = Comment;
