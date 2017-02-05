'use strict';

// Подключение плагинов через переменные:
var gulp = require('gulp'), // Gulp
    debug = require('gulp-debug'), // Отслеживание тасков в терминале
    inlineCss = require('gulp-inline-css'), // Создание инлайн-стилей
    notify = require("gulp-notify"), // Вывод надписей при ошибках
    plumber = require('gulp-plumber'), // Обработка ошибок
    pug = require('gulp-pug'), // Pug
    sass = require('gulp-sass'), // Sass
    del = require('del'); // Удаление, очистка папок

// Задание путей к используемым файлам и папкам:
var srcPug = './src/pug/email.pug', // Источник для таска pug
    srcStyles = './src/sass/styles/inline.scss', // Источник для таска styles
    destPug = './src', // Папка сохранения результатов работы таска pug
    destStyles = './src/css', // Папка сохранения результатов работы таска styles
    html = './src/email.html', // Файл email.html
    css = './src/css/inline.css', // Файл inline.css
    watchPug = './src/pug/**/*.pug', // Переменная для отслеживания (вотчера) всех Pug-файлов
    watchSass = './src/sass/**/*.scss', // Переменная для отслеживания (вотчера) всех Sass-файлов
    watchDist = [html, css], // Переменная для изменения шаблона письма в distribution-папке dist
    dist = './dist'; // distribution-папка dist

// Подключение Browsersync:
var browserSync = require('browser-sync').create(),
    reload = browserSync.reload;

// Таск предварительной очистки (удаления) distribution-папки dist:
gulp.task('clean', ['build'], function () { // Перед запуском таска clean выполняется таск build (см. ниже)
    return del(dist);
});

// Таск для работы Browsersync:
gulp.task('serve', ['clean'], function() {
    browserSync.init({
        server: { // Настройки сервера
            baseDir: './src', // Базовая директория
            index: 'email.html' // Индексный файл
        },
        browser: 'opera' // Назначение браузера
    });
    gulp.watch(watchPug, ['pug']); // Отслеживание изменений Pug-файлов
    gulp.watch(watchSass, ['styles']); // Отслеживание изменений Sass-файлов
    gulp.watch(watchDist, ['inline']); // Изменение шаблона письма в distribution-папке dist
    gulp.watch(html).on('change', reload); // Обновление браузера в случае изменения индексного файла email.html в development-папке src
});

// Таск для работы Pug:
gulp.task('pug', function () {
    return gulp.src(srcPug) // Источник Pug (файл src/pug/email.pug)
        .pipe(plumber()) // Обработка ошибок Pug
        .pipe(debug({title: 'Pug source'})) // Отслеживание источника Pug
        .pipe(pug({ // Преобразование Pug в HTML
            pretty: true, // Форматирование разметки в HTML-файле
            doctype: 'HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd"' // Установка doctype
        }))
        .pipe(debug({title: 'Pug'})) // Отслеживание работы Pug
        .pipe(gulp.dest(destPug)) // Сохранение HTML-шаблона письма в папке src
        .pipe(debug({title: 'Pug dest'})) // Отслеживание сохранения HTML-шаблона
        .pipe(browserSync.stream()); // Browsersync
});

// Таск для работы Styles:
gulp.task('styles', function () {
    return gulp.src(srcStyles) // Источник Sass (файл src/sass/styles/inline.scss)
        .pipe(plumber()) // Обработка ошибок Sass
        .pipe(debug({title: 'Sass source'})) // Отслеживание источника Sass
        .pipe(sass()) // Преобразование Sass в CSS
        .pipe(debug({title: 'Sass'})) // Отслеживание работы Sass
        .pipe(gulp.dest(destStyles)) // Сохранение результатов в файл src/css/inline.css
        .pipe(debug({title: 'Sass dest'})) // Отслеживание сохранения
        .pipe(browserSync.stream()); // Browsersync
});

// Сборка pug и styles:
gulp.task('build', ['pug', 'styles']);

// Таск для формирования инлайн-стилей из внешнего файла inline.css:
gulp.task('inline', function() {
    return gulp.src(html) // Источник для формирования инлайн-файла (файл src/email.html)
        .pipe(debug({title: 'Inline CSS sourse'})) // Отслеживание источника
        .pipe(inlineCss({ // Преобразование стилей из внешнего файла inline.css в инлайн-стили
            preserveMediaQueries: true, // Сохранение медиа-запросов в тегах style HTML-шаблона
            applyTableAttributes: true // Преобразование табличных стилей в атрибуты
        }))
        .pipe(debug({title: 'Inline CSS'})) // Отслеживание преобразования
        .pipe(gulp.dest(dist)) // Сохранение результата в distribution-папку dist
        .pipe(debug({title: 'Inline CSS dest'})); // Отслеживание сохранения
});

// Запуск Gulp:
gulp.task('default', ['serve']);