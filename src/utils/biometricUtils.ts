import { Capacitor } from '@capacitor/core';

export async function isBiometricAvailable(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    // Dynamic import with ignore for web Vite bundler
    const pluginName = '@capgo/capacitor-native-biometric';
    const mod = await import(/* @vite-ignore */ pluginName);
    const NativeBiometric = mod?.NativeBiometric;
    if (NativeBiometric?.isAvailable) {
      const res = await NativeBiometric.isAvailable();
      return !!res?.isAvailable;
    }
  } catch (e) {
    // Native plugin not available on this platform/device
  }
  return false;
}

export async function verifyBiometricIdentity(options?: {
  reason?: string;
  title?: string;
  subtitle?: string;
  description?: string;
}): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  try {
    const pluginName = '@capgo/capacitor-native-biometric';
    const mod = await import(/* @vite-ignore */ pluginName);
    const NativeBiometric = mod?.NativeBiometric;
    if (NativeBiometric?.verifyIdentity) {
      await NativeBiometric.verifyIdentity({
        reason: options?.reason || "Vérifiez votre identité",
        title: options?.title || "Authentification biométrique",
        subtitle: options?.subtitle || "",
        description: options?.description || ""
      });
      return true;
    }
  } catch (e) {
    // Biometrics verification failed or was cancelled
  }
  return false;
}
