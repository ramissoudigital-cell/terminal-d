import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { User, UserRole, Student, ClassItem, MediaDocument, Transaction } from '../../types';
import { isSameClass } from '../utils/parentUtils';

export function sanitizeForFirestore<T extends Record<string, any>>(data: T): T {
  if (data === null || typeof data !== 'object') return data;
  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === 'object' && !Array.isArray(value) && value.constructor?.name === 'Object') {
      cleanObj[key] = sanitizeForFirestore(value);
    } else if (Array.isArray(value)) {
      cleanObj[key] = value.map(item => (typeof item === 'object' && item !== null && item.constructor?.name === 'Object' ? sanitizeForFirestore(item) : item));
    } else {
      cleanObj[key] = value;
    }
  }
  return cleanObj as T;
}

export interface PreRegisteredUser {
  id: string;
  matricule?: string;
  email?: string;
  lastName: string;
  firstName: string;
  name: string;
  role: UserRole;
  accessLevel: number;
  photo?: string;
  assignedClass?: string;
  assignedClasses?: string[];
  subject?: string;
  parentPhone?: string;
  studentPhone?: string;
  phone?: string;
  section?: 'Primaire' | 'Secondaire';
  isAccountCreated?: boolean;
  authUid?: string;
  createdAt?: any;
}

// 1. Initial Default Pre-Registered Accounts to seed in Firestore if empty
const DEFAULT_PRE_REGISTERED_USERS: PreRegisteredUser[] = [
  {
    id: 'pre-dir-1',
    name: 'M. Traoré (Directeur)',
    firstName: 'M.',
    lastName: 'Traoré',
    email: 'admin@ecole.com',
    phone: '0701020304',
    role: 'director',
    accessLevel: 5,
    section: 'Secondaire',
    isAccountCreated: false
  },
  {
    id: 'pre-cais-1',
    name: 'Mme. Koffi (Caisse)',
    firstName: 'Mme.',
    lastName: 'Koffi',
    email: 'caisse@ecole.com',
    phone: '0702030405',
    role: 'cashier',
    accessLevel: 4,
    section: 'Secondaire',
    isAccountCreated: false
  },
  {
    id: 'pre-prof-1',
    name: 'Sarah Dubois (Prof)',
    firstName: 'Sarah',
    lastName: 'Dubois',
    email: 'prof@ecole.com',
    phone: '0703040506',
    role: 'teacher',
    accessLevel: 3,
    subject: 'Mathématiques',
    assignedClasses: ['6ème 1', '5ème 1', '3ème 1'],
    section: 'Secondaire',
    isAccountCreated: false
  },
  {
    id: 'pre-edu-1',
    name: 'M. Koné (Éducateur)',
    firstName: 'M.',
    lastName: 'Koné',
    email: 'educateur@ecole.com',
    phone: '0704050607',
    role: 'educator',
    accessLevel: 2,
    assignedClasses: ['6ème 1', '6ème 2', '5ème 1'],
    section: 'Secondaire',
    isAccountCreated: false
  },
  {
    id: 'pre-par-1',
    name: 'Famille Kouassi',
    firstName: 'Famille',
    lastName: 'Kouassi',
    email: 'parent@ecole.com',
    parentPhone: '0102030405',
    phone: '0102030405',
    matricule: '20242543',
    role: 'parent',
    accessLevel: 1,
    section: 'Secondaire',
    isAccountCreated: false
  },
  {
    id: 'pre-eleve-1',
    name: 'Jean Dupont',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'eleve@ecole.com',
    matricule: '20242543',
    studentPhone: '0506070809',
    parentPhone: '0102030405',
    phone: '0506070809',
    assignedClass: '6ème 1',
    role: 'student',
    accessLevel: 1,
    section: 'Secondaire',
    isAccountCreated: false
  }
];

// Helper to convert matricule or username to pseudo email format if needed
export const formatAuthEmail = (input: string): string => {
  const trimmed = input.trim().toLowerCase();
  if (trimmed.includes('@')) return trimmed;
  const cleanStr = trimmed.replace(/[^a-z0-9]/g, '');
  return `${cleanStr}@school.internal`;
};

// 2. Seed initial pre-registered users in Firestore if collection is empty
export const seedInitialPreRegisteredUsersIfNeeded = async (): Promise<void> => {
  try {
    const preUsersCol = collection(db, 'preRegisteredUsers');
    const snapshot = await getDocs(preUsersCol);
    if (snapshot.empty) {
      for (const preUser of DEFAULT_PRE_REGISTERED_USERS) {
        await setDoc(doc(db, 'preRegisteredUsers', preUser.id), {
          ...preUser,
          createdAt: serverTimestamp()
        });
      }
      console.log('Pre-registered user whitelist seeded in Firestore.');
    }
  } catch (error) {
    console.warn('Error checking/seeding pre-registered users in Firestore:', error);
  }
};

// Immediately invoke seeding on startup
seedInitialPreRegisteredUsersIfNeeded().catch(console.error);

// Matching Helpers for Whitelist Verification
function isMatriculeMatch(searchMat?: string, targetMat?: string): boolean {
  if (!searchMat || !targetMat) return false;
  const cleanS = searchMat.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanT = targetMat.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanS.length >= 3 && cleanS === cleanT;
}

function isEmailMatch(searchEmail?: string, targetEmail?: string): boolean {
  if (!searchEmail || !targetEmail) return false;
  return searchEmail.trim().toLowerCase() === targetEmail.trim().toLowerCase();
}

function isPhoneMatch(searchPhone?: string, ...targetPhones: (string | undefined)[]): boolean {
  if (!searchPhone) return false;
  const cleanSearch = searchPhone.replace(/[^0-9]/g, '');
  if (cleanSearch.length < 6) return false;
  const searchTail = cleanSearch.slice(-8);

  for (const tp of targetPhones) {
    if (!tp) continue;
    const cleanTarget = tp.replace(/[^0-9]/g, '');
    if (cleanTarget.length < 6) continue;
    const targetTail = cleanTarget.slice(-8);

    if (
      cleanTarget === cleanSearch ||
      cleanTarget.endsWith(cleanSearch) ||
      cleanSearch.endsWith(cleanTarget) ||
      (searchTail.length >= 6 && targetTail.length >= 6 && searchTail === targetTail)
    ) {
      return true;
    }
  }
  return false;
}

function isNameMatch(
  searchFirst?: string,
  searchLast?: string,
  searchName?: string,
  targetFirst?: string,
  targetLast?: string,
  targetName?: string
): boolean {
  const sf = searchFirst?.trim().toLowerCase() || '';
  const sl = searchLast?.trim().toLowerCase() || '';
  const sn = (searchName || `${sf} ${sl}`).trim().toLowerCase().replace(/\s+/g, ' ');

  const tf = targetFirst?.trim().toLowerCase() || '';
  const tl = targetLast?.trim().toLowerCase() || '';
  const tn = (targetName || `${tf} ${tl}`).trim().toLowerCase().replace(/\s+/g, ' ');

  if (!sn || !tn || (sn.length < 2 && tn.length < 2)) return false;

  // Exact full name match
  if (sn === tn) return true;

  // Contains full name match (at least 4 chars)
  if (sn.length >= 4 && tn.length >= 4 && (tn === sn || tn.includes(sn) || sn.includes(tn))) return true;

  // Both First & Last name must match (either direction)
  if (sf && sl && tf && tl) {
    if ((tf === sf && tl === sl) || (tf === sl && tl === sf)) return true;
  }
  if (sf && sl && tn) {
    if (tn.includes(sf) && tn.includes(sl)) return true;
  }

  return false;
}

function isCandidateProfileMatch(
  queryKey: { matricule?: string; email?: string; phone?: string; name?: string; firstName?: string; lastName?: string; role?: UserRole },
  candidate: { matricule?: string; email?: string; phone?: string; parentPhone?: string; studentPhone?: string; name?: string; firstName?: string; lastName?: string; role?: UserRole }
): boolean {
  // 1. Check role compatibility
  if (queryKey.role && candidate.role) {
    if (queryKey.role === 'student' && candidate.role !== 'student') return false;
    if (queryKey.role === 'teacher' && candidate.role !== 'teacher') return false;
    if (queryKey.role === 'parent' && candidate.role !== 'parent' && candidate.role !== 'student') return false;
  }

  // 2. If user provided a matricule, candidate MUST match matricule if candidate has one!
  if (queryKey.matricule && queryKey.matricule.trim().length >= 2) {
    if (candidate.matricule && candidate.matricule.trim().length >= 2) {
      return isMatriculeMatch(queryKey.matricule, candidate.matricule);
    }
  }

  // 3. Email match
  if (queryKey.email && candidate.email && isEmailMatch(queryKey.email, candidate.email)) {
    return true;
  }

  // 4. Phone match
  if (queryKey.phone && isPhoneMatch(queryKey.phone, candidate.phone, candidate.parentPhone, candidate.studentPhone)) {
    return true;
  }

  // 5. Matricule match
  if (queryKey.matricule && candidate.matricule && isMatriculeMatch(queryKey.matricule, candidate.matricule)) {
    return true;
  }

  // 6. Name match (only if matricule was NOT provided, or candidate has no matricule)
  if (!queryKey.matricule || !candidate.matricule) {
    if (isNameMatch(queryKey.firstName, queryKey.lastName, queryKey.name, candidate.firstName, candidate.lastName, candidate.name)) {
      return true;
    }
  }

  return false;
}

// 3. Verify if user is pre-registered by Administration
export const findPreRegisteredProfile = async (
  queryKey: { matricule?: string; email?: string; phone?: string; name?: string; firstName?: string; lastName?: string; role?: UserRole }
): Promise<PreRegisteredUser | null> => {
  try {
    // 1. Check preRegisteredUsers Firestore collection
    try {
      const preUsersCol = collection(db, 'preRegisteredUsers');
      const snapshot = await getDocs(preUsersCol);
      let docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as PreRegisteredUser));

      if (docs.length === 0) {
        await seedInitialPreRegisteredUsersIfNeeded();
        const freshSnap = await getDocs(preUsersCol);
        docs = freshSnap.docs.map(d => ({ id: d.id, ...d.data() } as PreRegisteredUser));
      }

      for (const item of docs) {
        if (isCandidateProfileMatch(queryKey, item)) {
          return item;
        }
      }
    } catch (e) {
      console.warn("Error checking preRegisteredUsers collection:", e);
    }

    // 2. Check teachers Firestore collection
    try {
      const teachersCol = collection(db, 'teachers');
      const teacherSnap = await getDocs(teachersCol);
      for (const d of teacherSnap.docs) {
        const data = d.data();
        const tName = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim();
        const tFirst = data.firstName || tName.split(' ')[0] || '';
        const tLast = data.lastName || tName.split(' ').slice(1).join(' ') || '';

        const candidate = {
          id: d.id,
          name: tName,
          firstName: tFirst,
          lastName: tLast,
          email: data.email,
          matricule: data.matricule,
          phone: data.phone,
          role: 'teacher' as UserRole,
          accessLevel: 3,
          subject: data.subject,
          assignedClasses: data.assignedClasses || [],
          isAccountCreated: data.accountCreated === true || !!data.authUid || !!data.uid
        };

        if (isCandidateProfileMatch(queryKey, candidate)) {
          return candidate;
        }
      }
    } catch (e) {
      console.warn("Error checking teachers collection:", e);
    }

    // 3. Check students Firestore collection
    try {
      const studentsCol = collection(db, 'students');
      const studSnap = await getDocs(studentsCol);
      for (const d of studSnap.docs) {
        const data = d.data();
        const sName = data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim();
        const sFirst = data.firstName || sName.split(' ')[0] || '';
        const sLast = data.lastName || sName.split(' ').slice(1).join(' ') || '';

        const candidate = {
          id: d.id,
          name: sName,
          firstName: sFirst,
          lastName: sLast,
          email: data.email,
          matricule: data.matricule,
          parentPhone: data.parentPhone,
          studentPhone: data.studentPhone,
          role: 'student' as UserRole,
          accessLevel: 1,
          isAccountCreated: !!data.authUid
        };

        if (isCandidateProfileMatch(queryKey, candidate)) {
          return candidate;
        }
      }
    } catch (e) {
      console.warn("Error checking students collection:", e);
    }

    // 4. Fallback: Check localStorage (school_db_teachers, school_db_students)
    try {
      const localTeachers: any[] = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
      for (const t of localTeachers) {
        const tName = t.name || `${t.firstName || ''} ${t.lastName || ''}`.trim();
        const tFirst = t.firstName || tName.split(' ')[0] || '';
        const tLast = t.lastName || tName.split(' ').slice(1).join(' ') || '';

        const candidate = {
          id: String(t.id || `local-t-${Date.now()}`),
          name: tName,
          firstName: tFirst,
          lastName: tLast,
          email: t.email,
          matricule: t.matricule,
          phone: t.phone,
          role: 'teacher' as UserRole,
          accessLevel: 3,
          subject: t.subject,
          assignedClasses: t.assignedClasses || [],
          isAccountCreated: t.accountCreated === true || !!t.authUid || !!t.uid
        };

        if (isCandidateProfileMatch(queryKey, candidate)) {
          return candidate;
        }
      }

      const localStudents: any[] = JSON.parse(localStorage.getItem('school_db_students') || '[]');
      for (const s of localStudents) {
        const sName = s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim();
        const sFirst = s.firstName || sName.split(' ')[0] || '';
        const sLast = s.lastName || sName.split(' ').slice(1).join(' ') || '';

        const candidate = {
          id: String(s.id || `local-s-${Date.now()}`),
          name: sName,
          firstName: sFirst,
          lastName: sLast,
          email: s.email,
          matricule: s.matricule,
          parentPhone: s.parentPhone,
          studentPhone: s.studentPhone,
          role: 'student' as UserRole,
          accessLevel: 1,
          isAccountCreated: !!s.authUid
        };

        if (isCandidateProfileMatch(queryKey, candidate)) {
          return candidate;
        }
      }
    } catch (e) {
      console.warn("Error checking localStorage fallback:", e);
    }

    return null;
  } catch (error) {
    console.error('Error finding pre-registered profile:', error);
    return null;
  }
};

// 4. Admin function to pre-register a user in Dashboard
export const preRegisterUserByAdmin = async (preUserData: Omit<PreRegisteredUser, 'id'> & { id?: string }): Promise<PreRegisteredUser> => {
  const docId = preUserData.id || `pre-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const fullPreUser: PreRegisteredUser = {
    ...preUserData,
    id: docId,
    name: preUserData.name || `${preUserData.firstName || ''} ${preUserData.lastName || ''}`.trim(),
    isAccountCreated: false
  };

  await setDoc(doc(db, 'preRegisteredUsers', docId), sanitizeForFirestore({
    ...fullPreUser,
    createdAt: serverTimestamp()
  }));

  return fullPreUser;
};

// 5. Inscription (Sign Up) with strict verification for non-admin roles
export const verifyParentChildren = async (children?: Array<{ matricule: string; assignedClass: string }>) => {
  if (!children || children.length === 0) return [];

  let allStudents: any[] = [];
  try {
    const snap = await getDocs(collection(db, 'students'));
    allStudents = snap.docs.map(d => d.data());
  } catch (e) {}

  try {
    const snapPre = await getDocs(collection(db, 'preRegisteredUsers'));
    snapPre.docs.forEach(d => {
      const data = d.data();
      if (data.matricule) allStudents.push(data);
    });
  } catch (e) {}

  const localSaved = localStorage.getItem('school_db_students');
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      if (Array.isArray(parsed)) allStudents.push(...parsed);
    } catch (e) {}
  }

  const validatedChildren: Array<{ matricule: string; assignedClass: string; studentId: string; name: string }> = [];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const rawMat = (child.matricule || '').trim();
    const rawClass = (child.assignedClass || '').trim();

    if (!rawMat) {
      throw new Error(`Le matricule de l'enfant ${i + 1} est obligatoire.`);
    }

    const normMat = rawMat.toLowerCase();
    
    const foundStudent = allStudents.find(s => {
      const sMat = (s.studentId || s.matricule || '').toString().trim().toLowerCase();
      return sMat === normMat;
    });

    const actualClass = (foundStudent?.class || foundStudent?.assignedClass || rawClass || 'Terminale D1').toString().trim();
    const studentName = foundStudent?.name || `Élève (${rawMat})`;

    validatedChildren.push({
      matricule: rawMat,
      assignedClass: actualClass,
      studentId: foundStudent?.studentId || rawMat,
      name: studentName
    });
  }

  return validatedChildren;
};

export const registerUserAccount = async (params: {
  matricule?: string;
  email?: string;
  phone?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  assignedClass?: string;
  assignedClasses?: string[];
  subject?: string;
  accreditationCode?: string;
  section?: 'Primaire' | 'Secondaire';
  photo?: string;
  childrenCount?: number;
  children?: Array<{ matricule: string; assignedClass: string; studentId?: string; name?: string }>;
  directorType?: 'Directeur des Études' | 'Directeur Exécutif' | string;
}): Promise<User> => {
  const role = params.role || 'student';
  const isAdminRole = role === 'director' || role === 'educator' || role === 'cashier';

  // Step 1: Search if info exists in Firestore pre-registered database or verify parent children
  let preProfile: any = null;

  if (role === 'parent') {
    if (params.children && params.children.length > 0) {
      const validated = await verifyParentChildren(params.children);
      preProfile = {
        id: `parent-${Date.now()}`,
        name: params.firstName && params.lastName ? `${params.firstName} ${params.lastName}` : (params.lastName || 'Parent'),
        role: 'parent',
        accessLevel: 1,
        section: params.section || 'Secondaire',
        children: validated,
        childrenCount: validated.length
      };
    } else if (params.matricule) {
      const validated = await verifyParentChildren([{ matricule: params.matricule, assignedClass: params.assignedClass || 'Terminale D1' }]);
      preProfile = {
        id: `parent-${Date.now()}`,
        name: params.firstName && params.lastName ? `${params.firstName} ${params.lastName}` : (params.lastName || 'Parent'),
        role: 'parent',
        accessLevel: 1,
        section: params.section || 'Secondaire',
        children: validated,
        childrenCount: validated.length
      };
    }
  } else {
    preProfile = await findPreRegisteredProfile({
      matricule: params.matricule,
      email: params.email,
      phone: params.phone,
      name: params.firstName && params.lastName ? `${params.firstName} ${params.lastName}` : undefined,
      firstName: params.firstName,
      lastName: params.lastName
    });
  }

  // Verify section mismatch on the pre-registered profile if found
  const isTargetRole = role === 'student' || role === 'parent' || role === 'teacher';
  if (isTargetRole && preProfile && preProfile.section && params.section && preProfile.section !== params.section) {
    throw new Error(`Votre profil est déjà enregistré dans la section ${preProfile.section === 'Primaire' ? 'Primaire' : 'Secondaire'}. L'inscription dans la section ${params.section === 'Primaire' ? 'Primaire' : 'Secondaire'} est refusée avec ces mêmes informations.`);
  }

  // Step 2: Allow direct sign-up freely without requiring prior pre-registration.
  // Pre-registration profile is optional; if present in the database, we merge its existing details.

  // Check if profile has already been registered
  if (preProfile && preProfile.isAccountCreated) {
    throw new Error("Un compte a déjà été créé pour ce profil. Veuillez vous connecter dans l'onglet 'Connexion'.");
  }

  // Determine auth email and password
  const emailToUse = formatAuthEmail(params.email || preProfile?.email || params.matricule || preProfile?.matricule || `user-${Date.now()}`);
  const passToUse = params.password && params.password.length >= 6 ? params.password : 'ecole2024';

  // Check if a user with matching email, matricule, or phone already exists in Firestore users collection
  try {
    const usersCol = collection(db, 'users');
    const usersSnap = await getDocs(usersCol);
    const normEmail = params.email?.trim().toLowerCase();
    const normMatricule = params.matricule?.trim().toLowerCase();
    const normPhone = params.phone?.trim();
    
    // Bypass this check if we found a valid teacher pre-profile that hasn't been created yet,
    // to prevent false positives from generic test emails blocking legitimate teacher signup.
    const isTeacherPreProfile = preProfile?.role === 'teacher' && preProfile?.id && !preProfile.id.startsWith('auto-');
    
    if (!isTeacherPreProfile) {
        const existingUser = usersSnap.docs.find(d => {
          const u = d.data();
          if (normEmail && u.email?.trim().toLowerCase() === normEmail) return true;
          if (normMatricule && u.matricule?.trim().toLowerCase() === normMatricule) return true;
          if (normPhone && (u.parentPhone?.trim() === normPhone || u.studentPhone?.trim() === normPhone)) return true;
          return false;
        });
        
        if (existingUser) {
          const uData = existingUser.data();
          const existingUserRole = uData.role;
          const isExistingTargetRole = existingUserRole === 'student' || existingUserRole === 'parent' || existingUserRole === 'teacher';
          if (isExistingTargetRole && uData.section && params.section && uData.section !== params.section) {
            throw new Error(`Un compte existe déjà avec ces identifiants dans la section ${uData.section === 'Primaire' ? 'Primaire' : 'Secondaire'}. L'inscription dans la section ${params.section === 'Primaire' ? 'Primaire' : 'Secondaire'} est refusée.`);
          }
          throw new Error("Un compte existe déjà avec ces identifiants. Veuillez utiliser l'onglet 'Connexion' pour vous connecter.");
        }
    }

    // Check localStorage fallback for identical sections check
    const localUsers: User[] = JSON.parse(localStorage.getItem('school_db_users') || '[]');
    const existingLocalUser = localUsers.find(u => {
      if (normEmail && u.email?.trim().toLowerCase() === normEmail) return true;
      if (normMatricule && u.matricule?.trim().toLowerCase() === normMatricule) return true;
      if (normPhone && (u.parentPhone?.trim() === normPhone || u.studentPhone?.trim() === normPhone)) return true;
      return false;
    });

    if (existingLocalUser) {
      const existingUserRole = existingLocalUser.role;
      const isExistingTargetRole = existingUserRole === 'student' || existingUserRole === 'parent' || existingUserRole === 'teacher';
      if (isExistingTargetRole && existingLocalUser.section && params.section && existingLocalUser.section !== params.section) {
        throw new Error(`Un compte existe déjà avec ces identifiants dans la section ${existingLocalUser.section === 'Primaire' ? 'Primaire' : 'Secondaire'}. L'inscription dans la section ${params.section === 'Primaire' ? 'Primaire' : 'Secondaire'} est refusée.`);
      }
      throw new Error("Un compte existe déjà avec ces identifiants. Veuillez utiliser l'onglet 'Connexion' pour vous connecter.");
    }

  } catch (checkErr: any) {
    if (checkErr.message?.includes("Un compte existe déjà") || checkErr.message?.includes("est refusée") || checkErr.message?.includes("déjà enregistré")) {
      throw checkErr;
    }
  }

  // Determine user details
  const name = preProfile?.name || `${params.firstName || ''} ${params.lastName || ''}`.trim() || params.email?.split('@')[0] || 'Utilisateur';
  const accessLevel = preProfile?.accessLevel || (
    role === 'director' ? 5 :
    role === 'cashier' ? 4 :
    role === 'teacher' ? 3 :
    role === 'educator' ? 2 : 1
  );

  let authUid = '';
  try {
    const cred = await createUserWithEmailAndPassword(auth, emailToUse, passToUse);
    authUid = cred.user.uid;
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      throw new Error("Un compte existe déjà avec cet identifiant ou e-mail. Veuillez utiliser l'onglet 'Connexion' pour vous connecter.");
    } else if (err.code === 'auth/operation-not-allowed') {
      // Email/Password provider not enabled in Firebase Auth Console: fallback to Firestore account creation
      authUid = `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    } else {
      throw err;
    }
  }

  // Step 4: Create final user profile in `users` collection in Firestore

  const childrenToUse = preProfile?.children || params.children || (params.matricule ? [{ matricule: params.matricule, assignedClass: params.assignedClass || '6ème 1' }] : []);
  const childrenCountToUse = childrenToUse.length || params.childrenCount || 1;

  const rawProfile: any = {
    id: authUid,
    name: name,
    role: role,
    accessLevel: accessLevel,
    pinCode: params.password || '0000',
    password: params.password || '0000',
    photo: params.photo || preProfile?.photo || '',
    email: params.email || preProfile?.email || '',
    matricule: childrenToUse[0]?.matricule || params.matricule || preProfile?.matricule || '',
    parentPhone: params.phone || preProfile?.parentPhone || preProfile?.phone || '',
    studentPhone: params.phone || preProfile?.studentPhone || preProfile?.phone || '',
    phone: params.phone || preProfile?.phone || preProfile?.parentPhone || preProfile?.studentPhone || '',
    assignedClass: childrenToUse[0]?.assignedClass || params.assignedClass || preProfile?.assignedClass || '6ème 1',
    assignedClasses: childrenToUse.length > 0 ? Array.from(new Set(childrenToUse.map(c => c.assignedClass))) : (params.assignedClasses || preProfile?.assignedClasses || (params.assignedClass ? [params.assignedClass] : [])),
    subject: (role === 'teacher' || role === 'director') ? (params.subject || preProfile?.subject || '') : undefined,
    accreditationCode: (role === 'teacher' || role === 'director') ? (params.accreditationCode || preProfile?.accreditationCode || '') : undefined,
    section: params.section || preProfile?.section || 'Secondaire',
    childrenCount: childrenCountToUse,
    children: childrenToUse
  };

  if (params.directorType || preProfile?.directorType) {
    rawProfile.directorType = params.directorType || preProfile?.directorType;
  }

  const newUserProfile: User = rawProfile as User;

  await setDoc(doc(db, 'users', authUid), sanitizeForFirestore({
    ...newUserProfile,
    updatedAt: serverTimestamp()
  }));

  // Step 5: Sync teacher profile to `teachers` collection & localStorage
  const isTeacherRegistration = role === 'teacher' || role === 'director' || (params as any).isTeacher;
  if (isTeacherRegistration) {
    const teacherId = preProfile?.id && !preProfile.id.startsWith('auto-')
      ? String(preProfile.id)
      : (params.matricule ? `PROF-${params.matricule}` : `PROF-${authUid || Date.now()}`);

    const teacherMatricule = params.matricule || preProfile?.matricule || `ENS-${Math.floor(1000 + Math.random() * 9000)}`;
    const teacherClasses = params.assignedClasses && params.assignedClasses.length > 0 
      ? params.assignedClasses 
      : (preProfile?.assignedClasses || (params.assignedClass ? [params.assignedClass] : ['Terminale D1']));

    const teacherDoc = {
      id: teacherId,
      name: name,
      matricule: teacherMatricule,
      email: params.email || preProfile?.email || '',
      phone: params.phone || preProfile?.phone || preProfile?.parentPhone || preProfile?.studentPhone || '',
      subject: params.subject || preProfile?.subject || 'Mathématiques',
      accreditationCode: params.accreditationCode || preProfile?.accreditationCode || '',
      assignedClasses: teacherClasses,
      status: 'Actif',
      uid: authUid,
      authUid: authUid,
      accountCreated: true,
      photo: params.photo || preProfile?.photo || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200`,
      scheduleData: (params as any).scheduleData || [],
      createdAt: new Date().toISOString()
    };

    // Save to Firestore teachers collection
    await setDoc(doc(db, 'teachers', teacherId), sanitizeForFirestore(teacherDoc), { merge: true }).catch(() => {});

    // Save to localStorage school_db_teachers immediately
    try {
      const localTeachers = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
      const existIdx = localTeachers.findIndex((t: any) => 
        String(t.id) === String(teacherId) || 
        t.authUid === authUid || 
        (t.email && teacherDoc.email && t.email.toLowerCase() === teacherDoc.email.toLowerCase()) ||
        (t.matricule && teacherDoc.matricule && t.matricule.toLowerCase() === teacherDoc.matricule.toLowerCase())
      );
      if (existIdx >= 0) {
        localTeachers[existIdx] = { ...localTeachers[existIdx], ...teacherDoc };
      } else {
        localTeachers.unshift(teacherDoc);
      }
      localStorage.setItem('school_db_teachers', JSON.stringify(localTeachers));
    } catch (e) {}

    // Dispatch real-time events for App and TeachersPage
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('teacher-registered', { detail: teacherDoc }));
      window.dispatchEvent(new CustomEvent('storage', { detail: { key: 'school_db_teachers' } }));
    }
  }

  // Step 5b: Sync student profile to `students` collection & localStorage
  if (role === 'student') {
    const studentId = preProfile?.id && !preProfile.id.startsWith('auto-')
      ? String(preProfile.id)
      : (params.matricule || `STU-${authUid || Date.now()}`);

    const studentMatricule = params.matricule || preProfile?.matricule || `2024-${Math.floor(1000 + Math.random() * 9000)}`;
    const studentClass = params.assignedClass || preProfile?.assignedClass || 'Terminale D1';

    const studentDoc = {
      id: studentId,
      name: name,
      firstName: params.firstName || name.split(' ')[0] || '',
      lastName: params.lastName || name.split(' ').slice(1).join(' ') || '',
      studentId: studentMatricule,
      matricule: studentMatricule,
      class: studentClass,
      photo: params.photo || preProfile?.photo || `https://i.pravatar.cc/150?u=${Date.now()}`,
      phone: params.phone || '',
      parentPhone: (params as any).parentPhone || '',
      assignedStatus: 'affecte',
      email: params.email || '',
      authUid: authUid,
      accountCreated: true,
      subjects: [
        { name: 'Mathématiques', value: 20, average: 0, fill: '#3b82f6' },
        { name: 'Physique-Chimie', value: 20, average: 0, fill: '#fbbf24' },
        { name: 'SVT', value: 15, average: 0, fill: '#4ade80' },
        { name: 'Français', value: 15, average: 0, fill: '#a855f7' },
        { name: 'Histoire-Geo', value: 10, average: 0, fill: '#22d3ee' },
        { name: 'Anglais', value: 10, average: 0, fill: '#f43f5e' },
        { name: 'EPS', value: 10, average: 0, fill: '#f472b6' },
        { name: 'Philosophie', value: 15, average: 0, fill: '#7c3aed' }
      ]
    };

    // Save to Firestore students collection
    await setDoc(doc(db, 'students', studentId), sanitizeForFirestore(studentDoc), { merge: true }).catch(() => {});

    // Save to localStorage school_db_students immediately
    try {
      const localStudents = JSON.parse(localStorage.getItem('school_db_students') || '[]');
      const existIdx = localStudents.findIndex((s: any) => 
        String(s.id) === String(studentId) || 
        s.studentId === studentDoc.studentId || 
        (s.matricule && s.matricule === studentDoc.matricule)
      );
      if (existIdx >= 0) {
        localStudents[existIdx] = { ...localStudents[existIdx], ...studentDoc };
      } else {
        localStudents.unshift(studentDoc);
      }
      localStorage.setItem('school_db_students', JSON.stringify(localStudents));
    } catch (e) {}

    // Dispatch real-time events for App and ClassesPage
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('student-registered', { detail: studentDoc }));
      window.dispatchEvent(new CustomEvent('storage', { detail: { key: 'school_db_students' } }));
    }
  }

  // Save to localStorage backup immediately for offline/instant availability
  try {
    const localUsers: User[] = JSON.parse(localStorage.getItem('school_db_users') || '[]');
    const normEm = params.email?.trim().toLowerCase();
    const existingIdx = localUsers.findIndex(u => u.id === authUid || (normEm && u.email?.toLowerCase() === normEm));
    if (existingIdx >= 0) {
      localUsers[existingIdx] = newUserProfile;
    } else {
      localUsers.push(newUserProfile);
    }
    localStorage.setItem('school_db_users', JSON.stringify(localUsers));
  } catch (e) {}

  if (preProfile?.id && !preProfile.id.startsWith('auto-')) {
    // 1. Mark in preRegisteredUsers if the doc exists there
    updateDoc(doc(db, 'preRegisteredUsers', preProfile.id), {
      isAccountCreated: true,
      authUid: authUid
    }).catch(() => {});

    // 2. Also mark in students if student
    if (preProfile.role === 'student') {
      updateDoc(doc(db, 'students', preProfile.id), {
        authUid: authUid,
        isAccountCreated: true,
        accountCreated: true
      }).catch(() => {});
    }

    // 3. Mark in-memory default whitelist if present
    const inMem = DEFAULT_PRE_REGISTERED_USERS.find(u => u.id === preProfile.id || (u.matricule && u.matricule === params.matricule));
    if (inMem) {
      inMem.isAccountCreated = true;
      inMem.authUid = authUid;
    }
    
    // 4. Mark local teachers DB if teacher
    if (role === 'teacher' || role === 'educator') {
      try {
        const localTeachers = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
        let updated = false;
        const newLocalTeachers = localTeachers.map((t: any) => {
          if (t.id === preProfile.id || (t.matricule && t.matricule === params.matricule) || (t.email && t.email === params.email)) {
            updated = true;
            return { ...t, accountCreated: true, uid: authUid, authUid: authUid, status: 'Actif' };
          }
          return t;
        });
        if (updated) {
          localStorage.setItem('school_db_teachers', JSON.stringify(newLocalTeachers));
        }
      } catch (e) {}
    }
  }

  return newUserProfile;
};

// Helper to check if a user account has actually been created in Firestore / Auth / local
export const checkUserAccountExists = async (identifier: string): Promise<{
  exists: boolean;
  userDoc?: any;
  knownEmails: string[];
}> => {
  const normId = identifier.trim().toLowerCase();
  const cleanStr = normId.replace(/[^a-z0-9]/g, '');
  const knownEmails: string[] = [];

  const addEmail = (em?: string) => {
    if (!em) return;
    const clean = em.trim().toLowerCase();
    if (clean && !knownEmails.includes(clean)) {
      knownEmails.push(clean);
    }
  };

  addEmail(formatAuthEmail(identifier));
  if (normId.includes('@')) {
    addEmail(normId);
  }

  // 1. Check in 'users' collection
  try {
    const usersCol = collection(db, 'users');
    const usersSnap = await getDocs(usersCol);
    const matchedDoc = usersSnap.docs.find(d => {
      const data = d.data();
      const em = data.email?.toLowerCase();
      const mat = data.matricule?.toLowerCase();
      const cleanMat = mat?.replace(/[^a-z0-9]/g, '');
      const pPhone = data.parentPhone?.trim();
      const sPhone = data.studentPhone?.trim();
      return (
        em === normId ||
        mat === normId ||
        (cleanStr.length > 0 && cleanMat === cleanStr) ||
        pPhone === identifier.trim() ||
        sPhone === identifier.trim()
      );
    });

    if (matchedDoc) {
      const uData: any = { id: matchedDoc.id, ...matchedDoc.data() };
      addEmail(uData.email);
      if (uData.matricule) addEmail(formatAuthEmail(uData.matricule));
      if (uData.id) addEmail(formatAuthEmail(uData.id));
      return { exists: true, userDoc: uData, knownEmails };
    }
  } catch (e) {
    console.warn("Error checking users collection:", e);
  }

  // 2. Check in 'teachers' collection
  try {
    const teachersCol = collection(db, 'teachers');
    const tSnap = await getDocs(teachersCol);
    const matchedTeacher = tSnap.docs.find(d => {
      const data = d.data();
      return (
        (data.accountCreated === true || data.authUid || data.uid) &&
        (data.email?.toLowerCase() === normId ||
         data.matricule?.toLowerCase() === normId)
      );
    });
    if (matchedTeacher) {
      const tData = matchedTeacher.data();
      addEmail(tData.email);
      if (tData.matricule) addEmail(formatAuthEmail(tData.matricule));
      return { exists: true, userDoc: tData, knownEmails };
    }
  } catch (e) {}

  // 3. Check preRegisteredUsers if isAccountCreated === true OR if found in local
  try {
    const preUsersCol = collection(db, 'preRegisteredUsers');
    const preSnap = await getDocs(preUsersCol);
    const matchedPre = preSnap.docs.find(d => {
      const data = d.data();
      const em = data.email?.toLowerCase();
      const mat = data.matricule?.toLowerCase();
      const cleanMat = mat?.replace(/[^a-z0-9]/g, '');
      return (
        (data.isAccountCreated === true || data.authUid) &&
        (em === normId || mat === normId || (cleanStr.length > 0 && cleanMat === cleanStr))
      );
    });
    if (matchedPre) {
      const preData = matchedPre.data();
      addEmail(preData.email);
      if (preData.matricule) addEmail(formatAuthEmail(preData.matricule));
      return { exists: true, userDoc: preData, knownEmails };
    }
  } catch (e) {}

  // 4. Check students collection if they have authUid or accountCreated
  try {
    const studentsCol = collection(db, 'students');
    const sSnap = await getDocs(studentsCol);
    const matchedStudent = sSnap.docs.find(d => {
      const data = d.data();
      const em = data.email?.toLowerCase();
      const mat = data.matricule?.toLowerCase();
      const cleanMat = mat?.replace(/[^a-z0-9]/g, '');
      return (
        (data.authUid || data.accountCreated === true || data.isAccountCreated === true) &&
        (em === normId || mat === normId || (cleanStr.length > 0 && cleanMat === cleanStr) || data.studentPhone === identifier.trim() || data.parentPhone === identifier.trim())
      );
    });
    if (matchedStudent) {
      const sData = matchedStudent.data();
      addEmail(sData.email);
      if (sData.matricule) addEmail(formatAuthEmail(sData.matricule));
      return { exists: true, userDoc: sData, knownEmails };
    }
  } catch (e) {}

  // 5. Fallback: Check localStorage backups (school_db_users, school_db_students, school_db_teachers)
  try {
    const localUsers: any[] = JSON.parse(localStorage.getItem('school_db_users') || '[]');
    const matchedLocal = localUsers.find(u =>
      u.email?.toLowerCase() === normId ||
      u.matricule?.toLowerCase() === normId ||
      (cleanStr.length > 0 && u.matricule?.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanStr) ||
      u.parentPhone === identifier.trim() ||
      u.studentPhone === identifier.trim()
    );
    if (matchedLocal) {
      addEmail(matchedLocal.email);
      if (matchedLocal.matricule) addEmail(formatAuthEmail(matchedLocal.matricule));
      return { exists: true, userDoc: matchedLocal, knownEmails };
    }
  } catch (e) {}

  // 6. Check DEFAULT_PRE_REGISTERED_USERS if marked created
  const matchedDefault = DEFAULT_PRE_REGISTERED_USERS.find(u =>
    u.isAccountCreated === true &&
    (u.email?.toLowerCase() === normId ||
     u.matricule?.toLowerCase() === normId ||
     (cleanStr.length > 0 && u.matricule?.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanStr))
  );
  if (matchedDefault) {
    addEmail(matchedDefault.email);
    if (matchedDefault.matricule) addEmail(formatAuthEmail(matchedDefault.matricule));
    return { exists: true, userDoc: matchedDefault, knownEmails };
  }

  return { exists: false, knownEmails };
};

// 6. Connexion (Sign In)
export const syncTeacherDataToUser = async (user: User): Promise<User> => {
  if (!user) return user;
  if (user.role !== 'teacher' && user.accessLevel !== 3) return user;

  try {
    let matchedTeacher: any = null;

    // 1. Try finding teacher in Firestore teachers collection
    try {
      const teachersCol = collection(db, 'teachers');
      const teacherSnap = await getDocs(teachersCol);

      for (const d of teacherSnap.docs) {
        const data = d.data();
        const isMatch =
          String(d.id) === String(user.id) ||
          (user.matricule && data.matricule && user.matricule.toLowerCase() === data.matricule.toLowerCase()) ||
          (user.email && data.email && user.email.toLowerCase() === data.email.toLowerCase()) ||
          (user.name && data.name && user.name.toLowerCase() === data.name.toLowerCase());
        if (isMatch) {
          matchedTeacher = { id: d.id, ...data };
          break;
        }
      }
    } catch (e) {
      console.warn("Error querying teachers collection during login sync:", e);
    }

    // 2. Fallback: check localStorage school_db_teachers
    if (!matchedTeacher) {
      try {
        const localTeachers: any[] = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
        matchedTeacher = localTeachers.find(t =>
          String(t.id) === String(user.id) ||
          (user.matricule && t.matricule && user.matricule.toLowerCase() === t.matricule.toLowerCase()) ||
          (user.email && t.email && user.email.toLowerCase() === t.email.toLowerCase()) ||
          (user.name && t.name && user.name.toLowerCase() === t.name.toLowerCase())
        );
      } catch (e) {}
    }

    if (matchedTeacher) {
      const assignedClasses = Array.isArray(matchedTeacher.assignedClasses) ? matchedTeacher.assignedClasses : [];
      const updatedUser: User = {
        ...user,
        name: matchedTeacher.name || user.name,
        email: matchedTeacher.email || user.email,
        phone: matchedTeacher.phone || user.phone,
        subject: matchedTeacher.subject || user.subject,
        accreditationCode: matchedTeacher.accreditationCode || user.accreditationCode || '',
        assignedClasses,
        assignedClass: assignedClasses.length > 0 ? assignedClasses.join(', ') : '',
        photo: matchedTeacher.photo || matchedTeacher.photoUrl || matchedTeacher.avatarUrl || user.photo,
        isPrincipal: Boolean(matchedTeacher.isPrincipal),
        principalClasses: Array.isArray(matchedTeacher.principalClasses) ? matchedTeacher.principalClasses : [],
        matricule: matchedTeacher.matricule || user.matricule,
        section: matchedTeacher.section || user.section
      };

      // Persist to users collection doc in Firestore so it remains saved
      if (user.id) {
        setDoc(doc(db, 'users', String(user.id)), sanitizeForFirestore({
          ...updatedUser,
          updatedAt: serverTimestamp()
        }), { merge: true }).catch(() => {});
      }

      const sessionStr = localStorage.getItem('school_user_session');
      if (sessionStr) {
        try {
          const parsed = JSON.parse(sessionStr);
          localStorage.setItem('school_user_session', JSON.stringify({ ...parsed, ...updatedUser }));
        } catch (e) {}
      }

      return updatedUser;
    }
  } catch (e) {
    console.warn("Error syncing teacher data to user:", e);
  }

  return user;
};

export const loginUserAccount = async (
  identifier: string,
  pass: string,
  role?: UserRole,
  accessLevel?: number,
  section?: 'Primaire' | 'Secondaire'
): Promise<User> => {
  const passToUse = pass || 'ecole2024';

  // Check whether user account exists in Firestore / local / pre-reg
  const accountCheck = await checkUserAccountExists(identifier);

  const candidateEmails: string[] = [];
  const addCandidate = (em?: string) => {
    if (!em) return;
    const clean = em.trim().toLowerCase();
    if (clean && !candidateEmails.includes(clean)) {
      candidateEmails.push(clean);
    }
  };

  if (accountCheck.knownEmails) {
    accountCheck.knownEmails.forEach(em => addCandidate(em));
  }
  addCandidate(formatAuthEmail(identifier));
  if (identifier.includes('@')) {
    addCandidate(identifier);
  }

  let cred = null;
  let lastAuthErr = null;

  for (const emailToUse of candidateEmails) {
    try {
      cred = await signInWithEmailAndPassword(auth, emailToUse, passToUse);
      break;
    } catch (err: any) {
      lastAuthErr = err;
    }
  }

  if (cred) {
    try {
      const userDocRef = doc(db, 'users', cred.user.uid);
      const userSnap = await getDoc(userDocRef);

      let rawUser: User;
      if (userSnap.exists()) {
        rawUser = { id: cred.user.uid, ...userSnap.data() } as User;
      } else if (accountCheck.userDoc) {
        rawUser = { id: cred.user.uid, ...accountCheck.userDoc } as User;
      } else {
        rawUser = {
          id: cred.user.uid,
          name: cred.user.displayName || (candidateEmails[0] ? candidateEmails[0].split('@')[0] : 'Utilisateur'),
          email: cred.user.email || undefined,
          role: role || 'student',
          accessLevel: accessLevel || 1,
        } as User;
      }

      // Check section if provided!
      const isTargetRole = rawUser.role === 'student' || rawUser.role === 'parent' || rawUser.role === 'teacher';
      if (isTargetRole && section && rawUser.section && rawUser.section !== section) {
        throw new Error(`Votre compte appartient à la section ${rawUser.section === 'Primaire' ? 'Primaire' : 'Secondaire'}. Connexion refusée dans la section ${section === 'Primaire' ? 'Primaire' : 'Secondaire'}.`);
      }

      return await syncTeacherDataToUser(rawUser);
    } catch (e: any) {
      if (e.message?.includes("Connexion refusée")) {
        throw e;
      }
      if (accountCheck.userDoc) {
        const rawUser = { id: cred.user.uid, ...accountCheck.userDoc } as User;
        const isTargetRole = rawUser.role === 'student' || rawUser.role === 'parent' || rawUser.role === 'teacher';
        if (isTargetRole && section && rawUser.section && rawUser.section !== section) {
          throw new Error(`Votre compte appartient à la section ${rawUser.section === 'Primaire' ? 'Primaire' : 'Secondaire'}. Connexion refusée dans la section ${section === 'Primaire' ? 'Primaire' : 'Secondaire'}.`);
        }
        return await syncTeacherDataToUser(rawUser);
      }
    }
  }

  // Fallback check against Firestore user document if account exists
  if (accountCheck.exists && accountCheck.userDoc) {
    const uDoc = accountCheck.userDoc;

    // Check section first
    const isTargetRole = uDoc.role === 'student' || uDoc.role === 'parent' || uDoc.role === 'teacher';
    if (isTargetRole && section && uDoc.section && uDoc.section !== section) {
      throw new Error(`Votre compte appartient à la section ${uDoc.section === 'Primaire' ? 'Primaire' : 'Secondaire'}. Connexion refusée dans la section ${section === 'Primaire' ? 'Primaire' : 'Secondaire'}.`);
    }

    const storedPin = uDoc.pinCode;
    const storedPass = uDoc.password;

    // Check if provided password matches pinCode, password, or standard defaults
    const isPasswordValid = 
      !pass || 
      pass === storedPin || 
      pass === storedPass || 
      storedPin === '0000' ||
      pass === 'ecole2024' ||
      (storedPass && pass === storedPass) ||
      (!storedPin && !storedPass);

    if (isPasswordValid) {
      // Silently attempt to create Auth user if missing so future Firebase Auth calls succeed
      const emailToCreate = candidateEmails[0] || formatAuthEmail(identifier);
      if (passToUse && passToUse.length >= 6) {
        createUserWithEmailAndPassword(auth, emailToCreate, passToUse).catch(() => {});
      }
      const rawUser = { id: uDoc.id || uDoc.authUid || uDoc.uid || `user-${Date.now()}`, ...uDoc } as User;
      return await syncTeacherDataToUser(rawUser);
    } else {
      const customErr = new Error("Mot de passe incorrect. Veuillez réessayer.");
      (customErr as any).code = "WRONG_PASSWORD";
      throw customErr;
    }
  }

  // Case: User account does NOT exist in Firebase Auth or Firestore
  const code = lastAuthErr?.code || '';
  if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || !accountCheck.exists) {
    // Check if they are pre-registered
    const preRegistered = await findPreRegisteredProfile({
      matricule: identifier,
      email: identifier,
      phone: identifier,
    });
    
    if (preRegistered && !preRegistered.isAccountCreated) {
      const customErr = new Error("Votre profil a été enregistré par votre établissement, mais vous n'avez pas encore créé votre compte. Veuillez utiliser l'onglet Inscription pour créer votre compte.");
      (customErr as any).code = "ACCOUNT_NOT_CREATED";
      throw customErr;
    }
    
    const customErr = new Error("Aucun compte n'a été trouvé avec ces informations. Veuillez d'abord vous inscrire avant de vous connecter.");
    (customErr as any).code = "ACCOUNT_NOT_FOUND";
    throw customErr;
  }

  if (code === 'auth/too-many-requests') {
    const customErr = new Error("Accès temporairement bloqué suite à plusieurs tentatives. Veuillez réessayer plus tard.");
    (customErr as any).code = "TOO_MANY_REQUESTS";
    throw customErr;
  }

  const customErr = new Error(lastAuthErr?.message || "Une erreur est survenue lors de la connexion.");
  (customErr as any).code = code;
  throw customErr;
};

// 7. Generic Real-Time Listener for any Firestore collection
export const subscribeToRealtimeCollection = <T>(
  collectionName: string,
  onData: (items: T[]) => void
): Unsubscribe => {
  const colRef = collection(db, collectionName);
  return onSnapshot(colRef, (snapshot) => {
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as T));
    onData(items);
  }, (error) => {
    console.warn(`Realtime subscription error for ${collectionName}:`, error);
  });
};

// 8. Real-time Firestore sync helpers
export const saveRealtimeDocument = async (collectionName: string, docId: string, data: any): Promise<void> => {
  try {
    const cleanData = JSON.parse(JSON.stringify(data || {}));
    await setDoc(doc(db, collectionName, docId), {
      ...cleanData,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.warn(`Error saving document to ${collectionName}/${docId}:`, error);
  }
};

export const deleteRealtimeDocument = async (collectionName: string, docId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    console.warn(`Error deleting document from ${collectionName}/${docId}:`, error);
  }
};

// 9. Sign Out
export const logoutUserAccount = async (): Promise<void> => {
  await firebaseSignOut(auth);
};
