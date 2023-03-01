import express from 'express';
import authController from '../controllers/authController.js';
import chatController from '../controllers/chatController.js';
const router = express.Router();

router.use(authController.jwtVerify);

// Protected routes

// Get Messages
router.get('/', chatController.getUserChat);

// Get User List
router.get('/users', chatController.getChatUsersList);

export default router;
