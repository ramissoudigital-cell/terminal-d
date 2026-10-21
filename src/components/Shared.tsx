import { ScreenState } from '../types';
import { Home, Folder, Inbox, Battery, Wifi, Signal, Search, Megaphone, MessageCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const BottomNav = ({ currentScreen, setScreen, isHidden }: { currentScreen: ScreenState, setScreen: (s: ScreenState) => void, isHidden?: boolean }) => {
  return (
    <AnimatePresence>
      {!isHidden && (
        <motion.div
          initial="hidden"
          animate="show"
          exit="exit"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            },
            exit: {
              opacity: 0,
              transition: { staggerChildren: 0.05, staggerDirection: -1 }
            }
          }}
          className="absolute bottom-6 left-0 right-0 flex justify-center items-center space-x-[4px] z-50 pointer-events-auto px-4"
        >
          {[
            { 
              id: 'dashboard', 
              name: 'Accueil', 
              icon: (active: boolean) => <Home size={22} color={active ? "white" : "currentColor"} strokeWidth={active ? 2.5 : 2} className={active ? "" : "text-slate-400"} />
            },
            {
              id: 'invite',
              name: 'Recherche',
              icon: (active: boolean) => <Search size={22} color={active ? "white" : "currentColor"} strokeWidth={active ? 2.5 : 2} className={active ? "" : "text-slate-400"} />
            },
            {
              id: 'create',
              name: 'Publier',
              icon: (active: boolean) => <Megaphone size={22} color={active ? "white" : "currentColor"} strokeWidth={active ? 2.5 : 2} className={active ? "" : "text-slate-400"} />
            },
            {
              id: 'chat',
              name: 'Chat',
              icon: (active: boolean) => <MessageCircle size={22} color={active ? "white" : "currentColor"} strokeWidth={active ? 2.5 : 2} className={active ? "" : "text-slate-400"} />
            },
            {
              id: 'news',
              name: 'Profil',
              icon: (active: boolean) => <User size={22} color={active ? "white" : "currentColor"} strokeWidth={active ? 2.5 : 2} className={active ? "" : "text-slate-400"} />
            }
          ].map((item) => {
            const isActive = currentScreen === item.id;
            return (
                <motion.div
                  key={item.id}
                  variants={{
                    hidden: { y: 100, opacity: 0 },
                    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
                    exit: { y: 100, opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }
                  }}
                  className="relative"
                >
                  <motion.button 
                    layout
                    onClick={() => setScreen(item.id as ScreenState)}
                    className={`flex items-center justify-center hover:opacity-80 rounded-full h-[48px] transition-all duration-300 relative ${isActive ? "bg-[#0ea5e9] px-5 shadow-[0_8px_20px_rgba(14,165,233,0.5)] z-20 -translate-y-3" : "bg-white/90 backdrop-blur-2xl border border-white px-0 w-[48px] z-10 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.08)]"}`}
                    style={{ borderRadius: 24 }}
                  >
                    <motion.div layout className="flex-shrink-0 relative z-10">
                      {item.icon(isActive)}
                    </motion.div>
                    <AnimatePresence>
                      {isActive && (
                        <motion.span 
                          initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                          animate={{ opacity: 1, width: 'auto', marginLeft: 8 }}
                          exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-white font-bold text-[14px] tracking-wide whitespace-nowrap overflow-hidden relative z-10"
                        >
                          {item.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>
            )
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const CircularProgress = ({ value, label, color, ringColor }: { value: string, label: string, color: string, ringColor: string }) => {
  const dashArray = 200;
  const percentage = parseInt(value.replace('%', ''));
  const dashOffset = dashArray - (dashArray * percentage) / 100;

  return (
    <div className="relative flex flex-col items-center justify-center w-24 h-24">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="32" fill="none" stroke="#F1F3F5" strokeWidth="3.5" />
        <circle 
          cx="40" 
          cy="40" 
          r="32" 
          fill="none" 
          stroke={ringColor} 
          strokeWidth="3.5" 
          strokeDasharray={dashArray}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
        <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">{label}</span>
        <span className="text-xl text-[#2D3142] font-semibold">{value}</span>
      </div>
    </div>
  );
};
