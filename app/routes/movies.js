import express from 'express';

import { isLoggedIn as isAuth } from '../BL/middleware/is-auth';
import * as moviesController from '../BL/movies';

const router = express.Router();

router.get('/:id', moviesController.getMovie);


export default router;
