export const isLoggedIn = (req, res, next) => {
	if (req.session.user) {
		next();
	} else {
		req.flash('error', 'You must be logged in to access this page');
		return res.redirect('/login');
	}
};

export const isAdmin = (req, res, next) => {
	if (req.session.user && req.session.user.isAdmin) {
		next();
	} else {
		req.flash('error', 'You must be logged as admin to access this page');
		return res.redirect('/login');
	}
};
