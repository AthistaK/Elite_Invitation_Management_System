import { Response } from 'express';
import { prisma } from '../config/prisma';
import { logActivity } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendPushNotificationToUser } from '../utils/pushService';

export async function createReminder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { invitationId, reminderDatetime } = req.body;

    if (!invitationId || !reminderDatetime) {
      res.status(400).json({ error: 'Invitation ID and Reminder Date/Time are required.' });
      return;
    }

    const invitation = await prisma.invitation.findUnique({ where: { id: invitationId } });
    if (!invitation) {
      res.status(404).json({ error: 'Invitation not found.' });
      return;
    }

    const dt = new Date(reminderDatetime);
    if (isNaN(dt.getTime())) {
      res.status(400).json({ error: 'Invalid reminder date/time format.' });
      return;
    }

    const reminder = await prisma.reminder.create({
      data: {
        invitationId,
        userId: req.user!.id,
        reminderDatetime: dt,
        status: 'ACTIVE',
      },
    });

    await logActivity(
      req.user!.id,
      'REMINDER_CREATED',
      `Reminder set for invitation "${invitation.organizationFamilyName}" at ${dt.toLocaleString()}`,
      'Reminder',
      reminder.id
    );

    res.status(201).json({ message: 'Reminder created successfully.', reminder });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create reminder.' });
  }
}

export async function getReminders(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { invitationId } = req.query;

    const whereClause: any = {};
    if (req.user!.role !== 'CHAIRMAN') {
      whereClause.userId = req.user!.id;
    }

    if (invitationId && typeof invitationId === 'string') {
      whereClause.invitationId = invitationId;
    }

    const reminders = await prisma.reminder.findMany({
      where: whereClause,
      include: {
        invitation: {
          select: { id: true, organizationFamilyName: true, date: true, priority: true },
        },
      },
      orderBy: { reminderDatetime: 'asc' },
    });

    res.json({ reminders });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch reminders.' });
  }
}

export async function deleteReminder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const reminder = await prisma.reminder.findUnique({ where: { id } });
    if (!reminder) {
      res.status(404).json({ error: 'Reminder not found.' });
      return;
    }

    if (req.user!.role !== 'CHAIRMAN' && reminder.userId !== req.user!.id) {
      res.status(403).json({ error: 'Access denied.' });
      return;
    }

    await prisma.reminder.delete({ where: { id } });

    res.json({ message: 'Reminder deleted.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete reminder.' });
  }
}

// Background / Triggered Check for Due Reminders
export async function triggerDueReminders(): Promise<void> {
  try {
    const now = new Date();
    const activeReminders = await prisma.reminder.findMany({
      where: {
        status: 'ACTIVE',
        reminderDatetime: { lte: now },
      },
      include: {
        invitation: true,
      },
    });

    if (activeReminders.length > 0) {
      console.log(`[REMINDER] Found ${activeReminders.length} due reminder(s) at ${now.toISOString()}`);
    }

    for (const reminder of activeReminders) {
      const message = `Reminder: You have an upcoming invitation for "${reminder.invitation.organizationFamilyName}" scheduled on ${new Date(reminder.invitation.date).toLocaleDateString()}.`;
      
      const notif = await prisma.notification.create({
        data: {
          userId: reminder.userId,
          type: 'REMINDER_DUE',
          title: 'Invitation Reminder Due',
          message,
          relatedEntity: 'Invitation',
          relatedEntityId: reminder.invitationId,
        },
      });

      console.log(`[REMINDER] Notification record created ID: ${notif.id} for user: ${reminder.userId}`);

      sendPushNotificationToUser(reminder.userId, {
        title: 'Invitation Reminder Due',
        message,
        type: 'REMINDER_DUE',
        invitationId: reminder.invitationId,
        entityId: reminder.invitationId,
        url: `/chairman/invitations?invitationId=${reminder.invitationId}`,
      }).catch((err) => console.error('[REMINDER] Web push trigger error:', err));

      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { status: 'DUE' },
      });

      console.log(`[REMINDER] Reminder ID: ${reminder.id} updated status to DUE`);
    }
  } catch (err) {
    console.error('[REMINDER] Error processing due reminders:', err);
  }
}
