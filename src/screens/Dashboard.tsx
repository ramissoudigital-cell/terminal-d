import React, { useState } from 'react';
import { Search, MapPin, Star, Heart, Check, Plus, MessageSquare, UserPlus, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import heroImg from '../assets/images/freelancer_hero_blue_1780330758774.png';
import { categories, topFreelancers } from '../data';
import { CircularProgress } from '../components/Shared';
import { SettingsDrawer } from '../SettingsDrawer';

interface DashboardProps {
  onSearchFocus?: (focused: boolean) => void;
  onCategoryClick?: (id: string) => void;
  onViewAllCategories?: () => void;
  onFreelancerClick?: (id: string) => void;
  onHireClick?: (id: string) => void;
  onNavigateSettings?: () => void;
  onNavigateInfo?: () => void;
  onNavigateQRCode?: () => void;
  onNavigateMap?: () => void;
  onNavigateCreateTask?: () => void;
  onNavigateCalendar?: () => void;
  customAnnouncements?: any[];
}

export const Dashboard = ({ customAnnouncements = [], onSearchFocus, onCategoryClick, onViewAllCategories, onFreelancerClick, onHireClick, onNavigateSettings, onNavigateInfo, onNavigateQRCode, onNavigateMap, onNavigateCreateTask, onNavigateCalendar }: DashboardProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [likedFreelancers, setLikedFreelancers] = useState<Set<string>>(new Set());
  const [subscribedFreelancers, setSubscribedFreelancers] = useState<Set<string>>(new Set());

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedFreelancers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSubscribe = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSubscribedFreelancers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleReviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    alert("Ouverture des avis clients...");
  };

  const cleanQuery = searchQuery.toLowerCase().trim();

  const filteredCategories = categories.filter(category => 
    category.name && category.name.toLowerCase().includes(cleanQuery)
  );

  const allFreelancers = [...customAnnouncements, ...topFreelancers];
  const filteredFreelancers = allFreelancers.filter(freelancer => 
    freelancer.name.toLowerCase().includes(cleanQuery) || 
    freelancer.role?.toLowerCase().includes(cleanQuery)
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 260, damping: 25, duration: 0.6 }}
      className="flex flex-col pb-10 bg-[#F0F8FF] min-h-full"
    >
      {/* Top Header Section */}
      <div className="relative bg-[#4A90E2] pt-[60px] pb-8 px-6 rounded-b-[2rem] overflow-hidden drop-shadow-sm flex-shrink-0">
        
        {/* Background Decorative Abstract Shapes (Tones of red/brown) */}
        <div className="absolute top-[-30%] right-[-10%] w-[80%] h-[80%] rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-black/10 blur-2xl pointer-events-none"></div>
        
        {/* 3D Triangle decoration */}
        <div className="absolute bottom-[20%] left-[10%] w-0 h-0 border-l-[15px] border-l-transparent border-b-[25px] border-b-[#6FB6F6] border-r-[15px] border-r-transparent transform -rotate-45 drop-shadow-xl z-0 blur-[1px]"></div>

        {/* Search Bar & Hamburger */}
        <div className="flex gap-4 relative z-20">
          <div className="flex-1 relative group h-[50px]">
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
            <div className="relative rounded-[2rem] p-[3px] shadow-[0_15px_40px_rgba(0,0,0,0.15)] overflow-hidden flex h-full z-10">
              {/* Animated gradient spinning border */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square z-0">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="w-full h-full bg-[conic-gradient(from_0deg,#B294DE,#6CA6F1,#F3D76F,#B294DE)] opacity-90"
                />
              </div>
              
              <div className="relative w-full bg-[#4A90E2] rounded-[1.8rem] px-5 flex items-center gap-3 backdrop-blur-md z-10 h-full">
                <Search className="w-[18px] h-[18px] text-white/90 stroke-[2.5]" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setIsSearchFocused(true);
                    if (onSearchFocus) onSearchFocus(true);
                  }}
                  onBlur={() => {
                    // Short delay to allow clicking on results
                    setTimeout(() => {
                      setIsSearchFocused(false);
                      if (onSearchFocus) onSearchFocus(false);
                    }, 200);
                  }}
                  placeholder="Rechercher des prestataires, des projets" 
                  className="bg-transparent border-none outline-none text-white placeholder-white/80 text-[0.8rem] font-medium w-full tracking-wide h-full"
                />
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="w-[46px] h-[46px] rounded-full bg-white/10 border border-white/10 backdrop-blur-sm shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex items-center justify-center shrink-0 transition-active active:scale-95"
          >
             <div className="flex flex-col gap-[4.5px] items-end w-[18px]">
                <div className="h-[2px] bg-white rounded-full w-full"></div>
                <div className="h-[2px] bg-white rounded-full w-[14px]"></div>
                <div className="h-[2px] bg-white rounded-full w-[18px]"></div>
             </div>
          </button>
        </div>

        {/* Hero Illustration & Text */}
        <div className="mt-10 relative z-10 flex h-[180px]">
           <div className="w-[55%] flex flex-col pt-2 z-20">
              <h1 className="text-[2.4rem] text-white leading-[1.15] font-bold mb-3 tracking-tight font-sans drop-shadow-md">
                TASKup
              </h1>
              <p className="text-white/85 text-[0.8rem] leading-[1.4] font-medium max-w-[140px] drop-shadow-sm tracking-wide">
                Accomplissez vos tâches avec les meilleurs talents dans leur domaine
              </p>
           </div>
           
           <div className="absolute right-[-40px] bottom-[-25px] w-[280px] h-[280px] pointer-events-none z-10">
              {/* Generated Image masking - assuming #4A90E2 bg on image. Using styling to try to blend perfectly */}
              <div 
                className="w-full h-full"
                style={{
                  backgroundImage: `url(${heroImg})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  maskImage: 'radial-gradient(circle at center, black 50%, transparent 80%)',
                  WebkitMaskImage: 'radial-gradient(circle at center, black 50%, transparent 80%)'
                }}
              />
           </div>
        </div>
      </div>

      <AnimatePresence>
        {!isSearchFocused && onNavigateCreateTask && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 8, marginTop: -20 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0, marginTop: 0 }}
            className="px-6 relative z-30"
          >
            <button 
              type="button"
              onClick={onNavigateCreateTask}
              className="w-full bg-slate-900 border border-slate-800 text-white font-semibold text-[0.85rem] p-4 rounded-3xl flex items-center justify-between shadow-[0_8px_25px_rgba(15,23,42,0.15)] active:scale-[0.99] transition-all cursor-pointer overflow-hidden"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4A90E2] flex items-center justify-center text-white shrink-0">
                  <Plus className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-[0.82rem] font-bold tracking-tight">Publier une annonce</span>
                  <span className="text-slate-400 text-[0.65rem] font-medium text-left font-sans truncate">Postez une mission pour vos besoins</span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                <span className="text-white text-md font-bold">&rarr;</span>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 px-6 pt-8 z-10">
        
        {/* Most Searched Categories */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-4 pr-1">
            <h2 className="text-[#2B2B36] text-[1.2rem] font-bold tracking-tight">Catégories</h2>
            <button 
              onClick={() => onViewAllCategories && onViewAllCategories()}
              className="text-[#4A90E2] text-[0.75rem] font-bold uppercase tracking-wide hover:opacity-80 transition-opacity"
            >
              Voir Plus
            </button>
          </div>
          
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-6 px-6 pl-6">
            {filteredCategories.length === 0 ? (
               <div className="text-center w-full text-slate-500 py-4 font-medium">Bientôt disponible...</div>
            ) : filteredCategories.map((category) => (
              <div 
                key={category.id} 
                className="flex flex-col gap-3 min-w-[150px]"
                onClick={() => onCategoryClick && onCategoryClick(category.id)}
              >
                <div 
                  className="h-[120px] rounded-[1.25rem] overflow-hidden shadow-sm relative group cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                  style={{ backgroundColor: (category as any).bgColor || '#C5E0F5' }}
                >
                  {((category as any).image || category.imageUrl) ? (
                    <div 
                      className={`absolute inset-0 z-0 ${(category as any).image ? 'opacity-90 scale-110' : 'opacity-100'}`}
                      style={{
                        backgroundImage: `url(${(category as any).image || category.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent"></div>
                  )}
                </div>
                <div className="flex flex-col pl-1">
                  <span className="text-[#2B2B36] text-[1rem] font-bold tracking-tight truncate">{category.name}</span>
                  <span className="text-[#888891] text-[0.7rem] font-medium tracking-wide">{category.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Freelancers */}
        <div className="pb-8">
          <div className="flex justify-between items-end mb-4 pr-1">
            <h2 className="text-[#2B2B36] text-[1.2rem] font-bold tracking-tight">Top Profils</h2>
            <button className="text-[#4A90E2] text-[0.75rem] font-bold uppercase tracking-wide hover:opacity-80 transition-opacity">
              Voir Plus
            </button>
          </div>

          <div className="flex flex-col gap-5">
            {filteredFreelancers.length === 0 ? (
              <div className="text-center text-slate-500 py-10 font-medium">Bientôt disponible...</div>
            ) : filteredFreelancers.map((freelancer, index) => {
              const isCertified = index === 0 || index === 2;

              return (
              <div key={freelancer.id} className="relative group w-full mb-2">
                {/* Outer glow aura for certified cards */}
                {isCertified && (
                  <div className="absolute -inset-[4px] z-0 blur-[12px] rounded-[2.8rem] bg-black/5 opacity-80">
                    <div className="w-full h-full rounded-[2.8rem] overflow-hidden relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                          className="w-full h-full bg-[conic-gradient(from_0deg,#38BDF8,#BAE6FD,#38BDF8,#0284C7)] opacity-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div 
                  onClick={() => onFreelancerClick && onFreelancerClick(freelancer.id)}
                  className={`relative ${isCertified ? 'p-[3px] shadow-[0_15px_40px_rgba(56,189,248,0.2)] overflow-hidden rounded-[2.6rem]' : 'bg-white rounded-[2.5rem] p-3 shadow-[0_2px_15px_rgba(0,0,0,0.03)] border border-slate-50'} cursor-pointer transition-all flex flex-col z-10 w-full`}
                >
                  {/* Animated border line */}
                  {isCertified && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square z-0">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        className="w-full h-full bg-[conic-gradient(from_0deg,#38BDF8,#BAE6FD,#38BDF8,#0284C7)] opacity-90"
                      />
                    </div>
                  )}

                  <div className={`relative w-full flex flex-col z-10 h-full ${isCertified ? 'bg-white rounded-[2.4rem] p-3' : ''}`}>
                    {/* Cover Image */}
                    <div className="relative w-full h-[220px] rounded-[2rem] overflow-hidden bg-slate-200">
                  <div 
                    className="absolute inset-0 transition-transform duration-700 ease-out hover:scale-105"
                    style={{
                      backgroundImage: `url(${freelancer.portfolioUrl || freelancer.avatarUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  
                  {/* Rating & Subscribers Badge */}
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/10 text-white text-[13px] font-bold px-4 py-2 rounded-[1.25rem] flex items-center gap-1.5 shadow-sm">
                    <Star className="w-[14px] h-[14px] text-white fill-white" />
                    <span>{freelancer.rating}</span>
                    <span className="mx-1">•</span>
                    <span>{Math.floor(freelancer.rate * 123)} abonnés</span>
                  </div>
                </div>

                {/* Info block from the screenshot */}
                <div className="px-4 mt-6 pb-2">
                  {/* Top Header Row */}
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-3.5">
                      <img src={freelancer.avatarUrl} alt={freelancer.name} className="w-12 h-12 rounded-full object-cover shadow-sm bg-slate-200" />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[#2D3142] text-[1.05rem] font-semibold tracking-tight">{freelancer.name}</span>
                        <span className="text-[#888891] text-[0.75rem] font-medium tracking-wide">
                          {freelancer.location}
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#E4EFFF] px-3.5 py-1.5 rounded-md text-[#5493E1] text-[0.7rem] font-bold tracking-wide uppercase">
                      Meilleur profil
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div className="flex justify-center gap-12 mb-8">
                    <CircularProgress value="72" label="Niveau" color="#B294DE" ringColor="#C4AAED" />
                    <CircularProgress value={`${Math.round((freelancer.rating / 5) * 100)}%`} label="Évaluation" color="#6CA6F1" ringColor="#8BB8F3" />
                  </div>

                  {/* Description */}
                  <p className="text-[#888891] text-[0.85rem] leading-[1.6] tracking-wide text-center font-medium mb-8 px-2 w-[90%] mx-auto line-clamp-4">
                    {freelancer.overview}
                  </p>

                  {/* Stats Row */}
                  <div className="flex justify-around items-center mb-10">
                    <div className="flex flex-col items-center gap-1.5">
                       <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#B294DE]"></div><span className="text-[0.65rem] text-[#888891] tracking-wide font-semibold uppercase">Expérience</span></div>
                       <span className="text-[#2D3142] text-lg font-semibold tracking-tight">Expert</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                       <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#6CA6F1]"></div><span className="text-[0.65rem] text-[#888891] tracking-wide font-semibold uppercase">Avis positifs</span></div>
                       <span className="text-[#2D3142] text-lg font-semibold tracking-tight">27</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                       <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#F3D76F]"></div><span className="text-[0.65rem] text-[#888891] tracking-wide font-semibold uppercase">Clients</span></div>
                       <span className="text-[#2D3142] text-lg font-semibold tracking-tight">142</span>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between px-1">
                    <button 
                      onClick={(e) => toggleLike(freelancer.id, e)}
                      className={`w-11 h-11 rounded-full border shadow-sm flex items-center justify-center transition-active active:scale-95 ${likedFreelancers.has(freelancer.id) ? 'border-red-100 bg-red-50 text-red-500' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                    >
                      <Heart className={`w-5 h-5 stroke-[1.5] ${likedFreelancers.has(freelancer.id) ? 'fill-red-500' : ''}`} />
                    </button>
                    <button 
                      onClick={handleReviewClick}
                      className="w-11 h-11 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 shadow-sm transition-active active:scale-95 hover:bg-slate-50"
                    >
                      <MessageSquare className="w-5 h-5 stroke-[1.5]" />
                    </button>
                    <button 
                      onClick={(e) => toggleSubscribe(freelancer.id, e)}
                      className={`w-11 h-11 rounded-full border shadow-sm flex items-center justify-center transition-active active:scale-95 ${subscribedFreelancers.has(freelancer.id) ? 'border-brand-purple/20 bg-brand-purple/5 text-brand-purple' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                    >
                      {subscribedFreelancers.has(freelancer.id) ? (
                        <UserCheck className="w-5 h-5 stroke-[1.5]" />
                      ) : (
                        <UserPlus className="w-5 h-5 stroke-[1.5]" />
                      )}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if(onFreelancerClick) onFreelancerClick(freelancer.id);
                      }}
                      className="bg-[#EEE6FC] hover:bg-[#E5DAF9] text-[#8565CD] font-semibold text-[0.9rem] px-8 py-3 rounded-2xl tracking-wide transition-all active:scale-95"
                    >
                      Inviter
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </div>
            );
          })}
          </div>
        </div>
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

