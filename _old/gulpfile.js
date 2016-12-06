'use strict';

var gulp = require('gulp');
var gulpCopy = require('gulp-copy');
var rename = require('gulp-rename');
var jsonMinify = require('gulp-json-minify');
var minify = require('gulp-minify');
var cleanCSS = require('gulp-clean-css');
var pump = require('pump');

gulp.task('shared', function() {
  gulp.src(['./_shared/**/*'])
    .pipe(gulp.dest('./build/chrome'))
    .pipe(gulp.dest('./build/firefox'))
    .pipe(gulp.dest('./build/merged'));
});

gulp.task('chrome', function() {
  gulp.src(['./chrome/**/*'])
    .pipe(gulp.dest('./build/chrome'));
});

gulp.task('firefox', function() {
  gulp.src(['./firefox/**/*'])
    .pipe(gulp.dest('./build/firefox'));
});

gulp.task('merged', function() {
  gulp.src(['./merged/**/*'])
    .pipe(gulp.dest('./build/merged'));
});

gulp.task('minify_json', function() {
  gulp.src(['./build/**/*.json'])
    .pipe(jsonMinify())
    .pipe(gulp.dest('./build'))
});

gulp.task('minify_js', function(cb) {
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

gulp.task('minify_css', function() {
  gulp.src(['./build/**/*.css'])
    .pipe(cleanCSS())
    .pipe(gulp.dest('./build'))
})

gulp.task('watch', function () {
  gulp.watch(['./_shared/**/*'], ['shared']);
  gulp.watch(['./chrome/**/*'], ['chrome']);
  gulp.watch(['./firefox/**/*'], ['firefox']);
  gulp.watch(['./merged/**/*'], ['merged']);
});

gulp.task('minifier', ['minify_json', 'minify_css']);
gulp.task('build', ['shared', 'chrome', 'firefox', 'merged', 'minifier']);
gulp.task('default', ['build']);
