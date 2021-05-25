const {
  src,
  dest,
  parallel,
  series,
  watch
} = require('gulp');
// clean
const del = require('del');
// less
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const gcmq = require('gulp-group-css-media-queries');
// js
const babel = require('gulp-babel');
const webpackStream = require('webpack-stream');
const minify = require('gulp-minify');
const concat = require('gulp-concat');
// browserSync
const browserSync = require('browser-sync').create();
// error
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');

/**
 * clean
 */
const clean = () => {
  return del('build');
}
exports.clean = clean;

/**
 * copy
 */
const copy = () => {
  return src([
      'src/img/*.+(png|jpg|svg|webp|ico|gif|JPG)*',
      'src/favicon.ico'
    ], {
      base: 'src'
    })
    .pipe(dest('build'));
}
exports.copy = copy;

/**
 * less
 */
const lessToCss = () => {
  return src('src/less/style.less')
    .pipe(plumber({
      errorHandler: notify.onError(function (err) {
        return {
          title: 'Less',
          message: err.message
        }
      })
    }))
    .pipe(less())
    .pipe(autoprefixer({
      grid: true,
      overrideBrowserslist: ['last 10 versions']
    }))
    .pipe(gcmq())
    .pipe(csso())
    .pipe(dest('build/css'))
    .pipe(browserSync.stream());
}
exports.lessToCss = lessToCss;

/**
 * html
 */
const htmlTo = () => {
  return src('src/*.html')
    .pipe(dest('build'))
    .pipe(browserSync.stream());
}
exports.htmlTo = htmlTo;

/**
 * scripts
 */
// const scripts = () => {
//   return src('./src/js/main.js')
//     .pipe(plumber({
//       errorHandler: notify.onError(function (err) {
//         return {
//           title: 'js',
//           message: err.message
//         }
//       })
//     }))
//     .pipe(webpackStream({
//       output: {
//         filename: 'main.js',
//       },
//       module: {
//         rules: [{
//           test: /\.m?js$/,
//           exclude: /(node_modules|bower_components)/,
//           use: {
//             loader: 'babel-loader',
//             options: {
//               presets: ['@babel/preset-env']
//             }
//           }
//         }]
//       }
//     }))
//     .pipe(dest('build/js'))
//     .pipe(browserSync.stream());
// }
// exports.scripts = scripts;

const scripts = () => {
  return src('src/js/*.js')
    .pipe(plumber({
      errorHandler: notify.onError(function (err) {
        return {
          title: 'js',
          message: err.message
        }
      })
    }))
    .pipe(concat('main.js', {
      newLine: ';'
    }))
    .pipe(babel({
      presets: ['@babel/preset-env']
    }))
    .pipe(minify({
      ext: {
        src: '.js',
        min: '.min.js'
      },
      exclude: ['tasks']
    }))
    .pipe(dest('build/js'))
    .pipe(browserSync.stream());
}
exports.scripts = scripts;

/**
 * browserSync
 */
const server = () => {
  browserSync.init({
    server: {
      baseDir: './build/'
    }
  });

  watch('src/less/**/*.less', lessToCss);
  watch('src/*.html', htmlTo);
  watch(['src/fonts/*.{woff, woff2, ttf}*', 'src/img/*.+(png|jpg|svg|webp|ico|gif|JPG)*', ], copy);
  watch('src/js/**/*.js', scripts);
}
exports.server = server;

/**
 * default
 */
exports.default = series(clean, parallel(copy, lessToCss, scripts, htmlTo), server);
