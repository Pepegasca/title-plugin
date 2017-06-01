var gulp = require("gulp"),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    uglify = require('gulp-uglify'),
    babel = require("gulp-babel"),
    rename = require('gulp-rename');

var path = {
  mainJS: './src/app.js',
};

gulp.task('build', function () {
  var srcFile = path.mainJS;
  var br = browserify({
    entries: srcFile,
    debug: false,
  });
  br.bundle()
    .pipe(source(getFileNameFromPath(srcFile)))
    .pipe(buffer())
    .pipe(babel())
    .pipe(uglify())
    .pipe(rename({
      basename: 'title-plugin',
      extname: '.min.js',
    }))
    .pipe(gulp.dest('./dist/'));
});

var getFileNameFromPath = function(path) {
  var start = path.lastIndexOf('/') + 1;
  return path.substring(start);
};

gulp.task('watch', function() {
  gulp.watch('src/**/*', ['default']);
});

gulp.task('default', ['build']);
