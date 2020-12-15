import axios from 'axios';

var showsUrl = 'https://api.tvmaze.com/shows';

export async function getMovieById(movieId) {
	return [];
}

export async function getMovies() {
	try {
		var response = await axios.get(showsUrl);
		return response.data;
	} catch (err) {
		throw err;
	}
}
