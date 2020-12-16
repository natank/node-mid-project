import * as Movie from '../models/Movie';
import * as tvmaze from '../DAL/tvmaze';

export async function getMovies(req, res, next) {
	var { name, language, genres } = req.query;
	try {
		const movies = await Movie.find({ name, language, genres });

		res.render('./movies', {
			movies,
		});
	} catch (err) {
		next(err);
	}
}

export async function getMovie(req, res, next) {
	try {
		const movie = await Movie.findById(req.params.id);

		res.render('./movie', { movie.data });
	} catch (err) {
		next(err);
	}
}

export async function getCreateMovie(req, res, next) {
	try {
		res.render('movieForm', {
			renderAs: 'new',
		});
	} catch (err) {
		next(err);
	}
}

export async function postCreateMovie(req, res, next) {
	const { name, language, genres } = req.body;
	try {
		await Movie.createMovie({ name, language, genres });
		res.render('./menu');
	} catch (err) {
		next(err);
	}
}
