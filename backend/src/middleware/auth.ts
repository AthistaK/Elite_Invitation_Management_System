import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../config/prisma';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    accountStatus: string;
    phone?: string | null;
    profilePhoto?: string | null;
  };
}

export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      res.status(401).json({ error: 'User account not found.' });
      return;
    }

    if (user.accountStatus !== 'APPROVED') {
      let statusMessage = 'Your account access has been restricted.';
      if (user.accountStatus === 'PENDING') {
        statusMessage = 'Your account registration is pending Chairman approval.';
      } else if (user.accountStatus === 'REJECTED') {
        statusMessage = 'Your account request has been rejected by the Chairman.';
      } else if (user.accountStatus === 'INACTIVE') {
        statusMessage = 'Your account has been deactivated by the Chairman.';
      }

      res.status(403).json({
        error: statusMessage,
        accountStatus: user.accountStatus,
      });
      return;
    }

    req.user = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      accountStatus: user.accountStatus,
      phone: user.phone,
      profilePhoto: user.profilePhoto,
    };

    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
    return;
  }
}
