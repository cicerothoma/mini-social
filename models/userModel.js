const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const tokenEncrypt = require('./../utils/tokenEncrypt');

const userSchema = new mongoose.Schema(
  {
    dateJoined: {
      type: Date,
      required: true,
      default: Date.now(),
      immutable: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
      unique: [true, 'Email is already in use by another user'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Please provide date of birth'],
    },
    phone: String,
    profileImage: {
      type: String,
      default: 'default.jpg',
    },
    bio: String,
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'admin'],
      message: 'User role must either be "user" or "admin"',
    },
    username: {
      type: String,
      unique: [true, 'Username already taken'],
      required: [true, 'Please provide username'],
    },
    password: {
      type: String,
      minlength: 8,
      //   select: false,
    },
    confirmPassword: {
      type: String,
      minlength: 8,
      validate: {
        // Custom validators only works for saving documents to the database and doesn't work for updating them
        validator: function (val) {
          return val === this.password;
        },
        message: 'Password and Confirm Password Fields do not match',
      },
    },
    followers: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    passwordResetTokenExpires: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    emailResetToken: String,
    emailResetTokenExpires: Date,
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    strict: true,
  }
);
// Document Middleware
userSchema.pre('save', async function (next) {
  // 1) Hash Password
  this.password = await bcrypt.hash(this.password, 12);
  // 2) Remove confirmPassword field
  this.confirmPassword = undefined;
  next();
});

// Query Middleware

userSchema.pre(/^find/, function (next) {
  this.select('-__v');
  next();
});

// Instance Methods
userSchema.methods.correctPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    // Convert the pasword changed time to timestamp
    // The Reason why we divide by 1000 is because the changedTimestamp is in milliseconds while
    // the JWTTimestamp is in seconds so we need to make sure they're both in the same format
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means the password has not been changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = tokenEncrypt(resetToken);

  // Set the password reset token to expire in 10 minutes
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

userSchema.methods.createEmailResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.emailResetToken = tokenEncrypt(resetToken);
  // Set the token to expire in 10 minutes
  this.emailResetTokenExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;
