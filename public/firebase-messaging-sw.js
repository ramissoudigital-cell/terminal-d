importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  projectId: "river-edge-271nt",
  appId: "1:894034525085:web:e3f4fd4b66922d2ded0d74",
  apiKey: "AIzaSyC17FJD5t25mOOf4Kjf3LpIU6H0LoisYtc",
  authDomain: "river-edge-271nt.firebaseapp.com",
  storageBucket: "river-edge-271nt.firebasestorage.app",
  messagingSenderId: "894034525085",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Nouvelle Notification';
  const notificationOptions = {
    body: payload.notification?.body || 'Vous avez un nouveau message.',
    icon: '/icone.png',
    badge: '/icone.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
