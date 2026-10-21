import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Info, ChevronRight, Home, Activity, PlusSquare, Bell, Layers, Plus, MoreHorizontal, Camera, Film, ImagePlus, Clock, Calendar, SlidersHorizontal, Download, ChevronDown, Play, TrendingUp, Target, Users, Sparkles, ArrowRight, BarChart2 } from 'lucide-react';

interface StudioTaskupViewProps {
  onBack: () => void;
  onPublish?: (announcement: any) => void;
}

export const StudioTaskupView: React.FC<StudioTaskupViewProps> = ({ onBack }) => {
  const [activeNav, setActiveNav] = useState<'Analytique' | 'Créer'>('Analytique');
  const [activeTab, setActiveTab] = useState("Vue d'ensemble");
  const [timeToggle, setTimeToggle] = useState('Heures');

  const tabs = ["Vue d'ensemble", "Annonces", "Candidats", "Abonnés"];

  const renderAnalytique = () => (
    <>
      {/* Header Analytique */}
      <div className="bg-[#38bdf8] pt-12 pb-6 px-4 relative flex flex-col shrink-0 rounded-b-[40px] shadow-[0_10px_30px_rgba(56,189,248,0.2)] z-20">
        <div className="flex justify-between items-center mb-4 gap-3">
          <h1 className="text-2xl font-bold text-white tracking-tight shrink-0" onClick={onBack}>Analytique</h1>
          
          <div className="relative group flex-1 h-[40px] ml-auto">
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
            <div className="relative rounded-[2rem] p-[3px] shadow-[0_15px_40px_rgba(0,0,0,0.15)] overflow-hidden flex h-full z-10 w-full">
              {/* Animated gradient spinning border */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square z-0">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="w-full h-full bg-[conic-gradient(from_0deg,#B294DE,#6CA6F1,#F3D76F,#B294DE)] opacity-90"
                />
              </div>
              
              <div className="relative w-full bg-[#0ea5e9]/90 rounded-[1.8rem] px-3 flex items-center backdrop-blur-md z-10 h-full">
                <Search size={18} className="text-white/90" />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-white placeholder:text-white/70 px-2 h-full w-full min-w-0"
                />
              </div>
            </div>
          </div>

          <div className="w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center text-[#38bdf8] font-bold text-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] shrink-0">
            S
          </div>
        </div>

        {/* Stylized Premium Tabs */}
        <div className="mt-1 relative">
          <div className="flex w-full overflow-x-auto hide-scrollbar gap-2.5 px-1 py-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative px-5 py-2.5 whitespace-nowrap text-[14px] font-extrabold transition-all duration-300 rounded-2xl select-none outline-none flex items-center justify-center ${
                    isActive ? "text-[#38bdf8] bg-white shadow-[0_8px_20px_rgba(0,0,0,0.1)] scale-105" : "text-white/80 bg-white/10 hover:bg-white/20 border border-white/20"
                  }`}
                  style={{
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <span className="relative z-10 tracking-tight">{tab}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4 hide-scrollbar">
        {activeTab === "Vue d'ensemble" && (
          <>
            <div className="relative w-full rounded-[32px] overflow-hidden p-6 mb-6 bg-gradient-to-br from-[#e0f2fe] via-[#bae6fd] to-[#7dd3fc]">
              {/* Abstract decorative shape */}
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-gradient-to-tr from-[#38bdf8]/60 to-[#0284c7]/60 rounded-full blur-[40px] mix-blend-overlay translate-x-1/3 -translate-y-1/3"></div>
              <div className="absolute bottom-0 right-10 w-[150px] h-[150px] bg-gradient-to-tr from-white/40 to-[#bae6fd]/40 rounded-full blur-[30px] mix-blend-overlay translate-y-1/3"></div>
              
              <div className="relative z-10 w-[70%]">
                <h2 className="text-[22px] font-bold text-gray-900 leading-tight mb-2 text-balance">
                  L'attractivité de ton profil a augmenté de 24% cette semaine.
                </h2>
                <p className="text-[13px] text-gray-700 leading-snug mb-5 font-medium">
                  Débloque une analyse complète de tes annonces et de ton profil dès aujourd'hui.
                </p>
                <button className="bg-white text-[#0284c7] font-bold text-[13px] px-6 py-2.5 rounded-full shadow-md active:scale-95 transition-transform">
                  Voir mes annonces
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <button className="w-11 h-11 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-full flex items-center justify-center text-gray-700 active:scale-95 transition-transform border border-gray-100/50">
                  <Calendar size={18} />
                </button>
                <button className="w-11 h-11 bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] rounded-full flex items-center justify-center text-gray-700 active:scale-95 transition-transform border border-gray-100/50">
                  <SlidersHorizontal size={18} />
                </button>
              </div>
              <button className="bg-white shadow-[0_4px_16px_rgba(0,0,0,0.04)] px-5 py-2.5 rounded-full flex items-center gap-2 text-gray-700 active:scale-95 transition-transform border border-gray-100/50">
                <Download size={16} />
                <span className="text-[14px] font-semibold">Exporter</span>
              </button>
            </div>

            <div className="bg-white rounded-[32px] p-6 mb-8 relative overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100">
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="text-[20px] font-bold text-gray-900 tracking-tight">Performances</h3>
                <button className="bg-gray-50 shadow-sm px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-[13px] font-bold text-gray-700 active:scale-95 transition-transform border border-gray-200/50">
                  Semaine <ChevronDown size={14} className="mt-0.5" />
                </button>
              </div>

              <div className="relative h-48 w-full flex items-end justify-between font-sans px-1 z-10 mt-4">
                 {/* Y Axis Labels */}
                 <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[11px] font-bold text-gray-400">
                   <span>3K</span>
                   <span>2K</span>
                   <span>1K</span>
                   <span>500</span>
                   <span>0</span>
                 </div>
                 
                 {/* Chart Bars Margin Left for Labels */}
                 <div className="w-9 flex-shrink-0"></div>

                 {/* Mon */}
                 <div className="flex flex-col items-center gap-3 flex-1 h-full justify-end group">
                   <div className="flex items-end gap-1.5 h-[calc(100%-24px)] w-full justify-center">
                     <div className="w-3.5 h-[25%] rounded-t-md bg-[#e0f2fe] transition-all duration-300 group-hover:bg-[#bae6fd]"></div>
                     <div className="w-3.5 h-[35%] rounded-t-md bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.3)]"></div>
                   </div>
                   <span className="text-[12px] font-bold text-gray-400 mt-2">Lun</span>
                 </div>

                 {/* Tue */}
                 <div className="flex flex-col items-center gap-3 flex-1 h-full justify-end group">
                   <div className="flex items-end gap-1.5 h-[calc(100%-24px)] w-full justify-center">
                     <div className="w-3.5 h-[75%] rounded-t-md bg-[#e0f2fe] transition-all duration-300 group-hover:bg-[#bae6fd]"></div>
                     <div className="w-3.5 h-[65%] rounded-t-md bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.3)]"></div>
                   </div>
                   <span className="text-[12px] font-bold text-gray-400 mt-2">Mar</span>
                 </div>

                 {/* Wed */}
                 <div className="flex flex-col items-center gap-3 flex-1 h-full justify-end group">
                   <div className="flex items-end gap-1.5 h-[calc(100%-24px)] w-full justify-center">
                     <div className="w-3.5 h-[50%] rounded-t-md bg-[#e0f2fe] transition-all duration-300 group-hover:bg-[#bae6fd]"></div>
                     <div className="w-3.5 h-[55%] rounded-t-md bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.3)]"></div>
                   </div>
                   <span className="text-[12px] font-bold text-gray-400 mt-2">Mer</span>
                 </div>

                 {/* Thu */}
                 <div className="flex flex-col items-center gap-3 flex-1 h-full justify-end group">
                   <div className="flex items-end gap-1.5 h-[calc(100%-24px)] w-full justify-center">
                     <div className="w-3.5 h-[95%] rounded-t-md bg-[#e0f2fe] transition-all duration-300 group-hover:bg-[#bae6fd]"></div>
                     <div className="w-3.5 h-[90%] rounded-t-md bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.3)]"></div>
                   </div>
                   <span className="text-[12px] font-bold text-gray-400 mt-2">Jeu</span>
                 </div>

                 {/* Fri */}
                 <div className="flex flex-col items-center gap-3 flex-1 h-full justify-end group">
                   <div className="flex items-end gap-1.5 h-[calc(100%-24px)] w-full justify-center">
                     <div className="w-3.5 h-[40%] rounded-t-md bg-[#e0f2fe] transition-all duration-300 group-hover:bg-[#bae6fd]"></div>
                     <div className="w-3.5 h-[70%] rounded-t-md bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.3)]"></div>
                   </div>
                   <span className="text-[12px] font-bold text-gray-400 mt-2">Ven</span>
                 </div>
              </div>

              <div className="flex justify-center items-center gap-8 mt-6 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#bae6fd]"></div>
                  <span className="text-[12px] font-bold text-gray-500">Vues du profil</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.5)]"></div>
                  <span className="text-[12px] font-bold text-gray-500">Vues d'annonces</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-[20px] font-bold text-gray-900 mb-5 tracking-tight">Annonces récentes</h3>
              
              <div className="flex flex-col gap-3">
                {/* Task Item 1 */}
                <div className="flex items-center gap-4 bg-white rounded-[24px] p-3 px-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/60">
                  <div className="w-[60px] h-[60px] bg-[#f0f9ff] rounded-[18px] flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#e0f2fe]">
                    <span className="text-[28px] drop-shadow-sm">💻</span>
                  </div>
                  <div className="flex-1 py-1">
                     <div className="flex items-center mb-1.5">
                       <span className="text-[10px] font-extrabold text-[#0284c7] tracking-wider uppercase bg-[#e0f2fe] px-2 py-0.5 rounded-md flex items-center gap-1">
                         Annonce
                       </span>
                     </div>
                     <h4 className="text-[15px] font-bold text-gray-900 leading-tight mb-1.5">Développement Web React</h4>
                     <div className="flex items-center gap-3">
                       <span className="text-[12px] text-gray-600 font-semibold">1.2K vues</span>
                       <span className="text-[12px] text-emerald-500 font-medium tracking-tight">12 candidatures</span>
                     </div>
                  </div>
                </div>

                {/* Task Item 2 */}
                <div className="flex items-center gap-4 bg-white rounded-[24px] p-3 px-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/60">
                  <div className="w-[60px] h-[60px] bg-[#fff1f2] rounded-[18px] flex-shrink-0 flex items-center justify-center overflow-hidden border border-[#ffe4e6]">
                    <span className="text-[28px] drop-shadow-sm">🎨</span>
                  </div>
                  <div className="flex-1 py-1">
                     <div className="flex items-center mb-1.5">
                       <span className="text-[10px] font-extrabold text-[#e11d48] tracking-wider uppercase bg-[#ffe4e6] px-2 py-0.5 rounded-md flex items-center gap-1">
                         Annonce
                       </span>
                     </div>
                     <h4 className="text-[15px] font-bold text-gray-900 leading-tight mb-1.5">Design UI/UX d'application</h4>
                     <div className="flex items-center gap-3">
                       <span className="text-[12px] text-gray-600 font-semibold">850 vues</span>
                       <span className="text-[12px] text-emerald-500 font-medium tracking-tight">8 candidatures</span>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'Annonces' && (
          <>
            {/* Total Reach Card */}
            <div className="bg-white rounded-[32px] p-6 mb-4 relative overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100">
              <div className="flex justify-between items-start mb-6 z-10 relative">
                <div>
                  <p className="text-[14px] text-gray-500 font-semibold mb-1">Impact des publications</p>
                  <h3 className="text-[36px] font-bold text-gray-900 leading-none tracking-tight">12.5K</h3>
                </div>
                <div className="bg-[#f0f9ff] px-3 py-1.5 rounded-[12px] flex items-center gap-1.5 shadow-sm border border-[#e0f2fe]">
                  <BarChart2 size={14} className="text-[#0284c7] shrink-0" />
                  <span className="text-[13px] font-extrabold text-[#0284c7]">+12.4%</span>
                </div>
              </div>

              <div className="relative h-[170px] w-full mt-4 font-sans z-10">
                {/* Target Line */}
                <div className="absolute top-[35%] left-10 right-2 border-t border-dashed border-gray-200"></div>
                <div className="absolute top-[35%] left-0 -translate-y-1/2 bg-white px-2 py-0.5 rounded-lg text-[10px] font-bold text-gray-500 shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-gray-100">8K</div>

                {/* Bars Container */}
                <div className="absolute inset-0 flex items-end justify-between pl-[3.2rem] pr-3 pb-6">
                  {[
                     { m: 'Jan', h: '95%' },
                     { m: 'Fév', h: '60%' },
                     { m: 'Mar', h: '80%' },
                     { m: 'Avr', h: '25%' },
                     { m: 'Mai', h: '85%' },
                     { m: 'Juin', h: '65%' },
                     { m: 'Juil', h: '50%' },
                     { m: 'Aoû', h: '40%' },
                  ].map(data => (
                     <div key={data.m} className="flex flex-col items-center gap-3 w-5 sm:w-6 h-full justify-end group">
                        <div 
                           className="w-full rounded-[6px] bg-[#e0f2fe] transition-colors duration-300 group-hover:bg-[#bae6fd] relative overflow-hidden" 
                           style={{ height: data.h }}
                        >
                           <div className="absolute bottom-0 left-0 right-0 bg-[#38bdf8] opacity-70" style={{ height: '60%' }}></div>
                        </div>
                     </div>
                  ))}
                </div>
                
                {/* Labels */}
                <div className="absolute bottom-0 left-[3.2rem] right-3 flex justify-between">
                  {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû'].map(m => (
                    <span key={m} className="text-[11px] font-bold text-gray-500 w-5 sm:w-6 text-center">{m}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Engagement & Candidatures */}
            <div className="flex gap-4 mb-4">
              <div className="flex-1 bg-white rounded-[28px] p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <div className="w-11 h-11 bg-emerald-50 rounded-full flex items-center justify-center mb-5 shadow-sm border border-emerald-100/50">
                     <Target size={20} className="text-emerald-500" />
                  </div>
                  <p className="text-[13px] text-gray-500 font-semibold mb-1">Taux de réponse</p>
                  <div className="flex items-baseline gap-2">
                     <span className="text-[26px] font-bold text-gray-900 tracking-tight">42%</span>
                     <span className="text-[13px] font-extrabold text-emerald-500">+12%</span>
                  </div>
              </div>
              <div className="flex-1 bg-white rounded-[28px] p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <div className="w-11 h-11 bg-sky-50 rounded-full flex items-center justify-center mb-5 shadow-sm border border-sky-100/50">
                     <Users size={20} className="text-sky-500" />
                  </div>
                  <p className="text-[13px] text-gray-500 font-semibold mb-1">Candidatures res.</p>
                  <div className="flex items-baseline gap-2">
                     <span className="text-[26px] font-bold text-gray-900 tracking-tight">134</span>
                     <span className="text-[13px] font-extrabold text-[#0284c7]">+8%</span>
                  </div>
              </div>
            </div>

            {/* Conversions Card */}
            <div className="bg-[#0f172a] rounded-[28px] p-6 mb-4 relative overflow-hidden flex items-center justify-between shadow-[0_8px_30px_rgba(15,23,42,0.2)]">
              {/* Glow effects */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#38bdf8]/10 rounded-full blur-[30px] mix-blend-overlay border border-white/10"></div>
              <div className="absolute top-0 right-10 w-40 h-40 bg-[#0284c7]/20 rounded-full blur-[40px] mix-blend-overlay"></div>
              
              <div className="relative z-10 py-1">
                <p className="text-[14px] text-slate-400 font-semibold mb-1">Tâches terminées</p>
                <h3 className="text-[34px] font-bold text-white leading-none tracking-tight">48</h3>
              </div>
              <button className="relative z-10 bg-[#38bdf8] text-white font-extrabold text-[13px] px-5 py-3 rounded-full shadow-[0_4px_14px_rgba(56,189,248,0.4)] active:scale-95 transition-all outline-none">
                Voir l'historique
              </button>
            </div>

            {/* AI Insight Card */}
            <div className="bg-gradient-to-br from-[#f0f9ff] via-[#e0f2fe] to-[#f0f9ff] rounded-[28px] p-6 mb-6 relative border border-white shadow-sm overflow-hidden">
               {/* Abstract glow */}
               <div className="absolute bottom-0 right-0 w-32 h-32 bg-sky-200/50 rounded-full blur-[40px]"></div>

               <div className="relative z-10">
                 <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-[8px] inline-flex items-center gap-1.5 mb-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-white">
                    <Sparkles size={14} className="text-[#0284c7] fill-current" />
                    <span className="text-[10px] font-extrabold text-[#0284c7] tracking-widest uppercase">Analyse IA</span>
                 </div>
                 <p className="text-[16px] font-medium text-slate-800 leading-relaxed mb-5 tracking-tight text-balance">
                    Tes annonces de développement web reçoivent le plus de candidatures le lundi. Prépare-toi à publier la semaine prochaine !
                 </p>
                 <button className="flex items-center gap-1.5 text-[14px] font-extrabold text-[#0284c7] active:scale-95 transition-transform outline-none">
                    Voir les recommandations <ArrowRight size={16} strokeWidth={2.5} />
                 </button>
               </div>
            </div>
          </>
        )}

        {activeTab === 'Candidats' && (
          <>
            {/* Warning Banner */}
            <div className="bg-[#fff1e0] rounded-[10px] p-3 mb-4 flex items-start gap-2 border border-[#ffe0b2]">
              <Clock size={16} className="text-[#d97706] mt-0.5 shrink-0" />
              <p className="text-[13px] text-[#d97706] font-medium leading-snug">
                Données en cours de traitement. Vérifie à nouveau dans 1 à 2 jours.
              </p>
            </div>

            {/* Key Metrics */}
            <div className="bg-white rounded-[20px] p-5 shadow-sm mb-4 border border-gray-100">
              <div className="flex items-center gap-1 mb-1">
                <h2 className="text-[17px] font-bold text-gray-900">Indicateurs clés</h2>
                <Info size={16} className="text-gray-400" />
              </div>
              <p className="text-[13px] text-gray-500 mb-4">27 mai - 2 juin</p>

              <div className="flex gap-2 mb-8">
                <div className="flex-1 border border-[#4A90E2]/40 bg-[#4A90E2]/10 rounded-xl p-3">
                  <p className="text-[13px] font-bold text-black mb-2">Total des candidats</p>
                  <p className="text-2xl font-bold text-black mb-1">0</p>
                  <p className="text-[13px] text-gray-500">0 (0%)</p>
                </div>
                <div className="flex-1 border border-gray-100 bg-[#f9fafb] rounded-xl p-3">
                  <p className="text-[13px] font-bold text-black mb-2">Nouvelles candidatures</p>
                  <p className="text-2xl font-bold text-black mb-1">0</p>
                  <p className="text-[13px] text-gray-500">0 (0%)</p>
                </div>
              </div>

              {/* Chart */}
              <div className="relative h-40 w-full mb-6 mt-8">
                <div className="absolute inset-0 flex flex-col justify-between pb-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                       <div className="w-full h-[1px] border-b border-dashed border-gray-200"></div>
                       <span className="text-[12px] text-gray-400 w-2 text-right">{3 - i !== 0 ? 3 - i : ''}</span>
                    </div>
                  ))}
                </div>
                
                {/* Flat line chart at 0 */}
                <div className="absolute bottom-[23px] left-0 right-6 flex items-center h-[1px] bg-[#0284c7]">
                  {[...Array(5)].map((_, i) => (
                     <div key={i} className="absolute w-1.5 h-1.5 rounded-full border border-[#0284c7] bg-white transform -translate-y-1/2" style={{ left: `${i * 25}%` }}></div>
                  ))}
                </div>
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-6 flex justify-between">
                  <span className="text-[12px] text-gray-500 font-medium">27 mai</span>
                  <span className="text-[12px] text-gray-500 font-medium">2 juin</span>
                </div>
              </div>
            </div>

            {/* Viewer Data */}
            <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-1 mb-1">
                <h2 className="text-[17px] font-bold text-gray-900">Données des candidats</h2>
                <Info size={16} className="text-gray-400" />
              </div>
              <p className="text-[13px] text-gray-500 mb-4 leading-snug">
                Les données ne sont disponibles que s'il y a au moins 10 candidats pour la période sélectionnée.
              </p>

              <div className="flex gap-2 mb-8">
                <button className="px-4 py-2 rounded-lg bg-[#0284c7]/10 text-[#0284c7] font-bold text-[14px]">Compétences</button>
                <button className="px-4 py-2 rounded-lg bg-[#f3f4f6] text-gray-700 font-bold text-[14px]">Expérience</button>
                <button className="px-4 py-2 rounded-lg bg-[#f3f4f6] text-gray-700 font-bold text-[14px]">Localisation</button>
              </div>

              {/* Arc graphic */}
              <div className="flex justify-center mt-6 mb-10">
                <svg viewBox="0 0 100 50" className="w-[180px] h-[90px] overflow-visible">
                  <path 
                    d="M 10 50 A 40 40 0 0 1 90 50" 
                    fill="none" 
                    stroke="#e5e7eb" 
                    strokeWidth="16" 
                    strokeLinecap="butt"
                  />
                </svg>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-[15px] text-gray-500 pb-3 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4A90E2]"></div>
                    <span className="font-semibold text-gray-800">-</span>
                  </div>
                  <span className="font-medium text-gray-800">-%</span>
                </div>
                
                <div className="flex justify-between items-center text-[15px] text-gray-500 pb-3 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4A90E2]/60"></div>
                    <span className="font-semibold text-gray-800">-</span>
                  </div>
                  <span className="font-medium text-gray-800">-%</span>
                </div>

                <div className="flex justify-between items-center text-[15px] text-gray-500 pb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#4A90E2]/30"></div>
                    <span className="font-semibold text-gray-800">-</span>
                  </div>
                  <span className="font-medium text-gray-800">-%</span>
                </div>
              </div>
            </div>

            {/* Activity Hours Card */}
            <div className="bg-white rounded-[20px] p-5 shadow-sm mb-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-[17px] font-bold text-gray-900">Heures d'activité élevée</h2>
                <Info size={16} className="text-gray-400" />
              </div>

              <div className="flex gap-2 mb-6">
                <button 
                  onClick={() => setTimeToggle('Heures')}
                  className={`px-4 py-1.5 rounded-md text-[14px] font-bold transition-colors ${timeToggle === 'Heures' ? 'bg-[#0284c7]/10 text-[#0284c7]' : 'bg-[#f3f4f6] text-gray-500'}`}
                >
                  Heures
                </button>
                <button 
                  onClick={() => setTimeToggle('Jours')}
                  className={`px-4 py-1.5 rounded-md text-[14px] font-bold transition-colors ${timeToggle === 'Jours' ? 'bg-[#0284c7]/10 text-[#0284c7]' : 'bg-[#f3f4f6] text-gray-500'}`}
                >
                  Jours
                </button>
              </div>

              <div className="flex justify-center items-center gap-1 mb-6 text-gray-600 cursor-pointer">
                <span className="text-[14px] font-medium">30 mai</span>
                <ChevronRight size={16} className="text-gray-400" />
              </div>

              <div className="text-center mb-8 px-2">
                <p className="text-[13px] text-gray-500 leading-snug">
                  Les informations apparaîtront quand suffisamment de données seront disponibles.
                </p>
              </div>

              {/* Empty Chart Area */}
              <div className="relative h-40 w-full mb-6">
                <div className="absolute inset-0 flex flex-col justify-between pb-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-full h-[1px] border-b border-dashed border-gray-200"></div>
                  ))}
                </div>
                {/* X-axis solid line */}
                <div className="absolute bottom-6 left-0 right-0 h-[1px] bg-gray-400"></div>
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                  <span className="text-[12px] text-gray-500 font-medium">12a</span>
                  <span className="text-[12px] text-gray-500 font-medium">4a</span>
                  <span className="text-[12px] text-gray-500 font-medium">8a</span>
                  <span className="text-[12px] text-gray-500 font-medium">12p</span>
                  <span className="text-[12px] text-gray-500 font-medium">4p</span>
                  <span className="text-[12px] text-gray-500 font-medium">8p</span>
                </div>
              </div>
            </div>

            {/* Creators Card */}
            <div className="bg-white rounded-[20px] p-5 shadow-sm mb-6 border border-gray-100">
              <div className="flex items-start gap-2 mb-4">
                <h2 className="text-[17px] font-bold text-gray-900 leading-tight">Profils similaires consultés par vos candidats</h2>
                <Info size={16} className="text-gray-400 shrink-0 mt-0.5" />
              </div>
              <p className="text-[13px] text-gray-500 leading-snug">
                Tu pourras voir ces informations quand suffisamment de données seront disponibles pour effectuer une analyse.
              </p>
            </div>
          </>
        )}

        {activeTab === 'Abonnés' && (
          <>
            {/* Key Metrics Card */}
            <div className="bg-white rounded-[20px] p-5 shadow-sm mb-4 border border-gray-100">
              <div className="flex items-center gap-1 mb-1">
                <h2 className="text-[17px] font-bold text-gray-900">Indicateurs clés</h2>
                <Info size={16} className="text-gray-400" />
              </div>
              <p className="text-[13px] text-gray-500 mb-4">29 mai - 4 juin</p>

              <div className="flex gap-2 mb-8">
                <div className="flex-1 border border-[#0284c7]/40 bg-[#0284c7]/10 rounded-xl p-3">
                  <p className="text-[13px] font-bold text-black mb-2">Total des abonnés</p>
                  <p className="text-2xl font-bold text-black mb-1">2,410</p>
                  <p className="text-[13px] font-medium text-gray-500 mt-2">Depuis le début</p>
                </div>
                <div className="flex-1 border border-gray-100 bg-white rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                  <p className="text-[13px] font-bold text-black mb-2">Nouveaux abonnés</p>
                  <p className="text-2xl font-bold text-black mb-1">+45</p>
                  <p className="text-[13px] text-emerald-500 font-bold">+12% vs dernière sem.</p>
                </div>
              </div>

              {/* Chart */}
              <div className="relative h-40 w-full mb-6 mt-8">
                <div className="absolute inset-0 flex flex-col justify-between pb-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                       <div className="w-full h-[1px] border-b border-dashed border-gray-200"></div>
                    </div>
                  ))}
                </div>
                
                {/* Flat line chart at 0 */}
                <div className="absolute bottom-[23px] left-0 right-0 flex items-center h-[2px] bg-[#0284c7]">
                   <div className="absolute w-8 h-8 bg-[#0284c7]/20 rounded-full blur-[8px] right-0 -translate-y-1/2"></div>
                </div>
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between">
                  <span className="text-[12px] text-gray-500 font-medium">29 mai 2026</span>
                  <span className="text-[12px] text-gray-500 font-medium">4 juin 2026</span>
                </div>
              </div>
            </div>

            {/* Viewer Data Card */}
            <div className="bg-white rounded-[20px] p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-1 mb-4">
                <h2 className="text-[17px] font-bold text-gray-900">Données de la communauté</h2>
                <Info size={16} className="text-gray-400" />
              </div>

              <div className="flex gap-2 mb-8">
                <button className="px-4 py-2 rounded-lg bg-[#0284c7]/10 text-[#0284c7] font-bold text-[14px]">Compétences</button>
                <button className="px-4 py-2 rounded-lg bg-[#f3f4f6] text-gray-700 font-bold text-[14px]">Secteurs</button>
                <button className="px-4 py-2 rounded-lg bg-[#f3f4f6] text-gray-700 font-bold text-[14px]">Statut</button>
              </div>

              {/* Arc graphic skeleton */}
              <div className="flex justify-center mt-6 overflow-hidden h-28 relative mb-8">
                <div className="w-[180px] h-[180px] rounded-full border-[24px] border-[#e0f2fe] absolute top-4"></div>
                <div className="w-[180px] h-[180px] rounded-full border-[24px] border-transparent border-t-[#0284c7] absolute top-4 rotate-45"></div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-[15px] text-gray-500 pb-3 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0284c7]"></div>
                    <span className="font-semibold text-gray-800">Développeurs Frontend</span>
                  </div>
                  <span className="font-medium text-gray-800">45%</span>
                </div>
                
                <div className="flex justify-between items-center text-[15px] text-gray-500 pb-3 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]"></div>
                    <span className="font-semibold text-gray-800">Designers UI/UX</span>
                  </div>
                  <span className="font-medium text-gray-800">30%</span>
                </div>
                
                <div className="flex justify-between items-center text-[15px] text-gray-500 pb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#bae6fd]"></div>
                    <span className="font-semibold text-gray-800">Chefs de projet</span>
                  </div>
                  <span className="font-medium text-gray-800">25%</span>
                </div>
              </div>
            </div>

            {/* Activity Hours Card */}
            <div className="bg-white rounded-[20px] p-5 shadow-sm mb-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-[17px] font-bold text-gray-900">Heures d'activité élevée</h2>
                <Info size={16} className="text-gray-400" />
              </div>

              <div className="flex gap-2 mb-6">
                <button 
                  onClick={() => setTimeToggle('Heures')}
                  className={`px-4 py-1.5 rounded-md text-[14px] font-bold transition-colors ${timeToggle === 'Heures' ? 'bg-[#0284c7]/10 text-[#0284c7]' : 'bg-[#f3f4f6] text-gray-500'}`}
                >
                  Heures
                </button>
                <button 
                  onClick={() => setTimeToggle('Jours')}
                  className={`px-4 py-1.5 rounded-md text-[14px] font-bold transition-colors ${timeToggle === 'Jours' ? 'bg-[#0284c7]/10 text-[#0284c7]' : 'bg-[#f3f4f6] text-gray-500'}`}
                >
                  Jours
                </button>
              </div>

              <div className="flex justify-center items-center gap-1 mb-6 text-gray-600 cursor-pointer">
                <span className="text-[14px] font-medium">30 mai</span>
                <ChevronRight size={16} className="text-gray-400" />
              </div>

              <div className="text-center mb-8 px-2">
                <p className="text-[13px] text-gray-500 leading-snug">
                  Les informations apparaîtront quand suffisamment de données seront disponibles.
                </p>
              </div>

              {/* Empty Chart Area */}
              <div className="relative h-40 w-full mb-6">
                <div className="absolute inset-0 flex flex-col justify-between pb-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-full h-[1px] border-b border-dashed border-gray-200"></div>
                  ))}
                </div>
                {/* X-axis solid line */}
                <div className="absolute bottom-6 left-0 right-0 h-[1px] bg-gray-400"></div>
                
                {/* X-axis labels */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                  <span className="text-[12px] text-gray-500 font-medium">12a</span>
                  <span className="text-[12px] text-gray-500 font-medium">4a</span>
                  <span className="text-[12px] text-gray-500 font-medium">8a</span>
                  <span className="text-[12px] text-gray-500 font-medium">12p</span>
                  <span className="text-[12px] text-gray-500 font-medium">4p</span>
                  <span className="text-[12px] text-gray-500 font-medium">8p</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );

  const renderCreer = () => (
    <>
      {/* Header Créer */}
      <div className="bg-[#38bdf8] pt-12 pb-6 px-4 relative flex flex-col shrink-0 rounded-b-[40px] shadow-[0_10px_30px_rgba(56,189,248,0.2)] z-20">
        <div className="flex justify-between items-center gap-3">
          <h1 className="text-[17px] sm:text-lg font-bold text-white tracking-tight truncate shrink-0" onClick={onBack}>Créer une annonce</h1>
          
          <div className="relative group flex-1 h-[40px] ml-auto">
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
            <div className="relative rounded-[2rem] p-[3px] shadow-[0_15px_40px_rgba(0,0,0,0.15)] overflow-hidden flex h-full z-10 w-full">
              {/* Animated gradient spinning border */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square z-0">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="w-full h-full bg-[conic-gradient(from_0deg,#B294DE,#6CA6F1,#F3D76F,#B294DE)] opacity-90"
                />
              </div>
              
              <div className="relative w-full bg-[#0ea5e9]/90 rounded-[1.8rem] px-3 flex items-center backdrop-blur-md z-10 h-full">
                <Search size={18} className="text-white/90" />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-white placeholder:text-white/70 px-2 h-full w-full min-w-0"
                />
              </div>
            </div>
          </div>

          <div className="w-[40px] h-[40px] rounded-full bg-white flex items-center justify-center text-[#38bdf8] font-bold text-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] shrink-0">
            S
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-1 hide-scrollbar">
        {/* Creation Tools */}
        <div className="flex justify-between gap-3 mb-6">
          <button className="flex-1 flex flex-col items-center gap-2 group outline-none">
            <div className="bg-white/50 backdrop-blur-xl rounded-[20px] w-full py-5 flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.06)] border border-white/80 relative overflow-hidden transition-all duration-300 group-active:scale-95">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#38bdf8]/20 rounded-full blur-[24px] -translate-y-1/2 translate-x-1/2"></div>
              <ImagePlus size={28} className="text-[#0ea5e9] relative z-10 drop-shadow-sm" strokeWidth={2.5} />
            </div>
            <span className="text-[13px] text-gray-700 font-bold tracking-tight text-center leading-tight">Éditeur de <br /> photos</span>
          </button>
          <button className="flex-1 flex flex-col items-center gap-2 group outline-none">
            <div className="bg-white/50 backdrop-blur-xl rounded-[20px] w-full py-5 flex items-center justify-center shadow-[0_12px_24px_rgba(0,0,0,0.06)] border border-white/80 relative overflow-hidden transition-all duration-300 group-active:scale-95">
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#a78bfa]/20 rounded-full blur-[24px] translate-y-1/2 -translate-x-1/2"></div>
              <Camera size={28} className="text-[#8b5cf6] relative z-10 drop-shadow-sm" strokeWidth={2.5} />
            </div>
            <span className="text-[13px] text-gray-700 font-bold tracking-tight">Caméra</span>
          </button>
        </div>

        {/* Upload Button */}
        <button className="w-full bg-black text-white rounded-2xl py-[18px] font-bold text-[16px] mb-8 flex items-center justify-center gap-2 active:scale-95 transition-transform mt-6">
          <Plus size={20} strokeWidth={3} /> Téléverser
        </button>

        {/* Drafts Section */}
        <h2 className="text-[17px] font-bold text-black mb-4">Brouillons</h2>
        
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 1, title: '20260605-12', size: '1.3M', time: '00:18', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=300' },
            { id: 2, title: '20260605-11', size: '8.2M', time: '00:18', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=300' },
            { id: 3, title: '20260605-10', size: '6.3M', time: '00:18', img: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=300' },
            { id: 4, title: '20260605-9', size: '5.3M', time: '00:18', img: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&q=80&w=300' },
            { id: 5, title: '20260605-8', size: '2.1M', time: '00:15', img: 'https://images.unsplash.com/photo-1605050825077-289f85b6cf43?auto=format&fit=crop&q=80&w=300' },
            { id: 6, title: '20260605-7', size: '4.5M', time: '00:22', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=300' },
          ].map((draft) => (
            <div key={draft.id} className="bg-white rounded-[14px] p-2.5 shadow-sm border border-gray-100 flex flex-col">
              <div className="w-full h-[180px] bg-black rounded-[10px] mb-3 flex items-center justify-center overflow-hidden relative">
                 <img src={draft.img} className="w-full h-full object-cover opacity-90" alt="Draft" />
              </div>
              <div className="px-1 flex justify-between items-start mb-1">
                <div>
                  <p className="text-[13px] font-bold text-black leading-tight mb-1">{draft.title}</p>
                  <p className="text-[12px] text-gray-500">{draft.size} · {draft.time}</p>
                </div>
                <MoreHorizontal size={18} className="text-gray-400 mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 25, duration: 0.6 }}
      className="absolute inset-0 bg-[#f8f9fa] z-50 font-sans overflow-hidden"
    >
      <AnimatePresence initial={false} mode="wait">
        {activeNav === 'Analytique' ? (
          <motion.div
            key="analytique"
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0 z-0 flex flex-col pt-0"
          >
            {renderAnalytique()}
          </motion.div>
        ) : (
          <motion.div
            key="creer"
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute inset-0 z-0 flex flex-col pt-0"
          >
            {renderCreer()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <div className="absolute bottom-8 left-6 bg-white/80 backdrop-blur-2xl rounded-full flex items-center p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white z-50">
        {[
          { id: 'Analytique', icon: Activity, label: 'Données analytiq...' },
          { id: 'Créer', icon: PlusSquare, label: 'Créer' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeNav === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveNav(tab.id as 'Analytique' | 'Créer')}
              className={`relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-full transition-colors duration-300 outline-none cursor-pointer ${
                isActive ? 'text-white' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill-studio"
                  className="absolute inset-0 bg-[#4A90E2] rounded-full shadow-[0_4px_12px_rgba(74,144,226,0.4)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className="relative z-10 flex items-center gap-2">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2.5}
                  fill={isActive ? 'currentColor' : 'none'}
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

      {/* Floating Home Button Right */}
      <div className="absolute bottom-8 right-6 z-50">
        <button 
          onClick={onBack}
          className="w-[52px] h-[52px] bg-white/40 backdrop-blur-xl border border-white/40 rounded-full flex items-center justify-center text-[#0284c7] shadow-[0_8px_32px_rgba(2,132,199,0.2)] active:scale-95 transition-transform"
        >
          <Home size={24} strokeWidth={2.5} className="fill-[#0284c7]" />
        </button>
      </div>
    </motion.div>
  );
};

