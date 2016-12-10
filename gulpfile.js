'use strict';

var gulp = require('gulp');
var del = require('del');
var jsonMinify = require('gulp-json-minify');
var minify = require('gulp-minify');
var cleanCSS = require('gulp-clean-css');
var pump = require('pump');

gulp.task('blank', function() {
  return del(['./build']);
})

gulp.task('ext', ['blank'], function() {
  gulp.src(['./ext/**/*'])
    .pipe(gulp.dest('./build'));
});

gulp.task('minify_json', ['ext'], function() {
  gulp.src(['./build/**/*.json'])
    .pipe(jsonMinify())
    .pipe(gulp.dest('./build'))
});

gulp.task('minify_js', ['ext'], function() {
  gulp.src(['./build/**/*.js'])
    .pipe(minify({
      ext: {
        src:'.js',
        min:'.js'
      },
      ignoreFiles: ['.min.js']
    }))
    .pipe(gulp.dest('./build'))
})

gulp.task('minify_css', ['ext'], function() {
  gulp.src(['./build/**/*.css'])
    .pipe(cleanCSS())
    .pipe(gulp.dest('./build'))
})

gulp.task('watch', function () {
  gulp.watch(['./ext/**/*'], ['build']);
});

gulp.task('minifier', ['minify_json', 'minify_css']);
gulp.task('build', ['minifier']);
gulp.task('default', ['build']);
