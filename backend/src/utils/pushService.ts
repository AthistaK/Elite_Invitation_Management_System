import webpush from 'web-push';
import { prisma } from '../config/prisma';

export interface PushPayload {
  title: string;
  message: string;
  type?: string;
  invitationId?: string;
  entityId?: string;
  url?: string;
  tag?: string;
  icon?: string;
  badge?: string;
}

export async function sendPushNotificationToUser(userId: string, payload: PushPayload): Promise<void> {
  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    console.log(`[PUSH] Active Chairman subscriptions: ${subscriptions.length}`);

    if (subscriptions.length === 0) {
      console.log(`[PUSH] No active PushSubscription records found for user ID: ${userId}`);
      return;
    }

    const targetUrl = payload.url || '/';
    console.log(`[PUSH] Sending invitation push...`);

    const pushPayloadStr = JSON.stringify({
      title: payload.title,
      body: payload.message,
      type: payload.type || 'NOTIFICATION',
      invitationId: payload.invitationId || payload.entityId || null,
      entityId: payload.entityId || payload.invitationId || null,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/icon-192.png',
      url: targetUrl,
      tag: payload.tag || `eims-${payload.invitationId || Date.now()}`,
      timestamp: Date.now(),
    });

    const sendPromises = subscriptions.map(async (sub) => {
      const pushSub = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSub, pushPayloadStr, {
          headers: {
            Urgency: 'high',
          },
          TTL: 86400,
        });
        console.log(`[PUSH] Invitation push delivered successfully`);
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log(`[PUSH] Subscription expired/invalid (${err.statusCode}). Removed stale sub ID: ${sub.id}`);
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        } else {
          console.error(`[PUSH] Push failed for sub ID ${sub.id}:`, err.message || err);
        }
      }
    });

    await Promise.all(sendPromises);
  } catch (error: any) {
    console.error(`[PUSH] Push dispatch error for user ID ${userId}:`, error?.message || error);
  }
}
