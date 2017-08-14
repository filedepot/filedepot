const path = require("path");

module.exports = (app) => {
  let API_PREFIX = "/v1";

  if (!process.env.CORS_CLIENT_DOMAIN) {
    console.log('[WARN] The CORS_CLIENT_DOMAIN for Cross Origin Control is not set.')
  }

  app.use((req, res, next) => {
    res.header('Access-Control-Max-Age', '86400');
    res.header('Access-Control-Allow-Origin', process.env.CORS_CLIENT_DOMAIN || '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, Cache-Control, Pragma, Content-Type, Authorization');
    res.header('Content-Type', 'text/plain');
    if ('OPTIONS' === req.method) {
      return res.status(200).send();
    }
    next();
  });

  app.use((req, res, next) => {
    // overriding res.json so that we can send text/plain for cross origin requests
    res.json = (obj) => {
      res.set("Content-Type", "text/plain");
      return res.send(JSON.stringify(obj));
    };
    next();
  })

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
          "error": "The resource is not found."
        });
    }

    res
      .status(406)
      .send('Page not found');
  });
};
