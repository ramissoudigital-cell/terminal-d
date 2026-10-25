import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Calendar, ArrowLeft, Users, BookOpen, FileText, X, 
  TrendingUp, TrendingDown, Minus, Award, AlertTriangle, CheckCircle2, 
  ChevronRight, BarChart2, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Filter, Layers, ArrowUpRight, ArrowDownRight, User, School, Sparkles, RefreshCw,
  GraduationCap, Printer, ArrowUpDown, Check
} from 'lucide-react';
import { 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Legend 
} from 'recharts';
import { Student, ClassItem, getSubjectsForClass, GradeItem, AnalyticsData } from '../types';
import { mockClasses } from '../data/mockData';
import { getSubjectCoef, isSubjectMatch } from './TransactionList';

interface StudentsPageProps {
  students?: Student[];
  onUpdateAttendance?: (updates: { id: string; hours: number; type: 'absent' | 'late' }[], context: { subject: string; time: string; teacherName: string }) => void;
  readOnly?: boolean;
  onNavigate?: (page: string) => void;
  currentUser?: any;
  selectedTrimester?: string;
  onTrimesterChange?: (trimester: string) => void;
  onSelectStudent?: (student: Student) => void;
}

// --- LES 9 MATIÈRES OFFICIELLES DE LA PAGE STATISTIQUE ---
export const STATS_OFFICIAL_SUBJECTS: string[] = [
  'Informatique',
  'Physique-Chimie',
  'SVT',
  'Philosophie',
  'Mathématiques',
  'Français',
  'Anglais',
  'Hist-Géo',
  'EPS'
];

// Helper de correspondance tolérant pour reconnaître les matières (y compris variantes et fautes de frappe)
export const isSameSubject = (nameA?: string, nameB?: string): boolean => {
  return isSubjectMatch(nameA, nameB);
};

// Couleurs harmonieuses pour les matières
const SUBJECT_HEX_COLORS: Record<string, string> = {
  'Conduite': '#059669',
  'Informatique': '#0284c7',
  'Physique-Chimie': '#f59e0b',
  'Physique.Chimie': '#f59e0b',
  'SVT': '#10b981',
  'svt': '#10b981',
  'Sciences de la Vie et de la Terre': '#10b981',
  'Philosophie': '#8b5cf6',
  'Philosaphie': '#8b5cf6',
  'Mathématiques': '#3b82f6',
  'Français': '#a855f7',
  'Françals': '#a855f7',
  'Anglais': '#f43f5e',
  'Hist-Géo': '#06b6d4',
  'Hist-Gio': '#06b6d4',
  'Histoire-Geo': '#06b6d4',
  'Histoire-Géographie': '#06b6d4',
  'EPS': '#ec4899',
  'Éducation Physique et Sportive': '#ec4899',
  'Histoire': '#06b6d4',
  'Géographie': '#06b6d4',
  'Espagnol': '#e11d48',
  'Allemand': '#475569',
  'Arts Plastiques': '#d946ef',
  'Musique': '#6366f1',
  'Éducation Musicale': '#6366f1',
  'EDHC': '#f97316',
  'Sciences et Technologies': '#10b981',
  'Sciences et Technologies (notions de base)': '#10b981'
};

const CATEGORY_COLORS = {
  under: '#f43f5e', // Rose / Rouge (< 10)
  equal: '#f59e0b', // Ambre / Jaune (= 10)
  above: '#10b981', // Émeraude / Vert (> 10)
  unevaluated: '#94a3b8' // Gris ardoise (Sans note)
};

// Normalise une note sur une échelle de 20
const normalizeTo20 = (score: number, maxScore?: number): number => {
  if (typeof score !== 'number' || isNaN(score)) return 0;
  const max = (maxScore && maxScore > 0) ? maxScore : 20;
  return parseFloat(((score / max) * 20).toFixed(2));
};

export const StudentsPage: React.FC<StudentsPageProps> = ({ 
  students = [], 
  readOnly = false, 
  onNavigate, 
  currentUser,
  selectedTrimester: externalTrimester,
  onTrimesterChange,
  onSelectStudent
}) => {
  // Trimester local/synced state
  const [internalTrimester, setInternalTrimester] = useState<string>(() => {
    try {
      return localStorage.getItem('school_db_selected_trimester') || '1er trim';
    } catch {
      return '1er trim';
    }
  });

  const activeTrimester = externalTrimester || internalTrimester;
  const handleTrimesterSelect = (trim: string) => {
    setInternalTrimester(trim);
    if (onTrimesterChange) onTrimesterChange(trim);
    try {
      localStorage.setItem('school_db_selected_trimester', trim);
    } catch (e) {
      console.error(e);
    }
  };

  // Section Tab (Primaire / Général / Technique)
  const [selectedSection, setSelectedSection] = useState<'Primaire' | 'Général' | 'Technique'>(
    currentUser?.section === 'Primaire' ? 'Primaire' : 'Général'
  );

  // Search
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  // Moyenne de référence (par défaut 10/20)
  const [referenceThreshold, setReferenceThreshold] = useState<number>(10);

  // Filtre de catégorie d'élèves active ('all' | 'under' | 'equal' | 'above' | 'unevaluated')
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'under' | 'equal' | 'above' | 'unevaluated'>('all');

  // Modal élève individuel
  const [inspectedStudent, setInspectedStudent] = useState<Student | null>(null);

  // Format date du jour
  const [currentDate] = useState(() => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const formatted = date.toLocaleDateString('fr-FR', options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  });

  // --- DÉTERMINATION DE LA CLASSE AUTORISÉE ---
  const isTeacher = currentUser?.role === 'teacher' || currentUser?.accessLevel === 3;
  const isStudent = currentUser?.role === 'student';
  const isParent = currentUser?.role === 'parent';

  // Classes assignées au professeur
  const teacherAssignedClasses: string[] = useMemo(() => {
    if (!isTeacher) return [];
    if (Array.isArray(currentUser?.assignedClasses) && currentUser.assignedClasses.length > 0) {
      return currentUser.assignedClasses;
    }
    if (currentUser?.assignedClass) {
      return [currentUser.assignedClass];
    }
    return [];
  }, [currentUser, isTeacher]);

  // Seule la classe de Terminale D est disponible
  const terminaleDClass: ClassItem = useMemo(() => ({
    id: 17,
    name: 'Terminale D',
    code: 'Tle D',
    students: 28,
    time: '07:30 - 18:00',
    color: 'bg-rose-100 text-rose-600',
    section: 'Général'
  }), []);

  const authorizedClasses = useMemo(() => [terminaleDClass], [terminaleDClass]);

  // Classe sélectionnée : Terminale D exclusivement
  const [selectedClass, setSelectedClass] = useState<ClassItem>(terminaleDClass);

  React.useEffect(() => {
    setSelectedClass(terminaleDClass);
  }, [terminaleDClass]);

  // --- ÉLÈVES DE LA CLASSE DE TERMINALE D (ISOLATION STRICTE) ---
  const classStudents = useMemo(() => {
    return students.filter(s => {
      if (!s.class) return false;
      const c = s.class.toLowerCase();
      return c.includes('terminale d') || c.includes('tle d') || c.includes('terminaled') || c === 'tle d1' || c === 'tle d2';
    });
  }, [students]);

  // --- MATIÈRES DISPONIBLES POUR LA PAGE STATISTIQUE (EXACTEMENT LES 9 MATIÈRES REQUISES) ---
  const classSubjects = useMemo(() => {
    return [...STATS_OFFICIAL_SUBJECTS];
  }, []);

  // Matière sélectionnée ('ALL' pour vue d'ensemble ou nom d'une matière)
  const [selectedSubjectName, setSelectedSubjectName] = useState<string>('ALL');

  // Si l'utilisateur connecté est un professeur avec une matière dédiée, on présélectionne sa matière
  React.useEffect(() => {
    if (isTeacher && currentUser?.subject) {
      const matched = classSubjects.find(sub => isSameSubject(sub, currentUser.subject));
      if (matched) {
        setSelectedSubjectName(matched);
      }
    }
  }, [isTeacher, currentUser?.subject, classSubjects]);

  // --- RECHERCHE ET TRI POUR LA LISTE DE CLASSE ---
  const [classListSearch, setClassListSearch] = useState('');
  const [classListSortBy, setClassListSortBy] = useState<'rank' | 'name' | 'average_asc'>('rank');

  // Helper pour extraire la vraie note d'un élève dans une matière donnée sur 20 en temps réel
  const getStudentSubjectScore = (student: Student, subjectName: string): { score: number | null; display: string } => {
    const trimSubjects = student.trimesters?.[activeTrimester]?.subjects || student.subjects || [];
    const sub = trimSubjects.find(s => isSameSubject(s.name, subjectName));
    if (!sub) return { score: null, display: '—' };

    // STRICT: Seules les vraies notes saisies dans sub.grades sont prises en compte
    const validGrades = (sub.grades || []).filter(g => 
      g && 
      g.type !== 'plus' && 
      g.type !== 'minus' && 
      !g.isBonus && 
      typeof g.score === 'number' && 
      !isNaN(g.score)
    );

    if (validGrades.length > 0) {
      const avg = validGrades.reduce((acc, g) => acc + normalizeTo20(g.score, g.maxScore), 0) / validGrades.length;
      return { score: parseFloat(avg.toFixed(2)), display: avg.toFixed(1) };
    }

    // Aucune note fictive : afficher un tiret
    return { score: null, display: '—' };
  };

  // Helper pour extraire la moyenne générale en temps réel avec coefficients officiels
  const getStudentGeneralAverage = (student: Student): number | null => {
    let totalWeightedScore = 0;
    let totalCoeffs = 0;
    let evaluatedSubjectsCount = 0;

    STATS_OFFICIAL_SUBJECTS.forEach(subj => {
      const res = getStudentSubjectScore(student, subj);
      if (res.score !== null) {
        evaluatedSubjectsCount++;
        const coef = getSubjectCoef(student.class || 'Terminale D', subj);
        const effectiveCoef = coef > 0 ? coef : 1;
        totalWeightedScore += res.score * effectiveCoef;
        totalCoeffs += effectiveCoef;
      }
    });

    if (evaluatedSubjectsCount > 0 && totalCoeffs > 0) {
      return parseFloat((totalWeightedScore / totalCoeffs).toFixed(2));
    }

    return null;
  };

  // Interface pour un élève dans la liste de classe
  interface EnrichedTerminaleStudent {
    student: Student;
    generalAverage: number | null;
    hasRealAverage: boolean;
    evaluatedSubjectsCount: number;
    subjectScores: Record<string, { score: number | null; display: string }>;
    isAdmis: boolean;
    rank: number;
    rankDisplay: string;
  }

  // Liste enrichie des élèves de Terminale D triée par moyenne réelle pour établir le classement
  const enrichedTerminaleStudents = useMemo<EnrichedTerminaleStudent[]>(() => {
    const evaluated: any[] = [];
    const unEvaluated: any[] = [];

    classStudents.forEach(student => {
      const generalAverage = getStudentGeneralAverage(student);
      const subjectScores: Record<string, { score: number | null; display: string }> = {};
      let evaluatedSubjectsCount = 0;

      STATS_OFFICIAL_SUBJECTS.forEach(subj => {
        const sc = getStudentSubjectScore(student, subj);
        subjectScores[subj] = sc;
        if (sc.score !== null) evaluatedSubjectsCount++;
      });

      const hasRealAverage = generalAverage !== null && generalAverage > 0 && evaluatedSubjectsCount > 0;

      const item = {
        student,
        generalAverage,
        hasRealAverage,
        evaluatedSubjectsCount,
        subjectScores,
        isAdmis: hasRealAverage && generalAverage !== null ? generalAverage >= referenceThreshold : false
      };

      if (hasRealAverage) {
        evaluated.push(item);
      } else {
        unEvaluated.push(item);
      }
    });

    // Tri des élèves évalués par moyenne générale décroissante
    evaluated.sort((a, b) => (b.generalAverage ?? 0) - (a.generalAverage ?? 0));

    // Attribution des rangs réels uniquement aux élèves ayant de vraies notes
    const rankedEvaluated = evaluated.map((item, index) => {
      let rankDisplay = `${index + 1}e`;
      if (index === 0) rankDisplay = '1er';

      // Gestion des ex-aequo
      if (index > 0 && item.generalAverage === evaluated[index - 1].generalAverage) {
        const prevDisplay = evaluated[index - 1].rankDisplay;
        rankDisplay = prevDisplay.endsWith('ex') ? prevDisplay : `${prevDisplay} ex`;
      }

      return {
        ...item,
        rank: index + 1,
        rankDisplay
      };
    });

    // Élèves non encore évalués : aucun rang fictif
    const rankedUnEvaluated = unEvaluated.map(item => ({
      ...item,
      rank: 9999,
      rankDisplay: '—'
    }));

    return [...rankedEvaluated, ...rankedUnEvaluated];
  }, [classStudents, activeTrimester, referenceThreshold]);

  // Statistiques de la classe de Terminale D basées uniquement sur les données réelles
  const classOverallAvg = useMemo(() => {
    const evaluated = enrichedTerminaleStudents.filter(st => st.hasRealAverage && st.generalAverage !== null);
    if (evaluated.length === 0) return '—';
    const sum = evaluated.reduce((acc, st) => acc + (st.generalAverage || 0), 0);
    return (sum / evaluated.length).toFixed(2);
  }, [enrichedTerminaleStudents]);

  const classPassRate = useMemo(() => {
    const evaluated = enrichedTerminaleStudents.filter(st => st.hasRealAverage && st.generalAverage !== null);
    if (evaluated.length === 0) return '—';
    const passCount = evaluated.filter(st => st.isAdmis).length;
    return ((passCount / evaluated.length) * 100).toFixed(1);
  }, [enrichedTerminaleStudents]);

  // Liste filtrée et triée pour affichage
  const displayClassList = useMemo(() => {
    let result = [...enrichedTerminaleStudents];

    if (classListSearch.trim()) {
      const q = classListSearch.toLowerCase().trim();
      result = result.filter(item => 
        item.student.name.toLowerCase().includes(q) ||
        (item.student.studentId && item.student.studentId.toLowerCase().includes(q)) ||
        (item.student.matricule && item.student.matricule.toLowerCase().includes(q))
      );
    }

    if (classListSortBy === 'name') {
      result.sort((a, b) => a.student.name.localeCompare(b.student.name));
    } else if (classListSortBy === 'average_asc') {
      result.sort((a, b) => {
        if (!a.hasRealAverage && !b.hasRealAverage) return 0;
        if (!a.hasRealAverage) return 1;
        if (!b.hasRealAverage) return -1;
        return (a.generalAverage ?? 0) - (b.generalAverage ?? 0);
      });
    } else {
      result.sort((a, b) => {
        if (!a.hasRealAverage && !b.hasRealAverage) return a.student.name.localeCompare(b.student.name);
        if (!a.hasRealAverage) return 1;
        if (!b.hasRealAverage) return -1;
        return a.rank - b.rank;
      });
    }

    return result;
  }, [enrichedTerminaleStudents, classListSearch, classListSortBy]);
  // Une évaluation est une interrogation ou un devoir enregistré pour les élèves de la classe
  interface EvaluationSummary {
    id: string;
    title: string;
    date: string;
    coef: number;
    maxScore: number;
    type: 'interrogation' | 'devoir' | 'autre';
  }

  const subjectEvaluations = useMemo<EvaluationSummary[]>(() => {
    if (selectedSubjectName === 'ALL' || selectedSubjectName === 'CLASS_LIST' || !selectedClass) return [];

    const map = new Map<string, EvaluationSummary>();

    classStudents.forEach(st => {
      const trimSubjects = st.trimesters?.[activeTrimester]?.subjects || st.subjects || [];
      const sub = trimSubjects.find(s => isSameSubject(s.name, selectedSubjectName));
      if (sub && Array.isArray(sub.grades)) {
        sub.grades.forEach(g => {
          // Ignorer les bonus/malus purs
          if (g.type === 'plus' || g.type === 'minus' || g.isBonus) return;
          const key = (g.title || `Évaluation ${g.id}`).trim();
          if (!map.has(key)) {
            const isDevoir = key.toLowerCase().includes('devoir') || g.coef === 2 || g.maxScore === 40;
            map.set(key, {
              id: String(g.id || key),
              title: key,
              date: g.date || '—',
              coef: g.coef || (isDevoir ? 2 : 1),
              maxScore: g.maxScore || (isDevoir ? 40 : 20),
              type: isDevoir ? 'devoir' : 'interrogation'
            });
          }
        });
      }
    });

    return Array.from(map.values());
  }, [classStudents, selectedSubjectName, activeTrimester, selectedClass]);

  // Évaluation sélectionnée ('ALL' pour moyenne globale de la matière ou titre de l'interro/devoir)
  const [selectedEvaluationKey, setSelectedEvaluationKey] = useState<string>('ALL');

  // Réinitialiser la sélection d'évaluation lors d'un changement de matière
  React.useEffect(() => {
    setSelectedEvaluationKey('ALL');
    setActiveCategoryFilter('all');
  }, [selectedSubjectName]);

  // --- ANALYSE DES NOTES PAR ÉLÈVE DANS LA MATIÈRE / ÉVALUATION SÉLECTIONNÉE ---
  interface StudentGradeAnalysis {
    student: Student;
    hasGrade: boolean;
    rawScore?: number;
    maxScore?: number;
    normalizedScore: number; // Toujours sur 20
    successPercentage: number; // 0 - 100%
    deltaFromReference: number; // normalizedScore - referenceThreshold
    previousNormalizedScore?: number;
    evolutionDiff?: number; // Progression par rapport à l'évaluation précédente
    evolutionStatus: 'up' | 'down' | 'stable' | 'first' | 'none';
    appreciation?: string;
  }

  const studentsAnalysis = useMemo<StudentGradeAnalysis[]>(() => {
    if (selectedSubjectName === 'ALL' || selectedSubjectName === 'CLASS_LIST' || !selectedClass) return [];

    return classStudents.map(student => {
      const trimSubjects = student.trimesters?.[activeTrimester]?.subjects || student.subjects || [];
      const sub = trimSubjects.find(s => isSameSubject(s.name, selectedSubjectName));
      const grades = (sub?.grades || []).filter(g => g.type !== 'plus' && g.type !== 'minus' && !g.isBonus);

      if (selectedEvaluationKey === 'ALL') {
        // Vue moyenne générale de la matière pour l'élève en temps réel
        if (grades.length === 0) {
          return {
            student,
            hasGrade: false,
            normalizedScore: 0,
            successPercentage: 0,
            deltaFromReference: 0,
            evolutionStatus: 'none'
          };
        }

        const subAverage = grades.reduce((acc, g) => acc + normalizeTo20(g.score, g.maxScore), 0) / grades.length;
        const normalizedScore = parseFloat(subAverage.toFixed(2));
        
        // Progression entre la première et la dernière note si plusieurs évaluations
        let previousScore: number | undefined;
        let evolutionDiff: number | undefined;
        let evolutionStatus: 'up' | 'down' | 'stable' | 'first' | 'none' = 'none';

        if (grades.length >= 2) {
          const first = normalizeTo20(grades[grades.length - 1].score, grades[grades.length - 1].maxScore);
          const last = normalizeTo20(grades[0].score, grades[0].maxScore);
          previousScore = first;
          evolutionDiff = parseFloat((last - first).toFixed(2));
          if (evolutionDiff > 0.1) evolutionStatus = 'up';
          else if (evolutionDiff < -0.1) evolutionStatus = 'down';
          else evolutionStatus = 'stable';
        } else if (grades.length === 1) {
          evolutionStatus = 'first';
        }

        return {
          student,
          hasGrade: true,
          rawScore: normalizedScore,
          maxScore: 20,
          normalizedScore,
          successPercentage: parseFloat(((normalizedScore / 20) * 100).toFixed(1)),
          deltaFromReference: parseFloat((normalizedScore - referenceThreshold).toFixed(2)),
          previousNormalizedScore: previousScore,
          evolutionDiff,
          evolutionStatus
        };
      } else {
        // Évaluation spécifique sélectionnée
        const targetGrade = grades.find(g => (g.title || `Évaluation ${g.id}`).trim() === selectedEvaluationKey);

        if (!targetGrade || targetGrade.score === undefined || targetGrade.score === null) {
          return {
            student,
            hasGrade: false,
            normalizedScore: 0,
            successPercentage: 0,
            deltaFromReference: 0,
            evolutionStatus: 'none'
          };
        }

        const rawScore = Number(targetGrade.score);
        const maxScore = targetGrade.maxScore || (targetGrade.coef === 2 ? 40 : 20);
        const normalizedScore = normalizeTo20(rawScore, maxScore);

        // Trouver l'évaluation précédente dans l'ordre chronologique des évaluations disponibles
        const currentEvalIndex = subjectEvaluations.findIndex(e => e.title === selectedEvaluationKey);
        let previousScore: number | undefined;
        let evolutionDiff: number | undefined;
        let evolutionStatus: 'up' | 'down' | 'stable' | 'first' | 'none' = 'none';

        if (currentEvalIndex > 0) {
          const prevEval = subjectEvaluations[currentEvalIndex - 1];
          const prevGrade = grades.find(g => (g.title || `Évaluation ${g.id}`).trim() === prevEval.title);
          if (prevGrade && prevGrade.score !== undefined) {
            previousScore = normalizeTo20(Number(prevGrade.score), prevGrade.maxScore || (prevGrade.coef === 2 ? 40 : 20));
            evolutionDiff = parseFloat((normalizedScore - previousScore).toFixed(2));
            if (evolutionDiff > 0.1) evolutionStatus = 'up';
            else if (evolutionDiff < -0.1) evolutionStatus = 'down';
            else evolutionStatus = 'stable';
          } else {
            evolutionStatus = 'first';
          }
        } else {
          evolutionStatus = 'first';
        }

        return {
          student,
          hasGrade: true,
          rawScore,
          maxScore,
          normalizedScore,
          successPercentage: parseFloat(((rawScore / maxScore) * 100).toFixed(1)),
          deltaFromReference: parseFloat((normalizedScore - referenceThreshold).toFixed(2)),
          previousNormalizedScore: previousScore,
          evolutionDiff,
          evolutionStatus,
          appreciation: targetGrade.appreciation
        };
      }
    });
  }, [classStudents, selectedSubjectName, activeTrimester, selectedEvaluationKey, subjectEvaluations, referenceThreshold, selectedClass]);

  // --- LES 3 CATÉGORIES D'ÉLÈVES SELON LEURS RÉSULTATS ---
  const evaluatedStudents = useMemo(() => studentsAnalysis.filter(a => a.hasGrade), [studentsAnalysis]);
  const unevaluatedStudents = useMemo(() => studentsAnalysis.filter(a => !a.hasGrade), [studentsAnalysis]);

  const underAverageStudents = useMemo(() => {
    return evaluatedStudents.filter(a => a.normalizedScore < referenceThreshold);
  }, [evaluatedStudents, referenceThreshold]);

  const equalAverageStudents = useMemo(() => {
    return evaluatedStudents.filter(a => a.normalizedScore === referenceThreshold);
  }, [evaluatedStudents, referenceThreshold]);

  const aboveAverageStudents = useMemo(() => {
    return evaluatedStudents.filter(a => a.normalizedScore > referenceThreshold);
  }, [evaluatedStudents, referenceThreshold]);

  // Total vérification mathématique : under + equal + above === evaluatedStudents.length
  const totalEnrolled = classStudents.length;
  const evaluatedCount = evaluatedStudents.length;
  const unevaluatedCount = unevaluatedStudents.length;

  // --- INDICATEURS STATISTIQUES CLÉS DE LA MATIÈRE ---
  const subjectStats = useMemo(() => {
    if (evaluatedCount === 0) {
      return {
        classAverage: 0,
        successRate: 0,
        bestScore: 0,
        lowestScore: 0,
        spread: 0,
        hasData: false
      };
    }

    const scores = evaluatedStudents.map(a => a.normalizedScore);
    const sum = scores.reduce((acc, s) => acc + s, 0);
    const classAverage = parseFloat((sum / evaluatedCount).toFixed(2));
    const bestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const spread = parseFloat((bestScore - lowestScore).toFixed(2));
    const successRate = parseFloat((((aboveAverageStudents.length + equalAverageStudents.length) / evaluatedCount) * 100).toFixed(1));

    return {
      classAverage,
      successRate,
      bestScore,
      lowestScore,
      spread,
      hasData: true
    };
  }, [evaluatedStudents, evaluatedCount, aboveAverageStudents, equalAverageStudents]);

  // --- STATISTIQUES COMPARATIVES DE TOUTES LES MATIÈRES (POUR LA VUE GÉNÉRALE) ---
  const allSubjectsOverview = useMemo(() => {
    if (!selectedClass) return [];

    return classSubjects.map(subName => {
      let totalScores = 0;
      let evaluatedInSub = 0;
      let passedCount = 0;

      classStudents.forEach(st => {
        const trimSubjects = st.trimesters?.[activeTrimester]?.subjects || st.subjects || [];
        const sub = trimSubjects.find(s => isSameSubject(s.name, subName));
        if (sub) {
          const grades = (sub.grades || []).filter(g => g.type !== 'plus' && g.type !== 'minus' && !g.isBonus);
          let avg = 0;
          let hasVal = false;

          if (grades.length > 0) {
            avg = grades.reduce((acc, g) => acc + normalizeTo20(g.score, g.maxScore), 0) / grades.length;
            hasVal = true;
          }

          if (hasVal) {
            totalScores += avg;
            evaluatedInSub++;
            if (avg >= referenceThreshold) passedCount++;
          }
        }
      });

      const avg = evaluatedInSub > 0 ? parseFloat((totalScores / evaluatedInSub).toFixed(2)) : null;
      const successPct = evaluatedInSub > 0 ? parseFloat(((passedCount / evaluatedInSub) * 100).toFixed(1)) : null;

      return {
        name: subName,
        average: avg,
        evaluated: evaluatedInSub,
        total: totalEnrolled,
        successRate: successPct,
        color: SUBJECT_HEX_COLORS[subName] || '#3b82f6'
      };
    });
  }, [classSubjects, classStudents, activeTrimester, selectedClass, referenceThreshold, totalEnrolled]);

  // --- HISTORIQUE D'ÉVOLUTION DE LA CLASSE DANS LA MATIÈRE ---
  const evolutionChartData = useMemo(() => {
    if (selectedSubjectName === 'ALL' || selectedSubjectName === 'CLASS_LIST' || subjectEvaluations.length === 0) return [];

    return subjectEvaluations.map((evalItem, idx) => {
      let sum = 0;
      let count = 0;
      let passed = 0;

      classStudents.forEach(st => {
        const trimSubjects = st.trimesters?.[activeTrimester]?.subjects || st.subjects || [];
        const sub = trimSubjects.find(s => isSameSubject(s.name, selectedSubjectName));
        const grade = sub?.grades?.find(g => (g.title || `Évaluation ${g.id}`).trim() === evalItem.title);
        if (grade && grade.score !== undefined) {
          const norm = normalizeTo20(Number(grade.score), grade.maxScore || (grade.coef === 2 ? 40 : 20));
          sum += norm;
          count++;
          if (norm >= referenceThreshold) passed++;
        }
      });

      const avg = count > 0 ? parseFloat((sum / count).toFixed(2)) : null;
      const rate = count > 0 ? parseFloat(((passed / count) * 100).toFixed(1)) : null;

      return {
        name: evalItem.title,
        shortName: `Eval ${idx + 1}`,
        date: evalItem.date,
        average: avg,
        successRate: rate,
        evaluatedCount: count
      };
    }).filter(d => d.average !== null);
  }, [selectedSubjectName, subjectEvaluations, classStudents, activeTrimester, referenceThreshold]);

  // --- HISTOGRAMME DE DISTRIBUTION DES NOTES (7 TRANCHES) ---
  const distributionChartData = useMemo(() => {
    if (evaluatedCount === 0) return [];

    const brackets = [
      { label: '[0 - 4.99]', min: 0, max: 4.99, count: 0, color: '#f43f5e' },
      { label: '[5 - 9.99]', min: 5, max: 9.99, count: 0, color: '#fb7185' },
      { label: '[10 - 11.99]', min: 10, max: 11.99, count: 0, color: '#f59e0b' },
      { label: '[12 - 13.99]', min: 12, max: 13.99, count: 0, color: '#38bdf8' },
      { label: '[14 - 15.99]', min: 14, max: 15.99, count: 0, color: '#0ea5e9' },
      { label: '[16 - 17.99]', min: 16, max: 17.99, count: 0, color: '#34d399' },
      { label: '[18 - 20]', min: 18, max: 20, count: 0, color: '#10b981' }
    ];

    evaluatedStudents.forEach(item => {
      const score = item.normalizedScore;
      for (const b of brackets) {
        if (score >= b.min && score <= b.max) {
          b.count++;
          break;
        }
      }
    });

    return brackets.map(b => ({
      range: b.label,
      count: b.count,
      percentage: parseFloat(((b.count / evaluatedCount) * 100).toFixed(1)),
      color: b.color
    }));
  }, [evaluatedStudents, evaluatedCount]);

  // Données Donut pour la répartition des 3 catégories
  const pieDistributionData = useMemo(() => {
    if (evaluatedCount === 0) return [];
    return [
      { name: 'Sous la moyenne (< 10)', value: underAverageStudents.length, color: CATEGORY_COLORS.under },
      { name: 'À la moyenne (= 10)', value: equalAverageStudents.length, color: CATEGORY_COLORS.equal },
      { name: 'Au-dessus de la moyenne (> 10)', value: aboveAverageStudents.length, color: CATEGORY_COLORS.above }
    ].filter(item => item.value > 0);
  }, [underAverageStudents.length, equalAverageStudents.length, aboveAverageStudents.length, evaluatedCount]);

  // Filtrage des élèves pour l'affichage selon la catégorie et la recherche
  const displayedStudents = useMemo(() => {
    let list: StudentGradeAnalysis[] = [];

    switch (activeCategoryFilter) {
      case 'under':
        list = underAverageStudents;
        break;
      case 'equal':
        list = equalAverageStudents;
        break;
      case 'above':
        list = aboveAverageStudents;
        break;
      case 'unevaluated':
        list = unevaluatedStudents;
        break;
      case 'all':
      default:
        list = [...evaluatedStudents, ...unevaluatedStudents];
        break;
    }

    if (studentSearchTerm.trim()) {
      const term = studentSearchTerm.toLowerCase();
      list = list.filter(item => 
        item.student.name.toLowerCase().includes(term) || 
        (item.student.studentId && item.student.studentId.toLowerCase().includes(term))
      );
    }

    // Tri : élèves évalués par note décroissante, puis non évalués
    return list.sort((a, b) => {
      if (a.hasGrade && b.hasGrade) return b.normalizedScore - a.normalizedScore;
      if (a.hasGrade && !b.hasGrade) return -1;
      if (!a.hasGrade && b.hasGrade) return 1;
      return a.student.name.localeCompare(b.student.name);
    });
  }, [activeCategoryFilter, underAverageStudents, equalAverageStudents, aboveAverageStudents, unevaluatedStudents, evaluatedStudents, studentSearchTerm]);

  // Analyse comparative entre les 2 dernières évaluations
  const progressionComparison = useMemo(() => {
    if (evolutionChartData.length < 2) return null;
    const last = evolutionChartData[evolutionChartData.length - 1];
    const prev = evolutionChartData[evolutionChartData.length - 2];

    const diffAverage = parseFloat((last.average! - prev.average!).toFixed(2));
    const diffRate = parseFloat((last.successRate! - prev.successRate!).toFixed(1));

    // Comptage des élèves en hausse, baisse, stables
    let upCount = 0;
    let downCount = 0;
    let stableCount = 0;

    classStudents.forEach(st => {
      const trimSubjects = st.trimesters?.[activeTrimester]?.subjects || st.subjects || [];
      const sub = trimSubjects.find(s => isSameSubject(s.name, selectedSubjectName));
      const gLast = sub?.grades?.find(g => (g.title || `Évaluation ${g.id}`).trim() === last.name);
      const gPrev = sub?.grades?.find(g => (g.title || `Évaluation ${g.id}`).trim() === prev.name);

      if (gLast?.score !== undefined && gPrev?.score !== undefined) {
        const normLast = normalizeTo20(Number(gLast.score), gLast.maxScore || (gLast.coef === 2 ? 40 : 20));
        const normPrev = normalizeTo20(Number(gPrev.score), gPrev.maxScore || (gPrev.coef === 2 ? 40 : 20));
        const d = normLast - normPrev;
        if (d > 0.1) upCount++;
        else if (d < -0.1) downCount++;
        else stableCount++;
      }
    });

    return {
      lastEval: last.name,
      prevEval: prev.name,
      diffAverage,
      diffRate,
      upCount,
      downCount,
      stableCount,
      totalCompared: upCount + downCount + stableCount
    };
  }, [evolutionChartData, classStudents, activeTrimester, selectedSubjectName]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#BFDBFE] overflow-hidden select-none">
      {/* 1. TOP HEADER APP BAR */}
      <div className="pt-4 md:pt-6 pb-4 px-4 md:px-8 shrink-0 flex flex-col gap-3">
        {/* Navigation & Titre */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
            {onNavigate && (
              <button 
                onClick={() => onNavigate('dashboard')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/25 hover:bg-white/35 backdrop-blur-md border border-white/40 text-white transition-colors shrink-0 shadow-sm"
                title="Retour à Terminale D"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-white text-2xl md:text-[28px] font-bold tracking-tight truncate">
                  Statistiques
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 backdrop-blur-sm shrink-0">
                  <Sparkles size={12} /> Live
                </span>
              </div>
              <p className="text-white/80 text-xs md:text-sm mt-0.5 truncate">
                {selectedClass ? `${selectedClass.name} • ${totalEnrolled} élèves` : "Analyse des performances et progression scolaire"}
              </p>
            </div>
          </div>

          {/* Outils en-tête (Impression) */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()}
              title="Imprimer les statistiques"
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center backdrop-blur-md border border-white/30 text-white transition-colors shadow-xs active:scale-95"
            >
              <FileText size={18} />
            </button>
          </div>
        </div>

        {/* Sélecteur des trimestres centré au milieu : 1erT, 2èmeT, 3ème */}
        <div className="flex items-center justify-center relative pt-1 w-full">
          <div className="bg-white/20 border border-white/30 rounded-2xl p-1 backdrop-blur-md flex items-center shadow-xs">
            {[
              { id: '1er trim' as const, label: '1erT' },
              { id: '2ème trim' as const, label: '2èmeT' },
              { id: '3ème trim' as const, label: '3ème' }
            ].map(item => {
              const isSelected = activeTrimester === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTrimesterSelect(item.id)}
                  className={`px-4 md:px-6 py-1.5 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-white text-sky-800 shadow-md scale-102 font-black' 
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Seuil de moyenne de référence */}
          <div className="hidden lg:flex absolute right-0 items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-xl border border-white/30 text-white text-xs">
            <span className="text-white/80">Moyenne de référence :</span>
            <span className="font-bold bg-white text-sky-800 px-1.5 py-0.2 rounded-md">{referenceThreshold}/20</span>
          </div>
        </div>
      </div>

      {/* 2. CONTENU PRINCIPAL BLANC AVEC COURBES ARRONDIES */}
      <div className="flex-1 bg-white rounded-t-[32px] md:rounded-t-[40px] px-4 md:px-8 pt-5 md:pt-6 overflow-y-auto pb-32 md:pb-24 shadow-2xl relative custom-scrollbar flex flex-col gap-6">
        
        {/* ONGLET MATIÈRES DÉROULANT / NAVIGATION HORIZONTALE */}
        <div className="shrink-0 flex flex-col gap-2 border-b border-slate-100 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <BookOpen size={14} className="text-sky-500" /> Matières enseignées ({classSubjects.length})
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {/* Onglet Vue d'ensemble */}
            <button
              onClick={() => setSelectedSubjectName('ALL')}
              className={`px-3.5 py-2 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                selectedSubjectName === 'ALL'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20 scale-102'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60'
              }`}
            >
              <BarChart2 size={16} />
              <span>Vue Générale</span>
            </button>

            {/* Onglet Liste de classe */}
            <button
              onClick={() => setSelectedSubjectName('CLASS_LIST')}
              className={`px-3.5 py-2 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                selectedSubjectName === 'CLASS_LIST'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-102'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80'
              }`}
            >
              <Users size={16} />
              <span>Liste de classe</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                selectedSubjectName === 'CLASS_LIST' ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-900'
              }`}>
                {classStudents.length}
              </span>
            </button>

            {/* Onglets pour les 9 matières de la classe */}
            {classSubjects.map(subjectName => {
              const isSelected = isSameSubject(selectedSubjectName, subjectName);
              const subColor = SUBJECT_HEX_COLORS[subjectName] || '#3b82f6';
              const overviewItem = allSubjectsOverview.find(o => isSameSubject(o.name, subjectName));
              const hasAverage = overviewItem && overviewItem.average !== null;

              return (
                <button
                  key={subjectName}
                  onClick={() => setSelectedSubjectName(subjectName)}
                  className={`px-3.5 py-2 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'text-white shadow-md scale-102'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                  style={{
                    backgroundColor: isSelected ? subColor : undefined
                  }}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: isSelected ? '#ffffff' : subColor }} 
                  />
                  <span>{subjectName}</span>
                  {hasAverage && (
                    <span className={`text-[11px] font-semibold px-1.5 py-0.2 rounded-md ${
                      isSelected ? 'bg-black/20 text-white' : 'bg-slate-200/80 text-slate-700'
                    }`}>
                      {overviewItem.average}/20
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* --- CONDITION A: VUE LISTE DE CLASSE TERMINALE D (Tous les élèves avec leurs notes à côté) --- */}
        {selectedSubjectName === 'CLASS_LIST' ? (
          <div className="flex flex-col gap-6">
            {/* En-tête de la liste de classe */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-slate-50 p-5 md:p-6 rounded-3xl border border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20 shrink-0">
                    <Users size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg md:text-xl font-black text-slate-900 flex items-center gap-2 truncate">
                      Liste de classe • Terminale D
                    </h2>
                    <p className="text-slate-600 text-xs md:text-sm mt-0.5 truncate">
                      Relevé général nominatif des {enrichedTerminaleStudents.length} élèves avec leurs moyennes et leurs notes par matière au {activeTrimester}.
                    </p>
                  </div>
                </div>
              </div>

              {/* Statistiques rapides de la classe */}
              <div className="flex items-center flex-wrap gap-2.5 shrink-0">
                <div className="bg-white px-3.5 py-2 rounded-2xl border border-slate-100 shadow-2xs text-center min-w-[75px]">
                  <div className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Élèves</div>
                  <div className="text-base md:text-lg font-black text-slate-800">{enrichedTerminaleStudents.length}</div>
                </div>
                <div className="bg-white px-3.5 py-2 rounded-2xl border border-slate-100 shadow-2xs text-center min-w-[95px]">
                  <div className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Moyenne Classe</div>
                  <div className="text-base md:text-lg font-black text-emerald-600">
                    {classOverallAvg !== '—' ? `${classOverallAvg}/20` : '—'}
                  </div>
                </div>
                <div className="bg-white px-3.5 py-2 rounded-2xl border border-slate-100 shadow-2xs text-center min-w-[85px]">
                  <div className="text-[10px] font-bold text-slate-400 uppercase whitespace-nowrap">Taux Réussite</div>
                  <div className="text-base md:text-lg font-black text-sky-600">
                    {classPassRate !== '—' ? `${classPassRate}%` : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Barre d'outils : Recherche, Filtre, Tri et Impression */}
            <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Champ de recherche */}
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={classListSearch}
                  onChange={(e) => setClassListSearch(e.target.value)}
                  placeholder="Rechercher un élève par nom ou matricule..."
                  className="w-full pl-9 pr-8 py-2 bg-white rounded-xl text-xs md:text-sm border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium text-slate-800 placeholder:text-slate-400 shadow-2xs"
                />
                {classListSearch && (
                  <button 
                    onClick={() => setClassListSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Sélecteurs de tri et action impression */}
              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1">
                    <ArrowUpDown size={12} /> Tri :
                  </span>
                  <button
                    onClick={() => setClassListSortBy('rank')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      classListSortBy === 'rank' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    Rang
                  </button>
                  <button
                    onClick={() => setClassListSortBy('name')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      classListSortBy === 'name' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    Nom A-Z
                  </button>
                  <button
                    onClick={() => setClassListSortBy('average_asc')}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      classListSortBy === 'average_asc' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    Moyenne ↑
                  </button>
                </div>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                  title="Imprimer la liste de classe"
                >
                  <Printer size={14} />
                  <span className="hidden sm:inline">Imprimer</span>
                </button>
              </div>
            </div>

            {/* TABLEAU PRINCIPAL : TOUTE LA LISTE AVEC LES NOTES À CÔTÉ */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[980px]">
                  <thead>
                    <tr className="bg-slate-50/90 text-slate-500 text-[11px] font-black uppercase tracking-wider border-b border-slate-100">
                      <th className="py-3 px-3 text-center w-14">Rang</th>
                      <th className="py-3 px-4 min-w-[190px]">Élève</th>
                      <th className="py-3 px-3 text-center bg-slate-100/70 border-x border-slate-100 min-w-[95px]">
                        Moyenne
                      </th>
                      {STATS_OFFICIAL_SUBJECTS.map(subj => {
                        const col = SUBJECT_HEX_COLORS[subj] || '#3b82f6';
                        return (
                          <th 
                            key={subj} 
                            className="py-3 px-2 text-center text-[10px] font-black min-w-[65px]"
                            title={subj}
                          >
                            <span 
                              className="inline-block w-2 h-2 rounded-full mr-1 align-middle"
                              style={{ backgroundColor: col }}
                            />
                            {subj === 'Informatique' ? 'Info' :
                             subj === 'Physique-Chimie' ? 'Phys-Ch' :
                             subj === 'Philosophie' ? 'Philo' :
                             subj === 'Mathématiques' ? 'Maths' :
                             subj === 'Français' ? 'Franç' :
                             subj === 'Anglais' ? 'Angl' :
                             subj}
                          </th>
                        );
                      })}
                      <th className="py-3 px-3 text-center min-w-[100px]">Mention</th>
                      <th className="py-3 px-3 text-center w-20">Fiche</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {displayClassList.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="py-12 text-center text-slate-400 font-semibold">
                          Aucun élève trouvé pour cette recherche.
                        </td>
                      </tr>
                    ) : (
                      displayClassList.map((item) => {
                        const medal = item.hasRealAverage && item.rank === 1 ? '🥇' : item.hasRealAverage && item.rank === 2 ? '🥈' : item.hasRealAverage && item.rank === 3 ? '🥉' : null;
                        const mention = !item.hasRealAverage || item.generalAverage === null ? '—' :
                                        item.generalAverage >= 16 ? 'Très Bien' :
                                        item.generalAverage >= 14 ? 'Bien' :
                                        item.generalAverage >= 12 ? 'Assez Bien' :
                                        item.generalAverage >= 10 ? 'Passable' : 'Insuffisant';

                        return (
                          <tr 
                            key={item.student.id} 
                            onClick={() => setInspectedStudent(item.student)}
                            className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                          >
                            {/* Rang */}
                            <td className="py-3 px-3 text-center font-bold">
                              {medal ? (
                                <span className="text-base" title={`#${item.rankDisplay}`}>{medal}</span>
                              ) : item.hasRealAverage ? (
                                <span className="inline-flex items-center justify-center px-2 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-xs">
                                  #{item.rankDisplay}
                                </span>
                              ) : (
                                <span className="text-slate-300 font-bold text-xs">—</span>
                              )}
                            </td>

                            {/* Élève */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={item.student.photoUrl || `https://i.pravatar.cc/100?u=${item.student.id}`}
                                  alt={item.student.name}
                                  className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 bg-slate-100"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                                    {item.student.name}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-medium truncate">
                                    {item.student.studentId || item.student.matricule || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Moyenne Générale */}
                            <td className="py-3 px-3 text-center bg-slate-50/50 group-hover:bg-slate-100/50 border-x border-slate-100">
                              <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-xl font-black text-xs md:text-sm ${
                                item.hasRealAverage && item.generalAverage !== null
                                  ? item.generalAverage >= referenceThreshold
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-slate-100 text-slate-400'
                              }`}>
                                {item.hasRealAverage && item.generalAverage !== null ? `${item.generalAverage.toFixed(2)}` : '—'}
                              </span>
                            </td>

                            {/* Les 9 Notes à côté */}
                            {STATS_OFFICIAL_SUBJECTS.map(subj => {
                              const scoreObj = item.subjectScores[subj];
                              const hasScore = scoreObj && scoreObj.score !== null;
                              const isSubPass = hasScore && scoreObj.score! >= referenceThreshold;

                              return (
                                <td key={subj} className="py-3 px-2 text-center font-bold">
                                  {hasScore ? (
                                    <span className={`inline-block px-1.5 py-0.5 rounded-lg text-xs font-black ${
                                      isSubPass 
                                        ? 'text-emerald-700 bg-emerald-50/80 border border-emerald-100' 
                                        : 'text-rose-700 bg-rose-50/80 border border-rose-100'
                                    }`}>
                                      {scoreObj.display}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300 font-semibold text-xs">—</span>
                                  )}
                                </td>
                              );
                            })}

                            {/* Mention */}
                            <td className="py-3 px-3 text-center">
                              {item.hasRealAverage && item.generalAverage !== null ? (
                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  item.generalAverage >= 14 ? 'bg-emerald-100 text-emerald-800' :
                                  item.generalAverage >= 10 ? 'bg-sky-100 text-sky-800' :
                                  'bg-rose-100 text-rose-700'
                                }`}>
                                  {mention}
                                </span>
                              ) : (
                                <span className="text-slate-300 font-semibold text-xs">—</span>
                              )}
                            </td>

                            {/* Action */}
                            <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setInspectedStudent(item.student)}
                                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                                title="Voir la fiche détaillée"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : selectedSubjectName === 'ALL' ? (
          <div className="flex flex-col gap-6">
            {/* Message d'en-tête de la vue générale */}
            <div className="bg-gradient-to-r from-sky-50 via-indigo-50/40 to-slate-50 p-5 rounded-3xl border border-sky-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
                  <School className="text-sky-600" size={22} />
                  Tableau de bord général • {selectedClass?.name}
                </h2>
                <p className="text-slate-600 text-xs md:text-sm mt-1">
                  Synthèse comparative des moyennes et taux de réussite dans toutes les matières au {activeTrimester}.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white px-3.5 py-2 rounded-2xl border border-slate-100 shadow-2xs text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Élèves inscrits</div>
                  <div className="text-lg font-bold text-slate-800">{totalEnrolled}</div>
                </div>
                <div className="bg-white px-3.5 py-2 rounded-2xl border border-slate-100 shadow-2xs text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Matières actives</div>
                  <div className="text-lg font-bold text-sky-600">
                    {allSubjectsOverview.filter(s => s.average !== null).length} / {classSubjects.length}
                  </div>
                </div>
              </div>
            </div>

            {/* GRAPHIQUE 5 : COMPARAISON ENTRE TOUTES LES MATIÈRES */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2 flex-wrap">
                    <BarChart2 className="text-sky-600 shrink-0" size={18} />
                    <span>Comparaison des moyennes par matière</span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                    Moyenne sur 20 calculée à partir des notes réelles de la classe.
                  </p>
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100 self-start sm:self-auto shrink-0 shadow-2xs">
                  Ligne repère : <strong className="text-slate-800">{referenceThreshold}/20</strong>
                </span>
              </div>

              {allSubjectsOverview.some(s => s.average !== null) ? (
                <div className="w-full h-[320px] pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={allSubjectsOverview.filter(s => s.average !== null)} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        interval={0} 
                        angle={-30} 
                        textAnchor="end" 
                        tick={{ fontSize: 11, fill: '#64748b' }} 
                        height={55}
                      />
                      <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs space-y-1">
                                <div className="font-bold text-sm text-sky-400">{data.name}</div>
                                <div>Moyenne : <span className="font-bold">{data.average}/20</span></div>
                                <div>Taux de réussite : <span className="font-bold">{data.successRate}%</span></div>
                                <div>Élèves évalués : <span className="font-bold">{data.evaluated} / {data.total}</span></div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <ReferenceLine y={referenceThreshold} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: `Réf (${referenceThreshold}/20)`, fill: '#f43f5e', fontSize: 10, position: 'right' }} />
                      <Bar dataKey="average" radius={[6, 6, 0, 0]} barSize={28}>
                        {allSubjectsOverview.filter(s => s.average !== null).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.average! >= referenceThreshold ? '#10b981' : '#f43f5e'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="py-14 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <BookOpen size={36} className="text-slate-300" />
                  <p className="text-sm font-medium">Aucune note enregistrée pour le moment dans cette classe.</p>
                  <p className="text-xs text-slate-400 max-w-md">
                    Les notes saisies par les enseignants dans le Dashboard apparaîtront ici automatiquement sous forme de statistiques comparatives.
                  </p>
                </div>
              )}
            </div>

            {/* GRILLE DES CARTES DE CHAQUE MATIÈRE */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers size={14} className="text-sky-500" /> Détail par matière
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allSubjectsOverview.map(sub => {
                  const hasData = sub.average !== null;
                  const isPassing = hasData && sub.average! >= referenceThreshold;

                  return (
                    <div
                      key={sub.name}
                      onClick={() => setSelectedSubjectName(sub.name)}
                      className="bg-white p-5 rounded-3xl border border-slate-100 hover:border-sky-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span 
                            className="w-3.5 h-3.5 rounded-full shrink-0" 
                            style={{ backgroundColor: sub.color }} 
                          />
                          <h4 className="font-bold text-slate-800 text-sm group-hover:text-sky-600 transition-colors">
                            {sub.name}
                          </h4>
                        </div>
                        <ArrowUpRight size={16} className="text-slate-300 group-hover:text-sky-500 transition-colors" />
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-50 flex items-end justify-between">
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">Moyenne classe</div>
                          <div className="text-2xl font-black mt-0.5">
                            {hasData ? (
                              <span className={isPassing ? 'text-emerald-600' : 'text-rose-600'}>
                                {sub.average} <span className="text-xs font-semibold text-slate-400">/20</span>
                              </span>
                            ) : (
                              <span className="text-slate-300 text-base font-bold">Aucune note</span>
                            )}
                          </div>
                        </div>

                        {hasData && (
                          <div className="text-right">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                              isPassing ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {isPassing ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {sub.successRate}% réussite
                            </span>
                            <div className="text-[10px] text-slate-400 mt-1">
                              {sub.evaluated} noté{sub.evaluated > 1 ? 's' : ''}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* --- CONDITION B: VUE DÉTAILLÉE D'UNE MATIÈRE SÉLECTIONNÉE --- */
          <div className="flex flex-col gap-6">

            {/* SÉLECTEUR D'ÉVALUATION ET INFOS MATIÈRE */}
            <div className="bg-gradient-to-r from-sky-50/80 via-white to-slate-50 p-4 md:p-5 rounded-3xl border border-sky-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                  style={{ backgroundColor: SUBJECT_HEX_COLORS[selectedSubjectName] || '#3b82f6' }}
                >
                  <BookOpen size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    {selectedSubjectName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Statistiques détaillées • {selectedClass?.name} • {activeTrimester}
                  </p>
                </div>
              </div>

              {/* Information Évaluation (Moyenne générale) */}
              <div className="flex items-center gap-2 min-w-0 max-w-full">
                <span className="text-xs font-semibold text-slate-500 shrink-0">Évaluation :</span>
                <div 
                  className="inline-flex items-center gap-2 bg-white/95 border border-slate-200/90 rounded-xl px-3 py-1.5 text-xs md:text-sm font-bold text-slate-700 shadow-2xs min-w-0 max-w-full"
                  title="Toutes les évaluations (Moyenne générale)"
                >
                  <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                  <span className="whitespace-nowrap truncate">Toutes les évaluations (Moyenne générale)</span>
                </div>
              </div>
            </div>


                {/* 3. TABLEAU DE BORD STATISTIQUE - CARTES INDICATEURS CLÉS (Section 3) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {/* Carte 1 : Moyenne Générale */}
                  <div className="bg-white p-4 md:p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Moyenne Classe
                      </span>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        subjectStats.hasData && subjectStats.classAverage >= referenceThreshold 
                          ? 'bg-emerald-50 text-emerald-600' 
                          : 'bg-rose-50 text-rose-500'
                      }`}>
                        <Award size={18} />
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl md:text-3xl font-black text-slate-900">
                        {subjectStats.hasData ? (
                          <>
                            {subjectStats.classAverage} 
                            <span className="text-xs md:text-sm font-semibold text-slate-400"> /20</span>
                          </>
                        ) : (
                          <span className="text-slate-400 font-bold">—</span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        {subjectStats.hasData ? (
                          subjectStats.classAverage >= referenceThreshold ? (
                            <span className="text-emerald-600 font-bold flex items-center">
                              <TrendingUp size={12} className="mr-0.5" />
                              +{(subjectStats.classAverage - referenceThreshold).toFixed(2)} pts vs réf
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold flex items-center">
                              <TrendingDown size={12} className="mr-0.5" />
                              {(subjectStats.classAverage - referenceThreshold).toFixed(2)} pts vs réf
                            </span>
                          )
                        ) : (
                          <span className="text-slate-500">Aucune note saisie</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Carte 2 : Effectif Inscrits & Notés */}
                  <div className="bg-white p-4 md:p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Élèves Évalués
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                        <Users size={18} />
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl md:text-3xl font-black text-slate-900">
                        {evaluatedCount} 
                        <span className="text-xs md:text-sm font-semibold text-slate-400"> / {totalEnrolled}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {unevaluatedCount > 0 ? (
                          <span className="text-amber-600 font-semibold">{unevaluatedCount} élève(s) sans note</span>
                        ) : (
                          <span className="text-emerald-600 font-semibold">100% de la classe évaluée</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Carte 3 : Taux de Réussite */}
                  <div className="bg-white p-4 md:p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Taux de Réussite
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <CheckCircle2 size={18} />
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-2xl md:text-3xl font-black text-slate-900">
                        {subjectStats.hasData ? `${subjectStats.successRate}%` : <span className="text-slate-900 font-black">—</span>}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {subjectStats.hasData ? (
                          <span>{aboveAverageStudents.length + equalAverageStudents.length} élèves ≥ {referenceThreshold}/20</span>
                        ) : (
                          <span className="text-slate-500">En attente de notes</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Carte 4 : Meilleure & Pire Note */}
                  <div className="bg-white p-4 md:p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Extrêmes & Écart
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                        <BarChart2 size={18} />
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-bold text-slate-800 flex items-center justify-between">
                        <span className="text-emerald-600">
                          Max : {subjectStats.hasData ? `${subjectStats.bestScore}/20` : '—'}
                        </span>
                        <span className="text-rose-600">
                          Min : {subjectStats.hasData ? `${subjectStats.lowestScore}/20` : '—'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Étendue de la classe : <span className="font-bold text-slate-800">{subjectStats.hasData ? `${subjectStats.spread} pts` : '—'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. LES 3 CATÉGORIES D'ÉLÈVES CLIQUABLES (Section 4) */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Filter size={14} className="text-sky-500" /> Répartition et analyse des 3 catégories
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Catégorie 1 : Sous la moyenne */}
                    <button
                      onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'under' ? 'all' : 'under')}
                      className={`p-4 rounded-3xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
                        activeCategoryFilter === 'under'
                          ? 'border-rose-500 bg-rose-50/90 shadow-md ring-2 ring-rose-300'
                          : 'border-rose-100 bg-rose-50/30 hover:bg-rose-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-rose-700 uppercase">Sous la moyenne</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-rose-700">
                          {underAverageStudents.length}
                        </div>
                        <div className="text-[11px] font-semibold text-rose-600/80 mt-0.5">
                          {evaluatedCount > 0 ? `${((underAverageStudents.length / evaluatedCount) * 100).toFixed(1)}% des notés` : '0%'}
                        </div>
                      </div>
                    </button>

                    {/* Catégorie 2 : À la moyenne */}
                    <button
                      onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'equal' ? 'all' : 'equal')}
                      className={`p-4 rounded-3xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
                        activeCategoryFilter === 'equal'
                          ? 'border-amber-500 bg-amber-50/90 shadow-md ring-2 ring-amber-300'
                          : 'border-amber-100 bg-amber-50/30 hover:bg-amber-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-700 uppercase">À la moyenne</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-amber-700">
                          {equalAverageStudents.length}
                        </div>
                        <div className="text-[11px] font-semibold text-amber-600/80 mt-0.5">
                          {evaluatedCount > 0 ? `${((equalAverageStudents.length / evaluatedCount) * 100).toFixed(1)}% des notés` : '0%'}
                        </div>
                      </div>
                    </button>

                    {/* Catégorie 3 : Au-dessus de la moyenne */}
                    <button
                      onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'above' ? 'all' : 'above')}
                      className={`p-4 rounded-3xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
                        activeCategoryFilter === 'above'
                          ? 'border-emerald-500 bg-emerald-50/90 shadow-md ring-2 ring-emerald-300'
                          : 'border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-emerald-700 uppercase">Au-dessus moyenne</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-emerald-700">
                          {aboveAverageStudents.length}
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-600/80 mt-0.5">
                          {evaluatedCount > 0 ? `${((aboveAverageStudents.length / evaluatedCount) * 100).toFixed(1)}% des notés` : '0%'}
                        </div>
                      </div>
                    </button>

                    {/* Catégorie Sans note */}
                    <button
                      onClick={() => setActiveCategoryFilter(activeCategoryFilter === 'unevaluated' ? 'all' : 'unevaluated')}
                      className={`p-4 rounded-3xl border transition-all text-left cursor-pointer flex flex-col justify-between ${
                        activeCategoryFilter === 'unevaluated'
                          ? 'border-slate-500 bg-slate-100 shadow-md ring-2 ring-slate-300'
                          : 'border-slate-100 bg-slate-50 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600 uppercase">Sans note</span>
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                      </div>
                      <div className="mt-3">
                        <div className="text-2xl font-black text-slate-700">
                          {unevaluatedCount}
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
                          {totalEnrolled > 0 ? `${((unevaluatedCount / totalEnrolled) * 100).toFixed(1)}% de la classe` : '0%'}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 6. GRAPHIQUES DÉTAILLÉS ET PROFESSIONNELS (Section 6) */}
                {subjectStats.hasData && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* GRAPHIQUE 1 : Évolution de la moyenne de la classe au fil des interrogations */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <LineChartIcon size={16} className="text-sky-600" />
                          Évolution de la moyenne au fil des interrogations
                        </h4>
                        <p className="text-xs text-slate-400">Progression globale de la classe</p>
                      </div>
                      <span className="text-xs font-semibold text-rose-500">Seuil 10/20</span>
                    </div>

                    {evolutionChartData.length > 0 ? (
                      <div className="w-full h-[240px] pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={evolutionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="shortName" tick={{ fontSize: 11, fill: '#64748b' }} />
                            <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#64748b' }} />
                            <Tooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const d = payload[0].payload;
                                  return (
                                    <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs space-y-1">
                                      <div className="font-bold text-sky-400">{d.name}</div>
                                      <div>Date : {d.date}</div>
                                      <div>Moyenne : <span className="font-bold">{d.average}/20</span></div>
                                      <div>Taux de réussite : <span className="font-bold">{d.successRate}%</span></div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <ReferenceLine y={referenceThreshold} stroke="#f43f5e" strokeDasharray="4 4" />
                            <Line 
                              type="monotone" 
                              dataKey="average" 
                              stroke="#0284c7" 
                              strokeWidth={3} 
                              dot={{ fill: '#0284c7', r: 5 }} 
                              activeDot={{ r: 7 }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center text-xs text-slate-400 italic">
                        Une seule évaluation enregistrée : l'historique d'évolution s'affichera à partir de la 2ᵉ évaluation.
                      </div>
                    )}
                  </div>

                  {/* GRAPHIQUE 2 : Répartition des élèves (3 catégories) */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <PieChartIcon size={16} className="text-sky-600" />
                          Répartition des élèves par catégorie
                        </h4>
                        <p className="text-xs text-slate-400">Proportions parmi les {evaluatedCount} élèves évalués</p>
                      </div>
                    </div>

                    <div className="w-full h-[240px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={85}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {pieDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                const pct = evaluatedCount > 0 ? ((d.value / evaluatedCount) * 100).toFixed(1) : 0;
                                return (
                                  <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs space-y-0.5">
                                    <div className="font-bold">{d.name}</div>
                                    <div>Effectif : <span className="font-bold">{d.value} élève(s)</span> ({pct}%)</div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            iconType="circle" 
                            iconSize={8} 
                            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* GRAPHIQUE 3 : Histogramme de distribution des notes par tranches */}
                  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <BarChart2 size={16} className="text-sky-600" />
                          Distribution des notes par tranches
                        </h4>
                        <p className="text-xs text-slate-400">
                          Comprendre comment les notes sont ventilées à travers l'échelle de 0 à 20
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{evaluatedCount} élèves notés</span>
                    </div>

                    <div className="w-full h-[230px] pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={distributionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#64748b' }} />
                          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                return (
                                  <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg text-xs space-y-1">
                                    <div className="font-bold text-sky-400">Tranche : {d.range}</div>
                                    <div>Nombre d'élèves : <span className="font-bold">{d.count}</span></div>
                                    <div>Proportion : <span className="font-bold">{d.percentage}%</span></div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={34}>
                            {distributionChartData.map((entry, index) => (
                              <Cell key={`dist-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

            {/* 7. ANALYSE DE PROGRESSION DE LA CLASSE (Section 7) */}
            {progressionComparison && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-amber-400" size={18} />
                    <h4 className="font-bold text-sm tracking-wide">
                      Analyse de progression : {progressionComparison.prevEval} → {progressionComparison.lastEval}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-300">
                    Comparaison de performance sur les élèves ayant participé aux deux évaluations successives.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <div className="bg-white/10 px-3 py-2 rounded-2xl backdrop-blur-xs border border-white/10 text-center">
                    <div className="text-[10px] uppercase text-slate-300 font-bold">Évolution Moyenne</div>
                    <div className={`text-base font-black ${
                      progressionComparison.diffAverage >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {progressionComparison.diffAverage >= 0 ? `+${progressionComparison.diffAverage}` : progressionComparison.diffAverage} pts
                    </div>
                  </div>

                  <div className="bg-white/10 px-3 py-2 rounded-2xl backdrop-blur-xs border border-white/10 text-center">
                    <div className="text-[10px] uppercase text-slate-300 font-bold">Taux Réussite</div>
                    <div className={`text-base font-black ${
                      progressionComparison.diffRate >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {progressionComparison.diffRate >= 0 ? `+${progressionComparison.diffRate}` : progressionComparison.diffRate}%
                    </div>
                  </div>

                  <div className="bg-white/10 px-3 py-2 rounded-2xl backdrop-blur-xs border border-white/10 flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400">↑ {progressionComparison.upCount} en hausse</span>
                    <span className="text-xs font-bold text-slate-300">•</span>
                    <span className="text-xs font-bold text-rose-400">↓ {progressionComparison.downCount} en baisse</span>
                  </div>
                </div>
              </div>
            )}

            {/* 8. LISTE DÉTAILLÉE DES ÉLÈVES SELON LEURS NOTES (Section 4 & 8) */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                    <Users size={18} className="text-sky-600" />
                    {!subjectStats.hasData ? (
                      <span>Élèves de la classe ({displayedStudents.length})</span>
                    ) : (
                      <span>Liste des élèves ({displayedStudents.length} affiché{displayedStudents.length > 1 ? 's' : ''})</span>
                    )}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    {!subjectStats.hasData 
                      ? `Élèves inscrits en ${selectedClass?.name} en attente d'évaluation en ${selectedSubjectName}`
                      : activeCategoryFilter === 'under' ? 'Élèves ayant une note sous la moyenne (< 10/20)'
                      : activeCategoryFilter === 'equal' ? 'Élèves ayant exactement la moyenne (10/20)'
                      : activeCategoryFilter === 'above' ? 'Élèves ayant une note supérieure à la moyenne (> 10/20)'
                      : activeCategoryFilter === 'unevaluated' ? 'Élèves sans note enregistrée pour cette sélection'
                      : 'Tous les élèves de la classe'}
                  </p>
                </div>

                {/* Recherche d'élève */}
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-2xl border border-slate-200/80 w-full sm:w-64">
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    placeholder="Rechercher un élève..."
                    className="bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 w-full"
                  />
                  {studentSearchTerm && (
                    <button onClick={() => setStudentSearchTerm('')} className="text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Cartes Élèves */}
              {displayedStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {displayedStudents.map(({ student, hasGrade, rawScore, maxScore, normalizedScore, successPercentage, deltaFromReference, evolutionStatus, evolutionDiff, appreciation }) => {
                    const isUnder = hasGrade && normalizedScore < referenceThreshold;
                    const isEqual = hasGrade && normalizedScore === referenceThreshold;
                    const isAbove = hasGrade && normalizedScore > referenceThreshold;

                    return (
                      <div
                        key={student.id}
                        onClick={() => setInspectedStudent(student)}
                        className={`p-4 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between group hover:shadow-md ${
                          !hasGrade 
                            ? 'bg-slate-50/50 border-slate-200/70 hover:border-slate-300' 
                            : isUnder 
                              ? 'bg-white border-rose-100 hover:border-rose-300' 
                              : isEqual 
                                ? 'bg-white border-amber-100 hover:border-amber-300' 
                                : 'bg-white border-emerald-100 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img 
                              src={student.photoUrl || `https://i.pravatar.cc/150?u=${student.id}`} 
                              alt={student.name}
                              className="w-11 h-11 rounded-2xl object-cover border border-slate-200 shrink-0" 
                            />
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">
                                {student.name}
                              </h4>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                <span>{student.studentId || 'N/A'}</span>
                                {student.assignedStatus && (
                                  <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-bold uppercase ${
                                    student.assignedStatus === 'affecte' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {student.assignedStatus === 'affecte' ? 'Affecté' : 'Non aff.'}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Badge Évolution */}
                          {hasGrade && (
                            <div>
                              {evolutionStatus === 'up' && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                  <ArrowUpRight size={12} /> +{evolutionDiff}
                                </span>
                              )}
                              {evolutionStatus === 'down' && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700">
                                  <ArrowDownRight size={12} /> {evolutionDiff}
                                </span>
                              )}
                              {evolutionStatus === 'stable' && (
                                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                  <Minus size={12} /> Stable
                                </span>
                              )}
                              {evolutionStatus === 'first' && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700">
                                  1ère note
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Note & Indicateurs */}
                        <div className="mt-3 pt-3 border-t border-slate-50 flex items-end justify-between">
                          <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase">
                              {selectedEvaluationKey === 'ALL' ? 'Moyenne matière' : 'Note obtenue'}
                            </div>
                            <div className="text-xl font-black mt-0.5">
                              {hasGrade ? (
                                <span className={
                                  isAbove ? 'text-emerald-600' : isEqual ? 'text-amber-600' : 'text-rose-600'
                                }>
                                  {normalizedScore} <span className="text-xs font-semibold text-slate-400">/20</span>
                                  {maxScore && maxScore !== 20 && (
                                    <span className="text-[10px] text-slate-400 font-normal ml-1">
                                      ({rawScore}/{maxScore})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs font-semibold">En attente de note</span>
                              )}
                            </div>
                          </div>

                          {hasGrade && (
                            <div className="text-right">
                              <div className="text-xs font-bold text-slate-700">
                                {successPercentage}%
                              </div>
                              <div className={`text-[10px] font-semibold ${
                                deltaFromReference >= 0 ? 'text-emerald-600' : 'text-rose-600'
                              }`}>
                                {deltaFromReference >= 0 ? `+${deltaFromReference}` : deltaFromReference} vs réf
                              </div>
                            </div>
                          )}
                        </div>

                        {appreciation && (
                          <div className="mt-2 text-[11px] text-slate-500 italic bg-slate-50 px-2.5 py-1 rounded-xl truncate">
                            « {appreciation} »
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Aucun élève ne correspond aux critères de filtre sélectionnés.
                </div>
              )}
            </div>

            {/* 5. HISTORIQUE DES ÉVALUATIONS DE LA MATIÈRE (Section 5) */}
            {subjectEvaluations.length > 0 && (
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Calendar size={16} className="text-sky-600" />
                    Historique des évaluations en {selectedSubjectName}
                  </h4>
                  <span className="text-xs text-slate-400">{subjectEvaluations.length} enregistrée(s)</span>
                </div>

                <div className="overflow-x-auto no-scrollbar">
                  <table className="w-full text-left text-xs text-slate-700 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                        <th className="py-2.5 px-3">Titre de l'évaluation</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Coef / Barème</th>
                        <th className="py-2.5 px-3 text-center">Évalués</th>
                        <th className="py-2.5 px-3 text-center">Moyenne</th>
                        <th className="py-2.5 px-3 text-center">Taux Réussite</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {subjectEvaluations.map((ev, index) => {
                        let sum = 0;
                        let count = 0;
                        let pass = 0;

                        classStudents.forEach(st => {
                          const trimSubjects = st.trimesters?.[activeTrimester]?.subjects || st.subjects || [];
                          const sub = trimSubjects.find(s => isSameSubject(s.name, selectedSubjectName));
                          const g = sub?.grades?.find(gr => (gr.title || `Évaluation ${gr.id}`).trim() === ev.title);
                          if (g && g.score !== undefined) {
                            const norm = normalizeTo20(Number(g.score), g.maxScore || (g.coef === 2 ? 40 : 20));
                            sum += norm;
                            count++;
                            if (norm >= referenceThreshold) pass++;
                          }
                        });

                        const avg = count > 0 ? (sum / count).toFixed(2) : '—';
                        const rate = count > 0 ? `${((pass / count) * 100).toFixed(1)}%` : '—';

                        return (
                          <tr 
                            key={ev.title} 
                            onClick={() => setSelectedEvaluationKey(ev.title)}
                            className={`hover:bg-sky-50/50 cursor-pointer transition-colors ${
                              selectedEvaluationKey === ev.title ? 'bg-sky-50 font-bold text-sky-900' : ''
                            }`}
                          >
                            <td className="py-2.5 px-3 font-semibold">{ev.title}</td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ev.type === 'devoir' ? 'bg-purple-50 text-purple-700' : 'bg-sky-50 text-sky-700'
                              }`}>
                                {ev.type === 'devoir' ? 'Devoir' : 'Interro'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-500">{ev.date}</td>
                            <td className="py-2.5 px-3 text-slate-500">Coef {ev.coef} • sur {ev.maxScore}</td>
                            <td className="py-2.5 px-3 text-center font-medium">{count} / {totalEnrolled}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-900">{avg}/20</td>
                            <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{rate}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- FICHE STATISTIQUE INDIVIDUELLE D'UN ÉLÈVE (MODAL / Section 8) --- */}
      <AnimatePresence>
        {inspectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-xl rounded-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] custom-scrollbar"
            >
              {/* En-tête de la fiche élève */}
              <div className="bg-gradient-to-r from-sky-600 to-indigo-600 p-6 text-white relative">
                <button
                  onClick={() => setInspectedStudent(null)}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center absolute top-5 right-5 text-white transition-colors"
                >
                  <X size={18} />
                </button>

                <div className="flex items-center gap-4">
                  <img
                    src={inspectedStudent.photoUrl || `https://i.pravatar.cc/150?u=${inspectedStudent.id}`}
                    alt={inspectedStudent.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/60 shadow-md shrink-0"
                  />
                  <div>
                    <h3 className="text-xl font-bold">{inspectedStudent.name}</h3>
                    <p className="text-xs text-white/80 mt-0.5">
                      Matricule : {inspectedStudent.studentId || 'N/A'} • Classe : {inspectedStudent.class}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                        {selectedSubjectName === 'ALL' ? 'Vue Générale' : selectedSubjectName === 'CLASS_LIST' ? 'Liste de classe' : selectedSubjectName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30">
                        {activeTrimester}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Corps de la fiche élève */}
              <div className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
                {(() => {
                  const isGeneralOrClassList = selectedSubjectName === 'ALL' || selectedSubjectName === 'CLASS_LIST';
                  const trimSubjects = inspectedStudent.trimesters?.[activeTrimester]?.subjects || inspectedStudent.subjects || [];

                  if (isGeneralOrClassList) {
                    const studentGeneralAvg = getStudentGeneralAverage(inspectedStudent);
                    const studentRankItem = enrichedTerminaleStudents.find(item => String(item.student.id) === String(inspectedStudent.id));
                    const hasRealAvg = studentGeneralAvg !== null && studentGeneralAvg > 0;
                    const studentRank = studentRankItem && studentRankItem.hasRealAverage ? studentRankItem.rankDisplay : '—';
                    const isPassing = hasRealAvg && studentGeneralAvg >= referenceThreshold;

                    return (
                      <>
                        {/* Résumé général de l'élève */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                            <div className="text-[10px] font-bold uppercase text-slate-400">Moyenne Générale</div>
                            <div className={`text-2xl font-black mt-1 ${hasRealAvg ? (isPassing ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-400'}`}>
                              {hasRealAvg ? `${studentGeneralAvg!.toFixed(2)}/20` : '—'}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {hasRealAvg ? (isPassing ? 'Admis au trimestre' : 'Sous la moyenne') : 'Non encore évalué'}
                            </div>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                            <div className="text-[10px] font-bold uppercase text-slate-400">Classement</div>
                            <div className="text-2xl font-black mt-1 text-slate-800">
                              {studentRank !== '—' ? `#${studentRank}` : '—'} {studentRank !== '—' && <span className="text-xs text-slate-400 font-semibold">/ {enrichedTerminaleStudents.filter(s => s.hasRealAverage).length}</span>}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Moy. classe : {classOverallAvg !== '—' ? `${classOverallAvg}/20` : '—'}
                            </div>
                          </div>
                        </div>

                        {/* Relevé des 9 matières de l'élève */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Notes par discipline ({STATS_OFFICIAL_SUBJECTS.length} matières)
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {STATS_OFFICIAL_SUBJECTS.map(subj => {
                              const scoreObj = getStudentSubjectScore(inspectedStudent, subj);
                              const subColor = SUBJECT_HEX_COLORS[subj] || '#3b82f6';
                              const hasScore = scoreObj.score !== null;
                              const isSubPass = hasScore && scoreObj.score! >= referenceThreshold;

                              return (
                                <div key={subj} className="p-3 bg-white rounded-2xl border border-slate-100 flex items-center justify-between">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: subColor }} />
                                    <span className="text-xs font-bold text-slate-800 truncate">{subj}</span>
                                  </div>
                                  <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                                    hasScore 
                                      ? (isSubPass ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100')
                                      : 'text-slate-300 font-semibold'
                                  }`}>
                                    {hasScore ? `${scoreObj.display}/20` : '—'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    );
                  }

                  const sub = trimSubjects.find(s => isSameSubject(s.name, selectedSubjectName));
                  const grades = (sub?.grades || []).filter(g => g.type !== 'plus' && g.type !== 'minus' && !g.isBonus);
                  
                  // Moyenne de l'élève dans cette matière
                  const studentAvg = grades.length > 0 
                    ? grades.reduce((acc, g) => acc + normalizeTo20(g.score, g.maxScore), 0) / grades.length
                    : (typeof sub?.average === 'number' ? sub.average : 0);

                  const deltaFromClass = subjectStats.hasData ? parseFloat((studentAvg - subjectStats.classAverage).toFixed(2)) : 0;

                  return (
                    <>
                      {/* Résumé de performance */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                          <div className="text-[10px] font-bold uppercase text-slate-400">Moyenne Élève</div>
                          <div className={`text-2xl font-black mt-1 ${
                            studentAvg >= referenceThreshold ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {studentAvg > 0 ? `${studentAvg.toFixed(2)}/20` : '—'}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            {studentAvg >= referenceThreshold ? 'Admis dans la matière' : 'Sous la moyenne'}
                          </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                          <div className="text-[10px] font-bold uppercase text-slate-400">Écart vs Classe</div>
                          <div className={`text-2xl font-black mt-1 ${
                            deltaFromClass >= 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            {deltaFromClass >= 0 ? `+${deltaFromClass}` : deltaFromClass} pts
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Classe : {subjectStats.hasData ? `${subjectStats.classAverage}/20` : '—'}
                          </div>
                        </div>
                      </div>

                      {/* Liste de toutes ses notes dans cette matière */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Évaluations enregistrées ({grades.length})
                        </h4>

                        {grades.length > 0 ? (
                          <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                            {grades.map((g, idx) => {
                              const norm = normalizeTo20(g.score, g.maxScore || (g.coef === 2 ? 40 : 20));
                              return (
                                <div key={idx} className="p-3 bg-white flex items-center justify-between">
                                  <div>
                                    <div className="font-bold text-xs text-slate-900">{g.title || `Évaluation ${idx + 1}`}</div>
                                    <div className="text-[10px] text-slate-400">{g.date || '—'} • Coef {g.coef}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className={`text-sm font-black ${
                                      norm >= referenceThreshold ? 'text-emerald-600' : 'text-rose-600'
                                    }`}>
                                      {norm}/20
                                    </div>
                                    {g.maxScore && g.maxScore !== 20 && (
                                      <div className="text-[10px] text-slate-400 font-normal">
                                        ({g.score}/{g.maxScore})
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="py-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                            Aucune note enregistrée pour cet élève en {selectedSubjectName}.
                          </div>
                        )}
                      </div>

                      {/* Bouton pour ouvrir son profil complet dans le Dashboard si disponible */}
                      {onSelectStudent && (
                        <button
                          onClick={() => {
                            onSelectStudent(inspectedStudent);
                            setInspectedStudent(null);
                            if (onNavigate) onNavigate('dashboard');
                          }}
                          className="w-full py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-2xl transition-colors border border-sky-200"
                        >
                          Consulter le dossier complet et le bulletin de cet élève →
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ClassStatisticsPage = StudentsPage;
export default StudentsPage;
