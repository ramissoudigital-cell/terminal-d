import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/index.css';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';

if (Capacitor.isNativePlatform()) {
  try {
    StatusBar.setOverlaysWebView({ overlay: true }).catch(console.error);
    StatusBar.hide().catch(console.error);
  } catch (err) {
    console.error(err);
  }
} else if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/firebase-messaging-sw.js').catch((err) => {
      console.log('SW registration error:', err);
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
