const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:resetToken').patch(authController.resetPassword);
router
  .route('/sendResetEmailToken')
  .post(authController.protect, authController.sendResetEmailToken);
router.route('/resetEmail/:resetToken').patch(authController.resetEmail);

router.route('/').get(userController.getAllUsers);
router
  .route('/updateMyPassword')
  .patch(authController.protect, authController.updatePassword);

router
  .route('/:id')
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser
  )
  .patch(userController.updateUser);

module.exports = router;