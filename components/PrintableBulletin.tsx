import React, { useEffect } from 'react';
import { Student } from '../types';
import { getSubjectCoef } from './TransactionList';
import { Printer, X, Download, FileText, CheckCircle2 } from 'lucide-react';
import { getClassPrincipalTeacherSignature } from '../src/utils/teacherUtils';
import { getTeacherForSubject } from './SchedulePage';
import { getAutoAppreciation } from '../src/utils/bulletinUtils';
import { isTechnicalClass, calculateAnnualAverage, getStudentTrimesterAverage } from '../src/utils/academicUtils';

interface PrintableBulletinProps {
  currentUser?: any;
  isOpen?: boolean;
  onClose?: () => void;
  autoPrint?: boolean;
  student: Student;
  selectedTrimester?: string;
  augmentedSubjects: Array<{ name: string; average: number; value?: number }>;
  totalPoints: number;
  totalCoef: number;
  calculatedAverage: string;
  studentRank: number;
  totalClassSize: number;
  minAverage: number;
  maxAverage: number;
  unjustifiedAbsenceHours?: number;
  teachers?: any[];
  // Card Configuration props
  selectedAppreciation?: string | null;
  principalTeacherName?: string;
  teacherSignature?: string;
  isSignedByTeacher?: boolean;
  selectedDistinctions?: string[];
  selectedSanctions?: string[];
  faitA?: string;
  faitLe?: string;
  directorName?: string;
  signatureText?: string;
  stampImage?: string | null;
}

export const PrintableBulletin: React.FC<PrintableBulletinProps> = ({
  currentUser,
  isOpen = true,
  onClose,
  autoPrint = true,
  student,
  selectedTrimester = '1er trim',
  augmentedSubjects,
  totalPoints,
  totalCoef,
  calculatedAverage,
  studentRank,
  totalClassSize,
  minAverage,
  maxAverage,
  unjustifiedAbsenceHours = 0,
  teachers = [],
  selectedAppreciation,
  principalTeacherName,
  teacherSignature,
  isSignedByTeacher,
  selectedDistinctions,
  selectedSanctions,
  faitA,
  faitLe,
  directorName,
  signatureText,
  stampImage
}) => {

  useEffect(() => {
    if (isOpen && autoPrint) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrint]);

  if (!isOpen) return null;

  // Determine trimester label
  const getTrimesterTitle = (trimKey: string) => {
    if (trimKey.includes('1')) return 'PREMIER TRIMESTRE';
    if (trimKey.includes('2')) return 'DEUXIEME TRIMESTRE';
    if (trimKey.includes('3')) return 'TROISIEME TRIMESTRE';
    return trimKey.toUpperCase();
  };

  // Helper to format average numbers
  const fmtNum = (num: number | string) => {
    const val = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(val)) return '-';
    return val.toFixed(2).replace('.', ',');
  };

  // Helper to get appreciation based on grade
  const getAppreciation = (avg: number) => {
    if (avg >= 16) return 'Très bien';
    if (avg >= 14) return 'Bien';
    if (avg >= 12) return 'Assez bien';
    if (avg >= 10) return 'Acceptable';
    if (avg >= 8) return 'Insuffisant';
    return 'Faible';
  };

  const avgNum = parseFloat(calculatedAverage.replace(',', '.')) || 0;

  // Retrieve class-level signature if available
  const classPPInfo = getClassPrincipalTeacherSignature(student?.class);
  const effectiveTeacherSig = teacherSignature === "" || student?.teacherSignature === "" ? "" : (teacherSignature || student?.teacherSignature || classPPInfo.signature);
  const effectiveTeacherName = principalTeacherName === "" || student?.mainTeacherName === "" ? "" : (principalTeacherName || student?.mainTeacherName || classPPInfo.teacherName);
  const effectiveIsSigned = isSignedByTeacher || Boolean(effectiveTeacherSig);

  const isDistinctionChecked = (distKey: string) => {
    if (selectedDistinctions && selectedDistinctions.length > 0) {
      return selectedDistinctions.some(d => {
        const normD = d.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normKey = distKey.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normD.includes(normKey) || normKey.includes(normD);
      });
    }
    if (distKey.includes("Félicitation") || distKey.includes("félicitation")) return avgNum >= 16;
    if (distKey.includes("Encouragement") || distKey.includes("encouragement")) return avgNum >= 14 && avgNum < 16;
    if (distKey.includes("Tableau d'Honneur") || distKey.includes("tableau d'honneur")) return avgNum >= 12 && avgNum < 14;
    return false;
  };

  const isSanctionChecked = (sancKey: string) => {
    if (selectedSanctions && selectedSanctions.length > 0) {
      return selectedSanctions.some(s => {
        const normS = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const normKey = sancKey.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return normS.includes(normKey) || normKey.includes(normS);
      });
    }
    if (sancKey.toLowerCase().includes("avertissement travail")) return avgNum < 8.5 && avgNum >= 7;
    if (sancKey.toLowerCase().includes("blame travail")) return avgNum < 7;
    return false;
  };

  // Helper to find teacher for a subject
  const getTeacherName = (subjectName: string) => {
    if (subjectName.toLowerCase() === 'conduite' || subjectName.toLowerCase() === 'conduct') {
      return 'CONSEIL DE DISCIPLINE';
    }
    return getTeacherForSubject(subjectName, teachers, student?.class).name;
  };

  // Categorize subjects into Lettres, Sciences, Autres
  const lettresKeywords = ['philo', 'franç', 'anglais', 'lv1', 'lv2', 'allemand', 'espagnol', 'hist', 'géo', 'ortho', 'comp', 'exp'];
  const sciencesKeywords = ['math', 'physique', 'chimie', 'svt', 'scien'];

  const lettresSubjects = augmentedSubjects.filter(s => 
    lettresKeywords.some(k => s.name.toLowerCase().includes(k))
  );

  const sciencesSubjects = augmentedSubjects.filter(s => 
    sciencesKeywords.some(k => s.name.toLowerCase().includes(k))
  );

  const autresSubjects = augmentedSubjects.filter(s => 
    !lettresSubjects.includes(s) && !sciencesSubjects.includes(s)
  );

  const calcCatBilan = (subs: typeof augmentedSubjects) => {
    let pts = 0;
    let cfs = 0;
    subs.forEach(s => {
      if (s.inactive) return;
      const coef = getSubjectCoef(student.class, s.name);
      pts += (s.average || 0) * coef;
      cfs += coef;
    });
    return cfs > 0 ? (pts / cfs) : 0;
  };

  // Compute category averages and total points/coefs
  let lettresTotalCoef = 0;
  let lettresTotalPoints = 0;
  lettresSubjects.forEach(s => {
    if (s.inactive) return;
    const coef = getSubjectCoef(student.class, s.name);
    lettresTotalCoef += coef;
    lettresTotalPoints += (s.average || 0) * coef;
  });
  const bilanLettres = lettresTotalCoef > 0 ? (lettresTotalPoints / lettresTotalCoef) : 0;

  let sciencesTotalCoef = 0;
  let sciencesTotalPoints = 0;
  sciencesSubjects.forEach(s => {
    if (s.inactive) return;
    const coef = getSubjectCoef(student.class, s.name);
    sciencesTotalCoef += coef;
    sciencesTotalPoints += (s.average || 0) * coef;
  });
  const bilanSciences = sciencesTotalCoef > 0 ? (sciencesTotalPoints / sciencesTotalCoef) : 0;

  // Appreciation du conseil de classe
  const getConseilAppreciation = (avg: number) => {
    if (avg >= 16) return 'EXCELLENT TRAVAIL - FÉLICITATIONS';
    if (avg >= 14) return 'TRÈS BON TRAVAIL - ENCOURAGEMENTS';
    if (avg >= 12) return 'TRAVAIL SATISFAISANT';
    if (avg >= 10) return 'PASSABLE - PEUT MIEUX FAIRE';
    return 'TRAVAIL INSUFFISANT - EFFORTS REQUIS';
  };

  // 3rd Trimester / 2nd Semester & Annual Bilan calculations
  const isTech = isTechnicalClass(student?.class);
  const is3rdTrimester = isTech
    ? (selectedTrimester.includes('2') || 
       selectedTrimester.toLowerCase().includes('deux') || 
       selectedTrimester.toLowerCase().includes('2e') ||
       selectedTrimester.toLowerCase().includes('2ème') ||
       selectedTrimester.toLowerCase().includes('semestre 2'))
    : (selectedTrimester.includes('3') || 
       selectedTrimester.toLowerCase().includes('trois') || 
       selectedTrimester.toLowerCase().includes('3e') ||
       selectedTrimester.toLowerCase().includes('3ème'));
  const c1 = 1;
  const c2 = isTech ? 1 : 2;
  const c3 = isTech ? 1 : 2;

  const t1Val = getStudentTrimesterAverage(student, '1er trim') ?? student?.trimesters?.['1er trim']?.average ?? null;
  const t2Val = getStudentTrimesterAverage(student, '2ème trim') ?? student?.trimesters?.['2ème trim']?.average ?? null;

  const currentAvgNum = parseFloat(calculatedAverage.replace(',', '.')) || null;
  const t3Val = currentAvgNum ?? (getStudentTrimesterAverage(student, '3ème trim') ?? student?.trimesters?.['3ème trim']?.average ?? null);

  const t1MoyXC = t1Val !== null ? t1Val * c1 : null;
  const t2MoyXC = t2Val !== null ? t2Val * c2 : null;
  const t3MoyXC = t3Val !== null ? t3Val * c3 : null;

  const annualAverageNum = calculateAnnualAverage(t1Val, t2Val, t3Val, isTech);

  const t1Rank = student?.trimesters?.['1er trim']?.rank || `${studentRank}e`;
  const t2Rank = student?.trimesters?.['2ème trim']?.rank || `${studentRank}e`;
  const t3Rank = `${studentRank}e`;
  const annualRank = student?.annualRank || `${studentRank}e`;

  const fmtNumPad = (num: number | string | null | undefined) => {
    if (num === null || num === undefined || num === '') return '-';
    const val = typeof num === 'string' ? parseFloat(num.replace(',', '.')) : num;
    if (isNaN(val)) return '-';
    const formatted = val.toFixed(2).replace('.', ',');
    return (val < 10 && val >= 0) ? `0${formatted}` : formatted;
  };

  const getDecisionDeFinDannee = (annualAvg: number | null, studentClass?: string) => {
    if (annualAvg === null || isNaN(annualAvg)) return 'Admis(e)';
    if (annualAvg >= 10.0) {
      const cls = (studentClass || '').toUpperCase();
      if (cls.includes('6')) return 'Admis(e) en 5ème';
      if (cls.includes('5')) return 'Admis(e) en 4ème';
      if (cls.includes('4')) return 'Admis(e) en 3ème';
      if (cls.includes('3')) return 'Orienté(e) / Admis(e) en 2de';
      if (cls.includes('2')) return 'Admis(e) en 1ère';
      if (cls.includes('1')) return 'Admis(e) en Tle';
      if (cls.includes('T')) return 'Admis(e) au Supérieur';
      return 'Admis(e) en classe supérieure';
    } else if (annualAvg >= 8.5) {
      return 'Autorisé(e) à redoubler';
    } else {
      return 'Exclu(e) pour insuffisance';
    }
  };

  const isCompact = isTech || is3rdTrimester;
  const cellPad = isCompact ? 'p-0.5' : 'p-1';

  const handlePrint = () => {
    const printElement = document.getElementById('printable-bulletin');
    
    try {
      const win = window.open('', '_blank');
      if (win && printElement) {
        win.document.write(`
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="utf-8">
              <base href="${window.location.origin}/">
              <title>Bulletin Scolaire - ${student.name}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  @page { size: A4 portrait; margin: 3mm; zoom: 0.95; }
                  .no-print { display: none !important; }
                  body { margin: 0 !important; padding: 0 !important; background: white !important; }
                  #printable-bulletin {
                    width: 100% !important;
                    max-width: 100% !important;
                    min-height: 0 !important;
                    height: auto !important;
                    margin: 0 auto !important;
                    padding: 0 !important;
                    box-shadow: none !important;
                    border: none !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
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
              <div class="no-print" style="margin-bottom: 16px; padding: 12px 16px; background-color: #0f172a; color: white; display: flex; justify-content: space-between; align-items: center; border-radius: 12px; font-family: sans-serif; max-width: 210mm; margin-left: auto; margin-right: auto;">
                <div>
                  <strong style="font-size: 14px;">Impression du Bulletin Scolaire</strong>
                  <p style="font-size: 12px; margin: 2px 0 0 0; color: #38bdf8;">${student.name} - Classe: ${student.class} (${getTrimesterTitle(selectedTrimester)})</p>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button onclick="window.print()" style="padding: 8px 16px; background-color: #0284c7; color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                    Imprimer ce document
                  </button>
                  <button onclick="window.close()" style="padding: 8px 12px; background-color: #334155; color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
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
    <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-start p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:block print:overflow-visible">
      
      {/* TOP CONTROLS BAR (Hidden when printing) */}
      <div className="sticky top-0 z-10 w-full max-w-[210mm] bg-slate-900 text-white p-3 rounded-2xl shadow-xl flex items-center justify-between gap-3 mb-4 print:hidden border border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white">Aperçu de la Fiche Scolaire</h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Bulletin du {getTrimesterTitle(selectedTrimester)} • <strong className="text-sky-300">{student.name}</strong> ({student.class})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-sky-600/30 transition-all cursor-pointer active:scale-95"
          >
            <Printer size={16} />
            <span>Lancer l'impression</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              title="Fermer l'aperçu"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* A4 PRINTABLE BULLETIN CONTAINER */}
      <div 
        id="printable-bulletin" 
        className="w-full max-w-[210mm] min-h-[297mm] print:min-h-0 print:h-auto flex flex-col bg-white text-black font-sans shadow-2xl rounded-sm overflow-hidden print:shadow-none print:max-w-full print:p-0 print:m-0 print:rounded-none"
      >
        <div className="flex-1 bg-white p-4 sm:p-6 print:p-0 flex flex-col justify-between items-center">
          <div id="printable-bulletin-content" className={`border-2 border-black ${isCompact ? 'p-1 space-y-1' : 'p-1.5 space-y-1.5'} shrink-0 w-full my-auto`}>
          
          {/* HEADER TOP ROW */}
          <div className={`flex justify-between items-start border-b-2 border-black ${isCompact ? 'pb-1' : 'pb-2'}`}>
            {/* Left Block */}
            <div className="w-1/3 space-y-1">
              <p className="font-bold text-[9.5px] uppercase tracking-tighter">Ministère de l'Éducation Nationale</p>
              <div className="flex items-center gap-2 pt-1">
                <div className={`${isCompact ? 'w-10 h-10' : 'w-12 h-12'} flex items-center justify-center shrink-0`}>
                  <img src="icone.png" alt="Logo" className={`${isCompact ? 'w-10 h-10' : 'w-12 h-12'} object-contain`} />
                </div>
                <div className="text-[9px] font-bold leading-snug">
                  <p className="text-[10.5px] font-extrabold uppercase">COLLÈGE FAOUMMABA</p>
                  <p>Yopougon Niangon Sud Carrefour</p>
                  <p>Tél: 27 23 45 61 11 / 05 05 96 70 80</p>
                  <p>zangabeh@gmail.com • 31 BP 144 Abidjan 31</p>
                </div>
              </div>
            </div>

            {/* Center Title Block */}
            <div className="w-1/3 text-center flex flex-col items-center justify-center pt-1">
              <h1 className="text-xs sm:text-sm font-black underline uppercase tracking-wide border-2 border-black px-2.5 py-1.5 bg-slate-50">
                BULLETIN DU {getTrimesterTitle(selectedTrimester)}
              </h1>
            </div>

            {/* Right Block */}
            <div className="w-1/3 text-right flex flex-col items-end space-y-1">
              <p className="font-bold text-[9.5px] uppercase tracking-tighter">République de Côte d'Ivoire</p>
              <p className="text-[8px] italic font-semibold">Union - Discipline - Travail</p>
              
              {/* Student Photo */}
              <div className={`mt-1 ${isCompact ? 'w-16 h-20' : 'w-20 h-24'} border-2 border-black bg-slate-100 overflow-hidden flex items-center justify-center`}>
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[8px] text-slate-400 font-bold">PHOTO</span>
                )}
              </div>
            </div>
          </div>

          {/* STUDENT INFO BOX */}
          <div className={`border border-black ${isCompact ? 'text-[9px]' : 'text-[10px]'} grid grid-cols-12 divide-x divide-y divide-black bg-slate-50/50`}>
            <div className={`col-span-4 ${cellPad} flex gap-1`}>
              <span className="font-bold">Année Scolaire :</span>
              <span>2025-2026</span>
            </div>
            <div className={`col-span-4 ${cellPad} flex gap-1`}>
              <span className="font-bold">Classe :</span>
              <span className={`font-black ${isCompact ? 'text-xs' : 'text-sm'}`}>{student.class}</span>
            </div>
            <div className={`col-span-4 ${cellPad} flex justify-between items-center`}>
              <div>
                <span className="font-bold">Effectif :</span>
                <span className="ml-1 font-bold">{totalClassSize}</span>
              </div>
              <div className="font-black text-xs tracking-wider pr-1">{student.studentId}</div>
            </div>

            <div className={`col-span-12 ${cellPad} flex gap-2 border-t border-black`}>
              <span className="font-bold">Nom et Prénoms :</span>
              <span className={`font-black ${isCompact ? 'text-xs' : 'text-sm'} uppercase`}>{student.name}</span>
            </div>

            <div className={`col-span-6 ${cellPad} flex gap-1 border-t border-black`}>
              <span className="font-bold">Né (e) le :</span>
              <span>{student.birthDate}</span>
              <span className="font-bold ml-2">à :</span>
              <span>{student.birthPlace || 'Abidjan'}</span>
            </div>
            <div className={`col-span-6 ${cellPad} flex gap-1 border-t border-black`}>
              <span className="font-bold">Redoublant(e) :</span>
              <span>Non</span>
            </div>

            <div className={`col-span-4 ${cellPad} flex gap-1 border-t border-black`}>
              <span className="font-bold">NATIONALITÉ :</span>
              <span>{student.nationality || 'Ivoirienne'}</span>
            </div>
            <div className={`col-span-4 ${cellPad} flex gap-1 border-t border-black`}>
              <span className="font-bold">Affecté(e) :</span>
              <span className="font-black">✓</span>
            </div>
            <div className={`col-span-4 ${cellPad} flex gap-1 border-t border-black`}>
              <span className="font-bold">Sexe :</span>
              <span>{student.gender || 'F'}</span>
            </div>
          </div>

          {/* GRADES TABLE */}
          <table className={`w-full border-collapse border border-black ${isCompact ? 'text-[8.5px] [&_td]:!p-[2px]' : 'text-[9.5px] [&_td]:!p-1'}`}>
            <thead>
              <tr className="bg-slate-200 border-b border-black text-center font-bold">
                <th rowSpan={2} className={`border border-black ${cellPad} text-left w-[24%]`}>DISCIPLINES</th>
                <th rowSpan={2} className={`border border-black ${cellPad} w-[8%]`}>MOY./20</th>
                <th rowSpan={2} className={`border border-black ${cellPad} w-[6%]`}>COEF.</th>
                <th rowSpan={2} className={`border border-black ${cellPad} w-[10%]`}>MOY COEF</th>
                <th rowSpan={2} className={`border border-black ${cellPad} w-[8%]`}>RANG</th>
                <th colSpan={2} className={`border border-black ${cellPad}`}>PROFESSEUR</th>
              </tr>
              <tr className="bg-slate-200 border-b border-black text-center font-bold">
                <th className={`border border-black ${cellPad} w-[18%]`}>APPRECIATION</th>
                <th className={`border border-black ${cellPad} w-[26%]`}>NOM, PRENOMS ET SIGNATURE</th>
              </tr>
            </thead>
            <tbody>
              {/* LITTÉRAIRE / LETTRES SECTION */}
              {lettresSubjects.map((sub, idx) => {
                const isFrancais = sub.name.toLowerCase().includes('franç') || sub.name.toLowerCase().includes('franc');
                const coef = getSubjectCoef(student.class, sub.name);
                const moyCoef = (sub.average || 0) * coef;
                const subRang = Math.max(1, Math.min(totalClassSize, Math.round(studentRank + (idx % 3) - 1)));
                const avg = sub.average || 0;
                const teacherName = getTeacherName(sub.name);

                if (isFrancais) {
                  const compCoef = Math.max(1, Math.floor(coef / 2));
                  const orthoCoef = Math.max(1, Math.round(coef / 4));
                  const oralCoef = Math.max(1, Math.round(coef / 4));

                  return (
                    <React.Fragment key={sub.name}>
                      {/* Main Français Row */}
                      <tr className="border-b border-black">
                        <td className="border border-black p-1 font-bold">Français</td>
                        <td className="border border-black p-1 text-center font-bold">{fmtNum(avg)}</td>
                        <td className="border border-black p-1 text-center font-bold">{coef}</td>
                        <td className="border border-black p-1 text-center font-bold">{fmtNum(moyCoef)}</td>
                        <td className="border border-black p-1 text-center font-semibold">{subRang}e</td>
                        <td className="border border-black p-1 italic">{getAppreciation(avg)}</td>
                        <td rowSpan={4} className="border border-black p-1 text-[8.5px] uppercase font-semibold text-center align-middle bg-white">{teacherName}</td>
                      </tr>
                      {/* Sub-discipline 1: Composition Française */}
                      <tr className="border-b border-black text-[8.5px]">
                        <td className="border border-black p-1 pl-4 italic">Composition Française</td>
                        <td className="border border-black p-1 text-center italic">{fmtNum(avg)}</td>
                        <td className="border border-black p-1 text-center italic">{compCoef}</td>
                        <td className="border border-black p-1 text-center italic">{fmtNum(avg * compCoef)}</td>
                        <td className="border border-black p-1 text-center italic">{subRang}ex</td>
                        <td className="border border-black p-1 italic">{getAppreciation(avg)}</td>
                      </tr>
                      {/* Sub-discipline 2: Orthographe-Grammaire */}
                      <tr className="border-b border-black text-[8.5px]">
                        <td className="border border-black p-1 pl-4 italic">Orthographe-Grammaire</td>
                        <td className="border border-black p-1 text-center italic">{fmtNum(avg)}</td>
                        <td className="border border-black p-1 text-center italic">{orthoCoef}</td>
                        <td className="border border-black p-1 text-center italic">{fmtNum(avg * orthoCoef)}</td>
                        <td className="border border-black p-1 text-center italic">{Math.min(totalClassSize, subRang + 2)}ex</td>
                        <td className="border border-black p-1 italic">{getAppreciation(avg)}</td>
                      </tr>
                      {/* Sub-discipline 3: Expression Orale */}
                      <tr className="border-b border-black text-[8.5px]">
                        <td className="border border-black p-1 pl-4 italic">Expression Orale</td>
                        <td className="border border-black p-1 text-center italic">{fmtNum(avg)}</td>
                        <td className="border border-black p-1 text-center italic">{oralCoef}</td>
                        <td className="border border-black p-1 text-center italic">{fmtNum(avg * oralCoef)}</td>
                        <td className="border border-black p-1 text-center italic">{subRang}ex</td>
                        <td className="border border-black p-1 italic">{getAppreciation(avg)}</td>
                      </tr>
                    </React.Fragment>
                  );
                }

                return (
                  <tr key={sub.name} className={`border-b border-black ${sub.inactive ? "opacity-40 grayscale" : ""}`}>
                    <td className="border border-black p-1 font-bold">{sub.name}</td>
                    <td className="border border-black p-1 text-center font-bold">{fmtNum(sub.average || 0)}</td>
                    <td className="border border-black p-1 text-center">{coef}</td>
                    <td className="border border-black p-1 text-center font-semibold">{fmtNum(moyCoef)}</td>
                    <td className="border border-black p-1 text-center">{subRang}e</td>
                    <td className="border border-black p-1 italic">{getAppreciation(sub.average || 0)}</td>
                    <td className="border border-black p-1 text-[8.5px] uppercase font-semibold">{teacherName}</td>
                  </tr>
                );
              })}

              {/* Bilan Lettres Subtotal */}
              {lettresSubjects.length > 0 && (
                <tr className="bg-slate-100 font-black border-b-2 border-black uppercase">
                  <td className="border border-black p-1 font-black">BILAN LETTRES</td>
                  <td className="border border-black p-1 text-center font-black text-xs">{fmtNum(bilanLettres)}</td>
                  <td className="border border-black p-1 text-center font-black">{lettresTotalCoef}</td>
                  <td className="border border-black p-1 text-center font-black">{fmtNum(lettresTotalPoints)}</td>
                  <td className="border border-black p-1" colSpan={3}></td>
                </tr>
              )}

              {/* SCIENCES SECTION */}
              {sciencesSubjects.map((sub, idx) => {
                const coef = getSubjectCoef(student.class, sub.name);
                const moyCoef = (sub.average || 0) * coef;
                const subRang = Math.max(1, Math.min(totalClassSize, Math.round(studentRank + (idx % 2))));
                return (
                  <tr key={sub.name} className={`border-b border-black ${sub.inactive ? "opacity-40 grayscale" : ""}`}>
                    <td className="border border-black p-1 font-bold">{sub.name}</td>
                    <td className="border border-black p-1 text-center font-bold">{fmtNum(sub.average || 0)}</td>
                    <td className="border border-black p-1 text-center">{coef}</td>
                    <td className="border border-black p-1 text-center font-semibold">{fmtNum(moyCoef)}</td>
                    <td className="border border-black p-1 text-center">{subRang}e</td>
                    <td className="border border-black p-1 italic">{getAppreciation(sub.average || 0)}</td>
                    <td className="border border-black p-1 text-[8.5px] uppercase font-semibold">{getTeacherName(sub.name)}</td>
                  </tr>
                );
              })}

              {/* Bilan Sciences Subtotal */}
              {sciencesSubjects.length > 0 && (
                <tr className="bg-slate-100 font-black border-b-2 border-black uppercase">
                  <td className="border border-black p-1 font-black">BILAN SCIENCES</td>
                  <td className="border border-black p-1 text-center font-black text-xs">{fmtNum(bilanSciences)}</td>
                  <td className="border border-black p-1 text-center font-black">{sciencesTotalCoef}</td>
                  <td className="border border-black p-1 text-center font-black">{fmtNum(sciencesTotalPoints)}</td>
                  <td className="border border-black p-1" colSpan={3}></td>
                </tr>
              )}

              {/* AUTRES SUBJECTS */}
              {autresSubjects.map((sub) => {
                const coef = getSubjectCoef(student.class, sub.name);
                const moyCoef = (sub.average || 0) * coef;
                return (
                  <tr key={sub.name} className={`border-b border-black ${sub.inactive ? "opacity-40 grayscale" : ""}`}>
                    <td className="border border-black p-1 font-bold">{sub.name}</td>
                    <td className="border border-black p-1 text-center font-bold">{fmtNum(sub.average || 0)}</td>
                    <td className="border border-black p-1 text-center">{coef > 0 ? coef : ''}</td>
                    <td className="border border-black p-1 text-center font-semibold">{coef > 0 ? fmtNum(moyCoef) : ''}</td>
                    <td className="border border-black p-1 text-center">{studentRank}e</td>
                    <td className="border border-black p-1 italic">{getAppreciation(sub.average || 0)}</td>
                    <td className="border border-black p-1 text-[8.5px] uppercase font-semibold">{getTeacherName(sub.name)}</td>
                  </tr>
                );
              })}
            </tbody>

            {/* TOTAL / SUMMARY ROW */}
            <tfoot>
              <tr className="bg-slate-200 border-t-2 border-black font-black text-xs text-center">
                <td className="border border-black p-1 text-left">Point Total : <span className="text-sm">{fmtNum(totalPoints)}</span></td>
                <td className="border border-black p-1" colSpan={2}>Coeff. Total : {totalCoef}</td>
                <td className="border border-black p-1" colSpan={2}>Moyenne Trim. : <span className="text-sm">{calculatedAverage}</span> / 20</td>
                <td className="border border-black p-1" colSpan={2}>Rang Trim. : <span className="text-sm">{studentRank}e</span> / {totalClassSize}</td>
              </tr>
            </tfoot>
          </table>

          {/* BOTTOM EVALUATION & SUMMARY PANEL - EXACT REPLICA OF OFFICIAL BOARD */}
          <div className="border-2 border-black text-[10px] mt-1 divide-y-2 divide-black">
            
            {/* TOP ROW: 3 EQUAL COLUMNS */}
            <div className="grid grid-cols-3 divide-x-2 divide-black">
              
              {/* COL 1: ASSIDUITÉ */}
              <div className="p-1.5 flex flex-col justify-between text-center">
                <div className="font-bold text-[11px] mb-1">Assiduité</div>
                <div className="grid grid-cols-2 gap-1 text-[9px] items-center text-left h-full border-t border-black/20 pt-1">
                  <div className="pr-1 border-r border-black space-y-1">
                    <p className="leading-tight">Total d'heures</p>
                    <p>d'absence : <span className="underline font-bold px-1">{unjustifiedAbsenceHours.toString().padStart(2, '0')}</span></p>
                  </div>
                  <div className="pl-1 space-y-1">
                    <p>Justifiées : <span className="underline font-bold px-1">00</span></p>
                    <p>Non justifiées : <span className="underline font-bold px-1">{unjustifiedAbsenceHours.toString().padStart(2, '0')}</span></p>
                  </div>
                </div>
              </div>

              {/* COL 2: MOYENNE TRIMESTRIELLE */}
              <div className="p-1.5 flex flex-col justify-between text-center">
                <div className="font-bold text-[11px] mb-1">Moyenne trimestrielle</div>
                <div className="flex items-center justify-center gap-3 my-auto py-1">
                  <span className="text-sm font-black border-b-2 border-black pb-0.5 px-1">
                    {calculatedAverage} / 20
                  </span>
                  <span className="text-[10px] font-bold">
                    Rang : <span className="underline font-black px-0.5">{studentRank}e</span> sur <span className="underline font-black px-0.5">{totalClassSize}</span>
                  </span>
                </div>
              </div>

              {/* COL 3: RÉSULTATS DE LA CLASSE */}
              <div className="p-1.5 flex flex-col justify-between text-center">
                <div className="font-bold text-[11px] mb-1">Résultats de la classe</div>
                <div className="grid grid-cols-2 gap-1 text-[8.5px] items-center text-left h-full border-t border-black/20 pt-1 pb-1">
                  <div className="pr-1 border-r border-black space-y-1">
                    <p className="leading-tight">Moyenne générale</p>
                    <p>de la classe : <span className="underline font-bold px-1">{fmtNum((minAverage + maxAverage) / 2 || 12.10)}</span></p>
                  </div>
                  <div className="pl-1 space-y-0.5">
                    <p className="leading-tight">Moyenne la</p>
                    <p className="mb-0.5">plus basse : <span className="underline font-bold px-1">{fmtNum(minAverage)}</span></p>
                    <p className="leading-tight">Moyenne la</p>
                    <p>plus élevée : <span className="underline font-bold px-1">{fmtNum(maxAverage)}</span></p>
                  </div>
                </div>
                <div className="border-t border-black pt-1 text-center bg-slate-50/50">
                  <p className="font-extrabold text-[8.5px] uppercase tracking-wide text-slate-900">Signature du Directeur Exécutif</p>
                </div>
              </div>

            </div>

            {/* BOTTOM ROW: 3 EQUAL COLUMNS OR 2 COLUMNS + BILAN DE FIN D'ANNEE FOR 3RD TRIMESTER */}
            {is3rdTrimester ? (
              <>
                {/* 3RD TRIMESTER MIDDLE ROW: MENTIONS & APPRÉCIATIONS */}
                <div className="grid grid-cols-2 divide-x-2 divide-black min-h-[105px]">
                  {/* COL 1: MENTIONS DU CONSEIL DE CLASSE */}
                  <div className="p-1 space-y-1 text-[8.5px] flex flex-col justify-between">
                    <div>
                      <div className="font-bold underline text-center text-[9px] mb-1">Mentions du Conseil de classe</div>
                      
                      <div className="mb-1">
                        <p className="font-bold underline uppercase text-[8px] mb-0.5">DISTINCTIONS</p>
                        <div className="space-y-0.5 pl-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 border border-black inline-flex items-center justify-center text-[8px] font-black leading-none shrink-0">
                              {isDistinctionChecked("Félicitation") ? '✓' : ''}
                            </span>
                            <span>Tableau d'Honneur + Félicitations</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 border border-black inline-flex items-center justify-center text-[8px] font-black leading-none shrink-0">
                              {isDistinctionChecked("Encouragement") ? '✓' : ''}
                            </span>
                            <span>Tableau d'Honneur + Encouragements</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 border border-black inline-flex items-center justify-center text-[8px] font-black leading-none shrink-0">
                              {isDistinctionChecked("Tableau d'Honneur") ? '✓' : ''}
                            </span>
                            <span>Tableau d'Honneur</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="font-bold underline uppercase text-[8px] mb-0.5">SANCTIONS</p>
                        <div className="space-y-0.5 pl-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 border border-black inline-flex items-center justify-center text-[8px] font-black leading-none shrink-0">
                              {isSanctionChecked("Avertissement travail") ? '✓' : ''}
                            </span>
                            <span>Avertissement travail</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 border border-black inline-flex items-center justify-center text-[8px] font-black leading-none shrink-0">
                              {isSanctionChecked("Avertissement conduite") ? '✓' : ''}
                            </span>
                            <span>Avertissement conduite</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 border border-black inline-flex items-center justify-center text-[8px] font-black leading-none shrink-0">
                              {isSanctionChecked("Blâme travail") ? '✓' : ''}
                            </span>
                            <span>Blâme Travail</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 border border-black inline-flex items-center justify-center text-[8px] font-black leading-none shrink-0">
                              {isSanctionChecked("Blâme conduite") ? '✓' : ''}
                            </span>
                            <span>Blâme conduite</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* COL 2: APPRÉCIATIONS DU CONSEIL DE CLASSE */}
                  <div className="p-1 flex flex-col justify-between text-center relative">
                    <div className="font-bold underline text-[9px]">Appréciations du Conseil de classe</div>
                    
                    {/* Handwritten Cursive Red Comment */}
                    <div className="my-auto py-0.5">
                      <span className="text-red-500 font-serif italic text-base font-bold tracking-wide transform -rotate-2 inline-block">
                        {selectedAppreciation || getAutoAppreciation(avgNum)}
                      </span>
                    </div>

                    <div className="pt-1 border-t border-black/20">
                      <p className="italic underline text-[8px] mb-0.5">Nom/Signature du professeur principal</p>
                      
                      <div className="h-6 flex items-center justify-center my-0.5 overflow-hidden">
                        {effectiveTeacherSig ? (
                          effectiveTeacherSig.startsWith('data:image') || effectiveTeacherSig.startsWith('http') || effectiveTeacherSig.startsWith('blob') ? (
                            <img 
                              src={effectiveTeacherSig} 
                              alt="Signature Professeur Principal" 
                              className="max-h-6 max-w-[120px] object-contain transform -rotate-1 select-none" 
                            />
                          ) : (
                            <span 
                              style={{ fontFamily: "'Brush Script MT', 'Caveat', 'Cedarville Cursive', cursive" }}
                              className="text-red-600 font-bold text-base transform -rotate-3 select-none"
                            >
                              {effectiveTeacherSig}
                            </span>
                          )
                        ) : effectiveIsSigned && effectiveTeacherName ? (
                          <span 
                            style={{ fontFamily: "'Brush Script MT', 'Caveat', 'Cedarville Cursive', cursive" }}
                            className="text-red-600 font-bold text-sm transform -rotate-3 select-none"
                          >
                            {effectiveTeacherName}
                          </span>
                        ) : null}
                      </div>

                      <p className="font-black text-[8.5px] uppercase text-slate-900">
                        {effectiveTeacherName || 'BRINDOU OLGA'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3RD TRIMESTER BILAN DE FIN D'ANNEE SECTION */}
                <div className="bg-slate-200 border-t-2 border-b-2 border-black p-0.5 text-center font-black uppercase tracking-wider text-[10px]">
                  BILAN DE FIN D'ANNEE
                </div>

                <div className="grid grid-cols-3 divide-x-2 divide-black min-h-[110px]">
                  {/* RECAPITULATIF TABLE */}
                  <div className="p-1 flex flex-col justify-between text-center">
                    <div className="font-bold underline text-[9px] uppercase mb-0.5">RECAPITULATIF</div>
                    <table className="w-full text-[8px] border-collapse border border-black text-center mb-0.5">
                      <thead>
                        <tr className="bg-slate-100 font-bold border-b border-black">
                          <th className="p-0.5 border-r border-black text-left pl-1"></th>
                          <th className="p-0.5 border-r border-black">MOY.</th>
                          <th className="p-0.5 border-r border-black">COEF</th>
                          <th className="p-0.5 border-r border-black">MOY x C</th>
                          <th className="p-0.5">RANG</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-black">
                        {isTech ? (
                          <>
                            <tr>
                              <td className="p-0.5 border-r border-black font-semibold text-left pl-1">1er Sem</td>
                              <td className="p-0.5 border-r border-black font-bold">{fmtNumPad(t1Val)}</td>
                              <td className="p-0.5 border-r border-black">{c1}</td>
                              <td className="p-0.5 border-r border-black font-semibold">{fmtNumPad(t1MoyXC)}</td>
                              <td className="p-0.5">{t1Rank}</td>
                            </tr>
                            <tr>
                              <td className="p-0.5 border-r border-black font-semibold text-left pl-1">2ème Sem</td>
                              <td className="p-0.5 border-r border-black font-bold">{fmtNumPad(t2Val)}</td>
                              <td className="p-0.5 border-r border-black">{c2}</td>
                              <td className="p-0.5 border-r border-black font-semibold">{fmtNumPad(t2MoyXC)}</td>
                              <td className="p-0.5">{t2Rank}</td>
                            </tr>
                          </>
                        ) : (
                          <>
                            <tr>
                              <td className="p-0.5 border-r border-black font-semibold text-left pl-1">1e Trim</td>
                              <td className="p-0.5 border-r border-black font-bold">{fmtNumPad(t1Val)}</td>
                              <td className="p-0.5 border-r border-black">{c1}</td>
                              <td className="p-0.5 border-r border-black font-semibold">{fmtNumPad(t1MoyXC)}</td>
                              <td className="p-0.5">{t1Rank}</td>
                            </tr>
                            <tr>
                              <td className="p-0.5 border-r border-black font-semibold text-left pl-1">2e Trim</td>
                              <td className="p-0.5 border-r border-black font-bold">{fmtNumPad(t2Val)}</td>
                              <td className="p-0.5 border-r border-black">{c2}</td>
                              <td className="p-0.5 border-r border-black font-semibold">{fmtNumPad(t2MoyXC)}</td>
                              <td className="p-0.5">{t2Rank}</td>
                            </tr>
                            <tr>
                              <td className="p-0.5 border-r border-black font-semibold text-left pl-1">3e Trim</td>
                              <td className="p-0.5 border-r border-black font-bold">{fmtNumPad(t3Val)}</td>
                              <td className="p-0.5 border-r border-black">{c3}</td>
                              <td className="p-0.5 border-r border-black font-semibold">{fmtNumPad(t3MoyXC)}</td>
                              <td className="p-0.5">{t3Rank}</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>

                    <div className="border-t border-black pt-0.5 text-left text-[8px] space-y-0.5">
                      <div className="flex justify-between items-center font-bold">
                        <span className="uppercase text-[7.5px]">MOYENNE GENERALE ANNUELLE</span>
                        <span className="text-[10px] font-black text-slate-900 pr-1">{fmtNumPad(annualAverageNum)} / 20</span>
                      </div>
                      <div className="flex justify-between items-center text-[8px]">
                        <span className="font-bold uppercase">RANG ANNUEL</span>
                        <span className="font-black pr-1"><span className="underline">{annualRank}</span> sur <span className="underline">{totalClassSize}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* DÉCISION DE FIN D'ANNÉE */}
                  <div className="p-1 flex flex-col justify-between text-center relative">
                    <div className="font-bold underline text-[9px] mb-0.5">Décision de fin d'année</div>
                    
                    <div className="my-auto py-1">
                      <span 
                        style={{ fontFamily: "'Brush Script MT', 'Caveat', 'Cedarville Cursive', cursive" }}
                        className="text-red-500 italic text-base font-bold tracking-wide transform -rotate-2 inline-block"
                      >
                        {getDecisionDeFinDannee(annualAverageNum, student?.class)}
                      </span>
                    </div>

                    <div className="pt-1 border-t border-black/20">
                      <p className="italic underline text-[7.5px] mb-0.5">Nom/Signature du professeur principal</p>
                      
                      <div className="h-6 flex items-center justify-center overflow-hidden">
                        {effectiveTeacherSig ? (
                          effectiveTeacherSig.startsWith('data:image') || effectiveTeacherSig.startsWith('http') || effectiveTeacherSig.startsWith('blob') ? (
                            <img 
                              src={effectiveTeacherSig} 
                              alt="Signature Prof" 
                              className="max-h-6 max-w-[120px] object-contain transform -rotate-1 select-none" 
                            />
                          ) : (
                            <span 
                              style={{ fontFamily: "'Brush Script MT', 'Caveat', 'Cedarville Cursive', cursive" }}
                              className="text-red-600 font-bold text-base transform -rotate-3 select-none"
                            >
                              {effectiveTeacherSig}
                            </span>
                          )
                        ) : effectiveIsSigned && effectiveTeacherName ? (
                          <span 
                            style={{ fontFamily: "'Brush Script MT', 'Caveat', 'Cedarville Cursive', cursive" }}
                            className="text-red-600 font-bold text-sm transform -rotate-3 select-none"
                          >
                            {effectiveTeacherName}
                          </span>
                        ) : null}
                      </div>

                      <p className="font-black text-[8.5px] uppercase text-slate-900">
                        {effectiveTeacherName || 'DADIE EUNICE'}
                      </p>
                    </div>
                  </div>

                  {/* NOM / SIGNATURE ET CACHET DU CHEF D'ETABLISSEMENT */}
                  <div className="p-1 flex flex-col justify-between text-center relative">
                    <div>
                      <div className="font-bold underline text-[8.5px] mb-0.5">Nom/Signature et Cachet du Chef d'Etablissement</div>
                      <p className="text-[7.5px] text-slate-800 font-medium">Fait à {faitA || 'ABIDJAN'}, le {faitLe || '30 juin 2026'}</p>
                    </div>

                    <div className="my-auto py-0.5 flex flex-col items-center justify-center">
                      <p className="font-black underline text-[9px] text-slate-900 mb-0.5">DIRECTEUR DES ETUDES</p>
                      
                      {stampImage ? (
                        <div className="my-0.5 h-10 flex items-center justify-center">
                          <img src={stampImage} alt="Cachet" className="max-h-10 max-w-[90px] object-contain transform -rotate-3" />
                        </div>
                      ) : signatureText && signatureText.trim() !== '' ? (
                        <div className="my-0.5 py-0.5 font-serif italic text-blue-900 font-bold transform -rotate-2">
                          <span style={{ fontFamily: "'Brush Script MT', 'Caveat', 'Cedarville Cursive', cursive" }} className="text-base">
                            {signatureText}
                          </span>
                        </div>
                      ) : (
                        <div className="h-6 w-full"></div>
                      )}
                    </div>

                    <div>
                      <p className="font-black text-[8.5px] uppercase text-slate-900">
                        {directorName === "" ? "" : (directorName || 'BINATE VASSOULEYMANE')}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* STANDARD 1ST & 2ND TRIMESTER BOTTOM ROW: 3 EQUAL COLUMNS */
              <div className="grid grid-cols-3 divide-x-2 divide-black min-h-[185px]">
                
                {/* COL 1: MENTIONS DU CONSEIL DE CLASSE */}
                <div className="p-2 space-y-2 text-[9px] flex flex-col justify-between">
                  <div>
                    <div className="font-bold underline text-center text-[10px] mb-2">Mentions du Conseil de classe</div>
                    
                    <div className="mb-2">
                      <p className="font-bold underline uppercase text-[8.5px] mb-1">DISTINCTIONS</p>
                      <div className="space-y-1 pl-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[9px] font-black leading-none shrink-0">
                            {isDistinctionChecked("Félicitation") ? '✓' : ''}
                          </span>
                          <span>Tableau d'Honneur + Félicitations</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[9px] font-black leading-none shrink-0">
                            {isDistinctionChecked("Encouragement") ? '✓' : ''}
                          </span>
                          <span>Tableau d'Honneur + Encouragements</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[9px] font-black leading-none shrink-0">
                            {isDistinctionChecked("Tableau d'Honneur") ? '✓' : ''}
                          </span>
                          <span>Tableau d'Honneur</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold underline uppercase text-[8.5px] mb-1">SANCTIONS</p>
                      <div className="space-y-1 pl-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[9px] font-black leading-none shrink-0">
                            {isSanctionChecked("Avertissement travail") ? '✓' : ''}
                          </span>
                          <span>Avertissement travail</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[9px] font-black leading-none shrink-0">
                            {isSanctionChecked("Avertissement conduite") ? '✓' : ''}
                          </span>
                          <span>Avertissement conduite</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[9px] font-black leading-none shrink-0">
                            {isSanctionChecked("Blâme travail") ? '✓' : ''}
                          </span>
                          <span>Blâme Travail</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3.5 h-3.5 border border-black inline-flex items-center justify-center text-[9px] font-black leading-none shrink-0">
                            {isSanctionChecked("Blâme conduite") ? '✓' : ''}
                          </span>
                          <span>Blâme conduite</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COL 2: APPRÉCIATIONS DU CONSEIL DE CLASSE */}
                <div className="p-2 flex flex-col justify-between text-center relative">
                  <div className="font-bold underline text-[10px]">Appréciations du Conseil de classe</div>
                  
                  {/* Handwritten Cursive Red Comment */}
                  <div className="my-auto py-2">
                    <span className="text-red-500 font-serif italic text-xl font-bold tracking-wide transform -rotate-2 inline-block">
                      {selectedAppreciation || getAutoAppreciation(avgNum)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-black/20">
                    <p className="italic underline text-[8.5px] mb-1">Nom/Signature du professeur principal</p>
                    
                    {/* Signature or empty space for manual signature */}
                    <div className="h-10 flex items-center justify-center my-0.5 overflow-hidden">
                      {effectiveTeacherSig ? (
                        effectiveTeacherSig.startsWith('data:image') || effectiveTeacherSig.startsWith('http') || effectiveTeacherSig.startsWith('blob') ? (
                          <img 
                            src={effectiveTeacherSig} 
                            alt="Signature Professeur Principal" 
                            className="max-h-10 max-w-[160px] object-contain transform -rotate-1 select-none" 
                          />
                        ) : (
                          <span 
                            style={{ fontFamily: "'Brush Script MT', 'Caveat', 'Cedarville Cursive', cursive" }}
                            className="text-red-600 font-bold text-xl transform -rotate-3 select-none"
                          >
                            {effectiveTeacherSig}
                          </span>
                        )
                      ) : effectiveIsSigned && effectiveTeacherName ? (
                        <span 
                          style={{ fontFamily: "'Brush Script MT', 'Caveat', 'Cedarville Cursive', cursive" }}
                          className="text-red-600 font-bold text-lg transform -rotate-3 select-none"
                        >
                          {effectiveTeacherName}
                        </span>
                      ) : null}
                    </div>

                    <p className="font-black text-[9.5px] uppercase text-slate-900 mt-0.5">
                      {effectiveTeacherName || 'BRINDOU OLGA'}
                    </p>
                  </div>
                </div>

                {/* COL 3: NOM/SIGNATURE ET CACHET DU CHEF D'ETABLISSEMENT */}
                <div className="p-2 flex flex-col justify-between text-center relative">
                  <div>
                    <div className="font-bold underline text-[9.5px] mb-1">Nom/Signature et Cachet du Chef d'Etablissement</div>
                    <p className="text-[8.5px] text-slate-800 font-medium">Fait à {faitA || 'ABIDJAN'}, le {faitLe || new Date().toLocaleDateString('fr-FR')}</p>
                  </div>

                  <div className="my-auto py-1 flex flex-col items-center justify-center">
                    <p className="font-black underline text-[11px] text-slate-900 mb-0.5">DIRECTEUR DES ETUDES</p>
                    
                    {stampImage ? (
                      <div className="my-0.5 h-16 flex items-center justify-center">
                        <img src={stampImage} alt="Cachet" className="max-h-16 max-w-[120px] object-contain transform -rotate-3" />
                      </div>
                    ) : signatureText && signatureText.trim() !== '' ? (
                      <div className="my-1 py-1 font-serif italic text-blue-900 font-bold transform -rotate-2">
                        <span style={{ fontFamily: "'Brush Script MT', 'Caveat', 'Cedarville Cursive', cursive" }} className="text-xl">
                          {signatureText}
                        </span>
                      </div>
                    ) : (
                      /* Empty space for manual signature when printing */
                      <div className="h-12 w-full"></div>
                    )}
                  </div>

                  <div>
                    <p className="font-black text-[10px] uppercase text-slate-900">{directorName === "" ? "" : (directorName || 'M, SEIDOU OUATTARA')}</p>
                  </div>
                </div>

              </div>
            )}

          </div>



        </div>
        </div>
      </div>
    </div>
  );
};
