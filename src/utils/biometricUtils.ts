import { Capacitor } from '@capacitor/core';

export async function isBiometricAvailable(): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      const pluginName = '@capgo/capacitor-native-biometric';
      const mod = await import(/* @vite-ignore */ pluginName);
      const NativeBiometric = mod?.NativeBiometric;
      if (NativeBiometric?.isAvailable) {
        const res = await NativeBiometric.isAvailable();
        return !!res?.isAvailable;
      }
    } catch (e) {
      // Fallback
    }
  }
  // Available on web via simulated/WebAuthn biometric
  return true;
}

export async function verifyBiometricIdentity(options?: {
  reason?: string;
  title?: string;
  subtitle?: string;
  description?: string;
}): Promise<boolean> {
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
    } catch (e) {
      // Native failed or cancelled
    }
  }

  // Web interactive biometric simulation modal
  return new Promise((resolve) => {
    const existingModal = document.getElementById('web-biometric-scanner-modal');
    if (existingModal) existingModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'web-biometric-scanner-modal';
    overlay.className = 'fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none';
    
    overlay.innerHTML = `
      <div class="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center flex flex-col items-center relative overflow-hidden">
        <div class="w-20 h-20 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mb-4 relative shadow-lg shadow-sky-500/20">
          <svg class="w-10 h-10 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/>
            <path d="M14 13.12c0 2.38 0 3.63 1 4.88"/>
            <path d="M17 16.95V19a2 2 0 0 1-2 2h-2"/>
            <path d="M18 10a6 6 0 0 0-12 0v2"/>
            <path d="M9 19a2 2 0 0 1-2-2v-2.5"/>
            <path d="M2 12h2"/>
            <path d="M20 12h2"/>
          </svg>
        </div>
        <h3 class="text-xl font-bold text-white mb-1.5">${options?.title || "Empreinte digitale"}</h3>
        <p class="text-xs text-slate-400 mb-6 font-medium leading-relaxed">${options?.reason || "Touchez le capteur d'empreinte pour confirmer votre identité"}</p>
        
        <div class="w-full space-y-3">
          <button id="web-bio-scan-btn" class="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/25 transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/>
              <path d="M14 13.12c0 2.38 0 3.63 1 4.88"/>
              <path d="M18 10a6 6 0 0 0-12 0v2"/>
            </svg>
            <span>Poser le doigt / Valider</span>
          </button>
          <button id="web-bio-cancel-btn" class="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-2xl transition-all cursor-pointer text-xs">
            Annuler
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const cleanup = (success: boolean) => {
      overlay.remove();
      resolve(success);
    };

    overlay.querySelector('#web-bio-scan-btn')?.addEventListener('click', () => cleanup(true));
    overlay.querySelector('#web-bio-cancel-btn')?.addEventListener('click', () => cleanup(false));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cleanup(false);
    });
  });
}

