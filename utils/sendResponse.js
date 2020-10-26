module.exports = (
  data,
  res,
  statusCode = 200,
  options = { result: false, token: false, message: false }
) => {
  res.status(statusCode).json({
    status: 'success',
    message: options.message ? options.message : undefined,
    token: options.token ? options.token : undefined,
    result: options.result ? data.length : undefined,
    data: {
      data,
    },
  });
};
