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

    await navigator.serviceWorker.ready;

    // Fetch VAPID Public Key from backend
    const vapidRes = await api.get('/notifications/vapid-public-key');
    const vapidPublicKey = vapidRes.data.publicKey;

    if (!vapidPublicKey) {
      return { success: false, message: 'Failed to retrieve VAPID public key from backend.' };
    }

    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // Subscribe to Push Manager
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey as any,
    });

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
      await subscription.unsubscribe();
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
