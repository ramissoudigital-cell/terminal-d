import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, QrCode, Settings, ChevronRight, Map, Calendar } from 'lucide-react';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateInfo?: () => void;
  onNavigateSettings?: () => void;
  onNavigateQRCode?: () => void;
  onNavigateMap?: () => void;
  onNavigateCalendar?: () => void;
}

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateInfo,
  onNavigateSettings,
  onNavigateQRCode,
  onNavigateMap,
  onNavigateCalendar
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-50"
          />
          
          {/* Menu Drawer */}
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="absolute top-0 left-0 right-0 bg-white shadow-2xl z-50 flex flex-col rounded-b-[40px] max-h-[85%]"
          >
            <div className="flex-1 overflow-y-auto pt-12 pb-2 hide-scrollbar">
              <div className="flex flex-col px-6 gap-6">
              
              {/* Section: Ressources */}
              <div>
                <h4 className="text-[13px] font-bold text-gray-400 mb-3 px-2 uppercase tracking-wide">Ressources</h4>
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => {
                      onClose();
                      if (onNavigateInfo) onNavigateInfo();
                    }}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <Info size={22} className="text-gray-700 group-hover:text-gray-900 transition-colors" strokeWidth={2} />
                      <span className="font-bold text-[16px] text-gray-800 group-hover:text-gray-900 transition-colors">Informations</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                </div>
              </div>

              {/* Section: Outils personnels */}
              <div>
                <h4 className="text-[13px] font-bold text-gray-400 mb-3 px-2 uppercase tracking-wide">Outils personnels</h4>
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => {
                        onClose();
                        if (onNavigateQRCode) onNavigateQRCode();
                    }}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <QrCode size={22} className="text-gray-700 group-hover:text-gray-900 transition-colors" strokeWidth={2} />
                      <span className="font-bold text-[16px] text-gray-800 group-hover:text-gray-900 transition-colors">Ton code QR</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                  <button 
                    onClick={() => {
                      onClose();
                      if (onNavigateMap) onNavigateMap();
                    }}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <Map size={22} className="text-gray-700 group-hover:text-gray-900 transition-colors" strokeWidth={2} />
                      <span className="font-bold text-[16px] text-gray-800 group-hover:text-gray-900 transition-colors">Carte</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                  <button 
                    onClick={() => {
                      onClose();
                      if (onNavigateCalendar) onNavigateCalendar();
                    }}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <Calendar size={22} className="text-gray-700 group-hover:text-gray-900 transition-colors" strokeWidth={2} />
                      <span className="font-bold text-[16px] text-gray-800 group-hover:text-gray-900 transition-colors">Calendrier</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                </div>
              </div>

              {/* Section: Outils de création et professionnels */}
              <div>
                <h4 className="text-[13px] font-bold text-gray-400 mb-3 px-2 uppercase tracking-wide">Outils de création et professionnels</h4>
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => {
                      onClose();
                      if (onNavigateSettings) onNavigateSettings();
                    }}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <Settings size={22} className="text-gray-700 group-hover:text-gray-900 transition-colors" strokeWidth={2} />
                      <span className="font-bold text-[16px] text-gray-800 group-hover:text-gray-900 transition-colors">Paramètres et confidentialité</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Grab handle for visual hint & click to close */}
            <div 
              className="w-full pt-4 pb-5 flex items-center justify-center shrink-0 cursor-pointer active:bg-gray-50/50 transition-colors"
              onClick={onClose}
              onTouchStart={(e) => {
                // To allow basic swipe up gesture intuitively if user drags up
                const startY = e.touches[0].clientY;
                const handleMove = (moveEvent: TouchEvent) => {
                  const currentY = moveEvent.touches[0].clientY;
                  if (startY - currentY > 30) {
                    onClose();
                    cleanup();
                  }
                };
                const cleanup = () => {
                  document.removeEventListener('touchmove', handleMove);
                  document.removeEventListener('touchend', cleanup);
                };
                document.addEventListener('touchmove', handleMove, { passive: true });
                document.addEventListener('touchend', cleanup);
              }}
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
