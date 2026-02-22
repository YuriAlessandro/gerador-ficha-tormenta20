/**
 * Push notification handlers for the service worker.
 * Loaded via importScripts by the Workbox-generated service worker.
 */

// Handle incoming push notifications
self.addEventListener('push', function (event) {
  if (!event.data) {
    return;
  }

  var data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error('[SW Push] Failed to parse push data:', e);
    return;
  }

  var title = data.title || 'Fichas de Nimb';
  var options = {
    body: data.body || '',
    icon: data.icon || '/android-icon-192x192.png',
    badge: data.badge || '/notification-badge.png',
    tag: data.tag || 'default',
    renotify: data.renotify || false,
    data: data.data || {},
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener('notificationclick', function (event) {
  event.notification.close();

  var url = event.notification.data && event.notification.data.url;
  var targetUrl = url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        // Focus an existing window and navigate
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url && 'focus' in client) {
            return client.focus().then(function (focusedClient) {
              if (focusedClient && 'navigate' in focusedClient) {
                return focusedClient.navigate(targetUrl);
              }
            });
          }
        }
        // Open a new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
