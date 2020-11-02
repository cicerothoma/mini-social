const express = require('express');
const commentController = require('./../controllers/commentController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
  .route('/')
  .get(commentController.getAllComments)
  .post(
    authController.restrictTo('user', 'admin'),
    commentController.addNewComment
  );

module.exports = router;
