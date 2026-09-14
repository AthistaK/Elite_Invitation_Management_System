import { Router } from 'express';
import {
  submitContact,
  getContactMessages,
  markContactRead,
} from '../controllers/contactController';
import { authenticateToken } from '../middleware/auth';
import { requireChairman } from '../middleware/rbac';

const router = Router();

// Public / authenticated submit contact message
router.post('/', submitContact);

// Chairman only viewing & managing contact messages
router.get('/', authenticateToken, requireChairman, getContactMessages);
router.post('/:id/read', authenticateToken, requireChairman, markContactRead);

export default router;
