import React, { useState, useRef, useEffect } from 'react';
import { Search, Phone, Video, MoreVertical, Paperclip, Send, Smile, Check, CheckCheck, Circle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'me' | 'them';
  content: string;
  time: string;
  read: boolean;
  type: 'text' | 'image' | 'file';
}

interface ChatContact {
  id: string;
  name: string;
  role: string; // 'Parent' | 'Professeur'
  avatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
  messages: Message[];
}

// Mock Data for Chats
const mockChats: ChatContact[] = [
  {
    id: '1',
    name: 'Mme. Kouassi',
    role: 'Parent (6ème 1)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'Merci, je passerai demain matin.',
    lastMessageTime: '10:42',
    unreadCount: 2,
    online: true,
    messages: [
        { id: 'm1', sender: 'them', content: 'Bonjour Monsieur le Directeur, est-ce que les bulletins sont disponibles ?', time: '10:30', read: true, type: 'text' },
        { id: 'm2', sender: 'me', content: 'Bonjour Mme. Kouassi. Oui, ils sont disponibles au secrétariat depuis ce matin.', time: '10:35', read: true, type: 'text' },
        { id: 'm3', sender: 'them', content: 'Parfait ! Est-ce que je peux passer les récupérer demain vers 8h ?', time: '10:40', read: true, type: 'text' },
        { id: 'm4', sender: 'them', content: 'Merci, je passerai demain matin.', time: '10:42', read: false, type: 'text' },
    ]
  },
  {
    id: '2',
    name: 'M. Sarah Dubois',
    role: 'Prof. Mathématiques',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'J\'ai bien reçu le nouveau planning.',
    lastMessageTime: 'Hier',
    unreadCount: 0,
    online: false,
    messages: [
        { id: 'm1', sender: 'me', content: 'Bonjour Sarah, voici le planning modifié pour les examens blancs.', time: 'Hier, 14:00', read: true, type: 'text' },
        { id: 'm2', sender: 'them', content: 'J\'ai bien reçu le nouveau planning. Cela me convient parfaitement.', time: 'Hier, 14:15', read: true, type: 'text' },
    ]
  },
  {
    id: '3',
    name: 'M. Diallo',
    role: 'Parent (Tle D)',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'Le virement a été effectué.',
    lastMessageTime: 'Lun',
    unreadCount: 0,
    online: true,
    messages: [
        { id: 'm1', sender: 'them', content: 'Bonsoir, pour la scolarité de Moussa, le virement a été effectué.', time: 'Lun, 19:30', read: true, type: 'text' },
    ]
  },
  {
    id: '4',
    name: 'Mme. Traore',
    role: 'Prof. Histoire-Géo',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'Je serai absente ce vendredi.',
    lastMessageTime: 'Lun',
    unreadCount: 1,
    online: false,
    messages: [
        { id: 'm1', sender: 'them', content: 'Bonjour M. le Directeur. Je serai absente ce vendredi pour des raisons médicales.', time: 'Lun, 08:00', read: false, type: 'text' },
    ]
  },
  {
    id: '5',
    name: 'M. Koné',
    role: 'Surveillant Général',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    lastMessage: 'Rapport de discipline envoyé.',
    lastMessageTime: 'Dim',
    unreadCount: 0,
    online: true,
    messages: []
  },
];

export const MessagesPage: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<string>(mockChats[0].id);
  const [inputText, setInputText] = useState('');
  const [chats, setChats] = useState(mockChats);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChat = chats.find(c => c.id === selectedChatId) || chats[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat.messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      content: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type: 'text'
    };

    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === selectedChatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: inputText,
          lastMessageTime: 'À l\'instant'
        };
      }
      return chat;
    }));

    setInputText('');
  };

  return (
    <div className="flex h-full p-6 gap-6 animate-in fade-in duration-300 overflow-hidden">
      
      {/* Left Sidebar - Chat List */}
      <div className="w-full md:w-1/3 bg-white rounded-[2rem] shadow-sm flex flex-col border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
            <div className="bg-sky-50 text-sky-600 px-3 py-1 rounded-full text-xs font-bold">
              {chats.reduce((acc, chat) => acc + chat.unreadCount, 0)} non lus
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher une conversation..." 
              className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-none outline-none text-sm font-medium text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-sky-100 transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
          {chats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all mb-2 ${
                selectedChatId === chat.id 
                  ? 'bg-sky-50 border border-sky-100 shadow-sm' 
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="relative">
                <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`text-sm font-bold truncate ${selectedChatId === chat.id ? 'text-gray-900' : 'text-gray-700'}`}>
                    {chat.name}
                  </h3>
                  <span className={`text-[10px] ${selectedChatId === chat.id ? 'text-sky-500 font-bold' : 'text-gray-400'}`}>
                    {chat.lastMessageTime}
                  </span>
                </div>
                <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'font-bold text-gray-800' : 'text-gray-400'}`}>
                  {chat.lastMessage}
                </p>
                <p className="text-[10px] text-sky-400 mt-0.5">{chat.role}</p>
              </div>

              {chat.unreadCount > 0 && (
                <div className="w-5 h-5 bg-sky-600 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-md shadow-sky-200">
                  {chat.unreadCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Chat Window */}
      <div className="hidden md:flex flex-1 bg-white rounded-[2rem] shadow-sm flex-col border border-gray-100 overflow-hidden relative">
        {/* Chat Header */}
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-white z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
                <img src={selectedChat.avatar} alt={selectedChat.name} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
                {selectedChat.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{selectedChat.name}</h2>
              <div className="flex items-center gap-2">
                 <span className="text-xs text-sky-500 font-medium bg-sky-50 px-2 py-0.5 rounded-md">{selectedChat.role}</span>
                 {selectedChat.online ? (
                     <span className="text-xs text-green-500 flex items-center gap-1"><Circle size={6} fill="currentColor"/> En ligne</span>
                 ) : (
                     <span className="text-xs text-gray-400">Hors ligne</span>
                 )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-3 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
              <Phone size={20} />
            </button>
            <button className="p-3 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
              <Video size={20} />
            </button>
            <div className="w-px h-8 bg-gray-100 mx-2"></div>
            <button className="p-3 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F9FAFB] custom-scrollbar flex flex-col gap-4">
            {/* Date Separator */}
            <div className="flex justify-center mb-4">
                <span className="bg-gray-200 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">Aujourd'hui</span>
            </div>

            {selectedChat.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Smile size={32} />
                    </div>
                    <p className="text-sm font-medium">Commencez la discussion avec {selectedChat.name}</p>
                </div>
            ) : (
                selectedChat.messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[70%] flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}>
                            <div 
                                className={`p-4 rounded-2xl shadow-sm relative text-sm leading-relaxed ${
                                    msg.sender === 'me' 
                                    ? 'bg-sky-600 text-white rounded-tr-none' 
                                    : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                                }`}
                            >
                                {msg.content}
                            </div>
                            <div className="flex items-center gap-1 mt-1 px-1">
                                <span className="text-[10px] text-gray-400 font-medium">{msg.time}</span>
                                {msg.sender === 'me' && (
                                    msg.read 
                                    ? <CheckCheck size={14} className="text-sky-500" />
                                    : <Check size={14} className="text-gray-400" />
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
            <form onSubmit={handleSendMessage} className="flex items-end gap-3 bg-gray-50 p-2 rounded-3xl border border-gray-200 focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-50 transition-all">
                <button type="button" className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                    <Paperclip size={20} />
                </button>
                <textarea 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                        if(e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    placeholder="Écrivez votre message..." 
                    className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 py-3 max-h-32 resize-none custom-scrollbar"
                    rows={1}
                />
                <button type="button" className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                    <Smile size={20} />
                </button>
                <button 
                    type="submit"
                    disabled={!inputText.trim()}
                    className={`p-3 rounded-full text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 ${
                        inputText.trim() ? 'bg-sky-600 hover:bg-sky-700 shadow-sky-200' : 'bg-gray-300 cursor-not-allowed'
                    }`}
                >
                    <Send size={20} className={inputText.trim() ? "ml-0.5" : ""} />
                </button>
            </form>
        </div>

      </div>
    </div>
  );
};