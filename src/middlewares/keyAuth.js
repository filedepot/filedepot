const bcrypt = require('bcryptjs');
const models = require('filedepot-models');
const authFailed = require('../libraries/auth-failed-res');

/*
  This middleware checks for authorization by access key
  before forwarding the request to the route.
 */
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

  let state = {};

  return models.Key
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

      state.key = key;
      return bcrypt.compare(secret, key.secretHash);
    })
    .then((result) => {
      if (!result) {
        throw new Error('Invalid secret');
      }
      req.key = state.key;
      next();
      return null;
    })
    .catch(() => {
      return authFailed(res);
    });
};
