const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const postRoute = require('./routes/postRoutes');
const userRoute = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// MiddleWare for getting the data sent in the request body
app.use(express.json());

// Middleware for parsing cookies
app.use(cookieParser());

// Middleware for testing data
app.use((req, res, next) => {
  console.log(req.cookies);
  next();
});

// Routes
app.use('/api/v1/posts', postRoute);
app.use('/api/v1/users', userRoute);

// Unhandled Routes
app.use('*', (req, res, next) => {
  const error = `Can't find ${req.originalUrl} on this server`;

  next(new AppError(error, 400));
});

// Error Handler
app.use(globalErrorHandler);

module.exports = app;
