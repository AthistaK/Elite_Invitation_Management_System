import { Router } from 'express';
import {
  getBootstrapStatus,
  createChairman,
  loginChairman,
  registerManagement,
  loginManagement,
  getMe,
  logout,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/bootstrap-status', getBootstrapStatus);
router.post('/chairman/create', createChairman);
router.post('/chairman/login', loginChairman);
router.post('/management/register', registerManagement);
router.post('/management/login', loginManagement);
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);

export default router;
