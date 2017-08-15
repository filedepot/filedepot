const sha256 = require('./sha256');

let hashFilename = (bucketId, filename) => {
  return sha256(bucketId + '@@' + filename);
}

module.exports = hashFilename;
