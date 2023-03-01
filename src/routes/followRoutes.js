import express from 'express';
import authController from '../controllers/authController.js';
import followController from '../controllers/followController.js';
const router = express.Router();

router.use(authController.jwtVerify);

// Protected Routes

// Follow a User
router.post('/', followController.follow);

// Un-Follow a User
router.delete('/', followController.unFollow);

export default router;
