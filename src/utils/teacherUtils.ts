/**
 * Utility functions for teacher permissions and role checking
 */

export function matchesClass(c1?: any, c2?: any): boolean {
  if (!c1 || !c2) return false;
  const s1 = String(c1).trim();
  const s2 = String(c2).trim();
  if (!s1 || !s2) return false;

  if (s1.toLowerCase() === s2.toLowerCase()) return true;

  const normalize = (str: string) => 
    str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[\s\-_.]+/g, '');

  const norm1 = normalize(s1);
  const norm2 = normalize(s2);
  if (norm1 === norm2) return true;

  const short1 = norm1.replace(/eme/g, '').replace(/ere/g, '').replace(/er/g, '');
  const short2 = norm2.replace(/eme/g, '').replace(/ere/g, '').replace(/er/g, '');
  if (short1 === short2) return true;

  if (short1.length >= 2 && short2.length >= 2) {
    if (short1.includes(short2) || short2.includes(short1)) return true;
  }

  return false;
}

export function getTeacherPPClasses(t: any): string[] {
  if (!t) return [];
  const classes: string[] = [];

  const add = (val: any) => {
    if (!val) return;
    if (Array.isArray(val)) {
      val.forEach(item => add(item));
    } else if (typeof val === 'string') {
      val.split(',').forEach(item => {
        const trimmed = item.trim();
        if (trimmed) classes.push(trimmed);
      });
    }
  };

  add(t.principalClasses);
  add(t.principalClass);
  add(t.mainClass);
  add(t.ppClass);
  add(t.ppClasses);

  const isPP = Boolean(t.isPrincipal) || String(t.isPrincipal) === 'true' || t.isProfesseurPrincipal === true || Boolean(t.isPP);

  if (isPP || classes.length === 0) {
    add(t.assignedClass);
    add(t.assignedClasses);
    add(t.classes);
    add(t.class);
    add(t.room);
  }

  return classes;
}

export function matchesTeacherUser(currentUser: any, teacher: any): boolean {
  if (!currentUser || !teacher) return false;

  const cId = String(currentUser.id || '').replace(/^teacher-/, '');
  const tId = String(teacher.id || '').replace(/^teacher-/, '');
  if (cId && tId && cId === tId) return true;

  const cUid = String(currentUser.uid || currentUser.authUid || '').replace(/^teacher-/, '');
  const tUid = String(teacher.uid || teacher.authUid || '').replace(/^teacher-/, '');
  if (cUid && tUid && cUid === tUid) return true;

  if (cId && tUid && cId === tUid) return true;
  if (cUid && tId && cUid === tId) return true;

  if (currentUser.matricule && teacher.matricule && 
      String(currentUser.matricule).trim().toLowerCase() === String(teacher.matricule).trim().toLowerCase()) {
    return true;
  }

  if (currentUser.email && teacher.email && 
      String(currentUser.email).trim().toLowerCase() === String(teacher.email).trim().toLowerCase()) {
    return true;
  }

  if (currentUser.name && teacher.name) {
    const cName = String(currentUser.name).trim().toLowerCase();
    const tName = String(teacher.name).trim().toLowerCase();
    if (cName === tName) return true;
    if (cName.length > 3 && tName.length > 3 && (cName.includes(tName) || tName.includes(cName))) {
      return true;
    }
  }

  return false;
}

export function checkIsPrincipalForClass(currentUser: any, targetClassName?: string, teachersList?: any[]): boolean {
  if (!currentUser || !targetClassName) return false;

  const role = String(currentUser.role || '').toLowerCase();
  if (role === 'admin' || role === 'director' || currentUser.accessLevel === 5 || currentUser.accessLevel === 4) {
    return true;
  }

  const isTeacherRole = 
    role === 'teacher' || 
    role === 'professeur' || 
    role === 'enseignant' || 
    role === 'prof' || 
    role.includes('teacher') || 
    role.includes('prof') || 
    role.includes('enseign') || 
    String(currentUser.accessLevel) === '3' || 
    Boolean(currentUser.isTeacher) || 
    Boolean(currentUser.isPrincipal) || 
    (currentUser.principalClasses && (Array.isArray(currentUser.principalClasses) ? currentUser.principalClasses.length > 0 : String(currentUser.principalClasses).trim() !== ''));

  if (!isTeacherRole) return false;

  const userPPClasses = getTeacherPPClasses(currentUser);
  if (userPPClasses.some(c => matchesClass(c, targetClassName))) {
    return true;
  }

  const teachers: any[] = teachersList && teachersList.length > 0 
    ? teachersList 
    : (() => {
        try {
          return JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
        } catch (e) {
          return [];
        }
      })();

  const matchedTeacher = teachers.find((t: any) => matchesTeacherUser(currentUser, t));
  if (matchedTeacher) {
    const teacherPPClasses = getTeacherPPClasses(matchedTeacher);
    if (teacherPPClasses.some(c => matchesClass(c, targetClassName))) {
      return true;
    }
  }

  const mainTeacherForClass = teachers.find((t: any) => {
    const ppCls = getTeacherPPClasses(t);
    return ppCls.some(c => matchesClass(c, targetClassName));
  });

  if (mainTeacherForClass && matchesTeacherUser(currentUser, mainTeacherForClass)) {
    return true;
  }

  const explicitPPForClass = teachers.some((t: any) => {
    const isPP = Boolean(t.isPrincipal) || String(t.isPrincipal) === 'true' || t.isProfesseurPrincipal === true;
    if (!isPP) return false;
    const ppCls = getTeacherPPClasses(t);
    return ppCls.some(c => matchesClass(c, targetClassName));
  });

  if (!explicitPPForClass) {
    const userAssignedClasses = [
      ...(Array.isArray(currentUser.assignedClasses) ? currentUser.assignedClasses : typeof currentUser.assignedClasses === 'string' ? currentUser.assignedClasses.split(',') : []),
      currentUser.assignedClass,
      currentUser.class,
      currentUser.room
    ].filter(Boolean);

    if (userAssignedClasses.some(c => matchesClass(c, targetClassName))) {
      return true;
    }

    if (matchedTeacher) {
      const teacherAssignedClasses = [
        ...(Array.isArray(matchedTeacher.assignedClasses) ? matchedTeacher.assignedClasses : typeof matchedTeacher.assignedClasses === 'string' ? matchedTeacher.assignedClasses.split(',') : []),
        matchedTeacher.assignedClass,
        matchedTeacher.class,
        matchedTeacher.room
      ].filter(Boolean);

      if (teacherAssignedClasses.some(c => matchesClass(c, targetClassName))) {
        return true;
      }
    }
  }

  return false;
}

export function getClassPrincipalTeacherSignature(targetClassName?: string): { signature?: string; teacherName?: string } {
  if (!targetClassName) return {};

  try {
    const storedMap = JSON.parse(localStorage.getItem('school_db_class_pp_signatures') || '{}');
    for (const key of Object.keys(storedMap)) {
      if (matchesClass(key, targetClassName)) {
        return storedMap[key];
      }
    }

    const teachers: any[] = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
    const teacherPP = teachers.find(t => {
      if (!t) return false;
      const ppClasses = getTeacherPPClasses(t);
      return ppClasses.some(c => matchesClass(c, targetClassName));
    });

    if (teacherPP && (teacherPP.teacherSignature || teacherPP.signature || teacherPP.signatureUrl)) {
      const sig = teacherPP.teacherSignature || teacherPP.signature || teacherPP.signatureUrl;
      return { signature: sig, teacherName: teacherPP.name };
    }

    const students: any[] = JSON.parse(localStorage.getItem('school_db_students') || '[]');
    const studentWithSig = students.find(s => s.class && matchesClass(s.class, targetClassName) && s.teacherSignature);
    if (studentWithSig) {
      return { signature: studentWithSig.teacherSignature, teacherName: studentWithSig.mainTeacherName };
    }
  } catch (e) {
    console.error('Error reading class signature:', e);
  }

  return {};
}

export function saveClassPrincipalTeacherSignature(targetClassName: string, signatureUrl: string, teacherName: string): void {
  if (!targetClassName) return;

  try {
    const storedMap = JSON.parse(localStorage.getItem('school_db_class_pp_signatures') || '{}');
    storedMap[targetClassName] = { signature: signatureUrl, teacherName };
    localStorage.setItem('school_db_class_pp_signatures', JSON.stringify(storedMap));

    const students: any[] = JSON.parse(localStorage.getItem('school_db_students') || '[]');
    let updatedAny = false;
    const newStudents = students.map((s: any) => {
      if (s.class && matchesClass(s.class, targetClassName)) {
        updatedAny = true;
        return {
          ...s,
          teacherSignature: signatureUrl,
          mainTeacherName: teacherName
        };
      }
      return s;
    });
    if (updatedAny) {
      localStorage.setItem('school_db_students', JSON.stringify(newStudents));
    }

    const teachers: any[] = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
    let teacherUpdated = false;
    const newTeachers = teachers.map((t: any) => {
      if (t && t.name && teacherName && String(t.name).trim().toLowerCase() === String(teacherName).trim().toLowerCase()) {
        teacherUpdated = true;
        return {
          ...t,
          teacherSignature: signatureUrl
        };
      }
      return t;
    });
    if (teacherUpdated) {
      localStorage.setItem('school_db_teachers', JSON.stringify(newTeachers));
    }

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('class-signature-updated', { detail: { className: targetClassName, signatureUrl, teacherName } }));
  } catch (e) {
    console.error('Error saving class signature:', e);
  }
}

export function deleteClassPrincipalTeacherSignature(targetClassName: string): void {
  if (!targetClassName) return;

  try {
    const storedMap = JSON.parse(localStorage.getItem('school_db_class_pp_signatures') || '{}');
    for (const key of Object.keys(storedMap)) {
      if (matchesClass(key, targetClassName)) {
        delete storedMap[key];
      }
    }
    localStorage.setItem('school_db_class_pp_signatures', JSON.stringify(storedMap));

    const students: any[] = JSON.parse(localStorage.getItem('school_db_students') || '[]');
    let updatedAny = false;
    const newStudents = students.map((s: any) => {
      if (s.class && matchesClass(s.class, targetClassName)) {
        updatedAny = true;
        const copy = { ...s };
        delete copy.teacherSignature;
        return copy;
      }
      return s;
    });
    if (updatedAny) {
      localStorage.setItem('school_db_students', JSON.stringify(newStudents));
    }

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('class-signature-updated', { detail: { className: targetClassName, signatureUrl: undefined } }));
  } catch (e) {
    console.error('Error deleting class signature:', e);
  }
}


