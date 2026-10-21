import { Student, Teacher, ClassItem, getSubjectsForClass } from '../types';

const SUBJECT_HEX_COLORS: Record<string, string> = {
  'Mathématiques': '#3b82f6',
  'Français': '#a855f7',
  'Anglais': '#f43f5e',
  'Histoire-Geo': '#22d3ee',
  'Hist-Géo': '#22d3ee',
  'Histoire': '#22d3ee',
  'Géographie': '#06b6d4',
  'SVT': '#4ade80',
  'Physique-Chimie': '#fbbf24',
  'EPS': '#f472b6',
  'Philosophie': '#7c3aed',
  'Informatique': '#475569',
  'Espagnol': '#e11d48',
  'Allemand': '#4b5563',
  'Arts Plastiques': '#ec4899',
  'Musique': '#6366f1',
  'Éducation Musicale': '#6366f1',
  'Devoir': '#14b8a6',
  'Étude': '#14b8a6',
  'EDHC': '#f97316',
  'Sciences et Technologies': '#10b981',
  'Sciences et Technologies (notions de base)': '#10b981'
};

export const mockTeachers: Teacher[] = [];

export const mockClasses: ClassItem[] = [
  // Primaire
  { id: 101, name: 'CP1', code: 'CP1', students: 40, time: '08:00 - 12:00', color: 'bg-emerald-100 text-emerald-600', section: 'Primaire' },
  { id: 102, name: 'CP2', code: 'CP2', students: 42, time: '08:00 - 12:00', color: 'bg-emerald-100 text-emerald-600', section: 'Primaire' },
  { id: 103, name: 'CE1', code: 'CE1', students: 38, time: '08:00 - 15:30', color: 'bg-teal-100 text-teal-600', section: 'Primaire' },
  { id: 104, name: 'CE2', code: 'CE2', students: 39, time: '08:00 - 15:30', color: 'bg-teal-100 text-teal-600', section: 'Primaire' },
  { id: 105, name: 'CM1', code: 'CM1', students: 45, time: '08:00 - 15:30', color: 'bg-cyan-100 text-cyan-600', section: 'Primaire' },
  { id: 106, name: 'CM2', code: 'CM2', students: 41, time: '08:00 - 15:30', color: 'bg-cyan-100 text-cyan-600', section: 'Primaire' },

  // Général - Collège
  { id: 1, name: '6ème 1', code: '6ème 1', students: 45, time: '07:30 - 13:30', color: 'bg-sky-100 text-sky-600', section: 'Général' },
  { id: 2, name: '6ème 2', code: '6ème 2', students: 42, time: '07:30 - 13:30', color: 'bg-sky-100 text-sky-600', section: 'Général' },
  { id: 3, name: '5ème 1', code: '5ème 1', students: 40, time: '07:30 - 13:30', color: 'bg-yellow-100 text-yellow-600', section: 'Général' },
  { id: 4, name: '5ème 2', code: '5ème 2', students: 43, time: '07:30 - 13:30', color: 'bg-yellow-100 text-yellow-600', section: 'Général' },
  { id: 5, name: '4ème 1', code: '4ème 1', students: 38, time: '07:30 - 13:30', color: 'bg-cyan-100 text-cyan-600', section: 'Général' },
  { id: 6, name: '4ème 2', code: '4ème 2', students: 39, time: '07:30 - 13:30', color: 'bg-cyan-100 text-cyan-600', section: 'Général' },
  { id: 7, name: '3ème 1', code: '3ème 1', students: 35, time: '07:30 - 13:30', color: 'bg-purple-100 text-purple-600', section: 'Général' },
  { id: 8, name: '3ème 2', code: '3ème 2', students: 36, time: '07:30 - 13:30', color: 'bg-purple-100 text-purple-600', section: 'Général' },

  // Général - Lycée
  { id: 9, name: 'Seconde C1', code: '2nde C1', students: 34, time: '07:30 - 17:00', color: 'bg-pink-100 text-pink-600', section: 'Général' },
  { id: 10, name: 'Seconde C2', code: '2nde C2', students: 32, time: '07:30 - 17:00', color: 'bg-pink-100 text-pink-600', section: 'Général' },
  { id: 11, name: 'Seconde A1', code: '2nde A1', students: 38, time: '07:30 - 17:00', color: 'bg-orange-100 text-orange-600', section: 'Général' },
  { id: 12, name: 'Seconde A2', code: '2nde A2', students: 37, time: '07:30 - 17:00', color: 'bg-orange-100 text-orange-600', section: 'Général' },
  { id: 13, name: 'Première D1', code: '1ère D1', students: 30, time: '07:30 - 18:00', color: 'bg-indigo-100 text-indigo-600', section: 'Général' },
  { id: 14, name: 'Première D2', code: '1ère D2', students: 31, time: '07:30 - 18:00', color: 'bg-indigo-100 text-indigo-600', section: 'Général' },
  { id: 15, name: 'Première A1', code: '1ère A1', students: 33, time: '07:30 - 18:00', color: 'bg-teal-100 text-teal-600', section: 'Général' },
  { id: 16, name: 'Première A2', code: '1ère A2', students: 32, time: '07:30 - 18:00', color: 'bg-teal-100 text-teal-600', section: 'Général' },
  { id: 17, name: 'Terminale D1', code: 'Tle D1', students: 28, time: '07:30 - 18:00', color: 'bg-rose-100 text-rose-600', section: 'Général' },
  { id: 18, name: 'Terminale D2', code: 'Tle D2', students: 29, time: '07:30 - 18:00', color: 'bg-rose-100 text-rose-600', section: 'Général' },
  { id: 19, name: 'Terminale A1', code: 'Tle A1', students: 30, time: '07:30 - 18:00', color: 'bg-emerald-100 text-emerald-600', section: 'Général' },
  { id: 20, name: 'Terminale A2', code: 'Tle A2', students: 31, time: '07:30 - 18:00', color: 'bg-emerald-100 text-emerald-600', section: 'Général' },

  // Technique
  { id: 201, name: 'Seconde G1', code: '2nde G1', students: 30, time: '07:30 - 18:00', color: 'bg-amber-100 text-amber-600', section: 'Technique' },
  { id: 202, name: 'Seconde G2', code: '2nde G2', students: 28, time: '07:30 - 18:00', color: 'bg-amber-100 text-amber-600', section: 'Technique' },
  { id: 204, name: 'Première G1', code: '1ère G1', students: 28, time: '07:30 - 18:00', color: 'bg-amber-100 text-amber-600', section: 'Technique' },
  { id: 205, name: 'Première G2', code: '1ère G2', students: 26, time: '07:30 - 18:00', color: 'bg-amber-100 text-amber-600', section: 'Technique' },
  { id: 207, name: 'Terminale G1', code: 'Tle G1', students: 25, time: '07:30 - 18:00', color: 'bg-amber-100 text-amber-600', section: 'Technique' },
  { id: 208, name: 'Terminale G2', code: 'Tle G2', students: 24, time: '07:30 - 18:00', color: 'bg-amber-100 text-amber-600', section: 'Technique' },
];

// Helper to generate a large list of students to simulate a real database
const generateBulkStudents = (count: number): Student[] => {
  const firstNames = ['Lucas', 'Léa', 'Enzo', 'Manon', 'Louis', 'Chloé', 'Gabriel', 'Julie', 'Adam', 'Sarah', 'Kofi', 'Awa', 'Moussa', 'Fatou', 'Yao', 'Aminata', 'Kouassi', 'Grace'];
  const lastNames = ['Kone', 'Toure', 'Kouame', 'Diop', 'Traore', 'Bakayoko', 'Coulibaly', 'Ouattara', 'Cisse', 'Fofana', 'Diallo', 'Soro'];
  
  const students: Student[] = [];
  const classNames = mockClasses.map(c => c.name);

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const className = classNames[i % classNames.length]; // Distribute evenly among classes
    
    // Random performance data
    const average = 8 + Math.random() * 10;
    
      const classNameLower = className.toLowerCase();
      const isSeniorClass = classNameLower.includes('première') || classNameLower.includes('premiere') || classNameLower.includes('terminal');
      
      const classNameUpper = className.trim().toUpperCase();
      const isPrimary = classNameUpper.startsWith('CP') || classNameUpper.startsWith('CE') || classNameUpper.startsWith('CM');
      
      let baseSubjects: any[] = [];
      if (isPrimary) {
          const subjectsList = getSubjectsForClass(className);
          baseSubjects = subjectsList.map(name => ({
              name,
              value: 20,
              average: 0,
              fill: SUBJECT_HEX_COLORS[name] || '#3b82f6'
          }));
      } else {
          baseSubjects = [
            { name: 'Informatique', value: 15, average: 13.5, fill: '#64748b' },
            { name: 'Physique-Chimie', value: 15, average: 12.8, fill: '#fbbf24' },
            { name: 'SVT', value: 15, average: 13.2, fill: '#4ade80' },
            { name: 'Philosophie', value: 15, average: 11.5, fill: '#7c3aed' },
            { name: 'Mathématiques', value: 20, average: 12.0, fill: '#3b82f6' },
            { name: 'Français', value: 15, average: 12.5, fill: '#a855f7' },
            { name: 'Anglais', value: 10, average: 13.0, fill: '#f43f5e' },
            { name: 'Hist-Géo', value: 10, average: 12.0, fill: '#22d3ee' },
            { name: 'EPS', value: 10, average: 15.0, fill: '#f472b6' }
          ];
      }

    students.push({
      id: `gen-${i}`,
      name: `${firstName} ${lastName}`,
      class: className,
      photoUrl: `https://i.pravatar.cc/150?u=${i + 100}`,
      studentId: `2024-${className.substring(0,3).toUpperCase()}-${1000 + i}`,
      parentPhone: `07${Math.floor(10000000 + Math.random() * 90000000)}`, // Realistic IVC fake number
      birthDate: `01/01/${2005 + Math.floor(Math.random() * 5)}`,
      absences: Math.random() > 0.7 ? Math.floor(Math.random() * 10) : 0, // 30% have absences
      assignedStatus: i % 4 === 1 ? 'non_affecte' : 'affecte',
      attendanceHistory: [],
      performance: [
            { name: 'Sep', studentScore: 10 + Math.random() * 5, classAverage: 0 },
            { name: 'Oct', studentScore: 10 + Math.random() * 5, classAverage: 0 },
            { name: 'Nov', studentScore: 10 + Math.random() * 5, classAverage: 0 },
            { name: 'Déc', studentScore: 10 + Math.random() * 5, classAverage: 0 },
            { name: 'Jan', studentScore: 10 + Math.random() * 5, classAverage: 0 },
            { name: 'Fév', studentScore: 10 + Math.random() * 5, classAverage: 0 },
            { name: 'Mar', studentScore: 10 + Math.random() * 5, classAverage: 0 },
            { name: 'Avr', studentScore: 10 + Math.random() * 5, classAverage: 0 },
            { name: 'Mai', studentScore: 10 + Math.random() * 5, classAverage: 0 }
        ],
        subjects: baseSubjects,
      activities: []
    });
  }
  return students;
};

// Base manual students (High detail)
const manualStudents: Student[] = [
  {
    id: 'p1',
    name: 'Kouassi Daniel',
    class: 'CM2',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&q=80',
    studentId: '2024-CM2-1001',
    parentPhone: '07 01 02 03 04',
    birthDate: '12 Mars 2013',
    absences: 1,
    assignedStatus: 'affecte',
    attendanceHistory: [],
    performance: [
      { name: 'Sep', studentScore: 15, classAverage: 0 },
      { name: 'Oct', studentScore: 16, classAverage: 0 },
      { name: 'Nov', studentScore: 17, classAverage: 0 },
      { name: 'Dec', studentScore: 16.5, classAverage: 0 },
    ],
    subjects: [
      { name: 'Français', value: 20, average: 0, fill: '#a855f7' },
      { name: 'Mathématiques', value: 20, average: 0, fill: '#3b82f6' },
      { name: 'Histoire', value: 15, average: 0, fill: '#22d3ee' },
      { name: 'Géographie', value: 15, average: 0, fill: '#06b6d4' },
      { name: 'EDHC', value: 10, average: 0, fill: '#f97316' },
      { name: 'Sciences et Technologies', value: 15, average: 0, fill: '#10b981' },
      { name: 'Arts Plastiques', value: 10, average: 0, fill: '#ec4899' },
      { name: 'Éducation Musicale', value: 10, average: 0, fill: '#6366f1' }
    ],
    activities: [
      { id: '1', name: 'Lecture', date: "Aujourd'hui, 09:00", amount: '17/20', type: 'positive', icon: 'grade', categoryColor: 'bg-indigo-50 text-indigo-600' }
    ]
  },
  {
    id: '1',
    name: 'Alice Martin',
    class: 'Seconde C1',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    studentId: '2023-MAT-0012',
    parentPhone: '07 08 09 10 11',
    birthDate: '14 Mai 2008',
    absences: 4,
    assignedStatus: 'affecte',
    attendanceHistory: [
        { id: 'att-1', date: '20 Oct 2023', type: 'absent', hours: 2, justified: false },
        { id: 'att-2', date: '15 Oct 2023', type: 'late', hours: 1, justified: true }
    ],
    performance: [
      { name: 'Sep', studentScore: 16, classAverage: 0 },
      { name: 'Oct', studentScore: 15, classAverage: 0 },
      { name: 'Nov', studentScore: 18, classAverage: 0 },
      { name: 'Dec', studentScore: 17, classAverage: 0 },
      { name: 'Jan', studentScore: 19, classAverage: 0 },
      { name: 'Fév', studentScore: 18, classAverage: 0 },
      { name: 'Mar', studentScore: 17, classAverage: 0 },
    ],
    subjects: [
      { name: 'Mathématiques', value: 30, average: 0, fill: '#3b82f6' }, 
      { name: 'Physique-Chimie', value: 20, average: 0, fill: '#fbbf24' },
      { name: 'SVT', value: 15, average: 0, fill: '#4ade80' },
      { name: 'Anglais', value: 15, average: 0, fill: '#f43f5e' },
      { name: 'Informatique', value: 10, average: 0, fill: '#475569' },
      { name: 'Français', value: 10, average: 0, fill: '#a855f7' }, 
    ],
    activities: [
      { id: '1', name: 'Examen Math', date: 'Aujourd\'hui, 10:00', amount: '18/20', type: 'positive', icon: 'exam', categoryColor: 'bg-indigo-50 text-indigo-600' },
      { id: '2', name: 'Retard Bibliothèque', date: 'Hier, 14:00', amount: '-2 pts', type: 'negative', icon: 'alert', categoryColor: 'bg-indigo-50 text-indigo-600' },
      { id: '3', name: 'Projet Sciences', date: '24 Oct 2023', amount: 'Rendu', type: 'positive', icon: 'complete', categoryColor: 'bg-indigo-50 text-indigo-600' },
      { id: '4', name: 'Absence', date: '20 Oct 2023', amount: '2h', type: 'negative', icon: 'attendance', categoryColor: 'bg-sky-50 text-sky-600' },
    ]
  },
  {
    id: '2',
    name: 'Jean Dupont',
    class: '6ème 1',
    photoUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    studentId: '2024-SCI-0892',
    parentPhone: '01 02 03 04 05',
    birthDate: '22 Aout 2009',
    absences: 12,
    assignedStatus: 'non_affecte',
    attendanceHistory: [],
    performance: [
      { name: 'Sep', studentScore: 12, classAverage: 0 },
      { name: 'Oct', studentScore: 13, classAverage: 0 },
      { name: 'Nov', studentScore: 13.5, classAverage: 0 },
      { name: 'Dec', studentScore: 11, classAverage: 0 },
      { name: 'Jan', studentScore: 14, classAverage: 0 },
      { name: 'Fév', studentScore: 14.5, classAverage: 0 },
      { name: 'Mar', studentScore: 15, classAverage: 0 },
    ],
    subjects: [
      { name: 'Mathématiques', value: 20, average: 0, fill: '#3b82f6' }, 
      { name: 'Physique-Chimie', value: 15, average: 0, fill: '#fbbf24' },
      { name: 'Français', value: 20, average: 0, fill: '#a855f7' }, 
      { name: 'Histoire-Geo', value: 15, average: 0, fill: '#22d3ee' }, 
      { name: 'Anglais', value: 15, average: 0, fill: '#f43f5e' },
      { name: 'EDHC', value: 10, average: 0, fill: '#f97316' },
      { name: 'SVT', value: 10, average: 0, fill: '#4ade80' },
      { name: 'EPS', value: 10, average: 0, fill: '#f472b6' }, 
    ],
    activities: [
      { id: '1', name: 'Dissertation Hist', date: 'Aujourd\'hui, 09:00', amount: '13/20', type: 'positive', icon: 'grade', categoryColor: 'bg-indigo-50 text-indigo-600' },
      { id: '2', name: 'Sport', date: 'Lundi, 11:00', amount: 'Présent', type: 'neutral', icon: 'complete', categoryColor: 'bg-indigo-50 text-indigo-600' },
      { id: '3', name: 'Cantine', date: '15 Oct 2023', amount: 'Payé', type: 'positive', icon: 'alert', categoryColor: 'bg-indigo-50 text-indigo-600' },
    ]
  },
   {
    id: '3',
    name: 'Emma Bertrand',
    class: 'Terminale D1',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80',
    studentId: '2023-ART-5510',
    parentPhone: '05 06 07 08 09',
    birthDate: '03 Fév 2006',
    absences: 0,
    assignedStatus: 'affecte',
    attendanceHistory: [],
    performance: [
      { name: 'Sep', studentScore: 18, classAverage: 0 },
      { name: 'Oct', studentScore: 19, classAverage: 0 },
      { name: 'Nov', studentScore: 18.5, classAverage: 0 },
      { name: 'Dec', studentScore: 19, classAverage: 0 },
      { name: 'Jan', studentScore: 19.5, classAverage: 0 },
      { name: 'Fév', studentScore: 18, classAverage: 0 },
      { name: 'Mar', studentScore: 19, classAverage: 0 },
    ],
    subjects: [
      { name: 'Informatique', value: 16, average: 16, fill: '#64748b' },
      { name: 'Physique-Chimie', value: 18, average: 18, fill: '#fbbf24' },
      { name: 'SVT', value: 17, average: 17, fill: '#4ade80' },
      { name: 'Philosophie', value: 15, average: 15, fill: '#7c3aed' },
      { name: 'Mathématiques', value: 19, average: 19, fill: '#3b82f6' },
      { name: 'Français', value: 16, average: 16, fill: '#a855f7' },
      { name: 'Anglais', value: 17, average: 17, fill: '#f43f5e' },
      { name: 'Hist-Géo', value: 15, average: 15, fill: '#22d3ee' },
      { name: 'EPS', value: 16, average: 16, fill: '#f472b6' }
    ],
    activities: [
      { id: '1', name: 'Club Théâtre', date: 'Aujourd\'hui, 16:00', amount: 'Lead', type: 'positive', icon: 'grade', categoryColor: 'bg-purple-50 text-purple-600' },
      { id: '2', name: 'Quiz Physique', date: 'Hier', amount: '20/20', type: 'positive', icon: 'exam', categoryColor: 'bg-indigo-50 text-indigo-600' },
    ]
  }
];

// Base students
export const mockStudents: Student[] = [
    ...manualStudents,
    ...generateBulkStudents(120)
];
