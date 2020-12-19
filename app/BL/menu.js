export function getMenu(req, res, next) {
	res.render('./menu', { errorMessage: req.flash('error') });
}
