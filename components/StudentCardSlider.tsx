import React, { useState, useRef } from 'react';
import { compressImage } from '../src/utils/userUtils';
import { 
  PenLine, 
  Trash2, 
  Phone, 
  CheckCircle2, 
  CreditCard, 
  Clock, 
  ArrowRight, 
  MessageSquare, 
  Camera, 
  Copy, 
  Check, 
  ShieldCheck,
  RotateCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Student } from '../types';
import { getCountryConfig } from '../data/countries';
import TiltedCard, { TiltedCardLayer } from './TiltedCard';
import ReflectiveCard from './ReflectiveCard';

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
  schoolName = 'COLLÈGE FAOUMMABA',
  onNavigate,
  hideTuitionCard = false,
  currentUser
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [localPhotoUrl, setLocalPhotoUrl] = useState<string | null>(null);
  const [photoSavedMessage, setPhotoSavedMessage] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);

  React.useEffect(() => {
    setLocalPhotoUrl(null);
  }, [student?.id, student?.photoUrl]);

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await compressImage(file, 400, 400, 0.85);
        setLocalPhotoUrl(dataUrl);

        if (student) {
          student.photoUrl = dataUrl;
        }

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

        // 3. Save to Firestore real-time 'students' collection
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
        setPhotoSavedMessage('Photo mise à jour avec succès !');
        setTimeout(() => {
          setPhotoSavedMessage(null);
        }, 3500);

        if (onPhotoChange) {
          onPhotoChange(dataUrl);
        }

      } catch (err: any) {
        console.warn("Auto-save student photo failed:", err);
      }
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleCopyPhone = (e: React.MouseEvent, phoneToCopy?: string) => {
    e.stopPropagation();
    const phone = phoneToCopy || student?.studentPhone || student?.parentPhone || '+225 07 00 00 00 00';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
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

  const getCardTitle = () => {
    switch (activeIndex) {
      case 0:
        return isCardFlipped ? 'Carte Étudiant (Verso)' : 'Carte Étudiant';
      case 1:
        return 'Situation Scolarité';
      default:
        return 'Carte Étudiant';
    }
  };

  const displayMatricule = student.studentId || (student as any).matricule || '18221955X';
  const displayBirthDate = student.birthDate || '2006-07-10';
  const displayBirthPlace = student.birthPlace || 'Abidjan';
  const displayName = student.name || 'AKIAHI SEKA JASMIN';
  const displayClass = student.class || 'Terminale D1';
  const displayGender = student.gender || 'M';
  const isAffecte = student.assignedStatus !== 'non_affecte';
  const displayPhoto = localPhotoUrl || student.photoUrl || (student as any).photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop';
  const displaySchool = schoolName || 'COLLÈGE FAOUMMABA';

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
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
          <h2 className="text-slate-900 text-lg md:text-xl font-black tracking-wide truncate">
            {getCardTitle()}
          </h2>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 shrink-0">
            {activeIndex + 1} / {totalCards}
          </span>
          {/* Flip button removed */}
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
      <div className="relative w-full aspect-[1.58/1] min-h-[224px] rounded-3xl group">
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
              /* CARD 1: CARTE ÉTUDIANT (ReflectiveCard horizontal bleu clair #BFDBFE) */
              <motion.div
                key="card-student"
                initial={{ opacity: 0, x: -60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 60 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full h-full"
              >
                <ReflectiveCard
                  className="reflective-card--horizontal"
                  name={displayName}
                  role={displayClass}
                  gender={displayGender === 'F' ? 'Féminin (F)' : 'Masculin (M)'}
                  badge={displaySchool || 'Collège Fatoumaba'}
                  status={isAffecte ? 'Affecté (État)' : 'Non Affecté'}
                  statusColor={isAffecte ? '#22c55e' : '#f59e0b'}
                  idLabel="Matricule"
                  idValue={displayMatricule}
                  avatar={displayPhoto}
                  onAvatarClick={!readOnly ? () => photoInputRef.current?.click() : undefined}
                  webcam={false}
                  theme="blue"
                  tint="#BFDBFE"
                  metalness={0.9}
                  roughness={0.25}
                  blurStrength={6}
                  shine={1.2}
                  glare={0.6}
                  grayscale={0}
                  warp={0.5}
                  warpScale={1}
                  bevel={3}
                  tiltStrength={12}
                  radius={24}
                  enableTilt={true}
                  intro
                  width="100%"
                  height="100%"
                  onClick={!readOnly && onEdit ? onEdit : undefined}
                />
              </motion.div>
            )}

            {activeIndex === 1 && !shouldHideTuition && (
              /* CARD 2: SITUATION SCOLARITÉ / FRAIS D'ÉTUDES (Carte Crédit Bleu Clair #BFDBFE) */
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
                className="w-full h-full"
              >
                <TiltedCard
                  containerWidth="100%"
                  containerHeight="100%"
                  imageWidth="100%"
                  imageHeight="100%"
                  radius={28}
                  rotateAmplitude={12}
                  scaleOnHover={1.02}
                  glare={0.4}
                  shadow={0.35}
                  gyroscope={true}
                  className="w-full h-full"
                >
                  <div 
                    className="relative w-full h-full rounded-3xl overflow-hidden text-slate-900 p-3.5 md:p-4 flex flex-col justify-between border-2 border-[#93c5fd] shadow-[0_20px_45px_-15px_rgba(29,78,216,0.3),0_0_24px_rgba(191,219,254,0.7)] select-none"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 30%, #BFDBFE 68%, #93c5fd 100%)',
                      boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.95), inset 0 -2px 8px rgba(59, 130, 246, 0.2)'
                    }}
                  >
                    {/* Glossy diagonal sheen reflection */}
                    <div 
                      className="absolute -top-[120%] -left-[50%] w-[200%] h-[200%] pointer-events-none rotate-[28deg] opacity-35"
                      style={{
                        background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.4) 48%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.4) 52%, transparent 100%)'
                      }}
                    />
                    
                    {/* Ambient light orbs */}
                    <div className="absolute -top-12 -right-12 w-48 h-48 bg-sky-300/40 rounded-full filter blur-2xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-blue-300/30 rounded-full filter blur-xl pointer-events-none" />

                    {/* Content Layer */}
                    <div className="relative z-10 w-full h-full flex flex-col justify-between">
                      {/* Top Bar: Brand, EMV Chip & NFC Wave + Status Badge */}
                      <div className="flex justify-between items-start border-b border-blue-900/15 pb-2">
                        <div className="flex items-center gap-2.5">
                          {/* Gold Metallic EMV Smart Chip */}
                          <div className="w-9 h-7 rounded-md bg-gradient-to-tr from-amber-500 via-yellow-200 to-amber-600 border border-amber-300/90 shadow-md p-0.5 relative overflow-hidden flex items-center justify-center shrink-0">
                            <div className="w-full h-full border border-amber-600/40 rounded-[3px] grid grid-cols-2 grid-rows-2 gap-[1px]">
                              <div className="border-r border-b border-amber-700/30" />
                              <div className="border-b border-amber-700/30" />
                              <div className="border-r border-amber-700/30" />
                              <div />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />
                          </div>

                          {/* Contactless Waves */}
                          <svg className="w-4 h-4 text-blue-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M8.5 16.5a5 5 0 0 1 0-7" />
                            <path d="M12 19a8.5 8.5 0 0 0 0-14" />
                            <path d="M15.5 21.5a12 12 0 0 0 0-19" />
                          </svg>

                          <div className="min-w-0">
                            <h3 className="text-slate-900 font-black text-xs md:text-sm tracking-widest uppercase drop-shadow-xs truncate">
                              CARTE SCOLARITÉ
                            </h3>
                            <p className="text-blue-900/80 font-bold text-[8px] md:text-[9px] tracking-wider uppercase truncate">
                              {displaySchool} • 2025-2026
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-md text-white shrink-0 border border-white/40 backdrop-blur-md ${
                          tuitionInfo.isSolde 
                            ? 'bg-emerald-600/95' 
                            : 'bg-rose-600/95 animate-pulse'
                        }`}>
                          {tuitionInfo.isSolde ? (
                            <>
                              <CheckCircle2 size={10} />
                              <span>SOLDÉ</span>
                            </>
                          ) : (
                            <>
                              <Clock size={10} />
                              <span>RESTE DÛ</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Middle Section: Frosted Glass Financial Box */}
                      <div className="my-1 bg-white/75 dark:bg-white/85 backdrop-blur-xl rounded-2xl p-2.5 md:p-3 border border-white/90 shadow-sm text-slate-800">
                        <div className="flex justify-between items-end mb-1.5">
                          <div>
                            <p className="text-slate-500 text-[8px] md:text-[9px] font-bold uppercase tracking-widest truncate">
                              MONTANT TOTAL
                            </p>
                            <p className="text-slate-900 font-mono font-black text-xs md:text-sm tracking-tight truncate">
                              {tuitionInfo.total.toLocaleString()} FCFA
                            </p>
                          </div>

                          <div className="text-center">
                            <p className="text-emerald-700 text-[8px] md:text-[9px] font-bold uppercase tracking-widest truncate">
                              DÉJÀ VERSÉ
                            </p>
                            <p className="text-emerald-600 font-mono font-black text-xs md:text-sm tracking-tight truncate">
                              {tuitionInfo.paid.toLocaleString()} FCFA
                            </p>
                          </div>

                          <div className="text-right">
                            <p className={`${tuitionInfo.isSolde ? 'text-emerald-700' : 'text-rose-700'} text-[8px] md:text-[9px] font-bold uppercase tracking-widest truncate`}>
                              SOLDE RESTANT
                            </p>
                            <p className={`${tuitionInfo.isSolde ? 'text-emerald-600' : 'text-rose-600'} font-mono font-black text-xs md:text-sm tracking-tight truncate`}>
                              {tuitionInfo.remainder.toLocaleString()} FCFA
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200/90 rounded-full h-2 p-0.5 border border-slate-300/40 overflow-hidden shadow-inner">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              tuitionInfo.isSolde 
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.7)]' 
                                : 'bg-gradient-to-r from-blue-500 to-emerald-400 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                            }`}
                            style={{ width: `${tuitionInfo.percentage}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center mt-1 text-[9px] font-bold">
                          <span className="text-slate-600 truncate">Régularisation : {tuitionInfo.percentage}%</span>
                          <span className={`uppercase truncate ${tuitionInfo.isSolde ? 'text-emerald-700 font-black' : 'text-rose-600 font-black'}`}>
                            {tuitionInfo.isSolde ? '✓ Situation soldée' : `Reste : ${tuitionInfo.remainder.toLocaleString()} FCFA`}
                          </span>
                        </div>
                      </div>

                      {/* Cardholder Info & Embossed Card Digits */}
                      <div className="border-t border-blue-900/15 pt-1.5 flex flex-col gap-1.5">
                        <div className="flex justify-between items-end">
                          <div className="min-w-0 flex-1 mr-2">
                            <p className="text-slate-500 text-[7.5px] font-bold tracking-widest uppercase truncate">
                              TITULAIRE DE LA CARTE
                            </p>
                            <p className="text-slate-900 font-black text-xs md:text-sm tracking-wider uppercase truncate" style={{ letterSpacing: '0.04em' }}>
                              {displayName}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-slate-500 text-[7.5px] font-bold tracking-widest uppercase truncate">
                              MATRICULE • CLASSE
                            </p>
                            <p className="text-slate-900 font-mono font-bold text-xs truncate">
                              {displayMatricule} • <span className="font-sans font-extrabold text-blue-700">{displayClass}</span>
                            </p>
                          </div>
                        </div>

                        {/* Interactive Button to go to Croissance (Insights) */}
                        <button
                          onClick={goToCroissancePage}
                          className="hidden md:flex w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-xs rounded-xl shadow-md border border-blue-400 backdrop-blur-md items-center justify-center gap-2 transition-all cursor-pointer group"
                          title="Ouvrir la gestion des paiements et relances dans Croissance"
                        >
                          <CreditCard size={14} className="shrink-0 text-white" />
                          <span className="truncate">Ouvrir dans Croissance (Encaissement &amp; Relance)</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform shrink-0" />
                        </button>
                      </div>
                    </div>
                  </div>
                </TiltedCard>
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
              <h3 className="text-lg font-bold text-gray-800 mb-1">Supprimer la carte de l'élève ?</h3>
              <p className="text-gray-500 mb-6 text-xs font-medium">
                Êtes-vous sûr de vouloir supprimer la carte de <span className="font-bold text-gray-700">{student?.name || displayName}</span> ? Cette action est irréversible.
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
                    if (student?.id) {
                      try {
                        const saved = localStorage.getItem('school_db_students');
                        if (saved) {
                          const list = JSON.parse(saved);
                          localStorage.setItem('school_db_students', JSON.stringify(list.filter((s: any) => String(s.id) !== String(student.id) && String(s.studentId) !== String(student.id))));
                        }
                      } catch (e) {}
                    }
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

export default StudentCardSlider;
