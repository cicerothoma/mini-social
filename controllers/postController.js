const Post = require('./../models/postModel');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const postError = require('./../utils/falsyData');
const likePost = require('./../utils/like');
const notify = require('./../utils/notify');
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
  const query = new APIFeatures(req.query, Post.find().populate('comments'))
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
    $or: [{ user: loggedInUserID }, { user: { $in: followers } }],
  }).populate('comments');
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

  sendResponse(updatedPost, res, 200, { message: 'Post Updated Successfully' });
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
  const data = await likePost(post, req, res);
  if (data.docLiked) {
    if (String(req.user._id) !== String(post.user)) {
      await notify(
        req.user._id,
        post.user,
        `${req.user.name} liked your post`,
        {
          type: 'like',
          post: post._id,
          endPoint: `${req.protocol}://${req.get('host')}/api/v1/post/${
            post._id
          }`,
        }
      );
    }
  }
});

exports.uploadFiles = catchAsync((req, res, next) => {
  console.log('upload file middleware');
  next();
});
