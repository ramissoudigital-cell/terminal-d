import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Pin, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  Sparkles, 
  X, 
  CheckCircle2, 
  PartyPopper, 
  Bus, 
  FileCheck, 
  GraduationCap, 
  Megaphone, 
  Bookmark, 
  Share2,
  Info,
  BookOpen,
  Layers,
  Award,
  CalendarDays,
  Briefcase,
  Check,
  Building2,
  CalendarRange,
  Printer,
  ArrowLeft
} from 'lucide-react';
import { User } from '../types';
import { CustomSelect } from './CustomSelect';
import { 
  subscribeToRealtimeCollection, 
  saveRealtimeDocument, 
  deleteRealtimeDocument 
} from '../src/services/firebaseService';

const CATEGORY_OPTIONS = [
  { label: '📢 Information Générale', value: 'info' },
  { label: '🎓 Examen & Évaluation', value: 'examen' },
  { label: '📜 Remise de Bulletins', value: 'remise_bulletin' },
  { label: '🚌 Sortie Scolaire & Voyage', value: 'sortie' },
  { label: '🎉 Fête & Kermesse / Sport', value: 'fete' },
  { label: '👥 Réunion Parents-Professeurs', value: 'reunion' },
];

export interface Announcement {
  id: string;
  title: string;
  category: 'examen' | 'remise_bulletin' | 'sortie' | 'fete' | 'reunion' | 'info';
  date: string; // YYYY-MM-DD or formatted string
  time?: string;
  location?: string;
  targetAudience: string; // e.g., 'Toutes les classes', '3ème & Terminale', etc.
  description: string;
  isUrgent?: boolean;
  isPinned?: boolean;
  author: string;
  authorId?: string;
  authorEmail?: string;
  createdAt: string;
  notes?: string;
  likesCount?: number;
}

export interface DutyScheduleItem {
  id: string;
  stream: 'general' | 'technique';
  period: 'T1' | 'T2' | 'T3' | 'S1' | 'S2';
  className: string; // e.g. "6ème", "3ème", "Terminale D", "1ère G2", "Toutes les classes"
  dayOfWeek: 'Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi';
  subject: string;
  title: string; // e.g. "Devoir Surveillé N°1", "Interrogation Écrite", "TP Pratique", "Devoir de Synthèse"
  time?: string; // e.g. "08h00 - 10h00"
  location?: string; // e.g. "Salle 12", "Amphi A", "Labo"
  coefficient?: number;
  teacher?: string;
  notes?: string;
}

interface AnnouncementsPageProps {
  currentUser?: User | null;
  onNavigate?: (page: string) => void;
}

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [];

const DEFAULT_DUTY_ITEMS: DutyScheduleItem[] = [
  // ================= GENERAL STREAM (3 TRIMESTRES) =================
  // Trimestre 1 - Général
  {
    id: 'duty-gen-t1-1',
    stream: 'general',
    period: 'T1',
    className: '3ème & Terminale D',
    dayOfWeek: 'Lundi',
    subject: 'Mathématiques',
    title: 'Devoir Surveillé N°1',
    time: '08h00 - 10h00',
    location: 'Salles Examen 1 & 2',
    coefficient: 4,
    teacher: 'M. KOUASSI',
    notes: 'Calculatrice scientifique autorisée.'
  },
  {
    id: 'duty-gen-t1-2',
    stream: 'general',
    period: 'T1',
    className: '6ème & 5ème',
    dayOfWeek: 'Lundi',
    subject: 'Français',
    title: 'Dictée & Orthographe / Redaction',
    time: '10h00 - 11h30',
    location: 'Salles habituelles',
    coefficient: 2,
    teacher: 'Mme TAHIRI',
    notes: 'Révision de la conjugaison et règles de grammaire.'
  },
  {
    id: 'duty-gen-t1-3',
    stream: 'general',
    period: 'T1',
    className: 'Toutes les classes (Général)',
    dayOfWeek: 'Mardi',
    subject: 'Histoire-Géographie',
    title: 'Devoir de Niveau T1',
    time: '08h00 - 10h00',
    location: 'Bâtiment B',
    coefficient: 3,
    teacher: 'M. YAO',
    notes: 'Apporter crayons de couleur pour le croquis.'
  },
  {
    id: 'duty-gen-t1-4',
    stream: 'general',
    period: 'T1',
    className: '4ème, 3ème, 2nde C, 1ère D, Tle D',
    dayOfWeek: 'Mercredi',
    subject: 'Physique-Chimie',
    title: 'Interrogation Écrite & TP',
    time: '08h00 - 10h00',
    location: 'Laboratoire de Sciences',
    coefficient: 3,
    teacher: 'M. BÉHI',
    notes: 'Blouse blanche obligatoire.'
  },
  {
    id: 'duty-gen-t1-5',
    stream: 'general',
    period: 'T1',
    className: '1ère A & Terminale A',
    dayOfWeek: 'Jeudi',
    subject: 'Philosophie & Littérature',
    title: 'Dissertation Philosophique N°1',
    time: '08h00 - 12h00',
    location: 'Grande Salle de Conférence',
    coefficient: 5,
    teacher: 'Dr. DIABATÉ',
    notes: 'Analyse méthodique de texte.'
  },
  {
    id: 'duty-gen-t1-6',
    stream: 'general',
    period: 'T1',
    className: 'Toutes les classes (Général)',
    dayOfWeek: 'Vendredi',
    subject: 'Anglais & LV2 (Allemand / Espagnol)',
    title: 'Devoir de Compréhension & Expression',
    time: '10h00 - 12h00',
    location: 'Salles de cours',
    coefficient: 2,
    teacher: 'Mme KONÉ',
    notes: 'Épreuve orale et écrite combinée.'
  },
  {
    id: 'duty-gen-t1-7',
    stream: 'general',
    period: 'T1',
    className: '3ème & Terminale',
    dayOfWeek: 'Samedi',
    subject: 'SVT (Sciences de la Vie et de la Terre)',
    title: 'Devoir de Synthèse T1',
    time: '08h00 - 11h00',
    location: 'Amphithéâtre Principal',
    coefficient: 4,
    teacher: 'M. COULIBALY',
    notes: 'Exercices de génétique et biologie.'
  },

  // Trimestre 2 - Général
  {
    id: 'duty-gen-t2-1',
    stream: 'general',
    period: 'T2',
    className: 'Toutes les classes (Général)',
    dayOfWeek: 'Lundi',
    subject: 'Français / Composition',
    title: 'Devoir Surveillé T2',
    time: '08h00 - 11h00',
    location: 'Salles de classe',
    coefficient: 3,
    teacher: 'Mme TAHIRI'
  },
  {
    id: 'duty-gen-t2-2',
    stream: 'general',
    period: 'T2',
    className: '3ème & Terminale',
    dayOfWeek: 'Mercredi',
    subject: 'Mathématiques & Sciences',
    title: 'Examen Blanc Régional / Pré-Bac',
    time: '08h00 - 12h00',
    location: 'Centre d\'Examen',
    coefficient: 5,
    teacher: 'Équipe Pédagogique'
  },

  // Trimestre 3 - Général
  {
    id: 'duty-gen-t3-1',
    stream: 'general',
    period: 'T3',
    className: '3ème & Terminale',
    dayOfWeek: 'Lundi',
    subject: 'Toutes les Matières',
    title: 'Examens Blancs Nationaux (BEPC / BAC)',
    time: '07h30 - 16h30',
    location: 'Centre d\'Examen Agréé',
    coefficient: 5,
    teacher: 'Jury d\'Examen'
  },

  // ================= TECHNICAL & PROFESSIONAL STREAM (2 SEMESTRES) =================
  // Semestre 1 - Technique
  {
    id: 'duty-tech-s1-1',
    stream: 'technique',
    period: 'S1',
    className: '1ère G1, 1ère G2, Tle G1, Tle G2, BT Compta',
    dayOfWeek: 'Lundi',
    subject: 'Comptabilité Générale & Analytique',
    title: 'Devoir de Synthèse S1',
    time: '08h00 - 11h00',
    location: 'Salle Informatique & Gestion',
    coefficient: 4,
    teacher: 'M. SANOGO',
    notes: 'Calculatrice non programmable et plan comptable SYSCOHADA requis.'
  },
  {
    id: 'duty-tech-s1-2',
    stream: 'technique',
    period: 'S1',
    className: '2nde ST, 1ère G1, Tle G1',
    dayOfWeek: 'Mardi',
    subject: 'Bureautique & Communication Administrative',
    title: 'TP Évaluation Pratique sur Ordinateur',
    time: '08h00 - 11h00',
    location: 'Salle Multimédia 1',
    coefficient: 3,
    teacher: 'Mme N\'GUESSAN',
    notes: 'Traitement de texte Word, Excel et saisie rapide.'
  },
  {
    id: 'duty-tech-s1-3',
    stream: 'technique',
    period: 'S1',
    className: 'Toutes les filières Techniques (G1, G2, F, BT, CAP)',
    dayOfWeek: 'Mercredi',
    subject: 'Droit commercial & Économie d\'Entreprise',
    title: 'Devoir Surveillé de Mi-Semestre S1',
    time: '08h00 - 10h00',
    location: 'Amphi B',
    coefficient: 3,
    teacher: 'Me KASSI',
    notes: 'Étude de cas juridique et analyse de contrat.'
  },
  {
    id: 'duty-tech-s1-4',
    stream: 'technique',
    period: 'S1',
    className: '1ère F1, F2, F3 & BT Électrotechnique / Mécanique',
    dayOfWeek: 'Jeudi',
    subject: 'Dessin Technique & Schéma Électrique',
    title: 'Épreuve Pratique en Atelier',
    time: '08h00 - 12h00',
    location: 'Atelier Industriel',
    coefficient: 5,
    teacher: 'M. TRAORÉ',
    notes: 'Tenue de sécurité et matériel de dessin complets.'
  },
  {
    id: 'duty-tech-s1-5',
    stream: 'technique',
    period: 'S1',
    className: 'Toutes filières Techniques',
    dayOfWeek: 'Vendredi',
    subject: 'Français Professionnel & Anglais Commercial',
    title: 'Devoir d\'Expression & Correspondance',
    time: '09h00 - 11h00',
    location: 'Salles de cours',
    coefficient: 2,
    teacher: 'Mme CISSE'
  },

  // Semestre 2 - Technique
  {
    id: 'duty-tech-s2-1',
    stream: 'technique',
    period: 'S2',
    className: 'BT, CAP, Terminales Techniques',
    dayOfWeek: 'Lundi',
    subject: 'Pratique Professionnelle / Projet Tutoré',
    title: 'Soutenance de Stage & Épreuve Pratique S2',
    time: '08h00 - 14h00',
    location: 'Ateliers & Salles de Jury',
    coefficient: 6,
    teacher: 'Jury Professionnel'
  }
];

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ currentUser, onNavigate }) => {

  const isPrimary = currentUser?.section === 'Primaire';

  // Navigation tab state: 'announcements' or 'duty_schedule'
  const [activeTab, setActiveTab] = useState<'announcements' | 'duty_schedule'>('announcements');

  // Duty Schedule Specific States
  const [dutyStream, setDutyStream] = useState<'general' | 'technique'>('general');
  const [dutyPeriod, setDutyPeriod] = useState<'T1' | 'T2' | 'T3' | 'S1' | 'S2'>('T1');
  const [dutyClassFilter, setDutyClassFilter] = useState<string>('all');
  const [dutyViewMode, setDutyViewMode] = useState<'weekly' | 'list'>('weekly');
  const [dutySearch, setDutySearch] = useState('');

  // Automatically adjust duty period when switching stream
  useEffect(() => {
    if (dutyStream === 'general' && !['T1', 'T2', 'T3'].includes(dutyPeriod)) {
      setDutyPeriod('T1');
    } else if (dutyStream === 'technique' && !['S1', 'S2'].includes(dutyPeriod)) {
      setDutyPeriod('S1');
    }
  }, [dutyStream]);

  const AUDIENCE_FILTER_OPTIONS = isPrimary ? [
    { label: 'Toutes les cibles', value: 'all' },
    { label: 'Toutes les classes', value: 'Toutes les classes' },
    { label: 'CP1', value: 'CP1' },
    { label: 'CP2', value: 'CP2' },
    { label: 'CE1', value: 'CE1' },
    { label: 'CE2', value: 'CE2' },
    { label: 'CM1', value: 'CM1' },
    { label: 'CM2', value: 'CM2' },
    { label: 'Parents', value: 'Parents' },
    { label: 'Professeurs', value: 'Professeurs' },
  ] : [
    { label: 'Toutes les cibles', value: 'all' },
    { label: 'Toutes les classes', value: 'Toutes les classes' },
    { label: '6ème', value: '6ème' },
    { label: '5ème', value: '5ème' },
    { label: '4ème', value: '4ème' },
    { label: '3ème', value: '3ème' },
    { label: 'Seconde', value: 'Seconde' },
    { label: 'Première', value: 'Première' },
    { label: 'Terminale', value: 'Terminale' },
    { label: 'Parents', value: 'Parents' },
    { label: 'Professeurs', value: 'Professeurs' },
  ];

  const TARGET_AUDIENCE_OPTIONS = isPrimary ? [
    { label: 'Toutes les classes', value: 'Toutes les classes' },
    { label: 'CP1', value: 'CP1' },
    { label: 'CP2', value: 'CP2' },
    { label: 'CE1', value: 'CE1' },
    { label: 'CE2', value: 'CE2' },
    { label: 'CM1', value: 'CM1' },
    { label: 'CM2', value: 'CM2' },
    { label: 'CM2 & CM1', value: 'CM2 & CM1' },
    { label: 'Parents', value: 'Parents' },
    { label: 'Professeurs', value: 'Professeurs' },
  ] : [
    { label: 'Toutes les classes', value: 'Toutes les classes' },
    { label: '6ème', value: '6ème' },
    { label: '5ème', value: '5ème' },
    { label: '4ème', value: '4ème' },
    { label: '3ème', value: '3ème' },
    { label: 'Seconde', value: 'Seconde' },
    { label: 'Première', value: 'Première' },
    { label: 'Terminale', value: 'Terminale' },
    { label: '3ème & Terminale', value: '3ème & Terminale' },
    { label: 'Parents', value: 'Parents' },
    { label: 'Professeurs', value: 'Professeurs' },
  ];

  // Announcements State
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('school_db_announcements');
    if (saved) {
      try {
        const parsed: Announcement[] = JSON.parse(saved);
        const filtered = parsed.filter(a => !['ann-default-1', 'ann-default-2', 'ann-1', 'ann-2', 'ann-3', 'ann-4', 'ann-5'].includes(a.id));
        return filtered;
      } catch (e) {}
    }
    return DEFAULT_ANNOUNCEMENTS;
  });

  // Duty Schedules State
  const [dutyItems, setDutyItems] = useState<DutyScheduleItem[]>(() => {
    const saved = localStorage.getItem('school_db_duty_schedules');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return DEFAULT_DUTY_ITEMS;
  });

  // Filters & Search for Announcements
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('school_bookmarked_announcements');
    return saved ? JSON.parse(saved) : [];
  });

  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);

  // Duty Modal State
  const [showDutyModal, setShowDutyModal] = useState(false);
  const [editingDutyItem, setEditingDutyItem] = useState<DutyScheduleItem | null>(null);
  const [dutyToDelete, setDutyToDelete] = useState<DutyScheduleItem | null>(null);

  // Announcement Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'info' as Announcement['category'],
    date: '',
    time: '',
    location: '',
    targetAudience: 'Toutes les classes',
    description: '',
    notes: '',
    isUrgent: false,
    isPinned: false
  });

  // Duty Form State
  const [dutyFormData, setDutyFormData] = useState<Omit<DutyScheduleItem, 'id'>>({
    stream: 'general',
    period: 'T1',
    className: 'Toutes les classes',
    dayOfWeek: 'Lundi',
    subject: '',
    title: 'Devoir Surveillé',
    time: '08h00 - 10h00',
    location: 'Salles de cours',
    coefficient: 2,
    teacher: '',
    notes: ''
  });

  // Realtime Sync & LocalStorage for Announcements
  useEffect(() => {
    const unsub = subscribeToRealtimeCollection<Announcement>('announcements', (items) => {
      if (items && items.length > 0) {
        setAnnouncements(items);
      }
    });
    return () => unsub();
  }, []);

  // Realtime Sync & LocalStorage for Duty Schedules
  useEffect(() => {
    const unsub = subscribeToRealtimeCollection<DutyScheduleItem>('duty_schedules', (items) => {
      if (items && items.length > 0) {
        setDutyItems(items);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem('school_db_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('school_db_duty_schedules', JSON.stringify(dutyItems));
  }, [dutyItems]);

  useEffect(() => {
    localStorage.setItem('school_bookmarked_announcements', JSON.stringify(bookmarkedIds));
  }, [bookmarkedIds]);

  // Handle bottom navigation hiding/showing when modal is open
  useEffect(() => {
    if (showAddModal || showDutyModal || !!announcementToDelete || !!dutyToDelete) {
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: true } }));
      window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: true } }));
    } else {
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: false } }));
      window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: false } }));
    }

    return () => {
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: false } }));
      window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: false } }));
    };
  }, [showAddModal, showDutyModal, announcementToDelete, dutyToDelete]);

  const allowedLevels = [2, 3, 4, 5];
  const canManage = currentUser ? (
    allowedLevels.includes(currentUser.accessLevel) ||
    currentUser.role === 'educator' ||
    currentUser.role === 'cashier' ||
    currentUser.role === 'director' ||
    currentUser.role === 'teacher' ||
    currentUser.role === 'admin'
  ) : true;

  const isTeacherRole = currentUser?.role === 'teacher' || currentUser?.role === 'professeur' || currentUser?.accessLevel === 3;

  const isAnnouncementAuthor = (ann: Announcement) => {
    if (!currentUser) return false;
    if (ann.authorId && String(ann.authorId) === String(currentUser.id)) return true;
    if (ann.authorEmail && currentUser.email && ann.authorEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
    if (ann.author && currentUser.name && ann.author.trim().toLowerCase() === currentUser.name.trim().toLowerCase()) return true;
    return false;
  };

  const canEditOrDeleteAnnouncement = (ann: Announcement) => {
    if (!canManage) return false;
    if (isTeacherRole) {
      return isAnnouncementAuthor(ann);
    }
    return true;
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnnouncements(prev => prev.map(ann => {
      if (ann.id === id) {
        const updated = { ...ann, likesCount: (ann.likesCount || 0) + 1 };
        saveRealtimeDocument('announcements', ann.id, updated).catch(console.error);
        return updated;
      }
      return ann;
    }));
  };

  const handleOpenAdd = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      category: 'info',
      date: new Date().toISOString().split('T')[0],
      time: '08h00 - 12h00',
      location: 'Salles de classe / Cour',
      targetAudience: 'Toutes les classes',
      description: '',
      notes: '',
      isUrgent: false,
      isPinned: false
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (ann: Announcement, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEditOrDeleteAnnouncement(ann)) {
      alert("Accès refusé : Vous ne pouvez modifier que les publications dont vous êtes l'auteur.");
      return;
    }
    setEditingAnnouncement(ann);
    setFormData({
      title: ann.title,
      category: ann.category,
      date: ann.date,
      time: ann.time || '',
      location: ann.location || '',
      targetAudience: ann.targetAudience,
      description: ann.description,
      notes: ann.notes || '',
      isUrgent: !!ann.isUrgent,
      isPinned: !!ann.isPinned
    });
    setShowAddModal(true);
  };

  const handleDelete = (ann: Announcement, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEditOrDeleteAnnouncement(ann)) {
      alert("Accès refusé : Vous ne pouvez supprimer que les publications dont vous êtes l'auteur.");
      return;
    }
    setAnnouncementToDelete(ann);
  };

  const confirmDelete = () => {
    if (!announcementToDelete) return;
    const idToDelete = announcementToDelete.id;
    setAnnouncements(prev => prev.filter(a => a.id !== idToDelete));
    deleteRealtimeDocument('announcements', idToDelete).catch(console.error);
    setAnnouncementToDelete(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Veuillez renseigner le titre et la description.');
      return;
    }

    if (editingAnnouncement) {
      const updatedAnn: Announcement = {
        ...editingAnnouncement,
        title: formData.title,
        category: formData.category,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        targetAudience: formData.targetAudience,
        description: formData.description,
        notes: formData.notes,
        isUrgent: formData.isUrgent,
        isPinned: formData.isPinned
      };
      setAnnouncements(prev => prev.map(a => a.id === editingAnnouncement.id ? updatedAnn : a));
      saveRealtimeDocument('announcements', editingAnnouncement.id, updatedAnn).catch(console.error);
    } else {
      const newAnn: Announcement = {
        id: `ann-${Date.now()}`,
        title: formData.title,
        category: formData.category,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        targetAudience: formData.targetAudience,
        description: formData.description,
        notes: formData.notes,
        isUrgent: formData.isUrgent,
        isPinned: formData.isPinned,
        author: currentUser?.name || 'Administration',
        authorId: currentUser?.id ? String(currentUser.id) : undefined,
        authorEmail: currentUser?.email ? String(currentUser.email) : undefined,
        createdAt: new Date().toISOString().split('T')[0],
        likesCount: 0
      };
      setAnnouncements(prev => [newAnn, ...prev]);
      saveRealtimeDocument('announcements', newAnn.id, newAnn).catch(console.error);
    }

      // Send real notification
      const title = formData.title;
      const body = formData.description.substring(0, 60) + (formData.description.length > 60 ? '...' : '');
      
      // Web Notification
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`📢 ${title}`, { body: body, icon: '/icone.png' });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification(`📢 ${title}`, { body: body, icon: '/icone.png' });
            }
          });
        }
      }
      
      // Capacitor Notification
      import('@capacitor/core').then(core => {
        if (core.Capacitor.isNativePlatform()) {
           import('@capacitor/local-notifications').then(ln => {
              ln.LocalNotifications.schedule({
                notifications: [{
                   title: `📢 ${title}`,
                   body: body,
                   id: Math.floor(Math.random() * 1000000),
                   schedule: { at: new Date(Date.now() + 1000) },
                   smallIcon: 'ic_stat_icon_config_sample'
                }]
              });
           });
        }
      }).catch(() => {});

    setShowAddModal(false);
  };

  // Duty Schedule Handlers
  const handlePrintDutySchedule = () => {
    const streamTitle = dutyStream === 'general' 
      ? "Enseignement Général (Collège & Lycée)" 
      : "Enseignement Technique & Professionnel";
    const periodTitle = dutyStream === 'general'
      ? (dutyPeriod === 'T1' ? '1er Trimestre (T1)' : dutyPeriod === 'T2' ? '2ème Trimestre (T2)' : '3ème Trimestre (T3)')
      : (dutyPeriod === 'S1' ? '1er Semestre (S1)' : '2ème Semestre (S2)');
    
    const title = "PLANIFICATION DES DEVOIRS ET ÉVALUATIONS";
    const subtitle = `${streamTitle} • ${periodTitle}`;

    const DAYS_ORDER: ('Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi')[] = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

    let tableRowsHtml = '';

    DAYS_ORDER.forEach((day) => {
      const dayDuties = filteredDutyItems.filter(d => d.dayOfWeek === day);
      if (dayDuties.length === 0) return;

      dayDuties.forEach((duty, idx) => {
        tableRowsHtml += `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            ${idx === 0 ? `<td rowspan="${dayDuties.length}" style="padding: 10px; font-weight: 900; color: #0f172a; background-color: #f1f5f9; vertical-align: top; border-right: 1px solid #cbd5e1; text-align: center; font-size: 11px; text-transform: uppercase;">${day}</td>` : ''}
            <td style="padding: 10px; font-weight: 800; font-size: 11px; color: #0f172a; border-right: 1px solid #e2e8f0;">${duty.className}</td>
            <td style="padding: 10px; border-right: 1px solid #e2e8f0;">
              <span style="font-weight: 800; font-size: 12px; color: #0f172a; display: block;">${duty.subject}</span>
              <span style="font-weight: 700; font-size: 11px; color: #0369a1; display: block; margin-top: 2px;">📋 ${duty.title}</span>
              ${duty.notes ? `<span style="font-size: 10px; color: #64748b; font-style: italic; display: block; margin-top: 2px;">${duty.notes}</span>` : ''}
            </td>
            <td style="padding: 10px; border-right: 1px solid #e2e8f0; font-size: 11px; color: #334155;">
              ${duty.time ? `<div style="font-weight: 700; color: #1e293b;">⏰ ${duty.time}</div>` : ''}
              ${duty.location ? `<div style="color: #475569; margin-top: 2px;">📍 ${duty.location}</div>` : ''}
            </td>
            <td style="padding: 10px; border-right: 1px solid #e2e8f0; text-align: center; font-weight: 900; font-size: 11px; color: #78350f; background-color: #fffbeb;">
              ${duty.coefficient ? `Coeff. ${duty.coefficient}` : '-'}
            </td>
            <td style="padding: 10px; font-size: 11px; font-weight: 700; color: #1e293b;">
              ${duty.teacher ? `Prof. ${duty.teacher}` : '-'}
            </td>
          </tr>
        `;
      });
    });

    if (!tableRowsHtml) {
      tableRowsHtml = `
        <tr>
          <td colspan="6" style="padding: 30px; text-align: center; color: #94a3b8; font-weight: 700; font-size: 13px;">
            Aucun devoir planifié pour les critères sélectionnés.
          </td>
        </tr>
      `;
    }

    const directorStudiesName = currentUser?.name || 'OUATTARA SEIDOU';

    try {
      const printWin = window.open('', '_blank');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="utf-8">
              <title>${title} - ${subtitle}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                @media print {
                  @page { size: A4 portrait; margin: 8mm 8mm; }
                  .no-print { display: none !important; }
                  body { background-color: #ffffff !important; color: #0f172a !important; padding: 4px !important; margin: 0 !important; font-family: system-ui, -apple-system, sans-serif !important; }
                }
                body { background-color: #ffffff; color: #0f172a; font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th { background-color: #0f172a; color: #ffffff; text-transform: uppercase; font-size: 10px; font-weight: 900; letter-spacing: 0.05em; padding: 10px 12px; }
              </style>
            </head>
            <body>
              <div class="no-print" style="margin-bottom: 20px; padding: 14px 20px; background-color: #048567; color: white; display: flex; justify-content: space-between; align-items: center; border-radius: 14px; font-family: sans-serif;">
                <div>
                  <strong style="font-size: 15px; display: block;">🖨️ Impression : ${title}</strong>
                  <p style="font-size: 12px; margin: 2px 0 0 0; opacity: 0.9;">${subtitle} (${filteredDutyItems.length} évaluation${filteredDutyItems.length > 1 ? 's' : ''})</p>
                </div>
                <div style="display: flex; gap: 10px;">
                  <button onclick="window.print()" class="btn-print" style="padding: 9px 18px; background-color: #ffffff; color: #048567; font-weight: 800; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                    🖨️ Imprimer ce document
                  </button>
                  <button onclick="window.close()" style="padding: 9px 14px; background-color: rgba(255,255,255,0.25); color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                    Fermer
                  </button>
                </div>
              </div>

              <!-- OFFICIAL HEADER -->
              <div class="mb-6 pb-4 border-b-2 border-slate-900 flex justify-between items-center">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 flex items-center justify-center shrink-0">
                    <img src="icone.png" alt="Logo" class="w-12 h-12 object-contain" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150';" />
                  </div>
                  <div>
                    <h1 class="text-base font-black uppercase tracking-tight text-slate-900">RÉPUBLIQUE DE CÔTE D'IVOIRE</h1>
                    <p class="text-xs font-bold text-slate-700 uppercase">DASHBOARD DE L'ENSEIGNEMENT SECONDAIRE & TECHNIQUE</p>
                  </div>
                </div>
                <div class="text-right text-[11px] text-slate-700 space-y-0.5">
                  <p class="font-black uppercase text-slate-900 text-xs">ÉTABLISSEMENT DASHBOARD</p>
                  <p>Yopougon Niangon Sud Carrefour Centre Social</p>
                  <p>Tél : 27 23 45 61 11 / 05 05 96 70 80</p>
                  <p>Email : zangabeh@gmail.com</p>
                </div>
              </div>

              <!-- MAIN TITLE -->
              <div class="mb-6 text-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h2 class="text-base font-black uppercase text-slate-900 tracking-wide">${title}</h2>
                <p class="text-xs font-black text-emerald-800 uppercase mt-1 tracking-wider">${subtitle}</p>
                <p class="text-[11px] font-bold text-slate-500 mt-0.5">
                  Document officiel publié le ${new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} • Total : ${filteredDutyItems.length} devoir(s) programmé(s)
                </p>
              </div>

              <!-- DUTY TABLE -->
              <div class="overflow-hidden rounded-xl border border-slate-300 mb-6">
                <table>
                  <thead>
                    <tr>
                      <th style="width: 12%;">Jour</th>
                      <th style="width: 18%;">Classe(s)</th>
                      <th style="width: 32%;">Matière & Évaluation</th>
                      <th style="width: 18%;">Horaire & Salle</th>
                      <th style="width: 8%;">Coeff</th>
                      <th style="width: 12%;">Enseignant</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${tableRowsHtml}
                  </tbody>
                </table>
              </div>

              <!-- FOOTER STAMP -->
              <div class="mt-8 pt-4 border-t border-slate-300 flex justify-between items-center text-xs">
                <p class="italic text-slate-500 max-w-xs">
                  Document officiel certifié conforme par la Direction des Études du Dashboard.
                </p>
                <div class="text-center">
                  <span class="block text-[8px] font-black uppercase tracking-widest text-emerald-800 mb-0.5">Notre Devise</span>
                  <span class="block text-xs font-black italic text-slate-900">" Discipline • Travail • Succès "</span>
                </div>
                <div class="text-right">
                  <p class="font-bold text-slate-800">Le Directeur des Études</p>
                  <p class="font-black text-slate-900 uppercase mt-1">${directorStudiesName.toUpperCase()}</p>
                </div>
              </div>

              <script>
                setTimeout(function() {
                  window.print();
                }, 600);
              </script>
            </body>
          </html>
        `);
        printWin.document.close();
        return;
      }
    } catch (e) {
      console.warn("window.open print failed, falling back to window.print()", e);
    }

    try {
      window.print();
    } catch (err) {
      console.error("Print error", err);
    }
  };

  const handleOpenAddDuty = () => {
    setEditingDutyItem(null);
    setDutyFormData({
      stream: dutyStream,
      period: dutyPeriod,
      className: 'Toutes les classes',
      dayOfWeek: 'Lundi',
      subject: '',
      title: 'Devoir Surveillé',
      time: '08h00 - 10h00',
      location: 'Salles de classe',
      coefficient: 2,
      teacher: '',
      notes: ''
    });
    setShowDutyModal(true);
  };

  const handleOpenEditDuty = (duty: DutyScheduleItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDutyItem(duty);
    setDutyFormData({
      stream: duty.stream,
      period: duty.period,
      className: duty.className,
      dayOfWeek: duty.dayOfWeek,
      subject: duty.subject,
      title: duty.title,
      time: duty.time || '',
      location: duty.location || '',
      coefficient: duty.coefficient || 2,
      teacher: duty.teacher || '',
      notes: duty.notes || ''
    });
    setShowDutyModal(true);
  };

  const handleDeleteDuty = (duty: DutyScheduleItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setDutyToDelete(duty);
  };

  const confirmDeleteDuty = () => {
    if (!dutyToDelete) return;
    const idToDelete = dutyToDelete.id;
    setDutyItems(prev => prev.filter(d => d.id !== idToDelete));
    deleteRealtimeDocument('duty_schedules', idToDelete).catch(console.error);
    setDutyToDelete(null);
  };

  const handleSubmitDuty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dutyFormData.subject.trim() || !dutyFormData.title.trim()) {
      alert('Veuillez préciser la matière et le titre du devoir.');
      return;
    }

    if (editingDutyItem) {
      const updatedDuty: DutyScheduleItem = {
        ...editingDutyItem,
        ...dutyFormData
      };
      setDutyItems(prev => prev.map(d => d.id === editingDutyItem.id ? updatedDuty : d));
      saveRealtimeDocument('duty_schedules', editingDutyItem.id, updatedDuty).catch(console.error);
    } else {
      const newDuty: DutyScheduleItem = {
        id: `duty-${Date.now()}`,
        ...dutyFormData
      };
      setDutyItems(prev => [newDuty, ...prev]);
      saveRealtimeDocument('duty_schedules', newDuty.id, newDuty).catch(console.error);
    }

    setShowDutyModal(false);
  };

  // Filtered Announcements List
  const filteredAnnouncements = announcements.filter(ann => {
    const matchesSearch = ann.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ann.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ann.targetAudience.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (ann.location && ann.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' ? true :
                            selectedCategory === 'bookmarked' ? bookmarkedIds.includes(ann.id) :
                            ann.category === selectedCategory;

    const matchesAudience = selectedAudience === 'all' ? true :
                            ann.targetAudience.toLowerCase().includes(selectedAudience.toLowerCase());

    return matchesSearch && matchesCategory && matchesAudience;
  });

  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Filtered Duty Schedules
  const filteredDutyItems = dutyItems.filter(duty => {
    if (duty.stream !== dutyStream) return false;
    if (duty.period !== dutyPeriod) return false;
    if (dutyClassFilter !== 'all' && !duty.className.toLowerCase().includes(dutyClassFilter.toLowerCase())) {
      return false;
    }
    if (dutySearch.trim()) {
      const q = dutySearch.toLowerCase();
      const matchesSubject = duty.subject.toLowerCase().includes(q);
      const matchesTitle = duty.title.toLowerCase().includes(q);
      const matchesClass = duty.className.toLowerCase().includes(q);
      const matchesTeacher = duty.teacher ? duty.teacher.toLowerCase().includes(q) : false;
      return matchesSubject || matchesTitle || matchesClass || matchesTeacher;
    }
    return true;
  });

  // Category Badge Config
  const getCategoryBadge = (category: Announcement['category']) => {
    switch (category) {
      case 'examen':
        return {
          label: 'Examen & Évaluation',
          icon: <GraduationCap size={15} />,
          bgColor: 'bg-rose-50 text-rose-700 border-rose-200',
          gradient: 'from-rose-500 to-red-600',
          lightBg: 'bg-rose-500/10 text-rose-600'
        };
      case 'remise_bulletin':
        return {
          label: 'Remise de Bulletins',
          icon: <FileCheck size={15} />,
          bgColor: 'bg-amber-50 text-amber-700 border-amber-200',
          gradient: 'from-amber-500 to-orange-600',
          lightBg: 'bg-amber-500/10 text-amber-600'
        };
      case 'sortie':
        return {
          label: 'Sortie Scolaire',
          icon: <Bus size={15} />,
          bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          gradient: 'from-emerald-500 to-teal-600',
          lightBg: 'bg-emerald-500/10 text-emerald-600'
        };
      case 'fete':
        return {
          label: 'Fête & Événement',
          icon: <PartyPopper size={15} />,
          bgColor: 'bg-purple-50 text-purple-700 border-purple-200',
          gradient: 'from-purple-500 to-pink-600',
          lightBg: 'bg-purple-500/10 text-purple-600'
        };
      case 'reunion':
        return {
          label: 'Réunion & APE',
          icon: <Users size={15} />,
          bgColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          gradient: 'from-indigo-500 to-blue-600',
          lightBg: 'bg-indigo-500/10 text-indigo-600'
        };
      default:
        return {
          label: 'Information Générale',
          icon: <Megaphone size={15} />,
          bgColor: 'bg-sky-50 text-sky-700 border-sky-200',
          gradient: 'from-sky-500 to-blue-600',
          lightBg: 'bg-sky-500/10 text-sky-600'
        };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const DAYS_OF_WEEK: ('Lundi' | 'Mardi' | 'Mercredi' | 'Jeudi' | 'Vendredi' | 'Samedi')[] = [
    'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'
  ];

  return (
    <div className="flex-1 flex flex-col h-full animate-in fade-in duration-300 relative z-10 bg-[#BFDBFE] overflow-hidden">
      
      {/* Desktop Header */}
      <div className="hidden md:flex justify-between items-center py-4 px-8 shrink-0">
        <div className="flex items-center gap-4">
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              title="Retour à Terminal-D"
              className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/50 hover:bg-white/60 text-slate-900 transition-colors shrink-0 cursor-pointer active:scale-95 shadow-xs"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h1 className="text-white text-[28px] font-bold tracking-tight flex items-center gap-3">
              <Bell className="text-white" size={32} />
              Annonces & Calendrier des Devoirs
            </h1>
            <p className="text-white/80 text-sm mt-1">
              Notes d'information, événements scolaires et jours fixes de devoirs (3 Trimestres Général / 2 Semestres Technique).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {activeTab === 'duty_schedule' && (
            <button
              onClick={handlePrintDutySchedule}
              className="flex items-center gap-2.5 bg-white/20 hover:bg-white/30 text-white border border-white/40 px-6 py-2.5 rounded-2xl font-bold shadow-sm backdrop-blur-md transition-all transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
              title="Imprimer la planification des devoirs"
            >
              <Printer size={18} />
              <span>Imprimer le Planning</span>
            </button>
          )}

          {canManage && (
            activeTab === 'duty_schedule' ? (
              <button
                onClick={handleOpenAddDuty}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus size={20} className="shrink-0" />
                <span className="whitespace-nowrap">Programmer un Devoir</span>
              </button>
            ) : (
              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-2 bg-white text-sky-700 hover:bg-sky-50 px-5 py-2.5 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus size={20} className="shrink-0" />
                <span className="whitespace-nowrap">Publier une Annonce</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center py-3.5 px-6 shrink-0">
        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              title="Retour à Terminal-D"
              className="w-9 h-9 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/50 hover:bg-white/60 text-slate-900 transition-colors shrink-0 cursor-pointer active:scale-95 shadow-xs"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h1 className="text-white text-[20px] font-extrabold tracking-tight flex items-center gap-2">
              <Bell size={20} />
              Annonces & Devoirs
            </h1>
            <p className="text-white/80 text-xs">Événements & Jours de devoirs</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'duty_schedule' && (
            <button
              onClick={handlePrintDutySchedule}
              className="p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-md active:scale-95 transition-all cursor-pointer"
              title="Imprimer la planification des devoirs"
            >
              <Printer size={18} />
            </button>
          )}

          {canManage && (
            <button
              onClick={activeTab === 'duty_schedule' ? handleOpenAddDuty : handleOpenAdd}
              className={`p-2.5 rounded-full shadow-lg active:scale-95 transition-all cursor-pointer ${
                activeTab === 'duty_schedule' ? 'bg-emerald-600 text-white' : 'bg-white text-sky-600'
              }`}
              title="Ajouter"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

      {/* TOP LEVEL TAB SELECTOR (In Blue Header App Bar) */}
      <div className="px-6 sm:px-8 pb-3.5 shrink-0 overflow-x-auto custom-scrollbar">
        <div className="inline-flex items-center gap-2 p-1.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-sm">
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${
              activeTab === 'announcements'
                ? 'bg-white text-sky-800 shadow-md scale-[1.02]'
                : 'text-white/90 hover:bg-white/15 hover:text-white'
            }`}
          >
            <Megaphone size={16} />
            <span>Annonces & Événements</span>
            {announcements.length > 0 && (
              <span className={`px-2 py-0.5 text-[11px] font-extrabold rounded-full transition-colors ${
                activeTab === 'announcements'
                  ? 'bg-sky-100 text-sky-800'
                  : 'bg-white/25 text-white'
              }`}>
                {announcements.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('duty_schedule')}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all whitespace-nowrap ${
              activeTab === 'duty_schedule'
                ? 'bg-white text-emerald-800 shadow-md scale-[1.02]'
                : 'text-white/90 hover:bg-white/15 hover:text-white'
            }`}
          >
            <CalendarDays size={16} />
            <span>Jours de Devoirs & Évaluations</span>
            <span className={`px-2 py-0.5 text-[11px] font-extrabold rounded-full transition-colors ${
              activeTab === 'duty_schedule'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-white/25 text-white'
            }`}>
              Général (3 Trim.) / Tech (2 Sem.)
            </span>
          </button>
        </div>
      </div>

      {/* Main Glass Content Body */}
      <div className="flex-1 bg-white rounded-t-[32px] sm:rounded-t-[40px] px-4 sm:px-8 pt-6 sm:pt-8 pb-32 md:pb-24 shadow-2xl relative overflow-y-auto custom-scrollbar border-t border-white/50 md:border-none flex flex-col gap-6">

        {/* TAB 1: ANNOUNCEMENTS FEED */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            
            {/* Filters & Search Header */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Rechercher un événement, examen, sortie, classe..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-medium transition-all shadow-sm"
                  />
                  {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm('')} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Audience filter dropdown */}
                <div className="shrink-0 min-w-[210px]">
                  <CustomSelect
                    value={selectedAudience}
                    onChange={(val) => setSelectedAudience(val)}
                    placeholder="Toutes les cibles"
                    icon={<Filter size={16} />}
                    className="bg-white border-slate-200 focus:border-sky-500 rounded-2xl shadow-sm text-sm"
                    items={AUDIENCE_FILTER_OPTIONS}
                  />
                </div>
              </div>

              {/* Category Chips Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar scrollbar-none">
                {[
                  { id: 'all', label: 'Toutes', icon: <Megaphone size={14} /> },
                  { id: 'examen', label: 'Examens', icon: <GraduationCap size={14} /> },
                  { id: 'remise_bulletin', label: 'Bulletins', icon: <FileCheck size={14} /> },
                  { id: 'sortie', label: 'Sorties', icon: <Bus size={14} /> },
                  { id: 'fete', label: 'Fêtes & Sport', icon: <PartyPopper size={14} /> },
                  { id: 'reunion', label: 'Réunions', icon: <Users size={14} /> },
                  { id: 'bookmarked', label: `Enregistrées (${bookmarkedIds.length})`, icon: <Bookmark size={14} /> },
                ].map((cat) => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20 scale-105'
                          : 'bg-white text-slate-600 border border-slate-200 hover:border-sky-300 hover:bg-slate-50'
                      }`}
                    >
                      {cat.icon}
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Announcements Cards Feed */}
            {sortedAnnouncements.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sortedAnnouncements.map((ann) => {
                  const catInfo = getCategoryBadge(ann.category);
                  const isBookmarked = bookmarkedIds.includes(ann.id);

                  return (
                    <div
                      key={ann.id}
                      className={`relative bg-white rounded-3xl p-5 md:p-6 border transition-all duration-300 hover:shadow-xl flex flex-col justify-between group ${
                        ann.isUrgent
                          ? 'border-rose-300 ring-2 ring-rose-500/10 shadow-lg shadow-rose-500/5'
                          : 'border-slate-200 shadow-sm'
                      }`}
                    >
                      <div>
                        {/* Top Badges & Actions */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${catInfo.bgColor}`}>
                              {catInfo.icon}
                              <span>{catInfo.label}</span>
                            </span>

                            {ann.isUrgent && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-rose-500 text-white animate-pulse">
                                <AlertTriangle size={12} />
                                <span>URGENT</span>
                              </span>
                            )}

                            {ann.isPinned && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-extrabold bg-amber-500 text-white">
                                <Pin size={12} />
                                <span>À LA UNE</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => toggleBookmark(ann.id, e)}
                              className={`p-2 rounded-xl transition-colors ${
                                isBookmarked
                                  ? 'bg-amber-100 text-amber-600'
                                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                              }`}
                              title={isBookmarked ? 'Retirer des favoris' : 'Enregistrer'}
                            >
                              <Bookmark size={18} className={isBookmarked ? 'fill-amber-500' : ''} />
                            </button>

                            {canEditOrDeleteAnnouncement(ann) && (
                              <>
                                <button
                                  onClick={(e) => handleOpenEdit(ann, e)}
                                  className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors"
                                  title="Modifier"
                                >
                                  <Edit3 size={17} />
                                </button>
                                <button
                                  onClick={(e) => handleDelete(ann, e)}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 size={17} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-lg md:text-xl font-extrabold text-slate-900 tracking-tight leading-snug mb-2 group-hover:text-sky-700 transition-colors">
                          {ann.title}
                        </h2>

                        {/* Details Metadata */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500 mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <Calendar size={14} className="text-sky-600" />
                            <span>{formatDate(ann.date)}</span>
                          </div>

                          {ann.time && (
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Clock size={14} className="text-sky-600" />
                              <span>{ann.time}</span>
                            </div>
                          )}

                          {ann.location && (
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <MapPin size={14} className="text-sky-600" />
                              <span>{ann.location}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 text-indigo-700 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                            <Users size={13} />
                            <span>{ann.targetAudience}</span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-slate-600 text-sm leading-relaxed mb-4 whitespace-pre-line">
                          {ann.description}
                        </p>

                        {/* Notes / Special Instructions */}
                        {ann.notes && (
                          <div className="flex items-start gap-2 text-xs font-semibold text-amber-800 bg-amber-50/80 border border-amber-200/80 p-3 rounded-2xl mb-4">
                            <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                            <span>{ann.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Footer: Author & Likes */}
                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span className="font-medium">
                          Publié par <strong className="text-slate-700">{ann.author}</strong>
                        </span>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => toggleLike(ann.id, e)}
                            className="flex items-center gap-1.5 hover:text-rose-600 transition-colors bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200/60"
                          >
                            <span>❤️</span>
                            <span className="font-bold text-slate-700">{ann.likesCount || 0}</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Megaphone size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Aucune annonce trouvée</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                  Aucune information ne correspond à vos critères de recherche pour le moment.
                </p>
                {canManage && (
                  <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-all text-sm"
                  >
                    <Plus size={18} />
                    <span>Créer une annonce</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DUTY SCHEDULE & EVALUATION DAYS */}
        {activeTab === 'duty_schedule' && (
          <div className="space-y-6">

            {/* Banner info */}
            <div className="bg-[#048567] text-white rounded-[28px] p-6 md:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-white font-bold text-xs mb-3 backdrop-blur-md border border-white/20">
                  <Sparkles size={14} className="text-white" />
                  <span>Jours de Devoirs & Évaluations Officiels</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  Planification des Devoirs par Filière & Période
                </h2>
                <p className="text-white/95 text-xs md:text-sm mt-2 max-w-3xl leading-relaxed">
                  Les classes de l'<strong>Enseignement Général</strong> sont organisées en <strong>3 Trimestres (T1, T2, T3)</strong>. 
                  Les classes de l'<strong>Enseignement Technique & Professionnel</strong> sont organisées en <strong>2 Semestres (S1, S2)</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
                <button
                  onClick={handlePrintDutySchedule}
                  className="flex items-center gap-2.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 py-3 rounded-2xl font-extrabold text-xs md:text-sm shadow-sm backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                  title="Imprimer la planification des devoirs"
                >
                  <Printer size={18} strokeWidth={2.5} />
                  <span>Imprimer</span>
                </button>

                {canManage && (
                  <button
                    onClick={handleOpenAddDuty}
                    className="flex items-center gap-2 bg-white text-[#048567] hover:bg-emerald-50 px-5 py-3 rounded-2xl font-extrabold text-xs md:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Plus size={18} strokeWidth={2.5} />
                    <span>Ajouter un Devoir</span>
                  </button>
                )}
              </div>
            </div>

            {/* STREAM SWITCHER: GENERAL (3 Trimestres) vs TECHNIQUE (2 Semestres) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setDutyStream('general')}
                className={`p-4 md:p-5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  dutyStream === 'general'
                    ? 'bg-sky-50/80 border-sky-500 ring-2 ring-sky-500/20 shadow-md'
                    : 'bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${dutyStream === 'general' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-sky-800 uppercase tracking-wider block">
                      Filière Classique / Collège & Lycée
                    </span>
                    <h3 className="text-base md:text-lg font-black text-slate-900">
                      Enseignement Général
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Régime pédagogique sur <strong>3 Trimestres</strong> (T1, T2, T3)
                    </p>
                  </div>
                </div>
                {dutyStream === 'general' && (
                  <CheckCircle2 size={22} className="text-sky-600 shrink-0" />
                )}
              </button>

              <button
                onClick={() => setDutyStream('technique')}
                className={`p-4 md:p-5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  dutyStream === 'technique'
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${dutyStream === 'technique' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                      Filière Technique & Métiers (G, F, BT, CAP)
                    </span>
                    <h3 className="text-base md:text-lg font-black text-slate-900">
                      Enseignement Technique
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Régime pédagogique sur <strong>2 Semestres</strong> (S1, S2)
                    </p>
                  </div>
                </div>
                {dutyStream === 'technique' && (
                  <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
                )}
              </button>
            </div>

            {/* PERIOD TABS & FILTERS BAR */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-200">
              
              {/* Period Selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
                  Période:
                </span>

                {dutyStream === 'general' ? (
                  <>
                    {[
                      { id: 'T1', label: '1er Trimestre (T1)' },
                      { id: 'T2', label: '2ème Trimestre (T2)' },
                      { id: 'T3', label: '3ème Trimestre (T3)' },
                    ].map(period => (
                      <button
                        key={period.id}
                        onClick={() => setDutyPeriod(period.id as 'T1' | 'T2' | 'T3')}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                          dutyPeriod === period.id
                            ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20 scale-105'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {period.label}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    {[
                      { id: 'S1', label: '1er Semestre (S1)' },
                      { id: 'S2', label: '2ème Semestre (S2)' },
                    ].map(period => (
                      <button
                        key={period.id}
                        onClick={() => setDutyPeriod(period.id as 'S1' | 'S2')}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                          dutyPeriod === period.id
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-105'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {period.label}
                      </button>
                    ))}
                  </>
                )}
              </div>

              {/* Controls: Search & View Mode Toggle */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Matière, classe, prof..."
                    value={dutySearch}
                    onChange={(e) => setDutySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-sky-500"
                  />
                  {dutySearch && (
                    <button onClick={() => setDutySearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center p-1 bg-white border border-slate-200 rounded-xl shrink-0">
                  <button
                    onClick={() => setDutyViewMode('weekly')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      dutyViewMode === 'weekly'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <CalendarDays size={14} />
                    <span>Hebdomadaire</span>
                  </button>
                  <button
                    onClick={() => setDutyViewMode('list')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      dutyViewMode === 'list'
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <FileCheck size={14} />
                    <span>Liste</span>
                  </button>
                </div>

                <button
                  onClick={handlePrintDutySchedule}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-xs shrink-0 active:scale-95 cursor-pointer"
                  title="Imprimer la liste des devoirs"
                >
                  <Printer size={15} className="text-emerald-700" />
                  <span>Imprimer</span>
                </button>
              </div>

            </div>

            {/* WEEKLY VIEW GRID */}
            {dutyViewMode === 'weekly' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {DAYS_OF_WEEK.map((day) => {
                  const dayDuties = filteredDutyItems.filter(d => d.dayOfWeek === day);

                  return (
                    <div 
                      key={day}
                      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
                    >
                      {/* Day Header */}
                      <div className={`p-4 border-b flex items-center justify-between ${
                        dayDuties.length > 0 
                          ? dutyStream === 'general' ? 'bg-sky-50/70 border-sky-100 text-sky-950' : 'bg-emerald-50/70 border-emerald-100 text-emerald-950'
                          : 'bg-slate-50 border-slate-100 text-slate-700'
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${
                            dayDuties.length > 0 
                              ? dutyStream === 'general' ? 'bg-sky-500' : 'bg-emerald-500'
                              : 'bg-slate-300'
                          }`} />
                          <h3 className="font-extrabold text-base tracking-tight">{day}</h3>
                        </div>
                        <span className="text-xs font-bold bg-white/80 px-2.5 py-1 rounded-xl border border-slate-200/60">
                          {dayDuties.length} devoir{dayDuties.length > 1 ? 's' : ''}
                        </span>
                      </div>

                      {/* Day Duties Content */}
                      <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[420px] custom-scrollbar bg-slate-50/30">
                        {dayDuties.length > 0 ? (
                          dayDuties.map((duty) => (
                            <div 
                              key={duty.id}
                              className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative group"
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <span className="inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white mb-1">
                                    {duty.className}
                                  </span>
                                  <h4 className="font-black text-slate-900 text-sm leading-snug">
                                    {duty.subject}
                                  </h4>
                                </div>

                                {duty.coefficient && (
                                  <span className="shrink-0 text-xs font-black px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 border border-amber-200">
                                    Coeff {duty.coefficient}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs font-bold text-sky-800 mb-2">
                                📋 {duty.title}
                              </p>

                              <div className="space-y-1 text-[11px] font-semibold text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                {duty.time && (
                                  <div className="flex items-center gap-1.5 text-slate-700">
                                    <Clock size={13} className="text-slate-400" />
                                    <span>{duty.time}</span>
                                  </div>
                                )}
                                {duty.location && (
                                  <div className="flex items-center gap-1.5 text-slate-700">
                                    <MapPin size={13} className="text-slate-400" />
                                    <span>{duty.location}</span>
                                  </div>
                                )}
                                {duty.teacher && (
                                  <div className="flex items-center gap-1.5 text-slate-700">
                                    <Users size={13} className="text-slate-400" />
                                    <span>Prof. {duty.teacher}</span>
                                  </div>
                                )}
                              </div>

                              {duty.notes && (
                                <p className="text-[11px] text-amber-800 bg-amber-50/70 p-2 rounded-xl border border-amber-200/60 mt-2 font-medium">
                                  💡 {duty.notes}
                                </p>
                              )}

                              {canManage && (
                                <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                                  <button
                                    onClick={(e) => handleOpenEditDuty(duty, e)}
                                    className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                    title="Modifier"
                                  >
                                    <Edit3 size={15} />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteDuty(duty, e)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Supprimer"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              )}

                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-slate-400 text-xs font-medium">
                            Aucun devoir programmé pour ce jour.
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* DETAILED LIST VIEW */}
            {dutyViewMode === 'list' && (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Planning Complet ({filteredDutyItems.length} évaluation{filteredDutyItems.length > 1 ? 's' : ''})
                  </h3>
                  <span className="text-xs font-bold text-slate-500">
                    Filière: {dutyStream === 'general' ? 'Général (3 Trimestres)' : 'Technique (2 Semestres)'} - {dutyPeriod}
                  </span>
                </div>

                {filteredDutyItems.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {filteredDutyItems.map((duty) => (
                      <div key={duty.id} className="p-4 md:p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-2xl shrink-0 font-black text-center min-w-[70px] ${
                            dutyStream === 'general' ? 'bg-sky-100 text-sky-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            <span className="text-xs uppercase block font-extrabold">{duty.dayOfWeek}</span>
                            <span className="text-base">{duty.className}</span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-extrabold text-slate-900 text-base">{duty.subject}</h4>
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {duty.title}
                              </span>
                              {duty.coefficient && (
                                <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-amber-100 text-amber-800">
                                  Coeff {duty.coefficient}
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                              {duty.time && <span>🕒 {duty.time}</span>}
                              {duty.location && <span>📍 {duty.location}</span>}
                              {duty.teacher && <span>👨‍🏫 Prof. {duty.teacher}</span>}
                            </div>

                            {duty.notes && (
                              <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-xl mt-2 border border-amber-200/60">
                                💡 {duty.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {canManage && (
                          <div className="flex items-center gap-2 self-end md:self-center">
                            <button
                              onClick={(e) => handleOpenEditDuty(duty, e)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-700 rounded-xl font-bold text-xs transition-colors"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={(e) => handleDeleteDuty(duty, e)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400 text-sm font-medium">
                    Aucun devoir répertorié pour cette sélection.
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>

      {/* MODAL ANNONCES ADD/EDIT */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />

            <motion.div 
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white rounded-t-[32px] sm:rounded-3xl max-w-2xl w-full max-h-[92vh] sm:max-h-[90vh] shadow-2xl relative z-10 overflow-hidden flex flex-col border-t sm:border border-slate-100"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white p-5 sm:p-6 flex flex-col justify-between">
                <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 rounded-2xl">
                      <Megaphone size={22} className="text-sky-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">
                        {editingAnnouncement ? 'Modifier l\'Annonce' : 'Nouvelle Annonce Scolaire'}
                      </h3>
                      <p className="text-xs text-slate-400">Diffusion aux élèves, professeurs et parents</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Titre de l'Annonce *
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="ex: Convocation Examen Blanc 3ème & Terminale"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-medium text-slate-800 focus:border-sky-500 outline-none"
                    />
                  </div>

                  {/* Category & Target Audience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Catégorie *
                      </label>
                      <CustomSelect
                        value={formData.category}
                        onChange={(val) => setFormData({ ...formData, category: val as Announcement['category'] })}
                        items={CATEGORY_OPTIONS}
                        className="!bg-white !border-slate-200 focus:!border-sky-500 !rounded-2xl font-semibold text-slate-800 text-sm shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Cible / Audience *
                      </label>
                      <CustomSelect
                        value={formData.targetAudience}
                        onChange={(val) => setFormData({ ...formData, targetAudience: val })}
                        items={TARGET_AUDIENCE_OPTIONS}
                        className="!bg-white !border-slate-200 focus:!border-sky-500 !rounded-2xl font-semibold text-slate-800 text-sm shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Date de l'Événement *
                      </label>
                      <input 
                        type="date" 
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-medium text-slate-800 focus:border-sky-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Horaire (Optionnel)
                      </label>
                      <input 
                        type="text" 
                        placeholder="ex: 08h00 - 12h00"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-medium text-slate-800 focus:border-sky-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Lieu (Optionnel)
                    </label>
                    <input 
                      type="text" 
                      placeholder="ex: Grande Salle, Amphithéâtre, Terrain de sport..."
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-medium text-slate-800 focus:border-sky-500 outline-none"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Description détaillée *
                    </label>
                    <textarea 
                      required
                      rows={4}
                      placeholder="Expliquez en détail l'événement, les modalités, les objectifs..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-medium text-slate-800 focus:border-sky-500 outline-none resize-none"
                    />
                  </div>

                  {/* Special Instructions Note */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Instruction / Remarque importante (Optionnel)
                    </label>
                    <input 
                      type="text" 
                      placeholder="ex: Tenue correcte exigée, Autorisation parentale requise..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-medium text-slate-800 focus:border-sky-500 outline-none"
                    />
                  </div>

                  {/* Switches */}
                  <div className="flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.isUrgent}
                        onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                        className="w-5 h-5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                      />
                      <span className="text-sm font-bold text-rose-700 flex items-center gap-1">
                        <AlertTriangle size={15} /> Marquer comme URGENT
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formData.isPinned}
                        onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                        className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                      <span className="text-sm font-bold text-amber-700 flex items-center gap-1">
                        <Pin size={15} /> Épingler à la une
                      </span>
                    </label>
                  </div>

                  {/* Buttons */}
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl shadow-lg shadow-sky-500/20 transition-all"
                    >
                      {editingAnnouncement ? 'Enregistrer' : 'Publier l\'annonce'}
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DUTY SCHEDULE ADD/EDIT */}
      <AnimatePresence>
        {showDutyModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowDutyModal(false)}
            />

            <motion.div 
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white rounded-t-[32px] sm:rounded-3xl max-w-xl w-full max-h-[92vh] sm:max-h-[90vh] shadow-2xl relative z-10 overflow-hidden flex flex-col border-t sm:border border-slate-100"
            >
              {/* Header */}
              <div className="bg-emerald-950 text-white p-5 sm:p-6 flex flex-col justify-between">
                <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-3 sm:hidden shrink-0" />
                <div className="flex justify-between items-center w-full">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/20 rounded-2xl">
                      <CalendarDays size={22} className="text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">
                        {editingDutyItem ? 'Modifier le Devoir' : 'Programmer un Devoir'}
                      </h3>
                      <p className="text-xs text-emerald-300">Emploi du temps des évaluations</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowDutyModal(false)}
                    className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <form onSubmit={handleSubmitDuty} className="space-y-4">

                  {/* Stream & Period Selector */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Filière Pédagogique *
                      </label>
                      <CustomSelect
                        value={dutyFormData.stream}
                        onChange={(val) => {
                          const streamVal = val as 'general' | 'technique';
                          setDutyFormData({
                            ...dutyFormData,
                            stream: streamVal,
                            period: streamVal === 'general' ? 'T1' : 'S1'
                          });
                        }}
                        items={[
                          { label: 'Général (3 Trimestres)', value: 'general' },
                          { label: 'Technique (2 Semestres)', value: 'technique' }
                        ]}
                        className="!bg-white !border-slate-200 focus:!border-emerald-500 !rounded-2xl font-bold text-slate-800 text-sm shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Période *
                      </label>
                      <CustomSelect
                        value={dutyFormData.period}
                        onChange={(val) => setDutyFormData({ ...dutyFormData, period: val as any })}
                        items={dutyFormData.stream === 'general' ? [
                          { label: '1er Trimestre (T1)', value: 'T1' },
                          { label: '2ème Trimestre (T2)', value: 'T2' },
                          { label: '3ème Trimestre (T3)', value: 'T3' }
                        ] : [
                          { label: '1er Semestre (S1)', value: 'S1' },
                          { label: '2ème Semestre (S2)', value: 'S2' }
                        ]}
                        className="!bg-white !border-slate-200 focus:!border-emerald-500 !rounded-2xl font-bold text-slate-800 text-sm shadow-2xs"
                      />
                    </div>
                  </div>

                  {/* Day of Week & Target Class */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Jour de la Semaine *
                      </label>
                      <CustomSelect
                        value={dutyFormData.dayOfWeek}
                        onChange={(val) => setDutyFormData({ ...dutyFormData, dayOfWeek: val as any })}
                        items={DAYS_OF_WEEK.map(day => ({ label: day, value: day }))}
                        className="!bg-white !border-slate-200 focus:!border-emerald-500 !rounded-2xl font-bold text-slate-800 text-sm shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Classe / Niveau *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: 3ème, Terminale D, 1ère G2"
                        value={dutyFormData.className}
                        onChange={(e) => setDutyFormData({ ...dutyFormData, className: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-medium text-slate-800 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Subject & Title */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Matière / Discipline *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: Mathématiques, Comptabilité"
                        value={dutyFormData.subject}
                        onChange={(e) => setDutyFormData({ ...dutyFormData, subject: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-medium text-slate-800 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Titre / Type d'Évaluation *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ex: Devoir Surveillé N°1"
                        value={dutyFormData.title}
                        onChange={(e) => setDutyFormData({ ...dutyFormData, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-medium text-slate-800 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Time & Coefficient */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Horaire (ex: 08h00 - 10h00)
                      </label>
                      <input
                        type="text"
                        placeholder="08h00 - 10h00"
                        value={dutyFormData.time}
                        onChange={(e) => setDutyFormData({ ...dutyFormData, time: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-medium text-slate-800 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Coefficient
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={dutyFormData.coefficient || 2}
                        onChange={(e) => setDutyFormData({ ...dutyFormData, coefficient: Number(e.target.value) })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-medium text-slate-800 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Location & Teacher */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Lieu / Salle
                      </label>
                      <input
                        type="text"
                        placeholder="ex: Salle 12, Amphi A"
                        value={dutyFormData.location}
                        onChange={(e) => setDutyFormData({ ...dutyFormData, location: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-medium text-slate-800 outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                        Nom du Professeur
                      </label>
                      <input
                        type="text"
                        placeholder="ex: M. KOUASSI"
                        value={dutyFormData.teacher}
                        onChange={(e) => setDutyFormData({ ...dutyFormData, teacher: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-medium text-slate-800 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                      Instructions / Consignes particulières
                    </label>
                    <input
                      type="text"
                      placeholder="ex: Calculatrice scientifique autorisée, Blouse obligatoire..."
                      value={dutyFormData.notes}
                      onChange={(e) => setDutyFormData({ ...dutyFormData, notes: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-medium text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowDutyModal(false)}
                      className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all"
                    >
                      {editingDutyItem ? 'Enregistrer' : 'Ajouter le devoir'}
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Announcement Modal */}
      <AnimatePresence>
        {announcementToDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setAnnouncementToDelete(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative z-10 border border-slate-100 text-center"
            >
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                Supprimer cette annonce ?
              </h3>
              <p className="text-slate-600 text-sm mb-6">
                Voulez-vous vraiment supprimer l'annonce <strong className="text-slate-800">"{announcementToDelete.title}"</strong> ?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setAnnouncementToDelete(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors text-sm"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 transition-all text-sm"
                >
                  Oui, supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Duty Schedule Item Modal */}
      <AnimatePresence>
        {dutyToDelete && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setDutyToDelete(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative z-10 border border-slate-100 text-center"
            >
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2">
                Supprimer ce devoir programmé ?
              </h3>
              <p className="text-slate-600 text-sm mb-6">
                Voulez-vous vraiment retirer l'évaluation <strong className="text-slate-800">"{dutyToDelete.subject} - {dutyToDelete.title}"</strong> du planning ?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDutyToDelete(null)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-colors text-sm"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteDuty}
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 transition-all text-sm"
                >
                  Oui, supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
