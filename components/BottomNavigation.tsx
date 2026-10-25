import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ClipboardCheck, GraduationCap, BookOpen, Calendar, Bell, Users, TrendingUp, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BottomNavigationProps {
  activePage: string;
  onNavigate: (page: string) => void;
  userRole?: string;
  userLevel?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activePage, onNavigate, userRole, userLevel }) => {
  const [isEventHidden, setIsEventHidden] = useState(false);

  useEffect(() => {
    const handleModalState = (e: any) => {
      setIsEventHidden(e.detail.isOpen);
    };
    const handleNavVisibility = (e: any) => {
      setIsEventHidden(e.detail.isHidden);
    };
    
    window.addEventListener('modal-state-change', handleModalState);
    window.addEventListener('hide-bottom-nav', handleNavVisibility);
    
    return () => {
      window.removeEventListener('modal-state-change', handleModalState);
      window.removeEventListener('hide-bottom-nav', handleNavVisibility);
    };
  }, []);

  // Role normalization
  const normalizedRole = userRole?.toLowerCase() || '';
  const isStudent = normalizedRole === 'student' || normalizedRole === 'eleve' || normalizedRole === 'élève';
  const isParent = normalizedRole === 'parent';
  const isCashier = normalizedRole === 'cashier' || normalizedRole === 'caissier';
  const isTeacher = normalizedRole === 'teacher' || normalizedRole === 'professeur';

  const effectiveLevel = userLevel ?? 1;

  // Dynamic Navigation Tabs config (matches Sidebar permissions)
  const navItems = [
    { id: 'dashboard', label: 'Terminale D', icon: <LayoutDashboard size={20} /> },
    ...(effectiveLevel >= 1 && !isCashier ? [{ id: 'students', label: 'Statistiques', icon: <TrendingUp size={20} /> }] : []),
    ...(effectiveLevel >= 1 ? [{ id: 'teachers', label: 'Professeurs', icon: <GraduationCap size={20} /> }] : []),
    ...(effectiveLevel >= 1 ? [{ id: 'classes', label: 'Classes', icon: <BookOpen size={20} /> }] : []),
    { id: 'schedule', label: 'Planning', icon: <Calendar size={20} /> },
  ];

  // Allowed tab IDs for this user
  const allowedTabs = navItems.map(item => item.id);

  // If the active page is not one of our primary bottom tabs, or if an event (modal/detail view) requires hiding, we hide it.
  const isAlwaysHiddenPage = !allowedTabs.includes(activePage);
  const isHidden = isAlwaysHiddenPage || isEventHidden;

  return (
    <div className="md:hidden print:hidden">
      <AnimatePresence>
        {!isHidden && (
        <motion.div 
          initial="hidden"
          animate="show"
          exit="exit"
          variants={{
            hidden: { opacity: 0, y: 40, scale: 0.96 },
            show: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { staggerChildren: 0.04, duration: 0.28, ease: [0.16, 1, 0.3, 1] }
            },
            exit: {
              opacity: 0,
              y: 60,
              scale: 0.94,
              transition: { duration: 0.24, ease: [0.32, 0.72, 0, 1] }
            }
          }}
          className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] left-0 right-0 flex justify-center items-center space-x-[4px] z-[50] pointer-events-auto px-4"
        >
          {navItems.map((item, idx) => {
            const isActive = activePage === item.id;
            return (
              <motion.div
                key={`bnav-${item.id}-${idx}`}
                variants={{
                  hidden: { y: 40, opacity: 0 },
                  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 320, damping: 28 } },
                  exit: { y: 40, opacity: 0, transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] } }
                }}
                className="relative"
              >
                <motion.button 
                  layout
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center justify-center hover:opacity-80 rounded-full h-[48px] transition-all duration-300 relative ${isActive ? "bg-[#BFDBFE] px-5 shadow-[0_8px_20px_rgba(191,219,254,0.7)] z-20 -translate-y-5" : "bg-white/90 backdrop-blur-2xl border border-white/20 px-0 w-[48px] z-10 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.1)]"}`}
                  style={{ borderRadius: 24 }}
                >
                  <motion.div layout className={`flex-shrink-0 relative z-10 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {item.icon}
                  </motion.div>
                  <AnimatePresence>
                    {isActive && (
                      <motion.span 
                        initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                        animate={{ opacity: 1, width: 'auto', marginLeft: 8 }}
                        exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-white font-bold text-[13px] tracking-wide whitespace-nowrap overflow-hidden text-ellipsis relative z-10 max-w-[120px]"
                      >
                        {item.label}
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
    </div>
  );
};
