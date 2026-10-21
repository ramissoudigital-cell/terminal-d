import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  ChevronRight, 
  Sparkles, 
  User, 
  Briefcase, 
  ArrowLeft,
  Smartphone,
  ShieldCheck,
  Building2,
  Camera,
  Upload,
  Award,
  FileText,
  Plus,
  Trash2,
  Paperclip
} from 'lucide-react';

import { RegisteredUser } from '../types';

interface AuthViewProps {
  onBack: () => void;
  onSuccess: (role: 'client' | 'freelancer' | 'directeur', profile?: RegisteredUser) => void;
  initialRole: 'client' | 'freelancer' | 'directeur';
  onNavigatePrivacyPolicy?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onBack, onSuccess, initialRole, onNavigatePrivacyPolicy }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<'client' | 'freelancer' | 'directeur'>(initialRole);
  const [accreditationCode, setAccreditationCode] = useState('');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Additional registration fields state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [workStructure, setWorkStructure] = useState<'solo' | 'company'>('solo');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [skillTags, setSkillTags] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [idDocumentName, setIdDocumentName] = useState<string | null>(null);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);

  // Preset popular tags depending on status
  const presetTags = role === 'client' 
    ? ["Gestion de projet", "Rédaction", "UI/UX Design", "Développement", "Marketing", "Consulting"] 
    : role === 'directeur' ? ["Administration", "Gestion Scolaire", "Finances", "Ressources Humaines", "Pédagogie"] : ["Développement Web", "Logo Design", "Copywriting", "Création de Contenu", "SEO", "Montage Vidéo"];

  const handleToggleTag = (tag: string) => {
    playClickBeep();
    if (skillTags.includes(tag)) {
      setSkillTags(prev => prev.filter(t => t !== tag));
    } else {
      setSkillTags(prev => [...prev, tag]);
    }
  };

  const handleAddCustomTag = () => {
    if (customSkillInput.trim() && !skillTags.includes(customSkillInput.trim())) {
      playClickBeep();
      setSkillTags(prev => [...prev, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    playClickBeep();
    setSkillTags(prev => prev.filter(t => t !== tag));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
        playSwipeSuccessBeep();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdDocumentName(file.name);
      playSwipeSuccessBeep();
    }
  };
  
  // Custom Swipe state
  const [dragX, setDragX] = useState(0);
  const [isSwiped, setIsSwiped] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const sliderWidth = 280; // approximate width of track
  const handleWidth = 54;
  const maxDrag = sliderWidth - handleWidth - 12; // 12px padding balance

  const audioContextRef = useRef<AudioContext | null>(null);

  // Play micro beep for validation feedback
  const playSwipeSuccessBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 high note
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5 high beep
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Ignored
    }
  };

  const playClickBeep = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Ignored
    }
  };

  // Drag handler
  const handleDrag = (event: any, info: any) => {
    if (isSwiped) return;
    setDragX(info.offset.x);
    if (info.offset.x >= maxDrag - 6 && !isSwiped) {
      triggerSuccess();
    }
  };

  const handleDragEnd = (event: any, info: any) => {
    if (isSwiped) return;
    if (info.offset.x < maxDrag - 6) {
      // Bounce back automatically
      setDragX(0);
    }
  };

  const triggerSuccess = () => {
    if (activeTab === 'signup' && role === 'directeur') {
       const validCode = localStorage.getItem('global_accreditation_code');
       if (validCode && accreditationCode !== validCode) {
           alert("Code d'Accréditation invalide !");
           setIsSwiped(false);
           setDragX(0);
           return;
       }
    }
    setIsSwiped(true);
    setDragX(maxDrag);
    playSwipeSuccessBeep();
    setIsLoggingIn(true);
    
    const userProfile: RegisteredUser = {
      email: email || "user@example.com",
      firstName: activeTab === 'signup' ? (firstName || "Jean") : "Jean",
      lastName: activeTab === 'signup' ? (lastName || "Dupont") : "Dupont",
      username: activeTab === 'signup' ? (username || "jean_dupont") : "jean_dupont",
      workStructure: activeTab === 'signup' ? workStructure : "solo",
      bio: activeTab === 'signup' 
        ? (bio || "Aucune biographie fournie pour l'instant.") 
        : "Développeur passionné par la création d'applications modernes.",
      skills: activeTab === 'signup' 
        ? (skillTags.length > 0 ? skillTags : ["Développement Web", "Logo Design"]) 
        : ["Développement Web", "Logo Design", "SEO"],
      profilePhoto: activeTab === 'signup' ? profilePhoto : null,
      idDocumentName: activeTab === 'signup' ? idDocumentName : null,
      role: role,
      accreditationCode: activeTab === 'signup' && role === 'directeur' ? accreditationCode : undefined,
    };

    // Smooth transition simulation
    setTimeout(() => {
      onSuccess(role, userProfile);
    }, 1200);
  };

  // Toggle helpers
  const handleTabChange = (tab: 'login' | 'signup') => {
    playClickBeep();
    setActiveTab(tab);
    setDragX(0);
    setIsSwiped(false);
  };

  const handleRoleToggle = () => {
    playClickBeep();
    setRole(prev => prev === 'client' ? 'freelancer' : prev === 'freelancer' ? 'directeur' : 'client');
  };

  return (
    <div 
      id="auth-view-screen"
      className="relative flex flex-col justify-between h-full bg-[#FAFBFD] text-slate-800"
    >
      {/* Top Header Panel - styled identical to orange reference page but in blue */}
      <div 
        id="auth-banner-header"
        className="w-full bg-gradient-to-b from-[#4A90E2] to-[#357ABD] rounded-b-[40px] px-6 pt-10 pb-8 relative overflow-hidden shadow-[0_12px_32px_rgba(74,144,226,0.18)] flex flex-col justify-between shrink-0"
      >
        {/* Glow ambient background elements */}
        <div className="absolute top-[-40px] right-[-20px] w-48 h-48 bg-[#FFF]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-[-10px] left-[-30px] w-36 h-36 bg-[#4A90E2]/20 rounded-full blur-xl pointer-events-none" />

        {/* Top bar with back button & branding */}
        <div className="flex items-center justify-between w-full mb-6 z-10">
          <button 
            type="button"
            id="auth-back-button"
            onClick={onBack}
            className="w-9 h-9 items-center justify-center flex bg-white/15 hover:bg-white/25 active:scale-95 transition-all text-white rounded-full cursor-pointer focus:outline-none"
          >
            <ArrowLeft size={18} />
          </button>
          
          <span className="text-[14px] font-black tracking-widest text-[#FFF]/90 uppercase">
            TASKup
          </span>
          
          <div className="w-9 h-9" /> {/* Balancer */}
        </div>

        {/* Dynamic header content */}
        <div className="z-10 text-center relative px-2 mb-1">
          <AnimatePresence mode="wait">
            {activeTab === 'login' ? (
              <motion.div
                key="welcome-header"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/15 border border-white/20 rounded-full text-[11.5px] text-white font-extrabold tracking-wide uppercase shadow-sm mb-3">
                  <Smartphone size={12} /> Connexion Sécurisée
                </div>
                <h1 className="text-[26px] font-black text-white tracking-tight">Bon retour !</h1>
                <p className="text-[12px] text-sky-100 font-medium mt-1 w-full max-w-[270px] mx-auto leading-relaxed">
                  Connectez-vous pour continuer à gérer ou proposer vos services sur TASKup.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="create-header"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center"
              >
                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/15 border border-white/20 rounded-full text-[11.5px] text-white font-extrabold tracking-wide uppercase shadow-sm mb-3">
                  <Sparkles size={12} className="text-amber-300 animate-pulse" /> Nouvelle Expérience
                </div>
                <h1 className="text-[26px] font-black text-white tracking-tight">Créer un compte</h1>
                <p className="text-[12px] text-sky-100 font-medium mt-1 w-full max-w-[270px] mx-auto leading-relaxed">
                  Rejoignez notre communauté de confiance et profitez d'échanges simplifiés.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Form content wrapper */}
      <div id="auth-form-scroll-container" className="flex-1 overflow-y-auto px-6 py-6 hide-scrollbar flex flex-col justify-between">
        
        <div className="space-y-5.5">
          {/* USER SPECIFIED: Role Indicator shown right over the Login & Sign In switcher */}
          <div id="role-type-pill-container" className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase leading-none">
              VOTRE STATUT ACTUEL
            </span>
            <button
              onClick={handleRoleToggle}
              className="flex items-center gap-2 px-4.5 py-2 bg-gradient-to-r from-[#E4EFFF] to-[#F1F5F9] border border-[#4A90E2]/20 hover:border-[#4A90E2]/40 active:scale-98 transition-all rounded-full group cursor-pointer"
            >
              {role === 'client' ? (
                <>
                  <div className="w-2 h-2 bg-[#4A90E2] rounded-full animate-ping" />
                  <User size={13.5} className="text-[#4A90E2]" strokeWidth={2.5} />
                  <span className="text-[12px] font-extrabold text-[#4A90E2] group-hover:text-[#357ABD]">
                    Espace CLIENT
                  </span>
                </>
              ) : role === 'freelancer' ? (
                <>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                  <Briefcase size={13.5} className="text-emerald-500" strokeWidth={2.5} />
                  <span className="text-[12px] font-extrabold text-emerald-600 group-hover:text-emerald-700">
                    Espace PRESTATAIRE
                  </span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-ping" />
                  <User size={13.5} className="text-amber-500" strokeWidth={2.5} />
                  <span className="text-[12px] font-extrabold text-amber-600 group-hover:text-amber-700">
                    Espace DIRECTEUR
                  </span>
                </>
              )}
            </button>
            <p className="text-[9.5px] text-slate-400 font-bold tracking-wide italic">
              (Cliquez pour basculer facilement)
            </p>
          </div>

          {/* Log In & Sign In tabs container styled identically to the screenshot */}
          <div 
            id="auth-tabs-toggle-header"
            className="p-1 bg-slate-100 rounded-[20px] flex relative h-13 border border-slate-200/50"
          >
            <button 
              type="button"
              id="tab-login-btn"
              onClick={() => handleTabChange('login')}
              className={`flex-1 text-center font-bold text-[13.5px] rounded-[16px] flex items-center justify-center gap-2 relative z-10 transition-all duration-300 ${
                activeTab === 'login' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Connexion
            </button>
            
            <button 
              type="button"
              id="tab-signup-btn"
              onClick={() => handleTabChange('signup')}
              className={`flex-1 text-center font-bold text-[13.5px] rounded-[16px] flex items-center justify-center gap-2 relative z-10 transition-all duration-300 ${
                activeTab === 'signup' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Inscription
            </button>
            
            {/* White rounded pill indicator reproducing the orange references */}
            <motion.div 
              id="tab-active-indicator"
              className="absolute top-1 bottom-1 bg-white rounded-[16px] shadow-[0_3px_12px_rgba(0,0,0,0.06)] border border-slate-200/20 z-0"
              style={{ 
                width: 'calc(50% - 4px)',
              }}
              animate={{ 
                left: activeTab === 'login' ? '4px' : 'calc(50%)'
              }}
              transition={{ type: "spring", stiffness: 350, damping: 26 }}
            />
          </div>

          {/* Form input sections */}
          <div id="auth-fields-wrapper" className="space-y-4">
            
            {activeTab === 'login' ? (
              <div key="login-fields" className="space-y-4 animate-fade-in">
                {/* Email Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-bold text-slate-600 tracking-wide px-1">
                    Adresse e-mail
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4.5 text-slate-400 pointer-events-none">
                      <Mail size={17} />
                    </div>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Entrez votre email" 
                      className="w-full h-12 px-11.5 bg-white border border-slate-200/80 rounded-2xl text-[13.5px] focus:outline-none focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/10 transition-all font-medium text-slate-800 placeholder:text-slate-400/90 shadow-sm"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-bold text-slate-600 tracking-wide px-1">
                    Mot de passe
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4.5 text-slate-400 pointer-events-none">
                      <Lock size={17} />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Entrez votre mot de passe" 
                      className="w-full h-12 px-11.5 pr-12 bg-white border border-slate-200/80 rounded-2xl text-[13.5px] focus:outline-none focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/10 transition-all font-medium text-slate-800 placeholder:text-slate-400/90 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600 active:scale-95 transition-all focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between px-1 text-[11.5px] font-semibold mt-1">
                  <label className="flex items-center gap-1.5 text-slate-500 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={() => setRememberMe(!rememberMe)}
                      className="w-4 h-4 rounded border-slate-300/80 text-[#4A90E2] focus:ring-[#4A90E2]/20"
                    />
                    <span>Se souvenir de moi</span>
                  </label>
                  <button 
                    type="button" 
                    className="text-[#4A90E2] hover:text-[#357ABD] transition-colors focus:none font-bold"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              </div>
            ) : (
              <div key="signup-fields" className="space-y-4 animate-fade-in pb-2">
                
                {/* 1. Photo de profil */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-150 rounded-3xl gap-3">
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-none flex items-center gap-1">
                    <Camera size={12} className="text-[#4A90E2]" /> Photo de Profil
                  </span>
                  
                  <div className="relative">
                    <input 
                      type="file" 
                      ref={photoInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    
                    {profilePhoto ? (
                      <div className="relative w-22 h-22">
                        <img 
                          src={profilePhoto} 
                          alt="Profile Preview" 
                          referrerPolicy="no-referrer"
                          className="w-22 h-22 rounded-full object-cover border-2 border-[#4A90E2] shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => setProfilePhoto(null)}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow transition-all active:scale-90"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="w-22 h-22 rounded-full bg-white hover:bg-slate-100 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-200/80 hover:border-[#4A90E2] transition-all active:scale-95 cursor-pointer shadow-xs"
                      >
                        <Camera size={22} className="mb-1 text-slate-400" />
                        <span className="text-[9.5px] font-black uppercase text-slate-400 tracking-wider">Ajouter</span>
                      </button>
                    )}
                  </div>
                  <span className="text-[9.5px] text-slate-400 font-bold uppercase tracking-wide">JPEG, PNG ou WEBP</span>
                </div>

                {/* Code d'Accréditation (Directeur uniquement) */}
                {role === 'directeur' && (
                  <div className="flex flex-col gap-1.5 mb-2">
                    <label className="text-[12px] font-bold text-amber-600 tracking-wide px-1 flex items-center gap-1.5">
                      <Briefcase size={12} /> Code d'Accréditation Établissement
                    </label>
                    <input 
                      type="text" 
                      value={accreditationCode}
                      onChange={(e) => setAccreditationCode(e.target.value)}
                      placeholder="Ex: ACC-2026-XYZ"
                      className="w-full h-11.5 px-4 bg-amber-50/50 border border-amber-200/80 rounded-2xl text-[13px] focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 font-bold text-amber-800 placeholder:text-amber-400/80 shadow-sm"
                    />
                  </div>
                )}

                {/* 2. Nom & Prénom */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-600 tracking-wide px-1">
                      Nom
                    </label>
                    <input 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Dupont" 
                      className="w-full h-11.5 px-4 bg-white border border-slate-200/80 rounded-2xl text-[13px] focus:outline-none focus:border-[#4A90E2] font-semibold text-slate-800"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-600 tracking-wide px-1">
                      Prénom
                    </label>
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jean" 
                      className="w-full h-11.5 px-4 bg-white border border-slate-200/80 rounded-2xl text-[13px] focus:outline-none focus:border-[#4A90E2] font-semibold text-slate-800"
                    />
                  </div>
                </div>

                {/* 3. Pseudo */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-600 tracking-wide px-1">
                    Pseudo / Username
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4.5 text-[14px] font-extrabold text-slate-400 pointer-events-none">
                      @
                    </div>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="jean_dupont" 
                      className="w-full h-11.5 pl-9 pr-4 bg-white border border-slate-200/80 rounded-2xl text-[13px] focus:outline-none focus:border-[#4A90E2] font-semibold text-slate-800"
                    />
                  </div>
                </div>

                {/* 4. Structure de travail (Solo / Société) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-600 tracking-wide px-1">
                    Structure de Travail
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl h-11.5 border border-slate-200/50">
                    <button
                      type="button"
                      onClick={() => { playClickBeep(); setWorkStructure('solo'); }}
                      className={`rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-extrabold tracking-wide uppercase transition-all ${
                        workStructure === 'solo' 
                          ? 'bg-[#4A90E2] text-white shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <User size={13} strokeWidth={2.5} />
                      <span>Solo / Seul</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { playClickBeep(); setWorkStructure('company'); }}
                      className={`rounded-xl flex items-center justify-center gap-1.5 text-[11px] font-extrabold tracking-wide uppercase transition-all ${
                        workStructure === 'company' 
                          ? 'bg-[#4A90E2] text-white shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Building2 size={13} strokeWidth={2.5} />
                      <span>Entreprise</span>
                    </button>
                  </div>
                </div>

                {/* 5. Compétences (Skills) */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[12px] font-bold text-slate-600 tracking-wide">
                      Vos Compétences / Expertises
                    </label>
                    <span className="text-[9.5px] text-[#4A90E2] font-black bg-[#4A90E2]/10 px-2 py-0.5 rounded-full uppercase leading-none">
                      {skillTags.length} sélectionnée(s)
                    </span>
                  </div>
                  
                  {/* Preset quick tap suggestions */}
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200/50 rounded-2xl">
                    {presetTags.map((tag) => {
                      const isSelected = skillTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`px-2.5 py-1 rounded-xl text-[10.5px] font-bold border transition-all cursor-pointer flex items-center gap-1 leading-tight ${
                            isSelected 
                              ? 'bg-[#4A90E2] text-white border-[#4A90E2] shadow-sm' 
                              : 'bg-white text-slate-500 border-slate-200/60 hover:bg-slate-100/50'
                          }`}
                        >
                          {isSelected && <Check size={11} className="stroke-[3.5]" />}
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add custom tag */}
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomTag(); } }}
                      placeholder="Autre compétence (ex: Photoshop...)" 
                      className="flex-1 h-10 px-4 bg-white border border-slate-200/80 rounded-2xl text-[12.5px] focus:outline-none focus:border-[#4A90E2] font-medium text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomTag}
                      className="h-10 px-3 bg-[#4A90E2] text-white rounded-2xl hover:bg-[#357ABD] transition-all flex items-center justify-center cursor-pointer active:scale-95"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Tag List output */}
                  {skillTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1 select-none">
                      {skillTags.map(tag => (
                        <span 
                          key={tag} 
                          className="inline-flex items-center gap-1.5 pl-2.5 pr-2 py-1 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-xl text-[10.5px] font-black text-slate-700 shadow-3xs"
                        >
                          {tag}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveTag(tag)}
                            className="text-slate-400 hover:text-slate-600 transition-colors focus:none font-black text-[13px] leading-none"
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* 6. Bio / Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-600 tracking-wide px-1">
                    Bio / Description
                  </label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={200}
                    rows={3}
                    placeholder="Présentez-vous brièvement ou décrivez votre activité..." 
                    className="w-full p-4 bg-white border border-slate-200/80 rounded-2xl text-[13px] focus:outline-none focus:border-[#4A90E2] font-medium text-slate-800 placeholder:text-slate-400/90 shadow-sm leading-relaxed"
                  />
                  <div className="flex justify-end text-[9px] text-slate-400 font-extrabold uppercase tracking-widest px-1">
                    {bio.length}/200 caractères
                  </div>
                </div>

                {/* 7. Pièce d'identité (Optional / non obligatoire) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-[12px] font-bold text-slate-600 tracking-wide">
                      Pièce d'identité
                    </label>
                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 border border-amber-200/50 px-2.5 py-0.5 rounded-full uppercase tracking-wider leading-none">
                      Optionnel / Non Obligatoire
                    </span>
                  </div>

                  <input 
                    type="file" 
                    ref={idInputRef}
                    onChange={handleIdUpload}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                  />

                  {idDocumentName ? (
                    <div className="flex items-center justify-between p-3.5 bg-emerald-50/50 border border-emerald-300 rounded-2xl shadow-xs">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="p-2 bg-[#4A90E2] text-white rounded-xl">
                          <FileText size={16} />
                        </div>
                        <div className="flex flex-col overflow-hidden text-left">
                          <span className="text-[12px] font-bold text-slate-700 truncate max-w-[170px]">{idDocumentName}</span>
                          <span className="text-[10px] text-emerald-600 font-extrabold uppercase leading-none mt-1">Prêt au transfert</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIdDocumentName(null)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors active:scale-95"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => idInputRef.current?.click()}
                      className="w-full h-24 rounded-2xl bg-slate-50 hover:bg-slate-100/60 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 transition-all active:scale-99 hover:border-[#4A90E2]/40 group cursor-pointer"
                    >
                      <Upload size={20} className="mb-1 text-slate-400 group-hover:text-[#4A90E2] transition-colors" />
                      <span className="text-[11px] font-extrabold text-slate-500 group-hover:text-slate-800 transition-colors">Déposer ou sélectionner l'ID</span>
                      <span className="text-[9.5px] text-slate-400 font-bold tracking-wide mt-0.5 uppercase">PDF, PNG, JPG (Max 10Mo)</span>
                    </button>
                  )}
                </div>

                {/* 8. Séparateur identifiants de compte */}
                <div className="flex items-center gap-2.5 pt-3.5 pb-1">
                  <div className="h-[1px] bg-slate-200 flex-1" />
                  <span className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">
                    Identifiants de Connexion
                  </span>
                  <div className="h-[1px] bg-slate-200 flex-1" />
                </div>

                {/* Email Field info */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-bold text-slate-600 tracking-wide px-1">
                    Adresse e-mail
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4.5 text-slate-400 pointer-events-none">
                      <Mail size={17} />
                    </div>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Entrez votre email" 
                      className="w-full h-12 px-11.5 bg-white border border-slate-200/80 rounded-2xl text-[13.5px] focus:outline-none focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/10 transition-all font-medium text-slate-800 placeholder:text-slate-400/90 shadow-sm"
                    />
                  </div>
                </div>

                {/* Password Field info */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-bold text-slate-600 tracking-wide px-1">
                    Mot de passe
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4.5 text-slate-400 pointer-events-none">
                      <Lock size={17} />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Entrez votre mot de passe" 
                      className="w-full h-12 px-11.5 pr-12 bg-white border border-slate-200/80 rounded-2xl text-[13.5px] focus:outline-none focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/10 transition-all font-medium text-slate-800 placeholder:text-slate-400/90 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-slate-400 hover:text-slate-600 active:scale-95 transition-all focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Password Confirmation field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12.5px] font-bold text-slate-600 tracking-wide px-1">
                    Confirmation du mot de passe
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-4.5 text-slate-300 pointer-events-none">
                      <Lock size={17} />
                    </div>
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirmez votre mot de passe" 
                      className="w-full h-12 px-11.5 pr-12 bg-white border border-slate-200/80 rounded-2xl text-[13.5px] focus:outline-none focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/10 transition-all font-medium text-slate-800 placeholder:text-slate-400/90 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 text-slate-300 hover:text-slate-600 active:scale-95 transition-all focus:outline-none cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* Bottom interactive elements: Swipe Button, Social Login, Switcher */}
        <div className="mt-8 space-y-6.5">
          
          {/* Swipe Interactive Slider! - EXACT replicate of the screenshot slider but in Blue color theme */}
          <div className="flex justify-center flex-col items-center">
            
            <div 
              id="swipe-slider-track"
              onClick={() => { if (!isSwiped) triggerSuccess(); }}
              className={`relative h-15 rounded-full p-1.5 flex items-center overflow-hidden transition-all duration-300 cursor-pointer ${
                isSwiped 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_4px_18px_rgba(16,185,129,0.3)]' 
                  : 'bg-gradient-to-r from-[#4A90E2] to-[#357ABD] shadow-[0_6px_22px_rgba(74,144,226,0.22)]'
              }`}
              style={{ width: `${sliderWidth}px` }}
            >
              {/* Dynamic text inside */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 pl-6">
                <span className="text-[12.5px] font-black tracking-widest text-[#FFF] uppercase italic">
                  {isLoggingIn 
                    ? "Initialisation..." 
                    : isSwiped 
                      ? "Succès !" 
                      : activeTab === 'login' 
                        ? "Glisser pour vous connecter" 
                        : "Glisser pour s'inscrire"
                  }
                </span>
              </div>

              {/* Shading/glow on progress */}
              <div 
                className="absolute left-0 top-0 bottom-0 bg-white/10 pointer-events-none transition-all duration-100 ease-out" 
                style={{ width: `${Math.max(handleWidth, dragX + handleWidth + 6)}px` }}
              />

              {/* Handle with custom framer-motion drag controls */}
              <motion.div
                id="swipe-slider-handle"
                drag="x"
                dragElastic={0}
                dragMomentum={false}
                dragConstraints={{ left: 0, right: maxDrag }}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                animate={{ x: dragX }}
                className={`w-[48px] h-[48px] rounded-full bg-white text-[#4A90E2] flex items-center justify-center shadow-[0_3px_10px_rgba(0,0,0,0.15)] z-20 cursor-grab active:cursor-grabbing transition-colors duration-300`}
                style={{ position: 'absolute', left: '6px' }}
              >
                {isSwiped ? (
                  <Check size={20} className="text-emerald-500 stroke-[3.5]" />
                ) : (
                  <div className="flex items-center gap-0.5 text-[#4A90E2]">
                    <ChevronRight size={15} strokeWidth={3} />
                    <ChevronRight size={15} strokeWidth={3} className="opacity-70 -ml-1.5" />
                    <ChevronRight size={15} strokeWidth={3} className="opacity-40 -ml-1.5" />
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Status bar secure text under slider */}
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-3">
              <ShieldCheck size={12} className="text-[#4A90E2]" /> Sécurisé par chiffrement TASKup
            </span>
          </div>

          {/* Social Logins */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-center gap-3">
              <div className="h-[1px] bg-slate-200 flex-1" />
              <span className="text-[10.5px] font-extrabold text-slate-400 tracking-wider uppercase">
                Ou continuer avec
              </span>
              <div className="h-[1px] bg-slate-200 flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {/* Google login icon */}
              <button 
                type="button" 
                onClick={triggerSuccess}
                className="h-12 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-center gap-2.5 hover:bg-slate-100/60 active:scale-98 transition-all cursor-pointer focus:outline-none"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-[13px] font-bold text-slate-700">Google</span>
              </button>

              {/* Apple login icon */}
              <button 
                type="button" 
                onClick={triggerSuccess}
                className="h-12 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-center gap-2.5 hover:bg-slate-100/60 active:scale-98 transition-all cursor-pointer focus:outline-none"
              >
                <svg className="w-4.5 h-4.5 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.63.73-1.18 1.87-1.03 2.98.12.01 1.34 0 2.98-1.42z"/>
                </svg>
                <span className="text-[13px] font-bold text-slate-700">Apple</span>
              </button>
            </div>
          </div>

          {/* Footer switcher linking register <--> sign in */}
          <div className="text-center font-semibold text-[12.5px] text-slate-500 pt-1 pb-2">
            <AnimatePresence mode="wait">
              {activeTab === 'login' ? (
                <motion.div
                  key="signup-switcher"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  <div>
                    Pas encore de compte ?{' '}
                    <button 
                      type="button" 
                      onClick={() => handleTabChange('signup')}
                      className="text-[#4A90E2] font-extrabold hover:underline"
                    >
                      Créer un compte
                    </button>
                  </div>
                  <div className="text-[10.5px] leading-snug font-medium text-slate-400 px-6">
                    En continuant, vous acceptez nos <span className="text-[#4A90E2] font-bold">Conditions</span> et{' '}
                    <button type="button" onClick={onNavigatePrivacyPolicy} className="text-[#4A90E2] font-bold hover:underline">
                      Politique de confidentialité
                    </button>.
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="login-switcher"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3"
                >
                  <div>
                    Déjà un compte ?{' '}
                    <button 
                      type="button" 
                      onClick={() => handleTabChange('login')}
                      className="text-[#4A90E2] font-extrabold hover:underline"
                    >
                      Se connecter
                    </button>
                  </div>
                  <div className="text-[10.5px] leading-snug font-medium text-slate-400 px-6">
                    En créant un compte, vous acceptez nos <span className="text-[#4A90E2] font-bold">Conditions</span> et{' '}
                    <button type="button" onClick={onNavigatePrivacyPolicy} className="text-[#4A90E2] font-bold hover:underline">
                      Politique de confidentialité
                    </button>.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

      {/* Standard legal small stamp */}
      <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase text-center mt-auto pb-4 shrink-0 pointer-events-none">
        TASKup SAFE SPACE • SECURED BY ECOSYSTEM
      </span>
    </div>
  );
};
