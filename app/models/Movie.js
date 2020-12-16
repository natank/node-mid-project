import * as tvmaze from '../DAL/tvmaze';
import * as newMoviesDAL from '../DAL/movies';

export async function createMovie(settings) {
	var { name, language, genres } = settings;

	var newMovies = await newMoviesDAL.readMoviesFromFile();

	var id = `${newMovies.length}n`;
	var movie = { name, language, genres, id };
	newMovies.push(movie);
	newMoviesDAL.writeMoviesToFile(newMovies);
}

export async function find(settings) {
	var newMovies = await newMoviesDAL.readMoviesFromFile();
	var newMoviesFiltered = filterMoviesBySettings(newMovies, settings);

	var apiMovies = await tvmaze.getMovies();
	var apiMoviesFiltered = filterMoviesBySettings(apiMovies, settings);
	return { newMovies: newMoviesFiltered, apiMovies: apiMoviesFiltered };
}

export async function findById(id) {
	var newMovies = await newMoviesDAL.readMoviesFromFile();
	var movie = newMovies.find(movie => movie.id == id);
	if (movie) return movie;
	else {
		var response = await tvmaze.getMovieById(id);
		var movie = response.data
		return movie;
	}
}

function filterMoviesBySettings(
	movies = [],
	settings = { name: null, language: null, genre: null }
) {
	var { name, language, genere } = settings;

	var moviesByName =
		name && name.length > 1
			? movies.filter(movie => movie.name.includes(name))
			: movies;
	var moviesByLanguage =
		language && language.length > 1
			? moviesByName.filter(movie => movie.language.includes(language))
			: moviesByName;
	var moviesByGenres = genere
		? moviesByLanguage.filter(movie => movie.genres.includes(genre))
		: moviesByLanguage;

	return moviesByGenres;
}
