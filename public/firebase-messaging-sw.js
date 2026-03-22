// Firebase Messaging Service Worker
// Este archivo debe estar en la raíz de public/ para que Firebase lo encuentre

importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

// Configuración de Firebase - debe coincidir con la del frontend
firebase.initializeApp({
  apiKey: "AIzaSyDummyKey", // Esto se ignora en SW, pero se requiere
  authDomain: "app-suscription.firebaseapp.com",
  projectId: "app-suscription",
  storageBucket: "app-suscription.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
});

const messaging = firebase.messaging();

// Manejar mensajes en segundo plano
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);

  // Personalizar la notificación
  const notificationTitle = payload.notification?.title || 'A|R System';
  const notificationOptions = {
    body: payload.notification?.body || 'Nuevo mensaje recibido',
    icon: '/suscriptions/pwa-192x192.png',
    badge: '/suscriptions/pwa-192x192.png',
    tag: ' messaging-notification',
    data: payload.data || {},
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Cerrar' }
    ]
  };

  // Mostrar la notificación
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar clic en la notificación
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click:', event);
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    // Abrir la app y navegar a la sección de mensajes
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          // Si hay una ventana abierta, enfocarla
          for (const client of clientList) {
            if (client.url.includes('/suscriptions/') && 'focus' in client) {
              client.focus();
              // Navegar a comunicación si tenemos los datos
              if (event.notification.data?.conversationId) {
                client.postMessage({
                  type: 'NAVIGATE',
                  path: `/admin/communication?conversation=${event.notification.data.conversationId}`
                });
              }
              return client;
            }
          }
          // Si no hay ventana abierta, abrir una nueva
          if (clients.openWindow) {
            return clients.openWindow('/suscriptions/admin/communication');
          }
        })
    );
  }
});

// Manejar mensajes directos (cuando la app está abierta)
messaging.onMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received foreground message:', payload);
  
  // La notificación se maneja en el cliente cuando la app está abierta
  // Pero podemos también mostrarla si está en foreground
  if (Notification.permission === 'granted') {
    const notificationTitle = payload.notification?.title || 'A|R System';
    const notificationOptions = {
      body: payload.notification?.body || 'Nuevo mensaje recibido',
      icon: '/suscriptions/pwa-192x192.png',
      tag: ' messaging-foreground',
      data: payload.data || {}
    };
    
    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});
