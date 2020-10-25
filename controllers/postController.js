const AppError = require('./../utils/appError');
const Post = require('./../models/postModel');
const catchAsync = require('./../utils/catchAsync');

const postError = (
  post,
  next,
  message = 'Post Not Found',
  statusCode = 400
) => {
  if (!post) {
    return next(new AppError(message, statusCode));
  }
};

const sendResponse = (
  data,
  message,
  res,
  statusCode = 200,
  options = { result: false }
) => {
  res.status(statusCode).json({
    status: 'success',
    message: message ? message : undefined,
    result: options.result ? data.length : undefined,
    data: {
      data,
    },
  });
};

exports.getAllPost = catchAsync(async (req, res, next) => {
  const posts = await Post.find();
  sendResponse(posts, null, res, 200, { result: true });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id);

  if (!post) return postError(post, next);

  sendResponse(post, null, res);
});

exports.createPost = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  const newPost = await Post.create(req.body);
  sendResponse(newPost, 'Post Created Successfully', res, 201);
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  req.body.timeStamp = Date.now();
  const post = await Post.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!post) return postError(post, next, 'Error updating post', 401);
  sendResponse(post, 'Post Updated Successfully', res);
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let post = null;
  if (req.user.role === 'admin') {
    post = await Post.findByIdAndDelete(id);
    if (!post) return postError(post, next, `Can't find post with id: ${id}`);
    sendResponse(null, 'Post deleted successfully', res, 204);
  } else if (req.user.role === 'user') {
    post = await Post.findById(id);
    if (!post) {
      return postError(post, next, `Can't find post with id: ${id}`);
    }
    console.log({ postUser: post.user, userId: req.user._id });
    console.log(typeof post.user, typeof req.user._id);
    // Reason for this bug is cause they're both objects instead of strings
    if (post.user !== req.user._id) {
      return postError(false, next, `Not authorized to delete that post`, 401);
    }
    sendResponse(null, 'Post deleted successfully', res, 204);
  }
});
