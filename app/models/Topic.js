const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
import Product from './Movie';
const s3 = require('../util/aws-s3');

const topicSchema = new Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	category: {
		type: ObjectId,
		ref: 'Category',
	},
	createdBy: {
		type: ObjectId,
		ref: 'User',
		required: true,
	},
	imageUrl: {
		type: String,
		required: true,
	},
});
topicSchema.pre('remove', async function (next) {
	// Delete related products
	const topicId = this._id;
	await Product.deleteMany({ topic: topicId });
	// Delete the topic image from the storage
	let imageName = this.imageUrl.split('/').pop();
	const imageDir = 'images';
	const imagePath = `${imageDir}/${imageName}`;
	await s3.deleteFile(imagePath);
});

module.exports = mongoose.model('Topic', topicSchema);
