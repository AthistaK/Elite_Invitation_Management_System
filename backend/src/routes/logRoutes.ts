import { Router } from 'express';
import { getActivityLogs } from '../controllers/logController';
import { authenticateToken } from '../middleware/auth';
import { requireChairman } from '../middleware/rbac';

const router = Router();

router.get('/', authenticateToken, requireChairman, getActivityLogs);

export default router;
