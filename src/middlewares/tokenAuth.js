const Promise = require('bluebird');
const jwt = Promise.promisifyAll(require('jsonwebtoken'));
const models = require('filedepot-models');
const authFailed = require('../libraries/auth-failed-res');
const sha256 = require('../libraries/sha256');

/*
  This middleware checks for authorization by access token and deletes the token
  before forwarding the request to the route.
 */
module.exports = (req, res, next) => {
  var token = req.body.token || req.query.token || req.headers.authorization;
  if (!token) {
    return authFailed(res);
  }

  return models.sequelize.transaction((transaction) => {
    return jwt.verifyAsync(token, process.env.API_AUTH_SECRET)
      .then((decoded) => {
        return models.Token
          .findOne({
            where: {
              tokenId: decoded.tokenId
            },
            include: [
              {
                model: models.Key
              }
            ],
            logging: false,
            transaction: transaction
          });
      })
      .then((accessToken) => {
        if (!accessToken) {
          throw new Error('Invalid access token');
        }

        let content = process.env.API_AUTH_SECRET + '&&' + req.headers['user-agent'] + '&&' + req.ip;
        if (sha256(content) !== accessToken.identitySignature) {
          throw new Error('Signature is mismatched');
        }

        if (new Date() - accessToken.dateExpiry > 0) {
          throw new Error('Token has expired');
        }

        let reqMethod = req.method.toLowerCase();
        let methodsArray = accessToken.method.toLowerCase().split(/,/g);
        if (methodsArray.indexOf(reqMethod) === -1) {
          throw new Error('Method not allowed');
        }

        req.token = accessToken;
        req.key = accessToken.Key;
        next();

        // token access attempted, destroy token immediately
        return accessToken.destroy({ transaction: transaction });
      })
      .catch(() => {
        return authFailed(res);
      });
  });
};
