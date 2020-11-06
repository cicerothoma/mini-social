const express = require('express');
const authController = require('./../controllers/authController');
const replyCommentController = require('./../controllers/replyCommentController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .post(replyCommentController.createReply)
  .get(replyCommentController.getAllReplies);

router.route('/:id').get(replyCommentController.getReply);
router.route('/like/:replyID').patch(replyCommentController.likeReply);

module.exports = router;
