// Include gulp
var gulp = require('gulp'),
    p = require('./package.json');

// Include Our Plugins
var jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifyCss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    header = require('gulp-header'),
    livereload = require('gulp-livereload'),

    //file watch paths
    paths = {
        css: {
            home: 'css/',
            src: 'css/**/',
            dest: 'dist/'
        },
        js: {
            home: 'js/',
            src: 'js/**/',
            dest: 'dist/'
        }
    },

    date = new Date(),
    datetime = date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear() +
    " @ " + date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "") + date.getMinutes() +
    ":" + (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();


// Lint Task
gulp.task('jshint', function() {
    return gulp.src(paths.js.home + "*.js")
        .pipe(jshint());
});

// Compile Our Sass
gulp.task('sass', function() {

    return gulp.src(paths.css.home + "*.scss")
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(autoprefixer({
            browsers: ['> 0.75%', 'not IE 7', 'not IE 8', 'not IE 9' /*, 'not OperaMobile'*/ ]
        }))
        .pipe(gulp.dest(paths.css.home));
});

// Minify JS
gulp.task('buildJS', ['jshint'], function() {

    return gulp.src(paths.js.home + "ripple.js")
        .pipe(uglify({
            preserveComments: "some"
        }))
        .pipe(rename('ripple.min.js'))
        .pipe(header(
            '/*' + "\n" +
            p.name + " " + p.version + /*" by " + p.author +*/ " (" + p.license + " license)" +
            "\n" +
            "ripple.min.js, compiled: " + datetime + "\n" +
            '*/\n'
        ))
        .pipe(gulp.dest(paths.js.dest));
});

// Minify CSS
gulp.task('buildCSS', ['sass'], function() {

    return gulp.src(paths.css.home + "ripple.css")
        .pipe(minifyCss())
        .pipe(rename('ripple.min.css'))
        .pipe(header(
            '/*' + "\n" +
            p.name + " v" + p.version + /*" by " + p.author +*/ " (" + p.license + " license)" +
            "\n" +
            "ripple.min.css, compiled: " + datetime + "\n" +
            '*/\n'
        ))
        .pipe(gulp.dest(paths.css.dest))
});

// Watch Files For Changes
gulp.task('watch', function() {
    livereload.listen();

    gulp.watch("**/*.html").on("change", function(e) {
        livereload.changed(e.path);
    });
    gulp.watch(paths.js.src + "*.js", ['jshint']).on("change", function(e) {
        livereload.changed(e.path);
    });
    gulp.watch(paths.css.src + "*.scss", ['sass']);
    gulp.watch(paths.css.src + "*.css").on("change", function(e) {
        livereload.changed(e.path);
    });

});


gulp.task('default', ['watch']);
gulp.task('build', ['buildCSS', 'buildJS']);