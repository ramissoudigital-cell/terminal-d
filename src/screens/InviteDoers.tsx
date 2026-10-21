import React, { useState } from 'react';
import { Doer } from '../types';
import { Calendar, SlidersHorizontal, Heart, Check, Plus, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { CircularProgress } from '../components/Shared';
import { SettingsDrawer } from '../SettingsDrawer';

const mockDoer: Doer = {
  id: 'd1',
  name: 'David Brown',
  location: 'USA, New-York',
  avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
  level: 72,
  rating: 80,
  experience: 'Expert',
  awards: 27,
  points: 142,
  biodata: "Je suis là pour vous faciliter la vie en accomplissant les tâches rapidement et efficacement. Sympathique, organisé et toujours prêt à aider."
};

const mockDoer2: Doer = {
  id: 'd2',
  name: 'Jack Wellington',
  location: 'Italy, Milano',
  avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
  level: 85,
  rating: 92,
  experience: 'Sénior',
  awards: 43,
  points: 215,
  biodata: "Créatif et proactif, avec une grande expertise dans les domaines de la logistique locale."
};

export const InviteDoers = ({ onBack, onNavigateSettings, onNavigateInfo, onNavigateQRCode, onNavigateMap, onNavigateCalendar }: { onBack: () => void, onNavigateSettings?: () => void, onNavigateInfo?: () => void, onNavigateQRCode?: () => void, onNavigateMap?: () => void, onNavigateCalendar?: () => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const allDoers = [mockDoer, mockDoer2];
  const filteredDoers = allDoers.filter(doer => 
    doer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    doer.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doer.biodata.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: 50, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 25, duration: 0.6 }}
      className="flex flex-col pb-10 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] h-full relative"
    >
      {/* Header */}
      <header className="px-6 pt-[60px] pb-4 flex items-center justify-between relative z-10">
        <div className="w-10 h-10" />
        <h1 className="text-xl font-semibold tracking-tight text-[#2D3142]">Inviter des profils</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => onNavigateCalendar?.()}
            className="w-[34px] h-[34px] rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-sky-500 transition-colors"
          >
             <Calendar className="w-4 h-4 stroke-[1.5]" />
          </button>
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="w-[34px] h-[34px] rounded-full bg-white shadow-sm flex items-center justify-center text-slate-400 transition-active active:scale-95"
          >
             <SlidersHorizontal className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>
      </header>

      {/* Doer Card */}
      <div className="px-6 mt-2 gap-6 flex flex-col pb-28">
        {filteredDoers.length === 0 ? (
          <div className="text-center text-slate-500 py-10 font-medium tracking-wide">Aucun résultat trouvé...</div>
        ) : (
          filteredDoers.map(doer => <DoerCard key={doer.id} doer={doer} />)
        )}
      </div>

      {/* Bottom Floating Search Bar */}
      <div className="sticky bottom-[20px] mt-auto left-0 w-full px-2 z-20 pointer-events-auto">
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", delay: 0.2, stiffness: 300, damping: 25 }}
          className="relative group"
        >
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
          <div className="relative rounded-[2rem] p-[3px] shadow-[0_15px_40px_rgba(0,0,0,0.15)] overflow-hidden flex bg-white z-10">
            {/* Animated gradient spinning border */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square z-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="w-full h-full bg-[conic-gradient(from_0deg,#B294DE,#6CA6F1,#F3D76F,#B294DE)] opacity-90"
              />
            </div>
            
            <div className="relative w-full bg-white/95 rounded-[1.8rem] p-2.5 flex items-center backdrop-blur-md z-10">
              <div className="w-10 h-10 rounded-full bg-[#FAFAFC] flex items-center justify-center shrink-0 ml-1">
                <Search className="w-5 h-5 text-[#B294DE]" strokeWidth={2.5} />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher profil, compétences, lieu..." 
                className="flex-1 bg-transparent border-none outline-none text-[#2D3142] placeholder-slate-400 text-[0.85rem] px-4 font-medium tracking-wide"
              />
            </div>
          </div>
        </motion.div>
      </div>

      <SettingsDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        onNavigateSettings={onNavigateSettings}
        onNavigateInfo={onNavigateInfo}
        onNavigateQRCode={onNavigateQRCode}
        onNavigateMap={onNavigateMap}
        onNavigateCalendar={onNavigateCalendar}
      />
    </motion.div>
  );
};

const DoerCard: React.FC<{ doer: Doer }> = ({ doer }) => {
  return (
    <div className="bg-white rounded-[2.5rem] p-7 shadow-[0_12px_40px_rgb(0,0,0,0.03)] border border-slate-50 flex flex-col">
      
      {/* Top Header Row */}
      <div className="flex justify-between items-start mb-8">
        <div className="flex items-center gap-3.5">
          <img src={doer.avatarUrl} alt={doer.name} className="w-12 h-12 rounded-full object-cover shadow-sm bg-slate-200" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[#2D3142] text-[1.05rem] font-semibold tracking-tight">{doer.name}</span>
            <span className="text-slate-400 text-[0.75rem] font-medium tracking-wide">{doer.location}</span>
          </div>
        </div>
        <div className="bg-[#E4EFFF] px-3.5 py-1.5 rounded-md text-[#5493E1] text-[0.7rem] font-bold tracking-wide uppercase">
          Meilleur Profil
        </div>
      </div>

      {/* Charts Row */}
      <div className="flex justify-center gap-12 mb-8">
        <CircularProgress value={`${doer.level}`} label="Niveau" color="#B294DE" ringColor="#C4AAED" />
        <CircularProgress value={`${doer.rating}%`} label="Évaluation" color="#6CA6F1" ringColor="#8BB8F3" />
      </div>

      {/* Description */}
      <p className="text-slate-500 text-[0.85rem] leading-[1.6] tracking-wide text-center font-medium mb-8 px-2 w-[90%] mx-auto">
        {doer.biodata}
      </p>

      {/* Stats Row */}
      <div className="flex justify-around items-center mb-10">
        <div className="flex flex-col items-center gap-1.5">
           <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#B294DE]"></div><span className="text-[0.65rem] text-slate-400 tracking-wide font-semibold uppercase">Expérience</span></div>
           <span className="text-[#2D3142] text-lg font-semibold tracking-tight">{doer.experience}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
           <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#6CA6F1]"></div><span className="text-[0.65rem] text-slate-400 tracking-wide font-semibold uppercase">Avis positifs</span></div>
           <span className="text-[#2D3142] text-lg font-semibold tracking-tight">{doer.awards}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
           <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#F3D76F]"></div><span className="text-[0.65rem] text-slate-400 tracking-wide font-semibold uppercase">Tarif/j</span></div>
           <span className="text-[#2D3142] text-lg font-semibold tracking-tight">{(doer.points).toLocaleString()} €</span>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="flex items-center justify-between px-1">
        <button className="w-11 h-11 rounded-full border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 transition-active active:scale-95">
          <Heart className="w-5 h-5 stroke-[1.5]" />
        </button>
        <button className="w-11 h-11 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-800 shadow-sm transition-active active:scale-95">
          <Check className="w-5 h-5 stroke-[1.5]" />
        </button>
        <button className="w-11 h-11 rounded-full border border-slate-100 shadow-sm flex items-center justify-center text-slate-400 transition-active active:scale-95">
          <Plus className="w-5 h-5 stroke-[1.5]" />
        </button>
        <button className="bg-[#EEE6FC] hover:bg-[#E5DAF9] text-[#8565CD] font-semibold text-sm px-6 py-3.5 rounded-[1rem] min-w-[100px] tracking-wide transition-all active:scale-95">
          Inviter
        </button>
      </div>

    </div>
  );
};
