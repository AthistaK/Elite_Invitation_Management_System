import { Router } from 'express';
import {
  createReminder,
  getReminders,
  deleteReminder,
} from '../controllers/reminderController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/', getReminders);
router.post('/', createReminder);
router.delete('/:id', deleteReminder);

export default router;
