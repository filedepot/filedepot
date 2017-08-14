var NotFoundError = require('./notFoundError');

module.exports = (res) => {
  res
    .status(403)
    .json({ "status": "error", "msg": "Authentication Failed" });
};
