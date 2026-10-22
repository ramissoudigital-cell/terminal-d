import React, { useState, useRef, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, User, Users, Shield, ShieldCheck, GraduationCap, Coins, Crown, BookOpen, Hash, Calendar, FileCheck, Phone, ChevronDown, Camera, AlertCircle, Loader2, Trash2, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserType, UserRole } from '../types';
import { registerUserAccount, loginUserAccount } from '../src/services/firebaseService';
import { compressImage } from '../src/utils/userUtils';
import { 
  ALL_TEACHING_SUBJECTS, 
  verifySubjectAccreditation, 
  getSubjectAccreditationCode,
  getTeacherIndividualAccreditationCode,
  setTeacherIndividualAccreditationCode,
  normalizeSubjectKey
} from '../src/utils/accreditationUtils';
import { CustomSubjectSelect } from './CustomSubjectSelect';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
}

const CLASSES = [
  { value: "Tle D1", label: "Terminale D1" },
];

const SUBJECTS = [
  { value: "math", label: "Mathématiques" },
  { value: "fr", label: "Français" },
  { value: "en", label: "Anglais" },
  { value: "hg", label: "Histoire-Géographie" },
  { value: "pc", label: "Physique-Chimie" },
  { value: "svt", label: "SVT" },
  { value: "eps", label: "EPS" },
  { value: "art", label: "Arts Plastiques" },
  { value: "mus", label: "Éducation Musicale" }
];

const INITIAL_USERS: UserType[] = [
    { id: 'lvl5-admin', name: 'M. Traoré (Directeur)', role: 'director', accessLevel: 5, pinCode: '9999', faceIdEnabled: true, email: 'admin@ecole.com' },
    { id: 'lvl4-cashier', name: 'Mme. Koffi (Caisse)', role: 'cashier', accessLevel: 4, pinCode: '4444', faceIdEnabled: false, email: 'caisse@ecole.com' },
    { id: 'lvl3-teacher', name: 'Sarah Dubois (Prof)', role: 'teacher', accessLevel: 3, pinCode: '3333', faceIdEnabled: false, subject: 'Mathématiques', email: 'prof@ecole.com' },
    { id: 'lvl2-educator', name: 'M. Koné (Éducateur)', role: 'educator', accessLevel: 2, pinCode: '2222', faceIdEnabled: false, email: 'educateur@ecole.com' },
    { id: 'lvl1-parent', name: 'Famille Kouassi', role: 'parent', accessLevel: 1, pinCode: '1111', faceIdEnabled: false, matricule: '20242543', parentPhone: '0102030405' },
    { id: 'lvl1-student', name: 'Jean Dupont', role: 'student', accessLevel: 1, pinCode: '5555', faceIdEnabled: false, assignedClass: '6ème 1', matricule: '20242543' }
];

interface CustomChildClassSelectProps {
  value: string;
  onChange: (val: string) => void;
}

const CustomChildClassSelect: React.FC<CustomChildClassSelectProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedObj = CLASSES.find(c => c.value === value);

  return (
    <div className="relative">
      <div className="absolute left-[14px] top-1/2 -translate-y-1/2 text-black/40 z-10 pointer-events-none">
        <BookOpen className="w-[15px] h-[15px]" strokeWidth={1.5} />
      </div>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-black/10 rounded-[16px] py-3 pl-[38px] pr-8 text-[13px] text-black font-medium focus:outline-none focus:border-sky-500 transition-colors cursor-pointer flex items-center justify-between shadow-2xs"
      >
        <span className="truncate">{selectedObj ? selectedObj.label : "Choisir..."}</span>
        <ChevronDown className={`w-[14px] h-[14px] text-black/40 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border border-black/10 rounded-[18px] shadow-2xl z-50 max-h-[220px] overflow-y-auto custom-scrollbar py-1.5 animate-in fade-in zoom-in-95 duration-100">
            {CLASSES.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 text-[13px] flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-sky-50 text-sky-900 font-bold' : 'text-black hover:bg-black/5 font-medium'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

interface ProfilePhotoUploaderProps {
  photo: string | null;
  onPhotoChange: (val: string | null) => void;
}

const ProfilePhotoUploader: React.FC<ProfilePhotoUploaderProps> = ({ photo, onPhotoChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsCompressing(true);
        const dataUrl = await compressImage(file, 400, 400, 0.8);
        onPhotoChange(dataUrl);
      } catch (err: any) {
        alert(err.message || "Erreur lors du traitement de la photo.");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  return (
    <div className="w-full mt-2">
      <input 
        type="file" 
        ref={fileInputRef} 
        accept="image/*" 
        className="hidden" 
        onChange={handleFile} 
      />
      
      {photo ? (
        <div className="relative w-full p-3.5 border border-sky-300 bg-sky-50/70 rounded-[20px] flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <img 
              src={photo} 
              alt="Aperçu" 
              className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm" 
            />
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-slate-800">Photo de profil sélectionnée</span>
              <span className="text-[11px] text-emerald-600 font-medium">✓ Enregistrement prêt</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()} 
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Changer
            </button>
            <button 
              type="button" 
              onClick={() => onPhotoChange(null)} 
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors" 
              title="Supprimer la photo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()} 
          className="w-full border border-dashed border-black/20 rounded-[20px] py-5 flex flex-col items-center justify-center text-black/50 hover:bg-black/5 transition-colors cursor-pointer group"
        >
          {isCompressing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
              <span className="text-[12px] font-medium text-sky-700">Traitement de la photo...</span>
            </div>
          ) : (
            <>
              <Camera className="w-6 h-6 mb-1.5 text-black/40 group-hover:scale-110 transition-transform" />
              <span className="text-[13px] font-medium text-black/70">Photo de profil – Cliquez pour ajouter (Optionnel)</span>
              <span className="text-[11px] text-black/40">Image (JPG, PNG, WEBP)</span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'eleve' | 'parent'>('eleve');
  const [userSection, setUserSection] = useState<'Primaire' | 'Secondaire'>('Secondaire');
  const [selectedClass, setSelectedClass] = useState("Tle D1");
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [selectedTeacherClasses, setSelectedTeacherClasses] = useState<string[]>([]);
  const [isTeacherClassDropdownOpen, setIsTeacherClassDropdownOpen] = useState(false);
  const [isAccreditationModalOpen, setIsAccreditationModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [activeLevel, setActiveLevel] = useState("Niveau 1");
  const [accreditationCode, setAccreditationCode] = useState("");
  const [selectedTeacherSubject, setSelectedTeacherSubject] = useState<string>(() => {
    return localStorage.getItem('selected_teacher_subject') || localStorage.getItem('last_teacher_subject') || 'Mathématiques';
  });
  const [showAccreditationPassword, setShowAccreditationPassword] = useState(false);
  const [validatedTeacherAccreditationCode, setValidatedTeacherAccreditationCode] = useState<string>(() => {
    return localStorage.getItem('last_entered_teacher_code') || '';
  });
  const [isTeacherPrincipal, setIsTeacherPrincipal] = useState(false);
  const [teacherPrincipalClass, setTeacherPrincipalClass] = useState('Terminale D');
  const [loginError, setLoginError] = useState("");
  const [authError, setAuthError] = useState("");
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [directorType, setDirectorType] = useState<'Professeur / Enseignant' | 'Prof Principal / Direction'>('Directeur des Études');

  // Parent Multi-Children State
  const [parentChildrenCount, setParentChildrenCount] = useState<number | string>(1);
  const [parentChildrenList, setParentChildrenList] = useState<Array<{ matricule: string; assignedClass: string }>>([
    { matricule: '', assignedClass: '6ème 1' }
  ]);

  const handleChildrenCountChange = (valStr: string) => {
    if (valStr === '') {
      setParentChildrenCount('');
      return;
    }
    const parsed = parseInt(valStr, 10);
    if (isNaN(parsed)) {
      setParentChildrenCount('');
      return;
    }
    setParentChildrenCount(parsed);
    const newCount = Math.max(1, Math.min(10, parsed));
    setParentChildrenList(prev => {
      const list = [...prev];
      if (newCount > list.length) {
        for (let i = list.length; i < newCount; i++) {
          list.push({ matricule: '', assignedClass: '6ème 1' });
        }
      } else {
        return list.slice(0, newCount);
      }
      return list;
    });
  };

  const handleChildrenCountBlur = () => {
    if (parentChildrenCount === '' || Number(parentChildrenCount) < 1) {
      setParentChildrenCount(1);
      if (parentChildrenList.length === 0) {
        setParentChildrenList([{ matricule: '', assignedClass: '6ème 1' }]);
      }
    } else if (Number(parentChildrenCount) > 10) {
      setParentChildrenCount(10);
    }
  };
  
  // Forms State
  const [formData, setFormData] = useState({
      matricule: "",
      firstName: "",
      lastName: "",
      phoneParent: "",
      phoneEleve: "",
      phoneTeacher: "",
      email: "",
      password: "",
      assignedClasses: ""
  });

  const updateForm = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLevelClick = (level: string) => {
    setSelectedLevel(level);
    setAccreditationCode("");
    setLoginError("");
    setAuthError("");
    setShowAccreditationPassword(false);
    if (level === "Niveau 1") {
        setActiveLevel(level);
    } else {
        setIsAccreditationModalOpen(true);
    }
  };
  
  const validateAccreditation = () => {
      setLoginError("");
      const cleanInput = accreditationCode.trim().toUpperCase();

      if (selectedLevel === "Niveau 5") {
          if (!selectedTeacherSubject) {
              setLoginError("Veuillez sélectionner la matière d'enseignement.");
              return;
          }
          if (!cleanInput) {
              setLoginError(`Veuillez saisir votre code d'accréditation pour la matière ${selectedTeacherSubject}.`);
              return;
          }

          // Pour une inscription (!isLogin), l'enseignant peut définir son propre code individuel
          if (!isLogin) {
              if (cleanInput.length < 3) {
                  setLoginError("Le code d'accréditation individuel doit comporter au moins 3 caractères.");
                  return;
              }
          } else {
              const isValid = verifySubjectAccreditation(selectedTeacherSubject, cleanInput);
              if (!isValid) {
                  setLoginError(`Code d'accréditation incorrect pour ${selectedTeacherSubject}. Veuillez vérifier votre code.`);
                  return;
              }
          }

          setActiveLevel(selectedLevel);
          setSelectedSubject(selectedTeacherSubject);
          setValidatedTeacherAccreditationCode(cleanInput);
          try {
              localStorage.setItem('selected_teacher_subject', selectedTeacherSubject);
              localStorage.setItem('last_teacher_subject', selectedTeacherSubject);
              localStorage.setItem('last_entered_teacher_code', cleanInput);
              localStorage.setItem(`teacher_individual_code_${normalizeSubjectKey(selectedTeacherSubject)}`, cleanInput);
          } catch (e) {}
          setIsAccreditationModalOpen(false);
          setAccreditationCode(cleanInput);
          setLoginError("");
          return;
      }

      let storedCode = 'DIR-2024';
      const cleanTarget = storedCode.trim().toUpperCase();

      if (cleanInput !== cleanTarget && cleanInput !== 'ACC-2024' && cleanInput !== 'ADMIN' && cleanInput !== 'DIR-2024' && cleanInput !== 'PROF-2024' && cleanInput !== 'PROF') {
          setLoginError("Code d'accréditation invalide");
          return;
      }
      
      setActiveLevel(selectedLevel);
      setIsAccreditationModalOpen(false);
      setAccreditationCode("");
      setLoginError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthError("");
      setAuthErrorCode(null);
      setIsLoading(true);
      
      let levelNumber = 1;
      let role: UserRole = 'student';
      
      switch(activeLevel) {
          case "Niveau 1": 
             role = 'student';
             levelNumber = 1;
             break;
          case "Niveau 5": 
             role = 'teacher'; 
             levelNumber = 3; 
             break;
          default:
             role = 'student';
             levelNumber = 1;
      }

      try {
        if (isLogin) {
          // Firebase Login
          if (role === 'parent') {
            const firstChildMatricule = parentChildrenList[0]?.matricule.trim() || formData.matricule.trim();
            const identifier = formData.email || formData.phoneParent || firstChildMatricule;
            if (!identifier) {
              setAuthError("Veuillez saisir votre identifiant (Email, Téléphone ou Matricule enfant).");
              setIsLoading(false);
              return;
            }

            const loggedInUser = await loginUserAccount(
              identifier, 
              formData.password || 'ecole2024', 
              role, 
              levelNumber,
              userSection
            );

            // Attach parent children list
            const validChildren = parentChildrenList.filter(c => c.matricule.trim());
            if (validChildren.length > 0) {
              loggedInUser.children = validChildren;
              loggedInUser.childrenCount = validChildren.length;
              loggedInUser.assignedClasses = Array.from(new Set(validChildren.map(c => c.assignedClass).filter(Boolean)));
              if (!loggedInUser.matricule && validChildren[0]?.matricule) {
                loggedInUser.matricule = validChildren[0].matricule;
              }
            }

            onLogin({ ...loggedInUser, section: userSection });
          } else {
            const identifier = formData.email || formData.matricule || formData.phoneTeacher || formData.phoneEleve || formData.phoneParent;
            if (!identifier) {
              setAuthError("Veuillez saisir votre identifiant (Email, Matricule ou Téléphone).");
              setIsLoading(false);
              return;
            }

            const loggedInUser = await loginUserAccount(
              identifier, 
              formData.password || 'ecole2024', 
              role, 
              levelNumber,
              userSection
            );
            const userSub = loggedInUser.subject || (activeLevel === 'Niveau 5' ? selectedTeacherSubject : undefined) || 'Mathématiques';
            const userAccCode = loggedInUser.accreditationCode || 
              (activeLevel === 'Niveau 5' ? getTeacherIndividualAccreditationCode({ id: loggedInUser.id, subject: userSub, email: loggedInUser.email }) : undefined);

            onLogin({ 
              ...loggedInUser, 
              section: userSection,
              ...(activeLevel === 'Niveau 5' ? { subject: userSub, accreditationCode: userAccCode } : {})
            });
          }
        } else {
          // Direct Registration (Free inscription without pre-registration requirement)
          if (role === 'parent') {
            for (let i = 0; i < parentChildrenList.length; i++) {
              if (!parentChildrenList[i].matricule.trim()) {
                setAuthError(`Veuillez saisir le matricule de l'enfant ${i + 1}.`);
                setIsLoading(false);
                return;
              }
            }
          } else if (role === 'teacher' || role === 'educator') {
            if (!formData.email) {
              setAuthError("L'adresse email est obligatoire pour l'inscription du professeur.");
              setIsLoading(false);
              return;
            }
          }

          const isTeacher = role === 'teacher' || activeLevel === 'Niveau 5';
          const teacherSubjectToUse = isTeacher ? (selectedTeacherSubject || selectedSubject || 'Mathématiques') : undefined;
          const teacherAccreditationToUse = isTeacher
            ? ((validatedTeacherAccreditationCode || accreditationCode || '').trim().toUpperCase() || 
               getTeacherIndividualAccreditationCode({ subject: teacherSubjectToUse }))
            : undefined;

          const registeredUser = await registerUserAccount({
            matricule: role === 'parent' ? parentChildrenList[0]?.matricule : (formData.matricule || (isTeacher ? `ENS-${Math.floor(1000 + Math.random() * 9000)}` : undefined)),
            email: formData.email,
            phone: isTeacher ? formData.phoneTeacher : (role === 'parent' ? formData.phoneParent : formData.phoneEleve),
            password: formData.password || 'ecole2024',
            firstName: formData.firstName,
            lastName: formData.lastName,
            role,
            assignedClass: role === 'parent' ? parentChildrenList[0]?.assignedClass : (selectedClass || selectedTeacherClasses[0] || 'Tle D1'),
            assignedClasses: role === 'parent' ? Array.from(new Set(parentChildrenList.map(c => c.assignedClass))) : (selectedTeacherClasses.length > 0 ? selectedTeacherClasses : ['Tle D1']),
            subject: teacherSubjectToUse,
            accreditationCode: teacherAccreditationToUse,
            section: userSection,
            photo: profilePhoto || undefined,
            childrenCount: role === 'parent' ? parentChildrenList.length : undefined,
            children: role === 'parent' ? parentChildrenList : undefined,
            directorType: (activeLevel === 'Niveau 5' && directorType) ? directorType : undefined,
            isPrincipal: isTeacher && isTeacherPrincipal,
            isProfesseurPrincipal: isTeacher && isTeacherPrincipal,
            principalClasses: (isTeacher && isTeacherPrincipal) ? [teacherPrincipalClass || 'Terminale D'] : []
          });

          if (isTeacher && teacherAccreditationToUse && registeredUser) {
            setTeacherIndividualAccreditationCode(
              { id: registeredUser.id, subject: registeredUser.subject || teacherSubjectToUse, email: registeredUser.email },
              teacherAccreditationToUse
            );
          }

          onLogin({ 
            ...registeredUser, 
            role: role,
            section: userSection,
            ...(isTeacher ? {
              accreditationCode: teacherAccreditationToUse || registeredUser.accreditationCode,
              subject: teacherSubjectToUse,
              isPrincipal: isTeacherPrincipal,
              isProfesseurPrincipal: isTeacherPrincipal,
              principalClasses: isTeacherPrincipal ? [teacherPrincipalClass || 'Terminale D'] : []
            } : {})
          });
        }
      } catch (err: any) {
        setAuthError(err.message || "Une erreur est survenue lors de l'authentification.");
        setAuthErrorCode(err.code || null);
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className="min-h-screen w-full bg-[#BFDBFE] md:bg-[#0b0a0a] flex flex-col md:flex-row p-0 md:p-6 gap-0 md:gap-6 font-['Plus_Jakarta_Sans',sans-serif] relative">
        {/* Left Panel - Info */}
        <div className="relative w-full md:flex-1 rounded-[36px] bg-[#BFDBFE] p-8 md:p-14 overflow-hidden hidden md:flex flex-col justify-center min-h-[300px] md:min-h-0 shrink-0">
          
          {/* Top Label */}
          <div className="relative z-10 mb-6 opacity-60">
            <h1 className="text-[44px] md:text-[76px] lg:text-[92px] font-black tracking-widest text-white uppercase leading-none -ml-[30px]" style={{ marginLeft: '-30px' }}>
              TERMINALE D
            </h1>
          </div>

          {/* Logo & Name */}
          <div className="flex items-center gap-4 mb-8 md:mb-12 relative z-10">
             <div className="w-14 h-14 md:w-18 md:h-18 rounded-[18px] md:rounded-[22px] bg-white flex items-center justify-center shadow-md overflow-hidden p-1">
               <img src="logo.png" alt="Terminale D Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = 'icone.png'; }} />
             </div>
             <div className="flex flex-col">
               <span className="text-[20px] md:text-[24px] font-black text-white tracking-tight">Terminale D</span>
               <span className="text-[11px] text-white/80 font-medium">Ensemble pour la réussite</span>
             </div>
          </div>
          
          {/* Headings */}
          <div className="relative z-10">
            <h2 className="text-[36px] md:text-[56px] font-bold tracking-tight text-white leading-tight mb-2 md:mb-4">
              Espace Numérique.
            </h2>
            <p className="text-[15px] md:text-[17px] text-white/80 font-medium mb-0 md:mb-12">
              Gestion sécurisée par niveaux d'accréditation ({activeLevel === "Niveau 5" ? "Niveau 5 : Prof" : "Niveau 1 : Élève"}).
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 relative z-10 hidden md:grid mt-8 md:mt-0">
            <div className="flex items-center gap-3">
              <User className="w-[18px] h-[18px] text-white/80" strokeWidth={2} />
              <span className="text-[14px] font-bold text-white">Niveau 1 : Élève</span>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap className="w-[18px] h-[18px] text-white/80" strokeWidth={2} />
              <span className="text-[14px] font-bold text-white">Niveau 5 : Prof</span>
            </div>
          </div>

          {/* Watermark text */}
          <div className="absolute -bottom-4 left-0 right-0 overflow-hidden pointer-events-none flex justify-center opacity-[0.04]">
            <span className="text-[80px] md:text-[110px] font-black tracking-tighter text-[#0f172a] whitespace-nowrap leading-none">
              TERMINALE D
            </span>
          </div>
        </div>

        {/* Mobile Top Bar */}
        <div className="md:hidden w-full flex items-center justify-center pt-10 pb-8 px-6 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[14px] bg-white flex items-center justify-center shadow-md overflow-hidden p-1">
              <img src="logo.png" alt="Terminale D Logo" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = 'icone.png'; }} />
            </div>
            <div className="flex flex-col">
              <span className="text-[22px] font-black text-white tracking-wide leading-tight">Terminale D</span>
              <span className="text-[10px] text-white/80 font-medium">Ensemble pour la réussite</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:flex-1 rounded-t-[32px] md:rounded-[36px] bg-white p-6 md:p-14 flex flex-col justify-between relative overflow-y-auto min-h-screen md:min-h-0 shrink-0 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] md:shadow-none">
          
          {/* Top Right Toggle Link */}
          <div className="flex justify-end w-full">
            <p className="text-[13px] text-black/60">
              {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"} {' '}
              <button 
                onClick={() => { setIsLogin(!isLogin); setFormData({matricule: "", firstName: "", lastName: "", phoneParent: "", phoneEleve: "", email: "", password: "", assignedClasses: ""}); }} 
                className="text-black font-semibold hover:underline"
              >
                {isLogin ? "S'inscrire" : "Se connecter"}
              </button>
            </p>
          </div>

          <div className="max-w-[420px] mx-auto w-full flex-1 flex flex-col justify-center mt-6 md:mt-0">
            <div className="flex items-center gap-3 mb-2.5">
              {!isLogin && (
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setAuthError(""); setAuthErrorCode(null); }}
                  className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black/70 active:scale-95 transition-all shrink-0"
                  title="Retour à la connexion"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <h1 className="text-[32px] md:text-[50px] font-medium tracking-tight leading-tight text-black transition-all">
                {isLogin ? "Bon retour" : "Créer un compte"}
              </h1>
            </div>
            <p className="text-[14px] md:text-[15px] text-black/60 leading-relaxed mb-6 transition-all">
              {isLogin ? (
                <>Connectez-vous pour accéder à votre <br className="hidden md:block" /> espace numérique</>
              ) : (
                <>Inscrivez-vous pour rejoindre l'espace <br className="hidden md:block" /> numérique du collège</>
              )}
            </p>

            {/* Error / Auth Notice Banner */}
            <AnimatePresence>
              {authError && (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-6 p-4 rounded-[18px] bg-red-50 border border-red-200 text-red-800 text-[13px] leading-relaxed flex flex-col gap-2.5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1 font-medium">{authError}</div>
                  </div>
                  
                  {(authErrorCode === 'ACCOUNT_NOT_FOUND' || authError.includes('inscrire') || authError.includes('Aucun compte')) && isLogin && (
                    <div className="pt-2 border-t border-red-200/60 flex items-center justify-between gap-3 flex-wrap">
                      <span className="text-xs text-red-700 font-normal">Vous n'avez pas encore de compte ?</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(false);
                          setAuthError("");
                          setAuthErrorCode(null);
                        }}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
                      >
                        <span>S'inscrire maintenant</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
              {activeLevel === "Niveau 1" ? (
                !isLogin ? (
                  
                  <motion.div 
                    key="eleve"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-4 "
                  >
                    <h3 className="text-[13px] font-bold text-black uppercase tracking-wider mt-1">Informations Élève</h3>
                    
                    <div className="flex flex-col gap-4">
                      <div className="relative">
                        <div className="absolute left-[18px] top-1/2 -translate-y-1/2 text-black/40"><Hash className="w-[16px] h-[16px]" strokeWidth={1.5} /></div>
                        <input required type="text" value={formData.matricule} onChange={e=>updateForm('matricule', e.target.value)} placeholder="Matricule (Ex: 2024-2543)" className="w-full bg-transparent border border-black/10 rounded-[20px] py-[17px] pl-[46px] pr-4 text-[14px] text-black placeholder:text-black/50 focus:outline-none focus:border-black/30 transition-colors" />
                      </div>
                      
                      <div className="relative">
                        <div className="absolute left-[18px] top-1/2 -translate-y-1/2 text-black/40"><User className="w-[16px] h-[16px]" strokeWidth={1.5} /></div>
                        <input required type="text" value={formData.lastName} onChange={e=>updateForm('lastName', e.target.value)} placeholder="Nom" className="w-full bg-transparent border border-black/10 rounded-[20px] py-[17px] pl-[46px] pr-4 text-[14px] text-black placeholder:text-black/50 focus:outline-none focus:border-black/30 transition-colors" />
                      </div>
                      
                      <div className="relative">
                        <div className="absolute left-[18px] top-1/2 -translate-y-1/2 text-black/40"><User className="w-[16px] h-[16px]" strokeWidth={1.5} /></div>
                        <input required type="text" value={formData.firstName} onChange={e=>updateForm('firstName', e.target.value)} placeholder="Prénom" className="w-full bg-transparent border border-black/10 rounded-[20px] py-[17px] pl-[46px] pr-4 text-[14px] text-black placeholder:text-black/50 focus:outline-none focus:border-black/30 transition-colors" />
                      </div>
                      
                      {/* Classe fixée à Terminale D1 (Tle D1) */}
                      <div className="relative">
                        <div className="absolute left-[18px] top-1/2 -translate-y-1/2 text-black/40 z-10 pointer-events-none">
                          <BookOpen className="w-[16px] h-[16px]" strokeWidth={1.5} />
                        </div>
                        <div 
                          className="w-full bg-black/[0.03] border border-black/10 rounded-[20px] py-[17px] pl-[46px] pr-4 text-[14px] font-semibold text-black flex items-center justify-between"
                        >
                          <span>Classe : Terminale D1 (Tle D1)</span>
                          <span className="text-[11px] font-bold uppercase tracking-wider bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full border border-sky-200">
                            Classe unique
                          </span>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <div className="absolute left-[18px] top-1/2 -translate-y-1/2 text-black/40"><Lock className="w-[16px] h-[16px]" strokeWidth={1.5} /></div>
                        <input type="password" value={formData.password} onChange={e=>updateForm('password', e.target.value)} placeholder="Mot de passe (Optionnel, min. 6 caractères)" className="w-full bg-transparent border border-black/10 rounded-[20px] py-[17px] pl-[46px] pr-4 text-[14px] text-black placeholder:text-black/50 focus:outline-none focus:border-black/30 transition-colors" />
                      </div>

                      <div className="relative">
                        <div className="absolute left-[18px] top-1/2 -translate-y-1/2 text-black/40"><Phone className="w-[16px] h-[16px]" strokeWidth={1.5} /></div>
                        <input type="tel" value={formData.phoneEleve} onChange={e=>updateForm('phoneEleve', e.target.value)} placeholder="Tél. Élève (+225... - Optionnel)" className="w-full bg-transparent border border-black/10 rounded-[20px] py-[17px] pl-[46px] pr-4 text-[14px] text-black placeholder:text-black/50 focus:outline-none focus:border-black/30 transition-colors" />
                      </div>
                    </div>

                    <ProfilePhotoUploader photo={profilePhoto} onPhotoChange={setProfilePhoto} />
                  </motion.div>
                  
                ) : (
                  <motion.div 
                    key="login-eleve"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="relative">
                      <div className="absolute left-[18px] top-1/2 -translate-y-1/2 text-black/40">
                        <Hash className="w-[16px] h-[16px]" strokeWidth={1.5} />
                      </div>
                      <input 
                        required
                        type="text" 
                        value={formData.matricule} onChange={e=>updateForm('matricule', e.target.value)}
                        placeholder="Matricule de l'élève (Ex: 2024-2543)" 
                        className="w-full bg-transparent border border-black/10 rounded-[20px] py-[17px] pl-[46px] pr-4 text-[14px] text-black placeholder:text-black/50 focus:outline-none focus:border-black/30 transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute left-[18px] top-1/2 -translate-y-1/2 text-black/40">
                        <Lock className="w-[16px] h-[16px]" strokeWidth={1.5} />
                      </div>
                      <input 
                        required
                        type="password" 
                        value={formData.password} onChange={e=>updateForm('password', e.target.value)}
                        placeholder="Mot de passe" 
                        className="w-full bg-transparent border border-black/10 rounded-[20px] py-[17px] pl-[46px] pr-12 text-[14px] text-black placeholder:text-black/50 focus:outline-none focus:border-black/30 transition-colors"
                      />
                    </div>
                  </motion.div>
                )
              ) : activeLevel === "Niveau 5" ? (
                !isLogin ? (
                  <motion.div 
                    key="direction-register"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-4 "
                  >
                    <h3 className="text-[13px] font-bold text-black uppercase tracking-wider mt-1">Informations Enseignant / Professeur (Niveau 5)</h3>

                    <div className="flex flex-col gap-4">
                      <div className="relative">
                        <div className="absolute left-[18px] top-1/2 -translate-y-1/2 text-black/40"><User className="w-[16px] h-[16px]" strokeWidth={1.5} /></div>
                        <input required type="text" value={formData.firstName} onChange={e=>updateForm('firstName', e.target.value)} placeholder="Prénom (Ex: Jean)" className="w-full bg-transparent border border-black/10 rounded-[20px] py-[17px] pl-[46px] pr-4 text-[14px] text-black placeholder:text-black/50 focus:outline-none focus:border-black/30 transition-colors" />
                      </div>
                      
                      <div className="relative">
                        <div className="absolute left-[18px] top-1/2 -translate-y-1/2 text-black/40"><User className="w-[16px] h-[16px]" strokeWidth={1.5} /></div>
                        <input required type="text" value={formData.lastName} onChange={e=>updateForm('lastName', e.target.value)} placeholder="Nom" className="w-full bg-transparent border border-black/10 rounded-[20px] py-[17px] pl-[46px] pr-4 text-[14px] text-black placeholder:text-black/50 focus:outline-none focus:border-black/30 transition-colors" />
                      </div>
                      
                      <div className="relative">
                        <div className="absolute left-[18px] top-1/2 -translate-y-1/2 text-black/40"><Phone className="w-[16px] h-[16px]" strokeWidth={1.5} /></div>
                        <input type="tel" value={formData.phoneTeacher} onChange={e=>updateForm('phoneTeacher', e.target.value)} placeholder="Téléphone (+225... - Optionnel)" className="w-full bg-transparent border border-black/10 rounded-[20px] py-[17px] pl-[46px] pr-4 text-[14px] text-black placeholder:text-black/50 focus:outline-none focus:border-black/30 transition-colors" />
                      </div>

                      <div className="relative">
                        <div className="absolute left-[18px] top-1/2 -translate-y-1/2 text-black/40"><Mail className="w-[16px] h-[16px]" strokeWidth={1.5} /></div>
                        <input required type="email" value={formData.email} onChange={e=>updateForm('email', e.target.value)} placeholder="Adresse Email" className="w-full bg-transparent border border-black/10 rounded-[20px] py-[17px] pl-[46px] pr-4 text-[14px] text-black placeholder:text-black/50 focus:outline-none focus:border-black/30 transition-colors" />
                      </div>

                      <div className="relative">
                        <div className="absolute left-[18px] top-1/2 -translate-y-1/2 text-black/40"><Lock className="w-[16px] h-[16px]" strokeWidth={1.5} /></div>
                        <input required type="password" value={formData.password} onChange={e=>updateForm('password', e.target.value)} placeholder="Mot de passe (Min. 6 caractères)" className="w-full bg-transparent border border-black/10 rounded-[20px] py-[17px] pl-[46px] pr-4 text-[14px] text-black placeholder:text-black/50 focus:outline-none focus:border-black/30 transition-colors" />
                      </div>

                      {/* Discipline Enseignée */}
                      <div className="space-y-1.5">
                        <label className="block text-[12px] font-bold text-black uppercase tracking-wider ml-1">
                          Matière d'enseignement
                        </label>
                        <CustomSubjectSelect
                          value={selectedTeacherSubject}
                          onChange={(sub) => {
                            setSelectedTeacherSubject(sub);
                            setSelectedSubject(sub);
                            try {
                              localStorage.setItem('selected_teacher_subject', sub);
                              localStorage.setItem('last_teacher_subject', sub);
                            } catch (e) {}
                          }}
                          subjects={ALL_TEACHING_SUBJECTS}
                          placeholder="Sélectionner votre matière..."
                        />
                      </div>

                      {/* Code d'accréditation individuel */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between ml-1">
                          <label className="text-[12px] font-bold text-black uppercase tracking-wider">
                            Code d'accréditation individuel
                          </label>
                          <span className="text-[11px] text-slate-500 font-medium">Confidentiel & Personnel</span>
                        </div>
                        <div className="relative">
                          <div className="absolute left-[18px] top-1/2 -translate-y-1/2 text-black/40">
                            <ShieldCheck className="w-[16px] h-[16px]" strokeWidth={1.5} />
                          </div>
                          <input 
                            required
                            type={showAccreditationPassword ? "text" : "password"}
                            value={validatedTeacherAccreditationCode || accreditationCode}
                            onChange={(e) => {
                              const val = e.target.value.trim().toUpperCase();
                              setValidatedTeacherAccreditationCode(val);
                              setAccreditationCode(val);
                              try {
                                localStorage.setItem('last_entered_teacher_code', val);
                              } catch (_) {}
                            }}
                            placeholder={`Code secret (${selectedTeacherSubject || 'votre matière'})`}
                            className="w-full bg-transparent border border-black/10 rounded-[20px] py-[17px] pl-[46px] pr-12 text-[14px] font-mono font-bold text-black placeholder:text-black/50 focus:outline-none focus:border-black/30 transition-colors uppercase"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowAccreditationPassword(!showAccreditationPassword)}
                            className="absolute right-[14px] top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                            tabIndex={-1}
                          >
                            {showAccreditationPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-[14px] text-[11px] text-emerald-800 leading-relaxed flex items-start gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>
                            Ce code est <b>strictement individuel</b>. Après votre inscription, seul vous pourrez le consulter dans <b>Paramètres &gt; Accréditation</b>. Les professeurs des autres matières ne peuvent pas le voir.
                          </span>
                        </div>
                      </div>

                      {/* Professeur Principal Toggle */}
                      <div className="p-4 bg-sky-50/70 border border-sky-200/80 rounded-[20px] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isTeacherPrincipal ? 'bg-sky-600 text-white shadow-sm' : 'bg-sky-100 text-sky-600'}`}>
                              <GraduationCap className="w-5 h-5" />
                            </div>
                            <div>
                              <label htmlFor="pp-toggle" className="text-[13px] font-bold text-slate-800 cursor-pointer block">
                                Êtes-vous Professeur Principal ?
                              </label>
                              <span className="text-[11px] text-slate-500 font-medium">
                                {isTeacherPrincipal ? 'Actif - Responsable de la classe' : 'Activez si vous êtes le prof principal'}
                              </span>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              id="pp-toggle"
                              type="checkbox" 
                              checked={isTeacherPrincipal} 
                              onChange={(e) => setIsTeacherPrincipal(e.target.checked)} 
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
                          </label>
                        </div>

                        {isTeacherPrincipal && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-2.5 border-t border-sky-200/60 space-y-1.5"
                          >
                            <label className="block text-[11px] font-bold text-sky-900 uppercase tracking-wider">
                              Classe dont vous êtes le Professeur Principal
                            </label>
                            <select
                              value={teacherPrincipalClass}
                              onChange={(e) => setTeacherPrincipalClass(e.target.value)}
                              className="w-full bg-white border border-sky-300 rounded-[14px] py-2.5 px-3 text-[13px] font-bold text-sky-950 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-2xs"
                            >
                              <option value="Terminale D">Terminale D</option>
                              <option value="Terminale D1">Terminale D1</option>
                              <option value="Terminale D2">Terminale D2</option>
                              <option value="Terminale C">Terminale C</option>
                              <option value="Terminale A">Terminale A</option>
                              <option value="1ère D">1ère D</option>
                              <option value="2nde C">2nde C</option>
                            </select>
                            <p className="text-[11px] text-sky-700 font-medium flex items-center gap-1.5 mt-1">
                              <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                              <span>L'application vous reconnaîtra automatiquement comme Professeur Principal de la classe.</span>
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>

                    <ProfilePhotoUploader photo={profilePhoto} onPhotoChange={setProfilePhoto} />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="direction-login"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-3"
                  >
                    <div className="relative">
                      <div className="absolute left-[18px] top-1/2 -translate-y-1/2 text-black/40">
                        <Mail className="w-[16px] h-[16px]" strokeWidth={1.5} />
                      </div>
                      <input 
                        required
                        type="email" 
                        value={formData.email} onChange={e=>updateForm('email', e.target.value)}
                        placeholder="Adresse Email" 
                        className="w-full bg-transparent border border-black/10 rounded-[20px] py-[17px] pl-[46px] pr-4 text-[14px] text-black placeholder:text-black/50 focus:outline-none focus:border-black/30 transition-colors"
                      />
                    </div>
                    <div className="relative">
                      <div className="absolute left-[18px] top-1/2 -translate-y-1/2 text-black/40">
                        <Lock className="w-[16px] h-[16px]" strokeWidth={1.5} />
                      </div>
                      <input 
                        required
                        type="password" 
                        value={formData.password} onChange={e=>updateForm('password', e.target.value)}
                        placeholder="Mot de passe" 
                        className="w-full bg-transparent border border-black/10 rounded-[20px] py-[17px] pl-[46px] pr-12 text-[14px] text-black placeholder:text-black/50 focus:outline-none focus:border-black/30 transition-colors"
                      />
                    </div>
                  </motion.div>
                )
              ) : (
                <motion.div 
                  key="other-levels"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-3"
                >
                  <p className="text-[14px] text-black/60 text-center py-8">
                    L'interface d'authentification pour ce niveau est en cours de configuration.
                  </p>
                </motion.div>
              )}
              </AnimatePresence>

              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full bg-[#0b0a0a] text-white rounded-[20px] py-[17px] flex items-center justify-center gap-2 font-medium text-[15px] hover:bg-black/80 transition-colors group ${isLogin ? '' : 'mt-2'} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Vérification...</span>
                  </>
                ) : (
                  <>
                    {isLogin ? "Se connecter" : "S'inscrire"} 
                    <ArrowRight className="w-[18px] h-[18px] text-white/70 group-hover:text-white transition-colors" strokeWidth={1.5} />
                  </>
                )}
              </button>

              {/* Direct Access / Guest Entrance Button removed as requested */}
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 mt-12 mb-8">
              <div className="h-[1px] flex-1 bg-black/[0.08]"></div>
              <span className="text-[12px] text-black/40">autres niveaux</span>
              <div className="h-[1px] flex-1 bg-black/[0.08]"></div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Niveau 1", label: "Niveau 1 : Élève", icon: Users },
                { name: "Niveau 5", label: "Niveau 5 : Prof", icon: GraduationCap }
              ].map((level) => {
                const isActive = activeLevel === level.name;
                return (
                  <button 
                    key={level.name}
                    onClick={() => handleLevelClick(level.name)} 
                    type="button" 
                    className={`flex items-center justify-center gap-2 h-[48px] rounded-[16px] border transition-all px-3 cursor-pointer ${
                      isActive 
                        ? "bg-black text-white border-black shadow-md font-bold" 
                        : "border-black/10 hover:bg-black/5 text-black/80 font-medium"
                    }`}
                  >
                    <level.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-black/60"}`} strokeWidth={2} />
                    <span className="text-[13px]">{level.label}</span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* Bottom Text */}
          <p className="text-center text-[12px] text-black/50 mt-12 md:mt-0">
            By signing up, you agree to our<br />
            <a href="#" className="text-black font-medium hover:underline">Terms of Service</a> and <a href="#" className="text-black font-medium hover:underline">Privacy Policy</a>
          </p>
        </div>

      {/* Accreditation Modal */}
      <AnimatePresence>
        {isAccreditationModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[28px] p-6 sm:p-7 w-full max-w-md shadow-2xl relative border border-slate-100"
            >
              {selectedLevel === "Niveau 5" ? (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">Accès Professeur</h3>
                    </div>
                  </div>

                  {loginError && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[12px] leading-relaxed flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span className="font-medium">{loginError}</span>
                    </div>
                  )}

                  {/* Matière Enseignée - Custom Stylish Dropdown */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">
                      Matière enseignée
                    </label>
                    <CustomSubjectSelect
                      value={selectedTeacherSubject}
                      onChange={(sub) => {
                        setSelectedTeacherSubject(sub);
                        setLoginError("");
                      }}
                      subjects={ALL_TEACHING_SUBJECTS}
                      placeholder="Sélectionner une matière..."
                    />
                  </div>

                  {/* Code secret */}
                  <div className="mb-5">
                    <label className="block text-xs font-semibold text-slate-700 mb-1 ml-1">
                      Code secret
                    </label>
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input 
                        type={showAccreditationPassword ? "text" : "password"} 
                        autoFocus
                        value={accreditationCode} 
                        onChange={e => {
                          setAccreditationCode(e.target.value);
                          setLoginError("");
                        }} 
                        onKeyDown={e => { if (e.key === 'Enter') validateAccreditation(); }}
                        placeholder="Entrez votre code..." 
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-sky-500 rounded-xl py-2.5 pl-10 pr-10 text-sm font-mono font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all uppercase" 
                      />
                      <button 
                        type="button"
                        onClick={() => setShowAccreditationPassword(!showAccreditationPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                        tabIndex={-1}
                      >
                        {showAccreditationPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-[18px] md:text-[20px] font-bold text-slate-900 mb-1">
                    Accès {selectedLevel}
                  </h3>
                  <p className="text-[13px] text-slate-500 mb-4 leading-relaxed">
                    Veuillez entrer le code d'accréditation pour accéder à cet espace.
                  </p>

                  {loginError && (
                    <div className="mb-4 p-3 rounded-[16px] bg-red-50 border border-red-200 text-red-800 text-[12px] leading-relaxed flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}
                  
                  <div className="relative mb-6">
                    <div className="absolute left-[18px] top-1/2 -translate-y-1/2 text-black/40">
                      <Lock className="w-[16px] h-[16px]" strokeWidth={1.5} />
                    </div>
                    <input 
                      type={showAccreditationPassword ? "text" : "password"} 
                      autoFocus
                      value={accreditationCode} 
                      onChange={e => {
                        setAccreditationCode(e.target.value);
                        setLoginError("");
                      }} 
                      onKeyDown={e => { if (e.key === 'Enter') validateAccreditation(); }}
                      placeholder="Code d'Accréditation" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-[20px] py-[15px] pl-[46px] pr-12 text-[14px] font-mono text-black placeholder:text-black/40 focus:outline-none focus:border-black/30 transition-colors uppercase" 
                    />
                    <button 
                      type="button"
                      onClick={() => setShowAccreditationPassword(!showAccreditationPassword)}
                      className="absolute right-[14px] top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
                      tabIndex={-1}
                    >
                      {showAccreditationPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </>
              )}
              
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsAccreditationModalOpen(false)}
                  className="flex-1 py-[14px] rounded-[18px] text-[14px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  type="button"
                  onClick={validateAccreditation}
                  className="flex-1 py-[14px] rounded-[18px] text-[14px] font-bold text-white bg-slate-900 hover:bg-black transition-all shadow-md active:scale-[0.98] cursor-pointer"
                >
                  Valider l'accès
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
