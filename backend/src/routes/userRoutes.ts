import { Router } from 'express';
import {
  getUsers,
  addUser,
  updateUser,
  approveUser,
  rejectUser,
  activateUser,
  deactivateUser,
  resetUserPassword,
  deleteUser,
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { requireChairman } from '../middleware/rbac';

const router = Router();

// All user management routes require Chairman privileges!
router.use(authenticateToken, requireChairman);

router.get('/', getUsers);
router.post('/', addUser);
router.put('/:id', updateUser);
router.post('/:id/approve', approveUser);
router.post('/:id/reject', rejectUser);
router.post('/:id/activate', activateUser);
router.post('/:id/deactivate', deactivateUser);
router.post('/:id/reset-password', resetUserPassword);
router.delete('/:id', deleteUser);

export default router;
