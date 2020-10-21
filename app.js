const express = require('express');
const morgan = require('morgan');
const postRoute = require('./routes/postRouter');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// MiddleWare for getting the data sent in the request body
app.use(express.json());

// Routes
app.use('/api/v1/post', postRoute);

module.exports = app;
