import * as User from '../models/User';
import { check, body } from 'express-validator/check';

export async function getUsers(req, res, next) {
	var users = await User.getUsers();
	res.render('./users', { users });
}

export function getUser(req, res, next) {
	res.render('/user', {});
}

export function getCreateUser(req, res, next) {
	res.render('userForm');
}

export async function getUpdateUser(req, res, next) {
	var userId = req.params.id;
	var user = await User.findById(userId);
	res.render('userForm', { user });
}

export async function deleteUser(req, res, next) {
	var { id } = req.params;
	await User.deleteUser(id);

	res.redirect('/users');
}

export async function postCreateUser(req, res, next) {
	var { username, transactions, password, isAdmin } = req.body;
	await User.createUser({ username, transactions, password, isAdmin });
	res.redirect('/users');
}

export async function postUpdateUser(req, res, next) {
	var users = await User.getUsers();
	var { id } = req.params;
	var { username, password, transactions } = req.body;

	var user = users.find(user => user.id == id);

	user = { ...user, username, password, transactions };

	await User.updateUser(user);

	res.redirect('/users');
}
