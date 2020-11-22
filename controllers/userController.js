const multer = require('multer');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const falsyData = require('./../utils/falsyData');
const sendResponse = require('./../utils/sendResponse');
const notify = require('./../utils/notify');
const AppError = require('../utils/appError');
const uploadFile = require('./../utils/uploadFile');

const filterObject = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });

  return newObj;
};

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.includes('image')) {
    cb(null, true);
  } else {
    cb(new AppError(`Only Image Files Are Allowed`, 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

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
  if (req.user.role !== 'admin') {
    return falsyData(next, 'Only Admins Can Access This Route', 400);
  }
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
    await loggedInUser.updateOne({
      following: loggedInUser.following,
    });
    userToFollow.followers.push(loggedInUserID);
    await userToFollow.updateOne({
      followers: userToFollow.followers,
    });
    await notify(
      loggedInUserID,
      userToFollowID,
      `${loggedInUser.name} followed you`
    );
    sendResponse({ followed: true }, res, 200, {
      message: `${userToFollow.username} followed`,
    });
  } else {
    loggedInUser.following.splice(
      loggedInUser.following.indexOf(userToFollowID),
      1
    );
    userToFollow.followers.splice(
      userToFollow.followers.indexOf(loggedInUserID),
      1
    );
    await loggedInUser.updateOne({
      following: loggedInUser.following,
    });
    await userToFollow.updateOne({ followers: userToFollow.followers });
    await notify(
      loggedInUserID,
      userToFollowID,
      `${loggedInUser.name} unfollowed you`
    );
    sendResponse({ unfollowed: true }, res, 200, {
      message: `${userToFollow.username} unfollowed`,
    });
  }
});

exports.getImage = upload.single('file');

exports.uploadProfileImage = catchAsync(async (req, res, next) => {
  if (req.file) {
    const response = await uploadFile(req, req.file.buffer, {
      folder: `${req.user._id}/profile`,
      resource_type: 'image',
      public_id: req.user._id,
      overwrite: true,
    });
    req.body.profileImage = response.url;
  }
  next();
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword || req.body.email) {
    return falsyData(
      next,
      'This route is not for password or email update. Please use "/updateMyPassword" for password update or "/sendResetEmailToken" for email reset instead',
      401
    );
  }
  const filteredUserData = filterObject(
    req.body,
    'profileImage',
    'name',
    'username',
    'dateOfBirth',
    'bio',
    'phone'
  );
  if (req.body.profileImage) {
    filteredUserData.profileImage = req.body.profileImage;
  }
  const newUser = await User.findByIdAndUpdate(req.user._id, filteredUserData, {
    new: true,
    runValidators: true,
  });
  sendResponse(newUser, res, 200, { message: 'Profile Updated Successfully' });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { active: false },
    { new: true, runValidators: true }
  );

  if (!user) {
    return falsyData(next, `Can't find user with id: ${req.user._id}`, 404);
  }
  sendResponse(user, res, 204, {
    message: 'Your Account Has Been Successfully Deleted',
  });
});
