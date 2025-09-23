const { src, dest, series } = require('gulp');

function copyFiles() {
	return src(['credentials/**/*', 'nodes/**/*', '!**/*.ts']).pipe(dest('dist/'));
}

exports.build = series(copyFiles);
