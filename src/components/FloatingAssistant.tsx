import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { 
      X, 
      ChevronLeft,
      ChevronDown,
      ThumbsUp,
      ThumbsDown,
      Share2,
      RotateCcw,
      Sparkles,
      Mic,
      Plus,
      AudioLines,
      Send,
      ChevronRight,
      FileText,
      Image,
      Camera,
      Brain,
      FileSearch,
      ScanText,
      Keyboard,
      Phone,
      Grid3x3
    } from 'lucide-react';
import { RegisteredUser } from '../types';

interface FloatingAssistantProps {
  userProfile?: RegisteredUser;
  onNavigate?: (screen: any) => void;
  onFreelancerClick?: (id: string) => void;
  isHidden?: boolean;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  quickReplies?: string[];
  isThinking?: boolean;
}

export const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ userProfile, onNavigate, onFreelancerClick, isHidden = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isListeningMode, setIsListeningMode] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [likedMessages, setLikedMessages] = useState<Record<string, boolean>>({});
  const [dislikedMessages, setDislikedMessages] = useState<Record<string, boolean>>({});
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSpeak = (msgId: string, text: string) => {
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Simple markdown strip
    const cleanText = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[#*`]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fr-FR';
    utterance.pitch = 1.25; // Feminine pitch
    utterance.rate = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(v => 
      v.lang.startsWith('fr') && 
      (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('margot') || v.name.toLowerCase().includes('audrey') || v.name.toLowerCase().includes('aurélie'))
    ) || voices.find(v => v.lang.startsWith('fr'));
    
    if (frVoice) {
      utterance.voice = frVoice;
    }

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleShare = async (text: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'TASKup IA',
          text: text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        alert("Texte copié dans le presse-papiers!");
      }
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const handleReload = async () => {
    if (messages.length < 2) return;
    
    // Find last user message
    const lastUserMsgIndex = [...messages].reverse().findIndex(m => m.sender === 'user');
    if (lastUserMsgIndex === -1) return;
    
    const actualIndex = messages.length - 1 - lastUserMsgIndex;
    const userMsg = messages[actualIndex];
    
    // Slice off messages after user msg
    setMessages(messages.slice(0, actualIndex + 1));
    
    // Get text and simulate send
    const history = messages.slice(0, actualIndex);
    
    const tempBotId = Math.random().toString();
    setMessages(prev => [...prev, {
      id: tempBotId,
      sender: 'assistant',
      isThinking: true,
      text: "TASKup IA est en pleine réflexion..."
    }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMsg.text, history }) // Same API call
      });
      if (!response.ok) throw new Error("Erreur réseau");
      await processStream(response, tempBotId);
    } catch (e) {
      console.error(e);
      setMessages(prev => {
        const newArr = [...prev];
        const idx = newArr.findIndex(m => m.id === tempBotId);
        if (idx !== -1) newArr[idx] = { ...newArr[idx], text: "Erreur.", isThinking: false };
        return newArr;
      });
    }
  };

  const processStream = async (response: Response, botMsgId: string) => {
      await new Promise(r => setTimeout(r, 800)); // Short thinking delay
      
      // Remove thinking
      setMessages(prev => {
         const newArr = [...prev];
         const index = newArr.findIndex(m => m.id === botMsgId);
         if (index !== -1) {
             newArr[index] = { ...newArr[index], isThinking: false, text: "" };
         }
         return newArr;
      });

      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let done = false;
        let fullTextToRender = "";
        let displayedText = "";
        
        const typeInterval = setInterval(() => {
          if (displayedText.length < fullTextToRender.length) {
            const diff = fullTextToRender.length - displayedText.length;
            const charsToAdd = diff > 100 ? 5 : 1;
            displayedText += fullTextToRender.substring(displayedText.length, displayedText.length + charsToAdd);
            
            setMessages(prev => {
              const newMessages = [...prev];
              const lastIdx = newMessages.findIndex(m => m.id === botMsgId);
              if (lastIdx !== -1) {
                newMessages[lastIdx] = { ...newMessages[lastIdx], text: displayedText };
              }
              return newMessages;
            });
          }
        }, 20);

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                if (line === 'data: [DONE]') {
                  done = true;
                  break;
                }
                
                try {
                  const dataJSON = line.substring(6);
                  if (dataJSON.trim()) {
                    const parsed = JSON.parse(dataJSON);
                    if (parsed.text) {
                      fullTextToRender += parsed.text;
                    }
                  }
                } catch (e) {}
              }
            }
          }
        }
        
        const cleanupInterval = setInterval(() => {
          if (done && displayedText.length >= fullTextToRender.length) {
            clearInterval(typeInterval);
            clearInterval(cleanupInterval);
            
            setMessages(prev => {
              const newMessages = [...prev];
              const lastIdx = newMessages.findIndex(m => m.id === botMsgId);
              if (lastIdx !== -1) {
                newMessages[lastIdx] = { ...newMessages[lastIdx], text: fullTextToRender };
              }
              return newMessages;
            });
          }
        }, 50);
      }
  };

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: text
    };
    
    // Remove quick replies from last assistant message
    setMessages(prev => {
      const newMessages = [...prev];
      const lastMsg = newMessages[newMessages.length - 1];
      if (lastMsg && lastMsg.sender === 'assistant' && lastMsg.quickReplies) {
        newMessages[newMessages.length - 1] = { ...lastMsg, quickReplies: undefined };
      }
      return [...newMessages, userMsg];
    });
    
    setInputValue('');

    // Pre-calculate history from current state
    const currentHistory = [...messages];

    const tempBotId = Math.random().toString();
    
    // Show thinking message
    setMessages(prev => [...prev, {
      id: tempBotId,
      sender: 'assistant',
      isThinking: true,
      text: "TASKup IA est en pleine réflexion..."
    }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, history: currentHistory })
      });

      if (!response.ok) {
        throw new Error("Erreur réseau");
      }

      await new Promise(r => setTimeout(r, 800)); // Short thinking delay before typing starts
      
      // Remove thinking
      setMessages(prev => {
         const newArr = [...prev];
         const index = newArr.findIndex(m => m.id === tempBotId);
         if (index !== -1) {
             newArr[index] = { ...newArr[index], isThinking: false, text: "" };
         }
         return newArr;
      });

      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let done = false;
        let fullTextToRender = "";
        let displayedText = "";
        
        const typeInterval = setInterval(() => {
          if (displayedText.length < fullTextToRender.length) {
            const diff = fullTextToRender.length - displayedText.length;
            const charsToAdd = diff > 100 ? 5 : 1;
            displayedText += fullTextToRender.substring(displayedText.length, displayedText.length + charsToAdd);
            
            setMessages(prev => {
              const newMessages = [...prev];
              const lastIdx = newMessages.length - 1;
              if (newMessages[lastIdx].id === tempBotId) {
                newMessages[lastIdx] = { ...newMessages[lastIdx], text: displayedText };
              }
              return newMessages;
            });
          }
        }, 20);

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                if (line === 'data: [DONE]') {
                  done = true;
                  break;
                }
                
                try {
                  const dataJSON = line.substring(6);
                  if (dataJSON.trim()) {
                    const parsed = JSON.parse(dataJSON);
                    if (parsed.text) {
                      fullTextToRender += parsed.text;
                    }
                  }
                } catch (e) {}
              }
            }
          }
        }
        
        // Wait until everything is fully typed out
        const cleanupInterval = setInterval(() => {
          if (done && displayedText.length >= fullTextToRender.length) {
            clearInterval(typeInterval);
            clearInterval(cleanupInterval);
            
            setMessages(prev => {
              const newMessages = [...prev];
              const lastIdx = newMessages.length - 1;
              if (newMessages[lastIdx].id === tempBotId) {
                newMessages[lastIdx] = { ...newMessages[lastIdx], text: fullTextToRender };
              }
              return newMessages;
            });
          }
        }, 50);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIdx = newMessages.length - 1;
        if (newMessages[lastIdx].id === tempBotId) {
          newMessages[lastIdx] = { ...newMessages[lastIdx], text: "Désolé, une erreur s'est produite." };
        }
        return newMessages;
      });
    }
  };

  return (
    <div id="floating-assistant-wrapper" ref={wrapperRef} className="absolute inset-0 z-[100] pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="absolute inset-0 w-full h-full flex flex-col pointer-events-auto overflow-hidden bg-gradient-to-b from-blue-200/80 via-blue-100/80 to-blue-200/80 backdrop-blur-[24px]"
          >
            {/* Header */}
            <div className="px-6 pt-14 pb-4 flex items-center justify-between z-20">
              <button 
                onClick={() => setIsOpen(false)}
                className="w-[46px] h-[46px] rounded-full bg-white/25 border border-white/40 backdrop-blur-xl flex items-center justify-center shadow-[0_8px_16px_rgba(0,0,0,0.12)] transition-transform active:scale-95 hover:bg-white/35"
              >
                <ChevronLeft size={24} strokeWidth={2.2} className="text-[#2c3338] pr-[2px]" />
              </button>
              
              <div className="flex items-center gap-1.5 cursor-pointer">
                <span className="text-[19px] font-medium text-[#2c3338] tracking-tight">TASKup IA</span>
                <ChevronDown size={18} className="text-[#2c3338]/60" strokeWidth={2.5} />
              </div>

              <div className="w-[46px] h-[46px]"></div> {/* Spacer */}
            </div>

            {/* Chat Area / Welcome Dashboard */}
            <div className="flex-1 overflow-y-auto px-6 pb-32 pt-2 flex flex-col gap-6 hide-scrollbar relative z-10 shrink-0 select-none">
              
              {messages.length === 0 ? (
                <div className="flex flex-col items-center w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
                  {/* Big avatar icon */}
                  <div className="w-[84px] h-[84px] rounded-[28px] bg-white/20 shadow-[0_8px_32px_rgba(255,255,255,0.15)] flex items-center justify-center mt-3 mb-5 border border-white/40 backdrop-blur-xl relative">
                     <div className="absolute inset-0 bg-gradient-to-br from-[#ebbbcc]/30 via-[#b6c6e3]/30 to-[#8ad5e3]/30 rounded-[28px]"></div>
                     <img src="https://cdn-icons-png.flaticon.com/512/2586/2586630.png" alt="AI Icon" className="w-[48px] h-[48px] brightness-0 invert drop-shadow-md relative z-10" />
                  </div>
                  
                  <h2 className="text-[28px] font-bold text-[#1a202c] mb-2 tracking-tight drop-shadow-sm">Salut, je suis TASKup IA</h2>
                  
                  <p className="text-[14.5px] text-[#2d3748] text-center max-w-[280px] mb-4 leading-[1.45] font-medium opacity-90">
                    Comment puis-je vous aider aujourd'hui ? Je peux vous guider pour trouver le prestataire idéal ou gérer vos projets.
                  </p>
                  
                  <button 
                    onClick={() => { if(onNavigate) onNavigate('notifications'); }} 
                    className="flex items-center gap-1.5 bg-black/10 hover:bg-black/15 px-5 py-2 rounded-full text-[14px] font-semibold text-[#1a202c] transition-colors mb-8 backdrop-blur-md border border-white/20 shadow-sm"
                  >
                    Afficher <ChevronRight size={16} strokeWidth={2.5} className="opacity-70" />
                  </button>

                  <div 
                    onClick={() => handleSend("Découvrez plus de fonctionnalités IA en un simple clic")}
                    className="w-full relative rounded-[24px] bg-white/20 border border-white/30 p-[22px] mb-8 backdrop-blur-xl overflow-hidden cursor-pointer shadow-[0_8px_24px_rgba(0,0,0,0.06)] group hover:bg-white/30 transition-all text-left flex items-center"
                  >
                    <div className="w-[40px] h-[40px] rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform flex-shrink-0">
                      <div className="w-[20px] h-[20px] border-[2px] border-[#1a202c]/40 rounded-full flex items-center justify-center relative">
                        <div className="w-[6px] h-[6px] bg-[#1a202c]/60 rounded-full" />
                        <div className="w-[8px] h-[2px] bg-[#1a202c]/40 absolute -bottom-[6px] -right-[6px] rotate-45 rounded-full" />
                      </div>
                    </div>
                    <p className="font-bold text-[#1a202c] text-[17.5px] ml-[20px] leading-snug drop-shadow-sm flex-1">Découvrez plus de fonctionnalités IA en un simple clic</p>
                  </div>

                  <div className="w-full flex flex-col gap-7 pb-4">
                    <div>
                      <h3 className="text-[15px] font-bold text-[#1a202c]/80 mb-3.5 px-1 tracking-tight">Catégories de services</h3>
                      <div className="grid grid-cols-2 gap-3.5">
                        <div 
                          onClick={() => handleSend("Rechercher en Informatique")}
                          className="rounded-[20px] bg-white/20 border border-white/30 p-4 backdrop-blur-xl flex flex-col justify-center cursor-pointer hover:bg-white/30 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
                        >
                          <span className="font-bold text-[#1a202c] text-[15px] mb-1">Informatique</span>
                          <span className="text-[#424d5e] text-[12.5px] font-medium">256 Prestataires</span>
                        </div>
                        <div 
                          onClick={() => handleSend("Rechercher en Design")}
                          className="rounded-[20px] bg-white/20 border border-white/30 p-4 backdrop-blur-xl flex flex-col justify-center cursor-pointer hover:bg-white/30 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
                        >
                          <span className="font-bold text-[#1a202c] text-[15px] mb-1">Design</span>
                          <span className="text-[#424d5e] text-[12.5px] font-medium">142 Designers</span>
                        </div>
                        <div 
                          onClick={() => handleSend("Rechercher un prof pour Soutien scolaire")}
                          className="rounded-[20px] bg-white/20 border border-white/30 p-4 backdrop-blur-xl flex flex-col justify-center cursor-pointer hover:bg-white/30 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
                        >
                          <span className="font-bold text-[#1a202c] text-[15px] mb-1">Soutien scolaire</span>
                          <span className="text-[#424d5e] text-[12.5px] font-medium">85 Profs</span>
                        </div>
                        <div 
                          onClick={() => handleSend("Rechercher un Artisan")}
                          className="rounded-[20px] bg-white/20 border border-white/30 p-4 backdrop-blur-xl flex flex-col justify-center cursor-pointer hover:bg-white/30 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
                        >
                          <span className="font-bold text-[#1a202c] text-[15px] mb-1">Artisanat</span>
                          <span className="text-[#424d5e] text-[12.5px] font-medium">85 Artisans</span>
                        </div>
                        <div 
                          onClick={() => handleSend("Rechercher pour Bricolage")}
                          className="rounded-[20px] bg-white/20 border border-white/30 p-4 backdrop-blur-xl flex flex-col justify-center cursor-pointer hover:bg-white/30 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
                        >
                          <span className="font-bold text-[#1a202c] text-[15px] mb-1">Bricolage</span>
                          <span className="text-[#424d5e] text-[12.5px] font-medium">94 Artisans</span>
                        </div>
                        <div 
                          onClick={() => handleSend("Rechercher un Plombier")}
                          className="rounded-[20px] bg-white/20 border border-white/30 p-4 backdrop-blur-xl flex flex-col justify-center cursor-pointer hover:bg-white/30 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
                        >
                          <span className="font-bold text-[#1a202c] text-[15px] mb-1">Plomberie</span>
                          <span className="text-[#424d5e] text-[12.5px] font-medium">88 Prestataires</span>
                        </div>
                        <div 
                          onClick={() => handleSend("Rechercher un Électricien")}
                          className="rounded-[20px] bg-white/20 border border-white/30 p-4 backdrop-blur-xl flex flex-col justify-center cursor-pointer hover:bg-white/30 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.03)] col-span-2"
                        >
                          <span className="font-bold text-[#1a202c] text-[15px] mb-1">Électricité</span>
                          <span className="text-[#424d5e] text-[12.5px] font-medium">105 Prestataires</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : messages.map((msg, index) => {
                  const isMe = msg.sender === 'user';
                return (
                  <motion.div 
                    key={msg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex flex-col w-full ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {isMe ? (
                      <div className="bg-[#f1f3f5] text-[#1f2937] px-6 py-[16px] rounded-t-[24px] rounded-bl-[24px] rounded-br-[0px] shadow-sm max-w-[80%] inline-flex items-center mt-6">
                        <span className="text-[17px] font-medium border-b-[2px] border-dotted border-gray-400/70 pb-[2px] leading-normal">{msg.text}</span>
                      </div>
                    ) : msg.isThinking ? (
                      <div className="flex flex-col items-start w-full mt-4 mb-2">
                        <div className="flex items-center gap-[12px] mb-[4px]">
                          <div className="w-[38px] h-[38px] rounded-[12px] bg-white/20 shadow-[0_4px_16px_rgba(0,100,255,0.1)] flex items-center justify-center border border-white/40 backdrop-blur-xl relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#ebbbcc]/30 via-[#b6c6e3]/30 to-[#8ad5e3]/30 rounded-[12px]"></div>
                            <img src="https://cdn-icons-png.flaticon.com/512/2586/2586630.png" alt="AI Icon" className="w-[20px] h-[20px] relative z-10 brightness-0 invert drop-shadow-sm" />
                          </div>
                          <span className="text-[19px] font-medium text-[#111827] tracking-tight">TASKup IA</span>
                        </div>
                        <div className="text-[15px] text-[#424d5e] font-medium tracking-tight animate-pulse ml-[50px]">
                          {msg.text}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start w-full mt-4">
                        {/* Avatar & Name */}
                        <div className="flex items-center gap-[12px] mb-[20px]">
                          <div className="w-[38px] h-[38px] rounded-[12px] bg-white/20 shadow-[0_4px_16px_rgba(0,100,255,0.1)] flex items-center justify-center border border-white/40 backdrop-blur-xl relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#ebbbcc]/30 via-[#b6c6e3]/30 to-[#8ad5e3]/30 rounded-[12px]"></div>
                            <img src="https://cdn-icons-png.flaticon.com/512/2586/2586630.png" alt="AI Icon" className="w-[20px] h-[20px] relative z-10 brightness-0 invert drop-shadow-sm" />
                          </div>
                          <span className="text-[19px] font-medium text-[#111827] tracking-tight">TASKup IA</span>
                        </div>
                        
                        <div className="text-[17.5px] text-[#111827] font-medium leading-[1.5] pr-5 mb-4 tracking-[0.1px] assistant-markdown">
                          <ReactMarkdown
                            urlTransform={(url) => url}
                            components={{
                              a: ({node, ...props}) => {
                                if (props.href?.startsWith('freelancer:')) {
                                  const id = props.href.split(':')[1];
                                  return (
                                    <button 
                                      onClick={(e) => {
                                        e.preventDefault();
                                        if (onFreelancerClick) onFreelancerClick(id);
                                        setIsOpen(false);
                                      }}
                                      className="inline-block mt-3 px-5 py-2.5 bg-[#4A90E2] text-white text-[15px] cursor-pointer rounded-full font-bold shadow-sm hover:bg-[#357ABD] transition-colors"
                                    >
                                      {props.children}
                                    </button>
                                  );
                                }
                                return <a {...props} className="text-[#4A90E2] hover:underline" target="_blank" rel="noopener noreferrer" />;
                              },
                              p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3" {...props} />,
                              li: ({node, ...props}) => <li className="mb-1" {...props} />
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </div>
                        
                        {/* Action Bar */}
                        <div className="flex items-center justify-between w-full pr-4 mb-3">
                          <div className="flex items-center gap-[24px] text-[#111827]/40">
                            <button 
                              onClick={() => setLikedMessages({...likedMessages, [msg.id]: !likedMessages[msg.id]})}
                              className={`transition-colors ${likedMessages[msg.id] ? 'text-[#4A90E2]' : 'hover:text-[#111827]'}`}
                            >
                              <ThumbsUp size={22} className={likedMessages[msg.id] ? 'fill-current' : 'fill-transparent'} strokeWidth={1.5} />
                            </button>
                            <button 
                              onClick={() => setDislikedMessages({...dislikedMessages, [msg.id]: !dislikedMessages[msg.id]})}
                              className={`transition-colors ${dislikedMessages[msg.id] ? 'text-red-500' : 'hover:text-[#111827]'}`}
                            >
                              <ThumbsDown size={22} className={dislikedMessages[msg.id] ? 'fill-current' : 'fill-transparent'} strokeWidth={1.5} />
                            </button>
                          </div>
                          <div className="flex items-center gap-[24px] text-[#111827]/40">
                            <button 
                              onClick={() => handleSpeak(msg.id, msg.text)}
                              className={`transition-colors ${speakingMsgId === msg.id ? 'text-[#4A90E2] animate-pulse' : 'hover:text-[#111827]'}`}
                            >
                              <div className="flex items-center gap-[3px] opacity-90 scale-90">
                                <div className="w-[3px] h-[11px] bg-current rounded-full"></div>
                                <div className="w-[3px] h-[16px] bg-current rounded-full"></div>
                                <div className="h-[16px] flex flex-col justify-between items-center relative">
                                  <div className="w-[3.5px] h-[3.5px] bg-current rounded-full absolute -top-[1px] right-[-2.5px]"></div>
                                  <div className="w-[3px] h-[8px] bg-current rounded-full mt-auto"></div>
                                </div>
                              </div>
                            </button>
                            <button onClick={() => handleShare(msg.text)} className="hover:text-[#111827] transition-colors"><Share2 size={22} strokeWidth={1.5} /></button>
                            <button onClick={() => handleReload()} className="hover:text-[#111827] transition-colors disabled:opacity-50"><RotateCcw size={22} strokeWidth={1.5} /></button>
                          </div>
                        </div>
                        
                        {/* Quick replies */}
                        {msg.quickReplies && (
                          <div className="flex flex-col gap-[14px]">
                            {msg.quickReplies.map((reply, i) => (
                              <button 
                                key={i} 
                                onClick={() => handleSend(reply)}
                                className="self-start px-[20px] py-[12px] bg-white/20 hover:bg-white/30 transition-colors rounded-[20px] text-[15.5px] text-[#2c3338] font-semibold tracking-tight shadow-sm"
                              >
                                {reply}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} className="h-6" />
            </div>

            {/* Input bar and Extra Options Panel */}
            <motion.div 
              className="absolute inset-x-0 bottom-0 flex flex-col z-20 pointer-events-none"
              animate={{ bottom: showMoreOptions ? 0 : 0 }} // Just let the height layout handle it
            >
              {/* The input bar wrapper */}
              <div className={`w-full px-3 transition-all duration-300 ${showMoreOptions ? 'pb-3' : 'pb-[34px] pt-12 bg-gradient-to-t from-black/25 via-black/5 to-transparent'}`}>
                <div className="w-full bg-white/20 backdrop-blur-[24px] rounded-[32px] h-[54px] flex items-center justify-between px-4 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 pointer-events-auto transform translate-y-[-4px]">
                  <div className="flex items-center gap-3 flex-1 h-full">
                    {isListeningMode ? (
                      <div className="flex items-center ml-0 relative">
                        <AudioLines size={22} className="text-[#424d5e]" strokeWidth={1.5} />
                        <Sparkles size={10} className="absolute -top-1 -right-1 text-[#424d5e]" strokeWidth={2} />
                      </div>
                    ) : (
                      <button onClick={() => setIsVoiceMode(true)} className="flex items-center gap-[3px] ml-0 scale-90 p-1 hover:bg-black/5 rounded-full transition-colors cursor-pointer">
                        <div className="w-[3px] h-[11px] bg-[#424d5e] rounded-full"></div>
                        <div className="w-[3px] h-[16px] bg-[#424d5e] rounded-full"></div>
                        <div className="h-[16px] flex flex-col justify-between items-center relative">
                          <div className="w-[3.5px] h-[3.5px] bg-[#424d5e] rounded-full absolute -top-[1px] right-[-2.5px]"></div>
                          <div className="w-[3px] h-[8px] bg-[#424d5e] rounded-full mt-auto"></div>
                        </div>
                      </button>
                    )}
                    
                    {isListeningMode ? (
                      <div className="flex-1 flex items-center h-full">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e890b5] to-[#8ebae5] font-medium text-[16px]">Je vous écoute</span>
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        placeholder="Demandez-moi n'importe..." 
                        className="flex-1 bg-transparent text-[16px] text-[#2c3338] placeholder-[#5c687a] outline-none font-medium h-full min-w-0"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSend(inputValue);
                        }}
                        onFocus={() => setShowMoreOptions(false)}
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 flex-shrink-0 ml-2 mr-0">
                    {!inputValue.trim() || isListeningMode ? (
                      <>
                        {isListeningMode ? (
                          <button onClick={() => setIsListeningMode(false)} className="text-[#424d5e] hover:text-gray-900 transition-colors">
                            <Grid3x3 size={22} strokeWidth={1.5} />
                          </button>
                        ) : (
                          <button onClick={() => setIsListeningMode(true)} className="text-[#424d5e] hover:text-gray-900 transition-colors">
                            <Mic size={22} strokeWidth={1.5} />
                          </button>
                        )}
                        <button 
                          className={`text-[#424d5e] hover:text-gray-900 transition-colors transform ${showMoreOptions ? 'rotate-90' : ''}`}
                          onClick={() => setShowMoreOptions(!showMoreOptions)}
                        >
                          {showMoreOptions ? <X size={26} strokeWidth={1.5} /> : <Plus size={26} strokeWidth={1.5} />}
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleSend(inputValue)}
                        className="text-[#424d5e] hover:text-gray-900 transition-colors flex-shrink-0"
                      >
                        <Send size={22} strokeWidth={1.5} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Options Panel */}
              <AnimatePresence>
                {showMoreOptions && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="w-full bg-black/10 backdrop-blur-xl rounded-t-[32px] overflow-hidden pointer-events-auto border-t border-white/20"
                  >
                    <div className="p-5 pb-12 flex flex-col gap-4">
                      {/* Top Row Grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <button className="flex flex-col items-center justify-center p-3 rounded-[20px] bg-white/10 hover:bg-white/20 transition-all border border-white/10 shadow-sm" onClick={() => setShowMoreOptions(false)}>
                          <div className="w-[40px] h-[40px] rounded-full bg-[#3a414c] flex items-center justify-center mb-2">
                            <FileText size={20} className="text-white" strokeWidth={1.5} />
                          </div>
                          <span className="text-[12px] font-medium text-[#2d3748]">Document</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-3 rounded-[20px] bg-white/10 hover:bg-white/20 transition-all border border-white/10 shadow-sm" onClick={() => setShowMoreOptions(false)}>
                          <div className="w-[40px] h-[40px] rounded-full bg-[#3a414c] flex items-center justify-center mb-2">
                            <Image size={20} className="text-white" strokeWidth={1.5} />
                          </div>
                          <span className="text-[12px] font-medium text-[#2d3748]">Galerie</span>
                        </button>
                        <button className="flex flex-col items-center justify-center p-3 rounded-[20px] bg-white/10 hover:bg-white/20 transition-all border border-white/10 shadow-sm" onClick={() => setShowMoreOptions(false)}>
                          <div className="w-[40px] h-[40px] rounded-full bg-[#3a414c] flex items-center justify-center mb-2">
                            <Camera size={20} className="text-white" strokeWidth={1.5} />
                          </div>
                          <span className="text-[12px] font-medium text-[#2d3748]">Appareil photo</span>
                        </button>
                      </div>

                      {/* List Items */}
                      <div className="flex flex-col gap-1 mt-2">
                        <button className="flex items-center gap-3 p-3 rounded-full hover:bg-white/10 transition-colors text-left" onClick={() => setShowMoreOptions(false)}>
                          <Brain size={22} className="text-[#3a414c]" strokeWidth={1.5} />
                          <span className="text-[15px] font-semibold text-[#1a202c]">Générateur d'images AI</span>
                        </button>
                        <button className="flex items-center gap-3 p-3 rounded-full hover:bg-white/10 transition-colors text-left" onClick={() => setShowMoreOptions(false)}>
                          <FileSearch size={22} className="text-[#3a414c]" strokeWidth={1.5} />
                          <span className="text-[15px] font-semibold text-[#1a202c]">Résolution des problèmes</span>
                        </button>
                        <button className="flex items-center gap-3 p-3 rounded-full hover:bg-white/10 transition-colors text-left" onClick={() => setShowMoreOptions(false)}>
                          <ScanText size={22} className="text-[#3a414c]" strokeWidth={1.5} />
                          <span className="text-[15px] font-semibold text-[#1a202c]">Scanner et convertir en document</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Home indicator bar (iOS style) */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[35%] h-[5px] bg-[#2c3338] rounded-full z-30 opacity-60 pointer-events-none"></div>

            {/* Voice Mode Overlay */}
            <AnimatePresence>
              {isVoiceMode && (
                <motion.div
                  initial={{ opacity: 0, y: "100%" }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: "100%" }}
                  transition={{ type: "spring", stiffness: 350, damping: 35 }}
                  className="absolute inset-0 z-50 flex flex-col bg-gradient-to-b from-[#a4b5c7]/95 via-[#c0acb9]/95 to-[#a4b5c7]/95 backdrop-blur-3xl pointer-events-auto"
                >
                  <div className="flex-1 flex flex-col items-center justify-between pb-12 pt-20 px-6 relative overflow-hidden">
                    {/* Background glow effects */}
                    <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-white/40 blur-[80px] rounded-full pointer-events-none"></div>
                    
                    {/* Top Badge */}
                    <motion.div 
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white/20 backdrop-blur-md px-5 py-2 rounded-full border border-white/30 shadow-sm z-10"
                    >
                      <span className="text-[#2d3748] font-semibold text-[14px]">Mode vocal</span>
                    </motion.div>

                    {/* Center Icon */}
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: [1, 1.05, 1],
                        y: [-5, 5, -5],
                        opacity: 1
                      }}
                      transition={{ 
                        y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                        opacity: { duration: 0.3 }
                      }}
                      className="w-[140px] h-[140px] rounded-[42px] bg-white/10 shadow-[0_12px_45px_rgba(0,0,0,0.1)] flex items-center justify-center border border-white/30 backdrop-blur-2xl relative z-10 overflow-hidden"
                    >
                      {/* Rotating glow ring */}
                      <motion.div 
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-10 opacity-70"
                        style={{
                          background: 'conic-gradient(from 0deg, transparent 0 300deg, rgba(255,255,255,0.8) 360deg)'
                        }}
                      />
                      <div className="absolute inset-[3px] rounded-[39px] bg-gradient-to-br from-[#ebbbcc]/80 via-[#b6c6e3]/80 to-[#8ad5e3]/80 backdrop-blur-2xl flex items-center justify-center overflow-hidden">
                        <motion.div 
                          animate={{ 
                            backgroundPosition: ['0% 0%', '100% 100%']
                          }}
                          transition={{ duration: 3, repeat: Infinity, repeatType: 'reverse', ease: "easeInOut" }}
                          className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/40 bg-[length:200%_200%]"
                        />
                        <motion.img 
                          animate={{ 
                            filter: ['drop-shadow(0 0 10px rgba(255,255,255,0.5))', 'drop-shadow(0 0 25px rgba(255,255,255,1))', 'drop-shadow(0 0 10px rgba(255,255,255,0.5))']
                          }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          src="https://cdn-icons-png.flaticon.com/512/2586/2586630.png" 
                          alt="AI Icon" 
                          className="w-[70px] h-[70px] brightness-0 invert relative z-10" 
                        />
                      </div>
                    </motion.div>

                    {/* Bottom Content */}
                    <div className="flex flex-col items-center w-full z-10 gap-10">
                      <div className="flex flex-col items-center gap-4">
                        <span className="text-[16px] text-[#2d3748] font-medium tracking-wide">Vous pouvez commencer à parler</span>
                        <div className="flex items-center justify-center gap-[8px] h-[30px]">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ 
                                height: ["8px", "28px", "12px", "28px", "8px"], 
                                opacity: [0.5, 1, 0.7, 1, 0.5] 
                              }}
                              transition={{ 
                                duration: 1.2, 
                                repeat: Infinity, 
                                delay: i * 0.2,
                                ease: "easeInOut"
                              }}
                              className="w-[6px] bg-[#2d3748] rounded-full"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-row items-center justify-center gap-6 w-full max-w-[280px]">
                         <button className="w-[70px] h-[70px] rounded-full bg-white/30 hover:bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/40 shadow-sm transition-all active:scale-95">
                           <Mic size={30} className="text-[#3a414c]" />
                         </button>
                         <button 
                           onClick={() => setIsVoiceMode(false)}
                           className="w-[70px] h-[70px] rounded-full bg-white/30 hover:bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/40 shadow-sm transition-all active:scale-95"
                         >
                           <Keyboard size={30} className="text-[#3a414c]" />
                         </button>
                         <button 
                           onClick={() => setIsVoiceMode(false)}
                           className="w-[70px] h-[70px] rounded-full bg-[#ff4b4b]/20 hover:bg-[#ff4b4b]/30 flex items-center justify-center backdrop-blur-md border border-[#ff4b4b]/30 shadow-sm transition-all active:scale-95 group"
                         >
                           <Phone size={30} className="text-[#ff4b4b] rotate-[135deg] group-hover:scale-110 transition-transform" fill="currentColor" />
                         </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button */}
      <AnimatePresence>
        {!isOpen && !isHidden && (
          <motion.div
            key="launcher"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            drag
            dragConstraints={wrapperRef}
            dragMomentum={false}
            className="absolute bottom-32 right-5 w-[54px] h-[54px] group pointer-events-auto z-40"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="w-full h-full rounded-[18px] bg-white/20 shadow-[0_8px_32px_rgba(0,100,255,0.15)] flex items-center justify-center border border-white/40 backdrop-blur-xl hover:scale-105 active:scale-95 transition-all outline-none p-0 cursor-grab active:cursor-grabbing relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#ebbbcc]/30 via-[#b6c6e3]/30 to-[#8ad5e3]/30 rounded-[18px]"></div>
              <img src="https://cdn-icons-png.flaticon.com/512/2586/2586630.png" alt="AI Icon" className="w-[28px] h-[28px] relative z-10 brightness-0 invert drop-shadow-md" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


