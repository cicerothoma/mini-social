const express = require('express');
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');
const commentRoute = require('../routes/commentRoutes');

const router = express.Router();

router.use('/:postID/comments', commentRoute);

router.use(authController.protect);
router
  .route('/all')
  .get(authController.restrictTo('admin'), postController.getAllPosts);

router.route('/like').get(postController.getLikedPosts);

router.route('/like/:postID').patch(postController.likePost);

router
  .route('/most-liked-post')
  .get(postController.aliasMostLikedPost, postController.getAllPosts);

router
  .route('/')
  .get(postController.getUserCuratedPost)
  .post(
    postController.getFiles,
    postController.uploadFilesToCloudinary,
    postController.createPost
  );

router
  .route('/:id')
  .get(postController.getPost)
  .patch(postController.updatePost)
  .delete(
    authController.restrictTo('admin', 'user'),
    postController.deletePost
  );
module.exports = router;
