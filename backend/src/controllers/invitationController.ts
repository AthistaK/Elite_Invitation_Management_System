import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../config/prisma';
import { logActivity } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendPushNotificationToUser } from '../utils/pushService';
import { validateUploadedFile, processFileStorage } from '../utils/storage';

// Get invitations list
export async function getInvitations(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { status, priority, role, category, invitationRole, search, date } = req.query;

    const whereClause: any = {};

    // RULE: Management users can ONLY view their own invitations
    if (req.user!.role !== 'CHAIRMAN') {
      whereClause.uploadedById = req.user!.id;
    }

    if (status && typeof status === 'string') {
      whereClause.status = status;
    }

    if (priority && typeof priority === 'string') {
      whereClause.priority = priority;
    }

    if (role && typeof role === 'string') {
      whereClause.role = role;
    }

    if (category && typeof category === 'string') {
      whereClause.category = category;
    }

    if (invitationRole && typeof invitationRole === 'string') {
      whereClause.invitationRole = invitationRole;
    }

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { organizationFamilyName: { contains: search } },
        { remarks: { contains: search } },
      ];
    }

    if (date && typeof date === 'string') {
      const targetDate = new Date(date);
      if (!isNaN(targetDate.getTime())) {
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        whereClause.date = {
          gte: targetDate,
          lt: nextDay,
        };
      }
    }

    const invitations = await prisma.invitation.findMany({
      where: whereClause,
      include: {
        uploadedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        reminders: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ invitations });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch invitations.' });
  }
}

// Get invitation by ID
export async function getInvitationById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        reminders: true,
      },
    });

    if (!invitation) {
      res.status(404).json({ error: 'Invitation not found.' });
      return;
    }

    // Management users can only view their own invitation
    if (req.user!.role !== 'CHAIRMAN' && invitation.uploadedById !== req.user!.id) {
      res.status(403).json({ error: 'Access denied to this invitation.' });
      return;
    }

    res.json({ invitation });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch invitation details.' });
  }
}

// Create invitation
export async function createInvitation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { organizationFamilyName, date, priority, role, category, invitationRole, remarks } = req.body;

    if (!organizationFamilyName || !date || !priority || !role || !category) {
      res.status(400).json({
        error: 'Organization / Family Name, Date, Priority, Role, and Category are required.',
      });
      return;
    }

    let attachmentPath = null;
    if (req.file) {
      const storedFile = await processFileStorage(req.file);
      attachmentPath = storedFile.url;
    }

    const invitationDate = new Date(date);
    if (isNaN(invitationDate.getTime())) {
      res.status(400).json({ error: 'Invalid date provided.' });
      return;
    }

    const validInvitationRole = ['CHIEF_GUEST', 'GUEST_OF_HONOUR', 'SPECIAL_INVITEE', 'ATTENDEE', 'OTHER'].includes(invitationRole)
      ? invitationRole
      : 'ATTENDEE';

    const invitation = await prisma.invitation.create({
      data: {
        organizationFamilyName: organizationFamilyName.trim(),
        date: invitationDate,
        priority: priority === 'IMPORTANT' ? 'IMPORTANT' : 'NORMAL',
        invitationRole: validInvitationRole,
        role: role === 'FAMILY' ? 'FAMILY' : 'OFFICE',
        category: ['COLLEGE', 'FAMILY', 'GOVERNMENT', 'PERSONAL', 'OTHERS'].includes(category) ? category : 'OTHERS',
        remarks: remarks ? remarks.trim() : null,
        attachmentPath,
        uploadedById: req.user!.id,
        status: 'PENDING',
      },
      include: {
        uploadedBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    // Notify Chairman strictly if uploaded by Management
    if (req.user!.role !== 'CHAIRMAN') {
      const chairman = await prisma.user.findFirst({ where: { role: 'CHAIRMAN' } });
      if (chairman) {
        console.log(`[PUSH] Invitation uploaded`);
        console.log(`[PUSH] Target Chairman ID: ${chairman.id}`);
        const title = invitation.priority === 'IMPORTANT' ? '🚨 IMPORTANT Invitation Uploaded' : 'New Invitation Uploaded';
        const message = `${req.user!.fullName} uploaded a new invitation for "${invitation.organizationFamilyName}". Requested Role: ${validInvitationRole.replace(/_/g, ' ')}.`;
        
        await prisma.notification.create({
          data: {
            userId: chairman.id,
            type: 'INVITATION_UPLOAD',
            title,
            message,
            relatedEntity: 'Invitation',
            relatedEntityId: invitation.id,
          },
        });

        const targetUrl = `/chairman/invitations?invitationId=${invitation.id}`;

        // Trigger Web Push Notification safely without blocking invitation upload response
        sendPushNotificationToUser(chairman.id, {
          title: 'New Invitation',
          message: 'A new invitation has been uploaded.',
          type: 'INVITATION_UPLOADED',
          invitationId: invitation.id,
          entityId: invitation.id,
          url: targetUrl,
        }).catch((err) => console.error('[PUSH] Invitation push failed:', err));
      }
    }

    await logActivity(
      req.user!.id,
      'INVITATION_UPLOADED',
      `Invitation "${invitation.organizationFamilyName}" uploaded by ${req.user!.fullName} (Requested Role: ${validInvitationRole}, Priority: ${invitation.priority})`,
      'Invitation',
      invitation.id
    );

    res.status(201).json({ message: 'Invitation uploaded successfully.', invitation });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to upload invitation.' });
  }
}

// Update invitation
export async function updateInvitation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { organizationFamilyName, date, priority, role, category, invitationRole, remarks } = req.body;

    const existing = await prisma.invitation.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Invitation not found.' });
      return;
    }

    // Management permissions check
    if (req.user!.role !== 'CHAIRMAN' && existing.uploadedById !== req.user!.id) {
      res.status(403).json({ error: 'You do not have permission to edit this invitation.' });
      return;
    }

    let attachmentPath = existing.attachmentPath;
    if (req.file) {
      const storedFile = await processFileStorage(req.file);
      attachmentPath = storedFile.url;
    }

    const updated = await prisma.invitation.update({
      where: { id },
      data: {
        organizationFamilyName: organizationFamilyName ? organizationFamilyName.trim() : existing.organizationFamilyName,
        date: date ? new Date(date) : existing.date,
        priority: priority ? priority : existing.priority,
        invitationRole: invitationRole ? invitationRole : existing.invitationRole,
        role: role ? role : existing.role,
        category: category ? category : existing.category,
        remarks: remarks !== undefined ? remarks : existing.remarks,
        attachmentPath,
      },
    });

    await logActivity(
      req.user!.id,
      'INVITATION_EDITED',
      `Invitation "${updated.organizationFamilyName}" updated by ${req.user!.fullName}`,
      'Invitation',
      updated.id
    );

    res.json({ message: 'Invitation updated successfully.', invitation: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update invitation.' });
  }
}

// Delete invitation
export async function deleteInvitation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const existing = await prisma.invitation.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Invitation not found.' });
      return;
    }

    // Management permissions check
    if (req.user!.role !== 'CHAIRMAN' && existing.uploadedById !== req.user!.id) {
      res.status(403).json({ error: 'You do not have permission to delete this invitation.' });
      return;
    }

    if (existing.attachmentPath) {
      const fileOnDisk = path.join(__dirname, '../../', existing.attachmentPath);
      if (fs.existsSync(fileOnDisk)) {
        fs.unlinkSync(fileOnDisk);
      }
    }

    await prisma.invitation.delete({ where: { id } });

    await logActivity(
      req.user!.id,
      'INVITATION_DELETED',
      `Invitation "${existing.organizationFamilyName}" deleted by ${req.user!.fullName}`,
      'Invitation',
      id
    );

    res.json({ message: 'Invitation deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete invitation.' });
  }
}

// Accept Invitation (Chairman Only)
export async function acceptInvitation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const existing = await prisma.invitation.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Invitation not found.' });
      return;
    }

    const updated = await prisma.invitation.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });

    // Notify uploader strictly for their user ID
    if (updated.uploadedById !== req.user!.id) {
      const message = `Your uploaded invitation for "${updated.organizationFamilyName}" was ACCEPTED by the Chairman.`;
      await prisma.notification.create({
        data: {
          userId: updated.uploadedById,
          type: 'INVITATION_ACCEPTED',
          title: 'Invitation Accepted',
          message,
          relatedEntity: 'Invitation',
          relatedEntityId: updated.id,
        },
      });

      sendPushNotificationToUser(updated.uploadedById, {
        title: 'Invitation Accepted',
        message,
        type: 'INVITATION_ACCEPTED',
        invitationId: updated.id,
        entityId: updated.id,
        url: `/management/invitations?invitationId=${updated.id}`,
      }).catch((err) => console.error('[PUSH] Accept push trigger error:', err));
    }

    await logActivity(
      req.user!.id,
      'INVITATION_ACCEPTED',
      `Chairman accepted invitation "${updated.organizationFamilyName}"`,
      'Invitation',
      updated.id
    );

    res.json({ message: 'Invitation accepted successfully.', invitation: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to accept invitation.' });
  }
}

// Reject Invitation (Chairman Only)
export async function rejectInvitation(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const existing = await prisma.invitation.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ error: 'Invitation not found.' });
      return;
    }

    const updated = await prisma.invitation.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    // Notify uploader strictly for their user ID
    if (updated.uploadedById !== req.user!.id) {
      const message = `Your uploaded invitation for "${updated.organizationFamilyName}" was REJECTED by the Chairman.`;
      await prisma.notification.create({
        data: {
          userId: updated.uploadedById,
          type: 'INVITATION_REJECTED',
          title: 'Invitation Rejected',
          message,
          relatedEntity: 'Invitation',
          relatedEntityId: updated.id,
        },
      });

      sendPushNotificationToUser(updated.uploadedById, {
        title: 'Invitation Rejected',
        message,
        type: 'INVITATION_REJECTED',
        invitationId: updated.id,
        entityId: updated.id,
        url: `/management/invitations?invitationId=${updated.id}`,
      }).catch((err) => console.error('[PUSH] Reject push trigger error:', err));
    }

    await logActivity(
      req.user!.id,
      'INVITATION_REJECTED',
      `Chairman rejected invitation "${updated.organizationFamilyName}"`,
      'Invitation',
      updated.id
    );

    res.json({ message: 'Invitation rejected.', invitation: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to reject invitation.' });
  }
}
