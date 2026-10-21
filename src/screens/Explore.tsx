import { motion } from 'motion/react';
import { Search, ChevronLeft, MoreHorizontal, Play } from 'lucide-react';

interface ExploreProps {
  onNavigate: () => void;
}

export default function Explore({ onNavigate }: ExploreProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full bg-white text-brand-dark relative flex flex-col font-sans"
    >
      {/* Header */}
      <div className="flex items-center justify-center px-6 pt-12 pb-4 relative">
        <button 
          onClick={onNavigate}
          className="absolute left-0 top-10 bg-brand-purple rounded-r-[1.5rem] py-4 px-3 flex flex-col items-center justify-center w-[44px] shadow-lg shadow-purple-500/20"
        >
          <ChevronLeft className="text-brand-peach w-5 h-5 mb-4" strokeWidth={3} />
          <span className="-rotate-90 text-[9px] font-bold tracking-[0.2em] text-brand-peach uppercase">Retour</span>
        </button>
        <h1 className="text-[22px] font-bold">Explorer</h1>
        <button className="absolute right-6 top-12 text-brand-purple">
          <MoreHorizontal className="w-7 h-7" />
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-3 px-6 mt-6">
        <div className="flex-1 flex items-center bg-brand-gray rounded-[1.25rem] px-5 py-4">
          <span className="text-gray-400 font-medium text-sm">Rechercher</span>
        </div>
        <button className="bg-brand-purple p-4 rounded-[1.25rem] shadow-[0_8px_20px_-5px_rgba(66,32,163,0.5)]">
          <Search className="text-white w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Categories */}
      <div className="mt-8 mb-6 overflow-hidden w-full">
        <div className="flex px-6 space-x-2 overflow-x-auto hide-scrollbar pb-2">
          <button className="bg-brand-peach text-brand-peach-dark px-6 py-[10px] rounded-[1rem] font-bold text-sm shrink-0 shadow-sm">
            Tout
          </button>
          <button className="text-gray-400 px-4 py-[10px] font-semibold text-sm shrink-0">
            Basket-ball
          </button>
          <button className="text-gray-400 px-4 py-[10px] font-semibold text-sm shrink-0">
            Volley-ball
          </button>
          <button className="text-gray-400 px-4 py-[10px] font-semibold text-sm shrink-0">
            Football
          </button>
          <button className="text-gray-400 pl-4 py-[10px] font-semibold text-sm shrink-0">
            F...
          </button>
        </div>
      </div>

      <div className="flex-1 w-full px-6 overflow-y-auto hide-scrollbar pb-[100px]">
        {/* Main Live Card */}
        <div className="relative w-full h-[220px] rounded-[2rem] overflow-hidden mb-8 shadow-2xl flex items-end">
          {/* Background image & gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-purple-800 to-red-600" />
          <img 
             src="https://images.unsplash.com/photo-1574629810360-7efbb192453a?w=800&q=80&fit=crop" 
             className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60" 
             alt="Match background" 
          />
          {/* Central VS text (decorative) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-white/40 font-black italic text-6xl rotate-[-10deg]">Vs</span>
          </div>

          <div className="absolute top-4 right-4 bg-red-600/90 backdrop-blur-md text-white text-[8px] font-bold px-2 py-1 rounded shadow text-center z-10 w-8 h-[5.5rem] flex flex-col justify-center gap-2 uppercase">
            <span className="w-1.5 h-1.5 bg-white rounded-full mx-auto animate-pulse" />
            <span className="rotate-90 origin-bottom font-black tracking-widest translate-x-1.5 -translate-y-4">DIRECT</span>
          </div>

          {/* Content layered at bottom */}
          <div className="relative z-10 w-full p-5 flex items-end justify-between bg-gradient-to-t from-black/90 via-black/40 to-transparent">
             <div className="flex flex-col">
               <h2 className="text-white font-bold text-[17px] mb-1">Liverpool vs. Man United</h2>
               <p className="text-white/60 font-medium text-[10px]">Demi-finale . Ligue des champions</p>
             </div>
             
             {/* Play button overlapping */}
             <button className="w-12 h-12 bg-brand-purple rounded-[1rem] flex items-center justify-center shadow-[0_8px_20px_rgba(66,32,163,0.6)] cursor-pointer hover:scale-105 transition-transform absolute bottom-5 right-5 z-20">
                <Play className="text-white w-5 h-5 ml-1" fill="white" />
             </button>
          </div>
        </div>

        {/* Upcoming Header */}
        <div className="flex items-center justify-between xl mb-5">
          <h2 className="text-[22px] font-bold text-brand-dark">À venir</h2>
          <button className="text-brand-purple text-xs font-bold bg-brand-purple/5 px-4 py-2 rounded-full">
            Voir tout
          </button>
        </div>

        {/* Upcoming Horizontal Scroll */}
        <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-6 w-full -mr-6 pr-6">
          
          {/* UFC Card */}
          <div className="w-[200px] shrink-0">
             <div className="w-full h-[120px] rounded-[1.5rem] overflow-hidden relative mb-3 shadow-lg">
               <img src="https://images.unsplash.com/photo-1599554869811-0982df4cc6ff?w=400&q=80&fit=crop" className="w-full h-full object-cover" alt="UFC" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3">
                 <p className="text-yellow-500 font-bold text-[8px] text-center mb-1 uppercase tracking-widest">UFC 242</p>
                 <h3 className="text-white font-black text-xs text-center leading-tight">KHABIB VS POIRIER<br/>SEP 7 SAT</h3>
               </div>
             </div>
             <p className="font-bold text-brand-dark text-[11px] mb-0.5">Dimanche, 7/9 - ESPN-C</p>
             <p className="text-gray-400 text-[9px] font-medium">Championnat du monde poids légers</p>
          </div>

          {/* Soccer Legends Card */}
          <div className="w-[200px] shrink-0">
             <div className="w-full h-[120px] rounded-[1.5rem] overflow-hidden relative mb-3 shadow-lg bg-gray-900 border border-gray-100 flex items-center justify-center">
               <img src="https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=400&q=80&fit=crop" className="absolute w-full h-full object-cover opacity-60" alt="Soccer" />
               <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-red-900/50 mix-blend-multiply" />
               <h3 className="text-white font-bold text-xs text-center leading-tight relative z-10 w-3/4 drop-shadow-md">
                 BARCA LEGEND VS<br/>MAN UNITED LEGEND
               </h3>
             </div>
             <p className="font-bold text-brand-dark text-[11px] mb-0.5">Lundi, 7/9 - ESPN-O</p>
             <p className="text-gray-400 text-[9px] font-medium">Demi-finale . Ligue des champions</p>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
