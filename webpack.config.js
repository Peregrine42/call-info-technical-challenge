module.exports = (env) => {
	return {
		mode: env.development ? 'development' : 'production',
		devtool: env.development ? 'inline-source-map' : undefined,
		watch: env.development,
		entry: './frontend/index.jsx',
		output: {
			path: __dirname + '/static/js/',
		},
		resolve: {
			extensions: ['.jsx', '.js'],
		},
		module: {
			rules: [
				{
					loader: 'babel-loader',
					exclude: /node_modules/,
				},
			],
		},
	};
}
;
