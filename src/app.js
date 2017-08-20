const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const router = require('./endpoints');

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.disable('x-powered-by');
  app.use(helmet());
  if (process.env.HTTPS_ENABLE_REDIRECT) {
    app.use((req, res, next) => {
      if (!req.secure) {
        let destinationArray = [
          'https://',
          req.get('Host'),
          req.url
        ];
        return res
          .redirect(destinationArray.join(''));
      }
      return next();
    });
  }
}

if (process.env.USING_PROXY) {
  app.set('trust proxy', true);
}

if (!process.env.LOG_SILENT) {
  let defaultLoggingFormat = process.env.NODE_ENV === 'production'
    ? 'combined'
    : 'dev';
  app.use(logger(process.env.LOG_FORMAT || defaultLoggingFormat));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

router(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line max-params
  app.use((err, req, res, next) => {
    return res
      .status(err.status || 500)
      .json({
        "msg": err.message,
        "status": "error",
        "err": err
      });
  });
}

// production error handler
// no stacktraces leaked to user
// eslint-disable-next-line max-params
app.use((err, req, res, next) => {
  return res
    .status(err.status || 500)
    .json({
      "msg": err.message,
      "status": "error"
    });
});

module.exports = app;
