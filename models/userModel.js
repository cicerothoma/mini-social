const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    dateJoined: {
      type: Date,
      required: true,
      default: Date.now(),
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
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

const User = mongoose.model('User', userSchema, 'users');

module.exports = User;
