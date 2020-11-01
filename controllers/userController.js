const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const falsyData = require('./../utils/falsyData');
const sendResponse = require('./../utils/sendResponse');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  sendResponse(users, res, 200, { result: true });
});
exports.createUser = (req, res, next) => {
  res.status(200).json({
    status: 'fail',
    message: 'This route is not yet implemented',
  });
};
exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updatedUser = await User.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return falsyData(next, `Can't find user with id: ${id}`, 400);
  }
  sendResponse(updatedUser, res);
});
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
    return falsyData(next, `Can't find user with id: ${id}`, 400);
  }
  res.status(204).json({
    status: 'success',
    message: 'User successfully deleted',
  });
});

exports.follow = catchAsync(async (req, res, next) => {
  const loggedInUserID = req.user._id;
  const userToFollowID = req.params.toFollowID;
  const loggedInUser = await User.findById(req.user._id);
  const userToFollow = await User.findById(req.params.toFollowID);
  if (!userToFollow) {
    return falsyData(next, `Can't find user with id: ${id}`, 401);
  }
  if (!loggedInUser.following.includes(userToFollowID)) {
    loggedInUser.following.push(userToFollowID);
    await loggedInUser.update({
      following: loggedInUser.following,
    });
    userToFollow.followers.push(loggedInUserID);
    await userToFollow.update({
      followers: userToFollow.followers,
    });
    sendResponse({ followed: true }, res, 200, {
      message: `${userToFollow.username} followed`,
    });
  } else {
    loggedInUser.following.splice(
      loggedInUser.following.findIndex(
        (el) => String(el) === String(userToFollowID)
      ),
      1
    );
    userToFollow.followers.splice(
      userToFollow.followers.findIndex(
        (el) => String(el) === String(loggedInUserID)
      ),
      1
    );
    await loggedInUser.update({
      following: loggedInUser.following,
    });
    await userToFollow.update({ followers: userToFollow.followers });
    sendResponse({ unfollowed: true }, res, 200, {
      message: `${userToFollow.username} unfollowed`,
    });
  }
});
