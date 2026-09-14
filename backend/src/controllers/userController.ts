import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { logActivity } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth';
import { sendPushNotificationToUser } from '../utils/pushService';

// Get list of management users (Chairman only)
export async function getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { status, role, search } = req.query;

    const whereClause: any = {
      role: { not: 'CHAIRMAN' },
    };

    if (status && typeof status === 'string') {
      whereClause.accountStatus = status;
    }

    if (role && typeof role === 'string') {
      whereClause.role = role;
    }

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        profilePhoto: true,
        role: true,
        accountStatus: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch users.' });
  }
}

// Chairman manually adds member
export async function addUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { fullName, email, password, role, status } = req.body;

    if (!fullName || !email || !password || !role || !status) {
      res.status(400).json({ error: 'All fields (Full Name, Email, Password, Role, Status) are required.' });
      return;
    }

    if (role !== 'OFFICE' && role !== 'FAMILY') {
      res.status(400).json({ error: 'Role must be either Office or Family.' });
      return;
    }

    const allowedStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'INACTIVE'];
    if (!allowedStatuses.includes(status)) {
      res.status(400).json({ error: 'Invalid status provided.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      res.status(400).json({ error: 'Email is already registered.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        fullName: fullName.trim(),
        email: normalizedEmail,
        passwordHash,
        role,
        accountStatus: status,
      },
    });

    await logActivity(
      req.user!.id,
      'MEMBER_ADDED',
      `Chairman added member ${newUser.fullName} (${newUser.role}, Status: ${newUser.accountStatus})`,
      'User',
      newUser.id
    );

    res.status(201).json({
      message: 'Member added successfully.',
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role,
        accountStatus: newUser.accountStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to add member.' });
  }
}

// Chairman edits member
export async function updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { fullName, role, accountStatus, phone } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role === 'CHAIRMAN') {
      res.status(404).json({ error: 'Management member not found.' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        fullName: fullName ? fullName.trim() : user.fullName,
        role: role && (role === 'OFFICE' || role === 'FAMILY') ? role : user.role,
        accountStatus: accountStatus || user.accountStatus,
        phone: phone !== undefined ? phone : user.phone,
      },
    });

    await logActivity(
      req.user!.id,
      'MEMBER_EDITED',
      `Chairman updated member details for ${updatedUser.fullName}`,
      'User',
      updatedUser.id
    );

    res.json({ message: 'Member details updated.', user: updatedUser });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update member.' });
  }
}

// Approve pending member
export async function approveUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role === 'CHAIRMAN') {
      res.status(404).json({ error: 'Management member not found.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { accountStatus: 'APPROVED' },
    });

    const approvalMessage = 'Your Management account registration has been approved by the Chairman. You may now sign in.';
    await prisma.notification.create({
      data: {
        userId: updated.id,
        type: 'MEMBER_APPROVAL',
        title: 'Account Approved',
        message: approvalMessage,
      },
    });

    await sendPushNotificationToUser(updated.id, {
      title: 'Account Approved',
      message: approvalMessage,
      url: '/portal',
    });

    await logActivity(
      req.user!.id,
      'MEMBER_APPROVED',
      `Chairman approved member ${updated.fullName}`,
      'User',
      updated.id
    );

    res.json({ message: 'Member approved successfully.', user: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to approve member.' });
  }
}

// Reject member request
export async function rejectUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role === 'CHAIRMAN') {
      res.status(404).json({ error: 'Management member not found.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { accountStatus: 'REJECTED' },
    });

    const rejectionMessage = 'Your Management registration request was reviewed and rejected.';
    await prisma.notification.create({
      data: {
        userId: updated.id,
        type: 'MEMBER_REJECTION',
        title: 'Registration Update',
        message: rejectionMessage,
      },
    });

    await sendPushNotificationToUser(updated.id, {
      title: 'Registration Update',
      message: rejectionMessage,
      url: '/portal',
    });

    await logActivity(
      req.user!.id,
      'MEMBER_REJECTED',
      `Chairman rejected member registration for ${updated.fullName}`,
      'User',
      updated.id
    );

    res.json({ message: 'Member registration rejected.', user: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to reject member.' });
  }
}

// Activate member
export async function activateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role === 'CHAIRMAN') {
      res.status(404).json({ error: 'Management member not found.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { accountStatus: 'APPROVED' },
    });

    await logActivity(
      req.user!.id,
      'MEMBER_ACTIVATED',
      `Chairman activated member ${updated.fullName}`,
      'User',
      updated.id
    );

    res.json({ message: 'Member account activated.', user: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to activate member.' });
  }
}

// Deactivate member
export async function deactivateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role === 'CHAIRMAN') {
      res.status(404).json({ error: 'Management member not found.' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { accountStatus: 'INACTIVE' },
    });

    await logActivity(
      req.user!.id,
      'MEMBER_DEACTIVATED',
      `Chairman deactivated member ${updated.fullName}`,
      'User',
      updated.id
    );

    res.json({ message: 'Member account deactivated.', user: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to deactivate member.' });
  }
}

// Reset member password
export async function resetUserPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role === 'CHAIRMAN') {
      res.status(404).json({ error: 'Management member not found.' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    await logActivity(
      req.user!.id,
      'PASSWORD_RESET',
      `Chairman reset password for member ${user.fullName}`,
      'User',
      user.id
    );

    res.json({ message: `Password reset successfully for ${user.fullName}.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to reset password.' });
  }
}

// Delete member
export async function deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role === 'CHAIRMAN') {
      res.status(404).json({ error: 'Management member not found.' });
      return;
    }

    await prisma.user.delete({ where: { id } });

    await logActivity(
      req.user!.id,
      'MEMBER_DELETED',
      `Chairman deleted member ${user.fullName} (${user.email})`,
      'User',
      id
    );

    res.json({ message: 'Member deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete member.' });
  }
}

// Transfer Chairman Authority to New User (Chairman Only)
export async function transferChairman(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { newFullName, newEmail, newPassword, currentPassword } = req.body;

    if (!newFullName || !newEmail || !newPassword || !currentPassword) {
      res.status(400).json({
        error: 'All fields (New Chairman Name, New Email, New Password, Current Password) are required.',
      });
      return;
    }

    if (req.user!.role !== 'CHAIRMAN') {
      res.status(403).json({ error: 'Only the current Chairman can transfer authority.' });
      return;
    }

    // Verify current Chairman password
    const currentChairman = await prisma.user.findUnique({
      where: { id: req.user!.id },
    });

    if (!currentChairman) {
      res.status(404).json({ error: 'Chairman account not found.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, currentChairman.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Incorrect current password. Transfer denied.' });
      return;
    }

    const normalizedNewEmail = newEmail.toLowerCase().trim();
    if (normalizedNewEmail === currentChairman.email.toLowerCase()) {
      res.status(400).json({ error: 'New Chairman email must be different from current Chairman email.' });
      return;
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Execute atomic transfer in a database transaction
    await prisma.$transaction(async (tx) => {
      // 1. Demote current Chairman to OFFICE role & INACTIVE status
      await tx.user.update({
        where: { id: currentChairman.id },
        data: {
          role: 'OFFICE',
          accountStatus: 'INACTIVE',
        },
      });

      // 2. Check if user with new email already exists
      const existingUser = await tx.user.findUnique({
        where: { email: normalizedNewEmail },
      });

      let newChairmanId = '';

      if (existingUser) {
        // Promote existing member to CHAIRMAN
        const updatedUser = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            fullName: newFullName.trim(),
            passwordHash: newPasswordHash,
            role: 'CHAIRMAN',
            accountStatus: 'APPROVED',
          },
        });
        newChairmanId = updatedUser.id;
      } else {
        // Create new CHAIRMAN user
        const newUser = await tx.user.create({
          data: {
            fullName: newFullName.trim(),
            email: normalizedNewEmail,
            passwordHash: newPasswordHash,
            role: 'CHAIRMAN',
            accountStatus: 'APPROVED',
          },
        });
        newChairmanId = newUser.id;
      }

      // Log activity
      await tx.activityLog.create({
        data: {
          userId: currentChairman.id,
          action: 'CHAIRMAN_TRANSFERRED',
          description: `Chairman authority transferred from ${currentChairman.fullName} (${currentChairman.email}) to ${newFullName.trim()} (${normalizedNewEmail}).`,
          entityType: 'User',
          entityId: newChairmanId,
        },
      });

      // Notify new Chairman in DB
      await tx.notification.create({
        data: {
          userId: newChairmanId,
          type: 'MEMBER_APPROVAL',
          title: 'Chairman Authority Transferred',
          message: `Executive Chairman authority has been transferred to you by ${currentChairman.fullName}. You may now log in to the Chairman Portal.`,
        },
      });
    });

    res.json({
      message: 'Chairman authority transferred successfully. Your session has ended.',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to transfer Chairman authority.' });
  }
}

