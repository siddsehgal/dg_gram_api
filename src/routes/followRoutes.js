import express from 'express';
import authController from '../controllers/authController.js';
import followController from '../controllers/followController.js';
const router = express.Router();

router.use(authController.jwtVerify);
router.post('/', followController.follow);
router.delete('/', followController.unFollow);

export default router;
