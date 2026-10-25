import React, { useState, useRef, useEffect } from 'react';
import { Save, User, Bell, Lock, Camera, CheckCircle, Shield, Smartphone, Mail, Eye, EyeOff, LogOut, Info, Sparkles, GraduationCap, ShieldCheck, Heart, HelpCircle, Globe, Code, CheckCircle2, Zap, Loader2, Trash2, ArrowLeft, BookOpen, KeyRound, RotateCcw, Search, Copy, Check, Palette, Moon, Sun, PenLine, Fingerprint, Delete } from 'lucide-react';
import { User as UserType } from '../types';
import { compressImage, getDefaultAvatar, getRoleLabel } from '../src/utils/userUtils';
import { BilanFinAnnee } from "./BilanFinAnnee";
import { useNotifications } from '../src/hooks/useNotifications';
import { PasswordView } from './PasswordView';
import { verifyBiometricIdentity } from '../src/utils/biometricUtils';
import { 
  ALL_TEACHING_SUBJECTS, 
  getSubjectAccreditationCode, 
  setSubjectAccreditationCode, 
  getAllSubjectAccreditationCodes, 
  DEFAULT_SUBJECT_ACCREDITATION_CODES,
  getTeacherIndividualAccreditationCode,
  setTeacherIndividualAccreditationCode,
  normalizeSubjectKey
} from '../src/utils/accreditationUtils';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../src/lib/firebase';
import { saveRealtimeDocument } from '../src/services/firebaseService';

interface SettingsPageProps {
    onLogout?: () => void;
    currentUser?: UserType | null;
    allStudents?: any[];
    onUpdateAllStudents?: (students: any[]) => void;
    onUpdateUser?: (updated: UserType) => void;
    onNavigate?: (page: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onLogout, currentUser, onUpdateUser, allStudents, onUpdateAllStudents, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isBilanOpen, setIsBilanOpen] = useState(false);

  const { permissionStatus, requestPermissionAndGetToken } = useNotifications();

  // --- DARK MODE STATE ---
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('app_dark_mode') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('app_dark_mode', String(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // --- PROFILE STATE ---
  const [profile, setProfile] = useState({
    name: currentUser?.name || 'Utilisateur',
    email: currentUser?.email || '',
    phone: currentUser?.phone || currentUser?.parentPhone || currentUser?.studentPhone || '',
    bio: currentUser?.bio !== undefined ? currentUser.bio : (currentUser?.subject ? `Enseignant de ${currentUser.subject}` : (currentUser?.assignedClass ? `Classe : ${currentUser.assignedClass}` : 'Membre du Dashboard')),
    photo: currentUser?.photo || getDefaultAvatar(currentUser?.name || 'Utilisateur')
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.name || 'Utilisateur',
        email: currentUser.email || '',
        phone: currentUser.phone || currentUser.parentPhone || currentUser.studentPhone || '',
        bio: currentUser.bio !== undefined ? currentUser.bio : (currentUser.subject ? `Enseignant de ${currentUser.subject}` : (currentUser.assignedClass ? `Classe : ${currentUser.assignedClass}` : 'Membre du Dashboard')),
        photo: currentUser.photo || getDefaultAvatar(currentUser.name || 'Utilisateur')
      });
    }
  }, [currentUser]);

  const userRoleStr = String(currentUser?.role || '').toLowerCase();
  const userLevel = Number(currentUser?.accessLevel || 0);

  // Strict check for students and parents: they must NEVER have access to accreditation or educator/admin tools
  const isStudentOrParent = userRoleStr === 'student' || 
                            userRoleStr === 'élève' || 
                            userRoleStr === 'eleve' || 
                            userRoleStr === 'parent' || 
                            userLevel === 1;

  const isTeacherRole = !isStudentOrParent && (
                        userRoleStr === 'teacher' || 
                        userRoleStr === 'professeur' || 
                        userRoleStr === 'prof' || 
                        userRoleStr === 'enseignant' || 
                        Boolean((currentUser as any)?.isTeacher) ||
                        (Boolean(currentUser?.subject) && userRoleStr !== 'director' && userRoleStr !== 'admin'));

  // isDirector is STRICTLY false for teachers, even if accessLevel === 5 (e.g. registered through Niveau 5 button)
  const isDirector = !isStudentOrParent && !isTeacherRole && (userRoleStr === 'director' || userRoleStr === 'admin' || (userLevel === 5 && !currentUser?.subject));

  const isEducator = !isStudentOrParent && (userRoleStr === 'educator' || 
                     userRoleStr === 'éducateur' || 
                     (currentUser?.accessLevel === 2 && !isDirector && !isTeacherRole));

  const isLevel5 = !isStudentOrParent && (userLevel === 5 || userRoleStr === 'admin' || userRoleStr === 'superadmin' || userRoleStr === 'fondateur');
  const isLevel1To4 = userLevel >= 1 && userLevel <= 4;
  const canLaunchClotureInSettings = isLevel5 && !isLevel1To4 && !isTeacherRole;

  // STRICT ACCESS CONTROL FOR ACCREDITATION:
  // Students and parents must NEVER have access to the accreditation section.
  // Only Teachers (Level 3) and Directors / Admins (Level 5) can access this section.
  const canAccessAccreditation = !isStudentOrParent && !isEducator && (
    isDirector || 
    isTeacherRole || 
    userLevel === 5 || 
    userLevel === 3
  );

  // User teacher subject if applicable (only for teachers)
  const teacherUserSubject = (isTeacherRole ? (currentUser?.subject || (currentUser as any)?.discipline || localStorage.getItem('selected_teacher_subject') || localStorage.getItem('last_teacher_subject')) : '') || 'Mathématiques';

  // --- ACCREDITATION STATE ---
  const [accreditationCodes, setAccreditationCodes] = useState({
      niveau2: localStorage.getItem('acc_niv2') || 'EDU-2024',
      niveau3: localStorage.getItem('acc_niv3') || 'PROF-2024',
      niveau4: localStorage.getItem('acc_niv4') || 'CAIS-2024',
      niveau5: localStorage.getItem('acc_niv5') || 'DIR-2024'
  });

  const [selectedSubjectToEdit, setSelectedSubjectToEdit] = useState<string>(() => {
    if (ALL_TEACHING_SUBJECTS.includes(teacherUserSubject)) {
      return teacherUserSubject;
    }
    return ALL_TEACHING_SUBJECTS[0] || 'Mathématiques';
  });
  const [subjectCodes, setSubjectCodes] = useState<Record<string, string>>(() => getAllSubjectAccreditationCodes());
  const [editingCodeValue, setEditingCodeValue] = useState<string>(() => {
    if (isTeacherRole && !isDirector) {
      return getTeacherIndividualAccreditationCode(currentUser);
    }
    return getSubjectAccreditationCode(teacherUserSubject);
  });
  const [showSubjectCodeSecret, setShowSubjectCodeSecret] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isTeacherRole && !isDirector) {
      const code = getTeacherIndividualAccreditationCode(currentUser);
      setEditingCodeValue(code);
    }
  }, [currentUser, isTeacherRole, isDirector, teacherUserSubject]);

  useEffect(() => {
    if (activeTab === 'accreditation' && !canAccessAccreditation) {
      setActiveTab('profile');
    }
  }, [activeTab, canAccessAccreditation]);

  const handleCopyCode = (code: string) => {
    if (!code) return;
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(code);
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (_) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleSelectSubjectToEdit = (sub: string) => {
    if (!isDirector) {
      return;
    }
    setSelectedSubjectToEdit(sub);
    setEditingCodeValue(getSubjectAccreditationCode(sub));
  };

  const handleSaveSubjectCode = async (sub: string, codeVal: string) => {
    const formatted = (codeVal || '').trim().toUpperCase();
    if (!formatted) {
      alert("Le code d'accréditation ne peut pas être vide.");
      return;
    }

    if (isTeacherRole && !isDirector) {
      // Individual teacher accreditation update
      setTeacherIndividualAccreditationCode(
        { id: currentUser?.id, email: currentUser?.email, subject: teacherUserSubject },
        formatted
      );
      if (teacherUserSubject) {
        setSubjectAccreditationCode(teacherUserSubject, formatted);
      }
      setEditingCodeValue(formatted);

      if (currentUser && onUpdateUser) {
        onUpdateUser({
          ...currentUser,
          accreditationCode: formatted
        });
      }

      // Sync to Firestore users collection in real-time
      try {
        if (currentUser?.id) {
          await saveRealtimeDocument('users', String(currentUser.id), {
            accreditationCode: formatted
          });
        }
      } catch (e) {
        console.warn('Error updating accreditation in Firestore users:', e);
      }

      // Sync to Firestore teachers collection in real-time
      try {
        const teacherDocId = currentUser?.id && !String(currentUser.id).startsWith('PROF-')
          ? `PROF-${currentUser.id}`
          : String(currentUser?.id || '');
        if (teacherDocId) {
          await saveRealtimeDocument('teachers', teacherDocId, {
            accreditationCode: formatted
          });
        }
        if (currentUser?.id && String(currentUser.id) !== teacherDocId) {
          await saveRealtimeDocument('teachers', String(currentUser.id), {
            accreditationCode: formatted
          });
        }
      } catch (e) {}

      // Sync to global real-time accreditation_codes collection
      try {
        const accredKey = currentUser?.id ? String(currentUser.id) : (currentUser?.email ? currentUser.email.replace(/[^a-zA-Z0-9]/g, '_') : 'prof_accred');
        await saveRealtimeDocument('accreditation_codes', accredKey, {
          teacherId: currentUser?.id,
          email: currentUser?.email,
          subject: teacherUserSubject,
          code: formatted,
          updatedAt: Date.now()
        });
      } catch (e) {}

      // Update school_user_session
      try {
        const sess = localStorage.getItem('school_user_session');
        if (sess) {
          const parsed = JSON.parse(sess);
          localStorage.setItem('school_user_session', JSON.stringify({
            ...parsed,
            accreditationCode: formatted
          }));
        }
      } catch (e) {}

      handleSave(`Votre code d'accréditation individuel (${formatted})`);
    } else {
      setSubjectAccreditationCode(sub, formatted);
      setSubjectCodes(getAllSubjectAccreditationCodes());
      setEditingCodeValue(formatted);
      // Sync subject accreditation code to Firestore in real-time
      try {
        await saveRealtimeDocument('accreditation_codes', `subject_${normalizeSubjectKey(sub)}`, {
          subject: sub,
          code: formatted,
          updatedAt: Date.now()
        });
      } catch (e) {}
      handleSave(`Code d'accréditation pour ${sub} (${formatted})`);
    }
  };

  const handleResetSubjectCode = async (sub: string) => {
    const defaultCode = DEFAULT_SUBJECT_ACCREDITATION_CODES[sub] || `${sub.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase()}-2024`;
    if (isTeacherRole && !isDirector) {
      setTeacherIndividualAccreditationCode(
        { id: currentUser?.id, email: currentUser?.email, subject: teacherUserSubject },
        defaultCode
      );
      if (teacherUserSubject) {
        setSubjectAccreditationCode(teacherUserSubject, defaultCode);
      }
      setEditingCodeValue(defaultCode);
      if (currentUser && onUpdateUser) {
        onUpdateUser({
          ...currentUser,
          accreditationCode: defaultCode
        });
      }
      try {
        if (currentUser?.id) {
          await saveRealtimeDocument('users', String(currentUser.id), {
            accreditationCode: defaultCode
          });
          await saveRealtimeDocument('teachers', String(currentUser.id), {
            accreditationCode: defaultCode
          });
          await saveRealtimeDocument('accreditation_codes', String(currentUser.id), {
            teacherId: currentUser.id,
            email: currentUser.email,
            subject: teacherUserSubject,
            code: defaultCode,
            updatedAt: Date.now()
          });
        }
      } catch (e) {}
      handleSave(`Votre code individuel a été réinitialisé (${defaultCode})`);
    } else {
      setSubjectAccreditationCode(sub, defaultCode);
      setSubjectCodes(getAllSubjectAccreditationCodes());
      setEditingCodeValue(defaultCode);
      try {
        await saveRealtimeDocument('accreditation_codes', `subject_${normalizeSubjectKey(sub)}`, {
          subject: sub,
          code: defaultCode,
          updatedAt: Date.now()
        });
      } catch (e) {}
      handleSave(`Code réinitialisé pour ${sub} (${defaultCode})`);
    }
  };

  // --- NOTIFICATION STATE ---
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('school_notification_prefs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      emailAlerts: true,
      pushNotifications: true,
      weeklyDigest: false,
      studentReports: true
    };
  });

  // --- SECURITY STATE ---
  const [security, setSecurity] = useState(() => {
    const saved2FA = localStorage.getItem('school_2fa_enabled');
    return {
      currentPassword: '',
      newPassword: '',
      twoFactor: saved2FA !== null ? JSON.parse(saved2FA) === true : true
    };
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRegistrationPassword, setShowRegistrationPassword] = useState(false);

  const [biometricEnabled, setBiometricEnabled] = useState(() => {
    return localStorage.getItem('biometric_enabled') === 'true';
  });

  const handleToggleBiometric = async () => {
    if (!biometricEnabled) {
      const success = await verifyBiometricIdentity({
        title: "Activer la biométrie",
        reason: "Scannez votre empreinte pour activer le verrouillage biométrique",
      });
      if (success) {
        if (!localStorage.getItem('app_pin')) {
          localStorage.setItem('app_pin', '1234');
        }
        localStorage.setItem('biometric_enabled', 'true');
        setBiometricEnabled(true);
        handleSave("Verrouillage biométrique par empreinte activé");
      }
    } else {
      localStorage.setItem('biometric_enabled', 'false');
      setBiometricEnabled(false);
      handleSave("Verrouillage biométrique désactivé");
    }
  };

  const handleLockWithFingerprint = async () => {
    if (!localStorage.getItem('app_pin')) {
      localStorage.setItem('app_pin', '1234');
    }
    localStorage.setItem('biometric_enabled', 'true');
    setBiometricEnabled(true);
    localStorage.setItem('app_is_locked', 'true');
    window.dispatchEvent(new CustomEvent('lock-app'));
  };

  const handleTestFingerprint = async () => {
    const ok = await verifyBiometricIdentity({
      title: "Test de l'empreinte",
      reason: "Placez votre doigt pour vérifier votre empreinte digitale",
    });
    if (ok) {
      setToastMessage("Empreinte biométrique reconnue avec succès !");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  // Security section unlock & password edit states
  const [isSecurityUnlocked, setIsSecurityUnlocked] = useState(false);
  const [securityPinInput, setSecurityPinInput] = useState('');
  const [securityPinShake, setSecurityPinShake] = useState(false);
  const [securityPinErrorMsg, setSecurityPinErrorMsg] = useState('');

  const [isEditingRegPassword, setIsEditingRegPassword] = useState(false);
  const [newRegPasswordVal, setNewRegPasswordVal] = useState('');
  const [isSavingRegPassword, setIsSavingRegPassword] = useState(false);

  const handleVerifySecurityBiometric = async () => {
    try {
      const ok = await verifyBiometricIdentity({
        reason: "Déverrouillez pour accéder à la section Sécurité",
        title: "Sécurité",
        subtitle: "Confirmez votre identité",
        description: ""
      });
      if (ok) {
        setIsSecurityUnlocked(true);
      }
    } catch {}
  };

  const handleSecurityPinNum = (digit: string) => {
    if (securityPinInput.length < 4) {
      const nextPin = securityPinInput + digit;
      setSecurityPinInput(nextPin);
      if (nextPin.length === 4) {
        const saved = localStorage.getItem('app_pin');
        if (nextPin === saved) {
          setIsSecurityUnlocked(true);
          setSecurityPinInput('');
          setSecurityPinErrorMsg('');
        } else {
          setSecurityPinShake(true);
          setSecurityPinErrorMsg('Code PIN incorrect');
          setTimeout(() => {
            setSecurityPinShake(false);
            setSecurityPinInput('');
          }, 600);
        }
      }
    }
  };

  const handleSecurityPinBackspace = () => {
    setSecurityPinInput(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (activeTab === 'security' && !isSecurityUnlocked) {
      const savedPin = localStorage.getItem('app_pin');
      const bioEnabled = localStorage.getItem('biometric_enabled') === 'true';
      if (savedPin && bioEnabled) {
        handleVerifySecurityBiometric();
      }
    }
  }, [activeTab, isSecurityUnlocked]);

  // Credentials section unlock states (Protected by app lock PIN / Biométrie)
  const [isCredentialsUnlocked, setIsCredentialsUnlocked] = useState(false);
  const [credentialsPinInput, setCredentialsPinInput] = useState('');
  const [credentialsPinShake, setCredentialsPinShake] = useState(false);
  const [credentialsPinErrorMsg, setCredentialsPinErrorMsg] = useState('');

  const handleVerifyCredentialsBiometric = async () => {
    try {
      const ok = await verifyBiometricIdentity({
        reason: "Déverrouillez pour accéder à vos identifiants et mot de passe",
        title: "Identifiants protégés",
        subtitle: "Confirmez votre identité",
        description: ""
      });
      if (ok) {
        setIsCredentialsUnlocked(true);
      }
    } catch {}
  };

  const handleCredentialsPinNum = (digit: string) => {
    if (credentialsPinInput.length < 4) {
      const nextPin = credentialsPinInput + digit;
      setCredentialsPinInput(nextPin);
      if (nextPin.length === 4) {
        const saved = localStorage.getItem('app_pin');
        if (nextPin === saved) {
          setIsCredentialsUnlocked(true);
          setCredentialsPinInput('');
          setCredentialsPinErrorMsg('');
        } else {
          setCredentialsPinShake(true);
          setCredentialsPinErrorMsg('Code PIN incorrect');
          setTimeout(() => {
            setCredentialsPinShake(false);
            setCredentialsPinInput('');
          }, 600);
        }
      }
    }
  };

  const handleCredentialsPinBackspace = () => {
    setCredentialsPinInput(prev => prev.slice(0, -1));
  };

  useEffect(() => {
    if (activeTab === 'credentials' && !isCredentialsUnlocked) {
      const savedPin = localStorage.getItem('app_pin');
      const bioEnabled = localStorage.getItem('biometric_enabled') === 'true';
      if (savedPin && bioEnabled) {
        handleVerifyCredentialsBiometric();
      }
    }
  }, [activeTab, isCredentialsUnlocked]);

  const [copiedField, setCopiedField] = useState<'matricule' | 'password' | null>(null);

  const handleCopyText = (text: string, field: 'matricule' | 'password') => {
    if (!text) return;
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2500);
    } catch (e) {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  const handleUpdateRegistrationPassword = async () => {
    const trimmed = newRegPasswordVal.trim();
    if (!trimmed || trimmed.length < 4) {
      alert("Le mot de passe doit comporter au moins 4 caractères.");
      return;
    }

    setIsSavingRegPassword(true);
    try {
      if (currentUser && onUpdateUser) {
        const updated = { ...currentUser, password: trimmed, pinCode: trimmed };
        onUpdateUser(updated);
      }

      // Sync in school_db_users
      try {
        const dbUsers = JSON.parse(localStorage.getItem('school_db_users') || '[]');
        const updatedDb = dbUsers.map((u: any) => {
          if (u.id === currentUser?.id || (u.email && u.email === currentUser?.email) || (u.matricule && u.matricule === currentUser?.matricule)) {
            return { ...u, password: trimmed, pinCode: trimmed };
          }
          return u;
        });
        localStorage.setItem('school_db_users', JSON.stringify(updatedDb));
      } catch (e) {}

      // Sync in school_registered_users
      try {
        const regUsers = JSON.parse(localStorage.getItem('school_registered_users') || '[]');
        const updatedReg = regUsers.map((u: any) => {
          if (u.id === currentUser?.id || (u.email && u.email === currentUser?.email) || (u.matricule && u.matricule === currentUser?.matricule)) {
            return { ...u, password: trimmed, pinCode: trimmed };
          }
          return u;
        });
        localStorage.setItem('school_registered_users', JSON.stringify(updatedReg));
      } catch (e) {}

      // Sync in school_user_session
      try {
        const sess = localStorage.getItem('school_user_session');
        if (sess) {
          const parsed = JSON.parse(sess);
          localStorage.setItem('school_user_session', JSON.stringify({
            ...parsed,
            password: trimmed,
            pinCode: trimmed
          }));
        }
      } catch (e) {}

      // Sync in school_user
      try {
        const sUser = localStorage.getItem('school_user');
        if (sUser) {
          const parsed = JSON.parse(sUser);
          localStorage.setItem('school_user', JSON.stringify({
            ...parsed,
            password: trimmed,
            pinCode: trimmed
          }));
        }
      } catch (e) {}

      // Sync to Firestore users collection
      try {
        if (currentUser?.id) {
          await saveRealtimeDocument('users', String(currentUser.id), {
            password: trimmed,
            pinCode: trimmed
          });
        }
      } catch (e) {
        console.warn("Sync Firestore user password error:", e);
      }

      // Sync to students collection and localStorage if student
      if (currentUser?.role === 'student' || currentUser?.accessLevel === 1) {
        try {
          const sMat = currentUser.matricule;
          if (sMat) {
            await saveRealtimeDocument('students', sMat, {
              password: trimmed,
              pinCode: trimmed
            });
          }
          const localStudents = JSON.parse(localStorage.getItem('school_db_students') || '[]');
          const updatedStudents = localStudents.map((st: any) => {
            if ((sMat && (st.matricule === sMat || st.studentId === sMat)) || String(st.id) === String(currentUser.id)) {
              return { ...st, password: trimmed, pinCode: trimmed };
            }
            return st;
          });
          localStorage.setItem('school_db_students', JSON.stringify(updatedStudents));
        } catch (e) {}
      }

      // Sync to teachers collection and localStorage if teacher
      if (isTeacherRole) {
        try {
          const tId = currentUser?.id ? String(currentUser.id) : '';
          if (tId) {
            await saveRealtimeDocument('teachers', tId, {
              password: trimmed,
              pinCode: trimmed
            });
          }
          const localTeachers = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
          const updatedTeachers = localTeachers.map((th: any) => {
            if (String(th.id) === tId || (currentUser?.matricule && th.matricule === currentUser.matricule)) {
              return { ...th, password: trimmed, pinCode: trimmed };
            }
            return th;
          });
          localStorage.setItem('school_db_teachers', JSON.stringify(updatedTeachers));
        } catch (e) {}
      }

      setIsEditingRegPassword(false);
      handleSave("Votre mot de passe d'inscription");
    } finally {
      setIsSavingRegPassword(false);
    }
  };

  // --- HANDLERS ---

  const handleSave = (categoryName: string) => {
    setToastMessage(`${categoryName} enregistré(e)s avec succès !`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveProfile = () => {
    if (currentUser && onUpdateUser) {
      const updatedUser: UserType = {
        ...currentUser,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        parentPhone: currentUser.role === 'parent' ? profile.phone : currentUser.parentPhone,
        studentPhone: currentUser.role === 'student' ? profile.phone : currentUser.studentPhone,
        photo: profile.photo,
        bio: profile.bio
      };
      onUpdateUser(updatedUser);

      // Synchronize in school_db_teachers if user is a teacher
      try {
        const teachers = JSON.parse(localStorage.getItem('school_db_teachers') || '[]');
        if (teachers.length > 0) {
          let updated = false;
          const updatedTeachers = teachers.map((t: any) => {
            if (t.id === currentUser.id || (t.email && t.email === currentUser.email) || (t.name && t.name === currentUser.name)) {
              updated = true;
              return {
                ...t,
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                photo: profile.photo,
                bio: profile.bio
              };
            }
            return t;
          });
          if (updated) {
            localStorage.setItem('school_db_teachers', JSON.stringify(updatedTeachers));
          }
        }
      } catch (e) {
        console.error('Error updating teachers DB:', e);
      }

      // Synchronize in school_registered_users
      try {
        const regUsers = JSON.parse(localStorage.getItem('school_registered_users') || '[]');
        if (regUsers.length > 0) {
          let updated = false;
          const updatedUsers = regUsers.map((u: any) => {
            if (u.id === currentUser.id || (u.email && u.email === currentUser.email)) {
              updated = true;
              return {
                ...u,
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                photo: profile.photo,
                bio: profile.bio
              };
            }
            return u;
          });
          if (updated) {
            localStorage.setItem('school_registered_users', JSON.stringify(updatedUsers));
          }
        }
      } catch (e) {
        console.error('Error updating registered users DB:', e);
      }
    }
    handleSave('Profil');
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('school_notification_prefs', JSON.stringify(notifications));
    handleSave('Préférences de notification');
  };

  const handleSaveSecurity = () => {
    localStorage.setItem('school_2fa_enabled', JSON.stringify(security.twoFactor));
    if (security.newPassword) {
      if (currentUser && onUpdateUser) {
        const updated = { ...currentUser, pinCode: security.newPassword };
        onUpdateUser(updated);
      }
      try {
        const regUsers = JSON.parse(localStorage.getItem('school_registered_users') || '[]');
        if (regUsers.length > 0) {
          const updatedUsers = regUsers.map((u: any) => {
            if (u.id === currentUser?.id || (u.email && u.email === currentUser?.email)) {
              return { ...u, pinCode: security.newPassword };
            }
            return u;
          });
          localStorage.setItem('school_registered_users', JSON.stringify(updatedUsers));
        }
      } catch (e) {
        console.error('Error updating password:', e);
      }
      setSecurity(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
    }
    handleSave('Paramètres de sécurité');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        const dataUrl = await compressImage(file, 400, 400, 0.8);
        setProfile(prev => ({ ...prev, photo: dataUrl }));
        if (currentUser && onUpdateUser) {
          onUpdateUser({
            ...currentUser,
            photo: dataUrl
          });
        }
        setToastMessage("Photo de profil mise à jour avec succès !");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err: any) {
        alert(err.message || "Erreur de traitement de la photo.");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderCredentialsCard = () => {
    const currentPass = currentUser?.password || 
      (currentUser?.pinCode && currentUser.pinCode !== '0000' ? currentUser.pinCode : '') ||
      (() => {
        try {
          const sess = localStorage.getItem('school_user_session');
          if (sess) {
            const p = JSON.parse(sess);
            if (p.password) return p.password;
            if (p.pinCode && p.pinCode !== '0000') return p.pinCode;
          }
        } catch (e) {}
        return 'ecole2024';
      })();

    const loginId = currentUser?.matricule || currentUser?.email || currentUser?.phone || 'Non renseigné';

    return (
      <div className="bg-gradient-to-br from-sky-50/90 via-white to-blue-50/60 p-5 md:p-6 rounded-3xl border border-sky-200 shadow-md mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-sky-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/25 shrink-0">
              <KeyRound size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Identifiants & Mot de passe d'inscription</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-sky-100 text-sky-800 rounded-md uppercase">
                  {getRoleLabel(currentUser?.role)}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Retrouvez vos identifiants et votre mot de passe utilisés pour vous connecter.
              </p>
            </div>
          </div>

          {!isEditingRegPassword && (
            <button
              type="button"
              onClick={() => {
                setNewRegPasswordVal(currentPass);
                setIsEditingRegPassword(true);
              }}
              className="self-start sm:self-auto px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
            >
              <PenLine size={13} />
              <span>Modifier</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          {/* Identifiant / Matricule */}
          <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {currentUser?.matricule ? "Matricule de connexion" : "Identifiant de connexion"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="font-mono font-black text-slate-900 text-base md:text-lg select-all truncate">
                {loginId}
              </span>
              <button
                type="button"
                onClick={() => handleCopyText(loginId, 'matricule')}
                className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold shrink-0"
                title="Copier l'identifiant"
              >
                {copiedField === 'matricule' ? (
                  <>
                    <Check size={16} className="text-emerald-600" />
                    <span className="text-emerald-600 text-[11px] font-bold">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span className="text-[11px]">Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Mot de passe */}
          <div className="bg-white p-4 rounded-2xl border border-sky-100 shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Mot de passe d'inscription
              </span>
              <span className="text-[10px] font-bold text-sky-600">
                {showRegistrationPassword ? "Visible" : "Masqué"}
              </span>
            </div>

            {!isEditingRegPassword ? (
              <div className="flex items-center justify-between gap-2 mt-1">
                <span className="font-mono font-black text-slate-900 text-base md:text-lg tracking-wider">
                  {showRegistrationPassword ? currentPass : '••••••••••••'}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowRegistrationPassword(!showRegistrationPassword)}
                    className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
                    title={showRegistrationPassword ? "Masquer" : "Afficher"}
                  >
                    {showRegistrationPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyText(currentPass, 'password')}
                    className="p-2 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                    title="Copier le mot de passe"
                  >
                    {copiedField === 'password' ? (
                      <>
                        <Check size={16} className="text-emerald-600" />
                        <span className="text-emerald-600 text-[11px] font-bold">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span className="text-[11px]">Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                <div className="relative">
                  <input
                    type={showRegistrationPassword ? "text" : "password"}
                    value={newRegPasswordVal}
                    onChange={(e) => setNewRegPasswordVal(e.target.value)}
                    placeholder="Nouveau mot de passe"
                    className="w-full bg-slate-50 border border-sky-300 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegistrationPassword(!showRegistrationPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showRegistrationPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingRegPassword(false)}
                    disabled={isSavingRegPassword}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdateRegistrationPassword}
                    disabled={isSavingRegPassword || !newRegPasswordVal.trim()}
                    className="px-4 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSavingRegPassword ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                    <span>Enregistrer</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 p-3 bg-sky-100/60 rounded-xl flex items-center gap-2 text-xs text-sky-900">
          <Sparkles size={16} className="text-sky-600 shrink-0" />
          <span>
            <b>Pour vous connecter :</b> Utilisez votre <b>{currentUser?.matricule ? "matricule" : "identifiant"}</b> avec ce mot de passe.
          </span>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'credentials': {
        const savedAppPin = localStorage.getItem('app_pin');
        if (savedAppPin && !isCredentialsUnlocked) {
          const hasBio = localStorage.getItem('biometric_enabled') === 'true';
          return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-md mx-auto py-8 flex flex-col items-center">
              <div className="w-16 h-16 rounded-3xl bg-sky-500/10 text-sky-600 flex items-center justify-center mb-4 shadow-sm border border-sky-100">
                <KeyRound size={30} />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2 text-center">
                Identifiants & Mot de passe protégés
              </h2>
              <p className="text-xs text-slate-500 text-center mb-6 max-w-xs leading-relaxed">
                Cette section contient vos identifiants confidentiels. Entrez votre code secret de verrouillage de l'application ou utilisez votre empreinte pour y accéder.
              </p>

              {/* 4 PIN Dots */}
              <div className={`flex items-center gap-4 mb-6 ${credentialsPinShake ? 'animate-bounce' : ''}`}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      credentialsPinInput.length > i 
                        ? 'bg-sky-500 border-sky-500 scale-110 shadow-sm shadow-sky-500/50' 
                        : 'border-slate-300 bg-white'
                    }`}
                  />
                ))}
              </div>

              {credentialsPinErrorMsg && (
                <p className="text-rose-500 text-xs font-bold mb-4">
                  {credentialsPinErrorMsg}
                </p>
              )}

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleCredentialsPinNum(num.toString())}
                    className="h-14 rounded-2xl bg-white border border-slate-200/90 text-slate-900 text-xl font-bold shadow-2xs hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
                  >
                    {num}
                  </button>
                ))}
                {hasBio ? (
                  <button
                    type="button"
                    onClick={handleVerifyCredentialsBiometric}
                    className="h-14 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 hover:bg-sky-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                    title="Authentification biométrique"
                  >
                    <Fingerprint size={24} />
                  </button>
                ) : (
                  <div />
                )}
                <button
                  type="button"
                  onClick={() => handleCredentialsPinNum('0')}
                  className="h-14 rounded-2xl bg-white border border-slate-200/90 text-slate-900 text-xl font-bold shadow-2xs hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleCredentialsPinBackspace}
                  className="h-14 rounded-2xl bg-white border border-slate-200/90 text-slate-600 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                  title="Effacer"
                >
                  <Delete size={20} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                ← Retour au profil
              </button>
            </div>
          );
        }

        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Identifiants & Mot de passe</h2>
            {renderCredentialsCard()}
          </div>
        );
      }

      case 'profile':
        return (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Mon Profil ({getRoleLabel(currentUser?.role)})
            </h2>
            
            <div className="flex items-center gap-6 mb-8 bg-sky-50/50 p-4 rounded-2xl border border-sky-100">
                <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                    <img 
                        src={profile.photo} 
                        alt="Profil" 
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md group-hover:opacity-80 transition-opacity"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getDefaultAvatar(profile.name);
                        }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-full">
                        <Camera className="text-white drop-shadow-md" size={24} />
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">{profile.name}</h3>
                    <p className="text-sky-700 text-xs font-semibold uppercase tracking-wider mb-2">
                      {getRoleLabel(currentUser?.role)} {currentUser?.assignedClass ? `• ${currentUser.assignedClass}` : ''}
                    </p>
                </div>
            </div>

            {/* Core Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {currentUser?.matricule && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Matricule</label>
                      <p className="text-sm font-bold text-gray-800">{currentUser.matricule}</p>
                  </div>
                )}
                {currentUser?.assignedClass && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Classe</label>
                      <p className="text-sm font-bold text-gray-800">{currentUser.assignedClass}</p>
                  </div>
                )}
                {currentUser?.subject && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Matière</label>
                      <p className="text-sm font-bold text-gray-800">{currentUser.subject}</p>
                  </div>
                )}
                {profile.email && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                      <p className="text-sm font-bold text-gray-800">{profile.email}</p>
                  </div>
                )}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 md:col-span-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Téléphone</label>
                    <p className="text-sm font-bold text-gray-800">{profile.phone || 'Non renseigné'}</p>
                </div>
            </div>

            {/* Section Identifiants & Mot de passe d'inscription (Protégé si verrouillage actif) */}
            {Boolean(localStorage.getItem('app_pin')) && !isCredentialsUnlocked ? (
              <div className="bg-gradient-to-br from-sky-50/90 via-white to-blue-50/60 p-5 md:p-6 rounded-3xl border border-sky-200 shadow-md mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center border border-sky-200 shrink-0">
                    <Lock size={22} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Identifiants & Mot de passe protégés</h4>
                    <p className="text-xs text-slate-500 font-medium">Protégé par le code secret de verrouillage de l'application</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('credentials')}
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                >
                  <KeyRound size={14} />
                  <span>Déverrouiller pour afficher</span>
                </button>
              </div>
            ) : (
              renderCredentialsCard()
            )}

            {/* Details Section (Collapsible) */}
            <details className="mt-6 bg-white border border-gray-200 rounded-xl">
                <summary className="p-4 font-bold text-sm text-gray-700 cursor-pointer hover:bg-gray-50">Détails administratifs</summary>
                <div className="p-4 pt-0 border-t border-gray-100">
                    <div className="flex flex-col gap-2 mt-4">
                        <label className="text-sm font-semibold text-gray-600">Bio / Description</label>
                        <textarea 
                            rows={3} 
                            value={profile.bio}
                            onChange={(e) => setProfile({...profile, bio: e.target.value})}
                            className="bg-gray-50 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 border border-gray-200 focus:border-sky-300 transition-all text-sm resize-none" 
                        />
                    </div>
                </div>
            </details>

            <div className="mt-8 flex justify-between gap-4">
                <button 
                    onClick={() => {
                      const dataToExport = {
                        profile: currentUser,
                        studentData: userRoleStr === 'student' || userRoleStr === 'eleve' || userRoleStr === 'élève' 
                          ? allStudents?.find(s => s.id === currentUser?.id || s.studentId === currentUser?.matricule)
                          : undefined
                      };
                      
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
                      const downloadAnchorNode = document.createElement('a');
                      downloadAnchorNode.setAttribute("href", dataStr);
                      downloadAnchorNode.setAttribute("download", `mes_donnees_${currentUser?.name || 'utilisateur'}.json`);
                      document.body.appendChild(downloadAnchorNode);
                      downloadAnchorNode.click();
                      downloadAnchorNode.remove();
                      setToastMessage("Données exportées avec succès !");
                      setShowToast(true);
                      setTimeout(() => setShowToast(false), 3000);
                    }}
                    className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all text-sm"
                >
                    Exporter mes données
                </button>
                <button 
                    onClick={handleSaveProfile}
                    className="px-8 py-3 bg-[#0ea5e9] text-white font-bold rounded-xl shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all text-sm"
                >
                    Enregistrer les modifications
                </button>
            </div>
          </div>
        );
      
      case 'notifications':
        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Notifications & Alertes</h2>
                
                <div className="bg-sky-50 p-5 rounded-2xl border border-sky-100 mb-6 space-y-3">
                    <div className="flex items-center gap-3">
                        <Bell className="text-sky-600" size={24} />
                        <h3 className="font-bold text-sky-900 text-lg">Notifications App & PWA</h3>
                    </div>
                    <p className="text-sm text-sky-800">
                        Activez les notifications pour recevoir les alertes en temps réel, même lorsque l'application est fermée (sur le Web et sur mobile).
                    </p>
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-semibold text-sky-900">Statut: <span className="font-bold uppercase">{permissionStatus === 'granted' ? 'Autorisé' : permissionStatus === 'denied' ? 'Refusé' : 'Non demandé'}</span></span>
                        
                        {permissionStatus !== 'granted' && (
                            <button 
                                onClick={requestPermissionAndGetToken}
                                className="px-5 py-2.5 bg-sky-600 text-white font-bold rounded-xl shadow hover:bg-sky-700 transition-all text-sm"
                            >
                                Activer les notifications
                            </button>
                        )}
                        {permissionStatus === 'granted' && (
                            <div className="px-5 py-2.5 bg-emerald-100 text-emerald-700 font-bold rounded-xl shadow-sm border border-emerald-200 text-sm flex items-center gap-2">
                                <CheckCircle2 size={18} />
                                Activé
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <ToggleItem 
                        title="Alertes Email" 
                        description="Recevoir des mises à jour sur les performances de la classe par email."
                        icon={<Mail size={20} />}
                        active={notifications.emailAlerts}
                        onToggle={() => toggleNotification('emailAlerts')}
                    />
                    <ToggleItem 
                        title="Bilan Hebdomadaire" 
                        description="Un résumé des statistiques scolaires chaque lundi."
                        icon={<Bell size={20} />}
                        active={notifications.weeklyDigest}
                        onToggle={() => toggleNotification('weeklyDigest')}
                    />
                </div>
                
                <div className="mt-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2"><Smartphone size={16}/> Comment ça marche sur mobile et PC ?</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                        • <b>Sur Web / PWA :</b> Le navigateur demandera l'autorisation. Les notifications arriveront via le Service Worker.<br/>
                        • <b>Sur iOS / Android (Capacitor) :</b> L'application native gère les push notifications silencieusement en arrière-plan.<br/>
                        • <b>Sur Windows / Mac (Electron) :</b> Le système de notification natif de votre ordinateur sera utilisé.
                    </p>
                </div>

                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={handleSaveNotifications}
                        className="px-8 py-3 bg-[#0ea5e9] text-white font-bold rounded-xl shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all cursor-pointer"
                    >
                        Sauvegarder les préférences
                    </button>
                </div>
            </div>
        );

      case 'security': {
        const savedAppPin = localStorage.getItem('app_pin');
        if (savedAppPin && !isSecurityUnlocked) {
          const hasBio = localStorage.getItem('biometric_enabled') === 'true';
          return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-md mx-auto py-8 flex flex-col items-center">
              <div className="w-16 h-16 rounded-3xl bg-sky-500/10 text-sky-600 flex items-center justify-center mb-4 shadow-sm border border-sky-100">
                <Lock size={30} />
              </div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2 text-center">
                Section Sécurité Protégée
              </h2>
              <p className="text-xs text-slate-500 text-center mb-6 max-w-xs leading-relaxed">
                Entrez votre code secret de verrouillage (PIN à 4 chiffres) ou utilisez votre biométrie pour accéder aux paramètres de sécurité.
              </p>

              {/* 4 PIN Dots */}
              <div className={`flex items-center gap-4 mb-6 ${securityPinShake ? 'animate-bounce' : ''}`}>
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      securityPinInput.length > i 
                        ? 'bg-sky-500 border-sky-500 scale-110 shadow-sm shadow-sky-500/50' 
                        : 'border-slate-300 bg-white'
                    }`}
                  />
                ))}
              </div>

              {securityPinErrorMsg && (
                <p className="text-rose-500 text-xs font-bold mb-4">
                  {securityPinErrorMsg}
                </p>
              )}

              {/* Keypad */}
              <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleSecurityPinNum(num.toString())}
                    className="h-14 rounded-2xl bg-white border border-slate-200/90 text-slate-900 text-xl font-bold shadow-2xs hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
                  >
                    {num}
                  </button>
                ))}
                {hasBio ? (
                  <button
                    type="button"
                    onClick={handleVerifySecurityBiometric}
                    className="h-14 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 hover:bg-sky-100 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                    title="Authentification biométrique"
                  >
                    <Fingerprint size={24} />
                  </button>
                ) : (
                  <div />
                )}
                <button
                  type="button"
                  onClick={() => handleSecurityPinNum('0')}
                  className="h-14 rounded-2xl bg-white border border-slate-200/90 text-slate-900 text-xl font-bold shadow-2xs hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer select-none"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleSecurityPinBackspace}
                  className="h-14 rounded-2xl bg-white border border-slate-200/90 text-slate-600 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer shadow-2xs"
                  title="Effacer"
                >
                  <Delete size={20} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                ← Retour au profil
              </button>
            </div>
          );
        }

        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Sécurité & Mot de passe</h2>
                
                {renderCredentialsCard()}

                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Changer le mot de passe</h3>
                    <div className="space-y-4">
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Mot de passe actuel"
                                value={security.currentPassword}
                                onChange={(e) => setSecurity({...security, currentPassword: e.target.value})}
                                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 border border-gray-200"
                            />
                        </div>
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"}
                                placeholder="Nouveau mot de passe"
                                value={security.newPassword}
                                onChange={(e) => setSecurity({...security, newPassword: e.target.value})}
                                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 border border-gray-200"
                            />
                             <button 
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-8 border-t border-gray-100 pt-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Verrouillage & Biométrie de l'application</h3>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          biometricEnabled
                              ? 'bg-sky-100 text-sky-800 border border-sky-200' 
                              : 'bg-slate-100 text-slate-600'
                      }`}>
                          {biometricEnabled ? '✓ Biométrie active' : 'Biométrie inactive'}
                      </span>
                    </div>

                    <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl border border-slate-800 space-y-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 shadow-inner">
                                        <Fingerprint size={22} />
                                    </div>
                                    <div>
                                      <h4 className="font-black text-white text-base">Empreinte Digitale & Code PIN</h4>
                                      <p className="text-xs text-slate-400 font-medium">Verrouillez et sécurisez l'accès à vos données</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleLockWithFingerprint}
                                    className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-sky-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
                                    title="Verrouiller immédiatement avec l'empreinte"
                                >
                                    <Fingerprint size={16} />
                                    <span>Verrouiller avec Empreinte</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        localStorage.setItem('app_is_locked', 'true');
                                        window.dispatchEvent(new CustomEvent('lock-app'));
                                    }}
                                    className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer active:scale-95"
                                >
                                    <Lock size={14} />
                                    <span>Verrouiller</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('app_lock')}
                                    className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5 cursor-pointer active:scale-95"
                                >
                                    <span>{localStorage.getItem('app_pin') ? 'Gérer le PIN' : 'Configurer PIN'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Biometric Toggle & Test */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${biometricEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                        <Fingerprint size={18} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-white">Déverrouillage par Empreinte</div>
                                        <div className="text-[11px] text-slate-400">{biometricEnabled ? 'Activé pour verrouiller' : 'Désactivé'}</div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleToggleBiometric}
                                    className={`w-12 h-6.5 rounded-full transition-colors relative cursor-pointer ${biometricEnabled ? 'bg-sky-500' : 'bg-slate-700'}`}
                                >
                                    <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${biometricEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-xs font-bold text-white">Tester le capteur d'empreinte</div>
                                    <div className="text-[11px] text-slate-400">Vérifier la reconnaissance biométrique</div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleTestFingerprint}
                                    className="px-3 py-1.5 bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shrink-0"
                                >
                                    <Fingerprint size={14} />
                                    <span>Tester</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8 border-t border-gray-100 pt-8">
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Authentification à deux facteurs</h3>
                    <ToggleItem 
                        title="Activer la 2FA" 
                        description="Sécurisez votre compte avec une couche de protection supplémentaire."
                        icon={<Shield size={20} />}
                        active={security.twoFactor}
                        onToggle={() => setSecurity(prev => ({...prev, twoFactor: !prev.twoFactor}))}
                    />
                </div>

                <div className="mt-8 flex justify-end">
                    <button 
                        onClick={handleSaveSecurity}
                        className="px-8 py-3 bg-[#0ea5e9] text-white font-bold rounded-xl shadow-lg shadow-sky-200 hover:bg-sky-600 transition-all cursor-pointer"
                    >
                        Enregistrer les paramètres de sécurité
                    </button>
                </div>
            </div>
        );
      }

      case 'app_lock':
        return (
          <PasswordView onBack={() => setActiveTab('security')} />
        );


      case 'appearance':
        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Apparence</h2>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <ToggleItem 
                        title="Mode Nuit" 
                        description="Activer le thème sombre pour une meilleure visibilité nocturne."
                        icon={darkMode ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-amber-500" />}
                        active={darkMode}
                        onToggle={() => setDarkMode(!darkMode)}
                    />
                </div>
            </div>
        );
      case 'about':
        return (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                {/* Header Banner */}
                <div className="bg-gradient-to-br from-sky-600 via-sky-500 to-indigo-600 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg border border-white/30 ring-4 ring-white/10 overflow-hidden p-2">
                        <img src="logo.png" alt="Terminale D Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = 'icone.png'; }} />
                    </div>

                    <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-white/30">
                                Version 1.0.0
                            </span>
                            <span className="bg-emerald-400/20 text-emerald-100 text-xs font-bold px-3 py-1 rounded-full border border-emerald-300/30 flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Système Opérationnel
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                            Terminale D
                        </h2>
                        <p className="text-sky-100 text-sm leading-relaxed max-w-xl">
                            La plateforme intégrée de gestion scolaire moderne pour les élèves, enseignants et parents de la promotion Terminale D.
                        </p>
                    </div>
                </div>

                {/* Key Pillars Grid */}
                <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Sparkles size={20} className="text-sky-500" />
                        <span>Fonctionnalités Principales</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2 hover:bg-sky-50/50 hover:border-sky-100 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                                📈
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">Tableau de Bord & Statistiques</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Vue d'ensemble interactive de l'établissement : effectifs, moyennes générales, planning des cours du jour et accès rapide aux fonctionnalités clés.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2 hover:bg-sky-50/50 hover:border-sky-100 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                                👨‍🏫
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">Gestion des Professeurs & Principaux</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Annuaire complet de l'ensemble des enseignants par matière, désignation des professeurs principaux par classe et contact direct par téléphone et e-mail.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2 hover:bg-sky-50/50 hover:border-sky-100 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                📊
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">Bulletins & Notes</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Saisie des notes, calcul automatique des moyennes de classe, appréciations pédagogiques et génération des bulletins scolaires en PDF.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2 hover:bg-sky-50/50 hover:border-sky-100 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                                📅
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">Emplois du temps & Statistiques</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Emploi du temps hebdomadaire interactif, statistiques scolaires détaillées de la classe et suivi de l'évolution des élèves par matière.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2 hover:bg-sky-50/50 hover:border-sky-100 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                                📢
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">Annonces & Communication</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Diffusion d'informations officielles, fil d'actualités de l'école, pièces jointes et notifications pour toute la communauté éducative.
                            </p>
                        </div>

                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-2 hover:bg-sky-50/50 hover:border-sky-100 transition-all">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                                🎓
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">Inscriptions & Suivi des Élèves</h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Formulaire d'inscription des nouveaux élèves, répartition par classe, fiches individuelles complètes et suivi de la scolarité.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-sky-50 via-indigo-50/50 to-white p-5 rounded-2xl border border-sky-200/60 space-y-2 hover:border-sky-300 transition-all sm:col-span-2 lg:col-span-3 flex sm:flex-row flex-col items-start sm:items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center text-xl font-bold shadow-md shrink-0">
                                ✨
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 text-base">Et bien plus encore...</h4>
                                <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                                    Assistant vocal intelligent, messagerie directe, personnalisation du profil et de la sécurité, recherche globale dynamique, et de nouvelles évolutions déployées régulièrement.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technical Specifications */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                            <Code size={18} className="text-sky-400" />
                            <span className="font-bold text-sm">Spécifications Techniques</span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">Build 2026.07</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
                        <div>
                            <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider">Version</span>
                            <span className="font-semibold text-white">1.0.0</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider">Synchronisation</span>
                            <span className="font-semibold text-white">Temps Réel</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider">Sécurité</span>
                            <span className="font-semibold text-white">Chiffrement SSL</span>
                        </div>
                        <div>
                            <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider">Plateforme</span>
                            <span className="font-semibold text-white">Web & Mobile</span>
                        </div>
                    </div>
                </div>

                {/* Support & Legal Footer */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-500" />
                        <span>Dashboard &copy; 2026. Tous droits réservés.</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <a href="mailto:support@edugestion.com" className="hover:text-sky-600 transition-colors flex items-center gap-1 font-medium">
                            <Mail size={14} />
                            <span>Assistance & Support</span>
                        </a>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-400">Version 1.0.0</span>
                    </div>
                </div>
            </div>
        );

      case 'accreditation':
        if (!canAccessAccreditation) return null;
        return (
          <div className="animate-in fade-in duration-300 space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <ShieldCheck size={26} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Codes d'Accréditation</h2>
                <p className="text-sm text-gray-500">Gérez les codes d'accès sécurisés par matière d'enseignement et par profil.</p>
              </div>
            </div>

            {/* --- CAS 1 : ENSEIGNANT (AFFICHAGE STRICTEMENT INDIVIDUEL ET CONFIDENTIEL) --- */}
            {!isDirector ? (
              <div className="p-5 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                      <GraduationCap size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        Mon Code d'Accréditation Enseignant
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Accréditation individuelle et confidentielle pour votre discipline d'enseignement.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-sky-100 text-sky-800 px-3.5 py-1.5 rounded-full border border-sky-200 flex items-center gap-1.5 shadow-2xs">
                    <BookOpen size={14} className="text-sky-600" />
                    <span>Matière : {teacherUserSubject}</span>
                  </span>
                </div>

                {/* Confidentiality Guarantee Notice */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-1">
                      Accréditation Strictement Individuelle & Sécurisée
                    </h4>
                    <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                      Conformément aux règles de sécurité de l'établissement, ce code est confidentiel. <b>Seul vous avez accès à votre code d'accréditation.</b> Les professeurs des autres matières ne peuvent en aucun cas voir ou modifier votre code.
                    </p>
                  </div>
                </div>

                {/* Individual Teacher Code Card */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-5 shadow-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Fixed Subject Label (No dropdown) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                        Votre Matière d'Enseignement
                      </label>
                      <div className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-between text-sm font-bold text-slate-800">
                        <span className="flex items-center gap-2">
                          <BookOpen size={16} className="text-sky-600" />
                          <span>{teacherUserSubject}</span>
                        </span>
                        <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-200">
                          Accès titulaire
                        </span>
                      </div>
                    </div>

                    {/* Teacher Individual Code Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5 ml-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Votre Code Secret ({teacherUserSubject})
                        </label>
                        <button 
                          type="button"
                          onClick={() => handleResetSubjectCode(teacherUserSubject)}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                          title="Restaurer le code par défaut"
                        >
                          <RotateCcw size={12} />
                          Par défaut
                        </button>
                      </div>
                      <div className="relative">
                        <input 
                          type={showSubjectCodeSecret ? "text" : "password"}
                          value={editingCodeValue}
                          onChange={(e) => setEditingCodeValue(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-all uppercase pr-24"
                          placeholder="Ex: MATH-2024"
                        />
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button 
                            type="button"
                            onClick={() => handleCopyCode(editingCodeValue)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            title={isCopied ? "Code copié !" : "Copier le code"}
                          >
                            {isCopied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                          </button>
                          <button 
                            type="button"
                            onClick={() => setShowSubjectCodeSecret(!showSubjectCodeSecret)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            tabIndex={-1}
                            title={showSubjectCodeSecret ? "Masquer" : "Afficher"}
                          >
                            {showSubjectCodeSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-3">
                    <p className="text-xs text-slate-500 italic">
                      Dernière synchronisation sécurisée : {new Date().toLocaleDateString('fr-FR')}
                    </p>
                    <button 
                      onClick={() => handleSaveSubjectCode(teacherUserSubject, editingCodeValue)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      <Save size={16} />
                      <span>Enregistrer mon code d'accréditation</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* --- CAS 2 : DIRECTION / ADMIN (VUE GLOBALE DE GESTION DE TOUTES LES MATIÈRES) --- */
              <div className="p-5 sm:p-6 bg-slate-50/80 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800">
                        Gestion Globale des Accréditations par Matière (Direction)
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Vue administrative permettant de configurer les codes d'accès de l'ensemble des matières.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full border border-amber-200">
                    Mode Superviseur / Direction
                  </span>
                </div>

                {/* Form to edit selected subject code */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                        Matière à configurer
                      </label>
                      <div className="relative">
                        <select 
                          value={selectedSubjectToEdit}
                          onChange={(e) => handleSelectSubjectToEdit(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-all cursor-pointer"
                        >
                          {ALL_TEACHING_SUBJECTS.map((sub) => (
                            <option key={sub} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5 ml-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Code d'accréditation ({selectedSubjectToEdit})
                        </label>
                        <button 
                          type="button"
                          onClick={() => handleResetSubjectCode(selectedSubjectToEdit)}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                          title="Restaurer le code par défaut"
                        >
                          <RotateCcw size={12} />
                          Par défaut
                        </button>
                      </div>
                      <div className="relative">
                        <input 
                          type={showSubjectCodeSecret ? "text" : "password"}
                          value={editingCodeValue}
                          onChange={(e) => setEditingCodeValue(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-all uppercase"
                          placeholder="Ex: MATH-2024"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowSubjectCodeSecret(!showSubjectCodeSecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                          tabIndex={-1}
                        >
                          {showSubjectCodeSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button 
                      onClick={() => handleSaveSubjectCode(selectedSubjectToEdit, editingCodeValue)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer"
                    >
                      <Save size={16} />
                      <span>Enregistrer le code pour {selectedSubjectToEdit}</span>
                    </button>
                  </div>
                </div>

                {/* Table / List of all subjects and their current codes (DIRECTOR ONLY) */}
                <div>
                  <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                    <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      Liste des codes actuels par matière (Vue Direction)
                    </h4>
                    <div className="relative w-48">
                      <input 
                        type="text"
                        placeholder="Filtrer une matière..."
                        value={subjectSearch}
                        onChange={(e) => setSubjectSearch(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1 custom-scrollbar">
                    {ALL_TEACHING_SUBJECTS
                      .filter(sub => sub.toLowerCase().includes(subjectSearch.toLowerCase()))
                      .map((sub) => {
                        const isCurrent = sub === selectedSubjectToEdit;
                        const code = subjectCodes[sub] || getSubjectAccreditationCode(sub);
                        return (
                          <div 
                            key={sub}
                            onClick={() => handleSelectSubjectToEdit(sub)}
                            className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                              isCurrent 
                                ? 'bg-sky-50 border-sky-400 shadow-2xs ring-1 ring-sky-300' 
                                : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                            }`}
                          >
                            <div className="min-w-0 pr-2">
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {sub}
                              </p>
                            </div>
                            <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
                              {code}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* --- SECTION 2: CODES PAR NIVEAU HIERARCHIQUE (ADMIN / DIRECTION) --- */}
            {isDirector && (
              <div className="space-y-6 max-w-xl pt-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <Shield size={20} className="text-amber-600" />
                  <h3 className="text-base font-bold text-slate-800">
                    Codes d'Accréditation par Niveau (Éducateur, Caissier, Direction)
                  </h3>
                </div>

                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-xs text-amber-800 font-medium leading-relaxed">
                    Ces codes généraux sont exigés pour la création de comptes du personnel administratif et de direction.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Niveau 2 : Éducateur</label>
                    <input 
                        type="text"
                        value={accreditationCodes.niveau2}
                        onChange={(e) => setAccreditationCodes({...accreditationCodes, niveau2: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all uppercase"
                        placeholder="Code Éducateur"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Niveau 3 : Personnel Enseignant Général</label>
                    <input 
                        type="text"
                        value={accreditationCodes.niveau3}
                        onChange={(e) => setAccreditationCodes({...accreditationCodes, niveau3: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all uppercase"
                        placeholder="Code Professeur Général"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Niveau 4 : Caissier</label>
                    <input 
                        type="text"
                        value={accreditationCodes.niveau4}
                        onChange={(e) => setAccreditationCodes({...accreditationCodes, niveau4: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all uppercase"
                        placeholder="Code Caissier"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Niveau 5 : Direction / Administration</label>
                    <input 
                        type="text"
                        value={accreditationCodes.niveau5}
                        onChange={(e) => setAccreditationCodes({...accreditationCodes, niveau5: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all uppercase"
                        placeholder="Code Direction"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => {
                      localStorage.setItem('acc_niv2', accreditationCodes.niveau2);
                      localStorage.setItem('acc_niv3', accreditationCodes.niveau3);
                      localStorage.setItem('acc_niv4', accreditationCodes.niveau4);
                      localStorage.setItem('acc_niv5', accreditationCodes.niveau5);
                      saveRealtimeDocument('accreditation_codes', 'system_levels', {
                        niveau2: accreditationCodes.niveau2,
                        niveau3: accreditationCodes.niveau3,
                        niveau4: accreditationCodes.niveau4,
                        niveau5: accreditationCodes.niveau5,
                        updatedAt: Date.now()
                      }).catch(console.error);
                      handleSave('Codes d\'Accréditation de Niveau');
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all active:scale-95 w-fit cursor-pointer"
                >
                  <Save size={18} />
                  Sauvegarder les codes de niveau
                </button>
              </div>
            )}

            {canLaunchClotureInSettings && (
              <div className="mt-12 pt-8 border-t border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <GraduationCap size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">Gestion de Fin d'Année</h2>
                      <p className="text-sm text-gray-500">Clôturer l'année scolaire, calculer les moyennes annuelles et appliquer les décisions (Passage / Redoublement).</p>
                    </div>
                  </div>
                  <button
                      onClick={() => setIsBilanOpen(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-[#BFDBFE] hover:bg-[#93c5fd] text-blue-950 rounded-xl font-extrabold text-sm transition-all shadow-md shadow-blue-300/30 active:scale-95 w-fit border border-blue-300/60"
                  >
                      <Sparkles size={18} className="text-amber-500" />
                      Lancer la Clôture de l'Année
                  </button>
              </div>
            )}
          </div>
        );
      default:
        return <div>Select a setting</div>;
    }
  };

  return (
    <div className="flex flex-col h-full w-full p-4 sm:p-8 relative overflow-y-auto pb-32 md:pb-8">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <button 
          onClick={() => {
            if (onNavigate) {
              onNavigate('dashboard');
            } else {
              window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'dashboard' }));
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }));
            }
          }}
          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-sky-100 text-gray-700 hover:text-sky-700 border border-gray-200 flex items-center justify-center active:scale-95 transition-all shadow-sm shrink-0"
          title="Retour à Terminale D"
          aria-label="Retour"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Paramètres</h1>
      </div>

      {/* Toast Notification */}
      {showToast && (
          <div className="fixed sm:absolute top-4 sm:top-8 right-4 sm:right-8 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4 z-50 text-sm">
            <CheckCircle className="text-green-400 shrink-0" size={20} />
            <span className="font-medium">{toastMessage}</span>
          </div>
      )}

      <div className="grid grid-cols-12 gap-6 md:gap-8">
        {/* Settings Menu */}
        <div className="col-span-12 md:col-span-4 lg:col-span-3">
             <div className="bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-4 shadow-sm flex flex-row md:flex-col gap-1.5 sm:gap-2 overflow-x-auto md:overflow-visible no-scrollbar">
                 <SettingsItem 
                    icon={<User size={18} />} 
                    label="Mon Profil" 
                    active={activeTab === 'profile'} 
                    onClick={() => setActiveTab('profile')}
                />
                 <SettingsItem 
                    icon={<KeyRound size={18} />} 
                    label="Identifiants & Mot de passe" 
                    active={activeTab === 'credentials'} 
                    onClick={() => setActiveTab('credentials')}
                />
                 <SettingsItem 
                    icon={<Bell size={18} />} 
                    label="Notifications" 
                    active={activeTab === 'notifications'}
                    onClick={() => setActiveTab('notifications')}
                />
                 <SettingsItem 
                    icon={<Lock size={18} />} 
                    label="Sécurité" 
                    active={activeTab === 'security'}
                    onClick={() => setActiveTab('security')}
                />
                 <SettingsItem 
                    icon={<KeyRound size={18} />} 
                    label="Verrouiller l'application" 
                    active={activeTab === 'app_lock'}
                    onClick={() => setActiveTab('app_lock')}
                />

                 {canAccessAccreditation && (
                   <SettingsItem 
                      icon={<ShieldCheck size={18} />} 
                      label="Accréditation" 
                      active={activeTab === 'accreditation'}
                      onClick={() => setActiveTab('accreditation')}
                   />
                 )}

                 <SettingsItem 
                    icon={<Info size={18} />} 
                    label="À propos de l'application" 
                    active={activeTab === 'about'}
                    onClick={() => setActiveTab('about')}
                />
                 <SettingsItem 
                    icon={<Palette size={18} />} 
                    label="Apparence" 
                    active={activeTab === 'appearance'}
                    onClick={() => setActiveTab('appearance')}
                />
                <div className="hidden md:block w-full h-px bg-gray-100 my-2"></div>
                <button 
                    onClick={() => setShowLogoutConfirm(true)}
                    className="hidden md:flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all text-red-600 hover:bg-red-50 hover:text-red-700 font-bold border border-red-100/60 mt-2 w-full"
                >
                    <LogOut size={18} />
                    <span className="text-sm">Déconnexion</span>
                </button>
             </div>
        </div>

        {/* Settings Content */}
        <div className="col-span-12 md:col-span-8 lg:col-span-9">
            <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 shadow-sm relative min-h-[300px]">
                {renderContent()}
            </div>

            {/* Mobile Logout Button */}
            <div className="md:hidden mt-6 flex justify-center">
                <button 
                    onClick={() => setShowLogoutConfirm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-bold text-sm hover:bg-red-100 transition-colors w-full justify-center border border-red-100 shadow-sm cursor-pointer"
                >
                    <LogOut size={18} />
                    <span>Se déconnecter</span>
                </button>
            </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isBilanOpen && canLaunchClotureInSettings && (
          <BilanFinAnnee students={allStudents || []} onUpdateAllStudents={onUpdateAllStudents || (() => {})} onClose={() => setIsBilanOpen(false)} />
      )}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <LogOut size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Déconnexion</h3>
            <p className="text-slate-600 text-sm mb-6">
              Êtes-vous sûr de vouloir vous déconnecter de votre session ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer text-sm"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  if (onLogout) onLogout();
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20 cursor-pointer text-sm"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsItem = ({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
    <div 
        onClick={onClick}
        className={`flex items-center gap-2 sm:gap-3 px-3.5 py-2.5 sm:p-4 rounded-xl cursor-pointer transition-all shrink-0 whitespace-nowrap ${active ? 'bg-sky-50 text-sky-600 shadow-sm font-bold' : 'text-gray-500 hover:bg-gray-50 font-medium'}`}
    >
        {icon}
        <span className="text-xs sm:text-sm">{label}</span>
    </div>
);

const ToggleItem = ({ title, description, icon, active, onToggle }: { title: string, description: string, icon: any, active: boolean, onToggle: () => void }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-colors">
        <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${active ? 'bg-sky-100 text-sky-600' : 'bg-gray-200 text-gray-500'}`}>
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-gray-800 text-sm">{title}</h4>
                <p className="text-xs text-gray-400">{description}</p>
            </div>
        </div>
        <div 
            onClick={onToggle}
            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${active ? 'bg-sky-600' : 'bg-gray-300'}`}
        >
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </div>
    </div>
);