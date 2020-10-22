const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Post Must Belong To A User'],
    },
    feeling: String,
    message: {
      type: String,
      required: [true, 'Post Must Contain Message'],
      minlength: [10, 'Post Must Be Above 10 Characters'],
      trim: true,
    },
    createdAt: {
      type: Date,
      required: [true, 'TimeStamp Is Required'],
      default: Date.now(),
      select: false,
    },
    likes: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    images: [String],
    comment: [{ type: mongoose.Schema.ObjectId, ref: 'Comment' }],
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

const Post = mongoose.model('Post', postSchema, 'post');

module.exports = Post;
