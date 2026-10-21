import React, { useState } from 'react';
import { ArrowLeft, MapPin, Star, StarHalf, Plus, Check, X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { topFreelancers } from '../data';
import NewsDetailsView from './NewsDetailsView';

interface FreelancerProfileProps {
  freelancerId: string;
  onBack: () => void;
  onHireClick?: () => void;
  onContactClick?: () => void;
  onOverlayChange?: (active: boolean) => void;
  onNavigateCalendar?: () => void;
}

export const FreelancerProfile = ({ freelancerId, onBack, onHireClick, onContactClick, onOverlayChange, onNavigateCalendar }: FreelancerProfileProps) => {
  const freelancer = topFreelancers.find(f => f.id === freelancerId) || topFreelancers[4];
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showNewsDetail, setShowNewsDetail] = useState(false);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const packages = [
    { id: 'basic', name: 'Consultation basique', price: freelancer.rate },
    { id: 'standard', name: 'Projet standard', price: freelancer.rate * 10 },
    { id: 'premium', name: 'Forfait premium', price: freelancer.rate * 50 },
  ];
  
  const totalTickets = (Object.values(quantities) as number[]).reduce((a, b) => a + b, 0);
  const totalAmount = packages.reduce((acc, pkg) => acc + (pkg.price * (quantities[pkg.id] || 0)), 0);

  React.useEffect(() => {
    if (onOverlayChange) {
      onOverlayChange(showNewsDetail || isHireModalOpen);
    }
  }, [showNewsDetail, isHireModalOpen, onOverlayChange]);
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.5 }}
      className="h-[100dvh] sm:h-full bg-[#E5F3FC] relative z-20 overflow-hidden"
    >
      <AnimatePresence>
        {showNewsDetail && (
          <NewsDetailsView 
            onClose={() => setShowNewsDetail(false)} 
            imageUrl={freelancer.portfolioUrl} 
            publisherName={freelancer.name}
            publisherAvatar={freelancer.avatarUrl}
            title={`Projet de ${freelancer.name}`}
          />
        )}
      </AnimatePresence>
      
      <div className="flex flex-col h-full overflow-y-auto hide-scrollbar absolute inset-0">
        {/* Background Decor */}
        <div className="absolute top-[10%] right-[-15%] w-48 h-48 rounded-full border-[18px] border-[#BBDDF6]/40 blur-[1px] pointer-events-none"></div>

        {/* Header */}
        <header className="px-5 pt-[64px] pb-4 flex items-center justify-between relative z-10 shrink-0">
          <button onClick={onBack} className="text-[#4A90E2] p-2 -ml-2 rounded-full hover:bg-[#4A90E2]/10 transition-colors">
            <ArrowLeft className="w-6 h-6 stroke-[2]" />
          </button>
          {onNavigateCalendar && (
            <button onClick={onNavigateCalendar} className="text-[#4A90E2] p-2 -mr-2 rounded-full hover:bg-[#4A90E2]/10 transition-colors">
              <Calendar className="w-[22px] h-[22px] stroke-[2]" />
            </button>
          )}
        </header>
      
      {/* Top Hero Section */}
      <div className="flex gap-5 px-6 items-center mt-1 mb-6 relative z-10 shrink-0">
        <div className="w-[124px] h-[124px] rounded-[2rem] bg-[#F0F8FF] shadow-[0_8px_30px_rgba(74,144,226,0.15)] overflow-hidden relative shrink-0">
          <div 
            className="absolute inset-0 scale-[1.1] translate-y-1 origin-bottom"
            style={{
              backgroundImage: `url(${freelancer.avatarUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>
        
        <div className="flex flex-col justify-center py-1">
          <h2 className="text-[#4A90E2] text-[1.5rem] font-bold tracking-tight leading-tight mb-1" style={{ textShadow: '0 2px 10px rgba(74,144,226,0.1)' }}>
            {freelancer.name}
          </h2>
          <p className="text-[#4A90E2]/80 text-[0.85rem] font-semibold tracking-wide mb-2.5">{freelancer.role}</p>
          
          <div className="flex flex-col gap-1.5 mb-3.5">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-[14px] h-[14px] text-[#4A90E2]" strokeWidth={2.5} />
              <span className="text-[#4A90E2]/85 text-[0.75rem] font-semibold tracking-wide">{freelancer.location}</span>
            </div>
            <div className="flex items-center gap-1">
               <div className="flex items-center">
                 {[1, 2, 3, 4, 5].map((star) => {
                   if (freelancer.rating >= star) {
                     return <Star key={star} className="w-[14px] h-[14px] text-yellow-500 fill-yellow-500" />;
                   } else if (freelancer.rating >= star - 0.5) {
                     return <StarHalf key={star} className="w-[14px] h-[14px] text-yellow-500 fill-yellow-500" />;
                   } else {
                     return <Star key={star} className="w-[14px] h-[14px] text-gray-300" strokeWidth={2} />;
                   }
                 })}
               </div>
               <span className="text-[#4A90E2]/90 text-[0.75rem] font-bold ml-1">{freelancer.rating}</span>
               <span className="text-[#4A90E2]/50 text-[0.7rem] mx-1">•</span>
               <span className="text-[#4A90E2]/90 text-[0.75rem] font-bold">{Math.floor(freelancer.rate * 123)} abonnés</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={onContactClick}
              className="bg-[#4A90E2] shadow-[0_4px_15px_rgba(74,144,226,0.3)] hover:scale-105 transition-transform active:scale-95 text-white text-[0.75rem] font-bold uppercase tracking-[0.1em] px-6 py-2.5 rounded-[0.8rem]"
            >
              Contacter
            </button>
            <button 
              onClick={() => setIsSubscribed(!isSubscribed)}
              className={`transition-all duration-300 active:scale-95 flex items-center justify-center w-[40px] h-[40px] rounded-full border ${
                isSubscribed 
                  ? "bg-[#4A90E2] text-white border-[#4A90E2]" 
                  : "bg-[#DCEEFA] text-[#4A90E2] border-[#BBDDF6] hover:bg-[#BBDDF6]"
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {isSubscribed ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, opacity: 0, rotate: -90 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0, rotate: 90 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  >
                    <Check size={20} strokeWidth={3} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="plus"
                    initial={{ scale: 0, opacity: 0, rotate: 90 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0, opacity: 0, rotate: -90 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  >
                    <Plus size={20} strokeWidth={3} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Information Sheet */}
      <div className="flex-1 bg-[#F0F8FF] rounded-t-[2.5rem] px-7 pt-8 pb-32 shadow-[0_-15px_40px_rgba(0,0,0,0.06)] flex flex-col gap-6 relative z-10 shrink-0">
        
        {/* Overview Row */}
        <div>
          <h3 className="text-[#2B2B36] text-[1.25rem] font-bold tracking-tight mb-3 focus:outline-none">Aperçu</h3>
          <p className="text-[#888891] text-[0.85rem] leading-[1.6] font-medium pr-2">
            {freelancer.overview}
          </p>
        </div>

        {/* Skills Row */}
        <div className="mt-1">
          <h3 className="text-[#2B2B36] text-[1.25rem] font-bold tracking-tight mb-3">Compétences</h3>
          <p className="text-[#888891] text-[0.85rem] leading-[1.6] font-medium">
            {freelancer.skills}
          </p>
        </div>

        {/* Action Tabs Menu */}
        <div className="flex items-center gap-3 mt-2">
          <button className="bg-[#DCEEFA] text-[#4A90E2] px-5 py-2.5 rounded-[1rem] text-[0.8rem] font-bold border border-transparent shadow-sm">
            Portefeuille
          </button>
          <button className="bg-transparent text-[#4A90E2] px-5 py-2.5 rounded-[1rem] text-[0.8rem] font-bold border-[1.5px] border-[#BBDDF6] hover:bg-[#4A90E2]/5 transition-colors">
            Clients
          </button>
          <button className="bg-transparent text-[#4A90E2] px-5 py-2.5 rounded-[1rem] text-[0.8rem] font-bold border-[1.5px] border-[#BBDDF6] hover:bg-[#4A90E2]/5 transition-colors">
            Avis
          </button>
        </div>

        {/* Rich Portfolio Content Area */}
        <div 
          onClick={() => setShowNewsDetail(true)}
          className="mt-4 w-full h-[220px] rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-50 relative bg-white cursor-pointer hover:opacity-95 transition-opacity"
        >
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${freelancer.portfolioUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'top',
            }}
          />
        </div>
        
      </div>
      </div>


      {/* Bottom Fixed Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white z-[50] flex items-center justify-between pb-8 shadow-[0_-10px_30px_rgb(0,0,0,0.03)] border-t border-gray-100">
        <div className="flex flex-col">
          <span className="text-[13px] text-gray-400 font-medium tracking-wide">À partir de</span>
          <span className="text-[26px] font-bold text-gray-900 tracking-tight">${freelancer.rate}.00</span>
        </div>
        
        {/* Le bouton déclencheur */}
        <button 
          onClick={() => setIsHireModalOpen(true)}
          className="bg-[#0f1013] text-white rounded-[1.5rem] px-8 py-4 font-semibold text-[16px] hover:scale-105 transition-transform active:scale-95 shadow-lg"
        >
          Payer
        </button>
      </div>

      <AnimatePresence>
        {isHireModalOpen && (
          <>
            {/* Arrière-plan assombri */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHireModalOpen(false)}
              className="absolute inset-0 bg-black/60 z-[60]"
            />
            
            {/* Tiroir / Modale qui monte du bas contenant les billets (les options/props) */}
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white sm:rounded-t-[32px] z-[70] flex flex-col font-sans text-gray-900 px-6 pt-8 pb-8 shadow-2xl rounded-t-[32px]"
            >
              <div className="mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Sélectionner les options</h2>
                  <button 
                    onClick={() => setIsHireModalOpen(false)} 
                    className="p-2 -mr-2 bg-gray-100 rounded-full active:scale-95 transition-transform"
                  >
                    <X size={20} className="text-gray-900" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  {packages.map(pkg => (
                    <div key={pkg.id} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 text-[1.05rem]">{pkg.name}</span>
                        <span className="text-[0.8rem] text-[#0ea5e9] font-medium">${pkg.price.toFixed(2)}</span>
                      </div>
                      {/* Sélecteur de quantité (+/-) */}
                      <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 border border-gray-200">
                        <button 
                          onClick={() => setQuantities(prev => ({ ...prev, [pkg.id]: Math.max(0, (prev[pkg.id] || 0) - 1) }))}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 hover:text-black shadow-sm transition-transform active:scale-95 text-lg font-medium"
                        >-</button>
                        <span className="font-bold text-gray-900 w-4 text-center">{quantities[pkg.id] || 0}</span>
                        <button 
                          onClick={() => setQuantities(prev => ({ ...prev, [pkg.id]: (prev[pkg.id] || 0) + 1 }))}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-gray-600 hover:text-black shadow-sm transition-transform active:scale-95 text-lg font-medium"
                        >+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bouton de confirmation total */}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-400 font-medium mb-0.5">Montant total</span>
                  <span className="font-bold text-gray-900 text-2xl">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setIsHireModalOpen(false);
                    if (onHireClick) onHireClick();
                  }}
                  disabled={totalTickets === 0}
                  className={`bg-[#0f1013] text-white rounded-full px-10 py-4 font-semibold text-[16px] transition-transform ${totalTickets === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                >
                  Payer
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
