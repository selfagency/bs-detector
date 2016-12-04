/**
 * Build/output browser extensions from a shared library.
 * To build the default, simple run ```gulp build``` or ```gulp```.
 * TODO: We can probably browserify and do some linting here
 */

'use strict';

var gulp = require('gulp');

/**
 * @task {shared} - Copy the files from the _shared folder to destination builds
 */
gulp.task('shared', function() {
  gulp.src(['./_shared/**/*'])
    .pipe(gulp.dest('./build/chrome'))
    .pipe(gulp.dest('./build/firefox'));
});

/**
 * @task {chrome} - Some files for the chrome extension are unique, so we need to copy them separately
 */
gulp.task('chrome', function() {
  gulp.src(['./chrome/**/*'])
    .pipe(gulp.dest('./build/chrome'));
});

/**
 * @task {firefox} - Some files for the firefox extension are unique, so we need to copy them separately
 */
gulp.task('firefox', function() {
  gulp.src(['./firefox/**/*'])
    .pipe(gulp.dest('./build/firefox'));
});


gulp.task('watch', function () {
  gulp.watch(['./_shared/**/*', './chrome/**/*', './firefox/**/*'], ['build']);
});

gulp.task('build', ['shared', 'chrome', 'firefox']);
gulp.task('default', ['build']);
