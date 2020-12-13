/**
 * Product - Belogs to topic
 * Topic - Belongs to category, has many products
 * Category - has many topics
 */

import Product from '../models/Movie';
import Topic from '../models/Topic';
import Category from '../models/Category';
import mongoose from 'mongoose';

const s3 = require('../util/aws-s3');
const { check, validationResult } = require('express-validator');

exports.getDashboard = function (req, res, next) {
	res.render('./admin/dashboard');
};
exports.getCreateProduct = async function (req, res, next) {
	try {
		let topics = await Topic.find({}, 'title');
		res.render('admin/createProduct', {
			renderAs: 'new',
			topics: topics,
			page: 'product',
		});
	} catch (err) {
		next(err);
	}
};

exports.getCreateCategory = function (req, res, next) {
	res.render('admin/createCategory', { edit: false, page: 'category' });
};

exports.getCreateTopic = async function (req, res, next) {
	const categories = await Category.find({}, 'title');
	res.render('admin/createTopic', {
		edit: false,
		categories: categories,

		page: 'topic',
	});
};

exports.getEditProduct = async function (req, res, next) {
	try {
		let product = await Product.findById(req.params.id).populate({
			path: 'topic',
			select: 'title',
		});

		if (product.createdBy.toString() !== req.user.id) {
			let errorMessage = 'You are not allowed to edit this product';
			res.render('admin/createProduct', {
				product: null,
				renderAs: 'editUnAuthorized',
				topics: null,
				errorMessage,
			});
		}
		let topics = await Topic.find({}, 'title');
		res.render('admin/createProduct', {
			product: product,
			renderAs: 'edit',
			topics: topics,
			page: 'product',
		});
	} catch (err) {
		next(err);
	}
};

exports.getEditCategory = async function (req, res, next) {
	const category = await Category.findById(req.params.id);
	res.render('admin/createCategory', {
		category: category,
		isEdit: true,

		page: 'category',
	});
};

exports.getEditTopic = async function (req, res, next) {
	try {
		const topic = await Topic.findById(req.params.id).populate({
			path: 'category',
			select: 'title',
		});
		const category = await Category.findById(topic.category._id);
		topic.category = category;
		let categories = await Category.find({}, 'title');

		categories = categories.map(category => {
			category.id === topic.category.id
				? (category.selected = true)
				: (category.selected = false);
			return category;
		});
		res.render('admin/createTopic', {
			topic: topic,
			isEdit: true,
			categories: categories,

			page: 'topic',
		});
	} catch (err) {
		next(err);
	}
};

exports.getTopics = async function (req, res, next) {
	const filter = req.query.filter;
	let query;
	if (filter && filter != 'all') {
		query = Topic.find({ category: filter });
	} else {
		query = Topic.find();
	}
	try {
		const topics = await query.populate({
			path: 'category',
			select: 'title',
		});
		const categories = await Category.find({}, 'title');
		res.render('admin/topics', {
			topics: topics,
			categories: categories,
			filter: filter,
			itemType: 'topic',
			page: 'topic',
		});
	} catch (err) {
		next(err);
	}
};

// This function provides the products for the admin.
// The admin should access only the products he owns
exports.getProducts = async function (req, res, next) {
	const filter = req.query.topic;
	let query;

	if (filter && filter != 'all') {
		// Provide the admin with the product he created in the requsted topic
		query = Product.find({ topic: filter, createdBy: req.user.id });
	} else {
		query = Product.find({ createdBy: req.user.id });
	}
	try {
		let products = await query.populate({
			path: 'topic',
			select: 'title',
		});
		products = products.map(product => {
			product.editUrl = `/admin/editProduct/${product.id}`;
			product.deleteUrl = `/admin/deleteProduct/${product.id}`;
			return product;
		});
		const topics = await Topic.find({}, 'title');
		res.render('admin/products', {
			products: products,
			topics: topics,
			filter: filter,

			page: 'product',
		});
	} catch (err) {
		next(err);
	}
};

exports.getCategories = async function (req, res, next) {
	try {
		const categories = await Category.find();
		res.render('admin/categories', {
			allCategories: categories,
			page: 'category',
		});
	} catch (err) {
		next(err);
	}
};

exports.getDeleteProduct = async function (req, res, next) {
	try {
		const product = await Product.findById(req.params.id);
		let { imageUrl, printableUrl, createdBy } = product;
		if (product.createdBy.toString() !== req.user.id) {
			let errorMessage = 'You are not allowed to delete this product';
			throw errorMessage;
		} else {
			const imageName = imageUrl.split('/').pop();
			const printableName = printableUrl.split('/').pop();
			const printableDir = 'printables';
			const imageDir = 'images';
			const imagePath = `${imageDir}/${imageName}`;
			const printablePath = `${printableDir}/${printableName}`;
			await s3.deleteFile(imagePath);
			await s3.deleteFile(printablePath);

			await Product.deleteOne({ _id: req.params.id });
			res.redirect('/admin/products');
		}
	} catch (err) {
		next(err);
	}
};

exports.getDeleteCategory = async function (req, res, next) {
	const categoryId = req.params.id;
	try {
		const topicsCount = await Topic.countDocuments({ category: categoryId });
		if (topicsCount === 0) {
			await Category.deleteOne({ _id: categoryId });
		} else {
			console.log(
				'There are topics related to this category. Please delete them first'
			);
		}
		res.redirect('/admin/categories');
	} catch (err) {
		next(err);
	}
};

/**
 * getDeleteTopic
 * Delete the a topic and all it's related products
 */
exports.getDeleteTopic = async function (req, res, next) {
	const topicId = req.params.id;
	try {
		//  Delete all related products before deleting the topic
		// await Product.deleteMany({ topic: mongoose.Types.ObjectId(topicId) })
		const topic = await Topic.findById(topicId).select('imageUrl');

		await topic.remove();

		res.redirect('/admin/topics');
	} catch (err) {
		next(err);
	}
};

exports.postCreateProduct = async function (req, res, next) {
	const errors = validationResult(req);
	const { title, price, description, imageUrl, printableUrl, topic } = req.body;
	if (errors.isEmpty()) {
		await createTheProduct();
	} else {
		showErrors();
	}
	async function createTheProduct() {
		try {
			let product = await Product.create({
				title: title,
				price: price,
				description: description,
				imageUrl: imageUrl,
				printableUrl: printableUrl,
				topic: topic,
				createdBy: req.user._id,
			});
			res.redirect('/admin/products');
		} catch (err) {
			next(err);
		}
	}

	async function showErrors() {
		let topics = await Topic.find({}, 'title');
		const validationErrors = errors.array().reduce((errorObj, error) => {
			let { param } = error;
			// if field contains more than one validation error - show only the first
			if (!errorObj[param]) errorObj[param] = error.msg;
			return errorObj;
		}, {});
		res.status(422).render('admin/createProduct', {
			renderAs: 'errors',
			topics: topics,
			product: { title, price, description, topic },
			validationErrors,
			page: 'admin',
		});
	}
};

exports.postEditProduct = async function (req, res, next) {
	const {
		title,
		price,
		description,
		imageUrl,
		printableUrl,
		topic,
		prodId,
	} = req.body;
	try {
		let product = await Product.findById(prodId);
		if (product.createdBy.toString() !== req.user.id) {
			let errorMessage = 'You are not allowed to edit this product';
			throw errorMessage;
		} else {
			let updatedProduct = product.toObject({ virtuals: true });
			// update the product with the new values
			updatedProduct = { ...updatedProduct, title, price, description, topic };
			// check if the request contains an updated image
			if (imageUrl) {
				// remove the old image
				const imageName = updatedProduct.imageUrl.split('/').pop();
				const imageDir = 'images';
				const imagePath = `${imageDir}/${imageName}`;
				await s3.deleteFile(imagePath);
				// save the url of the new image
				updatedProduct.imageUrl = imageUrl;
			}
			if (printableUrl) {
				const printableName = updatedProduct.printableUrl.split('/').pop();
				const printableDir = 'printables';
				const printablePath = `${printableDir}/${printableName}`;
				await s3.deleteFile(printablePath);
				// save the url of the new printable
				updatedProduct.printableUrl = printableUrl;
			}
			await product.update(updatedProduct);

			res.redirect('/admin/products');
		}
	} catch (err) {
		next(err);
	}
};

exports.postCreateCategory = async function (req, res, next) {
	const { title } = { ...req.body };
	const category = await Category.create({
		title,
		createdBy: mongoose.Types.ObjectId('4edd40c86762e0fb12000003'),
	});
	res.redirect('/admin/categories');
};

exports.postEditCategory = async function (req, res, next) {
	try {
		await Category.updateOne({ _id: req.body.id }, { title: req.body.title });
	} catch (err) {
		next(err);
	}

	res.redirect('/admin/categories');
};

exports.postCreateTopic = async function (req, res, next) {
	const { title, description, category, imageUrl } = req.body;
	await Topic.create({
		title,
		category: category,
		description,
		imageUrl,
		createdBy: req.user._id,
	});
	res.redirect('topics');
};

exports.postEditTopic = async function (req, res, next) {
	const { title, description, category, topicId } = { ...req.body },
		fileExist = req.fileExist;

	const keys = { title, description, category, imageUrl: null };
	try {
		if (fileExist) {
			// new image was updated
			let topic;
			topic = await Topic.findById(topicId);
			if (!topic) throw err;

			// delete the previous image
			const imageDir = 'images';
			const imageUrl = topic.imageUrl;
			let imageName = imageUrl.split('/').pop();
			let imagePath = `${imageDir}/${imageName}`;

			await s3.deleteFile(imagePath);

			// update the url of the new image
			keys.imageUrl = req.body.imageUrl;
		} else {
			delete keys.imageUrl;
		}
		const topic = await Topic.updateOne({ _id: topicId }, keys);
		res.redirect('topics');
	} catch (err) {
		next(err);
	}
};
exports.postFilterTopics = function (req, res, next) {
	res.redirect();
};
exports.postFilterProducts = function (req, res, next) {
	res.redirect();
};
