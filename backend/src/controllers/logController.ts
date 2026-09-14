import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

export async function getActivityLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { action, search } = req.query;

    const whereClause: any = {};

    if (action && typeof action === 'string') {
      whereClause.action = action;
    }

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { description: { contains: search } },
        { action: { contains: search } },
      ];
    }

    const logs = await prisma.activityLog.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch activity logs.' });
  }
}
