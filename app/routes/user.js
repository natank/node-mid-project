import express from 'express';
import * as userController from '../BL/user';

const router = express.Router();

router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.get('/create', userController.getCreateUser);
router.get('/update', userController.getUpdateUser);

router.post('/delete:id', userController.deleteUser);
router.post('/create', userController.postCreateUser);
router.post('/update:id', userController.updateUser);



module.exports = router;
