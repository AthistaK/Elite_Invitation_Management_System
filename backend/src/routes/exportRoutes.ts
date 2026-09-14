import { Router } from 'express';
import { exportInvitations } from '../controllers/exportController';
import { authenticateToken } from '../middleware/auth';
import { requireChairman } from '../middleware/rbac';

const router = Router();

router.get('/', authenticateToken, requireChairman, exportInvitations);

export default router;
