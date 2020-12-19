import fs from 'fs';
var fileName = 'NewMovies.json';

export async function getMovies() {
	return new Promise((resolve, reject) => {
		fs.readFile(fileName, function (err, data) {
			var allMovies;
			if (err) {
				allMovies = [];
			} else {
				var allMovies = JSON.parse(data);
			}
			resolve(allMovies);
		});
	});
}

export async function writeMoviesToFile(movies) {
	fs.writeFile(fileName, JSON.stringify(movies), () => {
		return;
	});
}
