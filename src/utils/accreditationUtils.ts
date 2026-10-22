import { subscribeToRealtimeCollection, saveRealtimeDocument } from '../services/firebaseService';

export const DEFAULT_SUBJECT_ACCREDITATION_CODES: Record<string, string> = {
  'Mathématiques': 'MATH-2024',
  'Français': 'FRAN-2024',
  'Anglais': 'ANG-2024',
  'Histoire-Géographie': 'HG-2024',
  'Hist-Géo': 'HG-2024',
  'SVT': 'SVT-2024',
  'Physique-Chimie': 'PC-2024',
  'Philosophie': 'PHIL-2024',
  'EPS': 'EPS-2024',
  'Informatique': 'INFO-2024',
  'Conduite': 'COND-2024',
};

export const ALL_TEACHING_SUBJECTS = [
  'Mathématiques',
  'Français',
  'Anglais',
  'Histoire-Géographie',
  'Physique-Chimie',
  'SVT',
  'Philosophie',
  'EPS',
  'Informatique',
  'Conduite'
];

export const normalizeSubjectKey = (subject: string): string => {
  return (subject || '')
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_");
};

export const getSubjectAccreditationCode = (subject: string): string => {
  if (!subject) return 'PROF-2024';
  const normSub = normalizeSubjectKey(subject);

  // 1. Direct custom code for this subject in localStorage
  try {
    const custom = localStorage.getItem(`acc_subject_${normSub}`);
    if (custom && custom.trim()) return custom.trim().toUpperCase();
  } catch (e) {}

  // 2. Check if any teacher in school_db_teachers teaching this subject has an accreditationCode
  try {
    const localTeachers: any[] = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
    const teacherForSub = localTeachers.find(t => 
      t.subject && normalizeSubjectKey(t.subject) === normSub &&
      t.accreditationCode && t.accreditationCode.trim()
    );
    if (teacherForSub && teacherForSub.accreditationCode.trim()) {
      return teacherForSub.accreditationCode.trim().toUpperCase();
    }
  } catch (e) {}

  // 3. Check if any user in school_registered_users teaching this subject has an accreditationCode
  try {
    const localUsers: any[] = JSON.parse(localStorage.getItem('school_registered_users') || '[]');
    const userForSub = localUsers.find(u => 
      (u.role === 'teacher' || u.accessLevel === 3) &&
      u.subject && normalizeSubjectKey(u.subject) === normSub &&
      u.accreditationCode && u.accreditationCode.trim()
    );
    if (userForSub && userForSub.accreditationCode.trim()) {
      return userForSub.accreditationCode.trim().toUpperCase();
    }
  } catch (e) {}

  // 4. Check any acc_teacher_*_subject_${normSub} key in localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.includes(`subject_${normSub}`)) {
        const val = localStorage.getItem(k);
        if (val && val.trim()) return val.trim().toUpperCase();
      }
    }
  } catch (e) {}

  // 5. Default fallback
  const normalizedInput = normSub;
  for (const [s, code] of Object.entries(DEFAULT_SUBJECT_ACCREDITATION_CODES)) {
    if (normalizeSubjectKey(s) === normalizedInput) {
      return code;
    }
  }

  const prefix = subject.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase() || 'PROF';
  return `${prefix}-2024`;
};

export const setSubjectAccreditationCode = (subject: string, code: string): void => {
  if (!subject) return;
  const normSub = normalizeSubjectKey(subject);
  const formattedCode = (code || '').trim().toUpperCase();
  try {
    localStorage.setItem(`acc_subject_${normSub}`, formattedCode);
    localStorage.setItem(`acc_custom_set_${normSub}`, 'true');

    // Also update in school_db_teachers
    try {
      const localTeachers: any[] = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
      let teacherUpdated = false;
      const updatedTeachers = localTeachers.map(t => {
        if (t.subject && normalizeSubjectKey(t.subject) === normSub) {
          teacherUpdated = true;
          return { ...t, accreditationCode: formattedCode };
        }
        return t;
      });
      if (teacherUpdated) {
        localStorage.setItem('school_db_teachers', JSON.stringify(updatedTeachers));
      }
    } catch (e) {}

    // Also update in school_registered_users
    try {
      const localUsers: any[] = JSON.parse(localStorage.getItem('school_registered_users') || '[]');
      let userUpdated = false;
      const updatedUsers = localUsers.map(u => {
        if ((u.role === 'teacher' || u.accessLevel === 3) && u.subject && normalizeSubjectKey(u.subject) === normSub) {
          userUpdated = true;
          return { ...u, accreditationCode: formattedCode };
        }
        return u;
      });
      if (userUpdated) {
        localStorage.setItem('school_registered_users', JSON.stringify(updatedUsers));
      }
    } catch (e) {}

    // Real-time Firestore sync
    saveRealtimeDocument('accreditation_codes', `subject_${normSub}`, {
      subject,
      code: formattedCode,
      updatedAt: Date.now()
    }).catch(() => {});

    window.dispatchEvent(new CustomEvent('subject-accreditation-updated', { detail: { subject, code: formattedCode } }));
  } catch (e) {
    console.error('Error saving subject accreditation code:', e);
  }
};

export const getAllSubjectAccreditationCodes = (): Record<string, string> => {
  const result: Record<string, string> = {};
  ALL_TEACHING_SUBJECTS.forEach(sub => {
    result[sub] = getSubjectAccreditationCode(sub);
  });
  return result;
};

export const getTeacherIndividualAccreditationCode = (
  userOrTeacher?: { id?: string | number; subject?: string; accreditationCode?: string; email?: string } | null
): string => {
  if (!userOrTeacher) return 'PROF-2024';

  // 1. Direct explicit property on User / Teacher
  if (userOrTeacher.accreditationCode && userOrTeacher.accreditationCode.trim()) {
    return userOrTeacher.accreditationCode.trim().toUpperCase();
  }

  // 2. Check localStorage by teacher ID
  if (userOrTeacher.id) {
    try {
      const codeById = localStorage.getItem(`acc_teacher_code_${userOrTeacher.id}`);
      if (codeById && codeById.trim()) return codeById.trim().toUpperCase();
    } catch (e) {}
  }

  // 3. Check localStorage by teacher Email
  if (userOrTeacher.email) {
    try {
      const codeByEmail = localStorage.getItem(`acc_teacher_email_${userOrTeacher.email.trim().toLowerCase()}`);
      if (codeByEmail && codeByEmail.trim()) return codeByEmail.trim().toUpperCase();
    } catch (e) {}
  }

  // 4. Check registered teachers in localStorage
  try {
    const localTeachers: any[] = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
    const foundTeacher = localTeachers.find(t => 
      (userOrTeacher.id && String(t.id) === String(userOrTeacher.id)) ||
      (userOrTeacher.email && t.email && t.email.toLowerCase() === userOrTeacher.email.toLowerCase())
    );
    if (foundTeacher?.accreditationCode && foundTeacher.accreditationCode.trim()) {
      return foundTeacher.accreditationCode.trim().toUpperCase();
    }
  } catch (e) {}

  // 5. Check teacher-specific subject code in localStorage
  if (userOrTeacher.id && userOrTeacher.subject) {
    try {
      const codeByTeacherSub = localStorage.getItem(`acc_teacher_${userOrTeacher.id}_subject_${normalizeSubjectKey(userOrTeacher.subject)}`);
      if (codeByTeacherSub && codeByTeacherSub.trim()) return codeByTeacherSub.trim().toUpperCase();
    } catch (e) {}
  }

  // 6. Fallback to subject code
  const sub = userOrTeacher.subject || 'Mathématiques';
  return getSubjectAccreditationCode(sub);
};

export const setTeacherIndividualAccreditationCode = (
  teacherIdentifier: { id?: string | number; subject?: string; email?: string } | null | undefined,
  code: string
): void => {
  if (!teacherIdentifier || !code) return;
  const formattedCode = code.trim().toUpperCase();

  try {
    if (teacherIdentifier.id) {
      localStorage.setItem(`acc_teacher_code_${teacherIdentifier.id}`, formattedCode);
    }
    if (teacherIdentifier.email) {
      localStorage.setItem(`acc_teacher_email_${teacherIdentifier.email.trim().toLowerCase()}`, formattedCode);
    }
    if (teacherIdentifier.subject) {
      const normSub = normalizeSubjectKey(teacherIdentifier.subject);
      localStorage.setItem(`acc_subject_${normSub}`, formattedCode);
      localStorage.setItem(`acc_custom_set_${normSub}`, 'true');
      if (teacherIdentifier.id) {
        localStorage.setItem(`acc_teacher_${teacherIdentifier.id}_subject_${normSub}`, formattedCode);
      }
    }

    // Update in school_db_teachers
    const localTeachers: any[] = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
    let teacherUpdated = false;
    const updatedTeachers = localTeachers.map(t => {
      const matchId = teacherIdentifier.id && String(t.id) === String(teacherIdentifier.id);
      const matchEmail = teacherIdentifier.email && t.email && t.email.toLowerCase() === teacherIdentifier.email.toLowerCase();
      const matchSubject = !teacherIdentifier.id && !teacherIdentifier.email && teacherIdentifier.subject && t.subject && normalizeSubjectKey(t.subject) === normalizeSubjectKey(teacherIdentifier.subject);
      if (matchId || matchEmail || matchSubject) {
        teacherUpdated = true;
        return { ...t, accreditationCode: formattedCode };
      }
      return t;
    });
    if (teacherUpdated) {
      localStorage.setItem('school_db_teachers', JSON.stringify(updatedTeachers));
    }

    // Update in school_registered_users
    const localUsers: any[] = JSON.parse(localStorage.getItem('school_registered_users') || '[]');
    let userUpdated = false;
    const updatedUsers = localUsers.map(u => {
      const matchId = teacherIdentifier.id && String(u.id) === String(teacherIdentifier.id);
      const matchEmail = teacherIdentifier.email && u.email && u.email.toLowerCase() === teacherIdentifier.email.toLowerCase();
      const matchSubject = !teacherIdentifier.id && !teacherIdentifier.email && teacherIdentifier.subject && u.subject && normalizeSubjectKey(u.subject) === normalizeSubjectKey(teacherIdentifier.subject);
      if (matchId || matchEmail || matchSubject) {
        userUpdated = true;
        return { ...u, accreditationCode: formattedCode };
      }
      return u;
    });
    if (userUpdated) {
      localStorage.setItem('school_registered_users', JSON.stringify(updatedUsers));
    }

    // Sync to Firestore in real-time
    if (teacherIdentifier.id) {
      saveRealtimeDocument('accreditation_codes', String(teacherIdentifier.id), {
        teacherId: teacherIdentifier.id,
        email: teacherIdentifier.email || '',
        subject: teacherIdentifier.subject || '',
        code: formattedCode,
        updatedAt: Date.now()
      }).catch(() => {});
    }
    if (teacherIdentifier.subject) {
      const normSub = normalizeSubjectKey(teacherIdentifier.subject);
      saveRealtimeDocument('accreditation_codes', `subject_${normSub}`, {
        subject: teacherIdentifier.subject,
        code: formattedCode,
        updatedAt: Date.now()
      }).catch(() => {});
    }

    window.dispatchEvent(new CustomEvent('teacher-accreditation-updated', {
      detail: { 
        teacherId: teacherIdentifier.id, 
        subject: teacherIdentifier.subject, 
        code: formattedCode 
      }
    }));
  } catch (e) {
    console.error('Error saving teacher individual accreditation code:', e);
  }
};

export const verifySubjectAccreditation = (
  subject: string, 
  codeEntered: string,
  teacherIdentifier?: { id?: string | number; email?: string }
): boolean => {
  if (!codeEntered) return false;
  const cleanInput = codeEntered.trim().toUpperCase();
  const normSub = normalizeSubjectKey(subject);

  // 1. Collect all custom codes configured for this subject or its teachers
  const allCustomCodesForSub: string[] = [];

  try {
    const custom = localStorage.getItem(`acc_subject_${normSub}`);
    if (custom && custom.trim()) allCustomCodesForSub.push(custom.trim().toUpperCase());
  } catch (e) {}

  try {
    const localTeachers: any[] = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
    localTeachers.forEach(t => {
      if (t.subject && normalizeSubjectKey(t.subject) === normSub && t.accreditationCode && t.accreditationCode.trim()) {
        allCustomCodesForSub.push(t.accreditationCode.trim().toUpperCase());
      }
    });
  } catch (e) {}

  try {
    const localUsers: any[] = JSON.parse(localStorage.getItem('school_registered_users') || '[]');
    localUsers.forEach(u => {
      if ((u.role === 'teacher' || u.accessLevel === 3) && u.subject && normalizeSubjectKey(u.subject) === normSub && u.accreditationCode && u.accreditationCode.trim()) {
        allCustomCodesForSub.push(u.accreditationCode.trim().toUpperCase());
      }
    });
  } catch (e) {}

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes(`subject_${normSub}`)) {
        const val = localStorage.getItem(key)?.trim().toUpperCase();
        if (val) allCustomCodesForSub.push(val);
      }
    }
  } catch (e) {}

  const hasCustomCode = allCustomCodesForSub.length > 0 || localStorage.getItem(`acc_custom_set_${normSub}`) === 'true';

  // 2. Direct match with any of the custom codes for this subject
  if (allCustomCodesForSub.includes(cleanInput)) {
    return true;
  }

  // 3. Match individual teacher code if teacherIdentifier was provided
  if (teacherIdentifier) {
    const individualCode = getTeacherIndividualAccreditationCode({
      ...teacherIdentifier,
      subject
    });
    if (cleanInput === individualCode.trim().toUpperCase()) return true;
  }

  // 4. Default fallback code ONLY IF no custom code was ever set!
  // If the user modified the code, the old default code (e.g. MATH-2024) is strictly invalid!
  if (!hasCustomCode) {
    const defaultSubjectCode = (
      DEFAULT_SUBJECT_ACCREDITATION_CODES[subject] || 
      `${subject.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase()}-2024`
    ).trim().toUpperCase();
    if (cleanInput === defaultSubjectCode) return true;
  }

  // 5. Master administrator / supervisor bypass codes
  const masterCodes = ['ADMIN', 'DIR-2024', 'ACC-2024'];
  try {
    const generalDirCode = localStorage.getItem('acc_niv5')?.trim().toUpperCase();
    if (generalDirCode) masterCodes.push(generalDirCode);
    const generalProfCode = localStorage.getItem('acc_niv3')?.trim().toUpperCase();
    if (generalProfCode) masterCodes.push(generalProfCode);
  } catch (e) {}

  return masterCodes.includes(cleanInput);
};

// Real-time listener to Firestore accreditation_codes collection
let isSyncInitialized = false;
export const initAccreditationRealtimeSync = (): void => {
  if (isSyncInitialized || typeof window === 'undefined') return;
  isSyncInitialized = true;

  try {
    subscribeToRealtimeCollection('accreditation_codes', (items: any[]) => {
      if (!Array.isArray(items) || items.length === 0) return;

      items.forEach(item => {
        if (!item) return;

        // System levels document
        if (item.id === 'system_levels') {
          if (item.niveau2) localStorage.setItem('acc_niv2', String(item.niveau2).trim().toUpperCase());
          if (item.niveau3) localStorage.setItem('acc_niv3', String(item.niveau3).trim().toUpperCase());
          if (item.niveau4) localStorage.setItem('acc_niv4', String(item.niveau4).trim().toUpperCase());
          if (item.niveau5) localStorage.setItem('acc_niv5', String(item.niveau5).trim().toUpperCase());
          return;
        }

        // Subject accreditation code
        if (item.subject && item.code) {
          const normSub = normalizeSubjectKey(item.subject);
          const cleanCode = String(item.code).trim().toUpperCase();
          localStorage.setItem(`acc_subject_${normSub}`, cleanCode);
          localStorage.setItem(`acc_custom_set_${normSub}`, 'true');
        }

        // Teacher individual accreditation code
        if (item.teacherId && item.code) {
          const cleanCode = String(item.code).trim().toUpperCase();
          localStorage.setItem(`acc_teacher_code_${item.teacherId}`, cleanCode);
          if (item.subject) {
            const normSub = normalizeSubjectKey(item.subject);
            localStorage.setItem(`acc_teacher_${item.teacherId}_subject_${normSub}`, cleanCode);
            localStorage.setItem(`acc_subject_${normSub}`, cleanCode);
            localStorage.setItem(`acc_custom_set_${normSub}`, 'true');
          }
        }
      });

      window.dispatchEvent(new Event('subject-accreditation-updated'));
    });
  } catch (e) {
    console.warn('Real-time accreditation sync skipped:', e);
  }
};

// Automatically initialize when running in browser
if (typeof window !== 'undefined') {
  initAccreditationRealtimeSync();
}
