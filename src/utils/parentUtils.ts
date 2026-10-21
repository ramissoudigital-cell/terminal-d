import { User, Student } from '../../types';

/**
 * Normalizes class names so that equivalents like "Terminale A1", "Tle A1", "Seconde C1", "2nde C1", "3ème 1", "Troisième 1" compare equal.
 */
export function normalizeClassName(className: string): string {
  if (!className) return '';
  let str = className
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .trim();

  // Replace full terms / variants with canonical short form
  str = str
    .replace(/terminales?/gi, 'tle')
    .replace(/premieres?/gi, '1ere')
    .replace(/secondes?/gi, '2nde')
    .replace(/troisiemes?/gi, '3eme')
    .replace(/quatriemes?/gi, '4eme')
    .replace(/cinquiemes?/gi, '5eme')
    .replace(/sixiemes?/gi, '6eme')
    .replace(/1[eèe]re/gi, '1ere')
    .replace(/1re/gi, '1ere')
    .replace(/1er/gi, '1ere')
    .replace(/2[nñd]de/gi, '2nde')
    .replace(/2de/gi, '2nde')
    .replace(/3[eèe]me/gi, '3eme')
    .replace(/3e/gi, '3eme')
    .replace(/4[eèe]me/gi, '4eme')
    .replace(/4e/gi, '4eme')
    .replace(/5[eèe]me/gi, '5eme')
    .replace(/5e/gi, '5eme')
    .replace(/6[eèe]me/gi, '6eme')
    .replace(/6e/gi, '6eme');

  // Strip all non-alphanumeric characters
  return str.replace(/[^a-z0-9]/g, '');
}

export function isSameClass(classA: string, classB: string): boolean {
  if (!classA || !classB) return false;
  const normA = normalizeClassName(classA);
  const normB = normalizeClassName(classB);
  if (normA === normB) return true;
  if (normA && normB && (normA.startsWith(normB) || normB.startsWith(normA) || normA.includes(normB) || normB.includes(normA))) return true;
  return false;
}

export interface ParentChild {
  matricule: string;
  assignedClass: string;
  studentId?: string;
  name?: string;
}

/**
 * Returns all children associated with a parent user.
 */
export function getParentChildren(parentUser: User | null | undefined, allStudents: Student[] = []): Student[] {
  if (!parentUser || parentUser.role !== 'parent') return [];

  const foundStudents: Student[] = [];
  const addedIds = new Set<string>();

  const addStudent = (s: Student) => {
    if (s && s.id && !addedIds.has(s.id)) {
      addedIds.add(s.id);
      foundStudents.push(s);
    }
  };

  // 1. Check explicit children array on parentUser
  if (Array.isArray(parentUser.children) && parentUser.children.length > 0) {
    for (const child of parentUser.children) {
      const normMat = (child.matricule || child.studentId || '').trim().toLowerCase();
      
      const match = allStudents.find(s => {
        const sMat = (s.studentId || (s as any).matricule || '').trim().toLowerCase();
        if (normMat && sMat === normMat) return true;
        if (child.name && s.name.toLowerCase() === child.name.toLowerCase()) return true;
        return false;
      });

      if (match) {
        if (!match.class && child.assignedClass) {
          match.class = child.assignedClass;
        }
        addStudent(match);
      } else if (child.matricule) {
        // Fallback synthetic Student object for rendering if not in allStudents yet
        const fallbackStudent: Student = {
          id: `child-${child.matricule}`,
          name: child.name || `Enfant (${child.matricule})`,
          class: child.assignedClass || '6ème 1',
          photoUrl: `https://i.pravatar.cc/150?u=${child.matricule}`,
          studentId: child.matricule,
          parentPhone: parentUser.parentPhone || '',
          birthDate: '01/01/2012',
          absences: 0,
          attendanceHistory: [],
          performance: [
            { name: 'Sep', studentScore: 12, classAverage: 11 },
            { name: 'Oct', studentScore: 14, classAverage: 12 }
          ],
          subjects: [
            { name: 'Mathématiques', value: 14, average: 14, fill: '#3b82f6', grades: [] },
            { name: 'Français', value: 13, average: 13, fill: '#a855f7', grades: [] }
          ],
          activities: []
        };
        addStudent(fallbackStudent);
      }
    }
  }

  // 2. Check parentUser.matricule (single child or legacy registration)
  if (parentUser.matricule) {
    const normMat = parentUser.matricule.trim().toLowerCase();
    const match = allStudents.find(s => (s.studentId || '').trim().toLowerCase() === normMat);
    if (match) addStudent(match);
  }

  // 3. Match by phone or email if provided and valid
  const pPhone = (parentUser.parentPhone || parentUser.phone || '').trim();
  const pEmail = (parentUser.email || '').trim().toLowerCase();

  if (pPhone && pPhone.length >= 8) {
    allStudents.forEach(s => {
      const sp1 = (s.parentPhone || '').trim();
      const sp2 = (s.fatherPhone || '').trim();
      const sp3 = (s.motherPhone || '').trim();
      const sp4 = (s.tutorPhone || '').trim();
      if ((sp1 && sp1 === pPhone) || (sp2 && sp2 === pPhone) || (sp3 && sp3 === pPhone) || (sp4 && sp4 === pPhone)) {
        addStudent(s);
      }
    });
  }

  if (pEmail && pEmail.length >= 5 && pEmail.includes('@')) {
    allStudents.forEach(s => {
      const se = (s.parentEmail || '').trim().toLowerCase();
      if (se && se === pEmail) {
        addStudent(s);
      }
    });
  }

  return foundStudents;
}

/**
 * Check if a given student is a child of the current parent user.
 */
export function isParentChild(parentUser: User | null | undefined, student: Student | null | undefined, allStudents: Student[] = []): boolean {
  if (!parentUser || !student) return false;
  if (parentUser.role !== 'parent') return true; // Non-parent users are not restricted by parent child ownership
  
  const sMat = (student.studentId || (student as any).matricule || '').trim().toLowerCase();
  const sName = (student.name || '').trim().toLowerCase();
  const sId = student.id;

  // 1. Direct check on parentUser.children array
  if (Array.isArray(parentUser.children) && parentUser.children.length > 0) {
    for (const child of parentUser.children) {
      const cMat = (child.matricule || child.studentId || '').trim().toLowerCase();
      const cName = (child.name || '').trim().toLowerCase();
      
      if (cMat && sMat && cMat === sMat) return true;
      if (cName && sName && cName === sName) return true;
    }
  }

  // 2. Check parentUser.matricule (if parent registered with single child matricule)
  if (parentUser.matricule && parentUser.matricule.trim()) {
    const pMat = parentUser.matricule.trim().toLowerCase();
    if (sMat && pMat === sMat) return true;
  }

  // 3. Match against getParentChildren list (strict exact ID/matricule/name or explicit phone match)
  const myChildren = getParentChildren(parentUser, allStudents);
  if (myChildren.some(c => 
    (sId && c.id === sId) ||
    (c.studentId && sMat && c.studentId.trim().toLowerCase() === sMat) ||
    (c.name && sName && c.name.trim().toLowerCase() === sName)
  )) {
    return true;
  }

  return false;
}
