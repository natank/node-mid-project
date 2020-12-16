import express from 'express';
import path from 'path';
import session from 'express-session';
import devMiddleware from 'webpack-dev-middleware';
import hotMiddleware from 'webpack-hot-middleware';
import bodyParser from 'body-parser';
import flash from 'connect-flash';
import config from './config/webpack.dev';

import menuRoutes from './routes/menu';
import authRouter from './routes/auth';
import userRouter from './routes/user';

import * as moviesController from './BL/movies';

const isProd = process.env.NODE_ENV === 'production';
let webpackDevMiddleware;
let webpackHotMiddleware;

const webpack = require('webpack');
if (!isProd) {
	const compiler = webpack(config);
	webpackDevMiddleware = devMiddleware(compiler, {
		writeToDisk: filePath => {
			// instruct the dev server to the home.html file to disk
			// so that the route handler will be able to read it
			return /.+\.css$/.test(filePath);
		},
	});
	webpackHotMiddleware = hotMiddleware(compiler);
}

/**
 *
 *  global app variables
 *
 * */
const app = express();

/**
 * data middleware
 */
const dataMW = (function (app) {
	app.use(
		bodyParser.urlencoded({
			extended: false,
		})
	);
	app.use(bodyParser.json());
})(app);

/**
 *
 * Session middleware
 *
 */

/**
 * Webpack middleware
 */
if (!isProd) {
	const webpackMW = (function (app) {
		app.use(webpackDevMiddleware);
		app.use(webpackHotMiddleware);
	})(app);
}

/**
 *
 * General Middleware
 *
 */

const generalMW = (function (app) {
	app.set('view engine', 'pug');
	app.set('views', path.join(__dirname, './views'));

	app.use(express.static(path.join(__dirname, '../dist')));
	app.use(express.static(path.join(__dirname, '../fonts')));
})(app);

/**
 * flash Middleware
 *
 */
const flasHMW = (app => {
	app.use(flash());
})(app);

/**Menu Routes */
app.use('/', menuRoutes);

/**Movies Routes */
app.get('/search', moviesController.getMovies);
app.get('/create', moviesController.getCreateMovie);
app.post('/create', moviesController.postCreateMovie);
app.get('/movies/:id', moviesController.getMovie);
/**User Routes */
app.get('/users', userRouter);

/**Auth Routes */
app.use('/auth', authRouter);
app.use(function notFound(req, res) {
	res.render('error', { message: "That page doesn't exist" });
});

app.use(function errorHandler(err, req, res, next) {
	console.log(err);
	if (res.headersSent) {
		return next(err);
	}
	res.status(500);
	res.render('error', { message: 'Something went wrong' });
});

const connect = (async function (app) {
	const PORT = 8080;
	app.listen(PORT, () => {
		console.log(`app is listening on port http://localhost:${PORT}`);
	});
})(app);
