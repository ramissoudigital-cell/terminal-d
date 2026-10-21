import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Activity, MessageCircle, Sparkles } from 'lucide-react';

interface VoiceAssistantProps {
  userName: string;
  onNavigate: (page: string) => void;
  // onClose removed as it is handled internally now
}

export const VoiceAssistant: React.FC<VoiceAssistantProps> = ({ userName, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [step, setStep] = useState<'greeting' | 'listening' | 'processing' | 'done'>('greeting');

  // Nouvelle image haute qualité (Portrait professionnel et esthétique)
  const assistantImage = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";

  // Effect to handle opening the assistant
  useEffect(() => {
    if (isOpen) {
        setStep('greeting');
        setTranscript('');
        setFeedback('');
        // Small delay to allow UI to render before speaking
        const timer = setTimeout(() => {
            speak(`Bonjour ${userName.split(' ')[0]}. Je suis prête. Que souhaitez-vous faire ?`);
            setStep('listening');
        }, 800);
        return () => clearTimeout(timer);
    } else {
        stopListening();
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
    }
  }, [isOpen, userName]);

  // Auto-start listening after greeting
  useEffect(() => {
      if (isOpen && step === 'listening') {
          const timer = setTimeout(() => {
              startListening();
          }, 4000); // Wait for the greeting to finish
          return () => clearTimeout(timer);
      }
  }, [isOpen, step]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel previous speech to avoid queueing
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      
      // Tuning for a more pleasant/realistic voice
      utterance.pitch = 1.1; // Légèrement plus haut pour une voix féminine standard
      utterance.rate = 1.05; // Un peu plus dynamique
      utterance.volume = 1.0;

      // Try to find a high quality female voice (Google Francais or similar)
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
          (v.name.includes('Google') && v.name.includes('Français')) || 
          v.name.includes('Amelie') || 
          v.name.includes('Thomas') === false // Avoid male voices if possible by exclusion
      );
      
      if (preferredVoice) utterance.voice = preferredVoice;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const processCommand = (command: string) => {
      setStep('processing');
      const lowerCmd = command.toLowerCase();
      let targetPage = '';
      let responseText = '';

      if (lowerCmd.includes('appel') || lowerCmd.includes('présence') || lowerCmd.includes('assiduité')) {
          targetPage = 'students';
          responseText = "Je vous ouvre le registre de présence immédiatement.";
      } else if (lowerCmd.includes('emploi du temps') || lowerCmd.includes('planning') || lowerCmd.includes('cours')) {
          targetPage = 'schedule';
          responseText = "Voici l'emploi du temps de la semaine.";
      } else if (lowerCmd.includes('note') || lowerCmd.includes('bulletin') || lowerCmd.includes('classe') || lowerCmd.includes('résultat')) {
          targetPage = 'classes';
          responseText = "Consultons les résultats et les classes.";
      } else if (lowerCmd.includes('prof') || lowerCmd.includes('enseignant') || lowerCmd.includes('collègue')) {
          targetPage = 'teachers';
          responseText = "Accès à la liste des professeurs.";
      } else if (lowerCmd.includes('message') || lowerCmd.includes('communication') || lowerCmd.includes('parent') || lowerCmd.includes('envoyer')) {
          targetPage = 'communication';
          responseText = "Ouverture du module de communication.";
      } else if (lowerCmd.includes('inscription') || lowerCmd.includes('ajouter') || lowerCmd.includes('nouveau')) {
          targetPage = 'registration';
          responseText = "Allons inscrire un nouveau membre.";
      } else if (lowerCmd.includes('finance') || lowerCmd.includes('argent') || lowerCmd.includes('croissance')) {
        targetPage = 'insights';
        responseText = "Voici le rapport financier.";
      } else {
          setFeedback("Pardon, je n'ai pas compris.");
          speak("Je n'ai pas bien saisi. Pouvez-vous répéter ?");
          setStep('listening'); // Retry
          return;
      }

      setFeedback(responseText);
      speak(responseText);

      setTimeout(() => {
          onNavigate(targetPage);
          setIsOpen(false); // Close modal automatically
      }, 2500);
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setFeedback("Navigateur incompatible.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'fr-FR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("Je vous écoute...");
    };

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(`"${result}"`);
      processCommand(result);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setTranscript("");
      // Don't auto-close on error, let user retry
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
      // Logic handled by browser usually, but good placeholder
      setIsListening(false);
  };

  // --- FLOATING ACTION BUTTON (FAB) ---
  if (!isOpen) {
      return (
          <button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50 w-16 h-16 rounded-full border-4 border-white shadow-[0_8px_30px_rgba(0,0,0,0.3)] overflow-hidden transition-transform hover:scale-110 active:scale-95 group animate-in slide-in-from-bottom-10"
          >
              <img 
                src={assistantImage} 
                alt="AI" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-sky-500/0 group-hover:bg-sky-500/20 transition-colors"></div>
              {/* Online Indicator */}
              <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </button>
      );
  }

  // --- FULL SCREEN OVERLAY ---
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
        
        {/* Close Button */}
        <button 
            onClick={() => setIsOpen(false)} 
            className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
        >
            <X size={32} />
        </button>

        <div className="flex flex-col items-center max-w-lg w-full text-center relative">
            
            {/* Visualizer Effect Background */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-[100px] transition-all duration-500 ${isListening ? 'scale-110 opacity-100' : 'scale-75 opacity-50'}`}></div>

            {/* Avatar Circle */}
            <div className="relative mb-10 group">
                <div className={`absolute inset-0 bg-gradient-to-r from-sky-500 to-orange-500 rounded-full blur-md transition-all duration-1000 ${isListening ? 'scale-110 opacity-80 animate-pulse' : 'scale-100 opacity-40'}`}></div>
                <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-[6px] border-white/10 shadow-2xl relative z-10">
                    <img 
                        src={assistantImage} 
                        alt="AI Assistant" 
                        className="w-full h-full object-cover transform transition-transform duration-[20s] hover:scale-110" 
                    />
                </div>
                
                {/* Status Badge */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 whitespace-nowrap">
                    {isListening ? (
                        <>
                            <Activity size={16} className="text-sky-400 animate-bounce" />
                            <span className="text-sky-100">J'écoute...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles size={16} className="text-yellow-400" />
                            <span>IA Connectée</span>
                        </>
                    )}
                </div>
            </div>

            {/* Conversation Text */}
            <div className="space-y-4 mb-12 h-32 flex flex-col justify-center items-center max-w-md">
                <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight drop-shadow-lg transition-all">
                    {step === 'greeting' && `Bonjour ${userName.split(' ')[0]}.`}
                    {step === 'listening' && "Je suis à votre écoute."}
                    {step === 'processing' && feedback}
                    {step === 'done' && "C'est parti !"}
                </h2>
                <p className={`text-xl font-medium min-h-[1.5rem] italic transition-all duration-300 ${isListening ? 'text-sky-300 opacity-100' : 'text-gray-400 opacity-0'}`}>
                    {transcript || "..."}
                </p>
            </div>

            {/* Manual Mic Trigger */}
            <button 
                onClick={startListening}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-2xl ${
                    isListening 
                    ? 'bg-sky-600 text-white shadow-[0_0_50px_rgba(220,38,38,0.5)] scale-110' 
                    : 'bg-white/10 text-white hover:bg-white/20 border-2 border-white/20 backdrop-blur-sm'
                }`}
            >
                {isListening ? <Activity size={40} className="animate-pulse" /> : <Mic size={40} />}
            </button>
            <p className="text-white/30 text-xs mt-6 uppercase tracking-[0.2em] font-medium">
                Appuyez pour parler
            </p>
        </div>
    </div>
  );
};
