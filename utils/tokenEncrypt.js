const crypto = require('crypto');

module.exports = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');
