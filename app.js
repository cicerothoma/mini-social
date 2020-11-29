const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const postRoute = require('./routes/postRoutes');
const userRoute = require('./routes/userRoutes');
const commentRoute = require('./routes/commentRoutes');
const replyCommentRoute = require('./routes/replyCommentRoutes');
const notificationRoute = require('./routes/notificationRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// MiddleWare for getting the data sent in the request body
app.use(express.json({ limit: '10kb' }));

// Form Parser (Parses data from an html form to the req.body)
app.use(
  express.urlencoded({
    extended: true,
    limit: '10kb',
  })
);

// Middleware for parsing cookies
app.use(cookieParser());

// Middleware for enabling CORS (Cross Origin Request Sharing)
app.use(cors()); // Only works for simple requests (GET, POST)

// Middleware for enabling CORS for non-simple request (PATCH, PUT, DELETE, request with cookies etc)
app.options('*', cors());

// Middleware for testing data
// app.use((req, res, next) => {
//   console.log(req.originalUrl, req.method);
//   next();
// });

// Routes
app.use('/api/v1/posts', postRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/comments', commentRoute);
app.use('/api/v1/replyComments', replyCommentRoute);
app.use('/api/v1/notifications', notificationRoute);

// Unhandled Routes
app.all('*', (req, res, next) => {
  const error = `Can't find ${req.originalUrl} on this server`;

  next(new AppError(error, 400));
});

// Error Handler
app.use(globalErrorHandler);

module.exports = app;
