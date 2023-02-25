import express from 'express';
import authController from '../controllers/authController.js';
import postController from '../controllers/postController.js';
const router = express.Router();

router.use(authController.jwtVerify);
router.get('/', postController.getPosts);
router.post('/', postController.createPosts);
router.delete('/', postController.deletePosts);

router.post('/like', postController.createPostLike);
router.delete('/like', postController.deletePostLike);

export default router;
