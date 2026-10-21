import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, QrCode, Map, Calendar, Wallet, Wand2 } from 'lucide-react';

interface RightEdgeMenuProps {
  onNavigate: (screen: string) => void;
  isHidden?: boolean;
}

export const RightEdgeMenu: React.FC<RightEdgeMenuProps> = ({ onNavigate, isHidden }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasClickedOnce, setHasClickedOnce] = useState(() => {
    return localStorage.getItem('rightMenuClicked') === 'true';
  });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOpenMenu = () => {
    setIsOpen(true);
    if (!hasClickedOnce) {
      setHasClickedOnce(true);
      localStorage.setItem('rightMenuClicked', 'true');
    }
  };

  if (isHidden) return null;

  const menuItems = [
    { id: 'create', label: 'Publier', icon: Megaphone, bg: 'bg-[#f45b69]', text: 'text-[#f45b69]', iconColor: 'text-white' },
    { id: 'qr_code', label: 'Code QR', icon: QrCode, bg: 'bg-[#4A90E2]', text: 'text-[#4A90E2]', iconColor: 'text-white' },
    { id: 'map', label: 'Carte', icon: Map, bg: 'bg-[#2ecc71]', text: 'text-[#2ecc71]', iconColor: 'text-white' },
    { id: 'studio_taskup', label: 'Studio TASKup', icon: Wand2, bg: 'bg-[#0ea5e9]', text: 'text-[#0ea5e9]', iconColor: 'text-white' },
    { id: 'calendar', label: 'Calendrier', icon: Calendar, bg: 'bg-[#9b59b6]', text: 'text-[#9b59b6]', iconColor: 'text-white' },
    { id: 'balance', label: 'SOLD', icon: Wallet, bg: 'bg-[#f39c12]', text: 'text-[#f39c12]', iconColor: 'text-white' },
  ];

  return (
    <>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-[150] pointer-events-none">
         <AnimatePresence>
           {!isOpen && (
             <motion.div
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 10 }}
               className="relative flex items-center justify-end"
             >
               {/* Radar Effect Ring */}
               {!hasClickedOnce && (
                 <div className="absolute right-0 w-[40px] h-[100px] rounded-l-[30px] bg-[#38bdf8]/40 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] origin-right pointer-events-none"></div>
               )}
               
               <button
                 onClick={handleOpenMenu}
                 className={`h-[80px] w-[8px] bg-gradient-to-b from-[#38bdf8] to-[#0ea5e9] rounded-l-[6px] shadow-[0_0_15px_rgba(56,189,248,0.8)] backdrop-blur-md relative overflow-hidden pointer-events-auto z-10 ${hasClickedOnce ? 'animate-pulse' : ''}`}
               >
                  <div className={`absolute inset-0 bg-white/60 mix-blend-overlay ${hasClickedOnce ? 'animate-[flash_2s_infinite]' : 'animate-[flash_0.8s_infinite]'}`}></div>
               </button>
             </motion.div>
           )}
         </AnimatePresence>

         <AnimatePresence>
           {isOpen && (
             <motion.div
               ref={menuRef}
               initial={{ x: "100%", opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               exit={{ x: "100%", opacity: 0 }}
               transition={{ type: "spring", stiffness: 350, damping: 25 }}
               className="absolute right-2 top-0 -translate-y-1/2 w-[85px] bg-gradient-to-b from-sky-300/50 to-sky-400/50 backdrop-blur-2xl rounded-[32px] shadow-[0_15px_50px_rgba(14,165,233,0.3)] flex flex-col items-center py-6 gap-5 border border-sky-200/60 pointer-events-auto"
             >
                {/* Visual dash at the top */}
                <div className="w-8 h-1 bg-white/80 rounded-full mb-1"></div>

                {menuItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onNavigate(item.id);
                      setIsOpen(false);
                    }}
                    className="flex flex-col items-center justify-center gap-1.5 w-full group relative"
                  >
                    <div className={`w-[52px] h-[52px] rounded-full ${item.bg} flex items-center justify-center shadow-md group-hover:scale-110 active:scale-95 transition-all duration-300`}>
                      <item.icon size={24} strokeWidth={2.2} className={item.iconColor} />
                    </div>
                    <span className={`text-[10px] font-bold text-center leading-tight px-1 text-gray-800`}>
                      {item.label}
                    </span>
                  </button>
                ))}
             </motion.div>
           )}
         </AnimatePresence>
      </div>

      <style>{`
        @keyframes flash {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
};
