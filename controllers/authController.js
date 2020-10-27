const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const falsyData = require('./../utils/falsyData');
const sendResponse = require('./../utils/sendResponse');
const sendEmail = require('./../utils/email');
const tokenEncrypt = require('./../utils/tokenEncrypt');

const signToken = function (id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createAndSendToken = (data, statusCode, res) => {
  // Sign Token
  const token = signToken(data._id);
  // Remove Password from output
  data.password = undefined;
  // Set Cookie Options
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  // Set Cookie to be sent over https if we're in production
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  // Send Token as cookie
  res.cookie('jwt', token, cookieOptions);
  // Send Response
  sendResponse(data, res, statusCode, {
    token,
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

  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password, username } = req.body;

  if ((email || username) && password) {
    const user = await User.findOne({ $or: [{ email }, { username }] }).select(
      '+password'
    );

    // Check if user exists and password is correct
    if (!user || !(await user.correctPassword(password, user.password))) {
      return falsyData(next, 'Username/Email or password is incorrect', 400);
    }

    createAndSendToken(user, 200, res);
  } else {
    return falsyData(next, 'Please provide email or username and password');
  }
});

exports.protect = catchAsync(async (req, res, next) => {
  let token = null;
  // 1) Check if token exists and get token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  console.log(token);

  if (!token) {
    return falsyData(
      next,
      'You are not logged in! Please log in to access this resource',
      401
    );
  }

  // 2) Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return falsyData(
      next,
      `Can't find user with that token. Please try again`,
      401
    );
  }

  // 4) Check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return falsyData(
      next,
      'User recently changed password. Please log in again',
      401
    );
  }
  // Grant Access
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return falsyData(next, 'Not authorized to access this route', 401);
  }
  next();
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get User Based on the provided email
  const { email } = req.body;
  const user = await User.findOne({
    email,
  });
  if (!user) {
    return falsyData(next, `Can't find user with email: ${email}`, 404);
  }
  // 2) Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  // The instance method above modifies the user data (passowrdResetToken && passwordResetTokenExpires fields)
  // because of the data modification done by the instance method we need to save the document again
  await user.save({ validateBeforeSave: false });
  // 3) Send Email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and confirmPassword to ${resetURL}.\n If you didn't initiate this action you can simply ignore this message`;

  try {
    await sendEmail({
      email,
      subject: 'Forgot Password. (Valid for 10 minutes)',
      message,
    });
    sendResponse(null, res, 200, { message: 'Token Sent To Mail' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return falsyData(
      next,
      'There was an error sending the email. Try again later',
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { resetToken } = req.params;
  // 1) Get User Based On resetToken
  const hashedToken = tokenEncrypt(resetToken);

  // (Get user with resetToken if the token is not yet expired)
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });
  console.log('compareToken', {
    newHash: hashedToken,
    dbSaved: user.passwordResetToken,
  });

  // 2) If resetToken is not yet expired and there is a user, set new password
  if (!user) {
    return falsyData(next, 'Token is invalid or has expired', 400);
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;
  await user.save();
  // 4) Log user in. Send JWT
  createAndSendToken(user, 200, res);
});
