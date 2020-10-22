const AppError = require('./../utils/appError');
const Post = require('./../models/postModel');
const catchAsync = require('./../utils/catchAsync');

exports.getAllPost = catchAsync(async (req, res, next) => {
  const posts = await Post.find();
  res.status(200).json({
    status: 'success',
    data: {
      data: posts,
    },
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id);

  if (!post) {
    return next(new AppError(`Can't find post with id: ${id}`, 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: post,
    },
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const newPost = await Post.create(req.body);
  res.status(200).json({
    status: 'success',
    message: 'Post Created Successfully',
    data: {
      data: newPost,
    },
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!post) {
    return next(new AppError(`Error Updating Post`, 400));
  }

  res.status(200).json({
    status: 'success',
    message: 'Post Updated Successfully',
    data: {
      data: post,
    },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findByIdAndDelete(id);
  if (!post) {
    return next(new AppError(`Can't find post with id: ${id}`, 400));
  }
  res.status(204).json({
    status: 'success',
    message: 'Post Deleted',
  });
});
