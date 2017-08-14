const gulp = require('gulp');

/**
 * Main gulp script to perform requires and starting the build process
 * @exports null
 */

(() => {
  'use strict';

  // load all the scripts in the gulp folder
  // essentially declariing all the tasks available
  require('require-dir')('./gulp/');

  console.log('Using env: ' + process.env.NODE_ENV);

  // by default, we just clean and build the app
  gulp.task('default', () => {
    if (process.env.NODE_ENV === 'development') {
      return gulp.start('nodemon');
    }
  });
})();
