import express from 'express';
// Controller
import authController from '../controllers/authController.js';

// Initialize Express Router
const router = express.Router();

// Unprotected routes
router.post('/signin', authController.signin);
router.post('/signup', authController.signup);

// Middleware for Authentication from JWT
router.use(authController.jwtVerify);

// Protected routes
router.get('/resend-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.get('/check-login', authController.checkLogin);
router.patch('/update-user-name', authController.updateUserName);
router.patch('/update-email', authController.updateEmail);

export default router;
