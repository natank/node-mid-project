import * as usersDal from '../DAL/users';

export async function createUser(settings) {
	var usersData = await usersDal.getUsers();
	if(!usersData) usersData = {nextId: 0, users:[]}
	var {users, nextId} = usersData
	var id = nextId;
	usersData.nextId = id+1;
	var createdDate = new Date(Date.now()).toDateString();
	var user = { ...settings, id, createdDate };
	users.push(user);
	await usersDal.writeUsers(usersData);
}

export async function getUsers() {
	var data = await usersDal.getUsers();

	return !data || data.users;
}

export async function findOne({ username }) {
	var users = await getUsers();
	var user = users.find(user => user.username == username);
	return user;
}

export async function findById(id) {
	var users = await getUsers();
	var user = users.find(user => user.id == id);
	return user;
}

export async function updateUser(user) {
	var usersData = await usersDal.getUsers();
	var {users, index} = usersData
	users = users.filter(currUser => {
		var result = currUser.id != user.id;
		return result;
	});
	users.push(user);
	await usersDal.writeUsers(usersData);
}

export async function deleteUser(id) {
	var usersData = await usersDal.getUsers();
	var {users, index} = usersData
	users = users.filter(currUser => {
		var result = currUser.id != id;
		return result;
	});
	usersData.users = users;
	await usersDal.writeUsers(usersData);
}
