const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:resetToken').patch(authController.resetPassword);
router.route('/resetEmail/:resetToken').patch(authController.resetEmail);

router.use(authController.protect);

router.route('/sendResetEmailToken').post(authController.sendResetEmailToken);

router.route('/follow').get(userController.getUsersToFollow);
router.route('/follow/:toFollowID').patch(userController.follow);

router
  .route('/')
  .get(authController.restrictTo('admin'), userController.getAllUsers);

router.route('/updateMyPassword').patch(authController.updatePassword);

router
  .route('/updateMe')
  .patch(
    userController.getImage,
    userController.uploadProfileImage,
    userController.updateProfile
  );

router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router
  .route('/:id')
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

module.exports = router;
