import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

let firestoreDb;
try {
  const dbId = firebaseConfig.firestoreDatabaseId || undefined;
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, dbId);
} catch (e) {
  firestoreDb = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}

export const db = firestoreDb;

// Initialize messaging only if supported in the browser
export const initMessaging = async () => {
  try {
    const supported = await isSupported();
    if (supported) {
      return getMessaging(app);
    }
    return null;
  } catch (error) {
    console.error("Firebase Messaging not supported", error);
    return null;
  }
};

export default app;
