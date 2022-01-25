const { src, dest, watch, parallel, series } = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');

function browsersync() { // для обновления в браузере
  browserSync.init({
    server: {
      baseDir: 'app/'
    }
  });
}

function cleanDist() { // для удаления dist
  return del('dist')
}

function images() { // для сжатия картинок
  return src('app/images/**/*.jpg')
    .pipe(imagemin([
      imagemin.gifsicle({ interlaced: true }),
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
      imagemin.svgo({
        plugins: [
          { removeViewBox: true },
          { cleanupIDs: false }
        ]
      })
    ]
    ))
    .pipe(dest('dist/images'))
}

function scripts() { //  для минификации скриптов
  return src([
    'app/js/main.js',
  ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream())
}

function styles() { // стили
  return src('app/scss/style.scss') // исходный цксс
    .pipe(scss({ outputStyle: 'compressed' })) // для минифицирования /expanded
    .pipe(concat('style.min.css')) // переименовываем
    .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 version'],
      grid: true
    })) // для кроссбраузерности
    .pipe(dest('app/css')) // итоговый ксс
    .pipe(browserSync.stream()) // обновление браузера хтмл
}

function build() { // билд
  return src([
    'app/css/style.min.css',
    'app/fonts/**/*',
    'app/js/main.min.js',
    'app/*.html'
  ], { base: 'app' }) // директория
    .pipe(dest('dist'))
}

function watching() {
  watch(['app/scss/**/*.scss'], styles) // автоматически переводит ксс в сцсс, следит за стилями
  watch(['app/js/main.js', '!app/js/main.min.js'], scripts) // минифицирует скрипты, следит за скриптами, кроме второго
  watch(['app/*.html']).on('change', browserSync.reload) // следит за обновлением html в браузере
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build)  
exports.default = parallel(scripts, browsersync, watching); // для паралелльной работы плагинов
