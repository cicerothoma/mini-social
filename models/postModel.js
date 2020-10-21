const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      minlength: [10, 'Body Must be above 10 characters'],
    },
    images: [String],
    slug: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now(),
    },
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

module.export = Post;
