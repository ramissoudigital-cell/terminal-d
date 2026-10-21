import { useState } from 'react';
import { ArrowLeft, Search, Star, MapPin, MoreVertical, MessageSquare, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { categories, topFreelancers } from '../data';

interface OfferDetailsProps {
  categoryId: string;
  onBack: () => void;
  onFreelancerClick?: (id: string) => void;
  onContactClick?: (id: string) => void;
  onHireClick?: (id: string) => void;
}

export const OfferDetails = ({ categoryId, onBack, onFreelancerClick, onContactClick, onHireClick }: OfferDetailsProps) => {
  const category = categories.find(c => c.id === categoryId) || categories[0];
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.4 }}
      className="flex flex-col h-full bg-[#F0F8FF] pb-24"
    >
      {/* Header */}
      <header className="px-6 pt-[60px] pb-4 flex items-center justify-between relative z-10 bg-white shadow-sm">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800 transition-active active:scale-95">
          <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
        </button>
        <span className="text-[1rem] font-bold text-[#2B2B36] truncate px-4">{category.name}</span>
        <div className="w-10 h-10"></div>
      </header>
      
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="relative group h-[48px] mb-6">
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
            
            <div className="relative w-full bg-white/95 rounded-[1.8rem] px-3 flex items-center backdrop-blur-md z-10 h-full">
              <div className="px-3">
                <Search size={20} className="text-[#4A90E2]" />
              </div>
              <input 
                type="text" 
                placeholder="Rechercher profil, compétences..." 
                className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-gray-700 placeholder:text-gray-400 py-1 h-full"
              />
            </div>
          </div>
        </div>

        <h2 className="text-[#2B2B36] text-[1.2rem] font-bold tracking-tight mb-1">Candidats / Profils</h2>
        <p className="text-[#888891] text-[0.8rem] mb-6">Trouvez le meilleur profil pour "{category.name}"</p>
        
        <div className="flex flex-col gap-5">
          {topFreelancers.map((freelancer) => {
            const isF5 = freelancer.id === 'f5';
            const displayName = isF5 ? 'Alice Courtois' : freelancer.name;
            const displayLocation = isF5 ? 'Paris, FR' : `${freelancer.location}, FR`;
            const displayRole = isF5 ? 'UI/UX DESIGNER' : freelancer.role.toUpperCase();
            
            // Custom service title and overview aligned to user's photo
            let serviceTitle = "Création de Logo & Charte Graphique";
            let serviceOverview = freelancer.overview;
            let servicePrice = freelancer.rate * 6.5;
            if (isF5) {
              servicePrice = 350;
              serviceOverview = "Prestataire UI/UX passionnée. Je propose de concevoir l'identité visuelle complète de votre entreprise : Logo unique, charte graphique...";
            } else if (freelancer.id === 'f1') {
              serviceTitle = "Ménage à domicile & Repassage de haut niveau";
              serviceOverview = "Besoin de faire briller votre intérieur ? Je propose un entretien approfondi avec un soin méticuleux pour vos textiles et pièces de vie.";
              servicePrice = 90;
            } else if (freelancer.id === 'f2') {
              serviceTitle = "Montage Vidéo Premium & Motion Design engagé";
              serviceOverview = "Monteur vidéo créatif avec 6 ans d'expérience. Production d'effets visuels, sound design, étalonnage de couleur haut de gamme pour vos réseaux.";
              servicePrice = 220;
            } else if (freelancer.id === 'f3') {
              serviceTitle = "Soutien Scolaire Particulier & Aide de Méthode";
              serviceOverview = "Enseignante dévouée pour redonner confiance à vos enfants du primaire au lycée. Pédagogie active et méthodologies d'excellence.";
              servicePrice = 110;
            } else if (freelancer.id === 'f4') {
              serviceTitle = "Aménagement Paysager complet & Nettoyage Extérieur";
              serviceOverview = "Artisan paysagiste et architecte d'extérieur. Tonte, taille de dalles, entretien floral et redéfinition d'espaces verts sur-mesure.";
              servicePrice = 185;
            }

            const displayDelay = isF5 ? '10/06/2026' : '15/06/2026';

            return (
              <div 
                key={freelancer.id} 
                className="bg-white rounded-[1.75rem] p-5 flex flex-col border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
              >
                {/* Top Info Header */}
                <div className="flex items-start justify-between w-full gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <img 
                      src={freelancer.avatarUrl} 
                      alt={displayName} 
                      className="w-[52px] h-[52px] rounded-full object-cover border border-slate-100 shrink-0" 
                    />
                    <div className="flex flex-col gap-1 min-w-0 pt-0.5 max-w-full">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[#2B2B36] text-[15px] font-extrabold tracking-tight leading-none truncate w-full">{displayName}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] text-[#b45cf4] bg-[#ebd9fc]/60 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider leading-none shrink-0">PRESTATAIRE</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[12px] font-medium mt-0.5">
                        <MapPin className="w-3.5 h-3.5 stroke-[2] text-slate-400 shrink-0" />
                        <span className="truncate">{displayLocation}</span>
                        <span className="mx-0.5 text-slate-300 shrink-0">•</span>
                        <Star className="w-3.5 h-3.5 fill-[#F6C644] text-[#F6C644] shrink-0" />
                        <span className="text-slate-700 font-extrabold shrink-0">{freelancer.rating}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="inline-flex items-center text-center text-[9px] font-extrabold text-[#4A90E2] bg-[#4A90E2]/8 border border-[#4A90E2]/15 px-2 py-1 rounded-lg uppercase tracking-wider max-w-[90px] leading-tight break-words">
                      {displayRole}
                    </span>
                  </div>
                </div>

                {/* Horizontal Separator */}
                <div className="h-[1px] bg-slate-100/80 my-4 w-full"></div>

                {/* Service Title */}
                <h4 className="text-[#2B2B36] text-[15.5px] font-extrabold tracking-tight leading-snug">
                  {serviceTitle}
                </h4>

                {/* Short text */}
                <p className="text-slate-500 font-medium text-[13.5px] leading-relaxed mt-2">
                  {serviceOverview}
                </p>

                {/* Inner Info Box */}
                <div className="bg-[#f8fafc] rounded-[1.25rem] p-3.5 flex items-center justify-between mt-4 border border-slate-100/50 gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-slate-400 text-[9px] font-extrabold tracking-wider uppercase mb-1">TARIF</span>
                    <span className="text-[#00A86B] text-[16px] font-extrabold truncate">{servicePrice} €</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-slate-400 text-[9px] font-extrabold tracking-wider uppercase mb-1">DÉLAI</span>
                    <span className="text-slate-700 text-[13px] font-extrabold flex items-center gap-1 truncate">
                      <Clock className="w-3.5 h-3.5 stroke-[2] text-slate-400 shrink-0" />
                      <span className="truncate">{displayDelay}</span>
                    </span>
                  </div>
                  

                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-4">
                  <button 
                    onClick={() => onFreelancerClick && onFreelancerClick(freelancer.id)}
                    className="flex-1 bg-[#4A90E2] text-white hover:bg-[#357ABD] transition-all py-3.5 px-6 rounded-[1.25rem] font-bold text-center text-[14.5px] cursor-pointer shadow-sm active:scale-[0.98] flex items-center justify-center gap-1"
                  >
                    Commander <span className="text-[12px] opacity-80 font-normal">↗</span>
                  </button>
                  <button 
                    onClick={() => onContactClick && onContactClick(freelancer.id)}
                    className="w-[50px] h-[50px] border border-slate-200 hover:bg-slate-50 rounded-[1.25rem] text-slate-600 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95"
                  >
                    <MessageSquare className="w-5 h-5 stroke-[1.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};
