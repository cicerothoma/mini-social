const catchAsync = require('./catchAsync');
const uploadFromBuffer = require('./uploadFromBuffer');

const uploadVideo = async (req, buffer) => {
  const uploadResponse = await uploadFromBuffer(req, buffer, {
    folder: `${req.user._id}/media`,
    resource_type: 'video',
    timeout: 600000,
  });
  return uploadResponse;
};

module.exports = uploadVideo;
