import express from 'express';
import userController from '../controllers/userController.js';
import authController from '../controllers/authController.js';
const router = express.Router();

router.use(authController.jwtVerify);
router.get('/', userController.getUserData);
router.patch('/', userController.updateUserData);

// Search User List by UserName
router.get('/search-by-user-name', userController.getUsersByUserName);

export default router;
