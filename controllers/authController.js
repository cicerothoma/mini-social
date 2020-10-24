const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const userObj = {
    name: req.body.name,
    email: req.body.email,
    dateOfBirth: req.body.dateOfBirth,
    phone: req.body.phone,
    bio: req.body.bio,
    username: req.body.username,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };

  const newUser = await User.create(userObj);
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    message: 'User created successfully',
    data: {
      token,
      data: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password, username } = req.body;

  if ((email || username) && password) {
    const user = await User.findOne({ $or: [{ email }, { username }] }).select(
      '+password'
    );

    res.status(200).json({
      status: 'success',
      message: 'Login successfully',
      data: {
        data: user,
      },
    });
  } else {
    return next(new AppError('Please provide email or username and password'));
  }
});
