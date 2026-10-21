import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, Award, ShieldCheck, Search, Plus, Phone, Mail, 
  GraduationCap, BookOpen, Edit3, Trash2, X, Check, ArrowLeft, 
  Users, Sparkles, Calendar, CheckCircle2, MessageSquare, Briefcase, FileText, HeartHandshake, Printer, Lock, ChevronDown, Building2
} from 'lucide-react';
import { User, Student } from '../types';

export interface BureauMember {
  id: string;
  roleTitle: string; // e.g. "Président du Conseil (Délégué Général)"
  studentName: string;
  className: string;
  studentId: string;
  gender: 'M' | 'F';
  phone: string;
  email: string;
  photoUrl: string;
  mandatePeriod: string; // e.g. "2025 - 2026"
  commissionName?: string; // e.g. "Commission Écologie & Cadre de vie"
  missionDescription?: string;
}

export interface BureauProject {
  id: string;
  title: string;
  category: 'Événement' | 'Vie Scolaire' | 'Écologie' | 'Solidarité' | 'Discipline';
  status: 'En cours' | 'Planifié' | 'Terminé';
  date: string;
  responsibleMember: string;
  description: string;
}

export interface BureauMeeting {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  location: string;
  participants: string;
  agendaText?: string;
}

const DEFAULT_BUREAU_MEMBERS: BureauMember[] = [];

const DEFAULT_PROJECTS: BureauProject[] = [];

const DEFAULT_MEETINGS: BureauMeeting[] = [];

interface BureauConseilDeleguesPageProps {
  currentUser?: User;
  allStudents?: Student[];
  onNavigate?: (page: string) => void;
}

export const BureauConseilDeleguesPage: React.FC<BureauConseilDeleguesPageProps> = ({
  currentUser,
  allStudents = [],
  onNavigate
}) => {
  const [members, setMembers] = useState<BureauMember[]>(() => {
    const saved = localStorage.getItem('school_db_bureau_delegues');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_BUREAU_MEMBERS;
      }
    }
    return DEFAULT_BUREAU_MEMBERS;
  });

  const [projects, setProjects] = useState<BureauProject[]>(() => {
    const saved = localStorage.getItem('school_db_bureau_projects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_PROJECTS;
      }
    }
    return DEFAULT_PROJECTS;
  });

  const [meetings, setMeetings] = useState<BureauMeeting[]>(() => {
    const saved = localStorage.getItem('school_db_bureau_meetings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_MEETINGS;
      }
    }
    return DEFAULT_MEETINGS;
  });

  const [activeTab, setActiveTab] = useState<'members' | 'projects' | 'meetings'>('members');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Member modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<BureauMember | null>(null);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);

  // Project modal state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<BureauProject | null>(null);
  const [projectFormData, setProjectFormData] = useState<Partial<BureauProject>>({
    title: '',
    category: 'Événement',
    status: 'En cours',
    date: '',
    responsibleMember: '',
    description: ''
  });

  // Meeting modal state
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<BureauMeeting | null>(null);
  const [meetingFormData, setMeetingFormData] = useState<Partial<BureauMeeting>>({
    title: '',
    subtitle: '',
    date: '',
    location: '',
    participants: '',
    agendaText: ''
  });

  const availableClasses = Array.from(
    new Set(allStudents.map(s => s.className || s.class).filter(Boolean))
  ).sort();
  const defaultClasses = ['6ème 1', '6ème 2', '5ème 1', '5ème 2', '4ème 1', '4ème 2', '3ème 1', '3ème 2', '2nde C1', '1ère D1', 'Terminale A1', 'Terminale D1', 'Terminale D2'];
  const classListOptions = availableClasses.length > 0 ? availableClasses : defaultClasses;

  const isAnyModalOpen = isModalOpen || isProjectModalOpen || isMeetingModalOpen;

  useEffect(() => {
    if (isAnyModalOpen) {
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
  }, [isAnyModalOpen]);

  // Form State for member
  const [formData, setFormData] = useState<Partial<BureauMember>>({
    roleTitle: '',
    studentName: '',
    className: 'Terminale D2',
    studentId: '',
    gender: 'M',
    phone: '',
    email: '',
    photoUrl: '',
    mandatePeriod: '2025 - 2026',
    commissionName: 'Bureau Exécutif',
    missionDescription: ''
  });

  useEffect(() => {
    if (members.length > 0 && members[0].studentName === 'Gbocho Marc-Aurèle') setMembers([]);
    if (projects.length > 0 && projects[0].title === 'Tournoi Inter-Classes de Futsal') setProjects([]);
    if (meetings.length > 0 && meetings[0].title === 'Session Ordinaire d\'Investiture') setMeetings([]);
  }, []);

  useEffect(() => {
    localStorage.setItem('school_db_bureau_delegues', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('school_db_bureau_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('school_db_bureau_meetings', JSON.stringify(meetings));
  }, [meetings]);

  const canEdit = currentUser?.role === 'director' || (currentUser?.accessLevel ?? 0) >= 5;

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData({
      roleTitle: '',
      studentName: '',
      className: 'Terminale D2',
      studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      gender: 'M',
      phone: '+225 07 00 00 00 00',
      email: 'delegue@eleve.education.ci',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      mandatePeriod: '2025 - 2026',
      commissionName: 'Bureau Exécutif',
      missionDescription: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: BureauMember) => {
    setEditingMember(m);
    setFormData(m);
    setIsModalOpen(true);
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm('Voulez-vous vraiment retirer ce membre du bureau ?')) {
      setMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roleTitle || !formData.studentName || !formData.className) {
      alert('Veuillez renseigner le poste, le nom de l\'élève et la classe.');
      return;
    }

    if (editingMember) {
      setMembers(prev => prev.map(m => m.id === editingMember.id ? ({ ...m, ...formData } as BureauMember) : m));
    } else {
      const newMember: BureauMember = {
        id: `bm-${Date.now()}`,
        roleTitle: formData.roleTitle || 'Membre du Bureau',
        studentName: formData.studentName || 'Nom Élève',
        className: formData.className || 'Terminale',
        studentId: formData.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        gender: formData.gender || 'M',
        phone: formData.phone || '',
        email: formData.email || '',
        photoUrl: formData.photoUrl || `https://i.pravatar.cc/150?u=${Date.now()}`,
        mandatePeriod: formData.mandatePeriod || '2025 - 2026',
        commissionName: formData.commissionName || 'Bureau Exécutif',
        missionDescription: formData.missionDescription || ''
      };
      setMembers(prev => [newMember, ...prev]);
    }

    setIsModalOpen(false);
  };

  // PROJECT CRUD HANDLERS
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setProjectFormData({
      title: '',
      category: 'Événement',
      status: 'En cours',
      date: 'Novembre 2026',
      responsibleMember: members[0]?.studentName || 'Bureau des Délégués',
      description: ''
    });
    setIsProjectModalOpen(true);
  };

  const handleOpenEditProject = (p: BureauProject) => {
    setEditingProject(p);
    setProjectFormData(p);
    setIsProjectModalOpen(true);
  };

  const handleDeleteProject = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce projet ?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectFormData.title || !projectFormData.description) {
      alert('Veuillez renseigner le titre et la description du projet.');
      return;
    }

    if (editingProject) {
      setProjects(prev => prev.map(p => p.id === editingProject.id ? ({ ...p, ...projectFormData } as BureauProject) : p));
    } else {
      const newProj: BureauProject = {
        id: `proj-${Date.now()}`,
        title: projectFormData.title || 'Nouveau Projet',
        category: (projectFormData.category as any) || 'Événement',
        status: (projectFormData.status as any) || 'Planifié',
        date: projectFormData.date || 'À venir',
        responsibleMember: projectFormData.responsibleMember || 'Délégué Responsable',
        description: projectFormData.description || ''
      };
      setProjects(prev => [newProj, ...prev]);
    }

    setIsProjectModalOpen(false);
  };

  // MEETING CRUD HANDLERS
  const handleOpenAddMeeting = () => {
    setEditingMeeting(null);
    setMeetingFormData({
      title: 'Assemblée Générale des Délégués',
      subtitle: 'Réunion ordinaire',
      date: 'Mercredi 15 Décembre 2026 à 15h00',
      location: 'Grande Salle de Conférence',
      participants: 'Tous les chefs de classe titulaires + Membres du Bureau',
      agendaText: "Point d'étape du trimestre.\nQuestions des délégués de classe."
    });
    setIsMeetingModalOpen(true);
  };

  const handleOpenEditMeeting = (m: BureauMeeting) => {
    setEditingMeeting(m);
    setMeetingFormData(m);
    setIsMeetingModalOpen(true);
  };

  const handleDeleteMeeting = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette Assemblée Générale ?')) {
      setMeetings(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleSaveMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingFormData.title || !meetingFormData.date) {
      alert('Veuillez renseigner le titre et la date de l\'assemblée générale.');
      return;
    }

    if (editingMeeting) {
      setMeetings(prev => prev.map(m => m.id === editingMeeting.id ? ({ ...m, ...meetingFormData } as BureauMeeting) : m));
    } else {
      const newMeet: BureauMeeting = {
        id: `meet-${Date.now()}`,
        title: meetingFormData.title || 'Assemblée Générale',
        subtitle: meetingFormData.subtitle || '',
        date: meetingFormData.date || 'Prochainement',
        location: meetingFormData.location || 'Salle de Réunion',
        participants: meetingFormData.participants || 'Membres du bureau et délégués',
        agendaText: meetingFormData.agendaText || ''
      };
      setMeetings(prev => [newMeet, ...prev]);
    }

    setIsMeetingModalOpen(false);
  };

  const filteredMembers = members.filter(m => 
    !searchTerm || 
    m.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.roleTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.commissionName && m.commissionName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePrint = () => {
    const title = "BUREAU DU CONSEIL DES DÉLÉGUÉS";
    const subtitle = `Gouvernance et Représentation des Élèves — Mandat 2025 - 2026`;
    const directorName = typeof window !== 'undefined' ? (localStorage.getItem('school_director_studies_name') || 'M. TAPE MAURICE') : 'M. TAPE MAURICE';

    try {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="utf-8">
              <title>${title} - Collège Les Phalènes II</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  @page { size: A4 landscape; margin: 8mm; }
                  .no-print { display: none !important; }
                }
                body { background-color: #f8fafc !important; color: #0f172a !important; font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
              </style>
            </head>
            <body>
              <div class="no-print" style="margin-bottom: 20px; padding: 14px 20px; background-color: #0f172a; color: white; display: flex; justify-content: space-between; align-items: center; border-radius: 14px; font-family: sans-serif;">
                <div>
                  <strong style="font-size: 15px;">Impression : ${title}</strong>
                  <p style="font-size: 12px; margin: 2px 0 0 0; color: #94a3b8;">${subtitle}</p>
                </div>
                <div style="display: flex; gap: 10px;">
                  <button onclick="window.print()" style="padding: 9px 18px; background-color: #0284c7; color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                    🖨️ Imprimer ce document
                  </button>
                  <button onclick="window.close()" style="padding: 9px 14px; background-color: #334155; color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                    Fermer
                  </button>
                </div>
              </div>

              <!-- OFFICIAL HEADER -->
              <div class="mb-6 pb-4 border-b-2 border-slate-900 flex justify-between items-center">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 flex items-center justify-center shrink-0">
                    <img src="icone.png" alt="Logo" class="w-12 h-12 object-contain" />
                  </div>
                  <div>
                    <h1 class="text-xl font-black uppercase text-slate-900">${title}</h1>
                    <p class="text-xs font-bold text-slate-600">${subtitle}</p>
                  </div>
                </div>
                <div class="text-right text-[11px] text-slate-700 space-y-0.5">
                  <p class="font-black uppercase text-slate-900 text-xs">DASHBOARD</p>
                  <p>Yopougon Niangon Sud Carrefour</p>
                  <p>Tél : 27 23 45 61 11 / 05 05 96 70 80</p>
                </div>
              </div>

              <!-- SECTION 1: MEMBERS -->
              <div class="mb-8">
                <h2 class="text-sm font-black uppercase text-sky-900 border-b pb-1 mb-4">Membres du Bureau Exécutif & Commissions</h2>
                <div class="grid grid-cols-3 gap-4">
                  ${filteredMembers.map(m => `
                    <div class="border border-slate-300 rounded-2xl p-3.5 bg-white shadow-xs space-y-2">
                      <div class="flex items-start gap-3">
                        <img src="${m.photoUrl}" class="w-12 h-12 rounded-xl object-cover border border-sky-300 shrink-0 mt-0.5" />
                        <div class="min-w-0 flex-1">
                          <p class="font-extrabold text-xs text-slate-900 leading-snug">${m.studentName}</p>
                          <p class="text-[11px] font-bold text-sky-700 mb-1.5">${m.roleTitle}</p>
                          
                          <div class="space-y-1 text-[10.5px] bg-slate-50 p-2 rounded-xl border border-slate-200">
                            <div class="flex justify-between items-center">
                              <span class="font-bold text-slate-500">Classe :</span>
                              <span class="font-extrabold text-slate-900 bg-slate-200/70 px-1.5 py-0.5 rounded">${m.className}</span>
                            </div>
                            <div class="flex justify-between items-center">
                              <span class="font-bold text-slate-500">Commission :</span>
                              <span class="font-bold text-sky-800 bg-sky-100/70 px-1.5 py-0.5 rounded">${m.commissionName || 'Bureau Exécutif'}</span>
                            </div>
                            <div class="flex justify-between items-center">
                              <span class="font-bold text-slate-500">Matricule :</span>
                              <span class="font-mono font-bold text-slate-800">${m.studentId || '-'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      ${m.missionDescription ? `<p class="text-[10px] text-slate-600 bg-slate-50/80 p-2 rounded-lg border border-slate-100 leading-tight italic">"${m.missionDescription}"</p>` : ''}
                      <p class="text-[9.5px] text-slate-500 font-mono text-right">Tél: ${m.phone || '-'} • Email: ${m.email || '-'}</p>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- SECTION 2: PROJECTS -->
              ${projects.length > 0 ? `
                <div class="mb-8">
                  <h2 class="text-sm font-black uppercase text-sky-900 border-b pb-1 mb-4">Projets et Initiatives du Bureau</h2>
                  <div class="grid grid-cols-2 gap-4">
                    ${projects.map(p => `
                      <div class="border border-slate-300 rounded-xl p-3 bg-white space-y-1">
                        <div class="flex justify-between items-center">
                          <span class="font-bold text-xs text-slate-900">${p.title}</span>
                          <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">${p.status}</span>
                        </div>
                        <p class="text-[11px] text-slate-600">${p.description}</p>
                        <p class="text-[10px] text-slate-500 font-semibold">Responsable: ${p.responsibleMember} • Date: ${p.date}</p>
                      </div>
                    `).join('')}
                  </div>
                </div>
              ` : ''}

              <!-- FOOTER STAMP -->
              <div class="mt-8 pt-4 border-t border-slate-300 flex justify-between items-center text-xs">
                <p class="italic text-slate-500">Document certifié conforme par la Direction du Collège Les Phalènes II.</p>
                <div class="text-right">
                  <p class="font-bold text-slate-900">Le Directeur des Études</p>
                  <p class="font-black text-slate-900 uppercase">${directorName.toUpperCase()}</p>
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
        win.document.close();
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

  return (
    <div className="flex-1 flex flex-col h-full bg-[#BFDBFE] overflow-hidden">
      {/* HEADER SECTION - Dashboard Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-7 pb-5 sm:pb-6 px-4 sm:px-8 shrink-0 relative z-10 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-white text-base xs:text-lg sm:text-[28px] font-bold tracking-tight leading-tight whitespace-nowrap">
              Bureau du Conseil des Délégués
            </h1>
            {!canEdit && (
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/90 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 border border-white/30 shrink-0">
                <Lock size={12} className="shrink-0 text-white" />
                Mode lecture seule
              </span>
            )}
          </div>
          <p className="text-white/80 text-xs font-semibold mt-1">
            Gouvernance et représentation générale des élèves
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 self-start sm:self-auto overflow-x-auto no-scrollbar max-w-full pb-0.5">
          {currentUser?.role !== 'student' && currentUser?.accessLevel !== 1 && currentUser?.role !== 'teacher' && currentUser?.accessLevel !== 3 && (
            <button
              onClick={handlePrint}
              title="Imprimer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-slate-900 font-bold text-xs sm:text-sm transition-all shadow-xs shrink-0 cursor-pointer active:scale-95"
            >
              <Printer size={15} className="text-slate-900 shrink-0" />
              <span className="inline">Imprimer</span>
            </button>
          )}

          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate('bureau_parents')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-slate-900 font-bold text-xs sm:text-sm transition-all shadow-xs shrink-0"
              >
                <HeartHandshake size={15} className="text-slate-900 shrink-0" />
                <span className="hidden sm:inline">Parents (APE)</span>
                <span className="sm:hidden">Parents</span>
              </button>
              <button
                onClick={() => onNavigate('chefs_de_classe')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-slate-900 font-bold text-xs sm:text-sm transition-all shadow-xs shrink-0"
              >
                <ArrowLeft size={15} className="text-slate-900 shrink-0" />
                <span>Chefs de Classe</span>
              </button>
            </>
          )}

          {canEdit && (
            <button
              onClick={() => {
                if (activeTab === 'members') handleOpenAdd();
                else if (activeTab === 'projects') handleOpenAddProject();
                else handleOpenAddMeeting();
              }}
              className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus size={16} className="shrink-0" />
              <span className="hidden sm:inline">
                {activeTab === 'members' ? 'Nouveau Membre' : activeTab === 'projects' ? 'Nouveau Projet' : 'Nouvelle Assemblée'}
              </span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area with White Background (arrière-plan blanc) & Curved Top */}
      <main className="flex-1 bg-white rounded-t-[35px] sm:rounded-t-[40px] px-4 sm:px-8 pt-6 sm:pt-8 pb-24 overflow-y-auto custom-scrollbar shadow-2xl relative">

        {/* Printable Header */}
        <div className="hidden print:block mb-8 text-center pb-4 border-b-2 border-slate-300">
          <h1 className="text-2xl font-black uppercase tracking-wide text-slate-900">Bureau du Conseil des Délégués</h1>
          <p className="text-sm font-bold text-slate-600 mt-1">
            Gouvernance et Représentation des Élèves — Mandat {members[0]?.mandatePeriod || '2025 - 2026'}
          </p>
        </div>

        {/* NAVIGATION TABS & SEARCH */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 sm:gap-3 border-b border-slate-100 pb-2 overflow-x-auto no-scrollbar max-w-full">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-extrabold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'members'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Crown size={16} className="shrink-0" />
              <span>Membres du Bureau ({members.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-extrabold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'projects'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Briefcase size={16} className="shrink-0" />
              <span>Projets & Initiatives ({projects.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('meetings')}
              className={`px-4 py-2 rounded-2xl text-xs md:text-sm font-extrabold flex items-center gap-2 transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'meetings'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Calendar size={16} className="shrink-0" />
              <span>Assemblées Générales</span>
            </button>
          </div>

          {activeTab === 'members' && (
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Rechercher par nom, poste, commission ou classe..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-800 text-xs md:text-sm font-semibold rounded-2xl border border-transparent focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          )}
        </div>

      {/* CONTENT AREA */}
      <div className="p-4 sm:p-6 md:p-8 flex-1">
        {/* TAB 1: BUREAU MEMBERS */}
        {activeTab === 'members' && (
          <div>
            {filteredMembers.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 sm:p-12 text-center border border-slate-200 max-w-lg mx-auto shadow-sm my-8">
                <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Crown size={32} />
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">Aucun membre trouvé</h3>
                <p className="text-xs md:text-sm text-slate-500 mb-6 font-medium">
                  Aucun membre du bureau ne correspond à votre recherche.
                </p>
                {canEdit && (
                  <button
                    onClick={handleOpenAdd}
                    className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs md:text-sm rounded-2xl transition-all shadow-md inline-flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus size={18} className="shrink-0" />
                    <span>Ajouter un membre</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-4 sm:p-6 flex flex-col justify-between relative group"
                  >
                    <div>
                      {/* CARD TOP HEADER */}
                      <div className="flex items-start justify-between gap-2 mb-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={member.photoUrl}
                            alt={member.studentName}
                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-sky-100 border border-white shadow-2xs shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 uppercase tracking-wide mb-1 whitespace-nowrap">
                              {member.mandatePeriod}
                            </span>
                            <h3 className="text-base font-extrabold text-slate-900 leading-snug truncate" title={member.studentName}>
                              {member.studentName}
                            </h3>
                            <p className="text-xs font-bold text-sky-700 flex items-center gap-1 mt-0.5 min-w-0" title={member.roleTitle}>
                              <Crown size={13} className="shrink-0 text-amber-500" />
                              <span className="truncate">{member.roleTitle}</span>
                            </p>
                          </div>
                        </div>

                        {canEdit && (
                          <div className="flex items-center gap-0.5 opacity-90 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                            <button
                              onClick={() => handleOpenEdit(member)}
                              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
                              title="Modifier"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                              title="Supprimer"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* CLASSE & COMMISSION */}
                      <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600 font-medium">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-bold">Classe :</span>
                          <span className="font-extrabold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                            {member.className}
                          </span>
                        </div>

                        {member.commissionName && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-bold">Commission :</span>
                            <span className="font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg">
                              {member.commissionName}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-bold">Matricule :</span>
                          <span className="font-semibold text-slate-700">{member.studentId}</span>
                        </div>
                      </div>

                      {/* MISSION DESCRIPTION */}
                      {member.missionDescription && (
                        <p className="text-xs text-slate-600 font-medium mt-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                          "{member.missionDescription}"
                        </p>
                      )}
                    </div>

                    {/* CONTACT BUTTONS */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      {member.phone ? (
                        <a
                          href={`tel:${member.phone.replace(/\s+/g, '')}`}
                          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shrink-0"
                        >
                          <Phone size={14} className="text-sky-600 shrink-0" />
                          <span>Appeler</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Pas de numéro</span>
                      )}

                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="flex-1 py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all whitespace-nowrap shrink-0"
                        >
                          <Mail size={14} className="text-sky-600 shrink-0" />
                          <span>Email</span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PROJECTS & INITIATIVES */}
        {activeTab === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">Projets & Actions du Bureau ({projects.length})</h2>
              {canEdit && (
                <button
                  onClick={handleOpenAddProject}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus size={16} />
                  <span>Ajouter un Projet</span>
                </button>
              )}
            </div>

            {projects.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 max-w-md mx-auto my-6">
                <Briefcase size={32} className="mx-auto text-sky-500 mb-2" />
                <p className="text-sm font-bold text-slate-700">Aucun projet enregistré.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj) => (
                  <div key={proj.id} className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between group hover:shadow-md transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          proj.category === 'Écologie' ? 'bg-emerald-100 text-emerald-800' :
                          proj.category === 'Événement' ? 'bg-purple-100 text-purple-800' :
                          'bg-sky-100 text-sky-800'
                        }`}>
                          {proj.category}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            proj.status === 'En cours' ? 'bg-amber-100 text-amber-800' :
                            proj.status === 'Terminé' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {proj.status}
                          </span>
                          
                          {canEdit && (
                            <div className="flex items-center gap-1 ml-1">
                              <button
                                onClick={() => handleOpenEditProject(proj)}
                                className="p-1 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                                title="Modifier"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(proj.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                title="Supprimer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 mb-2">{proj.title}</h3>
                      <p className="text-xs text-slate-600 font-medium mb-4 leading-relaxed">{proj.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-slate-500 space-y-1">
                      <p className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-sky-600 shrink-0" />
                        <span>Échéance / Date : {proj.date}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Crown size={14} className="text-amber-500 shrink-0" />
                        <span>Responsable : {proj.responsibleMember}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ASSEMBLÉES GÉNÉRALES */}
        {activeTab === 'meetings' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">Assemblées Générales & Réunions ({meetings.length})</h2>
              {canEdit && (
                <button
                  onClick={handleOpenAddMeeting}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  <Plus size={16} />
                  <span>Nouvelle Assemblée</span>
                </button>
              )}
            </div>

            {meetings.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 max-w-md mx-auto my-6">
                <Calendar size={32} className="mx-auto text-sky-500 mb-2" />
                <p className="text-sm font-bold text-slate-700">Aucune assemblée enregistrée.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {meetings.map((meet) => (
                  <div key={meet.id} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs relative group">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center font-bold shrink-0">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">{meet.title}</h2>
                          {meet.subtitle && <p className="text-xs text-slate-500 font-semibold">{meet.subtitle}</p>}
                        </div>
                      </div>

                      {canEdit && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEditMeeting(meet)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
                            title="Modifier"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteMeeting(meet.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 space-y-2 text-xs md:text-sm font-semibold text-slate-700">
                      <p>📅 <strong>Date :</strong> {meet.date}</p>
                      <p>📍 <strong>Lieu :</strong> {meet.location}</p>
                      <p>👥 <strong>Participants :</strong> {meet.participants}</p>
                    </div>

                    {meet.agendaText && (
                      <div className="space-y-3 pt-4">
                        <h3 className="text-sm font-extrabold text-slate-900">Ordre du jour prévu :</h3>
                        <ul className="space-y-2 text-xs md:text-sm text-slate-600 font-medium list-disc pl-5">
                          {meet.agendaText.split('\n').filter(Boolean).map((line, idx) => (
                            <li key={idx}>{line.replace(/^[•\-\*]\s*/, '')}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD / EDIT MEMBER MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsModalOpen(false);
                setIsClassDropdownOpen(false);
              }
            }}
          >
            <motion.div 
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white rounded-t-[32px] sm:rounded-3xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border-t sm:border border-slate-100 p-6 md:p-8 custom-scrollbar"
            >
              {/* Mobile Bottom Sheet Handle */}
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden"></div>

              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                    <Crown size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {editingMember ? 'Modifier le Membre' : 'Nouveau Membre du Bureau'}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500">Conseil des Délégués de Classe</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsClassDropdownOpen(false);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveMember} className="space-y-4 text-xs md:text-sm">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Poste / Intitulé du rôle *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Président du Conseil (Délégué Général)"
                    value={formData.roleTitle || ''}
                    onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none font-semibold text-slate-800 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Nom complet de l'élève *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Gbocho Marc-Aurèle"
                    value={formData.studentName || ''}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* CLASSE STYLED SELECT */}
                  <div className="relative">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Classe *</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Ex: Terminale D2"
                        value={formData.className || ''}
                        onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                        onFocus={() => setIsClassDropdownOpen(true)}
                        className="w-full pl-3.5 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none font-extrabold text-slate-800 transition-all text-xs sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <ChevronDown size={16} className={`transition-transform duration-200 ${isClassDropdownOpen ? 'rotate-180 text-sky-600' : ''}`} />
                      </button>
                    </div>

                    {isClassDropdownOpen && classListOptions.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 space-y-1 max-h-52 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar">
                        <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          Sélectionner une classe
                        </div>
                        {classListOptions.map((cls) => {
                          const isSel = formData.className === cls;
                          return (
                            <button
                              key={cls}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, className: cls });
                                setIsClassDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                                isSel ? 'bg-sky-50 text-sky-700 font-extrabold border border-sky-100' : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Building2 size={13} className={isSel ? 'text-sky-600' : 'text-slate-400'} />
                                <span>{cls}</span>
                              </div>
                              {isSel && <Check size={14} className="text-sky-600" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Matricule</label>
                    <input
                      type="text"
                      placeholder="Ex: 2024-2144"
                      value={formData.studentId || ''}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Commission</label>
                    <input
                      type="text"
                      placeholder="Ex: Bureau Exécutif, Médiation..."
                      value={formData.commissionName || ''}
                      onChange={(e) => setFormData({ ...formData, commissionName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Mandat / Année</label>
                    <input
                      type="text"
                      placeholder="Ex: 2025 - 2026"
                      value={formData.mandatePeriod || '2025 - 2026'}
                      onChange={(e) => setFormData({ ...formData, mandatePeriod: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Téléphone</label>
                    <input
                      type="text"
                      placeholder="+225 07 00 00 00 00"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="exemple@eleve.ci"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Description des missions & responsabilités</label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Représentation générale des élèves auprès de la Direction..."
                    value={formData.missionDescription || ''}
                    onChange={(e) => setFormData({ ...formData, missionDescription: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 resize-none transition-all"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setIsClassDropdownOpen(false);
                    }}
                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-extrabold shadow-md shadow-sky-500/20 whitespace-nowrap transition-all cursor-pointer"
                  >
                    {editingMember ? 'Enregistrer les modifications' : 'Ajouter le membre'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT PROJECT MODAL */}
      <AnimatePresence>
        {isProjectModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsProjectModalOpen(false);
            }}
          >
            <motion.div 
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white rounded-t-[32px] sm:rounded-3xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border-t sm:border border-slate-100 p-6 md:p-8 custom-scrollbar"
            >
              {/* Mobile Bottom Sheet Handle */}
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden"></div>

              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {editingProject ? 'Modifier le Projet' : 'Nouveau Projet / Action'}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500 whitespace-nowrap">Bureau du Conseil des Délégués</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsProjectModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="space-y-4 text-xs md:text-sm">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Titre du Projet *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Campagne Zéro Déchet..."
                    value={projectFormData.title || ''}
                    onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Catégorie</label>
                    <select
                      value={projectFormData.category || 'Événement'}
                      onChange={(e) => setProjectFormData({ ...projectFormData, category: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                    >
                      <option value="Événement">Événement</option>
                      <option value="Vie Scolaire">Vie Scolaire</option>
                      <option value="Écologie">Écologie</option>
                      <option value="Solidarité">Solidarité</option>
                      <option value="Discipline">Discipline</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Statut</label>
                    <select
                      value={projectFormData.status || 'Planifié'}
                      onChange={(e) => setProjectFormData({ ...projectFormData, status: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                    >
                      <option value="Planifié">Planifié</option>
                      <option value="En cours">En cours</option>
                      <option value="Terminé">Terminé</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Date / Échéance</label>
                    <input
                      type="text"
                      placeholder="Ex: 15 Novembre 2026"
                      value={projectFormData.date || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Responsable</label>
                    <input
                      type="text"
                      placeholder="Ex: Gbocho Marc-Aurèle"
                      value={projectFormData.responsibleMember || ''}
                      onChange={(e) => setProjectFormData({ ...projectFormData, responsibleMember: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Objectifs et déroulement du projet..."
                    value={projectFormData.description || ''}
                    onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 resize-none transition-all"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsProjectModalOpen(false)}
                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-extrabold shadow-md shadow-sky-500/20 whitespace-nowrap transition-all cursor-pointer"
                  >
                    {editingProject ? 'Enregistrer les modifications' : 'Ajouter le projet'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT MEETING MODAL */}
      <AnimatePresence>
        {isMeetingModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsMeetingModalOpen(false);
            }}
          >
            <motion.div 
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white rounded-t-[32px] sm:rounded-3xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border-t sm:border border-slate-100 p-6 md:p-8 custom-scrollbar"
            >
              {/* Mobile Bottom Sheet Handle */}
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden"></div>

              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {editingMeeting ? 'Modifier l\'Assemblée' : 'Nouvelle Assemblée Générale'}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500 whitespace-nowrap">Bureau du Conseil des Délégués</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveMeeting} className="space-y-4 text-xs md:text-sm">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Titre de l'Assemblée *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Assemblée Générale Ordinaire des Délégués"
                    value={meetingFormData.title || ''}
                    onChange={(e) => setMeetingFormData({ ...meetingFormData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Sous-titre / Type</label>
                  <input
                    type="text"
                    placeholder="Ex: Réunion trimestrielle ordinaire"
                    value={meetingFormData.subtitle || ''}
                    onChange={(e) => setMeetingFormData({ ...meetingFormData, subtitle: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Date & Heure *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mercredi 26 Nov à 15h00"
                      value={meetingFormData.date || ''}
                      onChange={(e) => setMeetingFormData({ ...meetingFormData, date: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Lieu</label>
                    <input
                      type="text"
                      placeholder="Ex: Salle de conférence"
                      value={meetingFormData.location || ''}
                      onChange={(e) => setMeetingFormData({ ...meetingFormData, location: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Participants</label>
                  <input
                    type="text"
                    placeholder="Ex: Tous les chefs de classe titulaires..."
                    value={meetingFormData.participants || ''}
                    onChange={(e) => setMeetingFormData({ ...meetingFormData, participants: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Ordre du jour (Un point par ligne)</label>
                  <textarea
                    rows={4}
                    placeholder="Bilan à mi-parcours&#10;Validation du calendrier&#10;Propreté de la cour"
                    value={meetingFormData.agendaText || ''}
                    onChange={(e) => setMeetingFormData({ ...meetingFormData, agendaText: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 resize-none transition-all"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsMeetingModalOpen(false)}
                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold whitespace-nowrap transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-extrabold shadow-md shadow-sky-500/20 whitespace-nowrap transition-all cursor-pointer"
                  >
                    {editingMeeting ? 'Enregistrer les modifications' : 'Ajouter l\'assemblée'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </main>
    </div>
  );
};
