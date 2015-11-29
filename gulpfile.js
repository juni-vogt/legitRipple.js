// Include gulp
var gulp = require('gulp'),
    p = require('./package.json'),
    fs = require('fs');

// Include Our Plugins
var jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    babel = require('gulp-babel'),
    minifyCss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    header = require('gulp-header'),
    connect = require('gulp-connect'),
    markdown = require('gulp-markdown-it'),
    replace = require('gulp-replace'),
    toc = require('gulp-doctoc'),

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

    /*
    date = new Date(),
    datetime = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() +
    ' @ ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes() +
    ':' + (date.getSeconds() < 10 ? '0' : '') + date.getSeconds(),
    */
    headerText = function(filename) {
        return '/*! ' + p.name + ' v' + p.version + ': ' + filename +
            ' by ' + p.author + ' (' + p.license + ' license) */\n';
    };


// Lint Task
gulp.task('lint', function() {
    return gulp.src(paths.js.home + '*.js')
        .pipe(jshint());
});

// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src(paths.css.home + '*.scss')
        .pipe(sass({
            outputStyle: 'expanded'
        }))
        .pipe(autoprefixer({
            browsers: ['> 0.75%', 'not IE 7', 'not IE 8', 'not IE 9' /*, 'not OperaMobile'*/ ]
        }))
        .pipe(gulp.dest(paths.css.home));
});

// Inject readme and its toc into index.html
gulp.task('inject-markdown', ['markdown', 'toc'], function() {
    return gulp.src('index.html')
        // .pipe(inject(
        //     gulp.src(['demo-media/readme.html', 'demo-media/toc.html']), {
        //         transform: function(filePath, file) {
        //             return file.contents.toString('utf8')
        //         }
        //     }
        // ))
        .pipe(replace(/inject:toc -->[^]*?(?=<!-- endinject)/g,
            'inject:toc -->\n' + fs.readFileSync('demo-media/toc.html', 'utf8')))
        .pipe(replace(/inject:readme -->[^]*?(?=<!-- endinject)/g,
            'inject:readme -->\n' + fs.readFileSync('demo-media/readme.html', 'utf8')))
        .pipe(gulp.dest('.'));
});

//Compile readme to html
gulp.task('markdown', function() {
    return gulp.src(['./README.md'])
        .pipe(replace(/[^]*(?=## Usage)/gm, '')) //exclude unitl usage section
        .pipe(replace(/## Motivation[^]*/gm, '')) //exclude anything after "Motivation" section
        .pipe(markdown({
            options: {
                html: true
            }
        }))
        .pipe(replace(/<h(\d)>(.*)?(?=<\/h\d>)/gm, function(match, p1, p2) {
            // console.log(match,+"\n\n\n\n", p1,+"\n\n\n\n", p2);
            return '<h' + p1 + ' id="' + p2.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s/g, '-') + '">' + p2;
        })) //add IDs to headings
        .pipe(replace('<pre', '<pre class="rainbow"'))
        .pipe(replace('class="language-', 'data-language="')) //change code language markup
        .pipe(replace('</pre>', '</pre><br>')) //add linebreak after code snippets
        .pipe(rename('readme.html'))
        .pipe(gulp.dest('demo-media'));
});

//Get a toc of the readme
gulp.task('toc', function() {
    return gulp.src(['./README.md'])
        .pipe(replace(/^#(?=[^#]).*/gm, '')) //exclude h1
        .pipe(toc({
            title: ' ',
        }))
        .pipe(replace(/<!-- END[^]*/g, '')) //remove comments of toc plugin
        .pipe(replace(/<!-- .*/g, ''))
        .pipe(markdown())
        .pipe(rename('toc.html'))
        .pipe(gulp.dest('demo-media'));
});

// Minify JS
gulp.task('buildJS', ['lint'], function() {

    return gulp.src(paths.js.home + 'ripple.js')
        .pipe(babel())
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(rename('ripple.min.js'))
        .pipe(header(headerText('ripple.min.js')))
        .pipe(gulp.dest(paths.js.dest));
});

// Minify CSS
gulp.task('buildCSS', ['sass'], function() {

    return gulp.src(paths.css.home + 'ripple.css')
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

    gulp.watch('**/*.html').on('change', function() {
        gulp.src('**/*.html').pipe(connect.reload());
    });

    gulp.watch('README.md', ['inject-markdown']);

    gulp.watch(paths.js.src + '*.js', ['lint']).on('change', function() {
        gulp.src(paths.js.src + '*.js').pipe(connect.reload());
    });

    gulp.watch(paths.css.src + '*.scss', ['sass']);

    gulp.watch(paths.css.src + '*.css').on('change', function() {
        gulp.src(paths.css.src + '*.css').pipe(connect.reload());
    });


});


gulp.task('default', ['watch', 'connect']);
gulp.task('build', ['lint', 'buildCSS', 'buildJS', 'inject-markdown']);
