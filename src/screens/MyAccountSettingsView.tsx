import React, { useState } from "react";
import { 
  Search, 
  Bell, 
  Upload, 
  MoreHorizontal, 
  ImagePlus, 
  Ticket, 
  Activity, 
  Heart, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronDown, 
  MessageSquare, 
  GraduationCap,
  User,
  Mail,
  Building2,
  FileText,
  Award,
  X,
  Link2,
  Share2,
  Camera,
  Save,
  Instagram,
  Facebook,
  Twitter,
  Linkedin
} from "lucide-react";
import { ProfileSettingsDrawer } from "../ProfileSettingsDrawer";
import { motion, AnimatePresence } from "motion/react";
import NewsDetailsView from "./NewsDetailsView";
import { RegisteredUser } from "../types";

interface MyAccountSettingsViewProps {
  onBack: () => void;
  onNavigateInfo?: () => void;
  onNavigatePortfolio?: () => void;
  onNavigateSettings?: () => void;
  onNavigateQRCode?: () => void;
  onNavigateMap?: () => void;
  onNavigateBalance?: () => void;
  onNavigateNotifications?: () => void;
  onNavigateCalendar?: () => void;
  onNavigateStudio?: () => void;
  onOverlayChange?: (hide: boolean) => void;
  role?: 'user' | 'promoter';
  userProfile?: RegisteredUser;
  setUserProfile?: React.Dispatch<React.SetStateAction<RegisteredUser>>;
}

export const MyAccountSettingsView: React.FC<MyAccountSettingsViewProps> = ({
  onBack,
  onNavigateInfo,
  onNavigatePortfolio,
  onNavigateSettings,
  onNavigateQRCode,
  onNavigateMap,
  onNavigateBalance,
  onNavigateNotifications,
  onNavigateCalendar,
  onNavigateStudio,
  onOverlayChange,
  role = 'promoter',
  userProfile,
  setUserProfile
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'portfolio' | 'clients' | 'review' | 'analytics'>('info');
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [activeDrawerMenu, setActiveDrawerMenu] = useState<'main' | 'settings'>('main');
  const [selectedNewsImage, setSelectedNewsImage] = useState<string | null>(null);
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  
  const [editForm, setEditForm] = useState({
    firstName: userProfile?.firstName || 'Jessica',
    lastName: userProfile?.lastName || 'Parker',
    profession: 'Digital Creator & Model',
    location: 'Paris, FR',
    website: 'jessicaparker.com',
    accreditationCode: userProfile?.accreditationCode || ''
  });

  React.useEffect(() => {
    if (onOverlayChange) {
      onOverlayChange(selectedNewsImage !== null);
    }
  }, [selectedNewsImage, onOverlayChange]);

  const avatarFallback = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80";
  const currentUserProfile = {
    agentName: userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "Ramissou Digital",
    agentAvatar: userProfile && userProfile.profilePhoto ? userProfile.profilePhoto : avatarFallback,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 25, duration: 0.6 }}
      className="absolute inset-0 h-full bg-gradient-to-br from-[#E5F3FC] via-[#F0F8FF] to-[#DCEEFA]"
    >
      <AnimatePresence>
        {selectedNewsImage && (
          <NewsDetailsView 
            onClose={() => setSelectedNewsImage(null)} 
            imageUrl={selectedNewsImage}
            publisherName={currentUserProfile.agentName}
            publisherAvatar={currentUserProfile.agentAvatar}
            title="Mon portfolio - Belle réalisation"
          />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 h-full overflow-y-auto hide-scrollbar pb-32">
      {/* Header */}
      <div className="pt-12 px-6 flex justify-between items-center z-10 relative">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={onBack}
        >
          <span className="font-semibold text-gray-900 text-[20px] tracking-tight truncate max-w-[150px]">
            Mon Profil
          </span>
        </div>
        <div className="flex gap-[10px]">
          <button 
            onClick={() => {
              setIsSettingsDrawerOpen(true);
              setActiveDrawerMenu('main');
            }}
            className="w-[42px] h-[42px] rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-transform active:scale-90"
          >
            <SlidersHorizontal size={18} strokeWidth={2.5} className="text-gray-800" />
          </button>
          <button 
            className="w-[42px] h-[42px] rounded-full bg-white/40 backdrop-blur-md flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-transform active:scale-90"
            onClick={onNavigateNotifications}
          >
            <Bell size={18} strokeWidth={2.5} className="text-gray-800" />
          </button>
        </div>
      </div>

      <div className="pt-4">
        {/* Profile Card */}
        <div className="mt-16 px-6 relative z-10">
          <div className="bg-white/70 backdrop-blur-2xl rounded-[36px] pt-14 pb-7 px-6 flex flex-col items-center relative shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-white/50">
            {/* Avatar Cutout / Overlap */}
            <div className="absolute -top-[52px] left-1/2 -translate-x-1/2 flex items-center justify-center w-[104px] h-[104px] rounded-full">
              {/* The outer ring matching the background to simulate cutout */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#E5F3FC] to-[#F0F8FF] p-[10px]">
                {/* The avatar itself */}
                <div className="w-full h-full rounded-full overflow-hidden shadow-sm border border-white/20">
                  <img
                    src={currentUserProfile.agentAvatar}
                    alt={currentUserProfile.agentName}
                    className="w-full h-full object-cover bg-gray-100"
                  />
                </div>
              </div>
            </div>

            {/* Info */}
            <h2 className="text-[22px] font-bold text-gray-900 mt-1 tracking-tight">
              {currentUserProfile.agentName}
            </h2>
            <p className="text-[#4A90E2] text-[13px] font-bold mb-7 tracking-wide bg-[#4A90E2]/8 px-3.5 py-1 rounded-full border border-[#4A90E2]/15">
              @{userProfile?.username || "username"} • {userProfile?.role === "client" ? "Client" : userProfile?.role === "directeur" ? "Directeur" : "Prestataire"}
            </p>

            {/* Stats */}
            <div className="flex justify-between w-full px-5 mb-7">
              <div className="flex flex-col items-center">
                <span className="font-bold text-gray-900 text-[19px] leading-none mb-1.5">
                  132
                </span>
                <span className="text-[11px] font-medium text-gray-500">
                  Abonnements
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-gray-900 text-[19px] leading-none mb-1.5">
                  3256
                </span>
                <span className="text-[11px] font-medium text-gray-500">
                  Abonnés
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-gray-900 text-[19px] leading-none mb-1.5">
                  8546
                </span>
                <span className="text-[11px] font-medium text-gray-500">
                  J'aime
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-[10px] w-full">
              <button 
                onClick={() => setIsEditProfileOpen(true)}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-900 font-semibold py-[13px] rounded-full transition-colors text-[13px] shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 active:scale-95"
              >
                Modifier le profil
              </button>
              <button 
                onClick={() => setIsShareSheetOpen(true)}
                className="w-[46px] h-[46px] bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-colors flex-shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 active:scale-95"
              >
                <Upload size={17} strokeWidth={2.5} className="text-gray-800" />
              </button>
              <button 
                onClick={() => {
                  setIsSettingsDrawerOpen(true);
                  setActiveDrawerMenu('main');
                }}
                className="w-[46px] h-[46px] bg-white hover:bg-gray-50 rounded-full flex items-center justify-center transition-colors flex-shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 active:scale-95"
              >
                <MoreHorizontal
                  size={20}
                  strokeWidth={2.5}
                  className="text-gray-800"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Row */}
        <div className="mt-8 px-6 flex items-center space-x-3 overflow-x-auto hide-scrollbar z-10 relative">
          <button 
            onClick={() => setActiveTab('info')}
            className={`px-5 py-2.5 rounded-[1rem] text-[0.8rem] font-bold active:scale-95 transition-colors whitespace-nowrap ${activeTab === 'info' ? 'bg-[#4A90E2] text-white shadow-sm' : 'bg-white/40 text-[#4A90E2] hover:bg-white/60 border-[1.5px] border-white/50'}`}
          >
            Informations
          </button>

          <button 
            onClick={() => setActiveTab('portfolio')}
            className={`px-5 py-2.5 rounded-[1rem] text-[0.8rem] font-bold active:scale-95 transition-colors whitespace-nowrap ${activeTab === 'portfolio' ? 'bg-[#4A90E2] text-white shadow-sm' : 'bg-white/40 text-[#4A90E2] hover:bg-white/60 border-[1.5px] border-white/50'}`}
          >
            Portofolio
          </button>

          <button 
            onClick={() => setActiveTab('clients')}
            className={`px-5 py-2.5 rounded-[1rem] text-[0.8rem] font-bold active:scale-95 transition-colors whitespace-nowrap ${activeTab === 'clients' ? 'bg-[#4A90E2] text-white shadow-sm' : 'bg-white/40 text-[#4A90E2] hover:bg-white/60 border-[1.5px] border-white/50'}`}
          >
            Clients
          </button>
          
          <button 
            onClick={() => setActiveTab('review')}
            className={`px-5 py-2.5 rounded-[1rem] text-[0.8rem] font-bold active:scale-95 transition-colors whitespace-nowrap ${activeTab === 'review' ? 'bg-[#4A90E2] text-white shadow-sm' : 'bg-white/40 text-[#4A90E2] hover:bg-white/60 border-[1.5px] border-white/50'}`}
          >
            Avis
          </button>

          {role === 'promoter' && (
            <button 
              onClick={() => setActiveTab('analytics')}
              className={`px-5 py-2.5 rounded-[1rem] text-[0.8rem] font-bold active:scale-95 transition-colors whitespace-nowrap ${activeTab === 'analytics' ? 'bg-[#4A90E2] text-white shadow-sm' : 'bg-white/40 text-[#4A90E2] hover:bg-white/60 border-[1.5px] border-white/50'}`}
            >
              Statistiques
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'info' ? (
          <div className="mt-6 px-6 z-10 relative flex flex-col gap-5 pb-10">
            {/* Headline Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.015)] text-left flex flex-col gap-3.5">
              <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 leading-none">
                <Award size={13} className="text-[#4A90E2]" /> Profil & Rôle actif
              </h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#4A90E2]/10 flex items-center justify-center text-[#4A90E2]">
                  <Award size={20} className="stroke-[2.5]" />
                </div>
                <div>
                  <span className="block text-[14px] font-extrabold text-slate-800">
                    {userProfile?.role === 'client' ? "🚀 Client / Recruteur" : userProfile?.role === 'directeur' ? "🎓 Directeur Scolaire" : "💼 Prestataire / Expert"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 block tracking-wide">
                    Type de compte vérifié
                  </span>
                </div>
              </div>
            </div>

            {/* General Info Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col gap-4 text-left">
              <h3 className="text-[14.5px] font-black text-slate-800 border-b border-slate-100/80 pb-3 uppercase tracking-wider flex items-center gap-2">
                <User size={15} className="text-[#4A90E2]" /> Informations Personnelles
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prénom</span>
                  <span className="text-[13.5px] font-extrabold text-slate-700">{userProfile?.firstName || "N/A"}</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nom</span>
                  <span className="text-[13.5px] font-extrabold text-slate-700">{userProfile?.lastName || "N/A"}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pseudo</span>
                  <span className="text-[13px] font-mono font-extrabold text-[#4A90E2] bg-[#4A90E2]/8 px-2 py-0.5 rounded-lg w-fit">
                    @{userProfile?.username || "username"}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Structure</span>
                  <div className="mt-0.5">
                    {userProfile?.workStructure === 'company' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-150 text-[10px] font-extrabold text-indigo-700 uppercase">
                        🏢 Entreprise
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-teal-50 border border-teal-150 text-[10px] font-extrabold text-teal-700 uppercase">
                        👤 Solo / Seul
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Email contact */}
              <div className="flex flex-col gap-1 border-t border-slate-100/80 pt-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Mail size={12} className="text-slate-400" /> Email de contact
                </span>
                <span className="text-[13px] font-bold text-slate-700 truncate">{userProfile?.email || "N/A"}</span>
              </div>
            </div>

            {/* Bio Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col gap-3 text-left">
              <h3 className="text-[14.5px] font-black text-slate-800 border-b border-slate-100/80 pb-3 uppercase tracking-wider">
                Bio / Présentation
              </h3>
              <p className="text-[13px] leading-relaxed text-slate-600 font-medium whitespace-pre-wrap italic">
                "{userProfile?.bio || "Aucune biographie rédigée pour l'instant."}"
              </p>
            </div>

            {/* Skills Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col gap-3 text-left">
              <h3 className="text-[14.5px] font-black text-slate-800 border-b border-slate-100/80 pb-3 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal size={15} className="text-[#4A90E2]" /> Compétences & Expertises
              </h3>
              {userProfile?.skills && userProfile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1 select-none">
                  {userProfile.skills.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 text-slate-700 font-extrabold rounded-xl text-[11.5px] shadow-3xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-bold">Aucune compétence sélectionnée.</span>
              )}
            </div>

            {/* Documents Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col gap-3 text-left">
              <h3 className="text-[14.5px] font-black text-slate-800 border-b border-slate-100/80 pb-3 uppercase tracking-wider flex items-center gap-2">
                <FileText size={15} className="text-[#4A90E2]" /> Pièce d'identité
              </h3>
              {userProfile?.idDocumentName ? (
                <div className="flex items-center gap-3 p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl w-full">
                  <div className="p-2 bg-emerald-500 text-white rounded-xl flex-shrink-0">
                    <FileText size={16} />
                  </div>
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-[12px] font-bold text-slate-700 truncate max-w-[200px]">
                      {userProfile.idDocumentName}
                    </span>
                    <span className="text-[9.5px] text-emerald-600 font-extrabold uppercase tracking-wide mt-0.5">
                      Statut : Transféré avec succès
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded-xl text-left">
                  <span className="text-xs text-amber-700 font-bold block">Aucune pièce d'identité fournie.</span>
                  <span className="text-[9.5px] text-slate-400 font-bold block mt-1 uppercase">
                    (Optionnel lors de la phase d'abonnement)
                  </span>
                </div>
              )}
            </div>

            {/* Experience Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 w-full">
                <h3 className="text-[14.5px] font-black text-slate-800 uppercase tracking-wider">
                  Experience
                </h3>
                <button className="text-[#4A90E2] bg-[#4A90E2]/10 hover:bg-[#4A90E2]/20 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider">
                  Ajouter
                </button>
              </div>
              <p className="text-[13px] text-slate-500 font-medium whitespace-pre-wrap italic mt-1">
                Aucune expérience ajoutée.
              </p>
            </div>

            {/* References Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 w-full">
                <h3 className="text-[14.5px] font-black text-slate-800 uppercase tracking-wider">
                  Références
                </h3>
                <button className="text-[#4A90E2] bg-[#4A90E2]/10 hover:bg-[#4A90E2]/20 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider">
                  Ajouter
                </button>
              </div>
              <p className="text-[13px] text-slate-500 font-medium whitespace-pre-wrap italic mt-1">
                Aucune référence ajoutée.
              </p>
            </div>

            {/* Education Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 w-full">
                <h3 className="text-[14.5px] font-black text-slate-800 uppercase tracking-wider">
                  Éducation
                </h3>
                <button className="text-[#4A90E2] bg-[#4A90E2]/10 hover:bg-[#4A90E2]/20 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider">
                  Ajouter
                </button>
              </div>
              <p className="text-[13px] text-slate-500 font-medium whitespace-pre-wrap italic mt-1">
                Aucune formation ajoutée.
              </p>
            </div>

            {/* Qualifications Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 w-full">
                <h3 className="text-[14.5px] font-black text-slate-800 uppercase tracking-wider">
                  Qualifications
                </h3>
                <button className="text-[#4A90E2] bg-[#4A90E2]/10 hover:bg-[#4A90E2]/20 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider">
                  Ajouter
                </button>
              </div>
              <p className="text-[13px] text-slate-500 font-medium whitespace-pre-wrap italic mt-1">
                Aucune qualification ajoutée.
              </p>
            </div>

            {/* Publications Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 w-full">
                <h3 className="text-[14.5px] font-black text-slate-800 uppercase tracking-wider">
                  Publications
                </h3>
                <button className="text-[#4A90E2] bg-[#4A90E2]/10 hover:bg-[#4A90E2]/20 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider">
                  Ajouter
                </button>
              </div>
              <p className="text-[13px] text-slate-500 font-medium whitespace-pre-wrap italic mt-1">
                Aucune publication ajoutée.
              </p>
            </div>

            {/* Certifications Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 w-full">
                <h3 className="text-[14.5px] font-black text-slate-800 uppercase tracking-wider">
                  Certifications
                </h3>
                <button className="text-[#4A90E2] bg-[#4A90E2]/10 hover:bg-[#4A90E2]/20 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider">
                  Ajouter
                </button>
              </div>
              <p className="text-[13px] text-slate-500 font-medium whitespace-pre-wrap italic mt-1">
                Aucune certification ajoutée.
              </p>
            </div>

            {/* Articles Card */}
            <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/50 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col gap-3 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100/80 w-full">
                <h3 className="text-[14.5px] font-black text-slate-800 uppercase tracking-wider">
                  Articles
                </h3>
                <button className="text-[#4A90E2] bg-[#4A90E2]/10 hover:bg-[#4A90E2]/20 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors uppercase tracking-wider">
                  Ajouter
                </button>
              </div>
              <p className="text-[13px] text-slate-500 font-medium whitespace-pre-wrap italic mt-1">
                Aucun article ajouté.
              </p>
            </div>
          </div>
        ) : activeTab === 'portfolio' ? (
          <div className="mt-6 px-6 z-10 relative flex gap-[14px]">
            <div className="flex flex-col gap-[14px] w-1/2">
              <img
                onClick={() => setSelectedNewsImage("https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80")}
                className="w-full h-[230px] rounded-[22px] object-cover bg-gray-200 shadow-sm transition-transform hover:scale-[1.01] cursor-pointer"
                src="https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&q=80"
                alt="Post 1"
              />
              <img
                onClick={() => setSelectedNewsImage("https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400")}
                className="w-full h-[180px] rounded-[22px] object-cover bg-gray-200 shadow-sm transition-transform hover:scale-[1.01] cursor-pointer"
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400"
                alt="Post 2"
              />
            </div>
            <div className="flex flex-col gap-[14px] w-1/2">
              <img
                onClick={() => setSelectedNewsImage("https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=400")}
                className="w-full h-[260px] rounded-[22px] object-cover bg-gray-200 shadow-sm transition-transform hover:scale-[1.01] cursor-pointer"
                src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?q=80&w=400"
                alt="Post 3"
              />
              <img
                onClick={() => setSelectedNewsImage("https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=400")}
                className="w-full h-[200px] rounded-[22px] object-cover bg-gray-200 shadow-sm transition-transform hover:scale-[1.01] cursor-pointer"
                src="https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=400"
                alt="Post 4"
              />
            </div>
          </div>
        ) : activeTab === 'clients' ? (
          <div className="mt-6 px-6 z-10 relative flex flex-col gap-4">
            {/* Tickets List */}
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  <Ticket size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-[15px]">VIP Pass - Summer Festival</h4>
                  <p className="text-gray-500 text-xs font-medium mt-0.5">Quantité : 2</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-bold text-gray-900">$150.00</span>
                <span className="text-indigo-600 text-xs font-bold bg-indigo-50 px-2 py-1 rounded-md mt-1 inline-block">Actif</span>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-white/50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                  <Ticket size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-[15px]">General Admission - Tech Expo</h4>
                  <p className="text-gray-500 text-xs font-medium mt-0.5">Quantité : 5</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-bold text-gray-900">$45.00</span>
                <span className="text-indigo-600 text-xs font-bold bg-indigo-50 px-2 py-1 rounded-md mt-1 inline-block">Actif</span>
              </div>
            </div>

            <div className="bg-white/50 backdrop-blur-md rounded-2xl p-4 border border-white/30 flex items-center justify-between opacity-70">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                  <Ticket size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-[15px]">Early Bird - Startup Meetup</h4>
                  <p className="text-gray-500 text-xs font-medium mt-0.5">Quantité : 1</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block font-bold text-gray-900">$20.00</span>
                <span className="text-gray-500 text-xs font-bold bg-gray-100 px-2 py-1 rounded-md mt-1 inline-block">Épuisé</span>
              </div>
            </div>
          </div>
        ) : activeTab === 'review' ? (
          <div className="mt-6 px-6 z-10 relative flex flex-col items-center justify-center py-10 opacity-60">
             <div className="w-16 h-16 bg-white/50 rounded-[20px] flex items-center justify-center mb-4">
                <Heart size={28} className="text-gray-400" />
             </div>
             <p className="text-gray-500 font-medium">Aucun avis pour l'instant</p>
          </div>
        ) : null}

        {/* Analytics Content */}
        {activeTab === 'analytics' && (
          <div className="mt-6 px-6 z-10 relative flex flex-col gap-6 pb-10">
            <div className="flex justify-between items-center">
              <h3 className="text-[22px] font-bold text-gray-900 tracking-tight">Statistiques</h3>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-gray-100/50 hover:bg-gray-50 transition-colors cursor-pointer text-sm font-semibold text-gray-800 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                2025 <ChevronDown size={14} className="text-gray-500"/>
              </div>
            </div>

            {/* Chart Card */}
            <div className="bg-white rounded-[32px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100/50 flex flex-col">
              <div className="relative h-[260px] flex gap-4 w-full">
                {/* Y-axis */}
                <div className="flex flex-col justify-between text-[11px] font-semibold text-gray-400 py-1 h-[220px]">
                  <span>1.0</span>
                  <span>0.9</span>
                  <span>0.8</span>
                  <span>0.7</span>
                  <span>0.6</span>
                  <span>0.5</span>
                  <span>0.4</span>
                  <span>0.3</span>
                  <span>0.2</span>
                  <span>0.1</span>
                </div>
                {/* Chart columns */}
                <div className="flex-1 flex justify-between px-1 relative h-[220px]">
                   {/* Col 1 */}
                   <div className="w-[42px] h-full relative">
                      {/* Hatched top */}
                      <div className="absolute top-0 w-full h-[10%] rounded-[14px] bg-[repeating-linear-gradient(-45deg,#f3f4f6,#f3f4f6_4px,transparent_4px,transparent_8px)]"></div>
                      <div className="absolute bottom-[48%] h-[38%] w-full rounded-[14px] bg-[#ffd7e6]"></div>
                      <div className="absolute bottom-0 h-[45%] w-full rounded-[14px] bg-[#c5d4db]"></div>
                   </div>
                   {/* Col 2 */}
                   <div className="w-[42px] h-full relative">
                      <div className="absolute top-0 w-full h-[35%] rounded-[14px] bg-[repeating-linear-gradient(-45deg,#f3f4f6,#f3f4f6_4px,transparent_4px,transparent_8px)]"></div>
                      <div className="absolute bottom-[35%] h-[25%] w-full rounded-[14px] bg-[#ffd7e6]"></div>
                      <div className="absolute bottom-0 h-[30%] w-full rounded-[14px] bg-[#c5d4db]"></div>
                   </div>
                   {/* Col 3 */}
                   <div className="w-[42px] h-full relative">
                      <div className="absolute top-0 w-full h-[15%] rounded-[14px] bg-[repeating-linear-gradient(-45deg,#f3f4f6,#f3f4f6_4px,transparent_4px,transparent_8px)]"></div>
                      <div className="absolute bottom-[43%] h-[38%] w-full rounded-[14px] bg-[#ffd7e6] flex items-center justify-center">
                          <div className="bg-[#1c1c1e] text-white text-[10px] font-bold px-2 py-1 rounded-full w-min leading-none tracking-wide">87%</div>
                      </div>
                      <div className="absolute bottom-0 h-[40%] w-full rounded-[14px] bg-[#c5d4db] flex transition-all duration-300 relative justify-center">
                          <div className="absolute top-2 bg-[#1c1c1e] text-white text-[10px] font-bold px-2 py-1 rounded-full leading-none tracking-wide">37%</div>
                      </div>
                   </div>
                   {/* Col 4 */}
                   <div className="w-[42px] h-full relative">
                      <div className="absolute top-0 w-full h-[30%] rounded-[14px] bg-[repeating-linear-gradient(-45deg,#f3f4f6,#f3f4f6_4px,transparent_4px,transparent_8px)]"></div>
                      <div className="absolute bottom-[48%] h-[18%] w-full rounded-[14px] bg-[#ffd7e6]"></div>
                      <div className="absolute bottom-0 h-[45%] w-full rounded-[14px] bg-[#c5d4db]"></div>
                   </div>
                </div>
              </div>
              
              {/* X-axis */}
              <div className="flex justify-between pl-[42px] pr-2 text-[11px] font-semibold text-gray-400 mt-3 relative">
                 <span>27 Jun</span>
                 <span>28 Jun</span>
                 <span>29 Jun</span>
                 <span>30 Jun</span>
              </div>

              {/* Legend */}
              <div className="flex justify-center gap-6 mt-6 bg-gray-50/50 py-3.5 rounded-[16px]">
                <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-[#c5d4db]"></div>
                   <span className="text-[13px] font-semibold text-gray-500">Opérations</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-[#ffd7e6]"></div>
                   <span className="text-[13px] font-semibold text-gray-500">Transfert de données</span>
                </div>
              </div>
            </div>

            {/* Recommended for you */}
            <div>
              <h3 className="text-[19px] font-bold text-gray-900 tracking-tight mb-4">Recommandé pour vous</h3>
              <div className="flex gap-[14px]">
                {/* Community Card */}
                <div className="flex-1 bg-white rounded-[28px] p-6 flex flex-col items-center justify-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50 cursor-pointer hover:-translate-y-0.5 transition-transform">
                  <div className="w-14 h-14 rounded-full bg-[#fff0f5] flex items-center justify-center text-[#d184a2]">
                    <MessageSquare size={24} strokeWidth={2.5} />
                  </div>
                  <span className="text-[15px] font-bold text-gray-900">Communauté</span>
                </div>

                {/* Academy Card */}
                <div className="flex-1 bg-white rounded-[28px] p-6 flex flex-col items-center justify-center gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100/50 cursor-pointer hover:-translate-y-0.5 transition-transform">
                  <div className="w-14 h-14 rounded-full bg-[#f0f6f8] flex items-center justify-center text-[#7b9dae]">
                    <GraduationCap size={24} strokeWidth={2.5} />
                  </div>
                  <span className="text-[15px] font-bold text-gray-900">Académie</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
      </div>

      {/* Settings Side Drawer */}
      <ProfileSettingsDrawer 
        isOpen={isSettingsDrawerOpen} 
        onClose={() => setIsSettingsDrawerOpen(false)} 
        onNavigateInfo={() => {
          setIsSettingsDrawerOpen(false);
          if (onNavigateInfo) onNavigateInfo();
        }}
        onNavigatePortfolio={() => {
          setIsSettingsDrawerOpen(false);
          if (onNavigatePortfolio) onNavigatePortfolio();
        }}
        onNavigateSettings={() => {
          setIsSettingsDrawerOpen(false);
          if (onNavigateSettings) onNavigateSettings();
        }}
        onNavigateQRCode={() => {
          setIsSettingsDrawerOpen(false);
          if (onNavigateQRCode) onNavigateQRCode();
        }}
        onNavigateMap={() => {
          setIsSettingsDrawerOpen(false);
          if (onNavigateMap) onNavigateMap();
        }}
        onNavigateBalance={() => {
          setIsSettingsDrawerOpen(false);
          if (onNavigateBalance) onNavigateBalance();
        }}
        onNavigateNotifications={() => {
          setIsSettingsDrawerOpen(false);
          if (onNavigateNotifications) onNavigateNotifications();
        }}
        onNavigateCalendar={() => {
          setIsSettingsDrawerOpen(false);
          if (onNavigateCalendar) onNavigateCalendar();
        }}
        onNavigateStudio={() => {
          setIsSettingsDrawerOpen(false);
          if (onNavigateStudio) onNavigateStudio();
        }}
        role="promoter"
      />

      {/* Edit Profile Bottom Sheet */}
      <AnimatePresence>
        {isEditProfileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setIsEditProfileOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-[32px] pt-3 pb-8 px-6 shadow-[0_-15px_40px_rgba(0,0,0,0.12)] max-h-[85vh] overflow-y-auto hide-scrollbar"
            >
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[20px] font-bold text-gray-900">Modifier le profil</h2>
                <button 
                  onClick={() => setIsEditProfileOpen(false)}
                  className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm">
                      <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80" alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#4A90E2] text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      <Camera size={14} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Prénom</label>
                  <input type="text" value={editForm.firstName} onChange={(e) => setEditForm({...editForm, firstName: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-[15px] font-medium text-gray-900 focus:ring-2 focus:ring-[#4A90E2]/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Nom</label>
                  <input type="text" value={editForm.lastName} onChange={(e) => setEditForm({...editForm, lastName: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-[15px] font-medium text-gray-900 focus:ring-2 focus:ring-[#4A90E2]/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Profession</label>
                  <input type="text" value={editForm.profession} onChange={(e) => setEditForm({...editForm, profession: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-[15px] font-medium text-gray-900 focus:ring-2 focus:ring-[#4A90E2]/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Localisation</label>
                  <input type="text" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-[15px] font-medium text-gray-900 focus:ring-2 focus:ring-[#4A90E2]/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-2 block ml-1">Site Web</label>
                  <input type="text" value={editForm.website} onChange={(e) => setEditForm({...editForm, website: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-[15px] font-medium text-gray-900 focus:ring-2 focus:ring-[#4A90E2]/20 outline-none transition-all" />
                </div>
                {userProfile?.role === 'directeur' && (
                  <div>
                    <label className="text-[12px] font-bold text-[#4A90E2] uppercase tracking-wider mb-2 block ml-1">Code d'Accréditation</label>
                    <input type="text" value={editForm.accreditationCode} onChange={(e) => setEditForm({...editForm, accreditationCode: e.target.value})} placeholder="Ex: ACC-2026-XYZ" className="w-full bg-[#4A90E2]/5 border border-[#4A90E2]/20 rounded-2xl px-5 py-4 text-[15px] font-medium text-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/40 outline-none transition-all" />
                  </div>
                )}

                <div className="pt-4">
                  <button 
                    onClick={() => {
                      if (setUserProfile && userProfile) {
                        setUserProfile({
                          ...userProfile, 
                          firstName: editForm.firstName, 
                          lastName: editForm.lastName,
                          accreditationCode: editForm.accreditationCode
                        });
                        if (userProfile.role === 'directeur') {
                           localStorage.setItem('global_accreditation_code', editForm.accreditationCode);
                        }
                      }
                      setIsEditProfileOpen(false);
                    }}
                    className="w-full bg-[#111] text-white rounded-full py-4 text-[15px] font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
                  >
                    <Save size={18} />
                    Enregistrer les modifications
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Share Top Sheet */}
      <AnimatePresence>
        {isShareSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setIsShareSheetOpen(false)}
            />
            <motion.div
              initial={{ y: "-100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 left-0 right-0 z-50 bg-white rounded-b-[32px] pt-14 pb-8 px-6 shadow-[0_15px_40px_rgba(0,0,0,0.12)]"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[20px] font-bold text-gray-900 absolute left-0 right-0 text-center pointer-events-none">Partager le profil</h2>
                <div className="flex-1" />
                <button 
                  onClick={() => setIsShareSheetOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 text-gray-500 rounded-full hover:bg-gray-200 transition-colors z-10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-8 mt-4">
                <button className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 mb-1 hover:bg-gray-100 transition-colors shadow-sm border border-gray-100">
                    <Link2 size={22} />
                  </div>
                  <span className="text-[12px] font-semibold text-gray-600">Copier</span>
                </button>
                <button className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-[#F3F6FB] text-[#0077b5] rounded-full flex items-center justify-center mb-1 hover:bg-[#E8F0F7] transition-colors shadow-sm border border-[#0077b5]/10">
                    <Linkedin size={22} />
                  </div>
                  <span className="text-[12px] font-semibold text-gray-600">LinkedIn</span>
                </button>
                <button className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-[#F3FAFC] text-[#1DA1F2] rounded-full flex items-center justify-center mb-1 hover:bg-[#EAF5FA] transition-colors shadow-sm border border-[#1DA1F2]/10">
                    <Twitter size={22} />
                  </div>
                  <span className="text-[12px] font-semibold text-gray-600">Twitter</span>
                </button>
                <button className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 bg-[#FFF3F6] text-[#E1306C] rounded-full flex items-center justify-center mb-1 hover:bg-[#FCE7EF] transition-colors shadow-sm border border-[#E1306C]/10">
                    <Instagram size={22} />
                  </div>
                  <span className="text-[12px] font-semibold text-gray-600">Instagram</span>
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between border border-gray-100">
                <span className="text-[13px] text-gray-500 truncate mr-4">app.studiotaskup.com/profil</span>
                <button className="text-[14px] font-bold text-[#4A90E2] shrink-0" onClick={() => setIsShareSheetOpen(false)}>Copier lien</button>
              </div>
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-6" />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

