import React, { useState, useEffect } from 'react';
import { Mail, Phone, MoreVertical, Calendar, X, Clock, ChevronLeft, ChevronRight, Lock, Plus, Edit3, Trash2, Save, MapPin, Search, FileText, Printer, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Teacher, User, getSubjectsForClass } from '../types';
import { DailyScheduleMobileView, ScheduleEvent } from './DailyScheduleMobileView';
import { CustomMultiSelect } from './CustomMultiSelect';
import { getStoredTimeSlots, getLunchBreakIndex } from './SchedulePage';
import ReflectiveCard from './ReflectiveCard';
import { ProfileCard } from './ProfileCard';
import { isSameClass } from '../src/utils/parentUtils';
import { saveRealtimeDocument, deleteRealtimeDocument } from '../src/services/firebaseService';
import { getTeacherIndividualAccreditationCode, setTeacherIndividualAccreditationCode } from '../src/utils/accreditationUtils';

interface TeachersPageProps {
    teachers?: Teacher[];
    currentUser?: User | null;
    restrictedClass?: string;
    allStudents?: any[];
    onAddTeacher?: (newTeacher: Teacher) => void;
    onUpdateTeacher?: (updatedTeacher: Teacher) => void;
    onDeleteTeacher?: (teacherId: string | number) => void;
}

// Constants for Schedule Editing
const SUBJECTS = [
    'Mathématiques', 'Français', 'Anglais', 'Hist-Géo', 'SVT', 
    'Physique-Chimie', 'EPS', 'Philosophie', 'Informatique', 'Espagnol', 
    'Allemand', 'Arts Plastiques', 'Musique', 'Devoir',
    'Histoire', 'Géographie', 'EDHC', 'Sciences et Technologies', 'Éducation Musicale', 'Sciences et Technologies (notions de base)'
];

const CLASSES = [
    'CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2',
    '6ème 1', '6ème 2', '5ème 1', '5ème 2', '4ème 1', '4ème 2', '3ème 1', '3ème 2',
    'Seconde C1', 'Seconde C2', 'Seconde A1', 'Seconde A2',
    'Première D1', 'Première D2', 'Première A1', 'Première A2',
    'Terminale D1', 'Terminale D2', 'Terminale A1', 'Terminale A2', 'Terminale C'
];

// Helper to generate a consistent fake schedule based on teacher ID
const getTeacherSchedule = (teacher: Teacher) => {
    const currentSlots = getStoredTimeSlots();
    let rawSchedule = teacher.scheduleData;
    if (!rawSchedule && typeof window !== 'undefined') {
        try {
            const cached = localStorage.getItem(`teacher_schedule_${teacher.id}`);
            if (cached) rawSchedule = JSON.parse(cached);
        } catch (e) {}
    }
    if (rawSchedule && Array.isArray(rawSchedule)) {
        return rawSchedule.map((dayData: any) => ({
            ...dayData,
            slots: (dayData.slots || []).map((s: any, timeIndex: number) => ({
                ...s,
                time: currentSlots[timeIndex] || s.time
            }))
        }));
    }
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
    const fullDayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const slots = currentSlots;
    
    const seed = String(teacher.name || teacher.id || '').length;
    
    return days.map((day, dayIndex) => {
        return {
            day,
            fullName: fullDayNames[dayIndex],
            slots: slots.map((time, timeIndex) => {
                // Simple logic to decide if there is a class (only index 3 is Récréation; Pause Midi is a separator after 11h25 - 12h10)
                const isBreak = timeIndex === 3;
                const isClass = !isBreak && (seed + dayIndex + timeIndex) % 3 === 0; 
                return {
                    time,
                    active: isClass,
                    subject: isClass ? teacher.subject : '',
                    room: isClass ? CLASSES[(seed + dayIndex + timeIndex) % CLASSES.length] : '',
                    duration: 1
                };
            })
        };
    });
};

const getSubjectColor = (subject: string): string => {
    switch (subject) {
        case 'Mathématiques': return 'bg-sky-100 border-sky-200 text-sky-700';
        case 'SVT': return 'bg-cyan-100 border-cyan-200 text-cyan-700';
        case 'Physique-Chimie': return 'bg-purple-100 border-purple-200 text-purple-700';
        case 'Français': return 'bg-pink-100 border-pink-200 text-pink-700';
        case 'Anglais': return 'bg-sky-100 border-sky-200 text-sky-700';
        case 'Hist-Géo': return 'bg-amber-100 border-amber-200 text-amber-700';
        case 'EPS': return 'bg-green-100 border-green-200 text-green-700';
        case 'Philosophie': return 'bg-slate-100 border-slate-200 text-slate-700';
        case 'Informatique': return 'bg-indigo-100 border-indigo-200 text-indigo-700';
        case 'Espagnol': return 'bg-orange-100 border-orange-200 text-orange-700';
        case 'Allemand': return 'bg-lime-100 border-lime-200 text-lime-700';
        case 'Arts Plastiques': return 'bg-fuchsia-100 border-fuchsia-200 text-fuchsia-700';
        case 'Musique': return 'bg-violet-100 border-violet-200 text-violet-700';
        case 'Devoir':
        case 'Devoirs':
        case 'Étude': return 'bg-gray-100 border-gray-200 text-gray-600';
        default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
};

const convertToMobileEvents = (desktopScheduleData: any[]): ScheduleEvent[] => {
    const events: ScheduleEvent[] = [];
    desktopScheduleData.forEach((dayData, dayIndex) => {
        dayData.slots.forEach((slot: any, slotIndex: number) => {
            if (slot.active) {
                events.push({
                    id: `mobile-evt-${dayIndex}-${slotIndex}`,
                    day: dayIndex,
                    start: slotIndex,
                    duration: slot.duration || 1,
                    title: slot.subject,
                    room: slot.room,
                    color: getSubjectColor(slot.subject)
                });
            }
        });
    });
    return events;
};

export const TeachersPage: React.FC<TeachersPageProps> = ({ teachers = [], currentUser, restrictedClass, allStudents = [], onAddTeacher, onUpdateTeacher, onDeleteTeacher }) => {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherToCall, setTeacherToCall] = useState<Teacher | null>(null);
  const [teacherToEmail, setTeacherToEmail] = useState<Teacher | null>(null);
  const [scheduleData, setScheduleData] = useState<any[]>([]); // Editable Schedule State
  const [timeSlots, setTimeSlots] = useState<string[]>(() => getStoredTimeSlots());

  useEffect(() => {
    const handleSlotsUpdate = () => {
      const newSlots = getStoredTimeSlots();
      setTimeSlots(newSlots);
      setScheduleData(prevData => {
        if (!prevData || prevData.length === 0) return prevData;
        return prevData.map(day => ({
          ...day,
          slots: (day.slots || []).map((slot: any, index: number) => ({
            ...slot,
            time: newSlots[index] || slot.time
          }))
        }));
      });
    };
    window.addEventListener('school_time_slots_updated', handleSlotsUpdate);
    window.addEventListener('storage', handleSlotsUpdate);
    return () => {
      window.removeEventListener('school_time_slots_updated', handleSlotsUpdate);
      window.removeEventListener('storage', handleSlotsUpdate);
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);
  const [activeMenuTeacherId, setActiveMenuTeacherId] = useState<string | number | null>(null);

  useEffect(() => {
    const handleOutsideClick = () => setActiveMenuTeacherId(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);
  const [isEditTeacherModalOpen, setIsEditTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editTeacherForm, setEditTeacherForm] = useState({
      name: '',
      matricule: '',
      subject: 'Mathématiques',
      phone: '',
      email: '',
      assignedClasses: [] as string[],
      accreditationCode: ''
  });

  const [lastUpdateTs, setLastUpdateTs] = useState(() => Date.now());

  const handleOpenWhatsApp = (t: Teacher) => {
    const rawPhone = t.phone || '+225 07 00 00 00 00';
    const digits = rawPhone.replace(/\D/g, '');
    const waNumber = digits.startsWith('225')
      ? digits
      : (digits.length === 10 ? `225${digits}` : (digits ? `225${digits}` : '2250700000000'));

    const isColleague = currentUser?.role === 'teacher';
    const greeting = isColleague
      ? `Bonjour cher collègue ${t.name}, je vous contacte depuis la plateforme Terminale-D.`
      : `Bonjour M./Mme ${t.name}, je vous contacte depuis la plateforme Terminale-D.`;

    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(greeting)}`;

    try {
      const link = document.createElement('a');
      link.href = waUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      window.location.href = waUrl;
    }
  };

  const handleOpenEditTeacher = (t: Teacher) => {
      setEditingTeacher(t);
      const existingAccred = t.accreditationCode || getTeacherIndividualAccreditationCode(t) || '';
      setEditTeacherForm({
          name: t.name || '',
          matricule: t.matricule || '',
          subject: t.subject || 'Mathématiques',
          phone: t.phone || '',
          email: t.email || '',
          assignedClasses: Array.isArray(t.assignedClasses) ? t.assignedClasses : [],
          accreditationCode: existingAccred
      });
      setIsEditTeacherModalOpen(true);
  };

  const handleSaveEditedTeacher = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingTeacher || !editTeacherForm.name.trim()) return;

      const formattedAccred = (editTeacherForm.accreditationCode || '').trim().toUpperCase();
      const updated: Teacher = {
          ...editingTeacher,
          name: editTeacherForm.name.trim(),
          matricule: editTeacherForm.matricule.trim() || editingTeacher.matricule,
          subject: editTeacherForm.subject,
          phone: editTeacherForm.phone.trim(),
          email: editTeacherForm.email.trim(),
          assignedClasses: editTeacherForm.assignedClasses,
          accreditationCode: formattedAccred || editingTeacher.accreditationCode
      };

      if (onUpdateTeacher) {
          onUpdateTeacher(updated);
      }
      try {
          const saved = localStorage.getItem('school_db_teachers');
          const list: Teacher[] = saved ? JSON.parse(saved) : teachers;
          const newList = list.map(t => String(t.id) === String(updated.id) ? updated : t);
          localStorage.setItem('school_db_teachers', JSON.stringify(newList));
          window.dispatchEvent(new Event('storage'));
      } catch (err) {
          console.error(err);
      }

      // Sync to Firestore in real-time
      try {
          await saveRealtimeDocument('teachers', String(updated.id), updated);
          if (formattedAccred) {
            setTeacherIndividualAccreditationCode(
              { id: updated.id, email: updated.email, subject: updated.subject },
              formattedAccred
            );
            await saveRealtimeDocument('accreditation_codes', String(updated.id), {
              teacherId: updated.id,
              email: updated.email,
              subject: updated.subject,
              code: formattedAccred,
              updatedAt: Date.now()
            });
          }
      } catch (err) {
          console.warn('Realtime teacher update notice:', err);
      }

      setLastUpdateTs(Date.now());
      setIsEditTeacherModalOpen(false);
      setEditingTeacher(null);
  };

  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  const handleDeleteTeacherAction = (t: Teacher) => {
      setTeacherToDelete(t);
  };

  const confirmDeleteTeacher = async () => {
      if (!teacherToDelete) return;
      const t = teacherToDelete;
      const idStr = String(t.id);

      try {
          const deletedIds: string[] = JSON.parse(localStorage.getItem('deleted_teacher_ids') || '[]');
          if (!deletedIds.includes(idStr)) {
              deletedIds.push(idStr);
              localStorage.setItem('deleted_teacher_ids', JSON.stringify(deletedIds));
          }
      } catch (e) {
          console.error(e);
      }

      if (onDeleteTeacher) {
          onDeleteTeacher(t.id);
      }
      try {
          const saved = localStorage.getItem('school_db_teachers');
          const list: Teacher[] = saved ? JSON.parse(saved) : teachers;
          const newList = list.filter(item => String(item.id) !== idStr);
          localStorage.setItem('school_db_teachers', JSON.stringify(newList));
          localStorage.removeItem(`teacher_schedule_${idStr}`);
          window.dispatchEvent(new Event('storage'));
      } catch (err) {
          console.error(err);
      }

      // Remove from Firestore
      try {
          await deleteRealtimeDocument('teachers', idStr);
      } catch (err) {
          console.warn('Realtime teacher delete notice:', err);
      }

      setLastUpdateTs(Date.now());
      setTeacherToDelete(null);
      setActiveMenuTeacherId(null);
  };
  const [newTeacherForm, setNewTeacherForm] = useState({
      name: '',
      matricule: '',
      gender: 'M',
      dob: '',
      subject: 'Mathématiques',
      level: 'Secondaire',
      assignedClasses: [],
      phone: '',
      email: ''
  });

  const handleRegisterTeacher = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTeacherForm.name.trim()) return;

      const newTeacher: Teacher = {
          id: `PROF-${Date.now()}`,
          name: newTeacherForm.name.trim(),
          matricule: newTeacherForm.matricule.trim() || `MAT-${Date.now()}`,
          gender: newTeacherForm.gender as 'M' | 'F',
          dob: newTeacherForm.dob,
          subject: newTeacherForm.subject,
          level: newTeacherForm.level,
          email: newTeacherForm.email.trim() || '',
          phone: newTeacherForm.phone.trim() || '',
          photo: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 80000000000)}?auto=format&fit=crop&q=80&w=200`,
          assignedClasses: newTeacherForm.assignedClasses,
          status: 'Inactif',
          uid: null,
          accountCreated: false,
          createdAt: new Date().toISOString()
      };

      if (onAddTeacher) {
          onAddTeacher(newTeacher);
      } else {
          const saved = localStorage.getItem('school_db_teachers');
          const list = saved ? JSON.parse(saved) : teachers;
          const updated = [newTeacher, ...list];
          localStorage.setItem('school_db_teachers', JSON.stringify(updated));
          window.dispatchEvent(new Event('storage'));
      }

      setNewTeacherForm({
          name: '',
          subject: 'Mathématiques',
          phone: '',
          email: ''
      });
      setIsAddTeacherModalOpen(false);
  };

  const isLevel1 = currentUser?.accessLevel === 1 || currentUser?.role === 'student' || currentUser?.role === 'parent';
  // Allow managing teacher profiles for admin/teachers, not students/parents
  const canManageProfile = !isLevel1;
  const studentClass = restrictedClass || currentUser?.assignedClass || (currentUser?.section === 'Primaire' ? 'CM2' : 'Terminale D1');

  // Find student record if available
  const matchedStudent = allStudents.find((s: any) => 
    s.studentId === currentUser?.matricule || 
    (currentUser?.name && s.name.toLowerCase() === currentUser.name.toLowerCase()) ||
    s.class === studentClass
  );
  
  const [mobileDayIndex, setMobileDayIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<{dayIndex: number, slotIndex: number} | null>(null);

  useEffect(() => {
      const isNavHidden = !!selectedTeacher || !!teacherToCall || !!teacherToEmail || isEditTeacherModalOpen;
      const event = new CustomEvent('modal-state-change', { detail: { isOpen: isNavHidden } });
      window.dispatchEvent(event);
      window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: isNavHidden } }));
      return () => {
          const revertEvent = new CustomEvent('modal-state-change', { detail: { isOpen: false } });
          window.dispatchEvent(revertEvent);
          window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: false } }));
      };
  }, [selectedTeacher, teacherToCall, teacherToEmail, isEditTeacherModalOpen]);
  const [formData, setFormData] = useState({ subject: '', room: '', duration: 1 });

  // Detect mobile screen size on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleOpenSchedule = (teacher: Teacher) => {
      setSelectedTeacher(teacher);
      setScheduleData(getTeacherSchedule(teacher)); // Initialize schedule state
      setMobileDayIndex(0); 
  };

  // Check if current user can edit this schedule (non-student, non-parent)
  const canEdit = selectedTeacher && (!currentUser || (
    currentUser.role !== 'student' && 
    currentUser.role !== 'parent' && 
    currentUser.accessLevel !== 1
  ));

  const handleSlotClick = (dayIndex: number, slotIndex: number, slotData: any) => {
      if (!canEdit) return;

      setEditingSlot({ dayIndex, slotIndex });
      setFormData({
          subject: slotData.active ? slotData.subject : selectedTeacher?.subject || SUBJECTS[0],
          room: slotData.active ? slotData.room : CLASSES[0],
          duration: slotData.duration || 1
      });
      setIsModalOpen(true);
  };

  const handleSaveSlot = () => {
      if (!editingSlot || !selectedTeacher) return;
      const { dayIndex, slotIndex } = editingSlot;
      
      const newData = [...scheduleData];
      newData[dayIndex].slots[slotIndex] = {
          ...newData[dayIndex].slots[slotIndex],
          active: true,
          subject: formData.subject,
          room: formData.room,
          duration: formData.duration
      };
      
      setScheduleData(newData);
      try {
          localStorage.setItem(`teacher_schedule_${selectedTeacher.id}`, JSON.stringify(newData));
      } catch (e) {}

      const updatedTeacher: Teacher = {
          ...selectedTeacher,
          scheduleData: newData
      };
      setSelectedTeacher(updatedTeacher);
      if (onUpdateTeacher) {
          onUpdateTeacher(updatedTeacher);
      }
      setIsModalOpen(false);
  };

  const handleDeleteSlot = () => {
      if (!editingSlot || !selectedTeacher) return;
      const { dayIndex, slotIndex } = editingSlot;

      const newData = [...scheduleData];
      newData[dayIndex].slots[slotIndex] = {
          ...newData[dayIndex].slots[slotIndex],
          active: false,
          subject: '',
          room: '',
          duration: 1
      };

      setScheduleData(newData);
      try {
          localStorage.setItem(`teacher_schedule_${selectedTeacher.id}`, JSON.stringify(newData));
      } catch (e) {}

      const updatedTeacher: Teacher = {
          ...selectedTeacher,
          scheduleData: newData
      };
      setSelectedTeacher(updatedTeacher);
      if (onUpdateTeacher) {
          onUpdateTeacher(updatedTeacher);
      }
      setIsModalOpen(false);
  };

  const effectiveTeachers = React.useMemo(() => {
    const deletedIds: string[] = (() => {
      try {
        return JSON.parse(localStorage.getItem('deleted_teacher_ids') || '[]');
      } catch (e) {
        return [];
      }
    })();

    let list = teachers.filter(t => !deletedIds.includes(String(t.id)));
    try {
      const local = localStorage.getItem('school_db_teachers');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          const localMap = new Map<string, any>();
          parsed.forEach((lt: any) => {
            if (!deletedIds.includes(String(lt.id))) {
              localMap.set(String(lt.id), lt);
            }
          });
          list = list.map(t => localMap.get(String(t.id)) || t);
          parsed.forEach((lt: any) => {
            if (!deletedIds.includes(String(lt.id)) && !list.some(t => String(t.id) === String(lt.id))) {
              list.push(lt);
            }
          });
        }
      }

      // Also check local school_db_users in case a teacher was saved there
      const localUsers = localStorage.getItem('school_db_users');
      if (localUsers) {
        const parsedUsers = JSON.parse(localUsers);
        if (Array.isArray(parsedUsers)) {
          parsedUsers.forEach((u: any) => {
            const isTeacher = u.role === 'teacher' || u.accessLevel === 3;
            if (isTeacher) {
              const alreadyExists = list.some(t => 
                String(t.id) === String(u.id) || 
                t.uid === u.id || 
                t.authUid === u.id ||
                (u.email && t.email && u.email.toLowerCase() === t.email.toLowerCase()) ||
                (u.matricule && t.matricule && u.matricule.toLowerCase() === t.matricule.toLowerCase())
              );
              if (!alreadyExists) {
                list.push({
                  id: u.id || `PROF-${Date.now()}`,
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
                });
              }
            }
          });
        }
      }
    } catch (e) {}

    const isTeacherUser = currentUser?.role === 'teacher' || currentUser?.accessLevel === 3;
    if (isTeacherUser && currentUser) {
      const exists = list.some(t => 
        String(t.id) === String(currentUser.id) ||
        t.uid === currentUser.id ||
        t.authUid === currentUser.id ||
        (currentUser.email && t.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
        (currentUser.matricule && t.matricule?.toLowerCase() === currentUser.matricule.toLowerCase())
      );

      if (!exists) {
        const loggedTeacherProfile: Teacher = {
          id: currentUser.id || currentUser.matricule || `PROF-${Date.now()}`,
          name: currentUser.name || 'Enseignant',
          subject: currentUser.subject || 'Mathématiques',
          email: currentUser.email || '',
          phone: currentUser.phone || currentUser.teacherPhone || currentUser.parentPhone || currentUser.studentPhone || '',
          matricule: currentUser.matricule || `MAT-${currentUser.id}`,
          assignedClasses: currentUser.assignedClasses && currentUser.assignedClasses.length > 0 ? currentUser.assignedClasses : (currentUser.assignedClass ? [currentUser.assignedClass] : ['Terminale D1']),
          status: 'Actif',
          photo: currentUser.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          accountCreated: true,
          uid: currentUser.id,
          authUid: currentUser.id
        };
        list = [loggedTeacherProfile, ...list];
      }
    }
    return list;
  }, [teachers, currentUser, lastUpdateTs]);

  const getFilteredTeachers = () => {
    const list = effectiveTeachers.filter(t => {
      // If current teacher is logged in, ensure their own profile is shown
      const isSelf = currentUser?.role === 'teacher' && (
        String(t.id) === String(currentUser.id) ||
        t.uid === currentUser.id ||
        t.authUid === currentUser.id ||
        (currentUser.email && t.email?.toLowerCase() === currentUser.email.toLowerCase())
      );

      if (isSelf) {
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          return t.name.toLowerCase().includes(term) ||
                 t.subject.toLowerCase().includes(term) ||
                 (t.email && t.email.toLowerCase().includes(term)) ||
                 (t.phone && t.phone.toLowerCase().includes(term));
        }
        return true;
      }

      if (isLevel1) {
        const isStudentPrimary = currentUser?.section === 'Primaire';
        const cleanTeacherClasses: string[] = [];
        const addCls = (c: any) => {
          if (typeof c === 'string') {
            c.split(',').forEach(sub => {
              const tr = sub.trim();
              if (tr) cleanTeacherClasses.push(tr);
            });
          }
        };
        if (Array.isArray(t.assignedClasses)) {
          t.assignedClasses.forEach(c => addCls(c));
        } else if (typeof t.assignedClasses === 'string') {
          addCls(t.assignedClasses);
        }

        const isTeacherPrimaryOnly = cleanTeacherClasses.length > 0 && cleanTeacherClasses.every(c => /^(CP1|CP2|CE1|CE2|CM1|CM2)/i.test(c));
        if (isTeacherPrimaryOnly !== isStudentPrimary && cleanTeacherClasses.length > 0) {
          return false;
        }
      }

      if (currentUser?.section === 'Primaire') {
        const hasPrimaryClass = Array.isArray(t.assignedClasses) 
          ? t.assignedClasses.some(c => /^(CP1|CP2|CE1|CE2|CM1|CM2)/i.test(c))
          : (t.assignedClasses && /^(CP1|CP2|CE1|CE2|CM1|CM2)/i.test(t.assignedClasses as string));
        
        if (!hasPrimaryClass && t.assignedClasses?.length > 0) return false;
      } else {
        // If student is in Secondaire, don't show strictly primary-only teachers
        const isStrictlyPrimary = Array.isArray(t.assignedClasses) && t.assignedClasses.length > 0 &&
          t.assignedClasses.every(c => /^(CP1|CP2|CE1|CE2|CM1|CM2)/i.test(c));
        if (isStrictlyPrimary) return false;
      }

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return t.name.toLowerCase().includes(term) ||
             t.subject.toLowerCase().includes(term) ||
             (t.email && t.email.toLowerCase().includes(term)) ||
             (t.phone && t.phone.toLowerCase().includes(term));
    });

    // Safety fallback: if strict class filtering produces 0 teachers, but teachers exist in effectiveTeachers for this section,
    // display all teachers for the student's section (Secondaire or Primaire) so students never see an empty list when teachers have registered!
    if (list.length === 0 && isLevel1 && effectiveTeachers.length > 0) {
      const isStudentPrimary = currentUser?.section === 'Primaire';
      return effectiveTeachers.filter(t => {
        const isPrimaryTeacher = Array.isArray(t.assignedClasses) && t.assignedClasses.length > 0 &&
          t.assignedClasses.every(c => /^(CP1|CP2|CE1|CE2|CM1|CM2)/i.test(c));
        return isStudentPrimary ? isPrimaryTeacher : !isPrimaryTeacher;
      });
    }

    return list;
  };

  const handlePrint = () => {
    const list = getFilteredTeachers();
    const title = "LISTE DES ENSEIGNANTS ET DISCIPLINES";
    const subtitle = isLevel1 ? `Professeurs de la classe : ${studentClass || "Classe de l'élève"}` : `Corps Enseignant — Année Scolaire 2025 - 2026 (${list.length} professeur(s))`;
    try {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="utf-8">
              <title>${title}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  @page { size: A4 landscape; margin: 10mm; }
                  .no-print { display: none !important; }
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
                body { background-color: white; color: #0f172a; font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
              </style>
            </head>
            <body>
              <!-- Action bar -->
              <div class="no-print" style="margin-bottom: 20px; padding: 14px 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; border-radius: 14px;">
                <div>
                  <strong style="font-size: 15px;">Impression</strong>
                  <p style="font-size: 12px; margin: 2px 0 0 0; color: #64748b;">${subtitle}</p>
                </div>
                <div style="display: flex; gap: 10px;">
                  <button onclick="window.print()" style="padding: 9px 18px; background-color: #0ea5e9; color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                    Imprimer
                  </button>
                  <button onclick="window.close()" style="padding: 9px 14px; background-color: #cbd5e1; color: #334155; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                    Fermer
                  </button>
                </div>
              </div>

              <!-- Header -->
              <div class="mb-6 pb-4 border-b-2 border-slate-900 flex justify-between items-center">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 flex items-center justify-center shrink-0">
                    <img src="icone.png" alt="Logo" class="w-12 h-12 object-contain" />
                  </div>
                  <div class="text-left">
                    <h1 class="text-xl font-black uppercase text-slate-900">${title}</h1>
                    <p class="text-xs font-bold text-slate-600">${subtitle}</p>
                  </div>
                </div>
                <div class="text-right text-[11px] text-slate-700 space-y-0.5">
                  <p class="font-black uppercase text-slate-900 text-xs">DASHBOARD</p>
                  <p>Yopougon Niangon Sud Carrefour</p>
                  <p>Tél : 27 23 45 61 11 / 05 05 96 70 80</p>
                </div>
              </div>

              <!-- Table identically styled -->
              <div class="overflow-visible rounded-2xl border border-slate-200 shadow-sm">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-slate-100 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                      <th class="py-4 px-4 w-14 text-center">N°</th>
                      <th class="py-4 px-6">Nom et Prénom</th>
                      <th class="py-4 px-6">Discipline</th>
                      <th class="py-4 px-6">Contact</th>
                      <th class="py-4 px-6">Email</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                    ${list.map((t, idx) => {
                        let colorClass = "bg-gray-50 text-gray-700 border-gray-200";
                        if (t.subject.toLowerCase().includes('math')) colorClass = "bg-blue-50 text-blue-700 border-blue-200";
                        else if (t.subject.toLowerCase().includes('fran')) colorClass = "bg-rose-50 text-rose-700 border-rose-200";
                        else if (t.subject.toLowerCase().includes('phys')) colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                        else if (t.subject.toLowerCase().includes('svt') || t.subject.toLowerCase().includes('science')) colorClass = "bg-green-50 text-green-700 border-green-200";
                        else if (t.subject.toLowerCase().includes('angl')) colorClass = "bg-purple-50 text-purple-700 border-purple-200";
                        else if (t.subject.toLowerCase().includes('hist')) colorClass = "bg-amber-50 text-amber-700 border-amber-200";
                        
                        return `
                        <tr class="hover:bg-slate-50 transition-colors">
                          <td class="py-4 px-4 text-center text-slate-500 font-bold">
                            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">${idx + 1}</span>
                          </td>
                          <td class="py-4 px-6">
                            <div class="flex items-center gap-3">
                              <div class="w-9 h-9 rounded-full overflow-hidden bg-slate-200 shrink-0">
                                <img src="${t.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}" alt="${t.name}" class="w-full h-full object-cover" />
                              </div>
                              <div>
                                <p class="font-bold text-slate-900">${t.name}</p>
                                <p class="text-xs text-slate-400">ID: ${t.id}</p>
                              </div>
                            </div>
                          </td>
                          <td class="py-4 px-6">
                            <span class="inline-block px-3 py-1 rounded-lg text-xs font-bold border ${colorClass}">${t.subject}</span>
                          </td>
                          <td class="py-4 px-6 text-slate-600 font-medium">${t.phone || '<span class="text-slate-400 italic">Non renseigné</span>'}</td>
                          <td class="py-4 px-6 text-slate-600 font-medium">${t.email || '<span class="text-slate-400 italic">Non renseigné</span>'}</td>
                        </tr>
                        `;
                    }).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Footer Stamp -->
              <div class="mt-8 pt-4 border-t border-slate-300 flex justify-between items-center text-xs">
                <p class="italic text-slate-500">Document officiel édité par la Direction des Études du Dashboard.</p>
                <div class="text-right">
                  <p class="font-bold text-slate-900">Le Directeur des Études</p>
                  <p class="font-black text-slate-900 uppercase">M. SEIDOU OUATTARA</p>
                </div>
              </div>

              <script>
                setTimeout(() => window.print(), 1000);
              </script>
            </body>
          </html>
        `);
        win.document.close();
      }
    } catch (e) {
      console.error(e);
      window.print();
    }
  };

  return (
    
    <div className="flex flex-col h-full print:h-auto print:block animate-in fade-in duration-300 relative z-10 bg-[#BFDBFE] pt-12 md:pt-8">
      <style>{"@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }"}</style>
        {/* Unified Header */}
        <div className="hidden md:flex justify-between items-center mt-5 mb-8 px-8 shrink-0 print:hidden">
            <div>
                <h1 className="text-white text-[28px] font-bold tracking-tight">Professeurs</h1>
                <p className="text-white/70 text-sm mt-1">
                    {isLevel1 ? `Professeurs de la classe (${studentClass || "de l'élève"})` : 'Gérez le corps enseignant, consultez les disciplines et imprimez la liste.'}
                </p>
            </div>
            <div className="flex items-center space-x-3">
                {currentUser?.role !== 'student' && currentUser?.accessLevel !== 1 && currentUser?.role !== 'teacher' && currentUser?.accessLevel !== 3 && (
                  <button
                      onClick={handlePrint}
                      className="hidden md:flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl border border-white/30 text-white hover:bg-white/30 transition-colors font-bold text-sm shadow-sm"
                      title="Imprimer la liste"
                  >
                      <Printer size={18} />
                      Imprimer
                  </button>
                )}
                <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-xl border border-white/30 w-full md:w-64 text-white">
                  <Search className="text-white shrink-0" size={18} />
                  <input 
                    type="text" 
                    placeholder="Rechercher..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-white placeholder-white/70 font-medium w-full text-sm"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="p-1 text-white/80 hover:text-white">
                        <X size={16} />
                    </button>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div className="flex bg-white/20 p-1 rounded-xl border border-white/30">
                    <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'
                        }`}
                    >
                        Tableau
                    </button>
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            viewMode === 'cards' ? 'bg-white text-slate-900 shadow-sm' : 'text-white/80 hover:text-white'
                        }`}
                    >
                        Cartes
                    </button>
                </div>
            </div>
        </div>

        {/* Mobile App Bar */}
        {showMobileSearch ? (
            <div className="md:hidden flex items-center gap-2 mb-8 px-6 shrink-0 w-full animate-in fade-in duration-200 print:hidden">
                <div className="flex-1 flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/40 px-4 py-2 rounded-2xl text-white">
                    <Search className="text-white shrink-0" size={18} />
                    <input
                        type="text"
                        autoFocus
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher un professeur..."
                        className="bg-transparent border-none outline-none text-white placeholder-white/70 text-sm font-medium w-full"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="p-1 text-white/80 hover:text-white">
                            <X size={16} />
                        </button>
                    )}
                </div>
                <button 
                    onClick={() => { setShowMobileSearch(false); setSearchTerm(''); }}
                    className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/50 text-slate-900 shrink-0"
                >
                    <X size={20} />
                </button>
            </div>
        ) : (
            <div className="md:hidden flex justify-between items-center mb-8 px-6 shrink-0 print:hidden min-w-0">
                <div className="min-w-0 flex-1 pr-3">
                    <h1 className="text-white text-[24px] font-bold tracking-tight truncate">Professeurs</h1>
                    {isLevel1 && <p className="text-white/80 text-xs font-semibold truncate">Classe : {studentClass || 'Non spécifiée'}</p>}
                </div>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => setShowMobileSearch(true)}
                        className="w-9 h-9 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/50 hover:bg-white/60 transition-colors"
                    >
                        <Search className="w-4 h-4 text-slate-900" strokeWidth={2} />
                    </button>
                </div>
            </div>
        )}

      <div className="flex-1 bg-white rounded-t-[40px] px-6 md:px-8 pt-8 overflow-y-auto pb-32 md:pb-24 shadow-2xl relative border-t border-white/50 md:border-none custom-scrollbar print:rounded-none print:shadow-none print:p-0 print:overflow-visible">
        {(() => {
          const filteredTeachers = getFilteredTeachers();

          return (
            <>
              {/* Printable Header - Only visible when printing */}
              <div className="hidden print:block mb-6 pb-4 border-b-2 border-slate-900">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center shrink-0">
                            <img src="icone.png" alt="Logo" className="w-12 h-12 object-contain" />
                        </div>
                        <div className="text-left">
                            <h1 className="text-xl font-black uppercase text-slate-900">LISTE DES ENSEIGNANTS ET DISCIPLINES</h1>
                            <p className="text-xs font-bold text-slate-600">
                                {isLevel1 ? `Professeurs de la classe : ${studentClass || "Classe de l'élève"}` : `Corps Enseignant — Année Scolaire 2025 - 2026 (${filteredTeachers.length} professeur(s))`}
                            </p>
                        </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-700 space-y-0.5">
                        <p className="font-black uppercase text-slate-900 text-xs">DASHBOARD</p>
                        <p>Yopougon Niangon Sud Carrefour</p>
                        <p>Tél : 27 23 45 61 11 / 05 05 96 70 80</p>
                    </div>
                </div>
              </div>

              {/* TABLE VIEW (6 columns: N°, Nom et Prénom, Discipline, Contact, Email, Statut) */}
              <div className={`${viewMode === 'table' ? 'block' : 'hidden'} print:block`}>
                <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm print:border-none print:shadow-none print:overflow-visible print:w-full">
                  <table className="w-full text-left border-collapse print:text-xs print:w-full">
                    <thead>
                      <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider print:bg-gray-100">
                        <th className="py-4 px-3 w-10 text-center print:py-2 print:px-2">N°</th>
                        <th className="py-4 px-4 print:py-2 print:px-2">Nom et Prénom</th>
                        <th className="py-4 px-4 print:py-2 print:px-2">Discipline</th>
                        <th className="py-4 px-4 print:py-2 print:px-2">Contact</th>
                        <th className="py-4 px-4 print:py-2 print:px-2">Email</th>
                        <th className="py-4 px-4 print:py-2 print:px-2">Décision d'Autorisation</th>
                        <th className="py-4 px-4 print:py-2 print:px-2">Statut</th>
                        <th className="py-4 px-4 text-right print:hidden">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700 print:text-xs">
                      {filteredTeachers.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                            Aucun professeur pour le moment pour cette classe.
                          </td>
                        </tr>
                      ) : (
                        filteredTeachers.map((teacher, idx) => {
                      const isMe = Boolean(
                        currentUser && (
                          String(teacher.id) === String(currentUser.id) ||
                          teacher.uid === currentUser.id ||
                          teacher.authUid === currentUser.id ||
                          (currentUser.email && teacher.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
                          (currentUser.matricule && teacher.matricule?.toLowerCase() === currentUser.matricule.toLowerCase()) ||
                          (currentUser.name && teacher.name?.toLowerCase() === currentUser.name.toLowerCase())
                        )
                      );
                      const showScheduleBtn = !isLevel1;

                      return (
                          <tr key={teacher.id || idx} className="hover:bg-slate-50/80 transition-colors group print:hover:bg-transparent">
                            <td className="py-4 px-3 text-center text-slate-500 font-bold print:py-2 print:px-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold print:bg-transparent">
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-4 px-4 print:py-2 print:px-2 max-w-[220px]">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 shrink-0 print:hidden">
                                  <img src={teacher.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} alt={teacher.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors print:text-slate-900 truncate">
                                    {teacher.name}
                                    {isMe && <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold bg-sky-100 text-sky-700 rounded-md print:hidden shrink-0">MOI</span>}
                                  </p>
                                  <div className="flex flex-col gap-0.5 mt-0.5">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Expertise</span>
                                    <span className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-black uppercase tracking-wider">
                                      <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                                        <CheckCircle2 size={10} strokeWidth={3} />
                                      </span>
                                      <strong 
                                        className="font-black text-emerald-800 tracking-wider uppercase text-[12px]" 
                                        style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, WebkitTextStroke: '0.3px #065f46' }}
                                      >
                                        Légendaire
                                      </strong>
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 print:py-2 print:px-2">
                              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border print:border-none print:p-0 ${getSubjectColor(teacher.subject)}`}>
                                {teacher.subject}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-600 font-medium print:py-2 print:px-2">
                              {teacher.phone ? (
                                <a href={`tel:${teacher.phone.replace(/\s+/g, '')}`} className="hover:text-indigo-600 hover:underline whitespace-nowrap block print:no-underline print:text-slate-900">
                                  {teacher.phone}
                                </a>
                              ) : (
                                <span className="text-slate-400 italic text-xs print:not-italic print:text-slate-500">Non renseigné</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-slate-600 font-medium print:py-2 print:px-2">
                              {teacher.email ? (
                                <a href={`mailto:${teacher.email}`} className="text-xs text-slate-600 hover:text-indigo-600 hover:underline block break-all print:no-underline print:text-slate-900" title={teacher.email}>
                                  {teacher.email}
                                </a>
                              ) : (
                                <span className="text-slate-400 italic text-xs print:not-italic print:text-slate-500">Non renseigné</span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-slate-600 font-medium print:py-2 print:px-2">
                              {teacher.authorizationDecision ? (
                                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{teacher.authorizationDecision}</span>
                              ) : (
                                <span className="text-slate-400 italic text-xs print:not-italic print:text-slate-500">Non renseigné</span>
                              )}
                            </td>
                            <td className="py-4 px-4 print:py-2 print:px-2">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${teacher.authUid || teacher.status === 'Actif' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 print:bg-transparent print:border-none print:text-emerald-700' : 'bg-amber-50 text-amber-600 border-amber-200 print:bg-transparent print:border-none print:text-amber-700'}`}>
                                {teacher.authUid || teacher.status === 'Actif' ? 'Compte Activé' : 'Non Activé'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right print:hidden">
                              <div className="flex items-center justify-end gap-1">
                                {canManageProfile && (
                                  <>
                                    <button
                                      onClick={() => handleOpenEditTeacher(teacher)}
                                      title="Modifier"
                                      className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                    >
                                      <Edit3 size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTeacherAction(teacher)}
                                      title="Supprimer"
                                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleOpenWhatsApp(teacher)}
                                  title="Contacter sur WhatsApp"
                                  className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                  </svg>
                                </button>
                                <button
                                  onClick={() => setTeacherToCall(teacher)}
                                  title="Appeler"
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Phone size={16} />
                                </button>
                                <button
                                  onClick={() => setTeacherToEmail(teacher)}
                                  title="Envoyer un email"
                                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                >
                                  <Mail size={16} />
                                </button>
                                {showScheduleBtn && (
                                  <button
                                    onClick={() => handleOpenSchedule(teacher)}
                                    title="Voir Emploi du temps"
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  >
                                    <Calendar size={16} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                      );
                    })
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* FOOTER STAMP - Only visible when printing */}
                <div className="hidden print:flex mt-8 pt-4 border-t border-slate-300 justify-between items-center text-xs">
                  <p className="italic text-slate-500">Document officiel édité par la Direction des Études du Dashboard.</p>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">Le Directeur des Études</p>
                    <p className="font-black text-slate-900 uppercase">M. SEIDOU OUATTARA</p>
                  </div>
                </div>
              </div>

              {/* CARDS VIEW */}
              <div className={`${viewMode === 'cards' ? 'block' : 'hidden'} print:hidden`}>
                {activeMenuTeacherId !== null && (
                  <div className="fixed inset-0 z-20" onClick={() => setActiveMenuTeacherId(null)} />
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                  {filteredTeachers.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-slate-400 font-semibold bg-white rounded-3xl shadow-sm border border-slate-100">
                      Aucun professeur pour le moment pour cette classe.
                    </div>
                  ) : (
                    filteredTeachers.map((teacher) => {
                      const isMe = Boolean(
                        currentUser && (
                          String(teacher.id) === String(currentUser.id) ||
                          teacher.uid === currentUser.id ||
                          teacher.authUid === currentUser.id ||
                          (currentUser.email && teacher.email?.toLowerCase() === currentUser.email.toLowerCase()) ||
                          (currentUser.matricule && teacher.matricule?.toLowerCase() === currentUser.matricule.toLowerCase()) ||
                          (currentUser.name && teacher.name?.toLowerCase() === currentUser.name.toLowerCase())
                        )
                      );
                      const showScheduleBtn = !isLevel1;

                      return (
                        <div key={teacher.id} className="relative flex flex-col items-center w-full max-w-[310px]">
                          {/* Barre supérieure juste au-dessus de la carte avec bouton Option à droite */}
                          <div className="w-[300px] max-w-full flex items-center justify-between mb-1.5 px-1 min-h-[28px] relative z-20">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 truncate">
                                {teacher.subject || 'Enseignant'}
                              </span>
                            </div>

                            {canManageProfile && (
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenuTeacherId(activeMenuTeacherId === teacher.id ? null : teacher.id);
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-xs transition-all cursor-pointer active:scale-95"
                                  title="Options du professeur"
                                >
                                  <span className="text-[11px] font-bold text-slate-600">Option</span>
                                  <MoreVertical size={13} className="text-slate-500" />
                                </button>

                                {activeMenuTeacherId === teacher.id && (
                                  <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-8 z-50 w-44 bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-white/10 p-1.5 space-y-1 backdrop-blur-xl animate-in fade-in zoom-in-95"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuTeacherId(null);
                                        handleOpenEditTeacher(teacher);
                                      }}
                                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
                                    >
                                      <Edit3 size={15} className="text-sky-400" />
                                      <span>Modifier</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuTeacherId(null);
                                        handleDeleteTeacherAction(teacher);
                                      }}
                                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                    >
                                      <Trash2 size={15} className="text-rose-400" />
                                      <span>Supprimer</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Enlarged Reflective Card (propre sans bouton d'option sur la carte) */}
                          <div className="relative w-[300px]" style={{ height: 335 }}>
                            <ReflectiveCard
                              className="reflective-card--compact"
                              name={teacher.name}
                              role={teacher.subject}
                              badge={teacher.isPrincipal ? "Prof. Principal" : "Enseignant"}
                              status={teacher.authUid || teacher.status === 'Actif' ? 'Certifié' : 'Inactif'}
                              statusColor={teacher.authUid || teacher.status === 'Actif' ? '#22c55e' : '#f59e0b'}
                              idLabel="Expertise"
                              idValue={
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="w-4.5 h-4.5 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shrink-0 shadow-sm border border-emerald-300/40">
                                    <CheckCircle2 size={11} strokeWidth={3} />
                                  </span>
                                  <span 
                                    className="text-[13px] uppercase tracking-wider text-emerald-800" 
                                    style={{ 
                                      fontFamily: "'Montserrat', sans-serif", 
                                      fontWeight: 900, 
                                      WebkitTextStroke: '0.4px #065f46',
                                      letterSpacing: '0.05em'
                                    }}
                                  >
                                    Légendaire
                                  </span>
                                </div>
                              }
                              avatar={teacher.photo || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600"}
                              webcam={false}
                              theme="blue"
                              tint="#BFDBFE"
                              metalness={0.8}
                              roughness={0.25}
                              blurStrength={6}
                              shine={1.2}
                              glare={0.6}
                              warp={0.4}
                              bevel={3}
                              tiltStrength={12}
                              radius={24}
                              enableTilt
                              intro
                              width={300}
                              height={335}
                              onClick={() => {
                                if (showScheduleBtn) handleOpenSchedule(teacher);
                              }}
                              extraBadge={
                                <div className="flex items-center gap-1.5">
                                  {isMe && (
                                    <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-sky-500 text-white rounded-md shadow-md">
                                      MOI
                                    </span>
                                  )}
                                  {teacher.isPrincipal && (
                                    <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white rounded-md shadow-md">
                                      PP
                                    </span>
                                  )}
                                </div>
                              }
                            />
                          </div>

                          {/* Quick Actions Beneath Card - WhatsApp (Bouton entier sans ..), Appel & Planning */}
                          <div className="w-[300px] max-w-full flex items-center gap-1.5 mt-2 px-0.5">
                            {/* WhatsApp Button (Bouton entier sans points de suspension) */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenWhatsApp(teacher);
                              }}
                              className="btn-whatsapp shrink-0 flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-2xl text-[13px] font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-sm transition-all cursor-pointer active:scale-95 border border-[#25D366]"
                              style={{ flexShrink: 0, minWidth: 'max-content' }}
                              title="Contacter sur WhatsApp"
                              data-no-truncate="true"
                            >
                              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              <span 
                                className="whitespace-nowrap font-bold text-white inline-block"
                                style={{ overflow: 'visible', textOverflow: 'clip', whiteSpace: 'nowrap' }}
                              >
                                WhatsApp
                              </span>
                            </button>

                            {/* Appel Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTeacherToCall(teacher);
                              }}
                              className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-2xl text-[12px] font-bold bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-600 border border-slate-200 shadow-sm transition-all cursor-pointer active:scale-95"
                              title="Appeler le professeur"
                            >
                              <Phone size={14} className="shrink-0" />
                              <span className="truncate">Appel</span>
                            </button>

                            {/* Planning Button */}
                            {showScheduleBtn && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenSchedule(teacher);
                                }}
                                className="flex-1 min-w-0 flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-2xl text-[12px] font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-all cursor-pointer active:scale-95"
                                title="Voir Emploi du temps"
                              >
                                <Calendar size={14} className="shrink-0" />
                                <span className="truncate">Planning</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Schedule Modal */}
      {selectedTeacher && (
        isMobile ? (
            <div className="fixed inset-0 z-50 bg-[#BFDBFE]">
                <DailyScheduleMobileView 
                    onBack={() => setSelectedTeacher(null)}
                    events={convertToMobileEvents(scheduleData)}
                    onEventClick={(evt) => {
                         if (!canEdit) return;
                         handleSlotClick(evt.day, evt.start, { active: true, subject: evt.title, room: evt.room });
                    }}
                    onEmptySlotClick={(day, start) => {
                         if (!canEdit) return;
                         handleSlotClick(day, start, { active: false, subject: '', room: '' });
                    }}
                    readOnly={!canEdit}
                    classNameTitle={selectedTeacher.name}
                    subtitle={selectedTeacher.subject ? `Professeur de ${selectedTeacher.subject}` : "Planning de cours"}
                    imageUrl={selectedTeacher.photo}
                    currentUser={currentUser}
                    isTeacherSchedule={true}
                />
                {isModalOpen && (
                     <div className="absolute inset-0 z-[300] flex items-center justify-center p-4">
                          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={() => setIsModalOpen(false)}></div>
                          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 relative z-50 shadow-2xl animate-in zoom-in-95">
                               <div className="flex justify-between items-center mb-6">
                                   <h3 className="text-lg font-bold text-gray-800">
                                       {editingSlot && scheduleData[editingSlot.dayIndex]?.slots[editingSlot.slotIndex].active ? 'Modifier le cours' : 'Ajouter un cours'}
                                   </h3>
                                   <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                       <X size={20} />
                                   </button>
                               </div>

                               <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Matière</label>
                                        <select 
                                            value={formData.subject} 
                                            onChange={e => setFormData({...formData, subject: e.target.value})}
                                            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 transition-all"
                                        >
                                            {getSubjectsForClass(formData.room || '').map(s => <option key={s} value={s} disabled={currentUser?.role === "teacher" && currentUser?.subject && s !== currentUser.subject}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Classe</label>
                                        <select 
                                            value={formData.room} 
                                            onChange={e => setFormData({...formData, room: e.target.value})}
                                            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 transition-all"
                                        >
                                            {CLASSES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Durée (heures)</label>
                                        <select 
                                            value={formData.duration} 
                                            onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                                            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 transition-all"
                                        >
                                            {[1, 2, 3, 4, 5].map(h => <option key={h} value={h}>{h} heure{h > 1 ? 's' : ''}</option>)}
                                        </select>
                                    </div>
                               </div>

                               <div className="flex gap-3 mt-8">
                                    {editingSlot && scheduleData[editingSlot.dayIndex]?.slots[editingSlot.slotIndex].active && (
                                        <button 
                                            onClick={handleDeleteSlot}
                                            className="px-4 py-3 bg-sky-50 text-sky-600 rounded-xl font-bold hover:bg-sky-100 transition-colors flex items-center justify-center"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                    <button 
                                        onClick={handleSaveSlot}
                                        className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 shadow-lg shadow-sky-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        Enregistrer
                                    </button>
                               </div>
                          </div>
                     </div>
                )}
            </div>
        ) : (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={() => setSelectedTeacher(null)}
            ></div>

            {/* Modal Content */}
            <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 flex flex-col">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                            <img src={selectedTeacher.photo} alt="" className="w-full h-full object-cover"/>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{selectedTeacher.name}</h2>
                            <p className="text-sky-600 font-medium text-sm">
                                {selectedTeacher.subject}
                                {canEdit && <span className="ml-2 text-gray-400 text-xs bg-white px-2 py-0.5 rounded-full border border-gray-200 font-normal">Mode Édition</span>}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedTeacher(null)}
                        className="w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-500 hover:bg-sky-50 hover:text-sky-500 hover:border-sky-200 flex items-center justify-center transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Mobile Day Navigation (Only visible on mobile) */}
                <div className="md:hidden flex items-center justify-between bg-white p-3 mx-4 mt-4 rounded-xl border border-gray-100 shadow-sm">
                    <button 
                        onClick={() => setMobileDayIndex(Math.max(0, mobileDayIndex - 1))}
                        disabled={mobileDayIndex === 0}
                        className={`p-2 rounded-lg transition-colors ${mobileDayIndex === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    
                    <span className="text-lg font-bold text-sky-600 uppercase tracking-wider">
                        {scheduleData[mobileDayIndex]?.fullName}
                    </span>

                    <button 
                        onClick={() => setMobileDayIndex(Math.min(scheduleData.length - 1, mobileDayIndex + 1))}
                        disabled={mobileDayIndex === scheduleData.length - 1}
                        className={`p-2 rounded-lg transition-colors ${mobileDayIndex === scheduleData.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Schedule Grid */}
                <div className="p-4 md:p-8 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {scheduleData.map((dayData, dIndex) => {
                            // Logic: On mobile, only show the selected day. On Desktop, show all.
                            const isVisible = dIndex === mobileDayIndex;
                            const mobileClass = isVisible ? 'block' : 'hidden';
                            const desktopClass = 'md:block';

                            return (
                                <div key={dIndex} className={`${mobileClass} ${desktopClass} flex flex-col gap-3 h-full`}>
                                    {/* Day Header (Desktop only) */}
                                    <h3 className="hidden md:block text-center font-bold text-gray-400 uppercase text-xs tracking-wider mb-2 bg-gray-50 py-2 rounded-lg">
                                        {dayData.fullName}
                                    </h3>
                                    
                                    <div className="flex flex-col gap-3">
                                        {dayData.slots.map((slot: any, sIndex: number) => {
                                            const morningEndIdx = getLunchBreakIndex(timeSlots);
                                            const isRecess = sIndex === 3;
                                            if (isRecess) {
                                                return (
                                                    <div key={sIndex} className="flex justify-center items-center py-1">
                                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Récréation</span>
                                                    </div>
                                                );
                                            }
                                            return (
                                            <React.Fragment key={sIndex}>
                                                <div 
                                                    onClick={() => handleSlotClick(dIndex, sIndex, slot)}
                                                    className={`
                                                        p-4 md:p-3 rounded-xl border flex flex-col gap-1 transition-all group
                                                        ${slot.active 
                                                            ? 'bg-sky-50 border-sky-100 shadow-sm' 
                                                            : 'bg-white border-gray-100'
                                                        }
                                                        ${canEdit ? 'cursor-pointer hover:border-sky-300 hover:shadow-md' : ''}
                                                    `}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <span className={`text-sm md:text-xs font-black ${slot.active ? 'text-sky-700' : 'text-gray-500'}`}>{slot.time}</span>
                                                        {slot.active && <Clock size={14} className="text-sky-400"/>}
                                                        {!slot.active && canEdit && <Plus size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                                    </div>
                                                    
                                                    {slot.active ? (
                                                        <>
                                                            <span className="text-sm md:text-xs font-bold text-gray-800">{slot.subject}</span>
                                                            <div className="flex items-center justify-between mt-1 gap-1">
                                                                <span className="text-xs md:text-[10px] font-medium text-gray-500 bg-white/60 px-2 py-0.5 rounded-md border border-sky-100/50">
                                                                    {slot.room} {slot.duration > 1 ? `(${slot.duration}h)` : ''}
                                                                </span>
                                                                {canEdit && <Edit3 size={10} className="text-sky-300 opacity-0 group-hover:opacity-100 shrink-0" />}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="h-6 flex items-center justify-center">
                                                             <span className="text-xs md:text-[10px] text-gray-300">-</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {sIndex === morningEndIdx && (
                                                    <div className="flex justify-center items-center py-1">
                                                        <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Pause Midi</span>
                                                    </div>
                                                )}
                                            </React.Fragment>
                                        )})}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500 px-6 md:px-8">
                    <span>{canEdit ? "Cliquez sur une case pour modifier." : "* Emploi du temps généré automatiquement."}</span>
                    <button onClick={() => setSelectedTeacher(null)} className="font-bold hover:text-gray-800 px-4 py-2 hover:bg-gray-200 rounded-lg transition-colors">Fermer</button>
                </div>
            </div>

            {/* Edit Modal (Nested) */}
            {isModalOpen && (
                 <div className="absolute inset-0 z-[60] flex items-center justify-center p-4">
                      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" onClick={() => setIsModalOpen(false)}></div>
                      <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 relative z-50 shadow-2xl animate-in zoom-in-95">
                           <div className="flex justify-between items-center mb-6">
                               <h3 className="text-lg font-bold text-gray-800">
                                   {editingSlot && scheduleData[editingSlot.dayIndex]?.slots[editingSlot.slotIndex].active ? 'Modifier le cours' : 'Ajouter un cours'}
                               </h3>
                               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                   <X size={20} />
                               </button>
                           </div>

                           <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Matière</label>
                                    <select 
                                        value={formData.subject} 
                                        onChange={e => setFormData({...formData, subject: e.target.value})}
                                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 transition-all"
                                    >
                                        {getSubjectsForClass(formData.room || '').map(s => <option key={s} value={s} disabled={currentUser?.role === "teacher" && currentUser?.subject && s !== currentUser.subject}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Classe</label>
                                    <select 
                                        value={formData.room} 
                                        onChange={e => setFormData({...formData, room: e.target.value})}
                                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 transition-all"
                                    >
                                        {CLASSES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Durée (heures)</label>
                                    <select 
                                        value={formData.duration} 
                                        onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                                        className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 transition-all"
                                    >
                                        {[1, 2, 3, 4, 5].map(h => <option key={h} value={h}>{h} heure{h > 1 ? 's' : ''}</option>)}
                                    </select>
                                </div>
                           </div>

                           <div className="flex gap-3 mt-8">
                                {editingSlot && scheduleData[editingSlot.dayIndex]?.slots[editingSlot.slotIndex].active && (
                                    <button 
                                        onClick={handleDeleteSlot}
                                        className="px-4 py-3 bg-sky-50 text-sky-600 rounded-xl font-bold hover:bg-sky-100 transition-colors flex items-center justify-center"
                                        title="Supprimer"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                                <button 
                                    onClick={handleSaveSlot}
                                    className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 shadow-lg shadow-sky-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save size={18} />
                                    Enregistrer
                                </button>
                           </div>
                      </div>
                 </div>
            )}
        </div>
        )
      )}

      {/* Call Teacher Bottom Sheet */}
      <AnimatePresence>
        {teacherToCall && (
          <div className="fixed inset-0 z-[500] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTeacherToCall(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-md bg-white rounded-t-[2.5rem] p-6 shadow-2xl border-t border-slate-100 flex flex-col items-center text-center space-y-5"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-1" />
              
              <button 
                onClick={() => setTeacherToCall(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                title="Fermer"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center space-y-2 pt-2">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shadow-md ring-4 ring-slate-50">
                  <img src={teacherToCall.photo} alt={teacherToCall.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{teacherToCall.name}</h3>
                  <p className="text-sm font-semibold text-sky-600">{teacherToCall.subject}</p>
                </div>
              </div>

              <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-center gap-3">
                <Phone className="text-slate-400" size={20} />
                <span className="text-lg font-extrabold text-slate-800 tracking-wider">
                  {teacherToCall.phone || '+225 07 00 00 00 00'}
                </span>
              </div>

              <div className="w-full flex flex-col gap-2.5">
                <a 
                  href={`tel:${(teacherToCall.phone || '+225 07 00 00 00 00').replace(/\s+/g, '')}`}
                  className="w-full py-3.5 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all text-sm"
                >
                  <Phone size={18} fill="currentColor" />
                  <span>Appeler par téléphone</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    handleOpenWhatsApp(teacherToCall);
                    setTeacherToCall(null);
                  }}
                  className="w-full py-3.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all text-sm cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>Écrire sur WhatsApp</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Email Teacher Bottom Sheet */}
      <AnimatePresence>
        {teacherToEmail && (
          <div className="fixed inset-0 z-[500] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setTeacherToEmail(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 w-full max-w-md bg-white rounded-t-[2.5rem] p-6 shadow-2xl border-t border-slate-100 flex flex-col items-center text-center space-y-5"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-1" />
              
              <button 
                onClick={() => setTeacherToEmail(null)}
                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                title="Fermer"
              >
                <X size={18} />
              </button>

              <div className="flex flex-col items-center space-y-2 pt-2">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shadow-md ring-4 ring-slate-50">
                  <img src={teacherToEmail.photo} alt={teacherToEmail.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{teacherToEmail.name}</h3>
                  <p className="text-sm font-semibold text-sky-600">{teacherToEmail.subject}</p>
                </div>
              </div>

              <div className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-center gap-3">
                <Mail className="text-slate-400 shrink-0" size={20} />
                <span className="text-base font-extrabold text-slate-800 truncate">
                  {teacherToEmail.email || `${teacherToEmail.name.toLowerCase().replace(/\s+/g, '.')}@ecole.com`}
                </span>
              </div>

              <a 
                href={`mailto:${teacherToEmail.email || `${teacherToEmail.name.toLowerCase().replace(/\s+/g, '.')}@ecole.com`}`}
                className="w-full py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all text-base"
              >
                <Mail size={20} />
                <span>Envoyer un e-mail</span>
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Teacher Modal */}
      <AnimatePresence>
        {isAddTeacherModalOpen && (
          <div className="fixed inset-0 z-[600] flex items-start justify-center p-4 pt-6 md:pt-10 pb-16 overflow-y-auto print:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddTeacherModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl border border-slate-100 my-auto max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Enregistrer un Professeur</h3>
                  <p className="text-xs text-slate-500 mt-1">Ajoute automatiquement une nouvelle ligne dans le tableau</p>
                </div>
                <button
                  onClick={() => setIsAddTeacherModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleRegisterTeacher} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nom et Prénom *</label>
                    <input
                      type="text"
                      required
                      placeholder="ex: M. KOFFI Jean-Baptiste"
                      value={newTeacherForm.name}
                      onChange={(e) => setNewTeacherForm({ ...newTeacherForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Numéro Matricule</label>
                    <input
                      type="text"
                      placeholder="ex: MAT-2024-001"
                      value={newTeacherForm.matricule}
                      onChange={(e) => setNewTeacherForm({ ...newTeacherForm, matricule: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Sexe</label>
                    <select
                      value={newTeacherForm.gender}
                      onChange={(e) => setNewTeacherForm({ ...newTeacherForm, gender: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white"
                    >
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Date de naissance</label>
                    <input
                      type="date"
                      value={newTeacherForm.dob}
                      onChange={(e) => setNewTeacherForm({ ...newTeacherForm, dob: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Discipline *</label>
                    <select
                      value={newTeacherForm.subject}
                      onChange={(e) => setNewTeacherForm({ ...newTeacherForm, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white"
                    >
                      {SUBJECTS.map(subj => (
                        <option key={subj} value={subj}>{subj}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Niveau</label>
                    <select
                      value={newTeacherForm.level}
                      onChange={(e) => setNewTeacherForm({ ...newTeacherForm, level: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium bg-white"
                    >
                      <option value="Primaire">Primaire</option>
                      <option value="Secondaire">Secondaire</option>
                      <option value="Supérieur">Supérieur</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Contact (Téléphone)</label>
                    <input
                      type="text"
                      placeholder="ex: +229 97 00 00 00"
                      value={newTeacherForm.phone}
                      onChange={(e) => setNewTeacherForm({ ...newTeacherForm, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="ex: jean.koffi@ecole.com"
                      value={newTeacherForm.email}
                      onChange={(e) => setNewTeacherForm({ ...newTeacherForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Classes assignées</label>
                    <CustomMultiSelect
                      values={newTeacherForm.assignedClasses}
                      onChange={(values) => setNewTeacherForm({ ...newTeacherForm, assignedClasses: values })}
                      placeholder="Sélectionner des classes"
                      items={CLASSES.map(c => ({ label: c, value: c }))}
                      className="py-3 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddTeacherModalOpen(false)}
                    className="px-5 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 transition-all text-sm flex items-center gap-2"
                  >
                    <Plus size={16} strokeWidth={2.5} />
                    <span>Enregistrer</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Teacher Modal */}
      <AnimatePresence>
        {isEditTeacherModalOpen && editingTeacher && (
          <div className={`fixed inset-0 z-[600] flex ${isMobile ? 'items-end' : 'items-start'} justify-center ${isMobile ? 'p-0' : 'p-4 pt-6 md:pt-10 pb-16'} overflow-y-auto print:hidden`}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditTeacherModalOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0 }}
              animate={isMobile ? { y: 0 } : { scale: 1, opacity: 1 }}
              exit={isMobile ? { y: '100%' } : { scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className={`relative z-10 bg-white shadow-2xl border border-slate-100 ${
                isMobile 
                  ? 'rounded-t-[32px] rounded-b-none p-6 pb-12 w-full max-h-[92vh] overflow-y-auto' 
                  : 'rounded-3xl p-6 md:p-8 w-full max-w-lg my-auto max-h-[85vh] overflow-y-auto'
              }`}
            >
              {isMobile && (
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-1.5 rounded-full bg-slate-200" />
                </div>
              )}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Modifier le Professeur</h3>
                  <p className="text-xs text-slate-500 mt-1">{editingTeacher.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditTeacherModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveEditedTeacher} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Nom et Prénom *</label>
                    <input
                      type="text"
                      required
                      value={editTeacherForm.name}
                      onChange={(e) => setEditTeacherForm({ ...editTeacherForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Matricule</label>
                    <input
                      type="text"
                      value={editTeacherForm.matricule}
                      onChange={(e) => setEditTeacherForm({ ...editTeacherForm, matricule: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Discipline *</label>
                    <select
                      value={editTeacherForm.subject}
                      onChange={(e) => setEditTeacherForm({ ...editTeacherForm, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium bg-white"
                    >
                      {SUBJECTS.map(subj => (
                        <option key={subj} value={subj}>{subj}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Téléphone de l'Enseignant</label>
                    <div className="relative">
                      <div className="absolute left-[16px] top-1/2 -translate-y-1/2 text-slate-400">
                        <Phone size={16} />
                      </div>
                      <input
                        type="tel"
                        value={editTeacherForm.phone}
                        onChange={(e) => setEditTeacherForm({ ...editTeacherForm, phone: e.target.value })}
                        placeholder="Téléphone (ex: +225 01 02 03 04 05)"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium bg-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Email</label>
                  <input
                    type="email"
                    value={editTeacherForm.email}
                    onChange={(e) => setEditTeacherForm({ ...editTeacherForm, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Classes assignées</label>
                  <CustomMultiSelect
                    values={editTeacherForm.assignedClasses}
                    onChange={(values) => setEditTeacherForm({ ...editTeacherForm, assignedClasses: values })}
                    placeholder="Sélectionner des classes"
                    items={CLASSES.map(c => ({ label: c, value: c }))}
                    className="py-3 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Code d'accréditation</label>
                  <input
                    type="text"
                    value={editTeacherForm.accreditationCode}
                    onChange={(e) => setEditTeacherForm({ ...editTeacherForm, accreditationCode: e.target.value.toUpperCase() })}
                    placeholder="Ex: MATH-2024 ou code individuel"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-bold tracking-wider text-slate-800 uppercase"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Ce code se synchronise en temps réel sur tous les appareils.</p>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditTeacherModalOpen(false)}
                    className="px-5 py-3 rounded-xl text-slate-600 font-bold hover:bg-slate-100 transition-colors text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-lg shadow-sky-200 transition-all text-sm flex items-center gap-2"
                  >
                    <Save size={16} />
                    <span>Enregistrer</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CONFIRMATION SUPPRESSION ENSEIGNANT */}
      <AnimatePresence>
        {teacherToDelete && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[700] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
                <Trash2 size={24} />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-slate-800">Supprimer le professeur</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Êtes-vous sûr de vouloir supprimer <strong className="text-slate-800">{teacherToDelete.name}</strong> ({teacherToDelete.subject}) ? Cette action est irréversible.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTeacherToDelete(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors text-sm"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteTeacher}
                  className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  <span>Supprimer</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};