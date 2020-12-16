import fs from 'fs';
var fileName = 'Users.json';

export async function readUsersFromFile() {
	return new Promise((resolve, reject) => {
		fs.readFile(fileName, function (err, data) {
			var allUsers;
			if (err) {
				allUsers = [];
			} else {
				var allUsers = JSON.parse(data);
			}
			resolve(allUsers);
		});
	});
}

export async function writeUsersToFile(users) {
	fs.writeFile(fileName, JSON.stringify(users), () => {
		return;
	});
}
