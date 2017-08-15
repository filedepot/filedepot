const crypto = require('crypto');

let sha256 = (content, encoding) => {
  if (!encoding) {
    encoding = 'hex';
  }
  var hashAlgo = crypto.createHash('sha256');
  hashAlgo.update(content);
  let hashString = hashAlgo.digest(encoding);
  return hashString;
}

module.exports = sha256;
