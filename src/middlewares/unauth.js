const Promise = require('bluebird');

module.exports = (req, res, next) => {
  var token = req.body.token || req.query.token || req.headers['authorization'];
  if (token) {
    return next('route');
  }
  next();
};
