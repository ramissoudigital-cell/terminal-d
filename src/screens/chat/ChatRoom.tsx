import { MoreVertical, ChevronLeft, Paperclip, Mic, Send, FileText, File, Image as ImageIcon, QrCode, ScanLine, X, Check, Sparkles, ShieldCheck, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SmilePlus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import VoiceNote from './VoiceNote';

interface Chat {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'brb';
}

interface ChatRoomProps {
  chat: Chat;
  onBack: () => void;
  onNavigate?: (tab: string) => void;
  assignedLabel?: { id: string, name: string, color: string } | null;
}

export default function ChatRoom({ chat, onBack, onNavigate, assignedLabel }: ChatRoomProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // QR Code Scanner Simulated States
  const [isScanningQR, setIsScanningQR] = useState(false);
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'confirmed'>('idle');
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedQRImageUrl, setScannedQRImageUrl] = useState('');
  const [scanSource, setScanSource] = useState<'attachment' | 'message'>('attachment');
  const [scannedAmount, setScannedAmount] = useState(150);

  const playScanBeep = (freq = 880, duration = 0.12) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Sound blocked/not supported by browser setup", e);
    }
  };

  const playSuccessChime = () => {
    playScanBeep(784, 0.1); // G5
    setTimeout(() => {
      playScanBeep(1046.5, 0.25); // C6
    }, 100);
  };

  const triggerQRScan = (source: 'attachment' | 'message', qrUrl?: string) => {
    setShowAttachmentMenu(false);
    setScanSource(source);
    setScannedQRImageUrl(qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PaymentTo${chat.name.replace(/\s+/g,'')}12345`);
    setIsScanningQR(true);
    setScanState('scanning');
    setScanProgress(0);
    // Randomize amount for interactive realism
    setScannedAmount(150 + Math.floor(Math.random() * 10) * 15);
  };

  useEffect(() => {
    if (isScanningQR && scanState === 'scanning') {
      const interval = setInterval(() => {
        setScanProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              playScanBeep(920, 0.16); // Nice clean barcoded scan beep
              setScanState('success');
            }, 300);
            return 100;
          }
          const inc = 5 + Math.floor(Math.random() * 12);
          return Math.min(100, p + inc);
        });
      }, 140);
      return () => clearInterval(interval);
    }
  }, [isScanningQR, scanState]);

  const handleConfirmPayment = () => {
    playSuccessChime();
    setScanState('confirmed');
    
    setTimeout(() => {
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          text: `💸 J'ai scanné ton Code QR avec succès et validé le transfert sécurisé de ${scannedAmount} €. Transaction ID: TXN-${Math.floor(102000 + Math.random() * 889000).toString()}`,
          time: timeString,
          isSent: true
        }
      ]);
      
      setIsScanningQR(false);
      setScanState('idle');
      
      // Navigate to the payment page we created previously!
      if (onNavigate) {
        onNavigate('payment');
      }
      
      // Auto reply from worker
      setIsTyping(true);
      setTimeout(() => {
        const replyNow = new Date();
        const replyTimeString = `${replyNow.getHours().toString().padStart(2, '0')}:${replyNow.getMinutes().toString().padStart(2, '0')}`;
        setMessages(prev => [
          ...prev,
          {
            id: (Date.now() + 2).toString(),
            text: `Super, merci beaucoup ! Les ${scannedAmount} € viennent de m'être crédités sur mon compte TASKup. Je continue la réalisation du service de ce pas ! 🚀💼`,
            time: replyTimeString,
            isSent: false
          }
        ]);
        setIsTyping(false);
      }, 2000);
      
    }, 1800);
  };
  
  const initialMessages = chat.id === 'henna' ? [
    { id: '1', text: 'Salut Henna, comment ça va ?', time: '16:12', isSent: true },
    { id: '2', isAudio: true, time: '16:34', duration: '0:03', isSent: false },
    { id: '3', text: 'J\'ai enfin trouvé un travail ! 🤩', time: '16:35', isSent: false },
    { id: '4', text: 'Félicitations ! Après toutes ces recherches, tu as enfin réussi ! 🥳', time: '16:41', isSent: true },
    { id: '5', text: 'Dans quelle entreprise au fait ? 🤔', time: '16:42', isSent: true },
    { id: '6', text: 'UI Designer chez Facebook !', time: '16:45', isSent: false },
    { id: '7', text: 'Génial !', time: '16:57', isSent: true }
  ] : [];

  const [messages, setMessages] = useState<any[]>(initialMessages);
  const isEmpty = messages.length === 0 && !isTyping;

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping, showAttachmentMenu]);

  const handleSendMessage = () => {
    if (message.trim().length === 0) return;
    
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const userText = message.trim();
    
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        text: userText,
        time: timeString,
        isSent: true
      }
    ]);
    setMessage('');
    
    // Simulate a reply
    setIsTyping(true);
    
    setTimeout(() => {
      const replyNow = new Date();
      const replyTimeString = `${replyNow.getHours().toString().padStart(2, '0')}:${replyNow.getMinutes().toString().padStart(2, '0')}`;
      
      const lowerText = userText.toLowerCase();
      let replyText = "C'est noté ! Je regarde ça tout de suite.";
      
      if (lowerText.includes('bonjour') || lowerText.includes('salut') || lowerText.includes('hi') || lowerText.includes('hello')) {
        replyText = "Bonjour ! Comment puis-je vous aider aujourd'hui ? 😊";
      } else if (lowerText.includes('merci') || lowerText.includes('thanks')) {
        replyText = "Je vous en prie ! N'hésitez pas si vous avez d'autres questions.";
      } else if (lowerText.includes('prix') || lowerText.includes('tarif') || lowerText.includes('combien')) {
        replyText = "Mes tarifs dépendent du projet. Pouvons-nous en discuter plus en détail ?";
      } else if (lowerText.includes('disponible') || lowerText.includes('temps')) {
        replyText = "Oui, je suis disponible pour de nouveaux projets à l'heure actuelle.";
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: replyText,
          time: replyTimeString,
          isSent: false
        }
      ]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5s and 2.5s
  };

  const handleSendAudio = (audioUrl?: string) => {
    setIsRecording(false);
    if (!audioUrl) return;

    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        isAudio: true,
        audioUrl: audioUrl, // Save generated URL
        duration: "Voice",
        time: timeString,
        isSent: true
      }
    ]);
    
    // Simulate reply to audio
    setIsTyping(true);
    setTimeout(() => {
      const replyNow = new Date();
      const replyTimeString = `${replyNow.getHours().toString().padStart(2, '0')}:${replyNow.getMinutes().toString().padStart(2, '0')}`;
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "J'ai bien reçu votre message vocal. Laissez-moi l'écouter.",
          time: replyTimeString,
          isSent: false
        }
      ]);
      setIsTyping(false);
    }, 2000);
  };

  const handleSendQRCode = () => {
    setShowAttachmentMenu(false);
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        isImage: true,
        imageUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PaymentTo${chat.name.replace(/\s+/g,'')}12345`,
        time: timeString,
        isSent: true
      }
    ]);
  };

  const handleScanAndPay = () => {
    triggerQRScan('attachment');
  };

  return (
    <div 
      className="flex flex-col h-full bg-gradient-to-b from-white to-[#F9FAFB] rounded-[40px] relative overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-[64px] pb-4 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ChevronLeft size={28} strokeWidth={2.5} />
          </button>
          
          <div className="flex items-center ml-2">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200">
              <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
            </div>
            <div className="ml-3">
              <h2 className="text-[17px] font-bold text-gray-900 leading-tight">{chat.name}</h2>
              <div className="flex items-center mt-0.5">
                {chat.status === 'brb' ? (
                  <span className="text-[13px] font-medium text-blue-500 flex items-center gap-1">⏰ De retour bientôt</span>
                ) : isTyping ? (
                  <span className="text-[13px] font-medium text-[#0EA5E9] flex items-center gap-1">
                    En train d'écrire...
                  </span>
                ) : (
                  <span className="text-[13px] font-medium text-[#0EA5E9]">En ligne</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-1 pr-1">
          <button className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors">
            <MoreVertical size={22} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto hide-scrollbar pb-[90px] bg-white scroll-smooth relative">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-8 pb-20">
            <div className="bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] p-8 text-center max-w-[280px]">
              <h3 className="text-[18px] font-bold text-gray-900 mb-2">Pas encore de messages...</h3>
              <p className="text-[15px] text-gray-500 font-medium mb-6 leading-relaxed">
                Envoyez un message ou répondez avec un autocollant ci-dessous !
              </p>
              <div className="text-[48px]">👋🏽</div>
            </div>
          </div>
        ) : (
          <div className="px-5 py-6">
            <div className="flex justify-center mb-6">
              <span className="text-[13px] font-medium text-gray-400">Aujourd'hui</span>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.isSent ? 'justify-end' : 'justify-start'} mb-4`}>
                <div className={`rounded-[24px] ${msg.isSent ? 'bg-[#E0F2FE] rounded-tr-[8px] pl-5 pr-4' : 'bg-[#F3F4F6] rounded-tl-[8px] p-3 pl-4'} py-3 max-w-[85%] relative flex items-end gap-2`}>
                  
                  {msg.isAudio ? (
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => {
                          if (msg.audioUrl) {
                            const audio = new Audio(msg.audioUrl);
                            audio.play();
                          }
                        }}
                        className="w-[38px] h-[38px] bg-[#0369A1] text-white rounded-full flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition-transform"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                      </button>
                      <div className="flex-1 flex flex-col pt-1">
                        <div className="flex gap-1 items-center h-4 mb-1">
                          {/* Fake waveform */}
                          {[1,2,3,4,3,2,1,2,4,5,4,2,1,2,3,2,1].map((h, i) => (
                            <div key={i} className={`w-[3px] rounded-full ${msg.isSent ? 'bg-[#0369A1]' : 'bg-gray-400'}`} style={{ height: `${h*4}px`, opacity: i < 7 ? 1 : 0.4 }} />
                          ))}
                        </div>
                        <div className="flex justify-between text-[11px] font-semibold text-gray-500 px-1 mt-1 gap-4">
                          <span>{msg.duration}</span>
                          <span>{msg.time}</span>
                        </div>
                      </div>
                    </div>
                  ) : msg.isImage ? (
                    <div className="flex flex-col gap-1 items-end pt-1">
                      <div 
                        onClick={() => triggerQRScan('message', msg.imageUrl)}
                        className="rounded-2xl overflow-hidden shadow-md bg-white p-3 border border-slate-100 hover:border-sky-300 hover:shadow-lg active:scale-98 cursor-pointer transition-all relative group"
                        title="Cliquer pour scanner ce QR Code"
                      >
                        <div className="relative">
                          <img src={msg.imageUrl} alt="QR Code" className="w-[155px] h-[155px] object-cover rounded-xl" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity rounded-xl gap-1 text-white">
                            <ScanLine size={24} className="animate-pulse text-sky-400" />
                            <span className="font-extrabold text-[11px] tracking-wider uppercase">Scanner le QR</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                        <QrCode size={11} className="text-gray-400" /> {msg.time}
                      </span>
                    </div>
                  ) : (
                    <>
                      <span className="text-[15px] font-medium text-gray-900 leading-snug break-words pl-1">{msg.text}</span>
                      <div className="flex items-center gap-1 mb-[2px] shrink-0">
                        <span className="text-[11px] font-semibold text-gray-500">{msg.time}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {assignedLabel && (
              <div className="flex justify-center mb-4 mt-2">
                <span className={`px-3 py-1.5 rounded-xl text-[12px] font-bold text-white shadow-sm flex items-center gap-1.5 ${assignedLabel.color}`}>
                  <span className="w-1.5 h-1.5 bg-white rounded-full opacity-60"></span>
                  {assignedLabel.name}
                </span>
              </div>
            )}
            
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-4"
              >
                <div className="bg-[#F3F4F6] rounded-[24px] rounded-tl-[8px] p-4 max-w-[85%] relative flex items-center gap-1.5 h-[46px]">
                  <motion.div className="w-1.5 h-1.5 bg-gray-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                  <motion.div className="w-1.5 h-1.5 bg-gray-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                  <motion.div className="w-1.5 h-1.5 bg-gray-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Attachment Menu */}
      <AnimatePresence>
        {showAttachmentMenu && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute bottom-[80px] left-4 right-4 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 z-30 overflow-hidden"
          >
            <div className="grid grid-cols-3 gap-y-6 gap-x-2 p-6">
              <button className="flex flex-col items-center gap-2 group" onClick={() => setShowAttachmentMenu(false)}>
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:scale-105 group-active:scale-95 transition-all">
                  <File size={24} strokeWidth={2} />
                </div>
                <span className="text-[12px] font-semibold text-gray-600">Fichier</span>
              </button>
              
              <button className="flex flex-col items-center gap-2 group" onClick={() => setShowAttachmentMenu(false)}>
                <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 group-hover:scale-105 group-active:scale-95 transition-all">
                  <FileText size={24} strokeWidth={2} />
                </div>
                <span className="text-[12px] font-semibold text-gray-600">Document</span>
              </button>
              
              <button className="flex flex-col items-center gap-2 group" onClick={() => setShowAttachmentMenu(false)}>
                <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center text-pink-500 group-hover:scale-105 group-active:scale-95 transition-all">
                  <ImageIcon size={24} strokeWidth={2} />
                </div>
                <span className="text-[12px] font-semibold text-gray-600">Photo / Vidéo</span>
              </button>

              <button className="flex flex-col items-center gap-2 group" onClick={handleSendQRCode}>
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 group-hover:scale-105 group-active:scale-95 transition-all">
                  <QrCode size={24} strokeWidth={2} />
                </div>
                <span className="text-[12px] font-semibold text-gray-600">QR code</span>
              </button>

              <button className="flex flex-col items-center gap-2 group" onClick={handleScanAndPay}>
                <div className="w-14 h-14 rounded-full bg-[#E5F3FC] flex items-center justify-center text-[#4A90E2] group-hover:scale-105 group-active:scale-95 transition-all">
                  <ScanLine size={24} strokeWidth={2} />
                </div>
                <span className="text-[12px] font-semibold text-gray-600">Scanner</span>
              </button>
            </div>
            <div className="h-14 border-t border-gray-100 flex items-center justify-center">
              <button 
                onClick={() => setShowAttachmentMenu(false)}
                className="w-full h-full text-red-500 font-bold text-sm tracking-wide active:bg-gray-50 transition-colors flex items-center justify-center gap-1"
              >
                <X size={18} strokeWidth={2.5} /> Fermer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md pt-2 pb-4 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] z-20">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 flex items-center bg-[#F3F4F6] rounded-full px-2 py-1 min-h-[50px] border border-gray-100/50">
            <button 
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className="p-2.5 text-gray-400 hover:text-gray-600 shrink-0 transition-colors"
            >
              <Paperclip size={22} strokeWidth={2} className="-rotate-45" />
            </button>
            
            <input 
              type="text" 
              placeholder="Message..." 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              className="flex-1 min-w-0 bg-transparent border-none outline-none text-[15px] font-medium text-gray-800 placeholder:text-gray-400 px-1 py-3"
            />
            
            <button className="p-2.5 text-gray-400 hover:text-gray-600 shrink-0 transition-colors">
              <SmilePlus size={22} strokeWidth={2} />
            </button>
          </div>
          
          <div className="shrink-0 flex items-center justify-center ml-1.5">
            {message.trim().length > 0 ? (
               <button 
                 onClick={handleSendMessage}
                 className="w-11 h-11 flex items-center justify-center rounded-full bg-[#E0F2FE] text-[#0369A1] hover:bg-[#BAE6FD] shrink-0 cursor-pointer transition-colors"
               >
                 <Send size={20} strokeWidth={2.5} className="mr-0.5 mt-0.5" />
               </button>
             ) : (
               <button 
                 onClick={() => setIsRecording(true)}
                 className="w-11 h-11 flex items-center justify-center rounded-full bg-[#E0F2FE] text-[#0369A1] hover:bg-[#BAE6FD] shrink-0 cursor-pointer transition-colors"
               >
                 <Mic size={20} strokeWidth={2.5} />
               </button>
            )}
           </div>
        </div>
      </div>

      {isRecording && (
        <VoiceNote 
          onCancel={() => setIsRecording(false)} 
          onSend={handleSendAudio} 
        />
       )}

      {/* Immersive interactive QR Code scanner simulation */}
      <AnimatePresence>
        {isScanningQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950 z-[100] flex flex-col justify-between p-6 pointer-events-auto rounded-[40px] text-white"
          >
            {/* Camera Viewfinder & Ambient Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(2,6,23,0.95)_100%)] pointer-events-none z-0" />
            
            {/* Grid Scan Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-40" />

            {/* Top Toolbar */}
            <div className="flex justify-between items-center z-10 relative mt-[48px]">
              <button 
                onClick={() => {
                  playScanBeep(440, 0.1);
                  setIsScanningQR(false);
                  setScanState('idle');
                }}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-white"
              >
                <X size={20} />
              </button>
              <div className="flex flex-col items-center">
                <span className="text-[14px] font-extrabold tracking-wider text-sky-400 uppercase">Scanner de Code QR</span>
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" /> LIVE CAMERA FEED
                </span>
              </div>
              <div className="w-10 h-10" /> {/* Balancer */}
            </div>

            {/* Viewfinder Frame Area */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-10 my-4">
              
              {scanState === 'scanning' && (
                <div className="relative w-[230px] h-[230px] flex items-center justify-center">
                  
                  {/* Viewfinder Corners (Glowing Brackets) */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-sky-400 rounded-tl-xl shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-sky-400 rounded-tr-xl shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-sky-400 rounded-bl-xl shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-sky-400 rounded-br-xl shadow-[0_0_15px_rgba(56,189,248,0.5)]" />

                  {/* Laser Scan Sweeper */}
                  <motion.div 
                    className="absolute left-1 right-1 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_16px_rgba(34,211,238,0.8)] z-10"
                    animate={{ top: ['4px', '224px', '4px'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />

                  {/* Inside QR Scan Targets */}
                  <div className="w-full h-full p-6 bg-slate-900/40 rounded-xl backdrop-blur-[1px] flex items-center justify-center overflow-hidden">
                    <motion.div 
                      animate={{ scale: [1, 1.04, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="w-40 h-40 bg-white p-3 rounded-xl shadow-2xl relative"
                    >
                      <img 
                        src={scannedQRImageUrl} 
                        alt="Target QR" 
                        className="w-full h-full object-cover rounded-lg filter brightness-95 contrast-105" 
                      />
                      {/* Glitch Overlay Effect */}
                      <div className="absolute inset-0 bg-sky-500/10 mix-blend-color-dodge animate-pulse rounded-xl" />
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Success Flash Capture Transition */}
              <AnimatePresence>
                {scanState === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 w-full max-w-[310px] text-center shadow-2xl z-20 backdrop-blur-md relative"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <ShieldCheck size={36} className="animate-bounce" />
                    </div>
                    
                    <h2 className="text-[17px] font-black text-white tracking-wide uppercase">Code QR Détecté !</h2>
                    <p className="text-[12px] text-slate-400 font-medium mt-1">Sceau d'authenticité vérifié par TASKup</p>

                    {/* Receipt Details Card */}
                    <div className="mt-5 p-4 bg-white/5 rounded-2xl border border-white/5 text-left space-y-2.5">
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-slate-400 font-semibold">Destinataire</span>
                        <span className="text-white font-bold">{chat.name}</span>
                      </div>
                      <div className="flex justify-between items-center text-[12px]">
                        <span className="text-slate-400 font-semibold">Prestation</span>
                        <span className="text-sky-300 font-bold truncate max-w-[140px]">Service d'échange</span>
                      </div>
                      <div className="h-[1px] bg-white/10 my-1" />
                      <div className="flex justify-between items-end">
                        <span className="text-[12px] text-slate-400 font-semibold pb-0.5">Montant Requis</span>
                        <span className="text-[20px] font-black text-emerald-400 tracking-tight">{scannedAmount} €</span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-6 flex flex-col gap-2.5">
                      <button 
                        onClick={handleConfirmPayment}
                        className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:opacity-95 active:scale-98 transition-all rounded-2xl text-white font-bold text-[13px] tracking-wide flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(14,165,233,0.3)] cursor-pointer"
                      >
                        <Sparkles size={16} /> Confirmer le paiement
                      </button>
                      <button 
                        onClick={() => {
                          playScanBeep(330, 0.1);
                          setIsScanningQR(false);
                          setScanState('idle');
                        }}
                        className="w-full py-3 text-slate-400 hover:text-white font-semibold text-[13px] hover:bg-white/5 rounded-2xl transition-all cursor-pointer"
                      >
                        Annuler
                      </button>
                    </div>
                  </motion.div>
                )}

                {scanState === 'confirmed' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-950/40 text-center z-20 flex flex-col items-center justify-center p-6 rounded-3xl"
                  >
                    <div className="relative w-24 h-24 mb-6">
                      {/* Success Confetti Background */}
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: [1, 1.4, 1.2], opacity: [0, 1, 0.8] }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-30" 
                      />
                      <motion.div 
                        initial={{ rotate: -90, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                      >
                        <Check size={48} strokeWidth={4} />
                      </motion.div>
                    </div>

                    <h2 className="text-[22px] font-black tracking-tight text-white mb-2">Paiement Envoyé !</h2>
                    <p className="text-[14px] text-slate-300 font-medium px-4 max-w-[260px] leading-relaxed">
                      Sceau de libération cryptographique transféré à <span className="font-bold text-sky-300">{chat.name}</span>.
                    </p>

                    <div className="mt-8 flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[12px] text-emerald-400 font-semibold leading-none">
                      <ShieldCheck size={14} /> Sécurisé par TASKup SafeGuard
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Status Panel */}
            <div className="z-10 relative mb-8 flex flex-col items-center">
              {scanState === 'scanning' && (
                <div className="w-full max-w-[280px] bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-center backdrop-blur-md">
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mb-2 font-semibold">
                    <span>{scanProgress < 100 ? "TRAITEMENT EN COURS" : "DÉCODÉ"}</span>
                    <span className="text-sky-400 font-extrabold">{scanProgress}%</span>
                  </div>
                  {/* Telemetry Progress Bar */}
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-sky-400 to-cyan-400"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400/90 font-medium tracking-wide mt-2.5 block text-center truncate">
                    {scanProgress <= 25 && "⚙️ Analyse de l'image & Mise au point..."}
                    {scanProgress > 25 && scanProgress <= 50 && "⚡ Connexion sécurisée de la passerelle..."}
                    {scanProgress > 50 && scanProgress <= 75 && "🔑 Déchiffrement de l'adresse de transaction..."}
                    {scanProgress > 75 && scanProgress <= 95 && "🛡️ Signature cryptographique TASKup..."}
                    {scanProgress > 95 && "✅ Prêt pour validation !"}
                  </span>
                </div>
              )}
              
              {scanState === 'scanning' && (
                <span className="text-[11.5px] text-slate-500 font-semibold mt-4 text-center max-w-[230px] leading-relaxed">
                  {scanSource === 'message' 
                    ? "Ciblage direct du code QR envoyé dans votre discussion actuelle." 
                    : "Placez le code QR d'une tâche ou d'un artisan au centre du repère."
                  }
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
