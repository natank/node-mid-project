export const isLoggedIn = (req, res, next) => {
	if (req.session.isLoggedIn) {
		next();
	} else {
		req.flash('error', 'You must be logged in to access this page');
		return res.redirect('/auth/login');
	}
};

export const isAdmin = (req, res, next) => {
	if (req.session.isAdmin) {
		next();
	} else {
		req.flash('error', 'You must be logged as admin to access this page');
		return res.redirect('/auth/login');
	}
};
