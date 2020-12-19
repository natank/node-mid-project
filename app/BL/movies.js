import * as Movie from '../models/Movie';

export async function getMovies(req, res, next) {
	var { name, language, genre } = req.query;
	try {
		const movies = await Movie.find({ name, language, genre });
		const allGenres = await Movie.getGenres();
		res.render('./movies', {
			genres: allGenres,
			movies,
		});
	} catch (err) {
		next(err);
	}
}

export async function getMovie(req, res, next) {
	try {
		const movie = await Movie.findById(req.params.id);

		res.render('./movie', { movie });
	} catch (err) {
		next(err);
	}
}

export async function getCreateMovie(req, res, next) {
	try {
		var genres = await Movie.getGenres();
		res.render('movieForm', {
			genres,
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
