import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, CheckCircle2, Circle, BookOpen, AlertCircle, FileText, 
  ArrowLeft, ChevronRight, Calendar, Clock, Plus, Sparkles, 
  Search, Check, Trash2, Award, User, GraduationCap, Flame,
  Camera, Image as ImageIcon, Maximize2, Eye, Download, UploadCloud, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getSubjectsForClass } from '../types';
import { getTeacherForSubject } from './SchedulePage';
import { mockTeachers } from '../data/mockData';
import { 
  ClassExercise, 
  getExercisesForClass, 
  saveExerciseToClass, 
  deleteExerciseFromClass, 
  getCompletedExerciseIds, 
  setCompletedExerciseIds,
  getStudentExercisePhotos,
  saveStudentExercisePhoto,
  deleteStudentExercisePhoto
} from '../data/exercisesData';
import { cleanUtf8, isSameSubject } from '../src/utils/encodingUtils';
import { saveRealtimeDocument, deleteRealtimeDocument, subscribeToRealtimeCollection } from '../src/services/firebaseService';

interface StudentSuppliesModalProps {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  studentId?: string | number;
  studentName?: string;
  currentUser?: any;
}

const compressImage = (file: File, maxWidth = 1000, quality = 0.75): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(event.target?.result as string);
    };
    reader.onerror = () => resolve('');
  });
};

const getSubjectTheme = (subject: string) => {
  const s = (subject || '').toLowerCase();
  if (s.includes('math')) return { 
    color: 'text-sky-600', 
    bg: 'bg-sky-50', 
    border: 'border-sky-200', 
    badge: 'bg-sky-500', 
    bar: 'bg-sky-600',
    light: 'bg-sky-100/70 text-sky-800'
  };
  if (s.includes('fran')) return { 
    color: 'text-indigo-600', 
    bg: 'bg-indigo-50', 
    border: 'border-indigo-200', 
    badge: 'bg-indigo-500', 
    bar: 'bg-indigo-600',
    light: 'bg-indigo-100/70 text-indigo-800'
  };
  if (s.includes('anglais')) return { 
    color: 'text-blue-600', 
    bg: 'bg-blue-50', 
    border: 'border-blue-200', 
    badge: 'bg-blue-600', 
    bar: 'bg-blue-600',
    light: 'bg-blue-100/70 text-blue-800'
  };
  if (s.includes('phys')) return { 
    color: 'text-amber-600', 
    bg: 'bg-amber-50', 
    border: 'border-amber-200', 
    badge: 'bg-amber-500', 
    bar: 'bg-amber-600',
    light: 'bg-amber-100/70 text-amber-800'
  };
  if (s.includes('svt') || s.includes('bio') || s.includes('scien')) return { 
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200', 
    badge: 'bg-emerald-500', 
    bar: 'bg-emerald-600',
    light: 'bg-emerald-100/70 text-emerald-800'
  };
  if (s.includes('hist') || s.includes('géo')) return { 
    color: 'text-orange-600', 
    bg: 'bg-orange-50', 
    border: 'border-orange-200', 
    badge: 'bg-orange-500', 
    bar: 'bg-orange-600',
    light: 'bg-orange-100/70 text-orange-800'
  };
  if (s.includes('philo')) return { 
    color: 'text-purple-600', 
    bg: 'bg-purple-50', 
    border: 'border-purple-200', 
    badge: 'bg-purple-600', 
    bar: 'bg-purple-600',
    light: 'bg-purple-100/70 text-purple-800'
  };
  if (s.includes('info')) return { 
    color: 'text-cyan-600', 
    bg: 'bg-cyan-50', 
    border: 'border-cyan-200', 
    badge: 'bg-cyan-600', 
    bar: 'bg-cyan-600',
    light: 'bg-cyan-100/70 text-cyan-800'
  };
  if (s.includes('espagnol') || s.includes('allemand')) return { 
    color: 'text-rose-600', 
    bg: 'bg-rose-50', 
    border: 'border-rose-200', 
    badge: 'bg-rose-500', 
    bar: 'bg-rose-600',
    light: 'bg-rose-100/70 text-rose-800'
  };
  if (s.includes('art')) return { 
    color: 'text-pink-600', 
    bg: 'bg-pink-50', 
    border: 'border-pink-200', 
    badge: 'bg-pink-500', 
    bar: 'bg-pink-600',
    light: 'bg-pink-100/70 text-pink-800'
  };
  if (s.includes('musique')) return { 
    color: 'text-violet-600', 
    bg: 'bg-violet-50', 
    border: 'border-violet-200', 
    badge: 'bg-violet-500', 
    bar: 'bg-violet-600',
    light: 'bg-violet-100/70 text-violet-800'
  };
  if (s.includes('eps') || s.includes('sport')) return { 
    color: 'text-emerald-700', 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-200', 
    badge: 'bg-emerald-600', 
    bar: 'bg-emerald-600',
    light: 'bg-emerald-100/70 text-emerald-800'
  };
  if (s.includes('conduite')) return { 
    color: 'text-emerald-800', 
    bg: 'bg-emerald-50', 
    border: 'border-emerald-300', 
    badge: 'bg-emerald-600', 
    bar: 'bg-emerald-600',
    light: 'bg-emerald-100/80 text-emerald-900'
  };
  return { 
    color: 'text-slate-700', 
    bg: 'bg-slate-50', 
    border: 'border-slate-200', 
    badge: 'bg-slate-700', 
    bar: 'bg-slate-800',
    light: 'bg-slate-100/70 text-slate-800'
  };
};

export const StudentSuppliesModal: React.FC<StudentSuppliesModalProps> = ({
  isOpen,
  onClose,
  className: initialClassName,
  studentId = 'default',
  studentName,
  currentUser
}) => {
  const [activeClass, setActiveClass] = useState<string>(initialClassName || 'Terminale D');

  useEffect(() => {
    if (initialClassName) {
      setActiveClass(initialClassName);
    }
  }, [initialClassName]);

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

  const [exercises, setExercises] = useState<ClassExercise[]>([]);
  const [completedIds, setCompletedIds] = useState<string[]>(() => getCompletedExerciseIds(studentId));
  const [studentPhotos, setStudentPhotos] = useState<Record<string, string>>(() => getStudentExercisePhotos(studentId));
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Lightbox preview modal state
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  // Add exercise modal / inline form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueDate, setNewDueDate] = useState('Vendredi prochain');
  const [newType, setNewType] = useState<'Devoir Maison' | 'Exercice de cours' | 'Travaux Dirigés (TD)' | 'Révision / Examen'>('Devoir Maison');
  const [newImageUrl, setNewImageUrl] = useState<string>('');

  // Load exercises & photos
  const loadExercises = () => {
    if (activeClass) {
      const list = getExercisesForClass(activeClass);
      setExercises(list);
    }
  };

  const loadPhotos = () => {
    setStudentPhotos(getStudentExercisePhotos(studentId));
  };

  useEffect(() => {
    if (isOpen) {
      loadExercises();
      loadPhotos();
      setCompletedIds(getCompletedExerciseIds(studentId));
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: true } }));
      window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: true } }));
    } else {
      setSelectedSubject(null);
      setShowAddForm(false);
      setPreviewPhoto(null);
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: false } }));
      window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: false } }));
    }

    return () => {
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: false } }));
      window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: false } }));
    };
  }, [isOpen, activeClass, studentId]);

  useEffect(() => {
    const handleUpdate = () => {
      loadExercises();
    };
    const handlePhotoUpdate = () => {
      loadPhotos();
    };
    window.addEventListener('exercises-updated', handleUpdate);
    window.addEventListener('supplies-updated', handleUpdate);
    window.addEventListener('student-exercise-photo-updated', handlePhotoUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('exercises-updated', handleUpdate);
      window.removeEventListener('supplies-updated', handleUpdate);
      window.removeEventListener('student-exercise-photo-updated', handlePhotoUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [activeClass, studentId]);

  // Toggle exercise completion
  const handleToggleExercise = (exerciseId: string) => {
    setCompletedIds(prev => {
      const updated = prev.includes(exerciseId) 
        ? prev.filter(id => id !== exerciseId) 
        : [...prev, exerciseId];
      setCompletedExerciseIds(studentId, updated);
      return updated;
    });
  };

  const handleFileSelected = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        compressImage(file, 1000, 0.75).then(resolve).catch(reject);
      } else {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }
    });
  };

  // Upload student photo for an exercise
  const handleStudentPhotoSelected = async (exerciseId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await handleFileSelected(file);
      if (dataUrl) {
        saveStudentExercisePhoto(studentId, exerciseId, dataUrl);
        setStudentPhotos(prev => ({ ...prev, [exerciseId]: dataUrl }));
      }
    } catch (err) {
      console.error("Erreur enregistrement fichier:", err);
    }
    // reset input
    e.target.value = '';
  };

  // Delete student photo for an exercise
  const handleDeleteStudentPhoto = (exerciseId: string) => {
    deleteStudentExercisePhoto(studentId, exerciseId);
    setStudentPhotos(prev => {
      const copy = { ...prev };
      delete copy[exerciseId];
      return copy;
    });
  };

  // Upload teacher photo in new exercise form
  const handleTeacherPhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await handleFileSelected(file);
      if (dataUrl) {
        setNewImageUrl(dataUrl);
      }
    } catch (err) {
      console.error("Erreur fichier prof:", err);
    }
    e.target.value = '';
  };

  // Add exercise handler
  const handleCreateExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTeacher) {
      alert("Seuls les professeurs peuvent publier un exercice.");
      return;
    }
    if (!newTitle.trim() || !selectedSubject) return;

    const teacher = resolvedUser?.name || getTeacherForSubject(selectedSubject, mockTeachers, activeClass).name;
    const newEx: ClassExercise = {
      id: `ex-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      className: cleanUtf8(activeClass),
      subject: cleanUtf8(selectedSubject),
      title: cleanUtf8(newTitle.trim()),
      description: cleanUtf8(newDescription.trim() || 'Consignes du professeur : traiter les questions et préparer la restitution.'),
      teacherName: teacher,
      dueDate: cleanUtf8(newDueDate || 'À rendre sous peu'),
      type: newType,
      isMandatory: true,
      points: 20,
      imageUrl: newImageUrl || undefined,
      createdAt: new Date().toISOString()
    };

    saveExerciseToClass(newEx);
    setExercises(prev => [newEx, ...prev.filter(e => e.id !== newEx.id)]);
    setNewTitle('');
    setNewDescription('');
    setNewImageUrl('');
    setShowAddForm(false);
  };

  // Delete exercise handler
  const handleDeleteExercise = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!isTeacher) {
      alert("Seuls les enseignants peuvent supprimer un exercice.");
      return;
    }
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet exercice ?")) {
      deleteExerciseFromClass(id, activeClass);
      deleteStudentExercisePhoto(studentId, id);
      setExercises(prev => prev.filter(e => e.id !== id));
    }
  };

  // All subjects for this class
  const classSubjects = useMemo(() => {
    return getSubjectsForClass(activeClass || 'Seconde C1');
  }, [activeClass]);

  // Filtered subjects based on search
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return classSubjects;
    return classSubjects.filter(sub => 
      sub.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [classSubjects, searchQuery]);

  // Total exercises & completed counts
  const totalCount = exercises.length;
  const acquiredCount = exercises.filter(ex => completedIds.includes(ex.id)).length;
  const progressPercent = totalCount > 0 ? Math.round((acquiredCount / totalCount) * 100) : 0;

  // Exercises for currently selected subject
  const subjectExercises = useMemo(() => {
    if (!selectedSubject) return [];
    return exercises.filter(ex => 
      isSameSubject(ex.subject, selectedSubject)
    );
  }, [exercises, selectedSubject]);

  const subjectCompletedCount = subjectExercises.filter(ex => completedIds.includes(ex.id)).length;
  const subjectProgressPercent = subjectExercises.length > 0 
    ? Math.round((subjectCompletedCount / subjectExercises.length) * 100) 
    : 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex flex-col justify-end md:justify-center items-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="bg-white rounded-t-[2.5rem] md:rounded-3xl w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] shadow-2xl relative flex flex-col overflow-hidden z-10"
        >
          {/* Top Handle for mobile */}
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1 md:hidden shrink-0" />

          {/* Header */}
          <div className="p-4 sm:p-5 pb-3 border-b border-gray-100 flex justify-between items-center shrink-0 bg-white text-slate-800">
            <div className="min-w-0 flex-1 mr-3 flex items-center gap-3">
              {selectedSubject && (
                <button
                  onClick={() => {
                    setSelectedSubject(null);
                    setShowAddForm(false);
                  }}
                  className="p-2 -ml-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
                  title="Retour à toutes les matières"
                >
                  <ArrowLeft size={18} />
                </button>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-xl font-black text-slate-900 truncate flex items-center gap-2">
                    <FileText className="w-5 h-5 text-sky-600 shrink-0" />
                    <span>{selectedSubject ? selectedSubject : "Exercices & Devoirs"}</span>
                  </h2>
                </div>
                <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">
                  {selectedSubject 
                    ? `Exercices déposés par l'enseignant • ${getTeacherForSubject(selectedSubject, mockTeachers, activeClass).name}`
                    : "Sélectionnez une matière pour consulter les exercices assignés"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {selectedSubject && isTeacher && (
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-black bg-sky-600 hover:bg-sky-700 text-white px-3 py-1.5 rounded-xl shadow-xs transition-colors"
                >
                  <Plus size={15} />
                  <span>Ajouter</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* MAIN BODY: 2-Level Views */}
          <div className="p-4 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
            <AnimatePresence mode="wait">
              {/* LEVEL 1: LISTE DE TOUTES LES MATIÈRES */}
              {!selectedSubject ? (
                <motion.div
                  key="subjects-list"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Rechercher une matière (ex: Mathématiques, Français)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {/* Grid of Subjects */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                    {filteredSubjects.map((subject) => {
                      const theme = getSubjectTheme(subject);
                      const subExercises = exercises.filter(ex => 
                        isSameSubject(ex.subject, subject)
                      );
                      const subCompleted = subExercises.filter(ex => completedIds.includes(ex.id)).length;
                      const teacher = getTeacherForSubject(subject, mockTeachers, activeClass);
                      const subPercent = subExercises.length > 0 
                        ? Math.round((subCompleted / subExercises.length) * 100) 
                        : 0;

                      return (
                        <div
                          key={subject}
                          onClick={() => {
                            setSelectedSubject(subject);
                            setShowAddForm(false);
                          }}
                          className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-sky-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className={`w-10 h-10 rounded-xl ${theme.bg} ${theme.color} flex items-center justify-center shrink-0 border ${theme.border} shadow-2xs`}>
                                <BookOpen size={20} />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-black text-sm sm:text-base text-slate-900 group-hover:text-sky-600 transition-colors truncate">
                                  {subject}
                                </h3>
                                <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                                  <GraduationCap size={12} className="text-slate-400 shrink-0" />
                                  <span className="truncate">{teacher.name}</span>
                                </p>
                              </div>
                            </div>

                            <span className="p-1.5 rounded-full bg-slate-50 text-slate-400 group-hover:text-sky-600 group-hover:bg-sky-50 transition-colors shrink-0">
                              <ChevronRight size={16} />
                            </span>
                          </div>

                          {/* Subject Exercise Stats */}
                          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500">
                              {subExercises.length} exercice{subExercises.length > 1 ? 's' : ''}
                            </span>
                            
                            <div className="flex items-center gap-2">
                              {subExercises.length > 0 && subCompleted === subExercises.length ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <Check size={12} />
                                  <span>Tous validés !</span>
                                </span>
                              ) : (
                                <span className="text-[11px] font-black text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                                  {subCompleted} / {subExercises.length} fait{subCompleted > 1 ? 's' : ''} ({subPercent}%)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                /* LEVEL 2: PAGE DES EXERCICES DE LA MATIÈRE SÉLECTIONNÉE */
                <motion.div
                  key="subject-exercises"
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {/* Subject Overview Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-lg text-slate-900">{selectedSubject}</h3>
                          <span className="text-xs font-black bg-white/80 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded-full">
                            {subjectExercises.length} exercice{subjectExercises.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-600 mt-0.5 flex items-center gap-1">
                          <GraduationCap size={13} className="text-sky-600 shrink-0" />
                          <span>Professeur : {getTeacherForSubject(selectedSubject, mockTeachers, activeClass).name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-500 block">Progression matière</span>
                        <span className="text-sm font-black text-sky-700">
                          {subjectCompletedCount} / {subjectExercises.length} ({subjectProgressPercent}%)
                        </span>
                      </div>
                      {isTeacher && (
                        <button
                          onClick={() => setShowAddForm(!showAddForm)}
                          className="sm:hidden flex items-center gap-1 text-xs font-black bg-sky-600 text-white px-3 py-1.5 rounded-xl shadow-xs"
                        >
                          <Plus size={14} />
                          <span>Ajouter</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Add Exercise Inline Form (if open) */}
                  {showAddForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      onSubmit={handleCreateExercise}
                      className="p-4 rounded-2xl bg-white border-2 border-sky-300 shadow-md space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                          <Plus size={16} className="text-sky-600" />
                          <span>Nouvel exercice pour {selectedSubject}</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Titre de l'exercice *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Devoir Maison n°4 : Dérivation et limites"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-sky-500 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Type d'exercice</label>
                          <select
                            value={newType}
                            onChange={(e: any) => setNewType(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-sky-500 outline-none"
                          >
                            <option value="Devoir Maison">Devoir Maison</option>
                            <option value="Exercice de cours">Exercice de cours</option>
                            <option value="Travaux Dirigés (TD)">Travaux Dirigés (TD)</option>
                            <option value="Révision / Examen">Révision / Examen</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">Date d'échéance</label>
                          <input
                            type="text"
                            placeholder="Ex: Vendredi 24 Octobre"
                            value={newDueDate}
                            onChange={(e) => setNewDueDate(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-sky-500 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Instructions & consignes</label>
                        <textarea
                          rows={2}
                          placeholder="Consignes données par l'enseignant pour les élèves..."
                          value={newDescription}
                          onChange={(e) => setNewDescription(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:border-sky-500 outline-none resize-none"
                        />
                      </div>

                      {/* Photo Attachment by Teacher */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Photo de l'énoncé ou du tableau (optionnel)</label>
                        {newImageUrl ? (
                          <div className="relative w-fit">
                            <img 
                              src={newImageUrl} 
                              alt="Aperçu énoncé" 
                              className="h-24 w-36 object-cover rounded-xl border border-slate-200 shadow-xs cursor-pointer"
                              onClick={() => setPreviewPhoto({ url: newImageUrl, title: 'Aperçu photo exercice' })}
                            />
                            <button
                              type="button"
                              onClick={() => setNewImageUrl('')}
                              className="absolute -top-2 -right-2 p-1 bg-rose-500 text-white rounded-full shadow-sm hover:bg-rose-600"
                              title="Supprimer la photo"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ) : (
                          <label className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer text-xs font-bold text-slate-700 transition-colors">
                            <Camera size={16} className="text-sky-600" />
                            <span>Prendre / Choisir une photo</span>
                            <input 
                              type="file" 
                              accept="image/*,.pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
                              onChange={handleTeacherPhotoSelected} 
                              className="hidden" 
                            />
                          </label>
                        )}
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-xs"
                        >
                          Enregistrer l'exercice
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* List of Exercises for this subject */}
                  {subjectExercises.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <FileText size={22} />
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">Aucun exercice pour le moment</h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                        Le professeur de {selectedSubject} n'a pas encore publié d'exercice pour cette classe.
                      </p>
                      {isTeacher ? (
                        <button
                          onClick={() => setShowAddForm(true)}
                          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold bg-sky-600 text-white px-3.5 py-2 rounded-xl shadow-xs hover:bg-sky-700 transition-colors"
                        >
                          <Plus size={14} />
                          <span>Créer le premier exercice</span>
                        </button>
                      ) : (
                        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                          <Lock size={13} className="text-slate-400" />
                          <span>Seul le professeur peut publier un exercice</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {subjectExercises.map((exercise) => {
                        const isDone = completedIds.includes(exercise.id);
                        const studentPhoto = studentPhotos[exercise.id];

                        return (
                          <div
                            key={exercise.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3.5 ${
                              isDone
                                ? 'bg-emerald-50/40 border-emerald-200/80 shadow-2xs'
                                : 'bg-white border-slate-200 shadow-xs hover:border-sky-300'
                            }`}
                          >
                            <div>
                              {/* Top Tags row */}
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[10.5px] font-black px-2.5 py-0.5 rounded-md ${
                                    exercise.type === 'Devoir Maison' 
                                      ? 'bg-purple-100 text-purple-800' 
                                      : exercise.type === 'Travaux Dirigés (TD)'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-sky-100 text-sky-800'
                                  }`}>
                                    {exercise.type}
                                  </span>

                                  {exercise.dueDate && (
                                    <span className="text-[10.5px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                      <Clock size={11} className="text-slate-400" />
                                      <span>À rendre : {exercise.dueDate}</span>
                                    </span>
                                  )}
                                </div>

                                {isTeacher && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteExercise(e, exercise.id)}
                                    className="text-gray-300 hover:text-rose-500 transition-colors p-1"
                                    title="Supprimer cet exercice"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>

                              {/* Title */}
                              <h4 className={`font-black text-sm sm:text-base leading-snug ${
                                isDone ? 'text-slate-600 line-through' : 'text-slate-900'
                              }`}>
                                {exercise.title}
                              </h4>

                              {/* Chapter */}
                              {exercise.chapter && (
                                <p className="text-[11px] font-bold text-sky-700 mt-1">
                                  {exercise.chapter}
                                </p>
                              )}

                              {/* Description / Instructions */}
                              <p className={`text-xs mt-1.5 leading-relaxed ${
                                isDone ? 'text-slate-400' : 'text-slate-600'
                              }`}>
                                {exercise.description}
                              </p>

                              {/* Teacher's Attached Photo (if any) */}
                              {exercise.imageUrl && (
                                <div className="mt-3 p-2 bg-slate-50 border border-slate-200/90 rounded-xl flex items-center gap-3">
                                  <img 
                                    src={exercise.imageUrl} 
                                    alt="Énoncé du professeur" 
                                    className="w-14 h-14 object-cover rounded-lg border border-slate-200 cursor-pointer shadow-2xs hover:opacity-90"
                                    onClick={() => setPreviewPhoto({ url: exercise.imageUrl!, title: `Énoncé : ${exercise.title}` })}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[11px] font-black text-slate-800 flex items-center gap-1">
                                      <ImageIcon size={13} className="text-sky-600" />
                                      <span>Document / Photo de l'énoncé</span>
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => setPreviewPhoto({ url: exercise.imageUrl!, title: `Énoncé : ${exercise.title}` })}
                                      className="text-[10.5px] font-bold text-sky-600 hover:underline flex items-center gap-0.5 mt-0.5"
                                    >
                                      <Eye size={12} />
                                      <span>Agrandir la photo</span>
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Student's Attached Homework Photo Section */}
                              <div className="mt-3 pt-3 border-t border-slate-100">
                                {studentPhoto ? (
                                  <div className="p-2.5 bg-sky-50/60 border border-sky-100 rounded-xl flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <div className="relative group shrink-0">
                                        <img 
                                          src={studentPhoto} 
                                          alt="Photo de mon travail" 
                                          className="w-14 h-14 object-cover rounded-xl border border-sky-200 shadow-xs cursor-pointer"
                                          onClick={() => setPreviewPhoto({ url: studentPhoto, title: `Mon devoir : ${exercise.title}` })}
                                        />
                                        <button
                                          type="button"
                                          onClick={() => setPreviewPhoto({ url: studentPhoto, title: `Mon devoir : ${exercise.title}` })}
                                          className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                        >
                                          <Maximize2 size={16} />
                                        </button>
                                      </div>

                                      <div className="min-w-0">
                                        <span className="text-xs font-black text-sky-900 flex items-center gap-1">
                                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                                          <span className="truncate">Photo de mon devoir ajoutée</span>
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => setPreviewPhoto({ url: studentPhoto, title: `Mon devoir : ${exercise.title}` })}
                                          className="text-[11px] font-bold text-sky-700 hover:underline flex items-center gap-1 mt-0.5"
                                        >
                                          <Eye size={12} />
                                          <span>Voir en grand</span>
                                        </button>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <label className="p-2 bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl cursor-pointer text-xs font-bold transition-colors shadow-2xs" title="Changer la photo">
                                        <Camera size={14} />
                                        <input 
                                          type="file" 
                                          accept="image/*" 
                                          onChange={(e) => handleStudentPhotoSelected(exercise.id, e)} 
                                          className="hidden" 
                                        />
                                      </label>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteStudentPhoto(exercise.id)}
                                        className="p-2 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold transition-colors shadow-2xs"
                                        title="Supprimer la photo"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-xl cursor-pointer text-xs font-bold text-slate-700 hover:text-sky-700 transition-colors shadow-2xs">
                                      <Camera size={15} className="text-sky-600" />
                                      <span>Ajouter une photo de mon devoir</span>
                                      <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => handleStudentPhotoSelected(exercise.id, e)} 
                                        className="hidden" 
                                      />
                                    </label>
                                    <span className="text-[10.5px] font-bold text-slate-400 hidden sm:inline">
                                      Copie ou brouillon
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Checkbox Action Button */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <button
                                type="button"
                                onClick={() => handleToggleExercise(exercise.id)}
                                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                  isDone
                                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 active:scale-95'
                                    : 'bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-300 active:scale-95'
                                }`}
                              >
                                {isDone ? (
                                  <>
                                    <CheckCircle2 size={17} className="text-white shrink-0" />
                                    <span>Exercice validé !</span>
                                  </>
                                ) : (
                                  <>
                                    <Circle size={17} className="text-slate-400 shrink-0" />
                                    <span>Cocher l'exercice (terminé)</span>
                                  </>
                                )}
                              </button>

                              <span className="text-[11px] font-bold text-slate-400">
                                {exercise.isMandatory ? 'Note comptant pour la moyenne' : 'Exercice d\'entraînement'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Slim Progress Bar at the very bottom */}
          <div className="p-3 bg-slate-50 border-t border-slate-200/80 flex flex-col gap-2 shrink-0">
            {selectedSubject && (
              <div className="flex items-center justify-start">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubject(null);
                    setShowAddForm(false);
                  }}
                  className="flex items-center gap-1.5 text-xs font-black text-sky-700 hover:text-sky-800 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-sky-50 transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Voir toutes les matières</span>
                </button>
              </div>
            )}

            <div className="bg-sky-50/70 border border-sky-100/80 px-3 py-2 rounded-xl flex flex-col gap-1">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-700">
                <span className="flex items-center gap-1">
                  <Award size={13} className="text-sky-600" />
                  <span>Progression globale</span>
                </span>
                <span className="text-sky-700 font-extrabold">
                  {acquiredCount} / {totalCount} validés ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-sky-500 to-sky-600 h-full rounded-full"
                  initial={false}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      <AnimatePresence>
        {previewPhoto && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setPreviewPhoto(null)}
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-3 sm:p-4 flex flex-col items-center shadow-2xl z-20 overflow-hidden"
            >
              {/* Lightbox Header */}
              <div className="w-full flex items-center justify-between gap-3 pb-3 border-b border-slate-800 text-white">
                <span className="text-xs sm:text-sm font-bold text-slate-200 truncate flex items-center gap-2">
                  <ImageIcon size={16} className="text-sky-400" />
                  <span>{previewPhoto.title}</span>
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={previewPhoto.url}
                    download="exercice-photo.jpg"
                    className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Télécharger l'image"
                  >
                    <Download size={16} />
                  </a>
                  <button
                    onClick={() => setPreviewPhoto(null)}
                    className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Lightbox Image Preview */}
              <div className="mt-3 flex-1 overflow-auto max-h-[75vh] flex items-center justify-center">
                <img
                  src={previewPhoto.url}
                  alt={previewPhoto.title}
                  className="max-h-full max-w-full object-contain rounded-2xl shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
};
