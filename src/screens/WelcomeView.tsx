import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, User, Briefcase, ChevronRight, Check } from 'lucide-react';
import welcome3DImg from '../assets/images/welcome_3d_team_1780412148526.png';

interface WelcomeViewProps {
  onEnterApp: (role: 'client' | 'freelancer') => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({ onEnterApp }) => {
  const [selectedRole, setSelectedRole] = useState<'client' | 'freelancer'>('client');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStart = () => {
    setIsSubmitting(true);
    // Smooth transition delay to enjoy the feedback animation
    setTimeout(() => {
      onEnterApp(selectedRole);
    }, 600);
  };

  return (
    <div 
      id="welcome-screen-container"
      className="relative flex flex-col justify-between h-full bg-gradient-to-b from-[#FAFBFD] via-[#F4F9FF] to-[#E9F3FF] p-6 text-slate-800"
    >
      {/* Dynamic Background decorative gradients */}
      <div className="absolute top-[10%] right-[-10%] w-[180px] h-[180px] bg-[#4A90E2]/10 rounded-full blur-[40px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-15%] w-[220px] h-[220px] bg-[#EC4899]/5 rounded-full blur-[50px] pointer-events-none" />

      {/* Top Main Illustration Container - Full Bleed at top & sides */}
      <motion.div 
        id="illustration-card-container"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-[calc(100%+3rem)] -mx-6 -mt-6 bg-[#4A90E2] rounded-b-[40px] flex items-center justify-center relative overflow-hidden shadow-[0_16px_40px_rgba(74,144,226,0.22)] border-none aspect-[1/0.95] shrink-0"
      >
        {/* Custom Premium 3D Render Illustration - Absolute full-bleed to fill the top space beautifully */}
        <motion.img 
          src={welcome3DImg} 
          alt="3D Team Collaboration" 
          referrerPolicy="no-referrer"
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
      </motion.div>

      {/* Middle Text Content Block */}
      <div id="welcome-text-content" className="my-auto py-4 text-center max-w-[320px] mx-auto shrink-0">
        <motion.h1 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-[25px] font-black text-slate-900 tracking-tight leading-[1.15]"
        >
          Bienvenue sur <span className="text-[#4A90E2] font-black">TASKup</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="text-[12.5px] text-slate-500 font-medium leading-relaxed mt-2.5 px-2"
        >
          Trouvez instantanément l'artisan idéal pour vos projets, ou proposez vos compétences pour gagner de l'argent.
        </motion.p>
      </div>

      {/* Interactive Bottom Box */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
        className="w-full flex flex-col gap-4 bg-white p-4.5 rounded-[28px] shadow-[0_12px_32px_rgba(74,144,226,0.06)] border border-slate-100/80 mt-auto shrink-0"
      >
        {/* Label above segment control */}
        <div className="flex items-center justify-between px-1.5">
          <span className="text-[11.5px] font-extrabold tracking-wider text-slate-400 uppercase flex items-center gap-1">
            <Sparkles size={11} className="text-amber-500" /> Choisir votre rôle
          </span>
          <span className="text-[11px] font-semibold text-[#4A90E2] bg-[#E4EFFF] px-2 py-0.5 rounded-full">
            Recommandé
          </span>
        </div>

        {/* High-fidelity Segment Switcher mimicking the register/sign-in container */}
        <div 
          id="role-switch-container"
          className="p-1 bg-slate-100 rounded-[18px] flex relative h-13 border border-slate-200/50"
        >
          <button 
            type="button"
            id="role-client-toggle"
            onClick={() => {
              setSelectedRole('client');
              setIsSubmitting(false);
            }}
            className={`flex-1 text-center font-bold text-[13.5px] rounded-[14px] flex items-center justify-center gap-2 relative z-10 transition-all duration-300 ${
              selectedRole === 'client' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User size={15} strokeWidth={selectedRole === 'client' ? 2.5 : 2} />
            Client
          </button>
          
          <button 
            type="button"
            id="role-freelancer-toggle"
            onClick={() => {
              setSelectedRole('freelancer');
              setIsSubmitting(false);
            }}
            className={`flex-1 text-center font-bold text-[13.5px] rounded-[14px] flex items-center justify-center gap-2 relative z-10 transition-all duration-300 ${
              selectedRole === 'freelancer' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Briefcase size={15} strokeWidth={selectedRole === 'freelancer' ? 2.5 : 2} />
            Prestataire
          </button>
          
          {/* Spring Slider Indicator background */}
          <motion.div 
            id="role-active-indicator"
            className="absolute top-1 bottom-1 bg-white rounded-[14px] shadow-[0_3px_12px_rgba(0,0,0,0.06)] border border-slate-200/20 z-0"
            style={{ 
              width: 'calc(50% - 4px)',
            }}
            animate={{ 
              left: selectedRole === 'client' ? '4px' : 'calc(50%)'
            }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
          />
        </div>

        {/* Dynamic Context Text explaining what the selection does */}
        <div className="min-h-[34px] flex items-center justify-center px-2">
          <AnimatePresence mode="wait">
            {selectedRole === 'client' ? (
              <motion.span 
                key="client-text"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-[11.5px] text-slate-500 font-semibold text-center"
              >
                👀 Vous pourrez publier vos besoins de service et engager nos prestataires certifiés.
              </motion.span>
            ) : (
              <motion.span 
                key="freelancer-text"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="text-[11.5px] text-slate-500 font-semibold text-center"
              >
                💼 Vous pourrez postuler aux annonces et proposer vos services d'expert.
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom CTA Action Button */}
        <motion.button
          id="welcome-commencer-button"
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          disabled={isSubmitting}
          className="w-full py-4.5 bg-gradient-to-r from-[#4A90E2] to-[#357ABD] text-white rounded-2xl font-bold text-[14px] flex items-center justify-center gap-1.5 shadow-[0_8px_25px_rgba(74,144,226,0.3)] hover:opacity-95 transition-all cursor-pointer"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-1">
              Configuration de votre profil... <Check size={16} className="animate-bounce" />
            </span>
          ) : (
            <>
              Commencer l'expérience <ArrowRight size={16} />
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Tiny clean footer copyright */}
      <span className="text-[9.5px] text-slate-400/80 font-bold tracking-wider uppercase text-center mt-3 block z-10 shrink-0">
        TASKup SAFE SPACE • SECURED BY ECOSYSTEM
      </span>
    </div>
  );
};
