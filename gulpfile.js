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
    connect = require('gulp-connect'),

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
    ":" + (date.getSeconds() < 10 ? "0" : "") + date.getSeconds(),
    headerText = function(filename) {
        return '/*' + "\n" +
            p.name + " v" + p.version + /*" by " + p.author +*/ " (" + p.license + " license)" +
            "\n" +
            filename + ", compiled: " + datetime + "\n" +
            '*/\n';
    };


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
        .pipe(header(headerText('ripple.min.js')))
        .pipe(gulp.dest(paths.js.dest));
});

// Minify CSS
gulp.task('buildCSS', ['sass'], function() {

    return gulp.src(paths.css.home + "ripple.css")
        .pipe(minifyCss())
        .pipe(rename('ripple.min.css'))
        .pipe(header(headerText('ripple.min.css')))
        .pipe(gulp.dest(paths.css.dest));
});

//webserver
gulp.task('connect', function() {
    connect.server({
        port: 8000,
        livereload: true
    });
});

// Watch Files For Changes
gulp.task('watch', function() {

    gulp.watch("**/*.html").on("change", function() {
        gulp.src("**/*.html").pipe(connect.reload());
    });
    gulp.watch(paths.js.src + "*.js", ['jshint']).on("change", function() {
        gulp.src(paths.js.src + "*.js").pipe(connect.reload());
    });
    gulp.watch(paths.css.src + "*.scss", ['sass']);
    gulp.watch(paths.css.src + "*.css").on("change", function() {
        gulp.src(paths.css.src + "*.css").pipe(connect.reload());
    });

});


gulp.task('default', ['watch', 'connect']);
gulp.task('build', ['buildCSS', 'buildJS']);
