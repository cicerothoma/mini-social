const express = require('express');
const morgan = require('morgan');
const postRoute = require('./routes/postRouter');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// MiddleWare for getting the data sent in the request body
app.use(express.json());

// Routes
app.use('/api/v1/post', postRoute);

// Unhandled Routes
app.use('*', (req, res, next) => {
  const error = `Can't find ${req.originalUrl} on this server`;

  next(new AppError(error, 400));
});

// Error Handler
app.use(globalErrorHandler);

module.exports = app;
