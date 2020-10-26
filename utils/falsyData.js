const AppError = require('./appError');

module.exports = (next, message = 'Data Not Found', statusCode = 400) => {
  return next(new AppError(message, statusCode));
};
