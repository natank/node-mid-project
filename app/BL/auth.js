import { check, body } from 'express-validator/check';
import { validationResult } from 'express-validator/check';
import * as User from '../models/User';

exports.getLogin = async (req, res, next) => {
	res.render('login', {
		errorMessage: req.flash('error'),
		oldInput: {
			email: '',
			password: '',
		},
		validationErrors: [],
	});
};

exports.postLogin = async (req, res, next) => {
	const errors = validationResult(req);
	const { username, password } = req.body;

	if (errors.isEmpty()) await signInUser();
	else cancelSignIn();

	async function signInUser() {
		req.session.user = req.user;
		var today = new Date(Date.now()).toDateString();
		var user = { ...req.session.user };

		if (req.session.user.loggedInAt != today) {
			user.loggedInAt = today;
			user.transactionsCounter = 0;
			await User.updateUser(user);
		}
		if (user.transactionsCounter >= user.transactions) {
			req.flash('error', `Your have exceeded your daily transactions`);
		}
		res.redirect('/');
	}

	function cancelSignIn() {
		res.status(422).render('login', {
			errorMessage: errors.array()[0].msg,
			oldInput: {
				username,
				password,
			},
			validationErrors: errors.array(),
		});
	}
};

exports.getLogout = async (req, res, next) => {
	try {
		await req.session.destroy();
		res.redirect('/');
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

export async function postCreateUser(req, res, next) {
	var { username, transactions, password } = req.body;
	await User.createUser({ username, transactions, password });
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

/**Middleware */
export function isAuth(req, res, next) {
	return next();
}

export var validateUsername = body('username') //validate username
	.custom(async (value, { req }) => {
		let { username } = req.body;
		let user = await User.findOne({
			username,
		});
		if (!user) {
			throw new Error('Incorrect username');
		} else {
			req.user = user;
			return true;
		}
	})
	.withMessage('Username does not exist!!');

export var validatePassword = body('password', 'password error') // validate password
	.isLength({
		min: 5,
	})
	.withMessage('password must be 5 chars or more')
	.isAlphanumeric()
	.withMessage('password must contain only letters and numbers')
	.trim()
	.custom(async (value, { req }) => {
		let { password } = req.body;
		if (req.user) {
			let doMatch = password == req.user.password;
			if (doMatch) return true;
			else throw new Error('Incorrect password');
		}
	});
