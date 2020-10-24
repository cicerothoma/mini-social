const express = require('express');
const authController = require('./../controllers/authController');
const userController = require('./../controllers/userController');

const router = express.Router();

router.route('/signup').post(authController.signUp);
router.route('/login').post(authController.login);

router.route('/').get(userController.getAllUsers);

router.route('/:id').delete(userController.deleteUser);

module.exports = router;
