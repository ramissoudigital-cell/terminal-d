import React, { useState, useEffect, useRef } from 'react';
import { X, GraduationCap, Award, Calendar, School, CheckCircle2, Plus, Trash2, Edit3, Save, Printer, FileText, Sparkles, BookOpen, ShieldCheck, ArrowLeft, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Student } from '../types';
import { isTechnicalClass, calculateAnnualAverage } from '../src/utils/academicUtils';

export interface CursusEntry {
  id: string;
  year: string;
  classLevel: string;
  schoolName: string;
  annualAverage: string;
  result: 'Admis' | 'BEPC Obtenu' | 'CEPE Obtenu' | 'BAC Obtenu' | 'Redoublement' | 'En cours';
  mention?: string;
  observations?: string;
}

interface StudentCursusModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  readOnly?: boolean;
  onUpdateStudent?: (student: Student) => void;
  currentUser?: any;
}

const getDefaultCursusForStudent = (student: Student): CursusEntry[] => {
  const currentClassName = student?.class || 'Terminale D';
  const trim1 = student?.trimesters?.['1er trim']?.average ?? null;
  const trim2 = student?.trimesters?.['2ème trim']?.average ?? null;
  const trim3 = student?.trimesters?.['3ème trim']?.average ?? null;
  const isTech = isTechnicalClass(currentClassName);
  const computed = calculateAnnualAverage(trim1, trim2, trim3, isTech);
  const annualAvgStr = computed !== null ? `${computed.toFixed(2)} / 20` : '15.10 / 20';
  
  // Default fallback progression
  return [
    {
      id: 'cur-1',
      year: '2025 - 2026',
      classLevel: currentClassName,
      schoolName: 'Collège Faoummaba',
      annualAverage: annualAvgStr,
      result: 'En cours',
      mention: 'Tableau d\'Honneur',
      observations: 'Élève assidu, excellents résultats en sciences.'
    },
    {
      id: 'cur-2',
      year: '2024 - 2025',
      classLevel: '1ère D2',
      schoolName: 'Collège Faoummaba',
      annualAverage: '14.85 / 20',
      result: 'Admis',
      mention: 'Félicitations',
      observations: 'Passage en classe de Terminale D.'
    },
    {
      id: 'cur-3',
      year: '2023 - 2024',
      classLevel: '2nde C',
      schoolName: 'Collège Faoummaba',
      annualAverage: '14.50 / 20',
      result: 'Admis',
      mention: 'Encouragements',
      observations: 'Orienté en série scientifique (1ère D).'
    },
    {
      id: 'cur-4',
      year: '2022 - 2023',
      classLevel: '3ème 1',
      schoolName: 'Collège Faoummaba',
      annualAverage: '15.60 / 20',
      result: 'BEPC Obtenu',
      mention: 'Félicitations (Mention Bien)',
      observations: 'Admis au Brevet d\'Études du Premier Cycle (BEPC).'
    },
    {
      id: 'cur-5',
      year: '2019 - 2020',
      classLevel: 'CM2',
      schoolName: 'École Primaire EPP Plateau',
      annualAverage: '16.20 / 20',
      result: 'CEPE Obtenu',
      mention: 'Très Bien',
      observations: 'Admis en classe de 6ème.'
    }
  ];
};

export const StudentCursusModal: React.FC<StudentCursusModalProps> = ({
  isOpen,
  onClose,
  student,
  readOnly = false,
  onUpdateStudent,
  currentUser
}) => {
  const isTeacherUser = currentUser?.role === 'teacher' || currentUser?.role === 'professeur' || currentUser?.accessLevel === 3;

  const [cursusList, setCursusList] = useState<CursusEntry[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<CursusEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<CursusEntry | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleCursusPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && student) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        student.photoUrl = dataUrl;
        if (onUpdateStudent) {
          onUpdateStudent({ ...student, photoUrl: dataUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const [directorStudiesName, setDirectorStudiesName] = useState<string>(() => {
    return localStorage.getItem('school_director_studies_name') || 'M. TAPE MAURICE';
  });

  const [formData, setFormData] = useState<Partial<CursusEntry>>({
    year: '2026 - 2027',
    classLevel: '',
    schoolName: 'Collège Faoummaba',
    annualAverage: '15.00 / 20',
    result: 'Admis',
    mention: 'Tableau d\'Honneur',
    observations: ''
  });

  useEffect(() => {
    if (!student) return;
    const storageKey = `student_cursus_${student.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      try {
        setCursusList(JSON.parse(saved));
      } catch (e) {
        setCursusList(getDefaultCursusForStudent(student));
      }
    } else {
      setCursusList(getDefaultCursusForStudent(student));
    }
  }, [student]);

  useEffect(() => {
    if (student) {
      localStorage.setItem(`student_cursus_${student.id}`, JSON.stringify(cursusList));
    }
  }, [cursusList, student]);

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  const handleClose = () => {
    window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: false } }));
    window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: false } }));
    onClose();
  };

  if (!isOpen || isTeacherUser || !student) return null;

  const handleOpenAdd = () => {
    setEditingEntry(null);
    setFormError(null);
    setFormData({
      year: '2026 - 2027',
      classLevel: student.class || '',
      schoolName: 'Collège Faoummaba',
      annualAverage: '14.50 / 20',
      result: 'Admis',
      mention: 'Tableau d\'Honneur',
      observations: ''
    });
    setIsAddFormOpen(true);
  };

  const handleOpenEdit = (entry: CursusEntry) => {
    setEditingEntry(entry);
    setFormError(null);
    setFormData(entry);
    setIsAddFormOpen(true);
  };

  const handleDeleteRequest = (entry: CursusEntry) => {
    setDeletingEntry(entry);
  };

  const handleConfirmDelete = () => {
    if (!deletingEntry) return;
    const updated = cursusList.filter(c => c.id !== deletingEntry.id);
    setCursusList(updated);
    if (student) {
      localStorage.setItem(`student_cursus_${student.id}`, JSON.stringify(updated));
    }
    setDeletingEntry(null);
    setIsAddFormOpen(false);
  };

  const handleResetDefaults = () => {
    if (!student) return;
    const defaultData = getDefaultCursusForStudent(student);
    setCursusList(defaultData);
    localStorage.setItem(`student_cursus_${student.id}`, JSON.stringify(defaultData));
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.year || !formData.classLevel) {
      setFormError('Veuillez renseigner l\'année et la classe.');
      return;
    }

    if (editingEntry) {
      setCursusList(prev => prev.map(c => c.id === editingEntry.id ? ({ ...c, ...formData } as CursusEntry) : c));
    } else {
      const newEntry: CursusEntry = {
        id: `cur-${Date.now()}`,
        year: formData.year || '2025 - 2026',
        classLevel: formData.classLevel || student.class,
        schoolName: formData.schoolName || 'Collège Faoummaba',
        annualAverage: formData.annualAverage || '15.00 / 20',
        result: (formData.result as any) || 'Admis',
        mention: formData.mention || 'Tableau d\'Honneur',
        observations: formData.observations || ''
      };
      setCursusList(prev => [newEntry, ...prev]);
    }
    setIsAddFormOpen(false);
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch (err) {
      console.error("Direct window.print error", err);
    }
  };

  return (
    <AnimatePresence>
      {/* Full Screen Page Overlay matching Dashboard header color bg-[#BFDBFE] */}
      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.99 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[110] w-full h-full min-h-screen bg-[#BFDBFE] flex flex-col overflow-hidden text-slate-900"
      >
        {/* Top App Bar - Dashboard Style */}
        <div className="flex justify-between items-center pt-5 sm:pt-7 pb-6 px-6 sm:px-8 shrink-0 relative z-10 print:hidden">
          <div className="flex items-center gap-3.5">
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-slate-900 flex items-center justify-center transition-all shadow-xs"
              title="Retourner au Dashboard"
            >
              <ArrowLeft size={20} className="text-slate-900" />
            </button>

            <div>
              <h1 className="text-white text-[22px] sm:text-[28px] font-bold tracking-tight leading-tight">
                Cursus Scolaire de l'Élève
              </h1>
              <p className="text-white/80 text-xs font-semibold">
                {student.name} • Matricule : <span className="font-extrabold text-white">{student.studentId}</span> • {student.class}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="btn-print hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-slate-900 font-bold text-xs sm:text-sm transition-all cursor-pointer active:scale-95"
              title="Imprimer le livret du cursus"
            >
              <Printer size={18} />
              <span>Imprimer</span>
            </button>

            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-full bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-slate-900 flex items-center justify-center transition-all shadow-xs cursor-pointer"
              title="Fermer la page"
            >
              <X size={20} className="text-slate-900" />
            </button>
          </div>
        </div>

        {/* Main Content Area with White Background (arrière-plan blanc) & Curved Top like Dashboard */}
        <main className="flex-1 bg-white rounded-t-[35px] sm:rounded-t-[40px] px-4 sm:px-8 pt-6 sm:pt-8 pb-24 overflow-y-auto custom-scrollbar shadow-2xl relative">
          <div className="max-w-5xl mx-auto space-y-6">

            {/* Subheader info bar */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-semibold text-slate-800">
              <div className="flex items-center gap-2">
                <School size={18} className="text-sky-600 shrink-0" />
                <span>Établissement actuel : <strong>Collège Faoummaba</strong></span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-emerald-800 font-extrabold bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-200">
                  <ShieldCheck size={14} /> Assiduité Validée
                </span>
                <span className="flex items-center gap-1.5 text-sky-900 font-extrabold bg-sky-100/90 px-3 py-1 rounded-full border border-sky-200">
                  <Award size={14} /> BEPC Obtenu
                </span>
              </div>
            </div>

            {/* Main Cursus Container */}
            <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              
              {/* Top Toolbar */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <BookOpen size={20} className="text-sky-600" />
                    Historique du Parcours Académique ({cursusList.length} années enregistrées)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Récapitulatif officiel des moyennes, bulletins et décisions des conseils de classe</p>
                </div>

                {!readOnly && (
                  <button
                    onClick={handleOpenAdd}
                    className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-500/20 transition-all flex items-center gap-2 shrink-0 print:hidden"
                  >
                    <Plus size={18} />
                    <span>Ajouter une Année</span>
                  </button>
                )}
              </div>

              {/* Timeline Cards */}
              {cursusList.length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mx-auto">
                    <BookOpen size={24} />
                  </div>
                  <h4 className="text-base font-bold text-slate-800">Aucune année enregistrée</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">Le cursus de cet élève ne contient actuellement aucune année. Vous pouvez en ajouter une nouvelle ou recharger le cursus par défaut.</p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    {!readOnly && (
                      <button
                        onClick={handleOpenAdd}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                      >
                        <Plus size={16} /> Ajouter une Année
                      </button>
                    )}
                    <button
                      onClick={handleResetDefaults}
                      className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all"
                    >
                      Réinitialiser le Cursus
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative border-l-2 border-sky-200 ml-3 sm:ml-4 pl-4 sm:pl-8 space-y-6">
                  {cursusList.map((item, index) => (
                    <div key={item.id} className="relative group">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[25px] sm:-left-[41px] top-2 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white flex items-center justify-center font-extrabold text-[10px] ${
                        index === 0 ? 'bg-sky-600 text-white ring-4 ring-sky-100' : 'bg-slate-300 text-slate-700'
                      }`}>
                        {cursusList.length - index}
                      </div>

                      <div className="bg-slate-50/70 hover:bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-sky-300 transition-all space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="px-3 py-1 rounded-lg text-xs font-black bg-slate-900 text-white shadow-xs">
                                {item.year}
                              </span>
                              <span className="text-base font-extrabold text-slate-900">
                                Classe de {item.classLevel}
                              </span>
                              <span className="text-xs font-semibold text-slate-500">
                                • {item.schoolName}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-black ${
                              item.result.includes('Obtenu') || item.result === 'Admis' 
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                                : item.result === 'En cours'
                                ? 'bg-sky-100 text-sky-800 border border-sky-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}>
                              {item.result}
                            </span>

                            {!readOnly && (
                              <div className="flex items-center gap-1 print:hidden">
                                <button
                                  onClick={() => handleOpenEdit(item)}
                                  className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                                  title="Modifier"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteRequest(item)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                  title="Supprimer cette année"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-medium border-t border-slate-200/60">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Award size={18} className="text-amber-500 shrink-0" />
                            <span>Moyenne Annuelle : <strong className="text-slate-900 text-sm font-extrabold">{item.annualAverage}</strong></span>
                          </div>
                          {item.mention && (
                            <div className="flex items-center gap-2 text-slate-700">
                              <Sparkles size={18} className="text-sky-500 shrink-0" />
                              <span>Mention du conseil : <strong className="text-sky-900 font-extrabold">{item.mention}</strong></span>
                            </div>
                          )}
                        </div>

                        {item.observations && (
                          <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200">
                            "{item.observations}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Official State Exam Summary Section */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-base sm:text-lg font-extrabold flex items-center gap-2.5 text-sky-400">
                  <Award size={22} />
                  Diplômes & Examens d'État Officiels (Ministère de l'Éducation Nationale)
                </h4>
                <span className="text-xs font-semibold text-slate-400">République de Côte d'Ivoire</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 space-y-1">
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">CEPE (Primaire)</p>
                  <p className="text-base font-extrabold text-white">Obtenu (Session 2020)</p>
                  <span className="inline-block text-[11px] text-emerald-400 font-extrabold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    ✓ Diplôme Validé
                  </span>
                </div>

                <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 space-y-1">
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">BEPC (Premier Cycle)</p>
                  <p className="text-base font-extrabold text-white">Obtenu (Session 2023)</p>
                  <span className="inline-block text-[11px] text-emerald-400 font-extrabold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    ✓ Mention Bien (15.60/20)
                  </span>
                </div>

                <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 space-y-1">
                  <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">BAC (Second Cycle)</p>
                  <p className="text-base font-extrabold text-white">En préparation (2026)</p>
                  <span className="inline-block text-[11px] text-sky-400 font-extrabold bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                    Session Juin 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Print Footer note */}
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold px-2">
              <p>Livret scolaire officiel certifié conforme par la direction administrative de l'établissement.</p>
              <button
                onClick={handlePrint}
                className="btn-print hidden sm:inline-flex text-sky-800 hover:text-sky-950 underline items-center gap-1"
              >
                <Printer size={14} /> Imprimer ce document
              </button>
            </div>

          </div>
        </main>
      </motion.div>

      {/* ADD / EDIT ENTRY MODAL */}
      {isAddFormOpen && (
        <div className="fixed inset-0 z-[120] bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingEntry ? 'Modifier l\'année de cursus' : 'Ajouter une année de cursus'}
              </h3>
              <button onClick={() => setIsAddFormOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Année Scolaire *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 2024 - 2025"
                    value={formData.year || ''}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-sky-500 outline-none font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Classe *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1ère D2"
                    value={formData.classLevel || ''}
                    onChange={(e) => setFormData({ ...formData, classLevel: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-sky-500 outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Établissement</label>
                <input
                  type="text"
                  placeholder="Ex: Collège Faoummaba"
                  value={formData.schoolName || ''}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-sky-500 outline-none font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Moyenne Annuelle</label>
                  <input
                    type="text"
                    placeholder="Ex: 15.20 / 20"
                    value={formData.annualAverage || ''}
                    onChange={(e) => setFormData({ ...formData, annualAverage: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-sky-500 outline-none font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Résultat / Décision</label>
                  <select
                    value={formData.result || 'Admis'}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value as any })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-sky-500 outline-none font-semibold text-slate-800"
                  >
                    <option value="Admis">Admis</option>
                    <option value="BEPC Obtenu">BEPC Obtenu</option>
                    <option value="CEPE Obtenu">CEPE Obtenu</option>
                    <option value="BAC Obtenu">BAC Obtenu</option>
                    <option value="Redoublement">Redoublement</option>
                    <option value="En cours">En cours</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Mention / Distinctions</label>
                <input
                  type="text"
                  placeholder="Ex: Tableau d'Honneur, Félicitations..."
                  value={formData.mention || ''}
                  onChange={(e) => setFormData({ ...formData, mention: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-sky-500 outline-none font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Observations</label>
                <textarea
                  rows={2}
                  placeholder="Remarques du conseil de classe..."
                  value={formData.observations || ''}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-sky-500 outline-none font-semibold text-slate-800 resize-none"
                />
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs rounded-xl">
                  {formError}
                </div>
              )}

              <div className="pt-3 flex items-center justify-between gap-2 border-t border-slate-100">
                {editingEntry ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddFormOpen(false);
                      setDeletingEntry(editingEntry);
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Trash2 size={15} />
                    <span>Supprimer</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddFormOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-extrabold text-xs shadow-md shadow-sky-500/20"
                  >
                    {editingEntry ? 'Enregistrer' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deletingEntry && (
        <div className="fixed inset-0 z-[130] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-in fade-in zoom-in duration-150">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 size={28} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Supprimer du cursus ?</h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                Voulez-vous vraiment supprimer l'année <strong className="text-slate-900">{deletingEntry.year}</strong> (Classe de {deletingEntry.classLevel}) ?
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingEntry(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-rose-500/20 transition-all"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE CURSUS DOCUMENT FOR PRINT */}
      <div id="printable-cursus" className="hidden print:block w-full bg-white text-black font-sans p-2 text-xs leading-tight select-none">
        <div id="printable-cursus-content" className="border-2 border-black p-3 space-y-3">
          
          {/* HEADER TOP ROW */}
          <div className="flex justify-between items-start border-b-2 border-black pb-2">
            {/* Left Block */}
            <div className="w-1/3 space-y-1">
              <p className="font-bold text-[9.5px] uppercase tracking-tighter">Ministère de l'Éducation Nationale</p>
              <div className="flex items-center gap-2 pt-1">
                <div className="w-12 h-12 flex items-center justify-center shrink-0">
                  <img src="icone.png" alt="Logo" className="w-12 h-12 object-contain" />
                </div>
                <div className="text-[9px] font-bold leading-snug">
                  <p className="text-[10.5px] font-extrabold uppercase">COLLÈGE FAOUMMABA</p>
                  <p>Yopougon Niangon Sud Carrefour</p>
                  <p>Tél: 27 23 45 61 11 / 05 05 96 70 80</p>
                  <p>zangabeh@gmail.com • 31 BP 144 Abidjan 31</p>
                </div>
              </div>
            </div>

            {/* Center Title Block */}
            <div className="w-1/3 text-center flex flex-col items-center justify-center pt-1">
              <h1 className="text-xs sm:text-sm font-black underline uppercase tracking-wide border-2 border-black px-2.5 py-1.5 bg-slate-50">
                LIVRET DU CURSUS SCOLAIRE ET PARCOURS ACADÉMIQUE
              </h1>
            </div>

            {/* Right Block */}
            <div className="w-1/3 text-right flex flex-col items-end space-y-1">
              <p className="font-bold text-[9.5px] uppercase tracking-tighter">République de Côte d'Ivoire</p>
              <p className="text-[8px] italic font-semibold">Union - Discipline - Travail</p>
              
              {/* Student Photo */}
              <input 
                type="file" 
                ref={photoInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleCursusPhotoSelect} 
              />
              <div 
                onClick={() => photoInputRef.current?.click()}
                className="mt-1 w-20 h-24 border-2 border-black bg-slate-100 overflow-hidden flex items-center justify-center relative group cursor-pointer"
                title="Cliquer pour changer la photo"
              >
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[8px] text-slate-400 font-bold">PHOTO</span>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-center p-1">
                  <Camera size={16} />
                  <span className="text-[8px] font-bold mt-0.5">Changer</span>
                </div>
              </div>
            </div>
          </div>

          {/* STUDENT INFO BOX */}
          <div className="border border-black text-[10px] grid grid-cols-12 divide-x divide-y divide-black bg-slate-50/50">
            <div className="col-span-12 p-1.5 flex gap-2">
              <span className="font-bold">Nom et Prénoms :</span>
              <span className="font-black text-sm uppercase">{student.name}</span>
            </div>

            <div className="col-span-4 p-1.5 flex gap-1 border-t border-black">
              <span className="font-bold">Matricule :</span>
              <span className="font-black">{student.studentId}</span>
            </div>
            <div className="col-span-4 p-1.5 flex gap-1 border-t border-black">
              <span className="font-bold">Classe Actuelle :</span>
              <span className="font-black">{student.class}</span>
            </div>
            <div className="col-span-4 p-1.5 flex gap-1 border-t border-black">
              <span className="font-bold">Sexe :</span>
              <span>{student.gender || 'F'}</span>
            </div>

            <div className="col-span-6 p-1.5 flex gap-1 border-t border-black">
              <span className="font-bold">Né(e) le :</span>
              <span>{student.birthDate}</span>
              <span className="font-bold ml-2">à :</span>
              <span>{student.birthPlace || 'Abidjan'}</span>
            </div>
            <div className="col-span-6 p-1.5 flex gap-1 border-t border-black">
              <span className="font-bold">Nationalité :</span>
              <span>{student.nationality || 'Ivoirienne'}</span>
            </div>

            <div className="col-span-8 p-1.5 flex gap-1 border-t border-black">
              <span className="font-bold">Établissement Actuel :</span>
              <span className="font-bold text-sky-950">Collège Faoummaba</span>
            </div>
            <div className="col-span-4 p-1.5 flex gap-1 border-t border-black">
              <span className="font-bold">Assiduité :</span>
              <span className="font-black text-emerald-800">✓ Validée</span>
            </div>
          </div>

          {/* CURSUS HISTORY TABLE */}
          <div>
            <h3 className="font-black text-[11px] uppercase border-b border-black pb-1 mb-1.5 flex items-center justify-between">
              <span>HISTORIQUE DU PARCOURS ACADÉMIQUE</span>
              <span className="font-bold text-[9px]">{cursusList.length} Année(s) Enregistrée(s)</span>
            </h3>

            <table className="w-full border-collapse border border-black text-[9.5px]">
              <thead>
                <tr className="bg-slate-200 border-b border-black text-center font-bold">
                  <th className="border border-black p-1 w-[15%]">Année Scolaire</th>
                  <th className="border border-black p-1 w-[12%]">Classe</th>
                  <th className="border border-black p-1 w-[25%]">Établissement</th>
                  <th className="border border-black p-1 w-[15%]">Moyenne Annuelle</th>
                  <th className="border border-black p-1 w-[15%]">Résultat / Décision</th>
                  <th className="border border-black p-1 w-[18%]">Mention / Distinctions</th>
                </tr>
              </thead>
              <tbody>
                {cursusList.map((item) => (
                  <tr key={item.id} className="border-b border-black">
                    <td className="border border-black p-1 font-bold text-center">{item.year}</td>
                    <td className="border border-black p-1 text-center font-semibold">{item.classLevel}</td>
                    <td className="border border-black p-1">{item.schoolName}</td>
                    <td className="border border-black p-1 text-center font-black">{item.annualAverage}</td>
                    <td className="border border-black p-1 text-center font-bold">{item.result}</td>
                    <td className="border border-black p-1">{item.mention || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* DIPLOMAS AND STATE EXAMS SECTION */}
          <div>
            <h3 className="font-black text-[11px] uppercase border-b border-black pb-1 mb-1.5">
              DIPLÔMES ET EXAMENS D'ÉTAT OFFICIELS (MINISTÈRE DE L'ÉDUCATION NATIONALE)
            </h3>
            <table className="w-full border-collapse border border-black text-[9.5px]">
              <thead>
                <tr className="bg-slate-200 border-b border-black text-center font-bold">
                  <th className="border border-black p-1 w-[25%]">Examen Officiel</th>
                  <th className="border border-black p-1 w-[35%]">Statut / Décision</th>
                  <th className="border border-black p-1 w-[40%]">Observations / Details</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black">
                  <td className="border border-black p-1 font-bold">CEPE (Primaire)</td>
                  <td className="border border-black p-1 font-bold text-emerald-800">✓ Obtenu (Session 2020)</td>
                  <td className="border border-black p-1">Diplôme d'État Validé</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-1 font-bold">BEPC (Premier Cycle)</td>
                  <td className="border border-black p-1 font-bold text-emerald-800">✓ Obtenu (Session 2023)</td>
                  <td className="border border-black p-1">Mention Bien (15,60 / 20)</td>
                </tr>
                <tr className="border-b border-black">
                  <td className="border border-black p-1 font-bold">BAC (Second Cycle)</td>
                  <td className="border border-black p-1 font-bold text-sky-800">En préparation (2026)</td>
                  <td className="border border-black p-1">Session Officielle Juin 2026</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CERTIFICATION & SIGNATURE BLOCK */}
          <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
            <div className="border border-black p-2 space-y-2">
              <p className="font-bold underline text-center">Certification Administrative</p>
              <p className="text-[9px] text-justify leading-normal">
                Le présent livret de cursus scolaire certifie officiellement l'historique et le parcours académique de l'élève au sein de l'établissement. Il est délivré en exemplaire unique pour servir et valoir ce que de droit.
              </p>
            </div>

            <div className="border border-black p-2 flex flex-col items-end text-center space-y-1">
              <p className="font-bold text-[9px]">Le Directeur des Études</p>
              
              {/* Stamp Circle Simulation */}
              <div className="w-20 h-20 rounded-full border-2 border-blue-800 text-blue-900 flex flex-col items-center justify-center p-1 text-[7px] font-black uppercase text-center leading-none opacity-90 my-1 transform -rotate-6">
                <span>C. FAOUMMABA</span>
                <span className="my-0.5 border-t border-b border-blue-800 px-1 py-0.5">LE DIRECTEUR</span>
                <span>ABIDJAN</span>
              </div>

              <p className="font-black text-[10px] uppercase">{directorStudiesName}</p>
              <p className="text-[8px] italic">Abidjan, le {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          {/* FOOTER DISCLOSURE */}
          <div className="border-t-2 border-black pt-1 text-center text-[8.5px] font-bold space-y-0.5">
            <p className="uppercase tracking-wide">AVEC COLLÈGE FAOUMMABA, VOLEZ VERS LE SUCCÈS !</p>
            <p className="italic font-normal text-slate-700">Document Officiel Informatisé. Certifié par la Direction de l'Établissement.</p>
          </div>

        </div>
      </div>
    </AnimatePresence>
  );
};
