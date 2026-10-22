import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, BookOpen, UserCheck, Calendar, Plus, Search, ArrowLeft, 
  Mail, Phone, FileText, CheckCircle2, Clock, Sparkles, ChevronRight, 
  GraduationCap, X, Building2, Download, MessageSquare, Award, AlertCircle, Lock, Trash2, Send, Pencil
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Teacher, User } from '../types';

interface MeetingCE {
  id: string;
  subject: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: 'planifiee' | 'terminee';
  agenda: string;
  decisions?: string;
  attendeesCount?: number;
}

interface OrientationItem {
  id: string;
  subject: string;
  title: string;
  description: string;
  colorTheme?: string;
}

const getDefaultOrientationsForSubject = (subject: string): OrientationItem[] => [
  {
    id: `default-o1-${subject}`,
    subject: subject,
    title: 'Devoirs Communs & Harmonisation',
    description: `Chaque niveau d'étude en ${subject} doit réaliser au moins deux (2) devoirs synthétiques communs par trimestre afin de garantir l'équité des évaluations.`,
    colorTheme: 'sky'
  },
  {
    id: `default-o2-${subject}`,
    subject: subject,
    title: 'Cahiers de texte & Suivi',
    description: `Le coordonnateur de ${subject} effectue une vérification mensuelle de la concordance des cahiers de texte avec la progression officielle.`,
    colorTheme: 'purple'
  },
  {
    id: `default-o3-${subject}`,
    subject: subject,
    title: 'Accompagnement & Soutien',
    description: `Analyse périodique des résultats en ${subject} pour identifier les élèves nécessitant des séances de soutien ciblé.`,
    colorTheme: 'emerald'
  },
  {
    id: `default-o4-${subject}`,
    subject: subject,
    title: 'Matériel & Ressources',
    description: `Transmission des besoins en manuels, consommables et équipements pédagogiques pour la discipline ${subject}.`,
    colorTheme: 'amber'
  }
];

interface ConseilEnseignementPageProps {
  teachers: Teacher[];
  currentUser?: User | null;
  onNavigate?: (page: string) => void;
}

interface SubjectConfig {
  name: string;
  color: string;
  bgLight: string;
  textColor: string;
  borderColor: string;
  isCustom?: boolean;
}

const DEFAULT_SUBJECTS: SubjectConfig[] = [
  { name: 'Mathématiques', color: 'from-blue-500 to-indigo-600', bgLight: 'bg-blue-50', textColor: 'text-blue-600', borderColor: 'border-blue-200' },
  { name: 'Français', color: 'from-purple-500 to-pink-600', bgLight: 'bg-purple-50', textColor: 'text-purple-600', borderColor: 'border-purple-200' },
  { name: 'Anglais', color: 'from-rose-500 to-red-600', bgLight: 'bg-rose-50', textColor: 'text-rose-600', borderColor: 'border-rose-200' },
  { name: 'Physique-Chimie', color: 'from-amber-500 to-orange-600', bgLight: 'bg-amber-50', textColor: 'text-amber-600', borderColor: 'border-amber-200' },
  { name: 'SVT', color: 'from-emerald-500 to-teal-600', bgLight: 'bg-emerald-50', textColor: 'text-emerald-600', borderColor: 'border-emerald-200' },
  { name: 'Histoire-Géo', color: 'from-cyan-500 to-sky-600', bgLight: 'bg-cyan-50', textColor: 'text-cyan-600', borderColor: 'border-cyan-200' },
  { name: 'Philosophie', color: 'from-indigo-500 to-violet-600', bgLight: 'bg-indigo-50', textColor: 'text-indigo-600', borderColor: 'border-indigo-200' },
  { name: 'EPS', color: 'from-pink-500 to-rose-600', bgLight: 'bg-pink-50', textColor: 'text-pink-600', borderColor: 'border-pink-200' },
  { name: 'EDHC', color: 'from-orange-500 to-amber-600', bgLight: 'bg-orange-50', textColor: 'text-orange-600', borderColor: 'border-orange-200' },
  { name: 'Informatique', color: 'from-teal-500 to-cyan-600', bgLight: 'bg-teal-50', textColor: 'text-teal-600', borderColor: 'border-teal-200' },
  { name: 'Conduite', color: 'from-emerald-600 to-teal-700', bgLight: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-300' },
];

const COLOR_THEMES = [
  { name: 'Bleu', color: 'from-blue-500 to-indigo-600', bgLight: 'bg-blue-50', textColor: 'text-blue-600', borderColor: 'border-blue-200' },
  { name: 'Violet', color: 'from-purple-500 to-pink-600', bgLight: 'bg-purple-50', textColor: 'text-purple-600', borderColor: 'border-purple-200' },
  { name: 'Rouge / Rose', color: 'from-rose-500 to-red-600', bgLight: 'bg-rose-50', textColor: 'text-rose-600', borderColor: 'border-rose-200' },
  { name: 'Ambre / Orange', color: 'from-amber-500 to-orange-600', bgLight: 'bg-amber-50', textColor: 'text-amber-600', borderColor: 'border-amber-200' },
  { name: 'Vert / Émeraude', color: 'from-emerald-500 to-teal-600', bgLight: 'bg-emerald-50', textColor: 'text-emerald-600', borderColor: 'border-emerald-200' },
  { name: 'Cyan / Ciel', color: 'from-cyan-500 to-sky-600', bgLight: 'bg-cyan-50', textColor: 'text-cyan-600', borderColor: 'border-cyan-200' },
  { name: 'Indigo', color: 'from-indigo-500 to-violet-600', bgLight: 'bg-indigo-50', textColor: 'text-indigo-600', borderColor: 'border-indigo-200' },
  { name: 'Fuchsia', color: 'from-fuchsia-500 to-pink-600', bgLight: 'bg-fuchsia-50', textColor: 'text-fuchsia-600', borderColor: 'border-fuchsia-200' },
  { name: 'Teal / Turquoise', color: 'from-teal-500 to-cyan-600', bgLight: 'bg-teal-50', textColor: 'text-teal-600', borderColor: 'border-teal-200' },
];

const DEFAULT_MEETINGS: MeetingCE[] = [
  {
    id: 'm1',
    subject: 'Mathématiques',
    title: 'Conseil d\'enseignement de rentrée & Alignement des programmes',
    date: '15 Septembre 2024',
    time: '14:30 - 16:30',
    location: 'Salle des Professeurs 1',
    status: 'terminee',
    agenda: 'Harmonisation des devoirs de contrôle continu, calendrier des devoirs communs de 3ème et Terminale.',
    decisions: 'Adopté : 3 devoirs communs prévus par trimestre pour la 3ème et Tle C/D. Banque d\'exercices partagée créée.',
    attendeesCount: 4
  },
  {
    id: 'm2',
    subject: 'Mathématiques',
    title: 'Bilan intermédiaire Trimestre 1 & Préparation des compositions',
    date: '28 Novembre 2024',
    time: '15:00 - 17:00',
    location: 'Salle Info 2',
    status: 'planifiee',
    agenda: 'Analyse du niveau moyen des élèves de 6ème, mise en place des cours de soutien en calcul mental.',
    attendeesCount: 4
  },
  {
    id: 'm3',
    subject: 'Français',
    title: 'Analyse des progressions pédagogiques & Concours de lecture',
    date: '02 Octobre 2024',
    time: '10:00 - 12:00',
    location: 'Bibliothèque / CDI',
    status: 'terminee',
    agenda: 'Mise en œuvre du projet de lecture suivie pour le cycle collège et évaluation de l\'expression écrite.',
    decisions: 'Lancement du concours d\'orthographe inter-classes le 15 Décembre. Sélections en cours.',
    attendeesCount: 3
  },
  {
    id: 'm4',
    subject: 'Physique-Chimie',
    title: 'Inventaire des équipements de laboratoire & Travaux Pratiques',
    date: '10 Octobre 2024',
    time: '16:00 - 17:30',
    location: 'Laboratoire de Sciences',
    status: 'terminee',
    agenda: 'Répartition du matériel expérimental pour les TP de Seconde et Première D.',
    decisions: 'Commande de verrerie de laboratoire validée auprès de la direction.',
    attendeesCount: 3
  }
];

export const ConseilEnseignementPage: React.FC<ConseilEnseignementPageProps> = ({
  teachers,
  currentUser,
  onNavigate
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>('Mathématiques');
  const [activeTabDetail, setActiveTabDetail] = useState<'members' | 'meetings' | 'program'>('members');
  const [searchTerm, setSearchTerm] = useState('');
  
  // All Subjects state with localStorage persistence
  const [allSubjects, setAllSubjects] = useState<SubjectConfig[]>(() => {
    const saved = localStorage.getItem('school_db_ce_subjects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_SUBJECTS;
  });

  // Meetings state with localStorage
  const [meetings, setMeetings] = useState<MeetingCE[]>(() => {
    const saved = localStorage.getItem('school_db_ce_meetings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return DEFAULT_MEETINGS; }
    }
    return DEFAULT_MEETINGS;
  });

  // Coordonnateurs mapping state (Subject -> Teacher ID or Name)
  const [coordonnateurs, setCoordonnateurs] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem('school_db_ce_coordonnateurs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    // Default assignments
    return {
      'Mathématiques': 'Sarah Dubois',
      'Physique-Chimie': 'Julien Roux',
      'Histoire-Géo': 'Émilie Petit',
      'EPS': 'Michel Brun',
      'Français': 'Jessica Tessier',
      'Informatique': 'David Legrand'
    };
  });

  // Track subjects that have been initialized with defaults
  const [initializedSubjects, setInitializedSubjects] = useState<string[]>(() => {
    const saved = localStorage.getItem('school_db_ce_orientations_init');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return allSubjects.map(s => s.name);
  });

  // Orientations state with localStorage
  const [orientations, setOrientations] = useState<OrientationItem[]>(() => {
    const saved = localStorage.getItem('school_db_ce_orientations');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return allSubjects.flatMap(s => getDefaultOrientationsForSubject(s.name));
  });

  useEffect(() => {
    localStorage.setItem('school_db_ce_subjects', JSON.stringify(allSubjects));
  }, [allSubjects]);

  useEffect(() => {
    localStorage.setItem('school_db_ce_meetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('school_db_ce_coordonnateurs', JSON.stringify(coordonnateurs));
  }, [coordonnateurs]);

  useEffect(() => {
    localStorage.setItem('school_db_ce_orientations_init', JSON.stringify(initializedSubjects));
  }, [initializedSubjects]);

  useEffect(() => {
    localStorage.setItem('school_db_ce_orientations', JSON.stringify(orientations));
  }, [orientations]);

  // Ensure selectedSubject is initialized if not present
  useEffect(() => {
    if (selectedSubject && !initializedSubjects.includes(selectedSubject)) {
      setOrientations(prev => [...getDefaultOrientationsForSubject(selectedSubject), ...prev]);
      setInitializedSubjects(prev => [...prev, selectedSubject]);
    }
  }, [selectedSubject, initializedSubjects]);

  // Modal states
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selectedThemeIdx, setSelectedThemeIdx] = useState(0);

  const [showAddMeetingModal, setShowAddMeetingModal] = useState(false);
  const [editingMeetingId, setEditingMeetingId] = useState<string | null>(null);
  const [deletingMeetingId, setDeletingMeetingId] = useState<string | null>(null);
  const [showCoordModal, setShowCoordModal] = useState(false);
  const [teacherContactModal, setTeacherContactModal] = useState<Teacher | null>(null);

  // Orientations Modal states
  const [showOrientationModal, setShowOrientationModal] = useState(false);
  const [editingOrientationId, setEditingOrientationId] = useState<string | null>(null);
  const [deletingOrientationId, setDeletingOrientationId] = useState<string | null>(null);
  const [orientationForm, setOrientationForm] = useState({
    title: '',
    description: '',
    colorTheme: 'sky'
  });

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSubjectName.trim();
    if (!trimmed) return;

    if (allSubjects.some(s => s.name.toLowerCase() === trimmed.toLowerCase())) {
      alert(`La matière "${trimmed}" existe déjà dans la liste.`);
      return;
    }

    const theme = COLOR_THEMES[selectedThemeIdx] || COLOR_THEMES[0];
    const newSubject: SubjectConfig = {
      name: trimmed,
      color: theme.color,
      bgLight: theme.bgLight,
      textColor: theme.textColor,
      borderColor: theme.borderColor,
      isCustom: true
    };

    setAllSubjects(prev => [...prev, newSubject]);
    setSelectedSubject(trimmed);
    setActiveTabDetail('members');
    setNewSubjectName('');
    setSelectedThemeIdx(0);
    setShowAddSubjectModal(false);
  };

  const handleDeleteSubject = (subjectName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(`Voulez-vous vraiment supprimer la matière "${subjectName}" ?`)) {
      setAllSubjects(prev => prev.filter(s => s.name !== subjectName));
      if (selectedSubject === subjectName) {
        setSelectedSubject(null);
      }
    }
  };

  // New Meeting Form
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '15:00 - 17:00',
    location: 'Salle des Professeurs',
    agenda: '',
    decisions: ''
  });

  // User role check
  const isTeacherUser = currentUser?.role === 'teacher' || currentUser?.role === 'professeur' || currentUser?.accessLevel === 3;
  const isCashier = currentUser?.role === 'cashier';

  // Can user edit or add
  const canEdit = (!currentUser || currentUser?.role === 'director' || currentUser?.role === 'admin' || currentUser?.role === 'educator' || currentUser?.role === 'teacher' || (currentUser?.accessLevel ?? 0) >= 1) && !isCashier;

  // Permissions for managing subjects and appointing coordinators (restricted for teachers)
  const canManageSubjects = canEdit && !isTeacherUser;
  const canManageCoordonnateurs = canEdit && !isTeacherUser;

  // Orientations for current subject
  const currentOrientations = useMemo(() => {
    if (!selectedSubject) return [];
    return orientations.filter(o => o.subject === selectedSubject);
  }, [orientations, selectedSubject]);

  const handleSaveOrientation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !orientationForm.title.trim()) return;

    if (editingOrientationId) {
      setOrientations(prev => prev.map(o => o.id === editingOrientationId ? {
        ...o,
        title: orientationForm.title.trim(),
        description: orientationForm.description.trim(),
        colorTheme: orientationForm.colorTheme
      } : o));
    } else {
      const newO: OrientationItem = {
        id: `orientation-${Date.now()}`,
        subject: selectedSubject,
        title: orientationForm.title.trim(),
        description: orientationForm.description.trim(),
        colorTheme: orientationForm.colorTheme || 'sky'
      };
      setOrientations(prev => [newO, ...prev]);
    }

    setShowOrientationModal(false);
    setEditingOrientationId(null);
    setOrientationForm({ title: '', description: '', colorTheme: 'sky' });
  };

  const handleDeleteOrientation = (id: string) => {
    setOrientations(prev => prev.filter(o => o.id !== id));
    setDeletingOrientationId(null);
  };

  // Group teachers by subject
  const teachersBySubject = useMemo(() => {
    const map: Record<string, Teacher[]> = {};
    allSubjects.forEach(s => { map[s.name] = []; });

    teachers.forEach(teacher => {
      const subj = teacher.subject || 'Autre';
      if (!map[subj]) map[subj] = [];
      map[subj].push(teacher);
    });

    return map;
  }, [teachers, allSubjects]);

  // Filtered Subjects list
  const filteredSubjects = useMemo(() => {
    return allSubjects.filter(s => {
      const matchesName = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const teachersInSubject = teachersBySubject[s.name] || [];
      const matchesTeacher = teachersInSubject.some(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesName || matchesTeacher;
    });
  }, [searchTerm, teachersBySubject, allSubjects]);

  const handleAddMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !newMeeting.title.trim()) return;

    if (editingMeetingId) {
      setMeetings(prev => prev.map(m => m.id === editingMeetingId ? {
        ...m,
        title: newMeeting.title.trim(),
        date: newMeeting.date || new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        time: newMeeting.time,
        location: newMeeting.location,
        status: newMeeting.decisions.trim() ? 'terminee' as const : 'planifiee' as const,
        agenda: newMeeting.agenda.trim(),
        decisions: newMeeting.decisions.trim() || undefined,
      } : m));
    } else {
      const created: MeetingCE = {
        id: `ce-m-${Date.now()}`,
        subject: selectedSubject,
        title: newMeeting.title.trim(),
        date: newMeeting.date || new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        time: newMeeting.time,
        location: newMeeting.location,
        status: newMeeting.decisions.trim() ? 'terminee' : 'planifiee',
        agenda: newMeeting.agenda.trim(),
        decisions: newMeeting.decisions.trim() || undefined,
        attendeesCount: (teachersBySubject[selectedSubject] || []).length
      };
      setMeetings(prev => [created, ...prev]);
    }
    setShowAddMeetingModal(false);
    setEditingMeetingId(null);
    setNewMeeting({
      title: '',
      date: '',
      time: '15:00 - 17:00',
      location: 'Salle des Professeurs',
      agenda: '',
      decisions: ''
    });
  };

  const handleSelectCoordonnateur = (teacherName: string) => {
    if (!selectedSubject) return;
    setCoordonnateurs(prev => ({ ...prev, [selectedSubject]: teacherName }));
    setShowCoordModal(false);
  };

  // Stats calculation
  const totalSubjectsCount = allSubjects.length;
  const totalTeachersCount = teachers.length;
  const totalPlannedMeetings = meetings.filter(m => m.status === 'planifiee').length;
  const totalCoordonnateurs = Object.keys(coordonnateurs).length;

  const currentSubjectObj = allSubjects.find(s => s.name === selectedSubject);
  const currentTeachers = selectedSubject ? (teachersBySubject[selectedSubject] || []) : [];
  const currentCoordonnateurName = selectedSubject ? coordonnateurs[selectedSubject] : null;
  const currentCoordonnateur = currentTeachers.find(t => t.name === currentCoordonnateurName) || (currentTeachers[0] || null);
  const currentMeetings = selectedSubject ? meetings.filter(m => m.subject === selectedSubject) : [];

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 relative z-10 bg-[#BFDBFE] overflow-hidden">
      
      {/* HEADER SECTION - Dashboard Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-7 pb-4 sm:pb-6 px-4 sm:px-8 shrink-0 relative z-10 print:hidden">
        <div>
          <h1 className="text-white text-xl sm:text-[28px] font-bold tracking-tight leading-tight">
            Conseils d'Enseignement (CE)
          </h1>
          <p className="text-white/80 text-xs font-semibold mt-0.5 sm:mt-1">
            Gestion académique, responsables UP et conseils de classe
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 self-stretch sm:self-auto overflow-x-auto no-scrollbar pb-0.5">
          {canManageSubjects && (
            <button
              onClick={() => setShowAddSubjectModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md shadow-emerald-900/20 shrink-0 cursor-pointer"
            >
              <Plus size={16} className="shrink-0" />
              <span>Nouvelle Matière</span>
            </button>
          )}

          {onNavigate && (
            <button
              onClick={() => onNavigate('responsables_up')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/40 hover:bg-white/60 active:scale-95 backdrop-blur-md border border-white/50 text-slate-900 font-bold text-xs sm:text-sm transition-all shadow-xs shrink-0"
            >
              <Building2 size={16} className="text-slate-900 shrink-0" />
              <span>Responsables UP</span>
            </button>
          )}

          {selectedSubject && (
            <button
              onClick={() => setSelectedSubject(null)}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/40 hover:bg-white/60 active:scale-95 backdrop-blur-md border border-white/50 text-slate-900 font-bold text-xs sm:text-sm transition-all shadow-xs shrink-0"
            >
              <ArrowLeft size={16} className="text-slate-900 shrink-0" />
              <span>Retour</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area with White Background & Curved Top */}
      <main className="flex-1 bg-white rounded-t-[28px] sm:rounded-t-[40px] px-3 sm:px-6 md:px-8 pt-5 sm:pt-8 pb-24 overflow-y-auto custom-scrollbar shadow-2xl relative">


      {/* SEARCH BAR & MATIÈRES SECTIONS PILL NAVIGATION */}
      <div className="mb-4 sm:mb-6 shrink-0 space-y-3 sm:space-y-4">
        {!selectedSubject && (
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une discipline ou un professeur..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-9 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 shadow-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60"
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}

        {/* PILL NAVIGATION TABS - SECTIONS PAR MATIÈRE */}
        <div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-0.5 no-scrollbar max-w-full touch-pan-x">
            {allSubjects.map((subj) => {
              const isSelected = selectedSubject === subj.name;
              const teacherCount = (teachersBySubject[subj.name] || []).length;
              return (
                <button
                  key={subj.name}
                  onClick={() => {
                    setSelectedSubject(subj.name);
                    setActiveTabDetail('members');
                  }}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 border transition-all whitespace-nowrap shrink-0 active:scale-95 shadow-2xs ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 text-sky-600 ring-2 ring-sky-100/80'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <GraduationCap size={16} className={isSelected ? 'text-sky-600' : 'text-slate-400'} />
                  <span>{subj.name}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-sky-200 text-sky-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {teacherCount} prof{teacherCount > 1 ? 's' : ''}
                  </span>
                </button>
              );
            })}

            {canManageSubjects && (
              <button
                onClick={() => setShowAddSubjectModal(true)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 border border-dashed border-emerald-400 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 transition-all whitespace-nowrap shrink-0 active:scale-95 shadow-2xs cursor-pointer"
              >
                <Plus size={16} className="text-emerald-600 shrink-0" />
                <span>Nouvelle Matière</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1">
        
        {/* VIEW 1: SUBJECT COUNCILS GRID */}
        {!selectedSubject ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {filteredSubjects.map((subject) => {
              const teachersInSubject = teachersBySubject[subject.name] || [];
              const coordName = coordonnateurs[subject.name];
              const coordTeacher = teachersInSubject.find(t => t.name === coordName) || (teachersInSubject[0] || null);
              const subjectMeetings = meetings.filter(m => m.subject === subject.name);
              const nextMeeting = subjectMeetings.find(m => m.status === 'planifiee');

              return (
                <div
                  key={subject.name}
                  onClick={() => {
                    setSelectedSubject(subject.name);
                    setActiveTabDetail('members');
                  }}
                  className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-xs hover:shadow-md hover:border-sky-200 transition-all cursor-pointer group flex flex-col justify-between relative overflow-hidden active:scale-[0.99]"
                >
                  {/* Decorative Header Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${subject.color}`} />

                  <div>
                    {/* Top Row: Title & Badge */}
                    <div className="flex items-start justify-between gap-2 mb-3 sm:mb-4 pt-1">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${subject.bgLight} ${subject.textColor} flex items-center justify-center font-bold text-base sm:text-lg shadow-2xs shrink-0`}>
                          <BookOpen size={18} className="sm:hidden" />
                          <BookOpen size={20} className="hidden sm:block" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-sky-600 transition-colors truncate">
                            {subject.name}
                          </h3>
                          <p className="text-[11px] sm:text-xs font-semibold text-slate-400 truncate">
                            Conseil d'Enseignement
                          </p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-extrabold bg-slate-100 text-slate-700 shrink-0 flex items-center gap-1.5">
                        {teachersInSubject.length} prof{teachersInSubject.length > 1 ? 's' : ''}
                        {subject.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteSubject(subject.name, e)}
                            className="p-1 hover:bg-rose-100 hover:text-rose-600 rounded-full text-slate-400 transition-colors"
                            title="Supprimer cette matière"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </span>
                    </div>

                    {/* Coordonnateur Info */}
                    <div className="bg-slate-50 rounded-2xl p-3 sm:p-3.5 mb-3 sm:mb-4 border border-slate-100 flex items-center gap-2.5 sm:gap-3">
                      {coordTeacher ? (
                        <>
                          <img 
                            src={coordTeacher.photo} 
                            alt={coordTeacher.name} 
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-white shadow-xs shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] sm:text-[10px] font-extrabold text-sky-600 uppercase tracking-wider bg-sky-100 px-1.5 py-0.5 rounded">
                                Coordonnateur
                              </span>
                            </div>
                            <p className="text-xs sm:text-sm font-bold text-slate-800 truncate mt-0.5">
                              {coordTeacher.name}
                            </p>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold py-1">
                          <AlertCircle size={15} className="shrink-0" />
                          <span className="truncate">Aucun coordonnateur désigné</span>
                        </div>
                      )}
                    </div>

                    {/* Teachers Avatars Row */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <span className="text-xs font-bold text-slate-500">Membres du CE</span>
                      <div className="flex -space-x-2 overflow-hidden shrink-0">
                        {teachersInSubject.slice(0, 4).map((t, i) => (
                          <img
                            key={t.id || i}
                            src={t.photo}
                            alt={t.name}
                            className="inline-block h-7 w-7 sm:h-8 sm:w-8 rounded-full ring-2 ring-white object-cover"
                            title={t.name}
                          />
                        ))}
                        {teachersInSubject.length > 4 && (
                          <div className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-slate-200 text-slate-600 font-bold text-[10px] sm:text-xs ring-2 ring-white">
                            +{teachersInSubject.length - 4}
                          </div>
                        )}
                        {teachersInSubject.length === 0 && (
                          <span className="text-xs text-slate-400 font-medium italic">Aucun enseignant</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Next Meeting / Action */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between mt-auto gap-2">
                    {nextMeeting ? (
                      <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-amber-700 bg-amber-50 px-2 sm:px-2.5 py-1 rounded-xl min-w-0">
                        <Clock size={13} className="shrink-0" />
                        <span className="truncate">{nextMeeting.date}</span>
                      </div>
                    ) : (
                      <div className="text-[11px] sm:text-xs font-medium text-slate-400 truncate">
                        {subjectMeetings.length} réunion{subjectMeetings.length > 1 ? 's' : ''} au total
                      </div>
                    )}

                    <div className="flex items-center gap-0.5 text-sky-600 font-bold text-xs group-hover:translate-x-0.5 transition-transform shrink-0">
                      <span>Consulter</span>
                      <ChevronRight size={15} />
                    </div>
                  </div>
                </div>
              );
            })}

            {canManageSubjects && (
              <div
                onClick={() => setShowAddSubjectModal(true)}
                className="bg-slate-50 border-2 border-dashed border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 rounded-3xl p-6 transition-all cursor-pointer group flex flex-col items-center justify-center text-center min-h-[220px] active:scale-[0.99]"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-2xs">
                  <Plus size={24} />
                </div>
                <h3 className="font-extrabold text-slate-800 text-sm sm:text-base group-hover:text-emerald-700 transition-colors">
                  Ajouter une nouvelle matière
                </h3>
                <p className="text-xs font-semibold text-slate-400 mt-1">
                  Créer un conseil d'enseignement personnalisé
                </p>
              </div>
            )}
          </div>
        ) : (

        /* VIEW 2: DETAILED COUNCIL VIEW FOR A SELECTED SUBJECT */
        <div className="flex flex-col gap-4 sm:gap-6 animate-in fade-in duration-200">
          
          {/* TOP COUNCIL BANNER */}
          <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-xs border border-slate-100 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r ${currentSubjectObj?.color || 'from-sky-500 to-blue-600'}`} />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 pt-1">
              <div className="flex items-start gap-3 sm:gap-4 min-w-0">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${currentSubjectObj?.bgLight || 'bg-sky-50'} ${currentSubjectObj?.textColor || 'text-sky-600'} flex items-center justify-center font-bold text-xl sm:text-2xl shadow-2xs shrink-0`}>
                  <BookOpen size={24} className="sm:hidden" />
                  <BookOpen size={32} className="hidden sm:block" />
                </div>

                <div className="min-w-0 flex-1">
                  {/* Wrap badges nicely on mobile so text NEVER overflows or breaks! */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-sky-600 bg-sky-50 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg">
                      Conseil d'Enseignement
                    </span>
                    {!canEdit && (
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg flex items-center gap-1 border border-slate-200/80">
                        <Lock size={12} className="shrink-0 text-slate-400" />
                        Mode lecture seule
                      </span>
                    )}
                    <span className="text-[11px] sm:text-xs font-semibold text-slate-500">
                      Discipline : <span className="font-extrabold text-slate-800">{selectedSubject}</span>
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mt-1 truncate">
                    {selectedSubject}
                  </h2>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                    {currentTeachers.length} enseignant{currentTeachers.length > 1 ? 's' : ''} rattaché{currentTeachers.length > 1 ? 's' : ''} à ce conseil.
                  </p>
                </div>
              </div>

              {/* Coordonnateur Highlight Box */}
              <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 flex items-center gap-3 sm:gap-4 w-full lg:w-auto lg:min-w-[280px] shrink-0">
                {currentCoordonnateur ? (
                  <>
                    <img 
                      src={currentCoordonnateur.photo} 
                      alt={currentCoordonnateur.name} 
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-white shadow-xs shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] sm:text-[10px] font-extrabold text-sky-600 uppercase tracking-wider">
                          Coordonnateur CE
                        </span>
                        {canManageCoordonnateurs && (
                          <button 
                            onClick={() => setShowCoordModal(true)}
                            className="text-[11px] font-bold text-slate-500 hover:text-sky-600 underline shrink-0"
                          >
                            Changer
                          </button>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 truncate mt-0.5">
                        {currentCoordonnateur.name}
                      </p>
                      <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                        {currentCoordonnateur.email}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 w-full">
                    <span className="text-xs font-bold text-slate-500">Aucun coordonnateur désigné</span>
                    {canManageCoordonnateurs && (
                      <button 
                        onClick={() => setShowCoordModal(true)}
                        className="px-3 py-2 bg-sky-600 text-white rounded-xl font-bold text-xs hover:bg-sky-700 transition-colors w-fit active:scale-95"
                      >
                        Nommer un coordonnateur
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* TAB SELECTOR INSIDE SUBJECT VIEW */}
            <div className="flex items-center gap-2 mt-5 sm:mt-8 border-t border-slate-100 pt-4 sm:pt-6 overflow-x-auto no-scrollbar touch-pan-x pb-0.5">
              <button
                onClick={() => setActiveTabDetail('members')}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                  activeTabDetail === 'members'
                    ? 'bg-sky-600 text-white shadow-xs shadow-sky-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Users size={16} />
                <span>Membres ({currentTeachers.length})</span>
              </button>

              <button
                onClick={() => setActiveTabDetail('meetings')}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                  activeTabDetail === 'meetings'
                    ? 'bg-sky-600 text-white shadow-xs shadow-sky-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Calendar size={16} />
                <span>Réunions & PV ({currentMeetings.length})</span>
              </button>

              <button
                onClick={() => setActiveTabDetail('program')}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                  activeTabDetail === 'program'
                    ? 'bg-sky-600 text-white shadow-xs shadow-sky-100'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <FileText size={16} />
                <span>Orientations Pédagogiques</span>
              </button>
            </div>
          </div>

          {/* TAB CONTENT 1: MEMBERS LIST */}
          {activeTabDetail === 'members' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
              {currentTeachers.map((teacher) => {
                const isCoord = teacher.name === currentCoordonnateurName;
                return (
                  <div 
                    key={teacher.id}
                    className={`bg-white rounded-3xl p-4 sm:p-6 border transition-all ${
                      isCoord ? 'border-sky-300 ring-2 ring-sky-100 shadow-xs' : 'border-slate-100 shadow-xs hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <img 
                        src={teacher.photo} 
                        alt={teacher.name} 
                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover shadow-2xs border-2 border-slate-50 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        {isCoord && (
                          <span className="inline-block px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-extrabold bg-sky-100 text-sky-700 uppercase tracking-wider mb-1">
                            Coordonnateur CE
                          </span>
                        )}
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base truncate">
                          {teacher.name}
                        </h4>
                        <p className="text-xs font-semibold text-sky-600 truncate mt-0.5">
                          Prof. de {teacher.subject}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {teacher.email}
                        </p>
                      </div>
                    </div>

                    {/* Classes Taught */}
                    <div className="bg-slate-50 rounded-2xl p-2.5 sm:p-3 mb-3 sm:mb-4">
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Classes Enseignées
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {teacher.principalClasses && teacher.principalClasses.length > 0 ? (
                          teacher.principalClasses.map((cls, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-bold shadow-2xs">
                              {cls}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 font-medium italic">Classes collège & lycée</span>
                        )}
                      </div>
                    </div>

                    {/* Contact Button */}
                    <button
                      onClick={() => setTeacherContactModal(teacher)}
                      className="w-full py-2.5 sm:py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                    >
                      <Mail size={15} />
                      <span>Contacter l'enseignant</span>
                    </button>
                  </div>
                );
              })}

              {currentTeachers.length === 0 && (
                <div className="col-span-full bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-100">
                  <GraduationCap className="mx-auto text-slate-300 mb-3" size={36} />
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">Aucun professeur répertorié</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                    Les enseignants enregistrés dans cette discipline apparaîtront automatiquement ici.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB CONTENT 2: MEETINGS & PROCES-VERBAUX */}
          {activeTabDetail === 'meetings' && (
            <div className="flex flex-col gap-4 sm:gap-6">
              
              {/* Header Actions for Meetings */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white rounded-2xl p-4 border border-slate-100">
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">
                    Historique des Conseils & Compte-rendus
                  </h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">
                    Consultez les réunions tenues et planifiez les prochaines sessions de concertation.
                  </p>
                </div>

                {canEdit && (
                  <button
                    onClick={() => setShowAddMeetingModal(true)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs sm:text-sm transition-colors shadow-xs shadow-sky-100 shrink-0 active:scale-95"
                  >
                    <Plus size={16} />
                    <span>Planifier une réunion</span>
                  </button>
                )}
              </div>

              {/* Meetings List */}
              <div className="space-y-3.5 sm:space-y-4">
                {currentMeetings.map((meeting) => (
                  <div 
                    key={meeting.id}
                    className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row gap-4 sm:gap-6 items-start justify-between"
                  >
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0 w-full">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        meeting.status === 'terminee' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {meeting.status === 'terminee' ? <CheckCircle2 size={20} className="sm:hidden" /> : <Clock size={20} className="sm:hidden" />}
                        {meeting.status === 'terminee' ? <CheckCircle2 size={24} className="hidden sm:block" /> : <Clock size={24} className="hidden sm:block" />}
                      </div>

                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold ${
                            meeting.status === 'terminee' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {meeting.status === 'terminee' ? 'PV Validé' : 'Planifiée'}
                          </span>
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                            <Calendar size={13} className="shrink-0" />
                            <span>{meeting.date}</span>
                            <span className="text-slate-400">({meeting.time})</span>
                          </span>
                          <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                            <Building2 size={13} className="shrink-0" />
                            <span className="truncate max-w-[140px]">{meeting.location}</span>
                          </span>
                        </div>

                        <h4 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
                          {meeting.title}
                        </h4>

                        <div className="bg-slate-50 p-3 sm:p-3.5 rounded-2xl border border-slate-100/80 text-xs sm:text-sm font-medium text-slate-700 space-y-1.5 leading-relaxed">
                          <p><strong className="text-slate-900 font-bold">Ordre du jour :</strong> {meeting.agenda}</p>
                          {meeting.decisions && (
                            <p className="text-emerald-900 bg-emerald-50/70 p-2 sm:p-2.5 rounded-xl border border-emerald-100 mt-2">
                              <strong className="text-emerald-950 font-bold">Décisions :</strong> {meeting.decisions}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    {canEdit && (
                      <div className="flex sm:flex-col gap-2 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                        <button
                          onClick={() => {
                            setEditingMeetingId(meeting.id);
                            setNewMeeting({
                              title: meeting.title,
                              date: meeting.date,
                              time: meeting.time,
                              location: meeting.location,
                              agenda: meeting.agenda,
                              decisions: meeting.decisions || ''
                            });
                            setShowAddMeetingModal(true);
                          }}
                          className="flex-1 sm:flex-none px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => setDeletingMeetingId(meeting.id)}
                          className="flex-1 sm:flex-none px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                          title="Supprimer la réunion / le PV"
                        >
                          <Trash2 size={14} />
                          <span>Supprimer</span>
                        </button>
                        {meeting.status === 'terminee' && (
                          <button
                            onClick={() => {
                              const savedAnnonces = localStorage.getItem('school_db_announcements');
                              let annonces = [];
                              try { if(savedAnnonces) annonces = JSON.parse(savedAnnonces); } catch(e) {}
                              const newAnnonce = {
                                id: `a-${Date.now()}`,
                                title: `PV Validé : ${meeting.title}`,
                                category: 'reunion',
                                date: new Date().toLocaleDateString('fr-FR'),
                                targetAudience: 'Tous les professeurs',
                                description: `**Ordre du jour:** ${meeting.agenda}\n\n**Décisions:** ${meeting.decisions || 'Non renseignées'}`,
                                isPinned: false
                              };
                              annonces = [newAnnonce, ...annonces];
                              localStorage.setItem('school_db_announcements', JSON.stringify(annonces));

                              // Web Notification if allowed
                              if ('Notification' in window && Notification.permission === 'granted') {
                                new Notification(`📢 PV Validé : ${meeting.title}`, {
                                  body: meeting.decisions || meeting.agenda,
                                  icon: '/icone.png'
                                });
                              }

                              alert('Le PV a été publié dans la page Annonces avec succès !');
                            }}
                            className="flex-1 sm:flex-none px-3 py-2 bg-sky-100 text-sky-700 hover:bg-sky-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                            title="Publier ce PV dans les Annonces"
                          >
                            <Send size={14} />
                            <span>Publier</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {currentMeetings.length === 0 && (
                  <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-100">
                    <Calendar className="mx-auto text-slate-300 mb-3" size={36} />
                    <h3 className="text-base sm:text-lg font-bold text-slate-800">Aucune réunion enregistrée</h3>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
                      Planifiez la première réunion du Conseil d'Enseignement de {selectedSubject} pour fixer le calendrier des évaluations et la progression du programme.
                    </p>
                    {canEdit && (
                      <button
                        onClick={() => setShowAddMeetingModal(true)}
                        className="mt-4 px-4 py-2.5 bg-sky-600 text-white font-bold rounded-xl text-xs hover:bg-sky-700 inline-flex items-center gap-2 active:scale-95"
                      >
                        <Plus size={16} />
                        <span>Planifier maintenant</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB CONTENT 3: PROGRAM & DIRECTIVES */}
          {activeTabDetail === 'program' && (
            <div className="bg-white rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-100 shadow-xs space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    Directives & Progression Annuelle — {selectedSubject}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                    Cadre de travail, orientations pédagogiques et ressources officielles pour tous les enseignants.
                  </p>
                </div>
                {canEdit && (
                  <button
                    onClick={() => {
                      setEditingOrientationId(null);
                      setOrientationForm({ title: '', description: '', colorTheme: 'sky' });
                      setShowOrientationModal(true);
                    }}
                    className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shrink-0 transition-colors shadow-xs active:scale-95"
                  >
                    <Plus size={16} />
                    <span>Ajouter une orientation</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {currentOrientations.map((item, idx) => {
                  const getTheme = (color?: string) => {
                    switch (color) {
                      case 'purple': return { bg: 'bg-purple-50/70 border-purple-100', num: 'bg-purple-500' };
                      case 'emerald': return { bg: 'bg-emerald-50/70 border-emerald-100', num: 'bg-emerald-500' };
                      case 'amber': return { bg: 'bg-amber-50/70 border-amber-100', num: 'bg-amber-500' };
                      case 'rose': return { bg: 'bg-rose-50/70 border-rose-100', num: 'bg-rose-500' };
                      case 'indigo': return { bg: 'bg-indigo-50/70 border-indigo-100', num: 'bg-indigo-500' };
                      default: return { bg: 'bg-sky-50/70 border-sky-100', num: 'bg-sky-500' };
                    }
                  };
                  const theme = getTheme(item.colorTheme);

                  return (
                    <div 
                      key={item.id} 
                      className={`p-4 sm:p-5 rounded-2xl border flex flex-col justify-between gap-3.5 ${theme.bg} transition-all hover:shadow-xs`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${theme.num} text-white flex items-center justify-center shrink-0 font-extrabold text-sm sm:text-base shadow-xs`}>
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug">
                            {item.title}
                          </h4>
                          <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {canEdit && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/50">
                          <button
                            onClick={() => {
                              setEditingOrientationId(item.id);
                              setOrientationForm({
                                title: item.title,
                                description: item.description,
                                colorTheme: item.colorTheme || 'sky'
                              });
                              setShowOrientationModal(true);
                            }}
                            className="px-3 py-1.5 bg-white/90 hover:bg-white text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1.5 border border-slate-200 transition-colors shadow-2xs active:scale-95"
                          >
                            <Pencil size={13} />
                            <span>Modifier</span>
                          </button>
                          <button
                            onClick={() => setDeletingOrientationId(item.id)}
                            className="px-3 py-1.5 bg-white/90 hover:bg-rose-50 text-rose-600 font-bold rounded-lg text-xs flex items-center gap-1.5 border border-rose-200 transition-colors shadow-2xs active:scale-95"
                          >
                            <Trash2 size={13} />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {currentOrientations.length === 0 && (
                  <div className="col-span-full text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-xs font-bold text-slate-500">Aucune orientation pédagogique enregistrée pour cette discipline.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
        )}
      </div>

      {/* MODAL 1: ADD MEETING / PROCES VERBAL */}
      <AnimatePresence>
        {showAddMeetingModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowAddMeetingModal(false); setEditingMeetingId(null); setNewMeeting({title:'', date:'', time:'', location:'Salle des Professeurs 1', agenda:'', decisions:''}); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 bg-white rounded-3xl p-5 sm:p-6 md:p-8 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                    {editingMeetingId ? 'Éditer le Conseil' : 'Planifier un Conseil'}
                  </h3>
                  <p className="text-xs font-semibold text-sky-600 mt-0.5">
                    Discipline : {selectedSubject}
                  </p>
                </div>
                <button
                  onClick={() => { setShowAddMeetingModal(false); setEditingMeetingId(null); setNewMeeting({title:'', date:'', time:'', location:'Salle des Professeurs 1', agenda:'', decisions:''}); }}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddMeetingSubmit} className="space-y-3.5 sm:space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Titre ou Sujet principal
                  </label>
                  <input
                    type="text"
                    required
                    value={newMeeting.title}
                    onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                    placeholder="Ex: Conseil de préparation des compositions T1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Date
                    </label>
                    <input
                      type="text"
                      value={newMeeting.date}
                      onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                      placeholder="Ex: 12 Décembre 2024"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Horaire
                    </label>
                    <input
                      type="text"
                      value={newMeeting.time}
                      onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                      placeholder="Ex: 15:00 - 17:00"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Lieu
                  </label>
                  <input
                    type="text"
                    value={newMeeting.location}
                    onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                    placeholder="Ex: Salle des Professeurs 1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Ordre du jour & Points à aborder
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={newMeeting.agenda}
                    onChange={(e) => setNewMeeting({ ...newMeeting, agenda: e.target.value })}
                    placeholder="Précisez les thèmes d'harmonisation, examens blancs, devoirs communs..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Procès-Verbal / Décisions (Optionnel)
                  </label>
                  <textarea
                    rows={2}
                    value={newMeeting.decisions}
                    onChange={(e) => setNewMeeting({ ...newMeeting, decisions: e.target.value })}
                    placeholder="Résultats ou engagements pris lors de la réunion..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setShowAddMeetingModal(false); setEditingMeetingId(null); setNewMeeting({title:'', date:'', time:'', location:'Salle des Professeurs 1', agenda:'', decisions:''}); }}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs shadow-xs shadow-sky-100 active:scale-95"
                  >
                    Enregistrer la réunion
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CHANGE COORDONNATEUR */}
      <AnimatePresence>
        {showCoordModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCoordModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 bg-white rounded-3xl p-5 sm:p-6 md:p-8 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    Nommer un Coordonnateur
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    Conseil d'Enseignement : {selectedSubject}
                  </p>
                </div>
                <button
                  onClick={() => setShowCoordModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs font-medium text-slate-600 mb-3.5 leading-relaxed">
                Sélectionnez un enseignant parmi les membres du conseil pour assurer la coordination pédagogique :
              </p>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {currentTeachers.map((t) => {
                  const isSelected = t.name === currentCoordonnateurName;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectCoordonnateur(t.name)}
                      className={`w-full p-2.5 sm:p-3 rounded-2xl flex items-center gap-3 border transition-all text-left active:scale-[0.98] ${
                        isSelected 
                          ? 'bg-sky-50 border-sky-300 ring-2 ring-sky-100' 
                          : 'bg-slate-50 border-slate-200 hover:border-sky-200 hover:bg-white'
                      }`}
                    >
                      <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{t.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{t.email}</p>
                      </div>
                      {isSelected && <CheckCircle2 className="text-sky-600 shrink-0" size={18} />}
                    </button>
                  );
                })}

                {currentTeachers.length === 0 && (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    Aucun enseignant disponible pour cette discipline.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: TEACHER CONTACT BOTTOM SHEET */}
      <AnimatePresence>
        {teacherContactModal && (
          <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTeacherContactModal(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border-t sm:border border-slate-100 flex flex-col items-center text-center space-y-4"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-1 sm:hidden" />
              <button
                onClick={() => setTeacherContactModal(null)}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center space-y-2 pt-1">
                <img 
                  src={teacherContactModal.photo} 
                  alt={teacherContactModal.name} 
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-md ring-4 ring-slate-50"
                />
                <div>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">{teacherContactModal.name}</h3>
                  <p className="text-xs sm:text-sm font-semibold text-sky-600">Discipline : {teacherContactModal.subject}</p>
                </div>
              </div>

              <div className="w-full bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-100 flex items-center justify-center gap-2.5 min-w-0">
                <Mail className="text-slate-400 shrink-0" size={18} />
                <span className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">
                  {teacherContactModal.email || `${teacherContactModal.name.toLowerCase().replace(/\s+/g, '.')}@ecole.com`}
                </span>
              </div>

              <a
                href={`mailto:${teacherContactModal.email || `${teacherContactModal.name.toLowerCase().replace(/\s+/g, '.')}@ecole.com`}`}
                className="w-full py-3 sm:py-3.5 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-md flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all text-xs sm:text-sm"
              >
                <Mail size={16} />
                <span>Envoyer un E-mail</span>
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: CONFIRM DELETE MEETING */}
      <AnimatePresence>
        {deletingMeetingId && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingMeetingId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Confirmer la suppression</h3>
                <p className="text-xs font-medium text-slate-500 mt-1.5 leading-relaxed">
                  Voulez-vous vraiment supprimer cette réunion / ce PV du Conseil d'Enseignement ? Cette action est irréversible.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeletingMeetingId(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setMeetings(prev => prev.filter(m => m.id !== deletingMeetingId));
                    setDeletingMeetingId(null);
                  }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm active:scale-95"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: ADD / EDIT ORIENTATION */}
      <AnimatePresence>
        {showOrientationModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowOrientationModal(false); setEditingOrientationId(null); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">
                    {editingOrientationId ? 'Modifier l\'Orientation Pédagogique' : 'Ajouter une Orientation Pédagogique'}
                  </h3>
                  <p className="text-xs font-semibold text-sky-600 mt-0.5">
                    Discipline : {selectedSubject}
                  </p>
                </div>
                <button
                  onClick={() => { setShowOrientationModal(false); setEditingOrientationId(null); }}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveOrientation} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Titre de l'orientation / directive
                  </label>
                  <input
                    type="text"
                    required
                    value={orientationForm.title}
                    onChange={(e) => setOrientationForm({ ...orientationForm, title: e.target.value })}
                    placeholder="Ex: Harmonisation des devoirs communs"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Description / Directives détaillées
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={orientationForm.description}
                    onChange={(e) => setOrientationForm({ ...orientationForm, description: e.target.value })}
                    placeholder="Détaillez les exigences ou recommandations pédagogiques..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Thème Couleur
                  </label>
                  <select
                    value={orientationForm.colorTheme}
                    onChange={(e) => setOrientationForm({ ...orientationForm, colorTheme: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="sky">Bleu (Sky)</option>
                    <option value="purple">Violet (Purple)</option>
                    <option value="emerald">Vert (Emerald)</option>
                    <option value="amber">Ambre (Amber)</option>
                    <option value="rose">Rose (Rose)</option>
                    <option value="indigo">Indigo (Indigo)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowOrientationModal(false); setEditingOrientationId(null); }}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs active:scale-95"
                  >
                    {editingOrientationId ? 'Enregistrer' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 6: CONFIRM DELETE ORIENTATION */}
      <AnimatePresence>
        {deletingOrientationId && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingOrientationId(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Confirmer la suppression</h3>
                <p className="text-xs font-medium text-slate-500 mt-1.5 leading-relaxed">
                  Voulez-vous vraiment supprimer cette orientation pédagogique ? Cette action est irréversible.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setDeletingOrientationId(null)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleDeleteOrientation(deletingOrientationId)}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm active:scale-95"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 7: ADD NEW SUBJECT */}
      <AnimatePresence>
        {showAddSubjectModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddSubjectModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Nouvelle Matière</h3>
                    <p className="text-xs font-semibold text-slate-400">Ajouter une discipline au Conseil d'Enseignement</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddSubjectModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddSubjectSubmit} className="space-y-4 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nom de la matière
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="Ex: Espagnol, Économie, Musique, Arts Plastiques..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Couleur du thème
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {COLOR_THEMES.map((theme, idx) => (
                      <button
                        key={theme.name}
                        type="button"
                        onClick={() => setSelectedThemeIdx(idx)}
                        className={`p-2 rounded-xl text-left border flex items-center gap-2 transition-all cursor-pointer ${
                          selectedThemeIdx === idx
                            ? 'border-emerald-500 ring-2 ring-emerald-100 bg-emerald-50/50'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${theme.color} shrink-0`} />
                        <span className="text-[11px] font-bold text-slate-700 truncate">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddSubjectModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm active:scale-95 cursor-pointer"
                  >
                    Ajouter la matière
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </main>
    </div>
  );
};
