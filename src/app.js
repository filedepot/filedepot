const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
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
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
      }
      return next();
    });
  }
}

if (process.env.USING_PROXY) {
  app.set('trust proxy', true);
}

if (!process.env.LOG_SILENT) {
  app.use(logger(process.env.LOG_FORMAT || (process.env.NODE_ENV === 'production' ? 'combined' : 'dev')));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

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
  app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: {}
  });
});

module.exports = app;
