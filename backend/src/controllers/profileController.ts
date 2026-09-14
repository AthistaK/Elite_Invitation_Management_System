import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { logActivity } from '../utils/logger';
import { AuthenticatedRequest } from '../middleware/auth';

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { fullName, phone, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    let passwordHash = user.passwordHash;
    if (newPassword) {
      if (!currentPassword) {
        res.status(400).json({ error: 'Current password is required to update password.' });
        return;
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        res.status(400).json({ error: 'Incorrect current password.' });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({ error: 'New password must be at least 6 characters.' });
        return;
      }

      passwordHash = await bcrypt.hash(newPassword, 12);
    }

    let profilePhoto = user.profilePhoto;
    if (req.file) {
      profilePhoto = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: fullName ? fullName.trim() : user.fullName,
        phone: phone !== undefined ? phone : user.phone,
        profilePhoto,
        passwordHash,
      },
    });

    await logActivity(
      user.id,
      'PROFILE_UPDATED',
      `${updatedUser.fullName} updated their user profile`,
      'User',
      user.id
    );

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email, // Email remains unchanged / READ-ONLY
        phone: updatedUser.phone,
        profilePhoto: updatedUser.profilePhoto,
        role: updatedUser.role,
        accountStatus: updatedUser.accountStatus,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update profile.' });
  }
}
