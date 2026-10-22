import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  GraduationCap, 
  Award, 
  CheckCircle, 
  School, 
  Pencil, 
  X, 
  Camera, 
  Upload, 
  Check, 
  Phone, 
  Calendar as CalendarIcon, 
  User as UserIcon,
  Sparkles,
  Save,
  TrendingUp,
  Copy,
  ShieldCheck,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PatternWaves from './PatternWaves';
import ReflectiveCard from './ReflectiveCard';
import { compressImage } from '../src/utils/userUtils';
import { saveRealtimeDocument, deleteRealtimeDocument } from '../src/services/firebaseService';
import { getSubjectCoef } from './TransactionList';

interface CardDashboardProps {
  onBack?: () => void;
  currentUser?: any;
  student?: any;
  onUpdateStudent?: (student: any) => void;
  onUpdateUser?: (user: any) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export default function CardDashboard({ 
  onBack, 
  currentUser,
  student,
  onUpdateStudent,
  onUpdateUser,
  onDeleteStudent
}: CardDashboardProps) {
  // Récupération des informations scolaires de l'élève ou utilisateur
  const isTeacherUser = currentUser?.role === 'teacher' || currentUser?.accessLevel === 3;

  const [displayName, setDisplayName] = useState(
    isTeacherUser ? (currentUser?.name || 'Professeur') : (student?.name || currentUser?.name || 'Kouamé Jean-Marc')
  );
  const [displayClass, setDisplayClass] = useState(
    isTeacherUser ? (currentUser?.subject ? `Professeur de ${currentUser.subject}` : 'Corps Enseignant') : (student?.class || currentUser?.assignedClass || 'Terminale D1')
  );
  const [displayMatricule, setDisplayMatricule] = useState(
    isTeacherUser ? (currentUser?.matricule || currentUser?.id || 'PROF-001') : (student?.studentId || student?.matricule || currentUser?.matricule || '2024-TD1')
  );
  const [displayStatus, setDisplayStatus] = useState<string>(
    isTeacherUser ? 'Certifié' : (student?.assignedStatus === 'non_affecte' ? 'Non Affecté' : 'Affecté (Régulier)')
  );
  const [displayAvatar, setDisplayAvatar] = useState(
    isTeacherUser ? (currentUser?.photo || currentUser?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop') : (student?.photo || student?.photoUrl || currentUser?.photo || currentUser?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop')
  );
  const [displayPhone, setDisplayPhone] = useState(
    isTeacherUser ? (currentUser?.phone || currentUser?.parentPhone || '+225 07 00 00 00 00') : (student?.studentPhone || currentUser?.phone || '+225 07 00 00 00 00')
  );
  const [displayBirthDate, setDisplayBirthDate] = useState(
    student?.birthDate || '2006-05-14'
  );

  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const canDeleteStudent = Boolean(
    !isTeacherUser && 
    student && 
    (currentUser?.role === 'teacher' || 
     currentUser?.role === 'professeur' || 
     currentUser?.role === 'prof' || 
     currentUser?.role === 'admin' || 
     currentUser?.role === 'director' || 
     currentUser?.role === 'educator' || 
     Boolean(currentUser?.isTeacher) || 
     (currentUser?.accessLevel && currentUser.accessLevel >= 2)) &&
    currentUser?.role !== 'parent' &&
    currentUser?.role !== 'student'
  );

  const handleConfirmDeleteStudent = async () => {
    if (!student?.id) return;
    setShowDeleteModal(false);
    const sId = String(student.id);
    if (onDeleteStudent) {
      onDeleteStudent(sId);
    } else {
      try {
        const saved = localStorage.getItem('school_db_students');
        if (saved) {
          const list = JSON.parse(saved);
          localStorage.setItem('school_db_students', JSON.stringify(list.filter((s: any) => String(s.id) !== sId && String(s.studentId) !== sId)));
        }
      } catch (e) {}
      await deleteRealtimeDocument('students', sId).catch(console.error);
    }
    if (onBack) {
      onBack();
    } else {
      window.dispatchEvent(new CustomEvent('navigate', { detail: 'students' }));
    }
  };

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard && displayPhone) {
      navigator.clipboard.writeText(displayPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  // Sync state if currentUser or student changes
  useEffect(() => {
    if (isTeacherUser && currentUser) {
      if (currentUser.name) setDisplayName(currentUser.name);
      if (currentUser.subject) setDisplayClass(`Professeur de ${currentUser.subject}`);
      if (currentUser.matricule || currentUser.id) setDisplayMatricule(currentUser.matricule || currentUser.id);
      setDisplayStatus('Certifié');
      if (currentUser.photo || currentUser.photoUrl) setDisplayAvatar(currentUser.photo || currentUser.photoUrl);
      if (currentUser.phone || currentUser.parentPhone || currentUser.studentPhone) setDisplayPhone(currentUser.phone || currentUser.parentPhone || currentUser.studentPhone);
    } else if (student) {
      if (student.name) setDisplayName(student.name);
      if (student.class) setDisplayClass(student.class);
      if (student.studentId || student.matricule) setDisplayMatricule(student.studentId || student.matricule);
      if (student.assignedStatus) setDisplayStatus(student.assignedStatus === 'non_affecte' ? 'Non Affecté' : 'Affecté (Régulier)');
      if (student.photo || student.photoUrl) setDisplayAvatar(student.photo || student.photoUrl);
      if (student.studentPhone) setDisplayPhone(student.studentPhone);
      if (student.birthDate) setDisplayBirthDate(student.birthDate);
    }
  }, [currentUser, student, isTeacherUser]);

  // Moyenne générale réelle de l'élève (calculée avec les vraies notes et coefficients officiels)
  const realAverageData = React.useMemo(() => {
    // 1. Si des moyennes trimestrielles réelles existent (enregistrées via le relevé ou tableau de bord)
    if (student?.trimesters && typeof student.trimesters === 'object') {
      const trimList = Object.values(student.trimesters);
      const validTrims = trimList.filter((t: any) => typeof t?.average === 'number' && t.average > 0);
      if (validTrims.length > 0) {
        const sum = validTrims.reduce((acc: number, t: any) => acc + t.average, 0);
        const avg = sum / validTrims.length;
        return {
          display: `${avg.toFixed(2)}/20`,
          numValue: avg,
          hasGrades: true,
          label: 'Moyenne réelle'
        };
      }
    }

    // 2. Calculer à partir des vraies matières et des vraies notes (grades) de l'élève
    const subjects = student?.subjects;
    if (Array.isArray(subjects) && subjects.length > 0) {
      let totalWeightedPoints = 0;
      let totalEffectiveCoef = 0;
      let evaluatedCount = 0;

      subjects.forEach((sub: any) => {
        let subAvg: number | null = null;
        if (Array.isArray(sub.grades) && sub.grades.length > 0) {
          let sumGrades = 0;
          let sumCoefs = 0;
          sub.grades.forEach((g: any) => {
            const sc = Number(g.score);
            const cf = Number(g.coef || 1);
            if (!isNaN(sc)) {
              sumGrades += sc * cf;
              sumCoefs += cf;
            }
          });
          if (sumCoefs > 0) {
            subAvg = sumGrades / sumCoefs;
          }
        } else if (typeof sub.average === 'number' && sub.average > 0) {
          subAvg = sub.average;
        }

        if (subAvg !== null) {
          const coef = getSubjectCoef(displayClass || student?.class, sub.name);
          if (coef > 0) {
            totalWeightedPoints += subAvg * coef;
            totalEffectiveCoef += coef;
            evaluatedCount++;
          } else {
            // Matière facultative / bonus : points au-dessus de 10
            if (subAvg > 10) totalWeightedPoints += (subAvg - 10);
          }
        }
      });

      if (totalEffectiveCoef > 0 && evaluatedCount > 0) {
        const avg = totalWeightedPoints / totalEffectiveCoef;
        return {
          display: `${avg.toFixed(2)}/20`,
          numValue: avg,
          hasGrades: true,
          label: 'Moyenne réelle'
        };
      }
    }

    // 3. Aucune note réelle n'a encore été saisie pour cet élève
    return {
      display: '--/20',
      numValue: null,
      hasGrades: false,
      label: 'En attente de notes'
    };
  }, [student, displayClass]);

  // Taux de réussite réel de l'élève (matières avec note >= 10/20)
  const realSuccessRate = React.useMemo(() => {
    const subjects = student?.subjects;
    if (Array.isArray(subjects) && subjects.length > 0) {
      const evaluated = subjects.filter((s: any) => {
        if (Array.isArray(s.grades) && s.grades.length > 0) return true;
        return typeof s.average === 'number' && s.average > 0;
      });

      if (evaluated.length > 0) {
        const passed = evaluated.filter((s: any) => {
          let avg = s.average;
          if (Array.isArray(s.grades) && s.grades.length > 0) {
            const sum = s.grades.reduce((a: number, g: any) => a + Number(g.score || 0) * Number(g.coef || 1), 0);
            const coefs = s.grades.reduce((a: number, g: any) => a + Number(g.coef || 1), 0);
            avg = coefs > 0 ? sum / coefs : 0;
          }
          return (avg || 0) >= 10;
        }).length;
        const pct = Math.round((passed / evaluated.length) * 100);
        return {
          rate: `${pct}%`,
          subtext: `${passed}/${evaluated.length} matière${passed > 1 ? 's' : ''} validée${passed > 1 ? 's' : ''}`
        };
      }
    }

    if (realAverageData.hasGrades && realAverageData.numValue !== null) {
      const pct = Math.min(100, Math.max(0, Math.round((realAverageData.numValue / 20) * 100)));
      return {
        rate: `${pct}%`,
        subtext: realAverageData.numValue >= 10 ? 'Admis(e)' : 'En progression'
      };
    }

    return {
      rate: '--',
      subtext: 'En attente d\'évaluation'
    };
  }, [student, realAverageData]);

  // Modal d'édition de carte
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: displayName,
    class: displayClass,
    matricule: displayMatricule,
    assignedStatus: displayStatus.includes('Non') ? 'non_affecte' : 'affecte',
    avatarUrl: displayAvatar,
    phone: displayPhone,
    birthDate: displayBirthDate
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenEditModal = () => {
    setEditForm({
      name: displayName,
      class: displayClass,
      matricule: displayMatricule,
      assignedStatus: displayStatus.includes('Non') ? 'non_affecte' : 'affecte',
      avatarUrl: displayAvatar,
      phone: displayPhone,
      birthDate: displayBirthDate
    });
    setIsEditModalOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImage(file, 400, 400, 0.85);
        setEditForm(prev => ({ ...prev, avatarUrl: compressed }));
      } catch (err) {
        console.error('Error compressing image:', err);
      }
    }
  };

  const handleSaveCard = async () => {
    setIsSaving(true);
    try {
      const updatedName = editForm.name.trim() || displayName;
      const updatedClass = editForm.class.trim() || displayClass;
      const updatedMatricule = editForm.matricule.trim() || displayMatricule;
      const updatedStatus = isTeacherUser ? 'Certifié' : (editForm.assignedStatus === 'non_affecte' ? 'Non Affecté' : 'Affecté (Régulier)');
      const updatedAvatar = editForm.avatarUrl || displayAvatar;
      const updatedPhone = editForm.phone.trim() || displayPhone;
      const updatedBirthDate = editForm.birthDate || displayBirthDate;

      // Update local card view state
      setDisplayName(updatedName);
      setDisplayClass(updatedClass);
      setDisplayMatricule(updatedMatricule);
      setDisplayStatus(updatedStatus);
      setDisplayAvatar(updatedAvatar);
      setDisplayPhone(updatedPhone);
      setDisplayBirthDate(updatedBirthDate);

      // Prepare updated student object
      const currentStudentId = student?.id || currentUser?.id || 'st-default';
      const updatedStudentObj = {
        ...(student || {}),
        id: currentStudentId,
        name: updatedName,
        class: updatedClass,
        studentId: updatedMatricule,
        matricule: updatedMatricule,
        assignedStatus: editForm.assignedStatus,
        photo: updatedAvatar,
        photoUrl: updatedAvatar,
        studentPhone: updatedPhone,
        birthDate: updatedBirthDate
      };

      // 1. Call onUpdateStudent if provided
      if (onUpdateStudent) {
        onUpdateStudent(updatedStudentObj);
      }

      // 2. Call onUpdateUser if provided and current user matches
      if (onUpdateUser && currentUser) {
        const updatedUser = {
          ...currentUser,
          name: updatedName,
          assignedClass: updatedClass,
          matricule: updatedMatricule,
          photo: updatedAvatar,
          photoUrl: updatedAvatar,
          phone: updatedPhone
        };
        onUpdateUser(updatedUser);
      }

      // 3. Update school_db_students in localStorage
      try {
        const savedStudentsStr = localStorage.getItem('school_db_students');
        let studentsList: any[] = savedStudentsStr ? JSON.parse(savedStudentsStr) : [];
        if (Array.isArray(studentsList)) {
          let found = false;
          studentsList = studentsList.map(st => {
            const isMatch = 
              String(st.id) === String(currentStudentId) ||
              (st.studentId && updatedMatricule && String(st.studentId).toLowerCase() === updatedMatricule.toLowerCase()) ||
              (st.matricule && updatedMatricule && String(st.matricule).toLowerCase() === updatedMatricule.toLowerCase()) ||
              (st.name && st.name.toLowerCase() === displayName.toLowerCase());
            if (isMatch) {
              found = true;
              return { ...st, ...updatedStudentObj };
            }
            return st;
          });
          if (!found) {
            studentsList.push(updatedStudentObj);
          }
          localStorage.setItem('school_db_students', JSON.stringify(studentsList));
        }
      } catch (err) {}

      // 4. Update session storage if current user is student
      const sessionKeys = ['school_user_session', 'school_user'];
      sessionKeys.forEach(k => {
        const s = localStorage.getItem(k);
        if (s) {
          try {
            const u = JSON.parse(s);
            if (u) {
              u.name = updatedName;
              u.assignedClass = updatedClass;
              u.matricule = updatedMatricule;
              u.photo = updatedAvatar;
              u.photoUrl = updatedAvatar;
              u.phone = updatedPhone;
              localStorage.setItem(k, JSON.stringify(u));
            }
          } catch (e) {}
        }
      });

      // 5. Save to Firestore Realtime DB
      try {
        await saveRealtimeDocument('students', String(currentStudentId), updatedStudentObj);
        if (currentUser?.id) {
          await saveRealtimeDocument('users', String(currentUser.id), {
            ...currentUser,
            name: updatedName,
            assignedClass: updatedClass,
            matricule: updatedMatricule,
            photo: updatedAvatar,
            photoUrl: updatedAvatar,
            phone: updatedPhone
          });
        }
      } catch (e) {
        console.warn('Realtime Firestore sync notice:', e);
      }

      // 6. Dispatch events
      window.dispatchEvent(new CustomEvent('student-registered', { detail: updatedStudentObj }));
      window.dispatchEvent(new CustomEvent('school_user_updated', { detail: updatedStudentObj }));

      setIsEditModalOpen(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } catch (err) {
      console.error('Error saving profile card:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#120f17] text-white font-sans relative overflow-hidden">
      {/* PatternWaves Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-auto">
        <PatternWaves
          preset="silk"
          color="#6bd4ff"
          backgroundColor="#120f17"
          fade="edges"
          interactive
          cursorSize={50}
          cursorStrength={0.6}
          pattern="dot"
          wave="silk"
          spacing={9}
          markSize={0.95}
          depth={0.95}
          light={0}
          shine={0.8}
          contrast={1.2}
          speed={0.35}
          scale={1}
          direction={20}
          opacity={1}
          fadeSize={0.5}
          characters=".:-=+*#%@"
          intro
          paused={false}
          className="w-full h-full"
        />
      </div>

      <div 
        className="relative z-10 w-full h-full overflow-y-auto overflow-x-hidden"
        style={{
          paddingBottom: 'max(3.5rem, calc(2rem + env(safe-area-inset-bottom, 0px)))'
        }}
      >
        <div 
          className="max-w-[500px] mx-auto w-full"
          style={{
            paddingTop: 'max(1.75rem, calc(0.75rem + env(safe-area-inset-top, 0px)))'
          }}
        >
          {/* Header */}
          <div className="px-4 sm:px-6 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button 
                onClick={onBack}
                className="w-11 h-11 rounded-[16px] bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/20 flex items-center justify-center hover:bg-white/30 dark:hover:bg-white/20 transition-colors shadow-lg cursor-pointer active:scale-95 shrink-0"
                title="Retour à Terminale-D"
              >
                <ChevronLeft className="text-white w-6 h-6" />
              </button>
              <div className="flex flex-col min-w-0 flex-1">
                <h1 className="text-[20px] font-bold text-white tracking-wide truncate">{isTeacherUser ? 'Carte Professionnelle' : 'Ma carte scolaire'}</h1>
                <p className="text-slate-300 text-[12px] truncate">{isTeacherUser ? 'Badge officiel d\'identification enseignant' : 'Carte d\'identification et profil'}</p>
              </div>
            </div>
          </div>

          {/* Interactive Profile Card with fluid 3D Flip */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center px-4 sm:px-6 w-full"
          >
            {/* 3D Flip Card Container */}
            <div 
              onClick={() => setIsFlipped(prev => !prev)}
              className="relative cursor-pointer select-none mx-auto w-full max-w-[340px]"
              style={{ height: 385, perspective: 1200 }}
              title="Toucher pour retourner la carte"
            >
              <motion.div
                className="w-full h-full relative"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 22 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* RECTO (FACE AVANT) */}
                <div 
                  className="absolute inset-0 w-full h-full flex justify-center items-center"
                  style={{ 
                    backfaceVisibility: 'hidden', 
                    WebkitBackfaceVisibility: 'hidden' 
                  }}
                >
                  <ReflectiveCard
                    className="reflective-card--compact w-full"
                    name={displayName}
                    role={displayClass}
                    badge={isTeacherUser ? 'Collège Fatoumaba • Enseignant' : 'Collège Fatoumaba'}
                    status={displayStatus}
                    statusColor={displayStatus.includes('Non') ? '#f59e0b' : '#22c55e'}
                    idLabel={isTeacherUser ? 'Expertise' : 'Matricule'}
                    idValue={
                      isTeacherUser ? (
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
                      ) : (
                        displayMatricule
                      )
                    }
                    avatar={displayAvatar}
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
                    enableTilt={!isFlipped}
                    intro
                    width="100%"
                    height={385}
                  />
                </div>

                {/* VERSO (FACE ARRIÈRE) */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-[24px] overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0b1329] border-2 border-[#BFDBFE]/80 shadow-[0_20px_45px_-15px_rgba(29,78,216,0.45),0_0_24px_rgba(191,219,254,0.35)] flex flex-col justify-between p-4 text-white"
                  style={{ 
                    backfaceVisibility: 'hidden', 
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)' 
                  }}
                >
                  {/* En-tête officiel République & Établissement */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center font-bold text-xs">
                        CF
                      </div>
                      <div className="min-w-0">
                        <span className="text-[9px] font-black tracking-widest text-amber-300 uppercase block truncate">
                          RÉPUBLIQUE DE CÔTE D'IVOIRE
                        </span>
                        <span className="text-[11px] font-bold text-white tracking-wide block truncate">
                          Collège & Lycée Fatoumaba
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md border border-white/15 shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[9px] font-bold text-slate-200">VERSO</span>
                    </div>
                  </div>

                  {/* Section Numéro de téléphone bien mise en valeur */}
                  <div className="bg-sky-500/15 border border-sky-400/30 rounded-2xl p-2.5 flex items-center justify-between shadow-inner min-w-0">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-500 text-white flex items-center justify-center shadow-md shrink-0">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[9px] font-extrabold uppercase tracking-wider text-sky-300 block truncate">
                          {isTeacherUser ? 'Téléphone Professionnel' : 'Numéro de l\'Élève'}
                        </span>
                        <span className="text-[14px] font-black text-white font-mono tracking-wide block truncate">
                          {displayPhone || '+225 07 00 00 00 00'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={handleCopyPhone}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                        title="Copier le numéro"
                      >
                        {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a 
                        href={`tel:${(displayPhone || '').replace(/\s+/g, '')}`}
                        className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors cursor-pointer"
                        title="Appeler"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Détails supplémentaires sans rien enlever */}
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2 min-w-0 overflow-hidden">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                        {isTeacherUser ? 'Contact d\'urgence' : 'Téléphone Parent / Tuteur'}
                      </span>
                      <span className="text-[11px] font-bold text-slate-100 font-mono block truncate mt-0.5">
                        {student?.parentPhone || student?.fatherPhone || student?.motherPhone || '+225 01 02 03 04 05'}
                      </span>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-2 min-w-0 overflow-hidden">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                        Date de naissance
                      </span>
                      <span className="text-[11px] font-bold text-slate-100 block truncate mt-0.5">
                        {displayBirthDate || '14/05/2006'}
                      </span>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-2 min-w-0 overflow-hidden">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                        {isTeacherUser ? 'Matricule Enseignant' : 'Matricule Scolaire'}
                      </span>
                      <span className="text-[11px] font-black text-sky-300 font-mono block truncate mt-0.5">
                        {displayMatricule}
                      </span>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-2 min-w-0 overflow-hidden">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                        Statut & Validité
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 block truncate mt-0.5">
                        {displayStatus} • 2024-2025
                      </span>
                    </div>
                  </div>

                  {/* Code barre officiel & Sceau de sécurité */}
                  <div className="border-t border-white/10 pt-2 flex flex-col items-center">
                    <div className="bg-white px-3 py-1 rounded-lg w-full flex flex-col items-center shadow-xs">
                      <div className="flex items-center justify-center gap-[2px] h-6 w-full max-w-[240px]">
                        {[3,1,2,1,4,1,2,3,1,2,1,4,2,1,3,1,2,4,1,3,2,1,4,1,2,3,1,2,1,3,2,1,4,1,2,3,1,2,4,1,2,3,1,4].map((w, idx) => (
                          <span 
                            key={idx} 
                            className="bg-slate-900 inline-block h-full" 
                            style={{ width: `${w}px` }} 
                          />
                        ))}
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-800 tracking-[0.25em] mt-0.5">
                        *{displayMatricule}*
                      </span>
                    </div>
                    <p className="text-[8px] text-slate-400 text-center leading-tight mt-1.5 px-2">
                      Carte officielle d'identification. En cas de perte, merci de la rapporter à la direction.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bouton d'action sous la carte */}
            <div className="mt-4 flex flex-col items-center gap-2.5 w-full max-w-[340px] mx-auto">

              <button
                onClick={handleOpenEditModal}
                className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-[18px] bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-[13px] shadow-xl shadow-sky-500/20 border border-sky-400/30 transition-all cursor-pointer active:scale-98"
              >
                <Pencil className="w-4 h-4" />
                <span>Modifier les informations de ma carte</span>
              </button>

              {canDeleteStudent && (
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-[18px] bg-red-500/15 hover:bg-red-500/25 text-red-300 font-bold text-[13px] border border-red-500/30 transition-all cursor-pointer active:scale-98"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>Supprimer la carte de l'élève</span>
                </button>
              )}
            </div>
          </motion.div>

          {/* Delete Student Modal */}
          <AnimatePresence>
            {showDeleteModal && (
              <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => setShowDeleteModal(false)}
                />
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl z-10 w-full max-w-sm text-center flex flex-col items-center relative overflow-hidden"
                >
                  <div className="w-14 h-14 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-3">
                    <Trash2 size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">Supprimer la carte de l'élève ?</h3>
                  <p className="text-slate-300 mb-6 text-xs font-medium">
                    Êtes-vous sûr de vouloir supprimer la carte de <span className="font-bold text-white">{displayName}</span> ? Cette action est irréversible.
                  </p>
                  <div className="flex w-full gap-3">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 py-3 rounded-2xl font-bold text-xs bg-white/10 text-slate-300 hover:bg-white/20 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleConfirmDeleteStudent}
                      className="flex-1 py-3 rounded-2xl font-bold text-xs bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                    >
                      Supprimer
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Success Toast */}
          <AnimatePresence>
            {showSuccessToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-4 sm:mx-6 mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md rounded-2xl flex items-center gap-3 text-emerald-200 text-xs font-semibold shadow-lg"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <Check size={14} strokeWidth={3} />
                </div>
                <span>Informations de la carte mises à jour et synchronisées avec succès !</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Informations scolaires de l'établissement */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="px-4 sm:px-6 mt-6 pb-10 w-full max-w-[372px] sm:max-w-[500px] mx-auto"
          >
            {isTeacherUser ? (
              <div className="grid grid-cols-2 gap-3.5">
                {/* Discipline */}
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-[24px] p-4 border border-white/15 dark:border-white/10 shadow-lg flex flex-col justify-between min-h-[110px] min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase truncate">Discipline</span>
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[18px] font-black tracking-tight text-white leading-none truncate block">
                      {currentUser?.subject || 'Mathématiques'}
                    </span>
                    <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1 truncate">Matière principale</p>
                  </div>
                </div>

                {/* Taux de compréhension */}
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-[24px] p-4 border border-white/15 dark:border-white/10 shadow-lg flex flex-col justify-between min-h-[110px] min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase truncate">Taux de compréhension</span>
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[20px] font-black tracking-tight text-white leading-none truncate block">
                      100%
                    </span>
                    <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1 truncate">Performance pédagogique</p>
                  </div>
                </div>

                {/* Expertise */}
                <div className="bg-emerald-500/10 backdrop-blur-xl rounded-[24px] p-4 border border-emerald-500/30 shadow-lg flex flex-col justify-between min-h-[110px] min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold tracking-wider text-emerald-300 uppercase truncate">Expertise</span>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[18px] font-black tracking-tight text-emerald-300 leading-none truncate block">
                      Légendaire
                    </span>
                    <p className="text-[10px] text-emerald-300/80 font-semibold tracking-wider uppercase mt-1 truncate">Niveau d'excellence</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-amber-500/10 backdrop-blur-xl rounded-[24px] p-4 border border-amber-500/30 shadow-lg flex flex-col justify-between min-h-[110px] min-w-0 overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold tracking-wider text-amber-300 uppercase truncate">Contact</span>
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[15px] font-bold tracking-tight text-amber-300 leading-none truncate block">
                      {displayPhone}
                    </span>
                    <p className="text-[10px] text-amber-300/80 font-semibold tracking-wider uppercase mt-1 truncate">Téléphone professionnel</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
              {/* Moyenne réelle */}
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-[24px] p-4 border border-white/15 dark:border-white/10 shadow-lg flex flex-col justify-between min-h-[110px] min-w-0 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase truncate">Moyenne</span>
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="min-w-0">
                  <span className="text-[20px] font-black tracking-tight text-white leading-none truncate block">
                    {realAverageData.display}
                  </span>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1 truncate">
                    {realAverageData.label}
                  </p>
                </div>
              </div>

              {/* Matricule */}
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-[24px] p-4 border border-white/15 dark:border-white/10 shadow-lg flex flex-col justify-between min-h-[110px] min-w-0 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase truncate">Matricule</span>
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div className="min-w-0">
                  <span className="text-[19px] font-mono font-black tracking-tight text-white leading-none truncate block">
                    {displayMatricule}
                  </span>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1 truncate">Identifiant élève</p>
                </div>
              </div>

              {/* Taux de réussite */}
              <div className="bg-emerald-500/10 backdrop-blur-xl rounded-[24px] p-4 border border-emerald-500/30 shadow-lg flex flex-col justify-between min-h-[110px] min-w-0 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-wider text-emerald-300 uppercase truncate">Taux de réussite</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="min-w-0">
                  <span className="text-[20px] font-black tracking-tight text-emerald-300 leading-none truncate block">
                    {realSuccessRate.rate}
                  </span>
                  <p className="text-[10px] text-emerald-300/80 font-semibold tracking-wider uppercase mt-1 truncate">
                    {realSuccessRate.subtext}
                  </p>
                </div>
              </div>

              {/* Régime / Statut */}
              <div className="bg-amber-500/10 backdrop-blur-xl rounded-[24px] p-4 border border-amber-500/30 shadow-lg flex flex-col justify-between min-h-[110px] min-w-0 overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-wider text-amber-300 uppercase truncate">Régime</span>
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                    <School className="w-4 h-4" />
                  </div>
                </div>
                <div className="min-w-0">
                  <span className="text-[17px] font-black tracking-tight text-amber-300 leading-none truncate block">
                    {displayStatus}
                  </span>
                  <p className="text-[10px] text-amber-300/80 font-semibold tracking-wider uppercase mt-1 truncate">Année 2025-2026</p>
                </div>
              </div>
            </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Edit Profile Card Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[120] flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
              onClick={() => setIsEditModalOpen(false)}
            />

            <motion.div 
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="relative bg-slate-900 border border-slate-700/80 rounded-t-[2.5rem] sm:rounded-3xl p-6 pb-8 w-full max-w-lg max-h-[90vh] shadow-2xl flex flex-col z-10 text-white overflow-hidden"
            >
              {/* Drawer handle */}
              <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 shrink-0 sm:hidden" />

              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                    <Pencil className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-tight">Modifier ma Carte Profil</h2>
                    <p className="text-xs text-slate-400">Personnalisez vos informations d'identification</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1 py-4 flex-1">
                {/* Photo de profil */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60">
                  <div className="relative group mb-3">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-sky-400 shadow-lg bg-slate-800">
                      <img 
                        src={editForm.avatarUrl} 
                        alt={editForm.name}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <label 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity rounded-2xl"
                    >
                      <Camera size={20} />
                      <span className="text-[10px] font-bold mt-1">Changer</span>
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="py-2 px-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                    >
                      <Upload size={14} />
                      <span>Uploader une photo</span>
                    </button>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </div>
                </div>

                {/* Nom complet */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Nom & Prénom
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <UserIcon size={16} />
                    </div>
                    <input 
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Ex: Kouamé Jean-Marc"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Classe & Matricule */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Classe
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <GraduationCap size={16} />
                      </div>
                      <input 
                        type="text"
                        value={editForm.class}
                        onChange={e => setEditForm({ ...editForm, class: e.target.value })}
                        placeholder="Ex: Terminale D1"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Matricule
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Award size={16} />
                      </div>
                      <input 
                        type="text"
                        value={editForm.matricule}
                        onChange={e => setEditForm({ ...editForm, matricule: e.target.value })}
                        placeholder="Ex: 2024-TD1"
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Statut d'affectation / Certification */}
                {!isTeacherUser ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Statut / Régime
                    </label>
                    <select
                      value={editForm.assignedStatus}
                      onChange={e => setEditForm({ ...editForm, assignedStatus: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
                    >
                      <option value="affecte">Affecté par l'État (Régulier)</option>
                      <option value="non_affecte">Non Affecté (Libre)</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Statut Enseignant
                    </label>
                    <div className="w-full px-3 py-2.5 bg-slate-800 border border-emerald-500/40 rounded-xl text-sm text-emerald-400 font-bold flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Certifié • Validé par l'Établissement</span>
                    </div>
                  </div>
                )}

                {/* Téléphone & Date de naissance */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Téléphone
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Phone size={15} />
                      </div>
                      <input 
                        type="tel"
                        value={editForm.phone}
                        onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                        placeholder="+225 07..."
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Date de Naissance
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <CalendarIcon size={15} />
                      </div>
                      <input 
                        type="date"
                        value={editForm.birthDate}
                        onChange={e => setEditForm({ ...editForm, birthDate: e.target.value })}
                        className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSaveCard}
                  className="flex-1 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span>Enregistrement...</span>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Enregistrer</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
