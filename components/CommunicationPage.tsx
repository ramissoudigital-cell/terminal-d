import React, { useState, useEffect, useMemo } from 'react';
import { 
  Send, Smartphone, MessageCircle, Users, CheckCircle, AlertCircle, Phone, 
  School, Search, CheckSquare, Square, UserPlus, Info, QrCode, Copy, ExternalLink, 
  Monitor, MessageSquare, Mail, AtSign, ChevronDown, Check, GraduationCap, Filter, Sparkles, X
} from 'lucide-react';
import { Student, User } from '../types';
import { mockClasses } from '../data/mockData';
import { isSameClass } from '../src/utils/parentUtils';

interface CommunicationPageProps {
  students?: Student[];
  currentUser?: User | null;
}

interface MessageTemplate {
    id: string;
    title: string;
    subject?: string;
    content: string;
    category?: 'convocation' | 'info' | 'finance' | 'discipline';
}

const templates: MessageTemplate[] = [
    { 
        id: '1', 
        title: '📋 Convocation Parent', 
        subject: 'CONVOCATION URGENTE - Direction de l\'Établissement',
        category: 'convocation',
        content: "CONVOCATION URGENTE :\n\nChers parents, vous êtes priés de vous présenter à la direction de l'établissement concernant l'élève {nom_eleve} (Classe de {classe}).\n\nMerci de vous présenter au secrétariat dans les plus brefs délais pour un entretien individuel.\n\nCordialement,\nLa Direction" 
    },
    { 
        id: '2', 
        title: '⚠️ Convocation Discipline', 
        subject: 'Convocation Conseil de Discipline / Entretien',
        category: 'discipline',
        content: "AVIS DE CONVOCATION :\n\nMonsieur / Madame, vous êtes convoqué(e) à l'administration de l'établissement pour un entretien disciplinaire concernant l'élève {nom_eleve} (Classe de {classe}).\n\nDate & Heure : À convenir d'urgence auprès du secrétariat.\n\nCordialement,\nLa Direction des Études" 
    },
    { 
        id: '3', 
        title: '📅 Rappel Réunion', 
        subject: 'Rappel : Réunion Parents-Professeurs',
        category: 'info',
        content: "Bonjour, n'oubliez pas la réunion parents-professeurs ce Vendredi à 18h. La présence de tous les parents est vivement souhaitée pour le suivi de la scolarité de {nom_eleve}. Cordialement, La Direction." 
    },
    { 
        id: '4', 
        title: '📜 Bulletin Dispo', 
        subject: 'Retrait des bulletins trimestriels',
        category: 'info',
        content: "Chers parents, le bulletin du trimestre de l'élève {nom_eleve} (Classe de {classe}) est désormais disponible à l'administration. Merci de passer le récupérer pendant les heures d'ouverture." 
    },
    { 
        id: '5', 
        title: '💳 Paiement Scolarité', 
        subject: 'Rappel : Échéance scolarité',
        category: 'finance',
        content: "Rappel : La tranche de scolarité pour l'élève {nom_eleve} ({classe}) arrive à échéance le 30 du mois. Merci de bien vouloir régulariser la situation auprès de la comptabilité." 
    },
    { 
        id: '6', 
        title: '⏰ Signaler Absence', 
        subject: 'Notification d\'absence non justifiée',
        category: 'discipline',
        content: "Chers parents, nous vous informons que l'élève {nom_eleve} ({classe}) a été signalé(e) absent(e) ce jour. Merci de fournir un justificatif médical ou parental au secrétariat." 
    },
];

export const CommunicationPage: React.FC<CommunicationPageProps> = ({ students = [], currentUser }) => {
  const [message, setMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('Information Scolaire - Dashboard');
  const [channel, setChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [targetAudience, setTargetAudience] = useState<'class' | 'selection'>('class');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [classSelectedIds, setClassSelectedIds] = useState<string[]>([]);
  
  // Manual Selection State
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectionSearchTerm, setSelectionSearchTerm] = useState('');

  // Simulation State
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  // WhatsApp Web State
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [whatsappCopiedMessage, setWhatsappCopiedMessage] = useState('');

  // Email State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [copiedEmailsToast, setCopiedEmailsToast] = useState(false);

  // Class Selector UI State
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [classSearchQuery, setClassSearchQuery] = useState('');
  const [classSectionFilter, setClassSectionFilter] = useState('all');

  // Combine mockClasses + students' classes so ALL available classes in the school are selectable
  const allAvailableClasses = useMemo(() => {
    const classSet = new Set<string>();

    mockClasses.forEach(c => classSet.add(c.name));

    (students || []).forEach(s => {
      if (!s.class) return;
      const matched = mockClasses.find(c => isSameClass(s.class, c.name) || isSameClass(s.class, c.code));
      if (matched) {
        classSet.add(matched.name);
      } else {
        let foundExisting = false;
        for (const existing of classSet) {
          if (isSameClass(s.class, existing)) {
            foundExisting = true;
            break;
          }
        }
        if (!foundExisting) {
          classSet.add(s.class);
        }
      }
    });

    // Section sort priority
    const getSortPriority = (name: string) => {
      const mc = mockClasses.find(c => c.name === name || c.code === name || isSameClass(c.name, name) || isSameClass(c.code, name));
      if (mc) {
        if (mc.section === 'Primaire') return 1;
        if (mc.section === 'Général') {
          if (name.includes('6ème') || name.includes('5ème') || name.includes('4ème') || name.includes('3ème')) return 2;
          return 3;
        }
        if (mc.section === 'Technique') return 4;
      }
      if (name.startsWith('CP') || name.startsWith('CE') || name.startsWith('CM')) return 1;
      if (name.startsWith('6') || name.startsWith('5') || name.startsWith('4') || name.startsWith('3')) return 2;
      return 3;
    };

    let arr = Array.from(classSet).sort((a, b) => {
      const prioA = getSortPriority(a);
      const prioB = getSortPriority(b);
      if (prioA !== prioB) return prioA - prioB;
      return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });

    if (currentUser?.section === 'Primaire') {
        arr = arr.filter(c => c.startsWith('CP') || c.startsWith('CE') || c.startsWith('CM'));
    }
    return arr;
  }, [students, currentUser]);

  // Helper to categorize class sections for badges and filters
  const getClassSection = (className: string): 'Collège' | 'Lycée Général' | 'Lycée Technique' | 'Primaire' => {
    const mc = mockClasses.find(c => c.name === className || c.code === className || isSameClass(c.name, className) || isSameClass(c.code, className));
    if (mc) {
      if (mc.section === 'Primaire') return 'Primaire';
      if (mc.section === 'Technique') return 'Lycée Technique';
      if (mc.name.includes('6ème') || mc.name.includes('5ème') || mc.name.includes('4ème') || mc.name.includes('3ème')) {
        return 'Collège';
      }
      return 'Lycée Général';
    }
    if (className.startsWith('CP') || className.startsWith('CE') || className.startsWith('CM')) return 'Primaire';
    if (className.startsWith('6') || className.startsWith('5') || className.startsWith('4') || className.startsWith('3')) return 'Collège';
    if (className.includes('G1') || className.includes('G2') || className.includes('AB')) return 'Lycée Technique';
    return 'Lycée Général';
  };

  // Function to get real students for any selected class
  const getStudentsForClass = (className: string): Student[] => {
    const mc = mockClasses.find(c => c.name === className || c.code === className || isSameClass(c.name, className) || isSameClass(c.code, className));
    return (students || []).filter(s => {
      if (!s.class) return false;
      if (s.class === className || isSameClass(s.class, className)) return true;
      if (mc && (s.class === mc.code || s.class === mc.name || isSameClass(s.class, mc.code) || isSameClass(s.class, mc.name))) return true;
      return false;
    });
  };

  // Default select first available class
  useEffect(() => {
    if (allAvailableClasses.length > 0 && !selectedClassFilter) {
      setSelectedClassFilter(allAvailableClasses[0]);
    }
  }, [allAvailableClasses, selectedClassFilter]);

  // Current class students list
  const currentClassStudents = useMemo(() => {
    if (!selectedClassFilter) return [];
    return getStudentsForClass(selectedClassFilter);
  }, [selectedClassFilter, students]);

  // When selected class changes, select all students in that class by default
  useEffect(() => {
    if (selectedClassFilter) {
      const classStudentIds = currentClassStudents.map(s => s.id);
      setClassSelectedIds(classStudentIds);
    }
  }, [selectedClassFilter, currentClassStudents]);

  // Grouped classes for dropdown search and filter
  const groupedClasses = useMemo(() => {
    let filtered = allAvailableClasses.filter(c => {
      const matchesSearch = c.toLowerCase().includes(classSearchQuery.toLowerCase());
      const section = getClassSection(c);
      const matchesSection = classSectionFilter === 'all' || section === classSectionFilter;
      return matchesSearch && matchesSection;
    });

    const sections: Record<string, string[]> = {};
    filtered.forEach(c => {
      const sec = getClassSection(c);
      if (!sections[sec]) sections[sec] = [];
      sections[sec].push(c);
    });

    return Object.keys(sections).map(sec => ({
      section: sec,
      classes: sections[sec]
    }));
  }, [allAvailableClasses, classSearchQuery, classSectionFilter]);

  // Filter students based on audience selection
  const targetStudents = useMemo(() => {
    if (targetAudience === 'class') {
      if (!selectedClassFilter) return [];
      return currentClassStudents.filter(s => classSelectedIds.includes(s.id));
    }
    if (targetAudience === 'selection') {
      return students.filter(s => selectedStudentIds.includes(s.id));
    }
    return [];
  }, [students, targetAudience, selectedClassFilter, currentClassStudents, classSelectedIds, selectedStudentIds]);

  // Helper for Parent Emails
  const getParentEmail = (s: Student) => {
      if (s.parentEmail) return s.parentEmail;
      const cleanName = s.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
      return `parent.${cleanName}@ecole.ci`;
  };

  // Filter list for manual selection UI
  const filteredSelectionList = useMemo(() => {
      return students.filter(s => 
          s.name.toLowerCase().includes(selectionSearchTerm.toLowerCase()) || 
          s.class.toLowerCase().includes(selectionSearchTerm.toLowerCase())
      );
  }, [students, selectionSearchTerm]);

  // Calculate stats
  const totalRecipients = targetStudents.length;
  const validNumbers = targetStudents.filter(s => s.parentPhone).length;
  const validEmails = targetStudents.length;
  const hasVariables = message.includes('{nom_eleve}') || message.includes('{classe}');

  const handleTemplateClick = (t: MessageTemplate) => {
      setMessage(t.content);
      if (t.subject) {
          setEmailSubject(t.subject);
      }
  };

  const toggleStudentSelection = (id: string) => {
      setSelectedStudentIds(prev => 
          prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
      );
  };

  const selectAllFiltered = () => {
      const idsToAdd = filteredSelectionList.map(s => s.id);
      setSelectedStudentIds(prev => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const deselectAll = () => {
      setSelectedStudentIds([]);
  };

  const startBroadcast = () => {
      if (message.trim() === '') return alert("Veuillez écrire un message.");
      if (channel === 'email' && emailSubject.trim() === '') return alert("Veuillez indiquer un objet pour l'e-mail.");
      if (channel !== 'email' && validNumbers === 0) return alert("Aucun parent sélectionné avec un numéro valide.");
      if (channel === 'email' && validEmails === 0) return alert("Aucun destinataire sélectionné.");

      // Reset Simulation Stats
      setIsSending(true);
      setProgress(0);
      setSentCount(0);
      setFailedCount(0);
  };

  // Logic to handle the actual "send" action when simulation finishes
  const executeBatchAction = () => {
      // Prepare generic message
      const genericMessage = message
            .replace(/{nom_eleve}/g, 'votre enfant')
            .replace(/{classe}/g, 'la classe');

      if (channel === 'email') {
          setShowEmailModal(true);
      } else {
          // WhatsApp Logic for PC
          setWhatsappCopiedMessage(genericMessage);
          
          // Copy to clipboard immediately if possible (requires focus, might need manual copy in modal)
          navigator.clipboard.writeText(genericMessage).catch(() => {});
          
          setShowWhatsappModal(true);
      }
  };

  const openWhatsappWeb = () => {
      // Re-copy to be sure
      navigator.clipboard.writeText(whatsappCopiedMessage);
      window.open('https://web.whatsapp.com/', '_blank');
      setShowWhatsappModal(false);
  };

  const openWhatsappApp = () => {
      navigator.clipboard.writeText(whatsappCopiedMessage);
      window.location.href = `whatsapp://send?text=${encodeURIComponent(whatsappCopiedMessage)}`;
      setShowWhatsappModal(false);
  };

  // Simulation Effect
  useEffect(() => {
      let timer: ReturnType<typeof setTimeout>;
      
      if (isSending) {
          if (progress < 100) {
              timer = setTimeout(() => {
                  const increment = 2; 
                  const newProgress = Math.min(progress + increment, 100);
                  setProgress(newProgress);
                  setSentCount(Math.floor((newProgress / 100) * validNumbers));
              }, 20);
          } else {
              setIsSending(false);
              setTimeout(() => {
                  executeBatchAction();
              }, 500);
          }
      }
      return () => clearTimeout(timer);
  }, [isSending, progress, validNumbers]);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 relative z-10 bg-[#BFDBFE] pt-12 md:pt-8">
      {/* Unified Header */}
        <div className="hidden md:flex justify-between items-center mt-5 mb-8 px-8 shrink-0">
            <div>
                <h1 className="text-white text-[28px] font-bold tracking-tight flex items-center gap-3">
                    <MessageCircle className="text-white" />
                    Communication Parents
                </h1>
                <p className="text-white/70 text-sm mt-1">Diffusion de messages groupés en un clic.</p>
            </div>
            
            <div className="flex items-center space-x-3">
                <div className="hidden md:flex bg-white/20 px-4 py-2 rounded-xl border border-white/30 shadow-sm items-center gap-3 ml-2">
                    <Smartphone size={18} className="text-white" />
                    <span className="text-sm font-bold text-white capitalize">{validNumbers} / {totalRecipients} Contacts</span>
                </div>
            </div>
        </div>

        {/* Mobile App Bar */}
        <div className="md:hidden flex justify-between items-center mb-8 px-6 shrink-0">
            <div>
                <h1 className="text-white text-[28px] font-bold tracking-tight">Messages</h1>
            </div>
            <div className="flex items-center space-x-3">
                <div className="flex bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50 shadow-sm items-center gap-2">
                    <Smartphone size={16} className="text-slate-700" />
                    <span className="text-xs font-bold text-slate-700">{validNumbers}/{totalRecipients}</span>
                </div>
            </div>
        </div>

        <div className="flex-1 bg-white rounded-t-[40px] px-6 pt-8 pb-32 md:px-8 md:pt-8 md:pb-24 shadow-2xl relative overflow-y-auto custom-scrollbar border-t border-white/50 md:border-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Composer */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
            
            {/* Audience Selector */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Users size={18} className="text-sky-500" />
                    1. Cible du message
                </h3>
                <div className="flex flex-wrap gap-3 mb-4">
                    <button 
                        onClick={() => setTargetAudience('class')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${targetAudience === 'class' ? 'bg-sky-600 text-white border-sky-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300'}`}
                    >
                        <School size={16} />
                        Par Classe
                    </button>
                    <button 
                        onClick={() => setTargetAudience('selection')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${targetAudience === 'selection' ? 'bg-sky-600 text-white border-sky-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300'}`}
                    >
                        <UserPlus size={16} />
                        Sélection Libre (Recherche)
                    </button>
                </div>

                {/* Class Selection & Student List */}
                {targetAudience === 'class' && (
                    <div className="space-y-5">
                        {/* STYLISH CLASS SELECTOR CARD */}
                        <div className="relative bg-gradient-to-r from-sky-50 via-slate-50 to-indigo-50/60 p-5 rounded-2xl border-2 border-sky-200 shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20 shrink-0">
                                        <GraduationCap size={22} />
                                    </div>
                                    <div>
                                        <span className="text-[11px] font-black uppercase tracking-wider text-sky-800 block">
                                            Classe Sélectionnée
                                        </span>
                                        <span className="text-xs font-bold text-slate-500">
                                            {allAvailableClasses.length} classes disponibles dans l'établissement
                                        </span>
                                    </div>
                                </div>

                                {/* Section Badge Pill */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-sky-200 rounded-full text-xs font-bold text-sky-800 shadow-2xs self-start sm:self-auto">
                                    <School size={14} className="text-sky-600" />
                                    <span>{getClassSection(selectedClassFilter)}</span>
                                </div>
                            </div>

                            {/* Dropdown Trigger Button */}
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                                    className="w-full flex items-center justify-between bg-white hover:bg-sky-50/60 border-2 border-sky-300 hover:border-sky-500 rounded-2xl p-4 shadow-sm transition-all text-left group cursor-pointer"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="px-3 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-xs">
                                            {selectedClassFilter || 'Sélectionner'}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-extrabold text-slate-900 text-base truncate group-hover:text-sky-700 transition-colors">
                                                Classe de {selectedClassFilter}
                                            </h4>
                                            <p className="text-xs text-slate-500 font-semibold truncate">
                                                {currentClassStudents.length} élèves inscrits • Contacts parents synchronisés
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <span className="hidden md:inline-block text-xs font-bold text-sky-700 bg-sky-100/80 px-3 py-1 rounded-xl">
                                            Changer de classe
                                        </span>
                                        <div className={`p-2 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-sky-600 group-hover:text-white transition-all transform ${isClassDropdownOpen ? 'rotate-180 bg-sky-600 text-white' : ''}`}>
                                            <ChevronDown size={18} />
                                        </div>
                                    </div>
                                </button>

                                {/* POPUP / POPOVER MENU OF ALL CLASSES */}
                                {isClassDropdownOpen && (
                                    <>
                                        {/* Backdrop to close on click outside */}
                                        <div 
                                            className="fixed inset-0 z-40 bg-black/50 sm:bg-transparent" 
                                            onClick={() => setIsClassDropdownOpen(false)} 
                                        />

                                        <div className="fixed inset-0 z-50 bg-white sm:rounded-3xl shadow-2xl sm:border-2 border-sky-200 p-4 space-y-3 animate-in fade-in sm:slide-in-from-top-2 flex flex-col sm:absolute sm:inset-auto sm:top-full sm:left-0 sm:right-0 sm:mt-2 sm:max-h-[440px]">
                                            <div className="flex items-center justify-between sm:hidden mb-2 shrink-0">
                                                <h3 className="font-bold text-slate-800 text-lg">Sélectionner une classe</h3>
                                                <button onClick={() => setIsClassDropdownOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-600">
                                                    <X size={20} />
                                                </button>
                                            </div>
                                            
                                            {/* Search inside classes */}
                                            <div className="relative shrink-0">
                                                <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                                                <input 
                                                    type="text"
                                                    placeholder="Rechercher une classe (ex: 6ème 1, Seconde C1...)..."
                                                    className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                                                    value={classSearchQuery}
                                                    onChange={(e) => setClassSearchQuery(e.target.value)}
                                                    autoFocus
                                                />
                                                {classSearchQuery && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => setClassSearchQuery('')}
                                                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Section filter tabs */}
                                            {currentUser?.section !== 'Primaire' && (
                                              <div className="flex flex-wrap items-center gap-1.5 shrink-0 border-b border-slate-100 pb-2">
                                                  {[
                                                      { id: 'all', label: 'Toutes les classes' },
                                                      { id: 'Collège', label: '🏫 Collège' },
                                                      { id: 'Lycée Général', label: '🎓 Lycée Général' },
                                                      { id: 'Lycée Technique', label: '⚙️ Technique' },
                                                      { id: 'Primaire', label: '🎒 Primaire' },
                                                  ].map(tab => (
                                                      <button
                                                          key={tab.id}
                                                          type="button"
                                                          onClick={() => setClassSectionFilter(tab.id)}
                                                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                                                              classSectionFilter === tab.id 
                                                                  ? 'bg-sky-600 text-white shadow-xs' 
                                                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                          }`}
                                                      >
                                                          {tab.label}
                                                      </button>
                                                  ))}
                                              </div>
                                            )}

                                            {/* Classes Grid / Scrollable List */}
                                            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                                                {groupedClasses.length === 0 ? (
                                                    <div className="py-8 text-center text-xs font-bold text-slate-400">
                                                        Aucune classe ne correspond à "{classSearchQuery}"
                                                    </div>
                                                ) : (
                                                    groupedClasses.map(group => (
                                                        <div key={group.section} className="space-y-2">
                                                            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
                                                                <span>{group.section}</span>
                                                                <span className="text-slate-400 font-semibold">{group.classes.length} classes</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                                {group.classes.map(cName => {
                                                                    const isSelected = selectedClassFilter === cName;
                                                                    const count = getStudentsForClass(cName).length;
                                                                    
                                                                    return (
                                                                        <button
                                                                            key={cName}
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setSelectedClassFilter(cName);
                                                                                setIsClassDropdownOpen(false);
                                                                            }}
                                                                            className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                                                                                isSelected 
                                                                                    ? 'bg-sky-600 text-white border-sky-600 shadow-md font-bold ring-2 ring-sky-400' 
                                                                                    : 'bg-slate-50 hover:bg-sky-50 border-slate-200 text-slate-800'
                                                                            }`}
                                                                        >
                                                                            <div className="min-w-0 pr-1">
                                                                                <div className="text-xs font-extrabold truncate">
                                                                                    {cName}
                                                                                </div>
                                                                                <div className={`text-[10px] font-semibold ${isSelected ? 'text-sky-100' : 'text-slate-500'}`}>
                                                                                    {count} élèves
                                                                                </div>
                                                                            </div>

                                                                            {isSelected && (
                                                                                <div className="w-5 h-5 rounded-full bg-white text-sky-600 flex items-center justify-center shrink-0 shadow-xs">
                                                                                    <Check size={12} strokeWidth={3} />
                                                                                </div>
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            {/* Dropdown footer info */}
                                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 shrink-0">
                                                <span>Affichage de toutes les classes</span>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setIsClassDropdownOpen(false)}
                                                    className="text-sky-600 hover:underline"
                                                >
                                                    Fermer
                                                </button>
                                            </div>

                                        </div>
                                    </>
                                )}
                            </div>

                            {/* QUICK ACCESS CLASS CHIPS */}
                            <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1 custom-scrollbar">
                                <span className="text-[10px] font-black uppercase text-slate-400 shrink-0 flex items-center gap-1">
                                    <Sparkles size={12} className="text-amber-500" />
                                    Accès Rapide :
                                </span>
                                {['6ème 1', '3ème 1', 'Seconde C1', 'Terminale D1', 'CM2', 'Seconde G1'].map(fastClass => (
                                    <button
                                        key={fastClass}
                                        type="button"
                                        onClick={() => setSelectedClassFilter(fastClass)}
                                        className={`px-3 py-1 rounded-lg text-xs font-extrabold shrink-0 transition-all ${
                                            selectedClassFilter === fastClass 
                                                ? 'bg-sky-600 text-white shadow-sm ring-2 ring-sky-400' 
                                                : 'bg-white text-slate-700 hover:bg-sky-100 border border-slate-200'
                                        }`}
                                    >
                                        {fastClass}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* STUDENT LIST FOR SELECTED CLASS */}
                        {selectedClassFilter && (
                            <div className="border-2 border-slate-200/80 rounded-2xl overflow-hidden animate-in slide-in-from-top-2 shadow-sm">
                                <div className="bg-slate-100 p-3.5 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
                                    <div className="text-xs font-black text-slate-800 flex items-center gap-2">
                                        <Users size={15} className="text-sky-600" />
                                        <span>
                                            Élèves de <span className="text-sky-600 font-black">{selectedClassFilter}</span>
                                        </span>
                                        <span className="px-2 py-0.5 bg-sky-100 text-sky-800 rounded-full text-[11px]">
                                            {classSelectedIds.length} / {currentClassStudents.length} sélectionnés
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            type="button"
                                            onClick={() => setClassSelectedIds(currentClassStudents.map(s => s.id))} 
                                            className="text-xs font-bold text-sky-600 hover:text-sky-800 hover:underline"
                                        >
                                            Tout cocher
                                        </button>
                                        <span className="text-slate-300">|</span>
                                        <button 
                                            type="button"
                                            onClick={() => setClassSelectedIds([])} 
                                            className="text-xs font-bold text-slate-500 hover:text-slate-800"
                                        >
                                            Tout décocher
                                        </button>
                                    </div>
                                </div>

                                <div className="max-h-[320px] overflow-y-auto bg-white p-2 divide-y divide-slate-100 custom-scrollbar">
                                    {currentClassStudents.length === 0 ? (
                                        <div className="p-8 text-center bg-slate-50/50 rounded-xl my-2">
                                            <Users size={32} className="mx-auto text-slate-300 mb-2" />
                                            <p className="text-xs font-bold text-slate-600">Aucun élève enregistré en {selectedClassFilter}</p>
                                            <p className="text-[11px] text-slate-400 mt-1">Seuls les élèves réellement inscrits dans l'application apparaissent ici.</p>
                                        </div>
                                    ) : (
                                        currentClassStudents.map(s => {
                                            const isSelected = classSelectedIds.includes(s.id);
                                            const parentEmail = getParentEmail(s);
                                            
                                            return (
                                                <div 
                                                    key={s.id}
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setClassSelectedIds(prev => prev.filter(id => id !== s.id));
                                                        } else {
                                                            setClassSelectedIds(prev => [...prev, s.id]);
                                                        }
                                                    }}
                                                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${isSelected ? 'bg-sky-50/80 border border-sky-100' : 'hover:bg-slate-50'}`}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0 pr-2">
                                                        <div className="text-sky-600 shrink-0">
                                                            {isSelected ? <CheckSquare size={20} className="fill-sky-100 text-sky-600" /> : <Square size={20} className="text-slate-300" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-slate-900 truncate">{s.name}</p>
                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-500 mt-0.5">
                                                                <span className="flex items-center gap-1">
                                                                    <Phone size={11} className="text-slate-400 shrink-0" />
                                                                    <b className="font-semibold text-slate-700">{s.parentPhone || "Pas de numéro"}</b>
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <AtSign size={11} className="text-slate-400 shrink-0" />
                                                                    <span className="text-slate-600 truncate max-w-[180px]">{parentEmail}</span>
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Selection UI for Manual Free Selection */}
                {targetAudience === 'selection' && (
                    <div className="mt-4 border border-gray-200 rounded-2xl overflow-hidden animate-in slide-in-from-top-2">
                        {/* Search & Actions */}
                        <div className="bg-gray-50 p-3 border-b border-gray-200 flex flex-col gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Rechercher par nom ou classe..."
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-sky-500"
                                    value={selectionSearchTerm}
                                    onChange={(e) => setSelectionSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-between items-center px-1">
                                <div className="text-xs text-gray-500 font-medium">
                                    <span className="font-bold text-sky-600">{selectedStudentIds.length}</span> élèves sélectionnés
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={selectAllFiltered} className="text-xs font-bold text-sky-600 hover:underline">Tout cocher</button>
                                    <span className="text-gray-300">|</span>
                                    <button onClick={deselectAll} className="text-xs font-bold text-gray-500 hover:text-gray-800">Tout décocher</button>
                                </div>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[250px] overflow-y-auto bg-white p-2 divide-y divide-gray-100 custom-scrollbar">
                            {filteredSelectionList.length > 0 ? filteredSelectionList.map(s => (
                                <div 
                                    key={s.id}
                                    onClick={() => toggleStudentSelection(s.id)}
                                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-colors ${selectedStudentIds.includes(s.id) ? 'bg-sky-50/70' : 'hover:bg-gray-50'}`}
                                >
                                    <div className="text-sky-600 shrink-0">
                                        {selectedStudentIds.includes(s.id) ? <CheckSquare size={20} className="fill-sky-100" /> : <Square size={20} className="text-gray-300" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-800 truncate">{s.name}</span>
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-bold shrink-0">{s.class}</span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                                            <span className="flex items-center gap-1">
                                                <Phone size={11} className="text-gray-400 shrink-0" />
                                                <b className="font-semibold text-slate-700">{s.parentPhone || "Pas de numéro"}</b>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <AtSign size={11} className="text-gray-400 shrink-0" />
                                                <span className="text-slate-600 truncate max-w-[180px]">{getParentEmail(s)}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 text-gray-400 text-sm">Aucun élève trouvé.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Channel & Composer */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm flex-1">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Send size={18} className="text-sky-500" />
                    2. Rédaction
                </h3>

                {/* Channel Switch */}
                <div className="flex bg-gray-50 p-1.5 rounded-xl mb-6 w-full flex-wrap gap-1">
                    <button 
                        onClick={() => setChannel('whatsapp')}
                        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${channel === 'whatsapp' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <MessageCircle size={18} />
                        WhatsApp
                    </button>
                    <button 
                        onClick={() => setChannel('email')}
                        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${channel === 'email' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Mail size={18} />
                        E-mail Groupé
                    </button>
                </div>

                {/* Subject Field for Email */}
                {channel === 'email' && (
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                            Objet de l'E-mail
                        </label>
                        <div className="relative">
                            <input 
                                type="text"
                                value={emailSubject}
                                onChange={(e) => setEmailSubject(e.target.value)}
                                placeholder="Objet du message e-mail..."
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                            />
                        </div>
                    </div>
                )}

                {/* Templates & Quick Convocation Suggestions */}
                <div className="mb-5 space-y-2">
                    <div className="flex items-center justify-between">
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Sparkles size={12} className="text-amber-500" />
                            Modèles Rapides & Convocations
                        </p>
                        <span className="text-[11px] font-bold text-sky-600">
                            Cliquez pour pré-remplir
                        </span>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 custom-scrollbar">
                        {templates.map(t => {
                            const isConvocation = t.category === 'convocation' || t.category === 'discipline';
                            return (
                                <button 
                                    key={t.id}
                                    type="button"
                                    onClick={() => handleTemplateClick(t)}
                                    className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs hover:scale-[1.02] active:scale-[0.98] ${
                                        isConvocation 
                                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80' 
                                            : t.category === 'finance'
                                            ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80'
                                            : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/80'
                                    }`}
                                >
                                    {t.title}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Text Area */}
                <div className="relative">
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={
                            channel === 'whatsapp' 
                            ? "Tapez votre message WhatsApp ici... Vous pouvez utiliser *gras* et _italique_." 
                            : "Rédigez le contenu de votre e-mail pour les parents..."
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all min-h-[200px] resize-none"
                    ></textarea>
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-bold bg-white px-2 py-1 rounded-md shadow-sm">
                        {message.length} caractères
                    </div>
                </div>
                
                {/* Variable Helpers */}
                <div className="mt-4 flex flex-col gap-2">
                    <div className="text-xs text-gray-500 flex gap-4 items-center">
                        <span className="font-bold">Variables :</span>
                        <span className="font-mono bg-gray-100 px-1 rounded text-gray-700 cursor-pointer hover:bg-gray-200" onClick={() => setMessage(prev => prev + ' {nom_eleve}')}>{'{nom_eleve}'}</span>
                        <span className="font-mono bg-gray-100 px-1 rounded text-gray-700 cursor-pointer hover:bg-gray-200" onClick={() => setMessage(prev => prev + ' {classe}')}>{'{classe}'}</span>
                    </div>

                    {/* Warning for Bulk with variables */}
                    {hasVariables && (
                        <div className="bg-orange-50 text-orange-700 text-xs p-3 rounded-xl flex gap-2 items-start border border-orange-100">
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            <span>
                                <b>Attention :</b> En diffusion groupée, les variables seront remplacées par des termes génériques (ex: "votre enfant") car le même message est envoyé à tous en un seul clic. Pour une personnalisation individuelle, utilisez les liens 1-clic dans la fenêtre d'envoi.
                            </span>
                        </div>
                    )}
                </div>

                {/* Send Button */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-2">
                    {isSending ? (
                         <div className="flex items-center gap-3 w-full animate-pulse">
                            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-green-500 transition-all duration-75 ease-linear" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <span className="text-sm font-bold text-gray-600 min-w-[60px]">{Math.round(progress)}%</span>
                         </div>
                    ) : (
                        <button 
                            onClick={startBroadcast}
                            disabled={channel === 'email' ? validEmails === 0 : validNumbers === 0}
                            className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-white font-bold shadow-lg transition-all transform active:scale-95 ${
                                channel === 'whatsapp' 
                                ? 'bg-[#25D366] hover:bg-[#20bd5a] shadow-green-200' 
                                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                            } ${(channel === 'email' ? validEmails === 0 : validNumbers === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {channel === 'whatsapp' && <MessageCircle size={18} />}
                            {channel === 'email' && <Mail size={18} />}

                            {channel === 'email' 
                                ? `Préparer l'envoi E-mail pour ${validEmails} parents` 
                                : `Préparer WhatsApp pour ${validNumbers} parents`}
                        </button>
                    )}
                    
                    {/* Explicit Help Text */}
                    {channel === 'whatsapp' && (
                        <p className="text-center text-xs text-gray-400 mt-2">
                            <Info size={12} className="inline mr-1 -mt-0.5" />
                            Mode PC : Copie le texte et ouvre WhatsApp Web.
                        </p>
                    )}
                    {channel === 'email' && (
                        <p className="text-center text-xs text-gray-400 mt-2">
                            <Info size={12} className="inline mr-1 -mt-0.5" />
                            Génère l'e-mail pré-rempli dans votre messagerie (Gmail, Outlook...)
                        </p>
                    )}
                </div>
            </div>
        </div>

        {/* Right Column: Preview & Logs */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            
            {/* Phone/Email Preview */}
            <div className="bg-gray-800 rounded-[2.5rem] p-4 shadow-2xl relative mx-auto w-full max-w-[320px] border-[6px] border-gray-900">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10"></div>
                
                {/* Screen */}
                <div className={`w-full h-[500px] ${channel === 'email' ? 'bg-slate-100' : 'bg-[#E5DDD5]'} rounded-[2rem] overflow-hidden flex flex-col relative`}>
                    {/* Header */}
                    <div className={`${channel === 'whatsapp' ? 'bg-[#075E54]' : 'bg-purple-900 text-white'} p-4 pt-8 flex items-center gap-3`}>
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                            {channel === 'email' ? <Mail size={16} className="text-white"/> : <School size={16} className="text-white"/>}
                        </div>
                        <div className="truncate">
                            <p className="text-sm font-bold truncate text-white">Dashboard</p>
                            {channel === 'whatsapp' && <p className="text-[10px] text-white/80">En ligne</p>}
                            {channel === 'email' && <p className="text-[10px] text-white/80">direction@ecole.ci</p>}
                        </div>
                    </div>

                    {/* Email Subject Bar */}
                    {channel === 'email' && (
                        <div className="bg-white border-b border-slate-200 px-3 py-2 text-xs">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Objet :</p>
                            <p className="font-bold text-slate-800 truncate">{emailSubject || '(Sans objet)'}</p>
                        </div>
                    )}

                    {/* Message Body */}
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className={`p-3 rounded-lg text-sm shadow-sm mb-2 ${
                            channel === 'whatsapp' 
                            ? 'bg-white rounded-tl-none ml-0 max-w-[85%]' 
                            : 'bg-white rounded-xl text-slate-800 border border-slate-200 w-full'
                        }`}>
                            <p className="text-gray-800 whitespace-pre-line text-xs leading-relaxed">
                                {message || "L'aperçu de votre message apparaîtra ici..."}
                            </p>
                            <p className="text-[10px] text-gray-400 text-right mt-2">10:42</p>
                        </div>
                        {hasVariables && (
                            <p className="text-center text-[10px] text-gray-500 mt-4 bg-yellow-100 p-2 rounded">
                                <AlertCircle size={10} className="inline mr-1"/>
                                Variables dynamiques actives.
                            </p>
                        )}
                    </div>

                    {/* Footer Input Mock */}
                    <div className="bg-gray-50 p-3 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                        <div className="flex-1 h-8 bg-white rounded-full border border-gray-200"></div>
                    </div>
                </div>
            </div>

            {/* How It Works Guide (Dynamic) */}
            <div className={`rounded-[2rem] p-6 border shadow-sm animate-in slide-in-from-bottom-2 ${
                channel === 'email' ? 'bg-purple-50 border-purple-100' : 'bg-green-50 border-green-100'
            }`}>
                 <h3 className={`font-bold mb-3 flex items-center gap-2 ${
                     channel === 'email' ? 'text-purple-900' : 'text-green-800'
                 }`}>
                    <Info size={18} />
                    {channel === 'email' ? 'Mode E-mail (Messagerie PC / Mobile)' : 'Mode WhatsApp (PC)'}
                 </h3>
                 <div className="flex flex-col gap-3">
                     {channel === 'whatsapp' && (
                         <>
                             <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-200 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                <p className="text-xs text-green-700">Cliquez sur <b>Préparer WhatsApp</b>.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-200 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                <p className="text-xs text-green-700">Le texte est <b>copié automatiquement</b>.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-200 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                                <p className="text-xs text-green-700">L'app ouvre <b>WhatsApp Web</b>. Vous n'avez qu'à "Coller" dans votre groupe.</p>
                            </div>
                         </>
                     )}
                     {channel === 'email' && (
                         <>
                             <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                <p className="text-xs text-purple-800">Cliquez sur <b>Préparer l'envoi E-mail</b>.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                <p className="text-xs text-purple-800">Ouvre votre messagerie (Gmail, Outlook) avec tous les parents en <b>CCI</b>.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">3</div>
                                <p className="text-xs text-purple-800">Cliquez sur "Envoyer" dans votre logiciel e-mail.</p>
                            </div>
                         </>
                     )}
                 </div>
            </div>

            {/* Logs Card */}
            {progress > 0 && (
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4">
                    <h3 className="font-bold text-gray-800 mb-4">Rapport d'envoi</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={18} className="text-green-500" />
                                <span className="text-sm font-medium text-gray-600">Traités avec succès</span>
                            </div>
                            <span className="font-bold text-gray-800">{sentCount}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={18} className="text-sky-400" />
                                <span className="text-sm font-medium text-gray-600">Échecs</span>
                            </div>
                            <span className="font-bold text-gray-800">{failedCount}</span>
                        </div>
                    </div>
                </div>
            )}

        </div>
      </div>

      {/* --- WHATSAPP MODAL (WEB) --- */}
      {showWhatsappModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setShowWhatsappModal(false)}
            ></div>
            
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col items-center text-center max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-3 shrink-0">
                    <Monitor size={28} />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Envoi WhatsApp ({validNumbers} parents)</h2>
                <p className="text-gray-500 text-xs mb-4 max-w-sm">
                    WhatsApp interdit l'envoi automatique masqué en masse pour lutter contre le spam. Choisissez la méthode d'envoi :
                </p>

                <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3.5 mb-4 text-left relative group">
                    <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase">Message préparé (copié) :</p>
                    <p className="text-xs text-gray-800 font-medium line-clamp-3 italic">"{whatsappCopiedMessage}"</p>
                </div>

                <div className="w-full space-y-3 mb-4 text-left">
                    <div className="p-4 rounded-2xl border border-green-200 bg-green-50/50 flex flex-col gap-2">
                        <p className="text-xs font-bold text-green-900 flex items-center gap-1.5">
                            <span className="w-5 h-5 bg-green-600 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                            Option 1 : Diffusion Groupée (Copier & Ouvrir)
                        </p>
                        <p className="text-[11px] text-green-800 leading-relaxed">
                            Le message est déjà copié. Collez-le (<b>Ctrl+V</b>) dans votre <b>Groupe de Classe</b> ou <b>Liste de diffusion</b> :
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            <button 
                                onClick={openWhatsappApp}
                                className="py-2.5 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                            >
                                <Smartphone size={16} />
                                Ouvrir l'App WhatsApp
                            </button>
                            <button 
                                onClick={openWhatsappWeb}
                                className="py-2.5 px-3 bg-white hover:bg-gray-50 text-green-800 border border-green-300 font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 text-xs"
                            >
                                <ExternalLink size={16} />
                                WhatsApp Web
                            </button>
                        </div>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col gap-2">
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-5 h-5 bg-slate-700 text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                            Option 2 : Envois individuels direct (1-clic par parent)
                        </p>
                        <p className="text-[11px] text-slate-600">
                            Cliquez sur un parent pour ouvrir sa discussion directement dans WhatsApp :
                        </p>

                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar mt-1">
                            {targetStudents.filter(s => s.parentPhone).map((st) => {
                                const rawPhone = st.parentPhone.replace(/\D/g, '');
                                const formattedPhone = rawPhone.startsWith('225') ? rawPhone : (rawPhone.startsWith('0') ? '225' + rawPhone.substring(1) : '225' + rawPhone);
                                const parentMsg = message
                                    .replace(/{nom_eleve}/g, st.name)
                                    .replace(/{classe}/g, st.class);
                                const waAppUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(parentMsg)}`;
                                const waWebUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(parentMsg)}`;

                                return (
                                    <div key={st.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                                        <div className="truncate pr-2">
                                            <p className="font-bold text-slate-800 truncate">{st.name}</p>
                                            <p className="text-[10px] text-slate-500">{st.class} • {st.parentPhone}</p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <a 
                                                href={waAppUrl} 
                                                className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors"
                                                title="Ouvrir dans l'application WhatsApp"
                                            >
                                                <Smartphone size={12} />
                                                App
                                            </a>
                                            <a 
                                                href={waWebUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="px-2.5 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-colors"
                                                title="Ouvrir dans WhatsApp Web"
                                            >
                                                <MessageSquare size={12} />
                                                Web
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setShowWhatsappModal(false)}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-xs"
                >
                    Fermer
                </button>
            </div>
        </div>
      )}

      {/* --- EMAIL MODAL --- */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={() => setShowEmailModal(false)}
            ></div>
            
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col items-center text-center max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mb-3 shrink-0">
                    <Mail size={28} />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Envoi E-mail ({targetStudents.length} parents)</h2>
                <p className="text-gray-500 text-xs mb-4 max-w-sm">
                    Sélectionnez votre méthode d'envoi e-mail pour communiquer avec les parents :
                </p>

                {/* Email Subject & Message Summary */}
                <div className="w-full bg-purple-50/60 border border-purple-100 rounded-2xl p-3.5 mb-4 text-left">
                    <p className="text-[10px] font-bold text-purple-600 uppercase mb-0.5">Objet :</p>
                    <p className="text-xs font-bold text-purple-900 mb-2 truncate">{emailSubject}</p>
                    <p className="text-[10px] font-bold text-purple-600 uppercase mb-0.5">Message :</p>
                    <p className="text-xs text-purple-950 font-medium line-clamp-3 italic">
                        "{message.replace(/{nom_eleve}/g, 'votre enfant').replace(/{classe}/g, 'la classe')}"
                    </p>
                </div>

                <div className="w-full space-y-3 mb-4 text-left">
                    {/* Option 1: Mailto Launch */}
                    <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/40 flex flex-col gap-2">
                        <p className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                            <span className="w-5 h-5 bg-purple-700 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
                            Option 1 : Ouvrir votre logiciel E-mail (Gmail, Outlook...)
                        </p>
                        <p className="text-[11px] text-purple-800 leading-relaxed">
                            Ouvre automatiquement votre logiciel de messagerie par défaut avec les <b>{targetStudents.length} adresses e-mail en copie cachée (CCI)</b>, l'objet et le message pré-remplis.
                        </p>
                        <button 
                            onClick={() => {
                                const bccList = targetStudents.map(getParentEmail).join(',');
                                const genericMsg = message.replace(/{nom_eleve}/g, 'votre enfant').replace(/{classe}/g, 'la classe');
                                const mailtoUrl = `mailto:?bcc=${encodeURIComponent(bccList)}&subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(genericMsg)}`;
                                window.open(mailtoUrl, '_blank');
                            }}
                            className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs mt-1"
                        >
                            <ExternalLink size={16} />
                            Ouvrir l'application E-mail
                        </button>
                    </div>

                    {/* Option 2: Copy All Emails */}
                    <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
                        <div>
                            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <span className="w-5 h-5 bg-slate-700 text-white rounded-full flex items-center justify-center text-[10px]">2</span>
                                Option 2 : Copier les adresses E-mail
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                                Copie les {targetStudents.length} adresses au format séparé par virgule pour coller dans votre champ CCI.
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                const allEmails = targetStudents.map(getParentEmail).join(', ');
                                navigator.clipboard.writeText(allEmails);
                                setCopiedEmailsToast(true);
                                setTimeout(() => setCopiedEmailsToast(false), 3000);
                            }}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shrink-0 flex items-center gap-1 transition-colors"
                        >
                            <Copy size={14} />
                            {copiedEmailsToast ? 'Copié !' : 'Copier'}
                        </button>
                    </div>

                    {/* Option 3: Individual Mailto Links */}
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col gap-2">
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <span className="w-5 h-5 bg-slate-700 text-white rounded-full flex items-center justify-center text-[10px]">3</span>
                            Option 3 : Envois individuels personnalisés (1-clic par parent)
                        </p>
                        <p className="text-[11px] text-slate-600">
                            Envoyez un e-mail personnalisé pour chaque élève avec son nom et sa classe pré-remplis :
                        </p>

                        <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar mt-1">
                            {targetStudents.map((st) => {
                                const parentEmail = getParentEmail(st);
                                const parentMsg = message
                                    .replace(/{nom_eleve}/g, st.name)
                                    .replace(/{classe}/g, st.class);
                                const individualMailto = `mailto:${encodeURIComponent(parentEmail)}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(parentMsg)}`;

                                return (
                                    <div key={st.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs">
                                        <div className="truncate pr-2">
                                            <p className="font-bold text-slate-800 truncate">{st.name}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{st.class} • {parentEmail}</p>
                                        </div>
                                        <a 
                                            href={individualMailto}
                                            className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold rounded-lg text-[11px] flex items-center gap-1 shrink-0 transition-colors"
                                        >
                                            <Mail size={12} />
                                            E-mail
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setShowEmailModal(false)}
                    className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors text-xs"
                >
                    Fermer
                </button>
            </div>
        </div>
      )}

    </div>
    </div>
  );
};