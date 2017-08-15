const Promise = require('bluebird');
const jwt = Promise.promisifyAll(require('jsonwebtoken'));
const bcrypt = Promise.promisifyAll(require('bcryptjs'));
const models = require('../models');
const authFailed = require('../libraries/auth-failed-res');

/**
  This middleware checks for authorization by access token and deletes the token
  before forwarding the request to the route.
 */
module.exports = (req, res, next) => {
  var token = req.body.token || req.query.token || req.headers.authorization;
  if (!token) {
    return authFailed(res);
  }

  models.sequelize.transaction((t) => {
    return jwt.verifyAsync(token, process.env.API_AUTH_SECRET)
      .then((decoded) => {
        return models.Token
          .findOne({
            where: {
              tokenId: decoded.tokenId
            },
            include: [{
              model: models.Key
            }],
            logging: false,
            transaction: t
          });
      })
      .then((token) => {
        if (!token) {
          throw new Error('Invalid token');
        }

        let content = req.headers['user-agent'] + '&&' + req.ip;
        if (!bcrypt.compareSync(content, token.identitySignature)) {
          throw new Error('Signature is mismatched');
        }

        if ((new Date()) - token.dateExpiry > 0) {
          throw new Error('Token has expired');
        }

        let reqMethod = req.method.toLowerCase();
        if (token.method.toLowerCase().split(/,/g).indexOf(reqMethod) === -1) {
          throw new Error('Method not allowed');
        }

        req.token = token;
        req.key = token.Key;
        next();

        // token access attempted, destroy token immediately
        return token.destroy({ transaction: t });
      })
      .catch((err) => {
        return authFailed(res);
      });
  });
};
