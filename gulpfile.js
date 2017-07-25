'use strict';

// Подключение плагинов через переменные:
var gulp = require('gulp'), // Gulp
    debug = require('gulp-debug'), // Отслеживание тасков в терминале
    del = require('del'), // Удаление папок и файлов
    inlineCss = require('gulp-inline-css'), // Создание инлайн-стилей
    notify = require("gulp-notify"), // Вывод надписей при ошибках
    plumber = require('gulp-plumber'), // Обработка ошибок
    pug = require('gulp-pug'), // Pug
    sass = require('gulp-sass'); // Sass

// Задание путей к используемым файлам и папкам:
var devDir = './src', // development-папка
    htmlFile = devDir + '/email.html', // Файл email.html
    pugDir = devDir + '/pug/**/*.pug', // Все Pug-файлы в папке pug
    pugFile = devDir + '/pug/email.pug', // Исходник для таска pug, файл email.pug
    sassDir = devDir + '/sass/**/*.sass', // Все Sass-файлы в папке sass
    sassFile = devDir + '/sass/styles/inline.scss', // Исходник для таска styles
    cssDir = devDir + '/css', // Папка сохранения результатов работы таска styles
    cssFile = devDir + '/css/inline.css', // Файл inline.css
    distDir = './dist'; // distribution-папка

// Подключение Browsersync:
var browserSync = require('browser-sync').create(),
    reload = browserSync.reload;

// Таск для работы Browsersync:
gulp.task('serve', ['build'], function() {
    browserSync.init({
        server: { // Настройки сервера
            baseDir: devDir, // Базовая директория
            index: 'email.html' // Индексный файл
        },
        notify: false,
        browser: 'safari' // Назначение браузера
    });
    gulp.watch(pugDir, ['pug']); // Отслеживание изменений Pug-файлов
    gulp.watch(sassDir, ['styles']); // Отслеживание изменений Sass-файлов
    gulp.watch([htmlFile, cssFile], ['inline']); // Изменение шаблона письма в distribution-папке dist
    gulp.watch(htmlFile).on('change', reload); // Обновление браузера в случае изменения индексного файла email.html в development-папке src
});

// Таск для работы Pug:
gulp.task('pug', function () {
    return gulp.src(pugFile) // Исходник таска pug (файл src/pug/email.pug)
        .pipe(plumber()) // Обработка ошибок таска pug
        .pipe(debug({title: 'Pug source'})) // Отслеживание исходника таска pug
        .pipe(pug({ // Преобразование Pug в HTML
            pretty: true, // Форматирование разметки в HTML-файле
            doctype: 'HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"' // Установка doctype
        }))
        .pipe(debug({title: 'Pug'})) // Отслеживание работы таска pug
        .pipe(gulp.dest(devDir)) // Сохранение HTML-шаблона письма в папке src
        .pipe(debug({title: 'Pug dest'})) // Отслеживание сохранения HTML-шаблона
        .pipe(browserSync.stream()); // Browsersync
});

// Таск для работы Styles:
gulp.task('styles', function () {
    return gulp.src(sassFile) // Исходник таска styles (файл src/sass/styles/inline.scss)
        .pipe(plumber()) // Обработка ошибок таска styles
        .pipe(debug({title: 'Sass source'})) // Отслеживание исходника styles
        .pipe(sass()) // Преобразование Sass в CSS
        .pipe(debug({title: 'Sass'})) // Отслеживание работы таска styles
        .pipe(gulp.dest(cssDir)) // Сохранение результатов в файл src/css/inline.css
        .pipe(debug({title: 'Sass dest'})) // Отслеживание сохранения
        .pipe(browserSync.stream()); // Browsersync
});

// Сборка pug и styles:
gulp.task('build', ['pug', 'styles']);

// Таск для предварительной очистки (удаления) distribution-папки:
gulp.task('clean', function () {
    return del(distDir);
});

// Таск для формирования инлайн-стилей из внешнего файла inline.css:
gulp.task('inline', ['clean'], function() {
    return gulp.src(htmlFile) // Исходник для таска inline (файл src/email.html)
        .pipe(debug({title: 'Inline CSS sourse'})) // Отслеживание исходника таска inline
        .pipe(inlineCss({ // Преобразование стилей из внешнего файла inline.css в инлайн-стили
            preserveMediaQueries: true, // Сохранение медиа-запросов в тегах style HTML-шаблона
            applyTableAttributes: true // Преобразование табличных стилей в атрибуты
        }))
        .pipe(debug({title: 'Inline CSS'})) // Отслеживание преобразования
        .pipe(gulp.dest(distDir)) // Сохранение результата в distribution-папку dist
        .pipe(debug({title: 'Inline CSS dest'})); // Отслеживание сохранения
});

// Запуск Gulp:
gulp.task('default', ['serve']);