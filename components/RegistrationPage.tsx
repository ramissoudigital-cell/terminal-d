import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DailyScheduleMobileView, ScheduleEvent } from './DailyScheduleMobileView';
import { getStoredTimeSlots } from './SchedulePage';
import { UserPlus, Book, Upload, CheckCircle, GraduationCap, Users, X, Phone, ArrowLeft, Globe, Briefcase, Calendar, Clock, Plus, Edit3, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Student, Teacher, User, getSubjectsForClass } from '../types';
import { CustomSelect } from './CustomSelect';
import { CustomMultiSelect } from './CustomMultiSelect';
import { COUNTRIES_DATA } from '../data/countries';

const getSubjectColor = (subject: string): string => {
    if (!subject) return 'bg-sky-100 text-sky-800 border-sky-300';
    const lower = subject.toLowerCase();
    if (lower.includes('math')) return 'bg-sky-100 text-sky-800 border-sky-300';
    if (lower.includes('français') || lower.includes('francais')) return 'bg-rose-100 text-rose-800 border-rose-300';
    if (lower.includes('anglais') || lower.includes('espagnol') || lower.includes('allemand') || lower.includes('langue')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (lower.includes('histoire') || lower.includes('géo')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (lower.includes('physique') || lower.includes('chimie') || lower.includes('svt') || lower.includes('science')) return 'bg-purple-100 text-purple-800 border-purple-300';
    if (lower.includes('eps') || lower.includes('sport')) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (lower.includes('art') || lower.includes('musique')) return 'bg-pink-100 text-pink-800 border-pink-300';
    return 'bg-indigo-100 text-indigo-800 border-indigo-300';
};

export const CLASSES_OPTIONS = [
    {
        label: "Lycée - Terminale",
        options: [
            { label: "Terminale D1", value: "Terminale D1" }
        ]
    }
];

interface RegistrationPageProps {
  onAddStudent: (student: Student) => void;
  onAddTeacher: (teacher: Teacher) => void;
  currentUserLevel?: number;
  onNavigate?: (page: string) => void;
  currentUser?: User | null;
}


const getEmptySchedule = () => {
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
    const fullDayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
    const slots = getStoredTimeSlots();

    return days.map((day, dIndex) => ({
        day,
        fullName: fullDayNames[dIndex],
        slots: slots.map((time, sIndex) => ({
            time,
            active: false,
            subject: '',
            room: '',
            duration: 1
        }))
    }));
};

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ onAddStudent, onAddTeacher, currentUserLevel, onNavigate, currentUser }) => {

  const filteredClassesOptions = useMemo(() => {
    return CLASSES_OPTIONS;
  }, []);

  const [showScheduleEditor, setShowScheduleEditor] = useState(false);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: showScheduleEditor } }));
    return () => {
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: false } }));
    };
  }, [showScheduleEditor]);
  const [scheduleData, setScheduleData] = useState(() => getEmptySchedule());

  useEffect(() => {
    const handleSlotsUpdate = () => {
      const newSlots = getStoredTimeSlots();
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
  const [mobileDayIndex, setMobileDayIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<{dayIndex: number, slotIndex: number} | null>(null);
  const [scheduleFormData, setScheduleFormData] = useState({ subject: '', room: '', duration: 1 });

  const handleRoomChange = (newRoom: string) => {
      const subjectsForRoom = getSubjectsForClass(newRoom);
      const newSubject = subjectsForRoom.includes(scheduleFormData.subject)
          ? scheduleFormData.subject
          : (teacherForm.subject && subjectsForRoom.includes(teacherForm.subject) ? teacherForm.subject : (subjectsForRoom[0] || 'Mathématiques'));
      setScheduleFormData(prev => ({
          ...prev,
          room: newRoom,
          subject: newSubject
      }));
  };

  const scheduleEvents = useMemo(() => {
      const evts: ScheduleEvent[] = [];
      scheduleData.forEach((dayData, dIndex) => {
          dayData.slots.forEach((slot: any, sIndex: number) => {
              if (slot.active && sIndex !== 3 && sIndex !== 7) {
                  evts.push({
                      id: `${dIndex}-${sIndex}`,
                      day: dIndex,
                      start: sIndex,
                      duration: slot.duration || 1,
                      title: slot.subject || 'Cours',
                      room: slot.room || 'Salle',
                      color: getSubjectColor(slot.subject)
                  });
              }
          });
      });
      return evts;
  }, [scheduleData]);

  const handleSlotClick = (dayIndex: number, slotIndex: number, slot: any) => {
      if (slotIndex === 3 || slotIndex === 7) return; // Break
      setEditingSlot({ dayIndex, slotIndex });
      
      const defaultRoom = (slot && slot.active && slot.room)
          ? slot.room 
          : (teacherForm.classes && teacherForm.classes.length > 0 ? teacherForm.classes[0] : 'Terminale D1');
          
      const subjectsForRoom = getSubjectsForClass(defaultRoom);
      const defaultSubject = (slot && slot.active && slot.subject) 
          ? slot.subject 
          : (teacherForm.subject && subjectsForRoom.includes(teacherForm.subject) ? teacherForm.subject : (subjectsForRoom[0] || 'Mathématiques'));

      setScheduleFormData({
          subject: defaultSubject,
          room: defaultRoom,
          duration: (slot && slot.duration) || 1
      });
      setIsModalOpen(true);
  };

  const handleSaveSlot = () => {
      if (!editingSlot) return;
      const { dayIndex, slotIndex } = editingSlot;
      
      const newData = [...scheduleData];
      newData[dayIndex].slots[slotIndex] = {
          ...newData[dayIndex].slots[slotIndex],
          active: true,
          subject: scheduleFormData.subject,
          room: scheduleFormData.room,
          duration: scheduleFormData.duration || 1
      };
      
      setScheduleData(newData);
      setIsModalOpen(false);
  };

  const handleDeleteSlot = () => {
      if (!editingSlot) return;
      const { dayIndex, slotIndex } = editingSlot;
      
      const newData = [...scheduleData];
      newData[dayIndex].slots[slotIndex] = {
          ...newData[dayIndex].slots[slotIndex],
          active: false,
          subject: '',
          room: ''
      };

      setScheduleData(newData);
      setIsModalOpen(false);
  };

  useEffect(() => {
    window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: true } }));
    window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: true } }));
    return () => {
      window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: false } }));
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: false } }));
    };
  }, []);

  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>('student');
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const countryOptions = Object.keys(COUNTRIES_DATA).map((countryKey) => {
    const cData = COUNTRIES_DATA[countryKey];
    return {
      label: `${cData.flagEmoji} ${countryKey} (${cData.nationality})`,
      value: countryKey
    };
  });

  // Student Form State
  const [studentForm, setStudentForm] = useState({
    gender: 'M' as 'M' | 'F',
    firstName: '',
    lastName: '',
    class: 'Terminale D1',
    birthDate: '',
    birthPlace: '',
    birthCertificateNumber: '',
    birthCertificateDate: '',
    birthCertificateCity: '',
    matricule: `2024-${Math.floor(1000 + Math.random() * 9000)}`,
    country: "Côte d'Ivoire",
    nationality: "Ivoirienne",
    fatherPhone: '',
    fatherEmail: '',
    motherPhone: '',
    motherEmail: '',
    tutorPhone: '',
    parentPhone: '',
    studentPhone: '',
    assignedStatus: 'affecte' as 'affecte' | 'non_affecte'
  });

  // Teacher Form State
  const [teacherForm, setTeacherForm] = useState({
    gender: 'M' as 'M' | 'F',
    firstName: '',
    lastName: '',
    subject: '',
    email: '',
    phone: '',
    classes: [] as string[],
    isPrincipal: false,
    principalClasses: [] as string[],
    authorizationDecision: '',
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewImage(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.firstName || !studentForm.lastName) return;

    const classNameLower = studentForm.class.toLowerCase();
    const isSeniorClass = classNameLower.includes('première') || classNameLower.includes('premiere') || classNameLower.includes('terminal');
    const defaultSubjects = [
        { name: 'Mathématiques', value: 20, average: 0, fill: '#3b82f6' },
        { name: 'Physique-Chimie', value: 20, average: 0, fill: '#fbbf24' },
        { name: 'SVT', value: 15, average: 0, fill: '#4ade80' },
        { name: 'Français', value: 15, average: 0, fill: '#a855f7' },
        { name: 'Histoire-Geo', value: 10, average: 0, fill: '#22d3ee' },
        { name: 'Anglais', value: 10, average: 0, fill: '#f43f5e' },
        { name: 'EPS', value: 10, average: 0, fill: '#f472b6' }
    ];
    if (isSeniorClass) {
        defaultSubjects.push({ name: 'Philosophie', value: 15, average: 0, fill: '#7c3aed' });
    }

    const primaryParentPhone = studentForm.fatherPhone || studentForm.motherPhone || studentForm.tutorPhone || studentForm.parentPhone;

    const newStudent: Student = {
      id: Date.now().toString(),
      name: `${studentForm.firstName} ${studentForm.lastName}`,
      class: studentForm.class || 'Non assigné',
      studentId: studentForm.matricule,
      parentPhone: primaryParentPhone,
      fatherPhone: studentForm.fatherPhone,
      fatherEmail: studentForm.fatherEmail,
      motherPhone: studentForm.motherPhone,
      motherEmail: studentForm.motherEmail,
      tutorPhone: studentForm.tutorPhone,
      studentPhone: studentForm.studentPhone,
      country: studentForm.country || "Côte d'Ivoire",
      nationality: studentForm.nationality || "Ivoirienne",
      birthDate: studentForm.birthDate || '01/01/2010',
      birthPlace: studentForm.birthPlace || 'Abidjan',
      birthCertificateNumber: studentForm.birthCertificateNumber,
      birthCertificateDate: studentForm.birthCertificateDate,
      birthCertificateCity: studentForm.birthCertificateCity,
      photoUrl: previewImage || `https://i.pravatar.cc/150?u=${Date.now()}`,
      absences: 0,
      gender: studentForm.gender,
      assignedStatus: studentForm.assignedStatus,
      attendanceHistory: [],
      performance: [
        { name: 'Sep', studentScore: 0, classAverage: 0 },
        { name: 'Oct', studentScore: 0, classAverage: 0 },
        { name: 'Nov', studentScore: 0, classAverage: 0 },
        { name: 'Déc', studentScore: 0, classAverage: 0 },
        { name: 'Jan', studentScore: 0, classAverage: 0 },
        { name: 'Fév', studentScore: 0, classAverage: 0 },
        { name: 'Mar', studentScore: 0, classAverage: 0 },
        { name: 'Avr', studentScore: 0, classAverage: 0 },
        { name: 'Mai', studentScore: 0, classAverage: 0 }
      ],
      subjects: defaultSubjects,
      activities: [
        { id: '1', name: 'Inscription', date: 'Aujourd\'hui', amount: 'Validé', type: 'positive', icon: 'complete', categoryColor: 'bg-green-50 text-green-600' }
      ]
    };

    onAddStudent(newStudent);
    setShowSuccess(true);
    setStudentForm({ gender: 'M', firstName: '', lastName: '', class: 'Terminale D1', birthDate: '', birthPlace: '', birthCertificateNumber: '', birthCertificateDate: '', birthCertificateCity: '', matricule: `2024-${Math.floor(1000 + Math.random() * 9000)}`, country: "Côte d'Ivoire", nationality: "Ivoirienne", fatherPhone: '', fatherEmail: '', motherPhone: '', motherEmail: '', tutorPhone: '', parentPhone: '', studentPhone: '', assignedStatus: 'affecte' });
    setPreviewImage(null);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleTeacherSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherForm.firstName || !teacherForm.lastName) return;

    const newTeacher: Teacher & { firstName?: string; lastName?: string } = {
      id: Date.now().toString(),
      name: `${teacherForm.firstName} ${teacherForm.lastName}`.trim(),
      firstName: teacherForm.firstName,
      lastName: teacherForm.lastName,
      subject: teacherForm.subject || 'Général',
      email: teacherForm.email,
      phone: teacherForm.phone,
      gender: teacherForm.gender,
      photo: previewImage || `https://i.pravatar.cc/150?u=${Date.now() + 500}`,
      assignedClasses: teacherForm.classes,
      isPrincipal: teacherForm.isPrincipal,
      principalClasses: teacherForm.principalClasses,
      scheduleData: scheduleData,
      status: 'Actif',
      authorizationDecision: teacherForm.authorizationDecision
    };

    // If teacher is appointed as Professeur Principal, add notification for each class
    if (newTeacher.isPrincipal && newTeacher.principalClasses && newTeacher.principalClasses.length > 0) {
      try {
        const savedAnn = localStorage.getItem('school_db_announcements');
        const announcementsList = savedAnn ? JSON.parse(savedAnn) : [];
        
        const newNotifs = newTeacher.principalClasses.map((className, idx) => ({
          id: `ann-pp-${Date.now()}-${idx}`,
          title: `Nomination Professeur Principal`,
          category: 'info',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          location: `Classe ${className}`,
          targetAudience: `Professeur ${newTeacher.name}`,
          description: `Vous êtes le professeur principal de la classe ${className}`,
          isUrgent: true,
          isPinned: true,
          author: 'Direction des Études',
          createdAt: new Date().toISOString().split('T')[0],
          notes: `Nomination de ${newTeacher.name} pour la classe ${className}`
        }));

        localStorage.setItem('school_db_announcements', JSON.stringify([...newNotifs, ...announcementsList]));
      } catch (e) {
        console.error("Error creating PP notification", e);
      }
    }

    onAddTeacher(newTeacher);
    setShowSuccess(true);
    setScheduleData(getEmptySchedule());
    setTeacherForm({ gender: 'M', firstName: '', lastName: '', subject: '', email: '', phone: '', classes: [], isPrincipal: false, principalClasses: [], authorizationDecision: '' });
    setPreviewImage(null);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const currentPhoto = previewImage || `https://i.pravatar.cc/150?u=${activeTab === 'student' ? studentForm.firstName : teacherForm.firstName}`;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300 relative z-10 bg-[#BFDBFE] pt-12 md:pt-8">
      
      {/* Success Notification */}
      {showSuccess && (
        <div className="absolute top-8 right-8 bg-green-500 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4 z-50">
          <CheckCircle size={24} />
          <div>
            <h4 className="font-bold">Succès !</h4>
            <p className="text-sm text-green-100">L'enregistrement a été ajouté à la base de données.</p>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      <div className="md:hidden flex justify-between items-center mb-8 px-6 shrink-0">
          <div className="flex items-center gap-3">
              <button 
                onClick={() => onNavigate ? onNavigate('dashboard') : window.history.back()}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white active:scale-95 transition-transform"
                title="Retour"
              >
                  <ArrowLeft size={20} />
              </button>
              <h1 className="text-white text-[28px] font-bold tracking-tight">Inscriptions</h1>
          </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex justify-between items-center mt-5 mb-8 px-8 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigate ? onNavigate('dashboard') : window.history.back()}
            className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/30 active:scale-95 transition-all shadow-sm group"
            title="Retour à Terminale D"
          >
            <ArrowLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <h1 className="text-white text-[28px] font-bold tracking-tight">Inscriptions</h1>
            <p className="text-white/70 text-sm mt-1">Ajouter de nouveaux membres à l'établissement</p>
          </div>
        </div>
        
        {/* Toggle Switch */}
        <div className="bg-white/20 p-1 rounded-xl shadow-sm border border-white/30 flex">
            <button 
                onClick={() => { setActiveTab('student'); setPreviewImage(null); }}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'student' ? 'bg-white text-sky-600 shadow-md' : 'text-white hover:bg-white/10'}`}
            >
                <Users size={16} />
                Élève
            </button>
            <button 
                onClick={() => { setActiveTab('teacher'); setPreviewImage(null); }}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'teacher' ? 'bg-white text-sky-600 shadow-md' : 'text-white hover:bg-white/10'}`}
            >
                <GraduationCap size={16} />
                Professeur
            </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-t-[40px] px-6 pt-8 pb-32 md:px-8 md:pt-8 md:pb-24 shadow-2xl relative overflow-y-auto custom-scrollbar border-t border-white/50 md:border-none">
        
        {/* Mobile Toggle Switch */}
        <div className="md:hidden bg-gray-100 p-1 rounded-xl flex mb-6 shadow-sm border border-gray-200">
            <button 
                onClick={() => { setActiveTab('student'); setPreviewImage(null); }}
                className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'student' ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <Users size={16} />
                Élève
            </button>
            <button 
                onClick={() => { setActiveTab('teacher'); setPreviewImage(null); }}
                className={`flex-1 flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'teacher' ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            >
                <GraduationCap size={16} />
                Professeur
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full pb-4">

        
        {/* Form Column */}
        <div className="col-span-12 lg:col-span-8">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm">
             <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                {activeTab === 'student' ? (
                    <>
                        <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center"><UserPlus size={20}/></div>
                        Nouveau Dossier Élève
                    </>
                ) : (
                    <>
                        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><GraduationCap size={20}/></div>
                        Nouveau Dossier Professeur
                    </>
                )}
             </h2>

             <form onSubmit={activeTab === 'student' ? handleStudentSubmit : handleTeacherSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Prénom</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700"
                            placeholder="Ex: Jean"
                            value={activeTab === 'student' ? studentForm.firstName : teacherForm.firstName}
                            onChange={(e) => activeTab === 'student' ? setStudentForm({...studentForm, firstName: e.target.value}) : setTeacherForm({...teacherForm, firstName: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Nom</label>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700"
                            placeholder="Ex: Dupont"
                            value={activeTab === 'student' ? studentForm.lastName : teacherForm.lastName}
                            onChange={(e) => activeTab === 'student' ? setStudentForm({...studentForm, lastName: e.target.value}) : setTeacherForm({...teacherForm, lastName: e.target.value})}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Sexe</label>
                        <CustomSelect 
                            value={activeTab === 'student' ? studentForm.gender : teacherForm.gender}
                            onChange={(value) => activeTab === 'student' ? setStudentForm({...studentForm, gender: value as 'M' | 'F'}) : setTeacherForm({...teacherForm, gender: value as 'M' | 'F'})}
                            placeholder="Sélectionner"
                            items={[
                                { label: "Masculin (M)", value: "M" },
                                { label: "Féminin (F)", value: "F" }
                            ]}
                        />
                    </div>
                </div>

                {activeTab === 'student' ? (
                    // Fields specific to Student
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Matricule</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-4 py-3 outline-none font-mono font-bold text-gray-800 transition-all"
                                    value={studentForm.matricule}
                                    onChange={(e) => setStudentForm({...studentForm, matricule: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Date de Naissance</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700"
                                    value={studentForm.birthDate}
                                    onChange={(e) => setStudentForm({...studentForm, birthDate: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Section: Numéro et date de l'acte de naissance (Champ unique long) */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 md:p-5 space-y-2">
                            <label className="flex items-center gap-2 text-sky-800 font-bold text-sm">
                                <FileText size={18} className="text-sky-600" />
                                <span>Numéro et date de l'acte de naissance</span>
                            </label>
                            <input 
                                type="text" 
                                placeholder="Ex: 3913 DU 27/03/2006 ETABLI A ABOBO"
                                className="w-full bg-white border border-gray-200 focus:border-sky-500 rounded-xl px-4 py-3 outline-none text-sm transition-all font-semibold text-gray-800 tracking-wide uppercase placeholder:normal-case placeholder:font-normal"
                                value={studentForm.birthCertificateNumber}
                                onChange={(e) => setStudentForm({...studentForm, birthCertificateNumber: e.target.value})}
                            />
                            <p className="text-[11px] text-gray-500 italic pl-1">
                                Format recommandé : N° D'ACTE + DATE DE DÉLIVRANCE + LIEU D'ÉTABLISSEMENT (ex: 3913 DU 27/03/2006 ETABLI A ABOBO)
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Lieu de Naissance</label>
                                <input 
                                    type="text" 
                                    placeholder="Ex: Abidjan, Cocody"
                                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700"
                                    value={studentForm.birthPlace}
                                    onChange={(e) => setStudentForm({...studentForm, birthPlace: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Classe assignée</label>
                                <CustomSelect 
                                    value={studentForm.class}
                                    onChange={(value) => setStudentForm({...studentForm, class: value})}
                                    placeholder="Choisir une classe..."
                                    items={filteredClassesOptions}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Pays & Nationalité</label>
                                <CustomSelect 
                                    value={studentForm.country}
                                    onChange={(val) => {
                                      const cData = COUNTRIES_DATA[val];
                                      setStudentForm({
                                        ...studentForm,
                                        country: val,
                                        nationality: cData ? cData.nationality : 'Ivoirienne'
                                      });
                                    }}
                                    placeholder="Sélectionner le pays..."
                                    items={countryOptions}
                                    icon={<Globe size={18} />}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Statut d'affectation</label>
                                <CustomSelect 
                                    value={studentForm.assignedStatus}
                                    onChange={(value) => setStudentForm({...studentForm, assignedStatus: value as 'affecte' | 'non_affecte'})}
                                    placeholder="Statut d'affectation"
                                    items={[
                                        { label: "Affecté par l'État", value: "affecte" },
                                        { label: "Non affecté (Privé)", value: "non_affecte" }
                                    ]}
                                />
                            </div>
                        </div>

                        {/* Ligne 1 : Téléphone du Père & Téléphone de la Mère */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Téléphone du Père</label>
                                <div className="relative">
                                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                     <input 
                                        type="tel" 
                                        className="w-full pl-10 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700"
                                        placeholder="+225 07 01 02 03 04"
                                        value={studentForm.fatherPhone}
                                        onChange={(e) => setStudentForm({...studentForm, fatherPhone: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Téléphone de la Mère</label>
                                <div className="relative">
                                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                     <input 
                                        type="tel" 
                                        className="w-full pl-10 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700"
                                        placeholder="+225 05 01 02 03 04"
                                        value={studentForm.motherPhone}
                                        onChange={(e) => setStudentForm({...studentForm, motherPhone: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Ligne 1.5 : Email du Père & Email de la Mère */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Email du Père <span className="text-gray-400 font-normal font-sans text-xs">(Optionnel)</span></label>
                                <input 
                                    type="email" 
                                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700"
                                    placeholder="pere@example.com"
                                    value={studentForm.fatherEmail}
                                    onChange={(e) => setStudentForm({...studentForm, fatherEmail: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Email de la Mère <span className="text-gray-400 font-normal font-sans text-xs">(Optionnel)</span></label>
                                <input 
                                    type="email" 
                                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700"
                                    placeholder="mere@example.com"
                                    value={studentForm.motherEmail}
                                    onChange={(e) => setStudentForm({...studentForm, motherEmail: e.target.value})}
                                />
                            </div>
                        </div>

                        {/* Ligne 2 : Téléphone Élève & Téléphone Tuteur */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Téléphone Élève <span className="text-gray-400 font-normal font-sans text-xs">(Optionnel)</span></label>
                                <div className="relative">
                                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                     <input 
                                        type="tel" 
                                        className="w-full pl-10 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700"
                                        placeholder="+225 01 64 23 89 10"
                                        value={studentForm.studentPhone}
                                        onChange={(e) => setStudentForm({...studentForm, studentPhone: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Téléphone Tuteur <span className="text-gray-400 font-normal font-sans text-xs">(Optionnel)</span></label>
                                <div className="relative">
                                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                     <input 
                                        type="tel" 
                                        className="w-full pl-10 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700"
                                        placeholder="+225 07 88 99 00 11"
                                        value={studentForm.tutorPhone}
                                        onChange={(e) => setStudentForm({...studentForm, tutorPhone: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // Fields specific to Teacher
                    <>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Matière Enseignée</label>
                                <CustomSelect 
                                    value={teacherForm.subject}
                                    onChange={(value) => setTeacherForm({...teacherForm, subject: value})}
                                    placeholder="Choisir une matière..."
                                    items={[
                                        { label: "Mathématiques", value: "Mathématiques" },
                                        { label: "Français", value: "Français" },
                                        { label: "Histoire-Géo", value: "Histoire-Géo" },
                                        { label: "SVT", value: "SVT" },
                                        { label: "Physique-Chimie", value: "Physique-Chimie" },
                                        { label: "Anglais", value: "Anglais" },
                                        { label: "Espagnol", value: "Espagnol" },
                                        { label: "Philosophie", value: "Philosophie" },
                                        { label: "EPS", value: "EPS" },
                                        { label: "Histoire", value: "Histoire" },
                                        { label: "Géographie", value: "Géographie" },
                                        { label: "EDHC", value: "EDHC" },
                                        { label: "Sciences et Technologies", value: "Sciences et Technologies" },
                                        { label: "Éducation Musicale", value: "Éducation Musicale" },
                                        { label: "Arts Plastiques", value: "Arts Plastiques" }
                                    ]}
                                    icon={<Book size={18} />}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Email Professionnel</label>
                                <input 
                                    type="email" 
                                    placeholder="ex: prof@ecole.edu"
                                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700"
                                    value={teacherForm.email}
                                    onChange={(e) => setTeacherForm({...teacherForm, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Téléphone Mobile</label>
                                <div className="relative">
                                     <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                     <input 
                                        type="tel" 
                                        className="w-full pl-10 bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-4 py-3 outline-none transition-all font-medium text-gray-700"
                                        placeholder="+225 01 23 45 67 89"
                                        value={teacherForm.phone}
                                        onChange={(e) => setTeacherForm({...teacherForm, phone: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Classes en charge</label>
                                <CustomMultiSelect 
                                    values={teacherForm.classes}
                                    onChange={(values) => setTeacherForm({...teacherForm, classes: values})}
                                    placeholder="Sélectionner les classes..."
                                    items={filteredClassesOptions}
                                    icon={<Briefcase size={18} />}
                                />
                            </div>
                        </div>

                        <div className="bg-sky-50/50 border border-sky-100 rounded-xl p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${teacherForm.isPrincipal ? 'bg-sky-100 text-sky-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Users size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Professeur Principal</h4>
                                        <p className="text-xs text-gray-500">Attribuer une ou plusieurs classes en tant que professeur principal</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" className="sr-only peer" checked={teacherForm.isPrincipal} onChange={(e) => setTeacherForm({...teacherForm, isPrincipal: e.target.checked})} />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                                </label>
                            </div>
                            
                            {teacherForm.isPrincipal && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="pt-3 border-t border-sky-100"
                                >
                                    <label className="text-sm font-bold text-gray-700 mb-2 block">Classes principales</label>
                                    <CustomMultiSelect 
                                        values={teacherForm.principalClasses}
                                        onChange={(values) => setTeacherForm({...teacherForm, principalClasses: values})}
                                        placeholder="Sélectionner la ou les classes..."
                                        items={filteredClassesOptions}
                                        icon={<GraduationCap size={18} />}
                                    />
                                </motion.div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Décision d'autorisation d'exercer (Enseignant/Éducateur)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FileText size={18} className="text-gray-400" />
                                </div>
                                <input 
                                    type="text" 
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all text-sm font-medium" 
                                    placeholder="N° de la décision ou référence..." 
                                    value={teacherForm.authorizationDecision}
                                    onChange={(e) => setTeacherForm({...teacherForm, authorizationDecision: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button 
                                type="button" 
                                onClick={() => setShowScheduleEditor(true)}
                                className="px-5 py-2.5 rounded-xl font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 transition-colors flex items-center gap-2 text-sm"
                            >
                                <Calendar size={16} />
                                Configurer l'emploi du temps
                            </button>
                        </div>
                    </>
                )}

                {/* File Upload Input */}
                <div 
                    onClick={triggerFileInput}
                    className={`border-2 border-dashed ${previewImage ? 'border-sky-300 bg-sky-50' : 'border-gray-200'} rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer group relative`}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleImageUpload} 
                        className="hidden" 
                        accept="image/*"
                    />
                    
                    {previewImage ? (
                        <>
                            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden">
                                <img src={previewImage} alt="Preview upload" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-sky-600">Photo sélectionnée</p>
                                <p className="text-xs text-sky-400">Cliquer pour changer</p>
                            </div>
                            <button 
                                onClick={clearImage}
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white text-gray-500 shadow-sm flex items-center justify-center hover:bg-sky-50 hover:text-sky-500 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload size={20} />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-gray-600">Photo d'identité</p>
                                <p className="text-xs text-gray-400">Glisser-déposer ou cliquer pour importer</p>
                            </div>
                        </>
                    )}
                </div>

                <div className="pt-4 flex justify-end gap-4">
                     <button 
                       type="button" 
                       onClick={() => onNavigate ? onNavigate('dashboard') : window.history.back()}
                       className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                     >
                       Annuler
                     </button>
                     <button type="submit" className="px-8 py-3 rounded-xl font-bold text-white bg-sky-600 shadow-lg shadow-sky-200 hover:bg-sky-700 transition-all flex items-center gap-2">
                        <CheckCircle size={18} />
                        Enregistrer {activeTab === 'student' ? "l'élève" : 'le professeur'}
                     </button>
                </div>
             </form>
          </div>
        </div>

        {/* Preview Column */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div 
                className="rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden"
                style={{ 
                    marginTop: '0px', 
                    marginLeft: '-8px', 
                    marginRight: '21px',
                    background: 'linear-gradient(to bottom right, #0284c7, #f97316)'
                }}
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500 opacity-20 rounded-full -ml-12 -mb-12 blur-xl"></div>
                
                <h3 className="text-lg font-bold mb-8 opacity-90">Aperçu Carte {activeTab === 'student' ? 'Scolaire' : 'Pro'}</h3>

                <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 rounded-full border-4 border-white/30 bg-white/10 mb-4 flex items-center justify-center overflow-hidden">
                         {/* Placeholder or Uploaded Image */}
                         <img src={currentPhoto} className="w-full h-full object-cover" alt="Preview" />
                    </div>
                    <h2 className="text-2xl font-bold text-center leading-tight">
                        {(activeTab === 'student' ? studentForm.firstName : teacherForm.firstName) || 'Prénom'} <br/>
                        {(activeTab === 'student' ? studentForm.lastName : teacherForm.lastName) || 'Nom'}
                    </h2>
                    <p className="text-sky-100 mt-2 font-medium bg-white/20 px-4 py-1 rounded-full text-sm">
                        Sexe: {activeTab === 'student' ? studentForm.gender : teacherForm.gender} | {activeTab === 'student' ? (studentForm.class || 'Classe ???') : (teacherForm.subject || 'Matière ???')}
                    </p>
                </div>

                <div className="space-y-3 bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-sky-200">ID / REF</span>
                        <span className="font-mono font-bold">{activeTab === 'student' ? (studentForm.matricule || '2024-XXXX') : 'PROF-2024'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-sky-200">Année</span>
                        <span className="font-bold">2023 - 2024</span>
                    </div>
                    {activeTab === 'student' && (
                         <>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-sky-200">Date de Nais.</span>
                                <span className="font-bold">{studentForm.birthDate || '01/01/2010'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-sky-200">Lieu de Nais.</span>
                                <span className="font-bold">{studentForm.birthPlace || 'Abidjan'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-sky-200">Statut</span>
                                <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${studentForm.assignedStatus === 'non_affecte' ? 'bg-amber-400 text-amber-950' : 'bg-emerald-400 text-emerald-950'}`}>
                                    {studentForm.assignedStatus === 'non_affecte' ? 'Non Affecté' : 'Affecté'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-sky-200">Contact</span>
                                <span className="font-bold">{studentForm.parentPhone || '-'}</span>
                            </div>
                         </>
                    )}
                </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Book size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-800">Guide Rapide</h4>
                        <p className="text-xs text-gray-400">Pour l'administration</p>
                    </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                    Assurez-vous que toutes les informations sont correctes avant de valider. 
                    Une fois enregistré, le profil sera immédiatement disponible dans la liste des {activeTab === 'student' ? 'élèves' : 'professeurs'} et dans la barre de recherche.
                </p>
            </div>
        </div>

      </div>
      </div>

      {/* Schedule Editor Full Panel */}
      {showScheduleEditor && (
          <>
            {/* Mobile View */}
            <div className="md:hidden fixed inset-0 z-[150] bg-[#BFDBFE]">
                <DailyScheduleMobileView 
                    onBack={() => setShowScheduleEditor(false)}
                    events={scheduleEvents}
                    onEventClick={(evt) => {
                         const dIndex = evt.day;
                         const sIndex = evt.start;
                         const slot = scheduleData[dIndex]?.slots[sIndex];
                         handleSlotClick(dIndex, sIndex, slot || { active: true, subject: evt.title, room: evt.room });
                    }}
                    onEmptySlotClick={(day, start) => {
                         const slot = scheduleData[day]?.slots[start];
                         handleSlotClick(day, start, slot || { active: false, subject: '', room: '' });
                    }}
                    readOnly={false}
                    classNameTitle={`${teacherForm.firstName || 'Nouveau'} ${teacherForm.lastName || 'Professeur'}`.trim()}
                    subtitle={teacherForm.subject ? `Professeur de ${teacherForm.subject}` : "Planning de cours"}
                    imageUrl={previewImage || undefined}
                />
            </div>

            {/* Desktop View Panel */}
            <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center p-4">
               <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowScheduleEditor(false)}></div>
               
               <div className="bg-white rounded-[2rem] w-full max-w-5xl h-[90vh] flex flex-col relative z-50 shadow-2xl animate-in zoom-in-95 overflow-hidden">
                 <div className="bg-white px-6 py-5 flex items-center justify-between shrink-0 border-b border-gray-100">
                     <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                             {previewImage ? (
                                 <img src={previewImage} alt="Teacher" className="w-full h-full object-cover" />
                             ) : (
                                 <div className="w-full h-full flex items-center justify-center text-gray-400"><Users size={24}/></div>
                             )}
                         </div>
                         <div>
                             <h2 className="text-xl font-bold text-slate-800">{teacherForm.firstName || 'Nouveau'} {teacherForm.lastName || 'Professeur'}</h2>
                             <div className="flex items-center gap-2">
                                 <span className="text-sm font-bold text-sky-500">{teacherForm.subject || 'Matière non définie'}</span>
                                 <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">Mode Édition</span>
                             </div>
                         </div>
                     </div>
                     <button 
                         onClick={() => setShowScheduleEditor(false)}
                         className="w-10 h-10 bg-white border border-gray-200 text-gray-500 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                     >
                         <X size={20} />
                     </button>
                 </div>

                 {/* Schedule Grid */}
                 <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                     <div className="grid grid-cols-5 gap-4">
                         {scheduleData.map((dayData, dIndex) => (
                             <div key={dIndex} className="flex flex-col gap-3 h-full">
                                 <h3 className="text-center font-bold text-gray-400 uppercase text-xs tracking-wider mb-2 bg-white/60 py-2 rounded-lg">
                                     {dayData.fullName}
                                 </h3>
                                 
                                 <div className="flex flex-col gap-3">
                                     {dayData.slots.map((slot: any, sIndex: number) => {
                                         const isBreak = sIndex === 3 || sIndex === 7;
                                         if (isBreak) {
                                             return (
                                                 <div key={sIndex} className="flex justify-center items-center py-1">
                                                     <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{sIndex === 3 ? 'Récréation' : 'Pause Midi'}</span>
                                                 </div>
                                             );
                                         }

                                         return (
                                         <div 
                                             key={sIndex} 
                                             onClick={() => handleSlotClick(dIndex, sIndex, slot)}
                                             className={`
                                                 p-3 rounded-xl border flex flex-col gap-1 transition-all group cursor-pointer hover:border-sky-300 hover:shadow-md
                                                 ${slot.active 
                                                     ? 'bg-sky-50 border-sky-100 shadow-sm' 
                                                     : 'bg-white border-transparent shadow-sm'
                                                 }
                                             `}
                                         >
                                             <div className="flex justify-between items-center">
                                                 <span className={`text-xs font-bold ${slot.active ? 'text-sky-600' : 'text-gray-400'}`}>{slot.time}</span>
                                                 {slot.active && <Clock size={14} className="text-sky-400"/>}
                                                 {!slot.active && <Plus size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                             </div>
                                             
                                             {slot.active ? (
                                                 <>
                                                     <span className="text-xs font-bold text-gray-800">{slot.subject}</span>
                                                     <div className="flex items-center justify-between mt-1 gap-1">
                                                         <span className="text-[10px] font-medium text-gray-500 bg-white/60 px-2 py-0.5 rounded-md border border-sky-100/50">
                                                             {slot.room || 'Salle'} 
                                                         </span>
                                                         <Edit3 size={10} className="text-sky-300 opacity-0 group-hover:opacity-100 shrink-0" />
                                                     </div>
                                                 </>
                                             ) : (
                                                 <div className="h-6 flex items-center justify-center">
                                                     <span className="text-[10px] text-gray-300">-</span>
                                                 </div>
                                             )}
                                         </div>
                                     )})}
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* Footer */}
                 <div className="p-5 bg-white flex justify-between items-center text-sm font-medium text-gray-500 px-8 shrink-0">
                     <span>Cliquez sur une case pour modifier.</span>
                     <button onClick={() => setShowScheduleEditor(false)} className="font-bold text-slate-600 hover:text-slate-900 transition-colors">Fermer</button>
                 </div>
             </div>
            </div>

            {/* Edit Modal (Nested) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
                    <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 relative z-50 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingSlot && scheduleData[editingSlot.dayIndex]?.slots[editingSlot.slotIndex].active ? 'Modifier le cours' : 'Ajouter un cours'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Matière</label>
                                <select 
                                    value={scheduleFormData.subject} 
                                    onChange={e => setScheduleFormData({...scheduleFormData, subject: e.target.value})}
                                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 transition-all"
                                >
                                    {getSubjectsForClass(scheduleFormData.room || '').map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Classe</label>
                                <select 
                                    value={scheduleFormData.room} 
                                    onChange={e => handleRoomChange(e.target.value)}
                                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 transition-all"
                                >
                                    {CLASSES_OPTIONS.map(group => (
                                        <optgroup key={group.label} label={group.label}>
                                            {group.options.map(c => (
                                                <option key={c.value} value={c.value}>{c.label}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Durée (heures)</label>
                                <select 
                                    value={scheduleFormData.duration} 
                                    onChange={e => setScheduleFormData({...scheduleFormData, duration: Number(e.target.value)})}
                                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 transition-all"
                                >
                                    {[1, 2, 3, 4].map(h => (
                                        <option key={h} value={h}>{h} heure{h > 1 ? 's' : ''}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center gap-3">
                            {editingSlot && scheduleData[editingSlot.dayIndex]?.slots[editingSlot.slotIndex].active && (
                                <button 
                                    onClick={handleDeleteSlot}
                                    className="p-3 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
                                    title="Supprimer ce cours"
                                >
                                    <X size={20} />
                                </button>
                            )}
                            <button 
                                onClick={handleSaveSlot}
                                className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-sky-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={18} />
                                <span>Valider</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
          </>
      )}

    </div>
  );
};