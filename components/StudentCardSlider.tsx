import React, { useState, useRef } from 'react';
import { compressImage } from '../src/utils/userUtils';
import { PenLine, Trash2, Shield, Globe, Award, Sparkles, Phone, UserCheck, Wifi, Eye, CheckCircle2, CreditCard, Clock, ArrowRight, MessageSquare, Send, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Student } from '../types';
import { getCountryConfig } from '../data/countries';

interface StudentCardSliderProps {
  student?: Student;
  onEdit?: () => void;
  onDelete?: () => void;
  onPhotoChange?: (newPhotoUrl: string) => void;
  readOnly?: boolean;
  schoolName?: string;
  onNavigate?: (page: string) => void;
  hideTuitionCard?: boolean;
  currentUser?: any;
}

export const StudentCardSlider: React.FC<StudentCardSliderProps> = ({
  student,
  onEdit,
  onDelete,
  onPhotoChange,
  readOnly = false,
  schoolName = 'Collège Faoummaba',
  onNavigate,
  hideTuitionCard = false,
  currentUser
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string | null>(null);
  const [photoSavedMessage, setPhotoSavedMessage] = useState<string | null>(null);

  React.useEffect(() => {
    setLocalPhotoUrl(null);
  }, [student?.id, student?.photoUrl]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // Compress the image before saving (crucial for phone cameras to avoid exceeding Firestore 1MB limit)
        const dataUrl = await compressImage(file, 400, 400, 0.85);
        setLocalPhotoUrl(dataUrl);

        if (student) {
          student.photoUrl = dataUrl;
        }

        // Automatic Persistence Steps
        // 1. Update in school_db_students in localStorage
        const savedStudentsStr = localStorage.getItem('school_db_students');
        let realStudentId: string | number | undefined = student?.id;
        if (savedStudentsStr) {
          try {
            const studentsList = JSON.parse(savedStudentsStr);
            if (Array.isArray(studentsList)) {
              let updated = false;
              const newStudentsList = studentsList.map((st: any) => {
                const isMatch = 
                  (student && student.id && String(student.id) !== '1' && String(st.id) === String(student.id)) ||
                  (student && student.studentId && st.studentId && String(st.studentId).toLowerCase() === String(student.studentId).toLowerCase()) ||
                  (student && student.name && st.name && st.name.toLowerCase() === student.name.toLowerCase());
                if (isMatch) {
                  updated = true;
                  realStudentId = st.id;
                  return { ...st, photoUrl: dataUrl, photo: dataUrl };
                }
                return st;
              });
              if (updated) {
                localStorage.setItem('school_db_students', JSON.stringify(newStudentsList));
              }
            }
          } catch (err) {}
        }

        // 2. Update current user sessions in localStorage if matching student
        const sessionKeys = ['school_user_session', 'school_user'];
        sessionKeys.forEach(key => {
          const str = localStorage.getItem(key);
          if (str) {
            try {
              const u = JSON.parse(str);
              if (
                u && student && (
                  (student.studentId && u.matricule && String(u.matricule).toLowerCase() === String(student.studentId).toLowerCase()) ||
                  (student.id && String(u.id) === String(student.id)) ||
                  (student.name && u.name && u.name.toLowerCase() === student.name.toLowerCase())
                )
              ) {
                u.photo = dataUrl;
                u.photoUrl = dataUrl;
                localStorage.setItem(key, JSON.stringify(u));
              }
            } catch (err) {}
          }
        });

        // 3. Save to Firestore real-time 'students' collection (only if valid, non-mock ID)
        if (student && realStudentId && String(realStudentId) !== '1') {
          const { saveRealtimeDocument } = await import('../src/services/firebaseService');
          await saveRealtimeDocument('students', String(realStudentId), {
            ...student,
            id: realStudentId,
            photoUrl: dataUrl
          }).catch(err => console.warn("Firestore students auto-save failed:", err));
        }

        // 4. Update Firestore 'users' collection doc if existing
        try {
          const { db } = await import('../src/lib/firebase');
          const { collection, getDocs, doc, setDoc } = await import('firebase/firestore');
          const usersSnap = await getDocs(collection(db, 'users'));
          usersSnap.docs.forEach(async (uDoc) => {
            const uData = uDoc.data();
            const isMatch = 
              student && (
                String(uDoc.id) === String(realStudentId) ||
                (student.studentId && uData.matricule && String(uData.matricule).toLowerCase() === String(student.studentId).toLowerCase()) ||
                (student.name && uData.name && uData.name.toLowerCase() === student.name.toLowerCase())
              );
            if (isMatch) {
              await setDoc(doc(db, 'users', uDoc.id), {
                photo: dataUrl,
                photoUrl: dataUrl
              }, { merge: true }).catch(() => {});
            }
          });
        } catch (e) {}

        // 5. Dispatch custom event for real-time app reactivity
        window.dispatchEvent(new CustomEvent('student-photo-updated', { 
          detail: { studentId: realStudentId || student?.id, matricule: student?.studentId, photoUrl: dataUrl } 
        }));

        // 6. Show toast notification
        setPhotoSavedMessage('Photo sauvegardée automatiquement !');
        setTimeout(() => {
          setPhotoSavedMessage(null);
        }, 3500);

        if (onPhotoChange) {
          onPhotoChange(dataUrl);
        }

      } catch (err: any) {
        console.warn("Auto-save student photo failed:", err);
        alert(err.message || "Erreur lors du traitement de la photo");
      }
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const userRole = currentUser?.role || (() => {
    try {
      const u = JSON.parse(localStorage.getItem('school_user') || localStorage.getItem('school_user_session') || '{}');
      return u?.role;
    } catch(e) { return null; }
  })();

  const userAccessLevel = currentUser?.accessLevel ?? (() => {
    try {
      const u = JSON.parse(localStorage.getItem('school_user') || localStorage.getItem('school_user_session') || '{}');
      return u?.accessLevel;
    } catch(e) { return null; }
  })();

  const isTeacher = userRole === 'teacher' || userRole === 'professeur' || userAccessLevel === 3;
  const shouldHideTuition = Boolean(hideTuitionCard || isTeacher);

  const totalCards = shouldHideTuition ? 1 : 2;

  React.useEffect(() => {
    if (activeIndex >= totalCards) {
      setActiveIndex(0);
    }
  }, [totalCards, activeIndex]);

  if (!student) {
    return null;
  }

  const countryConfig = getCountryConfig(student?.country || student?.nationality || "Côte d'Ivoire");
  const nationalityLabel = student?.nationality || countryConfig.nationality;

  const goToCroissancePage = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (student) {
      if (student.id) {
        localStorage.setItem('insights_target_student', String(student.id));
      }
      if (student.class) {
        localStorage.setItem('insights_target_class', String(student.class));
      }
    }
    if (onNavigate) {
      onNavigate('insights');
    }
    window.dispatchEvent(new CustomEvent('navigate-to-page', { detail: 'insights' }));
    window.dispatchEvent(new CustomEvent('navigate', { detail: 'insights' }));
  };

  const nextCard = () => {
    setActiveIndex((prev) => (prev + 1) % totalCards);
  };

  const prevCard = () => {
    setActiveIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  const getTuitionInfo = (std: Student) => {
    let customRates: Record<string, number> = {};
    try {
      const savedRates = localStorage.getItem('school_db_tuition_rates');
      if (savedRates) customRates = JSON.parse(savedRates);
    } catch (e) {}

    const cls = (std.class || '').toLowerCase().trim();
    let defaultTotal = 90000;
    if (cls.includes('3ème') || cls.includes('3eme') || cls.includes('3e')) {
      defaultTotal = 100000;
    } else if (
      cls.includes('2nde') || cls.includes('seconde') ||
      cls.includes('1ère') || cls.includes('1ere') || cls.includes('1e') ||
      cls.includes('tle') || cls.includes('terminale')
    ) {
      defaultTotal = 110000;
    }

    let total = defaultTotal;
    if (cls.includes('6ème') || cls.includes('6eme') || cls.includes('6e')) total = customRates['6ème'] ?? defaultTotal;
    else if (cls.includes('5ème') || cls.includes('5eme') || cls.includes('5e')) total = customRates['5ème'] ?? defaultTotal;
    else if (cls.includes('4ème') || cls.includes('4eme') || cls.includes('4e')) total = customRates['4ème'] ?? defaultTotal;
    else if (cls.includes('3ème') || cls.includes('3eme') || cls.includes('3e')) total = customRates['3ème'] ?? defaultTotal;
    else if (cls.includes('2nde') || cls.includes('seconde')) total = customRates['2nde'] ?? defaultTotal;
    else if (cls.includes('1ère') || cls.includes('1ere') || cls.includes('1e')) total = customRates['1ère'] ?? defaultTotal;
    else if (cls.includes('tle') || cls.includes('terminale')) total = customRates['Tle'] ?? defaultTotal;

    let paid = (std as any).tuitionPaid ?? 0;
    try {
      const savedPayments = localStorage.getItem('school_db_financials');
      if (savedPayments) {
        const payments = JSON.parse(savedPayments);
        if (payments[std.id] !== undefined) {
          paid = payments[std.id];
        }
      }
    } catch (e) {}

    if ((std as any).tuitionTotal) {
      total = (std as any).tuitionTotal;
    }

    const remainder = Math.max(0, total - paid);
    const isSolde = paid >= total;
    const percentage = Math.min(100, Math.round((paid / (total || 1)) * 100));

    return { total, paid, remainder, isSolde, percentage };
  };

  const tuitionInfo = getTuitionInfo(student);

  const getCardTheme = (className: string) => {
    const c = (className || '').toLowerCase();
    
    if (c.includes('6ème') || c.includes('5ème')) {
      return {
        bgMain: 'bg-[#0ea5e9]',
        bgAccent: 'bg-[#eab308]',
        border1: 'border-[#ca8a04]/10',
        border2: 'border-[#ca8a04]/5',
        textRight: 'text-white',
        pillBg: 'bg-white/25 text-white border-white/20 backdrop-blur-md',
        photoBorder: 'border-white/40',
        genderBg: 'bg-white/20 text-white border-white/30 backdrop-blur-md'
      };
    }
    if (c.includes('4ème') || c.includes('3ème')) {
      return {
        bgMain: 'bg-emerald-400',
        bgAccent: 'bg-white',
        border1: 'border-emerald-50',
        border2: 'border-emerald-50/50',
        textRight: 'text-[#38BDF8]',
        pillBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        photoBorder: 'border-slate-200',
        genderBg: 'bg-slate-100 border-slate-200 text-slate-700'
      };
    }
    if (c.includes('2nde') || c.includes('seconde') || c.includes('1ère') || c.includes('première') || c.includes('1ere')) {
      return {
        bgMain: 'bg-sky-400',
        bgAccent: 'bg-white',
        border1: 'border-sky-50',
        border2: 'border-sky-50/50',
        textRight: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]',
        pillBg: 'bg-white/20 text-white border-white/40 backdrop-blur-md drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]',
        photoBorder: 'border-white/50',
        genderBg: 'bg-white/20 text-white border-white/40 backdrop-blur-md'
      };
    }
    if (c.includes('tle') || c.includes('terminale')) {
      return {
        bgMain: 'bg-indigo-500',
        bgAccent: 'bg-white',
        border1: 'border-indigo-50',
        border2: 'border-indigo-50/50',
        textRight: 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]',
        pillBg: 'bg-white/40 text-white border-white/50 backdrop-blur-md drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]',
        photoBorder: 'border-white/50',
        genderBg: 'bg-white/40 text-white border-white/50 backdrop-blur-md'
      };
    }
    return {
      bgMain: 'bg-[#0ea5e9]',
      bgAccent: 'bg-[#eab308]',
      border1: 'border-[#ca8a04]/10',
      border2: 'border-[#ca8a04]/5',
      textRight: 'text-white',
      pillBg: 'bg-white/25 text-white border-white/20 backdrop-blur-md',
      photoBorder: 'border-white/40',
      genderBg: 'bg-white/20 text-white border-white/30 backdrop-blur-md'
    };
  };

  const theme = getCardTheme(student.class);

  const getCardTitle = () => {
    switch (activeIndex) {
      case 0:
        return 'Carte Étudiant';
      case 1:
        return 'Situation Scolarité';
      default:
        return 'Carte Étudiant';
    }
  };

  return (
    <div className="w-full select-none">
      <input 
        type="file" 
        ref={photoInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handlePhotoSelect} 
      />
      {/* Header title & controls */}
      <div className="flex justify-between items-center mb-3 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-slate-900 text-lg md:text-xl font-bold tracking-wide">
            {getCardTitle()}
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
            {activeIndex + 1} / {totalCards}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && onEdit && (
            <button
              onClick={onEdit}
              className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-sky-600 transition-all active:scale-95 shadow-sm"
              title="Modifier les informations"
            >
              <PenLine size={15} />
            </button>
          )}
          {!readOnly && onDelete && (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="p-2 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition-all active:scale-95 shadow-sm"
              title="Supprimer l'élève"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Main Card Slider Container */}
      <div className="relative w-full aspect-[1.58/1] min-h-[220px] rounded-3xl overflow-hidden shadow-xl group">
        <AnimatePresence>
          {photoSavedMessage && (
            <motion.div
              initial={{ opacity: 0, y: -15, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -15, x: "-50%" }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[90] px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-full shadow-xl flex items-center gap-2 border border-emerald-500/30 backdrop-blur-md"
            >
              <CheckCircle2 size={14} className="text-white animate-bounce shrink-0" />
              <span className="whitespace-nowrap">{photoSavedMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Animated Cards Container */}
        <div className="relative w-full h-full">
          <AnimatePresence mode="wait">
            {activeIndex === 0 && (
              /* CARD 1: CARTE ÉTUDIANT */
              <motion.div
                key="card-student"
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -30) nextCard();
                  if (info.offset.x > 30) prevCard();
                }}
                onClick={(e) => {
                  nextCard();
                }}
                className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing"
              >
                {(() => {
                  const isTerminale = (student.class || '').toLowerCase().includes('tle') || (student.class || '').toLowerCase().includes('terminale');
                  const isSecondeOrPremiere = (student.class || '').toLowerCase().includes('2nde') || (student.class || '').toLowerCase().includes('seconde') || (student.class || '').toLowerCase().includes('1ère') || (student.class || '').toLowerCase().includes('1ere') || (student.class || '').toLowerCase().includes('première') || (student.class || '').toLowerCase().includes('premiere');
                  
                  return (
                    <>
                      {/* Background Styling */}
                      {isTerminale ? (
                        <div 
                          className="absolute inset-0"
                          style={{ 
                            background: 'linear-gradient(132deg, #9CB7F5 0%, #D2D5F8 48%, #F7E4FA 100%)',
                            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4)',
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                        </div>
                      ) : isSecondeOrPremiere ? (
                        <div className="absolute inset-0 bg-[#2563eb]">
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 440 277" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="base-bg-blue" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#2563eb" /> 
                                <stop offset="40%" stopColor="#3b82f6" />
                                <stop offset="70%" stopColor="#60a5fa" />
                                <stop offset="100%" stopColor="#bfdbfe" />
                              </linearGradient>

                              <linearGradient id="beam1-blue" x1="0" y1="180" x2="220" y2="0" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                              </linearGradient>

                              <linearGradient id="beam2-blue" x1="0" y1="277" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#1e3a8a" stopOpacity="1" />
                                <stop offset="50%" stopColor="#2563eb" stopOpacity="0.7" />
                                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                              </linearGradient>

                              <radialGradient id="top-left-texture-blue" cx="20%" cy="20%" r="40%">
                                <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.7" />
                                <stop offset="100%" stopColor="#dbeafe" stopOpacity="0" />
                              </radialGradient>

                              <pattern id="halftone-dots-blue" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                <circle cx="2" cy="2" r="1.5" fill="#1e3a8a" opacity="0.4" />
                              </pattern>

                              <linearGradient id="dot-mask-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="60%" stopColor="transparent" />
                                <stop offset="100%" stopColor="black" />
                              </linearGradient>
                            </defs>

                            <rect width="440" height="277" fill="url(#base-bg-blue)" />
                            <rect width="440" height="277" fill="url(#halftone-dots-blue)" mask="url(#dot-mask-blue)" />
                            <rect width="440" height="277" fill="url(#top-left-texture-blue)" style={{ mixBlendMode: 'screen' }} />
                            <path d="M 0,180 L 300,277 L 0,277 Z" fill="#1e3a8a" opacity="0.85" style={{ mixBlendMode: 'multiply' }} />
                            <polygon points="0,170 230,0 300,0 0,220" fill="url(#beam1-blue)" style={{ mixBlendMode: 'overlay' }} />
                            <polygon points="0,180 230,0 240,0 0,190" fill="#60a5fa" opacity="0.7" />
                            <path d="M 0,277 L 280,0 L 360,0 L 150,277 Z" fill="url(#beam2-blue)" style={{ mixBlendMode: 'hard-light' }} opacity="0.8" />
                            <path d="M 120,277 C 220,200 240,100 180,-10 C 130,80 90,180 -20,240 Z" fill="#93c5fd" opacity="0.4" style={{ mixBlendMode: 'screen' }} />
                            <path d="M 0,220 Q 100,210 200,240 T 440,230" fill="none" stroke="#bfdbfe" strokeWidth="2" opacity="0.4" style={{ mixBlendMode: 'overlay' }} />
                            <path d="M 0,240 Q 120,230 220,260 T 440,250" fill="none" stroke="#dbeafe" strokeWidth="1.5" opacity="0.3" style={{ mixBlendMode: 'overlay' }} />
                            <rect width="440" height="2" fill="white" opacity="0.2" />
                          </svg>
                          <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(255,255,255,0.15)] rounded-3xl pointer-events-none border border-white/20"></div>
                        </div>
                      ) : (
                        <>
                          <div className={`absolute inset-0 ${theme.bgMain}`}></div>
                          <div
                            className={`absolute inset-y-0 right-0 w-[65%] ${theme.bgAccent}`}
                            style={{ borderTopLeftRadius: '200px', borderBottomLeftRadius: '40px' }}
                          >
                            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border-[30px] ${theme.border1}`}></div>
                            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] rounded-full border-[30px] ${theme.border2}`}></div>
                          </div>
                        </>
                      )}

                      {/* Content Layer */}
                      <div className={`relative z-10 w-full h-full p-5 flex flex-col justify-between ${isTerminale || isSecondeOrPremiere ? 'text-white' : 'text-white'}`}>

                  {/* Top Row */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`${isTerminale || isSecondeOrPremiere ? 'text-white' : 'text-slate-800 md:text-white'} font-bold text-xs md:text-sm tracking-wider pt-1 uppercase drop-shadow-sm`}>
                        {schoolName}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-600/90 text-white border border-white/20 mt-1 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-pulse"></span>
                        {student.assignedStatus === 'non_affecte' ? 'Non Affecté' : 'Affecté (État)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-sm ${theme.genderBg}`}>
                        {student.gender || 'M'}
                      </div>
                      <div 
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (!readOnly) {
                            photoInputRef.current?.click();
                          } else if (onEdit) {
                            onEdit();
                          }
                        }}
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-2 overflow-hidden bg-white shrink-0 shadow-md ${theme.photoBorder} relative group cursor-pointer`}
                        title="Cliquer pour changer la photo"
                      >
                        <img
                          src={localPhotoUrl || student.photoUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80'}
                          alt={student.name}
                          className="w-full h-full object-cover"
                        />
                        {!readOnly && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-center p-1">
                            <Camera size={16} />
                            <span className="text-[8px] font-bold mt-0.5 leading-none">Changer</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle / Bottom Row */}
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="mb-2">
                        <p className={`${isTerminale || isSecondeOrPremiere ? 'text-white/80' : 'text-slate-800 md:text-white/75'} text-[9px] font-bold tracking-widest uppercase mb-0.5`}>MATRICULE</p>
                        <p className={`${isTerminale || isSecondeOrPremiere ? 'text-white' : 'text-slate-800 md:text-white'} font-mono font-bold text-sm md:text-base tracking-wider drop-shadow-sm`}>
                          {student.studentId}
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <p className={`${isTerminale || isSecondeOrPremiere ? 'text-white/80' : 'text-slate-800 md:text-white/75'} text-[9px] font-bold tracking-widest uppercase mb-0.5`}>NÉ(E) LE</p>
                          <p className={`${isTerminale || isSecondeOrPremiere ? 'text-white' : 'text-slate-800 md:text-white'} font-bold text-xs md:text-sm drop-shadow-sm leading-tight`}>{student.birthDate}</p>
                          <p className={`${isTerminale || isSecondeOrPremiere ? 'text-white/80' : 'text-slate-800 md:text-white/75'} text-[9px] font-bold tracking-widest uppercase mt-1.5 mb-0.5`}>LIEU DE NAISSANCE</p>
                          <p className={`${isTerminale || isSecondeOrPremiere ? 'text-white' : 'text-slate-800 md:text-white'} font-bold text-[11px] md:text-xs drop-shadow-sm leading-tight truncate max-w-[130px]`}>
                            {student.birthPlace || 'Abidjan'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <h2 className={`font-bold text-base md:text-lg mb-1 drop-shadow-sm leading-tight ${theme.textRight}`}>
                        {student.name}
                      </h2>
                      <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-lg border ${theme.pillBg}`}>
                        {student.class}
                      </span>
                    </div>
                  </div>
                </div>
                </>
                  );
                })()}
              </motion.div>
            )}

            {activeIndex === 1 && !shouldHideTuition && (
              /* CARD 2: SITUATION SCOLARITÉ / FRAIS D'ÉTUDES */
              <motion.div
                key="card-tuition"
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -30) nextCard();
                  if (info.offset.x > 30) prevCard();
                }}
                className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-[#BFDBFE] text-slate-900 border-2 border-blue-300"
              >
                {/* Background decorative gradients */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400/20 rounded-full filter blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-400/20 rounded-full filter blur-xl pointer-events-none"></div>

                {/* Content Layer */}
                <div className="relative z-10 w-full h-full p-3.5 md:p-4 flex flex-col justify-between">
                  {/* Header */}
                  <div className="flex justify-between items-center border-b border-blue-300/80 pb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                        {tuitionInfo.isSolde ? <CheckCircle2 size={16} /> : <CreditCard size={16} />}
                      </div>
                      <div>
                        <h3 className="text-blue-950 font-black text-xs md:text-sm tracking-wider uppercase">
                          SITUATION SCOLARITÉ
                        </h3>
                        <p className="text-blue-800 font-bold text-[8px] md:text-[9px] uppercase">
                          ANNÉE SCOLAIRE 2025-2026
                        </p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm text-white ${
                      tuitionInfo.isSolde 
                        ? 'bg-emerald-600' 
                        : 'bg-rose-600 animate-pulse'
                    }`}>
                      {tuitionInfo.isSolde ? (
                        <>
                          <CheckCircle2 size={10} />
                          <span>SOLDÉ</span>
                        </>
                      ) : (
                        <>
                          <Clock size={10} />
                          <span>RESTE SCOLARITÉ</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Middle Section: Financial Amounts & Progress Box */}
                  <div className="my-1 bg-white/95 backdrop-blur-sm rounded-2xl p-2.5 md:p-3 border border-blue-200 shadow-sm">
                    <div className="flex justify-between items-end mb-1.5">
                      <div>
                        <p className="text-slate-500 text-[8px] md:text-[9px] font-black uppercase tracking-wider">
                          TOTALE
                        </p>
                        <p className="text-slate-900 font-mono font-bold text-xs md:text-sm">
                          {tuitionInfo.total.toLocaleString()} FCFA
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-emerald-700 text-[8px] md:text-[9px] font-black uppercase tracking-wider">
                          DÉJÀ PAYÉ
                        </p>
                        <p className="text-emerald-700 font-mono font-black text-xs md:text-sm">
                          {tuitionInfo.paid.toLocaleString()} FCFA
                        </p>
                      </div>

                      <div className="text-right">
                        <p className={`${tuitionInfo.isSolde ? 'text-emerald-700' : 'text-rose-700'} text-[8px] md:text-[9px] font-black uppercase tracking-wider`}>
                          RESTE
                        </p>
                        <p className={`${tuitionInfo.isSolde ? 'text-emerald-700' : 'text-rose-700'} font-mono font-black text-xs md:text-sm`}>
                          {tuitionInfo.remainder.toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 p-0.5 border border-slate-300/60 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          tuitionInfo.isSolde 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                            : 'bg-gradient-to-r from-blue-600 to-emerald-500'
                        }`}
                        style={{ width: `${tuitionInfo.percentage}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center mt-1 text-[9px] font-bold">
                      <span className="text-slate-600">Payé : {tuitionInfo.percentage}%</span>
                      <span className={`uppercase ${tuitionInfo.isSolde ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {tuitionInfo.isSolde ? '✓ Situation régularisée' : `Reste : ${tuitionInfo.remainder.toLocaleString()} FCFA`}
                      </span>
                    </div>
                  </div>

                  {/* Student Info & Action Button */}
                  <div className="border-t border-blue-300/80 pt-1.5 flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-blue-800 text-[8px] font-black tracking-widest uppercase">
                          ÉLÈVE
                        </p>
                        <p className="text-blue-950 font-black text-xs truncate max-w-[170px]">
                          {student.name}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-blue-800 text-[8px] font-black tracking-widest uppercase">
                          MATRICULE & CLASSE
                        </p>
                        <p className="text-blue-950 font-mono font-bold text-xs">
                          {student.studentId} • <span className="font-sans font-extrabold text-blue-900">{student.class}</span>
                        </p>
                      </div>
                    </div>

                    {/* Interactive Button to go to Croissance (Insights) - Desktop (PC) only */}
                    <button
                      onClick={goToCroissancePage}
                      className="hidden md:flex w-full py-1.5 px-3 bg-blue-700 hover:bg-blue-800 active:scale-98 text-white font-black text-xs rounded-xl shadow-md items-center justify-center gap-2 transition-all cursor-pointer group"
                      title="Ouvrir la gestion des paiements et relances dans Croissance"
                    >
                      <MessageSquare size={14} className="shrink-0" />
                      <span>Ouvrir dans Croissance (Encaissement & Relance)</span>
                      <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform shrink-0" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Pagination Dots Indicator */}
      <div className="flex justify-center items-center space-x-2 mt-3 mb-2">
        <button
          onClick={() => setActiveIndex(0)}
          className={`h-2 rounded-full transition-all duration-300 ${
            activeIndex === 0 ? 'w-7 bg-sky-500 shadow-sm' : 'w-2 bg-slate-300 hover:bg-slate-400'
          }`}
          title="Carte Étudiant"
        />
        {!shouldHideTuition && (
          <button
            onClick={() => setActiveIndex(1)}
            className={`h-2 rounded-full transition-all duration-300 ${
              activeIndex === 1 ? 'w-7 bg-emerald-500 shadow-sm' : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
            title="Situation Scolarité"
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showConfirmDelete && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowConfirmDelete(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 shadow-2xl z-10 w-full max-w-sm text-center flex flex-col items-center relative overflow-hidden"
            >
              <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-3">
                <Trash2 size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Supprimer l'élève ?</h3>
              <p className="text-gray-500 mb-6 text-xs font-medium">
                Êtes-vous sûr de vouloir supprimer <span className="font-bold text-gray-700">{student.name}</span> ?
              </p>
              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 py-3 rounded-2xl font-bold text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowConfirmDelete(false);
                    onDelete?.();
                  }}
                  className="flex-1 py-3 rounded-2xl font-bold text-xs bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
