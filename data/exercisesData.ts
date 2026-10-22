import { cleanUtf8, cleanObjectUtf8, isSameSubject } from '../src/utils/encodingUtils';
import { saveRealtimeDocument, deleteRealtimeDocument } from '../src/services/firebaseService';

export interface ClassExercise {
  id: string;
  className: string;
  subject: string;
  title: string;
  description: string;
  teacherName?: string;
  dueDate?: string;
  type: 'Devoir Maison' | 'Exercice de cours' | 'Travaux Dirigés (TD)' | 'Révision / Examen';
  chapter?: string;
  isMandatory?: boolean;
  points?: number;
  imageUrl?: string;
  createdAt?: string;
}

export interface ExerciseItem {
  id: string;
  subject: string;
  title: string;
  chapter: string;
  difficulty: 'Facile' | 'Moyen' | 'Difficile';
  duration: string;
  statement: string;
  hints?: string;
  solution: string;
  points?: number;
  classLevel?: string;
  isCustom?: boolean;
}

// Detect strictly hardcoded legacy mock exercises without touching custom/teacher exercises
export const isMockDefaultExercise = (id: string): boolean => {
  if (!id) return false;
  // Always preserve custom and user/teacher created exercises
  if (
    id.includes('custom') || 
    id.includes('prof') || 
    id.includes('user') || 
    id.startsWith('prof-ex-') || 
    id.startsWith('custom-ex-') ||
    id.startsWith('ex-custom-')
  ) {
    return false;
  }
  return id.startsWith('mock-') || id.startsWith('cat-') || id.startsWith('auto-') || /^ex-(math|fran|ang|phys|svt|hg|philo|info|esp|all|eps|art|mus)-\d+/i.test(id);
};

// Clean up and repair any corrupted UTF-8 encodings in localStorage
export const clearAllDefaultExercises = (): void => {
  if (typeof window === 'undefined') return;
  try {
    const saved = localStorage.getItem(`school_exercises_db`);
    if (saved) {
      const all: Record<string, ClassExercise[]> = JSON.parse(saved);
      let changed = false;
      const repaired: Record<string, ClassExercise[]> = {};

      Object.keys(all).forEach(rawK => {
        const cleanK = cleanUtf8(rawK);
        if (cleanK !== rawK) changed = true;

        const filtered = (all[rawK] || []).filter(
          ce => !isMockDefaultExercise(ce.id)
        );
        if (filtered.length !== all[rawK].length) {
          changed = true;
        }

        const cleanedItems = filtered.map(item => cleanObjectUtf8(item));
        repaired[cleanK] = cleanedItems;
      });

      if (changed || JSON.stringify(repaired) !== saved) {
        localStorage.setItem(`school_exercises_db`, JSON.stringify(repaired));
      }
    }

    const customSaved = localStorage.getItem('school_custom_exercises');
    if (customSaved) {
      const customList: ExerciseItem[] = JSON.parse(customSaved);
      const filteredCustom = customList.filter(
        ce => !isMockDefaultExercise(ce.id)
      );
      const cleanedCustom = filteredCustom.map(item => cleanObjectUtf8(item));
      if (cleanedCustom.length !== customList.length || JSON.stringify(cleanedCustom) !== customSaved) {
        localStorage.setItem('school_custom_exercises', JSON.stringify(cleanedCustom));
      }
    }
  } catch (e) {
    console.error("Error clearing or repairing default exercises", e);
  }
};

// Run cleanup immediately
if (typeof window !== 'undefined') {
  clearAllDefaultExercises();
}

export const isMatchingClass = (keyClass: string, targetClass: string): boolean => {
  if (!keyClass || !targetClass) return false;
  const k = cleanUtf8(keyClass).trim().toLowerCase().replace(/\s+/g, '');
  const t = cleanUtf8(targetClass).trim().toLowerCase().replace(/\s+/g, '');
  if (k === t) return true;

  // Terminale D cross-matching: Terminale D, Terminale D1, Terminale D2, Tle D, Terminale
  const isTerminalK = k.includes('terminaled') || k.includes('tled') || k === 'terminale' || k.startsWith('terminaled');
  const isTerminalT = t.includes('terminaled') || t.includes('tled') || t === 'terminale' || t.startsWith('terminaled');
  if (isTerminalK && isTerminalT) return true;

  return false;
};

export const getExercisesForClass = (className: string): ClassExercise[] => {
  if (!className) return [];

  const results: ClassExercise[] = [];
  const seenIds = new Set<string>();

  try {
    const saved = localStorage.getItem(`school_exercises_db`);
    if (saved) {
      const all: Record<string, ClassExercise[]> = JSON.parse(saved);
      const matchedKeys = Object.keys(all).filter(k => isMatchingClass(k, className));

      for (const k of matchedKeys) {
        if (Array.isArray(all[k])) {
          all[k].forEach(ex => {
            if (ex && ex.id && !seenIds.has(ex.id) && !isMockDefaultExercise(ex.id)) {
              seenIds.add(ex.id);
              results.push(cleanObjectUtf8(ex));
            }
          });
        }
      }
    }
  } catch (e) {
    console.error("Error reading exercises from localStorage", e);
  }

  // Also bridge with supplies from `school_supplies_store` so exercises created in ClassesPage are displayed
  try {
    const savedSupplies = localStorage.getItem(`school_supplies_store`);
    if (savedSupplies) {
      const allSupplies: Record<string, any[]> = JSON.parse(savedSupplies);
      const matchedSupplyKeys = Object.keys(allSupplies).filter(k => isMatchingClass(k, className));

      for (const sk of matchedSupplyKeys) {
        const supplies = allSupplies[sk] || [];
        supplies.forEach((sup: any) => {
          if (sup && sup.id && !seenIds.has(sup.id)) {
            seenIds.add(sup.id);
            results.push({
              id: sup.id,
              className: sup.className || className,
              subject: cleanUtf8(sup.subject) || 'Exercices Communs',
              title: cleanUtf8(sup.item || sup.title || 'Exercice'),
              description: cleanUtf8(sup.notes || sup.description || 'Consignes de l\'enseignant : traiter l\'exercice et préparer le travail.'),
              teacherName: 'Professeur',
              dueDate: 'À rendre sous peu',
              type: sup.isMandatory ? 'Devoir Maison' : 'Exercice de cours',
              isMandatory: sup.isMandatory ?? true,
              points: 20,
              imageUrl: sup.image || sup.imageUrl || undefined,
              createdAt: sup.createdAt || new Date().toISOString()
            });
          }
        });
      }
    }
  } catch (e) {
    console.error("Error bridging supplies to exercises", e);
  }

  return cleanObjectUtf8(results);
};

export const seedDefaultExercisesForClass = (_className: string): ClassExercise[] => {
  // No default exercises seeded
  return [];
};

export const saveExerciseToClass = (exercise: ClassExercise): void => {
  const cleanEx = cleanObjectUtf8(exercise);
  const className = cleanEx.className.trim();
  const normalizedClass = className.toLowerCase();
  const normalizedClassNoSpace = normalizedClass.replace(/\s+/g, '');

  try {
    const saved = localStorage.getItem(`school_exercises_db`);
    const all: Record<string, ClassExercise[]> = saved ? JSON.parse(saved) : {};
    
    const matchedKey = Object.keys(all).find(k => {
      const cleanK = cleanUtf8(k).trim().toLowerCase();
      return cleanK === normalizedClass || cleanK.replace(/\s+/g, '') === normalizedClassNoSpace;
    }) || className;

    const currentList = Array.isArray(all[matchedKey]) ? [...all[matchedKey]] : [];
    
    const existingIdx = currentList.findIndex(e => e.id === cleanEx.id);
    if (existingIdx !== -1) {
      currentList[existingIdx] = cleanEx;
    } else {
      currentList.unshift(cleanEx);
    }

    all[matchedKey] = currentList;
    localStorage.setItem(`school_exercises_db`, JSON.stringify(all));

    // Also update school_supplies_store if compatible so ClassesPage stays in sync
    try {
      const savedSupplies = localStorage.getItem(`school_supplies_store`);
      const allSupplies: Record<string, any[]> = savedSupplies ? JSON.parse(savedSupplies) : {};
      const supKey = Object.keys(allSupplies).find(k => {
        const cleanK = cleanUtf8(k).trim().toLowerCase();
        return cleanK === normalizedClass || cleanK.replace(/\s+/g, '') === normalizedClassNoSpace;
      }) || className;

      const supList = Array.isArray(allSupplies[supKey]) ? [...allSupplies[supKey]] : [];
      const supIdx = supList.findIndex(s => s.id === cleanEx.id);
      const supplyEquivalent = {
        id: cleanEx.id,
        className: cleanEx.className,
        subject: cleanEx.subject,
        item: cleanEx.title,
        quantity: 1,
        isMandatory: cleanEx.isMandatory ?? true,
        notes: cleanEx.description,
        image: cleanEx.imageUrl
      };

      if (supIdx !== -1) {
        supList[supIdx] = supplyEquivalent;
      } else {
        supList.unshift(supplyEquivalent);
      }
      allSupplies[supKey] = supList;
      localStorage.setItem(`school_supplies_store`, JSON.stringify(allSupplies));
      window.dispatchEvent(new CustomEvent('supplies-updated', { detail: { className: supKey } }));
    } catch (e) {
      // ignore
    }

    // Realtime custom event dispatch
    window.dispatchEvent(new CustomEvent('exercises-updated', { detail: { className: matchedKey, exercise: cleanEx } }));
    window.dispatchEvent(new Event('storage'));

    // Realtime Firestore synchronization
    saveRealtimeDocument('class_exercises', cleanEx.id, cleanEx).catch(console.error);
  } catch (e) {
    console.error("Error saving exercise", e);
  }
};

export const deleteExerciseFromClass = (id: string, className: string): void => {
  try {
    const saved = localStorage.getItem(`school_exercises_db`);
    const all: Record<string, ClassExercise[]> = saved ? JSON.parse(saved) : {};
    
    let changed = false;
    Object.keys(all).forEach(k => {
      if (isMatchingClass(k, className)) {
        if (Array.isArray(all[k])) {
          const prevLen = all[k].length;
          all[k] = all[k].filter(e => e.id !== id);
          if (all[k].length !== prevLen) changed = true;
        }
      }
    });

    if (changed) {
      localStorage.setItem(`school_exercises_db`, JSON.stringify(all));
    }

    deleteRealtimeDocument('class_exercises', id).catch(console.error);

    // Also delete from school_supplies_store
    try {
      const savedSupplies = localStorage.getItem(`school_supplies_store`);
      if (savedSupplies) {
        const allSupplies: Record<string, any[]> = JSON.parse(savedSupplies);
        let sChanged = false;
        Object.keys(allSupplies).forEach(sk => {
          if (isMatchingClass(sk, className)) {
            if (Array.isArray(allSupplies[sk])) {
              const pLen = allSupplies[sk].length;
              allSupplies[sk] = allSupplies[sk].filter(s => s.id !== id);
              if (allSupplies[sk].length !== pLen) sChanged = true;
            }
          }
        });
        if (sChanged) {
          localStorage.setItem(`school_supplies_store`, JSON.stringify(allSupplies));
          window.dispatchEvent(new CustomEvent('supplies-updated', { detail: { className } }));
        }
      }
    } catch {}

    window.dispatchEvent(new CustomEvent('exercises-updated', { detail: { className, deletedId: id } }));
    window.dispatchEvent(new Event('storage'));
  } catch (e) {
    console.error("Error deleting exercise", e);
  }
};


export const getCompletedExerciseIds = (studentId: string | number): string[] => {
  try {
    const saved = localStorage.getItem(`student_completed_exercises_${studentId}`);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const setCompletedExerciseIds = (studentId: string | number, ids: string[]): void => {
  try {
    localStorage.setItem(`student_completed_exercises_${studentId}`, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent('student-exercises-progress-changed', { detail: { studentId, ids } }));
  } catch (e) {
    console.error("Error saving completed exercises", e);
  }
};

export const getCompletedExercises = (studentId: string | number): string[] => {
  return getCompletedExerciseIds(studentId);
};

export const toggleExerciseCompleted = (studentId: string | number, exerciseId: string): void => {
  const current = getCompletedExerciseIds(studentId);
  const exists = current.includes(exerciseId);
  const next = exists ? current.filter(id => id !== exerciseId) : [...current, exerciseId];
  setCompletedExerciseIds(studentId, next);
  try {
    window.dispatchEvent(new CustomEvent('exercises-progress-updated', { detail: { studentId, exerciseId, completed: !exists } }));
  } catch {
    // ignore
  }
};

export const saveCustomExercise = (exercise: ExerciseItem): void => {
  try {
    const cleanEx = cleanObjectUtf8(exercise);
    const saved = localStorage.getItem('school_custom_exercises');
    const list: ExerciseItem[] = saved ? JSON.parse(saved) : [];
    const idx = list.findIndex(e => e.id === cleanEx.id);
    if (idx !== -1) {
      list[idx] = cleanEx;
    } else {
      list.unshift(cleanEx);
    }
    localStorage.setItem('school_custom_exercises', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('exercises-updated', { detail: { exercise: cleanEx } }));
  } catch (e) {
    console.error("Error saving custom exercise", e);
  }
};

export const deleteCustomExercise = (exerciseId: string): void => {
  try {
    const saved = localStorage.getItem('school_custom_exercises');
    const list: ExerciseItem[] = saved ? JSON.parse(saved) : [];
    const filtered = list.filter(e => e.id !== exerciseId);
    localStorage.setItem('school_custom_exercises', JSON.stringify(filtered));

    // Also delete from class exercises if present
    const classDbSaved = localStorage.getItem('school_exercises_db');
    if (classDbSaved) {
      const all: Record<string, ClassExercise[]> = JSON.parse(classDbSaved);
      let changed = false;
      Object.keys(all).forEach(k => {
        const prevLen = (all[k] || []).length;
        all[k] = (all[k] || []).filter(ce => ce.id !== exerciseId);
        if (all[k].length !== prevLen) changed = true;
      });
      if (changed) {
        localStorage.setItem('school_exercises_db', JSON.stringify(all));
      }
    }

    window.dispatchEvent(new CustomEvent('exercises-updated', { detail: { deletedId: exerciseId } }));
  } catch (e) {
    console.error("Error deleting custom exercise", e);
  }
};

export const getStudentCustomExercises = (): ExerciseItem[] => {
  try {
    const saved = localStorage.getItem('school_custom_exercises');
    const list: ExerciseItem[] = saved ? JSON.parse(saved) : [];
    const filtered = list.filter(
      ce => !ce.id.startsWith('ex-') && !ce.id.startsWith('cat-') && !ce.id.startsWith('auto-')
    );
    return cleanObjectUtf8(filtered);
  } catch {
    return [];
  }
};

export const getExercisesForStudent = (
  studentSubjects: Array<{ name: string; color?: string; hex?: string } | any> = [],
  _difficulty?: string,
  classLevel?: string
): Array<{ subjectName: string; subjectColor: string; exercises: ExerciseItem[] }> => {
  const subjectsToUse = studentSubjects && studentSubjects.length > 0 
    ? studentSubjects 
    : [];

  const customExercises = getStudentCustomExercises();
  const classExercises: ClassExercise[] = classLevel ? getExercisesForClass(classLevel) : [];

  return subjectsToUse.map(sub => {
    const rawName = typeof sub === 'string' ? sub : (sub?.name || 'Matière');
    const subjectName = cleanUtf8(rawName);
    const subjectColor = (typeof sub === 'object' && (sub.hex || sub.color)) || '#2563eb';

    // Lenient matching: handles accents, mojibake, case
    const matchedClassEx = classExercises.filter(
      ce => ce.subject && isSameSubject(ce.subject, subjectName)
    );

    const userCustomForSubject = customExercises.filter(
      ce => ce.subject && isSameSubject(ce.subject, subjectName)
    );

    const classItems: ExerciseItem[] = matchedClassEx.map((ce, idx) => ({
      id: ce.id || `custom-ex-${subjectName}-${idx}`,
      subject: cleanUtf8(ce.subject),
      title: cleanUtf8(ce.title),
      chapter: cleanUtf8(ce.chapter || 'Général'),
      difficulty: 'Moyen',
      duration: '30 min',
      statement: cleanUtf8(ce.description),
      hints: '',
      solution: '',
      points: ce.points || 20,
      classLevel: ce.className
    }));

    return {
      subjectName,
      subjectColor,
      exercises: [...userCustomForSubject, ...classItems]
    };
  });
};

export const getStudentExercisePhotos = (studentId?: string | number): Record<string, string> => {
  if (!studentId) return {};
  try {
    const saved = localStorage.getItem(`student_exercise_photos_${studentId}`);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

export const saveStudentExercisePhoto = (studentId: string | number | undefined, exerciseId: string, photoDataUrl: string): void => {
  if (!studentId) return;
  try {
    const photos = getStudentExercisePhotos(studentId);
    photos[exerciseId] = photoDataUrl;
    localStorage.setItem(`student_exercise_photos_${studentId}`, JSON.stringify(photos));
    window.dispatchEvent(new CustomEvent('student-photos-updated', { detail: { studentId, exerciseId } }));
  } catch (e) {
    console.error("Error saving student exercise photo", e);
  }
};

export const deleteStudentExercisePhoto = (studentId: string | number | undefined, exerciseId: string): void => {
  if (!studentId) return;
  try {
    const photos = getStudentExercisePhotos(studentId);
    delete photos[exerciseId];
    localStorage.setItem(`student_exercise_photos_${studentId}`, JSON.stringify(photos));
    window.dispatchEvent(new CustomEvent('student-photos-updated', { detail: { studentId, exerciseId } }));
  } catch (e) {
    console.error("Error deleting student exercise photo", e);
  }
};
