import { rejects } from 'assert';
import axios from 'axios';
import fs from 'fs';
var showsAPI = axios.create({ baseURL: 'https://api.tvmaze.com/shows' });
var genresFile = 'genres.json';

/** Excecute this function once in a while */
async function createGenresList() {
	var movies = await getMovies();
	var genres = movies.reduce((acc, movie) => {
		acc.push(...movie.genres);
		return acc;
	}, []);
	genres = [...new Set(genres)].sort();
	fs.writeFile(genresFile, JSON.stringify(genres), () => {
		return;
	});
	return genres;
}

export async function getMovieById(movieId) {
	// createGenresList(); only onces
	var show = showsAPI.get(`/${movieId}`);
	return show;
}

export async function getMovies() {
	try {
		var response = await showsAPI.get();
		return response.data;
	} catch (err) {
		throw err;
	}
}

export async function getGenres() {
	return new Promise(async (resolve, reject) => {
		if (!fs.existsSync(genresFile)) {
			await createGenresList();
		}
		fs.readFile(genresFile, function (err, data) {
			var allGenres = JSON.parse(data);
			resolve(allGenres);
		});
	});
}
