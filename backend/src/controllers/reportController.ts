import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const isChairman = req.user!.role === 'CHAIRMAN';

    if (isChairman) {
      const [
        totalInvitations,
        pendingInvitations,
        acceptedInvitations,
        rejectedInvitations,
        importantInvitations,
        pendingMemberRequests,
        managementMembers,
        unreadNotifications,
        collegeCategoryCount,
        familyCategoryCount,
        othersCategoryCount,
        officeRoleCount,
        familyRoleCount,
      ] = await Promise.all([
        prisma.invitation.count(),
        prisma.invitation.count({ where: { status: 'PENDING' } }),
        prisma.invitation.count({ where: { status: 'ACCEPTED' } }),
        prisma.invitation.count({ where: { status: 'REJECTED' } }),
        prisma.invitation.count({ where: { priority: 'IMPORTANT' } }),
        prisma.user.count({ where: { role: { not: 'CHAIRMAN' }, accountStatus: 'PENDING' } }),
        prisma.user.count({ where: { role: { not: 'CHAIRMAN' } } }),
        prisma.notification.count({ where: { userId: req.user!.id, isRead: false } }),
        prisma.invitation.count({ where: { category: 'COLLEGE' } }),
        prisma.invitation.count({ where: { category: 'FAMILY' } }),
        prisma.invitation.count({ where: { category: 'OTHERS' } }),
        prisma.invitation.count({ where: { role: 'OFFICE' } }),
        prisma.invitation.count({ where: { role: 'FAMILY' } }),
      ]);

      res.json({
        totalInvitations,
        pendingInvitations,
        acceptedInvitations,
        rejectedInvitations,
        importantInvitations,
        pendingMemberRequests,
        managementMembers,
        unreadNotifications,
        categoryBreakdown: {
          College: collegeCategoryCount,
          Family: familyCategoryCount,
          Others: othersCategoryCount,
        },
        roleBreakdown: {
          Office: officeRoleCount,
          Family: familyRoleCount,
        },
      });
    } else {
      // Management user stats for their own invitations
      const userId = req.user!.id;
      const [
        myInvitations,
        pending,
        accepted,
        rejected,
        important,
        unreadNotifications,
      ] = await Promise.all([
        prisma.invitation.count({ where: { uploadedById: userId } }),
        prisma.invitation.count({ where: { uploadedById: userId, status: 'PENDING' } }),
        prisma.invitation.count({ where: { uploadedById: userId, status: 'ACCEPTED' } }),
        prisma.invitation.count({ where: { uploadedById: userId, status: 'REJECTED' } }),
        prisma.invitation.count({ where: { uploadedById: userId, priority: 'IMPORTANT' } }),
        prisma.notification.count({ where: { userId: req.user!.id, isRead: false } }),
      ]);

      res.json({
        myInvitations,
        pending,
        accepted,
        rejected,
        important,
        unreadNotifications,
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch dashboard statistics.' });
  }
}
