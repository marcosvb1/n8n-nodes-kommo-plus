const n8nPlugin = require('eslint-plugin-n8n-nodes-base');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
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
		},
	},
];
