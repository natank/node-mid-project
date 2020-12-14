import fs from 'fs';
import path from 'path';

var fileName = 'NewMovies.json';

export async function createMovie(settings) {
	var { name, language, genre } = settings;

	fs.readFile(fileName, function (err, data) {
		var movies;
		if (err) {
			/**File not found */
			movies = { movies: [] };
		} else {
			movies = JSON.parse(data);
		}
		var id = movies.length;
		var movie = { name, language, genre, id };
		movies.movies.push(movie);
		fs.writeFile(fileName, JSON.stringify(movies), () => {
			return;
		});
	});
}

export async function find(settings) {
	var { name, language, genere } = settings;
	var movies = new Promise((resolve, reject) => {
		var allMovies;
		fs.readFile(fileName, function (err, data) {
			if (err) {
				allMovies = {};
			} else {
				var json = JSON.parse(data);
				allMovies = json.movies;
			}
			resolve(allMovies);
		});
	});

	var allMovies = await movies;
	var moviesByName =
		name && name.length > 1
			? allMovies.filter(movie => movie.name.includes(name))
			: allMovies;
	var moviesByLanguage =
		language && language.length > 1
			? moviesByName.filter(movie => movie.language.includes(language))
			: moviesByName;
	var moviesByGenre = genere
		? moviesByLanguage.filter(movie => movie.genre.includes(genre))
		: moviesByLanguage;

	return moviesByGenre;
}
