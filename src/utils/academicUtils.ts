import { getSubjectsForClass } from '../../types';
import { getSubjectCoef } from '../../components/TransactionList';

export const isTechnicalClass = (className?: string, section?: string): boolean => {
  if (section === 'Technique' || section === 'Professionnel' || section === 'Enseignement Technique') return true;
  if (!className) return false;
  const c = className.trim();
  const upper = c.toUpperCase();
  if (
    upper.includes('TECHNIQUE') || 
    upper.includes('PROFESSIONNEL') || 
    upper.includes(' PRO') || 
    upper.endsWith('PRO') || 
    upper.includes('TERTIAIRE') || 
    upper.includes('INDUSTRIEL') ||
    upper.includes('G1') ||
    upper.includes('G2') ||
    upper.includes('G3') ||
    upper.includes('AB') ||
    upper.includes('STT') ||
    upper.includes('STI') ||
    upper.includes('BEP') ||
    upper.includes('CAP') ||
    upper.includes('BT') ||
    upper.includes('BP') ||
    upper.includes('F1') ||
    upper.includes('F2') ||
    upper.includes('F3') ||
    upper.includes('F4') ||
    upper.includes('F7')
  ) {
    return true;
  }
  if (/(G1|G2|G3|AB|F1|F2|F3|F4|F7|STT|STI|BEP|CAP|BT|BP)/i.test(c)) {
    return true;
  }
  return false;
};

export const getPeriodOptions = (className?: string, section?: string) => {
  const isTech = isTechnicalClass(className, section);
  if (isTech) {
    return [
      { id: '1er trim', label: '1er Semestre', shortLabel: '1er Sem' },
      { id: '2ème trim', label: '2ème Semestre', shortLabel: '2e Sem' },
    ];
  }
  return [
    { id: '1er trim', label: '1er Trimestre', shortLabel: '1er Trim' },
    { id: '2ème trim', label: '2ème Trimestre', shortLabel: '2e Trim' },
    { id: '3ème trim', label: '3ème Trimestre', shortLabel: '3e Trim' },
  ];
};

export const formatPeriodLabel = (text: string, className?: string, section?: string): string => {
  if (!text) return '';
  if (!isTechnicalClass(className, section)) return text;

  return text
    .replace(/1er Trimestre/g, '1er Semestre')
    .replace(/2[èe]me? Trimestre/g, '2ème Semestre')
    .replace(/3[èe]me? Trimestre/g, '2ème Semestre')
    .replace(/1er [Tt]rim/g, '1er Sem')
    .replace(/2e [Tt]rim/gi, '2e Sem')
    .replace(/2è [Tt]rim/gi, '2è Sem')
    .replace(/3e [Tt]rim/gi, '2e Sem')
    .replace(/3è [Tt]rim/gi, '2è Sem')
    .replace(/Trimestre 1/g, 'Semestre 1')
    .replace(/Trimestre 2/g, 'Semestre 2')
    .replace(/Trimestre 3/g, 'Semestre 2')
    .replace(/Trim\. 1/g, 'Sem. 1')
    .replace(/Trim\. 2/g, 'Sem. 2')
    .replace(/Trim\. 3/g, 'Sem. 2')
    .replace(/Rangs aux Trimestres/g, 'Rangs aux Semestres')
    .replace(/trimestrielle/g, 'semestrielle')
    .replace(/Trimestrielle/g, 'Semestrielle')
    .replace(/trimestriel/g, 'semestriel')
    .replace(/Trimestriel/g, 'Semestriel')
    .replace(/trimestres/g, 'semestres')
    .replace(/Trimestres/g, 'Semestres')
    .replace(/trimestre/g, 'semestre')
    .replace(/Trimestre/g, 'Semestre');
};

/**
 * Calculates the annual average according to official institutional weighting rules:
 * - 1st Trimester: Coefficient 1
 * - 2nd Trimester: Coefficient 2
 * - 3rd Trimester: Coefficient 2
 * Total denominator = 1 + 2 + 2 = 5.
 * Formula: ((T1 * 1) + (T2 * 2) + (T3 * 2)) / 5
 *
 * For Technical stream (2 Semesters):
 * - 1st Semester: Coefficient 1
 * - 2nd Semester: Coefficient 1
 * Formula: ((S1 * 1) + (S2 * 1)) / 2
 */
export const calculateAnnualAverage = (
  t1: number | null | undefined,
  t2: number | null | undefined,
  t3: number | null | undefined,
  isTechnical: boolean = false
): number | null => {
  const v1 = (t1 !== null && t1 !== undefined && !isNaN(Number(t1))) ? Number(t1) : null;
  const v2 = (t2 !== null && t2 !== undefined && !isNaN(Number(t2))) ? Number(t2) : null;
  const v3 = (t3 !== null && t3 !== undefined && !isNaN(Number(t3))) ? Number(t3) : null;

  if (isTechnical) {
    let total = 0;
    let coefSum = 0;
    if (v1 !== null) {
      total += v1 * 1;
      coefSum += 1;
    }
    if (v2 !== null) {
      total += v2 * 1;
      coefSum += 1;
    }
    if (coefSum === 0) return null;
    return parseFloat((total / coefSum).toFixed(2));
  }

  // General Stream: T1 = coef 1, T2 = coef 2, T3 = coef 2
  let total = 0;
  let coefSum = 0;

  if (v1 !== null) {
    total += v1 * 1;
    coefSum += 1;
  }
  if (v2 !== null) {
    total += v2 * 2;
    coefSum += 2;
  }
  if (v3 !== null) {
    total += v3 * 2;
    coefSum += 2;
  }

  if (coefSum === 0) return null;
  return parseFloat((total / coefSum).toFixed(2));
};

export const getNextClass = (currentClass: string): string => {
  if (!currentClass) return 'CP1';
  const raw = currentClass.trim();
  
  // Separate primary grade name from section/number suffix (e.g. "6ème 1" => base "6ème", suffix " 1")
  const parts = raw.split(/\s+/);
  let base = parts[0];
  let suffix = parts.length > 1 ? ' ' + parts.slice(1).join(' ') : '';
  
  const baseLower = base.toLowerCase();
  
  if (baseLower.includes('cp1')) return 'CP2' + suffix;
  if (baseLower.includes('cp2')) return 'CE1' + suffix;
  if (baseLower.includes('ce1')) return 'CE2' + suffix;
  if (baseLower.includes('ce2')) return 'CM1' + suffix;
  if (baseLower.includes('cm1')) return 'CM2' + suffix;
  if (baseLower.includes('cm2')) return '6ème' + suffix;
  if (baseLower.includes('6ème') || baseLower.includes('6eme') || baseLower === '6e') return '5ème' + suffix;
  if (baseLower.includes('5ème') || baseLower.includes('5eme') || baseLower === '5e') return '4ème' + suffix;
  if (baseLower.includes('4ème') || baseLower.includes('4eme') || baseLower === '4e') return '3ème' + suffix;
  if (baseLower.includes('3ème') || baseLower.includes('3eme') || baseLower === '3e') return '2nde' + suffix;
  if (baseLower.includes('2nde') || baseLower.includes('seconde') || baseLower === '2nd') return '1ère' + suffix;
  if (baseLower.includes('1ère') || baseLower.includes('1ere') || baseLower === '1er') return 'Terminale' + suffix;
  if (baseLower.includes('terminale') || baseLower.includes('tle')) return 'Diplômé';
  
  return currentClass;
};

export const isSubjectNameMatch = (subName?: string, discName?: string): boolean => {
  if (!subName || !discName) return false;
  const s = subName.toLowerCase().trim();
  const d = discName.toLowerCase().trim();

  if (s === d) return true;

  // Prevent cross-matching between French sub-disciplines
  const isCompS = s.includes('composition') || s.includes('rédaction');
  const isCompD = d.includes('composition') || d.includes('rédaction');
  const isOrthS = s.includes('orthographe') || s.includes('grammaire') || s.includes('ortho');
  const isOrthD = d.includes('orthographe') || d.includes('grammaire') || d.includes('ortho');
  const isExprS = s.includes('expression') || s.includes('oral');
  const isExprD = d.includes('expression') || d.includes('oral');

  if (isCompS || isCompD || isOrthS || isOrthD || isExprS || isExprD) {
    if (isCompS && isCompD) return true;
    if (isOrthS && isOrthD) return true;
    if (isExprS && isExprD) return true;
    if ((s === 'français' || s === 'francais') && isCompD) return true;
    if ((d === 'français' || d === 'francais') && isCompS) return true;
    return false;
  }

  const isAllemandD = d.includes('allemand');
  const isAllemandS = s.includes('allemand');
  const isEspagnolD = d.includes('espagnol');
  const isEspagnolS = s.includes('espagnol');

  if ((isAllemandD && isEspagnolS) || (isEspagnolD && isAllemandS)) {
    return false;
  }

  if (s.includes(d) || d.includes(s)) return true;

  if (d.includes('math') && s.includes('math')) return true;
  if ((d.includes('physique') || d.includes('chimie')) && (s.includes('physique') || s.includes('chimie') || s.includes('sp'))) return true;
  if ((d.includes('vie') || d.includes('terre') || d.includes('svt')) && (s.includes('svt') || s.includes('vie') || s.includes('terre') || s.includes('scien'))) return true;
  if ((d.includes('franç') || d.includes('littérat')) && (s.includes('franç') || s.includes('littérat'))) return true;
  if (d.includes('philo') && s.includes('philo')) return true;
  if (d.includes('anglais') && s.includes('anglais')) return true;
  if (isAllemandD && isAllemandS) return true;
  if (isEspagnolD && isEspagnolS) return true;
  if ((d.includes('l.v.2') || d.includes('lv2')) && (s.includes('l.v.2') || s.includes('lv2'))) return true;
  if ((d.includes('hist') || d.includes('géo')) && (s.includes('hist') || s.includes('géo'))) return true;
  if ((d.includes('art') || d.includes('musiq')) && (s.includes('art') || s.includes('musiq'))) return true;
  if ((d.includes('eps') || d.includes('sport')) && (s.includes('eps') || s.includes('sport'))) return true;
  if (d.includes('edhc') && s.includes('edhc')) return true;
  if (d.includes('info') && s.includes('info')) return true;
  if (d.includes('conduite') && s.includes('conduite')) return true;
  if ((d.includes('application bureautique') || d.includes('bureautique')) && (s.includes('application bureautique') || s.includes('bureautique'))) return true;
  if (d.includes('droit') && s.includes('droit')) return true;
  if ((d.includes('écono') || d.includes('econo')) && (s.includes('écono') || s.includes('econo'))) return true;
  if ((d.includes('technique admin') || d.includes('tac')) && (s.includes('technique admin') || s.includes('tac'))) return true;
  if (d.includes('outils') && s.includes('outils')) return true;
  if (d.includes('expression pro') && s.includes('expression pro')) return true;
  if ((d.includes('sténo') || d.includes('steno')) && (s.includes('sténo') || s.includes('steno'))) return true;

  return false;
};

export const getDisciplineMarkFromStudent = (
  student: any,
  trimKey: '1er trim' | '2ème trim' | '3ème trim',
  disciplineName: string
): number | null => {
  if (!student) return null;

  // 1. Check if student has explicit grades array with t1, t2, t3 matching subject
  if (student.grades && Array.isArray(student.grades) && student.grades.length > 0) {
    const match = student.grades.find((g: any) => isSubjectNameMatch(g.subject, disciplineName));
    if (match) {
      const val = trimKey === '1er trim' ? match.t1 : (trimKey === '2ème trim' ? match.t2 : match.t3);
      if (val !== null && val !== undefined && val !== '' && !isNaN(Number(val))) {
        return Number(val);
      }
    }
  }

  // 2. Fetch subjects list for this trimester
  let trimSubjects: any[] | undefined = undefined;
  if (student.trimesters) {
    const tData = student.trimesters[trimKey] || 
                  student.trimesters[trimKey === '1er trim' ? '1er Trimestre' : (trimKey === '2ème trim' ? '2ème Trimestre' : '3ème Trimestre')];
    if (tData && tData.subjects && tData.subjects.length > 0) {
      trimSubjects = tData.subjects;
    }
  }

  // Fallback to student.subjects for 1er trim or if no trimesters structure exists
  if (!trimSubjects && student.subjects && student.subjects.length > 0) {
    if (trimKey === '1er trim' || !student.trimesters) {
      trimSubjects = student.subjects;
    }
  }

  if (!trimSubjects || trimSubjects.length === 0) return null;

  // Find subject matching disciplineName
  const matchedSubject = trimSubjects.find(s => isSubjectNameMatch(s.name, disciplineName));
  if (!matchedSubject) return null;

  if (matchedSubject.grades && matchedSubject.grades.length > 0) {
    let totalScore = 0;
    let totalCoef = 0;
    matchedSubject.grades.forEach((g: any) => {
      const score = typeof g.score === 'number' ? g.score : parseFloat(g.score);
      const coef = typeof g.coef === 'number' ? g.coef : parseFloat(g.coef || '1');
      if (!isNaN(score) && !isNaN(coef) && coef > 0) {
        totalScore += score * coef;
        totalCoef += coef;
      }
    });
    if (totalCoef > 0) return totalScore / totalCoef;
  }

  if (matchedSubject.grades && Array.isArray(matchedSubject.grades) && matchedSubject.grades.length === 0) {
    return null;
  }

  if (typeof matchedSubject.average === 'number' && !isNaN(matchedSubject.average) && matchedSubject.average > 0) {
    return matchedSubject.average;
  }

  return null;
};

export const getStudentTrimesterAverage = (
  student: any,
  trimKey: '1er trim' | '2ème trim' | '3ème trim'
): number | null => {
  if (!student) return null;

  const fullTrimKey = trimKey === '1er trim' ? '1er trim' : (trimKey === '2ème trim' ? '2ème trim' : '3ème trim');
  const altTrimKey = trimKey === '1er trim' ? '1er Trimestre' : (trimKey === '2ème trim' ? '2ème Trimestre' : '3ème Trimestre');
  const perfIdx = trimKey === '1er trim' ? 0 : (trimKey === '2ème trim' ? 1 : 2);

  // 1. Direct trimester average stored in trimesters object
  if (student.trimesters) {
    const tData = student.trimesters[fullTrimKey] || student.trimesters[altTrimKey];
    if (tData && tData.average !== undefined && tData.average !== null && !isNaN(Number(tData.average)) && Number(tData.average) > 0) {
      return Number(tData.average);
    }
  }

  // 2. Compute from class subjects or student subjects
  const classSubs = getSubjectsForClass(student.class || '');
  let pts = 0;
  let cfs = 0;

  if (classSubs && classSubs.length > 0) {
    classSubs.forEach(subName => {
      const mark = getDisciplineMarkFromStudent(student, trimKey, subName);
      if (mark !== null && mark !== undefined && !isNaN(mark)) {
        const coef = getSubjectCoef(student.class, subName);
        if (coef === 0) {
          pts += (mark > 10 ? mark - 10 : 0);
        } else {
          pts += mark * coef;
          cfs += coef;
        }
      }
    });
  }

  if (cfs > 0) {
    return parseFloat((pts / cfs).toFixed(2));
  }

  // Fallback to student.subjects
  if (student.subjects && Array.isArray(student.subjects) && student.subjects.length > 0) {
    student.subjects.forEach((s: any) => {
      const mark = getDisciplineMarkFromStudent(student, trimKey, s.name);
      if (mark !== null && mark !== undefined && !isNaN(mark)) {
        const coef = getSubjectCoef(student.class, s.name);
        if (coef === 0) {
          pts += (mark > 10 ? mark - 10 : 0);
        } else {
          pts += mark * coef;
          cfs += coef;
        }
      }
    });
  }

  if (cfs > 0) {
    return parseFloat((pts / cfs).toFixed(2));
  }

  return null;
};

export const getSubjectRankInClass = (
  allStudentsInClass: any[],
  currentStudentId: string,
  trimKey: '1er trim' | '2ème trim' | '3ème trim' | 'annuel',
  disciplineName: string
): string => {
  if (!allStudentsInClass || allStudentsInClass.length === 0) return '';

  const studentMarks = allStudentsInClass.map(s => {
    let mark: number | null = null;
    if (trimKey === 'annuel') {
      const m1 = getDisciplineMarkFromStudent(s, '1er trim', disciplineName);
      const m2 = getDisciplineMarkFromStudent(s, '2ème trim', disciplineName);
      const m3 = getDisciplineMarkFromStudent(s, '3ème trim', disciplineName);
      const isTech = isTechnicalClass(s.class);
      mark = calculateAnnualAverage(m1, m2, m3, isTech);
    } else {
      mark = getDisciplineMarkFromStudent(s, trimKey, disciplineName);
    }
    return { id: s.id, mark };
  }).filter(sm => sm.mark !== null && sm.mark !== undefined && !isNaN(sm.mark));

  if (studentMarks.length === 0) return '';

  const currentSm = studentMarks.find(sm => sm.id === currentStudentId);
  if (!currentSm || currentSm.mark === null) return '';

  const myMark = currentSm.mark;
  const strictlyBetter = studentMarks.filter(sm => sm.mark! > myMark + 0.001).length;
  const sameMarkCount = studentMarks.filter(sm => Math.abs(sm.mark! - myMark) <= 0.001).length;

  const rankNum = strictlyBetter + 1;
  const suffix = rankNum === 1 ? 'er' : 'e';
  const ex = sameMarkCount > 1 ? 'ex' : '';

  return `${rankNum}${suffix}${ex}`;
};


