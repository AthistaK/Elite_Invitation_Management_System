import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

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
