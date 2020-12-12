const crypto = require('crypto');
const { validationResult } = require('express-validator/check');

let User = require('../models/User');
const bcrypt = require('bcryptjs');
const transporter = require('../util/mailer').transporter;

exports.getLogin = async (req, res, next) => {
	res.render('auth/login', {
		path: '/login',
		pageTitle: 'Login',
		errorMessage: '',
		oldInput: {
			email: '',
			password: '',
		},
		validationErrors: [],
	});
};

exports.postLogin = async (req, res, next) => {
	const errors = validationResult(req);
	const { email, password } = req.body;

	if (errors.isEmpty()) {
		signInUser();
	} else {
		cancelSignIn();
	}

	function cancelSignIn() {
		res.status(422).render('auth/login', {
			path: '/signin',
			pageTitle: 'Signin',
			errorMessage: errors.array()[0].msg,
			oldInput: {
				email,
				password,
			},
			validationErrors: errors.array(),
		});
	}

	async function signInUser() {
		if (errors.isEmpty()) {
			try {
				let user = req.user;
				req.session.isLoggedIn = true;
				req.session.isAdmin = req.user.admin;
				req.session.user = user;
				await req.session.save();
				res.redirect('/');
			} catch (err) {
				const error = new Error(err);
				error.httpStatusCode = 500;
				return next(error);
			}
		} else {
			res.status(422).render('auth/login', {
				path: '/login',
				pageTitle: 'Login',
				errorMessage: errors.array()[0].msg,
				oldInput: {
					email,
				},
				validationErrors: errors.array(),
			});
		}
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

exports.getSignup = (req, res, next) => {
	res.render('auth/signup', {
		path: '/signup',
		pageTitle: 'Signup',
		errorMessage: req.flash('error'),
		oldInput: {
			email: '',
			password: '',
			confirmPassword: '',
		},
		validationErrors: [],
	});
};

exports.postSignup = async (req, res, next) => {
	const errors = validationResult(req);
	const { email, password, confirmPassword } = req.body;

	if (errors.isEmpty()) {
		signupUser();
	} else {
		cancelSignup();
	}

	function cancelSignup() {
		res.status(422).render('auth/signup', {
			path: '/signup',
			pageTitle: 'Signup',
			errorMessage: errors.array()[0].msg,
			oldInput: {
				email,
				password,
				confirmPassword,
			},
			validationErrors: errors.array(),
		});
	}

	async function signupUser() {
		try {
			let hashedPassword = await bcrypt.hash(password, 12);

			const user = new User({
				email: email,
				password: hashedPassword,
			});
			let result = await user.save();
			res.redirect('login');
			await transporter.sendMail({
				to: email,
				from: 'shop@nodecomplete.com',
				subject: 'Signup succeeded',
				html: '<h1>Thank you for signing up!</h1>',
			});
		} catch (err) {
			const error = new Error(err);
			error.httpStatusCode = 500;
			return next(error);
		}
	}
};

exports.getReset = (req, res, next) => {
	res.render('auth/reset', {
		path: '/reset',
		pageTitle: 'Reset Password',
		errorMessage: req.flash('error'),
	});
};

exports.postReset = async (req, res, next) => {
	try {
		const buffer = await new Promise((resolve, reject) => {
			crypto.randomBytes(32, (err, buffer) => {
				if (err) {
					reject('error generating token');
				}
				resolve(buffer);
			});
		});
		const token = buffer.toString('hex');
		let user = await User.findOne({
			email: req.body.email,
		});
		if (!user) {
			req.flash('error', 'No account with that email found');
			res.redirect('/reset');
		} else {
			user.resetToken = token;
			user.resetTokenExpiration = Date.now() + 3600000;
			await user.save();
			res.redirect('/');
			await transporter.sendMail({
				to: req.body.email,
				from: 'shop@nodecomplete.com',
				subject: 'Reset Password',
				html: `
          <p>You requested a password reset</p>
          <p>Click this link<a href="http://localhost:3000/reset/${token}">link</a> to set a new password.</p>
        `,
			});
			console.log(token);
		}
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
		req.flash(
			'error',
			"Sorry, we can't reset your password at the moment, please try again later"
		);
		res.redirect('/reset');
	}
};

exports.getNewPassword = async (req, res, next) => {
	const token = req.params.token;
	try {
		let user = await User.findOne({
			resetToken: token,
			resetTokenExpiration: {
				$gt: Date.now(),
			},
		});
		if (user) {
			res.render('auth/new-password', {
				path: '/new-password',
				pageTitle: 'New Password',
				errorMessage: req.flash('error'),
				userId: user._id.toString(),
				passwordToken: token,
			});
		} else {
			req.flash('error', `Can't reset your password at the moment`);
			res.redirect('/signup');
		}
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.postNewPassword = async (req, res, next) => {
	const { newPassword, userId, passwordToken } = req.body;
	try {
		let user = await User.findOne({
			resetToken: passwordToken,
			resetTokenExpiration: {
				$gt: Date.now(),
			},
		});
		let hashedPassword = await bcrypt.hash(newPassword, 12);
		user.password = hashedPassword;
		user.resetToken = undefined;
		user.resetTokenExpiration = undefined;
		await user.save();
		res.redirect('/login');
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};
