import React, { useState, useEffect, useCallback } from 'react';
import { Lock, Delete, Fingerprint, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyBiometricIdentity, isBiometricAvailable } from '../src/utils/biometricUtils';

interface AppLockScreenProps {
  onUnlock: () => void;
  onLogout?: () => void;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({ onUnlock, onLogout }) => {
  const [pin, setPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [hasBiometric, setHasBiometric] = useState(false);
  const [isAuthenticatingBiometric, setIsAuthenticatingBiometric] = useState(false);
  const [biometricFeedback, setBiometricFeedback] = useState<string | null>(null);

  useEffect(() => {
    const biometricPref = localStorage.getItem('biometric_enabled') === 'true';
    isBiometricAvailable().then((available) => {
      setHasBiometric(biometricPref || available);
    });

    // Auto prompt biometric on entry if biometric was enabled
    if (biometricPref) {
      // Small timeout to allow user interaction context
      const timer = setTimeout(() => {
        tryBiometricAuth();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNumClick = (num: string) => {
    setBiometricFeedback(null);
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setBiometricFeedback(null);
    setPin(prev => prev.slice(0, -1));
  };

  const triggerShake = () => {
    setErrorShake(true);
    setTimeout(() => setErrorShake(false), 500);
  };

  const tryBiometricAuth = useCallback(async () => {
    if (isAuthenticatingBiometric) return;
    setIsAuthenticatingBiometric(true);
    setBiometricFeedback(null);

    try {
      const success = await verifyBiometricIdentity({
        reason: "Déverrouillez Mon École Directe avec votre empreinte ou Face ID",
        title: "Authentification biométrique",
        subtitle: "Confirmez votre identité pour continuer",
        description: "Vérification en temps réel par capteur d'empreinte ou Face ID"
      });

      if (success) {
        localStorage.setItem('app_last_active_timestamp', Date.now().toString());
        onUnlock();
      } else {
        setBiometricFeedback("Biométrie non reconnue ou annulée");
        setTimeout(() => setBiometricFeedback(null), 3500);
      }
    } catch (e) {
      console.warn("Erreur d'authentification biométrique:", e);
      setBiometricFeedback("Erreur biométrique. Entrez votre code PIN.");
      setTimeout(() => setBiometricFeedback(null), 3500);
    } finally {
      setIsAuthenticatingBiometric(false);
    }
  }, [isAuthenticatingBiometric, onUnlock]);

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
    <div className="fixed inset-0 z-[9999] h-full w-full bg-slate-950/95 backdrop-blur-xl overflow-y-auto custom-scrollbar flex flex-col items-center justify-center px-4 py-8 font-sans select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col items-center max-w-md w-full my-auto py-2"
      >
        {/* Enlarged Lock Icon Badge */}
        <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center mb-3 sm:mb-4 bg-gradient-to-tr from-sky-500/25 to-indigo-500/25 border border-sky-400/30 text-sky-400 shadow-xl shadow-sky-500/15">
          {isAuthenticatingBiometric ? (
            <Fingerprint className="w-9 h-9 sm:w-10 sm:h-10 text-sky-400 animate-pulse" />
          ) : (
            <Lock className="w-9 h-9 sm:w-10 sm:h-10 text-sky-400" />
          )}
        </div>

        {/* Zoomed Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1.5 text-center">
          Application Verrouillée
        </h1>
        <p className="text-slate-300 text-center mb-5 sm:mb-7 text-sm sm:text-base font-medium max-w-xs leading-snug">
          Entrez votre code secret ou utilisez votre empreinte digitale
        </p>

        {/* Biometric Status Feedback */}
        <AnimatePresence>
          {biometricFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold flex items-center gap-2"
            >
              <AlertCircle size={16} />
              <span>{biometricFeedback}</span>
            </motion.div>
          )}
          {isAuthenticatingBiometric && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 px-4 py-2 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs sm:text-sm font-semibold flex items-center gap-2"
            >
              <Loader2 size={16} className="animate-spin text-sky-400" />
              <span>Capteur biométrique actif...</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enlarged 4 PIN Dots */}
        <motion.div
          animate={errorShake ? { x: [-12, 12, -10, 10, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-5 sm:gap-6 mb-6 sm:mb-8 h-6"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full border-2 transition-all duration-200 ${
                pin.length > i
                  ? 'bg-sky-400 border-sky-300 scale-110 shadow-lg shadow-sky-400/60 ring-2 ring-sky-400/30'
                  : 'border-slate-600 bg-slate-800/60'
              }`}
            />
          ))}
        </motion.div>

        {/* Zoomed Keypad */}
        <div className="grid grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-3.5 sm:gap-y-4 w-full max-w-[280px] sm:max-w-[320px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumClick(num.toString())}
              className="w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center text-white text-[28px] sm:text-[32px] font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 active:bg-sky-500/25 active:border-sky-400/60 transition-all cursor-pointer select-none active:scale-95 shadow-md"
            >
              {num}
            </button>
          ))}

          {/* Biometric Icon Key */}
          {hasBiometric ? (
            <button
              onClick={tryBiometricAuth}
              disabled={isAuthenticatingBiometric}
              className={`w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 active:bg-sky-500/30 transition-all cursor-pointer active:scale-95 shadow-md ${
                isAuthenticatingBiometric ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              title="Déverrouiller avec l'empreinte digitale ou Face ID"
            >
              {isAuthenticatingBiometric ? (
                <Loader2 size={28} className="animate-spin text-sky-400" />
              ) : (
                <Fingerprint size={30} className="text-sky-400" />
              )}
            </button>
          ) : (
            <div className="w-18 h-18 sm:w-20 sm:h-20" />
          )}

          {/* 0 Key */}
          <button
            onClick={() => handleNumClick('0')}
            className="w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center text-white text-[28px] sm:text-[32px] font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 active:bg-sky-500/25 active:border-sky-400/60 transition-all cursor-pointer select-none active:scale-95 shadow-md"
          >
            0
          </button>

          {/* Backspace Key */}
          <button
            onClick={handleBackspace}
            className="w-18 h-18 sm:w-20 sm:h-20 mx-auto rounded-full flex items-center justify-center text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 active:bg-red-500/20 active:border-red-400/50 transition-all cursor-pointer active:scale-95 shadow-md"
            title="Effacer"
          >
            <Delete size={28} strokeWidth={1.8} />
          </button>
        </div>

        {/* Enlarged Biometric quick button */}
        <button
          onClick={tryBiometricAuth}
          disabled={isAuthenticatingBiometric}
          className="mt-6 px-6 py-3.5 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 text-sky-300 border border-sky-500/40 rounded-2xl flex items-center gap-2.5 text-sm sm:text-base font-bold transition-all cursor-pointer active:scale-95 shadow-lg shadow-sky-500/15"
        >
          {isAuthenticatingBiometric ? (
            <Loader2 size={20} className="animate-spin text-sky-400" />
          ) : (
            <Fingerprint size={22} className="text-sky-400" />
          )}
          <span>Déverrouiller avec l'empreinte digitale</span>
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="mt-4 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors py-2 px-5 rounded-xl hover:bg-white/5 cursor-pointer"
          >
            Code secret oublié ? Se déconnecter
          </button>
        )}
      </motion.div>
    </div>
  );
};
