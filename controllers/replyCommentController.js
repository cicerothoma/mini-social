const ReplyComment = require('./../models/replyCommentModel');
const Comment = require('./../models/commentModel');
const catchAsync = require('./../utils/catchAsync');
const falsyData = require('./../utils/falsyData');
const sendResponse = require('./../utils/sendResponse');
const likeReplies = require('./../utils/like');
const notify = require('./../utils/notify');

exports.getAllReplies = catchAsync(async (req, res, next) => {
  const replies = await ReplyComment.find();
  sendResponse(replies, res, 200, { result: true });
});

exports.getReply = catchAsync(async (req, res, next) => {
  const reply = await ReplyComment.findById(req.params.id);
  if (!reply) {
    return falsyData(next, `Can't find reply with id: ${req.params.id}`, 404);
  }
  sendResponse(reply, res, 200);
});

exports.createReply = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  const { commentID } = req.params;
  const comment = await Comment.findById(commentID);
  if (!comment) {
    return falsyData(next, `Can't find comment with id: ${commentID}`, 401);
  }
  const reply = await ReplyComment.create(req.body);
  comment.replyComment.push(reply._id);
  await comment.updateOne({ replyComment: comment.replyComment });
  if (String(req.user._id) !== String(comment.user._id)) {
    await notify(
      req.user._id,
      comment.user,
      `${req.user.name} replied to your comment`,
      {
        type: 'reply',
        comment: commentID,
        endPoint: `${req.protocol}://${req.get('host')}/api/v1/replyComments/${
          reply._id
        }`,
      }
    );
  }
  sendResponse(reply, res, 201, { message: 'Reply Successful' });
});

exports.likeReply = catchAsync(async (req, res, next) => {
  const { replyID, commentID } = req.params;
  const replyDoc = await ReplyComment.findById(replyID);
  if (!replyDoc) {
    return falsyData(next, `Can't find comment with id: ${replyID}`, 403);
  }
  const commentDoc = await Comment.findById(commentID);
  if (!commentDoc) {
    return falsyData(next, `Can't find comment with id: ${commentID}`, 403);
  }
  const data = await likeReplies(replyDoc, req, res);
  if (data.docLiked) {
    if (String(req.user._id) !== String(commentDoc.user._id)) {
      await notify(
        req.user._id,
        commentDoc.user,
        `${req.user.name} liked your reply`,
        {
          type: 'reply',
          replyComment: replyID,
          endPoint: `${req.protocol}://${req.get(
            'host'
          )}/api/v1/replyComments/${replyID}`,
        }
      );
    }
  }
});
