import { precacheAndRoute } from 'workbox-precaching';

// Obligatorio para vite-plugin-pwa cuando usamos injectManifest
precacheAndRoute(self.__WB_MANIFEST || []);

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  console.log('Push recibido:', data);

  const title = data.title || 'Nueva Notificación';
  const options = {
    body: data.body || 'Tienes un nuevo mensaje.',
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/masked-icon.svg',
    data: data.data || { url: '/' },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data.url;

  // Abre la URL o enfoca si ya está abierta
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
