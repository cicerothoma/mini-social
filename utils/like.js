const sendResponse = require('./sendResponse');

module.exports = async (doc, req, res) => {
  if (!doc.likes.includes(req.user._id)) {
    doc.likes.push(req.user._id);
    await doc.updateOne({ likes: doc.likes });
    sendResponse({ docLiked: true }, res, 200, { message: 'Document Liked' });
    return { docLiked: true };
  } else {
    doc.likes.splice(doc.likes.indexOf(req.user._id), 1);
    await doc.updateOne({ likes: doc.likes });
    sendResponse({ docLiked: false }, res, 200, {
      message: 'Document Unliked',
    });
    return { docLiked: false };
  }
};
