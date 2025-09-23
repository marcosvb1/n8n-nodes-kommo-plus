const { src, dest, series } = require('gulp');
const del = require('del');

function clean() {
	return del(['dist']);
}

function copyAssets() {
	// Copia os assets das credenciais (arquivos não-TS)
	src('credentials/**/!(*.ts)').pipe(dest('dist/credentials'));
	// Copia os assets do nó (arquivos não-TS)
	return src('nodes/**/!(*.ts)').pipe(dest('dist/nodes'));
}

exports.build = copyAssets;
exports.default = series(clean, copyAssets);
