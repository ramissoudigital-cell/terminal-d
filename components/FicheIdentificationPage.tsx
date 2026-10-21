import React, { useState, useEffect, useMemo } from 'react';
import { Student, Teacher, ClassItem } from '../types';
import { mockClasses } from '../data/mockData';
import { DirectorSignatureStamp } from './DirectorSignatureStamp';
import { getParentChildren, isParentChild, isSameClass } from '../src/utils/parentUtils';
import { isTechnicalClass, calculateAnnualAverage } from '../src/utils/academicUtils';
import { 
  User, Search, Printer, FileText, ArrowLeft, Edit3, School, 
  Phone, Mail, Calendar, MapPin, ShieldCheck, AlertCircle, 
  CheckCircle2, Clock, Award, BookOpen, Users, UserCheck, 
  Sparkles, Save, Eye, Hash, Heart, Activity, Flag, FileCheck,
  ChevronRight, GraduationCap, Filter
} from 'lucide-react';

interface FicheIdentificationPageProps {
  allStudents?: Student[];
  teachers?: Teacher[];
  currentUser?: any;
  onUpdateStudent?: (updatedStudent: Student) => void;
}

export const FicheIdentificationPage: React.FC<FicheIdentificationPageProps> = ({
  allStudents = [],
  teachers = [],
  currentUser,
  onUpdateStudent
}) => {
  // Master classes list (combining mockClasses with any custom class in allStudents)
  const allClassesList = useMemo(() => {
    const list: ClassItem[] = [...mockClasses];

    allStudents.forEach(s => {
      if (s.class) {
        const matchesExisting = list.some(c => isSameClass(s.class, c.name) || isSameClass(s.class, c.code));
        if (!matchesExisting) {
          let sec: 'Primaire' | 'Général' | 'Technique' = 'Général';
          if (s.class.startsWith('CP') || s.class.startsWith('CE') || s.class.startsWith('CM')) {
            sec = 'Primaire';
          } else if (s.class.includes('G') || s.class.includes('AB')) {
            sec = 'Technique';
          }
          list.push({
            id: Date.now() + Math.random(),
            name: s.class,
            code: s.class,
            students: 0,
            time: '07:30 - 13:30',
            color: 'bg-emerald-100 text-emerald-600',
            section: sec
          });
        }
      }
    });

    const isTeacher = currentUser?.role === 'teacher' || currentUser?.accessLevel === 3;
    if (isTeacher) {
      const assigned: string[] = [];
      const addCls = (c: any) => {
        if (typeof c === 'string') {
          const trimmed = c.trim();
          if (trimmed && !assigned.some(a => a.toLowerCase() === trimmed.toLowerCase())) {
            assigned.push(trimmed);
          }
        }
      };
      if (Array.isArray(currentUser?.assignedClasses)) {
        currentUser.assignedClasses.forEach((c: any) => {
          if (typeof c === 'string' && c.includes(',')) c.split(',').forEach(sub => addCls(sub));
          else addCls(c);
        });
      } else if (typeof currentUser?.assignedClasses === 'string') {
        currentUser.assignedClasses.split(',').forEach((c: string) => addCls(c));
      }
      if (currentUser?.assignedClass) {
        if (typeof currentUser.assignedClass === 'string' && currentUser.assignedClass.includes(',')) {
          currentUser.assignedClass.split(',').forEach((c: string) => addCls(c));
        } else {
          addCls(currentUser.assignedClass);
        }
      }

      // Check matching teacher profile in teachers array
      const matchingTeacher = teachers?.find((t: any) => 
        (t.email && currentUser?.email && t.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (t.matricule && currentUser?.matricule && t.matricule.toLowerCase() === currentUser.matricule.toLowerCase()) ||
        (t.name && currentUser?.name && t.name.toLowerCase() === currentUser.name.toLowerCase()) ||
        (String(t.id) === String(currentUser?.id))
      );

      if (matchingTeacher) {
        if (Array.isArray(matchingTeacher.assignedClasses)) {
          matchingTeacher.assignedClasses.forEach((c: any) => {
            if (typeof c === 'string' && c.includes(',')) c.split(',').forEach(sub => addCls(sub));
            else addCls(c);
          });
        } else if (typeof matchingTeacher.assignedClasses === 'string') {
          (matchingTeacher.assignedClasses as string).split(',').forEach((c: string) => addCls(c));
        }
        if (matchingTeacher.assignedClass) {
          if (typeof matchingTeacher.assignedClass === 'string' && matchingTeacher.assignedClass.includes(',')) {
            matchingTeacher.assignedClass.split(',').forEach((c: string) => addCls(c));
          } else {
            addCls(matchingTeacher.assignedClass);
          }
        }
      }

      // Add missing assigned classes to list
      assigned.forEach((ac, idx) => {
        if (!list.some(c => c.name.toLowerCase() === ac.toLowerCase() || c.code.toLowerCase() === ac.toLowerCase())) {
          let sec: 'Primaire' | 'Général' | 'Technique' = 'Général';
          const lower = ac.toLowerCase();
          if (lower.startsWith('cp') || lower.startsWith('ce') || lower.startsWith('cm')) sec = 'Primaire';
          else if (lower.includes('g') || lower.includes('ab')) sec = 'Technique';
          list.push({
            id: 9500 + idx,
            name: ac,
            code: ac,
            students: 0,
            time: '07:30 - 13:30',
            color: 'bg-emerald-100 text-emerald-600',
            section: sec
          });
        }
      });

      return list.filter(c => assigned.some(ac => ac.toLowerCase() === c.name.toLowerCase() || ac.toLowerCase() === c.code.toLowerCase()));
    }

    if (!isTeacher && currentUser?.section === 'Primaire') {
      return list.filter(c => c.section === 'Primaire');
    }

    return list;
  }, [allStudents, currentUser, teachers]);

  // View mode: 'classes' | 'students' | 'fiche'
  const [viewMode, setViewMode] = useState<'classes' | 'students' | 'fiche'>('classes');
  const [selectedSection, setSelectedSection] = useState<'Toutes' | 'Primaire' | 'Général' | 'Technique'>(currentUser?.section === 'Primaire' ? 'Primaire' : 'Toutes');
  const [searchClassTerm, setSearchClassTerm] = useState<string>('');
  const [selectedClassItem, setSelectedClassItem] = useState<ClassItem | null>(null);
  
  const [searchStudentTerm, setSearchStudentTerm] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // List of children if user is a parent
  const parentChildren = useMemo(() => {
    if (currentUser?.role === 'parent') {
      return getParentChildren(currentUser, allStudents);
    }
    return [];
  }, [currentUser, allStudents]);

  useEffect(() => {
    const isStudent = currentUser?.role === 'student' || currentUser?.accessLevel === 1;
    const isParent = currentUser?.role === 'parent';

    if (isStudent && allStudents && allStudents.length > 0) {
      let match = allStudents.find(s => 
        (s.email && currentUser?.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (s.studentId && currentUser?.matricule && s.studentId.toLowerCase() === currentUser.matricule.toLowerCase()) ||
        (s.studentId && currentUser?.studentId && s.studentId.toLowerCase() === currentUser.studentId.toLowerCase()) ||
        (s.name && currentUser?.name && s.name.toLowerCase() === currentUser.name.toLowerCase())
      );
      if (!match && currentUser) {
        match = {
          id: `student-${currentUser.id || currentUser.matricule || Date.now()}`,
          name: currentUser.name || 'Élève',
          studentId: currentUser.matricule || currentUser.studentId || 'STU-001',
          class: currentUser.assignedClass || '6ème 1',
          birthDate: currentUser.birthDate || '',
          birthPlace: currentUser.birthPlace || 'Yopougon',
          photoUrl: currentUser.photo || `https://i.pravatar.cc/150?u=${currentUser.id || 'student'}`,
          parentName: currentUser.parentName || '',
          parentPhone: currentUser.parentPhone || currentUser.phone || '',
          fatherPhone: currentUser.fatherPhone || '',
          motherPhone: currentUser.motherPhone || '',
          assignedStatus: (currentUser.assignedStatus as 'affecte' | 'non_affecte') || 'affecte',
          absences: 0,
          attendanceHistory: [],
          performance: [],
          subjects: []
        } as Student;
      }
      if (match) {
        setSelectedStudent(match);
        setViewMode('fiche');
      }
    } else if (isParent && parentChildren.length > 0) {
      if (!selectedStudent || !parentChildren.some(c => c.id === selectedStudent.id)) {
        setSelectedStudent(parentChildren[0]);
        setViewMode('fiche');
      }
    }
  }, [currentUser, allStudents, parentChildren]);

  // Class student counts computed dynamically from real database
  const classStudentCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allClassesList.forEach(c => {
      counts[c.name] = allStudents.filter(s => s.class === c.name || s.class === c.code).length;
    });
    return counts;
  }, [allClassesList, allStudents]);

  // Filtered classes list based on selected section & search
  const filteredClasses = useMemo(() => {
    const isTeacher = currentUser?.role === 'teacher' || currentUser?.accessLevel === 3;
    const isParent = currentUser?.role === 'parent';

    return allClassesList.filter(c => {
      if (isParent && parentChildren.length > 0) {
        const isMatch = parentChildren.some(child => 
          isSameClass(child.class || '', c.name) || isSameClass(child.class || '', c.code)
        );
        if (!isMatch) {
          return false;
        }
      }
      const matchSection = isTeacher || selectedSection === 'Toutes' || c.section === selectedSection;
      const matchSearch = !searchClassTerm || 
        c.name.toLowerCase().includes(searchClassTerm.toLowerCase()) || 
        c.code.toLowerCase().includes(searchClassTerm.toLowerCase());
      return matchSection && matchSearch;
    });
  }, [allClassesList, selectedSection, searchClassTerm, currentUser, parentChildren]);

  // Students in selected class matching search
  const classStudents = useMemo(() => {
    if (!selectedClassItem) return [];
    const className = selectedClassItem.name;
    const classCode = selectedClassItem.code;
    return allStudents.filter(s => {
      const matchClass = s.class === className || s.class === classCode;
      const matchSearch = !searchStudentTerm || 
        s.name.toLowerCase().includes(searchStudentTerm.toLowerCase()) || 
        (s.studentId && s.studentId.toLowerCase().includes(searchStudentTerm.toLowerCase()));
      if (currentUser?.role === 'parent') {
        return matchClass && matchSearch && isParentChild(currentUser, s, allStudents);
      }
      return matchClass && matchSearch;
    });
  }, [allStudents, selectedClassItem, searchStudentTerm, currentUser]);

  // Editable fields for the selected student
  const [studentForm, setStudentForm] = useState<any>({
    name: '',
    studentId: '',
    class: '',
    birthDate: '',
    birthPlace: '',
    birthCertificateNumber: '',
    gender: 'M',
    nationality: 'Ivoirienne',
    assignedStatus: 'affecte',
    isRedoublant: 'Non',
    isBoursier: 'Non',
    regime: 'Demi-pensionnaire',
    photoUrl: '',
    parentName: '',
    parentPhone: '',
    fatherPhone: '',
    fatherEmail: '',
    motherPhone: '',
    motherEmail: '',
    parentEmail: '',
    parentProfession: '',
    parentAddress: '',
    emergencyPhone: '',
    emergencyContactName: '',
    bloodType: '',
    allergies: '',
    previousSchool: '',
    entryYear: '2024-2025',
    conductRating: '',
    observation: '',
    mainTeacherName: '',
    teacherSignature: '',
    directorName: '',
    directorSignature: '',
    stampMode: 'blank',
    medicalHistory: '',
    maritalStatus: 'unis',
    fatherName: '',
    fatherDeceased: false,
    fatherProfession: '',
    motherName: '',
    motherDeceased: false,
    motherProfession: ''
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Find Main Teacher for the selected class
  const mainTeacher = useMemo(() => {
    if (!selectedClassItem) return null;
    const cName = selectedClassItem.name;
    return teachers.find(t => t.isPrincipal && t.principalClasses?.includes(cName)) || teachers[0];
  }, [teachers, selectedClassItem]);

  // Sync state when selected student changes
  useEffect(() => {
    if (selectedStudent) {
      const defaultTeacher = mainTeacher ? mainTeacher.name : 'M. YALE ARLON';
      setStudentForm({
        name: selectedStudent.name || '',
        studentId: selectedStudent.studentId || selectedStudent.id || '',
        class: selectedStudent.class || selectedClassItem?.name || '',
        birthDate: selectedStudent.birthDate || '',
        birthPlace: selectedStudent.birthPlace || '',
        birthCertificateNumber: selectedStudent.birthCertificateNumber || '',
        gender: selectedStudent.gender || 'M',
        nationality: selectedStudent.nationality || 'Ivoirienne',
        assignedStatus: selectedStudent.assignedStatus || 'affecte',
        isRedoublant: selectedStudent.isRedoublant || 'Non',
        isBoursier: selectedStudent.isBoursier || 'Non',
        regime: selectedStudent.regime || '',
        photoUrl: selectedStudent.photoUrl || `https://i.pravatar.cc/150?u=${selectedStudent.id}`,
        parentName: selectedStudent.parentName || (selectedStudent.parentPhone ? ('Parent / Tuteur de ' + selectedStudent.name) : ''),
        parentPhone: selectedStudent.parentPhone || selectedStudent.fatherPhone || selectedStudent.motherPhone || '',
        fatherPhone: selectedStudent.fatherPhone || '',
        fatherEmail: selectedStudent.fatherEmail || '',
        motherPhone: selectedStudent.motherPhone || '',
        motherEmail: selectedStudent.motherEmail || '',
        parentEmail: selectedStudent.parentEmail || '',
        parentProfession: selectedStudent.parentProfession || '',
        parentAddress: selectedStudent.parentAddress || '',
        emergencyPhone: selectedStudent.emergencyPhone || selectedStudent.parentPhone || '',
        emergencyContactName: selectedStudent.emergencyContactName || '',
        bloodType: selectedStudent.bloodType || '',
        allergies: selectedStudent.allergies || '',
        previousSchool: selectedStudent.previousSchool || '',
        entryYear: selectedStudent.entryYear || '2024-2025',
        conductRating: selectedStudent.conductRating || '',
        observation: selectedStudent.observation || '',
        mainTeacherName: selectedStudent.mainTeacherName || defaultTeacher,
        teacherSignature: selectedStudent.teacherSignature || defaultTeacher.split(' ').pop(),
        directorName: selectedStudent.directorName || 'M. TRAORÉ KASSIM',
        directorSignature: selectedStudent.directorSignature || 'T. Kassim',
        stampMode: selectedStudent.stampMode || 'blank',
        medicalHistory: selectedStudent.medicalHistory || selectedStudent.antecedents || '',
        maritalStatus: selectedStudent.maritalStatus || 'unis',
        fatherName: selectedStudent.fatherName || '',
        fatherDeceased: selectedStudent.fatherDeceased || false,
        fatherProfession: selectedStudent.fatherProfession || (selectedStudent.parentProfession || ''),
        motherName: selectedStudent.motherName || '',
        motherDeceased: selectedStudent.motherDeceased || false,
        motherProfession: selectedStudent.motherProfession || ''
      });
    }
  }, [selectedStudent, selectedClassItem, mainTeacher]);

  // Calculate Average from performance or subjects (without fake fallback marks)
  const studentAverages = useMemo(() => {
    if (!selectedStudent) return { t1: null, t2: null, t3: null, annual: null, rank: '' };

    const t1 = selectedStudent.trimesters?.['1er trim']?.average ?? null;
    const t2 = selectedStudent.trimesters?.['2ème trim']?.average ?? null;
    const t3 = selectedStudent.trimesters?.['3ème trim']?.average ?? null;

    const isTech = isTechnicalClass(selectedStudent?.class);
    const annual = calculateAnnualAverage(t1, t2, t3, isTech);

    return {
      t1: t1 !== null ? Number(t1.toFixed(2)) : null,
      t2: t2 !== null ? Number(t2.toFixed(2)) : null,
      t3: t3 !== null ? Number(t3.toFixed(2)) : null,
      annual: annual !== null ? Number(annual.toFixed(2)) : null,
      rank: ''
    };
  }, [selectedStudent]);

  const canPrint = currentUser?.role !== 'student' && currentUser?.accessLevel !== 1 && currentUser?.role !== 'teacher' && currentUser?.accessLevel !== 3;

  const handleSelectClass = (cls: ClassItem) => {
    setSelectedClassItem(cls);
    setSelectedStudent(null);
    setSearchStudentTerm('');
    setViewMode('students');
  };

  const handleSelectStudent = (st: Student) => {
    setSelectedStudent(st);
    setViewMode('fiche');
  };

  const handleBackToClasses = () => {
    setViewMode('classes');
    setSelectedClassItem(null);
    setSelectedStudent(null);
  };

  const handleBackToStudents = () => {
    setViewMode('students');
    setSelectedStudent(null);
  };

  const handleSaveForm = () => {
    if (!selectedStudent) return;
    const updated: Student = {
      ...selectedStudent,
      name: studentForm.name,
      studentId: studentForm.studentId,
      class: studentForm.class,
      birthDate: studentForm.birthDate,
      birthPlace: studentForm.birthPlace,
      birthCertificateNumber: studentForm.birthCertificateNumber,
      gender: studentForm.gender,
      nationality: studentForm.nationality,
      assignedStatus: studentForm.assignedStatus,
      parentPhone: studentForm.parentPhone,
      fatherPhone: studentForm.fatherPhone,
      fatherEmail: studentForm.fatherEmail,
      motherPhone: studentForm.motherPhone,
      motherEmail: studentForm.motherEmail,
      parentName: studentForm.parentName,
      parentAddress: studentForm.parentAddress,
      parentEmail: studentForm.parentEmail,
      photoUrl: studentForm.photoUrl,
      observation: studentForm.observation,
      mainTeacherName: studentForm.mainTeacherName,
      teacherSignature: studentForm.teacherSignature,
      directorName: studentForm.directorName,
      directorSignature: studentForm.directorSignature,
      stampMode: studentForm.stampMode,
      medicalHistory: studentForm.medicalHistory,
      maritalStatus: studentForm.maritalStatus,
      fatherName: studentForm.fatherName,
      fatherDeceased: studentForm.fatherDeceased,
      fatherProfession: studentForm.fatherProfession,
      motherName: studentForm.motherName,
      motherDeceased: studentForm.motherDeceased,
      motherProfession: studentForm.motherProfession
    };

    if (onUpdateStudent) {
      onUpdateStudent(updated);
    }
    setSelectedStudent(updated);
    setIsEditing(false);
  };

  const handlePrint = () => {
    const printElement = document.getElementById('printable-fiche-identite');
    
    try {
      const win = window.open('', '_blank');
      if (win && printElement) {
        win.document.write(`
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="utf-8">
              <title>Fiche d'Identification - ${studentForm.name}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  @page { size: A4 portrait; margin: 4mm; zoom: 0.92; }
                  .no-print { display: none !important; }
                }
                body { 
                  background-color: white !important; 
                  color: black !important; 
                  font-family: system-ui, -apple-system, sans-serif; 
                  padding: 16px; 
                  margin: 0;
                }
              </style>
            </head>
            <body>
              <div class="no-print" style="margin-bottom: 16px; padding: 12px 16px; background-color: #065f46; color: white; display: flex; justify-content: space-between; align-items: center; border-radius: 12px; font-family: sans-serif;">
                <div>
                  <strong style="font-size: 14px;">Impression Fiche d'Identification</strong>
                  <p style="font-size: 12px; margin: 2px 0 0 0; color: #a7f3d0;">${studentForm.name} - Matricule: ${studentForm.studentId}</p>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button onclick="window.print()" style="padding: 8px 16px; background-color: #10b981; color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                    Imprimer ce document
                  </button>
                  <button onclick="window.close()" style="padding: 8px 12px; background-color: #047857; color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                    Fermer
                  </button>
                </div>
              </div>
              <div style="display: flex; justify-content: center;">
                ${printElement.outerHTML}
              </div>
              <script>
                setTimeout(function() {
                  window.print();
                }, 500);
              </script>
            </body>
          </html>
        `);
        win.document.close();
        return;
      }
    } catch (e) {
      console.warn("window.open print failed, falling back to direct window.print()", e);
    }

    try {
      window.print();
    } catch (err) {
      console.error("Direct window.print error", err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto h-full min-h-full bg-white p-4 sm:p-6 pb-24 text-slate-900 custom-scrollbar">
      
      {/* Print styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          #printable-fiche-identite {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 8px;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
          @page {
            size: A4 portrait;
            margin: 4mm;
          }
        }
      `}</style>

      {/* PARENT CHILD SELECTOR BANNER */}
      {currentUser?.role === 'parent' && parentChildren.length > 0 && (
        <div className="max-w-7xl mx-auto mb-6 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-4 rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-emerald-400/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Users size={22} className="text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base leading-tight">Fiches d'identification de vos enfants ({parentChildren.length})</h3>
              <p className="text-xs text-emerald-200 mt-0.5">Cliquez sur un enfant pour consulter sa fiche d'identification</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {parentChildren.map((child) => {
              const isSelected = viewMode === 'fiche' && (selectedStudent?.id === child.id || selectedStudent?.studentId === child.studentId);
              return (
                <button
                  key={child.id || child.studentId}
                  onClick={() => {
                    setSelectedStudent(child);
                    setViewMode('fiche');
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-white text-emerald-800 shadow-md scale-105 ring-2 ring-emerald-300'
                      : 'bg-white/15 hover:bg-white/25 text-white'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-emerald-300'}`}></span>
                  <span>{child.name}</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-black/20 text-emerald-100 font-mono">
                    {child.class}
                  </span>
                </button>
              );
            })}
            {viewMode === 'fiche' && (
              <button
                onClick={() => setViewMode('classes')}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 border border-white/20 ml-1"
              >
                <School size={14} />
                <span>Par classe</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* VIEW 1: MASTER CLASSES SELECTION LIST */}
      {viewMode === 'classes' && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Page Banner Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-500/20">
                  <UserCheck size={32} />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Fiche d'Identification de l'Élève</h1>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">
                    Sélectionnez une classe puis cliquez sur le bouton <strong className="text-emerald-700 font-bold">Fiche d'identification</strong> pour consulter la fiche complète d'un élève.
                  </p>
                </div>
              </div>

              {/* Class Search input */}
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Rechercher une classe (ex: 6ème 1, CP1)..."
                  value={searchClassTerm}
                  onChange={(e) => setSearchClassTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            {/* Section Filter Tabs */}
            {currentUser?.section !== 'Primaire' && (
              <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar border-t border-slate-100 pt-5">
                {(['Toutes', 'Primaire', 'Général', 'Technique'] as const).map((sec) => {
                  const isSelected = selectedSection === sec;
                const count = sec === 'Toutes' 
                  ? allClassesList.length 
                  : allClassesList.filter(c => c.section === sec).length;

                return (
                  <button
                    key={sec}
                    onClick={() => setSelectedSection(sec)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm flex items-center gap-2 border transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white hover:border-emerald-300'
                    }`}
                  >
                    <span>{sec === 'Toutes' ? 'Toutes les classes' : `Section ${sec}`}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
            )}
          </div>

          {/* Classes Cards Grid */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <BookOpen size={20} className="text-emerald-600" />
                <span>Classes Disponibles ({filteredClasses.length})</span>
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {allStudents.length} élèves inscrits au total dans l'établissement
              </span>
            </div>

            {filteredClasses.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <BookOpen size={40} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-600">Aucune classe ne correspond à votre recherche</p>
                <p className="text-xs text-slate-400">Essayez de modifier votre filtre de recherche.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredClasses.map((cls) => {
                  const studentCount = classStudentCounts[cls.name] || 0;
                  return (
                    <div
                      key={cls.id || cls.name}
                      onClick={() => handleSelectClass(cls)}
                      className="group bg-slate-50 hover:bg-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-600 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-lg hover:shadow-emerald-600/20 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-white text-slate-700 group-hover:bg-white/20 group-hover:text-white border border-slate-200 group-hover:border-white/20">
                            {cls.section || 'Général'}
                          </span>
                          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 group-hover:bg-white/20 group-hover:text-white">
                            <GraduationCap size={18} />
                          </div>
                        </div>

                        <h3 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-white">
                          {cls.name}
                        </h3>
                        <p className="text-xs font-medium text-slate-500 group-hover:text-emerald-100 mt-1">
                          Code: {cls.code || cls.name}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/80 group-hover:border-white/20 flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 group-hover:text-white flex items-center gap-1.5">
                          <Users size={14} className="text-emerald-600 group-hover:text-white" />
                          {studentCount} élève{studentCount > 1 ? 's' : ''}
                        </span>
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: STUDENTS LIST OF SELECTED CLASS */}
      {viewMode === 'students' && selectedClassItem && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Controls */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToClasses}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ArrowLeft size={18} />
                  <span>Retour aux classes</span>
                </button>
                <div className="h-6 w-px bg-slate-200 hidden sm:block" />
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Liste des élèves de la classe</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-xl text-lg font-black border border-emerald-200">
                      {selectedClassItem.name}
                    </span>
                  </h1>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    Section {selectedClassItem.section || 'Général'} • {classStudents.length} élève{classStudents.length > 1 ? 's' : ''} enregistré(s)
                  </p>
                </div>
              </div>

              {/* Student Search bar */}
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Rechercher élève par nom ou matricule..."
                  value={searchStudentTerm}
                  onChange={(e) => setSearchStudentTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            {/* Students Table or Empty State */}
            {classStudents.length === 0 ? (
              <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 my-4 max-w-lg mx-auto">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users size={36} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">
                  Aucun élève enregistré dans cette classe.
                </h3>
                <p className="text-xs font-medium text-slate-500">
                  {searchStudentTerm 
                    ? "Aucun élève ne correspond à votre recherche dans cette classe." 
                    : "Cette classe ne contient actuellement aucun élève inscrit dans la base de données."}
                </p>
                {searchStudentTerm && (
                  <button
                    onClick={() => setSearchStudentTerm('')}
                    className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all cursor-pointer"
                  >
                    Effacer la recherche
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3.5 px-4">Élève & Nom et Prénom</th>
                      <th className="py-3.5 px-4">Matricule</th>
                      <th className="py-3.5 px-4">Sexe</th>
                      <th className="py-3.5 px-4">Date de Naissance</th>
                      <th className="py-3.5 px-4">Contact Parent</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-medium">
                    {classStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={st.photoUrl || `https://i.pravatar.cc/150?u=${st.id}`}
                              alt={st.name}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 shadow-xs"
                            />
                            <div>
                              <p className="font-bold text-slate-900">{st.name}</p>
                              <p className="text-xs text-slate-500">Classe : {st.class}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-950">
                          {st.studentId || st.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            st.gender === 'F' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {st.gender === 'F' ? 'Féminin' : 'Masculin'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-700">
                          {st.birthDate || 'Non renseignée'}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Phone size={13} className="text-slate-400 shrink-0" />
                            <span>{st.parentPhone || st.fatherPhone || 'Non disponible'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleSelectStudent(st)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
                          >
                            <FileText size={15} />
                            <span>Fiche d'identification</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: COMPLETE DETAILED FICHE D'IDENTIFICATION FOR SELECTED STUDENT */}
      {viewMode === 'fiche' && selectedStudent && (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Control Bar */}
          <div className="no-print bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                {!(currentUser?.role === 'student' || currentUser?.role === 'parent' || currentUser?.accessLevel === 1) && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBackToStudents}
                      className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <ArrowLeft size={18} />
                      <span>Retour aux élèves ({selectedClassItem?.name || selectedStudent.class})</span>
                    </button>
                    <button
                      onClick={handleBackToClasses}
                      className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <School size={16} />
                      <span>Toutes les classes</span>
                    </button>
                  </div>
                )}

                <div className="h-6 w-px bg-slate-200 hidden md:block" />

                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Fiche d'Identification:</span>
                    <span className="text-emerald-700">{selectedStudent.name}</span>
                  </h1>
                  <p className="text-xs font-medium text-slate-500">
                    Matricule: <strong className="font-mono text-emerald-900">{studentForm.studentId}</strong> | Classe: <strong>{studentForm.class}</strong>
                  </p>
                </div>
              </div>

              {/* Action buttons strictly on the same line */}
              <div className="flex items-center gap-3 shrink-0 flex-nowrap">
                {!(currentUser?.role === 'student' || currentUser?.role === 'parent' || currentUser?.role === 'teacher' || currentUser?.role === 'professeur' || currentUser?.accessLevel === 1 || currentUser?.accessLevel === 3) && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      isEditing 
                        ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    <Edit3 size={16} />
                    <span>{isEditing ? 'Mode Édition En Cours' : 'Modifier la Fiche'}</span>
                  </button>
                )}

                {canPrint && (
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-black rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    <Printer size={18} />
                    <span>Imprimer la Fiche (A4)</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* EDIT FORM DRAWER (IF IS EDITING) */}
          {isEditing && !(currentUser?.role === 'student' || currentUser?.role === 'parent' || currentUser?.role === 'teacher' || currentUser?.role === 'professeur' || currentUser?.accessLevel === 1 || currentUser?.accessLevel === 3) && (
            <div className="no-print bg-white rounded-2xl shadow-md border-2 border-emerald-500 p-6 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b pb-3 border-slate-200">
                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Edit3 size={18} className="text-emerald-600" />
                  Mise à jour des informations de l'élève
                </h2>
                <button
                  onClick={handleSaveForm}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
                >
                  <Save size={15} />
                  Enregistrer les modifications
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="col-span-1 sm:col-span-2 lg:col-span-4 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 flex flex-wrap items-center gap-4">
                  <div className="w-14 h-16 rounded-lg overflow-hidden border border-emerald-500 shrink-0 bg-white shadow-xs">
                    <img src={studentForm.photoUrl || `https://i.pravatar.cc/150?u=${selectedStudent.id}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-[200px] space-y-1">
                    <label className="font-bold text-slate-800 block">Photo Officielle de l'Élève</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={studentForm.photoUrl || ''}
                        onChange={(e) => setStudentForm({ ...studentForm, photoUrl: e.target.value })}
                        placeholder="Lien URL de la photo (ex: https://...)"
                        className="flex-1 p-2 bg-white border rounded-lg text-xs"
                      />
                      <label htmlFor="fiche-photo-upload" className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer shrink-0">
                        Uploader
                      </label>
                      <input
                        id="fiche-photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setStudentForm(prev => ({ ...prev, photoUrl: reader.result as string }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Nom & Prénoms</label>
                  <input
                    type="text"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Matricule MENA</label>
                  <input
                    type="text"
                    value={studentForm.studentId}
                    onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg font-mono font-bold text-red-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Date de Naissance</label>
                  <input
                    type="text"
                    value={studentForm.birthDate}
                    onChange={(e) => setStudentForm({ ...studentForm, birthDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Lieu de Naissance</label>
                  <input
                    type="text"
                    value={studentForm.birthPlace}
                    onChange={(e) => setStudentForm({ ...studentForm, birthPlace: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-bold text-slate-600 block mb-1">Numéro & Date de l'Acte de Naissance</label>
                  <input
                    type="text"
                    value={studentForm.birthCertificateNumber}
                    onChange={(e) => setStudentForm({ ...studentForm, birthCertificateNumber: e.target.value })}
                    placeholder="Ex: 3913 DU 27/03/2006 ETABLI A ABOBO"
                    className="w-full p-2 bg-slate-50 border rounded-lg font-semibold uppercase"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Statut d'Affectation</label>
                  <select
                    value={studentForm.assignedStatus}
                    onChange={(e) => setStudentForm({ ...studentForm, assignedStatus: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg font-bold"
                  >
                    <option value="affecte">Affecté(e) par l'État</option>
                    <option value="non_affecte">Non Affecté(e) (Payant)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Téléphone Principal Parent</label>
                  <input
                    type="text"
                    value={studentForm.parentPhone}
                    onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1 text-blue-600">Téléphone du Père</label>
                  <input
                    type="text"
                    value={studentForm.fatherPhone}
                    onChange={(e) => setStudentForm({ ...studentForm, fatherPhone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-blue-200 rounded-lg font-bold"
                    placeholder="Téléphone du père"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1 text-rose-500">Téléphone de la Mère</label>
                  <input
                    type="text"
                    value={studentForm.motherPhone}
                    onChange={(e) => setStudentForm({ ...studentForm, motherPhone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-rose-200 rounded-lg font-bold"
                    placeholder="Téléphone de la mère"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1 text-blue-600">Email du Père</label>
                  <input
                    type="email"
                    value={studentForm.fatherEmail}
                    onChange={(e) => setStudentForm({ ...studentForm, fatherEmail: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-blue-200 rounded-lg font-bold"
                    placeholder="Email du père"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1 text-rose-500">Email de la Mère</label>
                  <input
                    type="email"
                    value={studentForm.motherEmail}
                    onChange={(e) => setStudentForm({ ...studentForm, motherEmail: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-rose-200 rounded-lg font-bold"
                    placeholder="Email de la mère"
                  />
                </div>
                <div>
                  <label className="font-bold text-blue-600 block mb-1">Nom et Prénoms du Père</label>
                  <input
                    type="text"
                    value={studentForm.fatherName}
                    onChange={(e) => setStudentForm({ ...studentForm, fatherName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-blue-200 rounded-lg font-bold"
                    placeholder="Nom du père"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Profession du Père</label>
                  <input
                    type="text"
                    value={studentForm.fatherProfession}
                    onChange={(e) => setStudentForm({ ...studentForm, fatherProfession: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                    placeholder="Profession"
                  />
                </div>
                <div>
                  <label className="font-bold text-rose-500 block mb-1">Nom et Prénoms de la Mère</label>
                  <input
                    type="text"
                    value={studentForm.motherName}
                    onChange={(e) => setStudentForm({ ...studentForm, motherName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-rose-200 rounded-lg font-bold"
                    placeholder="Nom de la mère"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Profession de la Mère</label>
                  <input
                    type="text"
                    value={studentForm.motherProfession}
                    onChange={(e) => setStudentForm({ ...studentForm, motherProfession: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                    placeholder="Profession"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Situation des Parents</label>
                  <select
                    value={studentForm.maritalStatus}
                    onChange={(e) => setStudentForm({ ...studentForm, maritalStatus: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg font-bold"
                  >
                    <option value="unis">Parents unis</option>
                    <option value="separes">Parents séparés</option>
                    <option value="parent_unique">Parent unique</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">Nom du Parent / Tuteur Légal</label>
                  <input
                    type="text"
                    value={studentForm.parentName}
                    onChange={(e) => setStudentForm({ ...studentForm, parentName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="font-bold text-slate-600 block mb-1">Adresse de Résidence</label>
                  <input
                    type="text"
                    value={studentForm.parentAddress}
                    onChange={(e) => setStudentForm({ ...studentForm, parentAddress: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-lg"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                  <label className="font-bold text-slate-600 block mb-1">Antécédents médicaux, psychologiques, familiaux ou autres</label>
                  <textarea
                    rows={2}
                    value={studentForm.medicalHistory}
                    onChange={(e) => setStudentForm({ ...studentForm, medicalHistory: e.target.value })}
                    placeholder="Saisir les antécédents médicaux, psychologiques, familiaux ou autres..."
                    className="w-full p-2 bg-slate-50 border rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* SECTION SIGNATURES ET CACHET / TAMPON */}
              <div className="border-t border-slate-200 pt-4 mt-2">
                <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileCheck size={16} className="text-emerald-600" />
                  Signatures & Cachet d'Établissement (Visas Officiels)
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* 1. Professeur Principal Signature */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-emerald-900 block text-[11px] uppercase">Professeur Principal</span>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nom du Professeur Principal</label>
                      <input
                        type="text"
                        value={studentForm.mainTeacherName}
                        onChange={(e) => setStudentForm({ ...studentForm, mainTeacherName: e.target.value })}
                        placeholder="Ex: M. YALE ARLON"
                        className="w-full p-2 bg-white border rounded-lg font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Signature du Prof. Principal (Texte)</label>
                      <input
                        type="text"
                        value={studentForm.teacherSignature}
                        onChange={(e) => setStudentForm({ ...studentForm, teacherSignature: e.target.value })}
                        placeholder="Ex: Y. Arlon"
                        className="w-full p-2 bg-white border rounded-lg font-bold text-xs italic"
                      />
                      <p className="text-[9px] text-slate-500 mt-1 leading-tight font-medium">Laissez vide pour signer manuellement au stylo (bic) après l'impression.</p>
                    </div>
                  </div>

                  {/* 2. Directeur des Études Signature */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-emerald-900 block text-[11px] uppercase">Directeur des Études</span>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Nom du Directeur des Études</label>
                      <input
                        type="text"
                        value={studentForm.directorName}
                        onChange={(e) => setStudentForm({ ...studentForm, directorName: e.target.value })}
                        placeholder="Ex: M. TRAORÉ KASSIM"
                        className="w-full p-2 bg-white border rounded-lg font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Signature du Directeur (Texte)</label>
                      <input
                        type="text"
                        value={studentForm.directorSignature}
                        onChange={(e) => setStudentForm({ ...studentForm, directorSignature: e.target.value })}
                        placeholder="Ex: T. Kassim"
                        className="w-full p-2 bg-white border rounded-lg font-bold text-xs italic"
                      />
                      <p className="text-[9px] text-slate-500 mt-1 leading-tight font-medium">Laissez vide pour signer manuellement au stylo (bic) après l'impression.</p>
                    </div>
                  </div>

                  {/* 3. Cachet / Tampon (Le Guichet / Emplacement Vierge) */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="font-bold text-emerald-900 block text-[11px] uppercase">Emplacement Cachet / Tampon</span>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Mode d'affichage du Cachet</label>
                      <select
                        value={studentForm.stampMode || 'blank'}
                        onChange={(e) => setStudentForm({ ...studentForm, stampMode: e.target.value })}
                        className="w-full p-2 bg-white border rounded-lg font-bold text-xs"
                      >
                        <option value="blank">Zone Vierge (Tampon physique à l'impression)</option>
                        <option value="digital">Tampon Numérique Officiel (Affiché)</option>
                      </select>
                      <p className="text-[9.5px] text-slate-500 italic mt-1.5">
                        Laissez en "Zone Vierge" pour permettre au Directeur d'apposer son tampon encreur physique après impression.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MAIN SCREEN DISPLAY & PRINTABLE DOCUMENT CONTAINER */}
          <div className="flex justify-center">
            <style>{`
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 4mm 6mm !important;
                }
                body {
                  background: #ffffff !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                #printable-fiche-identite {
                  width: 100% !important;
                  max-width: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  border: none !important;
                  box-shadow: none !important;
                  border-radius: 0 !important;
                }
              }
            `}</style>
            <div 
              id="printable-fiche-identite"
              className="bg-white border print:border-none border-slate-300 p-8 print:p-2 shadow-xl print:shadow-none w-full max-w-[960px] print:max-w-none text-slate-900 rounded-2xl print:rounded-none space-y-5 print:space-y-3 print:text-[11px]"
            >
              {/* HEADER OFFICIAL REPUBLIC OF IVORY COAST */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3 print:pb-2">
                <div className="text-left space-y-0.5 text-[10px] print:text-[10px] font-bold uppercase">
                  <p className="text-slate-900 font-extrabold text-xs print:text-[11px]">RÉPUBLIQUE DE CÔTE D'IVOIRE</p>
                  <p className="text-slate-500 text-[9px] print:text-[9px]">Union - Discipline - Travail</p>
                  <p className="text-emerald-800 font-black mt-0.5">MINISTÈRE DE L'ÉDUCATION NATIONALE</p>
                  <p className="text-slate-700">ET DE L'ALPHABÉTISATION (MENA)</p>
                  <p className="text-slate-600 text-[9px] print:text-[9px]">DRE: ABIDJAN 3 - YOPOUGON</p>
                </div>

                <div className="text-center">
                  <div className="inline-block px-4 py-1.5 print:px-3 print:py-1 bg-emerald-700 text-white rounded-lg font-black text-sm print:text-sm tracking-wide uppercase shadow-2xs">
                    FICHE D'IDENTIFICATION DE L'ÉLÈVE
                  </div>
                  <p className="text-[10px] print:text-[10px] font-mono font-bold text-slate-500 mt-0.5">Année Scolaire 2025 - 2026</p>
                  <p className="text-[9px] print:text-[9px] font-bold text-emerald-900 uppercase tracking-widest mt-0.5">DOSSIER SCOLAIRE PERMANENT</p>
                </div>

                <div className="text-right text-[10px] print:text-[10px] space-y-0.5">
                  <h3 className="font-black text-xs print:text-[11px] text-slate-900 uppercase">Collège Faoummaba</h3>
                  <p className="text-slate-600 text-[9px] print:text-[9px]">Yopougon Sicogi - Abidjan</p>
                  <p className="text-slate-600 text-[9px] print:text-[9px]">Tél.: 07 59 84 45 61 / 27 23 45 67</p>
                  <p className="font-mono font-bold text-slate-800 text-[9px] print:text-[9px] mt-0.5">Code Établissement: 014892</p>
                </div>
              </div>

              {/* TOP HERO PROFILE SECTION */}
              <div className="grid grid-cols-12 gap-5 print:gap-4 items-start bg-slate-50/80 p-4 print:p-3 rounded-xl print:rounded-md border border-slate-200">
                {/* Photo & Badge */}
                <div className="col-span-12 sm:col-span-3 flex flex-col items-center justify-center text-center border-r-0 sm:border-r border-slate-200 pr-0 sm:pr-3">
                  <div className="w-28 h-32 print:w-20 print:h-24 rounded-xl print:rounded-md overflow-hidden border-2 print:border border-emerald-600 shadow-2xs bg-white mb-1 relative">
                    <img 
                      src={studentForm.photoUrl || `https://i.pravatar.cc/150?u=${selectedStudent.id}`} 
                      alt={studentForm.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-700/90 text-white text-[8px] print:text-[8px] font-bold py-0.5">
                      PHOTO OFFICIELLE
                    </div>
                  </div>
                  <span className="text-xs print:text-[10px] font-mono font-black text-emerald-950 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    {studentForm.studentId}
                  </span>
                  <span className="text-[9.5px] print:text-[9px] font-bold text-slate-500 mt-0.5">Matricule National</span>
                </div>

                {/* Identity Summary */}
                <div className="col-span-12 sm:col-span-9 space-y-2 print:space-y-2">
                  <div className="flex flex-wrap justify-between items-start gap-2 border-b border-slate-200 pb-1.5 print:pb-2">
                    <div>
                      <h2 className="text-xl print:text-lg font-black text-slate-900 tracking-tight uppercase">{studentForm.name}</h2>
                      <p className="text-xs print:text-xs font-semibold text-slate-600 mt-0.5 flex items-center gap-2">
                        <span>Classe: <strong className="text-emerald-700 font-bold text-sm print:text-sm">{studentForm.class}</strong></span>
                        <span>•</span>
                        <span>Prof. Principal: <strong>{mainTeacher ? mainTeacher.name : 'M. Yale Arlon'}</strong></span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs print:text-[10px] font-black uppercase tracking-wider ${
                        studentForm.assignedStatus === 'non_affecte' 
                          ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}>
                        {studentForm.assignedStatus === 'non_affecte' ? 'Non Affecté(e)' : 'Élève Affecté(e)'}
                      </span>
                    </div>
                  </div>

                  {/* Key Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 print:gap-x-3 print:gap-y-1.5 text-xs print:text-[11px]">
                    <div>
                      <span className="text-[9.5px] print:text-[9px] font-bold text-slate-400 uppercase block">Date & Lieu de Naissance</span>
                      <p className="font-bold text-slate-800">{studentForm.birthDate} à {studentForm.birthPlace}</p>
                    </div>

                    <div>
                      <span className="text-[9.5px] print:text-[9px] font-bold text-slate-400 uppercase block">Acte de Naissance</span>
                      <p className="font-bold text-slate-800">
                        {studentForm.birthCertificateNumber || '-'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[9.5px] print:text-[9px] font-bold text-slate-400 uppercase block">Genre & Nationalité</span>
                      <p className="font-bold text-slate-800">{studentForm.gender === 'F' ? 'Féminin (F)' : 'Masculin (M)'} • {studentForm.nationality || '-'}</p>
                    </div>

                    <div>
                      <span className="text-[9.5px] print:text-[9px] font-bold text-slate-400 uppercase block">Régime Scolaire</span>
                      <p className="font-bold text-slate-800">{studentForm.regime || '-'}</p>
                    </div>

                    <div>
                      <span className="text-[9.5px] print:text-[9px] font-bold text-slate-400 uppercase block">Redoublant(e)</span>
                      <p className="font-bold text-slate-800">{studentForm.isRedoublant || 'Non'}</p>
                    </div>

                    <div>
                      <span className="text-[9.5px] print:text-[9px] font-bold text-slate-400 uppercase block">Statut Boursier</span>
                      <p className="font-bold text-slate-800">{studentForm.isBoursier || 'Non'}</p>
                    </div>

                    <div>
                      <span className="text-[9.5px] print:text-[9px] font-bold text-slate-400 uppercase block">Année d'Entrée</span>
                      <p className="font-bold text-slate-800">{studentForm.entryYear || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 1: PARENTS & GUARDIANS CONTACTS */}
              <div className="border border-slate-300 rounded-xl print:rounded-md p-3.5 print:p-3 bg-white space-y-2 print:space-y-3">
                <h3 className="text-xs print:text-[11px] font-black text-emerald-900 uppercase tracking-wider border-b border-slate-200 pb-1 print:pb-1 flex items-center gap-2">
                  <Phone size={14} className="text-emerald-700" />
                  Informations Générales sur la Famille & Contacts Tuteur
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 print:grid-cols-4 gap-3 print:gap-3 text-xs print:text-xs">
                  <div>
                    <span className="text-[9.5px] print:text-[9px] font-bold text-slate-400 uppercase block">Nom du Parent / Tuteur Légal</span>
                    <p className="font-bold text-slate-900">{studentForm.parentName || '-'}</p>
                    <p className="text-[10px] print:text-[9px] text-slate-500">{studentForm.parentProfession || ''}</p>
                  </div>

                  <div>
                    <span className="text-[9.5px] print:text-[9px] font-bold text-slate-400 uppercase block">Téléphone Principal</span>
                    <p className="font-mono font-bold text-emerald-800 text-xs print:text-[11px]">{studentForm.parentPhone || '-'}</p>
                    <p className="text-[10px] print:text-[9px] text-slate-500">{studentForm.parentEmail || ''}</p>
                  </div>

                  <div>
                    <span className="text-[9.5px] print:text-[9px] font-bold text-blue-500 uppercase block">Contact du Père</span>
                    <p className="font-mono font-bold text-blue-900 text-xs print:text-[11px]">{studentForm.fatherPhone || '-'}</p>
                    {studentForm.fatherEmail && <p className="text-[10px] print:text-[9px] text-slate-500">{studentForm.fatherEmail}</p>}
                  </div>

                  <div>
                    <span className="text-[9.5px] print:text-[9px] font-bold text-rose-500 uppercase block">Contact de la Mère</span>
                    <p className="font-mono font-bold text-rose-900 text-xs print:text-[11px]">{studentForm.motherPhone || '-'}</p>
                    {studentForm.motherEmail && <p className="text-[10px] print:text-[9px] text-slate-500">{studentForm.motherEmail}</p>}
                  </div>

                  <div className="sm:col-span-4 print:col-span-4 border-t border-slate-100 pt-1">
                    <span className="text-[9.5px] print:text-[9px] font-bold text-slate-400 uppercase block">Adresse Domicile</span>
                    <p className="font-bold text-slate-800">{studentForm.parentAddress || '-'}</p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg print:rounded-md p-2 print:p-2 flex items-center justify-between text-xs print:text-xs">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                    <AlertCircle size={14} className="text-amber-600 shrink-0" />
                    <span>Contact en cas d'Urgence médicale ou disciplinaire:</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900">
                    {studentForm.emergencyContactName || '-'} {studentForm.emergencyPhone ? `(${studentForm.emergencyPhone})` : ''}
                  </div>
                </div>
              </div>

              {/* NOUVEAUX TABLEAUX : ANTECEDENTS & PARENTS BIOLOGIQUES */}
              <div className="space-y-3 print:space-y-3">
                {/* TABLEAU 1: Antécédents + Situation des parents */}
                <div className="border border-slate-300 rounded-xl print:rounded-md bg-white shadow-2xs overflow-hidden">
                  <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-50/90 text-xs print:text-[11px] font-black text-emerald-900 uppercase tracking-wider">
                    <div className="col-span-8 p-2 print:p-2 border-r border-slate-200 flex items-center gap-1.5">
                      <Activity size={14} className="text-emerald-700 shrink-0" />
                      <span>Antécédents médicaux, psychologiques, familiaux ou autres</span>
                    </div>
                    <div className="col-span-4 p-2 print:p-2 flex items-center gap-1.5 justify-center">
                      <Users size={14} className="text-emerald-700 shrink-0" />
                      <span>Situation des parents</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 text-xs print:text-xs">
                    {/* Antécédents input / display */}
                    <div className="col-span-8 p-2.5 print:p-2 border-r border-slate-200">
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={studentForm.medicalHistory}
                          onChange={(e) => setStudentForm({ ...studentForm, medicalHistory: e.target.value })}
                          placeholder="Saisir les antécédents médicaux, psychologiques, familiaux ou autres..."
                          className="w-full h-full p-1.5 border border-slate-300 rounded-md text-xs bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                        />
                      ) : (
                        <div className="min-h-[40px] print:min-h-[40px] whitespace-pre-wrap font-medium text-slate-800 leading-snug">
                          {studentForm.medicalHistory || <span className="text-slate-400 italic">Aucun antécédent particulier signalé.</span>}
                        </div>
                      )}
                    </div>

                    {/* Checkboxes Situation des parents */}
                    <div className="col-span-4 p-1.5 print:p-2 bg-slate-50/40 flex flex-col justify-center gap-1 text-xs print:text-[10px] font-bold">
                      <div 
                        onClick={() => setStudentForm({ ...studentForm, maritalStatus: 'unis' })}
                        className={`p-1.5 print:p-1 rounded-md border transition-all flex items-center justify-between cursor-pointer ${
                          studentForm.maritalStatus === 'unis' 
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="font-bold">Parents unis</span>
                        <input 
                          type="checkbox" 
                          checked={studentForm.maritalStatus === 'unis'} 
                          onChange={() => setStudentForm({ ...studentForm, maritalStatus: 'unis' })}
                          className="w-3.5 h-3.5 accent-emerald-700 cursor-pointer"
                        />
                      </div>

                      <div 
                        onClick={() => setStudentForm({ ...studentForm, maritalStatus: 'separes' })}
                        className={`p-1.5 print:p-1 rounded-md border transition-all flex items-center justify-between cursor-pointer ${
                          studentForm.maritalStatus === 'separes' 
                            ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-2xs' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="font-bold">Parents séparés</span>
                        <input 
                          type="checkbox" 
                          checked={studentForm.maritalStatus === 'separes'} 
                          onChange={() => setStudentForm({ ...studentForm, maritalStatus: 'separes' })}
                          className="w-3.5 h-3.5 accent-emerald-700 cursor-pointer"
                        />
                      </div>

                      <div 
                        onClick={() => setStudentForm({ ...studentForm, maritalStatus: 'parent_unique' })}
                        className={`p-1.5 print:p-1 rounded-md border transition-all flex items-center justify-between cursor-pointer ${
                          studentForm.maritalStatus === 'parent_unique' 
                            ? 'bg-purple-50 border-purple-300 text-purple-900 shadow-2xs' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="font-bold">Parent unique</span>
                        <input 
                          type="checkbox" 
                          checked={studentForm.maritalStatus === 'parent_unique'} 
                          onChange={() => setStudentForm({ ...studentForm, maritalStatus: 'parent_unique' })}
                          className="w-3.5 h-3.5 accent-emerald-700 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* TABLEAU 2: Parents biologiques */}
                <div className="border border-slate-300 rounded-xl print:rounded-md bg-white shadow-2xs overflow-hidden">
                  {/* Header Title */}
                  <div className="p-2 print:p-2 bg-slate-50/90 border-b border-slate-200 text-xs print:text-[11px] font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={14} className="text-emerald-700 shrink-0" />
                    <span>Parents Biologiques</span>
                  </div>

                  {/* Column Headers */}
                  <div className="grid grid-cols-12 border-b border-slate-200 bg-slate-100/70 text-[11px] print:text-[10px] font-bold text-slate-700 text-center py-1.5 print:py-1.5 px-1">
                    <div className="col-span-2 border-r border-slate-200">Parent</div>
                    <div className="col-span-4 border-r border-slate-200">Nom et prénoms</div>
                    <div className="col-span-1 border-r border-slate-200">Feu(e)</div>
                    <div className="col-span-2 border-r border-slate-200">Profession</div>
                    <div className="col-span-2 border-r border-slate-200">Contact</div>
                    <div className="col-span-1">Signature</div>
                  </div>

                  {/* Ligne Père */}
                  <div className="grid grid-cols-12 border-b border-slate-200 items-center text-xs print:text-xs py-1.5 print:py-1.5 px-1 hover:bg-slate-50/50 transition-colors">
                    <div className="col-span-2 text-center border-r border-slate-200 px-1">
                      <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-black text-[10px] print:text-[9.5px]">
                        Père
                      </span>
                    </div>

                    <div className="col-span-4 border-r border-slate-200 px-1.5 font-bold text-slate-900">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={studentForm.fatherName} 
                          onChange={(e) => setStudentForm({ ...studentForm, fatherName: e.target.value })} 
                          placeholder="Nom et prénoms du père"
                          className="w-full p-1 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white font-bold"
                        />
                      ) : (
                        studentForm.fatherName || <span className="text-slate-400 font-normal italic">-</span>
                      )}
                    </div>

                    <div className="col-span-1 border-r border-slate-200 text-center flex items-center justify-center">
                      <label className="flex items-center gap-0.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={!!studentForm.fatherDeceased} 
                          onChange={(e) => setStudentForm({ ...studentForm, fatherDeceased: e.target.checked })}
                          className="w-3.5 h-3.5 accent-slate-800 cursor-pointer"
                        />
                        {studentForm.fatherDeceased && <span className="text-[9px] font-bold text-red-600">Décédé</span>}
                      </label>
                    </div>

                    <div className="col-span-2 border-r border-slate-200 px-1.5 text-slate-800 font-medium">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={studentForm.fatherProfession} 
                          onChange={(e) => setStudentForm({ ...studentForm, fatherProfession: e.target.value })} 
                          placeholder="Profession"
                          className="w-full p-1 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white"
                        />
                      ) : (
                        studentForm.fatherProfession || <span className="text-slate-400 font-normal italic">-</span>
                      )}
                    </div>

                    <div className="col-span-2 border-r border-slate-200 px-1.5 font-mono font-bold text-emerald-800">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={studentForm.fatherPhone} 
                          onChange={(e) => setStudentForm({ ...studentForm, fatherPhone: e.target.value })} 
                          placeholder="Téléphone"
                          className="w-full p-1 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white font-mono"
                        />
                      ) : (
                        studentForm.fatherPhone || <span className="text-slate-400 font-normal italic">-</span>
                      )}
                    </div>

                    <div className="col-span-1 text-center text-[9px] text-slate-300 font-serif italic">
                      {/* Zone signature */}
                    </div>
                  </div>

                  {/* Ligne Mère */}
                  <div className="grid grid-cols-12 items-center text-xs print:text-xs py-1.5 print:py-1.5 px-1 hover:bg-slate-50/50 transition-colors">
                    <div className="col-span-2 text-center border-r border-slate-200 px-1">
                      <span className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-900 font-black text-[10px] print:text-[9.5px]">
                        Mère
                      </span>
                    </div>

                    <div className="col-span-4 border-r border-slate-200 px-1.5 font-bold text-slate-900">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={studentForm.motherName} 
                          onChange={(e) => setStudentForm({ ...studentForm, motherName: e.target.value })} 
                          placeholder="Nom et prénoms de la mère"
                          className="w-full p-1 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white font-bold"
                        />
                      ) : (
                        studentForm.motherName || <span className="text-slate-400 font-normal italic">-</span>
                      )}
                    </div>

                    <div className="col-span-1 border-r border-slate-200 text-center flex items-center justify-center">
                      <label className="flex items-center gap-0.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={!!studentForm.motherDeceased} 
                          onChange={(e) => setStudentForm({ ...studentForm, motherDeceased: e.target.checked })}
                          className="w-3.5 h-3.5 accent-slate-800 cursor-pointer"
                        />
                        {studentForm.motherDeceased && <span className="text-[9px] font-bold text-red-600">Décédée</span>}
                      </label>
                    </div>

                    <div className="col-span-2 border-r border-slate-200 px-1.5 text-slate-800 font-medium">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={studentForm.motherProfession} 
                          onChange={(e) => setStudentForm({ ...studentForm, motherProfession: e.target.value })} 
                          placeholder="Profession"
                          className="w-full p-1 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white"
                        />
                      ) : (
                        studentForm.motherProfession || <span className="text-slate-400 font-normal italic">-</span>
                      )}
                    </div>

                    <div className="col-span-2 border-r border-slate-200 px-1.5 font-mono font-bold text-emerald-800">
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={studentForm.motherPhone} 
                          onChange={(e) => setStudentForm({ ...studentForm, motherPhone: e.target.value })} 
                          placeholder="Téléphone"
                          className="w-full p-1 border border-slate-300 rounded text-xs bg-slate-50 focus:bg-white font-mono"
                        />
                      ) : (
                        studentForm.motherPhone || <span className="text-slate-400 font-normal italic">-</span>
                      )}
                    </div>

                    <div className="col-span-1 text-center text-[9px] text-slate-300 font-serif italic">
                      {/* Zone signature */}
                    </div>
                  </div>
                </div>
              </div>

              {/* OBSERVATIONS & SIGNATURES */}
              <div className="border border-slate-300 rounded-xl print:rounded-md p-3.5 print:p-3 bg-slate-50/50 space-y-2 print:space-y-2">
                <h4 className="text-xs print:text-xs font-black text-slate-900 uppercase border-b border-slate-200 pb-0.5 print:pb-1">
                  Observations de l'Établissement & Visa du Directeur
                </h4>
                <p className="text-xs print:text-xs italic text-slate-700 bg-white p-2 print:p-2 rounded-md border border-slate-200">
                  {studentForm.observation ? `"${studentForm.observation}"` : 'Aucune observation saisie pour le moment.'}
                </p>

                <DirectorSignatureStamp 
                  teacherName={studentForm.mainTeacherName || (mainTeacher ? mainTeacher.name : 'M. YALE ARLON')} 
                  teacherSignature={studentForm.teacherSignature}
                  directorName={studentForm.directorName || 'M. TRAORÉ KASSIM'} 
                  directorSignature={studentForm.directorSignature}
                  stampMode={studentForm.stampMode || 'blank'}
                  className="pt-1 print:pt-1"
                />
              </div>

              {/* FOOTER BARCODE */}
              <div className="pt-1 print:pt-1 border-t border-slate-200 flex justify-between items-center text-[9px] print:text-[9px] font-mono text-slate-400">
                <span>DOCUMENT OFFICIEL GÉNÉRÉ PAR SYSTÈME DE GESTION SCOLAIRE - COLLÈGE FAOUMMABA</span>
                <span>ID SYSTEM: STU-{selectedStudent.id}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
