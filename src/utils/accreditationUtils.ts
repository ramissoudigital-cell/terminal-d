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
  'Espagnol': 'ESP-2024',
  'Allemand': 'ALL-2024',
  'Arts Plastiques': 'ART-2024',
  'Musique': 'MUS-2024',
  'Éducation Musicale': 'MUS-2024',
  'EDHC': 'EDHC-2024',
  'Économie Générale': 'ECO-2024',
  'Droit': 'DROIT-2024',
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
  'Espagnol',
  'Allemand',
  'Arts Plastiques',
  'Musique',
  'EDHC',
  'Économie Générale',
  'Droit'
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
  const key = `acc_subject_${normalizeSubjectKey(subject)}`;
  try {
    const custom = localStorage.getItem(key);
    if (custom && custom.trim()) return custom.trim().toUpperCase();
  } catch (e) {}

  const normalizedInput = normalizeSubjectKey(subject);
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
  const key = `acc_subject_${normalizeSubjectKey(subject)}`;
  try {
    const formattedCode = (code || '').trim().toUpperCase();
    localStorage.setItem(key, formattedCode);
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

  // 4.5 Check teacher-specific subject code in localStorage
  if (userOrTeacher.id && userOrTeacher.subject) {
    try {
      const codeByTeacherSub = localStorage.getItem(`acc_teacher_${userOrTeacher.id}_subject_${normalizeSubjectKey(userOrTeacher.subject)}`);
      if (codeByTeacherSub && codeByTeacherSub.trim()) return codeByTeacherSub.trim().toUpperCase();
    } catch (e) {}
  }

  // 5. Fallback to individual last entered code
  try {
    const lastEntered = localStorage.getItem('last_entered_teacher_code');
    if (lastEntered && lastEntered.trim()) return lastEntered.trim().toUpperCase();
  } catch (e) {}

  // 6. Fallback to default subject code
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
    if (teacherIdentifier.subject && teacherIdentifier.id) {
      localStorage.setItem(`acc_teacher_${teacherIdentifier.id}_subject_${normalizeSubjectKey(teacherIdentifier.subject)}`, formattedCode);
    }
    localStorage.setItem('last_entered_teacher_code', formattedCode);

    // Update in school_db_teachers
    const localTeachers: any[] = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
    let teacherUpdated = false;
    const updatedTeachers = localTeachers.map(t => {
      if ((teacherIdentifier.id && String(t.id) === String(teacherIdentifier.id)) ||
          (teacherIdentifier.email && t.email && t.email.toLowerCase() === teacherIdentifier.email.toLowerCase())) {
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
      if ((teacherIdentifier.id && String(u.id) === String(teacherIdentifier.id)) ||
          (teacherIdentifier.email && u.email && u.email.toLowerCase() === teacherIdentifier.email.toLowerCase())) {
        userUpdated = true;
        return { ...u, accreditationCode: formattedCode };
      }
      return u;
    });
    if (userUpdated) {
      localStorage.setItem('school_registered_users', JSON.stringify(updatedUsers));
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
  const expectedSubjectCode = getSubjectAccreditationCode(subject).trim().toUpperCase();

  // 1. Direct match with subject accreditation code
  if (cleanInput === expectedSubjectCode) return true;

  // 2. Check individual teacher code if provided
  if (teacherIdentifier) {
    const individualCode = getTeacherIndividualAccreditationCode({
      ...teacherIdentifier,
      subject
    });
    if (cleanInput === individualCode.trim().toUpperCase()) return true;
  }

  // 3. Check registered teachers in localStorage for a match in that subject
  try {
    const localTeachers: any[] = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
    const matchingSubjectTeacher = localTeachers.find(t => 
      t.subject && normalizeSubjectKey(t.subject) === normalizeSubjectKey(subject) &&
      t.accreditationCode && t.accreditationCode.trim().toUpperCase() === cleanInput
    );
    if (matchingSubjectTeacher) return true;
  } catch (e) {}

  // 4. Master administrator / supervisor bypass codes
  const masterCodes = ['ADMIN', 'DIR-2024', 'ACC-2024', 'PROF-2024'];
  try {
    const generalDirCode = localStorage.getItem('acc_niv5')?.trim().toUpperCase();
    if (generalDirCode) masterCodes.push(generalDirCode);
    const generalProfCode = localStorage.getItem('acc_niv3')?.trim().toUpperCase();
    if (generalProfCode) masterCodes.push(generalProfCode);
  } catch (e) {}

  return masterCodes.includes(cleanInput);
};
