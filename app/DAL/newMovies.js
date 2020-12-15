import fs from 'fs';
var fileName = 'NewMovies.json';

export async function readMoviesFromFile(){
    var movies = new Promise((resolve, reject) => {
		fs.readFile(fileName, function (err, data) {
			var allMovies;
			if (err) {
				allMovies = {};
			} else {
				var allMovies = JSON.parse(data);
			}
			resolve(allMovies);
		});
	});
}