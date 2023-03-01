import express from 'express';
// Routes
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import followRoutes from './followRoutes.js';
import chatRoutes from './chatRoutes.js';
import postRoutes from './postRoutes.js';

// Initialize Express Router
const router = express.Router();

// Setting path with their respective routes
// Auth Routes
router.use('/auth', authRoutes);

// User Routes
router.use('/user', userRoutes);

// FOllowing Routes
router.use('/follow', followRoutes);

// Chat Routes
router.use('/chat', chatRoutes);

// Post Routes
router.use('/post', postRoutes);

export default router;
