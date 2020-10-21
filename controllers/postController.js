const Post = require('./../models/postModel');
const catchAsync = require('./../utils/catchAsync');

exports.getAllPost = catchAsync(async (req, res, next) => {
  //   const posts = await Post.find();

  res.status(200).json({
    message: 'Successfull',
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  console.log(req.body);
  res.status(200).json({
    status: 'success',
    message: 'Post Created Successfully',
  });
});
