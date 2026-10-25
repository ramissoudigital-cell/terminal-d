import React from 'react';
import { AnalyticsData } from '../types';
import { BookOpen, ChevronRight, GraduationCap, Lock } from 'lucide-react';

interface TransactionListProps {
    subjects: AnalyticsData[];
    onSelectSubject: (subject: AnalyticsData) => void;
    currentUser?: any;
    studentClass?: string;
}

const coefs6eme: Record<string, number> = {
  'Mathématiques': 3,
  'Français': 3,
  'Anglais': 2,
  'Histoire-Geo': 2,
  'Histoire-Géographie': 2,
  'Physique-Chimie': 2,
  'SVT': 2,
  'Sciences de la Vie et de la Terre': 2,
  'E.D.H.C': 1,
  'EDHC': 1,
  'Conduite': 1,
  'EPS': 1,
  'Informatique': 0
};


const coefs4eme: Record<string, number> = {
  'Mathématiques': 3,
  'Français': 4,
  'Anglais': 2,
  'Histoire-Geo': 2,
  'Histoire-Géographie': 2,
  'Physique-Chimie': 2,
  'SVT': 2,
  'Sciences de la Vie et de la Terre': 2,
  'E.D.H.C': 1,
  'EDHC': 1,
  'L.V.2 (Allemand / Espagnol)': 1,
  'Conduite': 1,
  'EPS': 1,
  'Informatique': 0
};


const coefs2A: Record<string, number> = {
  'Mathématiques': 3,
  'Français': 4,
  'Anglais': 3,
  'Histoire-Geo': 3,
  'Histoire-Géographie': 3,
  'Physique-Chimie': 2,
  'SVT': 2,
  'Sciences de la Vie et de la Terre': 2,
  'L.V.2 (Allemand / Espagnol)': 3,
  'Conduite': 1,
  'EPS': 1,
  'E.P.S.': 1,
  'Informatique': 0
};

const coefs2C: Record<string, number> = {
  'Mathématiques': 5,
  'Physique-Chimie': 4,
  'Français': 3,
  'Anglais': 3,
  'Histoire-Geo': 2,
  'Histoire-Géographie': 2,
  'SVT': 2,
  'Sciences de la Vie et de la Terre': 2,
  'L.V.2 (Allemand / Espagnol)': 1,
  'Conduite': 1,
  'EPS': 1,
  'E.P.S.': 1,
  'Informatique': 0
};

const coefs1A1: Record<string, number> = {
  'Mathématiques': 3,
  'Français': 4,
  'Anglais': 4,
  'Histoire-Geo': 3,
  'Histoire-Géographie': 3,
  'Philosophie': 3,
  'Physique-Chimie': 1,
  'SVT': 1,
  'Sciences de la Vie et de la Terre': 1,
  'L.V.2 (Allemand / Espagnol)': 3,
  'Conduite': 1,
  'EPS': 1,
  'E.P.S.': 1,
  'Informatique': 0
};

const coefs1A2: Record<string, number> = {
  'Mathématiques': 2,
  'Français': 4,
  'Anglais': 4,
  'Histoire-Geo': 3,
  'Histoire-Géographie': 3,
  'Philosophie': 3,
  'Physique-Chimie': 1,
  'SVT': 1,
  'Sciences de la Vie et de la Terre': 1,
  'L.V.2 (Allemand / Espagnol)': 3,
  'Conduite': 1,
  'EPS': 1,
  'E.P.S.': 1,
  'Informatique': 0
};

const coefs1D: Record<string, number> = {
  'Mathématiques': 4,
  'Physique-Chimie': 4,
  'SVT': 4,
  'Sciences de la Vie et de la Terre': 4,
  'Français': 3,
  'Anglais': 2,
  'Histoire-Geo': 2,
  'Histoire-Géographie': 2,
  'Philosophie': 2,
  'Conduite': 1,
  'EPS': 1,
  'E.P.S.': 1,
  'Informatique': 0
};

const coefsTA1: Record<string, number> = {
  'Mathématiques': 4,
  'Français': 4,
  'Anglais': 4,
  'Histoire-Geo': 3,
  'Histoire-Géographie': 3,
  'Philosophie': 5,
  'SVT': 2,
  'Sciences de la Vie et de la Terre': 2,
  'L.V.2 (Allemand / Espagnol)': 3,
  'Conduite': 1,
  'EPS': 1,
  'E.P.S.': 1,
  'Informatique': 0
};

const coefsTA2: Record<string, number> = {
  'Mathématiques': 2,
  'Français': 4,
  'Anglais': 4,
  'Histoire-Geo': 3,
  'Histoire-Géographie': 3,
  'Philosophie': 5,
  'SVT': 2,
  'Sciences de la Vie et de la Terre': 2,
  'L.V.2 (Allemand / Espagnol)': 3,
  'Conduite': 1,
  'EPS': 1,
  'E.P.S.': 1,
  'Informatique': 0
};

const coefsTD: Record<string, number> = {
  'Mathématiques': 4,
  'Physique-Chimie': 4,
  'SVT': 4,
  'Sciences de la Vie et de la Terre': 4,
  'Français': 3,
  'Histoire-Geo': 2,
  'Histoire-Géographie': 2,
  'Philosophie': 2,
  'Anglais': 1,
  'Conduite': 1,
  'EPS': 1,
  'E.P.S.': 1,
  'Informatique': 0
};

const coefsTech: Record<string, number> = {
  'Application Bureautique': 4,
  'Droit': 2,
  'Économie Générale': 1,
  'Economie Générale': 1,
  'Technique Administrative et Commerciale': 2,
  'Outils de communication': 2,
  'Expression Professionnelle': 1,
  'Sténographie': 2,
  'Informatique': 2,
  'Français': 4,
  'Anglais': 2,
  'Histoire-Géographie': 2,
  'Histoire-Geo': 2,
  'Allemand': 2,
  'Espagnol': 1,
  'Mathématiques': 2,
  'Physique-Chimie': 2,
  'SVT': 2,
  'Sciences de la Vie et de la Terre': 2,
  'Éducation Physique et Sportive': 1,
  'EPS': 1,
  'E.P.S.': 1,
  'Conduite': 1
};

export const getSubjectCoef = (studentClass: string | undefined, subjectName: string) => {
      if (!subjectName) return 1;
      const sName = subjectName.toLowerCase();

      if (sName.includes('bilan')) return 0;

      const isTechClass = Boolean(studentClass && (
        studentClass.match(/(G1|G2|G3|AB|F1|F2|F3|F4|F7|STT|STI|BEP|CAP|BT|BP|Technique|Professionnel|Tertiaire|Industriel)/i)
      ));

      if (isTechClass) {
        if (coefsTech[subjectName] !== undefined) return coefsTech[subjectName];
        if (sName.includes('droit')) return 2;
        if (sName.includes('écono') || sName.includes('econo')) return 1;
        if (sName.includes('technique admin') || sName.includes('tac')) return 2;
        if (sName.includes('outils')) return 2;
        if (sName.includes('expression pro')) return 1;
        if (sName.includes('sténo') || sName.includes('steno')) return 2;
        if (sName.includes('informatique')) return 2;
        return 2;
      }

      if (sName.includes('informatique')) return 0;
      
      if (!studentClass) {
          if (sName.includes('physique') || sName.includes('chimie')) return 2;
          return 1;
      }

      if (studentClass.match(/(Tle D|T°D|TD|Terminale D|TerminaleD)/i)) return coefsTD[subjectName] ?? (sName.includes('physique') ? 4 : 1);
      if (studentClass.match(/(Tle A1|T°A1|TA1|Terminale A1|TerminaleA1)/i)) return coefsTA1[subjectName] ?? 1;
      if (studentClass.match(/(Tle A2|T°A2|TA2|Terminale A2|TerminaleA2)/i)) return coefsTA2[subjectName] ?? 1;
      if (studentClass.match(/(1ère D|1ere D|1°D|1D|Première D|Premiere D)/i)) return coefs1D[subjectName] ?? (sName.includes('physique') ? 4 : 1);
      if (studentClass.match(/(1ère A1|1ere A1|1°A1|1A1|Première A1|Premiere A1)/i)) return coefs1A1[subjectName] ?? 1;
      if (studentClass.match(/(1ère A2|1ere A2|1°A2|1A2|Première A2|Premiere A2)/i)) return coefs1A2[subjectName] ?? 1;
      if (studentClass.match(/(2nde C|Seconde C|2°C)/i)) return coefs2C[subjectName] ?? (sName.includes('physique') ? 4 : 1);
      if (studentClass.match(/(2nde A|Seconde A|2°A)/i)) return coefs2A[subjectName] ?? (sName.includes('physique') ? 2 : 1);
      if (studentClass.match(/(4ème|4eme|4è|\b4e\d*|\b4°|3ème|3eme|3è|\b3e\d*|\b3°|\b4\b|\b3\b)/i)) return coefs4eme[subjectName] ?? (sName.includes('physique') ? 2 : 1);
      if (studentClass.match(/(6ème|6eme|6è|\b6e\d*|\b6°|5ème|5eme|5è|\b5e\d*|\b5°|\b6\b|\b5\b)/i)) return coefs6eme[subjectName] ?? (sName.includes('physique') ? 2 : 1);

      if (sName.includes('physique') || sName.includes('chimie')) return 2;
      return 1;
};

export const normalizeSubjectCanonical = (raw?: string): string => {
  if (!raw) return '';
  const s = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[._\-/\\]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Hist-Géo / Histoire-Géographie / HG
  if (
    s === 'hg' ||
    s.startsWith('hg ') ||
    s.endsWith(' hg') ||
    s.includes('hist') ||
    s.includes('geo') ||
    s.includes('gio') ||
    s.includes('histoire') ||
    s.includes('geographie')
  ) {
    return 'hg';
  }

  // EPS vs PC
  if (
    s === 'eps' ||
    s.startsWith('eps ') ||
    s.endsWith(' eps') ||
    s.includes('sport') ||
    s.includes('physique et sportive') ||
    s.includes('education physique')
  ) {
    return 'eps';
  }

  // Physique-Chimie (PC)
  if (
    s === 'pc' ||
    s.startsWith('pc ') ||
    s.endsWith(' pc') ||
    s.includes('physique') ||
    s.includes('chimie')
  ) {
    return 'pc';
  }

  // SVT (Sciences de la Vie et de la Terre, Biologie)
  if (
    s === 'svt' ||
    s.startsWith('svt ') ||
    s.endsWith(' svt') ||
    s.includes('sciences de la vie') ||
    s.includes('biologie') ||
    s.includes('bio')
  ) {
    return 'svt';
  }

  // Mathématiques
  if (s.includes('math')) {
    return 'math';
  }

  // Français
  if (s.includes('fran') || s.includes('lettre')) {
    return 'francais';
  }

  // Anglais
  if (s.includes('angl') || s.includes('english')) {
    return 'anglais';
  }

  // Philosophie
  if (s.includes('philo')) {
    return 'philo';
  }

  // Informatique
  if (s.includes('info') || s.includes('tic')) {
    return 'info';
  }

  // Espagnol
  if (s.includes('espagnol') || s === 'esp') {
    return 'espagnol';
  }

  // Allemand
  if (s.includes('allemand') || s === 'all') {
    return 'allemand';
  }

  // Arts Plastiques
  if (s.includes('art') || s.includes('dessin')) {
    return 'arts';
  }

  // Musique
  if (s.includes('musiq') || s.includes('musicale')) {
    return 'musique';
  }

  // EDHC
  if (s.includes('edhc') || s.includes('droits de l homme') || s.includes('citoyennete')) {
    return 'edhc';
  }

  // Conduite
  if (s.includes('conduit') || s.includes('disciplin') || s.includes('comport')) {
    return 'conduite';
  }

  // Economie
  if (s.includes('econo') || s === 'eco') {
    return 'eco';
  }

  // Droit
  if (s.includes('droit')) {
    return 'droit';
  }

  return s;
};

export const isSubjectMatch = (tSub?: string, sSub?: string): boolean => {
    if (!tSub || !sSub) return true;
    const t = tSub.trim();
    const s = sSub.trim();
    if (t === s) return true;
    
    // Multiple teacher subjects support (comma-separated)
    if (t.includes(',')) {
      const parts = t.split(',').map(p => p.trim()).filter(Boolean);
      return parts.some(p => isSubjectMatch(p, s));
    }
    if (s.includes(',')) {
      const parts = s.split(',').map(p => p.trim()).filter(Boolean);
      return parts.some(p => isSubjectMatch(t, p));
    }

    // Canonical matching
    const canonT = normalizeSubjectCanonical(t);
    const canonS = normalizeSubjectCanonical(s);

    if (canonT && canonS && canonT === canonS) {
      return true;
    }

    // Prevent "Physique-Chimie" from matching "Education Physique et Sportive"
    const isT_EPS = canonT === 'eps';
    const isS_EPS = canonS === 'eps';
    const isT_PC = canonT === 'pc';
    const isS_PC = canonS === 'pc';

    if ((isT_EPS && isS_PC) || (isT_PC && isS_EPS)) {
      return false;
    }

    // Prevent "Allemand" from matching "Espagnol"
    const isT_All = canonT === 'allemand';
    const isS_All = canonS === 'allemand';
    const isT_Esp = canonT === 'espagnol';
    const isS_Esp = canonS === 'espagnol';

    if ((isT_All && isS_Esp) || (isT_Esp && isS_All)) {
      return false;
    }

    const rawT = t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    const rawS = s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    if (rawT === rawS || rawT.includes(rawS) || rawS.includes(rawT)) return true;
    
    return false;
  };

export const TransactionList: React.FC<TransactionListProps> = ({ subjects, onSelectSubject, currentUser, studentClass }) => {
  // Safety check if subjects is undefined
  const safeSubjects = subjects || [];
  
  const isTeacher = currentUser?.role === 'teacher';
  const teacherSubject = currentUser?.subject;

  return (
    <div className="w-full mt-4 flex-1 flex flex-col relative h-full">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-xl font-bold text-gray-800">Matières & Résultats</h2>
      </div>

      {safeSubjects.length > 0 ? (
        <div className="flex flex-col gap-3 pr-2">
            {safeSubjects.map((subject, index) => {
                const isRestricted = isTeacher && teacherSubject && !isSubjectMatch(teacherSubject, subject.name);
                const isInactive = Boolean(subject.inactive);
                const isDisabled = isRestricted || isInactive;
                const subjCoef = getSubjectCoef(studentClass, subject.name);
                return (
                <div 
                    key={index} 
                    onClick={() => !isDisabled && onSelectSubject(subject)}
                    className={`flex items-center justify-between p-3 rounded-2xl transition-all ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-100/70 border border-slate-200' : 'cursor-pointer group hover:bg-white bg-gray-50/50 border border-transparent hover:border-sky-100 hover:shadow-sm'}`}
                >
                    <div className="flex items-center gap-4">
                    <div 
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform ${isDisabled ? '' : 'group-hover:scale-110'}`}
                        style={{ background: isDisabled ? '#9ca3af' : (subject.name.includes('L.V.2') ? 'linear-gradient(135deg, #f59e0b, #10b981)' : (subject.fill || '#ccc')) }}
                    >
                        {isDisabled ? <Lock size={20} className="text-white" /> : <BookOpen size={20} />}
                    </div>
                    <div className="flex flex-col">
                        <span className={`font-bold text-sm ${isInactive ? 'line-through text-slate-500' : 'text-gray-800'}`}>{subject.name}</span>
                        {isInactive ? (
                          <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 border border-slate-300 mt-0.5">
                            Non suivie (LV2)
                          </span>
                        ) : subjCoef === 0 ? (
                          <span className="inline-flex items-center w-fit px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200 mt-0.5">
                            Bonus
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium">Coef. {subjCoef}</span>
                        )}
                    </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className={`font-bold text-lg ${isDisabled ? 'text-gray-400' : 'text-gray-800'}`}>{isInactive ? '-' : Number(subject.average || 0).toFixed(2)}</span>
                            {!isInactive && <span className="text-[10px] text-gray-400 font-medium">/ 20</span>}
                        </div>
                        {!isDisabled && <ChevronRight size={18} className="text-gray-300 group-hover:text-sky-500 transition-colors" />}
                    </div>
                </div>
                );
            })}
        </div>
      ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm italic">
              Aucune matière enregistrée.
          </div>
      )}
    </div>
  );
};