import * as usersDal from '../DAL/users';

export async function createUser(settings) {
	var users = await usersDal.getUsers();
	var id = users.length;
	var createdDate = new Date(Date.now()).toDateString();
	var user = { ...settings, id, createdDate };
	users.push(user);
	await usersDal.writeUsers(users);
}

export async function getUsers() {
	var users = await usersDal.getUsers();
	return users;
}

export async function findOne({ username }) {
	var users = await usersDal.getUsers();
	var user = users.find(user => user.username == username);
	return user;
}

export async function findById(id) {
	var users = await usersDal.getUsers();
	var user = users.find(user => user.id == id);
	return user;
}

export async function updateUser(user) {
	var users = await usersDal.getUsers();
	users = users.filter(currUser => {
		var result = currUser.id != user.id;
		return result;
	});
	users.push(user);
	await usersDal.writeUsers(users);
}

export async function deleteUser(id) {
	await usersDal.deleteUser(id);
}
