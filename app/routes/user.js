import express from 'express';
import * as userController from '../BL/user';

const router = express.Router();

router.get('/', userController.getUsers);
router.get('/create', userController.getCreateUser);
router.get('/update', userController.getUpdateUser);
router.get('/:id', userController.getUser);
router.get('/delete:id', userController.deleteUser);
router.get('/edit:id', userController.getUpdateUser);

router.post('/create', userController.postCreateUser);
router.post('/edit:id', userController.postUpdateUser);



module.exports = router;
