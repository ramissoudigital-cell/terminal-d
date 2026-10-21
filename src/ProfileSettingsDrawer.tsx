import React, { useState } from "react";
import { Bell, ChevronLeft, Settings, Lock, HelpCircle, LogOut, ChevronRight, Wallet, History, DownloadCloud, QrCode, Wand2, Info, PieChart, Map, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateInfo?: () => void;
  onNavigatePortfolio?: () => void;
  onNavigateSettings?: () => void;
  onNavigateQRCode?: () => void;
  onNavigateMap?: () => void;
  onNavigateBalance?: () => void;
  onNavigateNotifications?: () => void;
  onNavigateCalendar?: () => void;
  onNavigateStudio?: () => void;
  role?: 'user' | 'promoter';
}

export const ProfileSettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateInfo,
  onNavigatePortfolio,
  onNavigateSettings,
  onNavigateQRCode,
  onNavigateMap,
  onNavigateBalance,
  onNavigateNotifications,
  onNavigateCalendar,
  onNavigateStudio,
  role = 'promoter'
}) => {
  const [activeDrawerMenu, setActiveDrawerMenu] = useState<'main' | 'settings'>('main');

  // Reset menu to main when closing
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setActiveDrawerMenu('main'), 200);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-[200] bg-black/50 backdrop-blur-sm overflow-hidden"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-h-[85%] bg-white flex flex-col pt-14 pb-8 overflow-y-auto no-scrollbar shadow-2xl rounded-b-[40px]"
            onClick={(e) => e.stopPropagation()}
          >
            {activeDrawerMenu === 'main' ? (
              <>
                {/* Section 1 */}
                <div className="mb-6 px-4">
                  <h4 className="text-[13px] font-bold text-gray-400 mb-2 px-3 tracking-wide uppercase">Ressources</h4>
                  {role === 'promoter' && (
                    <>
                      <button 
                        onClick={() => {
                          onClose();
                          if (onNavigateBalance) onNavigateBalance();
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95 group outline-none mb-1"
                      >
                        <div className="flex items-center gap-4">
                          <Wallet size={22} className="text-gray-700 group-hover:text-gray-900" />
                          <span className="text-[16px] font-bold text-gray-800">Solde</span>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                      </button>
                      
                      <button 
                        onClick={() => {
                          onClose();
                          if (onNavigatePortfolio) onNavigatePortfolio();
                        }}
                        className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95 group outline-none mb-1"
                      >
                        <div className="flex items-center gap-4">
                          <PieChart size={22} className="text-gray-700 group-hover:text-gray-900" />
                          <span className="text-[16px] font-bold text-gray-800">Portfolio</span>
                        </div>
                        <ChevronRight size={20} className="text-gray-400" />
                      </button>
                    </>
                  )}
                  
                  <button 
                    onClick={() => {
                      onClose();
                      if (onNavigateInfo) onNavigateInfo();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95 group outline-none"
                  >
                    <div className="flex items-center gap-4">
                      <Info size={22} className="text-gray-700 group-hover:text-gray-900" />
                      <span className="text-[16px] font-bold text-gray-800">Informations</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>
                </div>

                {/* Section 2 */}
                <div className="mb-6 px-4">
                  <h4 className="text-[13px] font-bold text-gray-400 mb-2 px-3 tracking-wide uppercase">Outils personnels</h4>
                  <button 
                    onClick={() => {
                        onClose();
                        if (onNavigateQRCode) onNavigateQRCode();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95 group outline-none"
                  >
                    <div className="flex items-center gap-4">
                      <QrCode size={22} className="text-gray-700 group-hover:text-gray-900" />
                      <span className="text-[16px] font-bold text-gray-800">Ton code QR</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>
                  <button 
                    onClick={() => {
                      onClose();
                      if (onNavigateMap) onNavigateMap();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95 group outline-none"
                  >
                    <div className="flex items-center gap-4">
                      <Map size={22} className="text-gray-700 group-hover:text-gray-900" />
                      <span className="text-[16px] font-bold text-gray-800">Carte</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>
                  <button 
                    onClick={() => {
                      onClose();
                      if (onNavigateCalendar) onNavigateCalendar();
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95 group outline-none"
                  >
                    <div className="flex items-center gap-4">
                      <Calendar size={22} className="text-gray-700 group-hover:text-gray-900" />
                      <span className="text-[16px] font-bold text-gray-800">Calendrier</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>
                </div>

                {/* Section 3 */}
                <div className="px-4 pb-12">
                  <h4 className="text-[13px] font-bold text-gray-400 mb-2 px-3 tracking-wide uppercase">Outils de création et professionnels</h4>
                  {role === 'promoter' && (
                    <button 
                      onClick={() => {
                        onClose();
                        if (onNavigateStudio) onNavigateStudio();
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95 group mb-1 outline-none"
                    >
                      <div className="flex items-center gap-4">
                        <Wand2 size={22} className="text-gray-700 group-hover:text-gray-900" />
                        <span className="text-[16px] font-bold text-gray-800">Studio</span>
                      </div>
                      <ChevronRight size={20} className="text-gray-400" />
                    </button>
                  )}
                  
                  <button 
                    onClick={() => {
                      if (onNavigateSettings) {
                        onNavigateSettings();
                        onClose();
                      } else {
                        setActiveDrawerMenu('settings');
                      }
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95 group outline-none"
                  >
                    <div className="flex items-center gap-4">
                      <Settings size={22} className="text-gray-700 group-hover:text-gray-900" />
                      <span className="text-[16px] font-bold text-gray-800">Paramètres et confidentialité</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>
                </div>
              </>
            ) : (
              /* Settings Detail */
              <div className="px-4 pb-12 flex flex-col h-full animate-slide-in-right">
                {/* Header with back button */}
                <div className="flex items-center gap-4 mb-6 px-2">
                  <button 
                    onClick={() => setActiveDrawerMenu('main')}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors -ml-2 outline-none"
                  >
                    <ChevronLeft size={24} className="text-gray-800" />
                  </button>
                  <h3 className="text-[18px] font-bold text-gray-800">Paramètres</h3>
                </div>

                {/* Settings Links */}
                <div className="flex-1 flex flex-col gap-2">
                  <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95 group outline-none">
                    <div className="flex items-center gap-4">
                      <Settings size={22} className="text-gray-700 group-hover:text-indigo-600" />
                      <span className="text-[16px] font-bold text-gray-800">Général</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95 group outline-none" onClick={() => { onClose(); onNavigateNotifications?.(); }}>
                    <div className="flex items-center gap-4">
                      <Bell size={22} className="text-gray-700 group-hover:text-indigo-600" />
                      <span className="text-[16px] font-bold text-gray-800">Notifications</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95 group outline-none">
                    <div className="flex items-center gap-4">
                      <Lock size={22} className="text-gray-700 group-hover:text-indigo-600" />
                      <span className="text-[16px] font-bold text-gray-800">Confidentialité</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 transition-colors active:scale-95 group outline-none">
                    <div className="flex items-center gap-4">
                      <HelpCircle size={22} className="text-gray-700 group-hover:text-indigo-600" />
                      <span className="text-[16px] font-bold text-gray-800">Aide & Support</span>
                    </div>
                    <ChevronRight size={20} className="text-gray-400" />
                  </button>
                </div>

                <div className="mt-8">
                  <button className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-red-50 transition-colors active:scale-95 group outline-none">
                    <div className="flex items-center gap-4">
                      <LogOut size={22} className="text-red-500" />
                      <span className="text-[16px] font-bold text-red-500">Se déconnecter</span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
