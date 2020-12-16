import axios from 'axios';

var showsAPI = axios.create({ baseURL: 'https://api.tvmaze.com/shows' });

export async function getMovieById(movieId) {
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
