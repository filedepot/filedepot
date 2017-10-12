const crypto = require('crypto');

let sha256 = (content, encoding) => {
  let digestEncoding = encoding;
  if (!encoding) {
    digestEncoding = 'hex';
  }
  const hashAlgo = crypto.createHash('sha256');
  hashAlgo.update(content);
  return hashAlgo.digest(digestEncoding);
};

module.exports = sha256;
