const jshint = require('gulp-jshint');
const gulp   = require('gulp');

gulp.task('lint', function() {
  return gulp.src([
      './src/**/*.js',
      './test/**/*.js'
    ])
    .pipe(jshint({
      esversion: 6,
      mocha: true,
      node: true
    }))
    .pipe(jshint.reporter('default'));
});
