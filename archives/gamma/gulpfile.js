var	gulp           = require('gulp'),
		gutil          = require('gulp-util'),
		sass           = require('gulp-sass'),
		browserSync    = require('browser-sync'),
		concat         = require('gulp-concat'),
		uglify         = require('gulp-uglify'),
		htmlmin        = require('gulp-htmlmin'),
		cssbeautify    = require('gulp-cssbeautify'),
		cleanCSS       = require('gulp-clean-css'),
		rename         = require('gulp-rename'),
		del            = require('del'),
		imagemin       = require('gulp-imagemin'),
		cache          = require('gulp-cache'),
		autoprefixer   = require('gulp-autoprefixer'),
		ftp            = require('vinyl-ftp'),
		notify         = require('gulp-notify'),
		htmlreplace    = require('gulp-html-replace');


gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app'
		},
		ghostMode: {
          scroll: true
        },
		notify: false,
		open: false,
		scroll: true,
		tunnel: true,
	});
});

//sass
gulp.task('sass', function() {
	return gulp.src('app/sass/**/*.sass')
	.pipe(sass({outputStyle: 'expand'}).on("error", notify.onError()))
	.pipe(autoprefixer(['last 15 versions']))
	.pipe(cssbeautify({
		indent: '	',
		autosemicolon: true
	}))
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({stream: true}));
});

// Watch
gulp.task('watch', ['sass', 'browser-sync'], function() {
	gulp.watch('app/sass/**/*.sass', ['sass']);
	// gulp.watch('app/js/**/*.js', ['js']);
	gulp.watch(['app/*.html' , 'app/js/**/*.js'], browserSync.reload);
	// gulp.watch('app/*.html', browserSync.reload);
});

// Buid
gulp.task('imagemin', function() {
	return gulp.src('app/img/**/*')
	.pipe(cache(imagemin()))
	.pipe(gulp.dest('dist/img'));
});

gulp.task('replace', function() {
	gulp.src('app/index.html')
		.pipe(htmlreplace({
			'css': 'css/main.min.css',
			'js': 'js/scripts.min.js'
		}))
	.pipe(gulp.dest('dist/'));
});

gulp.task('build', ['removedist', 'clearcache'], function() {
	// css
	var buildCss = gulp.src([
		'app/css/libs/bootstrap.min.css',
		'app/css/libs/font-awesome.min.css',

		'app/css/libs/animate.min.css',
		'app/css/libs/slick.css',
		'app/css/libs/magnific-popup.css',

		'app/css/fonts.css',
		'app/css/main.css',
		'app/css/media.css',
		])
		.pipe(concat('main.min.css'))
		.pipe(cleanCSS())
		.pipe(gulp.dest('dist/css'));

	// js
	var buildJs = gulp.src([
		'app/js/libs/jquery.min.js',
		'app/js/libs/bootstrap.min.js',

		'app/js/libs/waypoints.min.js',
		'app/js/libs/fancybox.min.js',
		'app/js/libs/magnific-popup.min.js',
		'app/js/libs/slick.min.js',

		'app/js/common.js',
		])
		.pipe(concat('scripts.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'));

	// fonts
	var buildFonts = gulp.src([
		'app/fonts/**/*'
		])
		.pipe(gulp.dest('dist/fonts'));

	// images
	var buildImages = gulp.src([
		'app/img/**/*'
		])
		.pipe(cache(imagemin()))
		.pipe(gulp.dest('dist/img'));

	// Html
	var buildHtml = gulp.src([
		'app/index.html',
		])
		.pipe(htmlreplace({'css': 'css/main.min.css', 'js': 'js/scripts.min.js'}))
		.pipe(htmlmin({collapseWhitespace: true}))
		.pipe(gulp.dest('dist/'));

	// Html inner
	// var buildHtmlInner = gulp.src([
	// 	'app/pages/*.html',
	// 	])
	// 	.pipe(htmlreplace({'css': '../css/main.min.css', 'js': '../js/scripts.min.js'}))
	// 	.pipe(htmlmin({collapseWhitespace: true}))
	// 	.pipe(gulp.dest('dist/pages'));
});

// Deploy
gulp.task('deploy', function() {
	var conn = ftp.create({
		host:      '',
		user:      '',
		password:  '',
		parallel:  10,
		log: gutil.log
	});

	var globs = [
	'dist/**',
	'dist/.htaccess',
	];
	return gulp.src(globs, {buffer: false})
	.pipe(conn.dest(''));
});

gulp.task('removedist', function() { return del.sync('dist'); });
gulp.task('clearcache', function () { return cache.clearAll(); });

gulp.task('default', ['watch']);
