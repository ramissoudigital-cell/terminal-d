import React from 'react';
import { ChevronLeft, Plus, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

interface CreateEventViewProps {
  onBack: () => void;
}

export const CreateEventView: React.FC<CreateEventViewProps> = ({ onBack }) => {
  return (
    <motion.div 
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-[300] h-full bg-white overflow-y-auto hide-scrollbar font-sans text-[#3B415A] px-6 pb-6 pt-10"
    >
      {/* Header */}
      <div className="flex items-center h-10 mb-6">
        <button onClick={onBack} className="text-[#9BA5B7] hover:text-[#3B415A] transition-colors w-10 flex items-center justify-start -ml-2">
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
      </div>

      <h1 className="text-[26px] font-normal tracking-wide text-[#3B415A] mb-8">Nouvel Événement</h1>

      <div className="mb-12 w-full bg-transparent border-b border-[#E1E5F1] pb-2 cursor-text">
        <div className="text-[9px] font-bold tracking-widest text-[#9BA5B7] uppercase mb-1">Titre</div>
        <span className="text-[15px] font-medium text-[#3B415A] tracking-wide">Conférence de Design</span>
      </div>

      {/* Time Dial */}
      <div className="w-full flex justify-center mb-12 relative">
        <div className="w-[200px] h-[200px] rounded-full border-[1.5px] border-[#E1E5F1] relative flex flex-col items-center justify-center bg-[#F3F5FA] shadow-inner">
          
          {/* Tick Marks inner ring */}
          <svg width="180" height="180" className="absolute inset-0 m-auto pointer-events-none" viewBox="0 0 180 180">
            {Array.from({ length: 24 }).map((_, i) => {
              const rotation = (i * 360) / 24;
              const isMajor = i % 4 === 0;
              return (
                <line 
                  key={i}
                  x1="90" y1={isMajor ? "6" : "10"} 
                  x2="90" y2="14" 
                  stroke={isMajor ? "#A8B2CA" : "#DCE0EA"} 
                  strokeWidth="1.5"
                  transform={`rotate(${rotation} 90 90)`}
                  strokeLinecap="round"
                />
              )
            })}
          </svg>

          {/* Dial track arc segments overlapping */}
          <svg width="200" height="200" className="absolute inset-0 rounded-full" viewBox="0 0 200 200">
             {/* Orange block */}
             <circle 
              cx="100" cy="100" r="99" 
              fill="transparent" stroke="#F1844B" 
              strokeWidth="4" 
              strokeDasharray="20 600" 
              transform="rotate(150 100 100)"
            />
            {/* Blue block */}
            <circle 
              cx="100" cy="100" r="99" 
              fill="transparent" stroke="#259CFF" 
              strokeWidth="4" 
              strokeDasharray="70 600" 
              transform="rotate(180 100 100)"
            />
            {/* Pink block */}
            <circle 
              cx="100" cy="100" r="99" 
              fill="transparent" stroke="#E643AD" 
              strokeWidth="4" 
              strokeDasharray="30 600" 
              transform="rotate(270 100 100)"
            />
             {/* Green block */}
             <circle 
              cx="100" cy="100" r="99" 
              fill="transparent" stroke="#20D489" 
              strokeWidth="4" 
              strokeDasharray="40 600" 
              transform="rotate(-50 100 100)"
            />
            
            {/* Outline sweep line connecting the knobs */}
             <circle 
              cx="100" cy="100" r="99" 
              fill="transparent" stroke="#4A90E2" 
              strokeWidth="2.5" 
              strokeDasharray="140 600" 
              transform="rotate(30 100 100)"
            />
          </svg>

          {/* Dial knobs */}
          <div className="absolute w-[22px] h-[22px] bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.15)] flex items-center justify-center right-[5px] top-[75%] z-10 cursor-pointer">
             <ChevronLeft size={10} className="text-[#4A90E2]" strokeWidth={3} />
          </div>
          <div className="absolute w-[22px] h-[22px] bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.15)] flex items-center justify-center left-[28px] top-[85%] z-10 cursor-pointer">
            <ChevronLeft size={10} className="text-[#4A90E2] rotate-180" strokeWidth={3} />
          </div>

          <div className="relative z-10 text-[26px] font-bold tracking-widest text-[#3B415A] mt-2">
            16.00
          </div>
          <div className="relative z-10 text-[11px] font-medium text-[#9BA5B7] tracking-wider mt-1">
            jusqu'à 19:00
          </div>
        </div>
      </div>

      {/* Options List */}
      <div className="flex flex-col mb-[52px]">
        <div className="flex justify-between items-center text-[13px] py-[18px] border-b border-[#E1E5F1] cursor-pointer">
          <span className="text-[#9BA5B7] font-medium tracking-wide">Répéter</span>
          <span className="text-[#3B415A] font-medium flex items-center gap-2">Jamais <ChevronDown size={14} className="text-[#3B415A] relative top-px" /></span>
        </div>
        
        <div className="flex justify-between items-center text-[13px] py-[18px] border-b border-[#E1E5F1] cursor-pointer">
          <span className="text-[#9BA5B7] font-medium tracking-wide">Alerte</span>
          <span className="text-[#3B415A] font-medium flex items-center gap-2">15 min avant <ChevronDown size={14} className="text-[#3B415A] relative top-px" /></span>
        </div>

        <div className="flex justify-between items-center text-[13px] py-[18px] border-b border-[#E1E5F1] cursor-pointer">
          <span className="text-[#9BA5B7] font-medium tracking-wide">Invités</span>
          <span className="text-[#3B415A] font-medium flex items-center gap-2">Adrian & Josse <ChevronDown size={14} className="text-[#3B415A] relative top-px" /></span>
        </div>

        <div className="flex justify-between items-center text-[13px] py-[18px] border-b border-[#E1E5F1] cursor-pointer">
          <span className="text-[#9BA5B7] font-medium tracking-wide">Calendrier</span>
          <span className="text-[#3B415A] font-medium flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#E643AD]"></div> Tâche <ChevronDown size={14} className="text-[#3B415A] relative top-px" /></span>
        </div>
      </div>

      <div className="flex justify-center pb-8">
        <button className="flex items-center gap-2 text-[#4A90E2] hover:text-[#3B415A] font-medium text-[14px] tracking-wide transition-colors">
          <Plus size={16} strokeWidth={2.5} />
          Ajouter une Tâche
        </button>
      </div>

    </motion.div>
  );
};
