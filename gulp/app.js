var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern : ['gulp-*'],
  camelize: true
});

(() => {
  "use strict";

  /**
   * The start task will perform the default preparation of assets,
   * then launch nodemon for the server
   */
  gulp.task('nodemon', () => {
    return $.nodemon({
      "script": 'bin/www',
      "ignore": [
        ".git"
      ],
      "delay": 3000,
      "env": { 'NODE_ENV': 'development' }
    });
  });
})();
