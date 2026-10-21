export interface Transaction {
  id: string;
  name: string;
  date: string;
  amount: string; 
  type: 'positive' | 'negative' | 'neutral';
  icon: string;
  categoryColor: string;
}

export interface ChartData {
  name: string;
  studentScore: number;
  classAverage: number;
}

export interface GradeItem {
  id: number | string;
  title: string;
  date: string;
  score: number;
  coef: number;
  maxScore?: number;
  classAvg: number;
  type?: 'grade' | 'plus' | 'minus';
  points?: number;
  isBonus?: boolean;
  appreciation?: string;
}

export interface AnalyticsData {
  name: string;
  value: number;
  average: number; 
  fill: string;
  grades?: GradeItem[];
}

export interface AttendanceRecord {
  id: string;
  date: string;
  type: 'absent' | 'late';
  hours: number;
  justified?: boolean;
  subject?: string; // Nouveau champ
  timeSlot?: string; // Nouveau champ
  exactTime?: string;
  teacherName?: string;
}

export interface TrimesterData {
  subjects: AnalyticsData[];
  average?: number;
}

export interface Student {
  id: string;
  name: string;
  class: string;
  photoUrl: string;
  studentId: string; 
  parentPhone?: string; 
  fatherPhone?: string;
  fatherEmail?: string;
  motherPhone?: string;
  motherEmail?: string;
  tutorPhone?: string;
  parentEmail?: string;
  studentPhone?: string; 
  birthDate: string;
  birthPlace?: string;
  birthCertificateNumber?: string;
  birthCertificateDate?: string;
  birthCertificateCity?: string;
  gender?: 'M' | 'F';
  nationality?: string;
  country?: string;
  absences: number; 
  assignedStatus?: 'affecte' | 'non_affecte'; // Statut d'affectation (Affecté / Non affecté)
  attendanceHistory: AttendanceRecord[]; // New field
  performance: ChartData[];
  subjects: AnalyticsData[];
  trimesters?: Record<string, TrimesterData>;
  activities: Transaction[];
  mainTeacherName?: string;
  teacherSignature?: string;
  directorName?: string;
  directorSignature?: string;
  stampMode?: 'blank' | 'digital';
}

export interface Teacher {
  id: number | string;
  name: string;
  gender?: 'M' | 'F';
  dob?: string;
  matricule?: string;
  subject: string;
  level?: string;
  function?: string;
  status?: 'Actif' | 'Inactif';
  uid?: string | null;
  accountCreated?: boolean;
  authUid?: string;
  createdAt?: string;
  photo: string;
  email: string;
  phone?: string;
  assignedClasses?: string[];
  isPrincipal?: boolean;
  principalClasses?: string[];
  scheduleData?: any[];
  authorizationDecision?: string;
  accreditationCode?: string;
}

export interface ClassItem {
  id: number;
  name: string;
  code: string;
  students: number;
  time: string;
  color: string;
  section?: 'Primaire' | 'Général' | 'Technique';
}

export interface ScheduleEvent {
  id: string;
  classId: number | string;
  dayIndex: number; 
  startHour: number; 
  duration: number; 
  subject: string;
  room: string;
  teacher: string;
  color: string;
}

// Nouvelles interfaces pour l'authentification avec NIVEAUX
export type UserRole = 'student' | 'parent' | 'educator' | 'teacher' | 'cashier' | 'director' | 'admin';

export interface ParentChild {
  matricule: string;
  assignedClass: string;
  studentId?: string;
  name?: string;
}

export interface User {
  id: number | string;
  name: string;
  role: UserRole;
  accessLevel: number; // 1 à 5
  pinCode: string; 
  photo?: string;
  bio?: string;
  faceIdEnabled?: boolean;
  subject?: string; 
  accreditationCode?: string;
  email?: string;
  assignedClasses?: string[];
  // student/parent specific fields
  matricule?: string;
  birthDate?: string;
  birthPlace?: string;
  gender?: 'M' | 'F';
  assignedClass?: string;
  assignedStatus?: string;
  parentPhone?: string;
  studentPhone?: string;
  phone?: string;
  section?: 'Primaire' | 'Secondaire' | 'Technique';
  childrenCount?: number;
  children?: ParentChild[];
  directorType?: 'Directeur des Études' | 'Directeur Exécutif' | string;
}

export interface MediaDocument {
  id: string;
  title: string;
  category: 'Roman' | 'Cahier d\'habiletés' | 'Support de cours' | 'Manuel scolaire' | 'Annales' | 'Exercices' | 'Épreuves' | 'Documents administratifs' | string;
  subject: string;
  classLevel: string;
  author: string;
  description: string;
  coverImage?: string;
  pdfUrl?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  pageCount?: number;
  fileSize?: string;
  isFeatured?: boolean;
  isFree?: boolean;
  downloadCount?: number;
  viewCount?: number;
  chapters?: { title: string; content: string }[];
  exercisesCount?: number;
  addedBy?: string;
  addedById?: string | number;
  addedDate?: string;
}

export function getSubjectsForClass(className: string): string[] {
  const name = (className || '').trim().toUpperCase();
  if (name.startsWith('CP')) {
    return [
      'Français',
      'Mathématiques',
      'EDHC',
      'Sciences et Technologies (notions de base)',
      'Arts Plastiques',
      'Éducation Musicale',
      'EPS'
    ];
  }
  if (name.startsWith('CE')) {
    return [
      'Français',
      'Mathématiques',
      'Histoire',
      'Géographie',
      'EDHC',
      'Sciences et Technologies',
      'Arts Plastiques',
      'Éducation Musicale',
      'EPS'
    ];
  }
  if (name.startsWith('CM')) {
    return [
      'Français',
      'Mathématiques',
      'Histoire',
      'Géographie',
      'EDHC',
      'Sciences et Technologies',
      'Arts Plastiques',
      'Éducation Musicale'
    ];
  }

  // Check if it's a technical class
  const isTech = name.includes('G1') || name.includes('G2') || name.includes('AB') || name.includes('G3') || name.includes('F1') || name.includes('F2') || name.includes('F3') || name.includes('BT') || name.includes('CAP') || name.includes('TECHNIQUE') || name.includes('PROFESSIONNEL');
  if (isTech) {
    return [
      'Français',
      'Anglais',
      'Allemand',
      'Espagnol',
      'Histoire-Géographie',
      'Mathématiques',
      'Sciences de la Vie et de la Terre',
      'Droit',
      'Économie Générale',
      'Technique Administrative et Commerciale',
      'Outils de communication',
      'Expression Professionnelle',
      'Sténographie',
      'Informatique',
      'Éducation Physique et Sportive',
      'Conduite'
    ];
  }

  return [
    'Informatique',
    'Physique-Chimie',
    'SVT',
    'Philosophie',
    'Mathématiques',
    'Français',
    'Anglais',
    'Hist-Géo',
    'EPS'
  ];
}

declare global {
  interface Window {
    electronAPI?: {
      setTitleBarColor: (color: string, symbolColor?: string) => void;
    };
  }
}
