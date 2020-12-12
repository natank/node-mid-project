const Category = require('../models/Category');
const Topic = require('../models/Topic');
const Product = require('../models/Product');
const PDFDocument = require('pdfkit');
const s3 = require('../util/aws-s3');

exports.getHome = async function (req, res, next) {
	console.log('home');
	res.render('./shop/index', { section: 'shop' });
};

exports.getCategories = async function (req, res, next) {
	try {
		const categories = await Category.find({}, 'title');
		res.render('./shop/categories', {
			section: 'shop',
			allCategories: categories,
		});
	} catch (err) {
		next(err);
	}
};

exports.getCategory = async function (req, res, next) {
	try {
		const category = await Category.findById(req.params.id);
		const topics = await Topic.find({ category: req.params.id });

		res.render('./shop/category', {
			category: category,
			topics: topics,
			section: 'shop',
		});
	} catch (err) {
		next(err);
	}
};

exports.getTopic = async function (req, res, next) {
	try {
		const topic = await Topic.findById(req.params.id);
		const acquisition = req.query.acquisition || 'all';
		// determine price option
		let priceOption;
		switch (acquisition) {
			case 'free':
				priceOption = { $eq: 0 };
				break;
			case 'premium':
				priceOption = { $gt: 0 };
				break;
			case 'all':
				priceOption = { $gte: 0 };
				break;
			default:
				let err = `No such option: ${acquisition}`;
				next(err);
		}
		let products = await Product.find({
			topic: req.params.id,
			price: priceOption,
		});
		// Determine which products are in myProducts of the user
		products =
			products &&
			products.map(product => {
				let prodId = product.id.toString();
				product.myProduct =
					req.user && product.isMyProduct(req.user.myProducts);
				product.wishlisted =
					req.user &&
					!!req.user.wishlist.find(item => item.toString() === prodId);
				return product;
			});
		res.render('./shop/products', {
			title: `${topic.title} Printables`,
			products: products,
			section: 'shop',
			route: req.originalUrl,
			acquisition: acquisition,
		});
	} catch (err) {
		next(err);
	}
};

exports.getProduct = async function (req, res, next) {
	const prodId = req.params.id;
	let product;
	try {
		product = await Product.findById(prodId);
	} catch (err) {
		next(err);
	}

	if (product) {
		// Set the myProducts of the user
		product.myProduct = req.user && product.isMyProduct(req.user.myProducts);
		// Set the wishlisted field
		product.wishlisted =
			req.user && !!req.user.wishlist.find(item => item.toString() === prodId);

		res.render('./shop/product', { product: product, section: 'shop' });
	} else {
		let err = 'Error: No such product';
		next(err);
	}
};

exports.getCart = async (req, res, next) => {
	try {
		let user = await req.user
			.populate({
				path: 'cart.product',
			})
			.execPopulate();

		let uiCart = user.cart.map(item => {
			let cartItem = {
				product: item.product,
				quantity: item.quantity,
			};
			return cartItem;
		});
		res.render('shop/cart', {
			path: '/cart',
			pageTitle: 'Your Cart',
			cart: uiCart,
			mode: 'shop',
			section: 'cart',
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.postCart = async (req, res, next) => {
	const prodId = req.body.productId;
	try {
		await Product.estimatedDocumentCount({ _id: prodId }, async (err, num) => {
			if (err) throw err;
			else if (num > 0) {
				let result = await req.user.addToCart(prodId);
			}
			res.redirect('/cart');
		});
		// console.log(result);
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.postCartDeleteProduct = async (req, res, next) => {
	const prodId = req.body.productId;
	let user = await req.user
		.populate({
			path: 'cart.item.product',
		})
		.execPopulate();

	user.cart = user.cart.filter(item => {
		let leaveInCart = item.product.toString() !== prodId;
		return leaveInCart;
	});
	try {
		await user.save();
		res.redirect('/cart');
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.postOrder = async (req, res, next) => {
	try {
		await req.user.addOrder();
		res.redirect('/orders');
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.getOrders = async (req, res, next) => {
	let orders;
	try {
		orders = await req.user.getOrders();
		let uiOrders = orders.map(order => {
			let uiOrder = {};
			uiOrder._id = order._id;
			uiOrder.prods = order.items.map(item => {
				let prod = {
					title: item.product.title,
					quantity: item.quantity,
					_id: item.product._id,
				};
				return prod;
			});
			return uiOrder;
		});

		res.render('shop/orders', {
			path: '/orders',
			pageTitle: 'Your Orders',
			orders: uiOrders,
			section: 'shop',
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.findOrderToDownload = async (req, res, next) => {
	try {
		const orders = await req.user.getOrders();
		const result = orders.find(function (order) {
			return order._id.toString() === req.params.orderId;
		});
		if (!result) next(new Error('No order found.'));
		else {
			req.order = result;
			next();
		}
	} catch (err) {
		next(err);
	}
};

exports.getInvoiceFile = async (req, res, next) => {
	try {
		const pdfDoc = new PDFDocument();

		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader(
			'Content-Disposition',
			'inline; filename="' + req.invoiceName + '"'
		);

		pdfDoc.pipe(res);

		pdfDoc.fontSize(26).text('Invoice', {
			underline: true,
		});

		pdfDoc.text('------------------------');
		let totalPrice = 0;
		req.order.items.forEach(item => {
			pdfDoc
				.fontSize(14)
				.text(
					`${item.product.title} - ${item.quantity} x $ ${item.product.price}`
				);
			totalPrice += item.quantity * item.product.price;
		});
		pdfDoc.fontSize(20).text('----');
		pdfDoc.text(`Total Price: $${totalPrice}`);

		pdfDoc.end();
	} catch (err) {
		next(err);
	}
};

exports.getCheckout = async (req, res, next) => {
	try {
		let user = await req.user
			.populate({
				path: 'cart.product',
			})
			.execPopulate();

		let uiCart = user.cart.reduce((prev, item, index, cart) => {
			if (item.product) {
				let cartItem = {
					product: item.product,
					quantity: item.quantity,
				};
				prev.push(cartItem);
			} else {
				// if product not available anymore in shop stock - remove it from cart
				cart.splice(index);
			}
			return prev;
		}, []);

		let totalCartValue = uiCart.reduce((prev, curr) => {
			return prev + curr.product.price * curr.quantity;
		}, 0);

		const line_items = uiCart.map(item => {
			const Cents = 100;
			let obj = {
				name: item.product.title,
				description: item.product.description,
				images: [item.product.imageUrl],
				amount: item.product.price * Cents,
				currency: 'usd',
				quantity: item.quantity,
			};
			return obj;
		});

		const stripe = require('stripe')(
			'sk_test_nnqXbNzNuX3Fy5p9NjjHX9ft00wlTX6B5H'
		);

		const checkoutSession = await stripe.checkout.sessions.create({
			payment_method_types: ['card'],
			line_items,
			success_url: `${req.protocol}://${req.get(
				'host'
			)}/shop/create-order/?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${req.protocol}://${req.get('host')}/shop/checkout`,
		});

		const { id } = checkoutSession;

		res.render('shop/checkout', {
			path: '/checkout',
			pageTitle: 'Checkout',
			cart: uiCart,
			totalSum: totalCartValue,
			checkoutSessionId: id,
			section: 'shop',
		});
	} catch (err) {
		const error = new Error(err);
		error.httpStatusCode = 500;
		return next(error);
	}
};

exports.getDownloadProduct = async (req, res, next) => {
	const prodId = req.params.id;

	let product;
	try {
		product = await Product.findById(prodId);
		const printableName = product.printableUrl.split('/').pop();
		const file = await s3.getFile(`printables/${printableName}`);
		const data = file.Body;
		res.writeHead(200, {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `attachment; filename=${printableName}`,
			'Content-Length': data.length,
		});
		res.end(data);
	} catch (err) {
		next(err);
	}
};

exports.validateProductOwnership = async (req, res, next) => {
	const prodId = req.params.id;
	try {
		const product = await Product.findById(prodId);
		if (
			product.isMyProduct(req.user.myProducts) ||
			product.price === 0 ||
			req.user.admin
		)
			next();
		else {
			const err = `You don't own this product`;
			throw err;
		}
	} catch (err) {
		return next(err);
	}
};

exports.getMyProducts = async (req, res, next) => {
	const user = req.user;
	let products = await user.getMyProducts();

	products =
		products &&
		products.map(product => {
			product.myProduct = req.user && product.isMyProduct(req.user.myProducts);
			return product;
		});

	res.render('./shop/products', {
		title: `My Printables`,
		products: products,
		section: 'shop',
	});
};

exports.postWishlist = async (req, res, next) => {
	const prodId = req.body.prodId.toString();
	const user = req.user;
	if (user && !user.wishlist.find(item => item.toString() === prodId)) {
		user.wishlist.push(prodId);
		try {
			await user.save();
			res.status(200).send();
		} catch (err) {
			next(err);
		}
	} else {
		res.status(404).send('User not found');
	}
};

exports.deleteWishlist = async (req, res, next) => {
	const prodId = req.body.prodId.toString();
	const user = req.user;
	if (user && user.wishlist.find(item => item.toString() === prodId)) {
		user.wishlist = user.wishlist.filter(item => item.toString() != prodId);
		try {
			await user.save();
			res.status(200).send();
		} catch (err) {
			next(err);
		}
	} else {
		res.status(404).send('User not found');
	}
};
