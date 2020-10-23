const AppError = require('../utils/appError');
const { findByIdAndDelete } = require('./../models/userModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    data: {
      data: users,
    },
  });
});
exports.createUser = (req, res, next) => {
  res.status(200).json({
    status: 'fail',
    message: 'This route is not yet implemented',
  });
};
exports.updateUser = (req, res, next) => {
  res.status(200).json({
    status: 'fail',
    message: 'This route is not yet implemented',
  });
};
exports.getUser = (req, res, next) => {
  res.status(200).json({
    status: 'fail',
    message: 'This route is not yet implemented',
  });
};
exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return next(new AppError(`Can't find user with id: ${id}`, 400));
  }
  res.status(204).json({
    status: 'success',
    message: 'TUser successfully deleted',
  });
});
