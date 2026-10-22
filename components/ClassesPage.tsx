import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DailyScheduleMobileView } from './DailyScheduleMobileView';
import { SchedulePage } from './SchedulePage';
import { BookOpen, Users, ArrowRight, ArrowLeft, GraduationCap, Calendar, MoreVertical, Mail, Phone, BarChart2, Plus, Trash2, X, Save, Edit3, MapPin, ChevronLeft, ChevronRight, ChevronDown, Search, ShoppingBag, Package, CheckSquare, Sparkles, AlertCircle, Check, FileText, Camera, Image as ImageIcon, ZoomIn, Eye } from 'lucide-react';
import { Student, getSubjectsForClass } from '../types';
import { getParentChildren, isParentChild, isSameClass } from '../src/utils/parentUtils';
import { mockClasses, mockTeachers } from '../data/mockData';
import { getSuppliesForClass, saveSuppliesForClass, SchoolSupply } from '../data/suppliesData';
import { saveExerciseToClass, deleteExerciseFromClass, getExercisesForClass } from '../data/exercisesData';
import { PrintableLivret } from './PrintableLivret';
import { compressImage } from '../src/utils/userUtils';
import { cleanUtf8 } from '../src/utils/encodingUtils';

// Constants for Schedule Editing
const SUBJECTS = [
    'Mathématiques', 'Français', 'Anglais', 'Hist-Géo', 'SVT', 
    'Physique-Chimie', 'EPS', 'Philosophie', 'Informatique', 'Espagnol', 
    'Allemand', 'Arts Plastiques', 'Musique', 'Devoir',
    'Histoire', 'Géographie', 'EDHC', 'Sciences et Technologies', 'Éducation Musicale', 'Sciences et Technologies (notions de base)'
];

const ROOMS = [
    'CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2',
    '6ème A', '6ème B', '5ème A', '5ème B', 
    '4ème A', '4ème B', '3ème A', '3ème B', 
    'Seconde A', 'Seconde C', '1ère A', '1ère D', 'Tle A', 'Tle D'
];

const getSubjectColor = (subject: string): string => {
    switch (subject) {
        case 'Mathématiques': return 'bg-sky-100 border-sky-200 text-sky-700';
        case 'SVT': 
        case 'Sciences et Technologies':
            return 'bg-cyan-100 border-cyan-200 text-cyan-700'; 
        case 'Physique-Chimie': return 'bg-purple-100 border-purple-200 text-purple-700';
        case 'Français': return 'bg-pink-100 border-pink-200 text-pink-700'; 
        case 'Anglais': return 'bg-sky-100 border-sky-200 text-sky-700';
        case 'Hist-Géo': 
        case 'Histoire':
        case 'Géographie':
            return 'bg-amber-100 border-amber-200 text-amber-700';
        case 'EPS': return 'bg-green-100 border-green-200 text-green-700';
        case 'Philosophie': return 'bg-slate-100 border-slate-200 text-slate-700';
        case 'Informatique': return 'bg-indigo-100 border-indigo-200 text-indigo-700';
        case 'Espagnol': return 'bg-orange-100 border-orange-200 text-orange-700';
        case 'Allemand': return 'bg-lime-100 border-lime-200 text-lime-700';
        case 'Arts Plastiques': return 'bg-fuchsia-100 border-fuchsia-200 text-fuchsia-700';
        case 'Musique': 
        case 'Éducation Musicale':
            return 'bg-violet-100 border-violet-200 text-violet-700';
        case 'EDHC': return 'bg-teal-100 border-teal-200 text-teal-700';
        case 'Devoir':
        case 'Devoirs':
        case 'Étude': return 'bg-gray-100 border-gray-200 text-gray-600';
        default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
};

const CustomSubjectSelect: React.FC<{ value: string; onChange: (val: string) => void; className?: string }> = ({ value, onChange, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const subjectsList = className ? getSubjectsForClass(className) : SUBJECTS;

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-gray-200 hover:border-sky-300 focus:border-sky-500 rounded-xl px-3.5 py-2 flex items-center justify-between text-left font-bold text-slate-800 text-sm transition-all shadow-2xs cursor-pointer group"
            >
                <div className="flex items-center gap-2 truncate pr-2">
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${value === 'Exercices Communs' ? 'bg-sky-500' : 'bg-indigo-500'}`} />
                    <span className="truncate">{value === 'Exercices Communs' ? 'Exercices Communs (Général)' : value}</span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 group-hover:text-sky-600 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-sky-600' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />

                    <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white border border-slate-200/90 rounded-2xl shadow-xl py-1.5 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-1.5 pb-1 mb-1 border-b border-slate-100">
                            <button
                                type="button"
                                onClick={() => {
                                    onChange('Exercices Communs');
                                    setIsOpen(false);
                                }}
                                className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                    value === 'Exercices Communs'
                                        ? 'bg-sky-50 text-sky-700'
                                        : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
                                    <span>Exercices Communs (Général)</span>
                                </div>
                                {value === 'Exercices Communs' && <Check size={14} className="text-sky-600 stroke-[2.5]" />}
                            </button>
                        </div>

                        <div className="px-1.5 space-y-0.5">
                            {subjectsList.map((s) => {
                                const isSelected = value === s;
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => {
                                            onChange(s);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                            isSelected
                                                ? 'bg-sky-50 text-sky-700'
                                                : 'text-slate-700 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                                            <span>{s}</span>
                                        </div>
                                        {isSelected && <Check size={14} className="text-sky-600 stroke-[2.5]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const timeSlots = [
  '07h30 - 08h25',
  '08h25 - 09h20',
  '09h20 - 10h15',
  '10h15 - 10h30',
  '10h30 - 11h25',
  '11h25 - 12h20',
  '12h20 - 13h15',
  '13h15 - 14h50',
  '14h50 - 15h45',
  '15h45 - 16h40',
  '16h40 - 17h35'
];
const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

// Initial Mock Data (Updated Colors)
const initialSchedule = [
    { id: '1', day: 0, start: 0, duration: 2, title: 'Mathématiques', color: 'bg-sky-100 border-sky-200 text-sky-700', room: 'Salle 101' },
    { id: '2', day: 0, start: 2, duration: 1, title: 'Anglais', color: 'bg-sky-100 border-sky-200 text-sky-700', room: 'Salle 204' },
    { id: '3', day: 1, start: 0, duration: 2, title: 'Physique-Chimie', color: 'bg-purple-100 border-purple-200 text-purple-700', room: 'Labo 2' },
    { id: '4', day: 1, start: 3, duration: 1.5, title: 'Français', color: 'bg-pink-100 border-pink-200 text-pink-700', room: 'Salle 105' },
    { id: '5', day: 2, start: 0, duration: 4, title: 'EPS', color: 'bg-green-100 border-green-200 text-green-700', room: 'Stade' },
    { id: '6', day: 3, start: 0, duration: 2, title: 'Hist-Géo', color: 'bg-amber-100 border-amber-200 text-amber-700', room: 'Salle 102' },
    { id: '7', day: 4, start: 2, duration: 2, title: 'SVT', color: 'bg-cyan-100 border-cyan-200 text-cyan-700', room: 'Labo 1' },
];

// Helper to generate fake filler students
const generateFillerStudents = (count: number, classCode: string): Student[] => {
    const isTech = classCode.match(/(G1|G2|G3|AB|F1|F2|F3|F4|F7|STT|STI|BEP|CAP|BT|BP|Technique|Professionnel|Tertiaire|Industriel)/i);
    let subjectsList = isTech ? getSubjectsForClass(classCode) : ['Mathématiques', 'Français', 'Physique-Chimie', 'SVT', 'Anglais', 'Hist-Géo', 'E.D.H.C', 'EPS', 'Informatique', 'Conduite']; 

    if (!isTech) {
        if (classCode.toLowerCase().includes('seconde') || classCode.includes('2nde')) {
             subjectsList = ['Mathématiques', 'Français', 'Physique-Chimie', 'SVT', 'Anglais', 'Hist-Géo', 'EPS', 'Informatique', 'Conduite'];
        } else if (classCode.toLowerCase().includes('première') || classCode.includes('1ère')) {
             if (classCode.match(/(1ère D|1ere D|1°D|1D|Première D|Premiere D)/i)) {
                 subjectsList = ['Mathématiques', 'Français', 'Anglais', 'Histoire-Géographie', 'Philosophie', 'Physique-Chimie', 'SVT', 'EPS', 'Informatique', 'Conduite'];
             } else {
                 subjectsList = ['Mathématiques', 'Français', 'Anglais', 'Histoire-Géographie', 'Philosophie', 'L.V.2 (Allemand / Espagnol)', 'Physique-Chimie', 'SVT', 'EPS', 'Informatique', 'Conduite'];
             }
        } else if (classCode.toLowerCase().includes('terminale') || classCode.toLowerCase().includes('tle') || classCode.includes('T°')) {
             if (classCode.match(/(A1|A2)/i)) {
                 subjectsList = ['Mathématiques', 'Français', 'Anglais', 'Histoire-Géographie', 'Philosophie', 'L.V.2 (Allemand / Espagnol)', 'SVT', 'EPS', 'Informatique', 'Conduite'];
             } else {
                 subjectsList = ['Mathématiques', 'Français', 'Anglais', 'Histoire-Géographie', 'Philosophie', 'Physique-Chimie', 'SVT', 'EPS', 'Informatique', 'Conduite'];
             }
        }
    }

    const colors = ['#ef4444', '#f97316', '#db2777', '#f43f5e', '#b91c1c', '#fb923c', '#be123c', '#991b1b'];

    return Array.from({ length: count }, (_, i) => ({
        id: `filler-${classCode}-${i}`,
        name: `Élève ${i + 1}`,
        class: classCode,
        studentId: `2024-${classCode.replace(/\s/g, '')}-${500 + i}`,
        birthDate: '01/01/2009',
        photoUrl: `https://i.pravatar.cc/150?u=${i + 500 + classCode.length}`,
        absences: Math.floor(Math.random() * 5),
        attendanceHistory: [],
        performance: [
            { name: 'Sep', studentScore: 10 + Math.random() * 5, classAverage: 14 },
            { name: 'Oct', studentScore: 10 + Math.random() * 5, classAverage: 14.5 },
        ],
        subjects: subjectsList.map((sub, idx) => ({
            name: sub,
            value: 100 / subjectsList.length,
            average: parseFloat((8 + Math.random() * 10).toFixed(2)), 
            fill: colors[idx % colors.length]
        })),
        activities: []
    }));
};

interface ClassesPageProps {
    onAnalyzeStudent?: (student: Student) => void;
    allStudents?: Student[];
    teachers?: Teacher[];
    readOnly?: boolean;
    restrictedClass?: string;
    currentUser?: any;
    onNavigate?: (page: string) => void;
}

export const ClassesPage: React.FC<ClassesPageProps> = ({ onAnalyzeStudent, allStudents = [], teachers = [], readOnly = false, restrictedClass, currentUser, onNavigate }) => {
  const isTeacherUser = currentUser?.role === 'teacher' || currentUser?.role === 'professeur' || currentUser?.accessLevel === 3;
  const isCashier = currentUser?.role === 'cashier' || currentUser?.accessLevel === 4;
  const canEditSchedule = !readOnly && !isTeacherUser && !isCashier;
  const canEditSupplies = (!readOnly || isCashier) && !isTeacherUser;
  // Classe Tle D 1 (Terminale D1) exclusivement affichée sur la page classe
  const tleD1Class = useMemo(() => {
    return mockClasses.find(c => c.name.toLowerCase() === 'terminale d1' || c.code.toLowerCase() === 'tle d1' || c.code.toLowerCase() === 'tle d 1') || {
      id: 17,
      name: 'Terminale D1',
      code: 'Tle D1',
      students: 28,
      time: '07:30 - 18:00',
      color: 'bg-rose-100 text-rose-600',
      section: 'Général'
    };
  }, []);

  const displayedClasses = useMemo(() => [tleD1Class], [tleD1Class]);

  const [selectedClass, setSelectedClass] = useState<any>(() => tleD1Class);

  useEffect(() => {
    setSelectedClass(tleD1Class);
  }, [tleD1Class]);
  const [activeTab, setActiveTab] = useState<'students' | 'principal' | 'schedule' | 'supplies'>('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [teacherToCall, setTeacherToCall] = useState<any | null>(null);
  const [teacherToEmail, setTeacherToEmail] = useState<any | null>(null);

  const handleOpenWhatsApp = (teacher: any) => {
    if (!teacher) return;
    const rawPhone = teacher.phone || '+225 07 00 00 00 00';
    const digits = rawPhone.replace(/\D/g, '');
    const waNumber = digits.startsWith('225')
      ? digits
      : (digits.length === 10 ? `225${digits}` : (digits ? `225${digits}` : '2250700000000'));

    const isColleague = currentUser?.role === 'teacher';
    const greeting = isColleague
      ? `Bonjour cher collègue ${teacher.name}, je vous contacte depuis la plateforme Terminale-D.`
      : `Bonjour M./Mme ${teacher.name}, je vous contacte depuis la plateforme Terminale-D.`;

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(greeting)}`;

    try {
      const link = document.createElement('a');
      link.href = waUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      window.location.href = waUrl;
    }
  };

  const [selectedSection, setSelectedSection] = useState<'Primaire' | 'Général' | 'Technique'>(currentUser?.section === 'Primaire' ? 'Primaire' : 'Général');
  
  // Mobile Schedule State
  const [mobileDayIndex, setMobileDayIndex] = useState(0);

  // Teachers and Professeur Principal Logic
  const allTeachersList = useMemo(() => {
      if (teachers && teachers.length > 0) return teachers;
      try {
          const saved = localStorage.getItem('school_db_teachers');
          if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          }
      } catch (e) {}
      return mockTeachers;
  }, [teachers]);

  const mainTeacherOfClass = useMemo(() => {
      if (!selectedClass) return null;
      return allTeachersList.find((t: any) => 
          t.isPrincipal && 
          t.principalClasses && 
          Array.isArray(t.principalClasses) &&
          (t.principalClasses.includes(selectedClass.name) || t.principalClasses.includes(selectedClass.code))
      );
  }, [selectedClass, allTeachersList]);

  const classTeachersList = useMemo(() => {
      if (!selectedClass) return [];
      return allTeachersList.filter((teacher: any) => {
          const matchesAssigned = teacher.assignedClasses && Array.isArray(teacher.assignedClasses) && 
            (teacher.assignedClasses.includes(selectedClass.name) || 
             teacher.assignedClasses.includes(selectedClass.code) ||
             teacher.assignedClasses.some((c: string) => typeof c === 'string' && (isSameClass(c, selectedClass.name) || isSameClass(c, selectedClass.code) || c.toLowerCase().includes('terminale'))));
          const matchesPP = teacher.isPrincipal && teacher.principalClasses && Array.isArray(teacher.principalClasses) && 
            (teacher.principalClasses.includes(selectedClass.name) || teacher.principalClasses.includes(selectedClass.code));
          return matchesAssigned || matchesPP;
      });
  }, [selectedClass, allTeachersList]);

  const isCurrentUserPPOfClass = useMemo(() => {
      if (!selectedClass || !currentUser) return false;
      
      const isTeacher = currentUser.role === 'teacher' || currentUser.accessLevel === 3;
      if (!isTeacher) return false;

      if (currentUser.isPrincipal && currentUser.principalClasses && Array.isArray(currentUser.principalClasses) && currentUser.principalClasses.includes(selectedClass.name)) {
          return true;
      }

      if (mainTeacherOfClass) {
          const matchesId = String(currentUser.id) === String(mainTeacherOfClass.id);
          const matchesUid = currentUser.uid && mainTeacherOfClass.uid && String(currentUser.uid) === String(mainTeacherOfClass.uid);
          const matchesAuthUid = currentUser.uid && mainTeacherOfClass.authUid && String(currentUser.uid) === String(mainTeacherOfClass.authUid);
          const matchesAuthUidRev = currentUser.id && mainTeacherOfClass.authUid && String(currentUser.id) === String(mainTeacherOfClass.authUid);
          const matchesUidRev = currentUser.id && mainTeacherOfClass.uid && String(currentUser.id) === String(mainTeacherOfClass.uid);
          const matchesName = currentUser.name && mainTeacherOfClass.name && 
              currentUser.name.toLowerCase().trim() === mainTeacherOfClass.name.toLowerCase().trim();
          return matchesId || matchesUid || matchesAuthUid || matchesAuthUidRev || matchesUidRev || matchesName;
      }

      return false;
  }, [selectedClass, currentUser, mainTeacherOfClass]);

  // Schedule State
  const [scheduleEvents, setScheduleEvents] = useState<any[]>(initialSchedule);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState(() => {
      const defaultSub = getSubjectsForClass(ROOMS[0])[0];
      return {
          day: 0,
          start: 0,
          duration: 1,
          title: defaultSub,
          room: ROOMS[0],
          color: getSubjectColor(defaultSub)
      };
  });

  // School Supplies State
  const [classSupplies, setClassSupplies] = useState<SchoolSupply[]>([]);
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [editingSupply, setEditingSupply] = useState<SchoolSupply | null>(null);
  const [selectedMobileStudent, setSelectedMobileStudent] = useState<Student | null>(null);
  const [livretStudent, setLivretStudent] = useState<Student | null>(null);

  // Unified effect to hide bottom navigation when inside a class detail view or modal
  useEffect(() => {
      const isHidden = !!selectedClass || !!selectedMobileStudent || showSupplyModal || !!livretStudent;
      window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden } }));
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: isHidden } }));
      return () => {
          window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: false } }));
          window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: false } }));
      };
  }, [selectedClass, selectedMobileStudent, showSupplyModal, livretStudent]);
  const [supplyItemsList, setSupplyItemsList] = useState<Array<{
      id: string;
      subject: string;
      item: string;
      quantity: number;
      isMandatory: boolean;
      notes: string;
      image?: string;
  }>>([]);
  const [previewImageModal, setPreviewImageModal] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
      if (selectedClass) {
          setClassSupplies(getSuppliesForClass(selectedClass.name));
      }
  }, [selectedClass]);

  useEffect(() => {
      const handleExercisesChanged = () => {
          if (selectedClass) {
              setClassSupplies(getSuppliesForClass(selectedClass.name));
          }
      };
      window.addEventListener('exercises-updated', handleExercisesChanged);
      window.addEventListener('supplies-updated', handleExercisesChanged);
      return () => {
          window.removeEventListener('exercises-updated', handleExercisesChanged);
          window.removeEventListener('supplies-updated', handleExercisesChanged);
      };
  }, [selectedClass]);

  const handleOpenAddSupply = () => {
      setEditingSupply(null);
      const defaultSubject = (currentUser?.role === 'teacher' && currentUser?.subject) 
          ? currentUser.subject 
          : 'Mathématiques';
      setSupplyItemsList([
          {
              id: `row-${Date.now()}`,
              subject: defaultSubject,
              item: '',
              quantity: 1,
              isMandatory: true,
              notes: '',
              image: ''
          }
      ]);
      setShowSupplyModal(true);
  };

  const handleOpenEditSupply = (supply: SchoolSupply) => {
      setEditingSupply(supply);
      setSupplyItemsList([
          {
              id: supply.id,
              subject: supply.subject,
              item: supply.item,
              quantity: supply.quantity,
              isMandatory: supply.isMandatory,
              notes: supply.notes || '',
              image: supply.image || ''
          }
      ]);
      setShowSupplyModal(true);
  };

  const handleAddSupplyRow = () => {
      const defaultSubject = (currentUser?.role === 'teacher' && currentUser?.subject) 
          ? currentUser.subject 
          : (supplyItemsList.length > 0 ? supplyItemsList[supplyItemsList.length - 1].subject : 'Mathématiques');
      setSupplyItemsList(prev => [
          ...prev,
          {
              id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              subject: defaultSubject,
              item: '',
              quantity: 1,
              isMandatory: true,
              notes: '',
              image: ''
          }
      ]);
  };

  const handleRemoveSupplyRow = (index: number) => {
      if (supplyItemsList.length <= 1) return;
      setSupplyItemsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateSupplyRow = (index: number, field: string, value: any) => {
      setSupplyItemsList(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
          const compressed = await compressImage(file, 900, 900, 0.75);
          handleUpdateSupplyRow(index, 'image', compressed);
      } catch (err: any) {
          alert(err?.message || "Erreur lors de la compression de la photo.");
      }
  };

  const handleRemoveImage = (index: number) => {
      handleUpdateSupplyRow(index, 'image', '');
  };

  const handleSaveSupply = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedClass) return;

      const validRows = supplyItemsList.filter(row => row.item.trim() !== '');
      if (validRows.length === 0) return;

      let updatedList: SchoolSupply[];
      if (editingSupply) {
          const updatedFirst = {
              ...editingSupply,
              subject: cleanUtf8(validRows[0].subject),
              item: cleanUtf8(validRows[0].item),
              quantity: Number(validRows[0].quantity) || 1,
              isMandatory: validRows[0].isMandatory,
              notes: cleanUtf8(validRows[0].notes),
              image: validRows[0].image || undefined
          };
          const additionalNew = validRows.slice(1).map(row => ({
              id: `supply_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
              className: selectedClass.name,
              subject: cleanUtf8(row.subject),
              item: cleanUtf8(row.item),
              quantity: Number(row.quantity) || 1,
              isMandatory: row.isMandatory,
              notes: cleanUtf8(row.notes),
              image: row.image || undefined
          }));
          updatedList = classSupplies.map(item => item.id === editingSupply.id ? updatedFirst : item).concat(additionalNew);
      } else {
          const newSupplies: SchoolSupply[] = validRows.map(row => ({
              id: `supply_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
              className: selectedClass.name,
              subject: cleanUtf8(row.subject),
              item: cleanUtf8(row.item),
              quantity: Number(row.quantity) || 1,
              isMandatory: row.isMandatory,
              notes: cleanUtf8(row.notes),
              image: row.image || undefined
          }));
          updatedList = [...classSupplies, ...newSupplies];
      }

      setClassSupplies(updatedList);
      saveSuppliesForClass(selectedClass.name, updatedList);

      // Also persist to school_exercises_db so student dashboard exercises modal sees it immediately
      validRows.forEach(row => {
          saveExerciseToClass({
              id: `ex-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              className: cleanUtf8(selectedClass.name),
              subject: cleanUtf8(row.subject) || 'Exercices Communs',
              title: cleanUtf8(row.item),
              description: cleanUtf8(row.notes || 'Consignes du professeur : traiter les questions et préparer la restitution.'),
              teacherName: (currentUser?.role === 'teacher' && currentUser?.name) ? currentUser.name : 'Professeur',
              dueDate: 'À rendre sous peu',
              type: row.isMandatory ? 'Devoir Maison' : 'Exercice de cours',
              isMandatory: row.isMandatory,
              points: 20,
              imageUrl: row.image || undefined,
              createdAt: new Date().toISOString()
          });
      });

      setShowSupplyModal(false);
  };

  const handleDeleteSupply = (id: string) => {
      if (!selectedClass) return;
      const updatedList = classSupplies.filter(item => item.id !== id);
      setClassSupplies(updatedList);
      saveSuppliesForClass(selectedClass.name, updatedList);
      deleteExerciseFromClass(id, selectedClass.name);
  };

  // Reset mobile day index when switching tabs or classes, and keep restrictedClass selected
  useEffect(() => {
     setMobileDayIndex(0);
  }, [selectedClass, activeTab]);

  useEffect(() => {
      if (restrictedClass) {
          const cls = displayedClasses.find(c => c.name === restrictedClass) || displayedClasses[0];
          setSelectedClass(cls);
      }
  }, [restrictedClass, displayedClasses]);

  // Logic to combine Real students with Filler students
  const displayedStudents = useMemo(() => {
    if (!selectedClass) return [];

    const studentsSource = allStudents || []; 
    let realStudents = studentsSource.filter(s => {
      if (!s.class) return false;
      const c = s.class.toLowerCase().trim();
      return isSameClass(s.class, selectedClass.name) || 
             isSameClass(s.class, selectedClass.code) ||
             c === 'terminale d1' || 
             c === 'tle d1' || 
             c === 'tle d 1' ||
             c.includes('terminale d1') ||
             c.includes('tle d1');
    });

    if (currentUser?.role === 'parent') {
      const myChildrenInClass = getParentChildren(currentUser, allStudents).filter(
        c => c.class === selectedClass.name || c.class === selectedClass.code
      );
      const combined = [...realStudents];
      myChildrenInClass.forEach(mc => {
        if (!combined.some(s => s.id === mc.id || (s.studentId && mc.studentId && s.studentId.toLowerCase() === mc.studentId.toLowerCase()) || s.name.toLowerCase() === mc.name.toLowerCase())) {
          combined.push(mc);
        }
      });
      realStudents = combined;
    }

    if (!searchTerm.trim()) return realStudents;

    const term = searchTerm.toLowerCase();
    return realStudents.filter(s => 
      s.name.toLowerCase().includes(term) || 
      (s.studentId && s.studentId.toLowerCase().includes(term))
    );
  }, [selectedClass, allStudents, searchTerm, currentUser]);

  // Handlers for Schedule
  const handleCellClick = (dayIndex: number, timeIndex: number) => {
      const isBreak = timeIndex === 3 || timeIndex === 7;
      if (isBreak) return;
      
      const isOccupied = scheduleEvents.some(e => e.day === dayIndex && timeIndex >= e.start && timeIndex < e.start + e.duration);
      if (isOccupied) return;

      setEditingEventId(null);
      const defaultSub = getSubjectsForClass(selectedClass ? selectedClass.name : ROOMS[0])[0];
      setFormData({
          day: dayIndex,
          start: timeIndex,
          duration: 1,
          title: defaultSub,
          room: ROOMS[0],
          color: getSubjectColor(defaultSub),
          customTime: ''
      });
      setIsModalOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, event: any) => {
      e.stopPropagation();

      setEditingEventId(event.id);
      setFormData({
          day: event.day,
          start: event.start,
          duration: event.duration,
          title: event.title,
          room: event.room,
          color: event.color,
          customTime: event.customTime || ''
      });
      setIsModalOpen(true);
  };

  const handleSaveSchedule = () => {
      if (editingEventId) {
          setScheduleEvents(prev => prev.map(ev => ev.id === editingEventId ? { ...ev, ...formData } : ev));
      } else {
          setScheduleEvents(prev => [...prev, { ...formData, id: Date.now().toString() }]);
      }
      setIsModalOpen(false);
  };

  const handleDeleteSchedule = () => {
      if (editingEventId) {
          setScheduleEvents(prev => prev.filter(ev => ev.id !== editingEventId));
          setIsModalOpen(false);
      }
  };

  const handleSubjectChange = (newSubject: string) => {
      setFormData({
          ...formData,
          title: newSubject,
          color: getSubjectColor(newSubject)
      });
  };


  const renderContent = () => {
  if (selectedClass) {
    return (
        <div className="flex flex-col min-h-full animate-in fade-in duration-300 relative z-10 bg-[#BFDBFE] md:bg-white pt-12 md:pt-8">
            {/* Header Detail View */}
            <div className="flex flex-col gap-6 mb-8 shrink-0 px-6 md:px-8">
                {/* Desktop Back Button */}
                <button 
                    onClick={() => { if (onNavigate) onNavigate('dashboard'); else window.history.back(); }}
                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 text-gray-700 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-200 transition-all w-fit font-bold text-sm ml-[2px] mt-3 cursor-pointer"
                >
                    <ArrowLeft size={18} />
                    <span>Retour à Terminale-D</span>
                </button>

                {/* Mobile App Bar */}
                <div className="md:hidden flex flex-col gap-4 w-full">
                    <div className="flex justify-between items-center w-full gap-2 min-w-0">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <button 
                                onClick={() => { if (onNavigate) onNavigate('dashboard'); else window.history.back(); }}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-slate-900 transition-colors shrink-0 cursor-pointer active:scale-95"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="flex flex-col min-w-0 flex-1">
                                <h1 className="text-white text-[22px] sm:text-[24px] font-bold tracking-tight leading-tight truncate">
                                    {selectedClass.name}
                                </h1>
                                {mainTeacherOfClass && (
                                    <div className="text-sky-100 text-[11px] sm:text-xs font-semibold mt-0.5 flex items-center gap-1.5 whitespace-nowrap truncate min-w-0">
                                        <span className="truncate">{mainTeacherOfClass.name}</span>
                                        <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-full text-[10px] border border-white/30 backdrop-blur-md shrink-0">
                                            (Professeur Principal)
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-sky-100">
                                <span className="block text-base font-black text-sky-600 leading-none">{displayedStudents.length}</span>
                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Élèves</span>
                            </div>
                        </div>
                    </div>
                    {/* Mobile Search Bar */}
                    <div className="relative w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher un élève..."
                            className="w-full bg-white border border-gray-200 focus:border-sky-500 rounded-full py-2 pl-10 pr-8 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all shadow-sm"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Desktop Header */}
                <div className="hidden md:flex justify-between items-center gap-6 w-full">
                    <div>
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                             <div className={`w-3 h-3 rounded-full ${selectedClass.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
                             <span className="text-slate-600 md:text-gray-400 font-medium uppercase tracking-wider text-sm">{selectedClass.code}</span>
                             {mainTeacherOfClass && (
                                 <span className="bg-sky-100 text-sky-800 text-xs font-bold px-3 py-1 rounded-full border border-sky-200 flex items-center gap-1.5 shadow-2xs">
                                     <GraduationCap size={14} className="text-sky-600" />
                                     <span>{mainTeacherOfClass.name}</span>
                                     <span className="text-sky-900 font-black">(Professeur Principal)</span>
                                 </span>
                             )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 md:text-gray-800">{selectedClass.name}</h1>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <div className="relative w-64 lg:w-80">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher un élève, matricule..."
                                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-sky-500 rounded-full py-2.5 pl-10 pr-8 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all shadow-sm"
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Schedule / Supplies Add Button or Student Count */}
                        {activeTab === 'schedule' && canEditSchedule ? (
                            <button 
                                onClick={() => {
                                    setEditingEventId(null);
                                    const defaultSub = getSubjectsForClass(selectedClass ? selectedClass.name : ROOMS[0])[0];
                                    setFormData({ day: 0, start: 0, duration: 1, title: defaultSub, room: ROOMS[0], color: getSubjectColor(defaultSub) });
                                    setIsModalOpen(true);
                                }}
                                className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2.5 rounded-full font-bold hover:bg-sky-700 transition-colors shadow-md shadow-sky-100 text-sm shrink-0"
                            >
                                <Plus size={18} />
                                <span>Ajouter Cours</span>
                            </button>
                        ) : activeTab === 'supplies' && canEditSupplies ? (
                            <button 
                                onClick={handleOpenAddSupply}
                                className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2.5 rounded-full font-bold hover:bg-sky-700 transition-colors shadow-md shadow-sky-100 text-sm shrink-0"
                            >
                                <Plus size={18} />
                                <span>Ajouter Exercice</span>
                            </button>
                        ) : (
                            <div className="flex items-center gap-3 bg-sky-50 border border-sky-100/80 px-4 py-2 rounded-2xl shrink-0 shadow-sm">
                                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600">
                                    <Users size={20} />
                                </div>
                                <div className="text-left">
                                    <span className="block text-2xl font-black text-sky-600 leading-none">{displayedStudents.length}</span>
                                    <span className="text-[11px] text-sky-700/80 font-bold uppercase tracking-wider">Élèves</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tabs - Scrollable on mobile */}
                <div className="overflow-x-auto pb-2">
                    <div className="flex items-center gap-3 min-w-max px-2 md:px-0">
                        <button 
                            onClick={() => setActiveTab('students')}
                            className={`px-5 py-2 font-semibold text-sm transition-all rounded-full border ${activeTab === 'students' ? 'border-sky-600 text-sky-600 bg-sky-50/80 shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-800'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Users size={18} />
                                Liste des Élèves
                            </div>
                        </button>
                        <button 
                            onClick={() => setActiveTab('principal')}
                            className={`px-5 py-2 font-semibold text-sm transition-all rounded-full border ${activeTab === 'principal' ? 'border-sky-600 text-sky-600 bg-sky-50/80 shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-800'}`}
                        >
                            <div className="flex items-center gap-2">
                                <GraduationCap size={18} />
                                Professeur Principal
                            </div>
                        </button>
                        <button 
                            onClick={() => setActiveTab('schedule')}
                            className={`px-5 py-2 font-semibold text-sm transition-all rounded-full border ${activeTab === 'schedule' ? 'border-sky-600 text-sky-600 bg-sky-50/80 shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-800'}`}
                        >
                            <div className="flex items-center gap-2">
                                <Calendar size={18} />
                                Emploi du temps
                            </div>
                        </button>
                        <button 
                            onClick={() => setActiveTab('supplies')}
                            className={`px-5 py-2 font-semibold text-sm transition-all rounded-full border ${activeTab === 'supplies' ? 'border-sky-600 text-sky-600 bg-sky-50/80 shadow-sm' : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-800'}`}
                        >
                            <div className="flex items-center gap-2">
                                <FileText size={18} />
                                Exercices
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <div className={`flex-1 md:bg-white bg-white md:rounded-none rounded-t-[40px] md:px-8 md:pt-0 shadow-2xl md:shadow-none border-t border-white/50 relative md:border-none custom-scrollbar px-4 md:px-0 pt-4 pb-24 overflow-y-auto block`}>
            {/* Tab Content */}
            <div className="flex-1 pb-12">
                
                {/* STUDENTS TAB */}
                {activeTab === 'students' && (
                    <div className="overflow-hidden md:overflow-x-auto">
                        <table className="w-full md:min-w-[600px]">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Nom & Prénom</th>
                                        <th className="px-4 sm:px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Matricule</th>
                                        <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date de Naissance</th>
                                        <th className="hidden md:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                                        <th className="hidden md:table-cell px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {displayedStudents.map((student: Student) => {
                                        const isLevel1 = currentUser?.accessLevel === 1 || currentUser?.role === 'student' || currentUser?.role === 'parent';
                                        const isSelfOrChild = isLevel1 && (() => {
                                            if (currentUser?.role === 'parent') {
                                                return isParentChild(currentUser, student, allStudents);
                                            }
                                            if (currentUser?.matricule && student.studentId && (
                                                student.studentId === currentUser.matricule ||
                                                student.studentId.includes(currentUser.matricule) ||
                                                currentUser.matricule.includes(student.studentId)
                                            )) return true;
                                            if (!currentUser?.name || !student.name) return false;
                                            const currentNameClean = currentUser.name.trim().toLowerCase();
                                            const studentNameClean = student.name.trim().toLowerCase();
                                            if (currentNameClean === studentNameClean ||
                                                studentNameClean.includes(currentNameClean) ||
                                                currentNameClean.includes(studentNameClean)) return true;
                                            const currentWords = currentNameClean.split(/\s+/).filter(w => w.length >= 2);
                                            const studentWords = studentNameClean.split(/\s+/).filter(w => w.length >= 2);
                                            return currentWords.some(cw => studentWords.some(sw => sw === cw || sw.includes(cw) || cw.includes(sw)));
                                        })();
                                        const isGrayedOut = isLevel1 && !isSelfOrChild;
                                        
                                        return (
                                        <tr key={student.id} 
                                            onClick={() => {
                                                if (window.innerWidth < 768) {
                                                    setSelectedMobileStudent(student);
                                                }
                                            }}
                                            className={`transition-colors group md:cursor-default cursor-pointer ${isGrayedOut ? 'opacity-50 grayscale hover:bg-transparent pointer-events-none' : 'hover:bg-gray-50'}`}>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                                                        <img src={student.photoUrl} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="text-sm font-semibold text-gray-900">{student.name}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                                {student.studentId}
                                            </td>
                                            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {student.birthDate}
                                            </td>
                                            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                        Actif
                                                    </span>
                                                    {student.assignedStatus === 'non_affecte' ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                            Non affecté
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                                                            Affecté
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {(() => {
                                                    if (!isLevel1 || isSelfOrChild) {
                                                        return (
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (onAnalyzeStudent) onAnalyzeStudent(student);
                                                                }}
                                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-600 rounded-lg hover:bg-sky-600 hover:text-white transition-all font-semibold text-xs opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                                            >
                                                                <BarChart2 size={14} />
                                                                Analyser l'élève
                                                            </button>
                                                        );
                                                    }
                                                    return (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-400 select-none">
                                                            Lecture seule
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                        </tr>
                                    );
                                    })}
                                </tbody>
                            </table>
                        </div>
                )}

                {/* PROFESSEUR PRINCIPAL TAB */}
                {activeTab === 'principal' && (
                    <div className="py-4">
                        {mainTeacherOfClass ? (
                            <div className="max-w-xl mx-auto">
                                <div className="bg-gradient-to-br from-white via-sky-50/30 to-white p-6 md:p-8 rounded-[2.5rem] shadow-lg border border-sky-100/80 relative overflow-hidden flex flex-col items-center text-center space-y-5">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-sky-400/10 rounded-full blur-3xl pointer-events-none"></div>
                                    
                                    <div className="relative">
                                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden shadow-xl ring-4 ring-white">
                                            <img src={mainTeacherOfClass.photo} alt={mainTeacherOfClass.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-sky-500 text-white p-2 rounded-2xl shadow-md border-2 border-white">
                                            <GraduationCap size={18} />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="inline-flex items-center gap-1.5 bg-sky-100 text-sky-800 text-xs font-black px-3.5 py-1 rounded-full border border-sky-200/80 uppercase tracking-wider mb-2">
                                            <GraduationCap size={14} className="text-sky-600" />
                                            Professeur Principal
                                        </span>
                                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">{mainTeacherOfClass.name}</h2>
                                        <p className="text-sm font-bold text-sky-600 bg-sky-50 inline-block px-3.5 py-1 rounded-xl border border-sky-100/80">
                                            {mainTeacherOfClass.subject || 'Enseignant'}
                                        </p>
                                    </div>

                                    <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-sm text-slate-600">
                                        <div className="flex items-center justify-center gap-2">
                                            <Mail size={16} className="text-sky-500 shrink-0" />
                                            <span className="font-semibold text-slate-800 truncate">
                                                {mainTeacherOfClass.email || `${mainTeacherOfClass.name.toLowerCase().replace(/\s+/g, '.')}@ecole.com`}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2">
                                            <Phone size={16} className="text-sky-500 shrink-0" />
                                            <span className="font-semibold text-slate-800">
                                                {mainTeacherOfClass.phone || '+229 97 00 00 00'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 w-full pt-2">
                                        <button
                                            onClick={() => setTeacherToCall(mainTeacherOfClass)}
                                            className="w-full py-3.5 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-bold rounded-2xl shadow-md shadow-sky-500/20 flex items-center justify-center gap-2 transition-all text-sm cursor-pointer"
                                        >
                                            <Phone size={18} fill="currentColor" />
                                            <span>Appel</span>
                                        </button>
                                        <button
                                            onClick={() => handleOpenWhatsApp(mainTeacherOfClass)}
                                            className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] active:scale-95 text-white font-bold rounded-2xl shadow-md shadow-[#25D366]/20 flex items-center justify-center gap-2 transition-all text-sm cursor-pointer"
                                            title="Contacter sur WhatsApp"
                                        >
                                            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                            </svg>
                                            <span>WhatsApp</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-md mx-auto text-center py-12 px-6 bg-slate-50/80 border border-slate-200/80 rounded-[2.5rem] space-y-4">
                                <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                                    <GraduationCap size={32} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">Aucun Professeur Principal</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Aucun enseignant n'a été désigné comme professeur principal pour la classe <span className="font-semibold text-slate-700">{selectedClass.name}</span>.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}



                {/* SCHEDULE TAB */}
            {activeTab === 'schedule' && (
                <div className="md:bg-white md:rounded-3xl md:p-6 md:shadow-sm md:border md:border-slate-100 md:min-h-[600px] w-full relative">
                    <SchedulePage 
                        restrictedClass={selectedClass.name} 
                        readOnly={readOnly} 
                        currentUser={currentUser} 
                        teachers={allTeachersList} 
                        onClose={() => setActiveTab('students')}
                    />
                </div>
            )}

                {/* SUPPLIES TAB */}
                {activeTab === 'supplies' && (
                    <div className="space-y-6">
                        {/* Banner */}
                        <div className="p-5 sm:p-6 bg-[#CCE2FE] rounded-[2rem] shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 overflow-hidden">
                            <div className="min-w-0 flex-1 w-full">
                                <span className="inline-block bg-white/60 text-sky-900 text-xs font-bold px-3 py-1 rounded-full mb-2 backdrop-blur-md">
                                    Classe : {selectedClass.name}
                                </span>
                                <h2 className="text-lg sm:text-2xl font-black text-sky-950 flex items-center gap-2 leading-tight break-words">
                                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-sky-700 shrink-0" />
                                    <span className="break-words">Liste des Exercices</span>
                                </h2>
                                <p className="text-xs text-sky-800 mt-1.5 max-w-xl leading-relaxed break-words">
                                    Gérez la liste des exercices et devoirs par matière. Les élèves de cette classe verront cette liste directement sur leur tableau de bord.
                                </p>
                            </div>
                            
                            {canEditSupplies && (
                                <button
                                    onClick={handleOpenAddSupply}
                                    className="w-full sm:w-auto bg-white text-sky-700 hover:bg-sky-50 font-extrabold px-5 py-3 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 text-sm active:scale-95"
                                >
                                    <Plus size={18} />
                                    <span>Ajouter un exercice</span>
                                </button>
                            )}
                        </div>

                        {/* Supplies List Grouped */}
                        {classSupplies.length === 0 ? (
                            <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-gray-100">
                                <div className="w-16 h-16 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FileText size={32} />
                                </div>
                                <h3 className="font-bold text-gray-800 text-lg">Aucun exercice configuré</h3>
                                <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto mb-6">
                                    {canEditSupplies ? (
                                        <>Cliquez sur "Ajouter un exercice" pour constituer la liste d'exercices pour la classe <span className="font-semibold text-gray-700">{selectedClass.name}</span>.</>
                                    ) : (
                                        <>Aucun exercice n'a encore été enregistré pour la classe <span className="font-semibold text-gray-700">{selectedClass.name}</span>.</>
                                    )}
                                </p>
                                {canEditSupplies && (
                                    <button
                                        onClick={handleOpenAddSupply}
                                        className="bg-sky-600 text-white font-bold px-6 py-2.5 rounded-full hover:bg-sky-700 transition-colors text-sm inline-flex items-center gap-2"
                                    >
                                        <Plus size={16} />
                                        <span>Créer le premier exercice</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {classSupplies.map((supply) => (
                                    <div 
                                        key={supply.id} 
                                        className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 hover:border-sky-200 transition-all flex flex-col justify-between group"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                                                    {supply.subject || 'Exercices Communs'}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <span className="bg-sky-100 text-sky-800 font-extrabold text-xs px-2.5 py-0.5 rounded-md">
                                                        x{supply.quantity}
                                                    </span>
                                                    {supply.isMandatory ? (
                                                        <span className="bg-red-50 text-red-600 border border-red-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                            Obligatoire
                                                        </span>
                                                    ) : (
                                                        <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                            Optionnel
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <h4 className="font-bold text-gray-900 text-base mb-1">
                                                {supply.item}
                                            </h4>

                                            {supply.notes && (
                                                <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-2 bg-gray-50 p-2 rounded-xl">
                                                    <AlertCircle size={14} className="text-sky-500 shrink-0" />
                                                    <span>{supply.notes}</span>
                                                </p>
                                            )}

                                            {supply.image && (
                                                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreviewImageModal({ url: supply.image!, title: `${supply.subject} - ${supply.item}` })}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-xl text-xs font-bold transition-all shadow-2xs group/btn cursor-pointer"
                                                    >
                                                        <div className="w-7 h-7 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-sky-300">
                                                            <img src={supply.image} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <span className="flex items-center gap-1">
                                                            <span>Voir le sujet en photo</span>
                                                            <ZoomIn size={14} className="text-sky-600 group-hover/btn:scale-110 transition-transform" />
                                                        </span>
                                                    </button>
                                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                                                        <Check size={12} />
                                                        <span>Photo jointe</span>
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {canEditSupplies && (
                                            <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-gray-50">
                                                <button
                                                    onClick={() => handleOpenEditSupply(supply)}
                                                    className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                                                >
                                                    <Edit3 size={15} />
                                                    <span>Éditer</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSupply(supply.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
                                                >
                                                    <Trash2 size={15} />
                                                    <span>Supprimer</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

             {/* --- EDIT MODAL --- */}
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    
                    <div className="bg-white rounded-[2rem] w-full max-w-md p-6 relative z-10 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingEventId ? 'Modifier Cours' : 'Ajouter un Cours'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Matière */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Matière</label>
                                <select 
                                    value={formData.title} 
                                    onChange={e => handleSubjectChange(e.target.value)}
                                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 transition-all"
                                >
                                    {(() => {
                                        const c = formData.room || selectedClass?.name || '';
                                        const available = getSubjectsForClass(c);
                                        return available.map(s => <option key={s} value={s} disabled={currentUser?.role === "teacher" && currentUser?.subject && s !== currentUser.subject}>{s}</option>);
                                    })()}
                                </select>
                            </div>

                            {/* Salle */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Salle</label>
                                <select 
                                    value={formData.room} 
                                    onChange={e => setFormData({...formData, room: e.target.value})}
                                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 transition-all"
                                >
                                    {ROOMS.filter(r => {
                                        if (currentUser?.section === 'Primaire') {
                                            return r.startsWith('CP') || r.startsWith('CE') || r.startsWith('CM');
                                        }
                                        return true;
                                    }).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            {/* Jour & Heure */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Jour</label>
                                        <select 
                                            value={formData.day} 
                                            onChange={e => setFormData({...formData, day: parseInt(e.target.value)})}
                                            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 transition-all"
                                        >
                                            {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
                                        </select>
                                </div>
                                <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Début</label>
                                        <select 
                                            value={formData.start} 
                                            onChange={e => setFormData({...formData, start: parseInt(e.target.value)})}
                                            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 transition-all"
                                        >
                                            {timeSlots.map((t, i) => <option key={i} value={i}>{t}</option>)}
                                        </select>
                                </div>
                            </div>

                            {/* Durée Slider/Select */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Durée: {formData.duration}h</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4].map(h => (
                                        <button
                                            key={h}
                                            onClick={() => setFormData({...formData, duration: h})}
                                            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                                                formData.duration === h 
                                                ? 'bg-sky-600 text-white shadow-md' 
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                        >
                                            {h}h
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            {editingEventId && (
                                <button 
                                    onClick={handleDeleteSchedule}
                                    className="px-4 py-3 bg-sky-50 text-sky-600 rounded-xl font-bold hover:bg-sky-100 transition-colors flex items-center justify-center"
                                    title="Supprimer"
                                >
                                    <Trash2 size={20} />
                                </button>
                            )}
                            
                            <button 
                                onClick={handleSaveSchedule}
                                className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 shadow-lg shadow-sky-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <Save size={18} />
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- SUPPLY ADD/EDIT MODAL --- */}
            <AnimatePresence>
                {showSupplyModal && (
                    <div className="fixed inset-0 z-[120] flex flex-col justify-end md:justify-center items-center">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSupplyModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />

                        {/* Modal Container */}
                        <motion.div 
                            initial={{ y: "100%", opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: "100%", opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 220 }}
                            className="bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] shadow-2xl relative z-10 flex flex-col overflow-hidden border-t md:border border-slate-100"
                        >
                            {/* Top Handle for mobile */}
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-3 mb-1 md:hidden shrink-0" />

                            {/* Header */}
                            <div className="p-4 sm:p-6 pb-4 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2.5 bg-sky-50 text-sky-600 rounded-2xl shrink-0">
                                        <FileText size={22} />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-base sm:text-xl font-extrabold text-slate-900 truncate">
                                            {editingSupply ? 'Modifier l\'exercice' : 'Ajouter des exercices'}
                                        </h2>
                                        <p className="text-xs text-slate-500 truncate">Pour la classe <span className="font-semibold text-slate-700">{selectedClass?.name}</span></p>
                                    </div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setShowSupplyModal(false)} 
                                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors shrink-0 ml-2"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Form & Scrollable Content */}
                            <form onSubmit={handleSaveSupply} className="flex flex-col min-h-0 flex-1">
                                <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
                                    {supplyItemsList.map((row, index) => (
                                        <div 
                                            key={row.id} 
                                            className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 space-y-3"
                                        >
                                            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                                                <span className="text-xs font-black text-sky-800 bg-sky-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                                                    <Package size={14} />
                                                    Section / Matériel #{index + 1}
                                                </span>

                                                {supplyItemsList.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveSupplyRow(index)}
                                                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition-colors text-xs font-semibold flex items-center gap-1"
                                                        title="Supprimer cet article"
                                                    >
                                                        <Trash2 size={15} />
                                                        <span>Retirer</span>
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {/* Matière */}
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1 ml-1 flex items-center gap-1">
                                                        <BookOpen size={13} className="text-sky-600" />
                                                        <span>Matière / Discipline</span>
                                                    </label>
                                                    <CustomSubjectSelect 
                                                        value={row.subject} 
                                                        onChange={val => handleUpdateSupplyRow(index, 'subject', val)} 
                                                        className={selectedClass?.name}
                                                    />
                                                </div>

                                                {/* Nom de l'exercice */}
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1 ml-1 flex items-center gap-1">
                                                        <FileText size={13} className="text-sky-600" />
                                                        <span>Désignation de l'exercice *</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Ex: Exercice 1 p. 45, Devoir maison..."
                                                        value={row.item}
                                                        onChange={e => handleUpdateSupplyRow(index, 'item', e.target.value)}
                                                        className="w-full bg-white border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 rounded-xl px-3.5 py-2.5 outline-none font-semibold text-slate-800 text-sm transition-all shadow-sm"
                                                    />
                                                </div>
                                            </div>

                                            {/* Quantité & Exigence */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Quantité requise</label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max="20"
                                                        required
                                                        value={row.quantity}
                                                        onChange={e => handleUpdateSupplyRow(index, 'quantity', parseInt(e.target.value) || 1)}
                                                        className="w-full bg-white border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 rounded-xl px-3.5 py-2.5 outline-none font-bold text-slate-800 text-sm transition-all shadow-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1 ml-1">Exigence</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateSupplyRow(index, 'isMandatory', true)}
                                                            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                                                row.isMandatory
                                                                    ? 'bg-rose-500 text-white shadow-md shadow-rose-200 ring-2 ring-rose-400'
                                                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <AlertCircle size={14} />
                                                            <span>Obligatoire</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUpdateSupplyRow(index, 'isMandatory', false)}
                                                            className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                                                !row.isMandatory
                                                                    ? 'bg-sky-600 text-white shadow-md shadow-sky-200 ring-2 ring-sky-400'
                                                                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                                            }`}
                                                        >
                                                            <Sparkles size={14} />
                                                            <span>Optionnel</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notes */}
                                            <div>
                                                <label className="block text-xs font-bold text-slate-600 mb-1 ml-1">Remarques / Précisions (Optionnel)</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex: Couverture jaune plastifiée, Marque Casio..."
                                                    value={row.notes}
                                                    onChange={e => handleUpdateSupplyRow(index, 'notes', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 focus:border-sky-500 rounded-xl px-3.5 py-2.5 outline-none font-medium text-slate-800 text-sm transition-all"
                                                />
                                            </div>

                                            {/* Photo de l'exercice (Scan / Énoncé / Feuille) */}
                                            <div className="pt-2 border-t border-slate-200/60">
                                                <div className="flex items-center justify-between mb-1.5 ml-1">
                                                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                        <Camera size={14} className="text-sky-600" />
                                                        <span>Photo ou scan de l'exercice (Optionnel)</span>
                                                    </label>
                                                    {row.image && (
                                                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                                                            <Check size={13} />
                                                            <span>Photo attachée</span>
                                                        </span>
                                                    )}
                                                </div>

                                                {row.image ? (
                                                    <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-sky-200 shadow-2xs">
                                                        <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200">
                                                            <img 
                                                                src={row.image} 
                                                                alt="Aperçu sujet" 
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-slate-800 truncate">Photo de l'énoncé enregistrée</p>
                                                            <p className="text-[11px] text-slate-400">Visible par les élèves de la classe</p>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            <button
                                                                type="button"
                                                                onClick={() => setPreviewImageModal({ url: row.image!, title: row.item || 'Sujet d\'exercice' })}
                                                                className="p-2 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors cursor-pointer"
                                                                title="Agrandir la photo"
                                                            >
                                                                <ZoomIn size={16} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveImage(index)}
                                                                className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                                                                title="Supprimer la photo"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap items-center gap-3">
                                                        <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-dashed border-sky-300 hover:border-sky-500 hover:bg-sky-50/50 rounded-xl cursor-pointer text-xs font-bold text-sky-700 transition-all shadow-2xs active:scale-98">
                                                            <Camera size={16} className="text-sky-600" />
                                                            <span>Prendre en photo / Joindre l'image</span>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                capture="environment"
                                                                onChange={e => handleImageUpload(index, e)}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                        <span className="text-[11px] text-slate-400">
                                                            Photo de la feuille ou du manuel
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add another supply item button */}
                                    {!editingSupply && (
                                        <button
                                            type="button"
                                            onClick={handleAddSupplyRow}
                                            className="w-full py-3 px-4 border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/60 hover:bg-sky-50 text-sky-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm active:scale-[0.99]"
                                        >
                                            <Plus size={18} />
                                            <span>Ajouter un autre exercice</span>
                                        </button>
                                    )}
                                </div>

                                {/* Sticky Footer */}
                                <div className="p-4 sm:p-5 bg-white border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setShowSupplyModal(false)}
                                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-sky-200 flex items-center gap-2 active:scale-95"
                                    >
                                        <Save size={16} />
                                        <span>
                                            {editingSupply 
                                                ? 'Enregistrer' 
                                                : `Enregistrer (${supplyItemsList.length})`}
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Full-screen Photo Lightbox Modal */}
            {previewImageModal && (
                <div 
                    className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none"
                    onClick={() => setPreviewImageModal(null)}
                >
                    <div 
                        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-2 min-w-0">
                                <ImageIcon size={18} className="text-sky-600 shrink-0" />
                                <h3 className="font-extrabold text-slate-800 text-sm truncate">
                                    {previewImageModal.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setPreviewImageModal(null)}
                                className="p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 transition-colors shrink-0 ml-2 cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-3 bg-slate-950 flex items-center justify-center overflow-auto max-h-[75vh]">
                            <img
                                src={previewImageModal.url}
                                alt={previewImageModal.title}
                                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
                            />
                        </div>
                        <div className="p-3 text-center bg-slate-50 border-t border-slate-100 text-xs text-slate-500 font-medium">
                            Photo ou scan de l'exercice pour la classe
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 relative z-10 bg-[#BFDBFE]  pt-12 md:pt-8">
             
        {/* Mobile App Bar */}
        {showMobileSearch ? (
            <div className="md:hidden flex items-center gap-2 mb-8 px-6 shrink-0 w-full animate-in fade-in duration-200">
                <div className="flex-1 flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/40 px-4 py-2 rounded-2xl text-white">
                    <Search className="text-white shrink-0" size={18} />
                    <input
                        type="text"
                        autoFocus
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher une classe..."
                        className="bg-transparent border-none outline-none text-white placeholder-white/70 text-sm font-medium w-full"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="p-1 text-white/80 hover:text-white">
                            <X size={16} />
                        </button>
                    )}
                </div>
                <button 
                    onClick={() => { setShowMobileSearch(false); setSearchTerm(''); }}
                    className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/50 text-slate-900 shrink-0"
                >
                    <X size={20} />
                </button>
            </div>
        ) : (
            <div className="md:hidden flex justify-between items-center mb-8 px-6 shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                    {onNavigate && (
                        <button 
                            onClick={() => onNavigate('dashboard')}
                            title="Retour à Terminale-D"
                            className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/50 hover:bg-white/60 text-slate-900 transition-colors shrink-0 active:scale-95"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    )}
                    <h1 className="text-white text-[28px] font-bold tracking-tight truncate">Classes</h1>
                </div>
                <div className="flex space-x-3">
                   <button 
                       onClick={() => setShowMobileSearch(true)}
                       className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/50 hover:bg-white/60 transition-colors"
                   >
                      <Search className="w-5 h-5 text-slate-900" strokeWidth={2} />
                   </button>
                   <button className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/50 hover:bg-white/60 transition-colors">
                      <BookOpen className="w-5 h-5 text-slate-900" strokeWidth={2} />
                   </button>
                </div>
            </div>
        )}

        {/* Desktop App Bar */}
        <div className="hidden md:flex justify-between items-center mt-5 mb-8 px-8 shrink-0">
            <div className="flex items-center gap-4">
                {onNavigate && (
                    <button 
                        onClick={() => onNavigate('dashboard')}
                        title="Retour à Terminale-D"
                        className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/50 hover:bg-white/60 text-slate-900 transition-colors shrink-0 cursor-pointer active:scale-95"
                    >
                        <ArrowLeft size={20} />
                    </button>
                )}
                <div>
                    <h1 className="text-white text-[28px] font-bold tracking-tight">Classes</h1>
                    <p className="text-white/70 text-sm mt-1">Gestion des classes et emplois du temps</p>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-xl border border-white/30 w-full md:w-96 text-white">
                  <Search className="text-white shrink-0" size={20} />
                  <input 
                    type="text" 
                    placeholder="Rechercher une classe..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-white placeholder-white/70 font-medium w-full"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="p-1 text-white/80 hover:text-white">
                        <X size={16} />
                    </button>
                  )}
                </div>
                <button className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/50 hover:bg-white/60 transition-colors">
                    <BookOpen className="w-5 h-5 text-slate-900" strokeWidth={2} />
                </button>
            </div>
        </div>

        {/* Section Tabs */}
        {!selectedClass && (
            <div className="flex items-center gap-2 px-6 md:px-8 mb-6 overflow-x-auto no-scrollbar shrink-0">
                <button 
                    onClick={() => setSelectedSection('Primaire')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${selectedSection === 'Primaire' ? 'bg-white text-sky-700 shadow-sm' : 'bg-white/30 text-white hover:bg-white/40 border border-white/40'}`}
                >
                    Primaire
                </button>
                <button 
                    onClick={() => setSelectedSection('Général')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${selectedSection === 'Général' ? 'bg-white text-sky-700 shadow-sm' : 'bg-white/30 text-white hover:bg-white/40 border border-white/40'}`}
                >
                    Général
                </button>
                <button 
                    onClick={() => setSelectedSection('Technique')}
                    className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${selectedSection === 'Technique' ? 'bg-white text-sky-700 shadow-sm' : 'bg-white/30 text-white hover:bg-white/40 border border-white/40'}`}
                >
                    Technique (Professionnel)
                </button>
            </div>
        )}

        <div className="flex-1 bg-white rounded-t-[40px] px-6 md:px-8 pt-8 overflow-y-auto pb-32 md:pb-24 shadow-2xl relative border-t border-white/50 md:border-none">
            {(() => {
                const filteredClasses = displayedClasses.filter(cls => {
                    const isTeacherOrParent = currentUser?.role === 'teacher' || currentUser?.role === 'parent' || currentUser?.accessLevel === 3;
                    if (!isTeacherOrParent) {
                        const classSection = cls.section || 'Général';
                        if (classSection !== selectedSection) {
                            return false;
                        }
                    }
                    if (!searchTerm.trim()) return true;
                    const term = searchTerm.toLowerCase();
                    return cls.name.toLowerCase().includes(term) || cls.code.toLowerCase().includes(term);
                });

                if (filteredClasses.length === 0) {
                    return (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4">
                                <BookOpen size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 mb-2">Aucune classe trouvée</h3>
                            <p className="text-slate-500 text-sm max-w-xs">
                                {selectedSection !== 'Général' 
                                    ? `Les classes de la section ${selectedSection} ne sont pas encore configurées.`
                                    : "Aucune classe ne correspond à votre recherche."}
                            </p>
                        </div>
                    );
                }

                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClasses.map((cls) => (
                            <div 
                                key={cls.id} 
                                onClick={() => setSelectedClass(cls)}
                                className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 hover:border-sky-100 transition-all cursor-pointer group"
                            >
                                <div className="flex justify-between items-start mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${cls.color} bg-opacity-10 text-opacity-100 font-bold text-lg`}>
                                {cls.code}
                            </div>
                            <button className="text-gray-400 hover:text-gray-600">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-sky-600 transition-colors">{cls.name}</h3>
                        {(() => {
                            const pp = allTeachersList.find((t: any) => t.isPrincipal && t.principalClasses && Array.isArray(t.principalClasses) && t.principalClasses.includes(cls.name));
                            return pp ? (
                                <p className="text-sky-600 text-xs font-bold mb-4 flex items-center gap-1.5">
                                    <GraduationCap size={14} className="text-sky-500 shrink-0" />
                                    <span>PP: {pp.name} <span className="font-semibold text-sky-700">(Professeur Principal)</span></span>
                                </p>
                            ) : (
                                <p className="text-gray-500 text-sm mb-6">{cls.name.split(' ')[0]}</p>
                            );
                        })()}
                        
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Users size={16} />
                                <span className="font-medium">{allStudents.filter(s => s.class === cls.name || s.class === cls.code).length} Élèves</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
                                <ArrowRight size={16} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    })()}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderContent()}

      {/* Call Teacher Bottom Sheet */}
      <AnimatePresence>
        {teacherToCall && (
          <div className="fixed inset-0 z-[500] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTeacherToCall(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-md bg-white rounded-t-[2.5rem] p-6 shadow-2xl border-t border-slate-100 flex flex-col items-center text-center space-y-5"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-1" />
              
              <button 
                onClick={() => setTeacherToCall(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                title="Fermer"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center space-y-2 pt-2">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shadow-md ring-4 ring-slate-50">
                  <img src={teacherToCall.photo} alt={teacherToCall.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{teacherToCall.name}</h3>
                  <p className="text-sm font-semibold text-sky-600">{teacherToCall.subject}</p>
                </div>
              </div>

              <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-center gap-3">
                <Phone className="text-slate-400" size={20} />
                <span className="text-lg font-extrabold text-slate-800 tracking-wider">
                  {teacherToCall.phone || '+229 97 00 00 00'}
                </span>
              </div>

              <a 
                href={`tel:${(teacherToCall.phone || '+229 97 00 00 00').replace(/\s+/g, '')}`}
                className="w-full py-4 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all text-base"
              >
                <Phone size={20} fill="currentColor" />
                <span>Appeler</span>
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Student Details Bottom Sheet */}
      <AnimatePresence>
        {selectedMobileStudent && (
          <div className="fixed inset-0 z-[500] flex items-end justify-center md:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMobileStudent(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full bg-white rounded-t-[2.5rem] p-6 shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0" />
              <button 
                onClick={() => setSelectedMobileStudent(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors shrink-0"
              >
                <X size={18} />
              </button>
              
              <div className="flex flex-col items-center mb-6 shrink-0">
                <div className="w-24 h-24 rounded-3xl bg-gray-200 overflow-hidden shadow-lg border-4 border-white mb-4">
                   <img src={selectedMobileStudent.photoUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 text-center">{selectedMobileStudent.name}</h3>
                <p className="text-sm font-semibold text-sky-600 mt-1">{selectedMobileStudent.studentId}</p>
                <div className="flex items-center gap-2 mt-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Actif
                    </span>
                    {selectedMobileStudent.assignedStatus === 'non_affecte' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            Non affecté
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
                            Affecté
                        </span>
                    )}
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                  <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date de naissance</span>
                          <span className="text-sm font-semibold text-slate-800">{selectedMobileStudent.birthDate}</span>
                      </div>
                      <div className="w-full h-[1px] bg-slate-200/50" />
                      <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Classe</span>
                          <span className="text-sm font-semibold text-slate-800">{selectedClass?.name}</span>
                      </div>
                  </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-auto shrink-0">
                {(() => {
                    const isLevel1 = currentUser?.accessLevel === 1 || currentUser?.role === 'student' || currentUser?.role === 'parent';
                    const isSelfOrChild = currentUser && (
                        (currentUser?.role === 'parent' ? isParentChild(currentUser, selectedMobileStudent, allStudents) : false) ||
                        (currentUser?.matricule && selectedMobileStudent.studentId === currentUser.matricule) ||
                        (currentUser?.name && selectedMobileStudent.name.toLowerCase().includes(currentUser.name.toLowerCase())) ||
                        (currentUser?.name && currentUser.name.toLowerCase().includes(selectedMobileStudent.name.toLowerCase()))
                    );
                    if (!isLevel1 || isSelfOrChild) {
                        return (
                            <button 
                                onClick={() => {
                                    setSelectedMobileStudent(null);
                                    if (onAnalyzeStudent) onAnalyzeStudent(selectedMobileStudent);
                                }}
                                className="w-full py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all text-base"
                            >
                                <BarChart2 size={20} />
                                <span>Analyser l'élève</span>
                            </button>
                        );
                    }
                    return (
                        <div className="w-full py-4 bg-gray-100 text-gray-400 font-bold rounded-2xl flex items-center justify-center gap-3 text-base">
                            <BarChart2 size={20} />
                            <span>Lecture seule</span>
                        </div>
                    );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Email Teacher Bottom Sheet */}
      <AnimatePresence>
        {teacherToEmail && (
          <div className="fixed inset-0 z-[500] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTeacherToEmail(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-md bg-white rounded-t-[2.5rem] p-6 shadow-2xl border-t border-slate-100 flex flex-col items-center text-center space-y-5"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-1" />
              
              <button 
                onClick={() => setTeacherToEmail(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                title="Fermer"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center space-y-2 pt-2">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shadow-md ring-4 ring-slate-50">
                  <img src={teacherToEmail.photo} alt={teacherToEmail.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{teacherToEmail.name}</h3>
                  <p className="text-sm font-semibold text-sky-600">{teacherToEmail.subject}</p>
                </div>
              </div>

              <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-center gap-3">
                <Mail className="text-slate-400 shrink-0" size={20} />
                <span className="text-base font-extrabold text-slate-800 truncate">
                  {teacherToEmail.email || `${teacherToEmail.name.toLowerCase().replace(/\s+/g, '.')}@ecole.com`}
                </span>
              </div>

              <a 
                href={`mailto:${teacherToEmail.email || `${teacherToEmail.name.toLowerCase().replace(/\s+/g, '.')}@ecole.com`}`}
                className="w-full py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all text-base"
              >
                <Mail size={20} />
                <span>Envoyer un e-mail</span>
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
