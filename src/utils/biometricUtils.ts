import { Capacitor } from '@capacitor/core';

/**
 * Check if real hardware biometric authentication (Fingerprint, Touch ID, Face ID, Windows Hello)
 * is supported on this device/browser.
 */
export async function isBiometricAvailable(): Promise<boolean> {
  // 1. Native mobile app wrapper via Capacitor
  if (Capacitor.isNativePlatform()) {
    try {
      const pluginName = '@capgo/capacitor-native-biometric';
      const mod = await import(/* @vite-ignore */ pluginName);
      const NativeBiometric = mod?.NativeBiometric;
      if (NativeBiometric?.isAvailable) {
        const res = await NativeBiometric.isAvailable();
        return !!res?.isAvailable;
      }
    } catch {
      // Fall through to web check
    }
  }

  // 2. Web Authentication API (WebAuthn) with platform authenticator
  if (typeof window !== 'undefined' && window.PublicKeyCredential) {
    try {
      if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return available;
      }
      return true;
    } catch {
      return true;
    }
  }

  return false;
}

// Helper: Convert ArrayBuffer to Base64URL string
function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Helper: Convert Base64URL string to Uint8Array
function base64UrlToUint8Array(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Real device biometric identity verification (Real-time biometric using hardware sensor:
 * Fingerprint, Touch ID, Face ID, Windows Hello, Android Biometric Prompt).
 */
export async function verifyBiometricIdentity(options?: {
  reason?: string;
  title?: string;
  subtitle?: string;
  description?: string;
}): Promise<boolean> {
  // 1. Native Mobile platform biometrics (Android / iOS)
  if (Capacitor.isNativePlatform()) {
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
    } catch (e: any) {
      console.warn('Native biometric cancelled or failed:', e);
      return false;
    }
  }

  // 2. Real WebAuthn platform authenticator (Touch ID, Face ID, Windows Hello, Android Fingerprint)
  if (typeof window !== 'undefined' && window.PublicKeyCredential && navigator.credentials) {
    try {
      const savedCredentialId = localStorage.getItem('webauthn_credential_id');

      // If already registered, perform real-time verification (navigator.credentials.get)
      if (savedCredentialId) {
        try {
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);

          const rawId = base64UrlToUint8Array(savedCredentialId);
          const assertion = await navigator.credentials.get({
            publicKey: {
              challenge,
              timeout: 60000,
              userVerification: 'required', // Demande explicitement l'empreinte / Face ID / PIN de l'appareil
              allowCredentials: [
                {
                  id: rawId,
                  type: 'public-key',
                },
              ],
            },
          });

          if (assertion) {
            return true;
          }
        } catch (getErr: any) {
          // If the user cancelled the biometric prompt, return false
          if (getErr?.name === 'NotAllowedError' || getErr?.name === 'AbortError') {
            console.warn('Vérification biométrique annulée par l\'utilisateur:', getErr);
            return false;
          }
          // If credential is unknown or expired on device, remove saved ID and fallback to registration below
          localStorage.removeItem('webauthn_credential_id');
        }
      }

      // If no credential or first enrollment, trigger real OS registration (navigator.credentials.create)
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const newCredential = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: "Mon École Directe",
          },
          user: {
            id: userId,
            name: "utilisateur@ecole-directe.app",
            displayName: "Utilisateur Mon École Directe",
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },  // ES256
            { alg: -257, type: 'public-key' }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // Hardware sensor: Touch ID, Face ID, Empreinte digitale, Windows Hello
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;

      if (newCredential && newCredential.rawId) {
        const credId = bufferToBase64Url(newCredential.rawId);
        localStorage.setItem('webauthn_credential_id', credId);
        localStorage.setItem('biometric_enabled', 'true');
        return true;
      }
    } catch (err: any) {
      console.warn('Biométrie WebAuthn info:', err);
      if (err?.name === 'NotAllowedError' || err?.name === 'AbortError') {
        // User cancelled or biometric prompt was rejected
        return false;
      }
    }
  }

  return false;
}
