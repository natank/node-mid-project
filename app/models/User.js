import * as usersDal from '../DAL/users'

export async function createUser(settings){
	var users = await usersDal.readUsersFromFile()
	var id = users.length;
	var createdDate = new Date(Date.now()).toDateString()
	var user = {...settings, id, createdDate};
	users.push(user);
	await usersDal.writeUsersToFile(users)
}

export async function getUsers(){
	var users = await usersDal.readUsersFromFile()
	return users;
}