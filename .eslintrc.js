module.exports = {
	'parser': 'babel-eslint',
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
		'flowtype',
	],
	'rules': {
		'indent': ['error', 'tab'],
		'no-tabs': ['error', {allowIndentationTabs: true}],
		'no-unused-vars': ['warn'],
		'require-jsdoc': [0, {}],
		'quotes': ['warn', 'single'],
		'react/prop-types': [0],
	},
	'parserOptions': {
		'ecmaFeatures': {
			'jsx': true,
		},
	},
	'settings': {
		'react': {
			'version': 'detect',
			'flowVersion': '0.145.0',
		},
	},
};
