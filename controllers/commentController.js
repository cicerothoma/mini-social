const Comment = require('./../models/commentModel');
const Post = require('./../models/postModel');
const catchAsync = require('./../utils/catchAsync');
const falsyData = require('./../utils/falsyData');
const sendResponse = require('./../utils/sendResponse');
const APIFeatures = require('./../utils/apiFeatures');
const likeComment = require('./../utils/like');
const notify = require('./../utils/notify');

exports.getAllComments = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.postID) {
    filter = { post: req.params.postID };
  }
  const query = new APIFeatures(req.query, Comment.find(filter))
    .filter()
    .sort()
    .limitFields();
  const comments = await query.mongooseQuery;
  sendResponse(comments, res, 200, { result: true });
});

exports.getComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return falsyData(next, `Can't find comment with id: ${req.params.id}`, 404);
  }
  sendResponse(comment, res, 200);
});

exports.addNewComment = catchAsync(async (req, res, next) => {
  if (!req.body.user) {
    req.body.user = req.user._id;
  }
  if (!req.body.post) {
    req.body.post = req.params.postID;
  }

  const post = await Post.findById(req.body.post);
  if (!post) {
    return falsyData(next, `Can't comment on a post that doesn't exists`, 403);
  }
  const newComment = await Comment.create(req.body);
  // Checks if the owner of the post is the same person commenting on the post
  if (String(post.user) !== String(req.body.user)) {
    await notify(
      req.body.user,
      post.user,
      `${req.user.name} commented on your post`,
      {
        type: 'comment',
        post: req.body.post,
        endPoint: `${req.protocol}://${req.get('host')}/api/v1/comments/${
          newComment._id
        }`,
      }
    );
  }
  sendResponse(newComment, res, 201, { message: 'Comment Successful' });
});

exports.likeComment = catchAsync(async (req, res, next) => {
  const postDoc = await Post.findById(req.params.postID);
  if (!postDoc) {
    return falsyData(
      next,
      `Can't find post with id: ${req.params.postID}`,
      403
    );
  }
  const commentDoc = await Comment.findById(req.params.commentID);
  if (!commentDoc) {
    return falsyData(
      next,
      `Can't find comment with id: ${req.params.commentID}`,
      401
    );
  }
  const data = await likeComment(commentDoc, req, res);
  if (data.docLiked) {
    if (String(req.user._id) !== String(postDoc.user)) {
      await notify(
        req.user._id,
        postDoc.user,
        `${req.user.name} liked your comment`,
        {
          type: 'like',
          comment: req.params.commentID,
          endPoint: `${req.protocol}://${req.get('host')}/api/v1/comments/${
            req.params.commentID
          }`,
        }
      );
    }
  }
});
