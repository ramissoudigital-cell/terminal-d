import React, { useState } from 'react';
import { Search, MoreVertical, Check, CheckCheck, BellOff, ArrowLeft, X, Tag, Zap, Settings } from 'lucide-react';

import { motion, AnimatePresence } from 'motion/react';
import ChatBottomNav from './ChatBottomNav';

export const CHAT_LABELS = [
  { id: '1', name: 'Nouveau client', color: 'bg-[#43B9F8]' },
  { id: '2', name: 'Nouvelle commande', color: 'bg-[#FBC338]' },
  { id: '3', name: 'Paiement en attente', color: 'bg-[#F98A7E]' },
  { id: '4', name: 'Payé', color: 'bg-[#CFA3F9]' },
  { id: '5', name: 'Commande terminée', color: 'bg-[#40C5AD]' },
  { id: '6', name: 'Important', color: 'bg-[#FCA2BA]' },
  { id: '7', name: 'À suivre', color: 'bg-[#8CDD93]' },
  { id: '8', name: 'Prospect', color: 'bg-[#7685FB]' },
];

interface ChatsListProps {
  onSelectChat: (chatId: string) => void;
  onTabChange: (tab: string) => void;
  onMiddleClick?: () => void;
  onAppNavigate?: (tab: string) => void;
  onBack?: () => void;
  chatLabels: Record<string, { id: string, name: string, color: string }>;
  onAssignLabel: (chatId: string, label: { id: string, name: string, color: string } | null) => void;
}

export const CHATS = [
  {
    id: 'john',
    name: 'John Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=d1d5db',
    time: '14:32',
    preview: 'Salut John ! 👋 Comment vas-tu ?',
    isOnline: true,
    status: 'online',
    readStatus: 'read', // read, delivered, sent
  },
  {
    id: 'mia',
    name: 'Mia Nguen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=fca5a5',
    time: 'Hier',
    preview: "Vous : Super ! 😊 Retrouvons-nous à 16h près du centre commercial !",
    isOnline: false,
    status: 'dnd', // red dot
    readStatus: 'read',
  },
  {
    id: 'henna',
    name: 'Henna Beck',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Henna&backgroundColor=fef08a',
    time: '16:12',
    preview: 'En train de taper...',
    isOnline: true,
    status: 'online',
    readStatus: 'read',
    isTyping: true,
  },
  {
    id: 'nuria',
    name: 'Nuria Cortez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nuria&backgroundColor=bfdbfe',
    time: '14:32',
    preview: 'Vous : Hé, tu viens à la fête samedi ? 🤩',
    isOnline: false,
    status: 'offline', // red dot
    readStatus: 'delivered',
    isMuted: true,
  },
  {
    id: 'owlivery',
    name: 'Owlivery Bot',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Owlivery&backgroundColor=d8b4fe',
    time: '2:47',
    preview: 'Merci pour votre commande ! Votre co...',
    isOnline: true,
    status: 'online',
    readStatus: 'read',
  },
];

export default function ChatsList({ onSelectChat, onTabChange, onMiddleClick, onAppNavigate, onBack, chatLabels, onAssignLabel }: ChatsListProps) {
  const [selectedChatForLabel, setSelectedChatForLabel] = useState<string | null>(null);
  const [isAutoReplyOpen, setIsAutoReplyOpen] = useState(false);
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [smartReplyEnabled, setSmartReplyEnabled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Long press handling
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  
  const handleTouchStart = (chatId: string) => {
    const timer = setTimeout(() => {
      setSelectedChatForLabel(chatId);
    }, 600); // 600ms long press
    setPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

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
          <h1 className="text-[32px] font-bold text-black tracking-tight shrink-0">Discussions</h1>
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
                    placeholder="Rechercher des discussions..." 
                    className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-gray-700 placeholder:text-gray-400 py-1 h-full"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-[100px] px-2">
        {CHATS.map((chat) => {
          const currentLabel = chatLabels[chat.id];
          return (
            <div 
              key={chat.id}
              onClick={() => {
                if (!pressTimer) onSelectChat(chat.id);
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setSelectedChatForLabel(chat.id);
              }}
              onTouchStart={() => handleTouchStart(chat.id)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchEnd}
              onMouseDown={() => handleTouchStart(chat.id)}
              onMouseUp={handleTouchEnd}
              onMouseLeave={handleTouchEnd}
              className="flex flex-col px-4 py-4 rounded-3xl mx-2 hover:bg-gray-50 transition-colors cursor-pointer active:bg-gray-100"
            >
              <div className="flex items-center">
                {/* Avatar & Status Indicator */}
                <div className="relative mr-4 shrink-0">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200">
                    <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                  </div>
                  <div 
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-[2.5px] border-white
                      ${chat.status === 'online' ? 'bg-[#0EA5E9]' : 'bg-[#EF4444]'}`}
                  />
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="font-bold text-[16px] text-gray-900 truncate pr-2 flex items-center">
                      {chat.name}
                      {chat.isMuted && <BellOff size={14} className="ml-2 text-gray-400" />}
                    </h3>
                    <div className="flex items-center shrink-0 gap-1.5">
                      {chat.readStatus === 'read' && <CheckCheck size={16} className="text-gray-400" />}
                      {chat.readStatus === 'delivered' && <Check size={16} className="text-gray-400" />}
                      <span className="text-[13px] font-medium text-gray-400">{chat.time}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2 relative">
                    <p className={`text-[15px] truncate ${chat.isTyping ? 'text-[#0EA5E9] font-medium' : 'text-gray-500 font-medium'}`}>
                      {chat.preview}
                    </p>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedChatForLabel(chat.id);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-[#43B9F8] hover:bg-sky-50 transition-colors shrink-0"
                    >
                      <Tag size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Optional Label underneath */}
              {currentLabel && (
                <div className="mt-2 ml-[72px]">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold text-white ${currentLabel.color}`}>
                    {currentLabel.name}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <ChatBottomNav activeTab="chats" onTabChange={onTabChange} onActionClick={() => setIsAutoReplyOpen(true)} />

      {/* Label Picker Bottom Sheet */}
      <AnimatePresence>
        {selectedChatForLabel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-sky-950/20 backdrop-blur-sm"
              onClick={() => setSelectedChatForLabel(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-50 bg-sky-400/25 backdrop-blur-2xl border-t border-white/70 rounded-t-[32px] pt-3 pb-8 px-6 shadow-[0_-15px_50px_rgba(14,165,233,0.25)]"
            >
              <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-6" />
              
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={() => setSelectedChatForLabel(null)}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-white/40 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
                <h2 className="text-[20px] font-bold text-gray-900">Nouvelle liste</h2>
                <div className="w-8" />
              </div>

              <div className="mb-6 relative">
                <p className="text-[12px] text-gray-600 mb-2 font-medium ml-1">Nom de la liste</p>
                <div className="border border-white/60 rounded-2xl p-4 flex items-center justify-between bg-white/40 backdrop-blur-md shadow-sm text-gray-800 text-[14px]">
                  <span className="opacity-70 font-medium">Exemples : prospect qualifié, comma...</span>
                  <div className="w-6 h-6 rounded-full bg-[#43B9F8] shadow-sm ml-2 shrink-0" />
                </div>
                <p className="text-[12px] text-gray-600 mt-3 font-medium ml-1">
                  Toute liste créée deviendra un filtre en haut de l'onglet Discussions.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-[14px] text-gray-800 font-semibold mb-3 ml-1">Suggestions</h3>
                {CHAT_LABELS.map((label) => (
                  <button
                    key={label.id}
                    onClick={() => {
                      onAssignLabel(selectedChatForLabel, label);
                      setSelectedChatForLabel(null);
                    }}
                    className="w-full flex items-center px-3 py-3 rounded-2xl hover:bg-white/50 transition-colors active:scale-[0.98]"
                  >
                    <div className={`w-6 h-6 rounded-full mr-4 shadow-sm ${label.color}`} />
                    <span className="text-[16px] text-gray-800 font-medium">{label.name}</span>
                    {chatLabels[selectedChatForLabel]?.id === label.id && (
                      <Check size={20} className="ml-auto text-[#43B9F8]" strokeWidth={3} />
                    )}
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => {
                  onAssignLabel(selectedChatForLabel, null);
                  setSelectedChatForLabel(null);
                }}
                className="w-full mt-6 bg-white/40 border border-white/60 backdrop-blur-md shadow-sm text-gray-500 hover:text-gray-700 hover:bg-white/60 font-semibold py-4 rounded-2xl cursor-default transition-all"
              >
                Ajoutez des personnes ou des groupes
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Auto Reply Bottom Sheet */}
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
