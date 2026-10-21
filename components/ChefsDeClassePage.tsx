import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, UserCheck, ShieldCheck, Search, Plus, Phone, Mail, 
  GraduationCap, BookOpen, Edit3, Trash2, X, Check, ArrowLeft, 
  Users, Sparkles, Building2, User, Award, Printer, FileText, Lock, ChevronDown
} from 'lucide-react';
import { User as AppUser, Student } from '../types';

export interface ClassDelegate {
  id: string;
  className: string;
  level: string; // '6ème' | '5ème' | '4ème' | '3ème' | '2nde' | '1ère' | 'Terminale'
  mainDelegate: {
    name: string;
    photoUrl: string;
    studentId: string;
    phone?: string;
    gender?: 'M' | 'F';
  };
  subDelegate?: {
    name: string;
    photoUrl: string;
    studentId: string;
    phone?: string;
    gender?: 'M' | 'F';
  };
  disciplineDelegate?: {
    name: string;
    photoUrl: string;
    studentId: string;
    gender?: 'M' | 'F';
  };
  principalTeacher?: string;
  studentCount?: number;
  classroomNumber?: string;
  notes?: string;
}

const DEFAULT_CHEFS_DE_CLASSE: ClassDelegate[] = [
  {
    id: 'chef-terminale-d',
    className: 'Terminale D',
    level: 'Terminale D',
    classroomNumber: 'Salle 204',
    studentCount: 38,
    principalTeacher: 'M. Koffi Kouamé (Prof. Mathématiques)',
    notes: 'Classe de Terminale D (Série Scientifique). Représentants élus pour l\'année scolaire 2025-2026.',
    mainDelegate: {
      name: 'Kouamé Ange Emmanuel',
      studentId: 'STU-TD-01',
      phone: '+225 07 48 92 11 05',
      gender: 'M',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    subDelegate: {
      name: 'Bamba Fatoumata',
      studentId: 'STU-TD-02',
      phone: '+225 05 77 14 32 89',
      gender: 'F',
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
    },
    disciplineDelegate: {
      name: 'Traoré Ibrahim',
      studentId: 'STU-TD-03',
      gender: 'M',
      photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'
    }
  }
];

interface ChefsDeClassePageProps {
  currentUser?: AppUser;
  allStudents?: Student[];
  onNavigate?: (page: string) => void;
}

export const ChefsDeClassePage: React.FC<ChefsDeClassePageProps> = ({
  currentUser,
  allStudents = [],
  onNavigate
}) => {
  const isPrimary = currentUser?.section === 'Primaire';
  const LEVELS = isPrimary 
      ? ['Tous', 'CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2']
      : ['Tous', 'Terminale D'];

  const isTleD = (name?: string) => {
    if (!name) return false;
    const n = name.toLowerCase().trim();
    return n.includes('terminale d') || n.includes('tle d') || n === 'terminale d' || n.startsWith('terminale d');
  };

  const [delegates, setDelegates] = useState<ClassDelegate[]>(() => {
    const saved = localStorage.getItem('school_db_chefs_de_classe');
    if (saved) {
      try {
        const parsed: ClassDelegate[] = JSON.parse(saved);
        const onlyTleD = parsed.filter(d => isTleD(d.className));
        if (onlyTleD.length > 0) return onlyTleD;
      } catch (e) {
        return DEFAULT_CHEFS_DE_CLASSE;
      }
    }
    return DEFAULT_CHEFS_DE_CLASSE;
  });

  const [selectedLevel, setSelectedLevel] = useState<string>('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassDelegate | null>(null);
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);

  const availableClasses = Array.from(
    new Set(allStudents.map(s => s.className || s.class).filter(Boolean))
  ).filter(c => isTleD(c)).sort();
  const defaultPresets = ['Terminale D', 'Terminale D1', 'Terminale D2'];
  const classListOptions = availableClasses.length > 0 ? availableClasses : defaultPresets;

  // Form State
  const [formData, setFormData] = useState<Partial<ClassDelegate>>({
    className: 'Terminale D',
    level: 'Terminale D',
    mainDelegate: { name: '', photoUrl: '', studentId: '', phone: '', gender: 'M' },
    subDelegate: { name: '', photoUrl: '', studentId: '', phone: '', gender: 'F' },
    disciplineDelegate: { name: '', photoUrl: '', studentId: '', gender: 'M' },
    principalTeacher: 'M. Koffi Kouamé',
    studentCount: 38,
    classroomNumber: 'Salle 204',
    notes: ''
  });

  useEffect(() => {
    // Enforce that only Terminale D classes remain in delegates and localStorage
    setDelegates(prev => {
      const filtered = prev.filter(d => isTleD(d.className));
      const result = filtered.length > 0 ? filtered : DEFAULT_CHEFS_DE_CLASSE;
      localStorage.setItem('school_db_chefs_de_classe', JSON.stringify(result));
      return result;
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('school_db_chefs_de_classe', JSON.stringify(delegates));
  }, [delegates]);

  useEffect(() => {
    if (isModalOpen) {
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
  }, [isModalOpen]);

  const canEdit = true;

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      className: 'Terminale D',
      level: 'Terminale D',
      mainDelegate: {
        name: '',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        studentId: `STU-TD-${Math.floor(10 + Math.random() * 90)}`,
        phone: '+225 07 00 00 00 00',
        gender: 'M'
      },
      subDelegate: {
        name: '',
        photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        phone: '+225 05 00 00 00 00',
        gender: 'F'
      },
      disciplineDelegate: {
        name: '',
        photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        studentId: '',
        gender: 'M'
      },
      principalTeacher: '',
      studentCount: 45,
      classroomNumber: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ClassDelegate) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer les délégués de cette classe ?')) {
      setDelegates(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.className || !formData.mainDelegate?.name) {
      alert('Veuillez spécifier le nom de la classe et le nom du chef de classe principal.');
      return;
    }

    if (editingItem) {
      setDelegates(prev => prev.map(d => d.id === editingItem.id ? ({ ...d, ...formData } as ClassDelegate) : d));
    } else {
      const newItem: ClassDelegate = {
        id: `chef-${Date.now()}`,
        className: formData.className,
        level: formData.level || '6ème',
        mainDelegate: {
          name: formData.mainDelegate.name,
          photoUrl: formData.mainDelegate.photoUrl || `https://i.pravatar.cc/150?u=${Date.now()}`,
          studentId: formData.mainDelegate.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
          phone: formData.mainDelegate.phone || '',
          gender: formData.mainDelegate.gender || 'M'
        },
        subDelegate: formData.subDelegate?.name ? {
          name: formData.subDelegate.name,
          photoUrl: formData.subDelegate.photoUrl || `https://i.pravatar.cc/150?u=${Date.now() + 1}`,
          studentId: formData.subDelegate.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
          phone: formData.subDelegate.phone || '',
          gender: formData.subDelegate.gender || 'F'
        } : undefined,
        disciplineDelegate: formData.disciplineDelegate?.name ? {
          name: formData.disciplineDelegate.name,
          photoUrl: formData.disciplineDelegate.photoUrl || `https://i.pravatar.cc/150?u=${Date.now() + 2}`,
          studentId: formData.disciplineDelegate.studentId || '',
          gender: formData.disciplineDelegate.gender || 'M'
        } : undefined,
        principalTeacher: formData.principalTeacher || '',
        studentCount: formData.studentCount || 45,
        classroomNumber: formData.classroomNumber || '',
        notes: formData.notes || ''
      };
      setDelegates(prev => [newItem, ...prev]);
    }

    setIsModalOpen(false);
  };

  // Filtered list - Strictly Terminale D
  const filtered = delegates.filter(item => {
    if (!isTleD(item.className)) return false;

    const matchesLevel = selectedLevel === 'Tous' || item.level === selectedLevel || isTleD(selectedLevel);
    const matchesSearch = !searchTerm || (
      item.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mainDelegate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subDelegate && item.subDelegate.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.principalTeacher && item.principalTeacher.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return matchesLevel && matchesSearch;
  });

  const handlePrint = () => {
    const title = "LISTE DES CHEFS DE CLASSE ET DÉLÉGUÉS";
    const subtitle = `Année Scolaire 2025 - 2026 — ${selectedLevel === 'Tous' ? 'Tous les Niveaux' : 'Niveau ' + selectedLevel}`;
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

              <!-- CARDS GRID MATCHING ON-SCREEN DISPLAY -->
              <div class="grid grid-cols-2 gap-4">
                ${filtered.map(item => `
                  <div class="border border-slate-300 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                    <div class="flex justify-between items-center border-b pb-2">
                      <div class="flex items-center gap-2">
                        <span class="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 font-black flex items-center justify-center text-sm">${item.className.substring(0,2)}</span>
                        <div>
                          <h2 class="font-black text-base text-slate-900">${item.className}</h2>
                          <p class="text-[11px] text-slate-500 font-semibold">${item.classroomNumber || 'Salle non définie'} • ${item.studentCount || 45} Élèves</p>
                        </div>
                      </div>
                    </div>

                    ${item.principalTeacher ? `
                      <div class="text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        🎓 Prof. Principal : <strong>${item.principalTeacher}</strong>
                      </div>
                    ` : ''}

                    <!-- MAIN DELEGATE -->
                    <div class="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <p class="text-[10px] font-black uppercase tracking-wider text-amber-800 mb-1.5">👑 Chef de Classe Principal</p>
                      <div class="flex items-center gap-3">
                        <img src="${item.mainDelegate.photoUrl}" class="w-11 h-11 rounded-xl object-cover border border-amber-300 shadow-2xs" />
                        <div>
                          <p class="font-extrabold text-xs text-slate-900">${item.mainDelegate.name}</p>
                          <p class="text-[10px] text-slate-600 font-medium">Matricule: ${item.mainDelegate.studentId} ${item.mainDelegate.phone ? '• Tél: ' + item.mainDelegate.phone : ''}</p>
                        </div>
                      </div>
                    </div>

                    <!-- SUB DELEGATE -->
                    ${item.subDelegate && item.subDelegate.name ? `
                      <div class="p-3 bg-sky-50 rounded-xl border border-sky-200">
                        <p class="text-[10px] font-black uppercase tracking-wider text-sky-800 mb-1.5">👤 Chef de Classe Adjoint</p>
                        <div class="flex items-center gap-3">
                          <img src="${item.subDelegate.photoUrl}" class="w-10 h-10 rounded-xl object-cover border border-sky-300 shadow-2xs" />
                          <div>
                            <p class="font-extrabold text-xs text-slate-900">${item.subDelegate.name}</p>
                            <p class="text-[10px] text-slate-600 font-medium">Matricule: ${item.subDelegate.studentId || '-'} ${item.subDelegate.phone ? '• Tél: ' + item.subDelegate.phone : ''}</p>
                          </div>
                        </div>
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 sm:pt-7 pb-6 px-6 sm:px-8 shrink-0 relative z-10 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-white text-[22px] sm:text-[28px] font-bold tracking-tight leading-tight">
              Chefs de Classe
            </h1>
          </div>
          <p className="text-white/80 text-xs font-semibold mt-1">
            Délégués principaux, adjoints et responsables de discipline par classe
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
                onClick={() => onNavigate('bureau_delegues')}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-slate-900 font-bold text-xs sm:text-sm transition-all shadow-xs shrink-0"
              >
                <Award size={15} className="text-slate-900 shrink-0" />
                <span className="hidden sm:inline">Bureau du Conseil</span>
                <span className="sm:hidden">Bureau</span>
              </button>
              <button
                onClick={() => onNavigate('classes')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-slate-900 font-bold text-xs sm:text-sm transition-all shadow-xs shrink-0"
              >
                <ArrowLeft size={15} className="text-slate-900 shrink-0" />
                <span>Classes</span>
              </button>
            </>
          )}

          {canEdit && (
            <button
              onClick={handleOpenAdd}
              className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus size={16} className="shrink-0" />
              <span className="hidden sm:inline">Nouveau Chef de Classe</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area with White Background (arrière-plan blanc) & Curved Top */}
      <main className="flex-1 bg-white rounded-t-[35px] sm:rounded-t-[40px] px-4 sm:px-8 pt-6 sm:pt-8 pb-24 overflow-y-auto custom-scrollbar shadow-2xl relative">

        {/* Printable Header */}
        <div className="hidden print:block mb-8 text-center pb-4 border-b-2 border-slate-300">
          <h1 className="text-2xl font-black uppercase tracking-wide text-slate-900">Liste des Chefs de Classe & Délégués</h1>
          <p className="text-sm font-bold text-slate-600 mt-1">
            Année Scolaire 2025 - 2026 — Délégués Titulaires & Adjoints
          </p>
        </div>

        {/* SEARCH & FILTER PILLS */}
        <div className="space-y-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par classe, nom de délégué ou prof..."
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

          {/* LEVEL PILLS */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar max-w-full">
            {LEVELS.map((lvl, idx) => {
              const isSelected = selectedLevel === lvl;
              const count = lvl === 'Tous' 
                ? delegates.length 
                : delegates.filter(d => d.level === lvl || d.className.startsWith(lvl)).length;
              return (
                <button
                  key={`lvl-${lvl}-${idx}`}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-4 py-2.5 rounded-full font-extrabold text-xs md:text-sm flex items-center gap-2 border transition-all whitespace-nowrap shrink-0 shadow-2xs ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 text-sky-600 ring-2 ring-sky-100/80'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <BookOpen size={16} className={isSelected ? 'text-sky-600' : 'text-slate-400'} />
                  <span>{lvl}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-sky-200 text-sky-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      {/* CARDS LIST */}
      <div className="p-4 sm:p-6 md:p-8 flex-1">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 sm:p-12 text-center border border-slate-200 max-w-lg mx-auto shadow-sm my-8">
            <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Crown size={32} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">Aucun délégué trouvé</h3>
            <p className="text-xs md:text-sm text-slate-500 mb-6 font-medium">
              Aucun chef de classe enregistré pour le niveau sélectionné.
            </p>
            {canEdit && (
              <button
                onClick={handleOpenAdd}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs md:text-sm rounded-2xl transition-all shadow-md inline-flex items-center gap-2"
              >
                <Plus size={18} />
                <span>Ajouter un chef de classe</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((item, idx) => (
              <div
                key={`chef-${item.id || item.className}-${idx}`}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-4 sm:p-6 flex flex-col justify-between relative group"
              >
                <div>
                  {/* TOP BANNER */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center font-black text-base shadow-2xs">
                        {item.className.substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900 leading-tight">
                          {item.className}
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                          {item.classroomNumber && <span>{item.classroomNumber} •</span>}
                          <span>{item.studentCount || 45} Élèves</span>
                        </p>
                      </div>
                    </div>

                    {canEdit && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
                          title="Modifier"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PROF PRINCIPAL */}
                  {item.principalTeacher && (
                    <div className="mb-4 px-3.5 py-2 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <GraduationCap size={15} className="text-sky-600 shrink-0" />
                      <span>Prof. Principal : <strong>{item.principalTeacher}</strong></span>
                    </div>
                  )}

                  {/* CHEF DE CLASSE PRINCIPAL */}
                  <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200/60 mb-3">
                    <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-amber-800 mb-2">
                      <Crown size={14} className="text-amber-600 shrink-0" />
                      <span>Chef de Classe Principal</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <img
                        src={item.mainDelegate.photoUrl}
                        alt={item.mainDelegate.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-200 border border-white shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-extrabold text-slate-900 truncate">
                          {item.mainDelegate.name}
                        </p>
                        <p className="text-xs text-slate-500 font-semibold">
                          Matricule : {item.mainDelegate.studentId}
                        </p>
                      </div>
                      {item.mainDelegate.phone && (
                        <a
                          href={`tel:${item.mainDelegate.phone.replace(/\s+/g, '')}`}
                          className="p-2 bg-white text-amber-700 hover:bg-amber-100 rounded-xl transition-all border border-amber-200/80 shadow-2xs shrink-0"
                          title="Appeler le délégué"
                        >
                          <Phone size={15} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* CHEF DE CLASSE ADJOINT */}
                  {item.subDelegate && item.subDelegate.name && (
                    <div className="p-3 bg-sky-50/50 rounded-2xl border border-sky-100 mb-3">
                      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-sky-800 mb-2">
                        <UserCheck size={14} className="text-sky-600 shrink-0" />
                        <span>Chef de Classe Adjoint</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <img
                          src={item.subDelegate.photoUrl}
                          alt={item.subDelegate.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-sky-200 border border-white shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-extrabold text-slate-900 truncate">
                            {item.subDelegate.name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-semibold">
                            Matricule : {item.subDelegate.studentId || 'Non renseigné'}
                          </p>
                        </div>
                        {item.subDelegate.phone && (
                          <a
                            href={`tel:${item.subDelegate.phone.replace(/\s+/g, '')}`}
                            className="p-2 bg-white text-sky-700 hover:bg-sky-100 rounded-xl transition-all border border-sky-200/80 shadow-2xs shrink-0"
                            title="Appeler l'adjoint"
                          >
                            <Phone size={14} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DELEGUE DISCIPLINE */}
                  {item.disciplineDelegate && item.disciplineDelegate.name && (
                    <div className="px-3.5 py-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={15} className="text-emerald-600 shrink-0" />
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400 block">Délégué Discipline</span>
                          <span className="font-extrabold text-slate-800 ml-0 mt-0 pt-[5px] pl-[6px] block">{item.disciplineDelegate.name}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {item.notes && (
                    <p className="text-xs text-slate-500 italic mt-2 line-clamp-2">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                {/* BOTTOM CONTACT ALL */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold">Contact Officiel</span>
                  <div className="flex items-center gap-2">
                    {item.mainDelegate.phone && (
                      <a
                        href={`tel:${item.mainDelegate.phone.replace(/\s+/g, '')}`}
                        className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl font-extrabold flex items-center gap-1.5 transition-all"
                      >
                        <Phone size={13} />
                        <span>Appeler Délégué</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL ADD / EDIT */}
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
                setIsLevelDropdownOpen(false);
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
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Crown size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {editingItem ? 'Modifier les Chefs de Classe' : 'Nouveau Chef de Classe'}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500">Désignation des représentants d'élèves</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setIsLevelDropdownOpen(false);
                  setIsClassDropdownOpen(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs md:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* NOM DE LA CLASSE STYLED SELECT / INPUT */}
                <div className="relative">
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Nom de la Classe *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Terminale D1"
                      value={formData.className || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        const matchedLevel = LEVELS.find(l => l !== 'Tous' && val.toLowerCase().includes(l.toLowerCase()));
                        setFormData({ 
                          ...formData, 
                          className: val,
                          level: matchedLevel || 'Terminale D'
                        });
                      }}
                      onFocus={() => {
                        setIsClassDropdownOpen(true);
                        setIsLevelDropdownOpen(false);
                      }}
                      className="w-full pl-3.5 pr-9 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none font-extrabold text-slate-800 transition-all text-xs sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsClassDropdownOpen(!isClassDropdownOpen);
                        setIsLevelDropdownOpen(false);
                      }}
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
                      {classListOptions.map((cls, idx) => {
                        const isSel = formData.className === cls;
                        const matchedLevel = LEVELS.find(l => l !== 'Tous' && cls.toLowerCase().includes(l.toLowerCase()));
                        return (
                          <button
                            key={`cls-opt-${cls}-${idx}`}
                            type="button"
                            onClick={() => {
                              setFormData({ 
                                ...formData, 
                                className: cls,
                                level: matchedLevel || 'Terminale D'
                              });
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

                {/* NIVEAU STYLED DROPDOWN */}
                <div className="relative">
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Niveau *</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsLevelDropdownOpen(!isLevelDropdownOpen);
                      setIsClassDropdownOpen(false);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-white focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none font-extrabold text-slate-800 flex items-center justify-between transition-all cursor-pointer text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <BookOpen size={15} className="text-sky-600 shrink-0" />
                      <span className="truncate">{formData.level || 'Terminale D'}</span>
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isLevelDropdownOpen ? 'rotate-180 text-sky-600' : ''}`} />
                  </button>

                  {isLevelDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-1.5 space-y-1 max-h-52 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar">
                      {LEVELS.filter(l => l !== 'Tous').map((l, idx) => {
                        const isSel = formData.level === l;
                        return (
                          <button
                            key={`lvl-opt-${l}-${idx}`}
                            type="button"
                            onClick={() => {
                              setFormData({ ...formData, level: l });
                              setIsLevelDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                              isSel 
                                ? 'bg-sky-50 text-sky-700 font-extrabold border border-sky-100' 
                                : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${isSel ? 'bg-sky-500' : 'bg-slate-300'}`}></span>
                              <span>{l}</span>
                            </div>
                            {isSel && <Check size={14} className="text-sky-600" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* CHEF PRINCIPAL FIELDSET */}
              <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
                <p className="font-extrabold text-xs text-amber-900 flex items-center gap-1.5">
                  <Crown size={14} className="text-amber-600" />
                  <span>Chef de Classe Principal *</span>
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nom de l'élève *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Kouassi Jean-Emmanuel"
                    value={formData.mainDelegate?.name || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      mainDelegate: { ...formData.mainDelegate!, name: e.target.value }
                    })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-200 focus:border-amber-500 outline-none font-semibold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Matricule</label>
                    <input
                      type="text"
                      placeholder="Ex: STU-6001"
                      value={formData.mainDelegate?.studentId || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        mainDelegate: { ...formData.mainDelegate!, studentId: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-200 focus:border-amber-500 outline-none font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Téléphone Délégué/Parent</label>
                    <input
                      type="text"
                      placeholder="+225 07 00 00 00 00"
                      value={formData.mainDelegate?.phone || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        mainDelegate: { ...formData.mainDelegate!, phone: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-200 focus:border-amber-500 outline-none font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* CHEF ADJOINT FIELDSET */}
              <div className="p-3.5 bg-sky-50/50 rounded-2xl border border-sky-200/80 space-y-3">
                <p className="font-extrabold text-xs text-sky-900 flex items-center gap-1.5">
                  <UserCheck size={14} className="text-sky-600" />
                  <span>Chef de Classe Adjoint (Optionnel)</span>
                </p>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nom de l'élève</label>
                  <input
                    type="text"
                    placeholder="Ex: Bamba Marie-Claire"
                    value={formData.subDelegate?.name || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      subDelegate: { ...formData.subDelegate!, name: e.target.value }
                    })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-sky-200 focus:border-sky-500 outline-none font-semibold text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Matricule</label>
                    <input
                      type="text"
                      placeholder="Ex: STU-6002"
                      value={formData.subDelegate?.studentId || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        subDelegate: { ...formData.subDelegate!, studentId: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-sky-200 focus:border-sky-500 outline-none font-semibold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Téléphone</label>
                    <input
                      type="text"
                      placeholder="+225 05 00 00 00 00"
                      value={formData.subDelegate?.phone || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        subDelegate: { ...formData.subDelegate!, phone: e.target.value }
                      })}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-sky-200 focus:border-sky-500 outline-none font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* PROF PRINCIPAL & DETAILS */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Professeur Principal</label>
                  <input
                    type="text"
                    placeholder="Ex: M. Diallo"
                    value={formData.principalTeacher || ''}
                    onChange={(e) => setFormData({ ...formData, principalTeacher: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 outline-none font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Effectif classe</label>
                  <input
                    type="number"
                    placeholder="Ex: 50"
                    value={formData.studentCount || 45}
                    onChange={(e) => setFormData({ ...formData, studentCount: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Délégué à la Discipline / Propreté</label>
                <input
                  type="text"
                  placeholder="Ex: Yao Prince Eric"
                  value={formData.disciplineDelegate?.name || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    disciplineDelegate: { ...formData.disciplineDelegate!, name: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Remarques / Rôle spécial</label>
                <input
                  type="text"
                  placeholder="Ex: Délégué général du bureau des étudiants..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-sky-500 outline-none font-semibold text-slate-800"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-extrabold shadow-md shadow-sky-500/20"
                >
                  {editingItem ? 'Enregistrer les modifications' : 'Ajouter les chefs de classe'}
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
