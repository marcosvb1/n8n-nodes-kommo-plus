const { src, dest, series } = require('gulp');
const del = require('del'); // Adicionar import do 'del'

function clean() {
	return del(['dist']); // Limpa a pasta dist
}

function copyFiles() {
	// Copia arquivos de credenciais para dist/credentials
	src('credentials/**/*').pipe(dest('dist/credentials/'));
	// Copia arquivos do nó (exceto .ts) para dist/Kommo
	return src(['nodes/**/*', '!**/*.ts']).pipe(dest('dist/Kommo/'));
}

exports.build = series(clean, copyFiles); // Executa clean antes de copyFiles
