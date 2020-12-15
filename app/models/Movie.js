import fs from 'fs';
import * as tvmaze from '../DAL/tvmaze'
import * as newMoviesDAL from '../DAL/newMovies'

var fileName = 'NewMovies.json';

export async function createMovie(settings) {
	var { name, language, genres } = settings;

	fs.readFile(fileName, function (err, data) {
		var movies;
		if (err) {
			/**File not found */
			movies = [];
		} else {
			var movies = JSON.parse(data);
		}
		var id = movies.length;
		var movie = { name, language, genres, id };
		movies.push(movie);
		fs.writeFile(fileName, JSON.stringify(movies), () => {
			return;
		});
	});
}

export async function find(settings) {
	var newMovies = await newMoviesDAL.readMoviesFromFile();	
	var newMoviesFiltered = filterMoviesBySettings(newMovies, settings)

	var apiMovies = tvmaze.getMovies();
	var apiMoviesFiltered = filterMoviesBySettings(apiMovies, settings)
	return {newMovies: newMoviesFiltered, apiMovies: apiMoviesFiltered};
}

export function findById(id){

}

async function filterMoviesBySettings(movies=[], settings = {name: null, language: null, genre: null}){
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