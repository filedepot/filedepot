const Promise = require('bluebird');
const jwt = Promise.promisifyAll(require('jsonwebtoken'));
const bcrypt = Promise.promisifyAll(require('bcryptjs'));
const models = require('../models');
const authFailed = require('../libraries/auth-failed-res');

module.exports = (req, res, next) => {
  var token = req.body.token || req.query.token || req.headers.authorization;
  if (!token) {
    return authFailed(res);
  }

  let tokenParts = token.split(/\./g);
  if (tokenParts.length != 2) {
    return authFailed(res);
  }

  let keyId = tokenParts[0];
  let secret = tokenParts[1];

  models.Key
    .findOne({
      where: {
        keyId: keyId
      },
      logging: false
    })
    .then((key) => {
      if (!key) {
        throw new Error('Key not found');
      }
      if (!bcrypt.compareSync(secret, key.secretHash)) {
        throw new Error('Secret is wrong');
      }

      req.key = key;
      next();
      return null;
    })
    .catch((err) => {
      return authFailed(res);
    });
};
