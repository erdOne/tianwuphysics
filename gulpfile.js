const gulp = require('gulp');
const gutil = require('gutil');
const gulpif = require('gulp-if');
const gulpeach = require('gulp-each');
const debug = require('gulp-debug');
const clean = require('gulp-clean');
const cache = require('gulp-cached');
const concat = require('gulp-concat');
//var rename = require('gulp-rename');

const sass = require('gulp-sass');
sass.compiler = require('node-sass');

const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const webpack = require('webpack')
const gwebpack = x => require('webpack-stream')(x, webpack);
const cleanCSS = require('gulp-clean-css');
const ftp = require('vinyl-ftp');
const gexec = require('gulp-exec');
const gssh = require('gulp-ssh');
const del = require('del');
const fs = require('fs');
const path = require('path');
var {
    exec,
    spawn
} = require("child_process");
const config = require("./config.js");

const paths = {
    styles: {
        src: 'src/styles/*.*',
        dest: 'htdocs/assets/sass/'
    },
    scripts: {
        src: 'src/scripts/**/*',
        dest: 'htdocs/assets/react/'
    },
    files: ["index.js", "htdocs/**/*", 'src/**/*', "node/*"],
    destfiles: ["index.js", "htdocs/**/*", "node/*"]
};

/* Not all tasks need to use streams, a gulpfile is just another node program
 * and you can use all packages available on npm, but it must return either a
 * Promise, a Stream or take a callback and call it
 */

function getFtpConnection() {
    return ftp.create({
        ...config.ftp
        log: gutil.log
    });
}

function getSshConnection() {
    return new gssh({
        ignoreErrors: false,
        sshConfig: {
            ...config.ssh
        }
    })
}

function remove() {
    // You can use multiple globbing patterns as you would with `gulp.src`,
    // for example if you are using del 2.0 or above, return its promise
    return del([paths.styles.dest, paths.scripts.dest]);
}

/*
 * Define our tasks using plain functions
 */
function styles() {
    console.log("styles");
    return gulp.src(paths.styles.src)
        .pipe(gulpif(/[.]scss$/, sass()))
        .pipe(cleanCSS())
        .pipe(gulp.dest(paths.styles.dest));
}

function scripts() {
    return gulp.src(paths.scripts.src, {
            sourcemaps: true
        })
        .pipe(gwebpack({
            module: {
                rules: [{
                    loader: 'babel-loader',
                    query: {
                        presets: [
                            //'@babel/preset-env',
                            ["@babel/preset-react", {
                                development: true
                            }]
                        ]
                    }
                }]
            },
            mode: "development",
            plugins: [
                new webpack.ProvidePlugin({
                    'React': 'react',
                    'ReactDOM': 'react-dom'
                })
            ],
            entry: ['./src/scripts/main.jsx'],
            output: {
                path: path.join(__dirname, 'htdocs/assets/react'),
                filename: 'main.js'
            },
            optimization: {
                minimize: false
            }
        }))
        // .pipe(babel({
        //     presets: ["@babel/preset-env"],
        //     plugins: ['transform-react-jsx']
        // }))
        //.pipe(uglify())
        .pipe(gulp.dest(paths.scripts.dest));
}

function setIntervalAndExecute(fn, t) {
    fn();
    return (setInterval(fn, t));
}

var upload = (path = paths.files) => function() {
    var conn = getFtpConnection();
    var remoteLocation = "Desktop/tianwu/"

    return gulp.src(path, {
            base: '.',
            buffer: false
        })
        .pipe(cache('upload'))
        .pipe(gulpeach(function(content, file, cb) {

            var proc = {
                kill: e => e
            };
            var limit = 30;
            var intervalID = setIntervalAndExecute(() => {
                if(limit-- < 0){
                    clearInterval(intervalID);
                    console.error(`Error: Uploading ${file.relative}`);
                }
                proc.kill('SIGINT');
                proc = spawn("./sync.sh", [file.relative])
                proc.on("exit", c => c || console.log("Uploaded: "+file.relative) || clearInterval(intervalID));
            }, 3000);
            cb(null,content);
        })).pipe(cache('upload'))
    //.pipe(conn.newer(remoteLocation))
    //.pipe(conn.dest(remoteLocation));
    //.pipe(gulpif(/\./, gexec('echo "<%= file.relative %>" && ./sync.sh <%= file.relative %>')))
}



function restart() {
    return getSshConnection().shell(['pm2 start paulwu']);
}

function watch() {
    //paths.destfiles.map(watchUpload);

    gulp.watch(paths.files).on("change", path => {
        (function() {
            console.log("path", path);
            if (path.indexOf("node") != -1)
                return gulp.series(upload(path),restart);
            if (path.indexOf("scripts") != -1)
                return gulp.series(scripts,upload(paths.scripts.dest));
            if (path.indexOf("styles") != -1)
                return gulp.series(styles,upload(paths.styles.dest));
            return upload(path);
        })()(path);
    });
}

function watchUpload(path) {
    exec(`watchman-wait -m 0 . -p '${path}'`, {
        encoding: "utf-8"
    }).stdout.on("data", file => {
        if (file == "logs.txt") return;
        if (path.indexOf("node") != -1)
            restart();
        console.log(file.replace("\n", ""))
        var s = spawn("./sync.sh", [file.replace("\n", "")]);
        //s.stdout.pipe(process.stdout);
        s.stderr.pipe(process.stderr);
    })
}

/*
 * Specify if tasks run in series or parallel using `gulp.series` and `gulp.parallel`
 */
var build = gulp.series(remove, gulp.parallel(styles, scripts), upload(), restart);
/*
 * You can use CommonJS `exports` module notation to declare tasks
 */
exports.remove = remove;
exports.styles = styles;
exports.scripts = scripts;
exports.upload = upload();
exports.restart = restart;
exports.watch = watch;
exports.build = build;
/*
 * Define default task that can be called by just running `gulp` from cli
 */
exports.default = build;
