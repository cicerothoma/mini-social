const Post = require('./../models/postModel');
const catchAsync = require('./../utils/catchAsync');
const falsyData = require('./../utils/falsyData');
const postError = require('./../utils/falsyData');
const sendResponse = require('./../utils/sendResponse');

exports.addMostLikedQuery = (req, res, next) => {
  req.query = { sort: '-likes', limit: '1' };
  next();
};

exports.getAllPosts = catchAsync(async (req, res, next) => {
  // Build Query
  // 1a) Filtering
  const queryObj = { ...req.query };
  const excludedFields = ['page', 'sort', 'fields', 'limit'];
  excludedFields.forEach((el) => delete queryObj[el]);

  // 1b) Advanced Filtering
  let queryString = JSON.stringify(queryObj);
  queryString = queryString.replace(
    /\b(gte|gt|lt|lte|eq)\b/g,
    (matchedWord) => `$${matchedWord}`
  );
  let query = Post.find(JSON.parse(queryString));

  // 2) Sorting
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort({ createdAt: 'desc' });
  }

  // 3) Field Limiting
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v');
  }

  // 4) Pagination

  const limit = +req.query.limit || 100;
  const page = +req.query.page || 1;
  const skip = limit * (page - 1);
  query = query.skip(skip).limit(limit);

  // Execute Query
  const posts = await query;
  sendResponse(posts, res, 200, { result: true });
});

exports.getUserCuratedPost = catchAsync(async (req, res, next) => {
  const followers = req.user.following;
  const loggedInUserID = req.user._id;
  // const posts = await Post.find({ user: { $in: followers } });
  const posts = await Post.find({
    $or: [{ user: { $in: followers } }, { user: loggedInUserID }],
  }).find(req.query);
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
    return falsyData(next, `Can't find post with id: ${id}`, 401);
  }
  if (!post.likes.includes(req.user._id)) {
    await post.update({ likes: post.likes.concat([req.user._id]) });
    sendResponse(null, res, 200, { message: 'Post Liked' });
  } else {
    const userIdIndex = post.likes.findIndex(
      (el) => String(el) === String(req.user._id)
    );
    post.likes.splice(userIdIndex, 1);
    await post.update({ likes: post.likes });
    sendResponse(null, res, 200, { message: 'Post Unliked' });
  }
});
