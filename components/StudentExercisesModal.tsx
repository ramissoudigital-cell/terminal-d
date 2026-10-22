import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, BookOpen, CheckCircle2, Circle, Clock, Sparkles, Filter, 
  Search, Eye, EyeOff, Award, ChevronDown, ChevronUp, Printer, 
  Plus, Check, HelpCircle, FileText, BarChart2, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Student } from '../types';
import { 
  ExerciseItem, 
  getExercisesForStudent, 
  getCompletedExerciseIds,
  toggleExerciseCompleted,
  saveCustomExercise,
  deleteCustomExercise
} from '../data/exercisesData';
import { cleanUtf8, isSameSubject } from '../src/utils/encodingUtils';

interface StudentExercisesModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  currentUser?: any;
}

export const StudentExercisesModal: React.FC<StudentExercisesModalProps> = ({
  isOpen,
  onClose,
  student,
  currentUser
}) => {
  const resolvedUser = useMemo(() => {
    if (currentUser) return currentUser;
    try {
      const s = localStorage.getItem('school_user_session') || localStorage.getItem('school_user');
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  }, [currentUser]);

  const isTeacher = useMemo(() => {
    if (!resolvedUser) return false;
    const role = (resolvedUser.role || '').toLowerCase();
    const isStudentOrParent = role === 'student' || role === 'eleve' || role === 'élève' || role === 'parent';
    if (isStudentOrParent) return false;

    return Boolean(
      role === 'teacher' || 
      role === 'professeur' || 
      role === 'prof' || 
      role === 'enseignant' || 
      resolvedUser.accessLevel === 3 || 
      resolvedUser.isTeacher || 
      role === 'director' || 
      role === 'admin' || 
      role === 'superadmin' || 
      resolvedUser.accessLevel === 5
    );
  }, [resolvedUser]);

  const [selectedSubjectTab, setSelectedSubjectTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'todo' | 'done'>('all');
  
  // Track open solution and open hints for exercises
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [revealedSolutions, setRevealedSolutions] = useState<Record<string, boolean>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});

  // Completed IDs from localStorage
  const studentId = student?.id || 'default';
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  // Add exercise modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExerciseForm, setNewExerciseForm] = useState<{
    subject: string;
    title: string;
    chapter: string;
    difficulty: 'Facile' | 'Moyen' | 'Difficile';
    duration: string;
    statement: string;
    hints: string;
    solution: string;
  }>({
    subject: '',
    title: '',
    chapter: '',
    difficulty: 'Moyen',
    duration: '30 min',
    statement: '',
    hints: '',
    solution: ''
  });

  // Modal open/close body locks and navigation events
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

  // Load completed exercises
  const refreshCompleted = () => {
    setCompletedIds(getCompletedExerciseIds(studentId));
  };

  useEffect(() => {
    refreshCompleted();
    const handleProgress = (e: any) => {
      if (!e?.detail?.studentId || e.detail.studentId === studentId) {
        refreshCompleted();
      }
    };
    window.addEventListener('exercises-progress-updated', handleProgress);
    window.addEventListener('exercises-updated', refreshCompleted);
    return () => {
      window.removeEventListener('exercises-progress-updated', handleProgress);
      window.removeEventListener('exercises-updated', refreshCompleted);
    };
  }, [studentId]);

  // Read student's subjects directly from the Student object
  const studentSubjects = useMemo(() => {
    return student?.subjects || [];
  }, [student?.subjects]);

  // Set default subject for new exercise form
  useEffect(() => {
    if (studentSubjects.length > 0 && !newExerciseForm.subject) {
      setNewExerciseForm(prev => ({ ...prev, subject: studentSubjects[0].name }));
    }
  }, [studentSubjects]);

  // Fetch structured exercise list grouped by subject
  const exercisesBySubject = useMemo(() => {
    return getExercisesForStudent(studentSubjects, undefined, student?.class);
  }, [studentSubjects, student?.class]);

  // Flatten and filter exercises according to user options
  const allFilteredExercises = useMemo(() => {
    let list: Array<{ exercise: ExerciseItem; subjectColor: string }> = [];

    exercisesBySubject.forEach(group => {
      if (selectedSubjectTab !== 'all' && !isSameSubject(group.subjectName, selectedSubjectTab)) {
        return;
      }

      group.exercises.forEach(ex => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = ex.title.toLowerCase().includes(q);
          const matchChapter = ex.chapter.toLowerCase().includes(q);
          const matchStatement = ex.statement.toLowerCase().includes(q);
          const matchSubject = ex.subject.toLowerCase().includes(q);
          if (!matchTitle && !matchChapter && !matchStatement && !matchSubject) {
            return;
          }
        }

        // Difficulty filter
        if (selectedDifficulty !== 'all' && ex.difficulty !== selectedDifficulty) {
          return;
        }

        // Status filter
        const isDone = completedIds.includes(ex.id);
        if (statusFilter === 'done' && !isDone) return;
        if (statusFilter === 'todo' && isDone) return;

        list.push({
          exercise: ex,
          subjectColor: group.subjectColor
        });
      });
    });

    return list;
  }, [exercisesBySubject, selectedSubjectTab, searchQuery, selectedDifficulty, statusFilter, completedIds]);

  // Total and completed counts
  const totalCount = useMemo(() => {
    return exercisesBySubject.reduce((acc, g) => acc + g.exercises.length, 0);
  }, [exercisesBySubject]);

  const completedCount = useMemo(() => {
    let count = 0;
    exercisesBySubject.forEach(g => {
      g.exercises.forEach(ex => {
        if (completedIds.includes(ex.id)) count++;
      });
    });
    return count;
  }, [exercisesBySubject, completedIds]);

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleToggle = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    toggleExerciseCompleted(studentId, id);
    refreshCompleted();
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseForm.title.trim() || !newExerciseForm.statement.trim()) {
      return;
    }

    const newEx: ExerciseItem = {
      id: `custom-ex-${Date.now()}`,
      subject: cleanUtf8(newExerciseForm.subject || (studentSubjects[0]?.name || 'Mathématiques')),
      title: cleanUtf8(newExerciseForm.title.trim()),
      chapter: cleanUtf8(newExerciseForm.chapter.trim() || 'Chapitre général'),
      difficulty: newExerciseForm.difficulty,
      duration: cleanUtf8(newExerciseForm.duration || '30 min'),
      statement: cleanUtf8(newExerciseForm.statement.trim()),
      hints: newExerciseForm.hints.trim() ? cleanUtf8(newExerciseForm.hints.trim()) : undefined,
      solution: cleanUtf8(newExerciseForm.solution.trim() || 'Corrigé disponible en classe.'),
      points: 20,
      classLevel: student?.class,
      isCustom: true
    };

    saveCustomExercise(newEx);
    setShowAddModal(false);
    setNewExerciseForm({
      subject: studentSubjects[0]?.name || 'Mathématiques',
      title: '',
      chapter: '',
      difficulty: 'Moyen',
      duration: '30 min',
      statement: '',
      hints: '',
      solution: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Main Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-slate-50 w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-4xl sm:rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden border border-slate-200"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-6 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-300 shadow-inner">
                <BookOpen size={26} strokeWidth={2.2} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Exercices par Matière
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-blue-200/80 font-medium mt-0.5">
                  Banque d'entraînement et sujets d'évaluation pour <span className="font-bold text-white">{student?.name}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all border border-white/20"
                title="Imprimer la sélection"
              >
                <Printer size={15} />
                <span>Imprimer</span>
              </button>
              {isTeacher && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                  title="Ajouter un exercice"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Ajouter</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                title="Fermer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Progress Bar & Stats */}
          <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
                <Award size={16} className="text-amber-400" />
                <span>Progression : <strong className="text-white font-bold">{completedCount}</strong> / {totalCount} validés</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                {progressPercent}%
              </span>
            </div>

            <div className="w-full sm:w-60 bg-white/15 rounded-full h-2.5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-gradient-to-r from-blue-400 to-emerald-400 h-full rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Subjects Selector (Chips extracted directly from student.subjects) */}
        <div className="bg-white border-b border-slate-200 px-4 py-3 shrink-0 overflow-x-auto custom-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => setSelectedSubjectTab('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedSubjectTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Sparkles size={13} />
              <span>Toutes les matières</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {totalCount}
              </span>
            </button>

            {studentSubjects.map((sub, idx) => {
              const isActive = selectedSubjectTab.toLowerCase() === sub.name.toLowerCase();
              return (
                <button
                  key={`sub-${sub.name || 'item'}-${idx}`}
                  onClick={() => setSelectedSubjectTab(sub.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: sub.fill || '#3b82f6' }}
                  />
                  <span>{sub.name}</span>
                  {typeof sub.value === 'number' && (
                    <span className="text-[10px] opacity-75 font-mono">
                      ({sub.value}/20)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-slate-100/80 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, chapitre ou notion..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-white border border-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-xl focus:outline-none text-xs cursor-pointer"
            >
              <option value="all">Toutes difficultés</option>
              <option value="Facile">Facile</option>
              <option value="Moyen">Moyen</option>
              <option value="Difficile">Difficile</option>
            </select>

            {/* Status Filter */}
            <div className="flex bg-white rounded-xl border border-slate-200 p-0.5">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  statusFilter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setStatusFilter('todo')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  statusFilter === 'todo' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                À faire
              </button>
              <button
                onClick={() => setStatusFilter('done')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                  statusFilter === 'done' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Faits
              </button>
            </div>
          </div>
        </div>

        {/* Exercises List (Scrollable Area) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {totalCount === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm max-w-md mx-auto my-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <FileText size={30} />
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">
                Aucun exercice enregistré
              </h3>
              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                Tous les exercices par défaut ont été supprimés. Vous pouvez créer de nouveaux exercices et devoirs personnalisés à tout moment.
              </p>
              {isTeacher ? (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>Créer un exercice</span>
                </button>
              ) : (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-3.5 py-2 rounded-xl">
                  <span>Seul le professeur peut publier un exercice</span>
                </div>
              )}
            </div>
          ) : allFilteredExercises.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-sm max-w-md mx-auto my-8">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <FileText size={30} />
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-1">
                Aucun exercice trouvé
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Aucun sujet ne correspond à vos filtres actuels. Essayez de modifier vos critères de recherche.
              </p>
              <button
                onClick={() => {
                  setSelectedSubjectTab('all');
                  setSearchQuery('');
                  setSelectedDifficulty('all');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            allFilteredExercises.map(({ exercise, subjectColor }, idx) => {
              const isCompleted = completedIds.includes(exercise.id);
              const isExpanded = expandedExerciseId === exercise.id;
              const isSolutionShown = revealedSolutions[exercise.id] || false;
              const isHintShown = revealedHints[exercise.id] || false;

              // Difficulty color badge
              const diffBadge = {
                Facile: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                Moyen: 'bg-amber-50 text-amber-700 border-amber-200',
                Difficile: 'bg-rose-50 text-rose-700 border-rose-200'
              }[exercise.difficulty];

              return (
                <div
                  key={`ex-${exercise.id || 'card'}-${idx}`}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
                    isCompleted
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {/* Exercise Card Header */}
                  <div
                    onClick={() => setExpandedExerciseId(isExpanded ? null : exercise.id)}
                    className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {/* Interactive completion button */}
                      <button
                        onClick={(e) => handleToggle(exercise.id, e)}
                        className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                          isCompleted
                            ? 'bg-emerald-500 text-white shadow-xs scale-105'
                            : 'border-2 border-slate-300 hover:border-emerald-500 text-transparent hover:text-emerald-500'
                        }`}
                        title={isCompleted ? "Marquer comme non fait" : "Marquer comme terminé"}
                      >
                        <Check size={14} strokeWidth={3} />
                      </button>

                      <div className="min-w-0">
                        {/* Tags Row */}
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span
                            className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full text-white tracking-wider"
                            style={{ backgroundColor: subjectColor }}
                          >
                            {exercise.subject}
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diffBadge}`}>
                            {exercise.difficulty}
                          </span>

                          {exercise.duration && (
                            <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                              <Clock size={11} />
                              <span>{exercise.duration}</span>
                            </span>
                          )}

                          {exercise.chapter && (
                            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">
                              • {exercise.chapter}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className={`text-sm sm:text-base font-bold leading-snug ${
                          isCompleted ? 'text-emerald-950 line-through opacity-80' : 'text-slate-900'
                        }`}>
                          {exercise.title}
                        </h4>
                      </div>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isTeacher && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCustomExercise(exercise.id);
                          }}
                          className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Supprimer cet exercice"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                      <span className="hidden sm:inline-block text-[11px] font-bold text-slate-400">
                        {isExpanded ? 'Réduire' : 'Détails & Corrigé'}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Body: Statement, Hints, Solution */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-slate-100 bg-slate-50/80 px-4 sm:px-6 py-4 space-y-4"
                      >
                        {/* Statement (Énoncé) */}
                        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText size={16} className="text-blue-600" />
                            <h5 className="text-xs font-black uppercase tracking-wider text-slate-800">
                              Énoncé de l'exercice
                            </h5>
                          </div>
                          <div className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed font-normal">
                            {exercise.statement}
                          </div>
                        </div>

                        {/* Hints Accordion (Rappel de cours) */}
                        {exercise.hints && (
                          <div className="bg-amber-50/70 rounded-xl p-3.5 border border-amber-200">
                            <button
                              onClick={() => setRevealedHints(prev => ({ ...prev, [exercise.id]: !isHintShown }))}
                              className="w-full flex items-center justify-between text-left text-xs font-bold text-amber-900"
                            >
                              <div className="flex items-center gap-2">
                                <HelpCircle size={15} className="text-amber-600" />
                                <span>Indice & Rappel méthodologique</span>
                              </div>
                              <span className="text-[11px] underline">
                                {isHintShown ? 'Masquer' : 'Afficher l\'indice'}
                              </span>
                            </button>

                            {isHintShown && (
                              <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 text-xs text-amber-900/90 leading-relaxed pt-2 border-t border-amber-200/80"
                              >
                                {exercise.hints}
                              </motion.div>
                            )}
                          </div>
                        )}

                        {/* Solution / Corrigé */}
                        <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200">
                          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 size={16} className="text-emerald-600" />
                              <h5 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                                Corrigé indicatif & Explication
                              </h5>
                            </div>

                            <button
                              onClick={() => setRevealedSolutions(prev => ({ ...prev, [exercise.id]: !isSolutionShown }))}
                              className="px-3 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                            >
                              {isSolutionShown ? <EyeOff size={13} /> : <Eye size={13} />}
                              <span>{isSolutionShown ? 'Masquer le corrigé' : 'Afficher le corrigé'}</span>
                            </button>
                          </div>

                          {isSolutionShown ? (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs sm:text-sm text-emerald-950/90 whitespace-pre-line leading-relaxed pt-2 border-t border-emerald-200/80 font-mono bg-white/70 p-3 rounded-lg"
                            >
                              {exercise.solution}
                            </motion.div>
                          ) : (
                            <p className="text-[11px] text-emerald-800/70 italic">
                              Prenez le temps de résoudre l'exercice sur votre cahier avant de consulter la solution détaillée.
                            </p>
                          )}
                        </div>

                        {/* Bottom action inside expanded card */}
                        <div className="flex items-center justify-between pt-1">
                          <button
                            onClick={() => handleToggle(exercise.id)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                              isCompleted
                                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                            }`}
                          >
                            <Check size={14} />
                            <span>{isCompleted ? 'Marquer comme non fait' : 'Valider comme fait'}</span>
                          </button>

                          <span className="text-[11px] text-slate-400 font-medium">
                            Barème indicatif : 20 points
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 p-3.5 sm:p-4 px-6 flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <BarChart2 size={15} className="text-blue-600" />
            <span>Matières réelles issues du relevé de <strong>{student?.name || 'l\'élève'}</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
          >
            Fermer
          </button>
        </div>
      </motion.div>

      {/* Add Custom Exercise Dialog */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setShowAddModal(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl relative z-10 border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Plus size={18} />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Ajouter un exercice d'entraînement
                  </h3>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Matière</label>
                  <select
                    value={newExerciseForm.subject}
                    onChange={(e) => setNewExerciseForm({ ...newExerciseForm, subject: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {studentSubjects.map(sub => (
                      <option key={sub.name} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Titre de l'exercice</label>
                  <input
                    type="text"
                    required
                    value={newExerciseForm.title}
                    onChange={(e) => setNewExerciseForm({ ...newExerciseForm, title: e.target.value })}
                    placeholder="Ex: Étude de fonction trigonométrique"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Difficulté</label>
                    <select
                      value={newExerciseForm.difficulty}
                      onChange={(e) => setNewExerciseForm({ ...newExerciseForm, difficulty: e.target.value as any })}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                    >
                      <option value="Facile">Facile</option>
                      <option value="Moyen">Moyen</option>
                      <option value="Difficile">Difficile</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Durée estimée</label>
                    <input
                      type="text"
                      value={newExerciseForm.duration}
                      onChange={(e) => setNewExerciseForm({ ...newExerciseForm, duration: e.target.value })}
                      placeholder="Ex: 30 min"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Énoncé complet</label>
                  <textarea
                    required
                    rows={3}
                    value={newExerciseForm.statement}
                    onChange={(e) => setNewExerciseForm({ ...newExerciseForm, statement: e.target.value })}
                    placeholder="Tapez ici les consignes ou questions de l'exercice..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Corrigé indicatif</label>
                  <textarea
                    rows={2}
                    value={newExerciseForm.solution}
                    onChange={(e) => setNewExerciseForm({ ...newExerciseForm, solution: e.target.value })}
                    placeholder="Solution ou étapes de résolution..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
