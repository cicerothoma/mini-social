const express = require('express');
const commentController = require('./../controllers/commentController');
const authController = require('./../controllers/authController');
const replyCommentRouter = require('./replyCommentRoutes');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.use('/:commentID/replyComments', replyCommentRouter);

router.route('/like/:commentID').patch(commentController.likeComment);

router
  .route('/')
  .get(commentController.getAllComments)
  .post(
    authController.restrictTo('user', 'admin'),
    commentController.addNewComment
  );

module.exports = router;
