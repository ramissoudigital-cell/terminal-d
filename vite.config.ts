import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: './',
      server: {
        port: 3000,
        host: '0.0.0.0',
        watch: {
          ignored: ['**/android/**', '**/electron/**', '**/dist/**', '**/dist-electron/**'],
        },
      },
      plugins: [
        react(),
        tailwindcss(),
        VitePWA({
          registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000
      },
          includeAssets: ['favicon.ico', 'logos.png', 'logo.png', 'icone.png', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
          manifest: {
            id: '/',
            name: 'Terminale D',
            short_name: 'Terminale D',
            description: 'Application de gestion scolaire et tableau de bord Terminale D',
            theme_color: '#BFDBFE',
            background_color: '#BFDBFE',
            display: 'standalone',
            display_override: ['standalone', 'minimal-ui'],
            start_url: '/',
            scope: '/',
            icons: [
              {
                src: '/logos.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: '/logos.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any'
              },
              {
                src: '/logos.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
              }
            ]
          }
        })
      ],
      optimizeDeps: {
        entries: ['index.html'],
        exclude: ['@capgo/capacitor-native-biometric'],
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
