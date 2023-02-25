import express from 'express';
import authController from '../controllers/authController.js';
import chatController from '../controllers/chatController.js';
const router = express.Router();

router.use(authController.jwtVerify);
router.get('/', chatController.getUserChat);
router.get('/users', chatController.getChatUsersList);

export default router;
