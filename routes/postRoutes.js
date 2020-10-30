const express = require('express');
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);
router
  .route('/all')
  .get(authController.restrictTo('admin', 'user'), postController.getAllPosts);

router
  .route('/')
  .get(postController.getUserCuratedPost)
  .post(postController.createPost);

router
  .route('/:id')
  .get(postController.getPost)
  .patch(postController.updatePost)
  .delete(
    authController.restrictTo('admin', 'user'),
    postController.deletePost
  );
module.exports = router;
