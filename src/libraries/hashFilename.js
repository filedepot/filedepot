const crypto = require('crypto');

let hashFilename = (bucketId, filename) => {
  var sha256Hash = crypto.createHash('sha256');
  sha256Hash.update(bucketId + '@@' + filename);
  let hash = sha256Hash.digest('hex');
  return hash;
}

module.exports = hashFilename;
