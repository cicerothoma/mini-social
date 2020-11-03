const ReplyComment = require('./../models/replyCommentModel');
const Comment = require('./../models/commentModel');
const catchAsync = require('./../utils/catchAsync');
const falsyData = require('./../utils/falsyData');
const sendResponse = require('./../utils/sendResponse');
const likeReplies = require('./../utils/like');

exports.getAllReplies = catchAsync(async (req, res, next) => {
  const replies = await ReplyComment.find();
  sendResponse(replies, res, 200, { result: true });
});

exports.createReply = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  const { commentID } = req.params;
  const comment = await Comment.findById(commentID);
  if (!comment) {
    return falsyData(next, `Can't find comment with id: ${id}`, 401);
  }
  const reply = await ReplyComment.create(req.body);
  comment.replyComment.push(reply._id);
  await comment.update({ replyComment: comment.replyComment });
  sendResponse(reply, res, 201, { message: 'Reply Successful' });
});

exports.likeReply = catchAsync(async (req, res, next) => {
  const { replyID } = req.params;
  const replyDoc = await ReplyComment.findById(replyID);
  await likeReplies(replyDoc, req, res);
});
