var
  gulp = require('gulp'),
  jshint = require('gulp-jshint'),
  stripDebug = require('gulp-strip-debug'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
  sass = require('gulp-ruby-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  minifyCSS = require('gulp-minify-css');

var paths = {
  src: {
    plugins: 'bower_components/howler/howler.min.js',
    scripts: 'scripts/main.js',
    stylesheets: 'stylesheets/*.sass',
    static: 'static/*'
  }
};

gulp.task('lint', function() {
  return gulp.src(paths.src.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('scripts', function() {
  return gulp.src([paths.src.plugins, paths.src.scripts])
    .pipe(stripDebug())
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist'))
    .pipe(rename('all.min.js'))
    .pipe(uglify( { outSourceMap: true } ))
    .pipe(gulp.dest('dist'));
});

gulp.task('sass', function () {
  return gulp.src(paths.src.stylesheets)
    .pipe(sass())
    .pipe(autoprefixer())
    .pipe(minifyCSS())
    .pipe(gulp.dest('dist'))
});

gulp.task('static', function () {
  return gulp.src(paths.src.static)
    .pipe(gulp.dest('dist'))
});

gulp.task('watch', function() {
  gulp.watch(paths.src.scripts, ['lint', 'scripts']);
  gulp.watch(paths.src.stylesheets, ['sass']);
});

gulp.task('default', ['lint', 'scripts', 'sass', 'static', 'watch']);
