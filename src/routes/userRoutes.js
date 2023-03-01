import express from 'express';
// Controllers
import userController from '../controllers/userController.js';
import authController from '../controllers/authController.js';

// Initialize Express Router
const router = express.Router();

router.use(authController.jwtVerify);

// Protected Routes

// Get and Patch User
router.get('/', userController.getUserData);
router.patch('/', userController.updateUserData);

// Search User List by UserName
router.get('/search-by-user-name', userController.getUsersByUserName);

export default router;
