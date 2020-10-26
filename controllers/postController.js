const AppError = require('./../utils/appError');
const Post = require('./../models/postModel');
const catchAsync = require('./../utils/catchAsync');
const postError = require('./../utils/falsyData');
const sendResponse = require('./../utils/sendResponse');

exports.getAllPost = catchAsync(async (req, res, next) => {
  const posts = await Post.find();
  sendResponse(posts, res, 200, { result: true });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id);

  if (!post) {
    return postError(post, next);
  }

  sendResponse(post, res);
});

exports.createPost = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  const newPost = await Post.create(req.body);
  sendResponse(newPost, res, 201, { message: 'Post Created Successfully' });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  req.body.updatedAt = Date.now();
  const post = await Post.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!post) {
    return postError(post, next, 'Error updating post', 401);
  }
  sendResponse(post, res, 200, { message: 'Post Updated Successfully' });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let post = null;
  if (req.user.role === 'admin') {
    post = await Post.findByIdAndDelete(id);
    if (!post) {
      return postError(post, next, `Can't find post with id: ${id}`);
    }
    sendResponse(null, res, 204, { message: 'Post deleted successfully' });
  } else if (req.user.role === 'user') {
    post = await Post.findById(id);
    if (!post) {
      return postError(post, next, `Can't find post with id: ${id}`);
    }
    if (String(post.user) !== String(req.user._id)) {
      return postError(false, next, `Not authorized to delete that post`, 401);
    }
    await Post.findByIdAndDelete(post._id);
    sendResponse(null, res, 204, { message: 'Post deleted successfully' });
  }
});
