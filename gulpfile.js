var gulp = require('gulp')
var eslint = require('gulp-eslint')
var mocha = require('gulp-mocha')

gulp.task('lint', function () {
	return gulp.src(['gulpfile.js', 'paperpress.js', 'test/test.js'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failOnError())
})

gulp.task('test', function () {
	return gulp.src('test/test.js')
		.pipe(mocha())
})

gulp.task('watch-lint', function () {
	gulp.watch(['gulpfile.js', 'paperpress.js', 'test/test.js'], ['lint'])
})

gulp.task('watch', function () {
	gulp.watch(['gulpfile.js', 'paperpress.js', 'test/test.js'], ['lint', 'test'])
})
