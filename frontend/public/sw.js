// Service Worker for Elite Invitation Management System (EIMS) Web Push & PWA
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming Web Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'EIMS Notification';
    const invitationId = data.invitationId || data.entityId || null;
    let targetUrl = data.url || '/';

    if (invitationId && !targetUrl.includes('invitationId=')) {
      if (targetUrl.includes('?')) {
        targetUrl += `&invitationId=${invitationId}`;
      } else {
        targetUrl += `?invitationId=${invitationId}`;
      }
    }

    const notificationTag = data.tag || `eims-${invitationId || Date.now()}`;

    const options = {
      body: data.body || 'You have a new update in EIMS.',
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/icon-192.png',
      tag: notificationTag,
      renotify: true,
      data: {
        url: targetUrl,
        invitationId: invitationId,
        entityId: data.entityId || invitationId,
        timestamp: data.timestamp || Date.now(),
      },
      vibrate: [200, 100, 200],
      requireInteraction: true,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Error rendering incoming push notification payload:', err);
  }
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
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
