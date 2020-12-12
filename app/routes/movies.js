import express from 'express';
import path from 'path';

import { isLoggedIn as isAuth } from '../BL/middleware/is-auth';
import shopController from '../BL/shop';
const router = express.Router();

router.get('/', shopController.getHome);
router.get('/categories', shopController.getCategories);
router.get('/topic/:id', shopController.getTopic);
router.get('/product/:id', shopController.getProduct);
router.get('/category/:id', shopController.getCategory);
router.get('/my-products', shopController.getMyProducts);
router.get(
	'/download/:id',
	shopController.validateProductOwnership,
	shopController.getDownloadProduct
);

router.get('/cart', isAuth, shopController.getCart);
router.post('/cart', isAuth, shopController.postCart);
router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.post('/wishlist', shopController.postWishlist);
router.delete('/wishlist', shopController.deleteWishlist);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/create-order', isAuth, shopController.postOrder); // from cart
router.get('/orders', isAuth, shopController.getOrders);
router.get(
	'/orders/:orderId',
	isAuth,
	shopController.findOrderToDownload,
	shopController.getInvoiceFile
);

export default router;
