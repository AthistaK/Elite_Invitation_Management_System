import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getVapidPublicKey,
  subscribePush,
  unsubscribePush,
  sendTestPushNotification,
} from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public route to get VAPID public key
router.get('/vapid-public-key', getVapidPublicKey);

// Authenticated routes
router.use(authenticateToken);

router.get('/', getNotifications);
router.post('/:id/read', markAsRead);
router.post('/read-all', markAllAsRead);
router.post('/subscribe', subscribePush);
router.post('/unsubscribe', unsubscribePush);
router.post('/test-push', sendTestPushNotification);

export default router;
