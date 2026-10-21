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
    <div className="fixed inset-0 z-[9999] h-full w-full bg-slate-900 overflow-hidden flex flex-col items-center justify-center px-6 font-sans select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center max-w-sm w-full"
      >
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-sky-500/20 text-sky-400 shadow-lg shadow-sky-500/10">
          <Lock size={32} />
        </div>

        <h1 className="text-2xl font-bold text-white tracking-tight mb-2 text-center">
          Application Verrouillée
        </h1>
        <p className="text-slate-400 text-center mb-8 text-sm">
          Entrez votre code secret pour accéder à l'application
        </p>

        {/* 4 PIN Dots */}
        <motion.div
          animate={errorShake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-6 mb-8 h-[20px]"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-[18px] h-[18px] rounded-full border-2 transition-all duration-200 ${
                pin.length > i ? 'bg-sky-400 border-sky-400 scale-110 shadow-sm shadow-sky-400/50' : 'border-slate-600 bg-transparent'
              }`}
            />
          ))}
        </motion.div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6 w-full max-w-[280px]">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumClick(num.toString())}
              className="w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center text-white text-[28px] sm:text-[32px] font-medium active:bg-white/10 transition-colors cursor-pointer select-none"
            >
              {num}
            </button>
          ))}
          {hasBiometric ? (
            <button
              onClick={tryBiometricAuth}
              className="w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center text-sky-400 active:bg-white/10 transition-colors cursor-pointer"
              title="Déverrouiller avec l'empreinte"
            >
              <Fingerprint size={28} />
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={() => handleNumClick('0')}
            className="w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center text-white text-[28px] sm:text-[32px] font-medium active:bg-white/10 transition-colors cursor-pointer select-none"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center text-slate-400 active:bg-white/10 transition-colors active:text-white cursor-pointer"
            title="Effacer"
          >
            <Delete size={28} strokeWidth={1.5} />
          </button>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="mt-8 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-2 px-4 rounded-xl hover:bg-white/5 cursor-pointer"
          >
            Code oublié ? Se déconnecter
          </button>
        )}
      </motion.div>
    </div>
  );
};
