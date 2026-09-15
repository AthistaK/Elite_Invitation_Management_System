// Custom Push & PWA Service Worker for Elite Invitation Management System (EIMS)

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push Notifications
self.addEventListener('push', (event) => {
  console.log('[SW PUSH] Push event received');

  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
      console.log('[SW PUSH] Payload parsed', data);
    } catch (err) {
      try {
        const textPayload = event.data.text();
        if (textPayload) {
          data = { body: textPayload };
        }
        console.log('[SW PUSH] Payload parsed', data);
      } catch (textErr) {
        console.log('[SW PUSH] Payload parsed');
      }
    }
  } else {
    console.log('[SW PUSH] Payload parsed');
  }

  const title = data.title || 'EIMS';
  const body = data.body || data.message || 'You have a new notification.';
  const invitationId = data.invitationId || data.entityId || null;
  let targetUrl = data.url || '/';

  if (invitationId && !targetUrl.includes('invitationId=')) {
    if (targetUrl.includes('?')) {
      targetUrl += `&invitationId=${invitationId}`;
    } else {
      targetUrl += `?invitationId=${invitationId}`;
    }
  }

  const notificationTag = data.tag || `eims-push-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const iconUrl = new URL('/icon-192.png', self.location.origin).href;

  const options = {
    body: body,
    icon: iconUrl,
    badge: iconUrl,
    tag: notificationTag,
    renotify: true,
    data: {
      url: targetUrl,
      invitationId: invitationId,
      entityId: data.entityId || invitationId,
      timestamp: data.timestamp || Date.now(),
    },
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };

  console.log('[SW PUSH] Calling showNotification');

  const showPromise = self.registration
    .showNotification(title, options)
    .then(() => {
      console.log('[SW PUSH] Notification displayed');
    })
    .catch((err) => {
      console.error('[SW PUSH] Error showing notification:', err);
    });

  event.waitUntil(showPromise);
});

// Handle notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = data.url || '/';
  const invitationId = data.invitationId || data.entityId;

  if (invitationId && !targetUrl.includes('invitationId=')) {
    if (targetUrl.includes('?')) {
      targetUrl += `&invitationId=${invitationId}`;
    } else {
      targetUrl += `?invitationId=${invitationId}`;
    }
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
