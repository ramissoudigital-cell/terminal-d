import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  Check, 
  ChevronDown, 
  Clock, 
  Sparkles, 
  MapPin, 
  Star, 
  Award, 
  Info,
  ArrowUpRight,
  MessageSquare,
  FileText,
  BadgePercent,
  Plus,
  Image,
  Video,
  Trash2,
  Film,
  UploadCloud,
  Play,
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CreateTaskProps {
  onBack: () => void;
  onNavigateCalendar?: () => void;
}

const CATEGORIES = [
  'Éducation', 'Artisanat', 'Informatique', 'Réparation', 'Beauté',
  'Transport', 'Bien-être', 'Événementiel', 'Déménagement', 'Nettoyage',
  'Bricolage', 'Photographie', 'Architecture', 'Jardinage', 'Soutien scolaire',
  'Rédaction', 'Vidéo', 'Sécurité', 'Plomberie', 'Électricité',
  'Design', 'Marketing', 'Traduction', 'Coaching', "Garde d'enfants",
  'Musique', 'Comptabilité', 'Droit', 'Cuisine', 'Sport'
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'Éducation': { bg: '#E0F2FE', text: '#0EA5E9' },
  'Artisanat': { bg: '#FEF3C7', text: '#D97706' },
  'Informatique': { bg: '#F3E8FF', text: '#A855F7' },
  'Réparation': { bg: '#FEE2E2', text: '#EF4444' },
  'Beauté': { bg: '#FCE7F3', text: '#EC4899' },
  'Transport': { bg: '#E0E7FF', text: '#6366F1' },
  'Bien-être': { bg: '#D1FAE5', text: '#10B981' },
  'Événementiel': { bg: '#FEF08A', text: '#EAB308' },
  'Déménagement': { bg: '#FFEDD5', text: '#F97316' },
  'Nettoyage': { bg: '#E2FBE9', text: '#22C55E' },
  'Bricolage': { bg: '#F1F5F9', text: '#64748B' },
  'Photographie': { bg: '#EDE9FE', text: '#8B5CF6' },
  'Architecture': { bg: '#CFFAFE', text: '#06B6D4' },
  'Jardinage': { bg: '#DCFCE7', text: '#22C55E' },
  'Soutien scolaire': { bg: '#FFF4E5', text: '#F97316' },
  'Rédaction': { bg: '#F3F4F6', text: '#4B5563' },
  'Vidéo': { bg: '#FEF9C3', text: '#EAB308' },
  'Sécurité': { bg: '#FEE2E2', text: '#B91C1C' },
  'Plomberie': { bg: '#DBEAFE', text: '#2563EB' },
  'Électricité': { bg: '#FEF08A', text: '#CA8A04' },
  'Design': { bg: '#E4EFFF', text: '#3B82F6' },
  'Marketing': { bg: '#FCE7F3', text: '#DB2777' },
  'Traduction': { bg: '#E0E7FF', text: '#4F46E5' },
  'Coaching': { bg: '#D1FAE5', text: '#059669' },
  "Garde d'enfants": { bg: '#FFE4E6', text: '#E11D48' },
  'Musique': { bg: '#F3E8FF', text: '#9333EA' },
  'Comptabilité': { bg: '#F1F5F9', text: '#475569' },
  'Droit': { bg: '#E2E8F0', text: '#334155' },
  'Cuisine': { bg: '#FFEDD5', text: '#EA580C' },
  'Sport': { bg: '#DCFCE7', text: '#16A34A' }
};

export const CreateTask: React.FC<CreateTaskProps> = ({ onBack, onNavigateCalendar }) => {
  // Step State: 'edit' or 'preview' or 'success'
  const [step, setStep] = useState<'edit' | 'preview' | 'success'>('edit');
  
  // Selected publishing role mode: 'client' (Besoin/Mission) or 'freelancer' (Service/Offre)
  const [role, setRole] = useState<'client' | 'freelancer'>('client');

  // Client Specific States
  const [clientTitle, setClientTitle] = useState("Soutien et préparation d'examen de Maths");
  const [clientCategory, setClientCategory] = useState("Soutien scolaire");
  const [clientBudget, setClientBudget] = useState(150);
  const [clientDate, setClientDate] = useState("18/06/2026");
  const [clientDescription, setClientDescription] = useState(
    "Recherche un étudiant ou professeur pour aider mon fils en classe de Seconde à s'entraîner sur les équations et la géométrie d'ici son contrôle final de fin d'année."
  );

  // Freelancer Specific States
  const [freeTitle, setFreeTitle] = useState("Service expert de création de Logo & Identité Visuelle");
  const [freeCategory, setFreeCategory] = useState("UI/UX Designer");
  const [freeBudget, setFreeBudget] = useState(250);
  const [freeDate, setFreeDate] = useState("3 jours ouvrés");
  const [freeDescription, setFreeDescription] = useState(
    "Je propose la création de votre identité de marque moderne et percutante. Ce package comprend : un logo vectoriel déclinable, une palette de couleurs professionnelle, des typographies complémentaires, les fichiers sources haute-définition (SVG/Figma) et des révisions pour un résultat impeccable."
  );

  // Read/write proxies matching currently active role
  const title = role === 'client' ? clientTitle : freeTitle;
  const setTitle = role === 'client' ? setClientTitle : setFreeTitle;

  const category = role === 'client' ? clientCategory : freeCategory;
  const setCategory = role === 'client' ? setClientCategory : setFreeCategory;

  const budget = role === 'client' ? clientBudget : freeBudget;
  const setBudget = role === 'client' ? setClientBudget : setFreeBudget;

  const date = role === 'client' ? clientDate : freeDate;
  const setDate = role === 'client' ? setClientDate : setFreeDate;

  const description = role === 'client' ? clientDescription : freeDescription;
  const setDescription = role === 'client' ? setClientDescription : setFreeDescription;

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  
  // Optional photo/video upload states
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRESET_MEDIA = [
    { name: 'Ménage', url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600', type: 'image' as const },
    { name: 'Étude scolaire', url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=600', type: 'image' as const },
    { name: 'Jardinage & Cour', url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80&w=600', type: 'image' as const },
    { name: 'Design graphique', url: 'https://images.unsplash.com/photo-1541462608141-2ff01dd914e0?auto=format&fit=crop&q=80&w=600', type: 'image' as const },
    { name: 'Exemple Vidéo (Tuto)', url: 'https://assets.mixkit.co/videos/preview/mixkit-tutoring-a-young-boy-in-the-kitchen-41724-large.mp4', type: 'video' as const },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isVideo = file.type.startsWith('video/');
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
      setMediaType(isVideo ? 'video' : 'image');
    }
  };

  const selectPreset = (url: string, type: 'image' | 'video') => {
    setMediaUrl(url);
    setMediaType(type);
  };

  const removeMedia = () => {
    setMediaUrl(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Derive colors based on category
  const colorInfo = CATEGORY_COLORS[category] || { bg: '#E2E8F0', text: '#64748B' };

  const handlePublish = () => {
    // Generate simulated new publication
    const newPub = {
      id: `custom-pub-${Date.now()}`,
      title,
      category,
      categoryColor: colorInfo.bg,
      budget,
      date,
      author: {
        name: role === 'client' ? 'Gabriel J. (Moi)' : 'Gabriel J. (Moi) • Prestataire',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
        rating: 5.0,
        location: 'Paris, FR'
      },
      description,
      status: 'Active' as const,
      proposalsCount: 0,
      mediaUrl: mediaUrl || undefined,
      mediaType: mediaType || undefined,
      authorRole: role
    };

    // Save into localStorage
    try {
      const stored = localStorage.getItem('user_publications');
      const existing = stored ? JSON.parse(stored) : [];
      localStorage.setItem('user_publications', JSON.stringify([newPub, ...existing]));
    } catch (e) {
      console.error("Failed to save publication to localStorage", e);
    }

    // Go to success screen
    setStep('success');
  };

  return (
    <div className="flex flex-col bg-[#F0F8FF] min-h-full pb-28 relative overflow-x-hidden">
      
      {/* Top Banner Background for mood matching */}
      <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-[#4A90E2]/15 to-transparent pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === 'edit' && (
          <motion.div 
            key="edit-form"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="flex flex-col"
          >
            {/* Header */}
            <header className="px-6 pt-[60px] pb-5 flex items-center justify-between relative z-10 bg-white rounded-b-[2rem] shadow-sm">
              <button 
                onClick={onBack} 
                className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100/50 flex items-center justify-center text-slate-800 active:scale-95 transition-transform"
              >
                <ArrowLeft className="w-5 h-5 stroke-[1.8]" />
              </button>
              <div className="flex flex-col items-center">
                <h1 className="text-lg font-extrabold text-[#2D3142] tracking-tight font-sans">
                  {role === 'client' ? 'Publier un besoin' : 'Proposer mon service'}
                </h1>
                <p className="text-[#888891] text-[0.65rem] font-bold uppercase tracking-wider mt-0.5">Étape 1 sur 2</p>
              </div>
              <button 
                onClick={onNavigateCalendar}
                className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center hover:bg-[#4A90E2]/10 transition-colors"
              >
                <CalendarDays className="w-5 h-5 text-[#4A90E2] stroke-[1.8]" />
              </button>
            </header>

            {/* Editable Form Fields */}
            <div className="px-6 mt-6 flex flex-col gap-6">
              
              {/* Client vs Freelancer custom visual Tabs Toggle */}
              <div className="p-1 bg-slate-100 rounded-2xl flex relative h-12 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] border border-slate-200/20 shrink-0">
                <button 
                  type="button"
                  onClick={() => setRole('client')}
                  className={`flex-1 text-center font-bold text-[0.78rem] rounded-xl relative z-10 transition-colors duration-300 ${role === 'client' ? 'text-slate-800' : 'text-slate-400'}`}
                >
                  Client (Publier un besoin)
                </button>
                <button 
                  type="button"
                  onClick={() => setRole('freelancer')}
                  className={`flex-1 text-center font-bold text-[0.78rem] rounded-xl relative z-10 transition-colors duration-300 ${role === 'freelancer' ? 'text-slate-800' : 'text-slate-400'}`}
                >
                  Prestataire (Publier un service)
                </button>
                
                <motion.div 
                  className="absolute top-1 bottom-1 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] z-0"
                  style={{ 
                    width: 'calc(50% - 4px)',
                    left: role === 'client' ? '4px' : '50%'
                  }}
                  animate={{ left: role === 'client' ? '4px' : '50%' }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                />
              </div>

              {/* Profile Bar indicator */}
              <div className="flex items-center gap-3 bg-white p-3.5 rounded-3xl border border-slate-100/60 shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" 
                  alt="Gabriel" 
                  className="w-10 h-10 rounded-full object-cover border border-slate-50" 
                />
                <div className="flex flex-col">
                  <span className="text-[#888891] text-[0.6rem] font-bold uppercase tracking-wide">Identité connectée</span>
                  <span className="text-slate-800 text-[0.82rem] font-extrabold leading-tight">Gabriel J. (Moi)</span>
                  <span className="text-[#4A90E2] text-[0.58rem] font-extrabold uppercase mt-0.5">
                    Mode : {role === 'client' ? 'Client Recruteur' : 'Prestataire'}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100/50">
                  <span className="text-emerald-700 font-bold text-[0.68rem]">Budget estimé : {budget} €</span>
                </div>
              </div>

              {/* Title Section */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-500 text-[0.75rem] font-extrabold uppercase tracking-wider ml-1">
                  {role === 'client' ? "Titre de l'annonce d'aide" : "Titre de votre offre de service"}
                </label>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)] px-4.5 py-3.5 focus-within:border-[#4A90E2] transition-colors">
                  <input 
                    type="text" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={role === 'client' ? "Soutien scolaire, ménage, réparation..." : "Création de logo pro, montage de vidéo youtube, cours de guitare..."}
                    className="w-full bg-transparent border-none outline-none text-[#2D3142] font-semibold text-[0.85rem] placeholder-slate-300"
                  />
                </div>
              </div>

              {/* Category Dropdown Section */}
              <div className="flex flex-col gap-2 relative">
                <label className="text-slate-500 text-[0.75rem] font-extrabold uppercase tracking-wider ml-1">Catégorie principale</label>
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between text-left shadow-sm active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-center gap-2.5">
                    <div 
                      className="w-3.5 h-3.5 rounded-full" 
                      style={{ backgroundColor: colorInfo.text }} 
                    />
                    <span className="text-slate-700 text-[0.82rem] font-bold">{category}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showCategoryDropdown && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-[80px] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-0.5 max-h-56 overflow-y-auto"
                    >
                      {CATEGORIES.map(cat => {
                        const styleInfo = CATEGORY_COLORS[cat];
                        return (
                          <button
                            key={cat}
                            onClick={() => {
                              setCategory(cat);
                              setShowCategoryDropdown(false);
                            }}
                            className="w-full text-left font-bold text-[0.8rem] text-slate-600 hover:text-slate-900 hover:bg-slate-50 py-3 px-4 rounded-xl flex items-center justify-between transition"
                          >
                            <span>{cat}</span>
                            {category === cat ? (
                              <Check className="w-4 h-4 text-[#4A90E2] stroke-[2.5]" />
                            ) : (
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: styleInfo?.text }} />
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Budget points control */}
              <div className="flex flex-col gap-2 bg-white rounded-3xl p-5 border border-slate-100/80 shadow-sm relative">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[0.75rem] font-extrabold uppercase tracking-wider">
                      {role === 'client' ? "Budget maximum alloué" : "Tarif de votre service"}
                    </span>
                    <span className="text-slate-400 text-[0.62rem] font-bold">10 € minimum</span>
                  </div>
                  <span className="text-emerald-600 font-extrabold text-lg">{budget} €</span>
                </div>

                <div className="relative h-6 w-full flex items-center px-1">
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#4A90E2]"
                  />
                </div>
                
                <div className="flex justify-between text-[#888891] text-[0.6rem] font-extrabold px-1">
                  <span>10 €</span>
                  <span>500 €</span>
                  <span>1000 €</span>
                </div>
              </div>

              {/* Date Limite Row */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-500 text-[0.75rem] font-extrabold uppercase tracking-wider ml-1">
                  {role === 'client' ? "Date d'exécution souhaitée" : "Délai moyen de livraison"}
                </label>
                <div className="bg-white rounded-2xl border border-slate-100 px-4.5 py-3.5 flex items-center justify-between shadow-sm">
                  <input 
                    type="text" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)}
                    placeholder={role === 'client' ? "e.g. 18/06/2026" : "e.g. 3 jours, sous une semaine..."}
                    className="bg-transparent border-none outline-none text-[#2D3142] font-semibold text-[0.82rem] w-full"
                  />
                  <Calendar className="w-4 h-4 text-[#4A90E2] shrink-0 stroke-[2.2]" />
                </div>
              </div>

              {/* Description TextArea */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-500 text-[0.75rem] font-extrabold uppercase tracking-wider ml-1">
                  {role === 'client' ? "Description de la tâche requise" : "Présentez ce qui est inclus dans votre service"}
                </label>
                <div className="bg-white rounded-3xl border border-slate-100 p-4.5 shadow-sm focus-within:border-[#4A90E2] transition-colors font-sans">
                  <textarea 
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={role === 'client' ? "Indiquez tous les détails de vos besoins pour que les Doers comprennent bien la mission..." : "Présentez vos compétences, vos outils, le livrable et pourquoi vous choisir..."}
                    className="w-full bg-transparent border-none outline-none text-slate-700 text-[0.8rem] font-medium leading-[1.65] resize-none whitespace-pre-line placeholder-slate-300"
                  />
                </div>
              </div>

              {/* Photo & Vidéo Section (Optionnel / Facultatif) */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-slate-500 text-[0.75rem] font-extrabold uppercase tracking-wider">Photo ou vidéo d'illustration</label>
                  <span className="text-slate-400 text-[0.62rem] font-bold bg-slate-100 px-2 py-0.5 rounded-full uppercase">Facultatif</span>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  className="hidden" 
                />

                {!mediaUrl ? (
                  <div className="flex flex-col gap-3">
                    {/* Upload Card Dropzone */}
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-[#4A90E2]/60 hover:bg-[#4A90E2]/5 transition-all bg-white rounded-3xl p-6 text-center flex flex-col items-center justify-center gap-2 cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#E4EFFF]/60 flex items-center justify-center text-[#4A90E2] mb-1">
                        <UploadCloud className="w-5 h-5 stroke-[2]" />
                      </div>
                      <span className="text-slate-700 text-[0.8rem] font-bold">Importer une photo / vidéo</span>
                      <p className="text-slate-400 text-[0.65rem] font-medium leading-[1.3] max-w-[240px]">
                        Ajoutez une image ou vidéo d'un projet précédent ou du lieu d'intervention.
                      </p>
                    </div>

                    {/* Presets List */}
                    <div className="flex flex-col gap-1.5 mt-1">
                      <span className="text-[#888891] text-[0.6rem] font-extrabold uppercase tracking-wider ml-1">Ou tester rapidement avec un exemple :</span>
                      <div className="flex gap-2 overflow-x-auto pb-1.5 hide-scrollbar">
                        {PRESET_MEDIA.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => selectPreset(preset.url, preset.type)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-100 hover:bg-slate-50 rounded-2xl text-[0.68rem] font-bold text-slate-600 shadow-sm shrink-0 transition active:scale-95"
                          >
                            {preset.type === 'video' ? (
                              <Film className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            ) : (
                              <Image className="w-3.5 h-3.5 text-[#3B82F6] shrink-0" />
                            )}
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Active Media Preview Thumbnail */
                  <div className="relative bg-slate-900 rounded-[2rem] overflow-hidden shadow-md border border-slate-100/10 h-44 flex items-center justify-center">
                    
                    {mediaType === 'image' ? (
                      <img 
                        src={mediaUrl} 
                        alt="Aperçu annonce" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full relative">
                        <video 
                          src={mediaUrl} 
                          autoPlay 
                          loop 
                          muted 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/60 text-white text-[0.6rem] font-bold uppercase flex items-center gap-1 backdrop-blur-sm">
                          <Film className="w-2.5 h-2.5 text-amber-400 fill-amber-400" /> Vidéo
                        </div>
                      </div>
                    )}

                    {/* Trash remove button overlay */}
                    <button
                      type="button"
                      onClick={removeMedia}
                      className="absolute top-3 right-3 w-8 w-8 rounded-full bg-black/50 hover:bg-red-500/90 text-white flex items-center justify-center backdrop-blur-md transition-colors active:scale-90 shadow-sm"
                      style={{ width: '32px', height: '32px' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Action Button: Go to Preview Mode */}
              <button
                onClick={() => setStep('preview')}
                className="w-full bg-slate-900 text-white font-extrabold text-[0.82rem] py-4 rounded-2xl flex items-center justify-center gap-2 mt-2 shadow-[0_8px_20px_rgba(15,23,42,0.15)] active:scale-[0.99] transition duration-200"
              >
                <span>Continuer vers l'Aperçu</span>
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
              </button>

            </div>
          </motion.div>
        )}

        {step === 'preview' && (
          <motion.div 
            key="preview-flow"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            className="flex flex-col"
          >
            {/* Header */}
            <header className="px-6 pt-[60px] pb-5 flex items-center justify-between relative z-10 bg-white rounded-b-[2rem] shadow-sm">
              <button 
                onClick={() => setStep('edit')} 
                className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100/50 flex items-center justify-center text-slate-800 active:scale-95 transition-transform"
              >
                <ArrowLeft className="w-5 h-5 stroke-[1.8]" />
              </button>
              <div className="flex flex-col items-center">
                <h1 className="text-lg font-extrabold text-[#2D3142] tracking-tight font-sans text-center">Prévisualisation</h1>
                <p className="text-emerald-600 text-[0.65rem] font-bold uppercase tracking-wider mt-0.5">Étape 2 sur 2 • Finalisation</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#E2FBE9] flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-600 stroke-[2.5]" />
              </div>
            </header>

            {/* Preview Banner info */}
            <div className="px-6 mt-6 flex flex-col gap-6">
              
              <div className="bg-[#E4EFFF]/40 border border-[#4A90E2]/10 rounded-2xl p-4 flex gap-3 text-[#4A90E2]">
                <Info className="w-5 h-5 shrink-0 stroke-[2]" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[0.8rem] font-extrabold tracking-tight">Rendu en temps réel</span>
                  <span className="text-[0.72rem] leading-[1.4] opacity-90 font-medium">
                    {role === 'client' 
                      ? "C'est exactement ainsi que votre carte de besoin sera affichée à l'ensemble des Doers dans la liste des publications pour qu'ils puissent y postuler." 
                      : "C'est ainsi que votre offre de service s'affichera auprès de tous les recruteurs pour qu'ils puissent commander directement votre prestation."}
                  </span>
                </div>
              </div>

              {/* High Fidelity Feed Card Render Mockup */}
              <div className="flex flex-col gap-2">
                <span className="text-slate-400 text-[0.68rem] font-extrabold uppercase tracking-wide ml-1">Aperçu du Flux</span>
                
                <div className="bg-white rounded-[2.2rem] p-6.5 shadow-[0_4px_25px_rgba(33,46,83,0.04)] border border-slate-100 flex flex-col gap-4 relative overflow-hidden">
                  
                  {/* Glowing subtle ring indicating draft/live preview status */}
                  <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-radial from-[#4A90E2]/10 to-transparent pointer-events-none" />

                  {/* Card Header Profile */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <img 
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150" 
                        alt="Auteur" 
                        className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm" 
                      />
                      <div className="flex flex-col">
                        <span className="text-slate-800 text-[0.85rem] font-bold leading-tight">
                          Gabriel J. (Moi) <span className="text-[0.7rem] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded ml-1 uppercase font-extrabold">{role === 'client' ? 'Client' : 'Prestataire'}</span>
                        </span>
                        <div className="flex items-center gap-1.5 text-[#888891] text-[0.68rem] font-medium leading-[1.4]">
                          <MapPin className="w-3 h-3" />
                          <span>Paris, FR</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-[#F5C453] font-bold">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            5.0
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Category tag */}
                    <span 
                      className="px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wide"
                      style={{ 
                        backgroundColor: colorInfo.bg + '35',
                        color: colorInfo.text
                      }}
                    >
                      {category}
                    </span>
                  </div>

                  {/* Divider line */}
                  <div className="h-[1px] w-full bg-slate-100"></div>

                  {/* Body Title & Desc */}
                  <div className="flex flex-col gap-1.5 text-left">
                    <h3 className="text-[#2D3142] text-[0.95rem] font-bold tracking-tight pr-2 line-clamp-1">{title || "Sans titre"}</h3>
                    <p className="text-slate-500 text-[0.78rem] leading-[1.5] font-medium line-clamp-3">{description || "Aucune description fournie."}</p>
                  </div>

                  {/* Optional Media Preview within outer card */}
                  {mediaUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-100/50 relative h-36 w-full -mt-1 shadow-sm bg-slate-900 flex items-center justify-center">
                      {mediaType === 'image' ? (
                        <img 
                          src={mediaUrl} 
                          alt="Illustration d'annonce" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full relative">
                          <video 
                            src={mediaUrl} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[0.55rem] font-bold uppercase tracking-wider">
                            Vidéo
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info Row */}
                  <div className="flex items-center justify-between mt-1 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4 text-left">
                      {/* Budget */}
                      <div className="flex flex-col">
                        <span className="text-[#888891] text-[0.6rem] font-semibold uppercase tracking-wider">
                          {role === 'client' ? 'Budget' : 'Tarif Service'}
                        </span>
                        <span className="text-emerald-600 font-extrabold text-[0.95rem] tracking-tight">{budget} €</span>
                      </div>
                     
                      {/* Deadline */}
                      <div className="flex flex-col">
                        <span className="text-[#888891] text-[0.6rem] font-semibold uppercase tracking-wider">
                          {role === 'client' ? 'Date' : 'Délai'}
                        </span>
                        <span className="text-slate-700 font-semibold text-[0.75rem] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {date}
                        </span>
                      </div>
                    </div>

                    {/* Badge Info Draft */}
                    <div className="flex items-center gap-1 bg-white border border-amber-100 px-2 py-1 rounded-lg text-amber-600 text-[0.62rem] font-bold">
                      <span>{role === 'client' ? 'Besoin Client' : 'Offre Prestataire'}</span>
                    </div>
                  </div>

                  {/* Actions preview simulation buttons */}
                  <div className="flex gap-2 text-[0.75rem] font-extrabold">
                    <button className="flex-1 py-3.5 bg-[#4A90E2]/10 text-[#4A90E2] rounded-2xl flex items-center justify-center gap-1 relative overflow-hidden opacity-50 cursor-not-allowed">
                      {role === 'client' ? 'Postuler ' : 'Commander le service '} <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button className="px-4.5 py-3.5 border border-slate-100 text-[#888891] rounded-2xl opacity-50 cursor-not-allowed">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>

              {/* Explanatory visual banner */}
              <div className="flex items-center gap-2.5 bg-slate-100/60 p-3 rounded-2xl border border-slate-200/40 text-[#888891] text-[0.7rem] font-medium font-sans">
                <Award className="w-4 h-4 text-amber-500 shrink-0 stroke-[2.2]" />
                <p>
                  {role === 'client'
                    ? "En publiant, le montant sera gelé et réservé pour le futur doer."
                    : "En publiant, votre offre de service sera immédiatement visible par tous les recruteurs."}
                </p>
              </div>

              {/* Action Area Row */}
              <div className="flex gap-3.5 mt-2">
                <button
                  onClick={() => setStep('edit')}
                  className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 font-extrabold text-[0.8rem] rounded-2xl hover:bg-slate-50 transition active:scale-[0.98]"
                >
                  Modifier les détails
                </button>
                <button
                  onClick={handlePublish}
                  className="flex-1 py-4 bg-[#4A90E2] text-white font-extrabold text-[0.8rem] rounded-2xl flex items-center justify-center gap-1.5 hover:opacity-90 transition active:scale-[0.98] shadow-md shadow-[#4A90E2]/20"
                >
                  🚀 Publier l'Annonce
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {step === 'success' && (
          <motion.div 
            key="publish-success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="px-6 pt-[120px] flex flex-col items-center justify-center text-center text-slate-800"
          >
            {/* Animated Big success circle with bouncing paths */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
              className="w-24 h-24 rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/15 flex items-center justify-center text-white mb-6 relative"
            >
              {/* Spinning background effect halo */}
              <div className="absolute inset-0 rounded-full border border-emerald-300 opacity-30 animate-ping" />
              <Check className="w-12 h-12 stroke-[3]" />
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-extrabold tracking-tight"
            >
              {role === 'client' ? 'Annonce Publiée !' : 'Service mis en ligne !'}
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 text-[0.82rem] leading-relaxed mt-2.5 max-w-[260px]"
            >
              {role === 'client' 
                ? "Votre tâche est maintenant visible par tous les Doers dans l'onglet des publications."
                : "Votre offre de service est maintenant visible par tous les recruteurs dans l'onglet des publications."}
            </motion.p>

            {/* Quick summary card */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-full bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mt-8 flex flex-col gap-3.5 text-left"
            >
              <div className="flex justify-between items-center text-[0.72rem] pb-2 border-b border-slate-50">
                <span className="text-[#888891] font-bold uppercase tracking-wider">Récapitulatif</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 font-extrabold rounded">En Ligne</span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-[#888891] text-[0.62rem] font-bold uppercase tracking-wider">Titre</span>
                <span className="text-[#2D3142] text-[0.85rem] font-bold line-clamp-1">{title}</span>
              </div>

              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="flex flex-col">
                  <span className="text-[#888891] text-[0.62rem] font-bold uppercase tracking-wider">
                    {role === 'client' ? 'Date limite' : 'Délai estimé'}
                  </span>
                  <span className="text-slate-700 font-bold text-[0.75rem]">{date}</span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[#888891] text-[0.62rem] font-bold uppercase tracking-wider">
                    {role === 'client' ? 'Budget' : 'Tarif'}
                  </span>
                  <span className="text-emerald-600 font-extrabold text-[0.9rem]">{budget} €</span>
                </div>
              </div>
            </motion.div>

            <motion.button 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              onClick={onBack}
              className="w-full bg-slate-900 text-white font-extrabold text-[0.82rem] py-4 rounded-2xl flex items-center justify-center gap-1.5 mt-10 active:scale-[0.98] transition shadow-md"
            >
              {role === 'client' ? 'Voir ma publication ➔' : 'Voir mon service proposé ➔'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
