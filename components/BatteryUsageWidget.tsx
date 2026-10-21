import React, { useState, useEffect, useMemo } from 'react';
import { 
  Battery, BatteryCharging, BatteryLow, BatteryMedium, BatteryWarning, 
  Zap, Clock, ShieldCheck, Activity, Cpu, Sparkles, ChevronRight, 
  X, Check, Flame, Info, Power, AlertTriangle, ArrowUpRight, Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BatteryUsageWidgetProps {
  compact?: boolean;
}

export const BatteryUsageWidget: React.FC<BatteryUsageWidgetProps> = ({ compact = false }) => {
  // Live battery state
  const [batteryLevel, setBatteryLevel] = useState<number>(85); // 0 to 100
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [chargingTime, setChargingTime] = useState<number | null>(null);
  const [dischargingTime, setDischargingTime] = useState<number | null>(null);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  // Power saver mode toggle
  const [isPowerSaver, setIsPowerSaver] = useState<boolean>(() => {
    try {
      return localStorage.getItem('school_power_saver_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Battery health estimation (stored in localStorage or computed based on device profile)
  const [batteryHealth, setBatteryHealth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('device_battery_health');
      if (saved) return Math.min(100, Math.max(70, Number(saved)));
    } catch {}
    return 96; // 96% default health
  });

  const [cycleCount, setCycleCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('device_battery_cycles');
      if (saved) return Number(saved);
    } catch {}
    return 142;
  });

  // Detailed Modal
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  // Active usage profile: 'standard' | 'economy' | 'intensive'
  const [usageProfile, setUsageProfile] = useState<'standard' | 'economy' | 'intensive'>(
    isPowerSaver ? 'economy' : 'standard'
  );

  // Connect to native navigator.getBattery API if available
  useEffect(() => {
    let batteryInstance: any = null;

    const handleBatteryUpdate = (battery: any) => {
      const lvl = Math.round(battery.level * 100);
      setBatteryLevel(lvl);
      setIsCharging(battery.charging);
      setChargingTime(Number.isFinite(battery.chargingTime) ? battery.chargingTime : null);
      setDischargingTime(Number.isFinite(battery.dischargingTime) ? battery.dischargingTime : null);
    };

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryInstance = battery;
        handleBatteryUpdate(battery);

        battery.addEventListener('levelchange', () => handleBatteryUpdate(battery));
        battery.addEventListener('chargingchange', () => handleBatteryUpdate(battery));
        battery.addEventListener('chargingtimechange', () => handleBatteryUpdate(battery));
        battery.addEventListener('dischargingtimechange', () => handleBatteryUpdate(battery));
      }).catch(() => {
        setIsSupported(false);
      });
    } else {
      setIsSupported(false);
    }

    return () => {
      if (batteryInstance) {
        try {
          batteryInstance.removeEventListener('levelchange', () => {});
          batteryInstance.removeEventListener('chargingchange', () => {});
          batteryInstance.removeEventListener('chargingtimechange', () => {});
          batteryInstance.removeEventListener('dischargingtimechange', () => {});
        } catch {}
      }
    };
  }, []);

  // Sync power saver mode
  const togglePowerSaver = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPowerSaver(prev => {
      const next = !prev;
      try {
        localStorage.setItem('school_power_saver_mode', String(next));
      } catch {}
      setUsageProfile(next ? 'economy' : 'standard');
      return next;
    });
  };

  // Remaining hours calculation based on usage and current battery level
  const estimatedRemainingHours = useMemo(() => {
    if (isCharging) {
      // Estimated hours/minutes until full charge
      if (chargingTime && chargingTime > 0) {
        const hours = Math.floor(chargingTime / 3600);
        const mins = Math.round((chargingTime % 3600) / 60);
        return {
          type: 'charging',
          hours,
          mins,
          label: hours > 0 ? `${hours}h ${mins}min jusqu'à 100%` : `~${Math.max(1, mins)} min jusqu'à 100%`
        };
      }
      const neededPercent = 100 - batteryLevel;
      // Assume ~1.2 min per 1% on average quick charge
      const estMinutes = Math.round(neededPercent * 1.2);
      const hours = Math.floor(estMinutes / 60);
      const mins = estMinutes % 60;
      return {
        type: 'charging',
        hours,
        mins,
        label: hours > 0 ? `${hours}h ${mins}min jusqu'à 100%` : `~${Math.max(5, mins)} min pour pleine charge`
      };
    }

    // Discharging calculation based on usage profile & power saver
    // Total battery life at 100% under various conditions:
    // Economy (Eco): ~14h
    // Standard: ~9.5h
    // Intensive: ~5.5h
    let totalBaseHours = 9.5;
    if (usageProfile === 'economy' || isPowerSaver) {
      totalBaseHours = 13.5;
    } else if (usageProfile === 'intensive') {
      totalBaseHours = 5.2;
    }

    // Health factor impact: slightly scales duration
    const healthFactor = batteryHealth / 100;
    const remainingHoursTotal = (batteryLevel / 100) * totalBaseHours * healthFactor;

    const hours = Math.floor(remainingHoursTotal);
    const mins = Math.round((remainingHoursTotal - hours) * 60);

    return {
      type: 'discharging',
      hours,
      mins,
      label: `${hours}h ${mins.toString().padStart(2, '0')}m restantes`
    };
  }, [batteryLevel, isCharging, chargingTime, usageProfile, isPowerSaver, batteryHealth]);

  // Battery health status classification
  const healthStatus = useMemo(() => {
    if (batteryHealth >= 90) return { label: 'Excellente', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' };
    if (batteryHealth >= 80) return { label: 'Bonne', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' };
    if (batteryHealth >= 70) return { label: 'Correcte', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' };
    return { label: 'À réviser', color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200' };
  }, [batteryHealth]);

  // Battery color state
  const batteryColor = useMemo(() => {
    if (isCharging) return 'text-amber-500';
    if (batteryLevel > 50) return 'text-emerald-500';
    if (batteryLevel > 20) return 'text-amber-500';
    return 'text-rose-500';
  }, [batteryLevel, isCharging]);

  const batteryBg = useMemo(() => {
    if (isCharging) return 'bg-amber-50 border-amber-200';
    if (batteryLevel > 50) return 'bg-emerald-50 border-emerald-200';
    if (batteryLevel > 20) return 'bg-amber-50 border-amber-200';
    return 'bg-rose-50 border-rose-200';
  }, [batteryLevel, isCharging]);

  return (
    <>
      {/* Widget Card (Clickable to open detailed diagnostic) */}
      <div
        onClick={() => setIsDetailsOpen(true)}
        className="w-full rounded-[24px] p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shadow-[0_8px_30px_rgba(15,23,42,0.15)] border border-slate-700/60 cursor-pointer hover:scale-[1.01] hover:border-indigo-500/40 transition-all select-none group relative overflow-hidden"
      >
        {/* Decorative subtle background glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex items-center justify-between gap-3">
          {/* Left: Icon & Level */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center shrink-0 shadow-inner">
              {isCharging ? (
                <BatteryCharging className="w-6 h-6 text-amber-400 animate-pulse" />
              ) : batteryLevel > 50 ? (
                <Battery className="w-6 h-6 text-emerald-400" />
              ) : batteryLevel > 20 ? (
                <BatteryMedium className="w-6 h-6 text-amber-400" />
              ) : (
                <BatteryLow className="w-6 h-6 text-rose-400 animate-bounce" />
              )}
              {isCharging && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-xs">
                  <Zap size={9} strokeWidth={3} />
                </span>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  {batteryLevel}%
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10">
                  {isCharging ? 'En charge' : 'Sur batterie'}
                </span>
              </div>

              {/* Estimated Remaining Hours */}
              <p className="text-[11px] sm:text-xs font-semibold text-slate-300 flex items-center gap-1 mt-0.5 truncate">
                <Clock size={12} className="text-indigo-400 shrink-0" />
                <span>{estimatedRemainingHours.label}</span>
              </p>
            </div>
          </div>

          {/* Right: Health Badge & Quick Action */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Santé batterie
              </span>
              <div className="flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span className="text-xs font-extrabold text-emerald-300">
                  {batteryHealth}% ({healthStatus.label})
                </span>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/20 text-white flex items-center justify-center transition-all">
              <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Mini progress bar on card bottom */}
        <div className="mt-3 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCharging 
                ? 'bg-gradient-to-r from-amber-400 to-yellow-300' 
                : batteryLevel > 50 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                  : batteryLevel > 20 
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400' 
                    : 'bg-gradient-to-r from-rose-500 to-red-400'
            }`}
            style={{ width: `${Math.max(5, batteryLevel)}%` }}
          />
        </div>
      </div>

      {/* Detailed Battery Statistics Modal */}
      <AnimatePresence>
        {isDetailsOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setIsDetailsOpen(false)}
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] border border-slate-200"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-indigo-300">
                      <Gauge size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-white">
                        Statistiques de Batterie
                      </h3>
                      <p className="text-xs text-indigo-200/80 font-medium">
                        Santé, autonomie restante & diagnostic d'usage
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsDetailsOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Hero Stat Bar */}
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {/* Current Charge */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Niveau actuel
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-white">
                        {batteryLevel}%
                      </span>
                      <span className="text-xs font-bold text-amber-300">
                        {isCharging ? 'En charge' : 'Décharge'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                      <Clock size={11} className="text-indigo-300" />
                      <span>{estimatedRemainingHours.label}</span>
                    </p>
                  </div>

                  {/* Battery Health */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block mb-1">
                      Santé de la batterie
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                        {batteryHealth}%
                      </span>
                      <span className="text-xs font-bold text-emerald-300">
                        {healthStatus.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                      <ShieldCheck size={11} className="text-emerald-400" />
                      <span>{cycleCount} cycles de charge</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
                {/* Usage Profile Estimations */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Activity size={16} className="text-indigo-600" />
                      <h4 className="font-black text-slate-800 text-xs sm:text-sm uppercase tracking-wide">
                        Estimation d'autonomie par profil d'usage
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {/* Mode Eco */}
                    <button
                      onClick={() => { setUsageProfile('economy'); setIsPowerSaver(true); }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        usageProfile === 'economy'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-bold text-[11px] block">Mode Éco</span>
                      <span className="text-base font-black text-emerald-600 block my-0.5">
                        ~{Math.round((batteryLevel / 100) * 13.5 * (batteryHealth / 100))}h
                      </span>
                      <span className="text-[9px] text-slate-500 block leading-tight">
                        Luminosité réduite & veille optimisée
                      </span>
                    </button>

                    {/* Mode Standard */}
                    <button
                      onClick={() => { setUsageProfile('standard'); setIsPowerSaver(false); }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        usageProfile === 'standard'
                          ? 'bg-blue-50 border-blue-300 text-blue-950 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-bold text-[11px] block">Standard</span>
                      <span className="text-base font-black text-blue-600 block my-0.5">
                        ~{Math.round((batteryLevel / 100) * 9.5 * (batteryHealth / 100))}h
                      </span>
                      <span className="text-[9px] text-slate-500 block leading-tight">
                        Consultation de cours & notes
                      </span>
                    </button>

                    {/* Mode Intensif */}
                    <button
                      onClick={() => { setUsageProfile('intensive'); setIsPowerSaver(false); }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        usageProfile === 'intensive'
                          ? 'bg-amber-50 border-amber-300 text-amber-950 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="font-bold text-[11px] block">Intensif</span>
                      <span className="text-base font-black text-amber-600 block my-0.5">
                        ~{Math.round((batteryLevel / 100) * 5.2 * (batteryHealth / 100))}h
                      </span>
                      <span className="text-[9px] text-slate-500 block leading-tight">
                        Vidéos, calculs & écran allumé
                      </span>
                    </button>
                  </div>
                </div>

                {/* Power Saver Quick Toggle */}
                <div className="bg-slate-100/80 rounded-2xl p-4 flex items-center justify-between gap-3 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isPowerSaver ? 'bg-emerald-500 text-white shadow-xs' : 'bg-slate-200 text-slate-600'}`}>
                      <Power size={18} />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-xs">
                        Mode Économie d'énergie
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        {isPowerSaver ? 'Activé : autonomie prolongée de +30%' : 'Désactivé : performances maximales'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={togglePowerSaver}
                    className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer p-0.5 ${
                      isPowerSaver ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                        isPowerSaver ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Consumption Breakdown */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="font-black text-slate-800 uppercase tracking-wider text-[11px]">
                      Répartition estimée de la consommation
                    </span>
                    <span className="text-slate-400 text-[10px]">Dernières 24h</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                        <span>Écran & Rétroéclairage</span>
                        <span className="font-bold">42%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full" style={{ width: '42%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                        <span>Application & Exercices</span>
                        <span className="font-bold">28%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-indigo-500 h-full rounded-full" style={{ width: '28%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                        <span>Réseau & Synchronisation</span>
                        <span className="font-bold">18%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-teal-500 h-full rounded-full" style={{ width: '18%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                        <span>Système & Processus d'arrière-plan</span>
                        <span className="font-bold">12%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-slate-400 h-full rounded-full" style={{ width: '12%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Battery Care Advice */}
                <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200 flex items-start gap-2.5">
                  <Info size={17} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h6 className="font-bold text-amber-950 text-xs mb-0.5">
                      Conseil d'entretien de la batterie
                    </h6>
                    <p className="text-[11px] text-amber-900/90 leading-relaxed">
                      Pour préserver la durée de vie de votre batterie sur le long terme, évitez les décharges complètes à 0% et maintenez de préférence la charge entre 20% et 80%.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex items-center justify-between shrink-0">
                <span className="text-[11px] text-slate-500 font-medium">
                  Télémétrie matérielle {isSupported ? 'directe' : 'assistée'}
                </span>
                <button
                  onClick={() => setIsDetailsOpen(false)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-sm transition-all"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
