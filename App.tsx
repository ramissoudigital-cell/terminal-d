import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { App as CapacitorApp } from '@capacitor/app';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentsPage } from './components/StudentsPage';
import { TeachersPage } from './components/TeachersPage';
import { ClassesPage } from './components/ClassesPage';
import { LivretScolairePage } from './components/LivretScolairePage';
import { FicheIdentificationPage } from './components/FicheIdentificationPage';
import { SchedulePage } from './components/SchedulePage';
import { SettingsPage } from './components/SettingsPage';
import { RegistrationPage } from './components/RegistrationPage';
import { InsightsPage } from './components/InsightsPage';
import { CommunicationPage } from './components/CommunicationPage';
import { ConseilEnseignementPage } from './components/ConseilEnseignementPage';
import { ResponsablesUPPage } from './components/ResponsablesUPPage';
import { ChefsDeClassePage } from './components/ChefsDeClassePage';
import { BureauConseilDeleguesPage } from './components/BureauConseilDeleguesPage';
import { BureauParentsElevesPage } from './components/BureauParentsElevesPage';
import { LoginPage } from './components/LoginPage';
import { BottomNavigation } from './components/BottomNavigation';
import CardDashboard from './components/CardDashboard';
import { AppSplashScreen } from './components/AppSplashScreen';
import { AppLockScreen } from './components/AppLockScreen';
import { RippleGrid } from './components/RippleGrid';
import { Student, Teacher, User, AttendanceRecord } from './types';
import { mockStudents, mockTeachers } from './data/mockData';
import { Settings, School, Lock } from 'lucide-react';
import { initCapacitorImmersive, setCapacitorStatusBarColor } from './src/utils/capacitor';
import { startWebNotificationEngine } from './src/services/WebNotificationEngine';
import { 
  seedInitialPreRegisteredUsersIfNeeded, 
  subscribeToRealtimeCollection, 
  saveRealtimeDocument, 
  deleteRealtimeDocument,
  preRegisterUserByAdmin,
  logoutUserAccount
} from './src/services/firebaseService';
import { initAccreditationRealtimeSync } from './src/utils/accreditationUtils';

const MOBILE_EXCLUDED_PAGES = [
  'communication',
  'insights',
  'registration',
  'bureau_delegues',
  'bureau_parents',
  'conseil',
  'responsables_up'
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedSession = localStorage.getItem('school_user_session') || localStorage.getItem('school_user');
    if (savedSession) {
      try {
        return JSON.parse(savedSession);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedStudentToAnalyze, setSelectedStudentToAnalyze] = useState<Student | null>(null);
  const [showAppSplash, setShowAppSplash] = useState(true);

  useEffect(() => {
    // Prolong splash duration to allow the slow ParticleText animation to gather and be fully read
    const splashTimer = setTimeout(() => {
      setShowAppSplash(false);
    }, 4200);
    return () => clearTimeout(splashTimer);
  }, []);

  // App PIN lock state
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    const savedPin = localStorage.getItem('app_pin');
    if (!savedPin) return false;
    if (localStorage.getItem('app_is_locked') === 'true') return true;
    const savedDelay = parseInt(localStorage.getItem('lock_delay_minutes') || '0', 10);
    const lastActive = parseInt(localStorage.getItem('app_last_active_timestamp') || '0', 10);
    if (!lastActive || savedDelay === 0) return true;
    return (Date.now() - lastActive) > (savedDelay * 60 * 1000);
  });

  const handleUnlockApp = () => {
    localStorage.setItem('app_last_active_timestamp', Date.now().toString());
    localStorage.removeItem('app_is_locked');
    setIsAppLocked(false);
  };

  useEffect(() => {
    initAccreditationRealtimeSync();
    const handleLock = () => {
      if (localStorage.getItem('app_pin')) {
        localStorage.setItem('app_is_locked', 'true');
        setIsAppLocked(true);
      }
    };

    const handleUnlock = () => {
      handleUnlockApp();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        localStorage.setItem('app_last_active_timestamp', Date.now().toString());
      } else {
        const savedPin = localStorage.getItem('app_pin');
        if (savedPin) {
          const isManual = localStorage.getItem('app_is_locked') === 'true';
          const savedDelay = parseInt(localStorage.getItem('lock_delay_minutes') || '0', 10);
          const lastActive = parseInt(localStorage.getItem('app_last_active_timestamp') || '0', 10);
          if (isManual || savedDelay === 0 || (Date.now() - lastActive) > (savedDelay * 60 * 1000)) {
            setIsAppLocked(true);
          }
        }
      }
    };

    window.addEventListener('lock-app', handleLock);
    window.addEventListener('unlock-app', handleUnlock);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('lock-app', handleLock);
      window.removeEventListener('unlock-app', handleUnlock);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const handleNav = (e: any) => {
      if (e.detail) {
        let target = e.detail;
        if (typeof target === 'string' && ['prof', 'profs', 'professeur', 'professeurs'].includes(target.toLowerCase())) {
          target = 'teachers';
        }
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        if (isMobile && MOBILE_EXCLUDED_PAGES.includes(target)) {
          return;
        }
        setActivePage(target);
      }
    };
    window.addEventListener('navigate', handleNav);
    window.addEventListener('navigate-to-page', handleNav);
    return () => {
      window.removeEventListener('navigate', handleNav);
      window.removeEventListener('navigate-to-page', handleNav);
    };
  }, []);

  // Capacitor Back Button Handler
  useEffect(() => {
    const backButtonHandler = CapacitorApp.addListener('backButton', () => {
      if (activePage === 'dashboard') {
        CapacitorApp.exitApp();
      } else {
        handleNavigate('dashboard');
      }
    });

    return () => {
      backButtonHandler.then(h => h.remove());
    };
  }, [activePage]);
  
  // --- REAL DATA PERSISTENCE & TRIMESTER AVERAGES ---
  const [selectedTrimester, setSelectedTrimester] = useState<string>(() => {
      try {
          const saved = localStorage.getItem('school_db_selected_trimester');
          if (saved) return saved;
      } catch (e) {
          console.error(e);
      }
      return '1er trim';
  });

  useEffect(() => {
      try {
          localStorage.setItem('school_db_selected_trimester', selectedTrimester);
      } catch (e) {
          console.error(e);
      }
  }, [selectedTrimester]);
  
  const [trimesterAverages, setTrimesterAverages] = useState<Record<string, Record<string, number>>>(() => {
      const saved = localStorage.getItem('school_db_trimester_averages');
      if (saved) {
          try {
              return JSON.parse(saved);
          } catch (e) {
              return {};
          }
      }
      return {};
  });

  const [students, setStudents] = useState<Student[]>(() => {
      const savedStudents = localStorage.getItem('school_db_students');
      if (savedStudents) {
          const parsed = JSON.parse(savedStudents);
          const filtered = parsed.filter((s: any) => !s.id || (!s.id.toString().startsWith('gen-') && !s.id.toString().startsWith('fin-') && !s.id.toString().startsWith('filler-')));
          return filtered.map((s: any) => ({
              ...s,
              performance: s.performance || [],
              subjects: (s.subjects || []).map((sub: any) => {
                  let filteredGrades = sub.grades;
                  if (Array.isArray(filteredGrades)) {
                      filteredGrades = filteredGrades.filter((g: any) => typeof g.id === 'string');
                  }
                  return { ...sub, grades: filteredGrades };
              })
          }));
      }
      return mockStudents;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
      const savedTeachers = localStorage.getItem('school_db_teachers');
      const deletedIds: string[] = (() => {
        try { return JSON.parse(localStorage.getItem('deleted_teacher_ids') || '[]'); } catch { return []; }
      })();
      if (savedTeachers) {
          try {
            const parsed = JSON.parse(savedTeachers);
            if (Array.isArray(parsed)) {
              return parsed.filter((t: any) => {
                const tId = String(t.id || '');
                const tUid = String(t.uid || t.authUid || '');
                const tMat = String(t.matricule || '').toLowerCase().trim();
                const tEmail = String(t.email || '').toLowerCase().trim();
                return (
                  !deletedIds.includes(tId) &&
                  (!tUid || !deletedIds.includes(tUid)) &&
                  (!tMat || (!deletedIds.includes(tMat) && !deletedIds.includes(`prof-${tMat}`))) &&
                  (!tEmail || !deletedIds.includes(tEmail))
                );
              });
            }
          } catch (e) {}
      }
      return mockTeachers;
  });

  useEffect(() => {
      // Seed pre-registered whitelist in Firestore if empty
      seedInitialPreRegisteredUsersIfNeeded().catch(console.error);

      // Subscribe to real-time students collection in Firestore
      const unsubscribeStudents = subscribeToRealtimeCollection('students', (remoteStudents) => {
        if (remoteStudents && remoteStudents.length > 0) {
          setStudents(remoteStudents as Student[]);
        }
      });

      // Subscribe to real-time deleted_teachers in system_metadata collection
      const unsubscribeDeletedTeachers = subscribeToRealtimeCollection('system_metadata', (remoteMeta: any[]) => {
        const deletedDoc = remoteMeta.find(d => d.id === 'deleted_teachers');
        if (deletedDoc && Array.isArray(deletedDoc.ids)) {
          try {
            const currentDeleted: string[] = JSON.parse(localStorage.getItem('deleted_teacher_ids') || '[]');
            const merged = Array.from(new Set([...currentDeleted, ...deletedDoc.ids]));
            localStorage.setItem('deleted_teacher_ids', JSON.stringify(merged));
            setTeachers(prev => prev.filter(t => {
              const tId = String(t.id || '');
              const tUid = String(t.uid || t.authUid || '');
              const tMat = String(t.matricule || '').toLowerCase().trim();
              const tEmail = String(t.email || '').toLowerCase().trim();
              return (
                !merged.includes(tId) &&
                (!tUid || !merged.includes(tUid)) &&
                (!tMat || (!merged.includes(tMat) && !merged.includes(`prof-${tMat}`))) &&
                (!tEmail || !merged.includes(tEmail))
              );
            }));
          } catch (e) {}
        }
      });

      // Subscribe to real-time teachers collection in Firestore
      const unsubscribeTeachers = subscribeToRealtimeCollection('teachers', (remoteTeachers) => {
        if (remoteTeachers && remoteTeachers.length > 0) {
          const deletedIds: string[] = (() => {
            try { return JSON.parse(localStorage.getItem('deleted_teacher_ids') || '[]'); } catch { return []; }
          })();
          const isDeletedItem = (item: any) => {
            if (!item) return true;
            const tId = String(item.id || '');
            const tUid = String(item.uid || item.authUid || '');
            const tMat = String(item.matricule || '').toLowerCase().trim();
            const tEmail = String(item.email || '').toLowerCase().trim();
            return (
              deletedIds.includes(tId) ||
              (tUid && deletedIds.includes(tUid)) ||
              (tMat && (deletedIds.includes(tMat) || deletedIds.includes(`prof-${tMat}`))) ||
              (tEmail && deletedIds.includes(tEmail))
            );
          };

          setTeachers(prev => {
            const map = new Map<string, Teacher>();
            prev.filter(t => !isDeletedItem(t)).forEach(t => map.set(String(t.id), t));
            (remoteTeachers as Teacher[])
              .filter(rt => !isDeletedItem(rt))
              .forEach(rt => map.set(String(rt.id), { ...(map.get(String(rt.id)) || {}), ...rt }));
            const merged = Array.from(map.values()).filter(t => !isDeletedItem(t));
            try {
              localStorage.setItem('school_db_teachers', JSON.stringify(merged));
            } catch (e) {}
            return merged;
          });
        }
      });

      // Subscribe to real-time users collection to detect any teacher account registered
      const unsubscribeUsers = subscribeToRealtimeCollection('users', (remoteUsers: any[]) => {
        if (remoteUsers && remoteUsers.length > 0) {
          const deletedIds: string[] = (() => {
            try { return JSON.parse(localStorage.getItem('deleted_teacher_ids') || '[]'); } catch { return []; }
          })();
          const isDeletedUser = (u: any) => {
            if (!u || u.isDeleted === true) return true;
            const uId = String(u.id || '');
            const uUid = String(u.uid || u.authUid || '');
            const uMat = String(u.matricule || '').toLowerCase().trim();
            const uEmail = String(u.email || '').toLowerCase().trim();
            return (
              deletedIds.includes(uId) ||
              (uUid && deletedIds.includes(uUid)) ||
              (uMat && (deletedIds.includes(uMat) || deletedIds.includes(`prof-${uMat}`))) ||
              (uEmail && deletedIds.includes(uEmail))
            );
          };

          const teacherUsers = remoteUsers.filter(u => (u.role === 'teacher' || u.accessLevel === 3) && !isDeletedUser(u));
          if (teacherUsers.length > 0) {
            setTeachers(prev => {
              const map = new Map<string, Teacher>();
              prev.filter(t => !isDeletedUser(t)).forEach(t => map.set(String(t.id), t));
              teacherUsers.forEach(u => {
                const uEmail = (u.email || '').toLowerCase().trim();
                const uMat = (u.matricule || '').toLowerCase().trim();
                const tId = u.matricule ? `PROF-${u.matricule}` : (u.id || `PROF-${u.authUid || Date.now()}`);

                if (!isDeletedUser(u) && !deletedIds.includes(String(tId))) {
                  const teacherObj: Teacher = {
                    id: tId,
                    name: u.name || 'Enseignant',
                    subject: u.subject || 'Mathématiques',
                    email: u.email || '',
                    phone: u.phone || u.parentPhone || u.studentPhone || '',
                    matricule: u.matricule || `MAT-${u.id}`,
                    assignedClasses: Array.isArray(u.assignedClasses) && u.assignedClasses.length > 0 
                      ? u.assignedClasses 
                      : (u.assignedClass ? [u.assignedClass] : ['Terminale D1']),
                    status: 'Actif',
                    photo: u.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
                    accountCreated: true,
                    uid: u.id,
                    authUid: u.id
                  };
                  // Existing teacher card in map (with recent edits) takes priority over stale user profile!
                  const existing = map.get(String(tId)) || Array.from(map.values()).find(t => 
                    (uEmail && t.email && t.email.toLowerCase().trim() === uEmail) ||
                    (uMat && t.matricule && t.matricule.toLowerCase().trim() === uMat)
                  );
                  if (existing) {
                    map.set(String(existing.id), { ...teacherObj, ...existing });
                  } else {
                    map.set(String(tId), teacherObj);
                  }
                }
              });
              const merged = Array.from(map.values()).filter(t => !isDeletedUser(t));
              try {
                localStorage.setItem('school_db_teachers', JSON.stringify(merged));
              } catch (e) {}
              return merged;
            });
          }
        }
      });

      // Subscribe to real-time schedules collection in Firestore so all user phones stay interconnected
      const unsubscribeSchedules = subscribeToRealtimeCollection('schedules', (remoteSchedules: any[]) => {
        if (remoteSchedules && remoteSchedules.length > 0) {
          remoteSchedules.forEach((schedDoc) => {
            if (schedDoc && Array.isArray(schedDoc.events) && schedDoc.events.length > 0) {
              const classId = schedDoc.classId || schedDoc.id;
              const className = schedDoc.className || '';
              const events = schedDoc.events;
              const CURRENT_VERSION = 'v4_tled1_devoir';

              if (classId) {
                localStorage.setItem(`school_schedule_${classId}`, JSON.stringify(events));
                localStorage.setItem(`school_schedule_ver_${classId}`, CURRENT_VERSION);
              }
              if (className) {
                localStorage.setItem(`school_schedule_${className}`, JSON.stringify(events));
                localStorage.setItem(`school_schedule_ver_${className}`, CURRENT_VERSION);
              }

              window.dispatchEvent(new CustomEvent('school_schedule_updated', {
                detail: { classId, className, events, source: 'remote' }
              }));
            }
          });
        }
      });

      // Subscribe to real-time time_slots collection in Firestore
      const unsubscribeTimeSlots = subscribeToRealtimeCollection('time_slots', (remoteSlots: any[]) => {
        if (remoteSlots && remoteSlots.length > 0) {
          remoteSlots.forEach((slotDoc) => {
            if (slotDoc && Array.isArray(slotDoc.slots) && slotDoc.slots.length > 0) {
              const classId = slotDoc.classId || slotDoc.id;
              const className = slotDoc.className || '';
              const slots = slotDoc.slots;

              if (classId) {
                localStorage.setItem(`school_time_slots_${classId}`, JSON.stringify(slots));
              }
              if (className) {
                localStorage.setItem(`school_time_slots_${className}`, JSON.stringify(slots));
              }

              window.dispatchEvent(new CustomEvent('school_time_slots_updated', {
                detail: { classId, className, slots, source: 'remote' }
              }));
            }
          });
        }
      });

      const handleTeacherRegistered = (e: any) => {
        const newT = e.detail;
        if (newT) {
          setTeachers(prev => {
            let updated: Teacher[];
            if (prev.some(t => String(t.id) === String(newT.id) || (t.email && t.email.toLowerCase() === (newT.email || '').toLowerCase()))) {
              updated = prev.map(t => (String(t.id) === String(newT.id) || (t.email && t.email.toLowerCase() === (newT.email || '').toLowerCase())) ? { ...t, ...newT } : t);
            } else {
              updated = [newT, ...prev];
            }
            try {
              localStorage.setItem('school_db_teachers', JSON.stringify(updated));
            } catch (err) {}
            return updated;
          });
        }
      };

      const handleStudentRegistered = (e: any) => {
        const newS = e.detail;
        if (newS) {
          setStudents(prev => {
            if (prev.some(s => String(s.id) === String(newS.id) || (s.matricule && s.matricule === newS.matricule))) {
              return prev.map(s => (String(s.id) === String(newS.id) || (s.matricule && s.matricule === newS.matricule)) ? { ...s, ...newS } : s);
            }
            return [newS, ...prev];
          });
        }
      };

      window.addEventListener('teacher-registered', handleTeacherRegistered);
      window.addEventListener('student-registered', handleStudentRegistered);

      return () => {
        unsubscribeStudents();
        unsubscribeTeachers();
        unsubscribeUsers();
        unsubscribeSchedules();
        unsubscribeTimeSlots();
        window.removeEventListener('teacher-registered', handleTeacherRegistered);
        window.removeEventListener('student-registered', handleStudentRegistered);
      };
  }, []);

  useEffect(() => {
      localStorage.setItem('school_db_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    if (currentUser && (currentUser.role === 'teacher' || currentUser.accessLevel === 3) && teachers && teachers.length > 0) {
      const match = teachers.find(t => 
        (currentUser.matricule && t.matricule && t.matricule.toLowerCase() === currentUser.matricule.toLowerCase()) ||
        (currentUser.email && t.email && t.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (currentUser.name && t.name && t.name.toLowerCase() === currentUser.name.toLowerCase()) ||
        String(t.id) === String(currentUser.id) ||
        (t as any).uid === currentUser.id ||
        (t as any).authUid === currentUser.id
      );
      if (match) {
        const assignedClasses = Array.isArray(match.assignedClasses) ? match.assignedClasses : [];
        const principalClasses = Array.isArray(match.principalClasses) ? match.principalClasses : [];
        const assignedClassStr = assignedClasses.length > 0 ? assignedClasses.join(', ') : '';
        const photoVal = match.photo || (match as any).photoUrl || (match as any).avatarUrl || currentUser.photo;

        const currAssignedStr = JSON.stringify(currentUser.assignedClasses || []);
        const newAssignedStr = JSON.stringify(assignedClasses);
        const currPPStr = JSON.stringify(currentUser.principalClasses || []);
        const newPPStr = JSON.stringify(principalClasses);

        if (
          currAssignedStr !== newAssignedStr ||
          currPPStr !== newPPStr ||
          currentUser.assignedClass !== assignedClassStr ||
          currentUser.subject !== match.subject ||
          currentUser.name !== match.name ||
          currentUser.email !== match.email ||
          currentUser.phone !== match.phone ||
          currentUser.photo !== photoVal ||
          Boolean(currentUser.isPrincipal) !== Boolean(match.isPrincipal)
        ) {
          const updatedUser: User = {
            ...currentUser,
            name: match.name || currentUser.name,
            email: match.email || currentUser.email,
            phone: match.phone || currentUser.phone,
            subject: match.subject || currentUser.subject,
            subjects: match.subjects || (match.subject ? [match.subject] : currentUser.subjects),
            assignedClasses,
            assignedClass: assignedClassStr,
            photo: photoVal,
            photoUrl: photoVal,
            isPrincipal: Boolean(match.isPrincipal),
            principalClasses,
            matricule: match.matricule || currentUser.matricule
          };

          setCurrentUser(updatedUser);
          const session = localStorage.getItem('school_user_session');
          if (session) {
            try {
              const parsed = JSON.parse(session);
              localStorage.setItem('school_user_session', JSON.stringify({ ...parsed, ...updatedUser }));
            } catch (e) {}
          }
        }
      }
    }
  }, [teachers]);

  useEffect(() => {
      localStorage.setItem('school_db_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
      localStorage.setItem('school_db_trimester_averages', JSON.stringify(trimesterAverages));
  }, [trimesterAverages]);

  useEffect(() => {
      initCapacitorImmersive();
      startWebNotificationEngine();
  }, []);

  const handleAnalyzeStudent = (student: Student) => {
    setSelectedStudentToAnalyze(student);
    setActivePage('dashboard');
  };

  // Navigation history stack for mobile physical back button support
  const navHistoryRef = useRef<string[]>(['dashboard']);

  const handleGoBack = useCallback(() => {
    // 1. Close open modal if active
    const openModalCloseBtn = document.querySelector('[data-modal-close="true"]') as HTMLButtonElement | null;
    if (openModalCloseBtn) {
      openModalCloseBtn.click();
      return;
    }

    const activeModals = document.querySelectorAll('.fixed.z-\\[100\\], .fixed.z-\\[110\\], .fixed.z-\\[120\\]');
    if (activeModals && activeModals.length > 0) {
      window.dispatchEvent(new CustomEvent('close-all-modals'));
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: false } }));
    }

    // 2. Go to previous page in history
    if (navHistoryRef.current.length > 1) {
      navHistoryRef.current.pop(); // remove current active page
      const previousPage = navHistoryRef.current[navHistoryRef.current.length - 1];
      setActivePage(previousPage);
    } else {
      // If already at root of history, return to dashboard if not already there
      setActivePage(prev => {
        if (prev !== 'dashboard') {
          navHistoryRef.current = ['dashboard'];
          return 'dashboard';
        }
        return prev;
      });
    }
  }, []);

  const handleNavigate = (page: string) => {
      let target = page;
      if (typeof target === 'string' && ['prof', 'profs', 'professeur', 'professeurs'].includes(target.toLowerCase())) {
        target = 'teachers';
      }
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      if (isMobile && MOBILE_EXCLUDED_PAGES.includes(target)) {
        return;
      }
      if (target === activePage) return;

      navHistoryRef.current.push(target);
      setActivePage(target);

      try {
        window.history.pushState({ page: target }, '', '');
      } catch (e) {}
  };

  // Sync with browser history popstate (mobile browser back button & swipe back gesture)
  useEffect(() => {
    try {
      window.history.replaceState({ page: 'dashboard' }, '', '');
    } catch (e) {}

    const onPopState = (e: PopStateEvent) => {
      if (e.state && e.state.page) {
        const targetPage = e.state.page;
        setActivePage(targetPage);
        if (navHistoryRef.current.length > 1) {
          navHistoryRef.current.pop();
        } else {
          navHistoryRef.current = [targetPage];
        }
      } else {
        handleGoBack();
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [handleGoBack]);

  // Support for Android physical hardware back button via Capacitor App plugin
  useEffect(() => {
    let removeListener: (() => void) | null = null;
    try {
      CapacitorApp.addListener('backButton', () => {
        handleGoBack();
      }).then(handle => {
        removeListener = () => handle.remove();
      }).catch(err => {
        console.warn('Capacitor backButton error:', err);
      });
    } catch (err) {
      console.warn('Capacitor App listener skipped:', err);
    }

    return () => {
      if (removeListener) removeListener();
    };
  }, [handleGoBack]);

  const handleAddStudent = async (newStudent: Student) => {
      setStudents(prev => [newStudent, ...prev]); 
      // Save to Firestore real-time DB
      await saveRealtimeDocument('students', String(newStudent.id), newStudent);

      // Pre-register student and parent in Firestore whitelist
      const fullName = (newStudent.name || `${newStudent.firstName || ''} ${newStudent.lastName || ''}`).trim();
      const firstName = newStudent.firstName || fullName.split(' ')[0] || '';
      const lastName = newStudent.lastName || fullName.split(' ').slice(1).join(' ') || firstName;
      const studentMatricule = newStudent.matricule || newStudent.studentId;

      if (studentMatricule) {
        // Pre-register Student with full profile info for instant account linking
        await preRegisterUserByAdmin({
          id: `pre-student-${newStudent.id}`,
          studentDocId: String(newStudent.id),
          matricule: studentMatricule,
          studentId: studentMatricule,
          name: fullName,
          firstName,
          lastName,
          role: 'student',
          assignedClass: newStudent.class,
          phone: newStudent.studentPhone || newStudent.phone || '',
          birthDate: newStudent.birthDate,
          birthPlace: newStudent.birthPlace,
          gender: newStudent.gender,
          photo: newStudent.photoUrl,
          assignedStatus: newStudent.assignedStatus,
          isAccountCreated: false
        }).catch(err => console.warn("Error pre-registering student whitelist:", err));

        // Pre-register Parent
        const parentTel = newStudent.parentPhone || newStudent.parentContact || newStudent.fatherPhone || newStudent.motherPhone || newStudent.tutorPhone;
        if (parentTel) {
          await preRegisterUserByAdmin({
            id: `pre-parent-${newStudent.id}`,
            studentDocId: String(newStudent.id),
            matricule: `P-${studentMatricule}`,
            studentId: studentMatricule,
            phone: parentTel,
            name: `Parent de ${fullName}`,
            firstName: `Parent de`,
            lastName: fullName,
            role: 'parent',
            assignedClass: newStudent.class,
            isAccountCreated: false
          }).catch(err => console.warn("Error pre-registering parent whitelist:", err));
        }
      }
  };

  const handleAddTeacher = async (newTeacher: Teacher) => {
      setTeachers(prev => [newTeacher, ...prev]); 
      // Save to Firestore real-time DB
      await saveRealtimeDocument('teachers', String(newTeacher.id), newTeacher);
      
      // Pre-register teacher in whitelist collection
      const fullName = (newTeacher.name || '').trim();
      const firstName = (newTeacher as any).firstName || fullName.split(' ')[0] || '';
      const lastName = (newTeacher as any).lastName || fullName.split(' ').slice(1).join(' ') || firstName;

      await preRegisterUserByAdmin({
        id: `pre-teacher-${newTeacher.id}`,
        name: fullName,
        firstName,
        lastName,
        email: newTeacher.email,
        phone: newTeacher.phone,
        role: 'teacher',
        subject: newTeacher.subject,
        assignedClasses: newTeacher.assignedClasses,
        accessLevel: 3,
        isAccountCreated: false
      }).catch(err => console.warn("Error pre-registering teacher whitelist:", err));
  };

  const handleUpdateTeacher = async (updatedTeacher: Teacher) => {
      setTeachers(prev => {
          const newList = prev.map(t => String(t.id) === String(updatedTeacher.id) ? updatedTeacher : t);
          localStorage.setItem('school_db_teachers', JSON.stringify(newList));
          return newList;
      });
      await saveRealtimeDocument('teachers', String(updatedTeacher.id), updatedTeacher).catch(console.error);

      const assignedClasses = Array.isArray(updatedTeacher.assignedClasses) ? updatedTeacher.assignedClasses : [];
      const principalClasses = Array.isArray(updatedTeacher.principalClasses) ? updatedTeacher.principalClasses : [];
      const assignedClassStr = assignedClasses.length > 0 ? assignedClasses.join(', ') : '';
      const photoVal = updatedTeacher.photo || (updatedTeacher as any).photoUrl || (updatedTeacher as any).avatarUrl || '';

      // Also update any matching user doc in users collection or preRegisteredUsers collection
      try {
          const { collection, getDocs, doc, setDoc } = await import('firebase/firestore');
          const { db } = await import('./src/lib/firebase');

          const usersSnap = await getDocs(collection(db, 'users'));
          usersSnap.docs.forEach(async (uDoc) => {
              const uData = uDoc.data();
              const isMatch = 
                  String(uDoc.id) === String(updatedTeacher.id) ||
                  (uData.matricule && updatedTeacher.matricule && uData.matricule.toLowerCase() === updatedTeacher.matricule.toLowerCase()) ||
                  (uData.email && updatedTeacher.email && uData.email.toLowerCase() === updatedTeacher.email.toLowerCase()) ||
                  (uData.name && updatedTeacher.name && uData.name.toLowerCase() === updatedTeacher.name.toLowerCase());
              if (isMatch) {
                  await setDoc(doc(db, 'users', uDoc.id), {
                      name: updatedTeacher.name,
                      email: updatedTeacher.email,
                      phone: updatedTeacher.phone,
                      subject: updatedTeacher.subject,
                      subjects: updatedTeacher.subjects || (updatedTeacher.subject ? [updatedTeacher.subject] : []),
                      assignedClasses,
                      assignedClass: assignedClassStr,
                      photo: photoVal || uData.photo || '',
                      photoUrl: photoVal || uData.photoUrl || '',
                      isPrincipal: Boolean(updatedTeacher.isPrincipal),
                      principalClasses,
                      matricule: updatedTeacher.matricule || uData.matricule || ''
                  }, { merge: true }).catch(console.error);
              }
          });

          const preSnap = await getDocs(collection(db, 'preRegisteredUsers'));
          preSnap.docs.forEach(async (pDoc) => {
              const pData = pDoc.data();
              const isMatch = 
                  String(pDoc.id) === String(updatedTeacher.id) ||
                  (pData.matricule && updatedTeacher.matricule && pData.matricule.toLowerCase() === updatedTeacher.matricule.toLowerCase()) ||
                  (pData.email && updatedTeacher.email && pData.email.toLowerCase() === updatedTeacher.email.toLowerCase()) ||
                  (pData.name && updatedTeacher.name && pData.name.toLowerCase() === updatedTeacher.name.toLowerCase());
              if (isMatch) {
                  await setDoc(doc(db, 'preRegisteredUsers', pDoc.id), {
                      name: updatedTeacher.name,
                      email: updatedTeacher.email,
                      phone: updatedTeacher.phone,
                      subject: updatedTeacher.subject,
                      assignedClasses,
                      assignedClass: assignedClassStr,
                      photo: photoVal,
                      isPrincipal: Boolean(updatedTeacher.isPrincipal),
                      principalClasses
                  }, { merge: true }).catch(console.error);
              }
          });
      } catch (e) {
          console.warn("Error persisting updated teacher to users/preRegisteredUsers collections:", e);
      }

      if (currentUser) {
          const isSameUser = 
            (currentUser.matricule && updatedTeacher.matricule && currentUser.matricule.toLowerCase() === updatedTeacher.matricule.toLowerCase()) ||
            (currentUser.email && updatedTeacher.email && currentUser.email.toLowerCase() === updatedTeacher.email.toLowerCase()) ||
            (currentUser.name && updatedTeacher.name && currentUser.name.toLowerCase() === updatedTeacher.name.toLowerCase()) ||
            String(currentUser.id) === String(updatedTeacher.id) ||
            (currentUser.uid && updatedTeacher.uid && String(currentUser.uid) === String(updatedTeacher.uid)) ||
            (currentUser.uid && updatedTeacher.authUid && String(currentUser.uid) === String(updatedTeacher.authUid)) ||
            (currentUser.id && updatedTeacher.authUid && String(currentUser.id) === String(updatedTeacher.authUid)) ||
            (currentUser.id && updatedTeacher.uid && String(currentUser.id) === String(updatedTeacher.uid));

          if (isSameUser) {
              const updatedUser: User = {
                  ...currentUser,
                  name: updatedTeacher.name || currentUser.name,
                  email: updatedTeacher.email || currentUser.email,
                  phone: updatedTeacher.phone || currentUser.phone,
                  subject: updatedTeacher.subject || currentUser.subject,
                  subjects: updatedTeacher.subjects || (updatedTeacher.subject ? [updatedTeacher.subject] : currentUser.subjects),
                  assignedClasses,
                  assignedClass: assignedClassStr,
                  photo: photoVal || currentUser.photo,
                  photoUrl: photoVal || currentUser.photoUrl,
                  isPrincipal: Boolean(updatedTeacher.isPrincipal),
                  principalClasses,
                  matricule: updatedTeacher.matricule || currentUser.matricule,
                  accreditationCode: updatedTeacher.accreditationCode || currentUser.accreditationCode
              };
              setCurrentUser(updatedUser);
              const session = localStorage.getItem('school_user_session');
              if (session) {
                  try {
                      const parsed = JSON.parse(session);
                      localStorage.setItem('school_user_session', JSON.stringify({ ...parsed, ...updatedUser }));
                  } catch (e) {}
              }
          }
      }
  };

  const handleDeleteTeacher = async (teacherId: string | number) => {
      const idStr = String(teacherId);
      try {
          const deletedIds: string[] = JSON.parse(localStorage.getItem('deleted_teacher_ids') || '[]');
          if (!deletedIds.includes(idStr)) {
              deletedIds.push(idStr);
              localStorage.setItem('deleted_teacher_ids', JSON.stringify(deletedIds));
          }
      } catch (e) {
          console.error(e);
      }
      setTeachers(prev => {
          const filtered = prev.filter(t => String(t.id) !== idStr);
          localStorage.setItem('school_db_teachers', JSON.stringify(filtered));
          return filtered;
      });
      await deleteRealtimeDocument('teachers', idStr).catch(console.error);
  };

  // Updated handler for detailed attendance with SUBJECT and TIME context
  const handleUpdateAttendance = (
      updates: { id: string; type?: 'absent' | 'late' | 'present'; status?: 'absent' | 'late' | 'present'; hours: number }[],
      context?: { subject: string; time: string; teacherName?: string }
  ) => {
    const todayStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    const sessionSubject = context?.subject || 'Matière non spécifiée';
    const sessionTime = context?.time || 'Heure non spécifiée';
    const sessionTeacherName = context?.teacherName || currentUser?.name || 'Professeur non spécifié';

    setStudents(prevStudents => {
      const updated = prevStudents.map(student => {
        const update = updates.find(u => 
          String(u.id) === String(student.id) || 
          (student.studentId && String(u.id) === String(student.studentId))
        );
        if (!update) return student;

        const updateStatus = update.status || update.type || 'present';
        const currentHistory = student.attendanceHistory || [];

        // Check for an existing record for today/Aujourd'hui matching subject & timeSlot
        const existingIdx = currentHistory.findIndex(
          r => (r.date === todayStr || r.date === "Aujourd'hui") && 
               r.subject === sessionSubject && 
               r.timeSlot === sessionTime
        );

        let newHistory = [...currentHistory];

        if (updateStatus === 'present' || update.hours <= 0) {
          // If marked present or 0 hours, remove any existing record for this session
          if (existingIdx !== -1) {
            newHistory.splice(existingIdx, 1);
          }
        } else {
          // Marked absent or late
          const recordId = existingIdx !== -1 
            ? currentHistory[existingIdx].id 
            : `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

          const newRecord: AttendanceRecord = {
            id: recordId,
            date: todayStr,
            type: updateStatus as 'absent' | 'late',
            hours: update.hours,
            justified: existingIdx !== -1 ? currentHistory[existingIdx].justified : false,
            subject: sessionSubject,
            timeSlot: sessionTime,
            exactTime: existingIdx !== -1 && currentHistory[existingIdx].exactTime ? currentHistory[existingIdx].exactTime : new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            teacherName: sessionTeacherName
          };

          if (existingIdx !== -1) {
            newHistory[existingIdx] = newRecord;
          } else {
            newHistory = [newRecord, ...newHistory];
          }
        }

        const newTotalAbsenceHours = newHistory.reduce((acc, curr) => acc + (curr.hours || 0), 0);

        const updatedStud: Student = {
          ...student,
          absences: newTotalAbsenceHours,
          attendanceHistory: newHistory
        };

        // Sync to Firestore
        saveRealtimeDocument('students', String(updatedStud.id), updatedStud).catch(console.error);

        return updatedStud;
      });

      localStorage.setItem('school_db_students', JSON.stringify(updated));
      return updated;
    });
  };

  const handleUpdateAllStudents = (updatedStudents: Student[]) => {
      setStudents(updatedStudents);
      localStorage.setItem('school_db_students', JSON.stringify(updatedStudents));
      
      setTrimesterAverages(prev => {
          const nextTrims = { ...prev };
          updatedStudents.forEach(stud => {
              const studentTrims: Record<string, number> = {};
              if (stud.trimesters) {
                  Object.entries(stud.trimesters || {}).forEach(([trimKey, trimVal]) => {
                      if (typeof trimVal?.average === 'number') {
                          studentTrims[trimKey] = trimVal.average;
                      }
                  });
              }
              nextTrims[stud.id] = studentTrims;
          });
          return nextTrims;
      });

      updatedStudents.forEach(stud => {
          saveRealtimeDocument('students', String(stud.id), stud).catch(console.error);
      });
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
      if (updatedStudent.trimesters) {
          setTrimesterAverages(prev => {
              const studentTrims = prev[updatedStudent.id] || {};
              const newTrims = { ...studentTrims };
              Object.entries(updatedStudent.trimesters || {}).forEach(([trimKey, trimVal]) => {
                  if (typeof trimVal?.average === 'number') {
                      newTrims[trimKey] = trimVal.average;
                  }
              });
              return {
                  ...prev,
                  [updatedStudent.id]: newTrims
              };
          });
      }

      setStudents(prevStudents => {
          return prevStudents.map(student => 
              String(student.id) === String(updatedStudent.id) ? updatedStudent : student
          );
      });
      // Save update to Firestore
      saveRealtimeDocument('students', String(updatedStudent.id), updatedStudent).catch(console.error);

      if (selectedStudentToAnalyze && String(selectedStudentToAnalyze.id) === String(updatedStudent.id)) {
          setSelectedStudentToAnalyze(updatedStudent);
      }
  };

  const handleDeleteStudent = (studentId: string) => {
      setStudents(prevStudents => prevStudents.filter(student => student.id !== studentId));
      deleteRealtimeDocument('students', studentId).catch(console.error);
      if (selectedStudentToAnalyze?.id === studentId) {
          setSelectedStudentToAnalyze(null);
          handleNavigate('students');
      }
  };

  const handleLogin = (user: User) => {
      setCurrentUser(user);
      localStorage.setItem('school_user_session', JSON.stringify(user));
      localStorage.setItem('school_user', JSON.stringify(user));
      
      // Auto-link or create student record if they are a student
      if (user.role === 'student') {
          setStudents(prev => {
              const uMat = (user.matricule || '').toLowerCase().trim();
              const cleanUMat = uMat.replace(/[^a-z0-9]/g, '');
              const uName = (user.name || '').toLowerCase().trim();
              const uId = String(user.id || '');

              const existsIdx = prev.findIndex(s => {
                const sMat = (s.studentId || s.matricule || '').toLowerCase().trim();
                const cleanSMat = sMat.replace(/[^a-z0-9]/g, '');
                return (
                  String(s.id) === uId ||
                  (s as any).authUid === uId ||
                  (uMat && sMat && (sMat === uMat || (cleanUMat.length >= 3 && cleanSMat === cleanUMat))) ||
                  (uName && s.name && s.name.toLowerCase().trim() === uName)
                );
              });

              if (existsIdx >= 0) {
                // Link authUid and keep all existing pre-registered student data (grades, evaluations, notes) intact!
                const existing = prev[existsIdx];
                const updatedStudent: Student = {
                  ...existing,
                  authUid: user.id ? String(user.id) : existing.authUid,
                  accountCreated: true,
                  isAccountCreated: true
                };
                saveRealtimeDocument('students', String(existing.id), updatedStudent).catch(() => {});
                const nextList = [...prev];
                nextList[existsIdx] = updatedStudent;
                return nextList;
              }
              
              // Only create a fresh student record if student was never pre-registered
              const newStudent: Student = {
                  id: `student-${Date.now()}`,
                  name: user.name,
                  class: user.assignedClass || 'Terminale D1',
                  photoUrl: user.photo || `https://i.pravatar.cc/150?u=${Date.now()}`,
                  studentId: user.matricule || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
                  matricule: user.matricule,
                  parentPhone: user.parentPhone || '',
                  birthDate: user.birthDate || '',
                  absences: 0,
                  assignedStatus: (user.assignedStatus as 'affecte' | 'non_affecte') || 'affecte',
                  attendanceHistory: [],
                  performance: [
                      { name: 'Sep', studentScore: 0, classAverage: 0 },
                      { name: 'Oct', studentScore: 0, classAverage: 0 },
                      { name: 'Nov', studentScore: 0, classAverage: 0 },
                      { name: 'Dec', studentScore: 0, classAverage: 0 },
                  ],
                  subjects: [
                      { name: 'Mathématiques', value: 20, average: 0, fill: '#3b82f6', grades: [] },
                      { name: 'Français', value: 15, average: 0, fill: '#a855f7', grades: [] },
                      { name: 'Anglais', value: 15, average: 0, fill: '#f43f5e', grades: [] },
                      { name: 'Histoire-Geo', value: 10, average: 0, fill: '#22d3ee', grades: [] }
                  ],
                  activities: []
              };
              saveRealtimeDocument('students', String(newStudent.id), newStudent).catch(() => {});
              return [newStudent, ...prev];
          });
      }
  };

  const handleUpdateUser = (updatedUser: User) => {
      setCurrentUser(updatedUser);
      localStorage.setItem('school_user_session', JSON.stringify(updatedUser));
      localStorage.setItem('school_user', JSON.stringify(updatedUser));
  };

  const handleLogout = async () => {
      try {
        await logoutUserAccount();
      } catch (e) {
        console.error('Error during logout:', e);
      }
      setCurrentUser(null);
      setActivePage('dashboard');
      setSelectedStudentToAnalyze(null);
      localStorage.removeItem('school_user_session');
      localStorage.removeItem('school_user');
      sessionStorage.clear();
  };

  // --- ACCESS CONTROL LOGIC ---
  const getPagePermission = (page: string, level: number, role?: string, section?: string): boolean => {
      // Exclure en mode mobile les pages spécifiées
      if (typeof window !== 'undefined' && window.innerWidth < 768 && MOBILE_EXCLUDED_PAGES.includes(page)) {
          return false;
      }

      // Hide administrative governance pages for Primary section (keep student/parent representative pages accessible)
      if (section === 'Primaire') {
          if (['conseil', 'responsables_up'].includes(page)) {
              return false;
          }
      }

      const normalizedRole = role?.toLowerCase() || '';
      const isStudent = normalizedRole === 'student' || normalizedRole === 'eleve' || normalizedRole === 'élève';
      const isParent = normalizedRole === 'parent';
      const isStudentOrParent = isStudent || isParent;
      const isCashier = normalizedRole === 'cashier' || normalizedRole === 'caissier';
      const isTeacher = normalizedRole === 'teacher' || normalizedRole === 'professeur';

      // Parents cannot access Conseil d'enseignement (CE), Responsables UP, or Chefs de classe
      if (isParent && ['conseil', 'responsables_up', 'chefs_de_classe'].includes(page)) {
          return false;
      }

      const effLevel = level ?? 1;
      if (effLevel === 5) return true; // Director/Admin sees everything permitted
      
      switch(page) {
          case 'dashboard': return effLevel >= 1;
          case 'students': return effLevel >= 1 && !isCashier; // Accessible à la classe autorisée
          case 'teachers':
          case 'prof':
          case 'profs':
          case 'professeur':
          case 'professeurs': return effLevel >= 1; // Level 1 (Élève/Parent) + Educator/Director
          case 'conseil': return level >= 1 && !isStudentOrParent; // Conseil d'enseignement (CE) not for students/parents
          case 'responsables_up': return level >= 1 && !isStudentOrParent; // Responsables UP de la zone not for students/parents
          case 'chefs_de_classe': return level >= 1 && !isParent; // Chefs de classe not for parents
          case 'bureau_delegues': return level >= 1; // Accessible à tous (élèves et parents inclus)
          case 'bureau_parents': return level >= 1; // Accessible à tous (élèves et parents inclus)
          case 'classes': return level >= 1; // Level 1 (Élève/Parent) + Educator/Director
          case 'schedule': return level >= 1; // Everyone (Students see theirs)
          case 'communication': return level >= 2 && !isTeacher;
          case 'registration': return level >= 2 && !isTeacher;
          case 'insights': return level >= 1;
          case 'fiche_identification': return level >= 1;
          case 'settings': return true;
          default: return true;
      }
  };

  // En mode mobile, les pages exclues sont désactivées
  useEffect(() => {
    const checkMobilePageAccess = () => {
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      if (isMobile && MOBILE_EXCLUDED_PAGES.includes(activePage)) {
        setActivePage('dashboard');
      }
    };
    checkMobilePageAccess();
    window.addEventListener('resize', checkMobilePageAccess);
    return () => window.removeEventListener('resize', checkMobilePageAccess);
  }, [activePage]);

  useEffect(() => {
    const updateStatusBar = async () => {
      let bgColor = '#BFDBFE';
      let isLightBg = true;

      if (!currentUser) {
        bgColor = '#BFDBFE';
        isLightBg = true;
      } else {
        const whitePages = ['settings', 'livret_scolaire', 'fiche_identification'];
        if (['card', 'ma_carte', 'card_dashboard'].includes(activePage)) {
          bgColor = '#030a0e';
          isLightBg = false;
        } else if (whitePages.includes(activePage)) {
          bgColor = '#ffffff';
          isLightBg = true;
        } else {
          bgColor = '#BFDBFE';
          isLightBg = true;
        }
      }

      // Update Web & PWA theme-color meta tags dynamically for iOS Safari and Android Chrome
      const themeColorMetas = document.querySelectorAll('meta[name="theme-color"]');
      if (themeColorMetas.length > 0) {
        themeColorMetas.forEach(meta => meta.setAttribute('content', bgColor));
      } else {
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = bgColor;
        document.head.appendChild(meta);
      }

      // Update apple-mobile-web-app-status-bar-style
      const appleStatusMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
      if (appleStatusMeta) {
        appleStatusMeta.setAttribute('content', isLightBg ? 'default' : 'black-translucent');
      }

      // Keep root & body backgrounds aligned to prevent notch letterboxing
      document.documentElement.style.backgroundColor = bgColor;
      document.body.style.backgroundColor = bgColor;

      // Update Electron Title Bar
      if (window.electronAPI) {
        window.electronAPI.setTitleBarColor(bgColor, isLightBg ? '#1e293b' : '#ffffff');
      }

      // Update Capacitor Status Bar
      await setCapacitorStatusBarColor(bgColor, isLightBg);
    };

    updateStatusBar();
  }, [currentUser, activePage]);

  if (!currentUser) {
      return (
        <>
          <AnimatePresence>
            {showAppSplash && <AppSplashScreen />}
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.div 
              key="login-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              className="min-h-screen w-full relative overflow-hidden bg-[#BFDBFE]"
              style={{ willChange: 'opacity' }}
            >
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
              <RippleGrid 
                color="#38bdf8"
                variant="lines"
                cellSize={48}
                lineWidth={1}
                glow={0.6}
                rippleStrength={0.8}
                rippleSpeed={1}
                autoRipple="center"
                rippleInterval={3}
                mouseInteraction={true}
                clickRipple={true}
                intro={true}
                fade={0.3}
                opacity={0.6}
              />
            </div>
            <div className="relative z-10 w-full h-full">
              <LoginPage onLogin={handleLogin} />
            </div>
          </motion.div>
        </AnimatePresence>
      </>
    );
  }

  const isAllowed = getPagePermission(activePage, currentUser.accessLevel, currentUser.role, currentUser.section);

  const getPreSelectedStudent = () => {
      if (currentUser?.role === 'student' || currentUser?.role === 'parent') {
          // Find student by matricule or name
          let student = students.find(s => s.studentId === currentUser.matricule);
          if (!student) {
              student = students.find(s => s.name.toLowerCase() === currentUser.name.toLowerCase());
          }
          return student || null;
      }
      return selectedStudentToAnalyze;
  };

  const getStudentClass = () => {
    if (currentUser?.assignedClass) return currentUser.assignedClass;
    if (currentUser?.role === 'student' || currentUser?.role === 'parent' || currentUser?.accessLevel === 1) {
      let student = students.find(s => s.studentId === currentUser.matricule);
      if (!student) {
        student = students.find(s => s.name.toLowerCase() === currentUser.name.toLowerCase());
      }
      if (student) return student.class;
    }
    return undefined;
  };

  const restrictedClass = (currentUser?.role === 'student') 
    ? (currentUser?.assignedClass || getStudentClass() || (currentUser.section === 'Primaire' ? 'CM2' : 'Terminale D1')) 
    : undefined;

  const canEditData = currentUser.accessLevel === 5 || currentUser.accessLevel === 2 || currentUser.accessLevel === 3 || currentUser.role === 'director' || currentUser.role === 'educator' || currentUser.role === 'teacher';
  const isReadOnly = !canEditData;

  return (
    <>
      <AnimatePresence>
        {showAppSplash && <AppSplashScreen />}
      </AnimatePresence>
      <div className="flex h-screen bg-[#BFDBFE] font-sans overflow-hidden print:h-auto print:overflow-visible print:block relative">
        {/* RippleGrid Background Overlay */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-50">
        <RippleGrid 
          color="#38bdf8"
          variant="lines"
          cellSize={48}
          lineWidth={1}
          glow={0.6}
          rippleStrength={0.8}
          rippleSpeed={1}
          autoRipple="center"
          rippleInterval={3}
          mouseInteraction={true}
          clickRipple={true}
          intro={true}
          fade={0.3}
          opacity={0.6}
        />
      </div>

      <div className="relative z-10 flex h-full w-full overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={handleNavigate} userRole={currentUser.role} userLevel={currentUser.accessLevel} userSection={currentUser.section} currentUser={currentUser} />
        
        <main className="flex-1 flex flex-col relative h-full overflow-hidden w-full print:h-auto print:overflow-visible print:block bg-white shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.1)]">
          <AnimatePresence mode="wait" initial={false}>
            {isAllowed ? (
                <motion.div 
                  key={activePage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.12, ease: 'easeOut' }}
                  className="flex-1 flex flex-col overflow-y-auto relative pb-0 h-full w-full custom-scrollbar print:h-auto print:overflow-visible print:block"
                  style={{ willChange: 'opacity' }}
                >
                    {activePage === 'dashboard' && (
                        <Dashboard 
                            preSelectedStudent={getPreSelectedStudent()} 
                            allStudents={students}
                            onUpdateStudent={handleUpdateStudent}
                            onUpdateAllStudents={handleUpdateAllStudents}
                            onDeleteStudent={handleDeleteStudent}
                            readOnly={isReadOnly}
                            onNavigate={handleNavigate}
                            currentUser={currentUser}
                            selectedTrimester={selectedTrimester}
                            onTrimesterChange={setSelectedTrimester}
                            trimesterAverages={trimesterAverages}
                            onSelectStudent={setSelectedStudentToAnalyze}
                        />
                    )}
                    {activePage === 'students' && (
                        <StudentsPage 
                            students={students} 
                            onUpdateAttendance={handleUpdateAttendance}
                            readOnly={isReadOnly}
                            onNavigate={handleNavigate}
                            currentUser={currentUser}
                            selectedTrimester={selectedTrimester}
                            onTrimesterChange={setSelectedTrimester}
                            onSelectStudent={setSelectedStudentToAnalyze}
                        />
                    )}
                    {['teachers', 'prof', 'profs', 'professeur', 'professeurs'].includes(activePage) && (
                      <TeachersPage 
                        teachers={teachers} 
                        currentUser={currentUser} 
                        restrictedClass={restrictedClass} 
                        allStudents={students} 
                        onAddTeacher={handleAddTeacher}
                        onUpdateTeacher={handleUpdateTeacher}
                        onDeleteTeacher={handleDeleteTeacher}
                      />
                    )}
                    {activePage === 'conseil' && <ConseilEnseignementPage teachers={teachers} currentUser={currentUser} onNavigate={handleNavigate} />}
                    {activePage === 'responsables_up' && <ResponsablesUPPage currentUser={currentUser} teachers={teachers} onNavigate={handleNavigate} />}
                    {activePage === 'chefs_de_classe' && <ChefsDeClassePage currentUser={currentUser} allStudents={students} onNavigate={handleNavigate} />}
                    {activePage === 'bureau_delegues' && <BureauConseilDeleguesPage currentUser={currentUser} allStudents={students} onNavigate={handleNavigate} />}
                    {activePage === 'bureau_parents' && <BureauParentsElevesPage currentUser={currentUser} allStudents={students} onNavigate={handleNavigate} />}
                    {activePage === 'classes' && <ClassesPage onAnalyzeStudent={handleAnalyzeStudent} allStudents={students} teachers={teachers} readOnly={isReadOnly} restrictedClass={restrictedClass} currentUser={currentUser} onNavigate={handleNavigate} />}
                    {activePage === 'livret_scolaire' && <LivretScolairePage allStudents={students} teachers={teachers} currentUser={currentUser} />}
                    {activePage === 'fiche_identification' && <FicheIdentificationPage allStudents={students} teachers={teachers} currentUser={currentUser} onUpdateStudent={handleUpdateStudent} />}
                    {activePage === 'schedule' && (
                      <SchedulePage 
                        allStudents={students} 
                        readOnly={currentUser?.role === 'parent'} 
                        restrictedClass={restrictedClass} 
                        currentUser={currentUser} 
                        onNavigate={handleNavigate} 
                        teachers={teachers} 
                      />
                    )}
                    {activePage === 'settings' && <SettingsPage onLogout={handleLogout} currentUser={currentUser} onUpdateUser={handleUpdateUser} allStudents={students} onUpdateAllStudents={handleUpdateAllStudents} onNavigate={handleNavigate} />}
                    {activePage === 'registration' && <RegistrationPage onAddStudent={handleAddStudent} onAddTeacher={handleAddTeacher} currentUserLevel={currentUser.accessLevel} onNavigate={handleNavigate} currentUser={currentUser} />}
                    {activePage === 'insights' && <InsightsPage currentUser={currentUser} allStudents={students} />}
                    {activePage === 'communication' && <CommunicationPage students={students} currentUser={currentUser} />}
                    {(activePage === 'card' || activePage === 'ma_carte' || activePage === 'card_dashboard') && (
                      <CardDashboard 
                        onBack={handleGoBack} 
                        currentUser={currentUser}
                        student={
                          currentUser?.role === 'student'
                            ? (students.find(s => 
                                (s.matricule && currentUser?.matricule && s.matricule.toLowerCase() === currentUser?.matricule.toLowerCase()) ||
                                (s.studentId && currentUser?.matricule && s.studentId.toLowerCase() === currentUser?.matricule.toLowerCase()) ||
                                (s.name && currentUser?.name && s.name.toLowerCase() === currentUser?.name.toLowerCase()) ||
                                String(s.id) === String(currentUser?.id)
                              ) || students.find(s => s.class === (currentUser?.assignedClass || 'Terminale D1')) || students[0])
                            : (selectedStudentToAnalyze || students.find(s => s.class === 'Terminale D1') || (students && students.length > 0 ? students[0] : null))
                        }
                        onUpdateStudent={handleUpdateStudent}
                        onUpdateUser={handleUpdateUser}
                      />
                    )}
                </motion.div>
            ) : (
                <motion.div 
                  key="restricted"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 pb-[100px]"
                >
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Lock size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Accès Restreint</h2>
                    <p className="text-center max-w-md">
                        Votre niveau d'accréditation (Niveau {currentUser.accessLevel}) ne vous permet pas d'accéder à cette section.
                    </p>
                    <button onClick={() => setActivePage('dashboard')} className="mt-6 px-6 py-2 bg-sky-600 text-white rounded-xl font-bold">
                        Retour à Terminal-D
                    </button>
                </motion.div>
            )}
          </AnimatePresence>

          <BottomNavigation activePage={activePage} onNavigate={handleNavigate} userRole={currentUser.role} userLevel={currentUser.accessLevel} />
        </main>
      </div>

      {/* App PIN / Biometric Lock Screen */}
      {isAppLocked && Boolean(localStorage.getItem('app_pin')) && (
        <AppLockScreen onUnlock={handleUnlockApp} onLogout={handleLogout} />
      )}
    </div>
    </>
  );
};

export default App;