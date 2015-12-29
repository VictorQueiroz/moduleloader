var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var wrapper = require('gulp-wrapper');

gulp.task('build', function() {
	gulp.src(['src/*.js'])
	.pipe(concat('moduleloader.js'))
	.pipe(wrapper({
		header: '(function(global) {',
		footer: '\
							var pending = {}, cache = {};\
							global.moduleloader = new ModuleLoader(new injector.Injector(pending, cache));\
							global.moduleloader.ModuleLoader = ModuleLoader;\
						}(window));'
	}))
	.pipe(uglify())
	.pipe(gulp.dest('build'));
});
