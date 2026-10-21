import { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { auth, db, initMessaging } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export const useNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check initial web permission
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const requestPermissionAndGetToken = async () => {
    try {
      const dynamicImport = (moduleName: string) =>
        new Function(`return import(/* @vite-ignore */ "${moduleName}")`)();
      
      const core = await dynamicImport('@capacitor/core').catch(() => null);
      
      // 1. CAPACITOR NATIVE PUSH (Mobile App: Android / iOS)
      if (core && core.Capacitor && core.Capacitor.isNativePlatform()) {
        const pushModule = await dynamicImport('@capacitor/push-notifications').catch(() => null);
        if (pushModule && pushModule.PushNotifications) {
          const { PushNotifications } = pushModule;
          let permStatus = await PushNotifications.checkPermissions();
          
          if (permStatus.receive === 'prompt') {
            permStatus = await PushNotifications.requestPermissions();
          }
          
          if (permStatus.receive === 'granted') {
            setPermissionStatus('granted');
            
            // Register with Apple / Google to receive token
            await PushNotifications.register();
            
            // On success, we get the token
            PushNotifications.addListener('registration', async (token: any) => {
              console.log('Capacitor Push token:', token.value);
              setFcmToken(token.value);
              if (auth.currentUser) {
                await saveTokenToFirestore(auth.currentUser.uid, token.value, 'capacitor');
              }
            });

            // Listen for foreground notifications
            PushNotifications.addListener('pushNotificationReceived', (notification: any) => {
              console.log('Push received in Capacitor foreground: ', notification);
            });
          } else {
            console.log('Permission de notification Capacitor refusée.');
            setPermissionStatus('denied');
          }
          return; // Exit after trying native
        }
      }

      // 2. WEB PUSH (PWA & Electron PC)
      if (!('Notification' in window)) {
        console.log('Ce navigateur ne supporte pas les notifications Web.');
        return;
      }

      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === 'granted') {
        const messaging = await initMessaging();
        if (messaging) {
          const token = await getToken(messaging);
          
          if (token) {
            console.log('Web Push token:', token);
            setFcmToken(token);
            if (auth.currentUser) {
              await saveTokenToFirestore(auth.currentUser.uid, token, 'web');
            }
          }
        }
      } else {
        console.log('Permission de notification Web refusée.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des notifications:', error);
    }
  };

  const saveTokenToFirestore = async (userId: string, token: string, platform: string = 'web') => {
    try {
      await setDoc(doc(db, 'users', userId, 'tokens', token), {
        token: token,
        platform: platform,
        device: navigator.userAgent,
        createdAt: new Date().toISOString(),
      });
      console.log(`Token FCM sauvegardé dans Firebase (${platform}).`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du token:', error);
    }
  };

  useEffect(() => {
    const setupWebMessaging = async () => {
      // Only set up Firebase Web Messaging listeners if we are on Web/Electron (not Capacitor Native)
      const dynamicImport = (moduleName: string) =>
        new Function(`return import(/* @vite-ignore */ "${moduleName}")`)();
      const core = await dynamicImport('@capacitor/core').catch(() => null);
      if (core && core.Capacitor && core.Capacitor.isNativePlatform()) return;

      const messaging = await initMessaging();
      if (messaging) {
        // Listen for foreground messages (when app is open on Web)
        const unsubscribe = onMessage(messaging, (payload) => {
          console.log('Message reçu (App ouverte - Web): ', payload);
          if (payload.notification) {
             // For PC/Web, we can spawn a local Notification if the app is focused
             // to ensure they see it, or just use a toast.
             new Notification(payload.notification.title || 'Notification', {
               body: payload.notification.body,
               icon: '/icone.png'
             });
          }
        });
        return () => unsubscribe();
      }
    };
    
    setupWebMessaging();

    // Re-save token when user logs in
    const authUnsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && fcmToken) {
        saveTokenToFirestore(user.uid, fcmToken, 'unknown');
      }
    });

    return () => authUnsubscribe();
  }, [fcmToken]);

  return {
    fcmToken,
    permissionStatus,
    requestPermissionAndGetToken
  };
};
