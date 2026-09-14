import { prisma } from '../config/prisma';

export async function logActivity(
  userId: string | null,
  action: string,
  description: string,
  entityType?: string,
  entityId?: string
) {
  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        description,
        entityType: entityType || null,
        entityId: entityId || null,
      },
    });
  } catch (error) {
    console.error('Failed to write activity log:', error);
  }
}
