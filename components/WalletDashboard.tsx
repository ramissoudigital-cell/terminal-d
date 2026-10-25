import React, { useState, useEffect } from 'react';
import { Search, Minus, FileText, Printer, ChevronDown, ArrowUpRight, CheckCircle2, Clock, BookOpen, ChevronRight, X, XCircle, Plus, PenLine, Trash2, Save, Megaphone, TrendingUp, UserPlus, AlertOctagon, Settings, Check, ShoppingBag, Bell, Users, Building2, Crown, Award, HeartHandshake, GraduationCap, Camera, Upload, Image, Sparkles, MessageSquare, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SpendsChart } from './SpendsChart';
import { AppreciationCard } from './AppreciationCard';
import { MentionCard } from './MentionCard';
import { ClassResultsCard } from './ClassResultsCard';
import { BilanFinAnneeCard } from './BilanFinAnneeCard';
import { StudentCardSlider } from './StudentCardSlider';
import { StudentSuppliesModal } from './StudentSuppliesModal';
import { PrintableBulletin } from './PrintableBulletin';
import { Student } from '../types';
import { checkIsPrincipalForClass, getClassPrincipalTeacherSignature } from '../src/utils/teacherUtils';
import { isTechnicalClass, formatPeriodLabel, getPeriodOptions, calculateAnnualAverage } from '../src/utils/academicUtils';
import { getSubjectCoef, isSubjectMatch } from './TransactionList';
import { COUNTRIES_DATA } from '../data/countries';
import { mockClasses } from '../data/mockData';
import { getGradeAppreciations } from '../src/utils/gradeAppreciations';
import { deleteRealtimeDocument } from '../src/services/firebaseService';

interface WalletDashboardProps {
  readOnly?: boolean;
  onNavigate?: (page: string) => void;
  student?: Student | null;
  onDelete?: () => void;
  onUpdateStudent?: (student: Student) => void;
  currentUser?: any;
  studentRank?: number;
  totalClassSize?: number;
  minAverage?: number;
  maxAverage?: number;
  classAverage?: number;
  selectedTrimester?: string;
  onTrimesterChange?: (trim: string) => void;
  selectedAppreciation?: string | null;
  onSelectAppreciation?: (val: string | null) => void;
  teacherName?: string;
  onTeacherNameChange?: (name: string) => void;
  isTeacherSigned?: boolean;
  onToggleSigned?: (signed: boolean) => void;
  teacherSignature?: string;
  onSaveSignature?: (signatureDataUrl: string, name: string) => void;
  onDeleteSignature?: () => void;
  canSign?: boolean;
  selectedDistinctions?: string[];
  onDistinctionToggle?: (dist: string) => void;
  selectedSanctions?: string[];
  onSanctionToggle?: (sanc: string) => void;
  faitA?: string;
  onFaitAChange?: (val: string) => void;
  faitLe?: string;
  onFaitLeChange?: (val: string) => void;
  directorName?: string;
  onDirectorNameChange?: (val: string) => void;
  signatureText?: string;
  onSignatureTextChange?: (val: string) => void;
  stampImage?: string | null;
  onStampImageChange?: (val: string | null) => void;
  isCustomRank?: boolean;
  onRankChange?: (newRank: number | null) => void;
  isCustomAppreciation?: boolean;
  onResetAppreciationToAuto?: () => void;
  isCustomMentions?: boolean;
  onResetMentionsToAuto?: () => void;
  annualDecision?: string;
  onAnnualDecisionChange?: (val: string) => void;
}

export default function WalletDashboard({ 
  readOnly = true, 
  onNavigate, 
  student, 
  onDelete, 
  onUpdateStudent, 
  currentUser, 
  studentRank = 1, 
  totalClassSize = 1, 
  minAverage = 0, 
  maxAverage = 0, 
  classAverage = 0, 
  selectedTrimester, 
  onTrimesterChange,
  selectedAppreciation,
  onSelectAppreciation,
  teacherName,
  onTeacherNameChange,
  isTeacherSigned,
  onToggleSigned,
  teacherSignature,
  onSaveSignature,
  onDeleteSignature,
  canSign: propCanSign,
  selectedDistinctions,
  onDistinctionToggle,
  selectedSanctions,
  onSanctionToggle,
  faitA,
  onFaitAChange,
  faitLe,
  onFaitLeChange,
  directorName,
  onDirectorNameChange,
  signatureText,
  onSignatureTextChange,
  stampImage,
  onStampImageChange,
  isCustomRank,
  onRankChange,
  isCustomAppreciation,
  onResetAppreciationToAuto,
  isCustomMentions,
  onResetMentionsToAuto,
  annualDecision = '',
  onAnnualDecisionChange,
}: WalletDashboardProps) {
  const isEducator = currentUser?.role === 'educator' || 
                     currentUser?.role === 'éducateur' || 
                     (currentUser?.accessLevel === 2 && currentUser?.role !== 'director' && currentUser?.role !== 'admin' && currentUser?.role !== 'teacher');
  const isStudent = currentUser?.role === 'student' || 
                    currentUser?.role === 'élève' || 
                    currentUser?.role === 'eleve' || 
                    currentUser?.accessLevel === 1;
  const canEditGrades = !readOnly && !isEducator && !isStudent;

  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [showDeleteStudentConfirm, setShowDeleteStudentConfirm] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState<number | string | null>(null);
  const [bonusMinusConfig, setBonusMinusConfig] = useState<{
    isOpen: boolean;
    type: 'plus' | 'minus';
    step: 'target' | 'value';
    target: 'moyenne' | 'note';
    value: string;
  }>({ isOpen: false, type: 'plus', step: 'target', target: 'moyenne', value: '1' });
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [selectedTrim, setSelectedTrim] = useState(selectedTrimester || '1er trim');
  const [showTrimDropdown, setShowTrimDropdown] = useState(false);
  const [showSuppliesModal, setShowSuppliesModal] = useState(false);
  const [showMobileSubjects, setShowMobileSubjects] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);

  useEffect(() => {
    const handleNavVisibility = (e: any) => {
      if (e.detail) {
        setIsNavHidden(Boolean(e.detail.isHidden || e.detail.isOpen));
      }
    };
    const handleModalState = (e: any) => {
      if (e.detail) {
        setIsNavHidden(Boolean(e.detail.isOpen));
      }
    };
    window.addEventListener('hide-bottom-nav', handleNavVisibility);
    window.addEventListener('modal-state-change', handleModalState);
    return () => {
      window.removeEventListener('hide-bottom-nav', handleNavVisibility);
      window.removeEventListener('modal-state-change', handleModalState);
    };
  }, []);

  useEffect(() => {
    if (selectedTrimester) {
      setSelectedTrim(selectedTrimester);
    }
  }, [selectedTrimester]);

  const handleTrimChange = (trim: string) => {
    setSelectedTrim(trim);
    if (onTrimesterChange) {
      onTrimesterChange(trim);
    }
    setShowTrimDropdown(false);
  };

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

  const initialNameParts = getNameParts(student?.name || "Alice Martin");

  const [studentInfo, setStudentInfo] = useState({
      firstName: initialNameParts.firstName,
      lastName: initialNameParts.lastName,
      gender: student?.gender || 'F',
      matricule: student?.studentId || "2023-MAT-0012",
      dob: student?.birthDate || "14 Mai 2008",
      birthCertificateNumber: student?.birthCertificateNumber || "3913 DU 27/03/2006 ETABLI A ABOBO",
      birthPlace: student?.birthPlace || "Abidjan",
      className: student?.class || "Seconde C1",
      school: "Collège Faoummaba",
      country: student?.country || "Côte d'Ivoire",
      nationality: student?.nationality || "Ivoirienne",
      assignedStatus: student?.assignedStatus || 'affecte',
      fatherPhone: student?.fatherPhone || "",
      motherPhone: student?.motherPhone || "",
      fatherEmail: student?.fatherEmail || "",
      motherEmail: student?.motherEmail || "",
      studentPhone: student?.studentPhone || "",
      tutorPhone: student?.tutorPhone || "",
      photoUrl: student?.photoUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80"
  });

  const [editStudentForm, setEditStudentForm] = useState(studentInfo);

  useEffect(() => {
    if (student) {
        const nameParts = getNameParts(student.name);
        const info = {
            firstName: nameParts.firstName,
            lastName: nameParts.lastName,
            gender: student.gender || 'F',
            matricule: student.studentId,
            dob: student.birthDate,
            birthCertificateNumber: student.birthCertificateNumber || "3913 DU 27/03/2006 ETABLI A ABOBO",
            birthPlace: student.birthPlace || "Abidjan",
            className: student.class,
            school: "Collège Faoummaba",
            country: student.country || "Côte d'Ivoire",
            nationality: student.nationality || "Ivoirienne",
            assignedStatus: student.assignedStatus || 'affecte',
            fatherPhone: student.fatherPhone || "",
            motherPhone: student.motherPhone || "",
            fatherEmail: student.fatherEmail || "",
            motherEmail: student.motherEmail || "",
            studentPhone: student.studentPhone || "",
            tutorPhone: student.tutorPhone || "",
            photoUrl: student.photoUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80"
        };
        setStudentInfo(info);
        setEditStudentForm(info);
    }
  }, [student]);
  const [floatingMenuOpen, setFloatingMenuOpen] = useState(false);
  const [appBarMenuOpen, setAppBarMenuOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handleNav = (page: string) => {
      setFloatingMenuOpen(false);
      setAppBarMenuOpen(false);
      if (onNavigate) {
          onNavigate(page);
      } else {
          window.dispatchEvent(new CustomEvent('navigate', { detail: page }));
      }
  };
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [currentGrades, setCurrentGrades] = useState<any[]>([]);
  const [showAddGrade, setShowAddGrade] = useState(false);
  const [newGradeForm, setNewGradeForm] = useState({ title: '', score: '', coef: '1', type: 'devoir', interroMax: '20', appreciation: '' });
  const [showGradeTypeDropdown, setShowGradeTypeDropdown] = useState(false);
  const [editingGradeId, setEditingGradeId] = useState<number | string | null>(null);
  const [editGradeForm, setEditGradeForm] = useState({ title: '', score: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [draftSavedNotification, setDraftSavedNotification] = useState<string | null>(null);
  const [hasDraftAvailable, setHasDraftAvailable] = useState<boolean>(false);

  const handleSaveDraft = () => {
    try {
      const draftData = {
        studentId: student?.studentId || student?.id || 'default',
        subjectName: selectedSubject?.name || 'All',
        trimester: selectedTrim,
        grades: currentGrades,
        savedAt: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
      };
      localStorage.setItem('grade_draft', JSON.stringify(draftData));
      if (student?.id && selectedSubject?.name) {
        localStorage.setItem(`grade_draft_${student.id}_${selectedSubject.name}_${selectedTrim}`, JSON.stringify(draftData));
      }
      setHasDraftAvailable(true);
      setDraftSavedNotification('Brouillon des notes enregistré dans localStorage !');
      setTimeout(() => setDraftSavedNotification(null), 3500);
    } catch (e) {
      console.error('Erreur sauvegarde brouillon:', e);
    }
  };

  const handleLoadDraft = () => {
    try {
      let saved = null;
      if (student?.id && selectedSubject?.name) {
        saved = localStorage.getItem(`grade_draft_${student.id}_${selectedSubject.name}_${selectedTrim}`);
      }
      if (!saved) {
        saved = localStorage.getItem('grade_draft');
      }
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.grades)) {
          setCurrentGrades(parsed.grades);
          if (selectedSubject) {
            const newAverage = calculateSubjectAverage(parsed.grades);
            const updatedSubject = { ...selectedSubject, average: newAverage, grades: parsed.grades };
            setSelectedSubject(updatedSubject);
            updateStudentSubjectGrades(selectedSubject.name, parsed.grades);
          }
          setDraftSavedNotification(`Brouillon restauré (${parsed.savedAt || 'précédent'}) !`);
          setTimeout(() => setDraftSavedNotification(null), 3500);
        }
      }
    } catch (e) {
      console.error('Erreur chargement brouillon:', e);
    }
  };

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: showAbsenceModal || !!selectedSubject || showEditStudentModal || showSuppliesModal || showMobileSubjects } }));
  }, [showAbsenceModal, selectedSubject, showEditStudentModal, showSuppliesModal, showMobileSubjects]);

  const calculateSubjectAverage = (grades: any[] = []): number => {
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
              const score = typeof g.score === 'number' ? g.score : parseFloat(g.score || 0);
              const coef = typeof g.coef === 'number' ? g.coef : parseFloat(g.coef || 1);
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

  const updateStudentSubjectGrades = (subjectName: string, updatedGrades: any[]) => {
      if (!student || !onUpdateStudent) return;
      
      const newAverage = calculateSubjectAverage(updatedGrades);
      
      const trimSubjectsFromStudent = student?.trimesters?.[selectedTrim]?.subjects;
      const baseSubjectsToUse = trimSubjectsFromStudent && trimSubjectsFromStudent.length > 0 
          ? trimSubjectsFromStudent 
          : (student.subjects && student.subjects.length > 0 ? student.subjects.map(s => ({ ...s, average: 0, grades: [] })) : []);

      let subjectExists = false;
      const updatedSubjects = baseSubjectsToUse.map(sub => {
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
          const coef = getSubjectCoef(student.class, sub.name);
          if (coef === 0) {
              const g = Number(sub.average || 0);
              return acc + (g > 10 ? g - 10 : 0);
          }
          return acc + (Number(sub.average || 0) * coef);
      }, 0);
      const cfs = updatedSubjects.reduce((acc, sub) => acc + getSubjectCoef(student.class, sub.name), 0);
      const trimAvgNum = cfs > 0 ? parseFloat((pts / cfs).toFixed(2)) : 0;

      const updatedTrimesters = {
          ...(student.trimesters || {}),
          [selectedTrim]: {
              subjects: updatedSubjects,
              average: trimAvgNum
          }
      };

      const t1Avg = updatedTrimesters['1er trim']?.average || (selectedTrim === '1er trim' ? trimAvgNum : 0);
      const t2Avg = updatedTrimesters['2ème trim']?.average || (selectedTrim === '2ème trim' ? trimAvgNum : 0);
      const t3Avg = updatedTrimesters['3ème trim']?.average || (selectedTrim === '3ème trim' ? trimAvgNum : 0);

      const updatedPerformance = [
          { name: '1er Trim', studentScore: t1Avg, classAverage: 0 },
          { name: '2e Trim', studentScore: t2Avg, classAverage: 0 },
          { name: '3e Trim', studentScore: t3Avg, classAverage: 0 }
      ];

      onUpdateStudent({ 
          ...student, 
          trimesters: updatedTrimesters,
          performance: updatedPerformance,
          subjects: updatedSubjects 
      });
  };

  const handleSelectSubject = (subject: any) => {
      let grades = subject.grades;
      if (!grades) {
          grades = [];
      }
      setSelectedSubject(subject);
      setCurrentGrades(grades);

      const specificKey = student?.id ? `grade_draft_${student.id}_${subject.name}_${selectedTrim}` : '';
      const hasSpecific = specificKey ? !!localStorage.getItem(specificKey) : false;
      const hasGeneral = !!localStorage.getItem('grade_draft');
      setHasDraftAvailable(hasSpecific || hasGeneral);
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
      const newGrade = {
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

      const newGrade = {
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

  const handleEditGrade = (grade: any) => {
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
  const totalAbsenceHours = student?.attendanceHistory?.reduce((acc, curr) => acc + curr.hours, 0) || 0;
  const unjustifiedAbsenceHours = student?.attendanceHistory?.filter(a => !a.justified)?.reduce((acc, curr) => acc + curr.hours, 0) || 0;

  const chartData = [
    { type: 'down', bottom: 15, height: 15, wickBottom: 10, wickHeight: 25 },
    { type: 'up', bottom: 35, height: 20, wickBottom: 30, wickHeight: 30 },
    { type: 'down', bottom: 45, height: 8, wickBottom: 40, wickHeight: 18 },
    { type: 'up', bottom: 35, height: 15, wickBottom: 30, wickHeight: 25 },
    { type: 'down', bottom: 30, height: 35, wickBottom: 25, wickHeight: 45 },
    { type: 'up', bottom: 55, height: 6, wickBottom: 50, wickHeight: 16 },
    { type: 'down', bottom: 65, height: 20, wickBottom: 60, wickHeight: 30 },
    { type: 'up', bottom: 35, height: 25, wickBottom: 30, wickHeight: 35 },
    { type: 'up', bottom: 48, height: 6, wickBottom: 45, wickHeight: 12 },
    { type: 'up', bottom: 60, height: 20, wickBottom: 55, wickHeight: 30 },
  ];

  const defaultSubjects = [
    { name: 'Mathématiques', coef: 2, grade: '17.50', color: 'bg-[#3b82f6]', hex: '#3b82f6', active: false },
    { name: 'Physique-Chimie', coef: 2, grade: '16.00', color: 'bg-[#eab308]', hex: '#eab308', active: false },
    { name: 'SVT', coef: 3, grade: '15.50', color: 'bg-[#22c55e]', hex: '#22c55e', active: false },
    { name: 'Anglais', coef: 2, grade: '16.50', color: 'bg-[#ef4444]', hex: '#ef4444', active: false },
    { name: 'Informatique', coef: 0, grade: '18.00', color: 'bg-[#475569]', hex: '#475569', active: true },
    { name: 'Français', coef: 2, grade: '15.00', color: 'bg-[#a855f7]', hex: '#a855f7', active: false },
  ];

    const coefs6eme: Record<string, number> = {
    'Mathématiques': 3,
    'Français': 3,
    'Anglais': 2,
    'Histoire-Geo': 2,
    'Histoire-Géographie': 2,
    'Physique-Chimie': 2,
    'SVT': 2,
    'Sciences de la Vie et de la Terre': 2,
    'E.D.H.C': 1,
    'EDHC': 1,
    'Conduite': 1,
    'EPS': 1,
    'Informatique': 0
  };

  
  const coefs4eme: Record<string, number> = {
    'Mathématiques': 3,
    'Français': 4,
    'Anglais': 2,
    'Histoire-Geo': 2,
    'Histoire-Géographie': 2,
    'Physique-Chimie': 2,
    'SVT': 2,
    'Sciences de la Vie et de la Terre': 2,
    'E.D.H.C': 1,
    'EDHC': 1,
    'L.V.2 (Allemand / Espagnol)': 1,
    'Conduite': 1,
    'EPS': 1,
    'Informatique': 0
  };

  
  const coefs2A: Record<string, number> = {
    'Mathématiques': 3,
    'Français': 4,
    'Anglais': 3,
    'Histoire-Geo': 3,
    'Histoire-Géographie': 3,
    'Physique-Chimie': 2,
    'SVT': 2,
    'Sciences de la Vie et de la Terre': 2,
    'L.V.2 (Allemand / Espagnol)': 3,
    'Conduite': 1,
    'EPS': 1,
    'E.P.S.': 1,
    'Informatique': 0
  };

  const coefs2C: Record<string, number> = {
    'Mathématiques': 5,
    'Physique-Chimie': 4,
    'Français': 3,
    'Anglais': 3,
    'Histoire-Geo': 2,
    'Histoire-Géographie': 2,
    'SVT': 2,
    'Sciences de la Vie et de la Terre': 2,
    'L.V.2 (Allemand / Espagnol)': 1,
    'Conduite': 1,
    'EPS': 1,
    'E.P.S.': 1,
    'Informatique': 0
  };

  const coefs1A1: Record<string, number> = {
    'Mathématiques': 3,
    'Français': 4,
    'Anglais': 4,
    'Histoire-Geo': 3,
    'Histoire-Géographie': 3,
    'Philosophie': 3,
    'Physique-Chimie': 1,
    'SVT': 1,
    'Sciences de la Vie et de la Terre': 1,
    'L.V.2 (Allemand / Espagnol)': 3,
    'Conduite': 1,
    'EPS': 1,
    'E.P.S.': 1,
    'Informatique': 0
  };

  const coefs1A2: Record<string, number> = {
    'Mathématiques': 2,
    'Français': 4,
    'Anglais': 4,
    'Histoire-Geo': 3,
    'Histoire-Géographie': 3,
    'Philosophie': 3,
    'Physique-Chimie': 1,
    'SVT': 1,
    'Sciences de la Vie et de la Terre': 1,
    'L.V.2 (Allemand / Espagnol)': 3,
    'Conduite': 1,
    'EPS': 1,
    'E.P.S.': 1,
    'Informatique': 0
  };

  const coefs1D: Record<string, number> = {
    'Mathématiques': 4,
    'Physique-Chimie': 4,
    'SVT': 4,
    'Sciences de la Vie et de la Terre': 4,
    'Français': 3,
    'Anglais': 2,
    'Histoire-Geo': 2,
    'Histoire-Géographie': 2,
    'Philosophie': 2,
    'Conduite': 1,
    'EPS': 1,
    'E.P.S.': 1,
    'Informatique': 0
  };

  const coefsTA1: Record<string, number> = {
    'Mathématiques': 4,
    'Français': 4,
    'Anglais': 4,
    'Histoire-Geo': 3,
    'Histoire-Géographie': 3,
    'Philosophie': 5,
    'SVT': 2,
    'Sciences de la Vie et de la Terre': 2,
    'L.V.2 (Allemand / Espagnol)': 3,
    'Conduite': 1,
    'EPS': 1,
    'E.P.S.': 1,
    'Informatique': 0
  };

  const coefsTA2: Record<string, number> = {
    'Mathématiques': 2,
    'Français': 4,
    'Anglais': 4,
    'Histoire-Geo': 3,
    'Histoire-Géographie': 3,
    'Philosophie': 5,
    'SVT': 2,
    'Sciences de la Vie et de la Terre': 2,
    'L.V.2 (Allemand / Espagnol)': 3,
    'Conduite': 1,
    'EPS': 1,
    'E.P.S.': 1,
    'Informatique': 0
  };

  const coefsTD: Record<string, number> = {
    'Mathématiques': 4,
    'Physique-Chimie': 4,
    'SVT': 4,
    'Sciences de la Vie et de la Terre': 4,
    'Français': 3,
    'Histoire-Geo': 2,
    'Histoire-Géographie': 2,
    'Philosophie': 2,
    'Anglais': 1,
    'Conduite': 1,
    'EPS': 1,
    'E.P.S.': 1,
    'Informatique': 0
  };

  const getCoef = (className: string | undefined, subjectName: string) => {
    if ((subjectName || '').toLowerCase().includes('informatique')) {
      return 0;
    }
    if (className && className?.match(/(Tle D|T°D|TD|Terminale D|TerminaleD)/i)) {
      return coefsTD[subjectName] || 1;
    }
    if (className && className?.match(/(Tle A1|T°A1|TA1|Terminale A1|TerminaleA1)/i)) {
      return coefsTA1[subjectName] || 1;
    }
    if (className && className?.match(/(Tle A2|T°A2|TA2|Terminale A2|TerminaleA2)/i)) {
      return coefsTA2[subjectName] || 1;
    }
    if (className && className?.match(/(1ère D|1ere D|1°D|1D|Première D|Premiere D)/i)) {
      return coefs1D[subjectName] || 1;
    }
    if (className && className?.match(/(1ère A1|1ere A1|1°A1|1A1|Première A1|Premiere A1)/i)) {
      return coefs1A1[subjectName] || 1;
    }
    if (className && className?.match(/(1ère A2|1ere A2|1°A2|1A2|Première A2|Premiere A2)/i)) {
      return coefs1A2[subjectName] || 1;
    }
    if (className && className?.match(/(2nde C|Seconde C|2°C)/)) {
      return coefs2C[subjectName] || 1;
    }
    if (className && className?.match(/(2nde A|Seconde A|2°A)/)) {
      return coefs2A[subjectName] || 1;
    }
    if (className && (className.includes('4ème') || className.includes('3ème'))) {
      return coefs4eme[subjectName] || 1;
    }
    if (className && (className.includes('6ème') || className.includes('5ème'))) {
      return coefs6eme[subjectName] || 1;
    }
    return 1;
  };

  const trimSubjectsFromStudent = student?.trimesters?.[selectedTrim]?.subjects;
  let initialSubjects: any[] = trimSubjectsFromStudent && trimSubjectsFromStudent.length > 0 
      ? trimSubjectsFromStudent.map(s => ({ ...s })) 
      : (student?.subjects && student.subjects.length > 0 ? student.subjects.map(s => ({ ...s, average: s.average !== undefined ? s.average : 0, grades: s.grades || [] })) : defaultSubjects.map(s => ({ ...s, average: 0, grades: [] })));
  
  // Supprimer les anciennes matières si elles existent pour les remplacer
  
  // Supprimer EDHC pour tout le Lycée
  if (student?.class?.match(/(2nde|Seconde|2°|1ère|1ere|1er|1°|Première|Premiere|Terminale|Tle|T°)/i)) {
      initialSubjects = initialSubjects.filter(s => s?.name && !s.name.includes('EDHC') && !s.name.includes('E.D.H.C'));
  }

  // Supprimer Physique-Chimie pour Terminale A (A1, A2), sinon s'assurer qu'elle est présente
  if (student?.class?.match(/(Tle A|T°A|TA|Terminale A)/i)) {
      initialSubjects = initialSubjects.filter(s => s?.name && !s.name.includes('Physique'));
  } else {
      if (!initialSubjects.find(s => s?.name?.toLowerCase().includes('physique') || s?.name?.toLowerCase().includes('chimie'))) {
          initialSubjects.push({ name: 'Physique-Chimie', value: 15, average: 0, fill: '#fbbf24', grades: [] });
      }
  }

  if (!isTechnicalClass(student?.class) && student?.class && (student.class.includes('4ème') || student.class.includes('3ème') || student.class?.match(/(2nde|Seconde|2°|1ère|1ere|1er|1°|Première|Premiere|Terminale|Tle|T°)/i))) {
      initialSubjects = initialSubjects.filter(s => s?.name && s.name !== 'Allemand' && s.name !== 'Espagnol' && s.name !== 'L.V.2 (Allemand)' && s.name !== 'L.V.2 (Espagnol)');
      if (student.class.match(/(1ère D|1ere D|1°D|1D|Première D|Premiere D|Tle D|T°D|TD|Terminale D|TerminaleD)/i)) {
          initialSubjects = initialSubjects.filter(s => s?.name && !s.name.includes('L.V.2'));
      } else if (!initialSubjects.find(s => s?.name?.includes('L.V.2'))) {
          initialSubjects.push({ name: 'L.V.2 (Allemand / Espagnol)', value: 10, average: 0, fill: '#f59e0b', grades: [] });
      }
  }

  if (isTechnicalClass(student?.class)) {
      initialSubjects = initialSubjects.filter(s => s?.name && !s.name.toLowerCase().includes('l.v.2') && !s.name.toLowerCase().includes('lv2'));
      if (!initialSubjects.find(s => s?.name && s.name.toLowerCase().includes('allemand'))) {
          initialSubjects.push({ name: 'Allemand', value: 10, average: 0, fill: '#f59e0b', grades: [] });
      }
      if (!initialSubjects.find(s => s?.name && s.name.toLowerCase().includes('espagnol'))) {
          initialSubjects.push({ name: 'Espagnol', value: 10, average: 0, fill: '#eab308', grades: [] });
      }
  }

  if (student?.class?.match(/(1ère|1ere|1er|1°|Première|Premiere|Terminale|Tle)/i)) {
      if (!initialSubjects.find(s => s?.name?.toLowerCase().includes('philosophie'))) {
          initialSubjects.push({ name: 'Philosophie', value: 10, average: 0, fill: '#7c3aed', grades: [] });
      }
  }

  
  if (!initialSubjects.find(s => s?.name?.toLowerCase().includes('informatique'))) {
      initialSubjects.push({ name: 'Informatique', value: 10, average: 0, fill: '#475569', grades: [] });
  }

  if (!initialSubjects.find(s => s?.name?.toLowerCase().includes('conduite'))) {
      initialSubjects.push({ name: 'Conduite', value: 10, average: 0, fill: '#059669', grades: [] });
  }

  let filteredSubjects = initialSubjects.map(s => {
    const hasGrades = s.grades && Array.isArray(s.grades) && s.grades.length > 0;
    const computedAvg = hasGrades ? calculateSubjectAverage(s.grades) : 0;
    return {
      ...s,
      average: computedAvg,
      grades: s.grades || []
    };
  });

  if (isTechnicalClass(student?.class)) {
    const allemand = filteredSubjects.find(s => (s?.name || '').toLowerCase().includes("allemand"));
    const espagnol = filteredSubjects.find(s => (s?.name || '').toLowerCase().includes("espagnol"));
    
    if (allemand && espagnol) {
      const hasAllemandGrades = (allemand.grades && allemand.grades.length > 0) || (typeof allemand.average === 'number' && allemand.average > 0);
      const hasEspagnolGrades = (espagnol.grades && espagnol.grades.length > 0) || (typeof espagnol.average === 'number' && espagnol.average > 0);

      if (hasAllemandGrades && !hasEspagnolGrades) {
        filteredSubjects = filteredSubjects.map(s => (s?.name || '').toLowerCase().includes("espagnol") ? { ...s, inactive: true } : s);
      } else if (hasEspagnolGrades && !hasAllemandGrades) {
        filteredSubjects = filteredSubjects.map(s => (s?.name || '').toLowerCase().includes("allemand") ? { ...s, inactive: true } : s);
      } else if (hasAllemandGrades && hasEspagnolGrades) {
        const countAll = allemand.grades?.length || 0;
        const countEsp = espagnol.grades?.length || 0;
        if (countEsp >= countAll) {
          filteredSubjects = filteredSubjects.map(s => (s?.name || '').toLowerCase().includes("allemand") ? { ...s, inactive: true } : s);
        } else {
          filteredSubjects = filteredSubjects.map(s => (s?.name || '').toLowerCase().includes("espagnol") ? { ...s, inactive: true } : s);
        }
      }
    }
  }
  
  const subjects = filteredSubjects.map(s => ({
        name: s?.name || '',
        coef: getSubjectCoef(student?.class, s?.name || ''),
        grade: (s?.average || 0).toFixed(2),
        color: s?.name?.includes('L.V.2') ? 'bg-gradient-to-br from-amber-500 to-emerald-500' : `bg-[${s?.fill || '#ccc'}]`,
        hex: s?.name?.includes('L.V.2') ? '#10b981' : (s?.fill || '#ccc'),
        active: false,
        grades: s?.grades || [],
        average: s?.average || 0,
        inactive: s?.inactive
      }));

  const safeChartData = filteredSubjects && filteredSubjects.length > 0 ? filteredSubjects : [{ name: 'Aucune donnée', value: 1, average: 0, fill: '#e5e7eb' }];
  const sortedChartData = [...safeChartData].sort((a, b) => (b.average || 0) - (a.average || 0));
  const bestSubject = sortedChartData[0];
  const secondBestSubject = sortedChartData[1] || bestSubject;

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const gap = 12;
  
  const chartValues = safeChartData.map(sub => {
     const isBest = sub.name === bestSubject?.name;
     const isSecondBest = sub.name === secondBestSubject?.name && sub.name !== bestSubject?.name;
     const avg = sub.average || 0;
     return {
        ...sub,
        isBest,
        isSecondBest,
        chartWeight: isBest ? avg * 3 : (isSecondBest ? avg * 2.5 : avg)
     };
  });

  const totalWeight = chartValues.reduce((acc, sub) => acc + sub.chartWeight, 0);
  const availableLength = circumference - (gap * safeChartData.length);
  
  let currentOffset = 0;
  const chartSegments = chartValues.map(sub => {
     const length = totalWeight > 0 ? Math.max(0, (sub.chartWeight / totalWeight) * availableLength) : availableLength / safeChartData.length;
     const segment = {
       color: sub.name.includes('L.V.2') ? '#10b981' : (sub.fill || '#ccc'),
       dasharray: `${length} ${circumference - length}`,
       offset: currentOffset,
       isBest: sub.isBest,
       isSecondBest: sub.isSecondBest
     };
     currentOffset -= (length + gap);
     return segment;
  });

  const totalPoints = subjects.reduce((acc, sub) => {
    if (sub.inactive) return acc;
    if (sub.coef === 0 || (sub.name || '').toLowerCase().includes('informatique')) {
      const g = parseFloat(sub.grade || '0');
      const bonus = g > 10 ? g - 10 : 0;
      return acc + bonus;
    }
    return acc + (parseFloat(sub.grade || '0') * sub.coef);
  }, 0);

  const totalCoef = subjects.reduce((acc, sub) => {
    if (sub.inactive) return acc;
    if (sub.coef === 0 || (sub.name || '').toLowerCase().includes('informatique')) {
      return acc;
    }
    return acc + sub.coef;
  }, 0);

  const average = totalCoef > 0 ? (totalPoints / totalCoef).toFixed(2) : '0.00';


  const teachers = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
  const isPrincipalForClass = checkIsPrincipalForClass(currentUser, student?.class, teachers);
  
  const isTeacherRole = currentUser?.role === 'teacher' || 
                        currentUser?.role === 'professeur' || 
                        currentUser?.role === 'prof' || 
                        currentUser?.role === 'enseignant' || 
                        Boolean(currentUser?.isTeacher) ||
                        currentUser?.accessLevel === 3;

  const isAdminOrDirector = (currentUser?.role === 'admin' || currentUser?.role === 'director' || currentUser?.accessLevel === 5) && !isEducator;
  const isStaffWhoCanManageStudents = !readOnly && (
    currentUser?.role === 'admin' || 
    currentUser?.role === 'director' || 
    currentUser?.role === 'educator' || 
    currentUser?.role === 'éducateur' || 
    currentUser?.role === 'cashier' || 
    isTeacherRole ||
    currentUser?.accessLevel === 2 || 
    currentUser?.accessLevel === 3 || 
    currentUser?.accessLevel === 5 || 
    currentUser?.accessLevel === 4
  ) && currentUser?.role !== 'parent' && currentUser?.role !== 'student';

  const canSignTeacherSignature = propCanSign !== undefined ? propCanSign : (isAdminOrDirector || isPrincipalForClass || isTeacherRole);
  const canEditAppreciation = isAdminOrDirector || isPrincipalForClass || isTeacherRole;
  const canEditDirectorSection = currentUser?.accessLevel === 5 || currentUser?.role === 'director';

  const t1Avg = student?.trimesters?.['1er trim']?.average ?? null;
  const t2Avg = student?.trimesters?.['2ème trim']?.average ?? null;
  const t3Avg = student?.trimesters?.['3ème trim']?.average ?? null;

  const t1Rank = student?.trimesters?.['1er trim']?.rank || '-';
  const t2Rank = student?.trimesters?.['2ème trim']?.rank || '-';
  const t3Rank = student?.trimesters?.['3ème trim']?.rank || '-';

  const isTech = isTechnicalClass(student?.class || '');
  const t1Coef = isTech ? 1 : 1;
  const t2Coef = isTech ? 1 : 2;
  const t3Coef = isTech ? 1 : 2;

  const annualAvg = calculateAnnualAverage(t1Avg, t2Avg, t3Avg, isTech);
  const annualRank = student?.annualRank || (studentRank ? `${studentRank}e` : '-');

  return (
    <div className="flex flex-col h-full w-full relative z-10 pt-12 overflow-hidden bg-[#BFDBFE]">
      {/* Header */}
      {showMobileSearch ? (
          <div className="flex items-center gap-2 mb-8 px-6 shrink-0 w-full animate-in fade-in duration-200">
              <div className="flex-1 flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/40 px-4 py-2 rounded-2xl text-white">
                  <Search className="text-white shrink-0" size={18} />
                  <input
                      type="text"
                      autoFocus
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Rechercher..."
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
          <div className="flex justify-between items-center mb-8 px-6 shrink-0 relative z-50">
             <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm overflow-hidden p-0.5 shrink-0 border border-white/60">
                  <img src="logo.png" alt="Terminale D Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = 'icone.png'; }} />
                </div>
                <h1 className="text-white text-[24px] sm:text-[28px] font-black tracking-tight truncate">Terminale D</h1>
             </div>
             <div className="flex space-x-3 items-center shrink-0">
                <button 
                    onClick={() => setShowMobileSearch(true)}
                    className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/50 hover:bg-white/60 transition-colors shrink-0"
                >
                   <Search className="w-5 h-5 text-slate-900" strokeWidth={2} />
                </button>
                {!(currentUser?.role === 'student' || currentUser?.role === 'teacher' || currentUser?.accessLevel === 1) && (
                   <button 
                       onClick={() => setIsPrintModalOpen(true)}
                       title="Imprimer le bulletin de notes"
                       className="btn-print hidden sm:flex w-10 h-10 rounded-full bg-white/40 items-center justify-center backdrop-blur-md border border-white/50 hover:bg-white/60 transition-colors cursor-pointer active:scale-95 shrink-0"
                   >
                      <Printer className="w-5 h-5 text-slate-900" strokeWidth={2} />
                   </button>
                )}
                <div className="relative shrink-0">
                   <button 
                       onClick={() => setAppBarMenuOpen(!appBarMenuOpen)}
                       className="w-10 h-10 bg-white/90 rounded-2xl flex items-center justify-center transition-transform hover:scale-105 shadow-sm border border-slate-100 ml-1"
                   >
                      <Plus className={`w-5 h-5 text-slate-700 transition-transform duration-300 ${appBarMenuOpen ? 'rotate-45' : ''}`} strokeWidth={2.5} />
                   </button>
                       <AnimatePresence>
                      {appBarMenuOpen && (
                         <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-full mt-3 flex flex-col items-end space-y-3 z-50"
                         >
                            <button onClick={() => { setAppBarMenuOpen(false); handleNav('chefs_de_classe'); }} className="flex items-center space-x-3 bg-white pl-4 pr-1.5 py-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:scale-105 transition-transform border border-slate-50 w-max">
                                <span className="text-slate-700 font-semibold text-[14px]">Chefs de classe</span>
                                <div className="w-8 h-8 rounded-full bg-[#F0F5FA] flex items-center justify-center">
                                    <Crown size={16} className="text-slate-700" />
                                </div>
                            </button>
                         </motion.div>
                      )}
                   </AnimatePresence>
                </div>
             </div>
          </div>
      )}

      {/* Main Container Card */}
      <div className="flex-1 bg-white rounded-t-[40px] px-6 pt-8 pb-32 shadow-2xl relative overflow-y-auto [&::-webkit-scrollbar]:hidden border-t border-white/50 transition-colors duration-300">
         {/* Carte Étudiant Section (Slider) */}
         <div className="mb-6">
            <StudentCardSlider 
              student={student ? {
                ...student,
                name: `${studentInfo.firstName} ${studentInfo.lastName}`.trim(),
                class: studentInfo.className,
                studentId: studentInfo.matricule,
                birthDate: studentInfo.dob,
                birthPlace: studentInfo.birthPlace,
                birthCertificateNumber: studentInfo.birthCertificateNumber,
                gender: studentInfo.gender,
                country: studentInfo.country,
                nationality: studentInfo.nationality,
                assignedStatus: studentInfo.assignedStatus,
                fatherPhone: studentInfo.fatherPhone,
                motherPhone: studentInfo.motherPhone,
                fatherEmail: studentInfo.fatherEmail,
                motherEmail: studentInfo.motherEmail,
                studentPhone: studentInfo.studentPhone,
                tutorPhone: studentInfo.tutorPhone,
                photoUrl: studentInfo.photoUrl || student.photoUrl
              } : { 
                id: '1', 
                name: `${studentInfo.firstName} ${studentInfo.lastName}`.trim(), 
                class: studentInfo.className, 
                photoUrl: studentInfo.photoUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80', 
                studentId: studentInfo.matricule, 
                birthDate: studentInfo.dob, 
                birthPlace: studentInfo.birthPlace, 
                birthCertificateNumber: studentInfo.birthCertificateNumber,
                gender: studentInfo.gender,
                country: studentInfo.country,
                nationality: studentInfo.nationality,
                assignedStatus: studentInfo.assignedStatus,
                fatherPhone: studentInfo.fatherPhone,
                motherPhone: studentInfo.motherPhone,
                fatherEmail: studentInfo.fatherEmail,
                motherEmail: studentInfo.motherEmail,
                studentPhone: studentInfo.studentPhone,
                tutorPhone: studentInfo.tutorPhone,
                absences: 0, 
                attendanceHistory: [], 
                performance: [], 
                subjects: [], 
                activities: [] 
              }} 
              onEdit={() => {
                setEditStudentForm(studentInfo);
                setShowEditStudentModal(true);
              }} 
              onPhotoChange={(newPhotoUrl) => {
                const updatedInfo = { ...studentInfo, photoUrl: newPhotoUrl };
                setStudentInfo(updatedInfo);
                setEditStudentForm(updatedInfo);
                if (student && onUpdateStudent) {
                  onUpdateStudent({
                    ...student,
                    photoUrl: newPhotoUrl
                  });
                }
                const currentUserJson = localStorage.getItem('school_user_session') || localStorage.getItem('school_user');
                if (currentUserJson) {
                  try {
                    const user = JSON.parse(currentUserJson);
                    if (user) {
                      user.photo = newPhotoUrl;
                      user.photoUrl = newPhotoUrl;
                      localStorage.setItem('school_user_session', JSON.stringify(user));
                      localStorage.setItem('school_user', JSON.stringify(user));
                    }
                  } catch (e) {}
                }
              }}
              onDelete={isStaffWhoCanManageStudents ? () => {
                if (onDelete) {
                  onDelete();
                } else if (student?.id) {
                  const sId = String(student.id);
                  try {
                    const saved = localStorage.getItem('school_db_students');
                    if (saved) {
                      const list = JSON.parse(saved);
                      localStorage.setItem('school_db_students', JSON.stringify(list.filter((s: any) => String(s.id) !== sId && String(s.studentId) !== sId)));
                    }
                  } catch (e) {}
                  deleteRealtimeDocument('students', sId).catch(console.error);
                  if (onNavigate) onNavigate('students');
                }
              } : undefined} 
              readOnly={readOnly && !isStudent} 
              schoolName={studentInfo.school} 
              onNavigate={onNavigate}
              hideTuitionCard={true}
            />
         </div>

         {/* Solde disponible & Chart */}
         <div className="flex justify-between items-start mb-8 relative z-50">
            <div className="min-w-0 flex-1 pr-3">
               <p className="text-slate-500 text-[13px] font-medium mb-1 truncate">Moyenne Générale ({formatPeriodLabel(selectedTrim, student?.class)})</p>
               <h2 className="text-slate-900 text-[32px] font-bold tracking-tight leading-none truncate">
                 {average}<span className="text-[20px] text-slate-400 font-semibold">/20</span>
               </h2>
            </div>
         </div>

         {/* Chart */}
         <div className="relative w-full mb-12 sm:mb-14">
            <SpendsChart data={student?.performance || []} overallAverage={average} studentClass={student?.class} />
         </div>


         {/* Exercices Widget */}
         <div 
            onClick={() => setShowSuppliesModal(true)}
            className="mt-4 rounded-[24px] p-4 flex items-center justify-between bg-sky-50 border border-sky-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] cursor-pointer hover:scale-[1.02] transition-transform gap-2"
         >
            <div className="flex items-center gap-3 sm:gap-4 shrink-1 min-w-0">
               <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-[16px] bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
                  <FileText className="w-6 h-6" strokeWidth={2.5} />
               </div>
               <div className="min-w-0">
                  <h3 className="font-bold text-[14px] sm:text-[18px] leading-tight text-slate-900 truncate">Exercices</h3>
                  <p className="text-[11px] sm:text-[13px] font-medium mt-0.5 text-sky-700 truncate">Exercices par matière ({student?.class || 'Classe'})</p>
               </div>
            </div>
            <span className="font-bold text-[10px] sm:text-xs bg-sky-600 text-white px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full shadow-sm whitespace-nowrap shrink-0">
               Voir les matières
            </span>
         </div>

         {/* Matières & Résultats Widget (Mobile Only) */}
         <div 
             onClick={() => setShowMobileSubjects(true)}
             className="md:hidden mt-4 rounded-[24px] p-4 flex items-center justify-between bg-blue-50 border border-blue-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)] cursor-pointer hover:scale-[1.02] transition-transform gap-2"
         >
             <div className="flex items-center gap-3 sm:gap-4 shrink-1 min-w-0">
                 <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-[16px] bg-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                     <BookOpen className="w-6 h-6" strokeWidth={2.5} />
                 </div>
                 <div className="min-w-0">
                     <h3 className="font-bold text-[14px] sm:text-[18px] leading-tight text-slate-900 truncate">Matières & Résultats</h3>
                     <p className="text-[11px] sm:text-[13px] font-medium mt-0.5 text-blue-700 truncate">Notes et moyennes</p>
                 </div>
             </div>
             <span className="font-bold text-[10px] sm:text-xs bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-sm shrink-0">
                 Voir tout
             </span>
         </div>

         {/* Matières & Résultats (Desktop Only) */}
         <div className="hidden md:block mt-8 mb-4">
            <h2 className="text-slate-900 text-[20px] font-bold tracking-wide px-1">Matières & Résultats</h2>
         </div>
         
         <div className="hidden md:block space-y-4">
            {subjects.map((subject, idx) => {
                const isTeacher = currentUser?.role === "teacher";
                const isSubjectDisabled = isTeacher && currentUser?.subject && !isSubjectMatch(currentUser.subject, subject.name);
              
                return (
                <div
                    key={idx}
                    onClick={() => !isSubjectDisabled && handleSelectSubject(subject)}
                   className={`bg-white rounded-[24px] p-4 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.03)] ${isSubjectDisabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:scale-[1.02] transition-transform'}`}
                    style={{ border: subject.active ? `1.5px solid ${subject.hex}` : '1.5px solid #f1f5f9' }}
                >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 pr-4">
                        <div className={`w-[52px] h-[52px] rounded-[18px] ${subject.color} flex items-center justify-center text-white shadow-sm shrink-0`}>
                            <BookOpen className="w-[26px] h-[26px]" strokeWidth={2.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-slate-900 font-bold text-[16px] truncate">{subject.name}</h3>
                            {subject.coef === 0 ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 mt-0.5 truncate max-w-full">
                                Bonus
                              </span>
                            ) : (
                              <p className="text-slate-400 text-[13px] font-medium mt-0.5 truncate">Coef. {subject.coef}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <div className="text-right">
                            <span className="text-slate-900 font-bold text-[18px]">{subject.grade}</span>
                            <span className="text-slate-400 text-[12px] font-medium ml-1">/ 20</span>
                        </div>
                        <ChevronRight className="w-5 h-5 transition-colors" style={{ color: subject.active ? subject.hex : '#cbd5e1' }} />
                    </div>
                </div>
            );})}
         </div>

         {/* Moyennes par Matière Widget */}
         <div className="mt-8 md:bg-white md:rounded-[28px] md:p-6 md:shadow-[0_8px_30px_rgba(0,0,0,0.04)] md:border md:border-slate-100">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-slate-900 text-[18px] font-bold tracking-wide">
                  {isTechnicalClass(student?.class) ? 'Moyennes par Matière (semestrielle)' : 'Moyennes par Matière (trimestrielle)'}
               </h2>
               <div className="relative">
                  <button 
                     onClick={() => setShowTrimDropdown(!showTrimDropdown)}
                     className="flex items-center space-x-1.5 bg-[#e0f2fe] text-[#0ea5e9] px-3.5 py-1.5 rounded-full hover:bg-[#bae6fd] transition-colors text-[13px] font-semibold"
                  >
                     <span>{formatPeriodLabel(selectedTrim, student?.class)}</span>
                     <ChevronDown className={`w-4 h-4 text-[#0ea5e9] transition-transform duration-200 ${showTrimDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  {showTrimDropdown && (
                     <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
                        {getPeriodOptions(student?.class).map((opt) => (
                           <button
                              key={opt.id}
                              onClick={() => handleTrimChange(opt.id)}
                              className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-between ${
                                 selectedTrim === opt.id ? 'text-sky-600 bg-sky-50/50' : 'text-slate-700'
                              }`}
                           >
                              <span>{opt.shortLabel || opt.label}</span>
                              {selectedTrim === opt.id && <Check size={14} className="text-sky-600" />}
                           </button>
                        ))}
                     </div>
                  )}
               </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-6 pt-2 w-full">
               {/* Donut Chart */}
               <div className="relative w-44 h-44 flex items-center justify-center shrink-0 mx-auto">
                  <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
                     <defs>
                         <linearGradient id="lv2-grad-wd" x1="0%" y1="0%" x2="100%" y2="100%">
                             <stop offset="0%" stopColor="#f59e0b" />
                             <stop offset="100%" stopColor="#10b981" />
                         </linearGradient>
                     </defs>
                     {chartSegments.map((seg, i) => (
                        <motion.circle
                           key={i}
                           cx="50"
                           cy="50"
                           r="38"
                           fill="transparent"
                           stroke={seg.color === '#10b981' && safeChartData[i]?.name.includes('L.V.2') ? 'url(#lv2-grad-wd)' : seg.color}
                           strokeWidth={seg.isBest ? "14" : "6"}
                           strokeLinecap="round"
                           strokeDasharray={seg.dasharray}
                           initial={{ strokeDashoffset: circumference }}
                           whileInView={{ strokeDashoffset: seg.offset }}
                           viewport={{ once: true }}
                           transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                        />
                     ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                     <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">MOYENNE</span>
                     <span className="text-[22px] font-extrabold text-slate-900 leading-none my-0.5">{average}</span>
                     <span className="text-[12px] font-semibold text-slate-400">/ 20</span>
                  </div>
               </div>

               {/* Subjects Breakdown List */}
               <div className="w-full space-y-3">
                  {subjects.map((sub, i) => (
                     <div key={i} className="flex items-center justify-between text-[13px]">
                        <div className="flex items-center space-x-2.5">
                           <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: sub.name.includes('L.V.2') ? 'linear-gradient(135deg, #f59e0b, #10b981)' : sub.hex }}></span>
                           <span className="text-slate-600 font-medium">{sub.name}</span>
                        </div>
                        <div className="text-right">
                           <span className="text-slate-900 font-bold">{sub.grade}</span>
                           <span className="text-slate-400 text-[11px] font-medium ml-1">/20</span>
                        </div>
                     </div>
                  ))}

                  <div className="mt-4 p-4 bg-sky-50/80 border border-sky-100 rounded-2xl flex flex-col gap-2.5 w-full">
                     <div className="flex justify-between items-center text-[13px] font-medium text-slate-600">
                        <span>Total des points</span>
                        <span className="text-slate-900 font-bold">{typeof totalPoints === 'number' ? totalPoints.toFixed(2) : Number(totalPoints).toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center text-[13px] font-medium text-slate-600">
                        <span>Total des coefficients</span>
                        <span className="text-slate-900 font-bold">{totalCoef}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         {/* Class Results Card right under Matières & Résultats */}
         <div className="mt-8">
            <ClassResultsCard
               minAverage={minAverage}
               maxAverage={maxAverage}
               classAverage={classAverage}
               canEditDirectorSection={canEditDirectorSection}
               faitA={faitA}
               onFaitAChange={onFaitAChange}
               faitLe={faitLe}
               onFaitLeChange={onFaitLeChange}
               directorName={directorName}
               onDirectorNameChange={onDirectorNameChange}
               signatureText={signatureText}
               onSignatureTextChange={onSignatureTextChange}
               stampImage={stampImage}
               onStampImageChange={onStampImageChange}
            />
         </div>

         {/* Bottom Cards: Appreciation, Mention */}
         <div className="mt-8 space-y-6">
            <AppreciationCard 
               rank={studentRank} 
               totalSize={totalClassSize} 
               canEdit={canEditAppreciation} 
               canSign={canSignTeacherSignature}
               selectedAppreciation={selectedAppreciation}
               onSelectAppreciation={onSelectAppreciation}
               teacherName={teacherName}
               onTeacherNameChange={onTeacherNameChange}
               isSigned={isTeacherSigned}
               onToggleSigned={onToggleSigned}
               teacherSignature={teacherSignature || student?.teacherSignature}
               onSaveSignature={onSaveSignature}
               onDeleteSignature={onDeleteSignature}
               isCustomRank={isCustomRank}
               onRankChange={onRankChange}
               isCustomAppreciation={isCustomAppreciation}
               onResetAppreciationToAuto={onResetAppreciationToAuto}
            />
            <MentionCard 
               canEdit={canEditAppreciation} 
               selectedDistinctions={selectedDistinctions}
               onDistinctionToggle={onDistinctionToggle}
               selectedSanctions={selectedSanctions}
               onSanctionToggle={onSanctionToggle}
               isCustomMentions={isCustomMentions}
               onResetMentionsToAuto={onResetMentionsToAuto}
            />

         </div>

         {((isTech && (selectedTrim === '2ème trim' || selectedTrim === '2ème Trimestre' || selectedTrim === '2ème Semestre' || selectedTrim === 'Semestre 2' || selectedTrim === '2e Sem' || selectedTrim === '2ème Sem')) || (!isTech && (selectedTrim === '3ème trim' || selectedTrim === '3ème Trimestre'))) && (
            <div className="mt-8">
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
                  onDecisionChange={onAnnualDecisionChange || (() => {})}
                  teacherName={teacherName || ''}
                  onTeacherNameChange={onTeacherNameChange || (() => {})}
                  isTeacherSigned={isTeacherSigned || false}
                  onToggleTeacherSigned={() => onToggleSigned && onToggleSigned(!isTeacherSigned)}
                  teacherSignature={teacherSignature || student?.teacherSignature || null}
                  faitA={faitA || ''}
                  onFaitAChange={onFaitAChange || (() => {})}
                  faitLe={faitLe || ''}
                  onFaitLeChange={onFaitLeChange || (() => {})}
                  directorName={directorName || ''}
                  onDirectorNameChange={onDirectorNameChange || (() => {})}
                  signatureText={signatureText || ''}
                  onSignatureTextChange={onSignatureTextChange || (() => {})}
                  stampImage={stampImage || null}
                  onStampImageChange={onStampImageChange || (() => {})}
                  canEditAppreciation={canEditAppreciation}
                  canEditDirectorSection={canEditDirectorSection}
                  currentUser={currentUser}
               />
            </div>
         )}

         {/* School Slogan */}
         <div className="mt-12 mb-6 text-center border-t border-slate-100 pt-8">
            <p className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400">Terminale D</p>
            <p className="text-base font-extrabold text-slate-700 mt-1.5 italic">« Discipline • Travail • Réussite »</p>
            <p className="text-[11px] font-medium text-slate-400 mt-1">L'excellence au service de l'avenir de nos enfants</p>
         </div>
      </div>

      {/* Grade Details Bottom Sheet */}
      <AnimatePresence>
      {selectedSubject && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
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
               className="bg-white rounded-t-[2.5rem] w-full h-[85vh] shadow-2xl relative flex flex-col p-6 pb-safe"
            >
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0" />
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{selectedSubject.name}</h2>
                    <button onClick={() => setSelectedSubject(null)} className="p-2 hover:bg-gray-100 rounded-full"><X size={24}/></button>
                </div>

                <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h3 className="font-bold text-gray-800">Notes & Devoirs</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                        {canEditGrades && (
                            <button 
                                onClick={() => setShowAddGrade(!showAddGrade)}
                                className="flex items-center gap-1 text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-200/80 px-3 py-1.5 rounded-xl hover:bg-sky-100 transition-colors"
                            >
                                <Plus size={14} /> Ajouter
                            </button>
                        )}
                    </div>
                </div>

                {draftSavedNotification && (
                    <div className="mb-4 px-3.5 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-between shadow-sm animate-in fade-in shrink-0">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                            <span>{draftSavedNotification}</span>
                        </div>
                        <button onClick={() => setDraftSavedNotification(null)} className="text-emerald-600 hover:text-emerald-800">
                            <X size={14} />
                        </button>
                    </div>
                )}

                {/* Scrollable Modal Body */}
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar pb-16">
                    {/* Add Grade Form (Only if canEditGrades) */}
                    {showAddGrade && canEditGrades && (
                        <div className="mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 animate-in slide-in-from-top-2 shrink-0">
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
                                Valider
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
                                            <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
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

      {/* Absence Bottom Sheet */}
      <AnimatePresence>
      {showAbsenceModal && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
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
                 className="bg-white rounded-t-[2.5rem] p-6 pb-safe relative w-full h-[85vh] shadow-2xl flex flex-col"
              >
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0" />
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800">Historique d'Assiduité</h2>
                      <button onClick={() => setShowAbsenceModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                  </div>

                  <div className={`${unjustifiedAbsenceHours > 0 ? 'bg-red-50' : 'bg-emerald-50'} p-4 rounded-2xl flex items-center gap-4 mb-6 shrink-0`}>
                      <div className={`text-3xl font-black ${unjustifiedAbsenceHours > 0 ? 'text-red-500' : 'text-emerald-500'}`}>{totalAbsenceHours}h</div>
                      <div>
                          <p className={`font-bold ${unjustifiedAbsenceHours > 0 ? 'text-red-900' : 'text-emerald-900'}`}>Total d'absence</p>
                          <p className={`text-xs ${unjustifiedAbsenceHours > 0 ? 'text-red-700' : 'text-emerald-700'} opacity-80`}>Cumul sur l'année scolaire</p>
                      </div>
                  </div>

                  <div className="space-y-3 mt-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                     {student?.attendanceHistory && student.attendanceHistory.length > 0 ? (
                         student.attendanceHistory.map((record) => (
                             <div key={record.id} className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center border border-gray-100 shrink-0">
                                 <div className="flex items-center gap-3">
                                     <div className={`p-3 rounded-xl flex items-center justify-center ${record.type === 'absent' ? 'bg-sky-100 text-[#0ea5e9]' : 'bg-orange-100 text-orange-500'}`}>
                                         {record.type === 'absent' ? <XCircle size={20}/> : <Clock size={20}/>}
                                     </div>
                                     <div>
                                         <p className="font-bold text-gray-800 text-sm">{record.type === 'absent' ? 'Absence' : 'Retard'}</p>
                                         <p className="text-xs text-gray-400 font-medium">{record.date}</p>
                                         <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200 w-fit">
                                             <BookOpen size={10} />
                                             <span>{record.subject || 'Matière non spécifiée'} • {record.timeSlot || 'Heure non spécifiée'}</span>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <span className="font-black text-gray-800 block text-lg">{record.hours}h</span>
                                     <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${record.justified ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-red-50 border-red-200 text-red-600'}`}>
                                         {record.justified ? 'Justifié' : 'Non justifié'}
                                     </span>
                                 </div>
                             </div>
                         ))
                     ) : (
                         <div className="text-center py-8">
                             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                 <CheckCircle2 size={32} className="text-emerald-500" />
                             </div>
                             <p className="text-gray-500 font-medium text-sm">Aucune absence ou retard.</p>
                         </div>
                     )}
                  </div>
                  
                  <button onClick={() => setShowAbsenceModal(false)} className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors shrink-0">Fermer</button>
              </motion.div>
          </div>
      )}
      </AnimatePresence>

      {/* Edit Student Modal */}
      <AnimatePresence>
      {showEditStudentModal && (
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
              <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                 onClick={() => setShowEditStudentModal(false)}
              ></motion.div>
              <motion.div 
                 initial={{ y: "100%" }}
                 animate={{ y: 0 }}
                 exit={{ y: "100%" }}
                 transition={{ type: "spring", damping: 25, stiffness: 200 }}
                 className="bg-white rounded-t-[2.5rem] p-6 pb-safe relative w-full max-h-[90vh] shadow-2xl flex flex-col"
              >
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 shrink-0" />
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-800">Modifier la Carte</h2>
                      <button onClick={() => setShowEditStudentModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                  </div>

                  <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2 pb-6">
                      {/* Photo de profil de l'élève */}
                      <div className="flex flex-col items-center justify-center p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 mb-2">
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Photo de Profil (Carte Étudiant)</label>
                          <div className="relative group mb-3">
                              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#0ea5e9] shadow-md bg-white">
                                  <img 
                                      src={editStudentForm.photoUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80'} 
                                      alt={editStudentForm.name} 
                                      className="w-full h-full object-cover"
                                  />
                              </div>
                              <label 
                                  htmlFor="student-photo-file-input" 
                                  className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity rounded-2xl"
                              >
                                  <Camera size={22} />
                                  <span className="text-[10px] font-bold mt-1">Changer</span>
                              </label>
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-sm">
                              <label 
                                  htmlFor="student-photo-file-input" 
                                  className="py-2 px-3.5 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                              >
                                  <Upload size={14} />
                                  <span>Uploader une photo</span>
                              </label>
                              <input 
                                  id="student-photo-file-input" 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                              setEditStudentForm(prev => ({ ...prev, photoUrl: reader.result as string }));
                                          };
                                          reader.readAsDataURL(file);
                                      }
                                  }} 
                                  className="hidden" 
                              />
                          </div>

                          <div className="mt-2.5 w-full max-w-sm">
                              <div className="relative">
                                  <input 
                                      type="text" 
                                      value={editStudentForm.photoUrl || ''} 
                                      onChange={(e) => setEditStudentForm({ ...editStudentForm, photoUrl: e.target.value })}
                                      placeholder="Ou lien URL photo (ex: https://...)" 
                                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white"
                                  />
                                  <Image size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                              </div>
                          </div>
                      </div>

                      <div className="flex-1 overflow-y-auto max-h-[55vh] pr-1 space-y-4">
                          {/* Section 1: État Civil */}
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">État Civil / Identité</h4>
                              <div className="grid grid-cols-2 gap-3">
                                  <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1">Prénom</label>
                                      <input 
                                          type="text" 
                                          value={editStudentForm.firstName} 
                                          onChange={(e) => setEditStudentForm({...editStudentForm, firstName: e.target.value})}
                                          placeholder="Ex: Jean"
                                          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1">Nom</label>
                                      <input 
                                          type="text" 
                                          value={editStudentForm.lastName} 
                                          onChange={(e) => setEditStudentForm({...editStudentForm, lastName: e.target.value})}
                                          placeholder="Ex: Dupont"
                                          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white"
                                      />
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                  <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1">Sexe</label>
                                      <select
                                          value={editStudentForm.gender}
                                          onChange={(e) => setEditStudentForm({...editStudentForm, gender: e.target.value as 'M' | 'F'})}
                                          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white"
                                      >
                                          <option value="M">Masculin (M)</option>
                                          <option value="F">Féminin (F)</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1">Matricule</label>
                                      <input 
                                          type="text" 
                                          value={editStudentForm.matricule} 
                                          onChange={(e) => setEditStudentForm({...editStudentForm, matricule: e.target.value})}
                                          placeholder="Ex: 2024-2854"
                                          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white"
                                      />
                                  </div>
                              </div>
                          </div>

                          {/* Section 2: Naissance & Acte */}
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Naissance & Acte</h4>
                              <div className="grid grid-cols-2 gap-3">
                                  <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1">Date de Naissance</label>
                                      <input 
                                          type="text" 
                                          value={editStudentForm.dob} 
                                          onChange={(e) => setEditStudentForm({...editStudentForm, dob: e.target.value})}
                                          placeholder="jj/mm/aaaa"
                                          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1">Lieu de Naissance</label>
                                      <input 
                                          type="text" 
                                          value={editStudentForm.birthPlace} 
                                          onChange={(e) => setEditStudentForm({...editStudentForm, birthPlace: e.target.value})}
                                          placeholder="Ex: Abidjan, Cocody"
                                          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white"
                                      />
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">Numéro et date de l'acte de naissance</label>
                                  <input 
                                      type="text" 
                                      value={editStudentForm.birthCertificateNumber} 
                                      onChange={(e) => setEditStudentForm({...editStudentForm, birthCertificateNumber: e.target.value})}
                                      placeholder="Ex: 3913 DU 27/03/2006 ETABLI A ABOBO"
                                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white"
                                  />
                                  <span className="text-[10px] text-gray-400 mt-1 block">Format recommandé : N° D'ACTE + DATE DE DÉLIVRANCE + LIEU D'ÉTABLISSEMENT</span>
                              </div>
                          </div>

                          {/* Section 3: Scolarité & Origine */}
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scolarité & Origine</h4>
                              <div className="grid grid-cols-2 gap-3">
                                  <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1">Classe assignée</label>
                                      <select
                                          value={editStudentForm.className}
                                          onChange={(e) => setEditStudentForm({...editStudentForm, className: e.target.value})}
                                          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white"
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
                                          value={editStudentForm.assignedStatus}
                                          onChange={(e) => setEditStudentForm({...editStudentForm, assignedStatus: e.target.value as 'affecte' | 'non_affecte'})}
                                          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white"
                                      >
                                          <option value="affecte">Affecté par l'État</option>
                                          <option value="non_affecte">Non affecté</option>
                                      </select>
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-xs font-semibold text-gray-700 mb-1">Pays & Nationalité</label>
                                  <select
                                      value={editStudentForm.country}
                                      onChange={(e) => {
                                          const cKey = e.target.value;
                                          const cData = COUNTRIES_DATA[cKey];
                                          setEditStudentForm({
                                              ...editStudentForm,
                                              country: cKey,
                                              nationality: cData ? cData.nationality : 'Ivoirienne'
                                          });
                                      }}
                                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white"
                                  >
                                      {Object.keys(COUNTRIES_DATA).map((cKey) => (
                                          <option key={cKey} value={cKey}>
                                              {COUNTRIES_DATA[cKey].flagEmoji} {cKey} ({COUNTRIES_DATA[cKey].nationality})
                                          </option>
                                      ))}
                                  </select>
                              </div>
                          </div>

                          {/* Section 4: Parents & Tuteurs */}
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-4">
                              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parents & Contacts d'urgence</h4>
                              <div className="grid grid-cols-2 gap-3">
                                  <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone du Père</label>
                                      <input 
                                          type="text" 
                                          value={editStudentForm.fatherPhone} 
                                          onChange={(e) => setEditStudentForm({...editStudentForm, fatherPhone: e.target.value})}
                                          placeholder="+225 07 01 02 03 04"
                                          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1">Téléphone de la Mère</label>
                                      <input 
                                          type="text" 
                                          value={editStudentForm.motherPhone} 
                                          onChange={(e) => setEditStudentForm({...editStudentForm, motherPhone: e.target.value})}
                                          placeholder="+225 05 01 02 03 04"
                                          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white"
                                      />
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                  <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1 font-sans">Email du Père <span className="text-[10px] text-gray-400 font-normal">(Optionnel)</span></label>
                                      <input 
                                          type="email" 
                                          value={editStudentForm.fatherEmail} 
                                          onChange={(e) => setEditStudentForm({...editStudentForm, fatherEmail: e.target.value})}
                                          placeholder="pere@example.com"
                                          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1 font-sans">Email de la Mère <span className="text-[10px] text-gray-400 font-normal">(Optionnel)</span></label>
                                      <input 
                                          type="email" 
                                          value={editStudentForm.motherEmail} 
                                          onChange={(e) => setEditStudentForm({...editStudentForm, motherEmail: e.target.value})}
                                          placeholder="mere@example.com"
                                          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white"
                                      />
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                  <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1 font-sans">Téléphone Élève <span className="text-[10px] text-gray-400 font-normal">(Optionnel)</span></label>
                                      <input 
                                          type="text" 
                                          value={editStudentForm.studentPhone} 
                                          onChange={(e) => setEditStudentForm({...editStudentForm, studentPhone: e.target.value})}
                                          placeholder="+225 01 64 23 89 10"
                                          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-1 font-sans">Téléphone Tuteur <span className="text-[10px] text-gray-400 font-normal">(Optionnel)</span></label>
                                      <input 
                                          type="text" 
                                          value={editStudentForm.tutorPhone} 
                                          onChange={(e) => setEditStudentForm({...editStudentForm, tutorPhone: e.target.value})}
                                          placeholder="+225..."
                                          className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-[#0ea5e9] focus:ring-2 focus:ring-[#0ea5e9]/20 outline-none transition-all bg-white"
                                      />
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                      
                      <button 
                          onClick={() => {
                              const fullName = `${editStudentForm.firstName} ${editStudentForm.lastName}`.trim();
                              const updatedInfo = {
                                  ...editStudentForm,
                                  name: fullName
                              };
                              setStudentInfo(updatedInfo);
                              if (student && onUpdateStudent) {
                                  onUpdateStudent({
                                      ...student,
                                      name: fullName,
                                      studentId: editStudentForm.matricule,
                                      class: editStudentForm.className,
                                      birthDate: editStudentForm.dob,
                                      birthPlace: editStudentForm.birthPlace,
                                      birthCertificateNumber: editStudentForm.birthCertificateNumber,
                                      gender: editStudentForm.gender as 'M' | 'F',
                                      country: editStudentForm.country,
                                      nationality: editStudentForm.nationality,
                                      assignedStatus: editStudentForm.assignedStatus as 'affecte' | 'non_affecte',
                                      fatherPhone: editStudentForm.fatherPhone,
                                      motherPhone: editStudentForm.motherPhone,
                                      fatherEmail: editStudentForm.fatherEmail,
                                      motherEmail: editStudentForm.motherEmail,
                                      studentPhone: editStudentForm.studentPhone,
                                      tutorPhone: editStudentForm.tutorPhone,
                                      photoUrl: editStudentForm.photoUrl
                                  });
                              }
                              try {
                                const currentUserJson = localStorage.getItem('school_user_session') || localStorage.getItem('school_user');
                                if (currentUserJson) {
                                  const u = JSON.parse(currentUserJson);
                                  if (u) {
                                    u.name = fullName;
                                    u.assignedClass = editStudentForm.className;
                                    u.matricule = editStudentForm.matricule;
                                    u.photo = editStudentForm.photoUrl;
                                    u.photoUrl = editStudentForm.photoUrl;
                                    localStorage.setItem('school_user_session', JSON.stringify(u));
                                    localStorage.setItem('school_user', JSON.stringify(u));
                                    window.dispatchEvent(new CustomEvent('school_user_updated', { detail: u }));
                                  }
                                }
                              } catch (e) {}
                              setShowEditStudentModal(false);
                          }} 
                          className="mt-2 w-full py-3.5 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-sky-200 shrink-0 flex items-center justify-center gap-2 cursor-pointer"
                      >
                          <Save size={18} />
                          Enregistrer
                      </button>
               </motion.div>
          </div>
      )}
      </AnimatePresence>

      {/* Delete Student Confirmation Modal */}
      <AnimatePresence>
        {showDeleteStudentConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowDeleteStudentConfirm(false)}
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
              <h3 className="text-xl font-bold text-gray-800 mb-2">Supprimer l'élève ?</h3>
              <p className="text-gray-500 mb-8 font-medium">
                  Êtes-vous sûr de vouloir supprimer <span className="font-bold text-gray-700">{`${studentInfo.firstName} ${studentInfo.lastName}`.trim()}</span> ? Cette action est irréversible.
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowDeleteStudentConfirm(false)}
                  className="flex-1 py-3.5 rounded-2xl font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowDeleteStudentConfirm(false);
                    if (onDelete) onDelete();
                  }}
                  className="flex-1 py-3.5 rounded-2xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                >
                  Supprimer
                </button>
              </div>
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
                  Êtes-vous sûr de vouloir supprimer cette note ? La moyenne sera recalculée automatiquement.
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

      {/* Grade Error Modal */}
      <AnimatePresence>
        {gradeError && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
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

      <AnimatePresence>
        {floatingMenuOpen && (
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90]"
             onClick={() => setFloatingMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {appBarMenuOpen && (
          <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[40]"
             onClick={() => setAppBarMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {!(showAbsenceModal || !!selectedSubject || showEditStudentModal || showSuppliesModal || showMobileSubjects || isNavHidden) && (
      <div className="fixed bottom-24 right-6 z-[100] flex flex-col items-end">
          <AnimatePresence>
              {floatingMenuOpen && (
                  <motion.div 
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 20, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-end space-y-3 mb-4"
                  >
                      <button onClick={() => { setFloatingMenuOpen(false); handleNav('card'); }} className="flex items-center space-x-3 bg-white pl-4 pr-1.5 py-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:scale-105 transition-transform border border-slate-50 w-max cursor-pointer">
                          <span className="text-slate-700 font-semibold text-[14px]">Ma carte</span>
                          <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                              <CreditCard size={16} />
                          </div>
                      </button>
                      <button onClick={() => { setFloatingMenuOpen(false); handleNav('settings'); }} className="flex items-center space-x-3 bg-white pl-4 pr-1.5 py-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:scale-105 transition-transform border border-slate-50 w-max cursor-pointer">
                          <span className="text-slate-700 font-semibold text-[14px]">Paramètres</span>
                          <div className="w-8 h-8 rounded-full bg-[#F0F5FA] flex items-center justify-center">
                              <Settings size={16} className="text-slate-700" />
                          </div>
                      </button>
                  </motion.div>
              )}
          </AnimatePresence>
          <button 
              onClick={() => setFloatingMenuOpen(!floatingMenuOpen)}
              className="w-14 h-14 bg-[#B0D9FD] text-white rounded-[18px] flex items-center justify-center shadow-lg hover:brightness-95 transition-all z-[100]"
          >
              <Plus className={`w-7 h-7 transition-transform duration-300 ${floatingMenuOpen ? 'rotate-45' : ''}`} strokeWidth={2.5} />
          </button>
      </div>
      )}

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
              className="fixed bottom-0 left-0 right-0 z-[101] bg-white rounded-t-[40px] p-6 pt-4 flex flex-col md:hidden max-h-[85vh] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
            >
              {/* Handle bar */}
              <div className="w-12 h-1 bg-blue-300 rounded-full mx-auto mb-8 shrink-0 opacity-80" />
              
              <div className="flex items-center justify-between mb-8 shrink-0 px-2">
                <h2 className="text-[22px] font-bold text-[#2A346E]">Matières</h2>
                <button 
                  onClick={() => setShowMobileSubjects(false)}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100/50 text-[#2A346E] hover:bg-slate-200/50 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="overflow-y-auto custom-scrollbar flex-1 pb-10 flex flex-col gap-4 px-2">
                {subjects.map((subject, index) => {
                  const isTeacher = currentUser?.role === 'teacher';
                  const isInactive = Boolean(subject.inactive);
                  const isRestricted = isInactive || (isTeacher && currentUser?.subject && !isSubjectMatch(currentUser.subject, subject.name));
                  
                  return (
                    <div 
                      key={index} 
                      onClick={() => {
                        if (!isRestricted) {
                          handleSelectSubject(subject);
                          setShowMobileSubjects(false);
                        }
                      }}
                      className={`flex items-center justify-between ${isRestricted ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer hover:opacity-80 transition-opacity'}`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-6">
                        <div className={`w-[52px] h-[52px] ${isInactive ? 'bg-gray-400' : (subject.color || 'bg-blue-500')} rounded-[18px] flex items-center justify-center shrink-0 shadow-sm text-white`}>
                          <BookOpen className="w-[26px] h-[26px]" strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className={`font-bold text-[15px] sm:text-[16px] tracking-tight truncate ${isInactive ? 'line-through text-slate-500' : 'text-[#2A346E]'}`}>{subject.name}</span>
                          {isInactive ? (
                            <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full w-max">Non suivie (LV2)</span>
                          ) : subject.coef === 0 ? (
                            <span className="text-[13px] text-[#2A346E] opacity-60 font-medium truncate">Bonus</span>
                          ) : (
                            <span className="text-[13px] text-[#2A346E] opacity-60 font-medium truncate">Coef. {subject.coef}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1 shrink-0 ml-auto pl-4">
                        <span className={`font-black text-[20px] sm:text-[22px] tracking-tight ${isInactive ? 'text-slate-400' : 'text-[#2A346E]'}`}>{isInactive ? '-' : subject.grade}</span>
                        {!isInactive && <span className="text-[12px] sm:text-[13px] text-[#2A346E] opacity-60 font-medium">/ 20</span>}
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 text-slate-300" />
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
        className={student?.class || 'Seconde C1'}
        studentId={student?.id || 'default'}
        studentName={student?.name}
        currentUser={currentUser}
      />

      {student && (
        <PrintableBulletin 
          currentUser={{ role: 'student', accessLevel: 1 }}
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          student={student}
          selectedTrimester={selectedTrim}
          augmentedSubjects={filteredSubjects}
          totalPoints={totalPoints}
          totalCoef={totalCoef}
          calculatedAverage={average}
          studentRank={studentRank}
          totalClassSize={totalClassSize}
          minAverage={minAverage}
          maxAverage={maxAverage}
          unjustifiedAbsenceHours={student.attendanceHistory?.filter(a => !a.justified)?.reduce((acc, curr) => acc + curr.hours, 0) || 0}
          teachers={teachers}
          selectedAppreciation={selectedAppreciation}
          principalTeacherName={teacherName || student?.mainTeacherName || getClassPrincipalTeacherSignature(student?.class).teacherName}
          teacherSignature={teacherSignature || student?.teacherSignature || getClassPrincipalTeacherSignature(student?.class).signature}
          isSignedByTeacher={isTeacherSigned || Boolean(teacherSignature || student?.teacherSignature || getClassPrincipalTeacherSignature(student?.class).signature)}
          selectedDistinctions={selectedDistinctions}
          selectedSanctions={selectedSanctions}
          faitA={faitA}
          faitLe={faitLe}
          directorName={directorName}
          signatureText={signatureText}
          stampImage={stampImage}
        />
      )}
    </div>
  );
}
