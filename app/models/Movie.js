import * as tvmaze from '../DAL/tvmaze';
import * as newMoviesDAL from '../DAL/movies';

export async function createMovie(settings) {
	var { name, language, genres } = settings;

	var newMovies = await newMoviesDAL.getMovies();

	var id = `${newMovies.length}n`;
	var movie = { name, language, genres, id };
	newMovies.push(movie);
	newMoviesDAL.writeMoviesToFile(newMovies);
}

export async function find(settings) {
	var newMovies = await newMoviesDAL.getMovies();
	var apiMovies = await tvmaze.getMovies();
	var movies = [...newMovies, ...apiMovies];

	var newMoviesFiltered = filterMoviesBySettings(newMovies, settings);

	newMoviesFiltered = newMoviesFiltered.map((movie, index) => {
		var relatedMovies = findRelatedMovies(movie, movies);
		return { ...movie, relatedMovies };
	});

	var apiMoviesFiltered = filterMoviesBySettings(apiMovies, settings);

	apiMoviesFiltered = apiMoviesFiltered.map(movie => {
		var relatedMovies = findRelatedMovies(movie, movies);
		return { ...movie, relatedMovies };
	});

	return { newMovies: newMoviesFiltered, apiMovies: apiMoviesFiltered };
}

export async function findById(id) {
	var newMovies = await newMoviesDAL.getMovies();
	var movie = newMovies.find(movie => movie.id == id);
	if (movie) return movie;
	else {
		var response = await tvmaze.getMovieById(id);
		var movie = response.data;
		return movie;
	}
}

export async function getGenres() {
	var genres = await tvmaze.getGenres();
	return genres;
}

function filterMoviesBySettings(
	movies = [],
	settings = { name: null, language: null, genre: null }
) {
	var { name, language, genre } = settings;

	var moviesByName =
		name && name.length > 1
			? movies.filter(movie =>
					movie.name.toLowerCase().includes(name.toLowerCase())
			  )
			: movies;
	var moviesByLanguage =
		language && language.length > 1
			? moviesByName.filter(movie =>
					movie.language.toLowerCase().includes(language.toLowerCase())
			  )
			: moviesByName;
	var moviesByGenres = genre
		? moviesByLanguage.filter(movie => movie.genres.includes(genre))
		: moviesByLanguage;

	return moviesByGenres;
}
/** Find movies with the same genre as movie */
function findRelatedMovies(movie, movies) {
	//get the genre to filter related movies with
	var genre = movie.genres[getRandomInt(movie.genres.length)];

	// filter the related movies

	var relatedMovies = movies.filter(movie => movie.genres.includes(genre));

	// choose up to 5 related movies to show to the user
	var fromIndex = getRandomInt(Math.abs(relatedMovies.length - 5));
	var toIndex = fromIndex + 5 - 1;
	var relatedMovies = relatedMovies.slice(fromIndex, toIndex);

	return relatedMovies;

	function getRandomInt(max) {
		return Math.floor(Math.random() * Math.floor(max));
	}
}
