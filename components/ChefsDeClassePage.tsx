import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Crown, UserCheck, ShieldCheck, Search, Plus, Phone, Mail, 
  GraduationCap, BookOpen, Edit3, Trash2, X, Check, ArrowLeft, 
  Users, Sparkles, Building2, User, Award, Printer, FileText, Lock, 
  ChevronDown, Camera, Upload, AlertTriangle, CheckCircle2, RotateCcw
} from 'lucide-react';
import { User as AppUser, Student } from '../types';
import { saveRealtimeDocument, deleteRealtimeDocument, subscribeToRealtimeCollection } from '../src/services/firebaseService';

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
  const BASE_LEVELS = isPrimary 
      ? ['Tous', 'CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2']
      : ['Tous', 'Terminale D', 'Terminale', '1ère', '2nde', '3ème', '4ème', '5ème', '6ème'];

  const [delegates, setDelegates] = useState<ClassDelegate[]>(() => {
    const saved = localStorage.getItem('school_db_chefs_de_classe');
    if (saved !== null) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing school_db_chefs_de_classe', e);
      }
    }
    return DEFAULT_CHEFS_DE_CLASSE;
  });

  const [selectedLevel, setSelectedLevel] = useState<string>('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassDelegate | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'classe' | 'principal' | 'adjoint' | 'discipline'>('principal');
  
  // Delete Confirmation Modal
  const [itemToDelete, setItemToDelete] = useState<ClassDelegate | null>(null);
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sub-cadres enable toggles for the edit form
  const [hasSubDelegate, setHasSubDelegate] = useState(true);
  const [hasDisciplineDelegate, setHasDisciplineDelegate] = useState(true);

  // Dropdowns
  const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isStudentPickerOpen, setIsStudentPickerOpen] = useState<'main' | 'sub' | 'discipline' | null>(null);

  // Hidden file inputs for image upload
  const mainPhotoInputRef = useRef<HTMLInputElement>(null);
  const subPhotoInputRef = useRef<HTMLInputElement>(null);
  const disciplinePhotoInputRef = useRef<HTMLInputElement>(null);

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

  const [formError, setFormError] = useState<string | null>(null);

  // Class list options from all students + presets
  const availableClasses = Array.from(
    new Set(allStudents.map(s => s.className || (s as any).class).filter(Boolean))
  ).sort();
  const defaultPresets = ['Terminale D', 'Terminale D1', 'Terminale D2', 'Terminale A', '1ère D', '2nde C', '3ème 1', '6ème 1'];
  const classListOptions = availableClasses.length > 0 ? availableClasses : defaultPresets;

  // Filter students for currently selected class in form
  const currentClassStudents = allStudents.filter(s => {
    const sClass = (s.className || (s as any).class || '').toLowerCase().trim();
    const formClass = (formData.className || '').toLowerCase().trim();
    return sClass && formClass && (sClass === formClass || sClass.includes(formClass) || formClass.includes(sClass));
  });

  // Sync with Firestore Realtime Collection
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeCollection<ClassDelegate>('chefs_de_classe', (remoteItems) => {
      if (remoteItems && remoteItems.length > 0) {
        setDelegates(remoteItems);
        localStorage.setItem('school_db_chefs_de_classe', JSON.stringify(remoteItems));
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Save to localStorage when delegates change
  useEffect(() => {
    localStorage.setItem('school_db_chefs_de_classe', JSON.stringify(delegates));
  }, [delegates]);

  // Modal navigation events
  useEffect(() => {
    const isAnyOpen = isModalOpen || itemToDelete !== null;
    window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: isAnyOpen } }));
    window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: isAnyOpen } }));
    return () => {
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: false } }));
      window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: false } }));
    };
  }, [isModalOpen, itemToDelete]);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const canEdit = currentUser?.role !== 'student' && currentUser?.accessLevel !== 1;

  // Handle open creation modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormError(null);
    setActiveFormTab('principal');
    setHasSubDelegate(true);
    setHasDisciplineDelegate(true);
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
      studentCount: 38,
      classroomNumber: 'Salle 204',
      notes: ''
    });
    setIsModalOpen(true);
  };

  // Handle open edit modal for a full card
  const handleOpenEdit = (item: ClassDelegate, initialTab: 'classe' | 'principal' | 'adjoint' | 'discipline' = 'principal') => {
    setEditingItem(item);
    setFormError(null);
    setActiveFormTab(initialTab);
    setHasSubDelegate(Boolean(item.subDelegate && item.subDelegate.name));
    setHasDisciplineDelegate(Boolean(item.disciplineDelegate && item.disciplineDelegate.name));
    setFormData(JSON.parse(JSON.stringify(item)));
    setIsModalOpen(true);
  };

  // Directly remove sub-cadres from a class card
  const handleRemoveSubCadre = async (itemId: string, subCadre: 'subDelegate' | 'disciplineDelegate') => {
    const target = delegates.find(d => d.id === itemId);
    if (!target) return;

    const label = subCadre === 'subDelegate' ? 'le cadre Adjoint' : 'le cadre Délégué Discipline';
    const updatedItem = { ...target };
    if (subCadre === 'subDelegate') {
      delete updatedItem.subDelegate;
    } else {
      delete updatedItem.disciplineDelegate;
    }

    const updatedList = delegates.map(d => d.id === itemId ? updatedItem : d);
    setDelegates(updatedList);
    localStorage.setItem('school_db_chefs_de_classe', JSON.stringify(updatedList));

    await saveRealtimeDocument('chefs_de_classe', itemId, updatedItem);
    showToast(`Suppression effectuée : ${label} a été retiré.`, 'info');
  };

  // Delete confirmation
  const handleRequestDelete = (item: ClassDelegate) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const id = itemToDelete.id;
    const name = itemToDelete.className;

    const updated = delegates.filter(d => d.id !== id);
    setDelegates(updated);
    localStorage.setItem('school_db_chefs_de_classe', JSON.stringify(updated));

    await deleteRealtimeDocument('chefs_de_classe', id);
    setItemToDelete(null);
    if (isModalOpen && editingItem?.id === id) {
      setIsModalOpen(false);
    }
    showToast(`Le cadre de chef de classe pour "${name}" a été supprimé.`, 'info');
  };

  // Restore default cards if user wants to reset empty state
  const handleRestoreDefaults = async () => {
    setDelegates(DEFAULT_CHEFS_DE_CLASSE);
    localStorage.setItem('school_db_chefs_de_classe', JSON.stringify(DEFAULT_CHEFS_DE_CLASSE));
    for (const item of DEFAULT_CHEFS_DE_CLASSE) {
      await saveRealtimeDocument('chefs_de_classe', item.id, item);
    }
    showToast('Cadres par défaut restaurés avec succès.');
  };

  // Image upload handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, targetField: 'main' | 'sub' | 'discipline') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (!base64Url) return;

      if (targetField === 'main') {
        setFormData(prev => ({
          ...prev,
          mainDelegate: { ...prev.mainDelegate!, photoUrl: base64Url }
        }));
      } else if (targetField === 'sub') {
        setFormData(prev => ({
          ...prev,
          subDelegate: { ...prev.subDelegate!, photoUrl: base64Url }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          disciplineDelegate: { ...prev.disciplineDelegate!, photoUrl: base64Url }
        }));
      }
      showToast('Photo mise à jour.');
    };
    reader.readAsDataURL(file);
  };

  // Pick student from allStudents
  const handleSelectStudent = (student: Student, targetField: 'main' | 'sub' | 'discipline') => {
    const defaultPhoto = student.gender === 'F' 
      ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
    const photo = student.avatar || (student as any).photoUrl || defaultPhoto;

    if (targetField === 'main') {
      setFormData(prev => ({
        ...prev,
        mainDelegate: {
          name: student.name,
          studentId: student.id ? String(student.id) : (student as any).matricule || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
          photoUrl: photo,
          phone: (student as any).phone || (student as any).parentPhone || prev.mainDelegate?.phone || '',
          gender: (student.gender as 'M' | 'F') || 'M'
        }
      }));
    } else if (targetField === 'sub') {
      setFormData(prev => ({
        ...prev,
        subDelegate: {
          name: student.name,
          studentId: student.id ? String(student.id) : (student as any).matricule || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
          photoUrl: photo,
          phone: (student as any).phone || (student as any).parentPhone || prev.subDelegate?.phone || '',
          gender: (student.gender as 'M' | 'F') || 'F'
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        disciplineDelegate: {
          name: student.name,
          studentId: student.id ? String(student.id) : (student as any).matricule || '',
          photoUrl: photo,
          gender: (student.gender as 'M' | 'F') || 'M'
        }
      }));
    }
    setIsStudentPickerOpen(null);
  };

  // Save form
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.className?.trim()) {
      setFormError('Veuillez indiquer le nom de la classe.');
      setActiveFormTab('classe');
      return;
    }

    if (!formData.mainDelegate?.name?.trim()) {
      setFormError('Le nom du chef de classe principal est obligatoire.');
      setActiveFormTab('principal');
      return;
    }

    const itemToSave: ClassDelegate = {
      id: editingItem ? editingItem.id : `chef-${Date.now()}`,
      className: formData.className.trim(),
      level: formData.level || 'Terminale D',
      principalTeacher: formData.principalTeacher?.trim() || '',
      studentCount: Number(formData.studentCount) || 35,
      classroomNumber: formData.classroomNumber?.trim() || '',
      notes: formData.notes?.trim() || '',
      mainDelegate: {
        name: formData.mainDelegate.name.trim(),
        photoUrl: formData.mainDelegate.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        studentId: formData.mainDelegate.studentId?.trim() || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        phone: formData.mainDelegate.phone?.trim() || '',
        gender: formData.mainDelegate.gender || 'M'
      },
      subDelegate: hasSubDelegate && formData.subDelegate?.name?.trim() ? {
        name: formData.subDelegate.name.trim(),
        photoUrl: formData.subDelegate.photoUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        studentId: formData.subDelegate.studentId?.trim() || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        phone: formData.subDelegate.phone?.trim() || '',
        gender: formData.subDelegate.gender || 'F'
      } : undefined,
      disciplineDelegate: hasDisciplineDelegate && formData.disciplineDelegate?.name?.trim() ? {
        name: formData.disciplineDelegate.name.trim(),
        photoUrl: formData.disciplineDelegate.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        studentId: formData.disciplineDelegate.studentId?.trim() || '',
        gender: formData.disciplineDelegate.gender || 'M'
      } : undefined
    };

    let updatedList: ClassDelegate[];
    if (editingItem) {
      updatedList = delegates.map(d => d.id === editingItem.id ? itemToSave : d);
    } else {
      updatedList = [itemToSave, ...delegates];
    }

    setDelegates(updatedList);
    localStorage.setItem('school_db_chefs_de_classe', JSON.stringify(updatedList));

    await saveRealtimeDocument('chefs_de_classe', itemToSave.id, itemToSave);

    setIsModalOpen(false);
    showToast(editingItem ? 'Cadre modifié avec succès !' : 'Nouveau cadre de chef de classe créé avec succès !');
  };

  // Filtered list
  const filtered = delegates.filter(item => {
    const matchesLevel = selectedLevel === 'Tous' || 
      item.level === selectedLevel || 
      item.className.toLowerCase().includes(selectedLevel.toLowerCase());

    const matchesSearch = !searchTerm || (
      item.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mainDelegate?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.subDelegate && item.subDelegate.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.principalTeacher && item.principalTeacher.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    return matchesLevel && matchesSearch;
  });

  const handlePrint = () => {
    const title = "LISTE DES CHEFS DE CLASSE ET DÉLÉGUÉS";
    const subtitle = `Année Scolaire 2025 - 2026 — ${selectedLevel === 'Tous' ? 'Toutes les Classes' : 'Niveau ' + selectedLevel}`;
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
              <div class="no-print" style="margin-bottom: 20px; padding: 14px 20px; background-color: #0f172a; color: white; display: flex; justify-content: space-between; align-items: center; border-radius: 14px;">
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
                  <p class="font-black uppercase text-slate-900 text-xs">COLLÈGE LES PHALÈNES II</p>
                  <p>Yopougon Niangon Sud Carrefour</p>
                  <p>Tél : 27 23 45 61 11 / 05 05 96 70 80</p>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                ${filtered.map(item => `
                  <div class="border border-slate-300 rounded-2xl p-4 bg-white shadow-xs space-y-3">
                    <div class="flex justify-between items-center border-b pb-2">
                      <div class="flex items-center gap-2">
                        <span class="w-9 h-9 rounded-xl bg-sky-100 text-sky-800 font-black flex items-center justify-center text-sm">${item.className.substring(0,2)}</span>
                        <div>
                          <h2 class="font-black text-base text-slate-900">${item.className}</h2>
                          <p class="text-[11px] text-slate-500 font-semibold">${item.classroomNumber || 'Salle non définie'} • ${item.studentCount || 35} Élèves</p>
                        </div>
                      </div>
                    </div>

                    ${item.principalTeacher ? `
                      <div class="text-xs font-semibold text-slate-700 bg-slate-50 p-2 rounded-xl border border-slate-200">
                        🎓 Prof. Principal : <strong>${item.principalTeacher}</strong>
                      </div>
                    ` : ''}

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
      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-[200] px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs sm:text-sm font-bold backdrop-blur-md ${
              toastMessage.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : toastMessage.type === 'info'
                ? 'bg-amber-50 text-amber-900 border-amber-200'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            ) : toastMessage.type === 'info' ? (
              <Sparkles size={18} className="text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 sm:pt-7 pb-6 px-6 sm:px-8 shrink-0 relative z-10 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-white text-[22px] sm:text-[28px] font-bold tracking-tight leading-tight">
              Chefs de Classe
            </h1>
          </div>
          <p className="text-white/80 text-xs font-semibold mt-1">
            Gestion, modification et suppression des cadres de délégués par classe
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 self-start sm:self-auto overflow-x-auto no-scrollbar max-w-full pb-0.5">
          {currentUser?.role !== 'student' && currentUser?.accessLevel !== 1 && (
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
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
            >
              <Plus size={16} className="shrink-0" />
              <span className="hidden sm:inline">Nouveau Cadre Chef</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 bg-white rounded-t-[35px] sm:rounded-t-[40px] px-4 sm:px-8 pt-6 sm:pt-8 pb-24 overflow-y-auto custom-scrollbar shadow-2xl relative">
        {/* Printable Header */}
        <div className="hidden print:block mb-8 text-center pb-4 border-b-2 border-slate-300">
          <h1 className="text-2xl font-black uppercase tracking-wide text-slate-900">Liste des Chefs de Classe & Délégués</h1>
          <p className="text-sm font-bold text-slate-600 mt-1">
            Année Scolaire 2025 - 2026 — Délégués Titulaires & Adjoints
          </p>
        </div>

        {/* SEARCH & FILTER BAR */}
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
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar max-w-full">
            {BASE_LEVELS.map((lvl, idx) => {
              const isSelected = selectedLevel === lvl;
              const count = lvl === 'Tous' 
                ? delegates.length 
                : delegates.filter(d => d.level === lvl || d.className.toLowerCase().includes(lvl.toLowerCase())).length;
              return (
                <button
                  key={`lvl-${lvl}-${idx}`}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3.5 py-2 rounded-full font-extrabold text-xs md:text-sm flex items-center gap-1.5 border transition-all whitespace-nowrap shrink-0 shadow-2xs cursor-pointer ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 text-sky-600 ring-2 ring-sky-100/80'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <BookOpen size={14} className={isSelected ? 'text-sky-600' : 'text-slate-400'} />
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
        <div className="p-0 sm:p-2 md:p-4 mt-6 flex-1">
          {filtered.length === 0 ? (
            <div className="bg-slate-50/70 rounded-3xl p-8 sm:p-12 text-center border-2 border-dashed border-slate-200 max-w-lg mx-auto shadow-sm my-8">
              <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Crown size={32} />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-1">Aucun cadre de chef de classe</h3>
              <p className="text-xs md:text-sm text-slate-500 mb-6 font-medium">
                {delegates.length === 0 
                  ? "Tous les cadres ont été supprimés. Vous pouvez en créer un nouveau ou réinitialiser le cadre par défaut."
                  : "Aucun délégué ne correspond à votre filtre de recherche."}
              </p>
              
              <div className="flex flex-wrap items-center justify-center gap-3">
                {canEdit && (
                  <button
                    onClick={handleOpenAdd}
                    className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs md:text-sm rounded-2xl transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Plus size={18} />
                    <span>Créer un cadre de classe</span>
                  </button>
                )}

                {canEdit && delegates.length === 0 && (
                  <button
                    onClick={handleRestoreDefaults}
                    className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-extrabold text-xs md:text-sm rounded-2xl transition-all shadow-xs inline-flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw size={16} className="text-slate-500" />
                    <span>Restaurer les cadres par défaut</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filtered.map((item, idx) => (
                <div
                  key={`chef-card-${item.id || item.className}-${idx}`}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between relative group"
                >
                  <div>
                    {/* TOP CARD BANNER & ACTIONS */}
                    <div className="flex items-start justify-between pb-4 border-b border-slate-100 mb-4 gap-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center font-black text-lg shadow-2xs shrink-0">
                          {item.className.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-black text-slate-900 leading-tight truncate">
                            {item.className}
                          </h3>
                          <p className="text-xs text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                            {item.classroomNumber && <span>{item.classroomNumber} •</span>}
                            <span>{item.studentCount || 35} Élèves</span>
                          </p>
                        </div>
                      </div>

                      {/* ACTION BUTTONS (MODIFIER / SUPPRIMER LE CADRE) */}
                      {canEdit && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEdit(item, 'principal')}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 font-extrabold text-xs transition-colors border border-sky-200/60 cursor-pointer shadow-2xs"
                            title="Modifier ce cadre de classe"
                          >
                            <Edit3 size={14} />
                            <span className="hidden sm:inline">Modifier</span>
                          </button>
                          <button
                            onClick={() => handleRequestDelete(item)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs transition-colors border border-rose-200/60 cursor-pointer shadow-2xs"
                            title="Supprimer ce cadre de classe"
                          >
                            <Trash2 size={14} />
                            <span className="hidden sm:inline">Supprimer</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* PROF PRINCIPAL */}
                    {item.principalTeacher && (
                      <div className="mb-4 px-3.5 py-2 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-700">
                        <GraduationCap size={15} className="text-sky-600 shrink-0" />
                        <span className="truncate">Prof. Principal : <strong>{item.principalTeacher}</strong></span>
                      </div>
                    )}

                    {/* CADRE 1: CHEF DE CLASSE PRINCIPAL */}
                    <div className="p-3.5 bg-gradient-to-r from-amber-50/90 to-amber-50/40 rounded-2xl border border-amber-200 mb-3 relative group/main">
                      <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-amber-800 mb-2">
                        <div className="flex items-center gap-1.5">
                          <Crown size={14} className="text-amber-600 shrink-0" />
                          <span>Cadre Chef de Classe Principal</span>
                        </div>
                        {canEdit && (
                          <button
                            onClick={() => handleOpenEdit(item, 'principal')}
                            className="opacity-0 group-hover/main:opacity-100 transition-opacity p-1 hover:bg-amber-100 rounded-lg text-amber-800 cursor-pointer"
                            title="Modifier le chef principal"
                          >
                            <Edit3 size={13} />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={item.mainDelegate.photoUrl}
                            alt={item.mainDelegate.name}
                            className="w-12 h-12 rounded-xl object-cover ring-2 ring-amber-300 border border-white shrink-0 shadow-xs"
                          />
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow-xs">
                            1
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-extrabold text-slate-900 truncate">
                            {item.mainDelegate.name}
                          </p>
                          <p className="text-xs text-slate-500 font-semibold truncate">
                            Matricule : {item.mainDelegate.studentId}
                          </p>
                        </div>
                        {item.mainDelegate.phone && (
                          <a
                            href={`tel:${item.mainDelegate.phone.replace(/\s+/g, '')}`}
                            className="p-2 bg-white text-amber-700 hover:bg-amber-100 rounded-xl transition-all border border-amber-200 shadow-2xs shrink-0 cursor-pointer"
                            title="Appeler le délégué"
                          >
                            <Phone size={14} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* CADRE 2: CHEF DE CLASSE ADJOINT (WITH DIRECT REMOVE BUTTON) */}
                    {item.subDelegate && item.subDelegate.name ? (
                      <div className="p-3 bg-gradient-to-r from-sky-50/90 to-sky-50/40 rounded-2xl border border-sky-200 mb-3 relative group/sub">
                        <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-sky-800 mb-2">
                          <div className="flex items-center gap-1.5">
                            <UserCheck size={14} className="text-sky-600 shrink-0" />
                            <span>Cadre Chef Adjoint</span>
                          </div>
                          {canEdit && (
                            <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenEdit(item, 'adjoint')}
                                className="p-1 hover:bg-sky-100 rounded-lg text-sky-800 cursor-pointer"
                                title="Modifier l'adjoint"
                              >
                                <Edit3 size={13} />
                              </button>
                              <button
                                onClick={() => handleRemoveSubCadre(item.id, 'subDelegate')}
                                className="p-1 hover:bg-rose-100 rounded-lg text-rose-700 cursor-pointer"
                                title="Supprimer ce cadre adjoint"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <img
                              src={item.subDelegate.photoUrl}
                              alt={item.subDelegate.name}
                              className="w-10 h-10 rounded-xl object-cover ring-2 ring-sky-200 border border-white shrink-0 shadow-2xs"
                            />
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-sky-500 text-white rounded-full flex items-center justify-center text-[9px] font-black shadow-xs">
                              2
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-extrabold text-slate-900 truncate">
                              {item.subDelegate.name}
                            </p>
                            <p className="text-[11px] text-slate-500 font-semibold truncate">
                              Matricule : {item.subDelegate.studentId || 'Non renseigné'}
                            </p>
                          </div>
                          {item.subDelegate.phone && (
                            <a
                              href={`tel:${item.subDelegate.phone.replace(/\s+/g, '')}`}
                              className="p-2 bg-white text-sky-700 hover:bg-sky-100 rounded-xl transition-all border border-sky-200 shadow-2xs shrink-0 cursor-pointer"
                              title="Appeler l'adjoint"
                            >
                              <Phone size={13} />
                            </a>
                          )}
                        </div>
                      </div>
                    ) : canEdit && (
                      <button
                        onClick={() => handleOpenEdit(item, 'adjoint')}
                        className="w-full mb-3 py-2 px-3 border border-dashed border-sky-200 hover:border-sky-400 bg-sky-50/30 hover:bg-sky-50/70 rounded-2xl text-xs font-bold text-sky-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Ajouter un cadre Chef Adjoint</span>
                      </button>
                    )}

                    {/* CADRE 3: DELEGUE DISCIPLINE (WITH DIRECT REMOVE BUTTON) */}
                    {item.disciplineDelegate && item.disciplineDelegate.name ? (
                      <div className="px-3.5 py-2.5 bg-gradient-to-r from-emerald-50/70 to-emerald-50/30 rounded-2xl border border-emerald-200 text-xs flex items-center justify-between gap-2 mb-3 relative group/disc">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {item.disciplineDelegate.photoUrl ? (
                            <img 
                              src={item.disciplineDelegate.photoUrl} 
                              alt={item.disciplineDelegate.name} 
                              className="w-8 h-8 rounded-lg object-cover ring-1 ring-emerald-300 shrink-0" 
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 font-bold text-xs">
                              <ShieldCheck size={16} />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase text-emerald-800 block">Cadre Discipline</span>
                            <span className="font-extrabold text-slate-800 truncate block">{item.disciplineDelegate.name}</span>
                          </div>
                        </div>

                        {canEdit && (
                          <div className="flex items-center gap-1 opacity-0 group-hover/disc:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleOpenEdit(item, 'discipline')}
                              className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-800 cursor-pointer"
                              title="Modifier délégué discipline"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleRemoveSubCadre(item.id, 'disciplineDelegate')}
                              className="p-1 hover:bg-rose-100 rounded-lg text-rose-700 cursor-pointer"
                              title="Supprimer ce cadre discipline"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {item.notes && (
                      <p className="text-xs text-slate-500 italic mt-2 line-clamp-2">
                        "{item.notes}"
                      </p>
                    )}
                  </div>

                  {/* BOTTOM ACTION BAR */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2">
                      {item.mainDelegate.phone && (
                        <a
                          href={`tel:${item.mainDelegate.phone.replace(/\s+/g, '')}`}
                          className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-xl font-extrabold flex items-center gap-1.5 transition-all shadow-2xs"
                        >
                          <Phone size={13} />
                          <span>Appeler</span>
                        </a>
                      )}
                    </div>

                    {canEdit && (
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item, 'principal')}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Edit3 size={13} />
                          <span>Modifier</span>
                        </button>
                        <button
                          onClick={() => handleRequestDelete(item)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer"
                          title="Supprimer le cadre"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL: ADD / EDIT CADRE */}
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
                  setIsStudentPickerOpen(null);
                }
              }}
            >
              <motion.div 
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="bg-white rounded-t-[32px] sm:rounded-3xl max-w-xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border-t sm:border border-slate-100 p-6 md:p-8 custom-scrollbar"
              >
                {/* Mobile Bottom Sheet Handle */}
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden"></div>

                {/* MODAL HEADER */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                      <Crown size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900">
                        {editingItem ? `Modifier le Cadre de ${formData.className || 'Classe'}` : 'Nouveau Cadre de Chef de Classe'}
                      </h2>
                      <p className="text-xs font-semibold text-slate-500">
                        Configuration des délégués, photos et coordonnées
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* ERROR BANNER */}
                {formError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
                    <AlertTriangle size={16} className="shrink-0 text-rose-600" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* NAVIGATION TABS WITHIN THE MODAL */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl mb-5 overflow-x-auto no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setActiveFormTab('principal')}
                    className={`flex-1 min-w-[110px] py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeFormTab === 'principal' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Crown size={14} className={activeFormTab === 'principal' ? 'text-amber-600' : 'text-slate-400'} />
                    <span>Chef Principal *</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFormTab('adjoint')}
                    className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeFormTab === 'adjoint' ? 'bg-white text-sky-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <UserCheck size={14} className={activeFormTab === 'adjoint' ? 'text-sky-600' : 'text-slate-400'} />
                    <span>Adjoint {hasSubDelegate ? '' : '(Désactivé)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFormTab('discipline')}
                    className={`flex-1 min-w-[100px] py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeFormTab === 'discipline' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck size={14} className={activeFormTab === 'discipline' ? 'text-emerald-600' : 'text-slate-400'} />
                    <span>Discipline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveFormTab('classe')}
                    className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      activeFormTab === 'classe' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 size={14} className={activeFormTab === 'classe' ? 'text-slate-900' : 'text-slate-400'} />
                    <span>Classe & Salle</span>
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4 text-xs md:text-sm">
                  {/* TAB 1: CHEF DE CLASSE PRINCIPAL */}
                  {activeFormTab === 'principal' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="font-extrabold text-xs text-amber-900 flex items-center gap-1.5">
                            <Crown size={15} className="text-amber-600" />
                            <span>Titulaire du Cadre Chef Principal</span>
                          </p>

                          {/* QUICK STUDENT PICKER */}
                          {currentClassStudents.length > 0 && (
                            <div className="relative">
                              <button
                                type="button"
                                onClick={() => setIsStudentPickerOpen(isStudentPickerOpen === 'main' ? null : 'main')}
                                className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                              >
                                <Users size={12} />
                                <span>Choisir élève ({currentClassStudents.length})</span>
                                <ChevronDown size={12} />
                              </button>

                              {isStudentPickerOpen === 'main' && (
                                <div className="absolute right-0 top-full mt-1 z-40 bg-white rounded-xl shadow-xl border border-slate-200 p-1 w-64 max-h-52 overflow-y-auto custom-scrollbar">
                                  <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase">Élèves de {formData.className}</div>
                                  {currentClassStudents.map((s, idx) => (
                                    <button
                                      key={`stu-pick-main-${s.id}-${idx}`}
                                      type="button"
                                      onClick={() => handleSelectStudent(s, 'main')}
                                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-50 text-xs font-semibold text-slate-800 flex items-center justify-between cursor-pointer"
                                    >
                                      <span className="truncate">{s.name}</span>
                                      <span className="text-[10px] text-slate-400">{s.gender === 'F' ? 'F' : 'M'}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* PHOTO MODIFICATION & PREVIEW */}
                        <div className="flex items-center gap-3 pt-1">
                          <div className="relative group shrink-0">
                            <img
                              src={formData.mainDelegate?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt="Photo chef principal"
                              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-300 border border-white shadow-xs"
                            />
                            <button
                              type="button"
                              onClick={() => mainPhotoInputRef.current?.click()}
                              className="absolute inset-0 bg-black/40 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Modifier la photo"
                            >
                              <Camera size={18} />
                              <span className="text-[9px] font-bold">Changer</span>
                            </button>
                          </div>

                          <div className="flex-1 space-y-1.5 min-w-0">
                            <label className="block text-[11px] font-extrabold text-slate-700">Photo du Chef de classe</label>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => mainPhotoInputRef.current?.click()}
                                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-amber-300 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                              >
                                <Upload size={13} className="text-amber-600" />
                                <span>Téléverser</span>
                              </button>
                              <input
                                type="file"
                                ref={mainPhotoInputRef}
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e, 'main')}
                              />
                              <input
                                type="text"
                                placeholder="Ou coller URL de la photo..."
                                value={formData.mainDelegate?.photoUrl || ''}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  mainDelegate: { ...formData.mainDelegate!, photoUrl: e.target.value }
                                })}
                                className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-xs text-slate-800 outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        {/* NAME */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">Nom et Prénoms *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Kouamé Ange Emmanuel"
                            value={formData.mainDelegate?.name || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              mainDelegate: { ...formData.mainDelegate!, name: e.target.value }
                            })}
                            className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-200 focus:border-amber-500 outline-none font-semibold text-slate-800"
                          />
                        </div>

                        {/* MATRICULE & PHONE & GENDER */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Matricule</label>
                            <input
                              type="text"
                              placeholder="Ex: STU-TD-01"
                              value={formData.mainDelegate?.studentId || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                mainDelegate: { ...formData.mainDelegate!, studentId: e.target.value }
                              })}
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-200 focus:border-amber-500 outline-none font-semibold text-slate-800 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Téléphone Contact</label>
                            <input
                              type="text"
                              placeholder="+225 07 48 92 11 05"
                              value={formData.mainDelegate?.phone || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                mainDelegate: { ...formData.mainDelegate!, phone: e.target.value }
                              })}
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-amber-200 focus:border-amber-500 outline-none font-semibold text-slate-800 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">Genre</label>
                            <select
                              value={formData.mainDelegate?.gender || 'M'}
                              onChange={(e) => setFormData({
                                ...formData,
                                mainDelegate: { ...formData.mainDelegate!, gender: e.target.value as 'M' | 'F' }
                              })}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-amber-200 focus:border-amber-500 outline-none font-semibold text-slate-800 text-xs cursor-pointer"
                            >
                              <option value="M">Masculin (M)</option>
                              <option value="F">Féminin (F)</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CHEF DE CLASSE ADJOINT */}
                  {activeFormTab === 'adjoint' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <UserCheck size={16} className="text-sky-600" />
                            <span className="font-extrabold text-xs text-sky-900">Cadre Chef Adjoint</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={hasSubDelegate}
                                onChange={(e) => setHasSubDelegate(e.target.checked)}
                                className="rounded text-sky-600 focus:ring-sky-500"
                              />
                              <span>Inclure ce cadre</span>
                            </label>

                            {hasSubDelegate && (
                              <button
                                type="button"
                                onClick={() => {
                                  setHasSubDelegate(false);
                                  setFormData(prev => ({
                                    ...prev,
                                    subDelegate: { name: '', photoUrl: '', studentId: '', phone: '', gender: 'F' }
                                  }));
                                }}
                                className="px-2 py-0.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[10px] font-bold border border-rose-200 cursor-pointer"
                              >
                                Supprimer le cadre
                              </button>
                            )}
                          </div>
                        </div>

                        {hasSubDelegate ? (
                          <>
                            {currentClassStudents.length > 0 && (
                              <div className="flex justify-end">
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setIsStudentPickerOpen(isStudentPickerOpen === 'sub' ? null : 'sub')}
                                    className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-800 border border-sky-300 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                                  >
                                    <Users size={12} />
                                    <span>Choisir élève ({currentClassStudents.length})</span>
                                    <ChevronDown size={12} />
                                  </button>

                                  {isStudentPickerOpen === 'sub' && (
                                    <div className="absolute right-0 top-full mt-1 z-40 bg-white rounded-xl shadow-xl border border-slate-200 p-1 w-64 max-h-52 overflow-y-auto custom-scrollbar">
                                      <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase">Élèves de {formData.className}</div>
                                      {currentClassStudents.map((s, idx) => (
                                        <button
                                          key={`stu-pick-sub-${s.id}-${idx}`}
                                          type="button"
                                          onClick={() => handleSelectStudent(s, 'sub')}
                                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-sky-50 text-xs font-semibold text-slate-800 flex items-center justify-between cursor-pointer"
                                        >
                                          <span className="truncate">{s.name}</span>
                                          <span className="text-[10px] text-slate-400">{s.gender === 'F' ? 'F' : 'M'}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* PHOTO */}
                            <div className="flex items-center gap-3 pt-1">
                              <div className="relative group shrink-0">
                                <img
                                  src={formData.subDelegate?.photoUrl || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80'}
                                  alt="Photo adjoint"
                                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-sky-300 border border-white shadow-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => subPhotoInputRef.current?.click()}
                                  className="absolute inset-0 bg-black/40 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  title="Modifier photo adjoint"
                                >
                                  <Camera size={16} />
                                  <span className="text-[9px] font-bold">Changer</span>
                                </button>
                              </div>

                              <div className="flex-1 space-y-1.5 min-w-0">
                                <label className="block text-[11px] font-extrabold text-slate-700">Photo de l'Adjoint</label>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => subPhotoInputRef.current?.click()}
                                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-sky-300 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                  >
                                    <Upload size={13} className="text-sky-600" />
                                    <span>Téléverser</span>
                                  </button>
                                  <input
                                    type="file"
                                    ref={subPhotoInputRef}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, 'sub')}
                                  />
                                  <input
                                    type="text"
                                    placeholder="Ou coller URL de la photo..."
                                    value={formData.subDelegate?.photoUrl || ''}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      subDelegate: { ...formData.subDelegate!, photoUrl: e.target.value }
                                    })}
                                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-xs text-slate-800 outline-none"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* NOM */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">Nom et Prénoms</label>
                              <input
                                type="text"
                                placeholder="Ex: Bamba Fatoumata"
                                value={formData.subDelegate?.name || ''}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  subDelegate: { ...formData.subDelegate!, name: e.target.value }
                                })}
                                className="w-full px-3.5 py-2 rounded-xl bg-white border border-sky-200 focus:border-sky-500 outline-none font-semibold text-slate-800"
                              />
                            </div>

                            {/* MATRICULE & PHONE */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Matricule</label>
                                <input
                                  type="text"
                                  placeholder="Ex: STU-TD-02"
                                  value={formData.subDelegate?.studentId || ''}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    subDelegate: { ...formData.subDelegate!, studentId: e.target.value }
                                  })}
                                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-sky-200 focus:border-sky-500 outline-none font-semibold text-slate-800 text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Téléphone</label>
                                <input
                                  type="text"
                                  placeholder="+225 05 77 14 32 89"
                                  value={formData.subDelegate?.phone || ''}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    subDelegate: { ...formData.subDelegate!, phone: e.target.value }
                                  })}
                                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-sky-200 focus:border-sky-500 outline-none font-semibold text-slate-800 text-xs"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Genre</label>
                                <select
                                  value={formData.subDelegate?.gender || 'F'}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    subDelegate: { ...formData.subDelegate!, gender: e.target.value as 'M' | 'F' }
                                  })}
                                  className="w-full px-3 py-2 rounded-xl bg-white border border-sky-200 focus:border-sky-500 outline-none font-semibold text-slate-800 text-xs cursor-pointer"
                                >
                                  <option value="F">Féminin (F)</option>
                                  <option value="M">Masculin (M)</option>
                                </select>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="py-4 text-center">
                            <p className="text-xs text-slate-500 font-semibold mb-2">Le cadre du chef adjoint est désactivé pour cette classe.</p>
                            <button
                              type="button"
                              onClick={() => setHasSubDelegate(true)}
                              className="px-3 py-1.5 bg-sky-600 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
                            >
                              Activer le cadre Chef Adjoint
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: DELEGUE A LA DISCIPLINE */}
                  {activeFormTab === 'discipline' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ShieldCheck size={16} className="text-emerald-600" />
                            <span className="font-extrabold text-xs text-emerald-900">Cadre Délégué Discipline</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <label className="text-[11px] font-extrabold text-slate-600 flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={hasDisciplineDelegate}
                                onChange={(e) => setHasDisciplineDelegate(e.target.checked)}
                                className="rounded text-emerald-600 focus:ring-emerald-500"
                              />
                              <span>Inclure ce cadre</span>
                            </label>

                            {hasDisciplineDelegate && (
                              <button
                                type="button"
                                onClick={() => {
                                  setHasDisciplineDelegate(false);
                                  setFormData(prev => ({
                                    ...prev,
                                    disciplineDelegate: { name: '', photoUrl: '', studentId: '', gender: 'M' }
                                  }));
                                }}
                                className="px-2 py-0.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-[10px] font-bold border border-rose-200 cursor-pointer"
                              >
                                Supprimer le cadre
                              </button>
                            )}
                          </div>
                        </div>

                        {hasDisciplineDelegate ? (
                          <>
                            {currentClassStudents.length > 0 && (
                              <div className="flex justify-end">
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() => setIsStudentPickerOpen(isStudentPickerOpen === 'discipline' ? null : 'discipline')}
                                    className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                                  >
                                    <Users size={12} />
                                    <span>Choisir élève ({currentClassStudents.length})</span>
                                    <ChevronDown size={12} />
                                  </button>

                                  {isStudentPickerOpen === 'discipline' && (
                                    <div className="absolute right-0 top-full mt-1 z-40 bg-white rounded-xl shadow-xl border border-slate-200 p-1 w-64 max-h-52 overflow-y-auto custom-scrollbar">
                                      <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase">Élèves de {formData.className}</div>
                                      {currentClassStudents.map((s, idx) => (
                                        <button
                                          key={`stu-pick-disc-${s.id}-${idx}`}
                                          type="button"
                                          onClick={() => handleSelectStudent(s, 'discipline')}
                                          className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 text-xs font-semibold text-slate-800 flex items-center justify-between cursor-pointer"
                                        >
                                          <span className="truncate">{s.name}</span>
                                          <span className="text-[10px] text-slate-400">{s.gender === 'F' ? 'F' : 'M'}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* PHOTO */}
                            <div className="flex items-center gap-3 pt-1">
                              <div className="relative group shrink-0">
                                <img
                                  src={formData.disciplineDelegate?.photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
                                  alt="Photo discipline"
                                  className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-300 border border-white shadow-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => disciplinePhotoInputRef.current?.click()}
                                  className="absolute inset-0 bg-black/40 text-white rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  title="Modifier photo"
                                >
                                  <Camera size={14} />
                                </button>
                              </div>

                              <div className="flex-1 space-y-1 min-w-0">
                                <label className="block text-[11px] font-extrabold text-slate-700">Photo Délégué Discipline</label>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => disciplinePhotoInputRef.current?.click()}
                                    className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-emerald-300 rounded-lg font-bold text-xs flex items-center gap-1 shadow-2xs cursor-pointer"
                                  >
                                    <Upload size={12} className="text-emerald-600" />
                                    <span>Téléverser</span>
                                  </button>
                                  <input
                                    type="file"
                                    ref={disciplinePhotoInputRef}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e, 'discipline')}
                                  />
                                  <input
                                    type="text"
                                    placeholder="URL photo..."
                                    value={formData.disciplineDelegate?.photoUrl || ''}
                                    onChange={(e) => setFormData({
                                      ...formData,
                                      disciplineDelegate: { ...formData.disciplineDelegate!, photoUrl: e.target.value }
                                    })}
                                    className="flex-1 px-2.5 py-1 rounded-lg bg-white border border-emerald-200 text-xs text-slate-800 outline-none"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* NOM & MATRICULE */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Nom et Prénoms</label>
                                <input
                                  type="text"
                                  placeholder="Ex: Traoré Ibrahim"
                                  value={formData.disciplineDelegate?.name || ''}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    disciplineDelegate: { ...formData.disciplineDelegate!, name: e.target.value }
                                  })}
                                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-200 focus:border-emerald-500 outline-none font-semibold text-slate-800"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-slate-700 mb-1">Matricule</label>
                                <input
                                  type="text"
                                  placeholder="Ex: STU-TD-03"
                                  value={formData.disciplineDelegate?.studentId || ''}
                                  onChange={(e) => setFormData({
                                    ...formData,
                                    disciplineDelegate: { ...formData.disciplineDelegate!, studentId: e.target.value }
                                  })}
                                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-emerald-200 focus:border-emerald-500 outline-none font-semibold text-slate-800"
                                />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="py-4 text-center">
                            <p className="text-xs text-slate-500 font-semibold mb-2">Le cadre de discipline est désactivé pour cette classe.</p>
                            <button
                              type="button"
                              onClick={() => setHasDisciplineDelegate(true)}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-xs cursor-pointer"
                            >
                              Activer le cadre Discipline
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: CLASSE & SALLE & PROF */}
                  {activeFormTab === 'classe' && (
                    <div className="space-y-4 animate-in fade-in duration-150">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* NOM DE LA CLASSE */}
                        <div className="relative">
                          <label className="block text-xs font-extrabold text-slate-700 mb-1">Nom de la Classe *</label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder="Ex: Terminale D"
                              value={formData.className || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setFormData({ 
                                  ...formData, 
                                  className: val
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
                              onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <ChevronDown size={16} className={`transition-transform duration-200 ${isClassDropdownOpen ? 'rotate-180 text-sky-600' : ''}`} />
                            </button>
                          </div>

                          {isClassDropdownOpen && classListOptions.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 space-y-1 max-h-52 overflow-y-auto animate-in fade-in duration-150 custom-scrollbar">
                              <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                Suggestions de classe
                              </div>
                              {classListOptions.map((cls, idx) => {
                                const isSel = formData.className === cls;
                                return (
                                  <button
                                    key={`cls-opt-${cls}-${idx}`}
                                    type="button"
                                    onClick={() => {
                                      setFormData({ 
                                        ...formData, 
                                        className: cls
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

                        {/* NIVEAU */}
                        <div className="relative">
                          <label className="block text-xs font-extrabold text-slate-700 mb-1">Niveau d'Enseignement</label>
                          <button
                            type="button"
                            onClick={() => {
                              setIsLevelDropdownOpen(!isLevelDropdownOpen);
                              setIsClassDropdownOpen(false);
                            }}
                            className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-white focus:bg-white focus:border-sky-500 outline-none font-extrabold text-slate-800 flex items-center justify-between transition-all cursor-pointer text-xs sm:text-sm"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <BookOpen size={15} className="text-sky-600 shrink-0" />
                              <span className="truncate">{formData.level || 'Terminale D'}</span>
                            </div>
                            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isLevelDropdownOpen ? 'rotate-180 text-sky-600' : ''}`} />
                          </button>

                          {isLevelDropdownOpen && (
                            <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 space-y-1 max-h-52 overflow-y-auto animate-in fade-in duration-150 custom-scrollbar">
                              {BASE_LEVELS.filter(l => l !== 'Tous').map((l, idx) => {
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

                      {/* SALLE & EFFECTIF */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-extrabold text-slate-700 mb-1">Salle de classe</label>
                          <input
                            type="text"
                            placeholder="Ex: Salle 204"
                            value={formData.classroomNumber || ''}
                            onChange={(e) => setFormData({ ...formData, classroomNumber: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-sky-500 outline-none font-semibold text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-extrabold text-slate-700 mb-1">Effectif total d'élèves</label>
                          <input
                            type="number"
                            placeholder="Ex: 38"
                            value={formData.studentCount || ''}
                            onChange={(e) => setFormData({ ...formData, studentCount: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-sky-500 outline-none font-semibold text-slate-800"
                          />
                        </div>
                      </div>

                      {/* PROF PRINCIPAL */}
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1">Professeur Principal</label>
                        <input
                          type="text"
                          placeholder="Ex: M. Koffi Kouamé (Prof. Mathématiques)"
                          value={formData.principalTeacher || ''}
                          onChange={(e) => setFormData({ ...formData, principalTeacher: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-sky-500 outline-none font-semibold text-slate-800"
                        />
                      </div>

                      {/* NOTES */}
                      <div>
                        <label className="block text-xs font-extrabold text-slate-700 mb-1">Remarques ou mission spéciale</label>
                        <textarea
                          rows={2}
                          placeholder="Ex: Représentants élus pour l'année scolaire 2025-2026..."
                          value={formData.notes || ''}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-sky-500 outline-none font-semibold text-slate-800 resize-none text-xs"
                        />
                      </div>
                    </div>
                  )}

                  {/* MODAL FOOTER ACTIONS */}
                  <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-100 mt-6">
                    {editingItem ? (
                      <button
                        type="button"
                        onClick={() => handleRequestDelete(editingItem)}
                        className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer text-xs sm:text-sm"
                      >
                        <Trash2 size={15} />
                        <span>Supprimer ce cadre</span>
                      </button>
                    ) : (
                      <div></div>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer text-xs sm:text-sm"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-extrabold shadow-md shadow-sky-500/20 transition-all cursor-pointer text-xs sm:text-sm"
                      >
                        {editingItem ? 'Enregistrer les modifications' : 'Créer le cadre'}
                      </button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CUSTOM CONFIRMATION MODAL: SUPPRIMER LE CADRE DE CHEF DE CLASSE */}
        <AnimatePresence>
          {itemToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) setItemToDelete(null);
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100"
              >
                <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={28} />
                </div>

                <h3 className="text-lg font-black text-slate-900 text-center mb-1">
                  Supprimer le cadre de chef de classe
                </h3>
                <p className="text-xs text-slate-500 text-center mb-5">
                  Êtes-vous sûr de vouloir supprimer définitivement le cadre de chef de classe pour :
                </p>

                {/* SUMMARY BOX */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 mb-6 flex items-center gap-3">
                  <img
                    src={itemToDelete.mainDelegate.photoUrl}
                    alt={itemToDelete.mainDelegate.name}
                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-rose-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-900 truncate">
                      {itemToDelete.className}
                    </p>
                    <p className="text-xs text-slate-600 font-semibold truncate">
                      Chef : {itemToDelete.mainDelegate.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setItemToDelete(null)}
                    className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all cursor-pointer text-xs sm:text-sm"
                  >
                    Conserver
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-md shadow-rose-500/20 transition-all cursor-pointer text-xs sm:text-sm"
                  >
                    Oui, supprimer
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
