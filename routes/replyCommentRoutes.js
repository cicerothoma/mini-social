const express = require('express');
const replyCommentController = require('./../controllers/replyCommentController');

const router = express.Router({ mergeParams: true });

router.route('/').post(replyCommentController.createReply);
router.route('/like/:replyID').patch(replyCommentController.likeReply);

module.exports = router;
