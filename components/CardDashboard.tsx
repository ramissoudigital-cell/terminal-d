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
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PatternWaves from './PatternWaves';
import ReflectiveCard from './ReflectiveCard';
import { compressImage } from '../src/utils/userUtils';
import { saveRealtimeDocument } from '../src/services/firebaseService';
import { getSubjectCoef } from './TransactionList';

interface CardDashboardProps {
  onBack?: () => void;
  currentUser?: any;
  student?: any;
  onUpdateStudent?: (student: any) => void;
  onUpdateUser?: (user: any) => void;
}

export default function CardDashboard({ 
  onBack, 
  currentUser,
  student,
  onUpdateStudent,
  onUpdateUser
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
    isTeacherUser ? 'Enseignant Actif' : (student?.assignedStatus === 'non_affecte' ? 'Non Affecté' : 'Affecté (Régulier)')
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

  // Sync state if currentUser or student changes
  useEffect(() => {
    if (isTeacherUser && currentUser) {
      if (currentUser.name) setDisplayName(currentUser.name);
      if (currentUser.subject) setDisplayClass(`Professeur de ${currentUser.subject}`);
      if (currentUser.matricule || currentUser.id) setDisplayMatricule(currentUser.matricule || currentUser.id);
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
      const updatedStatus = editForm.assignedStatus === 'non_affecte' ? 'Non Affecté' : 'Affecté (Régulier)';
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
          <div className="px-6 flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBack}
                className="w-11 h-11 rounded-[16px] bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/20 flex items-center justify-center hover:bg-white/30 dark:hover:bg-white/20 transition-colors shadow-lg cursor-pointer active:scale-95"
                title="Retour à Terminale-D"
              >
                <ChevronLeft className="text-white w-6 h-6" />
              </button>
              <div className="flex flex-col">
                <h1 className="text-[20px] font-bold text-white tracking-wide">{isTeacherUser ? 'Carte Professionnelle' : 'Ma carte scolaire'}</h1>
                <p className="text-slate-300 text-[12px]">{isTeacherUser ? 'Badge officiel d\'identification enseignant' : 'Carte d\'identification et profil'}</p>
              </div>
            </div>
          </div>

          {/* Interactive Profile Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center px-6"
          >
            <ReflectiveCard
              name={displayName}
              role={displayClass}
              badge={isTeacherUser ? 'Collège Fatoumaba • Enseignant' : 'Collège Fatoumaba'}
              status={displayStatus}
              statusColor={displayStatus.includes('Non') ? '#f59e0b' : '#22c55e'}
              idLabel={isTeacherUser ? 'Matricule Prof.' : 'Matricule'}
              idValue={displayMatricule}
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
              enableTilt
              intro
              width={340}
              height={460}
            />

            {/* Bouton d'action rapide sous la carte */}
            <button
              onClick={handleOpenEditModal}
              className="mt-5 w-full max-w-[340px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-[18px] bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-[13px] shadow-xl shadow-sky-500/20 border border-sky-400/30 transition-all cursor-pointer active:scale-98"
            >
              <Pencil className="w-4 h-4" />
              <span>Modifier les informations de ma carte</span>
            </button>
          </motion.div>

          {/* Success Toast */}
          <AnimatePresence>
            {showSuccessToast && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-6 mt-4 p-3 bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md rounded-2xl flex items-center gap-3 text-emerald-200 text-xs font-semibold shadow-lg"
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
            className="px-6 mt-6 pb-10"
          >
            {isTeacherUser ? (
              <div className="grid grid-cols-2 gap-3.5">
                {/* Discipline */}
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-[24px] p-4 border border-white/15 dark:border-white/10 shadow-lg flex flex-col justify-between min-h-[110px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">Discipline</span>
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[18px] font-black tracking-tight text-white leading-none">
                      {currentUser?.subject || 'Mathématiques'}
                    </span>
                    <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Matière principale</p>
                  </div>
                </div>

                {/* Taux de compréhension */}
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-[24px] p-4 border border-white/15 dark:border-white/10 shadow-lg flex flex-col justify-between min-h-[110px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">Taux de compréhension</span>
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[20px] font-black tracking-tight text-white leading-none">
                      100%
                    </span>
                    <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Performance pédagogique</p>
                  </div>
                </div>

                {/* Expertise */}
                <div className="bg-emerald-500/10 backdrop-blur-xl rounded-[24px] p-4 border border-emerald-500/30 shadow-lg flex flex-col justify-between min-h-[110px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold tracking-wider text-emerald-300 uppercase">Expertise</span>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[18px] font-black tracking-tight text-emerald-300 leading-none truncate block">
                      Légendaire
                    </span>
                    <p className="text-[10px] text-emerald-300/80 font-semibold tracking-wider uppercase mt-1">Niveau d'excellence</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="bg-amber-500/10 backdrop-blur-xl rounded-[24px] p-4 border border-amber-500/30 shadow-lg flex flex-col justify-between min-h-[110px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold tracking-wider text-amber-300 uppercase">Contact</span>
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                      <Phone className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <span className="text-[15px] font-bold tracking-tight text-amber-300 leading-none truncate block">
                      {displayPhone}
                    </span>
                    <p className="text-[10px] text-amber-300/80 font-semibold tracking-wider uppercase mt-1">Téléphone professionnel</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3.5">
              {/* Moyenne réelle */}
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-[24px] p-4 border border-white/15 dark:border-white/10 shadow-lg flex flex-col justify-between min-h-[110px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">Moyenne</span>
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-[20px] font-black tracking-tight text-white leading-none">
                    {realAverageData.display}
                  </span>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
                    {realAverageData.label}
                  </p>
                </div>
              </div>

              {/* Matricule */}
              <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-[24px] p-4 border border-white/15 dark:border-white/10 shadow-lg flex flex-col justify-between min-h-[110px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-wider text-slate-300 uppercase">Matricule</span>
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-[19px] font-mono font-black tracking-tight text-white leading-none">
                    {displayMatricule}
                  </span>
                  <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Identifiant élève</p>
                </div>
              </div>

              {/* Taux de réussite */}
              <div className="bg-emerald-500/10 backdrop-blur-xl rounded-[24px] p-4 border border-emerald-500/30 shadow-lg flex flex-col justify-between min-h-[110px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-wider text-emerald-300 uppercase">Taux de réussite</span>
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-[20px] font-black tracking-tight text-emerald-300 leading-none truncate block">
                    {realSuccessRate.rate}
                  </span>
                  <p className="text-[10px] text-emerald-300/80 font-semibold tracking-wider uppercase mt-1">
                    {realSuccessRate.subtext}
                  </p>
                </div>
              </div>

              {/* Régime / Statut */}
              <div className="bg-amber-500/10 backdrop-blur-xl rounded-[24px] p-4 border border-amber-500/30 shadow-lg flex flex-col justify-between min-h-[110px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold tracking-wider text-amber-300 uppercase">Régime</span>
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <School className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <span className="text-[17px] font-black tracking-tight text-amber-300 leading-none">
                    {displayStatus}
                  </span>
                  <p className="text-[10px] text-amber-300/80 font-semibold tracking-wider uppercase mt-1">Année 2025-2026</p>
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

                {/* Statut d'affectation */}
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
