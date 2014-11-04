var
  gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  stripDebug = require('gulp-strip-debug'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  sass = require('gulp-ruby-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  minifyCSS = require('gulp-minify-css'),
  ghPages = require('gulp-gh-pages'),
  streamify = require('gulp-streamify'),
  source = require('vinyl-source-stream'),
  browserify = require('browserify');

var paths = {
  entry: './scripts/main.js',
  scripts: './scripts/**/*.js',
  stylesheets: './stylesheets/*.sass',
  static: './static/*'
};

gulp.task('lint', function () {
  return gulp.src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('scripts', ['lint'], function () {
  return browserify(paths.entry)
    .bundle()
    .pipe(source('all.js'))
    .pipe(streamify(stripDebug()))
    .pipe(gulp.dest('dist'))
    .pipe(rename('all.min.js'))
    .pipe(streamify(uglify( { outSourceMap: true } )))
    .pipe(gulp.dest('dist'));
});

gulp.task('sass', function () {
  return gulp.src(paths.stylesheets)
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(minifyCSS())
    .pipe(gulp.dest('dist'))
});

gulp.task('static', function () {
  return gulp.src(paths.static)
    .pipe(gulp.dest('dist'))
});

gulp.task('watch', function() {
  gulp.watch(paths.scripts, ['lint', 'scripts']);
  gulp.watch(paths.stylesheets, ['sass']);
});

gulp.task('gh-pages', function () {
  gulp.src('dist/**/*')
    .pipe(ghPages('https://github.com/rileyjshaw/tic-attack-toe.git', 'origin'));
});

gulp.task('default', ['lint', 'scripts', 'sass', 'static', 'watch']);
gulp.task('deploy', ['lint', 'scripts', 'sass', 'static', 'gh-pages']);
