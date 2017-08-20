module.exports = (res) => {
  return res
    .status(403)
    .json({
      "status": "error",
      "msg": "Authentication Failed"
    });
};
