import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import ChatsList from './ChatsList';
import ChannelPage from './ChannelPage';
import ChatRoom from './ChatRoom';
import { topFreelancers } from '../../data';

interface Chat {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'brb';
}

const CHATS_DATA: Record<string, Chat> = {
  john: {
    id: 'john',
    name: 'John Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John&backgroundColor=d1d5db',
    status: 'online',
  },
  mia: {
    id: 'mia',
    name: 'Mia Nguen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=fca5a5',
    status: 'brb',
  },
  henna: {
    id: 'henna',
    name: 'Henna Beck',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Henna&backgroundColor=fef08a',
    status: 'online',
  },
  nuria: {
    id: 'nuria',
    name: 'Nuria Cortez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nuria&backgroundColor=bfdbfe',
    status: 'brb',
  },
  owlivery: {
    id: 'owlivery',
    name: 'Owlivery Bot',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Owlivery&backgroundColor=d8b4fe',
    status: 'online',
  },
};

export const ChatView: React.FC<{ initialChatId?: string | null, onNavigate?: (tab: string) => void; onMiddleClick?: () => void; onBack?: () => void }> = ({ initialChatId, onNavigate, onMiddleClick, onBack }) => {
  const [activeChatId, setActiveChatId] = useState<string | null>(initialChatId || null);
  const [activeSubTab, setActiveSubTab] = useState<'chats' | 'channel'>('chats');
  const [chatLabels, setChatLabels] = useState<Record<string, { id: string, name: string, color: string }>>({});

  const handleSubTabChange = (tab: string) => {
    if (tab === 'chats' || tab === 'channel') {
      setActiveSubTab(tab as 'chats' | 'channel');
    }
  };

  let currentChat = activeChatId ? CHATS_DATA[activeChatId] : null;
  if (!currentChat && activeChatId) {
    if (activeChatId.startsWith('custom:')) {
      try {
        const decoded = JSON.parse(decodeURIComponent(atob(activeChatId.split(':')[1])));
        currentChat = {
          id: decoded.id,
          name: decoded.name,
          avatar: decoded.avatar,
          status: 'online'
        };
      } catch (e) {
        console.error('Error decoding custom chat id', e);
      }
    } else {
      const freelancer = topFreelancers.find(f => f.id === activeChatId);
      if (freelancer) {
        currentChat = {
          id: freelancer.id,
          name: freelancer.name,
          avatar: freelancer.avatarUrl,
          status: 'online'
        };
      }
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 25, duration: 0.6 }}
      className="w-full h-full relative overflow-hidden bg-white rounded-[40px]"
    >
      <AnimatePresence initial={false} mode="wait">
        {!activeChatId ? (
          activeSubTab === 'chats' ? (
            <motion.div
              key="chats-list"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute inset-0 z-0 bg-white"
            >
              <ChatsList 
                onSelectChat={setActiveChatId} 
                onTabChange={handleSubTabChange} 
                onMiddleClick={onMiddleClick} 
                onAppNavigate={onNavigate} 
                onBack={onBack}
                chatLabels={chatLabels}
                onAssignLabel={(chatId, label) => {
                  setChatLabels(prev => {
                    const newLabels = { ...prev };
                    if (label) {
                      newLabels[chatId] = label;
                    } else {
                      delete newLabels[chatId];
                    }
                    return newLabels;
                  });
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="channel-page"
              initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="absolute inset-0 z-0 bg-white"
            >
              <ChannelPage 
                onSelectChannel={() => {}} 
                onTabChange={handleSubTabChange} 
                onAppNavigate={onNavigate} 
                onBack={onBack}
                chatLabels={chatLabels}
                onSelectChat={setActiveChatId}
              />
            </motion.div>
          )
        ) : null}
      </AnimatePresence>
      
      <AnimatePresence>
        {activeChatId && currentChat && (
          <motion.div
            key="chat-room"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute inset-0 z-40"
          >
            <ChatRoom 
              chat={currentChat} 
              onBack={() => setActiveChatId(null)} 
              onNavigate={onNavigate}
              assignedLabel={chatLabels[activeChatId]}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
