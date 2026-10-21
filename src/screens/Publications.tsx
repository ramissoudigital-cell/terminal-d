import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Calendar, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  ArrowUpRight, 
  User, 
  Briefcase, 
  DollarSign, 
  Star, 
  MessageSquare, 
  Filter, 
  Info,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { topFreelancers } from '../data';

interface Publication {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  budget: number;
  date: string;
  author: {
    name: string;
    avatar: string;
    rating: number;
    location: string;
  };
  description: string;
  status?: 'Active' | 'En attente' | 'Terminé';
  proposalsCount?: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  authorRole?: 'client' | 'freelancer';
}

const ALL_PUBLICATIONS: Publication[] = [
  {
    id: 'pub-1',
    title: 'Création de Logo & Charte Graphique',
    category: 'UI/UX Designer',
    categoryColor: '#E4EFFF', // Light Blue
    budget: 350,
    date: '10/06/2026',
    author: {
      name: 'Alice Courtois',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      rating: 4.9,
      location: 'Paris, FR'
    },
    description: 'Prestataire UI/UX passionnée. Je propose de concevoir l\'identité visuelle complète de votre entreprise : Logo unique, charte graphique raffinée et pack pour les réseaux sociaux.',
    proposalsCount: 8,
    authorRole: 'freelancer'
  },
  {
    id: 'pub-2',
    title: 'Soutien en Algèbre et Physique Bac S',
    category: 'Soutien scolaire',
    categoryColor: '#FFF4E5', // Light Orange
    budget: 150,
    date: '15/06/2026',
    author: {
      name: 'Thomas Laurent',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      rating: 4.7,
      location: 'Lyon, FR'
    },
    description: 'Recherche tuteur d\'algèbre certifié pour cours de soutien réguliers de 2h par semaine auprès d\'un élève en Terminale préparant son examen de fin d\'études.',
    proposalsCount: 3,
    authorRole: 'client'
  },
  {
    id: 'pub-3',
    title: 'Nettoyage complet appartement T3',
    category: 'Ménage & Nettoyage',
    categoryColor: '#E2FBE9', // Light Green
    budget: 180,
    date: '12/06/2026',
    author: {
      name: 'Sabrina Vian',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      rating: 4.8,
      location: 'Marseille, FR'
    },
    description: 'Besoin de faire nettoyer entièrement mon appartement vide de 70m2 de fin de bail incluant vitres serrées, cuisine et salle de bain frottée.',
    proposalsCount: 5,
    authorRole: 'client'
  },
  {
    id: 'pub-4',
    title: 'Développement Web React & Vite pro',
    category: 'Programmer',
    categoryColor: '#F3E8FF', // Light Purple
    budget: 450,
    date: '20/06/2026',
    author: {
      name: 'Stéphane Roy',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      rating: 5.0,
      location: 'Bordeaux, FR'
    },
    description: 'Prestataire de service fullstack. Je développe vos applications web, sites vitrines sur-mesure et landing pages fluides avec haute performance et animations soignées.',
    proposalsCount: 11,
    authorRole: 'freelancer'
  }
];

const MY_PUBLICATIONS: Publication[] = [
  {
    id: 'my-1',
    title: 'Montage Vidéo de Voyage - 10 min',
    category: 'Montage Vidéo',
    categoryColor: '#FFFCE6',
    budget: 120,
    date: '28/05/2026',
    author: {
      name: 'Gabriel J. (Moi)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      rating: 5.0,
      location: 'Paris, FR'
    },
    description: 'Je propose des projets de montage vidéo narratifs de haute qualité pour vlogs, entreprises ou réseaux sociaux avec intégration d\'ambiance sonore.',
    status: 'Active',
    proposalsCount: 4,
    authorRole: 'freelancer'
  },
  {
    id: 'my-2',
    title: 'Aide à la plantation de haies de jardin',
    category: 'Jardinage & Extérieur',
    categoryColor: '#F5FFF6',
    budget: 80,
    date: '15/05/2026',
    author: {
      name: 'Gabriel J. (Moi)',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      rating: 5.0,
      location: 'Paris, FR'
    },
    description: 'Besoin de bras pour creuser une tranchée de 10 mètres et installer les arbustes de notre haie mitoyenne.',
    status: 'Terminé',
    proposalsCount: 2,
    authorRole: 'client'
  }
];

export const Publications = ({ 
  onNavigateCreateTask,
  onOfferClick,
  onChatClick,
  onFreelancerClick,
  onBack
}: { 
  onNavigateCreateTask: () => void;
  onOfferClick: (categoryName: string) => void;
  onChatClick?: (authorName: string, avatarUrl: string) => void;
  onFreelancerClick?: (freelancerId: string) => void;
  onBack?: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'client' | 'freelancer'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [createdPublications, setCreatedPublications] = useState<Publication[]>(() => {
    try {
      const stored = localStorage.getItem('user_publications');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const categoriesList = [
    'Tous', 'Éducation', 'Artisanat', 'Informatique', 'Réparation', 'Beauté',
    'Transport', 'Bien-être', 'Événementiel', 'Déménagement', 'Nettoyage',
    'Bricolage', 'Photographie', 'Architecture', 'Jardinage', 'Soutien scolaire',
    'Rédaction', 'Vidéo', 'Sécurité', 'Plomberie', 'Électricité',
    'Design', 'Marketing', 'Traduction', 'Coaching', "Garde d'enfants",
    'Musique', 'Comptabilité', 'Droit', 'Cuisine', 'Sport'
  ];

  const allPublicationsMerged = [...createdPublications, ...ALL_PUBLICATIONS];
  const myPublicationsMerged = [
    ...createdPublications.filter(p => p.author.name.includes('(Moi)')),
    ...MY_PUBLICATIONS
  ];

  const publicationsToFilter = activeTab === 'all' ? allPublicationsMerged : myPublicationsMerged;

  const filteredPublications = publicationsToFilter.filter(pub => {
    const matchesSearch = pub.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          pub.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'Tous' || pub.category === selectedCategory;
    const pubRole = pub.authorRole || 'client';
    const matchesRole = roleFilter === 'all' || pubRole === roleFilter;
    return matchesSearch && matchesCat && matchesRole;
  });

  const handleApply = (title: string) => {
    setSuccessToast(`Vous avez postulé à l'offre: "${title}" avec succès!`);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="flex flex-col bg-[#F0F8FF] min-h-full pb-10 relative"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 left-[20px] right-[20px] max-w-[374px] mx-auto bg-slate-900 text-white text-[0.8rem] font-medium py-3.5 px-5 rounded-2xl shadow-xl flex items-center gap-3 z-[999] border border-slate-700/50"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            </div>
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="px-6 pt-[60px] pb-5 bg-white rounded-b-[2rem] shadow-sm shrink-0">
        <div className="flex justify-between items-center mb-5">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight font-sans">Publications</h1>
            <p className="text-[#888891] text-[0.75rem] font-medium tracking-wide">Trouvez ou postez des opportunités de tâches</p>
          </div>
          
          <button 
            onClick={onNavigateCreateTask}
            className="w-10 h-10 rounded-full bg-[#4A90E2] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform duration-200 shadow-[0_4px_12px_rgba(74,144,226,0.25)]"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="p-1 bg-slate-100 rounded-2xl flex relative h-11">
          <button 
            onClick={() => setActiveTab('all')}
            className={`flex-1 text-center font-bold text-[0.8rem] rounded-xl relative z-10 transition-colors duration-300 ${activeTab === 'all' ? 'text-slate-800' : 'text-slate-400'}`}
          >
            Toutes les offres
          </button>
          <button 
            onClick={() => setActiveTab('mine')}
            className={`flex-1 text-center font-bold text-[0.8rem] rounded-xl relative z-10 transition-colors duration-300 ${activeTab === 'mine' ? 'text-slate-800' : 'text-slate-400'}`}
          >
            Mes publications
          </button>
          
          {/* Slide Indicator Bar */}
          <motion.div 
            layout
            className="absolute top-1 bottom-1 bg-white rounded-xl shadow-sm z-0"
            style={{ 
              width: 'calc(50% - 4px)',
              left: activeTab === 'all' ? '4px' : '50%'
            }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
          />
        </div>

        {/* Search Bar */}
        <div className="mt-4 bg-slate-50 border border-slate-100/80 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'all' ? "Rechercher une publication" : "Rechercher dans mes publications"}
            className="bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 text-[0.8rem] font-medium w-full"
          />
        </div>

        {/* Role Segment Toggle - Distinguish Client and Freelancer posts */}
        <div className="mt-3.5 p-1 bg-slate-100/80 border border-slate-200/5 rounded-[1.25rem] flex relative h-11.5 shrink-0">
          <button 
            type="button"
            onClick={() => setRoleFilter('all')}
            className={`flex-1 text-center font-extrabold text-[0.7rem] uppercase tracking-wider rounded-xl relative z-10 transition-colors duration-300 ${roleFilter === 'all' ? 'text-slate-800' : 'text-slate-400'}`}
          >
            Tout ({publicationsToFilter.length})
          </button>
          <button 
            type="button"
            onClick={() => setRoleFilter('client')}
            className={`flex-1 text-center font-extrabold text-[0.7rem] uppercase tracking-wider rounded-xl relative z-10 transition-colors duration-300 ${roleFilter === 'client' ? 'text-slate-800' : 'text-slate-400'}`}
          >
            Besoins ({publicationsToFilter.filter(p => (p.authorRole || 'client') === 'client').length})
          </button>
          <button 
            type="button"
            onClick={() => setRoleFilter('freelancer')}
            className={`flex-1 text-center font-extrabold text-[0.7rem] uppercase tracking-wider rounded-xl relative z-10 transition-colors duration-300 ${roleFilter === 'freelancer' ? 'text-slate-800' : 'text-slate-400'}`}
          >
            Services ({publicationsToFilter.filter(p => p.authorRole === 'freelancer').length})
          </button>
          
          <motion.div 
            className="absolute top-1 bottom-1 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] z-0"
            style={{ 
              width: 'calc(33.33% - 4px)',
            }}
            animate={{ 
              left: roleFilter === 'all' 
                ? '4px' 
                : roleFilter === 'client' 
                  ? 'calc(33.33% + 2px)' 
                  : 'calc(66.66%)'
            }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
          />
        </div>
      </header>

      {/* Category Pills Slider */}
      <div className="py-4 overflow-x-auto hide-scrollbar flex gap-2.5 px-6 shrink-0">
        {categoriesList.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4.5 py-2.5 rounded-full text-[0.75rem] font-bold tracking-wide border whitespace-nowrap transition-all duration-200 ${
              selectedCategory === cat 
                ? 'bg-[#4A90E2] border-[#4A90E2] text-white shadow-sm' 
                : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Publications Listing */}
      <div className="flex-1 px-6 pt-2 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filteredPublications.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
                <Briefcase className="w-7 h-7 stroke-[1.5]" />
              </div>
              <h3 className="text-slate-800 text-[0.95rem] font-bold">Aucune publication trouvée</h3>
              <p className="text-[#888891] text-[0.75rem] mt-1 max-w-[200px] leading-relaxed">Soyez le premier à ajouter ou modifier vos filtres !</p>
              
              {activeTab === 'mine' && (
                <button
                  onClick={onNavigateCreateTask}
                  className="mt-5 px-5 py-2.5 bg-[#4A90E2] text-white rounded-2xl text-[0.75rem] font-bold flex items-center gap-2 shadow-md hover:scale-102 transition-transform active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Publier une tâche
                </button>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredPublications.map((pub, idx) => (
                <motion.div
                  key={pub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: idx * 0.05, type: 'spring', damping: 25, stiffness: 200 }}
                  className="bg-white rounded-[2rem] p-5 shadow-[0_2px_15px_rgba(33,46,83,0.02)] border border-slate-100/50 flex flex-col gap-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onOfferClick(pub.category)}
                >
                  {/* Card Header Profile */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <img src={pub.author.avatar} alt={pub.author.name} className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm" />
                      <div className="flex flex-col">
                        <span className="text-slate-800 text-[0.85rem] font-bold leading-tight flex items-center gap-1.5">
                          {pub.author.name}
                          <span className={`text-[0.55rem] tracking-wider font-extrabold px-1.5 py-0.5 rounded uppercase ${
                            pub.authorRole === 'freelancer' 
                              ? 'bg-[#F3E8FF] text-[#A855F7] border border-[#A855F7]/15' 
                              : 'bg-[#E4EFFF] text-[#4A90E2] border border-[#4A90E2]/15'
                          }`}>
                            {pub.authorRole === 'freelancer' ? 'Prestataire' : 'Client'}
                          </span>
                        </span>
                        <div className="flex items-center gap-1.5 text-[#888891] text-[0.68rem] font-medium leading-[1.4]">
                          <MapPin className="w-3 h-3" />
                          <span>{pub.author.location}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-[#F5C453] font-bold">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {pub.author.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Category Stamp */}
                    <span 
                      className="px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wide"
                      style={{ 
                        backgroundColor: pub.categoryColor + '30' || '#E2FBE9',
                        color: pub.categoryColor === '#E2FBE9' ? '#22C55E' : pub.categoryColor === '#E4EFFF' ? '#3B82F6' : pub.categoryColor === '#FFF4E5' ? '#F97316' : pub.categoryColor === '#F3E8FF' ? '#A855F7' : '#737373'
                      }}
                    >
                      {pub.category}
                    </span>
                  </div>

                  {/* Divider line */}
                  <div className="h-[1px] w-full bg-slate-100"></div>

                  {/* Body Title & Desc */}
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-[#2D3142] text-[0.95rem] font-bold tracking-tight pr-2 line-clamp-1">{pub.title}</h3>
                    <p className="text-slate-500 text-[0.78rem] leading-[1.5] font-medium line-clamp-3">{pub.description}</p>
                  </div>

                  {/* Optional Media Preview Attachment within Feed Card */}
                  {pub.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 relative h-36 w-full -mt-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] bg-slate-900 flex items-center justify-center">
                      {pub.mediaType === 'image' ? (
                        <img 
                          src={pub.mediaUrl} 
                          alt="Illustration de la publication" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full relative">
                          <video 
                            src={pub.mediaUrl} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-black/60 text-white text-[0.55rem] font-bold uppercase tracking-wider backdrop-blur-sm">
                            Vidéo
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Info / Progress Footer Row */}
                  <div className="flex items-center justify-between mt-1 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-4">
                      {/* Budget */}
                      <div className="flex flex-col">
                        <span className="text-[#888891] text-[0.6rem] font-semibold uppercase tracking-wider">
                          {pub.authorRole === 'freelancer' ? 'Tarif Service' : 'Budget'}
                        </span>
                        <span className="text-emerald-600 font-extrabold text-[0.95rem] tracking-tight">{pub.budget} €</span>
                      </div>
                     
                      {/* Deadline */}
                      <div className="flex flex-col">
                        <span className="text-[#888891] text-[0.6rem] font-semibold uppercase tracking-wider">
                          {pub.authorRole === 'freelancer' ? 'Délai' : 'Date d\'exécution'}
                        </span>
                        <span className="text-slate-700 font-semibold text-[0.75rem] flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3 text-slate-400" />{pub.date}</span>
                      </div>
                    </div>

                    {/* Left Actions / Info Status */}
                    <div className="flex items-center gap-2">
                      {pub.status && (
                        <span className={`px-2.5 py-1 rounded-lg text-[0.65rem] font-bold ${
                          pub.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {pub.status}
                        </span>
                      )}
                      
                      {pub.proposalsCount !== undefined && (
                        <div className="flex items-center gap-1 bg-white border border-slate-100 px-2 py-1 rounded-lg text-[#888891] text-[0.65rem] font-bold">
                          <MessageSquare className="w-3 h-3" />
                          <span>{pub.proposalsCount} prop.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="flex gap-2.5 mt-1" onClick={(e) => e.stopPropagation()}>
                    {activeTab === 'all' ? (
                      <>
                        <button 
                          onClick={() => {
                            const freelancer = topFreelancers.find(f => f.name === pub.author.name);
                            onFreelancerClick?.(freelancer ? freelancer.id : 'f5');
                          }}
                          className="flex-1 py-3 bg-[#4A90E2] font-semibold text-[0.8rem] text-white rounded-2xl flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-98 transition-all shadow-sm"
                        >
                          {pub.authorRole === 'freelancer' ? 'Commander ' : 'Postuler '} <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => onChatClick?.(pub.author.name, pub.author.avatar)}
                          className="px-4.5 py-3 border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center"
                        >
                          <MessageSquare className="w-4 h-4 stroke-[1.8]" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => {
                            // edit publication alert
                            alert(`Modifier la publication: ${pub.title}`);
                          }}
                          className="flex-1 py-3 border border-[#4A90E2]/30 text-[#4A90E2] font-bold text-[0.8rem] bg-[#4A90E2]/5 rounded-2xl flex items-center justify-center gap-1 hover:bg-[#4A90E2]/10 active:scale-98 transition-all"
                        >
                          Gérer la publication <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action Button for returning */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="fixed bottom-8 left-6 w-14 h-14 rounded-full bg-slate-900 text-white shadow-xl flex items-center justify-center z-40 border border-slate-700 transition"
      >
        <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
      </motion.button>
    </motion.div>
  );
};
