const mongoose = require('mongoose');
const Order = require('./order');
const Product = require('./Product');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String
  },
  admin: {
    type: Boolean,
    required: true,
    default: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  orders: [{
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: false
    }
  }],
  myProducts: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    }
  }],
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
})



userSchema.methods.addToCart = async function (prodId) {

  let user = this;
  let cart = [...user.cart]
  let p = new Promise(async (resolve, reject) => {

    const cartItemIndex = cart.findIndex(item => {
      return item.product.toString() === prodId.toString();
    });
    let newQuantity = 1;
    let cartItem;
    try {
      if (cartItemIndex >= 0) { //item already exists in cart
        cartItem = await cart[cartItemIndex];
        cartItem.quantity += 1
        user = await user.save();

      } else { // item yet not exist in cart
        cartItem = {
          product: prodId,
          quantity: newQuantity
        }
        cart.push(cartItem)
        user.cart = cart;

        user = await user.save();
        if (!user) reject(`error saving cart item:\n${err}`)
      }
      resolve();
    } catch (err) {
      reject(err);
    }
  })
  return p
},


  userSchema.methods.addOrder = async function () {
    let user = this;
    let cart = [...user.cart]
    let order = new Order([]);
    cart.forEach(cartItem => {
      let orderItem = {
        product: cartItem.product,
        quantity: cartItem.quantity
      }
      order.items.push(orderItem);
      order.userId = this._id;
      user.myProducts.push({ product: cartItem.product });
      // remove the product from the wishlist
      this.wishlist = this.wishlist.filter(productId => productId.toString() != cartItem.product.toString())
    })
    try {
      order = await order.save();
    } catch (err) {
      throw (err)
    }
    user.orders.push(order)
    user.cart = [];



    let p = new Promise(async (resolve, reject) => {
      try {
        user = await user.save()
      } catch (err) {
        reject(err)
      }
      resolve(user)
    })
    return p;
  }

userSchema.methods.getOrders = function () {
  let p = new Promise(async (resolve, reject) => {
    let orders;
    try {
      orders = await Order.find({
        userId: this._id
      }).populate('items.product')
    } catch (err) {
      reject(err)
    }
    resolve(orders)
  })
  return p;
}

userSchema.methods.getMyProducts = async function () {
  let myProducts = this.myProducts.map(elem => {
    let p = new Promise((resolve, reject) => {
      Product.findById(elem.product, function (err, product) {
        if (err) reject(err)
        else (resolve(product))
      });
    })
    return p;
  })
  try {
    myProducts = await Promise.all(myProducts)
    return myProducts;
  } catch (err) {
    console.log(err)
  }
}

userSchema.methods.getWishlistProducts = async function () {
  let wishlistProducts = this.wishlist.map(prodId => {
    let p = new Promise((resolve, reject) => {
      Product.findById(prodId, function (err, product) {
        if (err) reject(err)
        else (resolve(product))
      });
    })
    return p;
  })
  try {
    wishlistProducts = await Promise.all(wishlistProducts)
    return wishlistProducts;
  } catch (err) {
    console.log(err)
  }
}


const User = mongoose.model('User', userSchema);
module.exports = User;