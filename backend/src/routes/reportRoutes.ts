import { Router } from 'express';
import { getDashboardStats } from '../controllers/reportController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticateToken, getDashboardStats);

export default router;
