const Category = require('../../models/Category');
const Topic = require('../../models/Topic');
const Product = require('../../models/Product');

export const menuData = async function (req, res, next) {
	try {
		// Find up to 4 documents from the Product collection
		let products = await Product.find({}).limit(4);
		products.forEach(product => {
			// Set the myProducts of the user
			product.myProduct = req.user && product.isMyProduct(req.user.myProducts);
			// Set the wishlisted field
			product.wishlisted =
				req.user &&
				!!req.user.wishlist.find(item => item.toString() === product.id);
		});
		// Find up to 4 documents from the Category collection
		let categories = await Category.find({}, 'title').limit(4);

		// For every document in the categories array - get up to 4 topics with that category
		let topicsPerCategoryPromise = categories.map(category => {
			return Topic.find({ category: category.id }, 'title').limit(4).exec();
		});
		let topicsPerCategory = await Promise.all(topicsPerCategoryPromise);

		// Create the data stracture for the ui
		let data = topicsPerCategory.map((topics, index) => {
			let entry = {
				category: categories[index],
				topics: topics,
			};
			return entry;
		});

		// Filter categories that don't have topic yet.
		categories = data.filter(entry => {
			const hasTopics = Array.isArray(entry.topics) && entry.topics.length;
			return hasTopics;
		});
		res.locals.products = products;
		res.locals.categories = categories;
		next();
	} catch (err) {
		next(err);
	}
};

function setUserType(req, res) {
	if (req.user) res.locals.userType = req.user.admin ? 'admin' : 'user';
	else res.locals.userType = 'guest';
}
export const adminData = function (req, res, next) {
	setUserType(req, res);
	res.locals.section = 'admin';
	next();
};

export const shopData = function (req, res, next) {
	setUserType(req, res);
	next();
};
