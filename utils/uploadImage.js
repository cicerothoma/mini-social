const catchAsync = require('./catchAsync');
const uploadFromBuffer = require('./uploadFromBuffer');

const uploadImage = async (req, buffer) => {
  const uploadResponse = await uploadFromBuffer(req, buffer, {
    folder: `${req.user._id}/media`,
    resource_type: 'image',
    timeout: 600000,
  });
  return uploadResponse;
};

module.exports = uploadImage;
