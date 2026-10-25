import React, { useState, useEffect, useMemo } from 'react';
import { Student, Teacher, ClassItem } from '../types';
import { mockClasses } from '../data/mockData';
import { getParentChildren, isParentChild, isSameClass } from '../src/utils/parentUtils';
import { DirectorSignatureStamp } from './DirectorSignatureStamp';
import { isTechnicalClass, calculateAnnualAverage, getDisciplineMarkFromStudent, getSubjectRankInClass, getStudentTrimesterAverage } from '../src/utils/academicUtils';
import { getSubjectCoef } from './TransactionList';
import { 
  Printer, FileText, Search, User, School, Edit3, ChevronRight, 
  BookOpen, Users, ArrowLeft, Check, Sparkles, GraduationCap, 
  Phone, AlertCircle, Award, Clock
} from 'lucide-react';

interface LivretScolairePageProps {
  allStudents?: Student[];
  teachers?: Teacher[];
  currentUser?: any;
}

interface DisciplineItem {
  id: string;
  category: 'LETTRES' | 'SCIENCES' | 'AUTRES';
  name: string;
  coef: number;
  t1: number | null;
  t2: number | null;
  t3: number | null;
  teacher: string;
  appreciation: string;
  isBilan?: boolean;
  inactive?: boolean;
}

export const LivretScolairePage: React.FC<LivretScolairePageProps> = ({
  allStudents = [],
  teachers = [],
  currentUser
}) => {
  // Master classes list (combining mockClasses with any custom class in allStudents)
  const allClassesList = useMemo(() => {
    const list: ClassItem[] = [...mockClasses];

    allStudents.forEach(s => {
      if (s.class) {
        const matchesExisting = list.some(c => isSameClass(s.class, c.name) || isSameClass(s.class, c.code));
        if (!matchesExisting) {
          let sec: 'Primaire' | 'Général' | 'Technique' = 'Général';
          if (s.class.startsWith('CP') || s.class.startsWith('CE') || s.class.startsWith('CM')) {
            sec = 'Primaire';
          } else if (s.class.includes('G') || s.class.includes('AB')) {
            sec = 'Technique';
          }
          list.push({
            id: Date.now() + Math.random(),
            name: s.class,
            code: s.class,
            students: 0,
            time: '07:30 - 13:30',
            color: 'bg-blue-100 text-blue-600',
            section: sec
          });
        }
      }
    });

    const isTeacher = currentUser?.role === 'teacher' || currentUser?.accessLevel === 3;
    if (isTeacher) {
      const assigned: string[] = [];
      const addCls = (c: any) => {
        if (typeof c === 'string') {
          const trimmed = c.trim();
          if (trimmed && !assigned.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
            assigned.push(trimmed);
          }
        }
      };
      if (Array.isArray(currentUser?.assignedClasses)) {
        currentUser.assignedClasses.forEach((c: any) => {
          if (typeof c === 'string' && c.includes(',')) c.split(',').forEach(sub => addCls(sub));
          else addCls(c);
        });
      } else if (typeof currentUser?.assignedClasses === 'string') {
        currentUser.assignedClasses.split(',').forEach((c: string) => addCls(c));
      }
      if (currentUser?.assignedClass) {
        if (typeof currentUser.assignedClass === 'string' && currentUser.assignedClass.includes(',')) {
          currentUser.assignedClass.split(',').forEach((c: string) => addCls(c));
        } else {
          addCls(currentUser.assignedClass);
        }
      }

      // Check matching teacher profile in teachers array
      const matchingTeacher = teachers?.find((t: any) => 
        (t.email && currentUser?.email && t.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (t.matricule && currentUser?.matricule && t.matricule.toLowerCase() === currentUser.matricule.toLowerCase()) ||
        (t.name && currentUser?.name && t.name.toLowerCase() === currentUser.name.toLowerCase()) ||
        (String(t.id) === String(currentUser?.id))
      );

      if (matchingTeacher) {
        if (Array.isArray(matchingTeacher.assignedClasses)) {
          matchingTeacher.assignedClasses.forEach((c: any) => {
            if (typeof c === 'string' && c.includes(',')) c.split(',').forEach(sub => addCls(sub));
            else addCls(c);
          });
        } else if (typeof matchingTeacher.assignedClasses === 'string') {
          (matchingTeacher.assignedClasses as string).split(',').forEach((c: string) => addCls(c));
        }
        if (matchingTeacher.assignedClass) {
          if (typeof matchingTeacher.assignedClass === 'string' && matchingTeacher.assignedClass.includes(',')) {
            matchingTeacher.assignedClass.split(',').forEach((c: string) => addCls(c));
          } else {
            addCls(matchingTeacher.assignedClass);
          }
        }
      }

      // Add missing assigned classes to list
      assigned.forEach((ac, idx) => {
        if (!list.some(c => c.name.toLowerCase() === ac.toLowerCase() || c.code.toLowerCase() === ac.toLowerCase())) {
          let sec: 'Primaire' | 'Général' | 'Technique' = 'Général';
          const lower = ac.toLowerCase();
          if (lower.startsWith('cp') || lower.startsWith('ce') || lower.startsWith('cm')) sec = 'Primaire';
          else if (lower.includes('g') || lower.includes('ab')) sec = 'Technique';
          list.push({
            id: 9500 + idx,
            name: ac,
            code: ac,
            students: 0,
            time: '07:30 - 13:30',
            color: 'bg-blue-100 text-blue-600',
            section: sec
          });
        }
      });

      return list.filter(c => assigned.some(ac => ac.toLowerCase() === c.name.toLowerCase() || ac.toLowerCase() === c.code.toLowerCase()));
    }

    if (!isTeacher && currentUser?.section === 'Primaire') {
      return list.filter(c => c.section === 'Primaire');
    }

    return list;
  }, [allStudents, currentUser, teachers]);

  // View modes: 'classes' | 'students' | 'livret'
  const [viewMode, setViewMode] = useState<'classes' | 'students' | 'livret'>('classes');
  const [selectedSection, setSelectedSection] = useState<'Toutes' | 'Primaire' | 'Général' | 'Technique'>('Toutes');
  const [searchClassTerm, setSearchClassTerm] = useState<string>('');
  const [selectedClassItem, setSelectedClassItem] = useState<ClassItem | null>(null);

  const [searchStudentTerm, setSearchStudentTerm] = useState<string>('');
  const [selectedStudentForLivret, setSelectedStudentForLivret] = useState<Student | null>(null);

  // List of children if user is a parent
  const parentChildren = useMemo(() => {
    if (currentUser?.role === 'parent') {
      return getParentChildren(currentUser, allStudents);
    }
    return [];
  }, [currentUser, allStudents]);

  useEffect(() => {
    const isStudent = currentUser?.role === 'student' || currentUser?.accessLevel === 1;
    const isParent = currentUser?.role === 'parent';

    if (isStudent && allStudents && allStudents.length > 0) {
      const match = allStudents.find(s => 
        (s.email && currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (s.studentId && currentUser.matricule && s.studentId.toLowerCase() === currentUser.matricule.toLowerCase()) ||
        (s.studentId && currentUser.studentId && s.studentId.toLowerCase() === currentUser.studentId.toLowerCase()) ||
        (s.name && currentUser.name && s.name.toLowerCase() === currentUser.name.toLowerCase())
      );
      if (match) {
        setSelectedStudentForLivret(match);
        setViewMode('livret');
      }
    } else if (isParent && parentChildren.length > 0) {
      if (!selectedStudentForLivret || !parentChildren.some(c => c.id === selectedStudentForLivret.id)) {
        setSelectedStudentForLivret(parentChildren[0]);
        setViewMode('livret');
      }
    }
  }, [currentUser, allStudents, parentChildren]);

  // Class student counts computed dynamically from real database
  const classStudentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allClassesList.forEach(c => {
      counts[c.name] = allStudents.filter(s => s.class === c.name || s.class === c.code).length;
    });
    return counts;
  }, [allClassesList, allStudents]);

  // Filtered classes list based on selected section & search
  const filteredClasses = useMemo(() => {
    const isTeacher = currentUser?.role === 'teacher' || currentUser?.accessLevel === 3;
    const isParent = currentUser?.role === 'parent';

    return allClassesList.filter(c => {
      if (isParent && parentChildren.length > 0) {
        const isMatch = parentChildren.some(child => 
          isSameClass(child.class || '', c.name) || isSameClass(child.class || '', c.code)
        );
        if (!isMatch) {
          return false;
        }
      }
      const matchSection = isTeacher || selectedSection === 'Toutes' || c.section === selectedSection;
      const matchSearch = !searchClassTerm || 
        c.name.toLowerCase().includes(searchClassTerm.toLowerCase()) || 
        c.code.toLowerCase().includes(searchClassTerm.toLowerCase());
      return matchSection && matchSearch;
    });
  }, [allClassesList, selectedSection, searchClassTerm, currentUser, parentChildren]);

  // Students in selected class matching search
  const classStudents = useMemo(() => {
    if (!selectedClassItem) return [];
    const className = selectedClassItem.name;
    const classCode = selectedClassItem.code;
    const filtered = allStudents.filter(s => {
      const matchClass = s.class === className || s.class === classCode;
      const matchSearch = !searchStudentTerm || 
        (s.name || '').toLowerCase().includes(searchStudentTerm.toLowerCase()) || 
        (s.studentId && s.studentId.toLowerCase().includes(searchStudentTerm.toLowerCase()));
      if (currentUser?.role === 'parent') {
        return matchClass && matchSearch && isParentChild(currentUser, s, allStudents);
      }
      return matchClass && matchSearch;
    });
    return filtered.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'fr', { sensitivity: 'base' }));
  }, [allStudents, selectedClassItem, searchStudentTerm, currentUser]);

  // Find Main Teacher for the selected class or student
  const mainTeacher = useMemo(() => {
    const className = selectedClassItem?.name || selectedStudentForLivret?.class;
    if (!className) return null;
    return teachers?.find(t => t.isPrincipal && t.principalClasses?.includes(className)) || teachers?.[0] || null;
  }, [teachers, selectedClassItem, selectedStudentForLivret]);

  // Editable Document General State
  const [schoolName, setSchoolName] = useState<string>("Collège Faoummaba");
  const [schoolPhone, setSchoolPhone] = useState<string>("31 BP 144 ABIDJAN 31 - Tél.: 07 59 84 45 61");
  const [dreName, setDreName] = useState<string>("DIRECTION REGIONALE D'ABIDJAN 3");
  const [academicYear, setAcademicYear] = useState<string>("2025-2026");

  // Editable Student Fields
  const [studentName, setStudentName] = useState<string>('');
  const [studentMatricule, setStudentMatricule] = useState<string>('');
  const [studentBirthDate, setStudentBirthDate] = useState<string>('');
  const [studentBirthPlace, setStudentBirthPlace] = useState<string>('Yopougon');
  const [studentClass, setStudentClass] = useState<string>('');
  const [isRedoublant, setIsRedoublant] = useState<string>('Non');
  const [isBoursier, setIsBoursier] = useState<string>('Non');
  const [isAssigned, setIsAssigned] = useState<string>('Oui');
  const [photoUrl, setPhotoUrl] = useState<string>('https://i.pravatar.cc/150');

  const canPrint = currentUser?.role !== 'student' && currentUser?.accessLevel !== 1 && currentUser?.role !== 'teacher' && currentUser?.accessLevel !== 3;

  const isTech = useMemo(() => isTechnicalClass(selectedStudentForLivret?.class || studentClass || selectedClassItem?.name), [selectedStudentForLivret, studentClass, selectedClassItem]);

  // Editable Recap Ranks & Decision
  const [rankT1, setRankT1] = useState<string>('');
  const [rankT2, setRankT2] = useState<string>('');
  const [rankT3, setRankT3] = useState<string>('');
  const [rankAnnual, setRankAnnual] = useState<string>('');
  const [customDecision, setCustomDecision] = useState<string>('');

  // Editable Signatures and Cachet/Stamp States
  const [mainTeacherName, setMainTeacherName] = useState<string>('');
  const [teacherSignature, setTeacherSignature] = useState<string>('');
  const [directorName, setDirectorName] = useState<string>('M. TRAORÉ KASSIM');
  const [directorSignature, setDirectorSignature] = useState<string>('T. Kassim');
  const [stampMode, setStampMode] = useState<'blank' | 'digital'>('blank');

  // Initial Default Disciplines Data - Empty for admin input
  const defaultDisciplines: DisciplineItem[] = isTech ? [
    { id: '1', category: 'LETTRES', name: 'Français', coef: 4, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '2', category: 'LETTRES', name: 'Anglais', coef: 2, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '3', category: 'LETTRES', name: 'Allemand', coef: 2, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '4', category: 'LETTRES', name: 'Espagnol', coef: 1, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '5', category: 'LETTRES', name: 'Histoire-Géographie', coef: 2, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '6', category: 'LETTRES', name: 'Expression Professionnelle', coef: 1, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },

    { id: '7', category: 'SCIENCES', name: 'Mathématiques', coef: 2, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '8', category: 'SCIENCES', name: 'Sciences de la Vie et de la Terre', coef: 2, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },

    { id: '9', category: 'AUTRES', name: 'Droit', coef: 2, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '10', category: 'AUTRES', name: 'Économie Générale', coef: 1, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '11', category: 'AUTRES', name: 'Technique Administrative et Commerciale', coef: 2, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '12', category: 'AUTRES', name: 'Outils de communication', coef: 2, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '13', category: 'AUTRES', name: 'Sténographie', coef: 2, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '14', category: 'AUTRES', name: 'Informatique', coef: 2, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '15', category: 'AUTRES', name: 'Éducation Physique et Sportive', coef: 1, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '16', category: 'AUTRES', name: 'Conduite', coef: 1, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
  ] : [
    { id: '1', category: 'LETTRES', name: 'Composition Française', coef: 3, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '2', category: 'LETTRES', name: 'Orthographe-Grammaire', coef: 3, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '3', category: 'LETTRES', name: 'Expression Orale', coef: 1, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '4', category: 'LETTRES', name: 'Philosophie', coef: 2, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '5', category: 'LETTRES', name: 'Anglais', coef: 1, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '6', category: 'LETTRES', name: 'Allemand / Espagnol', coef: 1, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '7', category: 'LETTRES', name: 'Histoire Géographie', coef: 2, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },

    { id: '8', category: 'SCIENCES', name: 'Mathématiques', coef: 4, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '9', category: 'SCIENCES', name: 'Physiques-Chimie', coef: 4, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '10', category: 'SCIENCES', name: 'Sc. de la Vie et de la Terre', coef: 4, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },

    { id: '11', category: 'AUTRES', name: 'Arts Plastiques / Education Musicale', coef: 1, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '12', category: 'AUTRES', name: 'Education Phys. Sportive', coef: 1, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '13', category: 'AUTRES', name: 'EDHC', coef: 1, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '14', category: 'AUTRES', name: 'Informatique', coef: 1, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
    { id: '15', category: 'AUTRES', name: 'Conduite', coef: 1, t1: null, t2: null, t3: null, teacher: '', appreciation: '' },
  ];

  const [disciplines, setDisciplines] = useState<DisciplineItem[]>(defaultDisciplines);
  const [isDisciplinesEdited, setIsDisciplinesEdited] = useState<boolean>(false);

  // Sync when selected student changes
  useEffect(() => {
    if (selectedStudentForLivret) {
      setIsDisciplinesEdited(false);
      setStudentName(selectedStudentForLivret.name);
      setStudentMatricule(selectedStudentForLivret.studentId || '');
      setStudentBirthDate(selectedStudentForLivret.birthDate || '');
      setStudentBirthPlace(selectedStudentForLivret.birthPlace || '');
      const currentClass = selectedStudentForLivret.class || selectedClassItem?.name || '';
      setStudentClass(currentClass);
      setIsAssigned(selectedStudentForLivret.assignedStatus === 'non_affecte' ? 'Non' : 'Oui');
      setPhotoUrl(selectedStudentForLivret.photoUrl || `https://i.pravatar.cc/150?u=${selectedStudentForLivret.id}`);

      const defaultTeacher = mainTeacher ? mainTeacher.name : 'M. YALE ARLON';
      setMainTeacherName(selectedStudentForLivret.mainTeacherName || defaultTeacher);
      setTeacherSignature(selectedStudentForLivret.teacherSignature || defaultTeacher.split(' ').pop() || 'Y. Arlon');
      setDirectorName(selectedStudentForLivret.directorName || 'M. TRAORÉ KASSIM');
      setDirectorSignature(selectedStudentForLivret.directorSignature || 'T. Kassim');
      setStampMode(selectedStudentForLivret.stampMode || 'blank');

      const studsInClass = allStudents ? allStudents.filter(s => s.class === (selectedStudentForLivret.class || currentClass) || (s.class && typeof (selectedStudentForLivret.class || currentClass) === "string" && (selectedStudentForLivret.class || currentClass).includes(s.class))) : [];
      if (studsInClass.length > 0) {
        const calculateClassRank = (calcFn: (st: Student) => number | null) => {
          const scores = studsInClass.map(st => ({ id: st.id, score: calcFn(st) }))
            .filter(st => st.score !== null && !isNaN(st.score!));
          const myScore = calcFn(selectedStudentForLivret);
          if (myScore === null || isNaN(myScore)) return '';
          const strictlyBetter = scores.filter(st => st.score! > myScore + 0.001).length;
          const sameCount = scores.filter(st => Math.abs(st.score! - myScore) <= 0.001).length;
          const rNum = strictlyBetter + 1;
          const suffix = rNum === 1 ? 'er' : 'e';
          const ex = sameCount > 1 ? 'ex' : '';
          return `${rNum}${suffix}${ex} / ${scores.length}`;
        };

        setRankT1(calculateClassRank(st => getStudentTrimesterAverage(st, '1er trim')));
        setRankT2(calculateClassRank(st => getStudentTrimesterAverage(st, '2ème trim')));
        setRankT3(calculateClassRank(st => getStudentTrimesterAverage(st, '3ème trim')));
        setRankAnnual(calculateClassRank(st => {
          const m1 = getStudentTrimesterAverage(st, '1er trim');
          const m2 = getStudentTrimesterAverage(st, '2ème trim');
          const m3 = getStudentTrimesterAverage(st, '3ème trim');
          return calculateAnnualAverage(m1, m2, m3, isTech);
        }));
      }

      setDisciplines(defaultDisciplines.map(item => {
        const coef = getSubjectCoef(currentClass, item.name) || item.coef;

        let t1 = getDisciplineMarkFromStudent(selectedStudentForLivret, '1er trim', item.name);
        let t2 = getDisciplineMarkFromStudent(selectedStudentForLivret, '2ème trim', item.name);
        let t3 = getDisciplineMarkFromStudent(selectedStudentForLivret, '3ème trim', item.name);

        let teacher = item.teacher;
        let appreciation = item.appreciation;

        if (selectedStudentForLivret.grades && Array.isArray(selectedStudentForLivret.grades)) {
          const match = selectedStudentForLivret.grades.find((g: any) => g.subject?.toLowerCase() === item.name.toLowerCase());
          if (match) {
            if (match.t1 !== undefined && match.t1 !== null && match.t1 !== '') t1 = Number(match.t1);
            if (match.t2 !== undefined && match.t2 !== null && match.t2 !== '') t2 = Number(match.t2);
            if (match.t3 !== undefined && match.t3 !== null && match.t3 !== '') t3 = Number(match.t3);
            if (match.teacher) teacher = match.teacher;
            if (match.appreciation) appreciation = match.appreciation;
          }
        }

        return {
          ...item,
          coef,
          t1,
          t2,
          t3,
          teacher,
          appreciation
        };
      }));
    }
  }, [selectedStudentForLivret, selectedClassItem, allStudents, isTech, mainTeacher]);

  // Handle discipline updates
  const handleDisciplineChange = (id: string, field: keyof DisciplineItem, value: any) => {
    setIsDisciplinesEdited(true);
    setDisciplines(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Calculations
  const fmt = (num: number | string | undefined | null) => {
    if (num === undefined || num === null || num === '') return '-';
    const val = typeof num === 'string' ? parseFloat(num.replace(',', '.')) : num;
    if (isNaN(val)) return '-';
    return val.toFixed(2).replace('.', ',');
  };

  const activeDisciplines = useMemo(() => {
    let list = [...disciplines];
    if (isTech) {
      const allemand = list.find(d => d.name.toLowerCase().includes("allemand"));
      const espagnol = list.find(d => d.name.toLowerCase().includes("espagnol"));
      if (allemand && espagnol) {
        const hasAllemand = (allemand.t1 !== null && allemand.t1 !== undefined && !isNaN(allemand.t1)) ||
                            (allemand.t2 !== null && allemand.t2 !== undefined && !isNaN(allemand.t2)) ||
                            (allemand.t3 !== null && allemand.t3 !== undefined && !isNaN(allemand.t3));
        const hasEspagnol = (espagnol.t1 !== null && espagnol.t1 !== undefined && !isNaN(espagnol.t1)) ||
                            (espagnol.t2 !== null && espagnol.t2 !== undefined && !isNaN(espagnol.t2)) ||
                            (espagnol.t3 !== null && espagnol.t3 !== undefined && !isNaN(espagnol.t3));
        
        list = list.map(d => {
          if (hasAllemand && !hasEspagnol && d.name.toLowerCase().includes("espagnol")) {
            return { ...d, inactive: true };
          } else if (hasEspagnol && !hasAllemand && d.name.toLowerCase().includes("allemand")) {
            return { ...d, inactive: true };
          } else if (hasAllemand && hasEspagnol && d.name.toLowerCase().includes("allemand")) {
            return { ...d, inactive: true };
          }
          return d;
        });
      }
    }
    return list;
  }, [disciplines, isTech]);

  // Calculate Trimester Averages
  const calculateTrimAverage = (trimKey: 't1' | 't2' | 't3') => {
    let totalScore = 0;
    let totalCoef = 0;
    activeDisciplines.forEach(d => {
      if (d.inactive) return;
      const mark = d[trimKey];
      if (mark !== null && mark !== undefined && !isNaN(mark)) {
        totalScore += mark * d.coef;
        totalCoef += d.coef;
      }
    });
    return totalCoef > 0 ? totalScore / totalCoef : 0;
  };

  const trim1Avg = useMemo(() => {
    if (!isDisciplinesEdited && selectedStudentForLivret) {
      const fromStudent = getStudentTrimesterAverage(selectedStudentForLivret, '1er trim');
      if (fromStudent !== null && fromStudent !== undefined && !isNaN(fromStudent) && fromStudent > 0) {
        return fromStudent;
      }
    }
    return calculateTrimAverage('t1');
  }, [selectedStudentForLivret, activeDisciplines, isDisciplinesEdited]);

  const trim2Avg = useMemo(() => {
    if (!isDisciplinesEdited && selectedStudentForLivret) {
      const fromStudent = getStudentTrimesterAverage(selectedStudentForLivret, '2ème trim');
      if (fromStudent !== null && fromStudent !== undefined && !isNaN(fromStudent) && fromStudent > 0) {
        return fromStudent;
      }
    }
    return calculateTrimAverage('t2');
  }, [selectedStudentForLivret, activeDisciplines, isDisciplinesEdited]);

  const trim3Avg = useMemo(() => {
    if (!isDisciplinesEdited && selectedStudentForLivret) {
      const fromStudent = getStudentTrimesterAverage(selectedStudentForLivret, '3ème trim');
      if (fromStudent !== null && fromStudent !== undefined && !isNaN(fromStudent) && fromStudent > 0) {
        return fromStudent;
      }
    }
    return calculateTrimAverage('t3');
  }, [selectedStudentForLivret, activeDisciplines, isDisciplinesEdited]);

  const annualAvg = useMemo(() => {
    return calculateAnnualAverage(
      trim1Avg > 0 ? trim1Avg : null,
      trim2Avg > 0 ? trim2Avg : null,
      trim3Avg > 0 ? trim3Avg : null,
      isTech
    ) || 0;
  }, [trim1Avg, trim2Avg, trim3Avg, isTech]);

  const getCategoryBilan = (cat: 'LETTRES' | 'SCIENCES') => {
    const items = activeDisciplines.filter(d => d.category === cat);
    const getBilanTrim = (trimKey: 't1' | 't2' | 't3') => {
      let score = 0, coef = 0;
      items.forEach(d => {
        if (d.inactive) return;
        const val = d[trimKey];
        if (val !== null && val !== undefined && !isNaN(val)) {
          score += val * d.coef;
          coef += d.coef;
        }
      });
      return coef > 0 ? score / coef : null;
    };
    return {
      t1: getBilanTrim('t1'),
      t2: getBilanTrim('t2'),
      t3: getBilanTrim('t3')
    };
  };

  const lettresBilan = useMemo(() => getCategoryBilan('LETTRES'), [activeDisciplines]);
  const sciencesBilan = useMemo(() => getCategoryBilan('SCIENCES'), [activeDisciplines]);

  // View state inside Livret document: 'preview' vs 'edit'
  const [activeView, setActiveView] = useState<'preview' | 'edit'>('preview');

  const handleSelectClass = (cls: ClassItem) => {
    setSelectedClassItem(cls);
    setSelectedStudentForLivret(null);
    setSearchStudentTerm('');
    setViewMode('students');
  };

  const handleSelectStudent = (st: Student) => {
    setSelectedStudentForLivret(st);
    setViewMode('livret');
  };

  const handleBackToClasses = () => {
    setViewMode('classes');
    setSelectedClassItem(null);
    setSelectedStudentForLivret(null);
  };

  const handleBackToStudents = () => {
    setViewMode('students');
    setSelectedStudentForLivret(null);
  };

  const handlePrint = () => {
    const printElement = document.getElementById('printable-livret-document');
    
    try {
      const win = window.open('', '_blank');
      if (win && printElement) {
        win.document.write(`
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="utf-8">
              <title>Livret Scolaire - ${studentName}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  @page { size: A4 landscape; margin: 4mm; }
                  .no-print { display: none !important; }
                  body { margin: 0 !important; padding: 0 !important; background: white !important; }
                  #printable-livret-document {
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 auto !important;
                    padding: 2mm 3mm !important;
                    box-sizing: border-box !important;
                    zoom: 0.94 !important;
                    font-size: 9.5px !important;
                  }
                }
                body { 
                  background-color: white !important; 
                  color: black !important; 
                  font-family: system-ui, -apple-system, sans-serif; 
                  padding: 0; 
                  margin: 0;
                }
              </style>
            </head>
            <body>
              <div class="no-print" style="margin-bottom: 16px; padding: 12px 16px; background-color: #1e40af; color: white; display: flex; justify-content: space-between; align-items: center; border-radius: 12px; font-family: sans-serif;">
                <div>
                  <strong style="font-size: 14px;">Impression Livret Scolaire</strong>
                  <p style="font-size: 12px; margin: 2px 0 0 0; color: #93c5fd;">${studentName} - Matricule: ${studentMatricule} (${studentClass})</p>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button onclick="window.print()" style="padding: 8px 16px; background-color: #2563eb; color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                    Imprimer ce document
                  </button>
                  <button onclick="window.close()" style="padding: 8px 12px; background-color: #1e3a8a; color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                    Fermer
                  </button>
                </div>
              </div>
              <div style="display: flex; justify-content: center;">
                ${printElement.outerHTML}
              </div>
              <script>
                setTimeout(function() {
                  window.print();
                }, 500);
              </script>
            </body>
          </html>
        `);
        win.document.close();
        return;
      }
    } catch (e) {
      console.warn("window.open print failed, falling back to direct window.print()", e);
    }

    try {
      window.print();
    } catch (err) {
      console.error("Direct window.print error", err);
    }
  };

  const computedDecision = customDecision || (annualAvg >= 10 ? 'Admis(e) en classe supérieure' : 'Redouble en cas d\'échec');

  return (
    <div className="flex-1 overflow-y-auto h-full min-h-full bg-white p-4 sm:p-6 pb-24 text-slate-900 custom-scrollbar">
      
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          #printable-livret-document {
            width: 100% !important;
            max-width: 100% !important;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            gap: 2px;
            margin: 0 auto !important;
            padding: 2mm 3mm !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
            font-size: 9.5px;
            overflow: hidden;
            box-sizing: border-box;
            zoom: 0.94;
          }
          @page {
            size: A4 landscape;
            margin: 4mm;
          }
        }
      `}</style>

      {/* PARENT CHILD SELECTOR BANNER */}
      {currentUser?.role === 'parent' && parentChildren.length > 0 && (
        <div className="max-w-7xl mx-auto mb-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white p-4 rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-blue-400/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Users size={22} className="text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base leading-tight">Livret Scolaire de vos enfants ({parentChildren.length})</h3>
              <p className="text-xs text-blue-200 mt-0.5">Cliquez sur un enfant pour consulter son livret scolaire</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {parentChildren.map((child) => {
              const isSelected = viewMode === 'livret' && (selectedStudentForLivret?.id === child.id || selectedStudentForLivret?.studentId === child.studentId);
              return (
                <button
                  key={child.id || child.studentId}
                  onClick={() => {
                    setSelectedStudentForLivret(child);
                    setViewMode('livret');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-white text-blue-800 shadow-md scale-105 ring-2 ring-blue-300'
                      : 'bg-white/15 hover:bg-white/25 text-white'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-emerald-400' : 'bg-blue-300'}`}></span>
                  <span>{child.name}</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-black/20 text-blue-100 font-mono">
                    {child.class}
                  </span>
                </button>
              );
            })}
            {viewMode === 'livret' && (
              <button
                onClick={() => setViewMode('classes')}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 border border-white/20 ml-1"
              >
                <School size={14} />
                <span>Par classe</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* VIEW 1: MASTER CLASSES SELECTION LIST */}
      {viewMode === 'classes' && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
                  <FileText size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Livret Scolaire Général</h1>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">
                    Sélectionnez une classe puis cliquez sur le bouton <strong className="text-blue-600 font-bold">Livret scolaire</strong> pour consulter le livret de votre choix.
                  </p>
                </div>
              </div>

              {/* Class Search Bar */}
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Rechercher une classe (ex: 6ème 1, CP1)..."
                  value={searchClassTerm}
                  onChange={(e) => setSearchClassTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            {/* Section Filter Tabs */}
            {currentUser?.section !== 'Primaire' && (
              <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar border-t border-slate-100 pt-5">
                {(['Toutes', 'Primaire', 'Général', 'Technique'] as const).map((sec) => {
                  const isSelected = selectedSection === sec;
                  const count = sec === 'Toutes' 
                    ? allClassesList.length 
                    : allClassesList.filter(c => c.section === sec).length;

                  return (
                    <button
                      key={sec}
                      onClick={() => setSelectedSection(sec)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white hover:border-blue-300'
                      }`}
                    >
                      <span>{sec === 'Toutes' ? 'Toutes les classes' : `Section ${sec}`}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Classes Cards Grid */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BookOpen size={20} className="text-blue-600" />
                <span>Classes Disponibles ({filteredClasses.length})</span>
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {allStudents.length} élèves inscrits au total dans l'établissement
              </span>
            </div>

            {filteredClasses.length === 0 ? (
              <div className="py-0.52 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <BookOpen size={40} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-600">Aucune classe ne correspond à votre recherche</p>
                <p className="text-xs text-slate-400">Essayez de modifier votre filtre de recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredClasses.map((cls) => {
                  const studentCount = classStudentCounts[cls.name] || 0;
                  return (
                    <div
                      key={cls.id || cls.name}
                      onClick={() => handleSelectClass(cls)}
                      className="group bg-slate-50 hover:bg-blue-600 hover:text-white border border-slate-200 hover:border-blue-600 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-lg hover:shadow-blue-600/20 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-white text-slate-700 group-hover:bg-white/20 group-hover:text-white border border-slate-200 group-hover:border-white/20">
                            {cls.section || 'Général'}
                          </span>
                          <div className="p-2 rounded-xl bg-blue-100 text-blue-700 group-hover:bg-white/20 group-hover:text-white">
                            <GraduationCap size={18} />
                          </div>
                        </div>

                        <h3 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-white">
                          {cls.name}
                        </h3>
                        <p className="text-xs font-medium text-slate-500 group-hover:text-blue-100 mt-1">
                          Code: {cls.code || cls.name}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/80 group-hover:border-white/20 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 group-hover:text-white flex items-center gap-1.5">
                          <Users size={14} className="text-blue-600 group-hover:text-white" />
                          {studentCount} élève{studentCount > 1 ? 's' : ''}
                        </span>
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: STUDENTS LIST OF SELECTED CLASS */}
      {viewMode === 'students' && selectedClassItem && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToClasses}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ArrowLeft size={18} />
                  <span>Retour aux classes</span>
                </button>
                <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Livret Scolaire - Classe de</span>
                    <span className="px-3 py-0.5 bg-blue-100 text-blue-900 rounded-xl text-lg font-black border border-blue-200">
                      {selectedClassItem.name}
                    </span>
                  </h1>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    Section {selectedClassItem.section || 'Général'} • {classStudents.length} élève{classStudents.length > 1 ? 's' : ''} enregistré(s)
                  </p>
                </div>
              </div>

              {/* Student Search bar */}
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Rechercher élève par nom ou matricule..."
                  value={searchStudentTerm}
                  onChange={(e) => setSearchStudentTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
                <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            {/* Students Table or Empty State */}
            {classStudents.length === 0 ? (
              <div className="py-0.56 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 my-4 max-w-lg mx-auto">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users size={36} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">
                  Aucun élève enregistré dans cette classe.
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  {searchStudentTerm 
                    ? "Aucun élève ne correspond à votre recherche dans cette classe." 
                    : "Cette classe ne contient actuellement aucun élève inscrit dans la base de données."}
                </p>
                {searchStudentTerm && (
                  <button
                    onClick={() => setSearchStudentTerm('')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all cursor-pointer"
                  >
                    Effacer la recherche
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3.5 px-4">Élève & Nom et Prénom</th>
                      <th className="py-3.5 px-4">Matricule</th>
                      <th className="py-3.5 px-4">Date de Naissance</th>
                      <th className="py-3.5 px-4">Statut</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {classStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={st.photoUrl || `https://i.pravatar.cc/150?u=${st.id}`}
                              alt={st.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{st.name}</p>
                              <p className="text-xs text-slate-500">Classe : {st.class}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-900">
                          {st.studentId || st.id}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                          {st.birthDate || '19-juil.-07'} {st.birthPlace ? `à ${st.birthPlace}` : ''}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            st.assignedStatus === 'non_affecte'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {st.assignedStatus === 'non_affecte' ? 'Non Affecté' : 'Affecté(e)'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleSelectStudent(st)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
                          >
                            <FileText size={15} />
                            <span>Livret Scolaire</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: LIVRET SCOLAIRE DOCUMENT & EDITOR FOR SELECTED STUDENT */}
      {viewMode === 'livret' && selectedStudentForLivret && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Navigation Bar */}
          <div className="no-print bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                {!(currentUser?.role === 'student' || currentUser?.accessLevel === 1) && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBackToStudents}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <ArrowLeft size={18} />
                      <span>Retour aux élèves ({selectedClassItem?.name || studentClass})</span>
                    </button>
                    <button
                      onClick={handleBackToClasses}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <School size={16} />
                      <span>Toutes les classes</span>
                    </button>
                  </div>
                )}

                <div className="h-6 w-px bg-slate-200 hidden md:block" />

                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Livret Scolaire:</span>
                    <span className="text-blue-600">{studentName}</span>
                  </h1>
                  <p className="text-xs font-medium text-slate-500">
                    Classe: {studentClass} | Matricule: <strong className="font-mono text-slate-700">{studentMatricule}</strong>
                  </p>
                </div>
              </div>

              {/* Action buttons strictly on the same line */}
              <div className="flex items-center gap-3 shrink-0 flex-nowrap">
                {!(currentUser?.role === 'student' || currentUser?.role === 'parent' || currentUser?.role === 'teacher' || currentUser?.role === 'professeur' || currentUser?.accessLevel === 1 || currentUser?.accessLevel === 3) && (
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                    <button
                      onClick={() => setActiveView('preview')}
                      className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        activeView === 'preview' 
                          ? 'bg-white text-blue-700 shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <FileText size={16} />
                      <span>Aperçu Document</span>
                    </button>
                    <button
                      onClick={() => setActiveView('edit')}
                      className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                        activeView === 'edit' 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Edit3 size={16} />
                      <span>Modifier les Données</span>
                    </button>
                  </div>
                )}

                {canPrint && (
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-black rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Printer size={18} />
                    <span>Imprimer le Livret (A4)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* EDITING FORM PANEL (Shown when activeView === 'edit') */}
          {activeView === 'edit' && !(currentUser?.role === 'student' || currentUser?.role === 'parent' || currentUser?.role === 'teacher' || currentUser?.role === 'professeur' || currentUser?.accessLevel === 1 || currentUser?.accessLevel === 3) && (
            <div className="no-print bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Edit3 size={20} className="text-blue-600" />
                  Panneau d'Édition - {studentName}
                </h2>
                <button
                  onClick={() => setActiveView('preview')}
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
                >
                  Voir l'Aperçu
                </button>
              </div>

              {/* SECTION 1: Établissement & Élève */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <School size={16} /> Établissement & Année
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Nom de l'Établissement</label>
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Direction Régionale (DRE)</label>
                      <input
                        type="text"
                        value={dreName}
                        onChange={(e) => setDreName(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Année Scolaire</label>
                      <input
                        type="text"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-blue-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <User size={16} /> Informations Élève
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="col-span-2">
                      <label className="font-bold text-slate-600 block mb-1">Nom & Prénom</label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-blue-950"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Matricule</label>
                      <input
                        type="text"
                        value={studentMatricule}
                        onChange={(e) => setStudentMatricule(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono font-bold text-red-600"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Classe</label>
                      <input
                        type="text"
                        value={studentClass}
                        onChange={(e) => setStudentClass(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Date de Naissance</label>
                      <input
                        type="text"
                        value={studentBirthDate}
                        onChange={(e) => setStudentBirthDate(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Lieu de Naissance</label>
                      <input
                        type="text"
                        value={studentBirthPlace}
                        onChange={(e) => setStudentBirthPlace(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Affecté(e)</label>
                      <select
                        value={isAssigned}
                        onChange={(e) => setIsAssigned(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
                      >
                        <option value="Oui">Oui</option>
                        <option value="Non">Non</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-1">Redoublant(e)</label>
                      <select
                        value={isRedoublant}
                        onChange={(e) => setIsRedoublant(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
                      >
                        <option value="Non">Non</option>
                        <option value="Oui">Oui</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Table des Matières & Notes */}
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                  Notes par Matière, Coefficients & Professeurs
                </h3>
                <div className="overflow-x-auto border border-slate-300 rounded-xl">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300">Discipline</th>
                        <th className="p-2 border-r border-slate-300 w-16 text-center">Coef.</th>
                        <th className="p-2 border-r border-slate-300 w-24 text-center">Moy. T1</th>
                        <th className="p-2 border-r border-slate-300 w-24 text-center">Moy. T2</th>
                        <th className="p-2 border-r border-slate-300 w-24 text-center">Moy. T3</th>
                        <th className="p-2 border-r border-slate-300">Professeur</th>
                        <th className="p-2">Appréciation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeDisciplines.map(item => (
                        <tr key={item.id} className={`hover:bg-slate-50 ${item.inactive ? "opacity-40 grayscale bg-slate-100 pointer-events-none select-none" : ""}`}>
                          <td className="p-2 border-r border-slate-200 font-semibold">{item.name}</td>
                          <td className="p-2 border-r border-slate-200 text-center">
                            <input
                              type="number"
                              value={item.coef}
                              onChange={(e) => handleDisciplineChange(item.id, 'coef', parseInt(e.target.value) || 1)}
                              className="w-12 text-center p-1 bg-white border border-slate-300 rounded font-mono"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center">
                            <input
                              type="number"
                              step="0.01"
                              value={item.t1 !== null ? item.t1 : ''}
                              onChange={(e) => handleDisciplineChange(item.id, 't1', e.target.value === '' ? null : parseFloat(e.target.value))}
                              placeholder="-"
                              className="w-16 text-center p-1 bg-white border border-slate-300 rounded font-bold"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center">
                            <input
                              type="number"
                              step="0.01"
                              value={item.t2 !== null ? item.t2 : ''}
                              onChange={(e) => handleDisciplineChange(item.id, 't2', e.target.value === '' ? null : parseFloat(e.target.value))}
                              placeholder="-"
                              className="w-16 text-center p-1 bg-white border border-slate-300 rounded font-bold"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center">
                            <input
                              type="number"
                              step="0.01"
                              value={item.t3 !== null ? item.t3 : ''}
                              onChange={(e) => handleDisciplineChange(item.id, 't3', e.target.value === '' ? null : parseFloat(e.target.value))}
                              placeholder="-"
                              className="w-16 text-center p-1 bg-white border border-slate-300 rounded font-bold"
                            />
                          </td>
                          <td className="p-2 border-r border-slate-200">
                            <input
                              type="text"
                              value={item.teacher}
                              onChange={(e) => handleDisciplineChange(item.id, 'teacher', e.target.value)}
                              className="w-full p-1 bg-white border border-slate-300 rounded uppercase font-semibold text-[11px]"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.appreciation}
                              onChange={(e) => handleDisciplineChange(item.id, 'appreciation', e.target.value)}
                              className="w-full p-1 bg-white border border-slate-300 rounded text-[11px]"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 3: Rangs & Décision finale */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <h3 className="font-bold text-slate-800 uppercase mb-2">{isTech ? 'Rangs aux Semestres' : 'Rangs aux Trimestres'}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-500 block mb-0.5">{isTech ? 'Rang 1er Sem' : 'Rang 1er Trim'}</label>
                      <input type="text" value={rankT1} onChange={(e) => setRankT1(e.target.value)} className="w-full p-1.5 bg-white border rounded font-semibold" />
                    </div>
                    <div>
                      <label className="text-slate-500 block mb-0.5">{isTech ? 'Rang 2è Sem' : 'Rang 2è Trim'}</label>
                      <input type="text" value={rankT2} onChange={(e) => setRankT2(e.target.value)} className="w-full p-1.5 bg-white border rounded font-semibold" />
                    </div>
                    {!isTech && (
                      <div>
                        <label className="text-slate-500 block mb-0.5">Rang 3è Trim</label>
                        <input type="text" value={rankT3} onChange={(e) => setRankT3(e.target.value)} className="w-full p-1.5 bg-white border rounded font-semibold" />
                      </div>
                    )}
                    <div>
                      <label className="text-slate-500 block mb-0.5">Rang Annuel</label>
                      <input type="text" value={rankAnnual} onChange={(e) => setRankAnnual(e.target.value)} className="w-full p-1.5 bg-white border rounded font-bold text-blue-900" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-800 uppercase mb-2">Décision de Fin d'Année</h3>
                  <input
                    type="text"
                    value={computedDecision}
                    onChange={(e) => setCustomDecision(e.target.value)}
                    placeholder="Ex: Admis(e) en classe supérieure"
                    className="w-full p-3 bg-white border border-blue-300 rounded-xl font-black text-slate-900 text-sm shadow-sm"
                  />
                  <p className="text-[9px] text-slate-500 mt-1">
                    Laissez vide pour le calcul automatique basé sur la moyenne annuelle.
                  </p>
                </div>
              </div>

              {/* SECTION 4: SIGNATURES ET CACHET / TAMPON */}
              <div className="border-t border-slate-200 pt-4 mt-2">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Check size={16} className="text-emerald-600" />
                  Signatures & Cachet d'Établissement (Visas Officiels)
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* 1. Professeur Principal Signature */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-emerald-900 block text-[11px] uppercase">Professeur Principal</span>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nom du Professeur Principal</label>
                      <input
                        type="text"
                        value={mainTeacherName}
                        onChange={(e) => setMainTeacherName(e.target.value)}
                        placeholder="Ex: M. YALE ARLON"
                        className="w-full p-2 bg-white border rounded-lg font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Signature du Prof. Principal (Texte)</label>
                      <input
                        type="text"
                        value={teacherSignature}
                        onChange={(e) => setTeacherSignature(e.target.value)}
                        placeholder="Ex: Y. Arlon"
                        className="w-full p-2 bg-white border rounded-lg font-bold text-xs italic"
                      />
                      <p className="text-[9px] text-slate-500 mt-1 leading-tight font-medium">Laissez vide pour signer manuellement au stylo (bic) après l'impression.</p>
                    </div>
                  </div>

                  {/* 2. Directeur des Études Signature */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-emerald-900 block text-[11px] uppercase">Directeur des Études</span>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nom du Directeur des Études</label>
                      <input
                        type="text"
                        value={directorName}
                        onChange={(e) => setDirectorName(e.target.value)}
                        placeholder="Ex: M. TRAORÉ KASSIM"
                        className="w-full p-2 bg-white border rounded-lg font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Signature du Directeur (Texte)</label>
                      <input
                        type="text"
                        value={directorSignature}
                        onChange={(e) => setDirectorSignature(e.target.value)}
                        placeholder="Ex: T. Kassim"
                        className="w-full p-2 bg-white border rounded-lg font-bold text-xs italic"
                      />
                      <p className="text-[9px] text-slate-500 mt-1 leading-tight font-medium">Laissez vide pour signer manuellement au stylo (bic) après l'impression.</p>
                    </div>
                  </div>

                  {/* 3. Cachet / Tampon */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-emerald-900 block text-[11px] uppercase">Emplacement Cachet / Tampon</span>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Mode d'affichage du Cachet</label>
                      <select
                        value={stampMode}
                        onChange={(e) => setStampMode(e.target.value as 'blank' | 'digital')}
                        className="w-full p-2 bg-white border rounded-lg font-bold text-xs"
                      >
                        <option value="blank">Zone Vierge (Tampon physique à l'impression)</option>
                        <option value="digital">Tampon Numérique Officiel (Affiché)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DOCUMENT PRINTABLE VIEW (A4 Landscape Layout) */}
          <div className="flex justify-center">
            <div 
              id="printable-livret-document"
              className="bg-white border print:border-none border-slate-300 p-4 sm:p-5 print:p-0 shadow-xl print:shadow-none w-full max-w-[1060px] print:max-w-none text-slate-900 font-sans text-[10.5px] leading-tight flex flex-col justify-start gap-y-1.5 min-h-[640px] print:min-h-0 print:h-full print:overflow-hidden rounded-lg print:rounded-none"
            >
              {/* TOP OFFICIAL HEADER */}
              <div>
                <div className="flex justify-between items-start mb-1 border-b-[1.5px] border-slate-900 pb-1">
                  <div className="text-left font-bold text-[8.5px] uppercase space-y-0.5">
                    <p className="text-slate-900">MINISTERE DE L'EDUCATION NATIONALE, DE L'ALPHABÉTISATION ET DE L'ENSEIGNEMENT TECHNIQUE</p>
                    <p className="text-slate-600 text-[8.5px]">------------------</p>
                    <p className="text-slate-900">{dreName}</p>
                  </div>
                  <div className="text-right">
                    <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase inline-block border-b-2 border-slate-900 pb-0.5">
                      EXTRAIT DU LIVRET SCOLAIRE <span className="text-xs font-bold text-slate-700 font-mono">Année Scolaire {academicYear}</span>
                    </h1>
                    <p className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">NE PAS COLLER DANS LE LIVRET SCOLAIRE</p>
                  </div>
                </div>

                {/* SCHOOL & STUDENT IDENTIFICATION BANNER */}
                <div className="grid grid-cols-12 gap-2 mb-1 items-stretch">
                  {/* School Info Box */}
                  <div className="col-span-4 border border-slate-400 p-1.5 rounded bg-slate-50/50 flex flex-col justify-center">
                    <h2 className="font-black text-xs sm:text-sm text-slate-900 tracking-tight uppercase">{schoolName}</h2>
                    <p className="text-[8.5px] font-semibold text-slate-600 mt-0.5">{schoolPhone}</p>
                  </div>

                  {/* Student Info Main Box */}
                  <div className="col-span-6 border-[1.5px] border-blue-900 p-1.5 rounded bg-white relative">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-base font-black text-blue-950 uppercase tracking-tight leading-tight">{studentName}</h3>
                        <p className="text-[10px] font-semibold text-slate-700 mt-0.5">
                          Né(e) le <span className="font-bold text-blue-900">{studentBirthDate}</span> à <span className="font-bold text-blue-900">{studentBirthPlace}</span>
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-[8.5px] font-bold text-slate-700 flex-wrap">
                          <span>Redoublant: <strong className="text-blue-900">{isRedoublant}</strong></span>
                          <span>Boursier: <strong className="text-blue-900">{isBoursier}</strong></span>
                          <span>Affecté(e): <strong className="text-blue-900">{isAssigned}</strong></span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8.5px] font-bold text-slate-500 block">Classe</span>
                        <span className="text-sm font-black text-blue-900">{studentClass}</span>
                      </div>
                    </div>
                    <div className="mt-0.5 pt-0.5 border-t border-slate-200 flex justify-between items-center text-[8.5px] font-bold">
                      <span>Matr.: <strong className="text-red-600 text-xs font-mono">{studentMatricule}</strong></span>
                    </div>
                  </div>

                  {/* Student Photo Box */}
                  <div className="col-span-2 border border-slate-400 p-1 rounded bg-white flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-14 bg-slate-200 rounded overflow-hidden mb-0.5 border border-slate-300">
                      <img src={photoUrl || 'https://i.pravatar.cc/150'} alt={studentName} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[7px] font-bold text-blue-800 uppercase">DBPix Evaluation</span>
                  </div>
                </div>

                {/* GRADES AND COEFFICIENTS TABLE */}
                <div className="overflow-x-auto mb-1.5">
                  <table className="w-full border-collapse border border-slate-900 text-[9px] text-center">
                    <thead>
                      <tr className="bg-emerald-50 text-slate-900 font-bold border-b border-slate-900">
                        <th className="border border-slate-900 px-2 py-0.5 text-left w-48 text-[11px]">DISCIPLINES</th>
                        <th colSpan={4} className="border border-slate-900 px-1 py-0.5 bg-emerald-100/60">{isTech ? '1er SEM.' : '1er TRIM.'}</th>
                        <th colSpan={4} className="border border-slate-900 px-1 py-0.5 bg-emerald-100/60">{isTech ? '2ème SEM.' : '2ème TRIM.'}</th>
                        <th colSpan={4} className="border border-slate-900 px-1 py-0.5 bg-emerald-100/60">{isTech ? 'N / A' : '3ème TRIM.'}</th>
                        <th colSpan={2} className="border-2 border-blue-900 px-1 py-0.5 bg-sky-100/80">Annuel</th>
                        <th className="border border-slate-900 px-2 py-0.5 text-left w-36">PROFESSEUR</th>
                        <th className="border border-slate-900 px-2 py-0.5 text-left w-32">APPRECIATION & VISA</th>
                      </tr>
                      <tr className="bg-slate-100 text-[9px] font-bold border-b border-slate-900">
                        <th className="border border-slate-900 px-2 py-0.5 text-left"></th>
                        <th className="border border-slate-900 px-1 py-0.5">MOY./20</th>
                        <th className="border border-slate-900 px-1 py-0.5">COEF.</th>
                        <th className="border border-slate-900 px-1 py-0.5">MOY COEF</th>
                        <th className="border border-slate-900 px-1 py-0.5">RANG</th>
                        <th className="border border-slate-900 px-1 py-0.5">MOY./20</th>
                        <th className="border border-slate-900 px-1 py-0.5">COEF.</th>
                        <th className="border border-slate-900 px-1 py-0.5">MOY COEF</th>
                        <th className="border border-slate-900 px-1 py-0.5">RANG</th>
                        <th className="border border-slate-900 px-1 py-0.5">MOY./20</th>
                        <th className="border border-slate-900 px-1 py-0.5">COEF.</th>
                        <th className="border border-slate-900 px-1 py-0.5">M. COEF</th>
                        <th className="border border-slate-900 px-1 py-0.5">RANG</th>
                        <th className="border-x-2 border-blue-900 border-b border-slate-900 px-1 py-0.5 bg-sky-50">Moy Ann.</th>
                        <th className="border-r-2 border-blue-900 border-b border-slate-900 px-1 py-0.5 bg-sky-50">RANG</th>
                        <th className="border border-slate-900 px-1 py-0.5 text-left"></th>
                        <th className="border border-slate-900 px-1 py-0.5 text-left"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {/* LETTRES Category */}
                      {activeDisciplines.filter(d => d.category === 'LETTRES').map((item) => {
                        const coef = item.coef || 1;
                        const moy1 = item.t1;
                        const moy2 = item.t2;
                        const moy3 = item.t3;

                        const moyCoef1 = moy1 !== null ? (moy1 * coef) : null;
                        const moyCoef2 = moy2 !== null ? (moy2 * coef) : null;
                        const moyCoef3 = moy3 !== null ? (moy3 * coef) : null;

                        const moyAnn = calculateAnnualAverage(moy1, moy2, moy3, isTech);

                        const studsInClass = allStudents ? allStudents.filter(s => s.class === (selectedStudentForLivret?.class || studentClass) || (s.class && typeof (selectedStudentForLivret?.class || studentClass) === "string" && (selectedStudentForLivret?.class || studentClass).includes(s.class))) : [];
                        const studId = selectedStudentForLivret?.id || '';
                        const rank1 = moy1 !== null ? getSubjectRankInClass(studsInClass, studId, '1er trim', item.name) : '';
                        const rank2 = moy2 !== null ? getSubjectRankInClass(studsInClass, studId, '2ème trim', item.name) : '';
                        const rank3 = moy3 !== null ? getSubjectRankInClass(studsInClass, studId, '3ème trim', item.name) : '';
                        const rankAnn = moyAnn !== null ? getSubjectRankInClass(studsInClass, studId, 'annuel', item.name) : '';

                        return (
                          <tr key={item.id} className={`hover:bg-slate-50 text-[9px] ${item.inactive ? "opacity-40 grayscale pointer-events-none" : ""}`}>
                            <td className="border border-slate-900 px-2 py-0.5 text-left font-semibold text-slate-900">{item.name}</td>
                            <td className="border border-slate-900 px-1 py-0.5 font-bold">{fmt(moy1)}</td>
                            <td className="border border-slate-900 px-1 py-0.5 text-slate-600 font-mono">{moy1 !== null ? coef : ''}</td>
                            <td className="border border-slate-900 px-1 py-0.5 font-bold text-slate-800">{fmt(moyCoef1)}</td>
                            <td className="border border-slate-900 px-1 py-0.5 text-[9px] italic text-slate-500">{rank1}</td>

                            <td className="border border-slate-900 px-1 py-0.5 font-bold">{fmt(moy2)}</td>
                            <td className="border border-slate-900 px-1 py-0.5 text-slate-600 font-mono">{moy2 !== null ? coef : ''}</td>
                            <td className="border border-slate-900 px-1 py-0.5 font-bold text-slate-800">{fmt(moyCoef2)}</td>
                            <td className="border border-slate-900 px-1 py-0.5 text-[9px] italic text-slate-500">{rank2}</td>

                            <td className="border border-slate-900 px-1 py-0.5 font-bold">{fmt(moy3)}</td>
                            <td className="border border-slate-900 px-1 py-0.5 text-slate-600 font-mono">{moy3 !== null ? coef : ''}</td>
                            <td className="border border-slate-900 px-1 py-0.5 font-bold text-slate-800">{fmt(moyCoef3)}</td>
                            <td className="border border-slate-900 px-1 py-0.5 text-[9px] italic text-slate-500">{rank3}</td>

                            <td className="border-x-2 border-blue-900 px-1 py-0.5 font-black text-blue-900 bg-sky-50">{fmt(moyAnn)}</td>
                            <td className="border-r-2 border-blue-900 px-1 py-0.5 text-[9px] italic text-blue-800 font-bold bg-sky-50">{rankAnn}</td>

                            <td className="border border-slate-900 px-2 py-0.5 text-left font-bold text-[9.5px] uppercase text-slate-800">{item.teacher}</td>
                            <td className="border border-slate-900 px-2 py-0.5 text-left italic font-serif text-slate-800">{item.appreciation}</td>
                          </tr>
                        );
                      })}

                      {/* BILAN LETTRES ROW */}
                      <tr className="bg-rose-50/80 font-black text-rose-900 border-y border-slate-900 text-[9px]">
                        <td className="border border-slate-900 px-2 py-0.5 text-left">BILAN LETTRES</td>
                        <td className="border border-slate-900 px-1 py-0.5">{fmt(lettresBilan.t1)}</td>
                        <td colSpan={3} className="border border-slate-900"></td>
                        <td className="border border-slate-900 px-1 py-0.5">{fmt(lettresBilan.t2)}</td>
                        <td colSpan={3} className="border border-slate-900"></td>
                        <td className="border border-slate-900 px-1 py-0.5">{fmt(lettresBilan.t3)}</td>
                        <td colSpan={3} className="border border-slate-900"></td>
                        <td className="border-x-2 border-blue-900 px-1 py-0.5 bg-rose-100/60">
                          {fmt(calculateAnnualAverage(lettresBilan.t1, lettresBilan.t2, lettresBilan.t3, isTech))}
                        </td>
                        <td className="border-r-2 border-blue-900"></td>
                        <td colSpan={2} className="border border-slate-900"></td>
                      </tr>

                      {/* SCIENCES Category */}
                      {activeDisciplines.filter(d => d.category === 'SCIENCES').map((item) => {
                        const coef = item.coef || 1;
                        const moy1 = item.t1;
                        const moy2 = item.t2;
                        const moy3 = item.t3;

                        const moyCoef1 = moy1 !== null ? (moy1 * coef) : null;
                        const moyCoef2 = moy2 !== null ? (moy2 * coef) : null;
                        const moyCoef3 = moy3 !== null ? (moy3 * coef) : null;

                        const moyAnn = calculateAnnualAverage(moy1, moy2, moy3, isTech);

                        const studsInClass = allStudents ? allStudents.filter(s => s.class === (selectedStudentForLivret?.class || studentClass) || (s.class && typeof (selectedStudentForLivret?.class || studentClass) === "string" && (selectedStudentForLivret?.class || studentClass).includes(s.class))) : [];
                        const studId = selectedStudentForLivret?.id || '';
                        const rank1 = moy1 !== null ? getSubjectRankInClass(studsInClass, studId, '1er trim', item.name) : '';
                        const rank2 = moy2 !== null ? getSubjectRankInClass(studsInClass, studId, '2ème trim', item.name) : '';
                        const rank3 = moy3 !== null ? getSubjectRankInClass(studsInClass, studId, '3ème trim', item.name) : '';
                        const rankAnn = moyAnn !== null ? getSubjectRankInClass(studsInClass, studId, 'annuel', item.name) : '';

                        return (
                          <tr key={item.id} className={`hover:bg-slate-50 text-[9px] ${item.inactive ? "opacity-40 grayscale pointer-events-none" : ""}`}>
                            <td className="border border-slate-900 px-2 py-0.5 text-left font-semibold text-slate-900">{item.name}</td>
                            <td className="border border-slate-900 px-1 py-0.5 font-bold">{fmt(moy1)}</td>
                            <td className="border border-slate-900 px-1 py-0.5 text-slate-600 font-mono">{moy1 !== null ? coef : ''}</td>
                            <td className="border border-slate-900 px-1 py-0.5 font-bold text-slate-800">{fmt(moyCoef1)}</td>
                            <td className="border border-slate-900 px-1 py-0.5 text-[9px] italic text-slate-500">{rank1}</td>

                            <td className="border border-slate-900 px-1 py-0.5 font-bold">{fmt(moy2)}</td>
                            <td className="border border-slate-900 px-1 py-0.5 text-slate-600 font-mono">{moy2 !== null ? coef : ''}</td>
                            <td className="border border-slate-900 px-1 py-0.5 font-bold text-slate-800">{fmt(moyCoef2)}</td>
                            <td className="border border-slate-900 px-1 py-0.5 text-[9px] italic text-slate-500">{rank2}</td>

                            <td className="border border-slate-900 px-1 py-0.5 font-bold">{fmt(moy3)}</td>
                            <td className="border border-slate-900 px-1 py-0.5 text-slate-600 font-mono">{moy3 !== null ? coef : ''}</td>
                            <td className="border border-slate-900 px-1 py-0.5 font-bold text-slate-800">{fmt(moyCoef3)}</td>
                            <td className="border border-slate-900 px-1 py-0.5 text-[9px] italic text-slate-500">{rank3}</td>

                            <td className="border-x-2 border-blue-900 px-1 py-0.5 font-black text-blue-900 bg-sky-50">{fmt(moyAnn)}</td>
                            <td className="border-r-2 border-blue-900 px-1 py-0.5 text-[9px] italic text-blue-800 font-bold bg-sky-50">{rankAnn}</td>

                            <td className="border border-slate-900 px-2 py-0.5 text-left font-bold text-[9.5px] uppercase text-slate-800">{item.teacher}</td>
                            <td className="border border-slate-900 px-2 py-0.5 text-left italic font-serif text-slate-800">{item.appreciation}</td>
                          </tr>
                        );
                      })}

                      {/* BILAN SCIENCES ROW */}
                      <tr className="bg-rose-50/80 font-black text-rose-900 border-y border-slate-900 text-[9px]">
                        <td className="border border-slate-900 px-2 py-0.5 text-left">BILAN SCIENCES</td>
                        <td className="border border-slate-900 px-1 py-0.5">{fmt(sciencesBilan.t1)}</td>
                        <td colSpan={3} className="border border-slate-900"></td>
                        <td className="border border-slate-900 px-1 py-0.5">{fmt(sciencesBilan.t2)}</td>
                        <td colSpan={3} className="border border-slate-900"></td>
                        <td className="border border-slate-900 px-1 py-0.5">{fmt(sciencesBilan.t3)}</td>
                        <td colSpan={3} className="border border-slate-900"></td>
                        <td className="border-x-2 border-blue-900 px-1 py-0.5 bg-rose-100/60">
                          {fmt(calculateAnnualAverage(sciencesBilan.t1, sciencesBilan.t2, sciencesBilan.t3, isTech))}
                        </td>
                        <td className="border-r-2 border-blue-900"></td>
                        <td colSpan={2} className="border border-slate-900"></td>
                      </tr>

                      {/* AUTRES Category */}
                      {activeDisciplines.filter(d => d.category === 'AUTRES').map((item) => {
                        const coef = item.coef || 1;
                        const moy1 = item.t1;
                        const moy2 = item.t2;
                        const moy3 = item.t3;

                        const moyCoef1 = moy1 !== null ? (moy1 * coef) : null;
                        const moyCoef2 = moy2 !== null ? (moy2 * coef) : null;
                        const moyCoef3 = moy3 !== null ? (moy3 * coef) : null;

                        const moyAnn = calculateAnnualAverage(moy1, moy2, moy3, isTech);

                        const studsInClass = allStudents ? allStudents.filter(s => s.class === (selectedStudentForLivret?.class || studentClass) || (s.class && typeof (selectedStudentForLivret?.class || studentClass) === "string" && (selectedStudentForLivret?.class || studentClass).includes(s.class))) : [];
                        const studId = selectedStudentForLivret?.id || '';
                        const rank1 = moy1 !== null ? getSubjectRankInClass(studsInClass, studId, '1er trim', item.name) : '';
                        const rank2 = moy2 !== null ? getSubjectRankInClass(studsInClass, studId, '2ème trim', item.name) : '';
                        const rank3 = moy3 !== null ? getSubjectRankInClass(studsInClass, studId, '3ème trim', item.name) : '';
                        const rankAnn = moyAnn !== null ? getSubjectRankInClass(studsInClass, studId, 'annuel', item.name) : '';

                        return (
                          <tr key={item.id} className={`hover:bg-slate-50 text-[9px] ${item.inactive ? "opacity-40 grayscale pointer-events-none" : ""}`}>
                            <td className="border border-slate-900 px-2 py-0.5 text-left font-semibold text-slate-900">{item.name}</td>
                            <td className="border border-slate-900 px-1 py-0.5 font-bold">{fmt(moy1)}</td>
                            <td className="border border-slate-900 px-1 py-0.5 text-slate-600 font-mono">{moy1 !== null ? coef : ''}</td>
                            <td className="border border-slate-900 px-1 py-0.5 font-bold text-slate-800">{fmt(moyCoef1)}</td>
                            <td className="border border-slate-900 px-1 py-0.5 text-[9px] italic text-slate-500">{rank1}</td>

                            <td className="border border-slate-900 px-1 py-0.5 font-bold">{fmt(moy2)}</td>
                            <td className="border border-slate-900 px-1 py-0.5 text-slate-600 font-mono">{moy2 !== null ? coef : ''}</td>
                            <td className="border border-slate-900 px-1 py-0.5 font-bold text-slate-800">{fmt(moyCoef2)}</td>
                            <td className="border border-slate-900 px-1 py-0.5 text-[9px] italic text-slate-500">{rank2}</td>

                            <td className="border border-slate-900 px-1 py-0.5 font-bold">{fmt(moy3)}</td>
                            <td className="border border-slate-900 px-1 py-0.5 text-slate-600 font-mono">{moy3 !== null ? coef : ''}</td>
                            <td className="border border-slate-900 px-1 py-0.5 font-bold text-slate-800">{fmt(moyCoef3)}</td>
                            <td className="border border-slate-900 px-1 py-0.5 text-[9px] italic text-slate-500">{rank3}</td>

                            <td className="border-x-2 border-blue-900 px-1 py-0.5 font-black text-blue-900 bg-sky-50">{fmt(moyAnn)}</td>
                            <td className="border-r-2 border-blue-900 px-1 py-0.5 text-[9px] italic text-blue-800 font-bold bg-sky-50">{rankAnn}</td>

                            <td className="border border-slate-900 px-2 py-0.5 text-left font-bold text-[9.5px] uppercase text-slate-800">{item.teacher}</td>
                            <td className="border border-slate-900 px-2 py-0.5 text-left italic font-serif text-slate-800">{item.appreciation}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* BOTTOM RECAPITULATIF & DECISION */}
                <div className="grid grid-cols-12 gap-3 items-stretch">
                  {/* Recap Box */}
                  <div className="col-span-5 border border-slate-900 rounded overflow-hidden">
                    <div className="bg-sky-100 border-b border-slate-900 px-3 py-0.5 text-center font-black text-slate-900 uppercase text-[9px]">
                      RECAPITULATIF DES RESULTATS
                    </div>
                    <div className="p-1 space-y-0.5 text-[9px] font-bold">
                      <div className="flex justify-between items-center bg-yellow-50/50 px-1 py-0.5 rounded border border-yellow-200">
                        <span>{isTech ? '1er Semestre' : '1er Trimestre'}</span>
                        <span className="text-base font-black text-slate-900 font-mono">{fmt(trim1Avg)}</span>
                        <span className="text-[9px] text-slate-600 font-normal">Rang: <strong className="font-bold text-slate-900">{rankT1}</strong></span>
                      </div>
                      <div className="flex justify-between items-center bg-yellow-50/50 px-1 py-0.5 rounded border border-yellow-200">
                        <span>{isTech ? '2è Semestre' : '2è Trimestre'}</span>
                        <span className="text-base font-black text-slate-900 font-mono">{fmt(trim2Avg)}</span>
                        <span className="text-[9px] text-slate-600 font-normal">Rang: <strong className="font-bold text-slate-900">{rankT2}</strong></span>
                      </div>
                      {!isTech && (
                        <div className="flex justify-between items-center bg-yellow-50/50 px-1 py-0.5 rounded border border-yellow-200">
                          <span>3è Trimestre</span>
                          <span className="text-base font-black text-slate-900 font-mono">{fmt(trim3Avg)}</span>
                          <span className="text-[9px] text-slate-600 font-normal">Rang: <strong className="font-bold text-slate-900">{rankT3}</strong></span>
                        </div>
                      )}
                      <div className={`flex justify-between items-center px-1.5 py-0.5 rounded border-2 transition-colors ${
                        annualAvg !== null && annualAvg >= 10
                          ? 'bg-emerald-100/90 border-emerald-600 text-emerald-950'
                          : 'bg-rose-100 border-red-600 text-red-950'
                      }`}>
                        <span className="uppercase font-black text-[9px]">Moy. Annuelle</span>
                        <span className={`text-base font-black font-mono ${annualAvg !== null && annualAvg >= 10 ? 'text-emerald-700' : 'text-red-600'}`}>{fmt(annualAvg)}</span>
                        <span className="text-[9px] font-bold">Rang: <strong>{rankAnnual}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Decision Box */}
                  <div className="col-span-7 border border-slate-900 rounded overflow-hidden flex flex-col justify-between">
                    <div className="bg-sky-100 border-b border-slate-900 px-3 py-0.5 text-center font-black text-slate-900 uppercase text-[9px]">
                      DECISION DE FIN D'ANNEE
                    </div>
                    <div className="flex-1 p-2 flex items-center justify-center bg-slate-50">
                      <span className="text-lg font-black italic font-serif text-slate-900 tracking-wide text-center">
                        {computedDecision}
                      </span>
                    </div>
                    <div className="p-1 border-t border-slate-300 text-[8px] text-slate-500 font-mono text-left">
                      &lt;{studentName}&gt; - &lt;{studentMatricule}&gt; - {studentClass} - Année Scolaire {academicYear}
                    </div>
                  </div>
                </div>
              </div>

              <DirectorSignatureStamp 
                teacherName={mainTeacherName} 
                teacherSignature={teacherSignature}
                directorName={directorName} 
                directorSignature={directorSignature}
                stampMode={stampMode}
                className="mt-1 print:mt-0"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
