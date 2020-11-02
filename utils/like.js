const sendResponse = require('./sendResponse');

module.exports = async (doc, req, res) => {
  if (!doc.likes.includes(req.user._id)) {
    doc.likes.push(req.user._id);
    await doc.update({ likes: doc.likes });
    sendResponse({ docLiked: true }, res, 200, { message: 'Document Liked' });
  } else {
    doc.likes.splice(doc.likes.indexOf(req.user._id), 1);
    await doc.update({ likes: doc.likes });
    sendResponse({ docLiked: false }, res, 200, {
      message: 'Document Unliked',
    });
  }
};
