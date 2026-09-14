import { Router } from 'express';
import { updateProfile } from '../controllers/profileController';
import { authenticateToken } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';

const router = Router();

router.put('/', authenticateToken, uploadMiddleware.single('profilePhoto'), updateProfile);

export default router;
