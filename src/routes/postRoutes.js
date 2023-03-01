import express from 'express';
// Controllers
import authController from '../controllers/authController.js';
import postController from '../controllers/postController.js';

// Initialize Router from Express
const router = express.Router();

router.use(authController.jwtVerify);

// Protected Routes

// Get, Create and Delete Post APIs
router.get('/', postController.getPosts);
router.post('/', postController.createPosts);
router.delete('/', postController.deletePosts);

// Like and Un-Like a Post
router.post('/like', postController.createPostLike);
router.delete('/like', postController.deletePostLike);

export default router;
