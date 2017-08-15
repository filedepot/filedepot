const express = require('express');
const router = express.Router();
const Promise = require('bluebird');
const models = require('../models');
const jwt = Promise.promisifyAll(require('jsonwebtoken'));
const stringIdGenerator = require("../libraries/stringIdGenerator");
const moment = require("moment");
const bcrypt = require('bcryptjs');
const errorResponse = require('../libraries/error-res');
const NotFoundErrror = require('../libraries/notFoundError');
const hashFilename = require('../libraries/hashFilename');

module.exports = router;

router.post('/', require('../middlewares/keyAuth'), (req, res, next) => {
  let clientUserAgent = req.body.userAgent;
  let clientIpAddress = req.body.ipAddress;
  let requestMethod = req.body.method;
  let requestFilename = hashFilename(req.key.BucketBucketId, req.body.filename);

  var state = {};

  let createTokenPromise = (id, t) => {
    return models.Token
      .create(
        {
          tokenId: id,
          KeyKeyId: req.key.keyId,
          identitySignature: state.hash,
          dateExpiry: moment().add(+process.env.TOKEN_LIFE_MINUTES, 'minutes'),
          method: requestMethod,
          filename: requestFilename
        },
        {
          transaction: t,
          logging: null
        }
      );
  };

  let content = clientUserAgent + '&&' + clientIpAddress;
  let salt = bcrypt.genSaltSync(10);
  let hash = bcrypt.hashSync(content, salt);
  state.hash = hash;
  stringIdGenerator('Token', 'tokenId', createTokenPromise)
    .then((token) => {
      let jwtContent = jwt.sign(
        {
          tokenId: token.tokenId
        },
        process.env.API_AUTH_SECRET,
        {
          "expiresIn": '' + process.env.TOKEN_LIFE_MINUTES + 'm'
        }
      );
      return res
        .json({
          "status": "ok",
          "result": jwtContent
        });
    })
    .catch(errorResponse(res));
});
