const Comment = require('./../models/commentModel');
const catchAsync = require('./../utils/catchAsync');
const falsyData = require('./../utils/falsyData');
const sendResponse = require('./../utils/sendResponse');

exports.getAllComments = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.postID) {
    filter = { post: req.params.postID };
  }
  const comments = await Comment.find(filter);
  sendResponse(comments, res, 200, { result: true });
});

exports.addNewComment = catchAsync(async (req, res, next) => {
  if (!req.body.user) {
    req.body.user = req.user._id;
  }
  if (!req.body.post) {
    req.body.post = req.params.postID;
  }
  const newComment = await Comment.create(req.body);
  sendResponse(newComment, res, 201, { message: 'Comment Successful' });
});