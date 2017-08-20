const crypto = require('crypto');

let sha256 = (content, encoding) => {
  let digestEncoding = encoding;
  if (!encoding) {
    digestEncoding = 'hex';
  }
  var hashAlgo = crypto.createHash('sha256');
  hashAlgo.update(content);
  let hashString = hashAlgo.digest(digestEncoding);
  return hashString;
};

module.exports = sha256;
