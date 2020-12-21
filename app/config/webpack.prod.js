const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const isDevelopment = false; //process.env.NODE_ENV !== 'production';

module.exports = {
	entry: {
		main: [
			'babel-runtime/regenerator',
			'webpack-hot-middleware/client?reload=true',
			'./app/public/main.js',
		],
	},
	mode: 'production',
	output: {
		filename: '[name]-bundle.js',
		path: path.resolve(__dirname, '../../dist'),
		publicPath: '/',
	},

	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.js$/,
				use: [
					{
						loader: 'babel-loader',
					},
				],
				exclude: /node_modules/,
			},
			{
				test: /\.css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
					},
					{
						loader: 'css-loader',
					},
				],
			},
			{
				test: /\.s(a|c)ss$/,
				exclude: /\.module.(s(a|c)ss)$/,
				use: [
					{
						loader: isDevelopment
							? 'style-loader'
							: MiniCssExtractPlugin.loader,
					},
					{
						loader: 'css-loader',
					},
					{
						loader: 'sass-loader',
						options: {
							sourceMap: isDevelopment,
						},
					},
				],
			},

			{
				test: /\.html$/,
				use: [
					{
						loader: 'html-loader',
						options: {
							attrs: ['img:src'],
						},
					},
				],
			},
			{
				test: /\.pug$/,
				use: [
					{
						loader: 'pug-loader',
					},
				],
			},
			{
				test: /\.(jpg|gif|png)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'images/[name].[ext]',
						},
					},
				],
			},
			{
				test: /\.(woff|woff2|eot|ttf|otf)$/,
				use: ['file-loader'],
			},
		],
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: isDevelopment
				? '[name]-[contenthash].css'
				: '[name]-[contenthash].css',
			chunkFilename: isDevelopment ? '[id].css' : '[id].css',
		}),
	],
	resolve: {
		extensions: ['.js', '.jsx', '.scss'],
	},
};
