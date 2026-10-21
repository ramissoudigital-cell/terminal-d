import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, GraduationCap, Calendar, Settings, BookOpen, School, UserPlus, BarChart3, ClipboardCheck, Megaphone, X, MessageSquare, Bell, Building2, Crown, Award, HeartHandshake, FileText, UserCheck, TrendingUp, CreditCard } from 'lucide-react';
import { User } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { getDefaultAvatar, getRoleLabel } from '../src/utils/userUtils';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  userRole?: string;
  userLevel?: number;
  userSection?: 'Primaire' | 'Secondaire';
  currentUser?: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, userRole, userLevel, userSection, currentUser }) => {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const handleModalState = (e: any) => {
      setIsHidden(e.detail?.isOpen ?? false);
    };
    window.addEventListener('modal-state-change', handleModalState);
    return () => window.removeEventListener('modal-state-change', handleModalState);
  }, []);

  const isPrimaryUser = userSection === 'Primaire';

  const effectiveLevel = userLevel ?? currentUser?.accessLevel ?? 1;

  // Navigation Items Config
  const navItems = [
      { id: 'dashboard', label: 'Terminale-D', icon: <LayoutDashboard size={20} /> },
      ...(effectiveLevel >= 2 && userRole !== 'teacher' ? [{ id: 'communication', label: 'Diffusion', icon: <Megaphone size={20} /> }] : []),
      ...(effectiveLevel >= 2 && userRole !== 'teacher' ? [{ id: 'registration', label: 'Inscriptions', icon: <UserPlus size={20} /> }] : []),
      ...(effectiveLevel >= 4 ? [{ id: 'insights', label: 'Croissance', icon: <BarChart3 size={20} /> }] : []),
      ...(effectiveLevel >= 1 && userRole !== 'cashier' ? [{ id: 'students', label: 'Statistiques', icon: <TrendingUp size={20} /> }] : []),
      ...(effectiveLevel >= 1 ? [{ id: 'teachers', label: 'Professeurs', icon: <GraduationCap size={20} /> }] : []),
      ...(!isPrimaryUser && effectiveLevel >= 1 && userRole !== 'student' && userRole !== 'parent' ? [{ id: 'conseil', label: "Conseil d'ens. (CE)", icon: <Users size={20} /> }] : []),
      ...(!isPrimaryUser && effectiveLevel >= 1 && userRole !== 'student' && userRole !== 'parent' ? [{ id: 'responsables_up', label: "Responsables UP", icon: <Building2 size={20} /> }] : []),
      ...(effectiveLevel >= 1 && userRole !== 'parent' ? [{ id: 'chefs_de_classe', label: "Chefs de classe", icon: <Crown size={20} /> }] : []),
      ...(effectiveLevel >= 1 ? [{ id: 'bureau_delegues', label: "Bureau des délégués", icon: <Award size={20} /> }] : []),
      ...(effectiveLevel >= 1 ? [{ id: 'bureau_parents', label: "Parents d'élèves (APE)", icon: <HeartHandshake size={20} /> }] : []),
      ...(effectiveLevel >= 1 ? [{ id: 'classes', label: 'Classes', icon: <BookOpen size={20} /> }] : []),
      ...(effectiveLevel >= 1 ? [{ id: 'livret_scolaire', label: 'Livret Scolaire', icon: <FileText size={20} /> }] : []),
      ...(effectiveLevel >= 1 ? [{ id: 'fiche_identification', label: "Fiche d'identification", icon: <UserCheck size={20} /> }] : []),
      { id: 'schedule', label: 'Planning', icon: <Calendar size={20} /> },
      { id: 'settings', label: 'Paramètres', icon: <Settings size={20} /> },
  ];

  return (
    <AnimatePresence initial={false}>
      {!isHidden && (
        <motion.aside 
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 270, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="hidden md:flex print:hidden relative h-full shrink-0 overflow-hidden"
        >
          {/* Sidebar Container - HIDDEN on mobile (hidden md:flex) */}
          <div className="relative w-[270px] bg-[#BFDBFE] text-slate-900 h-full overflow-hidden overflow-x-hidden shrink-0 select-none">
            <div className="w-[270px] h-full py-8 pl-6 pr-0 flex flex-col shrink-0 overflow-x-hidden">
            
            {/* Decorative Background Blobs */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Top blob */}
            <div className="absolute -top-16 -left-16 w-56 h-56 bg-white/20 rounded-[4rem] rotate-12"></div>
            {/* Middle blob */}
            <div className="absolute top-[40%] -right-24 w-72 h-72 bg-white/20 rounded-[5rem] -rotate-12"></div>
            {/* Bottom blob */}
            <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-white/20 rounded-[4rem] rotate-45"></div>
        </div>

        {/* App Brand Header */}
        <div className="relative z-10 flex items-center gap-3 mb-6 pr-8">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm overflow-hidden p-0.5 shrink-0 border border-white/60">
                <img src="logo.png" alt="Terminale D Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = 'icone.png'; }} />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-base text-slate-900 tracking-tight leading-tight">Terminale D</span>
                <span className="text-[10px] text-slate-600 font-semibold truncate">Espace Scolaire</span>
            </div>
        </div>

        {/* User Profile */}
        <div className="relative z-10 flex justify-between items-center mb-8 pr-8"> 
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity w-full bg-white/40 p-2 rounded-2xl border border-white/40 shadow-xs" 
              onClick={() => onNavigate('settings')}
              title="Cliquer pour accéder aux paramètres"
            >
                <img 
                  src={currentUser?.photo || getDefaultAvatar(currentUser?.name || 'Utilisateur')} 
                  alt={currentUser?.name || 'Utilisateur'} 
                  className="w-10 h-10 rounded-xl object-cover border-2 border-white/60 shadow-sm shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = getDefaultAvatar(currentUser?.name || 'Utilisateur');
                  }}
                />
                <div className="flex flex-col max-w-[140px] min-w-0">
                  <span className="font-semibold text-xs leading-tight tracking-wide truncate text-slate-900">{currentUser?.name || 'Utilisateur'}</span>
                  <span className="text-[10px] text-slate-600 font-medium truncate">{getRoleLabel(currentUser?.role)}</span>
                </div>
            </div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 flex flex-col gap-1.5 overflow-y-auto overflow-x-hidden touch-pan-y overscroll-x-contain pb-10 pr-0 custom-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {navItems.map((item, idx) => (
                <React.Fragment key={`snav-${item.id}-${idx}`}>
                    {item.id === 'registration' && <div className="w-full h-px bg-white/40 my-2 shrink-0 mr-8"></div>}
                    <NavItem 
                        icon={item.icon} 
                        label={item.label} 
                        id={item.id}
                        active={activePage === item.id} 
                        onClick={() => onNavigate(item.id)}
                    />
                </React.Fragment>
            ))}
        </nav>
        </div>
      </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  id: string;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, id, onClick }) => {
  const isSpecialSelection = id === 'dashboard';

  if (isSpecialSelection) {
    return (
      <div className="relative w-full px-2">
        <button
          onClick={onClick}
          className={`w-full flex items-center gap-3.5 px-4 py-3 text-xs sm:text-sm transition-all relative z-20 cursor-pointer rounded-full ${
            active
              ? 'bg-white text-sky-600 font-bold shadow-md'
              : 'text-slate-600 hover:text-slate-900 font-medium hover:bg-white/30'
          }`}
        >
          <div className={`transition-all shrink-0 ${active ? 'text-sky-600 scale-110' : 'text-slate-500'}`}>
            {icon}
          </div>
          <span className={`tracking-wide whitespace-nowrap ${active ? 'font-bold' : ''}`}>{label}</span>
        </button>
      </div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`relative flex items-center gap-3 cursor-pointer transition-colors px-4 py-3.5 rounded-l-[2rem] group ${
        active 
          ? 'bg-white text-sky-600 w-[calc(100%+16px)] -mr-4 before:pointer-events-none after:pointer-events-none before:absolute before:right-4 before:-top-8 before:w-8 before:h-8 before:bg-[radial-gradient(circle_at_0%_0%,#BFDBFE_32px,white_32.5px)] after:absolute after:right-4 after:-bottom-8 after:w-8 after:h-8 after:bg-[radial-gradient(circle_at_0%_100%,#BFDBFE_32px,white_32.5px)]' 
          : 'text-slate-600 hover:text-slate-900 hover:bg-white/30 w-full mr-0'
      }`}
    >
      <div className={`transition-all shrink-0 ${active ? 'text-sky-600 scale-110' : 'text-slate-500 group-hover:text-slate-900'}`}>
        {icon}
      </div>
      <span className={`font-medium text-xs sm:text-sm tracking-wide whitespace-nowrap ${active ? 'font-bold' : ''}`}>{label}</span>
    </div>
  );
};