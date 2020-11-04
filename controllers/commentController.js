const Comment = require('./../models/commentModel');
const catchAsync = require('./../utils/catchAsync');
const falsyData = require('./../utils/falsyData');
const sendResponse = require('./../utils/sendResponse');
const APIFeatures = require('./../utils/apiFeatures');
const likeComment = require('./../utils/like');

exports.getAllComments = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.postID) {
    filter = { post: req.params.postID };
  }
  const query = new APIFeatures(req.query, Comment.find(filter))
    .filter()
    .sort()
    .limitFields();
  const comments = await new query.mongooseQuery();
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

exports.likeComment = catchAsync(async (req, res, next) => {
  const commentDoc = await Comment.findById(req.params.commentID);
  if (!commentDoc) {
    return falsyData(next, `Can't find comment with id: ${id}`, 401);
  }
  await likeComment(commentDoc, req, res);
});
