import { api } from '../services/api';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBuffersEqual(buf1: ArrayBuffer | ArrayBufferView | null | undefined, buf2: ArrayBuffer | ArrayBufferView): boolean {
  if (!buf1 || !buf2) return false;
  const u1 = buf1 instanceof ArrayBuffer ? new Uint8Array(buf1) : new Uint8Array(buf1.buffer, buf1.byteOffset, buf1.byteLength);
  const u2 = buf2 instanceof ArrayBuffer ? new Uint8Array(buf2) : new Uint8Array(buf2.buffer, buf2.byteOffset, buf2.byteLength);
  if (u1.byteLength !== u2.byteLength) return false;
  for (let i = 0; i < u1.byteLength; i++) {
    if (u1[i] !== u2[i]) return false;
  }
  return true;
}

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

export function getNotificationPermissionState(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

export async function isPushSubscribed(): Promise<boolean> {
  if (!isPushSupported()) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (err) {
    return false;
  }
}

export async function subscribeToPushNotifications(): Promise<{ success: boolean; message: string }> {
  if (!isPushSupported()) {
    return { success: false, message: 'Web Push notifications are not supported on this device/browser.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, message: 'Notification permission was denied by user.' };
    }

    // Register Service Worker if not registered yet
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register('/sw.js');
    }

    // Ensure service worker is ready before accessing pushManager
    const readyRegistration = await navigator.serviceWorker.ready;

    // Fetch VAPID Public Key from backend
    const vapidRes = await api.get('/notifications/vapid-public-key');
    const vapidPublicKey = vapidRes.data.publicKey;

    if (!vapidPublicKey) {
      return { success: false, message: 'Failed to retrieve VAPID public key from backend.' };
    }

    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // Check existing subscription
    const existingSubscription = await readyRegistration.pushManager.getSubscription();

    if (existingSubscription) {
      console.log('[PUSH] Existing subscription found');
      const existingKey = existingSubscription.options?.applicationServerKey;
      const keysMatch = existingKey ? arrayBuffersEqual(existingKey, applicationServerKey) : false;

      if (!keysMatch) {
        console.log('[PUSH] Existing subscription incompatible with current VAPID key');
        console.log('[PUSH] Unsubscribing old subscription');
        try {
          await existingSubscription.unsubscribe();
        } catch (unsubErr) {
          console.warn('[PUSH] Diagnostic warning - failed to unsubscribe incompatible subscription:', unsubErr);
        }
      }
    }

    let subscription: PushSubscription;
    try {
      console.log('[PUSH] Creating new push subscription');
      subscription = await readyRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as any,
      });
      console.log('[PUSH] New subscription registered successfully');
    } catch (subErr: any) {
      if (
        subErr?.name === 'InvalidStateError' ||
        (subErr?.message && (subErr.message.includes('applicationServerKey') || subErr.message.includes('different')))
      ) {
        console.log('[PUSH] Existing subscription incompatible with current VAPID key');
        console.log('[PUSH] Unsubscribing old subscription');
        try {
          const currentSub = await readyRegistration.pushManager.getSubscription();
          if (currentSub) {
            await currentSub.unsubscribe();
          }
        } catch (unsubErr) {
          console.warn('[PUSH] Diagnostic warning - failed to unsubscribe during error recovery:', unsubErr);
        }

        console.log('[PUSH] Creating new push subscription');
        subscription = await readyRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey as any,
        });
        console.log('[PUSH] New subscription registered successfully');
      } else {
        throw subErr;
      }
    }

    const subscriptionJson = subscription.toJSON();

    // Send subscription payload to backend DB
    await api.post('/notifications/subscribe', {
      endpoint: subscriptionJson.endpoint,
      keys: subscriptionJson.keys,
    });

    return { success: true, message: 'Web push notifications enabled successfully!' };
  } catch (error: any) {
    console.error('Push notification subscription error:', error);
    return { success: false, message: error.response?.data?.error || error.message || 'Failed to subscribe.' };
  }
}

export async function unsubscribeFromPushNotifications(): Promise<{ success: boolean; message: string }> {
  if (!isPushSupported()) {
    return { success: false, message: 'Push notifications are not supported.' };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      try {
        await subscription.unsubscribe();
      } catch (unsubErr) {
        console.warn('[PUSH] Diagnostic warning - error during manual unsubscribe:', unsubErr);
      }
      await api.post('/notifications/unsubscribe', { endpoint }).catch(() => {});
    } else {
      await api.post('/notifications/unsubscribe', {}).catch(() => {});
    }

    return { success: true, message: 'Device unsubscribed from push notifications.' };
  } catch (error: any) {
    console.error('Push notification unsubscribe error:', error);
    return { success: false, message: error.message || 'Failed to unsubscribe.' };
  }
}

