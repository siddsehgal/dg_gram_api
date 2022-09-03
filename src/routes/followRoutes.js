import express from 'express';
import authController from '../controllers/authController.js';
import followController from '../controllers/followController.js';
const router = express.Router();

router.use(authController.jwtVerify);
router.post('/:userId', followController.follow);
router.post('/unfollow/:userId', followController.unFollow);
router.get('/following', followController.followingUsers);

export default router;
