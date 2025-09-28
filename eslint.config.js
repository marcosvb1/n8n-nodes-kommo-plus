const n8nPlugin = require('eslint-plugin-n8n-nodes-base');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
	{ ignores: ['dist/**', 'node_modules/**'] },
	{
		files: ['**/*.ts'],
		plugins: {
			'n8n-nodes-base': n8nPlugin,
		},
		languageOptions: {
			parser: tsParser,
		},
		rules: {
			...n8nPlugin.configs.nodes.rules,
			...n8nPlugin.configs.community.rules,
			'n8n-nodes-base/node-param-default-wrong-for-options': 'off',
			// Desativa regra que está causando TypeError no plugin ao analisar fixedCollection
			'n8n-nodes-base/node-param-fixed-collection-type-unsorted-items': 'off',
		},
	},
	{
		files: ['**/*.js'],
		plugins: {
			'n8n-nodes-base': n8nPlugin,
		},
		languageOptions: {
			parserOptions: { ecmaVersion: 2020, sourceType: 'module' },
		},
		rules: {
			// Não aplicar regras do plugin em JS gerado
		},
	},
];
