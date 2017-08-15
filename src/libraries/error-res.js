var NotFoundError = require('./notFoundError');

module.exports = (res) => {
  return (err) => {
    if (err instanceof NotFoundError) {
      return res
        .status(404)
        .json({
          "status": "error",
          "msg": err.message
        });
    }

    // default for all errors
    return res
      .status(400)
      .json({
        "status": "error",
        "msg": err.message
      });
  };
};
