import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import followRoutes from './followRoutes.js';
import chatRoutes from './chatRoutes.js';
import postRoutes from './postRoutes.js';
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/follow', followRoutes);
router.use('/chat', chatRoutes);
router.use('/post', postRoutes);

export default router;
