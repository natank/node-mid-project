import fs from 'fs';

var fileName = 'Users.json';

export async function getUsers() {
	var allUsers = await readUsersFromFile();
	return allUsers;
}

export async function writeUsers(users) {
	fs.writeFile(fileName, JSON.stringify(users), () => {
		return;
	});
}

export async function deleteUser(id) {
	var allUsers = await readUsersFromFile(fileName);
	allUsers = allUsers.filter(user => user.id != id);
	await writeUsersToFile(allUsers);
}

async function readUsersFromFile() {
	var p = new Promise((resolve, reject) => {
		fs.readFile(fileName, (err, data) => {
			if (err) {
				resolve([]);
			} else {
				var users = JSON.parse(data);
				resolve(users);
			}
		});
	});
	return p;
}

async function writeUsersToFile(users) {
	var p = new Promise((resolve, reject) =>
		fs.writeFile(fileName, JSON.stringify(users), err => {
			if (err) reject(err);
			resolve();
		})
	);
	return p;
}
