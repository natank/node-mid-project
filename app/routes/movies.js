import express from 'express';

import { isLoggedIn as isAuth } from '../BL/middleware/is-auth';
import * as moviesController from '../BL/movies';

const router = express.Router();


router.get('/:id', moviesController.getMovie);




// router.get('/cart', isAuth, shopController.getCart);
// router.post('/cart', isAuth, shopController.postCart);
// router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

export default router;
