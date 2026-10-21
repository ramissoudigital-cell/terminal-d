

import React, { useState, useEffect, useMemo } from 'react';
import { SpendsChart } from './SpendsChart';
import { AnalyticsChart } from './AnalyticsChart';
import { CreditCard } from './CreditCard';
import { TransactionList, getSubjectCoef, isSubjectMatch } from './TransactionList';
import { AppreciationCard } from './AppreciationCard';
import { MentionCard } from './MentionCard';
import { ClassResultsCard } from './ClassResultsCard';
import { BilanFinAnneeCard } from './BilanFinAnneeCard';
import { BilanFinAnnee } from './BilanFinAnnee';
import WalletDashboard from './WalletDashboard';
import { StudentSuppliesModal } from './StudentSuppliesModal';
import { StudentCursusModal } from './StudentCursusModal';
import { PrintableBulletin } from './PrintableBulletin';
import { PrintableLivret } from './PrintableLivret';
import { Search, HelpCircle, Clock, CheckCircle, X, AlertOctagon, FileText, Calendar, GraduationCap, TrendingUp, User, Phone, Send, Save, PenLine, Plus, Minus, Smartphone, School, Printer, Share2, Download, XCircle, BookOpen, Trash2, ShoppingBag, ChevronDown, Check, Sparkles, MessageSquare, Bell, Settings } from 'lucide-react';
import { Student, AnalyticsData, getSubjectsForClass } from '../types';
import { getParentChildren, isSameClass } from '../src/utils/parentUtils';
import { checkIsPrincipalForClass, getClassPrincipalTeacherSignature, saveClassPrincipalTeacherSignature, deleteClassPrincipalTeacherSignature } from '../src/utils/teacherUtils';
import { getAutoAppreciation, getAutoDistinctions, getAutoSanctions } from '../src/utils/bulletinUtils';
import { isTechnicalClass, calculateAnnualAverage } from '../src/utils/academicUtils';
import { getDisciplineMarkFromStudent } from '../src/utils/academicUtils';
import { getGradeAppreciations } from '../src/utils/gradeAppreciations';

const SUBJECT_HEX_COLORS: Record<string, string> = {
  'Mathématiques': '#3b82f6',
  'Français': '#a855f7',
  'Anglais': '#f43f5e',
  'Histoire-Geo': '#22d3ee',
  'Hist-Géo': '#22d3ee',
  'Histoire-Géographie': '#22d3ee',
  'Histoire': '#22d3ee',
  'Géographie': '#06b6d4',
  'SVT': '#4ade80',
  'Sciences de la Vie et de la Terre': '#4ade80',
  'Physique-Chimie': '#fbbf24',
  'EPS': '#f472b6',
  'Éducation Physique et Sportive': '#f472b6',
  'Philosophie': '#7c3aed',
  'Informatique': '#475569',
  'Espagnol': '#e11d48',
  'Allemand': '#4b5563',
  'Arts Plastiques': '#ec4899',
  'Musique': '#6366f1',
  'Éducation Musicale': '#6366f1',
  'Devoir': '#14b8a6',
  'Étude': '#14b8a6',
  'EDHC': '#f97316',
  'Sciences et Technologies': '#10b981',
  'Sciences et Technologies (notions de base)': '#10b981',
  'Droit': '#0d9488',
  'Économie Générale': '#0284c7',
  'Technique Administrative et Commerciale': '#d97706',
  'Outils de communication': '#8b5cf6',
  'Expression Professionnelle': '#c026d3',
  'Sténographie': '#059669',
  'Conduite': '#16a34a'
};
import { motion, AnimatePresence } from 'framer-motion';
import { COUNTRIES_DATA } from '../data/countries';
import { mockClasses } from '../data/mockData';

interface DashboardProps {
  preSelectedStudent?: Student | null;
  allStudents?: Student[];
  onUpdateStudent?: (updatedStudent: Student) => void;
  onUpdateAllStudents?: (updatedStudents: Student[]) => void;
  onDeleteStudent?: (studentId: string) => void;
  readOnly?: boolean; // NEW PROP
  onNavigate?: (page: string) => void;
  currentUser?: any;
  selectedTrimester?: string;
  onTrimesterChange?: (trim: string) => void;
  trimesterAverages?: Record<string, Record<string, number>>;
  onSelectStudent?: (student: Student | null) => void;
}

interface GradeItem {
    id: number | string;
    title: string;
    date: string;
    score: number;
    coef: number;
    classAvg: number;
    appreciation?: string;
}

// ... (Helper functions omitted for brevity if not used directly in modified sections) ...


export const Dashboard: React.FC<DashboardProps> = ({ preSelectedStudent, allStudents = [], onUpdateStudent, onUpdateAllStudents, onDeleteStudent, readOnly = false, onNavigate, currentUser, selectedTrimester, onTrimesterChange, trimesterAverages, onSelectStudent }) => {
  const isEducator = currentUser?.role === 'educator' || 
                     currentUser?.role === 'éducateur' || 
                     (currentUser?.accessLevel === 2 && currentUser?.role !== 'director' && currentUser?.role !== 'admin' && currentUser?.role !== 'teacher');
  const isStudentOrParent = currentUser?.role === 'student' || 
                            currentUser?.role === 'élève' || 
                            currentUser?.role === 'eleve' || 
                            currentUser?.role === 'parent' || 
                            currentUser?.accessLevel === 1;
  const userLevel = Number(currentUser?.accessLevel || 0);
  const isTeacherRole = currentUser?.role === 'teacher' || 
                        currentUser?.role === 'professeur' || 
                        currentUser?.role === 'prof' || 
                        currentUser?.role === 'enseignant' || 
                        Boolean(currentUser?.isTeacher);
  const isLevel5 = userLevel === 5 || currentUser?.role === 'admin' || currentUser?.role === 'superadmin' || currentUser?.role === 'fondateur';
  const isLevel1To4 = userLevel >= 1 && userLevel <= 4;

  const canLaunchCloture = !readOnly && isLevel5 && !isLevel1To4 && !isTeacherRole;
  const canEditGrades = !readOnly && !isEducator && !isStudentOrParent;

  const [searchTerm, setSearchTerm] = useState('');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  
  const [selectedTrim, setSelectedTrim] = useState<string>(selectedTrimester || '1er trim');

  useEffect(() => {
    if (selectedTrimester) {
      setSelectedTrim(selectedTrimester);
    }
  }, [selectedTrimester]);

  const handleTrimSelect = (trim: string) => {
    setSelectedTrim(trim);
    if (onTrimesterChange) {
      onTrimesterChange(trim);
    }
  };
  
  // Modals State
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isLivretPrintModalOpen, setIsLivretPrintModalOpen] = useState(false);
  const [isBilanModalOpen, setIsBilanModalOpen] = useState(false);
  const [desktopFloatingMenuOpen, setDesktopFloatingMenuOpen] = useState(false);
  
  // Subject & Grades State
  const [selectedSubject, setSelectedSubject] = useState<AnalyticsData | null>(null);
  const [currentGrades, setCurrentGrades] = useState<GradeItem[]>([]);
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [newGradeForm, setNewGradeForm] = useState({ title: '', score: '', coef: '1', type: 'devoir', interroMax: '20', appreciation: '' });
  const [showGradeTypeDropdown, setShowGradeTypeDropdown] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState<number | string | null>(null);
  const [editGradeForm, setEditGradeForm] = useState({ title: '', score: '' });
  const [gradeToDelete, setGradeToDelete] = useState<number | string | null>(null);
  const [bonusMinusConfig, setBonusMinusConfig] = useState<{
    isOpen: boolean;
    type: 'plus' | 'minus';
    step: 'target' | 'value';
    target: 'moyenne' | 'note';
    value: string;
  }>({ isOpen: false, type: 'plus', step: 'target', target: 'moyenne', value: '1' });
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [showSuppliesModal, setShowSuppliesModal] = useState(false);
  const [showCursusModal, setShowCursusModal] = useState(false);

  // Bulletin Configuration State
  const [selectedAppreciation, setSelectedAppreciation] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string>('BRINDOU OLGA');
  const [isTeacherSigned, setIsTeacherSigned] = useState<boolean>(false);
  const [selectedDistinctions, setSelectedDistinctions] = useState<string[]>([]);
  const [selectedSanctions, setSelectedSanctions] = useState<string[]>([]);
  const [faitA, setFaitA] = useState<string>('ABIDJAN');
  const [faitLe, setFaitLe] = useState<string>('');
  const [directorName, setDirectorName] = useState<string>('M, SEIDOU OUATTARA');
  const [signatureText, setSignatureText] = useState<string>('');
  const [stampImage, setStampImage] = useState<string | null>(null);

  // Student Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
      firstName: '',
      lastName: '',
      gender: 'F' as 'M' | 'F',
      matricule: '',
      dob: '',
      birthCertificateNumber: '',
      birthPlace: '',
      className: '',
      school: 'Collège Faoummaba',
      country: "Côte d'Ivoire",
      nationality: 'Ivoirienne',
      assignedStatus: 'affecte' as 'affecte' | 'non_affecte',
      fatherPhone: '',
      motherPhone: '',
      fatherEmail: '',
      motherEmail: '',
      studentPhone: '',
      tutorPhone: '',
      phone: ''
  });
  const [showMobileSubjects, setShowMobileSubjects] = useState(false);

  useEffect(() => {
    if (currentStudent && onUpdateStudent && !readOnly) {
      const classNameLower = currentStudent.class.toLowerCase();
      const isSenior = classNameLower.includes('première') || classNameLower.includes('premiere') || classNameLower.includes('terminal');
      const hasPhilo = currentStudent.subjects.some(s => s.name.toLowerCase() === 'philosophie');
      
      if (isSenior && !hasPhilo) {
        onUpdateStudent({
          ...currentStudent,
          subjects: [...currentStudent.subjects, { name: 'Philosophie', value: 15, average: 0, fill: '#7c3aed' }]
        });
      }
    }
  }, [currentStudent, onUpdateStudent, readOnly]);

  useEffect(() => {
    if (currentStudent) {
      const classPPInfo = getClassPrincipalTeacherSignature(currentStudent.class);
      const effectiveSig = currentStudent.teacherSignature || classPPInfo.signature;
      const effectiveName = currentStudent.mainTeacherName || classPPInfo.teacherName;

      if (effectiveSig) {
        setIsTeacherSigned(true);
      } else {
        setIsTeacherSigned(false);
      }

      if (effectiveName) {
        setTeacherName(effectiveName);
      } else {
        const teachersList = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
        const classPP = teachersList.find((t: any) => 
          t.isPrincipal && t.principalClasses && (
            Array.isArray(t.principalClasses) 
              ? t.principalClasses.some((c: string) => c.trim().toLowerCase() === currentStudent.class.trim().toLowerCase())
              : t.principalClasses.split(',').map((s: string) => s.trim().toLowerCase()).includes(currentStudent.class.trim().toLowerCase())
          )
        );
        if (classPP && classPP.name) {
          setTeacherName(classPP.name);
        }
      }
    }
  }, [currentStudent?.id, currentStudent?.class, currentStudent?.teacherSignature, currentStudent?.mainTeacherName]);

  const handleSaveTeacherSignature = (sigUrl: string, name: string) => {
    if (!currentStudent || isEducator) return;
    setTeacherName(name);
    setIsTeacherSigned(true);

    saveClassPrincipalTeacherSignature(currentStudent.class, sigUrl, name);

    const updatedStudent: Student = {
      ...currentStudent,
      teacherSignature: sigUrl,
      mainTeacherName: name
    };
    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }
  };

  const handleDeleteTeacherSignature = () => {
    if (!currentStudent || isEducator) return;
    setIsTeacherSigned(false);

    deleteClassPrincipalTeacherSignature(currentStudent.class);

    const updatedStudent: Student = {
      ...currentStudent,
      teacherSignature: undefined,
    };
    if (onUpdateStudent) {
      onUpdateStudent(updatedStudent);
    }
  };

  const isPrimaryUser = currentUser?.section === 'Primaire';

  const displayableStudents = useMemo(() => {
    if (!allStudents || allStudents.length === 0) return [];

    if (currentUser?.role === 'parent') {
      return getParentChildren(currentUser, allStudents);
    }

    const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'professeur' || currentUser?.accessLevel === 3;
    if (isTeacher) {
      const assigned: string[] = [];
      const addCls = (val: any) => {
        if (!val) return;
        if (Array.isArray(val)) {
          val.forEach(item => addCls(item));
        } else if (typeof val === 'string') {
          val.split(',').forEach(item => {
            const trimmed = item.trim();
            if (trimmed && !assigned.some(a => isSameClass(a, trimmed))) assigned.push(trimmed);
          });
        }
      };

      if (currentUser) {
        addCls(currentUser.assignedClasses);
        addCls(currentUser.assignedClass);
        addCls(currentUser.principalClasses);
        addCls(currentUser.principalClass);
        addCls(currentUser.mainClass);
        addCls(currentUser.class);
      }

      try {
        const teachersList: any[] = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
        const matchedTeacher = teachersList.find((t: any) =>
          (t.id && currentUser.id && String(t.id) === String(currentUser.id)) ||
          (t.uid && currentUser.id && String(t.uid) === String(currentUser.id)) ||
          (t.authUid && currentUser.id && String(t.authUid) === String(currentUser.id)) ||
          (t.uid && currentUser.uid && String(t.uid) === String(currentUser.uid)) ||
          (t.authUid && currentUser.uid && String(t.authUid) === String(currentUser.uid)) ||
          (t.matricule && currentUser.matricule && String(t.matricule).toLowerCase() === String(currentUser.matricule).toLowerCase()) ||
          (t.email && currentUser.email && String(t.email).toLowerCase() === String(currentUser.email).toLowerCase()) ||
          (t.name && currentUser.name && String(t.name).toLowerCase() === String(currentUser.name).toLowerCase())
        );
        if (matchedTeacher) {
          addCls(matchedTeacher.assignedClasses);
          addCls(matchedTeacher.assignedClass);
          addCls(matchedTeacher.principalClasses);
          addCls(matchedTeacher.principalClass);
          addCls(matchedTeacher.mainClass);
          addCls(matchedTeacher.class);
        }
      } catch (e) {}

      try {
        const classesList: any[] = JSON.parse(localStorage.getItem('school_db_classes') || localStorage.getItem('school_classes') || '[]');
        classesList.forEach((cls: any) => {
          const clsName = cls.name || cls.code;
          if (!clsName) return;
          const mainT = cls.mainTeacher || cls.pp || cls.professeurPrincipal;
          if (mainT) {
            const isMatch = (typeof mainT === 'string' && (
              mainT.toLowerCase() === (currentUser.name || '').toLowerCase() ||
              mainT.toLowerCase() === (currentUser.matricule || '').toLowerCase()
            )) || (typeof mainT === 'object' && (
              String(mainT.id) === String(currentUser.id) ||
              (mainT.name && mainT.name.toLowerCase() === (currentUser.name || '').toLowerCase())
            ));
            if (isMatch) addCls(clsName);
          }
        });
      } catch (e) {}

      if (assigned.length > 0) {
        return allStudents.filter(s => s.class && assigned.some(aCls => isSameClass(s.class, aCls)));
      }
      return [];
    }

    if (isPrimaryUser) {
      return allStudents.filter(s => /^(CP1|CP2|CE1|CE2|CM1|CM2)/i.test(s.class));
    }
    return allStudents;
  }, [allStudents, currentUser, isPrimaryUser]);

  useEffect(() => {
    if (preSelectedStudent) {
        const freshData = displayableStudents?.find(s => s.id === preSelectedStudent.id) || displayableStudents[0] || preSelectedStudent;
        setCurrentStudent(freshData);
    } else if (displayableStudents && displayableStudents.length > 0) {
        setCurrentStudent(prev => {
            if (prev) {
                 return displayableStudents.find(s => s.id === prev.id) || displayableStudents[0];
            }
            return displayableStudents[0];
        });
    } else {
        setCurrentStudent(null);
    }
  }, [preSelectedStudent, displayableStudents]);

  const handleSelectStudent = (student: Student | null) => {
    setCurrentStudent(student);
    if (onSelectStudent) {
      onSelectStudent(student);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === '') return;
    if (!displayableStudents) return;
    const found = displayableStudents.find(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));
    if (found) {
        handleSelectStudent(found);
    }
  }, [searchTerm, displayableStudents]);

  const getNameParts = (fullName: string) => {
    const trimmed = (fullName || '').trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length <= 1) {
      return { firstName: trimmed, lastName: '' };
    }
    const lastName = parts[parts.length - 1];
    const firstName = parts.slice(0, -1).join(' ');
    return { firstName, lastName };
  };

  const handleEditClick = () => {
    if (readOnly) return; 
    if (currentStudent) {
        const nameParts = getNameParts(currentStudent.name);
        setEditForm({
            firstName: nameParts.firstName,
            lastName: nameParts.lastName,
            gender: currentStudent.gender || 'F',
            matricule: currentStudent.studentId,
            dob: currentStudent.birthDate,
            birthCertificateNumber: currentStudent.birthCertificateNumber || "3913 DU 27/03/2006 ETABLI A ABOBO",
            birthPlace: currentStudent.birthPlace || 'Abidjan',
            className: currentStudent.class,
            school: "Collège Faoummaba",
            country: currentStudent.country || "Côte d'Ivoire",
            nationality: currentStudent.nationality || "Ivoirienne",
            assignedStatus: currentStudent.assignedStatus || 'affecte',
            fatherPhone: currentStudent.fatherPhone || "",
            motherPhone: currentStudent.motherPhone || "",
            fatherEmail: currentStudent.fatherEmail || "",
            motherEmail: currentStudent.motherEmail || "",
            studentPhone: currentStudent.studentPhone || "",
            tutorPhone: currentStudent.tutorPhone || "",
            phone: currentStudent.parentPhone || ""
        });
        setShowEditModal(true);
    }
  };

  const handleSaveEdit = () => {
      if (currentStudent && onUpdateStudent) {
          const fullName = `${editForm.firstName} ${editForm.lastName}`.trim();
          const updated: Student = {
              ...currentStudent,
              name: fullName,
              studentId: editForm.matricule,
              class: editForm.className,
              birthDate: editForm.dob,
              birthPlace: editForm.birthPlace,
              parentPhone: editForm.phone || editForm.fatherPhone || editForm.motherPhone,
              gender: editForm.gender,
              birthCertificateNumber: editForm.birthCertificateNumber,
              country: editForm.country,
              nationality: editForm.nationality,
              assignedStatus: editForm.assignedStatus,
              fatherPhone: editForm.fatherPhone,
              motherPhone: editForm.motherPhone,
              fatherEmail: editForm.fatherEmail,
              motherEmail: editForm.motherEmail,
              studentPhone: editForm.studentPhone,
              tutorPhone: editForm.tutorPhone
          };
          onUpdateStudent(updated);
          setShowEditModal(false);
      }
  };

  const calculateSubjectAverage = (grades: GradeItem[] = []): number => {
      if (!grades || grades.length === 0) return 0;
      let totalExamScore = 0;
      let totalExamCoef = 0;
      let netBonus = 0;

      for (const g of grades) {
          const isPlus = g.type === 'plus' || g.isBonus || (g.title && (g.title.includes('Participation (+') || g.title.includes('Bonus/Malus (+')) );
          const isMinus = g.type === 'minus' || (g.title && (g.title.includes('Participation (-') || g.title.includes('Bonus/Malus (-')) );

          if (isPlus) {
              const pts = g.points !== undefined ? Number(g.points) : (parseFloat(g.title?.match(/\+([\d.]+)/)?.[1] || '1'));
              netBonus += pts;
          } else if (isMinus) {
              const pts = g.points !== undefined ? Number(g.points) : (parseFloat(g.title?.match(/-([\d.]+)/)?.[1] || '1'));
              netBonus -= pts;
          } else {
              const score = typeof g.score === 'number' ? g.score : parseFloat(g.score as any || 0);
              const coef = typeof g.coef === 'number' ? g.coef : parseFloat(g.coef as any || 1);
              const maxScore = (g as any).maxScore || (coef === 2 ? 40 : 20);

              if (maxScore === 40) {
                  totalExamScore += score;
                  totalExamCoef += 2;
              } else if (maxScore === 10) {
                  totalExamScore += (score / 10) * 20 * coef;
                  totalExamCoef += coef;
              } else {
                  totalExamScore += score * coef;
                  totalExamCoef += coef;
              }
          }
      }

      if (totalExamCoef === 0) {
          if (netBonus > 0) return Math.min(20, Math.max(0, netBonus));
          return 0;
      }

      const baseAverage = totalExamScore / totalExamCoef;
      return Math.min(20, Math.max(0, baseAverage + netBonus));
  };

  const updateStudentSubjectGrades = (subjectName: string, updatedGrades: GradeItem[]) => {
      if (!currentStudent || !onUpdateStudent) return;
      
      const newAverage = calculateSubjectAverage(updatedGrades);
      const augSubjects = getAugmentedSubjects();
      
      let subjectExists = false;
      const updatedSubjects = augSubjects.map(sub => {
          if (sub.name === subjectName) {
              subjectExists = true;
              return { ...sub, average: newAverage, grades: updatedGrades };
          }
          return sub;
      });
      
      if (!subjectExists) {
          updatedSubjects.push({
              name: subjectName,
              value: 10,
              average: newAverage,
              fill: subjectName.includes('L.V.2') ? '#10b981' : '#ccc',
              grades: updatedGrades
          });
      }
      
      const pts = updatedSubjects.reduce((acc, sub) => {
          const coef = getSubjectCoef(currentStudent.class, sub.name);
          if (coef === 0) {
              const g = Number(sub.average || 0);
              return acc + (g > 10 ? g - 10 : 0);
          }
          return acc + (Number(sub.average || 0) * coef);
      }, 0);
      const cfs = updatedSubjects.reduce((acc, sub) => acc + getSubjectCoef(currentStudent.class, sub.name), 0);
      const trimAvgNum = cfs > 0 ? parseFloat((pts / cfs).toFixed(2)) : 0;

      const updatedTrimesters = {
          ...(currentStudent.trimesters || {}),
          [selectedTrim]: {
              subjects: updatedSubjects,
              average: trimAvgNum
          }
      };

      const t1Avg = updatedTrimesters['1er trim']?.average || (selectedTrim === '1er trim' ? trimAvgNum : (trimesterAverages?.[currentStudent.id]?.['1er trim'] || 0));
      const t2Avg = updatedTrimesters['2ème trim']?.average || (selectedTrim === '2ème trim' ? trimAvgNum : (trimesterAverages?.[currentStudent.id]?.['2ème trim'] || 0));
      const t3Avg = updatedTrimesters['3ème trim']?.average || (selectedTrim === '3ème trim' ? trimAvgNum : (trimesterAverages?.[currentStudent.id]?.['3ème trim'] || 0));

      const updatedPerformance: ChartData[] = [
          { name: '1er Trim', studentScore: t1Avg, classAverage: 0 },
          { name: '2e Trim', studentScore: t2Avg, classAverage: 0 },
          { name: '3e Trim', studentScore: t3Avg, classAverage: 0 }
      ];

      onUpdateStudent({ 
          ...currentStudent, 
          trimesters: updatedTrimesters,
          performance: updatedPerformance,
          subjects: updatedSubjects 
      });
  };

  const handleSelectSubject = (subject: AnalyticsData) => {
      let grades = subject.grades;
      if (!grades) {
          grades = [];
      }
      setSelectedSubject(subject);
      setCurrentGrades(grades);
      setShowAddGrade(false);
  };

  const handleAddGrade = () => {
      if (!canEditGrades) return;
      if (!newGradeForm.score) return;
      const scoreNum = parseFloat(newGradeForm.score);
      const isDevoirCoef2 = newGradeForm.type === 'devoir' && newGradeForm.coef === '2';
      const isInterro10 = newGradeForm.type === 'interrogation' && newGradeForm.interroMax === '10';
      const maxLimit = isDevoirCoef2 ? 40 : (isInterro10 ? 10 : 20);

      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > maxLimit) {
          setGradeError(`La note doit être entre 0 et ${maxLimit}`);
          return;
      }

      let finalScore = scoreNum;
      if (isDevoirCoef2 && scoreNum <= 20) {
          finalScore = scoreNum * 2;
      }

      const titleToUse = newGradeForm.title.trim() || (newGradeForm.type === 'interrogation' ? `Interrogation N°${currentGrades.length + 1}` : `Devoir N°${currentGrades.length + 1}`);
      const newGrade: GradeItem = {
          id: Date.now(),
          title: titleToUse,
          score: finalScore,
          coef: isDevoirCoef2 ? 2 : 1,
          maxScore: isDevoirCoef2 ? 40 : (isInterro10 ? 10 : 20),
          date: 'Aujourd\'hui',
          classAvg: isDevoirCoef2 ? 24 : (isInterro10 ? 6 : 12),
          appreciation: newGradeForm.appreciation?.trim() || undefined
      };
      const updatedGrades = [newGrade, ...currentGrades];
      setCurrentGrades(updatedGrades);
      if (selectedSubject) {
          const newAverage = calculateSubjectAverage(updatedGrades);
          const updatedSubject = { ...selectedSubject, average: newAverage, grades: updatedGrades };
          setSelectedSubject(updatedSubject);
          updateStudentSubjectGrades(selectedSubject.name, updatedGrades);
      }
      setNewGradeForm({ title: '', score: '', coef: '1', type: 'devoir', interroMax: '20', appreciation: '' });
      setShowAddGrade(false);
      setShowGradeTypeDropdown(false);
      setGradeError(null);
  };

  const handleAddMinus = () => {
      if (!canEditGrades) return;
      setBonusMinusConfig({ isOpen: true, type: 'minus', step: 'target', target: 'moyenne', value: '1' });
  };

  const handleAddBonus = () => {
      if (!canEditGrades) return;
      setBonusMinusConfig({ isOpen: true, type: 'plus', step: 'target', target: 'moyenne', value: '1' });
  };

  const confirmBonusMinus = () => {
      if (!canEditGrades) return;
      const points = parseFloat(bonusMinusConfig.value);
      if (isNaN(points) || points <= 0) return;
      
      const isMoyenne = bonusMinusConfig.target === 'moyenne';
      const isPlus = bonusMinusConfig.type === 'plus';

      const newGrade: GradeItem = {
          id: Date.now(),
          title: isMoyenne 
              ? `Bonus sur moyenne (${isPlus ? '+' : '-'}${points} pt${points > 1 ? 's' : ''})`
              : `Note Bonus (${isPlus ? '+' : '-'}${points} pt${points > 1 ? 's' : ''})`,
          date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
          score: 0,
          coef: 0,
          classAvg: 10,
          type: bonusMinusConfig.type,
          points: points,
          isBonus: true
      };
      
      const updatedGrades = [newGrade, ...currentGrades];
      setCurrentGrades(updatedGrades);
      
      if (selectedSubject) {
          const newAverage = calculateSubjectAverage(updatedGrades);
          const updatedSubject = { ...selectedSubject, average: newAverage, grades: updatedGrades };
          setSelectedSubject(updatedSubject);
          updateStudentSubjectGrades(selectedSubject.name, updatedGrades);
      }
      setBonusMinusConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleEditGrade = (grade: GradeItem) => {
      if (!canEditGrades) return;
      setEditingGradeId(grade.id);
      setEditGradeForm({ title: grade.title, score: (grade.points || grade.score).toString() });
  };

  const handleSaveEditGrade = () => {
      if (!canEditGrades) return;
      if (!editGradeForm.title || !editGradeForm.score) return;
      const scoreNum = parseFloat(editGradeForm.score);
      
      const updatedGrades = currentGrades.map(g => {
          if (g.id === editingGradeId) {
              if (g.type === 'plus' || g.type === 'minus' || g.isBonus) {
                  return { ...g, title: editGradeForm.title, points: scoreNum };
              }
              return { ...g, title: editGradeForm.title, score: scoreNum };
          }
          return g;
      });
      setCurrentGrades(updatedGrades);
      
      if (selectedSubject) {
          const newAverage = calculateSubjectAverage(updatedGrades);
          const updatedSubject = { ...selectedSubject, average: newAverage, grades: updatedGrades };
          setSelectedSubject(updatedSubject);
          updateStudentSubjectGrades(selectedSubject.name, updatedGrades);
      }
      setEditingGradeId(null);
  };

  const handleDeleteGrade = (id: number | string) => {
      if (!canEditGrades) return;
      setGradeToDelete(id);
  };

  const confirmDeleteGrade = () => {
      if (!canEditGrades) return;
      if (gradeToDelete === null) return;
      const updatedGrades = currentGrades.filter(g => g.id !== gradeToDelete);
      setCurrentGrades(updatedGrades);
      
      if (selectedSubject) {
          const newAverage = calculateSubjectAverage(updatedGrades);
          const updatedSubject = { ...selectedSubject, average: newAverage, grades: updatedGrades };
          setSelectedSubject(updatedSubject);
          updateStudentSubjectGrades(selectedSubject.name, updatedGrades);
      }
      setGradeToDelete(null);
  };

  const attendanceHistory = currentStudent?.attendanceHistory || [];
  const absenceRecords = attendanceHistory.filter(a => a.type === 'absent');
  const lateRecords = attendanceHistory.filter(a => a.type === 'late');

  const totalAbsenceHours = attendanceHistory.reduce((acc, curr) => acc + (curr.hours || 0), 0);
  const unjustifiedAbsenceHours = attendanceHistory.filter(a => !a.justified).reduce((acc, curr) => acc + (curr.hours || 0), 0);
  const totalAbsenceCount = absenceRecords.length;
  const totalLateCount = lateRecords.length;

  const estimatedSchoolHours = 800;
  const attendanceRate = Math.max(0, Math.min(100, Number(((1 - (totalAbsenceHours / estimatedSchoolHours)) * 100).toFixed(1))));
  const absenceRate = Number((100 - attendanceRate).toFixed(1));

  const handleDeleteAttendanceRecord = (recordId: string) => {
    if (!currentStudent || !onUpdateStudent || readOnly) return;
    const newHistory = (currentStudent.attendanceHistory || []).filter(r => r.id !== recordId);
    const newTotal = newHistory.reduce((acc, curr) => acc + (curr.hours || 0), 0);
    const updated = {
      ...currentStudent,
      absences: newTotal,
      attendanceHistory: newHistory
    };
    onUpdateStudent(updated);
  };

  const handleToggleJustifiedRecord = (recordId: string) => {
    if (!currentStudent || !onUpdateStudent || readOnly) return;
    const newHistory = (currentStudent.attendanceHistory || []).map(r => 
      r.id === recordId ? { ...r, justified: !r.justified } : r
    );
    const updated = {
      ...currentStudent,
      attendanceHistory: newHistory
    };
    onUpdateStudent(updated);
  };

  
    const getAugmentedSubjects = () => {
    const trimSubjectsFromStudent = currentStudent?.trimesters?.[selectedTrim]?.subjects;
    let subjects = trimSubjectsFromStudent && trimSubjectsFromStudent.length > 0 
        ? trimSubjectsFromStudent.map(s => {
            const hasGrades = s.grades && Array.isArray(s.grades) && s.grades.length > 0;
            const avg = hasGrades ? calculateSubjectAverage(s.grades) : 0;
            return { ...s, average: avg };
          })
        : (currentStudent?.subjects ? currentStudent.subjects.map(s => {
            const gradesForTrim = selectedTrim === '1er trim' ? (s.grades || []) : [];
            const hasGrades = gradesForTrim.length > 0;
            const avg = hasGrades ? calculateSubjectAverage(gradesForTrim) : 0;
            return { 
              ...s, 
              average: avg, 
              grades: gradesForTrim 
            };
          }) : []);
    
    const className = currentStudent?.class || '';
    const nameUpper = className.trim().toUpperCase();
    const isPrimary = nameUpper.startsWith('CP') || nameUpper.startsWith('CE') || nameUpper.startsWith('CM');

    if (isPrimary) {
      const allowedPrimarySubjects = getSubjectsForClass(className);
      subjects = subjects.filter(s => s?.name && allowedPrimarySubjects.includes(s.name));
      allowedPrimarySubjects.forEach(subName => {
        if (!subjects.find(s => s?.name === subName)) {
          subjects.push({
            name: subName,
            value: 10,
            average: 0,
            fill: SUBJECT_HEX_COLORS[subName] || '#3b82f6',
            grades: []
          });
        }
      });
      return subjects;
    }

    if (isTechnicalClass(className)) {
      const allowedTechSubjects = getSubjectsForClass(className);
      
      // Filter out any subjects that are not in the allowed tech subjects list
      subjects = subjects.filter(s => s?.name && allowedTechSubjects.some(allowed => isSubjectMatch(s.name, allowed)));

      allowedTechSubjects.forEach(subName => {
        if (!subjects.find(s => s?.name && isSubjectMatch(s.name, subName))) {
          subjects.push({
            name: subName,
            value: 10,
            average: 0,
            fill: SUBJECT_HEX_COLORS[subName] || '#0284c7',
            grades: []
          });
        }
      });

      const trimKey = (selectedTrim === '2ème trim' || selectedTrim === '2ème Trimestre') ? '2ème trim' :
                      (selectedTrim === '3ème trim' || selectedTrim === '3ème Trimestre') ? '3ème trim' : '1er trim';

      subjects = subjects.map(s => {
        const mark = getDisciplineMarkFromStudent(currentStudent, trimKey, s.name);
        const hasGrades = s.grades && s.grades.length > 0;
        let avg = 0;
        if (hasGrades) {
          avg = calculateSubjectAverage(s.grades);
        } else if (mark !== null && mark !== undefined && !isNaN(mark)) {
          avg = mark;
        }
        return {
          ...s,
          average: avg
        };
      });
      const allemand = subjects.find(s => s.name.toLowerCase().includes("allemand"));
      const espagnol = subjects.find(s => s.name.toLowerCase().includes("espagnol"));
      if (allemand && espagnol) {
        const markAllemand = getDisciplineMarkFromStudent(currentStudent, trimKey, "Allemand");
        const markEspagnol = getDisciplineMarkFromStudent(currentStudent, trimKey, "Espagnol");

        const hasAllemandGrades = (allemand.grades && allemand.grades.length > 0) || (typeof allemand.average === 'number' && allemand.average > 0);
        const hasEspagnolGrades = (espagnol.grades && espagnol.grades.length > 0) || (typeof espagnol.average === 'number' && espagnol.average > 0);

        const hasAllemand = hasAllemandGrades || markAllemand !== null;
        const hasEspagnol = hasEspagnolGrades || markEspagnol !== null;

        if (hasAllemand && !hasEspagnol) {
          subjects = subjects.map(s => s.name.toLowerCase().includes("espagnol") ? { ...s, inactive: true } : s);
        } else if (hasEspagnol && !hasAllemand) {
          subjects = subjects.map(s => s.name.toLowerCase().includes("allemand") ? { ...s, inactive: true } : s);
        } else if (hasAllemand && hasEspagnol) {
          const countAll = allemand.grades?.length || 0;
          const countEsp = espagnol.grades?.length || 0;
          if (countEsp >= countAll) {
            subjects = subjects.map(s => s.name.toLowerCase().includes("allemand") ? { ...s, inactive: true } : s);
          } else {
            subjects = subjects.map(s => s.name.toLowerCase().includes("espagnol") ? { ...s, inactive: true } : s);
          }
        }
      }

      return subjects;
    }

    if (currentStudent?.class?.match(/(2nde|Seconde|2°|1ère|1ere|1er|1°|Première|Premiere|Terminale|Tle|T°)/i)) {
        subjects = subjects.filter(s => s?.name && !s.name.includes('EDHC') && !s.name.includes('E.D.H.C'));
    }

    if (currentStudent?.class?.match(/(Tle A|T°A|TA|Terminale A)/i)) {
        subjects = subjects.filter(s => s?.name && !s.name.includes('Physique'));
    } else {
        if (!subjects.find(s => s?.name?.toLowerCase().includes('physique') || s?.name?.toLowerCase().includes('chimie'))) {
            subjects.push({ name: 'Physique-Chimie', value: 15, average: 0, fill: '#fbbf24', grades: [] });
        }
    }

    if (!isTechnicalClass(className) && currentStudent?.class && (currentStudent.class.includes('4ème') || currentStudent.class.includes('3ème') || currentStudent.class?.match(/(2nde|Seconde|2°|1ère|1ere|1er|1°|Première|Premiere|Terminale|Tle|T°)/i))) {
      subjects = subjects.filter(s => s?.name && s.name !== 'Allemand' && s.name !== 'Espagnol' && s.name !== 'L.V.2 (Allemand)' && s.name !== 'L.V.2 (Espagnol)');
      if (currentStudent.class.match(/(1ère D|1ere D|1°D|1D|Première D|Premiere D|Tle D|T°D|TD|Terminale D|TerminaleD)/i)) {
          subjects = subjects.filter(s => s?.name && !s.name.includes('L.V.2'));
      } else if (!subjects.find(s => s?.name?.includes('L.V.2'))) {
          subjects.push({ name: 'L.V.2 (Allemand / Espagnol)', value: 10, average: 0, fill: '#10b981', grades: [] });
      }
    }

    if (isTechnicalClass(className)) {
        subjects = subjects.filter(s => s?.name && !s.name.toLowerCase().includes('l.v.2') && !s.name.toLowerCase().includes('lv2'));
        if (!subjects.find(s => s?.name && s.name.toLowerCase().includes('allemand'))) {
            subjects.push({ name: 'Allemand', value: 10, average: 0, fill: '#f59e0b', grades: [] });
        }
        if (!subjects.find(s => s?.name && s.name.toLowerCase().includes('espagnol'))) {
            subjects.push({ name: 'Espagnol', value: 10, average: 0, fill: '#eab308', grades: [] });
        }
    }

    if (currentStudent?.class?.match(/(1ère|1ere|1er|1°|Première|Premiere|Terminale|Tle)/i)) {
      if (!subjects.find(s => s?.name?.toLowerCase().includes('philosophie'))) {
          subjects.push({ name: 'Philosophie', value: 10, average: 0, fill: '#7c3aed', grades: [] });
      }
    }
    
    if (!subjects.find(s => s?.name?.toLowerCase().includes('informatique'))) {
        subjects.push({ name: 'Informatique', value: 10, average: 0, fill: '#475569', grades: [] });
    }
    if (!subjects.find(s => s?.name?.toLowerCase().includes('conduite'))) {
        subjects.push({ name: 'Conduite', value: 10, average: 0, fill: '#059669', grades: [] });
    }

    const trimKey = (selectedTrim === '2ème trim' || selectedTrim === '2ème Trimestre') ? '2ème trim' :
                    (selectedTrim === '3ème trim' || selectedTrim === '3ème Trimestre') ? '3ème trim' : '1er trim';

    subjects = subjects.map(s => {
      const mark = getDisciplineMarkFromStudent(currentStudent, trimKey, s.name);
      const hasGrades = s.grades && s.grades.length > 0;
      let avg = 0;
      if (hasGrades) {
        avg = calculateSubjectAverage(s.grades);
      } else if (mark !== null && mark !== undefined && !isNaN(mark)) {
        avg = mark;
      }
      return {
        ...s,
        average: avg
      };
    });

    return subjects;

  };
  
  const augmentedSubjects = getAugmentedSubjects();
  const totalPoints = augmentedSubjects.reduce((acc, sub) => {
      if (sub.inactive) return acc;
      const coef = getSubjectCoef(currentStudent?.class, sub.name);
      if (coef === 0) {
          const g = Number(sub.average || 0);
          return acc + (g > 10 ? g - 10 : 0);
      }
      return acc + (sub.average || 0) * coef;
  }, 0);

  const totalCoef = augmentedSubjects.reduce((acc, sub) => acc + (sub.inactive ? 0 : getSubjectCoef(currentStudent?.class, sub.name)), 0);
  const calculatedAverage = totalCoef > 0 ? (totalPoints / totalCoef).toFixed(2) : '0.00';

  const classStudents = displayableStudents.filter(s => s.class === currentStudent?.class);
  const totalClassSize = classStudents.length;

  const computeStudentAverage = (student: Student) => {
      const trimKey = (selectedTrim === '2ème trim' || selectedTrim === '2ème Trimestre') ? '2ème trim' :
                      (selectedTrim === '3ème trim' || selectedTrim === '3ème Trimestre') ? '3ème trim' : '1er trim';

      const classSubs = getSubjectsForClass(student.class || '');
      let pts = 0;
      let cfs = 0;

      classSubs.forEach(subName => {
        const mark = getDisciplineMarkFromStudent(student, trimKey, subName);
        if (mark !== null && mark !== undefined && !isNaN(mark)) {
          const coef = getSubjectCoef(student.class, subName);
          if (coef === 0) {
            pts += (mark > 10 ? mark - 10 : 0);
          } else {
            pts += mark * coef;
            cfs += coef;
          }
        }
      });

      if (cfs === 0 && student.subjects) {
        student.subjects.forEach((s: any) => {
          const mark = getDisciplineMarkFromStudent(student, trimKey, s.name);
          if (mark !== null && mark !== undefined && !isNaN(mark)) {
            const coef = getSubjectCoef(student.class, s.name);
            if (coef === 0) {
              pts += (mark > 10 ? mark - 10 : 0);
            } else {
              pts += mark * coef;
              cfs += coef;
            }
          }
        });
      }

      return cfs > 0 ? (pts / cfs) : 0;
  };

  const rankedStudents = classStudents.map(s => ({
      id: s.id,
      average: computeStudentAverage(s)
  })).sort((a, b) => b.average - a.average);

  const computedRank = (rankedStudents.findIndex(s => s.id === currentStudent?.id) + 1) || 1;
  const currentStudentAvgNum = currentStudent ? computeStudentAverage(currentStudent) : 0;
  const trimData = currentStudent?.trimesters?.[selectedTrim] || {};

  const isCustomRank = trimData.customRank !== undefined && trimData.customRank !== null;
  const studentRank = isCustomRank ? Number(trimData.customRank) : computedRank;

  const isCustomAppreciation = trimData.customAppreciation !== undefined && trimData.customAppreciation !== null;
  const effectiveAppreciation = isCustomAppreciation 
    ? trimData.customAppreciation 
    : getAutoAppreciation(currentStudentAvgNum);

  const isCustomDistinctions = trimData.customDistinctions !== undefined && trimData.customDistinctions !== null;
  const effectiveDistinctions = isCustomDistinctions 
    ? trimData.customDistinctions 
    : getAutoDistinctions(currentStudentAvgNum);

  const isCustomSanctions = trimData.customSanctions !== undefined && trimData.customSanctions !== null;
  const effectiveSanctions = isCustomSanctions 
    ? trimData.customSanctions 
    : getAutoSanctions(currentStudentAvgNum);

  const isCustomMentions = isCustomDistinctions || isCustomSanctions;

  const minAverage = rankedStudents.length > 0 ? rankedStudents[rankedStudents.length - 1].average : 0;
  const maxAverage = rankedStudents.length > 0 ? rankedStudents[0].average : 0;
  const classAverage = rankedStudents.length > 0 ? rankedStudents.reduce((acc, s) => acc + s.average, 0) / rankedStudents.length : 0;

  const handleSelectAppreciation = (newAppreciation: string | null) => {
    if (!currentStudent || !onUpdateStudent) return;
    const newTrimObj = {
      ...(currentStudent.trimesters?.[selectedTrim] || {}),
      customAppreciation: newAppreciation,
      appreciation: newAppreciation
    };
    onUpdateStudent({
      ...currentStudent,
      trimesters: {
        ...(currentStudent.trimesters || {}),
        [selectedTrim]: newTrimObj
      }
    });
  };

  const handleResetAppreciationToAuto = () => {
    if (!currentStudent || !onUpdateStudent) return;
    const updatedTrim = { ...(currentStudent.trimesters?.[selectedTrim] || {}) };
    delete updatedTrim.customAppreciation;
    updatedTrim.appreciation = getAutoAppreciation(currentStudentAvgNum);
    onUpdateStudent({
      ...currentStudent,
      trimesters: {
        ...(currentStudent.trimesters || {}),
        [selectedTrim]: updatedTrim
      }
    });
  };

  const handleRankChange = (newRank: number | null) => {
    if (!currentStudent || !onUpdateStudent) return;
    const updatedTrim = { ...(currentStudent.trimesters?.[selectedTrim] || {}) };
    if (newRank === null) {
      delete updatedTrim.customRank;
    } else {
      updatedTrim.customRank = newRank;
    }
    onUpdateStudent({
      ...currentStudent,
      trimesters: {
        ...(currentStudent.trimesters || {}),
        [selectedTrim]: updatedTrim
      }
    });
  };

  const handleDistinctionToggle = (dist: string) => {
    if (!currentStudent || !onUpdateStudent) return;
    const currentList = effectiveDistinctions;
    const nextList = currentList.includes(dist) ? currentList.filter(d => d !== dist) : [...currentList, dist];
    onUpdateStudent({
      ...currentStudent,
      trimesters: {
        ...(currentStudent.trimesters || {}),
        [selectedTrim]: {
          ...(currentStudent.trimesters?.[selectedTrim] || {}),
          customDistinctions: nextList
        }
      }
    });
  };

  const handleSanctionToggle = (sanc: string) => {
    if (!currentStudent || !onUpdateStudent) return;
    const currentList = effectiveSanctions;
    const nextList = currentList.includes(sanc) ? currentList.filter(s => s !== sanc) : [...currentList, sanc];
    onUpdateStudent({
      ...currentStudent,
      trimesters: {
        ...(currentStudent.trimesters || {}),
        [selectedTrim]: {
          ...(currentStudent.trimesters?.[selectedTrim] || {}),
          customSanctions: nextList
        }
      }
    });
  };

  const handleResetMentionsToAuto = () => {
    if (!currentStudent || !onUpdateStudent) return;
    const updatedTrim = { ...(currentStudent.trimesters?.[selectedTrim] || {}) };
    delete updatedTrim.customDistinctions;
    delete updatedTrim.customSanctions;
    onUpdateStudent({
      ...currentStudent,
      trimesters: {
        ...(currentStudent.trimesters || {}),
        [selectedTrim]: updatedTrim
      }
    });
  };

  const teachers = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
  const isPrincipalForClass = checkIsPrincipalForClass(currentUser, currentStudent?.class, teachers);
  const isAdminOrDirector = (currentUser?.role === 'admin' || currentUser?.role === 'director' || currentUser?.accessLevel === 5) && !isEducator;
  const isStaffWhoCanManageStudents = !readOnly && (
    currentUser?.role === 'admin' || 
    currentUser?.role === 'director' || 
    currentUser?.role === 'educator' || 
    currentUser?.role === 'éducateur' || 
    currentUser?.role === 'cashier' || 
    currentUser?.accessLevel === 2 || 
    currentUser?.accessLevel === 5 || 
    currentUser?.accessLevel === 4
  ) && currentUser?.role !== 'teacher' && currentUser?.role !== 'parent' && currentUser?.role !== 'student';

  const canSignTeacherSignature = isAdminOrDirector || isPrincipalForClass || isTeacherRole;
  const canEditAppreciation = isAdminOrDirector || isPrincipalForClass || isTeacherRole;
  const canEditDirectorSection = currentUser?.accessLevel === 5 || currentUser?.role === 'director';

  if (!currentStudent) {
    const isTeacher = currentUser?.role === 'teacher' || currentUser?.role === 'professeur' || currentUser?.accessLevel === 3;
    if (isTeacher) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] h-full w-full bg-[#f8fafc] p-6 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <GraduationCap size={32} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800">Aucun élève disponible</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              Vous n'avez pas encore d'élèves dans votre classe.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full w-full bg-[#f8fafc] p-6 text-slate-500 font-medium">
        Sélectionnez un élève pour voir son espace Terminale D.
      </div>
    );
  }

  const t1Avg = currentStudent?.trimesters?.['1er trim']?.average ?? null;
  const t2Avg = currentStudent?.trimesters?.['2ème trim']?.average ?? null;
  const t3Avg = currentStudent?.trimesters?.['3ème trim']?.average ?? null;

  const t1Rank = currentStudent?.trimesters?.['1er trim']?.rank || '-';
  const t2Rank = currentStudent?.trimesters?.['2ème trim']?.rank || '-';
  const t3Rank = currentStudent?.trimesters?.['3ème trim']?.rank || '-';

  const isTech = isTechnicalClass(currentStudent?.class || '');
  const t1Coef = isTech ? 1 : 1;
  const t2Coef = isTech ? 1 : 2;
  const t3Coef = isTech ? 1 : 2;

  const annualAvg = calculateAnnualAverage(t1Avg, t2Avg, t3Avg, isTech);
  const annualRank = currentStudent?.annualRank || (studentRank ? `${studentRank}e` : '-');
  const annualDecision = (currentStudent as any)?.annualDecision || '';
  
  const handleAnnualDecisionChange = (decision: string) => {
    if (currentStudent && onUpdateStudent) {
      onUpdateStudent({
        ...currentStudent,
        annualDecision: decision
      } as any);
    }
  };

  return (
    <>
    {/* MOBILE DASHBOARD CONTENT */}
    <div className="md:hidden flex flex-col h-full relative z-10 w-full bg-[#1C1B2E]">
       <WalletDashboard 
            readOnly={readOnly} 
            onNavigate={onNavigate} 
            student={currentStudent} 
            onDelete={isStaffWhoCanManageStudents && onDeleteStudent ? () => onDeleteStudent(currentStudent.id) : undefined}
            onUpdateStudent={onUpdateStudent}
            currentUser={currentUser}
            studentRank={studentRank}
            totalClassSize={totalClassSize}
            minAverage={minAverage}
            maxAverage={maxAverage}
            classAverage={classAverage}
            selectedTrimester={selectedTrim}
            onTrimesterChange={handleTrimSelect}
            selectedAppreciation={effectiveAppreciation}
            onSelectAppreciation={handleSelectAppreciation}
            teacherName={teacherName}
            onTeacherNameChange={setTeacherName}
            isTeacherSigned={isTeacherSigned}
            onToggleSigned={setIsTeacherSigned}
            teacherSignature={currentStudent?.teacherSignature || getClassPrincipalTeacherSignature(currentStudent?.class).signature}
            onSaveSignature={handleSaveTeacherSignature}
            onDeleteSignature={handleDeleteTeacherSignature}
            canSign={canSignTeacherSignature}
            selectedDistinctions={effectiveDistinctions}
            onDistinctionToggle={handleDistinctionToggle}
            selectedSanctions={effectiveSanctions}
            onSanctionToggle={handleSanctionToggle}
            annualDecision={annualDecision}
            onAnnualDecisionChange={handleAnnualDecisionChange}
            isCustomRank={isCustomRank}
            onRankChange={handleRankChange}
            isCustomAppreciation={isCustomAppreciation}
            onResetAppreciationToAuto={handleResetAppreciationToAuto}
            isCustomMentions={isCustomMentions}
            onResetMentionsToAuto={handleResetMentionsToAuto}
            faitA={faitA}
            onFaitAChange={setFaitA}
            faitLe={faitLe}
            onFaitLeChange={setFaitLe}
            directorName={directorName}
            onDirectorNameChange={setDirectorName}
            signatureText={signatureText}
            onSignatureTextChange={setSignatureText}
            stampImage={stampImage}
            onStampImageChange={setStampImage}
       />
    </div>

    {/* DESKTOP DASHBOARD CONTENT */}
    <div className="hidden md:flex flex-col h-full animate-in fade-in duration-300 relative print:hidden z-10 bg-[#BFDBFE] pt-8">
      {/* Header */}
      <div className="flex justify-between items-center mt-5 mb-8 px-8 shrink-0">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm overflow-hidden p-0.5 shrink-0 border border-white/60">
                <img src="logo.png" alt="Terminale D Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = 'icone.png'; }} />
              </div>
              <h1 className="text-white text-[28px] font-bold tracking-tight">Terminale D</h1>
          </div>
          <div className="flex items-center space-x-3">
              {!readOnly && (
                  <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-xl border border-white/30 w-full md:w-96 text-white">
                    <Search className="text-white" size={20} />
                    <input 
                      type="text" 
                      placeholder="Rechercher..." 
                      className="bg-transparent border-none outline-none text-white placeholder-white/70 font-medium w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
              )}
              {!(currentUser?.role === 'student' || currentUser?.role === 'teacher' || currentUser?.accessLevel === 1) && (
                <div className="flex items-center gap-2">
                  <button 
                      onClick={() => setIsPrintModalOpen(true)}
                      title="Imprimer le bulletin trimestriel"
                      className="btn-print hidden md:flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl bg-white text-slate-900 font-extrabold shadow-sm border border-white/50 hover:bg-slate-100 transition-all cursor-pointer active:scale-95 shrink-0"
                  >
                      <Printer className="w-5 h-5 text-sky-600" strokeWidth={2.5} />
                      <span className="text-xs">Bulletin Trimestriel</span>
                  </button>
                </div>
              )}
          </div>
      </div>

      <main className="flex-1 bg-white rounded-t-[40px] px-8 pt-8 pb-24 overflow-y-auto custom-scrollbar shadow-2xl relative">
        {/* Parent Multi-Child Selector Banner */}
        {currentUser?.role === 'parent' && displayableStudents.length > 0 && (
          <div className="mb-8 p-5 bg-gradient-to-r from-sky-900 via-indigo-900 to-slate-900 rounded-[28px] text-white shadow-xl relative overflow-hidden border border-sky-700/50">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-500/20 rounded-xl border border-sky-400/30 text-sky-300">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold tracking-tight">Mes Enfants ({displayableStudents.length})</h3>
                  <p className="text-xs text-sky-200/80">Cliquez sur un enfant pour consulter ses notes, bulletins et suivis.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10">
              {displayableStudents.map((childStudent) => {
                const isSelected = currentStudent?.id === childStudent.id || currentStudent?.studentId === childStudent.studentId;
                const isPrim = childStudent.class && /^(CP|CE|CM)/i.test(childStudent.class);
                return (
                  <button
                    key={childStudent.id}
                    type="button"
                    onClick={() => setCurrentStudent(childStudent)}
                    className={`p-4 rounded-[22px] transition-all text-left flex items-center gap-3.5 relative border ${
                      isSelected 
                        ? 'bg-white text-slate-900 ring-4 ring-sky-400/80 shadow-lg scale-[1.02]' 
                        : 'bg-white/10 text-white hover:bg-white/20 border-white/20'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-14 h-14 rounded-2xl overflow-hidden shadow-md border-2 ${isSelected ? 'border-sky-600' : 'border-white/40'}`}>
                        <img 
                          src={childStudent.photoUrl} 
                          alt={childStudent.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(childStudent.name)}&background=0284c7&color=fff`; }}
                        />
                      </div>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 bg-sky-500 text-white p-1 rounded-full shadow-md">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className={`font-extrabold text-sm truncate ${isSelected ? 'text-slate-900' : 'text-white'}`}>
                        {childStudent.name}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1 font-mono text-xs">
                        <span className={`px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                          isSelected ? 'bg-sky-100 text-sky-800' : 'bg-white/20 text-sky-200'
                        }`}>
                          {childStudent.class}
                        </span>
                        <span className={`text-[11px] ${isSelected ? 'text-slate-500' : 'text-slate-300'}`}>
                          • {childStudent.studentId}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isPrim 
                            ? (isSelected ? 'bg-amber-100 text-amber-800' : 'bg-amber-400/20 text-amber-300')
                            : (isSelected ? 'bg-indigo-100 text-indigo-800' : 'bg-indigo-400/20 text-indigo-300')
                        }`}>
                          {isPrim ? 'Primaire' : 'Secondaire'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-6 md:gap-8 pb-8">
          
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-6 md:gap-8">
            <div className="flex-1 min-h-[300px] md:min-h-[350px]">
              <SpendsChart data={currentStudent.performance} overallAverage={calculatedAverage} studentClass={currentStudent?.class} />
            </div>

            <div className="w-full">
              <AnalyticsChart data={augmentedSubjects} gpa={3.8} totalPoints={totalPoints} totalCoef={totalCoef} studentClass={currentStudent?.class} selectedTrim={selectedTrim} onTrimChange={handleTrimSelect} />
            </div>

            <AppreciationCard 
              rank={studentRank} 
              totalSize={totalClassSize} 
              canEdit={canEditAppreciation} 
              canSign={canSignTeacherSignature}
              selectedAppreciation={effectiveAppreciation}
              onSelectAppreciation={handleSelectAppreciation}
              teacherName={teacherName}
              onTeacherNameChange={setTeacherName}
              isSigned={isTeacherSigned}
              onToggleSigned={setIsTeacherSigned}
              teacherSignature={currentStudent?.teacherSignature}
              onSaveSignature={handleSaveTeacherSignature}
              onDeleteSignature={handleDeleteTeacherSignature}
              isCustomRank={isCustomRank}
              onRankChange={handleRankChange}
              isCustomAppreciation={isCustomAppreciation}
              onResetAppreciationToAuto={handleResetAppreciationToAuto}
            />
            <MentionCard 
              canEdit={canEditAppreciation}
              selectedDistinctions={effectiveDistinctions}
              onDistinctionToggle={handleDistinctionToggle}
              selectedSanctions={effectiveSanctions}
              onSanctionToggle={handleSanctionToggle}
              isCustomMentions={isCustomMentions}
              onResetMentionsToAuto={handleResetMentionsToAuto}
            />
          </div>

          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            <CreditCard 
                student={currentStudent} 
                currentUser={currentUser}
                onEdit={isStaffWhoCanManageStudents ? handleEditClick : undefined} 
                onDelete={isStaffWhoCanManageStudents && onDeleteStudent ? () => onDeleteStudent(currentStudent.id) : undefined}
                onPhotoChange={(newPhotoUrl) => {
                  if (currentStudent && onUpdateStudent) {
                    onUpdateStudent({
                      ...currentStudent,
                      photoUrl: newPhotoUrl
                    });
                  }
                }}
                onNavigate={onNavigate}
            />

            {/* Widgets Section: Exercices & Cursus de l'élève (Vertical Stack) */}
            <div className="flex flex-col gap-3">
                {/* Exercices Widget */}
                <div 
                    onClick={() => setShowSuppliesModal(true)}
                    className="p-3.5 flex items-center justify-between cursor-pointer transition-all group border border-sky-100 rounded-2xl bg-sky-50 hover:border-sky-200 hover:bg-sky-100/50 shadow-sm gap-2"
                >
                    <div className="flex items-center gap-3 sm:gap-4 shrink-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                            <FileText size={24} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-[14px] sm:text-lg text-slate-900 leading-tight truncate">Exercices</h3>
                            <p className="text-[11px] sm:text-xs font-medium text-sky-700 truncate">Exercices par matière ({currentStudent?.class})</p>
                        </div>
                    </div>
                    <span className="font-bold text-[10px] sm:text-xs bg-sky-600 text-white px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full shadow-sm group-hover:bg-sky-700 transition-colors whitespace-nowrap shrink-0">
                        Voir les matières
                    </span>
                </div>

                {/* Matières & Résultats Widget (Mobile Only) */}
                <div 
                    onClick={() => setShowMobileSubjects(true)}
                    className="md:hidden p-3.5 flex items-center justify-between cursor-pointer transition-all group border border-blue-200 rounded-2xl bg-blue-100 hover:border-blue-300 shadow-sm gap-2"
                >
                    <div className="flex items-center gap-3 sm:gap-4 shrink-1 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                            <BookOpen size={24} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-[14px] sm:text-lg text-slate-900 leading-tight truncate">Matières & Résultats</h3>
                            <p className="text-[11px] sm:text-xs font-medium text-blue-700 truncate">Notes et moyennes</p>
                        </div>
                    </div>
                    <span className="font-bold text-[10px] sm:text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-sm shrink-0">
                        Voir tout
                    </span>
                </div>

                {/* Cursus de l'élève Widget */}
                {!(currentUser?.role === 'teacher' || currentUser?.role === 'professeur' || currentUser?.accessLevel === 3) && (
                  <div 
                      onClick={() => setShowCursusModal(true)}
                      className="p-3.5 flex items-center justify-between cursor-pointer transition-all group border border-indigo-100 rounded-2xl bg-indigo-50/70 hover:border-indigo-200 hover:bg-indigo-100/60 shadow-sm gap-2"
                  >
                      <div className="flex items-center gap-3 sm:gap-4 shrink-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                              <GraduationCap size={24} />
                          </div>
                          <div className="min-w-0">
                              <h3 className="font-bold text-[14px] sm:text-lg text-slate-900 leading-tight truncate">Cursus de l'Élève</h3>
                              <p className="text-[11px] sm:text-xs font-medium text-indigo-700 truncate">Parcours & Livret ({currentStudent?.class})</p>
                          </div>
                      </div>
                      <span className="font-bold text-[10px] sm:text-xs bg-indigo-600 text-white px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full shadow-sm group-hover:bg-indigo-700 transition-colors whitespace-nowrap shrink-0">
                          Voir le Cursus
                      </span>
                  </div>
                )}
            </div>

            <div className="flex-1 flex flex-col gap-4">
               <div className="hidden md:block">
                 <TransactionList
                      subjects={augmentedSubjects}
                      onSelectSubject={handleSelectSubject}
                     currentUser={currentUser}
                     studentClass={currentStudent.class}
                 />
               </div>
               <ClassResultsCard
                 minAverage={minAverage}
                 maxAverage={maxAverage}
                 classAverage={classAverage}
                 canEditDirectorSection={canEditDirectorSection}
                 faitA={faitA}
                 onFaitAChange={setFaitA}
                 faitLe={faitLe}
                 onFaitLeChange={setFaitLe}
                 directorName={directorName}
                 onDirectorNameChange={setDirectorName}
                 signatureText={signatureText}
                 onSignatureTextChange={setSignatureText}
                 stampImage={stampImage}
                 onStampImageChange={setStampImage}
               />
            </div>
          </div>
        </div>

        {((isTech && (selectedTrim === '2ème trim' || selectedTrim === '2ème Trimestre' || selectedTrim === '2ème Semestre' || selectedTrim === 'Semestre 2' || selectedTrim === '2e Sem' || selectedTrim === '2ème Sem')) || (!isTech && (selectedTrim === '3ème trim' || selectedTrim === '3ème Trimestre'))) && (
          <div className="pb-8 space-y-4">
            <BilanFinAnneeCard
              isTech={isTech}
              t1Avg={t1Avg}
              t2Avg={t2Avg}
              t3Avg={t3Avg}
              t1Coef={t1Coef}
              t2Coef={t2Coef}
              t3Coef={t3Coef}
              t1Rank={t1Rank}
              t2Rank={t2Rank}
              t3Rank={t3Rank}
              annualAvg={annualAvg}
              annualRank={annualRank}
              decision={annualDecision}
              onDecisionChange={handleAnnualDecisionChange}
              teacherName={teacherName}
              onTeacherNameChange={setTeacherName}
              isTeacherSigned={isTeacherSigned}
              onToggleTeacherSigned={() => setIsTeacherSigned(!isTeacherSigned)}
              teacherSignature={currentStudent?.teacherSignature || null}
              faitA={faitA}
              onFaitAChange={setFaitA}
              faitLe={faitLe}
              onFaitLeChange={setFaitLe}
              directorName={directorName}
              onDirectorNameChange={setDirectorName}
              signatureText={signatureText}
              onSignatureTextChange={setSignatureText}
              stampImage={stampImage}
              onStampImageChange={setStampImage}
              canEditAppreciation={canEditAppreciation}
              canEditDirectorSection={canEditDirectorSection}
              onLaunchCloture={canLaunchCloture ? () => setIsBilanModalOpen(true) : undefined}
              currentUser={currentUser}
            />

            {canLaunchCloture && (
              <div className="flex justify-center items-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsBilanModalOpen(true)}
                  className="px-8 py-3.5 bg-[#BFDBFE] hover:bg-[#93c5fd] text-blue-950 font-extrabold rounded-2xl shadow-xl shadow-blue-300/30 hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 text-sm sm:text-base border border-blue-300/60 cursor-pointer"
                >
                  <GraduationCap size={22} className="text-amber-500 animate-bounce" />
                  <span>Lancer la Clôture de l'Année (Calcul, Passages & Redoublements)</span>
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Edit Modal */}
      <AnimatePresence>
      {showEditModal && !readOnly && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-center items-center">
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                 onClick={() => setShowEditModal(false)}
              ></motion.div>
              <motion.div 
                 initial={{ y: "100%", scale: 1 }}
                 animate={{ y: 0, scale: 1 }}
                 exit={{ y: "100%", scale: 0.95 }}
                 transition={{ type: "spring", damping: 25, stiffness: 200 }}
                 className="bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] p-6 md:p-8 pb-safe relative z-50 w-full max-h-[90vh] md:max-h-[85vh] md:max-w-2xl shadow-2xl flex flex-col"
              >
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0 md:hidden" />
                  <div className="flex justify-between items-center mb-6 shrink-0">
                      <div>
                          <h2 className="text-xl font-bold text-gray-800">Modifier la Carte</h2>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">Mise à jour complète des informations de l'élève</p>
                      </div>
                      <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20}/></button>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-5 pb-6">
                      
                      {/* Section 1: État Civil / Identité */}
                      <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100/80 space-y-4">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                              État Civil / Identité
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">Prénom</label>
                                  <input 
                                      type="text" 
                                      value={editForm.firstName} 
                                      onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                                      placeholder="Ex: Jean"
                                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white font-medium"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">Nom</label>
                                  <input 
                                      type="text" 
                                      value={editForm.lastName} 
                                      onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                                      placeholder="Ex: Dupont"
                                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white font-medium"
                                  />
                              </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">Sexe</label>
                                  <select
                                      value={editForm.gender}
                                      onChange={(e) => setEditForm({...editForm, gender: e.target.value as 'M' | 'F'})}
                                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white font-semibold"
                                  >
                                      <option value="M">Masculin (M)</option>
                                      <option value="F">Féminin (F)</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">Matricule</label>
                                  <input 
                                      type="text" 
                                      value={editForm.matricule} 
                                      onChange={(e) => setEditForm({...editForm, matricule: e.target.value})}
                                      placeholder="Ex: 2024-2854"
                                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white font-mono font-semibold"
                                  />
                              </div>
                          </div>
                      </div>

                      {/* Section 2: Naissance & Acte */}
                      <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100/80 space-y-4">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                              Naissance & Acte de Naissance
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">Date de Naissance</label>
                                  <input 
                                      type="text" 
                                      value={editForm.dob} 
                                      onChange={(e) => setEditForm({...editForm, dob: e.target.value})}
                                      placeholder="jj/mm/aaaa"
                                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white font-medium"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">Lieu de Naissance</label>
                                  <input 
                                      type="text" 
                                      value={editForm.birthPlace} 
                                      onChange={(e) => setEditForm({...editForm, birthPlace: e.target.value})}
                                      placeholder="Ex: Abidjan, Cocody"
                                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white font-medium"
                                  />
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Numéro et date de l'acte de naissance</label>
                              <input 
                                  type="text" 
                                  value={editForm.birthCertificateNumber} 
                                  onChange={(e) => setEditForm({...editForm, birthCertificateNumber: e.target.value})}
                                  placeholder="Ex: 3913 DU 27/03/2006 ETABLI A ABOBO"
                                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white font-medium uppercase"
                              />
                              <span className="text-[10px] text-gray-400 mt-1.5 block leading-normal">
                                  <strong>Format recommandé :</strong> N° D'ACTE + DATE DE DÉLIVRANCE + LIEU D'ÉTABLISSEMENT (ex: 3913 DU 27/03/2006 ETABLI A ABOBO)
                              </span>
                          </div>
                      </div>

                      {/* Section 3: Scolarité & Origine */}
                      <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100/80 space-y-4">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                              Scolarité & Origine
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">Classe assignée</label>
                                  <select
                                      value={editForm.className}
                                      onChange={(e) => setEditForm({...editForm, className: e.target.value})}
                                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white font-medium"
                                  >
                                      <option value="">Choisir une classe...</option>
                                      {mockClasses.map((c) => (
                                          <option key={c.id} value={c.name}>{c.name} ({c.section})</option>
                                      ))}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">Statut d'affectation</label>
                                  <select
                                      value={editForm.assignedStatus}
                                      onChange={(e) => setEditForm({...editForm, assignedStatus: e.target.value as 'affecte' | 'non_affecte'})}
                                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white font-medium"
                                  >
                                      <option value="affecte">Affecté par l'État</option>
                                      <option value="non_affecte">Non affecté</option>
                                  </select>
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Pays & Nationalité</label>
                              <select
                                  value={editForm.country}
                                  onChange={(e) => {
                                      const cKey = e.target.value;
                                      const cData = COUNTRIES_DATA[cKey];
                                      setEditForm({
                                          ...editForm,
                                          country: cKey,
                                          nationality: cData ? cData.nationality : 'Ivoirienne'
                                      });
                                  }}
                                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white font-medium"
                              >
                                  {Object.keys(COUNTRIES_DATA).map((cKey) => (
                                      <option key={cKey} value={cKey}>
                                          {COUNTRIES_DATA[cKey].flagEmoji} {cKey} ({COUNTRIES_DATA[cKey].nationality})
                                      </option>
                                  ))}
                              </select>
                          </div>
                      </div>

                      {/* Section 4: Parents & Contacts */}
                      <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100/80 space-y-4">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                              Parents & Contacts d'urgence
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone du Père</label>
                                  <input 
                                      type="text" 
                                      value={editForm.fatherPhone} 
                                      onChange={(e) => setEditForm({...editForm, fatherPhone: e.target.value})}
                                      placeholder="+225 07 01 02 03 04"
                                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white font-semibold"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone de la Mère</label>
                                  <input 
                                      type="text" 
                                      value={editForm.motherPhone} 
                                      onChange={(e) => setEditForm({...editForm, motherPhone: e.target.value})}
                                      placeholder="+225 05 01 02 03 04"
                                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white font-semibold"
                                  />
                              </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email du Père <span className="text-[10px] text-gray-400 font-normal">(Optionnel)</span></label>
                                  <input 
                                      type="email" 
                                      value={editForm.fatherEmail} 
                                      onChange={(e) => setEditForm({...editForm, fatherEmail: e.target.value})}
                                      placeholder="pere@example.com"
                                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white font-medium"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email de la Mère <span className="text-[10px] text-gray-400 font-normal">(Optionnel)</span></label>
                                  <input 
                                      type="email" 
                                      value={editForm.motherEmail} 
                                      onChange={(e) => setEditForm({...editForm, motherEmail: e.target.value})}
                                      placeholder="mere@example.com"
                                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white font-medium"
                                  />
                              </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone Élève <span className="text-[10px] text-gray-400 font-normal">(Optionnel)</span></label>
                                  <input 
                                      type="text" 
                                      value={editForm.studentPhone} 
                                      onChange={(e) => setEditForm({...editForm, studentPhone: e.target.value})}
                                      placeholder="+225 01 64 23 89 10"
                                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white font-medium"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone Tuteur <span className="text-[10px] text-gray-400 font-normal">(Optionnel)</span></label>
                                  <input 
                                      type="text" 
                                      value={editForm.tutorPhone} 
                                      onChange={(e) => setEditForm({...editForm, tutorPhone: e.target.value})}
                                      placeholder="+225 ..."
                                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white font-medium"
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0">
                      <button 
                          onClick={() => setShowEditModal(false)}
                          className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all text-sm"
                      >
                          Annuler
                      </button>
                      <button 
                          onClick={handleSaveEdit} 
                          className="px-6 py-3 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-sky-200 flex items-center justify-center gap-2 text-sm cursor-pointer"
                      >
                          <Save size={16} />
                          Enregistrer
                      </button>
                  </div>
              </motion.div>
          </div>
      )}
      </AnimatePresence>

      {/* Grade Details Bottom Sheet */}
      <AnimatePresence>
      {selectedSubject && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end items-center">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
               onClick={() => setSelectedSubject(null)}
            ></motion.div>
            <motion.div 
               initial={{ y: "100%" }}
               animate={{ y: 0 }}
               exit={{ y: "100%" }}
               transition={{ type: "spring", damping: 25, stiffness: 200 }}
               className="bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] md:mb-8 w-full md:max-w-2xl h-[85vh] md:h-auto md:max-h-[85vh] shadow-2xl relative flex flex-col p-6 pb-safe"
            >
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0 md:hidden" />
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h2 className="text-2xl font-bold">{selectedSubject.name}</h2>
                    <button onClick={() => setSelectedSubject(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
                </div>

                <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className="font-bold text-gray-800">Notes & Devoirs</h3>
                    {canEditGrades && (
                        <button 
                            onClick={() => setShowAddGrade(!showAddGrade)}
                            className="text-xs font-bold bg-sky-50 text-sky-600 px-3 py-1.5 rounded-lg hover:bg-sky-600 hover:text-white transition-all flex items-center gap-1"
                        >
                            <Plus size={14} />
                            Nouvelle Note
                        </button>
                    )}
                </div>

                {/* Scrollable Modal Body */}
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-16">
                    {/* Add Grade Form (Only if canEditGrades) */}
                    {showAddGrade && canEditGrades && (
                        <div className="mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 animate-in slide-in-from-top-2 shrink-0">
                        <div className="flex flex-col gap-3">
                            {/* Styled Dropdown for Grade Type */}
                            <div className="relative">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Type d'évaluation</label>
                                <button
                                    type="button"
                                    onClick={() => setShowGradeTypeDropdown(!showGradeTypeDropdown)}
                                    className="w-full flex items-center justify-between bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 shadow-sm hover:border-sky-300 transition-colors"
                                >
                                    <span className="flex items-center gap-2">
                                        {newGradeForm.type === 'interrogation' ? (
                                            <>
                                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                                                <span>Interrogation (Sur {newGradeForm.interroMax || '20'})</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
                                                <span>Devoir (Coef {newGradeForm.coef || '1'})</span>
                                            </>
                                        )}
                                    </span>
                                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${showGradeTypeDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showGradeTypeDropdown && (
                                    <div className="absolute left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewGradeForm({ ...newGradeForm, type: 'interrogation', coef: '1' });
                                                setShowGradeTypeDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between ${newGradeForm.type === 'interrogation' ? 'bg-sky-50/60 text-sky-700 font-bold' : 'text-slate-700 font-medium'}`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                                <div>
                                                    <div className="text-xs font-bold">Interrogation</div>
                                                    <div className="text-[10px] text-slate-400 font-normal">Coefficient 1 automatique</div>
                                                </div>
                                            </div>
                                            {newGradeForm.type === 'interrogation' && <Check size={14} className="text-sky-600" />}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewGradeForm({ ...newGradeForm, type: 'devoir', coef: newGradeForm.coef || '2' });
                                                setShowGradeTypeDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between ${newGradeForm.type === 'devoir' ? 'bg-sky-50/60 text-sky-700 font-bold' : 'text-slate-700 font-medium'}`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                                                <div>
                                                    <div className="text-xs font-bold">Devoir</div>
                                                    <div className="text-[10px] text-slate-400 font-normal">Devoir surveillé / de synthèse</div>
                                                </div>
                                            </div>
                                            {newGradeForm.type === 'devoir' && <Check size={14} className="text-sky-600" />}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Option selector if Interrogation is selected */}
                            {newGradeForm.type === 'interrogation' && (
                                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                                    <label className="text-[11px] font-bold text-slate-600 mb-1.5 block">Barème de l'interrogation :</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setNewGradeForm({ ...newGradeForm, interroMax: '10' })}
                                            className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                                                newGradeForm.interroMax === '10'
                                                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            <span>Note sur 10 (/ 10)</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewGradeForm({ ...newGradeForm, interroMax: '20' })}
                                            className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                                                newGradeForm.interroMax === '20' || !newGradeForm.interroMax
                                                    ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            <span>Note sur 20 (/ 20)</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Coefficient selector if Devoir is selected */}
                            {newGradeForm.type === 'devoir' && (
                                <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                                    <label className="text-[11px] font-bold text-slate-600 mb-1.5 block">Multiplier le devoir par :</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setNewGradeForm({ ...newGradeForm, coef: '1' })}
                                            className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                                                newGradeForm.coef === '1'
                                                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            <span>Multiplié par 1 (Coef 1)</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setNewGradeForm({ ...newGradeForm, coef: '2' })}
                                            className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                                                newGradeForm.coef === '2'
                                                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                                                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                            <span>Multiplié par 2 (Coef 2)</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Title and Score Inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Titre (optionnel)</label>
                                    <input
                                        placeholder={newGradeForm.type === 'interrogation' ? 'Interrogation N°1' : 'Devoir N°1'}
                                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                        value={newGradeForm.title}
                                        onChange={e => setNewGradeForm({ ...newGradeForm, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                        {newGradeForm.type === 'devoir' && newGradeForm.coef === '2'
                                            ? 'Note (sur 20 x2 = sur 40)'
                                            : newGradeForm.type === 'interrogation' && newGradeForm.interroMax === '10'
                                            ? 'Note sur 10'
                                            : 'Note sur 20'}
                                    </label>
                                    <input
                                        placeholder={
                                            newGradeForm.type === 'devoir' && newGradeForm.coef === '2'
                                                ? 'Note / 20 ou / 40'
                                                : newGradeForm.type === 'interrogation' && newGradeForm.interroMax === '10'
                                                ? 'Note / 10'
                                                : 'Note / 20'
                                        }
                                        type="number"
                                        min="0"
                                        max={
                                            newGradeForm.type === 'devoir' && newGradeForm.coef === '2'
                                                ? '40'
                                                : newGradeForm.type === 'interrogation' && newGradeForm.interroMax === '10'
                                                ? '10'
                                                : '20'
                                        }
                                        step="0.25"
                                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                                        value={newGradeForm.score}
                                        onChange={e => setNewGradeForm({ ...newGradeForm, score: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Section Appréciation automatique / sur-mesure selon la note */}
                            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5 uppercase tracking-wider">
                                        <Sparkles size={13} className="text-amber-500" />
                                        Appréciation selon la note
                                    </label>
                                    {newGradeForm.score && !isNaN(parseFloat(newGradeForm.score)) && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const scoreNum = parseFloat(newGradeForm.score);
                                                const isDevoirCoef2 = newGradeForm.type === 'devoir' && newGradeForm.coef === '2';
                                                const isInterro10 = newGradeForm.type === 'interrogation' && newGradeForm.interroMax === '10';
                                                const maxLimit = isDevoirCoef2 ? 40 : (isInterro10 ? 10 : 20);
                                                const appInfo = getGradeAppreciations(scoreNum, maxLimit);
                                                setNewGradeForm({ ...newGradeForm, appreciation: appInfo.defaultAppreciation });
                                            }}
                                            className="text-[10px] font-extrabold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 active:scale-95"
                                        >
                                            <Sparkles size={11} className="text-amber-500" />
                                            Générer auto
                                        </button>
                                    )}
                                </div>

                                <input
                                    placeholder="Ex: Excellent travail, élève très attentif..."
                                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-colors"
                                    value={newGradeForm.appreciation || ''}
                                    onChange={e => setNewGradeForm({ ...newGradeForm, appreciation: e.target.value })}
                                />

                                {/* Suggestions d'appréciations personnalisées selon la note tapée */}
                                {newGradeForm.score && !isNaN(parseFloat(newGradeForm.score)) && (
                                    <div className="flex flex-wrap items-center gap-1.5 pt-2">
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-0.5">Suggestions :</span>
                                        {getGradeAppreciations(
                                            parseFloat(newGradeForm.score),
                                            newGradeForm.type === 'devoir' && newGradeForm.coef === '2' ? 40 : (newGradeForm.type === 'interrogation' && newGradeForm.interroMax === '10' ? 10 : 20)
                                        ).suggestions.map((sug, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setNewGradeForm({ ...newGradeForm, appreciation: sug })}
                                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
                                                    newGradeForm.appreciation === sug
                                                        ? 'bg-sky-600 text-white border-sky-600 shadow-sm scale-105'
                                                        : 'bg-slate-50 hover:bg-sky-50 hover:border-sky-200 text-slate-700 border-slate-200'
                                                }`}
                                            >
                                                {sug}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {gradeError && (
                                <p className="text-xs text-red-500 font-semibold">{gradeError}</p>
                            )}

                            <button
                                type="button"
                                onClick={handleAddGrade}
                                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-xl shadow-md transition-colors text-xs mt-1"
                            >
                                Ajouter la note
                            </button>
                        </div>
                    </div>
                )}

                {currentGrades.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            Aucune note enregistrée.
                        </div>
                    ) : (
                        currentGrades.map((grade) => (
                            <div key={grade.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shrink-0 group">
                            {editingGradeId === grade.id ? (
                                <div className="flex items-center gap-2 w-full">
                                    <div className="flex flex-col gap-2 flex-1">
                                        <input className="p-2 text-sm rounded border border-gray-200" value={editGradeForm.title} onChange={e => setEditGradeForm({...editGradeForm, title: e.target.value})} />
                                        <input type="number" className="p-2 text-sm rounded border border-gray-200" value={editGradeForm.score} onChange={e => setEditGradeForm({...editGradeForm, score: e.target.value})} />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <button onClick={handleSaveEditGrade} className="p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-colors">
                                            <Save size={16} />
                                        </button>
                                        <button onClick={() => setEditingGradeId(null)} className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors">
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-800">{grade.title}</span>
                                        {grade.appreciation && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70 w-fit">
                                                <MessageSquare size={10} className="text-amber-600 shrink-0" />
                                                {grade.appreciation}
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-400 mt-0.5">{grade.date}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {grade.type === 'plus' || grade.isBonus || (grade.title && (grade.title.includes('Participation (+') || grade.title.includes('Bonus/Malus (+')) ) ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-sm">
                                                +{grade.points || parseFloat(grade.title?.match(/\+([\d.]+)/)?.[1] || '1')} pt{(grade.points || 1) > 1 ? 's' : ''}
                                            </div>
                                        ) : grade.type === 'minus' || (grade.title && (grade.title.includes('Participation (-') || grade.title.includes('Bonus/Malus (-')) ) ? (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-xl font-bold text-sm">
                                                -{grade.points || parseFloat(grade.title?.match(/-([\d.]+)/)?.[1] || '1')} pt{(grade.points || 1) > 1 ? 's' : ''}
                                            </div>
                                        ) : (
                                            <span className="text-lg font-bold text-sky-600">{grade.score}/{(grade as any).maxScore || (grade.coef === 2 ? 40 : 20)}</span>
                                        )}
                                        {canEditGrades && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEditGrade(grade)} className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors">
                                                    <PenLine size={16} />
                                                </button>
                                                <button onClick={() => handleDeleteGrade(grade.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
                </div>
                {canEditGrades && (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2 shrink-0">
                        <button 
                            onClick={handleAddMinus}
                            className="flex items-center gap-1 text-sm font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 whitespace-nowrap transition-colors"
                        >
                            <Minus size={16} /> Donner un -
                        </button>
                        <button 
                            onClick={handleAddBonus}
                            className="flex items-center gap-1 text-sm font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-100 whitespace-nowrap transition-colors"
                        >
                            <Plus size={16} /> Donner un +
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* Absence Bottom Sheet - NOW SHOWS REAL HISTORY WITH SUBJECT/TIME */}
      <AnimatePresence>
      {showAbsenceModal && currentStudent && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end items-center">
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                 onClick={() => setShowAbsenceModal(false)}
              ></motion.div>
              <motion.div 
                 initial={{ y: "100%" }}
                 animate={{ y: 0 }}
                 exit={{ y: "100%" }}
                 transition={{ type: "spring", damping: 25, stiffness: 200 }}
                 className="bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] md:mb-8 w-full md:max-w-xl h-[85vh] md:h-auto md:max-h-[85vh] p-6 pb-safe relative shadow-2xl flex flex-col"
              >
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0 md:hidden" />
                  <div className="flex justify-between items-center mb-6 shrink-0">
                      <h2 className="text-xl font-bold text-gray-800">Historique d'Assiduité</h2>
                      <button onClick={() => setShowAbsenceModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 shrink-0">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Heures d'absence</p>
                          <p className={`text-lg font-black ${totalAbsenceHours > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{totalAbsenceHours}h</p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Absences</p>
                          <p className="text-lg font-black text-slate-800">{totalAbsenceCount}</p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Retards</p>
                          <p className="text-lg font-black text-slate-800">{totalLateCount}</p>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Taux Présence</p>
                          <p className="text-lg font-black text-emerald-600">{attendanceRate}%</p>
                      </div>
                  </div>

                  <div className="space-y-3 mt-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
                       {currentStudent.attendanceHistory && currentStudent.attendanceHistory.length > 0 ? (
                           currentStudent.attendanceHistory.map((record) => (
                               <div key={record.id} className="p-3.5 bg-gray-50 rounded-2xl flex justify-between items-center border border-gray-100 shrink-0 hover:bg-gray-100/80 transition-colors">
                                   <div className="flex items-center gap-3">
                                       <div className={`p-2.5 rounded-xl flex items-center justify-center ${record.type === 'absent' ? 'bg-sky-100 text-[#0ea5e9]' : 'bg-orange-100 text-orange-500'}`}>
                                           {record.type === 'absent' ? <XCircle size={18}/> : <Clock size={18}/>}
                                       </div>
                                       <div>
                                           <div className="flex items-center gap-2">
                                               <p className="font-bold text-gray-800 text-sm">{record.type === 'absent' ? 'Absence' : 'Retard'}</p>
                                               <span className="text-xs font-semibold text-gray-500">• {record.hours}h</span>
                                           </div>
                                           <div className="flex flex-col gap-0.5">
                                               <p className="text-xs text-gray-400 font-medium">{record.date} {record.exactTime && `à ${record.exactTime}`}</p>
                                               {record.teacherName && (
                                                   <p className="text-[10px] text-sky-600 font-semibold flex items-center gap-1">
                                                       <User size={10} /> {record.teacherName}
                                                   </p>
                                               )}
                                           </div>
                                           
                                           {/* Display Subject and Time */}
                                           <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 w-fit">
                                               <BookOpen size={10} />
                                               <span>{record.subject || 'Matière non spécifiée'} • {record.timeSlot || 'Heure non spécifiée'}</span>
                                           </div>
                                       </div>
                                   </div>
                                   <div className="flex items-center gap-2">
                                       <button 
                                           onClick={() => handleToggleJustifiedRecord(record.id)}
                                           disabled={readOnly}
                                           title="Cliquer pour modifier le statut de justification"
                                           className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition-all ${record.justified ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'}`}
                                       >
                                           {record.justified ? 'Justifié' : 'Non justifié'}
                                       </button>
                                       {!readOnly && (
                                           <button 
                                               onClick={() => handleDeleteAttendanceRecord(record.id)}
                                               title="Supprimer cette absence"
                                               className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                           >
                                               <Trash2 size={16} />
                                           </button>
                                       )}
                                   </div>
                               </div>
                           ))
                       ) : (
                           <div className="text-center py-12 text-gray-300 shrink-0">
                               <CheckCircle size={48} className="mx-auto mb-2 opacity-20"/>
                               <p className="font-medium">Aucune absence ou retard.</p>
                               <p className="text-xs mt-1">L'élève est exemplaire !</p>
                           </div>
                       )}
                  </div>
                  
                  <button onClick={() => setShowAbsenceModal(false)} className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors shrink-0">Fermer</button>
              </motion.div>
          </div>
      )}
      </AnimatePresence>

      {/* Grade Error Modal */}
      <AnimatePresence>
        {gradeError && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setGradeError(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl z-10 w-full max-w-sm text-center flex flex-col items-center relative overflow-hidden"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <AlertOctagon size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Erreur</h3>
              <p className="text-gray-500 mb-8 font-medium">
                  {gradeError}
              </p>
              <button
                onClick={() => setGradeError(null)}
                className="w-full py-3.5 rounded-2xl font-bold bg-sky-600 text-white hover:bg-sky-700 transition-colors shadow-lg shadow-sky-200"
              >
                Compris
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bonus/Minus Confirmation Modal */}
      <AnimatePresence>
        {bonusMinusConfig.isOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setBonusMinusConfig(prev => ({ ...prev, isOpen: false }))}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl z-10 w-full max-w-md text-center flex flex-col relative overflow-hidden"
            >
              <div className={`w-14 h-14 ${bonusMinusConfig.type === 'plus' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner`}>
                  {bonusMinusConfig.type === 'plus' ? <Plus size={28} /> : <Minus size={28} />}
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                  Donner un {bonusMinusConfig.type === 'plus' ? 'Bonus (+)' : 'Malus (-)'}
              </h3>

              {bonusMinusConfig.step === 'target' ? (
                <div className="mt-2 text-left">
                  <p className="text-gray-500 mb-4 text-center font-medium text-sm">
                    Où souhaitez-vous appliquer ce {bonusMinusConfig.type === 'plus' ? 'bonus' : 'malus'} ?
                  </p>

                  <div className="space-y-3 mb-6">
                    <button
                      onClick={() => setBonusMinusConfig(prev => ({ ...prev, target: 'moyenne', step: 'value' }))}
                      className="w-full p-4 rounded-2xl border-2 border-gray-100 hover:border-sky-500 bg-gray-50 hover:bg-sky-50/50 transition-all flex items-start gap-3 text-left group"
                    >
                      <div className="p-2.5 rounded-xl bg-sky-100 text-sky-600 group-hover:scale-110 transition-transform">
                        <TrendingUp size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-800 text-sm">Sur la moyenne</span>
                          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-sky-100 text-sky-700 rounded-md">Moyenne</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          S'ajoute ou se retire directement sur la moyenne de la matière.
                        </p>
                      </div>
                    </button>

                    <button
                      onClick={() => setBonusMinusConfig(prev => ({ ...prev, target: 'note', step: 'value' }))}
                      className="w-full p-4 rounded-2xl border-2 border-gray-100 hover:border-purple-500 bg-gray-50 hover:bg-purple-50/50 transition-all flex items-start gap-3 text-left group"
                    >
                      <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-800 text-sm">Note / Devoir Bonus</span>
                          <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md">Devoir</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          Compté comme une évaluation / note de participation dans la liste.
                        </p>
                      </div>
                    </button>
                  </div>

                  <button
                    onClick={() => setBonusMinusConfig(prev => ({ ...prev, isOpen: false }))}
                    className="w-full py-3 rounded-2xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm"
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <div className="mt-2 text-left">
                  <div className="flex items-center justify-between bg-gray-100 px-3 py-1.5 rounded-xl mb-4 text-xs">
                    <span className="font-medium text-gray-600">
                      Option : <strong className="text-gray-900">{bonusMinusConfig.target === 'moyenne' ? 'Sur la moyenne' : 'Note / Devoir Bonus'}</strong>
                    </span>
                    <button 
                      onClick={() => setBonusMinusConfig(prev => ({ ...prev, step: 'target' }))}
                      className="text-sky-600 hover:underline font-bold text-[11px]"
                    >
                      Changer
                    </button>
                  </div>

                  <p className="text-gray-500 mb-3 text-center font-medium text-xs sm:text-sm">
                    Combien de points voulez-vous {bonusMinusConfig.type === 'plus' ? 'ajouter' : 'retirer'} ?
                  </p>

                  <div className="grid grid-cols-5 gap-1.5 mb-4">
                    {['0.5', '1', '1.5', '2', '3'].map((pts) => (
                      <button
                        key={pts}
                        onClick={() => setBonusMinusConfig(prev => ({ ...prev, value: pts }))}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                          bonusMinusConfig.value === pts
                            ? bonusMinusConfig.type === 'plus' 
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                              : 'bg-red-500 text-white border-red-500 shadow-sm'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {bonusMinusConfig.type === 'plus' ? '+' : '-'}{pts}
                      </button>
                    ))}
                  </div>

                  <div className="mb-5">
                    <input 
                      type="number" 
                      value={bonusMinusConfig.value}
                      onChange={(e) => setBonusMinusConfig(prev => ({ ...prev, value: e.target.value }))}
                      className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-2xl font-bold text-center focus:ring-2 focus:ring-sky-500 outline-none transition-all"
                      min="0.25"
                      step="0.25"
                      placeholder="Nombre de points"
                    />
                  </div>

                  <div className="flex w-full gap-2.5">
                    <button
                      onClick={() => setBonusMinusConfig(prev => ({ ...prev, step: 'target' }))}
                      className="flex-1 py-3 rounded-2xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm"
                    >
                      Retour
                    </button>
                    <button
                      onClick={confirmBonusMinus}
                      className={`flex-1 py-3 rounded-2xl font-bold text-white transition-colors shadow-lg text-sm ${
                        bonusMinusConfig.type === 'plus' 
                          ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200' 
                          : 'bg-red-500 hover:bg-red-600 shadow-red-200'
                      }`}
                    >
                      Confirmer ({bonusMinusConfig.type === 'plus' ? '+' : '-'}{bonusMinusConfig.value || '0'} pt)
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Grade Confirmation Modal */}
      <AnimatePresence>
        {gradeToDelete !== null && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setGradeToDelete(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl z-10 w-full max-w-sm text-center flex flex-col items-center relative overflow-hidden"
            >
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                  <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Supprimer la note ?</h3>
              <p className="text-gray-500 mb-8 font-medium">
                  Êtes-vous sûr de vouloir supprimer cette note ? La moyenne sera recalculée.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setGradeToDelete(null)}
                  className="flex-1 py-3.5 rounded-2xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDeleteGrade}
                  className="flex-1 py-3.5 rounded-2xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMobileSubjects && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileSubjects(false)}
              className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[101] bg-[#BFDBFE] rounded-t-[40px] p-6 pt-4 flex flex-col md:hidden max-h-[85vh] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
            >
              {/* Handle bar */}
              <div className="w-12 h-1 bg-blue-300 rounded-full mx-auto mb-8 shrink-0 opacity-80" />
              
              <div className="flex items-center justify-between mb-8 shrink-0 px-2">
                <h2 className="text-[22px] font-bold text-[#2A346E]">Matières</h2>
                <button 
                  className="flex items-center gap-1 text-[15px] text-[#2A346E] opacity-90 transition-colors"
                >
                  Tout <ChevronDown size={18} />
                </button>
              </div>
              
              <div className="overflow-y-auto custom-scrollbar flex-1 pb-10 flex flex-col gap-6 px-2">
                {augmentedSubjects.map((subject, index) => {
                  const isRestricted = currentUser?.role === 'teacher' && currentUser?.subject && !isSubjectMatch(currentUser.subject, subject.name);
                  const subjCoef = getSubjectCoef(currentStudent?.class, subject.name);
                  return (
                    <div 
                      key={index} 
                      onClick={() => {
                        if (!isRestricted) {
                          handleSelectSubject(subject);
                          setShowMobileSubjects(false);
                        }
                      }}
                      className={`flex items-center justify-between ${isRestricted ? 'opacity-50' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-[52px] h-[52px] bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                          {/* We try to use the color mapped to the subject for the logo text */}
                          <span className="font-black text-xl" style={{ color: subject.fill || '#3b82f6' }}>
                            {subject.name.substring(0, 1).toLowerCase()}{subject.name.includes(' ') ? subject.name.split(' ')[1].substring(0, 1).toLowerCase() : subject.name.substring(1, 2).toLowerCase()}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-[#2A346E] text-[16px] tracking-tight">{subject.name}</span>
                          <span className="text-[13px] text-[#2A346E] opacity-60 font-medium">Coef. {subjCoef}</span>
                        </div>
                      </div>
                      <div className="font-black text-[22px] text-[#2A346E] tracking-tight">
                        {Number(subject.average || 0).toFixed(2)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <StudentSuppliesModal
        isOpen={showSuppliesModal}
        onClose={() => setShowSuppliesModal(false)}
        className={currentStudent?.class || 'Seconde C1'}
        studentId={currentStudent?.id || 'default'}
        studentName={currentStudent?.name}
        currentUser={currentUser}
      />

      <StudentCursusModal
        isOpen={showCursusModal}
        onClose={() => setShowCursusModal(false)}
        student={currentStudent}
        readOnly={readOnly}
        currentUser={currentUser}
      />

      {/* LIGHT BLUE FLOATING PLUS BUTTON (DESKTOP) */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-[100] flex-col items-end">
        <AnimatePresence>
          {desktopFloatingMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90]"
                onClick={() => setDesktopFloatingMenuOpen(false)}
              />
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-end space-y-3 mb-4 z-[100]"
              >
                <button 
                  onClick={() => { setDesktopFloatingMenuOpen(false); onNavigate?.('card'); }} 
                  className="flex items-center space-x-3 bg-white pl-4 pr-1.5 py-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:scale-105 transition-transform border border-slate-100 w-max cursor-pointer"
                >
                  <span className="text-slate-700 font-semibold text-[14px]">Ma carte</span>
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                    <CreditCard size={16} />
                  </div>
                </button>
                <button 
                  onClick={() => { setDesktopFloatingMenuOpen(false); onNavigate?.('settings'); }} 
                  className="flex items-center space-x-3 bg-white pl-4 pr-1.5 py-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:scale-105 transition-transform border border-slate-100 w-max cursor-pointer"
                >
                  <span className="text-slate-700 font-semibold text-[14px]">Paramètres</span>
                  <div className="w-8 h-8 rounded-full bg-[#F0F5FA] flex items-center justify-center">
                    <Settings size={16} className="text-slate-700" />
                  </div>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setDesktopFloatingMenuOpen(!desktopFloatingMenuOpen)}
          className="w-14 h-14 bg-[#B0D9FD] text-white rounded-[18px] flex items-center justify-center shadow-lg hover:brightness-95 transition-all z-[100] cursor-pointer"
          title="Menu rapide"
        >
          <Plus className={`w-7 h-7 transition-transform duration-300 ${desktopFloatingMenuOpen ? 'rotate-45' : ''}`} strokeWidth={2.5} />
        </button>
      </div>
    </div>

    {/* OFFICIAL BULLETIN DE NOTES FOR PRINT */}
    <PrintableBulletin 
      currentUser={currentUser}
      isOpen={isPrintModalOpen}
      onClose={() => setIsPrintModalOpen(false)}
      student={currentStudent}
      selectedTrimester={selectedTrim}
      augmentedSubjects={augmentedSubjects}
      totalPoints={totalPoints}
      totalCoef={totalCoef}
      calculatedAverage={calculatedAverage}
      studentRank={studentRank}
      totalClassSize={totalClassSize}
      minAverage={minAverage}
      maxAverage={maxAverage}
      unjustifiedAbsenceHours={unjustifiedAbsenceHours}
      teachers={teachers}
      selectedAppreciation={effectiveAppreciation}
      principalTeacherName={teacherName || currentStudent?.mainTeacherName || getClassPrincipalTeacherSignature(currentStudent?.class).teacherName}
      teacherSignature={currentStudent?.teacherSignature || getClassPrincipalTeacherSignature(currentStudent?.class).signature}
      isSignedByTeacher={isTeacherSigned || Boolean(currentStudent?.teacherSignature || getClassPrincipalTeacherSignature(currentStudent?.class).signature)}
      selectedDistinctions={effectiveDistinctions}
      selectedSanctions={effectiveSanctions}
      faitA={faitA}
      faitLe={faitLe}
      directorName={directorName}
      signatureText={signatureText}
      stampImage={stampImage}
    />

    {/* OFFICIAL LIVRET SCOLAIRE / BULLETIN ANNUEL FOR PRINT */}
    <PrintableLivret
      isOpen={isLivretPrintModalOpen}
      onClose={() => setIsLivretPrintModalOpen(false)}
      student={currentStudent}
      teachers={teachers}
      currentUser={currentUser}
    />

    {/* BILAN FIN D'ANNÉE / CLÔTURE ANNUELLE MODAL */}
    {isBilanModalOpen && canLaunchCloture && (
      <BilanFinAnnee
        students={allStudents}
        onUpdateAllStudents={(updatedStudents) => {
          if (onUpdateAllStudents) {
            onUpdateAllStudents(updatedStudents);
          }
        }}
        onClose={() => setIsBilanModalOpen(false)}
      />
    )}
    </>
  );
};
