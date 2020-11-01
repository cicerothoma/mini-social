const Post = require('./../models/postModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const postError = require('./../utils/falsyData');
const sendResponse = require('./../utils/sendResponse');

exports.aliasMostLikedPost = (req, res, next) => {
  req.query = {
    sort: '-likes',
    limit: '1',
    fields: 'feeling,message,createdAt,likes',
  };
  next();
};

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const query = new APIFeatures(req.query)
    .filter()
    .limitFields()
    .sort()
    .paginate();
  const posts = await query.mongooseQuery;
  sendResponse(posts, res, 200, { result: true });
});

exports.getUserCuratedPost = catchAsync(async (req, res, next) => {
  const followers = req.user.following;
  const loggedInUserID = req.user._id;
  const userCuratedPosts = Post.find({
    $or: [{ user: { $in: followers } }, { user: loggedInUserID }],
  });
  const queries = new APIFeatures(req.query, userCuratedPosts)
    .filter()
    .limitFields()
    .sort()
    .paginate();
  const posts = await queries.mongooseQuery;
  sendResponse(posts, res, 200, { result: true });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id);

  if (!post) {
    return postError(post, next);
  }

  sendResponse(post, res);
});

exports.createPost = catchAsync(async (req, res, next) => {
  req.body.user = req.user._id;
  const newPost = await Post.create(req.body);
  sendResponse(newPost, res, 201, { message: 'Post Created Successfully' });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) {
    return postError(post, next, 'Error updating post', 401);
  }
  if (String(post.user) !== String(req.user._id)) {
    return postError(false, next, `Not authorized to update that post`, 401);
  }
  req.body.updatedAt = Date.now();
  const updatedPost = await Post.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });

  sendResponse(null, res, 200, { message: 'Post Updated Successfully' });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  let post = null;
  if (req.user.role === 'admin') {
    post = await Post.findByIdAndDelete(id);
    if (!post) {
      return postError(post, next, `Can't find post with id: ${id}`);
    }
    sendResponse(null, res, 204, { message: 'Post deleted successfully' });
  } else if (req.user.role === 'user') {
    post = await Post.findById(id);
    if (!post) {
      return postError(post, next, `Can't find post with id: ${id}`);
    }
    if (String(post.user) !== String(req.user._id)) {
      return postError(false, next, `Not authorized to delete that post`, 401);
    }
    await Post.findByIdAndDelete(post._id);
    sendResponse(null, res, 204, { message: 'Post deleted successfully' });
  }
});

exports.likePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.postID);
  if (!post) {
    return postError(next, `Can't find post with id: ${id}`, 401);
  }
  if (!post.likes.includes(req.user._id)) {
    post.likes.push(req.user._id);
    await post.update({ likes: post.likes });
    sendResponse({ postLiked: true }, res, 200, { message: 'Post Liked' });
  } else {
    post.likes.splice(post.likes.indexOf(req.user._id), 1);
    await post.update({ likes: post.likes });
    sendResponse({ postLiked: false }, res, 200, { message: 'Post Unliked' });
  }
});
