import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Lock, Delete, Fingerprint, X, Timer, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isBiometricAvailable, verifyBiometricIdentity } from '../src/utils/biometricUtils';

interface PasswordViewProps {
  onBack: () => void;
}

type Step = 'auth' | 'menu' | 'create' | 'confirm' | 'biometric' | 'warning' | 'success' | 'removed';

const delayOptions = [
  { label: 'Immédiatement', value: 0 },
  { label: 'Après 1 minute', value: 1 },
  { label: 'Après 5 minutes', value: 5 },
  { label: 'Après 30 minutes', value: 30 },
];

export const PasswordView: React.FC<PasswordViewProps> = ({ onBack }) => {
  const [step, setStep] = useState<Step>('auth');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [selectedDelay, setSelectedDelay] = useState(0);
  const [showDelayPicker, setShowDelayPicker] = useState(false);

  useEffect(() => {
    const savedPin = localStorage.getItem('app_pin');
    const savedDelay = localStorage.getItem('lock_delay_minutes');
    setHasPin(!!savedPin);
    setSelectedDelay(savedDelay ? parseInt(savedDelay, 10) : 0);
    if (!savedPin) {
      setStep('create');
    }
  }, []);

  const activePin = step === 'confirm' || step === 'auth' ? (step === 'confirm' ? confirmPin : pin) : pin;
  const setActivePin = step === 'confirm' ? setConfirmPin : setPin;

  const handleNumClick = (num: string) => {
    if (activePin.length < 4) {
      setActivePin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setActivePin(prev => prev.slice(0, -1));
  };

  const triggerShake = () => {
    setErrorShake(true);
    setTimeout(() => setErrorShake(false), 500);
  };

  const finishSetup = (useBiometric: boolean) => {
    localStorage.setItem('app_pin', pin);
    localStorage.setItem('biometric_enabled', useBiometric ? 'true' : 'false');
    localStorage.setItem('app_is_locked', 'true');
    setHasPin(true);
    setStep('success');
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('lock-app'));
      onBack();
    }, 1200);
  };

  const handleLockNow = () => {
    localStorage.setItem('app_is_locked', 'true');
    window.dispatchEvent(new CustomEvent('lock-app'));
    onBack();
  };

  const checkBiometric = useCallback(async () => {
    try {
      const available = await isBiometricAvailable();
      if (available) {
        setBiometricAvailable(true);
        setStep('biometric');
        return;
      }
    } catch {
      // Plugin non disponible (web)
    }
    finishSetup(false);
  }, [pin]);

  const handleEnableBiometric = async () => {
    try {
      const success = await verifyBiometricIdentity({
        reason: "Authentifiez-vous pour activer le déverrouillage biométrique",
        title: "Activer l'empreinte digitale",
        subtitle: "Vérifiez votre identité",
        description: ''
      });
      finishSetup(success);
    } catch {
      finishSetup(false);
    }
  };

  const handleRemoveLock = () => {
    localStorage.removeItem('app_pin');
    localStorage.removeItem('biometric_enabled');
    localStorage.removeItem('lock_delay_minutes');
    localStorage.removeItem('app_is_locked');
    setHasPin(false);
    setPin('');
    setConfirmPin('');
    setStep('removed');
    window.dispatchEvent(new CustomEvent('unlock-app'));
    setTimeout(() => setStep('menu'), 1500);
  };

  const handleSelectDelay = (value: number) => {
    localStorage.setItem('lock_delay_minutes', value.toString());
    setSelectedDelay(value);
    setShowDelayPicker(false);
  };

  useEffect(() => {
    if (activePin.length === 4) {
      if (step === 'auth') {
        const savedPin = localStorage.getItem('app_pin');
        if (activePin === savedPin) {
          setStep('menu');
          setPin('');
        } else {
          triggerShake();
          setPin('');
        }
      } else if (step === 'create') {
        setTimeout(() => {
          setStep('confirm');
          setConfirmPin('');
        }, 300);
      } else if (step === 'confirm') {
        if (activePin === pin) {
          checkBiometric();
        } else {
          triggerShake();
          setConfirmPin('');
        }
      }
    }
  }, [activePin, pin, step, checkBiometric]);

  const tryBiometricAuth = useCallback(async () => {
    try {
      const success = await verifyBiometricIdentity({
        reason: "Déverrouillez l'application",
        title: 'Vérification',
        subtitle: "Confirmez votre identité",
        description: ''
      });
      if (success) {
        setStep('menu');
        setPin('');
      }
    } catch {
      // Échec ou annulation
    }
  }, []);

  const title = step === 'auth'
    ? 'Vérification requise'
    : step === 'menu'
    ? 'Verrouillage'
    : step === 'create'
    ? 'Nouveau code'
    : step === 'confirm'
    ? 'Confirmez le code'
    : step === 'biometric'
    ? 'Déverrouillage biométrique'
    : step === 'warning'
    ? 'Sécurité recommandée'
    : step === 'removed'
    ? 'Verrouillage supprimé'
    : 'Code enregistré';

  const subtitle = step === 'auth'
    ? "Entrez votre code actuel pour accéder\naux paramètres de sécurité"
    : step === 'menu'
    ? "Gérez la protection de votre application"
    : step === 'create'
    ? "Définissez un nouveau code PIN"
    : step === 'confirm'
    ? "Entrez à nouveau le code PIN\npour confirmer"
    : step === 'biometric'
    ? "Activez l'accès par empreinte digitale\npour plus de commodité"
    : step === 'warning'
    ? "Votre téléphone prend en charge\nl'empreinte digitale. Activez-la pour\nplus de sécurité."
    : step === 'removed'
    ? "L'application n'est plus protégée\npar un code"
    : "Votre code est sécurisé";

  const showKeypad = step === 'auth' || step === 'create' || step === 'confirm';

  return (
    <div className="fixed inset-0 z-[100] h-full w-full bg-slate-900 overflow-y-auto custom-scrollbar flex flex-col items-center justify-between font-sans select-none px-4 py-3 sm:py-6">
      <div className="w-full max-w-sm flex items-center justify-between shrink-0 mb-1">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors active:bg-white/20 cursor-pointer text-white"
          title="Retour aux paramètres"
        >
          <ChevronLeft size={26} />
        </button>
      </div>

      <div className="w-full max-w-sm flex-1 flex flex-col items-center justify-center shrink-0 my-auto pb-4 sm:pb-6">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center text-center w-full"
        >
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-2.5 sm:mb-3 shadow-md ${
            step === 'warning' 
              ? 'bg-red-500/20 text-red-400' 
              : step === 'removed' 
              ? 'bg-orange-500/20 text-orange-400' 
              : 'bg-sky-500/20 text-sky-400'
          }`}>
            {step === 'biometric' ? (
              <Fingerprint size={26} />
            ) : step === 'warning' ? (
              <X size={26} />
            ) : step === 'removed' ? (
              <Unlock size={26} />
            ) : (
              <Lock size={26} />
            )}
          </div>
          <h1 className="text-[19px] sm:text-[22px] font-bold text-white tracking-tight mb-1 text-center">{title}</h1>
          <p className="text-slate-400 text-center mb-3 sm:mb-5 text-[12px] sm:text-[13px] whitespace-pre-line leading-snug max-w-xs">
            {subtitle}
          </p>
        </motion.div>

        {showKeypad && (
          <>
            <motion.div
              animate={errorShake ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-4 sm:gap-5 mb-4 sm:mb-6 h-[22px]"
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full border-2 transition-all duration-200 ${
                    activePin.length > i 
                      ? 'bg-sky-400 border-sky-400 scale-110 shadow-md shadow-sky-400/50' 
                      : 'border-slate-600 bg-transparent'
                  }`}
                />
              ))}
            </motion.div>

            <div className="grid grid-cols-3 gap-x-6 sm:gap-x-7 gap-y-3 sm:gap-y-3.5 w-full max-w-[270px] sm:max-w-[290px] mx-auto">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  onClick={() => handleNumClick(num.toString())}
                  className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-full flex items-center justify-center text-white text-[26px] sm:text-[30px] font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 active:bg-sky-500/20 active:border-sky-400/50 transition-all cursor-pointer select-none active:scale-95 shadow-xs"
                >
                  {num}
                </button>
              ))}

              {step === 'auth' && hasPin ? (
                <button
                  onClick={tryBiometricAuth}
                  className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-full flex items-center justify-center text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 active:bg-sky-500/30 transition-all cursor-pointer active:scale-95 shadow-xs"
                  title="Utiliser l'empreinte digitale"
                >
                  <Fingerprint size={26} />
                </button>
              ) : (
                <div className="w-16 h-16 sm:w-18 sm:h-18" />
              )}

              <button
                onClick={() => handleNumClick('0')}
                className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-full flex items-center justify-center text-white text-[26px] sm:text-[30px] font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 active:bg-sky-500/20 active:border-sky-400/50 transition-all cursor-pointer select-none active:scale-95 shadow-xs"
              >
                0
              </button>

              <button
                onClick={handleBackspace}
                className="w-16 h-16 sm:w-18 sm:h-18 mx-auto rounded-full flex items-center justify-center text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 active:bg-red-500/20 active:border-red-400/50 transition-all cursor-pointer active:scale-95 shadow-xs"
                title="Effacer"
              >
                <Delete size={26} strokeWidth={1.75} />
              </button>
            </div>
          </>
        )}

        {step === 'menu' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[340px] flex flex-col gap-3 mt-2"
          >
            {hasPin && (
              <button
                onClick={handleLockNow}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 active:scale-[0.98] rounded-2xl text-white font-bold text-[16px] transition-all shadow-lg shadow-orange-500/25 cursor-pointer"
              >
                <Lock size={22} />
                <span>Verrouiller l'application</span>
              </button>
            )}

            <button
              onClick={() => {
                setStep('create');
                setPin('');
                setConfirmPin('');
              }}
              className="w-full flex items-center gap-3 px-6 py-4 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 rounded-2xl text-white font-semibold text-[16px] transition-colors shadow-lg shadow-sky-500/25 cursor-pointer"
            >
              <Lock size={22} />
              <span>{hasPin ? 'Modifier le code' : 'Définir un code'}</span>
            </button>

            <button
              onClick={() => setShowDelayPicker(true)}
              className="w-full flex items-center gap-3 px-6 py-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-2xl text-white font-semibold text-[16px] transition-colors border border-slate-700 cursor-pointer"
            >
              <Timer size={22} />
              <span>Délai de verrouillage</span>
              <span className="ml-auto text-sky-400 text-[14px] font-medium">
                {delayOptions.find(d => d.value === selectedDelay)?.label}
              </span>
            </button>

            {hasPin && (
              <button
                onClick={handleRemoveLock}
                className="w-full flex items-center gap-3 px-6 py-4 bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 rounded-2xl text-red-400 font-semibold text-[16px] transition-colors border border-red-500/20 mt-4 cursor-pointer"
              >
                <Unlock size={22} />
                <span>Supprimer le verrouillage</span>
              </button>
            )}
          </motion.div>
        )}

        <AnimatePresence>
          {step === 'biometric' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-4 mt-4"
            >
              <button
                onClick={handleEnableBiometric}
                className="flex items-center gap-3 px-8 py-4 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 rounded-full text-white font-semibold text-[16px] transition-colors shadow-lg shadow-sky-500/25 cursor-pointer"
              >
                <Fingerprint size={24} />
                <span>Activer l'empreinte digitale</span>
              </button>
              <button
                onClick={() => {
                  if (biometricAvailable) {
                    setStep('warning');
                  } else {
                    finishSetup(false);
                  }
                }}
                className="text-slate-400 text-[14px] hover:text-white transition-colors py-2 cursor-pointer"
              >
                Non merci
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {(step === 'success' || step === 'removed') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              step === 'removed' ? 'bg-orange-500/20 text-orange-400' : 'bg-green-500/20 text-green-400'
            }`}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </motion.div>
        )}

        {step === 'warning' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4 mt-4"
          >
            <button
              onClick={handleEnableBiometric}
              className="flex items-center gap-3 px-8 py-4 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 rounded-full text-white font-semibold text-[16px] transition-colors shadow-lg shadow-sky-500/25 cursor-pointer"
            >
              <Fingerprint size={24} />
              <span>Activer l'empreinte numérique</span>
            </button>
            <button
              onClick={() => finishSetup(false)}
              className="text-slate-400 text-[14px] hover:text-white transition-colors py-2 cursor-pointer"
            >
              Continuer sans empreinte
            </button>
          </motion.div>
        )}
      </div>

      {/* Delay Picker Bottom Sheet */}
      <AnimatePresence>
        {showDelayPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDelayPicker(false)}
              className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[301] bg-slate-900 rounded-t-[32px] p-6 pb-10 border-t border-slate-800"
            >
              <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-6" />
              <h2 className="text-[18px] font-bold text-white mb-6 text-center">Délai de verrouillage</h2>
              <div className="flex flex-col gap-2 max-w-md mx-auto">
                {delayOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelectDelay(opt.value)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl text-[16px] font-semibold transition-colors cursor-pointer ${
                      selectedDelay === opt.value
                        ? 'bg-sky-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {selectedDelay === opt.value && (
                      <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
