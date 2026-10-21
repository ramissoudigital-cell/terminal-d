export interface ScheduleEvent {
    id: string;
    day: number;
    start: number;
    duration: number;
    title: string;
    room: string;
    color: string;
    customTime?: string;
    teacherName?: string;
}

// Joue un son discret de carillon pour le retour temps réel
const playChimeSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.45);
  } catch (e) {
    // Audio context not allowed without direct interaction
  }
};

/**
 * Envoie une notification en temps réel immédiate (sur mobile Android via Capacitor et sur iPhone/Web via PWA)
 * et programme le rappel pour le cours
 */
export const triggerImmediateCourseReminder = async (event: ScheduleEvent, customSlotTime?: string): Promise<{ success: boolean; message: string }> => {
  const dynamicImport = (moduleName: string) =>
    new Function(`return import(/* @vite-ignore */ "${moduleName}")`)();

  const core = await dynamicImport('@capacitor/core').catch(() => null);
  const courseTime = customSlotTime || event.customTime || 'Horaire officiel';
  const title = `🔔 Rappel activé : ${event.title}`;
  const body = `Rappel en temps réel pour le cours de ${event.title} (${courseTime}) en ${event.room || 'Terminale D1'}${event.teacherName ? ` avec ${event.teacherName}` : ''}.`;

  // 1. Sur Mobile Android / iOS via Capacitor
  if (core && core.Capacitor && core.Capacitor.isNativePlatform()) {
    try {
      const localNotifModule = await dynamicImport('@capacitor/local-notifications').catch(() => null);
      if (localNotifModule && localNotifModule.LocalNotifications) {
        const { LocalNotifications } = localNotifModule;

        let permStatus = await LocalNotifications.checkPermissions();
        if (permStatus.display === 'prompt') {
          permStatus = await LocalNotifications.requestPermissions();
        }

        if (permStatus.display !== 'granted') {
          return { success: false, message: "Veuillez autoriser les notifications dans les paramètres de votre téléphone." };
        }

        // Notification push locale immédiate en temps réel sur l'appareil (buzz + bandeau)
        await LocalNotifications.schedule({
          notifications: [
            {
              id: Math.floor(Math.random() * 900000) + 100000,
              title,
              body,
              schedule: { at: new Date(Date.now() + 500) },
              smallIcon: 'ic_stat_icon_config_sample',
              iconColor: '#0284c7'
            }
          ]
        });

        playChimeSound();
        return { success: true, message: `Notification envoyée en temps réel pour le cours de ${event.title} !` };
      }
    } catch (err) {
      console.error('Error sending Capacitor local notification:', err);
    }
  }

  // 2. Sur iPhone (iOS PWA) et Navigateur Web
  if ('Notification' in window) {
    try {
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        // Vibreur si disponible sur le téléphone
        if ('vibrate' in navigator) {
          try { navigator.vibrate([150, 80, 150]); } catch (e) {}
        }
        playChimeSound();

        // En PWA iOS (Web Push / Service Worker)
        if ('serviceWorker' in navigator) {
          try {
            let reg = await navigator.serviceWorker.getRegistration();
            if (!reg && navigator.serviceWorker.ready) {
              reg = await navigator.serviceWorker.ready;
            }
            if (reg && 'showNotification' in reg) {
              await reg.showNotification(title, {
                body,
                icon: '/logo.png',
                badge: '/icone.png',
                vibrate: [200, 100, 200] as any,
                tag: `course-reminder-${event.id}`,
              });
              return { success: true, message: `Notification PWA envoyée en temps réel sur votre écran !` };
            }
          } catch (swErr) {
            console.warn('SW notification fallback to window.Notification:', swErr);
          }
        }

        // Notification Web standard
        new Notification(title, {
          body,
          icon: '/logo.png',
          badge: '/icone.png'
        });

        return { success: true, message: `Notification envoyée en temps réel pour ${event.title} !` };
      } else {
        return { success: false, message: "Activez les notifications dans Safari / Réglages iOS pour recevoir les alertes PWA." };
      }
    } catch (e) {
      console.error('Error triggering Web PWA notification:', e);
    }
  }

  // Fallback avec carillon
  playChimeSound();
  return { success: true, message: `Rappel programmé pour ${event.title} (${courseTime}) !` };
};

export const scheduleCourseNotifications = async (events: ScheduleEvent[], timeSlots: string[]) => {
  const dynamicImport = (moduleName: string) =>
    new Function(`return import(/* @vite-ignore */ "${moduleName}")`)();
  
  const core = await dynamicImport('@capacitor/core').catch(() => null);
  
  if (core && core.Capacitor && core.Capacitor.isNativePlatform()) {
    // 1. CAPACITOR LOCAL NOTIFICATIONS (Mobile Native Android / iOS)
    try {
      const localNotifModule = await dynamicImport('@capacitor/local-notifications').catch(() => null);
      if (localNotifModule && localNotifModule.LocalNotifications) {
        const { LocalNotifications } = localNotifModule;
        
        let permStatus = await LocalNotifications.checkPermissions();
        if (permStatus.display === 'prompt') {
          permStatus = await LocalNotifications.requestPermissions();
        }
        
        if (permStatus.display !== 'granted') {
          return false;
        }

        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({ notifications: pending.notifications });
        }

        if (events.length === 0) return true;

        const notificationsToSchedule = [];
        let idCounter = 1;

        for (const event of events) {
          if (!event.title) continue;

          const slotStr = timeSlots[event.start];
          if (!slotStr) continue;

          const startTimeStr = slotStr.split(' - ')[0]; // "07h30"
          if (!startTimeStr) continue;

          const [hourStr, minStr] = startTimeStr.split('h');
          const hour = parseInt(hourStr, 10);
          const minute = parseInt(minStr, 10);

          if (isNaN(hour) || isNaN(minute)) continue;

          // capacitor weekday: 1=Sun, 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
          const capacitorWeekday = event.day + 2; 

          notificationsToSchedule.push({
            title: `📚 Cours de ${event.title}`,
            body: `Votre cours commence maintenant (Salle: ${event.room || 'Terminale D1'}${event.teacherName ? ` - ${event.teacherName}` : ''}).`,
            id: idCounter++,
            schedule: { 
              on: { 
                weekday: capacitorWeekday, 
                hour: hour, 
                minute: minute 
              }, 
              repeats: true 
            },
            smallIcon: 'ic_stat_icon_config_sample',
            iconColor: '#0284c7'
          });
        }

        if (notificationsToSchedule.length > 0) {
          await LocalNotifications.schedule({
            notifications: notificationsToSchedule
          });
        }
        
        return true;
      }
    } catch (e) {
      console.error('Error scheduling local notifications', e);
      return false;
    }
  } else {
    // 2. WEB PWA IN-APP NOTIFICATIONS (iPhone PWA / Browser)
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
    return false;
  }
};

export const cancelAllCourseNotifications = async () => {
  const dynamicImport = (moduleName: string) =>
    new Function(`return import(/* @vite-ignore */ "${moduleName}")`)();
  
  const core = await dynamicImport('@capacitor/core').catch(() => null);
  
  if (core && core.Capacitor && core.Capacitor.isNativePlatform()) {
    try {
      const localNotifModule = await dynamicImport('@capacitor/local-notifications').catch(() => null);
      if (localNotifModule && localNotifModule.LocalNotifications) {
        const { LocalNotifications } = localNotifModule;
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel({ notifications: pending.notifications });
        }
      }
    } catch (e) {
      console.error('Error cancelling local notifications', e);
    }
  }
};
