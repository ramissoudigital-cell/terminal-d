import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

/**
 * Helper to set Capacitor Status Bar Color dynamically
 */
export const setCapacitorStatusBarColor = async (colorHex: string, isLightBackground: boolean) => {
  try {
    if (Capacitor.isNativePlatform()) {
      // Make sure it's shown, not hidden
      await StatusBar.show();
      await StatusBar.setOverlaysWebView({ overlay: false });
      
      // Set the status bar background color
      await StatusBar.setBackgroundColor({ color: colorHex });
      
      // Set text/icon style depending on background color:
      // Style.Dark: Dark text/icons (for light backgrounds)
      // Style.Light: Light text/icons (for dark backgrounds)
      const targetStyle = isLightBackground ? Style.Dark : Style.Light;
      await StatusBar.setStyle({ style: targetStyle });
    }
  } catch (err) {
    console.error('Error setting Capacitor status bar color:', err);
  }
};

/**
 * Helper to initialize Capacitor Immersive Full-Screen Mode
 * 
 * Hides both the Status Bar (notifications, battery) and Navigation Bar (system back/home buttons)
 * when running inside a Capacitor native app wrapper.
 */
export const initCapacitorImmersive = async () => {
  try {
    if (Capacitor.isNativePlatform()) {
      // Use a dynamic variable and @vite-ignore to completely hide this optional package from Vite/Rollup's static analysis at build-time.
      const navBarPkg = '@capacitor/navigation-bar';
      const navBarModule = await import(/* @vite-ignore */ navBarPkg).catch(() => null);
      if (navBarModule && navBarModule.NavigationBar) {
        await navBarModule.NavigationBar.hide();
      }
    }
  } catch (err) {
    console.log('Capacitor native check bypassed', err);
  }
};

/**
 * Enable Web Fullscreen (for testing or PWA mode)
 */
export const enableWebFullscreen = () => {
  if (typeof document !== 'undefined' && !document.fullscreenElement) {
    document.documentElement.requestFullscreen?.().catch(() => {});
  }
};
