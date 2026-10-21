import React, { useEffect, useMemo } from 'react';
import { Student } from '../types';
import { Printer, X, FileText } from 'lucide-react';
import { getClassPrincipalTeacherSignature } from '../src/utils/teacherUtils';
import { isTechnicalClass, calculateAnnualAverage, getDisciplineMarkFromStudent, getSubjectRankInClass, getStudentTrimesterAverage } from '../src/utils/academicUtils';
import { getSubjectCoef } from './TransactionList';

interface PrintableLivretProps {
  isOpen?: boolean;
  onClose?: () => void;
  student: Student;
  schoolName?: string;
  dre?: string;
  year?: string;
  teachers?: any[];
  currentUser?: any;
  allStudents?: Student[];
}

// Subjects definition matching Livret Scolaire Ivoirien
const RAW_DISCIPLINES = [
  { category: 'LETTRES', name: 'Composition Française', coef1: 3, coef2: 3, coef3: 3, isCategoryHeader: false },
  { category: 'LETTRES', name: 'Orthographe-Grammaire', coef1: 3, coef2: 3, coef3: 3, isCategoryHeader: false },
  { category: 'LETTRES', name: 'Expression Orale', coef1: 1, coef2: 1, coef3: 1, isCategoryHeader: false },
  { category: 'LETTRES', name: 'Philosophie', coef1: 2, coef2: 2, coef3: 2, isCategoryHeader: false },
  { category: 'LETTRES', name: 'Anglais', coef1: 1, coef2: 1, coef3: 1, isCategoryHeader: false },
  { category: 'LETTRES', name: 'Allemand / Espagnol', coef1: 1, coef2: 1, coef3: 1, isCategoryHeader: false },
  { category: 'LETTRES', name: 'Histoire Géographie', coef1: 2, coef2: 2, coef3: 2, isCategoryHeader: false },
  { category: 'LETTRES', name: 'BILAN LETTRES', isBilan: true },

  { category: 'SCIENCES', name: 'Mathématiques', coef1: 4, coef2: 4, coef3: 4, isCategoryHeader: false },
  { category: 'SCIENCES', name: 'Physiques-Chimie', coef1: 4, coef2: 4, coef3: 4, isCategoryHeader: false },
  { category: 'SCIENCES', name: 'Sc. de la Vie et de la Terre', coef1: 4, coef2: 4, coef3: 4, isCategoryHeader: false },
  { category: 'SCIENCES', name: 'BILAN SCIENCES', isBilan: true },

  { category: 'AUTRES', name: 'Arts Plastiques / Education Musicale', coef1: 1, coef2: 1, coef3: 1, isCategoryHeader: false },
  { category: 'AUTRES', name: 'Education Phys. Sportive', coef1: 1, coef2: 1, coef3: 1, isCategoryHeader: false },
  { category: 'AUTRES', name: 'EDHC', coef1: 1, coef2: 1, coef3: 1, isCategoryHeader: false },
  { category: 'AUTRES', name: 'Informatique', coef1: 1, coef2: 1, coef3: 1, isCategoryHeader: false },
  { category: 'AUTRES', name: 'Conduite', coef1: 1, coef2: 1, coef3: 1, isCategoryHeader: false },
];

export const PrintableLivret: React.FC<PrintableLivretProps> = ({
  isOpen = true,
  onClose,
  student,
  schoolName = "Collège Faoummaba",
  dre = "DIRECTION REGIONALE D'ABIDJAN 3",
  year = "2025-2026",
  teachers = [],
  currentUser,
  allStudents = []
}) => {
  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow render before print if opened
    }
  }, [isOpen]);

  const isTech = isTechnicalClass(student?.class);
  const classPPInfo = useMemo(() => getClassPrincipalTeacherSignature(student?.class), [student?.class]);
  const effectiveTeacherSig = student?.teacherSignature || classPPInfo.signature;
  const effectiveTeacherName = student?.mainTeacherName || classPPInfo.teacherName || 'M. YALE ARLON';

  const classStudents = useMemo(() => {
    if (allStudents && allStudents.length > 0) {
      const matched = allStudents.filter(s => s.class === student?.class);
      return matched.length > 0 ? matched : [student];
    }
    return [student];
  }, [allStudents, student]);

  const disciplines = useMemo(() => {
    return RAW_DISCIPLINES.map(d => {
      if (d.isBilan) return { ...d, coef: 1, t1: null, t2: null, t3: null };
      
      const officialCoef = getSubjectCoef(student?.class, d.name) || d.coef1 || 1;
      const t1 = getDisciplineMarkFromStudent(student, '1er trim', d.name);
      const t2 = getDisciplineMarkFromStudent(student, '2ème trim', d.name);
      const t3 = getDisciplineMarkFromStudent(student, '3ème trim', d.name);

      return {
        ...d,
        coef: officialCoef,
        t1,
        t2,
        t3
      };
    });
  }, [student]);

  if (!isOpen || !student) return null;

  const handlePrint = () => {
    const printElement = document.getElementById('printable-livret-area');
    
    try {
      const win = window.open('', '_blank');
      if (win && printElement) {
        win.document.write(`
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="utf-8">
              <base href="${window.location.origin}/">
              <title>Livret Scolaire - ${student.name}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  @page { size: A4 landscape; margin: 4mm; }
                  .no-print { display: none !important; }
                  body { margin: 0 !important; padding: 0 !important; background: white !important; }
                  #printable-livret-area {
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 auto !important;
                    padding: 2mm 3mm !important;
                    box-sizing: border-box !important;
                    zoom: 0.94 !important;
                    font-size: 9.5px !important;
                  }
                }
                body { 
                  background-color: #f8fafc !important; 
                  color: black !important; 
                  font-family: system-ui, -apple-system, sans-serif; 
                  padding: 16px; 
                  margin: 0;
                }
              </style>
            </head>
            <body>
              <div class="no-print" style="margin-bottom: 16px; padding: 12px 16px; background-color: #1e40af; color: white; display: flex; justify-content: space-between; align-items: center; border-radius: 12px; font-family: sans-serif;">
                <div>
                  <strong style="font-size: 14px;">Impression Livret Scolaire</strong>
                  <p style="font-size: 12px; margin: 2px 0 0 0; color: #93c5fd;">${student.name} - Classe: ${student.class}</p>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button onclick="window.print()" style="padding: 8px 16px; background-color: #2563eb; color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                    Imprimer ce document
                  </button>
                  <button onclick="window.close()" style="padding: 8px 12px; background-color: #1e3a8a; color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
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
      console.error("Direct print error for livret", err);
    }
  };

  // Extract trimester averages if available
  const trim1Avg = getStudentTrimesterAverage(student, '1er trim') ?? student.trimesters?.['1er trim']?.average ?? null;
  const trim2Avg = getStudentTrimesterAverage(student, '2ème trim') ?? student.trimesters?.['2ème trim']?.average ?? null;
  const trim3Avg = getStudentTrimesterAverage(student, '3ème trim') ?? student.trimesters?.['3ème trim']?.average ?? null;

  // Compute annual average using official coefficients (T1: 1, T2: 2, T3: 2)
  const annualAvg = calculateAnnualAverage(trim1Avg, trim2Avg, trim3Avg, isTech);

  const fmt = (num: number | string | undefined | null) => {
    if (num === undefined || num === null || num === '') return '';
    const val = typeof num === 'string' ? parseFloat(num.replace(',', '.')) : num;
    if (isNaN(val)) return '';
    return val.toFixed(2).replace('.', ',');
  };

  const getTeacherForSubject = (subjectName: string) => {
    if (teachers && teachers.length > 0) {
      const match = teachers.find(t => {
        if (!t.subject) return false;
        const tSub = t.subject.toLowerCase();
        const sSub = subjectName.toLowerCase();
        return tSub.includes(sSub) || sSub.includes(tSub);
      });
      if (match) return match.name;
    }
    return '';
  };

  // Compute Bilans dynamically
  const calcCatBilan = (cat: string, trimKey: 't1' | 't2' | 't3') => {
    const items = disciplines.filter(d => d.category === cat && !d.isBilan);
    let totalScore = 0;
    let totalCoef = 0;
    items.forEach(it => {
      const mark = it[trimKey];
      if (mark !== null && mark !== undefined && !isNaN(mark)) {
        totalScore += mark * it.coef;
        totalCoef += it.coef;
      }
    });
    return totalCoef > 0 ? totalScore / totalCoef : null;
  };

  const lettresBilan = {
    t1: calcCatBilan('LETTRES', 't1'),
    t2: calcCatBilan('LETTRES', 't2'),
    t3: calcCatBilan('LETTRES', 't3'),
  };

  const sciencesBilan = {
    t1: calcCatBilan('SCIENCES', 't1'),
    t2: calcCatBilan('SCIENCES', 't2'),
    t3: calcCatBilan('SCIENCES', 't3'),
  };

  return (
    <div className="fixed inset-0 z-[500] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-livret-area, #printable-livret-area * {
            visibility: visible;
          }
          #printable-livret-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            margin: 0 !important;
            padding: 2mm 3mm !important;
            zoom: 0.94;
            background: white !important;
            color: black !important;
            font-size: 9.5px;
            overflow: hidden !important;
            box-sizing: border-box !important;
            border: none !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 landscape;
            margin: 4mm;
          }
        }
      `}</style>

      {/* Container Dialog */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-slate-900">
        
        {/* Action Header */}
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0 no-print border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Extrait du Livret Scolaire</h2>
              <p className="text-xs text-slate-400">{student.name} • Classe de {student.class || 'Tle D'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {currentUser?.role !== 'student' && currentUser?.accessLevel !== 1 && currentUser?.role !== 'teacher' && currentUser?.accessLevel !== 3 && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-sky-600/30"
              >
                <Printer size={18} />
                Imprimer le Livret
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Area */}
        <div className="flex-1 overflow-y-auto print:overflow-hidden print:h-full p-2 bg-slate-50 print:bg-white flex justify-center">
          
          <div 
            id="printable-livret-area" 
            className="bg-white border print:border-none border-slate-300 p-3 sm:p-4 shadow-md print:shadow-none w-full max-w-[1060px] print:max-w-none print:w-full print:h-full text-slate-900 font-sans text-[10.5px] leading-tight flex flex-col justify-between min-h-[640px] print:min-h-0"
          >
            {/* TOP HEADER */}
            <div>
              <div className="flex justify-between items-start mb-2 border-b-2 border-slate-900 pb-2">
                <div className="text-left font-bold text-[9px] uppercase space-y-0.5">
                  <p className="text-slate-800">MINISTERE DE L'EDUCATION NATIONALE, DE L'ALPHABÉTISATION ET DE L'ENSEIGNEMENT TECHNIQUE</p>
                  <p className="text-slate-600 text-[9px]">------------------</p>
                  <p className="text-slate-800">{dre}</p>
                </div>
                <div className="text-right">
                  <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase inline-block border-b-2 border-slate-900 pb-0.5">
                    EXTRAIT DU LIVRET SCOLAIRE <span className="text-sm font-bold text-slate-700 font-mono">Année Scolaire {year}</span>
                  </h1>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-1">NE PAS COLLER DANS LE LIVRET SCOLAIRE</p>
                </div>
              </div>

              {/* SCHOOL & STUDENT IDENTIFICATION BANNER */}
              <div className="grid grid-cols-12 gap-3 mb-3 items-stretch">
                {/* School Name */}
                <div className="col-span-4 border border-slate-400 p-2.5 rounded bg-slate-50/50 flex flex-col justify-center">
                  <h2 className="font-black text-sm text-slate-900 tracking-tight">{schoolName}</h2>
                  <p className="text-[9px] font-semibold text-slate-600 mt-1">31 BP 144 ABIDJAN 31 - Tél.: 07 59 84 45 61</p>
                </div>

                {/* Student Info Card */}
                <div className="col-span-6 border-2 border-blue-900 p-2.5 rounded bg-white relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-black text-blue-950 uppercase tracking-tight">{student.name}</h3>
                      <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
                        Né(e) le <span className="font-bold text-blue-900">{student.birthDate || '19-juil.-07'}</span> à <span className="font-bold text-blue-900">{student.birthPlace || 'Yopougon'}</span>
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-[9px] font-bold text-slate-700 flex-wrap">
                        <span>Redoublant: <strong className="text-blue-900">Non</strong></span>
                        <span>Boursier: <strong className="text-blue-900">Non</strong></span>
                        <span>Affecté(e): <strong className="text-blue-900">{student.assignedStatus === 'non_affecte' ? 'Non' : 'Oui'}</strong></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-500 block">Classe</span>
                      <span className="text-base font-black text-blue-900">{student.class || 'Tle D'}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-1 border-t border-slate-200 flex justify-between items-center text-[9px] font-bold">
                    <span>Matr.: <strong className="text-red-600 text-xs font-mono">{student.studentId || '19 754 354 C'}</strong></span>
                  </div>
                </div>

                {/* Student Photo Box */}
                <div className="col-span-2 border border-slate-400 p-1 rounded bg-white flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-20 bg-slate-200 rounded overflow-hidden mb-1 border border-slate-300">
                    <img src={student.photoUrl || `https://i.pravatar.cc/150?u=${student.id}`} alt={student.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[8px] font-bold text-blue-800 uppercase">DBPix Evaluation</span>
                </div>
              </div>

              {/* GRADES AND COEFFICIENTS TABLE */}
              <div className="overflow-x-auto mb-3">
                <table className="w-full border-collapse border border-slate-900 text-[9px] text-center">
                  <thead>
                    <tr className="bg-emerald-50 text-slate-900 font-bold border-b border-slate-900">
                      <th className="border border-slate-900 px-2 py-0.5 text-left w-48">DISCIPLINES</th>
                      {/* Trim / Sem 1 */}
                      <th colSpan={4} className="border border-slate-900 px-1 py-0.5 bg-emerald-100/60">{isTech ? '1er SEM.' : '1er TRIM.'}</th>
                      {/* Trim / Sem 2 */}
                      <th colSpan={4} className="border border-slate-900 px-1 py-0.5 bg-emerald-100/60">{isTech ? '2ème SEM.' : '2ème TRIM.'}</th>
                      {/* Trim 3 */}
                      <th colSpan={4} className="border border-slate-900 px-1 py-0.5 bg-emerald-100/60">{isTech ? 'N / A' : '3ème TRIM.'}</th>
                      {/* Annuel */}
                      <th colSpan={2} className="border-2 border-blue-900 px-1 py-0.5 bg-sky-100/80">Annuel</th>
                      <th className="border border-slate-900 px-2 py-0.5 text-left w-36">PROFESSEUR</th>
                      <th className="border border-slate-900 px-2 py-0.5 text-left w-32">APPRECIATION & VISA</th>
                    </tr>
                    <tr className="bg-slate-100 text-[9px] font-bold border-b border-slate-900">
                      <th className="border border-slate-900 px-2 py-0.5 text-left"></th>
                      {/* Trim 1 subheaders */}
                      <th className="border border-slate-900 px-1 py-0.5">MOY./20</th>
                      <th className="border border-slate-900 px-1 py-0.5">COEF.</th>
                      <th className="border border-slate-900 px-1 py-0.5">MOY COEF</th>
                      <th className="border border-slate-900 px-1 py-0.5">RANG</th>
                      {/* Trim 2 subheaders */}
                      <th className="border border-slate-900 px-1 py-0.5">MOY./20</th>
                      <th className="border border-slate-900 px-1 py-0.5">COEF.</th>
                      <th className="border border-slate-900 px-1 py-0.5">MOY COEF</th>
                      <th className="border border-slate-900 px-1 py-0.5">RANG</th>
                      {/* Trim 3 subheaders */}
                      <th className="border border-slate-900 px-1 py-0.5">MOY./20</th>
                      <th className="border border-slate-900 px-1 py-0.5">COEF.</th>
                      <th className="border border-slate-900 px-1 py-0.5">M. COEF</th>
                      <th className="border border-slate-900 px-1 py-0.5">RANG</th>
                      {/* Annuel subheaders */}
                      <th className="border-x-2 border-blue-900 border-b border-slate-900 px-1 py-0.5 bg-sky-50">Moy Ann.</th>
                      <th className="border-r-2 border-blue-900 border-b border-slate-900 px-1 py-0.5 bg-sky-50">RANG</th>
                      <th className="border border-slate-900 px-1 py-0.5 text-left"></th>
                      <th className="border border-slate-900 px-1 py-0.5 text-left"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {disciplines.map((item, idx) => {
                      if (item.isBilan) {
                        const bVal = item.category === 'LETTRES' ? lettresBilan : sciencesBilan;
                        const bAnn = calculateAnnualAverage(bVal.t1, bVal.t2, bVal.t3, isTech);
                        return (
                          <tr key={idx} className="bg-rose-50 font-black text-rose-800 border-y border-slate-900 text-[9px]">
                            <td className="border border-slate-900 px-2 py-0.5 text-left">{item.name}</td>
                            <td className="border border-slate-900 px-1 py-0.5">{fmt(bVal.t1)}</td>
                            <td colSpan={3} className="border border-slate-900"></td>
                            <td className="border border-slate-900 px-1 py-0.5">{fmt(bVal.t2)}</td>
                            <td colSpan={3} className="border border-slate-900"></td>
                            <td className="border border-slate-900 px-1 py-0.5">{fmt(bVal.t3)}</td>
                            <td colSpan={3} className="border border-slate-900"></td>
                            <td className="border-x-2 border-blue-900 px-1 py-0.5 bg-rose-100/60">
                              {fmt(bAnn)}
                            </td>
                            <td className="border-r-2 border-blue-900"></td>
                            <td colSpan={2} className="border border-slate-900"></td>
                          </tr>
                        );
                      }

                      const coef = item.coef || 1;
                      const moy1 = item.t1;
                      const moy2 = item.t2;
                      const moy3 = item.t3;

                      const moyCoef1 = moy1 !== null ? (moy1 * coef) : null;
                      const moyCoef2 = moy2 !== null ? (moy2 * coef) : null;
                      const moyCoef3 = moy3 !== null ? (moy3 * coef) : null;

                      const moyAnn = calculateAnnualAverage(moy1, moy2, moy3, isTech);

                      const rank1 = moy1 !== null ? getSubjectRankInClass(classStudents, student.id, '1er trim', item.name) : '';
                      const rank2 = moy2 !== null ? getSubjectRankInClass(classStudents, student.id, '2ème trim', item.name) : '';
                      const rank3 = moy3 !== null ? getSubjectRankInClass(classStudents, student.id, '3ème trim', item.name) : '';
                      const rankAnn = moyAnn !== null ? getSubjectRankInClass(classStudents, student.id, 'annuel', item.name) : '';

                      const teacherName = getTeacherForSubject(item.name);

                      const getApp = (m: number | null) => {
                        if (m === null) return '';
                        if (m < 8) return 'Faible';
                        if (m < 10) return 'Insuffisant';
                        if (m < 12) return 'Passable';
                        if (m < 14) return 'Assez Bonne';
                        if (m < 16) return 'Bien';
                        return 'Très Bien';
                      };

                      return (
                        <tr key={idx} className="hover:bg-slate-50 text-[9px]">
                          <td className="border border-slate-900 px-2 py-0.5 text-left font-semibold text-slate-900">{item.name}</td>
                          
                          {/* Trim 1 */}
                          <td className="border border-slate-900 px-1 py-0.5 font-bold">{fmt(moy1)}</td>
                          <td className="border border-slate-900 px-1 py-0.5 text-slate-600 font-mono">{moy1 !== null ? coef : ''}</td>
                          <td className="border border-slate-900 px-1 py-0.5 font-bold text-slate-800">{fmt(moyCoef1)}</td>
                          <td className="border border-slate-900 px-1 py-0.5 text-[9px] italic text-slate-500">{rank1}</td>
                          
                          {/* Trim 2 */}
                          <td className="border border-slate-900 px-1 py-0.5 font-bold">{fmt(moy2)}</td>
                          <td className="border border-slate-900 px-1 py-0.5 text-slate-600 font-mono">{moy2 !== null ? coef : ''}</td>
                          <td className="border border-slate-900 px-1 py-0.5 font-bold text-slate-800">{fmt(moyCoef2)}</td>
                          <td className="border border-slate-900 px-1 py-0.5 text-[9px] italic text-slate-500">{rank2}</td>

                          {/* Trim 3 */}
                          <td className="border border-slate-900 px-1 py-0.5 font-bold">{fmt(moy3)}</td>
                          <td className="border border-slate-900 px-1 py-0.5 text-slate-600 font-mono">{moy3 !== null ? coef : ''}</td>
                          <td className="border border-slate-900 px-1 py-0.5 font-bold text-slate-800">{fmt(moyCoef3)}</td>
                          <td className="border border-slate-900 px-1 py-0.5 text-[9px] italic text-slate-500">{rank3}</td>

                          {/* Annuel (Highlighted Blue Border Box) */}
                          <td className="border-x-2 border-blue-900 px-1 py-0.5 font-black text-blue-900 bg-sky-50">{fmt(moyAnn)}</td>
                          <td className="border-r-2 border-blue-900 px-1 py-0.5 text-[9px] italic text-blue-800 font-bold bg-sky-50">{rankAnn}</td>

                          <td className="border border-slate-900 px-2 py-0.5 text-left font-bold text-[9.5px] uppercase text-slate-800">{teacherName}</td>
                          <td className="border border-slate-900 px-2 py-0.5 text-left italic font-serif text-slate-800">{getApp(moyAnn)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* BOTTOM RECAPITULATIF & DECISION */}
              <div className="grid grid-cols-12 gap-3 items-stretch">
                {/* Recap Box */}
                <div className="col-span-5 border border-slate-900 rounded overflow-hidden">
                  <div className="bg-sky-100 border-b border-slate-900 px-3 py-0.5 text-center font-black text-slate-900 uppercase text-[9px]">
                    RECAPITULATIF DES RESULTATS
                  </div>
                  <div className="p-1 space-y-0.5 text-[9px] font-bold">
                    <div className="flex justify-between items-center bg-yellow-50/50 px-1 py-0.5 rounded border border-yellow-200">
                      <span>{isTech ? '1er Semestre' : '1er Trimestre'}</span>
                      <span className={`text-base font-black font-mono ${trim1Avg && trim1Avg >= 10 ? 'text-emerald-700' : (trim1Avg && trim1Avg < 10 ? 'text-red-600' : 'text-slate-900')}`}>{fmt(trim1Avg)}</span>
                      <span className="text-[9px] text-slate-600 font-normal">Rang: <strong className="font-bold text-slate-900">12e</strong> sur <strong>16</strong></span>
                    </div>
                    <div className="flex justify-between items-center bg-yellow-50/50 px-1 py-0.5 rounded border border-yellow-200">
                      <span>{isTech ? '2è Semestre' : '2è Trimestre'}</span>
                      <span className={`text-base font-black font-mono ${trim2Avg && trim2Avg >= 10 ? 'text-emerald-700' : (trim2Avg && trim2Avg < 10 ? 'text-red-600' : 'text-slate-900')}`}>{fmt(trim2Avg)}</span>
                      <span className="text-[9px] text-slate-600 font-normal">Rang: <strong className="font-bold text-slate-900">11e</strong> sur <strong>16</strong></span>
                    </div>
                    {!isTech && (
                      <div className="flex justify-between items-center bg-yellow-50/50 px-1 py-0.5 rounded border border-yellow-200">
                        <span>3è Trimestre</span>
                        <span className={`text-base font-black font-mono ${trim3Avg && trim3Avg >= 10 ? 'text-emerald-700' : (trim3Avg && trim3Avg < 10 ? 'text-red-600' : 'text-slate-900')}`}>{fmt(trim3Avg)}</span>
                        <span className="text-[9px] text-slate-600 font-normal">Rang: <strong className="font-bold text-slate-900">12e</strong> sur <strong>16</strong></span>
                      </div>
                    )}
                    <div className={`flex justify-between items-center px-1.5 py-0.5 rounded border-2 transition-colors ${
                      annualAvg !== null && annualAvg >= 10
                        ? 'bg-emerald-100/90 border-emerald-600 text-emerald-950'
                        : 'bg-rose-100 border-red-600 text-red-950'
                    }`}>
                      <span className="uppercase font-black text-[9px]">Moy. Annuelle</span>
                      <span className={`text-base font-black font-mono ${annualAvg !== null && annualAvg >= 10 ? 'text-emerald-700' : 'text-red-600'}`}>{fmt(annualAvg)}</span>
                      <span className="text-[9px] font-bold">Rang: <strong>12e</strong> sur <strong>16</strong></span>
                    </div>
                  </div>
                </div>

                {/* Decision Box */}
                <div className="col-span-7 border border-slate-900 rounded overflow-hidden flex flex-col justify-between">
                  <div className="bg-sky-100 border-b border-slate-900 px-3 py-0.5 text-center font-black text-slate-900 uppercase text-[9px]">
                    DECISION DE FIN D'ANNEE
                  </div>
                  <div className="flex-1 p-2 flex items-center justify-center bg-slate-50">
                    <span className="text-lg font-black italic font-serif text-slate-900 tracking-wide text-center">
                      {annualAvg >= 10 ? 'Admis(e) en classe supérieure' : 'Redouble en cas d\'échec'}
                    </span>
                  </div>
                  <div className="p-1 border-t border-slate-300 text-[8px] text-slate-500 font-mono text-left">
                    &lt;{student.name}&gt; - &lt;{student.studentId || '230122050257'}&gt; - {student.class || 'Tle D'} - Année Scolaire {year}
                  </div>
                </div>
              </div>

              {/* NEW SIGNATURE SECTION */}
              <div className="mt-1 pt-1 border-t border-slate-900 flex justify-between items-start text-[8px]">
                <div className="text-center space-y-1">
                  <p className="font-bold uppercase text-slate-800">Le Professeur Principal</p>
                  <p className="text-slate-500 italic text-[7px]">Visa & Signature</p>
                  <p className="font-black text-slate-900 uppercase mt-3">{effectiveTeacherName}</p>
                </div>
                
                <div className="text-center space-y-1">
                  <p className="font-bold uppercase text-slate-800">Cachet & Tampon Officiel</p>
                  <div className="w-24 h-12 border border-dashed border-slate-300 rounded mx-auto flex items-center justify-center">
                    <p className="text-slate-400 italic text-[6px] text-center px-1 leading-tight">Emplacement du Cachet<br/>(À apposer à l'impression)</p>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <p className="font-bold text-slate-700">Fait à Abidjan, le {new Date().toLocaleDateString('fr-FR')}</p>
                  <p className="font-bold uppercase text-slate-800">Le Directeur des Études</p>
                  <p className="font-black text-slate-900 uppercase mt-3">M. TRAORÉ KASSIM</p>
                </div>
              </div>
              
              {/* FOOTER DOC */}
              <div className="mt-0.5 text-[6px] text-slate-500 font-mono text-center uppercase border-t border-slate-200 pt-0.5">
                DOCUMENT OFFICIEL GÉNÉRÉ PAR SYSTÈME DE GESTION SCOLAIRE - COLLÈGE FAOUMMABA | ID SYSTEM: STU-{Date.now()}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
