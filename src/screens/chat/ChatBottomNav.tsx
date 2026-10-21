import React from 'react';
import { MessageCircle, CircleDashed, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface BottomNavProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
  onActionClick?: () => void;
}

export default function ChatBottomNav({ activeTab, onTabChange, onActionClick }: BottomNavProps) {
  const tabs = [
    { id: 'chats', icon: MessageCircle, label: 'Messages' },
    { id: 'channel', icon: CircleDashed, label: 'Important' },
  ];

  return (
    <>
      <div className="absolute bottom-8 left-6 bg-white/80 backdrop-blur-2xl rounded-full flex items-center p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white z-30">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-full transition-colors duration-300 outline-none cursor-pointer ${
                isActive ? 'text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill-chat"
                  className="absolute inset-0 bg-[#4A90E2] rounded-full shadow-[0_4px_12px_rgba(74,144,226,0.4)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className="relative z-10 flex items-center gap-2">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2.5}
                  fill={isActive && tab.id === 'chats' ? 'currentColor' : 'none'}
                  className={isActive ? 'text-white' : ''}
                />
                {isActive && (
                  <motion.span 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-[14px] font-bold text-white whitespace-nowrap overflow-hidden"
                  >
                    {tab.label}
                  </motion.span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <button 
        onClick={onActionClick}
        className="absolute bottom-8 right-6 w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-gray-100 z-30 text-[#4A90E2] hover:bg-gray-50 active:scale-95 transition-all"
      >
        <Zap size={22} strokeWidth={2.5} />
      </button>
    </>
  );
}
