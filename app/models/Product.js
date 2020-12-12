const mongoose = require('mongoose');
const s3 = require('../util/aws-s3');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  printableUrl: {
    type: String,
    required: true
  },
  topic: {
    type: ObjectId,
    ref: 'Topic',
    required: true
  },
  createdBy: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  featured: {
    type: Boolean,
    default: false
  }
});

productSchema.pre('deleteMany', async function (next) {
  // Delete related products
  const topicId = this.getQuery().topic;
  try {
    // Get the products to delete
    const products = await Product.find({ topic: topicId });

    // The promise obj holds pending storage delete promises 
    //   of the image and prinbles of each product 

    const promiseObj = products.reduce((acc, product) => {
      const { imageUrl, printableUrl } = { ...product.toObject() };

      const printableName = printableUrl.split('/').pop();
      const imageName = imageUrl.split('/').pop();

      const imageDir = "images";
      const printableDir = "printables";

      const imagePath = `${imageDir}/${imageName}`;
      const printablePath = `${printableDir}/${printableName}`;

      // Create promises to delete the image and printable of each product
      const imagePromise = s3.deleteFile(imagePath)
      const printablePromise = s3.deleteFile(printablePath)

      acc.images = [...acc.images, imagePromise];
      acc.printables = [...acc.printables, printablePromise]

      return acc;
    }, { images: [], printables: [] });

    // Fulfill the promises
    await Promise.all(promiseObj.images);
    await Promise.all(promiseObj.printables);

  } catch (err) {
    next(err)
  }
})

productSchema.methods.isMyProduct = function (myProducts, id) {
  let prodId = id ? id : this.id;
  let isMyProduct = myProducts.reduce((prev, product) => {
    prev = prev || product.product._id.toString() === prodId;
    return prev
  }, false)
  return isMyProduct;
}


const Product = mongoose.model('Product', productSchema);


module.exports = Product;
