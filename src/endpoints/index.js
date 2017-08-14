const path = require("path");

module.exports = (app) => {
  let API_PREFIX = "/v1";

  app.use((req, res, next) => {
    // overriding res.json so that we can send text/plain for cross origin requests
    res.json = (obj) => {
      res.set("Content-Type", "text/plain");
      return res.send(JSON.stringify(obj));
    };
    next();
  });

  let endpoints = [
    'buckets',
    'tokens'
  ];

  endpoints.forEach((endpoint) => {
    app.use(API_PREFIX + '/' + endpoint, require('./' + endpoint));
  });

  app.use((req, res, next) => {
    if(req.accepts('json')) {
      return res
        .status(404)
        .json({
          "msg": "The resource is not found.",
          "status": "error"
        });
    }

    res
      .status(406)
      .send('Page not found');
  });
};
