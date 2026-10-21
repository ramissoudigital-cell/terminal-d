import { motion } from 'motion/react';
import { AlignJustify, Search, Crown, Shield, Globe } from 'lucide-react';

interface HomeProps {
  onNavigate: () => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      className="w-full h-full bg-brand-purple text-white relative flex flex-col font-sans"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-12 pb-4">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={onNavigate}>
          <div className="w-[3px] h-6 bg-brand-peach rounded-full" />
          <span className="text-white/60 text-lg font-light tracking-wide">Rechercher</span>
        </div>
        <button className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
          <div className="grid grid-cols-2 gap-[3px]">
            <div className="w-[5px] h-[5px] bg-brand-peach rounded-full" />
            <div className="w-[5px] h-[5px] bg-white rounded-full" />
            <div className="w-[5px] h-[5px] bg-white rounded-full" />
            <div className="w-[5px] h-[5px] bg-white rounded-full" />
          </div>
        </button>
      </div>

      {/* Title */}
      <div className="px-6 mt-6 mb-8">
        <h1 className="text-[2.25rem] leading-[1.1] font-light text-white/90">
          Choisissez vos<br />
          <span className="font-bold text-white tracking-tight">Ligues préférées</span>
        </h1>
      </div>

      {/* Leagues Carousel */}
      <div className="relative mb-10 w-full flex">
        <div className="flex space-x-4 pl-6 pr-[60px] overflow-x-auto hide-scrollbar pb-6 shrink-0 w-full">
          {/* Active League */}
          <div className="w-28 h-[132px] bg-white rounded-[2rem] flex flex-col items-center justify-center shadow-xl shadow-brand-purple-light/50 shrink-0 cursor-pointer">
            <div className="w-14 h-14 bg-brand-purple rounded-full flex items-center justify-center mb-3">
              <Crown className="text-white w-7 h-7" />
            </div>
            <span className="text-brand-purple font-semibold text-xs tracking-tight">Premier League</span>
          </div>
          
          {/* Inactive League 1 */}
          <div className="w-28 h-[132px] bg-white/5 border border-white/10 rounded-[2rem] flex flex-col items-center justify-center shrink-0 cursor-pointer backdrop-blur-sm">
            <div className="w-14 h-14 border border-white/20 rounded-full flex items-center justify-center mb-3">
              <Shield className="text-white/80 w-6 h-6" />
            </div>
            <span className="text-white/70 font-medium text-xs">NFL</span>
          </div>

          {/* Inactive League 2 */}
          <div className="w-28 h-[132px] bg-white/5 border border-white/10 rounded-[2rem] flex flex-col items-center justify-center shrink-0 cursor-pointer backdrop-blur-sm">
            <div className="w-14 h-14 border border-white/20 rounded-full flex items-center justify-center mb-3 text-white/80 font-bold text-sm">
               MLS
            </div>
            <span className="text-white/70 font-medium text-xs">MLS</span>
          </div>
        </div>

        {/* Live Game side tab */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-28 bg-brand-purple-light rounded-l-[1.5rem] flex items-center justify-center shadow-[-5px_0_15px_rgba(0,0,0,0.1)]">
          <span className="-rotate-90 text-[10px] font-bold text-white tracking-widest whitespace-nowrap">En direct</span>
        </div>
      </div>

      {/* News Section */}
      <div className="px-6 flex items-center justify-between xl mb-5">
        <h2 className="text-2xl font-semibold">Actualités</h2>
        <button className="bg-white rounded-full px-5 py-2 text-brand-purple text-xs font-bold shadow-md">
          Voir tout
        </button>
      </div>

      <div className="flex-1 w-full bg-transparent px-6 overflow-y-auto hide-scrollbar pb-[100px]">
        {/* News Card 1 */}
        <div className="w-full bg-white rounded-[2rem] p-5 mb-5 shadow-2xl overflow-hidden relative">
          {/* Header row */}
          <div className="flex justify-between items-start mb-5 relative">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-purple rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-medium">Match du jour</p>
                <h3 className="text-brand-dark font-bold text-sm">English FA Cup</h3>
              </div>
            </div>
            
            <div className="absolute -right-5 top-1 bg-brand-peach text-brand-peach-dark px-4 py-[6px] pl-5 rounded-l-full font-bold text-[10px] tracking-wide shadow-sm">
              18 JAN 2021
            </div>
          </div>

          {/* Teams row */}
          <div className="flex items-center justify-between my-5">
            <span className="text-brand-dark font-bold text-[13px] flex-1 text-center">Liverpool</span>
            <div className="flex items-center justify-center space-x-1 w-[120px] shrink-0">
               <span className="bg-white shadow border border-gray-100 text-red-600 text-[8px] font-bold px-1.5 py-0.5 rounded mr-1">ESPN+</span>
               <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                 <img src="https://images.unsplash.com/photo-1614605929656-74fc21f82f2f?w=64&q=80&fit=crop" className="w-full h-full object-cover" alt="Liv" />
               </div>
               <span className="text-[9px] font-bold text-brand-purple px-1">9:45 PM</span>
               <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                 <img src="https://images.unsplash.com/photo-1629813203929-e8da04ac9bc4?w=64&q=80&fit=crop" className="w-full h-full object-cover" alt="Che" />
               </div>
            </div>
            <span className="text-brand-dark font-bold text-[13px] flex-1 text-center">Chelsea</span>
          </div>

          {/* Inner card content */}
          <div className="w-full bg-brand-gray rounded-[1.25rem] p-3 flex items-center space-x-3">
             <div className="w-[70px] h-[55px] rounded-xl overflow-hidden relative shrink-0">
                <div className="absolute top-1 left-1 bg-red-600 text-white text-[7px] font-bold px-[4px] py-[2px] rounded uppercase tracking-wider z-10 flex items-center space-x-0.5 shadow-sm">
                  <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                  <span>LIVE</span>
                </div>
                <img src="https://images.unsplash.com/photo-1550275994-6b21588667dc?w=150&q=80&fit=crop" className="w-full h-full object-cover opacity-90" alt="match" />
             </div>
             <p className="text-brand-dark text-xs font-bold leading-tight pr-2">
               Liverpool vs Chelsea en direct: Regardez la FA Cup
             </p>
          </div>
        </div>

        {/* News Card 2 */}
        <div className="w-full bg-white rounded-[2rem] p-5 mb-5 shadow-2xl relative overflow-hidden">
          {/* Header row */}
          <div className="flex justify-between items-start mb-5 relative">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#3a208c] rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-white/50" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-medium">Matchs</p>
                <h3 className="text-brand-dark font-bold text-sm">Premier league</h3>
              </div>
            </div>
            
            <div className="absolute -right-5 top-1 bg-brand-gray text-brand-dark px-6 py-[6px] rounded-l-full font-bold text-[10px] tracking-wide border border-gray-100 shadow-sm">
              Nouveau
            </div>
          </div>

          {/* Teams row */}
          <div className="flex items-center justify-between mt-5 mb-1">
            <span className="text-brand-dark font-bold text-[13px] flex-1 text-center">West Ham</span>
            <div className="flex items-center justify-center space-x-1 w-[120px] shrink-0">
               <span className="bg-white shadow border border-gray-100 text-red-600 text-[8px] font-bold px-1.5 py-0.5 rounded mr-1">ESPN+</span>
               <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center text-[8px]">
                 WH
               </div>
               <span className="text-[9px] font-bold text-brand-purple px-1">10:45 PM</span>
               <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200 border border-gray-300 flex items-center justify-center text-[8px]">
                 BY
               </div>
            </div>
            <span className="text-brand-dark font-bold text-[13px] flex-1 text-center">Burnley</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
