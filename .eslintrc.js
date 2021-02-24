module.exports = {
	'env': {
		'browser': true,
		'commonjs': true,
		'es2021': true,
		'node': true,
	},
	'extends': [
		'plugin:react/recommended',
		'google',
	],
	'parserOptions': {
		'ecmaFeatures': {
			'jsx': true,
		},
		'ecmaVersion': 12,
	},
	'plugins': [
		'react',
	],
	'rules': {
		'indent': ['error', 'tab'],
		'no-tabs': ['error', {allowIndentationTabs: true}],
		'no-unused-vars': ['warn'],
		'require-jsdoc': [false],
	},
};
