import express from 'express';
import userController from '../controllers/userController.js';
import authController from '../controllers/authController.js';
const router = express.Router();

router.use(authController.jwtVerify);
router.get('/', userController.getUserData);

// Search User List by UserName
router.get('/search-users', userController.getUsersByUserName);

export default router;
