import React from 'react';
import { motion } from 'framer-motion';
import { School } from 'lucide-react';

interface AppSplashScreenProps {
  onFinish?: () => void;
}

export const AppSplashScreen: React.FC<AppSplashScreenProps> = () => {
  return (
    <motion.div
      key="app-global-splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 z-[999999] bg-[#BFDBFE] flex flex-col items-center justify-center select-none overflow-hidden"
      style={{ backgroundColor: '#BFDBFE' }}
    >
      {/* Decorative ambient blurred circles */}
      <div className="absolute w-80 h-80 rounded-full bg-white/40 blur-3xl pointer-events-none -top-10 -left-10" />
      <div className="absolute w-80 h-80 rounded-full bg-sky-300/40 blur-3xl pointer-events-none -bottom-10 -right-10" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center px-6 max-w-xs"
      >
        {/* Logo / Badge */}
        <div className="relative mb-5">
          <div className="absolute -inset-2.5 rounded-3xl bg-white/60 blur-md animate-pulse" />
          <div className="w-24 h-24 rounded-3xl bg-white/90 backdrop-blur-md border border-white/80 p-3.5 shadow-2xl flex items-center justify-center relative z-10">
            <img 
              src="logo.png" 
              alt="Terminale-D" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = document.getElementById('splash-fallback-icon');
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <School id="splash-fallback-icon" className="w-12 h-12 text-sky-700 hidden" />
          </div>
        </div>

        {/* App Title */}
        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1.5">
          Terminale-D
        </h1>
        <p className="text-xs font-semibold text-blue-900 tracking-wide uppercase">
          Collège &amp; Lycée d'Excellence
        </p>

        {/* Loading bar */}
        <div className="mt-8 w-16 h-1.5 bg-blue-900/15 rounded-full overflow-hidden relative">
          <motion.div 
            className="absolute inset-y-0 bg-blue-600 rounded-full"
            animate={{
              left: ['-50%', '100%'],
              width: ['40%', '60%']
            }}
            transition={{
              repeat: Infinity,
              duration: 1.1,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
