import { useState } from 'react';
import { Search, Settings, Plus, BadgeCheck, ChevronRight, ArrowLeft, X, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import ChatBottomNav from './ChatBottomNav';
// import CreateChannel from './CreateChannel';

import { CHATS } from './ChatsList';

interface ChannelPageProps {
  onTabChange: (tab: string) => void;
  onSelectChannel: (channel: any) => void;
  onAppNavigate?: (tab: string) => void;
  onBack?: () => void;
  chatLabels?: Record<string, { id: string, name: string, color: string }>;
  onSelectChat?: (chatId: string) => void;
}

export default function ChannelPage({ onTabChange, onSelectChannel, onAppNavigate, onBack, chatLabels = {}, onSelectChat }: ChannelPageProps) {
  const [channels, setChannels] = useState([
    { id: 'c1', name: 'Rappel Système', time: '14:32', preview: 'Mise à jour de sécurité importante...', unread: 3, avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Sys&backgroundColor=ff0000' },
    { id: 'c2', name: 'Équipe Support', time: 'Hier', preview: 'Vos documents ont été validés.', unread: 0, avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Sup&backgroundColor=22c55e' },
    { id: 'c3', name: 'Alertes', time: 'Mardi', preview: 'Nouvelle connexion détectée.', unread: 0, avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Alert&backgroundColor=f59e0b' },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAutoReplyOpen, setIsAutoReplyOpen] = useState(false);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [smartReplyEnabled, setSmartReplyEnabled] = useState(false);

  const handleCreateChannel = (newChannel: any) => {
    setChannels(prev => [newChannel, ...prev]);
    setIsCreating(false);
  };

  const SUGGESTED = [
    { id: 's1', name: 'L\'Équipe', followers: '2.4M', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=LE&backgroundColor=eab308' },
    { id: 's2', name: 'PlayStation', followers: '5.1M', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=PS&backgroundColor=3b82f6' },
    { id: 's3', name: 'Spotify', followers: '1.2M', avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=SP&backgroundColor=22c55e' },
  ];

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-[#F9FAFB] rounded-[40px] relative overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-[64px] pb-4 flex items-center justify-between z-10 w-full gap-4">
        <div className="flex items-center gap-3 shrink-0 min-w-0">
          <button 
            onClick={() => onBack ? onBack() : (onAppNavigate && onAppNavigate('dashboard'))}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-xl text-gray-700 hover:text-black shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-white/80 transition-all shrink-0 active:scale-95"
          >
           <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
          <h1 className="text-[32px] font-bold text-black tracking-tight shrink-0">Important</h1>
        </div>
        <div className="flex items-center p-1.5 bg-white/80 backdrop-blur-2xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white shrink-0 ml-auto gap-1">
          <button 
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={`w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all ${isSearchOpen ? 'bg-white text-[#4A90E2] shadow-sm' : 'text-gray-500 hover:text-[#4A90E2] hover:bg-white active:scale-95'}`}
          >
            <Search size={22} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => onAppNavigate && onAppNavigate("settings")}
            className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white active:scale-95 transition-all"
          >
            <Settings size={22} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
             initial={{ height: 0, opacity: 0, marginBottom: 0 }}
             animate={{ height: "auto", opacity: 1, marginBottom: 16 }}
             exit={{ height: 0, opacity: 0, marginBottom: 0 }}
             className="px-6 relative z-10"
          >
            <div className="relative group h-[48px]">
              {/* Outer pill-shaped glow aura */}
              <div className="absolute -inset-[2px] z-0 blur-[8px] rounded-[2rem] bg-black/5">
                <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                      className="w-full h-full bg-[conic-gradient(from_0deg,#B294DE,#6CA6F1,#F3D76F,#B294DE)] opacity-100"
                    />
                  </div>
                </div>
              </div>

              {/* Inner Search Bar (clipped for precise glowing border) */}
              <div className="relative rounded-[2rem] p-[3px] shadow-[0_15px_40px_rgba(0,0,0,0.15)] overflow-hidden flex h-full z-10">
                {/* Animated gradient spinning border */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square z-0">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="w-full h-full bg-[conic-gradient(from_0deg,#B294DE,#6CA6F1,#F3D76F,#B294DE)] opacity-90"
                  />
                </div>
                
                <div className="relative w-full bg-white/95 rounded-[1.8rem] px-3 flex items-center backdrop-blur-md z-10 h-full">
                  <div className="px-3">
                    <Search size={20} className="text-[#4A90E2]" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-gray-700 placeholder:text-gray-400 py-1 h-full"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[100px]">
        {/* Labeled Chats Section */}
        {Object.keys(chatLabels).length > 0 ? (
          <div className="pt-2 mb-4">
            <div className="flex items-center justify-between px-5 mb-2">
              <h2 className="text-[20px] font-bold text-black">Contacts Tagués</h2>
            </div>
            
            <div className="flex flex-col">
              {CHATS.filter(chat => chatLabels[chat.id]).map((chat, idx) => {
                const label = chatLabels[chat.id];
                return (
                  <div key={chat.id} onClick={() => onSelectChat && onSelectChat(chat.id)} className="flex flex-col px-5 py-3 transition-colors cursor-pointer hover:bg-gray-50 active:bg-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <div className="w-[58px] h-[58px] rounded-full overflow-hidden border border-gray-100 shadow-sm relative">
                          <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                        </div>
                        <div 
                          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-[2.5px] border-white
                            ${chat.status === 'online' ? 'bg-[#0EA5E9]' : 'bg-[#EF4444]'}`}
                        />
                      </div>
                      
                      <div className={`flex-1 min-w-0 ${idx !== Object.keys(chatLabels).length - 1 ? 'border-b border-gray-100/80 pb-3' : ''}`}>
                        <div className="flex justify-between items-center mb-1 mt-0.5">
                          <h3 className="font-semibold text-[17px] text-black truncate pr-2 flex items-center gap-1.5 leading-tight">
                            {chat.name}
                          </h3>
                          <span className="text-[13px] font-medium flex-shrink-0 text-gray-400">
                            {chat.time}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-[15px] truncate pr-4 leading-snug text-gray-500">
                            {chat.preview}
                          </p>
                        </div>
                        
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold text-white ${label.color}`}>
                            {label.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-24 px-8 text-center bg-gray-50/30 m-4 rounded-[2rem] border border-gray-100/50 py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <span className="text-2xl">🏷️</span>
            </div>
            <p className="text-[15px] font-medium text-slate-500 leading-snug">
              Tous les contacts tagués s'afficheront ici.
            </p>
          </div>
        )}




      </div>

      {/* Bottom Navigation */}
      <ChatBottomNav activeTab="channel" onTabChange={onTabChange} onActionClick={() => setIsAutoReplyOpen(true)} />

      <AnimatePresence>
        {isAutoReplyOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-sky-950/20 backdrop-blur-sm"
              onClick={() => setIsAutoReplyOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-50 bg-sky-400/25 backdrop-blur-2xl border-t border-white/70 rounded-t-[32px] pt-3 pb-8 px-6 shadow-[0_-15px_50px_rgba(14,165,233,0.25)]"
            >
              <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-6" />
              
              <div className="flex justify-between items-start mb-2 mt-2">
                <div>
                  <h2 className="text-[22px] font-bold text-gray-900 leading-tight">Assistant de réponse<br/>automatisée</h2>
                </div>
                <button 
                  onClick={() => setIsAutoReplyOpen(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-white/40 rounded-full transition-all shrink-0"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-[14px] text-gray-600 mb-8 leading-relaxed pr-6 font-medium">
                Automatisez la gestion de vos requêtes en cas d'absence. Confiez vos réponses à nos solutions intelligentes pour assurer un suivi courtois en toutes circonstances.
              </p>

              <div className="space-y-4">
                {/* Switch 1 */}
                <div className="bg-white/40 backdrop-blur-md border border-white/70 p-5 rounded-3xl flex items-start gap-4">
                  <div className="pt-0.5">
                    <button 
                      onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center shadow-inner ${autoReplyEnabled ? 'bg-[#0EA5E9]' : 'bg-gray-300/80'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full mx-0.5 shadow-sm transition-transform ${autoReplyEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-[16px] mb-1">Activer les messages rapides</h3>
                    <p className="text-[13.5px] text-gray-600/90 leading-snug">Déploie une communication prédéfinie indiquant votre indisponibilité de manière professionnelle.</p>
                  </div>
                </div>

                {/* Switch 2 */}
                <div className="bg-sky-50/50 backdrop-blur-md border border-white/70 p-5 rounded-3xl flex items-start gap-4 relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 p-2 opacity-10 blur-sm pointer-events-none">
                    <Zap size={120} fill="currentColor" className="text-[#0EA5E9]" />
                  </div>
                  <div className="pt-0.5 z-10">
                    <button 
                      onClick={() => setSmartReplyEnabled(!smartReplyEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center shadow-inner ${smartReplyEnabled ? 'bg-indigo-500' : 'bg-gray-300/80'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full mx-0.5 shadow-sm transition-transform ${smartReplyEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>
                  <div className="z-10">
                    <h3 className="font-semibold text-gray-900 text-[16px] mb-1">Activer la messagerie intelligente</h3>
                    <p className="text-[13.5px] text-gray-600/90 leading-snug pr-4">Analyse le contexte de vos messages entrants et formule des réponses adaptées et nuancées à votre place.</p>
                  </div>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
