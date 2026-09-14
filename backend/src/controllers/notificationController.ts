import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import { VAPID_PUBLIC_KEY } from '../config/vapid';
import { sendPushNotificationToUser } from '../utils/pushService';

export async function getNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user!.id, isRead: false },
    });

    res.json({ notifications, unreadCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch notifications.' });
  }
}

export async function markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== req.user!.id) {
      res.status(404).json({ error: 'Notification not found.' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({ message: 'Notification marked as read.', notification: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update notification.' });
  }
}

export async function markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: 'All notifications marked as read.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to mark all notifications as read.' });
  }
}

// Get VAPID Public Key for Web Push Subscriptions
export async function getVapidPublicKey(req: Request, res: Response): Promise<void> {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
}

// Store Web Push Subscription for current authenticated user
export async function subscribePush(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      res.status(400).json({ error: 'Invalid push subscription object format.' });
      return;
    }

    // Upsert device push subscription
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint },
      include: { user: true },
    });

    let targetUserId = req.user!.id;

    if (existing) {
      // PRESERVE CHAIRMAN SUBSCRIPTION: If existing subscription belongs to Chairman and caller is non-Chairman, keep Chairman as target owner
      if (existing.user?.role === 'CHAIRMAN' && req.user!.role !== 'CHAIRMAN') {
        targetUserId = existing.userId;
      }

      await prisma.pushSubscription.update({
        where: { endpoint },
        data: {
          userId: targetUserId,
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      });
    } else {
      await prisma.pushSubscription.create({
        data: {
          userId: targetUserId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      });
    }

    console.log(`[PUSH] Subscription registered/synced for user ID: ${targetUserId} (Caller: ${req.user!.fullName}, ${req.user!.role})`);
    res.status(201).json({ message: 'Push notification subscription saved successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to register push subscription.' });
  }
}

// Remove device push subscription
export async function unsubscribePush(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      // Remove all subscriptions for current user if endpoint not specified
      await prisma.pushSubscription.deleteMany({
        where: { userId: req.user!.id },
      });
    } else {
      await prisma.pushSubscription.delete({
        where: { endpoint },
      }).catch(() => {});
    }

    res.json({ message: 'Push subscription removed successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to unsubscribe push notifications.' });
  }
}

// Trigger a direct test push notification
export async function sendTestPushNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    await sendPushNotificationToUser(req.user!.id, {
      title: 'EIMS Test Push Notification',
      message: `Hello ${req.user!.fullName}, real web push notifications are working perfectly on your device!`,
      tag: 'test-notification',
    });

    res.json({ message: 'Test push notification dispatched.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to send test push notification.' });
  }
}
