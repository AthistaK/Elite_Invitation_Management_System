import { Router } from 'express';
import {
  getInvitations,
  getInvitationById,
  createInvitation,
  updateInvitation,
  deleteInvitation,
  acceptInvitation,
  rejectInvitation,
} from '../controllers/invitationController';
import { authenticateToken } from '../middleware/auth';
import { requireChairman } from '../middleware/rbac';
import { uploadMiddleware } from '../middleware/upload';

const router = Router();

router.use(authenticateToken);

router.get('/', getInvitations);
router.get('/:id', getInvitationById);
router.post('/', uploadMiddleware.single('attachment'), createInvitation);
router.put('/:id', uploadMiddleware.single('attachment'), updateInvitation);
router.delete('/:id', deleteInvitation);

// Accept / Reject - Chairman Only!
router.post('/:id/accept', requireChairman, acceptInvitation);
router.post('/:id/reject', requireChairman, rejectInvitation);

export default router;
