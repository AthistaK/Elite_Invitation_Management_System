import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export async function submitContact(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, Email, and Message are required.' });
      return;
    }

    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user ? authReq.user.id : null;

    const contact = await prisma.contactMessage.create({
      data: {
        userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        message: message.trim(),
      },
    });

    // Notify Chairman
    const chairman = await prisma.user.findFirst({ where: { role: 'CHAIRMAN' } });
    if (chairman) {
      await prisma.notification.create({
        data: {
          userId: chairman.id,
          type: 'CONTACT_SUBMITTED',
          title: 'New Support Message',
          message: `Contact message received from ${contact.name} (${contact.email}).`,
          relatedEntity: 'ContactMessage',
          relatedEntityId: contact.id,
        },
      });
    }

    res.status(201).json({ message: 'Support message sent successfully.', contact });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to send message.' });
  }
}

export async function getContactMessages(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch contact messages.' });
  }
}

export async function markContactRead(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: { status: 'READ' },
    });

    res.json({ message: 'Message marked as read.', contact: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update contact message status.' });
  }
}
