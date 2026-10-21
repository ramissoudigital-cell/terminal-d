import { getStoredTimeSlots } from '../../components/SchedulePage';

export const startWebNotificationEngine = () => {
  // Only run in browser environments
  if (typeof window === 'undefined') return;

  // We check every minute
  setInterval(() => {
    const isEnabled = localStorage.getItem('course_notifications_enabled') === 'true';
    if (!isEnabled) return;

    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    // Check if we are native (Capacitor handles it natively, so we skip Web notifications there)
    // Actually, it's safer to skip if Capacitor is detected, but a simple heuristic is fine.
    // Let's just allow it for now, worst case they get two (one native, one web).
    // Let's prevent double by checking if native:
    if ((window as any).Capacitor?.isNativePlatform()) return;

    const now = new Date();
    // Monday = 1, Tuesday = 2, ..., Sunday = 0
    let dayIndex = now.getDay() - 1; 
    if (dayIndex < 0 || dayIndex > 4) return; // Only Monday-Friday

    const hour = now.getHours();
    const minute = now.getMinutes();

    const eventsStr = localStorage.getItem('school_db_events');
    if (!eventsStr) return;

    let events;
    try {
      events = JSON.parse(eventsStr);
    } catch (e) { return; }

    const timeSlots = getStoredTimeSlots(); // get default or saved

    for (const event of events) {
      if (event.day !== dayIndex || !event.title) continue;

      const slotStr = timeSlots[event.start];
      if (!slotStr) continue;

      const startTimeStr = slotStr.split(' - ')[0]; // "07h30"
      if (!startTimeStr) continue;

      const [hStr, mStr] = startTimeStr.split('h');
      const eventH = parseInt(hStr, 10);
      const eventM = parseInt(mStr, 10);

      // Check if it's EXACTLY this minute
      if (hour === eventH && minute === eventM) {
        // Prevent firing multiple times in the same minute for the same event
        const lastFiredKey = `last_notif_${event.id}_${now.toDateString()}`;
        if (localStorage.getItem(lastFiredKey)) continue;
        
        localStorage.setItem(lastFiredKey, 'true');

        try {
          new Notification(`📚 Cours de ${event.title}`, {
            body: `Votre cours commence maintenant (Salle: ${event.room || 'Non définie'}).`,
            icon: '/icone.png'
          });
        } catch(err) {
          console.error('Failed to send web notification', err);
        }
      }
    }
  }, 60000); // Check every 60 seconds
};
