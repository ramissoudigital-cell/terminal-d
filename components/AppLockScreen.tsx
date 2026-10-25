import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Delete, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';
import { verifyBiometricIdentity } from '../src/utils/biometricUtils';

interface AppLockScreenProps {
  onUnlock: () => void;
  onLogout?: () => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({ onUnlock, onLogout }) => {
  const [pin, setPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);

  useEffect(() => {
    const biometricEnabled = localStorage.getItem('biometric_enabled') === 'true';
    setHasBiometric(biometricEnabled);

    // Auto try biometric if enabled
    if (biometricEnabled) {
      tryBiometricAuth();
    }
  }, []);

  const handleNumClick = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const triggerShake = () => {
    setErrorShake(true);
    setTimeout(() => setErrorShake(false), 500);
  };

  const tryBiometricAuth = useCallback(async () => {
    try {
      const success = await verifyBiometricIdentity({
        reason: "Déverrouillez l'application",
        title: 'Vérification',
        subtitle: "Confirmez votre identité",
        description: ''
      });
      if (success) {
        localStorage.setItem('app_last_active_timestamp', Date.now().toString());
        onUnlock();
      }
    } catch {
      // Biometric cancelled or not available on web
    }
  }, [onUnlock]);

  useEffect(() => {
    if (pin.length === 4) {
      const savedPin = localStorage.getItem('app_pin');
      if (pin === savedPin) {
        localStorage.setItem('app_last_active_timestamp', Date.now().toString());
        onUnlock();
      } else {
        triggerShake();
        setPin('');
      }
    }
  }, [pin, onUnlock]);

  return (
    <div className="fixed inset-0 z-[9999] h-full w-full bg-slate-900 overflow-y-auto custom-scrollbar flex flex-col items-center justify-center px-4 py-6 font-sans select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center max-w-sm w-full my-auto"
      >
        <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2.5 sm:mb-3 bg-sky-500/20 text-sky-400 shadow-md">
          <Lock size={26} />
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1 text-center">
          Application Verrouillée
        </h1>
        <p className="text-slate-400 text-center mb-4 sm:mb-6 text-xs sm:text-sm">
          Entrez votre code secret pour accéder à l'application
        </p>

        {/* 4 PIN Dots */}
        <motion.div
          animate={errorShake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4 sm:gap-5 mb-4 sm:mb-6 h-[18px]"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 transition-all duration-200 ${
                pin.length > i ? 'bg-sky-400 border-sky-400 scale-110 shadow-sm shadow-sky-400/50' : 'border-slate-600 bg-transparent'
              }`}
            />
          ))}
        </motion.div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-x-5 sm:gap-x-7 gap-y-2 sm:gap-y-3 w-full max-w-[240px] sm:max-w-[260px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumClick(num.toString())}
              className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center text-white text-[24px] sm:text-[28px] font-medium active:bg-white/15 hover:bg-white/5 transition-all cursor-pointer select-none active:scale-95 shadow-xs"
            >
              {num}
            </button>
          ))}
          {hasBiometric ? (
            <button
              onClick={tryBiometricAuth}
              className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center text-sky-400 active:bg-white/15 hover:bg-white/5 transition-all cursor-pointer active:scale-95"
              title="Déverrouiller avec l'empreinte"
            >
              <Fingerprint size={24} />
            </button>
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16" />
          )}
          <button
            onClick={() => handleNumClick('0')}
            className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center text-white text-[24px] sm:text-[28px] font-medium active:bg-white/15 hover:bg-white/5 transition-all cursor-pointer select-none active:scale-95 shadow-xs"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full flex items-center justify-center text-slate-400 active:bg-white/15 hover:bg-white/5 transition-all active:text-white cursor-pointer active:scale-95"
            title="Effacer"
          >
            <Delete size={24} strokeWidth={1.75} />
          </button>
        </div>

        {/* Fingerprint unlock quick button */}
        <button
          onClick={tryBiometricAuth}
          className="mt-4 px-4 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-2xl flex items-center gap-2 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
        >
          <Fingerprint size={18} />
          <span>Déverrouiller avec l'empreinte digitale</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="mt-3 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1.5 px-4 rounded-xl hover:bg-white/5 cursor-pointer"
          >
            Code oublié ? Se déconnecter
          </button>
        )}
      </motion.div>
    </div>
  );
};
