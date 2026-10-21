import { DailyScheduleMobileView } from './DailyScheduleMobileView';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, MapPin, BookOpen, ArrowRight, ArrowLeft, Plus, Trash2, X, Save, Edit3, Lock, Clock, Search, FileText, User, GraduationCap, LayoutGrid, Table, Users, CheckCircle, Bell } from 'lucide-react';
import { mockClasses, mockTeachers } from '../data/mockData';
import { ClassItem, getSubjectsForClass } from '../types';
import { getParentChildren, isSameClass } from '../src/utils/parentUtils';
import { triggerImmediateCourseReminder, scheduleCourseNotifications } from '../src/services/NotificationScheduler';

interface SchedulePageProps {
  allStudents?: any[];
  readOnly?: boolean;
  restrictedClass?: string;
  currentUser?: any;
  onNavigate?: (page: string) => void;
  teachers?: any[];
  onClose?: () => void;
}

export const getTeacherForSubject = (subject: string, teachersList?: any[], className?: string): { name: string; photo?: string; email?: string } => {
  if (teachersList && teachersList.length > 0) {
    if (className) {
      const exactMatch = teachersList.find(t => {
        if (!t.subject) return false;
        const tSub = t.subject.toLowerCase();
        const sSub = subject.toLowerCase();
        const isSub = tSub === sSub || tSub.includes(sSub) || sSub.includes(tSub);
        const isClass = (t.assignedClasses && t.assignedClasses.includes(className)) || (t.principalClasses && t.principalClasses.includes(className));
        return isSub && isClass;
      });
      if (exactMatch) {
        return { name: exactMatch.name, photo: exactMatch.photo, email: exactMatch.email };
      }
    }

    const found = teachersList.find(t => {
      if (!t.subject) return false;
      const tSub = t.subject.toLowerCase();
      const sSub = subject.toLowerCase();
      return tSub === sSub || tSub.includes(sSub) || sSub.includes(tSub);
    });
    if (found) {
      return {
        name: found.name,
        photo: found.photo,
        email: found.email
      };
    }
  }

  const fallbackMap: Record<string, { name: string; photo?: string; email?: string }> = {
    'Philosophie': { name: 'Mme.ZILF', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', email: 'zilf@ecole.edu' },
    'Physique-Chimie': { name: "Mr.N'ZUE", photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80', email: 'nzue@ecole.edu' },
    'Français': { name: 'Mr.LAGBO', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', email: 'lagbo@ecole.edu' },
    'Anglais': { name: 'Mr.DEJOU', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', email: 'dejou@ecole.edu' },
    'SVT': { name: 'Mme.BAMBA', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80', email: 'bamba@ecole.edu' },
    'Mathématiques': { name: 'Mr.KOFFI', photo: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=150&q=80', email: 'koffi@ecole.edu' },
    'Hist-Géo': { name: 'Mr.KONAN TRESOR', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', email: 'konantresor@ecole.edu' },
    'Informatique': { name: 'David Legrand', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80', email: 'd.legrand@ecole.edu' },
    'EPS': { name: 'Michel Brun', photo: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&q=80', email: 'm.brun@ecole.edu' },
    'Physique.Chimie': { name: "Mr.N'ZUE", photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80' },
    'Histoire-Géographie': { name: 'Mr.KONAN TRESOR', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
    'Histoire-Geo': { name: 'Mr.KONAN TRESOR', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' },
    'Sciences de la Vie et de la Terre': { name: 'Mme.BAMBA', photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80' },
    'Philosaphie': { name: 'Mme.ZILF', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80' },
    'Françals': { name: 'Mr.LAGBO', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
    'Devoir': { name: 'Surveillant Général', photo: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&q=80', email: 'surveillance@ecole.edu' },
    'Étude': { name: 'Surveillant Général', photo: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=150&q=80', email: 'surveillance@ecole.edu' },
  };

  return fallbackMap[subject] || { name: 'Professeur de ' + subject, photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80' };
};

// Configuration Data
export const DEFAULT_TIME_SLOTS = [
  '07h30 - 08h25',
  '08h25 - 09h20',
  '09h20 - 10h15',
  '10h15 - 10h30',
  '10h30 - 11h25',
  '11h25 - 12h10',
  '13h00 - 13h55',
  '13h55 - 14h50',
  '14h50 - 15h45',
  '15h45 - 16h40',
  '16h40 - 17h35'
];

// Index of the last morning course slot ('11h25 - 12h10'), right before the Pause Midi separator row
export const getLunchBreakIndex = (slots?: string[]): number => {
    if (slots && slots.length > 0) {
        const idx = slots.findIndex(s => s && (s.trim().startsWith('11h25') || s.includes('12h10')));
        if (idx !== -1) {
            return idx;
        }
    }
    return 5;
};

const normalizeTimeSlots = (slots: string[]): string[] => {
    if (!Array.isArray(slots) || slots.length === 0) return DEFAULT_TIME_SLOTS;
    const copy = [...slots];
    if (copy[5] === '11h25 - 12h20') {
        copy[5] = '11h25 - 12h10';
    }
    if (copy[6] === '12h10 - 14h50' || copy[6] === '12h20 - 13h15' || copy[6]?.includes('1300h20') || copy[6] === '13h20 - 13h55') {
        copy[6] = '13h00 - 13h55';
    }
    // Replace any accidental Pause Midi text in slots or 1300h20 / 13h20 typo
    for (let i = 0; i < copy.length; i++) {
        if (copy[i]?.includes('1300h20')) {
            copy[i] = copy[i].replace('1300h20', '13h00');
        }
        if (copy[i] === '13h20 - 13h55') {
            copy[i] = '13h00 - 13h55';
        }
    }
    if (copy.length === 11 && copy[7] === '13h15 - 14h50') {
        return DEFAULT_TIME_SLOTS;
    }
    // Ensure 16h40 - 17h35 is present if the list previously stopped at 15h45 - 16h40
    if (copy.length === 10 && copy[9]?.includes('16h40')) {
        copy.push('16h40 - 17h35');
    }
    return copy;
};

export const getStoredTimeSlots = (classId?: number | string, className?: string): string[] => {
    try {
        if (classId) {
            const classKey = `school_time_slots_${classId}`;
            const classSaved = localStorage.getItem(classKey);
            if (classSaved) return normalizeTimeSlots(JSON.parse(classSaved));
        }
        if (className) {
            const classKeyName = `school_time_slots_${className}`;
            const classSavedName = localStorage.getItem(classKeyName);
            if (classSavedName) return normalizeTimeSlots(JSON.parse(classSavedName));
        }
        const saved = localStorage.getItem('school_time_slots');
        if (saved) return normalizeTimeSlots(JSON.parse(saved));
    } catch (e) {}
    return DEFAULT_TIME_SLOTS;
};

export const saveTimeSlots = (slots: string[]) => {
    try {
        localStorage.setItem('school_time_slots', JSON.stringify(slots));
        window.dispatchEvent(new CustomEvent('school_time_slots_updated', { detail: slots }));
    } catch (e) {}
};

export const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const days = DAYS;

export const abbreviateClassName = (str?: string): string => {
  if (!str) return '';
  return str
    .replace(/terminale/gi, 'Tle')
    .replace(/TERMINALE/g, 'TLE');
};

const SUBJECTS = [
    'Mathématiques', 'Français', 'Anglais', 'Hist-Géo', 'SVT', 
    'Physique-Chimie', 'EPS', 'Philosophie', 'Informatique', 'Espagnol', 
    'Allemand', 'Arts Plastiques', 'Musique', 'Devoir',
    'Histoire', 'Géographie', 'EDHC', 'Sciences et Technologies', 'Éducation Musicale', 'Sciences et Technologies (notions de base)'
];

const ROOMS = [
    'CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2',
    '6ème A', '6ème B', '5ème A', '5ème B', 
    '4ème A', '4ème B', '3ème A', '3ème B', 
    'Seconde A', 'Seconde C', '1ère A', '1ère D', 'Tle A', 'Tle D'
];

// Mapping Couleur par Matière
const getSubjectColor = (subject: string): string => {
    switch (subject) {
        case 'Mathématiques': return 'bg-sky-100 border-sky-200 text-sky-700';
        case 'SVT': 
        case 'Sciences et Technologies':
            return 'bg-cyan-100 border-cyan-200 text-cyan-700';
        case 'Physique-Chimie': return 'bg-purple-100 border-purple-200 text-purple-700';
        case 'Français': return 'bg-pink-100 border-pink-200 text-pink-700';
        case 'Anglais': return 'bg-sky-100 border-sky-200 text-sky-700';
        case 'Hist-Géo': 
        case 'Histoire':
        case 'Géographie':
            return 'bg-amber-100 border-amber-200 text-amber-700';
        case 'EPS': return 'bg-green-100 border-green-200 text-green-700';
        case 'Philosophie': return 'bg-slate-100 border-slate-200 text-slate-700';
        case 'Informatique': return 'bg-indigo-100 border-indigo-200 text-indigo-700';
        case 'Espagnol': return 'bg-orange-100 border-orange-200 text-orange-700';
        case 'Allemand': return 'bg-lime-100 border-lime-200 text-lime-700';
        case 'Arts Plastiques': return 'bg-fuchsia-100 border-fuchsia-200 text-fuchsia-700';
        case 'Musique': 
        case 'Éducation Musicale':
            return 'bg-violet-100 border-violet-200 text-violet-700';
        case 'EDHC': return 'bg-teal-100 border-teal-200 text-teal-700';
        case 'Devoir':
        case 'Devoirs':
        case 'Étude': return 'bg-gray-100 border-gray-200 text-gray-600';
        default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
};

export interface ScheduleEvent {
    id: string;
    day: number;
    start: number; // Index in timeSlots
    duration: number; // In slots
    title: string;
    room: string;
    color: string;
    customTime?: string;
    teacherName?: string;
}

export const getTerminaleD1Schedule = (roomName: string = 'Terminale D1'): ScheduleEvent[] => {
    return [
        // LUNDI (day: 0)
        // 07h30 - 09h20 (Slots 0 & 1, 2h): Philosophie - Mme.ZILF
        { id: 'tle-d1-lun-philo', day: 0, start: 0, duration: 2, title: 'Philosophie', room: roomName, color: getSubjectColor('Philosophie'), teacherName: 'Mme.ZILF' },
        // 10h30 - 12h10 (Slots 4 & 5, 2h): Physique-Chimie - Mr.N'ZUE
        { id: 'tle-d1-lun-pc', day: 0, start: 4, duration: 2, title: 'Physique-Chimie', room: roomName, color: getSubjectColor('Physique-Chimie'), teacherName: "Mr.N'ZUE" },
        // 13h00 - 14h50 (Slots 6 & 7, 2h): Français - Mr.LAGBO
        { id: 'tle-d1-lun-fr', day: 0, start: 6, duration: 2, title: 'Français', room: roomName, color: getSubjectColor('Français'), teacherName: 'Mr.LAGBO' },
        // 14h50 - 16h40 (Slots 8 & 9, 2h): Anglais - Mr.DEJOU
        { id: 'tle-d1-lun-ang', day: 0, start: 8, duration: 2, title: 'Anglais', room: roomName, color: getSubjectColor('Anglais'), teacherName: 'Mr.DEJOU' },

        // MARDI (day: 1)
        // 07h30 - 09h20 (Slots 0 & 1, 2h): SVT - Mme.BAMBA
        { id: 'tle-d1-mar-svt', day: 1, start: 0, duration: 2, title: 'SVT', room: roomName, color: getSubjectColor('SVT'), teacherName: 'Mme.BAMBA' },
        // 09h20 - 10h15 (Slot 2, 1h): Mathématiques - Mr.KOFFI
        { id: 'tle-d1-mar-math1', day: 1, start: 2, duration: 1, title: 'Mathématiques', room: roomName, color: getSubjectColor('Mathématiques'), teacherName: 'Mr.KOFFI' },
        // 10h30 - 12h10 (Slots 4 & 5, 2h): Hist-Géo - Mr.KONAN TRESOR
        { id: 'tle-d1-mar-hg', day: 1, start: 4, duration: 2, title: 'Hist-Géo', room: roomName, color: getSubjectColor('Hist-Géo'), teacherName: 'Mr.KONAN TRESOR' },
        // 13h00 - 14h50 (Slots 6 & 7, 2h): Mathématiques - Mr.KOFFI
        { id: 'tle-d1-mar-math2', day: 1, start: 6, duration: 2, title: 'Mathématiques', room: roomName, color: getSubjectColor('Mathématiques'), teacherName: 'Mr.KOFFI' },
        // 14h50 - 16h40 (Slots 8 & 9, 2h): Français - Mr.LAGBO
        { id: 'tle-d1-mar-fr', day: 1, start: 8, duration: 2, title: 'Français', room: roomName, color: getSubjectColor('Français'), teacherName: 'Mr.LAGBO' },

        // MERCREDI (day: 2)
        // 07h30 - 09h20 (Slots 0 & 1, 2h): SVT - Mme.BAMBA
        { id: 'tle-d1-mer-svt', day: 2, start: 0, duration: 2, title: 'SVT', room: roomName, color: getSubjectColor('SVT'), teacherName: 'Mme.BAMBA' },

        // JEUDI (day: 3)
        // 07h30 - 09h20 (Slots 0 & 1, 2h): Informatique - David Legrand
        { id: 'tle-d1-jeu-info', day: 3, start: 0, duration: 2, title: 'Informatique', room: roomName, color: getSubjectColor('Informatique'), teacherName: 'David Legrand' },
        // 10h30 - 12h10 (Slots 4 & 5, 2h): EPS - Michel Brun (2h d'EPS)
        { id: 'tle-d1-jeu-eps', day: 3, start: 4, duration: 2, title: 'EPS', room: roomName, color: getSubjectColor('EPS'), teacherName: 'Michel Brun' },
        // 13h00 - 14h50 (Slots 6 & 7, 2h): Physique-Chimie - Mr.N'ZUE
        { id: 'tle-d1-jeu-pc', day: 3, start: 6, duration: 2, title: 'Physique-Chimie', room: roomName, color: getSubjectColor('Physique-Chimie'), teacherName: "Mr.N'ZUE" },
        // 14h50 - 16h40 (Slots 8 & 9, 2h): Mathématiques - Mr.KOFFI
        { id: 'tle-d1-jeu-math', day: 3, start: 8, duration: 2, title: 'Mathématiques', room: roomName, color: getSubjectColor('Mathématiques'), teacherName: 'Mr.KOFFI' },

        // VENDREDI (day: 4)
        // 07h30 - 09h20 (Slots 0 & 1, 2h): Mathématiques - Mr.KOFFI
        { id: 'tle-d1-ven-math', day: 4, start: 0, duration: 2, title: 'Mathématiques', room: roomName, color: getSubjectColor('Mathématiques'), teacherName: 'Mr.KOFFI' },
        // 09h20 - 10h15 (Slot 2, 1h): Anglais - Mr.DEJOU
        { id: 'tle-d1-ven-ang', day: 4, start: 2, duration: 1, title: 'Anglais', room: roomName, color: getSubjectColor('Anglais'), teacherName: 'Mr.DEJOU' },
        // 10h30 - 12h10 (Slots 4 & 5, 2h): Physique-Chimie - Mr.N'ZUE
        { id: 'tle-d1-ven-pc', day: 4, start: 4, duration: 2, title: 'Physique-Chimie', room: roomName, color: getSubjectColor('Physique-Chimie'), teacherName: "Mr.N'ZUE" },
        // 13h00 - 14h50 (Slots 6 & 7, 2h): SVT - Mme.BAMBA
        { id: 'tle-d1-ven-svt', day: 4, start: 6, duration: 2, title: 'SVT', room: roomName, color: getSubjectColor('SVT'), teacherName: 'Mme.BAMBA' },
        // 14h50 - 16h40 (Slots 8 & 9, 2h): Philosophie - Mme.ZILF
        { id: 'tle-d1-ven-philo', day: 4, start: 8, duration: 2, title: 'Philosophie', room: roomName, color: getSubjectColor('Philosophie'), teacherName: 'Mme.ZILF' }
    ];
};

// Initial Generator (reused logic but returns typed objects)
const generateClassSchedule = (classId: number | string, totalSlots: number = DEFAULT_TIME_SLOTS.length): ScheduleEvent[] => {
    const targetClass = mockClasses.find(c => String(c.id) === String(classId));
    const defaultRoomName = targetClass ? targetClass.name : ROOMS[0];

    if (String(classId) === '17' || defaultRoomName.toLowerCase().includes('terminale') || defaultRoomName.toLowerCase().includes('tle')) {
        return getTerminaleD1Schedule(defaultRoomName);
    }

    const schedule: ScheduleEvent[] = [];
    let seed = typeof classId === 'number' ? classId : parseInt(String(classId)) || 1; 

    for (let d = 0; d < 5; d++) {
        let t = 0;
        while (t < totalSlots) { 
            // Skip Récréation (index 3). Pause Midi is a separator after index 5 and does not occupy an hour index.
            if (t === 3) {
                t++;
                continue;
            }

            if ((seed + t + d) % 5 === 0) {
                t++;
                continue;
            }
            
            let duration = (seed + t) % 3 === 0 ? 2 : 1;

            // Prevent classes from overlapping into Pause Midi (after index 5)
            if (t === 5) duration = 1; // Before Pause Midi separator (after index 5, 11h25 - 12h10)
            
            if (t + duration > totalSlots) {
                duration = 1;
            }
            if (t >= totalSlots) break;

            const classSubjects = getSubjectsForClass(defaultRoomName);
            const subjIndex = (seed + t + d) % classSubjects.length;
            const subjectName = classSubjects[subjIndex];

            schedule.push({
                id: `evt-${d}-${t}-${classId}`,
                day: d,
                start: t, 
                duration: duration,
                title: subjectName,
                room: defaultRoomName,
                color: getSubjectColor(subjectName)
            });

            t += duration;
        }
    }
    return schedule;
};

export const getEventOccupiedSlots = (ev: ScheduleEvent, totalSlots: number = 20, morningEndIdx: number = 5): number[] => {
    const slots: number[] = [];
    let cur = ev.start;
    let needed = Math.max(1, ev.duration || 1);
    if (cur === 3) cur = 4; // Cannot start during Récréation

    while (needed > 0 && cur < totalSlots) {
        if (cur === 3) {
            // Skip Récréation (break interval): does not count as a teaching hour
            cur++;
            continue;
        }
        // Do not cross Pause Midi
        if (ev.start <= morningEndIdx && cur > morningEndIdx) {
            break;
        }
        slots.push(cur);
        needed--;
        cur++;
    }
    return slots;
};

export interface CourseSegment {
    event: ScheduleEvent;
    startSlot: number;
    span: number;
    isFirstSegment: boolean;
    isSecondSegment: boolean;
}

export const getCourseSegments = (ev: ScheduleEvent, morningEndIdx: number = 5, totalSlots: number = 20): CourseSegment[] => {
    const occupied = getEventOccupiedSlots(ev, totalSlots, morningEndIdx);
    if (occupied.length === 0) return [];

    const beforeRecess = occupied.filter(s => s < 3);
    const afterRecess = occupied.filter(s => s > 3);

    const segments: CourseSegment[] = [];
    if (beforeRecess.length > 0) {
        segments.push({
            event: ev,
            startSlot: beforeRecess[0],
            span: beforeRecess.length,
            isFirstSegment: true,
            isSecondSegment: false
        });
    }
    if (afterRecess.length > 0) {
        segments.push({
            event: ev,
            startSlot: afterRecess[0],
            span: afterRecess.length,
            isFirstSegment: beforeRecess.length === 0,
            isSecondSegment: beforeRecess.length > 0
        });
    }
    return segments;
};

const getEffectiveCourseDuration = (ev: ScheduleEvent, totalSlots: number, morningEndIdx: number): number => {
    const occupied = getEventOccupiedSlots(ev, totalSlots, morningEndIdx);
    return Math.max(1, occupied.length);
};

const sanitizeEventsForBreaks = (eventsList: ScheduleEvent[], slots?: string[]): ScheduleEvent[] => {
    const morningEndIdx = getLunchBreakIndex(slots);
    const totalSlots = slots && slots.length > 0 ? slots.length : DEFAULT_TIME_SLOTS.length;
    const rawList = (eventsList || []).filter(ev => ev.start !== 3);

    return rawList.map(ev => {
        const title = ev.title === 'Étude' ? 'Devoir' : ev.title;
        let start = ev.start;
        if (start === 3) start = 4;
        const occupied = getEventOccupiedSlots({ ...ev, start }, totalSlots, morningEndIdx);
        const safeDuration = Math.max(1, occupied.length);
        return { ...ev, title, start, duration: safeDuration };
    });
};

export const getStoredClassSchedule = (classId: number | string, className?: string): ScheduleEvent[] => {
    const slots = getStoredTimeSlots(classId, className);
    const isTerminaleD1 = String(classId) === '17' || 
        String(className || '').toLowerCase().includes('terminale') || 
        String(className || '').toLowerCase().includes('tle');

    try {
        const key = `school_schedule_${classId || className}`;
        const verKey = `school_schedule_ver_${classId || className}`;
        const CURRENT_VERSION = 'v3_tled1_official';
        const saved = localStorage.getItem(key);
        const savedVer = localStorage.getItem(verKey);

        if (isTerminaleD1 && savedVer !== CURRENT_VERSION) {
            const official = getTerminaleD1Schedule(className || 'Terminale D1');
            localStorage.setItem(key, JSON.stringify(official));
            localStorage.setItem(verKey, CURRENT_VERSION);
            return sanitizeEventsForBreaks(official, slots);
        }

        if (saved !== null) {
            return sanitizeEventsForBreaks(JSON.parse(saved), slots);
        }
    } catch (e) {}
    return sanitizeEventsForBreaks(generateClassSchedule(classId || className || 1, slots.length), slots);
};

export const saveClassSchedule = (classId: number | string, events: ScheduleEvent[], className?: string) => {
    try {
        const key = `school_schedule_${classId || className}`;
        localStorage.setItem(key, JSON.stringify(events));
        window.dispatchEvent(new CustomEvent('school_schedule_updated', { detail: { classId, className } }));
    } catch (e) {}
};

export const SchedulePage: React.FC<SchedulePageProps> = ({ allStudents, readOnly: propReadOnly, restrictedClass, currentUser, onNavigate, teachers, onClose }) => {
  // Les élèves, professeurs et administrateurs peuvent modifier l'emploi du temps de la classe
  const isReadOnly = Boolean(currentUser?.role === 'parent');
  const readOnly = isReadOnly;
  const isTeacherUser = currentUser?.role === 'teacher' || currentUser?.role === 'professeur' || currentUser?.accessLevel === 3;
  const allTeachers = (teachers && teachers.length > 0) ? teachers : mockTeachers;
  // Classe Tle D 1 (Terminale D1) exclusivement affichée sur la page planning
  const tleD1Class: ClassItem = React.useMemo(() => {
    return mockClasses.find(c => c.name.toLowerCase() === 'terminale d1' || c.code.toLowerCase() === 'tle d1' || c.code.toLowerCase() === 'tle d 1') || {
      id: 17,
      name: 'Terminale D1',
      code: 'Tle D1',
      students: 28,
      time: '07:30 - 18:00',
      color: 'bg-rose-100 text-rose-600',
      section: 'Général'
    };
  }, []);

  const displayedClasses = React.useMemo(() => [tleD1Class], [tleD1Class]);

  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(() => tleD1Class);

  useEffect(() => {
    setSelectedClass(tleD1Class);
  }, [tleD1Class]);
  const [timeSlots, setTimeSlots] = useState<string[]>(() => getStoredTimeSlots(selectedClass?.id, selectedClass?.name));

  useEffect(() => {
      setTimeSlots(getStoredTimeSlots(selectedClass?.id, selectedClass?.name));
  }, [selectedClass]);

  useEffect(() => {
      const handleSlotsUpdate = () => {
          setTimeSlots(getStoredTimeSlots(selectedClass?.id, selectedClass?.name));
      };
      window.addEventListener('school_time_slots_updated', handleSlotsUpdate);
      window.addEventListener('storage', handleSlotsUpdate);
      return () => {
          window.removeEventListener('school_time_slots_updated', handleSlotsUpdate);
          window.removeEventListener('storage', handleSlotsUpdate);
      };
  }, [selectedClass]);

  const [isTimeSlotsModalOpen, setIsTimeSlotsModalOpen] = useState(false);
  const [isConfirmSaveModalOpen, setIsConfirmSaveModalOpen] = useState(false);
  const [tempTimeSlots, setTempTimeSlots] = useState<string[]>([]);

  const handleSaveTimeSlotsAllClasses = () => {
      try {
          // Preserve current time slots for all Primary classes so Primary section remains unchanged
          const currentPrimarySlots = getStoredTimeSlots();
          mockClasses.forEach(c => {
              if (c.section === 'Primaire') {
                  const classKeyId = `school_time_slots_${c.id}`;
                  const classKeyName = `school_time_slots_${c.name}`;
                  if (!localStorage.getItem(classKeyId) && !localStorage.getItem(classKeyName)) {
                      localStorage.setItem(classKeyId, JSON.stringify(currentPrimarySlots));
                      localStorage.setItem(classKeyName, JSON.stringify(currentPrimarySlots));
                  }
              } else {
                  // Remove class-specific overrides for non-Primary so they adopt global slots
                  localStorage.removeItem(`school_time_slots_${c.id}`);
                  localStorage.removeItem(`school_time_slots_${c.name}`);
              }
          });

          // Save global time slots for Secondaire (Général) & Technique
          saveTimeSlots(tempTimeSlots);
          setTimeSlots(tempTimeSlots);

          setIsConfirmSaveModalOpen(false);
          setIsTimeSlotsModalOpen(false);
      } catch (e) {
          console.error("Error saving time slots for all classes:", e);
      }
  };

  const handleSaveTimeSlotsSingleClass = () => {
      if (!selectedClass) return;
      try {
          const classKeyId = `school_time_slots_${selectedClass.id}`;
          const classKeyName = `school_time_slots_${selectedClass.name}`;
          localStorage.setItem(classKeyId, JSON.stringify(tempTimeSlots));
          localStorage.setItem(classKeyName, JSON.stringify(tempTimeSlots));

          setTimeSlots(tempTimeSlots);

          window.dispatchEvent(new CustomEvent('school_time_slots_updated', { 
              detail: { classId: selectedClass.id, className: selectedClass.name, slots: tempTimeSlots } 
          }));

          setIsConfirmSaveModalOpen(false);
          setIsTimeSlotsModalOpen(false);
      } catch (e) {
          console.error("Error saving time slots for single class:", e);
      }
  };

  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [selectedSection, setSelectedSection] = useState<'Primaire' | 'Général' | 'Technique'>(currentUser?.section === 'Primaire' ? 'Primaire' : 'Général');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [scheduleViewMode, setScheduleViewMode] = useState<'grid' | 'table'>('grid');
  const [directorStudiesName, setDirectorStudiesName] = useState<string>(() => {
      return localStorage.getItem('school_director_studies_name') || 'M. TAPE MAURICE';
  });

  const handleDirectorNameChange = (newName: string) => {
      setDirectorStudiesName(newName);
      localStorage.setItem('school_director_studies_name', newName);
  };

  const [classResponsablesMap, setClassResponsablesMap] = useState<Record<string, {
      chef: string;
      sousChef: string;
      educateur: string;
      profPrincipal: string;
  }>>(() => {
      try {
          const saved = localStorage.getItem('school_class_responsables_map');
          return saved ? JSON.parse(saved) : {};
      } catch {
          return {};
      }
  });

  const currentResponsables = selectedClass ? (classResponsablesMap[selectedClass.id] || {
      chef: '',
      sousChef: '',
      educateur: '',
      profPrincipal: ''
  }) : { chef: '', sousChef: '', educateur: '', profPrincipal: '' };

  const handleResponsableChange = (field: 'chef' | 'sousChef' | 'educateur' | 'profPrincipal', value: string) => {
      if (!selectedClass) return;
      setClassResponsablesMap(prev => {
          const updated = {
              ...prev,
              [selectedClass.id]: {
                  ...(prev[selectedClass.id] || { chef: '', sousChef: '', educateur: '', profPrincipal: '' }),
                  [field]: value
              }
          };
          try {
              localStorage.setItem('school_class_responsables_map', JSON.stringify(updated));
          } catch (e) {
              console.error(e);
          }
          return updated;
      });
  };
  
  // Mobile Navigation State
  const [mobileDayIndex, setMobileDayIndex] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [reminderToast, setReminderToast] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
      const isHidden = !!selectedClass;
      window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden } }));
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: isHidden } }));
      return () => {
          window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: false } }));
          window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: false } }));
      };
  }, [selectedClass]);
  
  // Form State
  const [formData, setFormData] = useState<Partial<ScheduleEvent>>(() => {
      const defaultSub = getSubjectsForClass(ROOMS[0])[0];
      return {
          day: 0,
          start: 0,
          duration: 1,
          title: defaultSub,
          room: ROOMS[0],
          color: getSubjectColor(defaultSub),
          teacherName: getTeacherForSubject(defaultSub, allTeachers, ROOMS[0]).name
      };
  });

  // Load events when class is selected
  useEffect(() => {
      if (selectedClass) {
          setEvents(getStoredClassSchedule(selectedClass.id, selectedClass.name));
          setMobileDayIndex(0); // Reset to Monday
      }
  }, [selectedClass]);

  useEffect(() => {
      const handleScheduleUpdate = (e: any) => {
          if (selectedClass && (e.detail?.classId === selectedClass.id || e.detail?.className === selectedClass.name)) {
              setEvents(getStoredClassSchedule(selectedClass.id, selectedClass.name));
          }
      };
      window.addEventListener('school_schedule_updated', handleScheduleUpdate);
      return () => window.removeEventListener('school_schedule_updated', handleScheduleUpdate);
  }, [selectedClass]);

  // Handlers
  const morningEndIdx = getLunchBreakIndex(timeSlots);

  const handleCellClick = (dayIndex: number, timeIndex: number) => {
      if (isReadOnly) return;
      if (timeIndex === 3) return; // Cannot click on Récréation break

      // Check if clicked on empty space (not occupied by existing event)
      const isOccupied = events.some(e => {
          if (e.day !== dayIndex) return false;
          const occupied = getEventOccupiedSlots(e, timeSlots.length, morningEndIdx);
          return occupied.includes(timeIndex);
      });
      if (isOccupied) return; // Let the event click handler take over

      setEditingEventId(null); // New event
      const defaultSubject = getSubjectsForClass(selectedClass ? selectedClass.name : ROOMS[0])[0];
      const defaultRoom = selectedClass ? selectedClass.name : ROOMS[0];
      setFormData({
          day: dayIndex,
          start: timeIndex,
          duration: 1,
          title: defaultSubject,
          room: defaultRoom,
          color: getSubjectColor(defaultSubject),
          customTime: '',
          teacherName: getTeacherForSubject(defaultSubject, allTeachers, defaultRoom).name
      });
      setIsModalOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, event: ScheduleEvent) => {
      if (isReadOnly) return;
      e.stopPropagation();

      const fallbackTeacher = getTeacherForSubject(event.title, allTeachers, selectedClass?.name || event.room).name;
      setEditingEventId(event.id);
      setFormData({ 
          ...event,
          customTime: event.customTime || '',
          teacherName: event.teacherName || fallbackTeacher
      });
      setIsModalOpen(true);
  };

  const handleSave = () => {
      let updatedEvents: ScheduleEvent[];
      if (editingEventId) {
          // Update existing
          updatedEvents = events.map(ev => ev.id === editingEventId ? { ...ev, ...formData } as ScheduleEvent : ev);
      } else {
          // Create new
          const newEvent: ScheduleEvent = {
              ...formData,
              id: Date.now().toString(),
          } as ScheduleEvent;
          updatedEvents = [...events, newEvent];
      }
      setEvents(updatedEvents);
      if (selectedClass) {
          saveClassSchedule(selectedClass.id, updatedEvents, selectedClass.name);
      }
      setIsModalOpen(false);
  };

  const handleDelete = () => {
      if (editingEventId) {
          const updatedEvents = events.filter(ev => ev.id !== editingEventId);
          setEvents(updatedEvents);
          if (selectedClass) {
              saveClassSchedule(selectedClass.id, updatedEvents, selectedClass.name);
          }
          setIsModalOpen(false);
      }
  };

  // Helper to update form data and color simultaneously
  const handleSubjectChange = (newSubject: string) => {
      const currentRoom = formData.room || selectedClass?.name || ROOMS[0];
      const previousDefaultTeacher = formData.title ? getTeacherForSubject(formData.title, allTeachers, currentRoom).name : '';
      const nextDefaultTeacher = getTeacherForSubject(newSubject, allTeachers, currentRoom).name;
      const shouldUpdateTeacher = !formData.teacherName || formData.teacherName === previousDefaultTeacher;

      setFormData({
          ...formData,
          title: newSubject,
          color: getSubjectColor(newSubject),
          teacherName: shouldUpdateTeacher ? nextDefaultTeacher : formData.teacherName
      });
  };

  const handlePrint = () => {
    const formatClassForPrint = (str: string) => {
      if (!str) return '';
      return str
        .replace(/terminale/gi, 'Tle')
        .replace(/TERMINALE/g, 'TLE');
    };

    const isClassSelected = !!selectedClass;
    const title = isClassSelected 
      ? `EMPLOI DU TEMPS — CLASSE DE ${formatClassForPrint(selectedClass.name).toUpperCase()}`
      : `LISTE DES PLANNINGS ET CLASSES — SECTION ${selectedSection.toUpperCase()}`;
    const subtitle = isClassSelected 
      ? `Année scolaire : 2026 - 2027 • Code : ${formatClassForPrint(selectedClass.code)} • Section : ${selectedClass.section || selectedSection}`
      : `TERMINALE D — Année scolaire : 2026 - 2027`;

    try {
      const win = window.open('', '_blank');
      if (win) {
        let contentHtml = '';

        if (isClassSelected && selectedClass) {
          const daysList = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
          const resp = classResponsablesMap[selectedClass.id] || { chef: '', sousChef: '', educateur: '', profPrincipal: '' };

          contentHtml = `
            <div class="mb-2.5">
              <h2 class="text-center font-serif font-extrabold text-[13px] uppercase tracking-wide text-slate-800 mb-1.5">
                CLASSE DE : ${formatClassForPrint(selectedClass.name).toUpperCase()}
              </h2>
              <div class="border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50/40 text-[11px] leading-snug font-serif text-slate-800 w-full">
                <div class="grid grid-cols-2 gap-x-6 gap-y-1.5">
                  <div class="flex items-baseline gap-1.5">
                    <span class="font-bold shrink-0 text-slate-700">Chef de classe :</span>
                    <span class="flex-1 border-b border-dotted border-slate-300 font-bold px-1 min-h-[14px] text-slate-900">${resp.chef || ''}</span>
                  </div>
                  <div class="flex items-baseline gap-1.5">
                    <span class="font-bold shrink-0 text-slate-700">Sous-chef de classe :</span>
                    <span class="flex-1 border-b border-dotted border-slate-300 font-bold px-1 min-h-[14px] text-slate-900">${resp.sousChef || ''}</span>
                  </div>
                  <div class="flex items-baseline gap-1.5">
                    <span class="font-bold shrink-0 text-slate-700">Éducateur Principal :</span>
                    <span class="flex-1 border-b border-dotted border-slate-300 font-bold px-1 min-h-[14px] text-slate-900">${resp.educateur || ''}</span>
                  </div>
                  <div class="flex items-baseline gap-1.5">
                    <span class="font-bold shrink-0 text-slate-700">Professeur principal :</span>
                    <span class="flex-1 border-b border-dotted border-slate-300 font-bold px-1 min-h-[14px] text-slate-900">${resp.profPrincipal || ''}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-slate-100 bg-white mb-2 overflow-hidden flex-1 flex flex-col w-full">
              <table class="w-full table-fixed flex-1 text-left border-collapse">
                <thead>
                  <tr class="border-b border-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider bg-white">
                    <th class="print-col-time py-2.5 px-1 w-[11%] text-center text-slate-700 font-extrabold border-r border-slate-50">H</th>
                    ${daysList.map(d => `<th class="print-col-day py-2.5 px-1.5 w-[17.8%] text-center font-bold text-slate-700 border-r border-slate-50 last:border-r-0">${d}</th>`).join('')}
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-50 text-[10.5px] font-medium text-slate-700">
                  ${timeSlots.map((slotText, slotIdx) => {
                    if (slotIdx === 3) {
                      return `
                        <tr class="print-row-break bg-slate-50/80">
                          <td class="print-col-time py-2 px-1 text-center font-medium text-slate-400 text-[9.5px] bg-white border-r border-slate-50 whitespace-nowrap">${slotText}</td>
                          ${daysList.map(() => `
                            <td class="print-break-row py-2 px-1 text-center bg-slate-50/90 font-bold text-slate-400 text-[9.5px] tracking-widest uppercase border-r border-slate-100/60 last:border-r-0">RÉCRÉATION</td>
                          `).join('')}
                        </tr>
                      `;
                    }

                    const courseRowHtml = `
                      <tr class="print-row-course">
                        <td class="print-col-time py-1.5 px-1 text-center font-bold text-slate-900 text-[10px] bg-white border-r border-slate-50 whitespace-nowrap">${slotText}</td>
                        ${daysList.map((dayName, dayIdx) => {
                          const daySegments = events.filter(e => e.day === dayIdx).flatMap(e => getCourseSegments(e, morningEndIdx, timeSlots.length));
                          // Check if this slot is already covered by a multi-hour segment starting earlier
                          const coveringSeg = daySegments.find(seg => seg.startSlot < slotIdx && slotIdx < seg.startSlot + seg.span);
                          if (coveringSeg) {
                            return '';
                          }

                          const seg = daySegments.find(s => s.startSlot === slotIdx);
                          if (seg) {
                            const ev = seg.event;
                            const span = seg.span;
                            const teacher = getTeacherForSubject(ev.title, allTeachers, selectedClass.name);
                            const displayedTeacherName = ev.teacherName?.trim() || teacher.name;
                            return `
                              <td rowspan="${span}" class="py-1 px-1 border-r border-slate-50 last:border-r-0 align-top overflow-hidden">
                                <div class="print-card-box print-card-span-${span} p-2 rounded-xl border-l-4 text-[10px] w-full max-w-full overflow-hidden flex flex-col justify-between ${ev.color}">
                                  <div class="min-w-0 w-full">
                                    <div class="print-card-title font-bold text-[11px] leading-tight truncate">${ev.title}</div>
                                    <div class="print-card-teacher flex items-center gap-1 text-slate-800 font-semibold text-[9.5px] mt-0.5 min-w-0 w-full">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-600 shrink-0 inline-block"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                                      <span class="truncate min-w-0 flex-1">${displayedTeacherName}</span>
                                    </div>
                                  </div>
                                  ${ev.room ? `
                                    <div class="print-card-room flex items-center gap-1 opacity-75 font-medium mt-1 text-[9px] min-w-0 w-full">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 inline-block"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                      <span class="truncate min-w-0 flex-1">${formatClassForPrint(ev.room)}</span>
                                    </div>
                                  ` : ''}
                                </div>
                              </td>
                            `;
                          }
                          return `<td class="py-1 px-1 border-r border-slate-50 last:border-r-0 align-middle text-center"></td>`;
                        }).join('')}
                      </tr>
                    `;

                    if (slotIdx === morningEndIdx) {
                      const pauseMidiRowHtml = `
                        <tr class="print-row-break bg-slate-50/80">
                          <td class="print-col-time py-2 px-1 text-center font-medium text-slate-400 text-[9.5px] bg-white border-r border-slate-50 whitespace-nowrap"></td>
                          ${daysList.map(() => `
                            <td class="print-break-row py-2 px-1 text-center bg-slate-50/90 font-bold text-slate-400 text-[9.5px] tracking-widest uppercase border-r border-slate-100/60 last:border-r-0">PAUSE MIDI</td>
                          `).join('')}
                        </tr>
                      `;
                      return courseRowHtml + pauseMidiRowHtml;
                    }

                    return courseRowHtml;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `;
        } else {
          const filtered = displayedClasses.filter(cls => (cls.section || 'Général') === selectedSection);
          contentHtml = `
            <div class="grid grid-cols-3 gap-3 mb-4">
              ${filtered.map(cls => `
                <div class="border border-slate-200 rounded-xl p-3 bg-white shadow-xs space-y-1">
                  <div class="flex justify-between items-center border-b border-slate-100 pb-1.5">
                    <span class="font-black text-xs text-slate-800">${formatClassForPrint(cls.name)}</span>
                    <span class="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">${formatClassForPrint(cls.code)}</span>
                  </div>
                  <p class="text-[10px] text-slate-600 font-semibold">⏰ Horaires : ${cls.time}</p>
                  <p class="text-[10px] text-sky-800 font-bold">Section : ${cls.section || selectedSection}</p>
                </div>
              `).join('')}
            </div>
          `;
        }

        win.document.write(`
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="utf-8">
              <base href="${window.location.origin}/">
              <title>${title} - Terminale D</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                  box-sizing: border-box !important;
                }
                body {
                  background-color: #f1f5f9;
                  color: #0f172a;
                  font-family: system-ui, -apple-system, sans-serif;
                  padding: 12px;
                  margin: 0;
                }
                .print-sheet {
                  background-color: #ffffff;
                  width: 100%;
                  max-width: 210mm;
                  min-height: 290mm;
                  margin: 0 auto;
                  padding: 14px 16px;
                  border-radius: 12px;
                  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
                  display: flex;
                  flex-direction: column;
                  justify-content: space-between;
                }
                table {
                  table-layout: fixed !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  border-spacing: 0 !important;
                  border-collapse: collapse !important;
                }
                .print-col-time {
                  width: 11% !important;
                }
                .print-col-day {
                  width: 17.8% !important;
                }
                th, td {
                  overflow: hidden !important;
                }
                .print-row-course {
                  height: 54px;
                }
                .print-card-box {
                  width: 100% !important;
                  max-width: 100% !important;
                  overflow: hidden !important;
                  border-top: none !important;
                  border-right: none !important;
                  border-bottom: none !important;
                  min-height: 46px;
                  height: 100%;
                }
                .print-card-span-2 {
                  min-height: 100px !important;
                  height: 100px !important;
                }
                .print-card-span-3 {
                  min-height: 154px !important;
                  height: 154px !important;
                }
                .print-card-span-4 {
                  min-height: 208px !important;
                  height: 208px !important;
                }
                .print-card-span-5 {
                  min-height: 262px !important;
                  height: 262px !important;
                }
                @media print {
                  @page { size: A4 portrait; margin: 5mm 6mm; }
                  .no-print { display: none !important; }
                  html, body {
                    background-color: #ffffff !important;
                    color: #0f172a !important;
                    padding: 0 !important;
                    margin: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    font-family: system-ui, -apple-system, sans-serif !important;
                  }
                  .print-sheet {
                    max-width: 100% !important;
                    width: 100% !important;
                    min-height: 284mm !important;
                    max-height: 286mm !important;
                    margin: 0 !important;
                    padding: 2mm 1mm !important;
                    border-radius: 0 !important;
                    box-shadow: none !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    display: flex !important;
                    flex-direction: column !important;
                    justify-content: space-between !important;
                  }
                  
                  /* Well-proportioned table that fills 1 A4 sheet cleanly without overflowing */
                  table { table-layout: fixed !important; width: 100% !important; max-width: 100% !important; height: 100% !important; border-spacing: 0 !important; border-collapse: collapse !important; }
                  .print-col-time { width: 11% !important; font-size: 9.5px !important; padding: 6px 2px !important; text-align: center !important; letter-spacing: -0.01em !important; }
                  .print-row-course .print-col-time { font-weight: 800 !important; color: #0f172a !important; font-size: 9.5px !important; }
                  .print-row-break .print-col-time { font-weight: 500 !important; color: #94a3b8 !important; }
                  .print-col-day { width: 17.8% !important; font-size: 10.5px !important; font-weight: 700 !important; padding: 7px 3px !important; text-align: center !important; }
                  th { padding: 7px 3px !important; }
                  td { padding: 3px 2.5px !important; vertical-align: top !important; overflow: hidden !important; }
                  .print-row-course { height: 54px !important; }
                  .print-row-course td:not([rowspan]), .print-row-course td[rowspan="1"] { height: 54px !important; }
                  .print-row-course td[rowspan="2"] { height: 108px !important; }
                  .print-row-course td[rowspan="3"] { height: 162px !important; }
                  .print-row-course td[rowspan="4"] { height: 216px !important; }
                  .print-row-course td[rowspan="5"] { height: 270px !important; }
                  .print-row-break td { height: 30px !important; vertical-align: middle !important; }
                  
                  /* Course card nicely sized like the grid view */
                  .print-card-box { 
                    padding: 5px 6px !important; 
                    border-radius: 9px !important; 
                    margin: 0 !important; 
                    box-shadow: none !important;
                    min-height: 46px !important;
                    height: 100% !important;
                    width: 100% !important;
                    max-width: 100% !important;
                    overflow: hidden !important;
                    display: flex !important;
                    flex-direction: column !important;
                    justify-content: space-between !important;
                    border-top: none !important;
                    border-right: none !important;
                    border-bottom: none !important;
                  }
                  .print-card-span-2 {
                    min-height: 101px !important;
                    height: 101px !important;
                  }
                  .print-card-span-3 {
                    min-height: 155px !important;
                    height: 155px !important;
                  }
                  .print-card-span-4 {
                    min-height: 209px !important;
                    height: 209px !important;
                  }
                  .print-card-span-5 {
                    min-height: 263px !important;
                    height: 263px !important;
                  }
                  .print-card-title { 
                    font-size: 10.5px !important; 
                    line-height: 1.2 !important; 
                    font-weight: 800 !important;
                  }
                  .print-card-room { 
                    font-size: 8.5px !important; 
                    margin-top: 2px !important;
                  }
                  .print-card-teacher { 
                    font-size: 9px !important; 
                    margin-top: 2px !important; 
                    font-weight: 600 !important;
                  }
                  .print-card-teacher svg {
                    width: 10px !important;
                    height: 10px !important;
                  }
                  
                  /* Break / Recess Row */
                  .print-break-row {
                    padding: 5px 4px !important;
                    font-size: 9.5px !important;
                    letter-spacing: 0.08em !important;
                    font-weight: 700 !important;
                  }
                }
              </style>
            </head>
            <body>
              <div class="no-print" style="max-width: 210mm; margin: 0 auto 12px auto; padding: 10px 16px; background-color: #1e293b; color: white; display: flex; justify-content: space-between; align-items: center; border-radius: 12px; font-family: sans-serif;">
                <div>
                  <strong style="font-size: 14px;">Impression : ${title}</strong>
                  <p style="font-size: 11px; margin: 2px 0 0 0; color: #94a3b8;">${subtitle}</p>
                </div>
                <div style="display: flex; gap: 8px;">
                  <button onclick="window.print()" class="btn-print" style="padding: 7px 14px; background-color: #0284c7; color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 12px;">
                    🖨️ Imprimer ce document
                  </button>
                  <button onclick="window.close()" style="padding: 7px 12px; background-color: #334155; color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 12px;">
                    Fermer
                  </button>
                </div>
              </div>

              <div class="print-sheet">
                <!-- OFFICIAL HEADER -->
                <div class="mb-2.5 pb-2 border-b border-slate-200 flex justify-between items-start gap-2">
                  <!-- Left Block: Ministère, DRENA, Année Scolaire, Terminal D (Centered like photo) -->
                  <div class="text-center font-serif text-[10.5px] leading-snug space-y-0.5 w-[44%] flex flex-col items-center">
                    <p class="font-bold uppercase text-slate-900 tracking-tight">MINISTERE DE L’EDUCATION NATIONALE</p>
                    <p class="font-bold uppercase text-slate-900 tracking-tight">ET DE L’ALPHABETISATION</p>
                    <p class="font-bold text-slate-900 tracking-widest leading-none py-0.5">.......................................</p>
                    <p class="font-bold uppercase text-slate-900 tracking-tight">DIRECTION REGIONALE D’ABIDJAN 3</p>
                    <p class="font-bold text-slate-900">Année scolaire : 2026 – 2027</p>
                    <p class="font-extrabold uppercase text-slate-900 text-[12px] pt-0.5">TERMINALE D</p>
                  </div>

                  <!-- Center Logo & Title -->
                  <div class="flex flex-col items-center justify-center text-center w-[20%] pt-0.5">
                    <div class="w-12 h-12 flex items-center justify-center shrink-0 mb-1">
                      <img src="/icone.png" alt="Logo" class="w-12 h-12 object-contain" onerror="this.onerror=null; this.src='icone.png';" />
                    </div>
                    <span class="text-[9.5px] font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                      EMPLOI DU TEMPS
                    </span>
                  </div>

                  <!-- Right Block: République de Côte d'Ivoire, Pointillés, Devise, Armoiries (Centered like photo) -->
                  <div class="text-center font-serif text-[10.5px] leading-snug space-y-0.5 w-[36%] flex flex-col items-center">
                    <p class="font-bold uppercase text-slate-900 tracking-tight">REPUBLIQUE DE COTE</p>
                    <p class="font-bold uppercase text-slate-900 tracking-tight">D’IVOIRE</p>
                    <p class="font-bold text-slate-900 tracking-widest leading-none py-0.5">........................</p>
                    <p class="font-bold text-slate-900">Union – discipline – travail</p>
                    <div class="mt-1 flex justify-center">
                      <img src="/cote d'ivoire.png" alt="Côte d'Ivoire" class="w-12 h-12 object-contain" onerror="this.onerror=null; this.src='/cote-divoire.png';" />
                    </div>
                  </div>
                </div>

                <!-- MAIN CONTENT -->
                <div class="flex-1 flex flex-col">
                  ${contentHtml}
                </div>

                <!-- FOOTER STAMP -->
                <div class="mt-2 pt-2.5 border-t border-slate-200 flex justify-between items-center text-[11px]">
                  <p class="italic text-slate-500 text-[10px]">Document certifié conforme par la Direction des Études — Terminale D.</p>
                  <div class="text-center flex-1 mx-4 px-2">
                    <span class="block text-[8.5px] font-bold uppercase tracking-widest text-indigo-600">Notre Devise</span>
                    <span class="block text-[11.5px] font-black italic text-slate-800">" Discipline • Travail • Succès "</span>
                  </div>
                  <div class="text-right">
                    <p class="font-bold text-slate-800 text-[10.5px]">Le Directeur des Études</p>
                    <p class="font-black text-slate-800 uppercase text-[11px]">${directorStudiesName.toUpperCase()}</p>
                  </div>
                </div>
              </div>

              <script>
                setTimeout(function() {
                  window.print();
                }, 600);
              </script>
            </body>
          </html>
        `);
        win.document.close();
        return;
      }
    } catch (e) {
      console.warn("window.open print failed, falling back to window.print()", e);
    }

    try {
      window.print();
    } catch (err) {
      console.error("Print error", err);
    }
  };

  if (!selectedClass) {
      return (
        <div className="flex flex-col h-full animate-in fade-in duration-300 relative z-10 bg-[#BFDBFE] pt-12 md:pt-8">
             
             {/* Unified Header */}
             <div className="hidden md:flex justify-between items-center mt-5 mb-8 px-8 shrink-0">
                 <div className="flex items-center gap-4">
                     {onNavigate && (
                         <button 
                             onClick={() => onNavigate('dashboard')}
                             title="Retour à Terminale D"
                             className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/50 hover:bg-white/60 text-slate-900 transition-colors shrink-0 cursor-pointer active:scale-95"
                         >
                             <ArrowLeft size={20} />
                         </button>
                     )}
                     <div>
                         <h1 className="text-white text-[28px] font-bold tracking-tight">Planning & Emploi du Temps</h1>
                         <p className="text-white/80 text-xs font-medium">Consultez les plannings par classe ou en mode tableau</p>
                     </div>
                 </div>
                 
                 <div className="flex items-center space-x-3">
                     <div className="flex items-center gap-1 bg-white/20 p-1 rounded-xl border border-white/30 backdrop-blur-md shrink-0">
                         <button
                             onClick={() => setViewMode('cards')}
                             className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                 viewMode === 'cards' ? 'bg-white text-sky-700 shadow-sm' : 'text-white hover:bg-white/20'
                             }`}
                         >
                             <LayoutGrid size={14} />
                             <span>Cartes</span>
                         </button>
                         <button
                             onClick={() => setViewMode('table')}
                             className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                                 viewMode === 'table' ? 'bg-white text-sky-700 shadow-sm' : 'text-white hover:bg-white/20'
                             }`}
                         >
                             <Table size={14} />
                             <span>Tableau</span>
                         </button>
                     </div>

                     <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-xl border border-white/30 w-full md:w-80 text-white">
                       <Search className="text-white shrink-0" size={20} />
                       <input 
                         type="text" 
                         placeholder="Rechercher une classe..." 
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="bg-transparent border-none outline-none text-white placeholder-white/70 font-medium w-full text-sm"
                       />
                       {searchTerm && (
                         <button onClick={() => setSearchTerm('')} className="p-1 text-white/80 hover:text-white">
                             <X size={16} />
                         </button>
                       )}
                     </div>
                     {currentUser && (currentUser.role === 'educator' || currentUser.role === 'cashier' || currentUser.role === 'director' || currentUser.role === 'admin' || [2, 4, 5].includes(currentUser.accessLevel)) && (
                         <button 
                             onClick={handlePrint}
                             title="Imprimer"
                             className="hidden md:flex w-10 h-10 rounded-full bg-white/40 items-center justify-center backdrop-blur-md border border-white/50 hover:bg-white/60 transition-colors shrink-0 text-slate-900 cursor-pointer active:scale-95"
                         >
                             <FileText className="w-5 h-5" strokeWidth={2} />
                         </button>
                     )}
                 </div>
             </div>

             {/* Mobile App Bar */}
             {showMobileSearch ? (
                 <div className="md:hidden flex items-center gap-2 mb-8 px-6 shrink-0 w-full animate-in fade-in duration-200">
                     <div className="flex-1 flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/40 px-4 py-2 rounded-2xl text-white">
                         <Search className="text-white shrink-0" size={18} />
                         <input
                             type="text"
                             autoFocus
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                             placeholder="Rechercher une classe..."
                             className="bg-transparent border-none outline-none text-white placeholder-white/70 text-sm font-medium w-full"
                         />
                         {searchTerm && (
                             <button onClick={() => setSearchTerm('')} className="p-1 text-white/80 hover:text-white">
                                 <X size={16} />
                             </button>
                         )}
                     </div>
                     <button 
                         onClick={() => { setShowMobileSearch(false); setSearchTerm(''); }}
                         className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/50 text-slate-900 shrink-0"
                     >
                         <X size={20} />
                     </button>
                 </div>
             ) : (
                 <div className="md:hidden flex justify-between items-center mb-8 px-6 shrink-0">
                     <div>
                        <h1 className="text-white text-[28px] font-bold tracking-tight">Planning</h1>
                     </div>
                     <div className="flex space-x-3">
                        <button 
                            onClick={() => setShowMobileSearch(true)}
                            className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/50 hover:bg-white/60 transition-colors"
                        >
                           <Search className="w-5 h-5 text-slate-900" strokeWidth={2} />
                        </button>
                     </div>
                 </div>
             )}
            
            {currentUser?.section !== 'Primaire' && (
                <div className="flex items-center gap-2 px-6 md:px-8 mb-6 overflow-x-auto no-scrollbar shrink-0">
                    <button 
                        onClick={() => setSelectedSection('Primaire')}
                        className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${selectedSection === 'Primaire' ? 'bg-white text-sky-700 shadow-sm' : 'bg-white/30 text-white hover:bg-white/40 border border-white/40'}`}
                    >
                        Primaire
                    </button>
                    <button 
                        onClick={() => setSelectedSection('Général')}
                        className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${selectedSection === 'Général' ? 'bg-white text-sky-700 shadow-sm' : 'bg-white/30 text-white hover:bg-white/40 border border-white/40'}`}
                    >
                        Général
                    </button>
                    <button 
                        onClick={() => setSelectedSection('Technique')}
                        className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${selectedSection === 'Technique' ? 'bg-white text-sky-700 shadow-sm' : 'bg-white/30 text-white hover:bg-white/40 border border-white/40'}`}
                    >
                        Technique (Professionnel)
                    </button>
                </div>
            )}

            <div className="flex-1 bg-white rounded-t-[40px] px-6 md:px-8 pt-8 pb-32 md:pb-24 overflow-y-auto relative custom-scrollbar shadow-2xl">
                {(() => {
                    const filteredClasses = displayedClasses.filter(cls => {
                        const isTeacherOrParent = currentUser?.role === 'teacher' || currentUser?.role === 'parent' || currentUser?.accessLevel === 3;
                        if (!isTeacherOrParent) {
                          const classSection = cls.section || 'Général';
                          if (classSection !== selectedSection) {
                              return false;
                          }
                        }
                        if (!searchTerm.trim()) return true;
                        const term = searchTerm.toLowerCase();
                        return cls.name.toLowerCase().includes(term) || cls.code.toLowerCase().includes(term);
                    });

                    if (filteredClasses.length === 0) {
                        return (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-20 h-20 bg-slate-50 md:bg-white text-slate-300 rounded-full flex items-center justify-center mb-4">
                                    <BookOpen size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 md:text-white mb-2">Aucune classe trouvée</h3>
                                <p className="text-slate-500 md:text-white/70 text-sm max-w-xs">
                                    {selectedSection !== 'Général' 
                                        ? `Les classes de la section ${selectedSection} ne sont pas encore configurées.`
                                        : "Aucune classe ne correspond à votre recherche."}
                                </p>
                            </div>
                        );
                    }

                    if (viewMode === 'table') {
                        return (
                            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                                            <th className="py-4 px-4 text-center w-12">N°</th>
                                            <th className="py-4 px-6">Classe</th>
                                            <th className="py-4 px-6">Code</th>
                                            <th className="py-4 px-6">Section</th>
                                            <th className="py-4 px-6">Horaire Habituel</th>
                                            <th className="py-4 px-6 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                                        {filteredClasses.map((cls, idx) => (
                                            <tr 
                                                key={cls.id}
                                                onClick={() => setSelectedClass(cls)}
                                                className="hover:bg-sky-50/60 transition-colors cursor-pointer group"
                                            >
                                                <td className="py-4 px-4 text-center font-bold text-slate-400">
                                                    {idx + 1}
                                                </td>
                                                <td className="py-4 px-6 font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-xl ${cls.color.replace('text-', 'bg-').replace('100', '50')} ${cls.color.split(' ')[1]}`}>
                                                            <BookOpen size={18} />
                                                        </div>
                                                        <span>{cls.name}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg uppercase">
                                                        {cls.code}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-slate-600 font-semibold">
                                                    {cls.section || selectedSection}
                                                </td>
                                                <td className="py-4 px-6 text-slate-600 font-semibold">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={14} className="text-sky-500" />
                                                        <span>{cls.time}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <button className="px-4 py-2 rounded-xl bg-sky-50 text-sky-600 font-bold text-xs inline-flex items-center gap-1.5 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-xs">
                                                        <span>Voir Planning</span>
                                                        <ArrowRight size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    }

                    return (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredClasses.map((cls) => (
                                <div 
                                    key={cls.id}
                                    onClick={() => setSelectedClass(cls)}
                                    className="bg-slate-50 md:bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group border border-slate-100 hover:border-sky-200 flex flex-col"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-2xl ${cls.color.replace('text-', 'bg-').replace('100', '50')} ${cls.color.split(' ')[1]}`}>
                                            <BookOpen size={24} />
                                        </div>
                                        <span className="bg-gray-50 text-gray-500 text-xs font-bold px-2 py-1 rounded-lg uppercase">
                                            {cls.code}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-800 mb-1">{cls.name}</h3>
                                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                                        <Clock size={14} />
                                        <span>{cls.time}</span>
                                    </div>

                                    <button className="mt-auto w-full py-3 rounded-xl bg-sky-50 text-sky-600 font-bold text-sm flex items-center justify-center gap-2 group-hover:bg-sky-600 group-hover:text-white transition-all">
                                        Voir Planning
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col w-full md:p-8 animate-in slide-in-from-right duration-300 relative z-10 md:bg-transparent bg-[#BFDBFE] pt-12 md:pt-0">
      
      {/* Mobile Custom View */}
      <div className="md:hidden fixed inset-0 z-[120] bg-[#BFDBFE]">
            <DailyScheduleMobileView 
                onBack={() => {
                    if (onClose) {
                        onClose();
                    } else if (onNavigate) {
                        onNavigate('dashboard');
                    } else {
                        window.history.back();
                    }
                }}
                events={events}
                onEventClick={(evt) => {
                     if (isReadOnly) return;
                     setEditingEventId(evt.id);
                     const currentRoom = evt.room || selectedClass?.name || ROOMS[0];
                     const currentTeacher = evt.teacherName?.trim() || getTeacherForSubject(evt.title, allTeachers, currentRoom).name;
                     setFormData({
                         day: evt.day,
                         start: evt.start,
                         duration: evt.duration,
                         title: evt.title,
                         room: currentRoom,
                         color: evt.color,
                         customTime: evt.customTime || '',
                         teacherName: currentTeacher
                     });
                     setIsModalOpen(true);
                }}
                onEmptySlotClick={(day, start) => {
                    if (isReadOnly) return;
                    setEditingEventId(null);
                    const defaultRoom = selectedClass ? selectedClass.name : ROOMS[0];
                    const defaultSub = getSubjectsForClass(defaultRoom)[0];
                    setFormData({ 
                        day, 
                        start, 
                        duration: 1, 
                        title: defaultSub, 
                        room: defaultRoom, 
                        color: getSubjectColor(defaultSub),
                        customTime: '',
                        teacherName: getTeacherForSubject(defaultSub, allTeachers, defaultRoom).name
                    });
                    setIsModalOpen(true);
                }}
                readOnly={isReadOnly}
                classNameTitle={abbreviateClassName(selectedClass.name)}
                currentUser={currentUser}
                isEmbedded={false}
                subtitle="Planning de cours" 
            />
      </div>

      {/* Desktop Detail View Wrapper */}
      <div className="hidden md:flex flex-col w-full">
        <div className="flex flex-col gap-6 mb-6 px-6 md:px-0">
        
        {onClose ? (
            <button 
                onClick={() => onClose()}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 text-gray-700 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-200 transition-all w-fit font-bold text-sm ml-[2px] mt-3 cursor-pointer"
            >
                <ChevronLeft size={18} />
                <span>Retour</span>
            </button>
        ) : (
            <button 
                onClick={() => { if (onNavigate) onNavigate('dashboard'); else window.history.back(); }}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 text-gray-700 hover:text-sky-600 hover:bg-sky-50 hover:border-sky-200 transition-all w-fit font-bold text-sm ml-[2px] mt-3 cursor-pointer"
            >
                <ChevronLeft size={18} />
                <span>Retour à Terminale D</span>
            </button>
        )}

        <div className="flex justify-between items-center gap-6 flex-wrap">
            <div className="flex items-center gap-4">
                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedClass.color.replace('text-', 'bg-').replace('100', '50')} ${selectedClass.color.split(' ')[1]}`}>
                     <Calendar size={24} />
                 </div>
                 <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 md:text-gray-800">{abbreviateClassName(selectedClass.name)}</h1>
                    <p className="text-slate-600 md:text-gray-400 text-xs md:text-sm font-medium">
                        {isReadOnly ? "Lecture Seule" : "Consultez ou modifiez le planning"}
                    </p>
                 </div>
            </div>

            <div className="flex items-center gap-3">
                {/* Mode Selector: Grille vs Tableau */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setScheduleViewMode('grid')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            scheduleViewMode === 'grid' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <LayoutGrid size={14} />
                        <span>Grille</span>
                    </button>
                    <button
                        onClick={() => setScheduleViewMode('table')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            scheduleViewMode === 'table' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Table size={14} />
                        <span>Tableau (Professeurs)</span>
                    </button>
                </div>

                {/* Print button */}
                {currentUser?.role !== 'student' && currentUser?.accessLevel !== 1 && currentUser?.role !== 'teacher' && currentUser?.accessLevel !== 3 && (
                  <button 
                      onClick={handlePrint}
                      title="Imprimer l'emploi du temps"
                      className="btn-print hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold border border-slate-200 transition-all text-xs shrink-0 cursor-pointer active:scale-95"
                  >
                      <FileText size={14} />
                      <span className="inline">Imprimer</span>
                  </button>
                )}

                {!isReadOnly && (
                  <>
                    <button 
                        onClick={() => {
                            setTempTimeSlots([...timeSlots]);
                            setIsTimeSlotsModalOpen(true);
                        }}
                        title="Modifier les créneaux horaires manuellement"
                        className="flex items-center gap-1.5 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl font-bold border border-sky-200 transition-all text-xs shrink-0 cursor-pointer active:scale-95 shadow-xs"
                    >
                        <Clock size={14} className="text-sky-600" />
                        <span>Créneaux Horaires</span>
                    </button>

                    <button 
                        onClick={() => {
                        setEditingEventId(null);
                        const defaultRoom = selectedClass ? selectedClass.name : ROOMS[0];
                        const defaultSub = getSubjectsForClass(defaultRoom)[0];
                        setFormData({
                            day: 0,
                            start: 0,
                            duration: 1,
                            title: defaultSub,
                            room: defaultRoom,
                            color: getSubjectColor(defaultSub),
                            customTime: '',
                            teacherName: getTeacherForSubject(defaultSub, allTeachers, defaultRoom).name
                        });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-full font-bold hover:bg-sky-700 transition-colors shadow-md shadow-sky-100 text-sm shrink-0 active:scale-95 cursor-pointer"
                    >
                        <Plus size={18} />
                        <span>Ajouter Cours</span>
                    </button>
                  </>
                )}
            </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 relative px-4 md:px-0 pb-4">
            
            {/* Mobile Day Navigation */}
            <div className="md:hidden flex items-center justify-between mb-4 bg-gray-50 p-2 rounded-xl">
                 <button 
                    onClick={() => setMobileDayIndex(Math.max(0, mobileDayIndex - 1))}
                    disabled={mobileDayIndex === 0}
                    className={`p-2 rounded-lg ${mobileDayIndex === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-200'}`}
                 >
                     <ChevronLeft size={24} />
                 </button>
                 <span className="font-bold text-lg text-gray-800">{days[mobileDayIndex]}</span>
                 <button 
                    onClick={() => setMobileDayIndex(Math.min(days.length - 1, mobileDayIndex + 1))}
                    disabled={mobileDayIndex === days.length - 1}
                    className={`p-2 rounded-lg ${mobileDayIndex === days.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-200'}`}
                 >
                     <ChevronRight size={24} />
                 </button>
            </div>

            {/* GRID VIEW MODE */}
            {scheduleViewMode === 'grid' && (
                <>
                    {events.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-8 bg-sky-50/70 border border-sky-100 rounded-2xl mb-4 text-center space-y-3">
                            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800">Aucun emploi du temps disponible pour cette classe.</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Aucun cours n'a encore été programmé pour la classe <span className="font-semibold text-slate-700">{selectedClass.name}</span>.
                                </p>
                            </div>
                            {!readOnly && (
                                <button 
                                    onClick={() => {
                                        setEditingEventId(null);
                                        const defaultRoom = selectedClass ? selectedClass.name : ROOMS[0];
                                        const defaultSub = getSubjectsForClass(defaultRoom)[0];
                                        setFormData({
                                            day: 0,
                                            start: 0,
                                            duration: 1,
                                            title: defaultSub,
                                            room: defaultRoom,
                                            color: getSubjectColor(defaultSub),
                                            customTime: '',
                                            teacherName: getTeacherForSubject(defaultSub, allTeachers, defaultRoom).name
                                        });
                                        setIsModalOpen(true);
                                    }}
                                    className="flex items-center gap-1.5 bg-sky-600 text-white px-4 py-2 rounded-full font-bold hover:bg-sky-700 transition-colors shadow-xs text-xs cursor-pointer active:scale-95"
                                >
                                    <Plus size={16} />
                                    <span>Ajouter un cours</span>
                                </button>
                            )}
                        </div>
                    )}
                    {/* Calendar Header (Desktop) */}
                    <div className="hidden md:grid md:grid-cols-[100px_repeat(5,1fr)] grid-cols-[90px_1fr] mb-4 border-b border-gray-100 pb-2">
                        <div className="text-center font-bold text-gray-400 text-xs uppercase tracking-wider py-2">H</div>
                        {days.map(d => (
                            <div key={d} className="text-center font-bold text-gray-700 py-2">{d}</div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="w-full relative overflow-x-auto pb-6 custom-scrollbar">
                        <div className="grid md:grid-cols-[100px_repeat(5,1fr)] grid-cols-[90px_1fr] gap-0 relative min-h-[660px] w-full min-w-[650px]">
                            
                            {/* Time Column */}
                            <div className="flex flex-col border-r border-gray-50 h-full">
                                {timeSlots.map((t, i) => (
                                    <React.Fragment key={t + i}>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setTempTimeSlots([...timeSlots]);
                                                setIsTimeSlotsModalOpen(true);
                                            }}
                                            title="Cliquer pour modifier les créneaux horaires"
                                            className="flex-1 flex items-center justify-center min-h-[60px] relative border-t border-transparent hover:bg-sky-50/70 transition-colors group cursor-pointer"
                                        >
                                            <span className={`text-[11px] md:text-xs text-center px-1.5 whitespace-nowrap transition-colors ${
                                                i === 3 ? 'text-gray-400 font-medium' : 'text-slate-900 font-extrabold group-hover:text-sky-700'
                                            }`}>{t}</span>
                                        </button>
                                        {i === morningEndIdx && (
                                            <div className="flex-1 flex items-center justify-center min-h-[60px] relative border-t border-transparent select-none" />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Day Columns */}
                            {days.map((_, dayIndex) => {
                                const isVisibleMobile = dayIndex === mobileDayIndex;
                                const visibilityClass = isVisibleMobile ? 'block' : 'hidden md:block';
                                const totalVisualRows = timeSlots.length + 1;

                                return (
                                    <div key={dayIndex} className={`${visibilityClass} relative border-l border-gray-50 h-full`}>
                                        {/* Empty Clickable Slots (Background Layer) */}
                                        <div className="absolute inset-0 flex flex-col h-full w-full z-0">
                                            {timeSlots.map((_, i) => {
                                                const isRecess = i === 3;
                                                return (
                                                <React.Fragment key={i}>
                                                    <div 
                                                        onClick={() => handleCellClick(dayIndex, i)}
                                                        className={`flex-1 min-h-[60px] border-t border-gray-50 transition-colors flex items-center justify-center ${isRecess ? 'bg-slate-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`}
                                                    >
                                                       {isRecess && <span className="text-slate-400 font-bold text-xs uppercase tracking-widest rotate-[-90deg] md:rotate-0 truncate">Récréation</span>}
                                                    </div>
                                                    {i === morningEndIdx && (
                                                        <div className="flex-1 min-h-[60px] border-t border-gray-50 bg-slate-50 flex items-center justify-center cursor-not-allowed">
                                                            <span className="text-slate-400 font-bold text-xs uppercase tracking-widest rotate-[-90deg] md:rotate-0 truncate">Pause Midi</span>
                                                        </div>
                                                    )}
                                                </React.Fragment>
                                            )})}
                                        </div>

                                        {/* Events (Foreground Layer) */}
                                        {events.filter(e => e.day === dayIndex).flatMap((ev) => {
                                            const teacherInfo = getTeacherForSubject(ev.title, allTeachers, selectedClass.name);
                                            const displayedTeacherName = ev.teacherName?.trim() || teacherInfo.name;
                                            const segments = getCourseSegments(ev, morningEndIdx, timeSlots.length);

                                            return segments.map((seg, sIdx) => {
                                                const visualStart = seg.startSlot <= morningEndIdx ? seg.startSlot : seg.startSlot + 1;
                                                const effDuration = seg.span;
                                                return (
                                                    <div 
                                                        key={`${ev.id}-seg-${sIdx}`}
                                                        onClick={(e) => handleEventClick(e, ev)}
                                                        className={`
                                                            absolute left-1 right-1 rounded-xl p-2 text-xs border-l-4 shadow-sm z-10
                                                            flex flex-col justify-between overflow-hidden transition-all
                                                            ${readOnly ? '' : 'cursor-pointer hover:scale-[1.02] hover:shadow-md group'}
                                                            ${ev.color}
                                                        `}
                                                        style={{
                                                            top: `${(visualStart / totalVisualRows) * 100}%`,
                                                            height: `${(effDuration / totalVisualRows) * 100}%`
                                                        }}
                                                    >
                                                        <div>
                                                            <div className="flex justify-between items-start">
                                                                <span className="font-bold truncate">{ev.title}</span>
                                                                {!readOnly && <Edit3 size={10} className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />}
                                                            </div>
                                                            <div className="flex items-center gap-1 font-semibold text-[10px] text-slate-800 mt-0.5 truncate">
                                                                <GraduationCap size={11} className="text-indigo-600 shrink-0" />
                                                                <span className="truncate">{displayedTeacherName}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-1 opacity-75 font-medium mt-0.5 text-[10px]">
                                                            <span className="truncate flex items-center gap-1">
                                                                <MapPin size={10} className="shrink-0" />
                                                                {ev.room}
                                                            </span>
                                                            {ev.customTime && (
                                                                <span className="font-bold text-slate-800 shrink-0 bg-white/70 px-1 rounded">
                                                                    {ev.customTime}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* TABLE VIEW MODE */}
            {scheduleViewMode === 'table' && (
                <div id="printable-schedule" className="w-full bg-white rounded-3xl p-6 print:p-0 shadow-sm print:shadow-none border border-slate-100 print:border-none">
                    {/* Printable Header */}
                    <div className="hidden print:flex mb-2.5 pb-2 border-b border-slate-200 justify-between items-start gap-2">
                        <div className="text-center font-serif text-[10.5px] leading-snug space-y-0.5 w-[44%] flex flex-col items-center">
                            <p className="font-bold uppercase text-slate-900 tracking-tight">MINISTERE DE L’EDUCATION NATIONALE</p>
                            <p className="font-bold uppercase text-slate-900 tracking-tight">ET DE L’ALPHABETISATION</p>
                            <p className="font-bold text-slate-900 tracking-widest leading-none py-0.5">.......................................</p>
                            <p className="font-bold uppercase text-slate-900 tracking-tight">DIRECTION REGIONALE D’ABIDJAN 3</p>
                            <p className="font-bold text-slate-900">Année scolaire : 2026 – 2027</p>
                            <p className="font-extrabold uppercase text-slate-900 text-[12px] pt-0.5">TERMINALE D</p>
                        </div>

                        <div className="flex flex-col items-center justify-center text-center w-[20%] pt-0.5">
                            <div className="w-12 h-12 flex items-center justify-center shrink-0 mb-1">
                                <img src="/icone.png" alt="Logo" className="w-12 h-12 object-contain" onError={(e) => { e.currentTarget.src = 'icone.png'; }} />
                            </div>
                            <span className="text-[9.5px] font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                                EMPLOI DU TEMPS
                            </span>
                        </div>

                        <div className="text-center font-serif text-[10.5px] leading-snug space-y-0.5 w-[36%] flex flex-col items-center">
                            <p className="font-bold uppercase text-slate-900 tracking-tight">REPUBLIQUE DE COTE</p>
                            <p className="font-bold uppercase text-slate-900 tracking-tight">D’IVOIRE</p>
                            <p className="font-bold text-slate-900 tracking-widest leading-none py-0.5">........................</p>
                            <p className="font-bold text-slate-900">Union – discipline – travail</p>
                            <div className="mt-1 flex justify-center">
                                <img src="/cote d'ivoire.png" alt="Côte d'Ivoire" className="w-12 h-12 object-contain" onError={(e) => { e.currentTarget.src = '/cote-divoire.png'; }} />
                            </div>
                        </div>
                    </div>

                    <div className="hidden print:block mb-2.5">
                        <h2 className="text-center font-serif font-extrabold text-[13px] uppercase tracking-wide text-slate-800 mb-1.5">
                            CLASSE DE : {abbreviateClassName(selectedClass.name).toUpperCase()}
                        </h2>
                        <div className="border border-slate-200 rounded-xl px-3.5 py-2 bg-slate-50/40 text-[11px] leading-snug font-serif text-slate-800 w-full">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                                <div className="flex items-baseline gap-1.5">
                                    <span className="font-bold shrink-0 text-slate-700">Chef de classe :</span>
                                    <span className="flex-1 border-b border-dotted border-slate-300 font-bold px-1 min-h-[14px] text-slate-900">{currentResponsables.chef || ''}</span>
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="font-bold shrink-0 text-slate-700">Sous-chef de classe :</span>
                                    <span className="flex-1 border-b border-dotted border-slate-300 font-bold px-1 min-h-[14px] text-slate-900">{currentResponsables.sousChef || ''}</span>
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="font-bold shrink-0 text-slate-700">Éducateur Principal :</span>
                                    <span className="flex-1 border-b border-dotted border-slate-300 font-bold px-1 min-h-[14px] text-slate-900">{currentResponsables.educateur || ''}</span>
                                </div>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="font-bold shrink-0 text-slate-700">Professeur principal :</span>
                                    <span className="flex-1 border-b border-dotted border-slate-300 font-bold px-1 min-h-[14px] text-slate-900">{currentResponsables.profPrincipal || ''}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto print:overflow-hidden rounded-2xl border border-slate-100 shadow-xs print:shadow-none w-full">
                        <table className="w-full table-fixed text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-slate-100 text-slate-700 text-xs print:text-[11px] font-bold uppercase tracking-wider">
                                    <th className="py-3.5 px-2 print:py-2.5 print:px-1 w-[11%] text-center text-slate-700 font-extrabold border-r border-slate-50">H</th>
                                    {days.map(d => (
                                        <th key={d} className="py-3.5 px-2 print:py-2.5 print:px-1.5 w-[17.8%] text-center font-bold text-slate-700 border-r border-slate-50 last:border-r-0">{d}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 text-sm print:text-[10.5px] font-medium text-slate-700">
                                {timeSlots.map((slotText, slotIdx) => {
                                    const isRecess = slotIdx === 3;

                                    return (
                                        <React.Fragment key={slotIdx}>
                                            <tr className="hover:bg-slate-50/40 transition-colors">
                                                {/* Horaire Column */}
                                                <td className={`py-3 px-1.5 print:py-1.5 print:px-1 text-center text-xs print:text-[9.5px] bg-white border-r border-slate-50 whitespace-nowrap overflow-hidden ${
                                                    isRecess ? 'font-medium text-slate-400 print:text-slate-400' : 'font-bold text-slate-900 print:font-bold print:text-slate-900'
                                                }`}>
                                                    {slotText}
                                                </td>

                                                {/* If Récréation Row */}
                                                {isRecess ? (
                                                    days.map((_, bIdx) => (
                                                        <td key={bIdx} className="py-3 px-2 print:py-2 print:px-1 text-center bg-slate-50/90 font-bold text-slate-400 text-xs print:text-[9.5px] tracking-widest uppercase border-r border-slate-100/60 last:border-r-0">
                                                            RÉCRÉATION
                                                        </td>
                                                    ))
                                                ) : (
                                                    days.map((dayName, dayIdx) => {
                                                        const daySegments = events.filter(e => e.day === dayIdx).flatMap(e => getCourseSegments(e, morningEndIdx, timeSlots.length));
                                                        const coveringSeg = daySegments.find(seg => seg.startSlot < slotIdx && slotIdx < seg.startSlot + seg.span);
                                                        if (coveringSeg) {
                                                            return null;
                                                        }

                                                        const seg = daySegments.find(s => s.startSlot === slotIdx);
                                                        
                                                        if (seg) {
                                                            const ev = seg.event;
                                                            const span = seg.span;
                                                            const teacher = getTeacherForSubject(ev.title, allTeachers, selectedClass.name);
                                                            const displayedTeacherName = ev.teacherName?.trim() || teacher.name;
                                                            return (
                                                                <td 
                                                                    key={dayIdx} 
                                                                    rowSpan={span}
                                                                    onClick={(e) => handleEventClick(e, ev)}
                                                                    className={`py-1.5 px-1.5 print:py-1 print:px-1 border-r border-slate-50 last:border-r-0 align-top overflow-hidden ${readOnly ? '' : 'cursor-pointer hover:brightness-95 transition-all'}`}
                                                                >
                                                                    <div 
                                                                        style={{ minHeight: span > 1 ? `${span * 54 - 8}px` : undefined }}
                                                                        className={`p-2 print:p-1.5 rounded-xl border-l-4 text-xs print:text-[10px] shadow-xs print:shadow-none min-h-[46px] h-full w-full max-w-full overflow-hidden flex flex-col justify-between ${ev.color}`}
                                                                    >
                                                                        <div className="min-w-0 w-full">
                                                                            <div className="font-bold text-[12px] print:text-[10.5px] leading-tight truncate">
                                                                                {ev.title}
                                                                            </div>
                                                                            <div className="flex items-center gap-1 text-slate-800 font-semibold text-[10px] print:text-[9px] mt-0.5 min-w-0 w-full">
                                                                                <GraduationCap size={11} className="text-indigo-600 shrink-0 print:w-2.5 print:h-2.5" />
                                                                                <span className="truncate min-w-0 flex-1">{displayedTeacherName}</span>
                                                                            </div>
                                                                        </div>
                                                                        {ev.room && (
                                                                            <div className="flex items-center gap-1 opacity-75 font-medium mt-1 text-[10px] print:text-[8.5px] min-w-0 w-full">
                                                                                <MapPin size={10} className="shrink-0 print:w-2.5 print:h-2.5" />
                                                                                <span className="truncate min-w-0 flex-1">{abbreviateClassName(ev.room)}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            );
                                                        }

                                                        return (
                                                            <td 
                                                                key={dayIdx} 
                                                                onClick={() => handleCellClick(dayIdx, slotIdx)}
                                                                className={`py-3 px-1.5 print:py-2 print:px-1 border-r border-slate-50 last:border-r-0 align-middle text-center overflow-hidden ${readOnly ? '' : 'cursor-pointer hover:bg-sky-50/50 transition-colors'}`}
                                                            >
                                                                {!readOnly && (
                                                                    <span className="text-slate-300 font-bold text-sm print:hidden hover:text-sky-500 transition-colors">
                                                                        +
                                                                    </span>
                                                                )}
                                                            </td>
                                                        );
                                                    })
                                                )}
                                            </tr>
                                            {slotIdx === morningEndIdx && (
                                                <tr className="bg-slate-50/80">
                                                    <td className="py-3 px-1.5 print:py-2 print:px-1 text-center font-medium text-slate-400 text-xs print:text-[9.5px] bg-white border-r border-slate-50 whitespace-nowrap overflow-hidden"></td>
                                                    {days.map((_, bIdx) => (
                                                        <td key={bIdx} className="py-3 px-2 print:py-2 print:px-1 text-center bg-slate-50/90 font-bold text-slate-400 text-xs print:text-[9.5px] tracking-widest uppercase border-r border-slate-100/60 last:border-r-0">
                                                            PAUSE MIDI
                                                        </td>
                                                    ))}
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Responsables de la Classe Configuration (Pour l'impression) */}
            <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4 print:hidden">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl">
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-800">Responsables de la classe ({abbreviateClassName(selectedClass.name)})</h4>
                        <p className="text-xs text-slate-500 font-medium">Renseignez les noms (optionnel) ou laissez vide pour remplir sur les pointillés après l'impression.</p>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Chef de classe</label>
                        <input
                            type="text"
                            value={currentResponsables.chef}
                            onChange={(e) => handleResponsableChange('chef', e.target.value)}
                            placeholder="Laisser vide pour pointillés..."
                            disabled={readOnly}
                            className="bg-white border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 rounded-xl px-3.5 py-2 font-bold text-slate-700 text-sm outline-none transition-all w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Sous-chef de classe</label>
                        <input
                            type="text"
                            value={currentResponsables.sousChef}
                            onChange={(e) => handleResponsableChange('sousChef', e.target.value)}
                            placeholder="Laisser vide pour pointillés..."
                            disabled={readOnly}
                            className="bg-white border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 rounded-xl px-3.5 py-2 font-bold text-slate-700 text-sm outline-none transition-all w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Educateur Principal</label>
                        <input
                            type="text"
                            value={currentResponsables.educateur}
                            onChange={(e) => handleResponsableChange('educateur', e.target.value)}
                            placeholder="Laisser vide pour pointillés..."
                            disabled={readOnly}
                            className="bg-white border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 rounded-xl px-3.5 py-2 font-bold text-slate-700 text-sm outline-none transition-all w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Professeur principal</label>
                        <input
                            type="text"
                            value={currentResponsables.profPrincipal}
                            onChange={(e) => handleResponsableChange('profPrincipal', e.target.value)}
                            placeholder="Laisser vide pour pointillés..."
                            disabled={readOnly}
                            className="bg-white border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 rounded-xl px-3.5 py-2 font-bold text-slate-700 text-sm outline-none transition-all w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Directeur des Études Name Configuration */}
            <div className="mt-4 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 print:hidden">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-sky-100 text-sky-700 rounded-2xl">
                        <User size={24} />
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-800">Directeur des Études</h4>
                        <p className="text-xs text-slate-500 font-medium">Modifier le nom du directeur pour l'impression de l'emploi du temps.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <input 
                        type="text"
                        value={directorStudiesName}
                        onChange={(e) => handleDirectorNameChange(e.target.value)}
                        placeholder="Ex: M. TAPE MAURICE"
                        disabled={readOnly}
                        className="bg-white border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 rounded-xl px-4 py-2.5 font-bold text-slate-700 text-sm outline-none transition-all w-full sm:w-72"
                    />
                </div>
            </div>
      </div>
      </div>

      {/* --- EDIT MODAL --- */}
      <AnimatePresence>
      {isModalOpen && (
          <div className="fixed inset-0 z-[450] flex flex-col justify-end md:justify-center items-center">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                onClick={() => setIsModalOpen(false)}
              />
              
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-white rounded-t-[32px] md:rounded-[2rem] w-full max-w-lg md:max-w-md p-6 pb-10 md:pb-6 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] max-h-[92vh] sm:max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col"
              >
                  {/* Top drag handle indicator for mobile */}
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-5 md:hidden shrink-0" />

                  <div className="flex justify-between items-center mb-5 sm:mb-6 shrink-0">
                      <h2 className="text-xl font-bold text-gray-800">
                          {editingEventId ? 'Modifier Cours' : 'Ajouter un Cours'}
                      </h2>
                      <button 
                        onClick={() => setIsModalOpen(false)} 
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                      >
                          <X size={20} />
                      </button>
                  </div>

                  <div className="space-y-4">
                      {/* Matière */}
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Matière</label>
                          <select 
                            value={formData.title} 
                            onChange={e => handleSubjectChange(e.target.value)}
                            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 transition-all"
                          >
                              {(() => {
                                  const c = formData.room || selectedClass?.name || '';
                                  const available = getSubjectsForClass(c);
                                  return available.map(s => <option key={s} value={s}>{s}</option>);
                              })()}
                          </select>
                      </div>

                      {/* Nom du Professeur */}
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Professeur</label>
                          <input 
                            type="text"
                            list="schedule-teachers-list"
                            value={formData.teacherName ?? ''}
                            onChange={e => setFormData({...formData, teacherName: e.target.value})}
                            placeholder="Nom et prénom du professeur..."
                            className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 transition-all"
                          />
                          <datalist id="schedule-teachers-list">
                              {allTeachers.map((t: any, idx: number) => (
                                  <option key={t.id || idx} value={t.name}>{t.subject}</option>
                              ))}
                          </datalist>
                      </div>

                      {/* Classe */}
                      <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Classe</label>
                            <select 
                                value={formData.room} 
                                onChange={e => setFormData({...formData, room: e.target.value})}
                                className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 transition-all"
                            >
                                {ROOMS.filter(r => {
                                    if (currentUser?.section === 'Primaire') {
                                        return r.startsWith('CP') || r.startsWith('CE') || r.startsWith('CM');
                                    }
                                    return true;
                                }).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>

                      {/* Jour & Heure */}
                      <div className="grid grid-cols-2 gap-4">
                           <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Jour</label>
                                <select 
                                    value={formData.day} 
                                    onChange={e => setFormData({...formData, day: parseInt(e.target.value)})}
                                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 transition-all"
                                >
                                    {days.map((d, i) => <option key={i} value={i}>{d}</option>)}
                                </select>
                           </div>
                           <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Début</label>
                                <select 
                                    value={formData.start} 
                                    onChange={e => setFormData({...formData, start: parseInt(e.target.value)})}
                                    className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 transition-all"
                                >
                                    {timeSlots.map((t, i) => {
                                        if (i === 3) return null;
                                        return <option key={i} value={i}>{t}</option>;
                                    })}
                                </select>
                           </div>
                      </div>

                      {/* Durée Slider/Select */}
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Durée: {formData.duration}h</label>
                          <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map(h => (
                                  <button
                                    key={h}
                                    type="button"
                                    onClick={() => setFormData({...formData, duration: h})}
                                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                                        formData.duration === h 
                                        ? 'bg-sky-600 text-white shadow-md' 
                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                                  >
                                      {h}h
                                  </button>
                              ))}
                          </div>
                          {(() => {
                              const s = formData.start ?? 0;
                              const dur = formData.duration ?? 1;
                              if (s < 3 && s + dur > 3) {
                                  return (
                                      <p className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-1.5 rounded-lg border border-sky-100 mt-2">
                                          Ce cours de {dur}h est inséré avec la Récréation (9h20 - 10h15, Récréation 10h15 - 10h30, puis {dur === 2 ? '10h30 - 11h25' : 'reprise'}).
                                      </p>
                                  );
                              }
                              return null;
                          })()}
                      </div>

                      {/* Horaire libre / spécifique (Optionnel) */}
                      <div>
                          <div className="flex justify-between items-center mb-1 ml-1">
                              <label className="block text-xs font-bold text-gray-500">Horaire sur mesure (optionnel)</label>
                              {formData.customTime && (
                                  <button 
                                      type="button"
                                      onClick={() => setFormData({...formData, customTime: ''})}
                                      className="text-[11px] text-sky-600 font-bold hover:underline"
                                  >
                                      Effacer
                                  </button>
                              )}
                          </div>
                          <input 
                              type="text"
                              placeholder="ex: 08h00 - 09h30, 14h15 - 16h00..."
                              value={formData.customTime || ''}
                              onChange={e => setFormData({...formData, customTime: e.target.value})}
                              className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-sky-500 rounded-xl px-3 py-2 outline-none font-medium text-gray-800 text-sm transition-all"
                          />
                          <p className="text-[11px] text-gray-400 mt-1 ml-1">
                              Permet d'afficher n'importe quelle heure personnalisée sur le cours.
                          </p>
                      </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                      {editingEventId && (
                          <>
                            <button 
                              type="button"
                              onClick={async () => {
                                  const s = formData.start ?? 0;
                                  const dur = formData.duration ?? 1;
                                  const slotTime = formData.customTime || `${(timeSlots[s] || '').split(' - ')[0] || ''} - ${(timeSlots[Math.min(s + dur - 1, timeSlots.length - 1)] || '').split(' - ')[1] || ''}`;
                                  const evtObj: ScheduleEvent = {
                                      id: editingEventId,
                                      day: formData.day ?? 0,
                                      start: s,
                                      duration: dur,
                                      title: formData.title || 'Cours',
                                      room: formData.room || 'Terminale D1',
                                      color: formData.color || getSubjectColor(formData.title || 'Cours'),
                                      customTime: formData.customTime,
                                      teacherName: formData.teacherName
                                  };
                                  const res = await triggerImmediateCourseReminder(evtObj, slotTime);
                                  await scheduleCourseNotifications(events, timeSlots);
                                  setReminderToast({
                                      title: res.success ? "🔔 Rappel activé en temps réel" : "⚠️ Permissions requises",
                                      message: res.message || `Rappel configuré pour ${evtObj.title}.`
                                  });
                                  setTimeout(() => setReminderToast(null), 5000);
                              }}
                              className="px-3 sm:px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              title="M'envoyer un rappel en temps réel"
                            >
                                <Bell size={18} />
                                <span className="text-xs sm:text-sm font-semibold">Me rappeler</span>
                            </button>
                            <button 
                              onClick={handleDelete}
                              className="px-4 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-colors flex items-center justify-center cursor-pointer"
                              title="Supprimer"
                            >
                                <Trash2 size={20} />
                            </button>
                          </>
                      )}
                      
                      <button 
                        onClick={handleSave}
                        className="flex-1 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 shadow-lg shadow-sky-200 transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                      >
                          <Save size={18} />
                          Enregistrer
                      </button>
                  </div>
              </motion.div>
          </div>
      )}
      </AnimatePresence>

      {/* --- TIME SLOTS CONFIGURATION MODAL --- */}
      <AnimatePresence>
      {isTimeSlotsModalOpen && (
          <div className="fixed inset-0 z-[460] flex flex-col justify-end md:justify-center items-center">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                onClick={() => setIsTimeSlotsModalOpen(false)}
              />
              
              <motion.div 
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="bg-white rounded-t-[2.5rem] md:rounded-[2rem] w-full max-w-lg p-5 sm:p-6 pb-8 md:pb-6 relative z-10 shadow-2xl max-h-[92vh] sm:max-h-[90vh] flex flex-col"
              >
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 md:hidden shrink-0" />

                  <div className="flex justify-between items-center mb-4">
                      <div>
                          <h2 className="text-xl font-bold text-gray-800">Configuration des créneaux horaires</h2>
                          <p className="text-xs text-gray-500">Modifiez manuellement les heures de la grille de l'emploi du temps</p>
                      </div>
                      <button onClick={() => setIsTimeSlotsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-2 custom-scrollbar">
                      {tempTimeSlots.map((slot, index) => (
                          <div key={index} className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                              <span className="text-xs font-bold text-gray-400 w-6 text-center">{index + 1}</span>
                              <input 
                                  type="text"
                                  value={slot}
                                  onChange={(e) => {
                                      const newSlots = [...tempTimeSlots];
                                      newSlots[index] = e.target.value;
                                      setTempTimeSlots(newSlots);
                                  }}
                                  className="flex-1 bg-white border border-gray-300 focus:border-sky-500 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-800 outline-none"
                                  placeholder="ex: 08h00 - 09h00"
                              />
                              <button 
                                  onClick={() => {
                                      const newSlots = tempTimeSlots.filter((_, i) => i !== index);
                                      setTempTimeSlots(newSlots);
                                  }}
                                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Supprimer ce créneau"
                              >
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      ))}

                      <button 
                          onClick={() => setTempTimeSlots([...tempTimeSlots, '08h00 - 09h00'])}
                          className="w-full py-2.5 border-2 border-dashed border-sky-300 text-sky-600 rounded-xl font-bold text-sm hover:bg-sky-50 transition-colors flex items-center justify-center gap-2 mt-2"
                      >
                          <Plus size={16} />
                          Ajouter un créneau horaire
                      </button>
                  </div>

                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                      <button 
                          onClick={() => {
                              setTempTimeSlots([...DEFAULT_TIME_SLOTS]);
                          }}
                          className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
                      >
                          Réinitialiser
                      </button>
                      
                      <button 
                          onClick={() => {
                              setIsConfirmSaveModalOpen(true);
                          }}
                          className="flex-1 py-2.5 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 shadow-lg shadow-sky-200 transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                      >
                          <Save size={16} />
                          Enregistrer les horaires
                      </button>
                  </div>
              </motion.div>
          </div>
      )}
      </AnimatePresence>

      {/* Modal de confirmation d'application des créneaux horaires */}
      <AnimatePresence>
      {isConfirmSaveModalOpen && (
          <div className="fixed inset-0 z-[500] flex flex-col justify-end md:justify-center items-center">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                onClick={() => setIsConfirmSaveModalOpen(false)}
              />
              
              <motion.div 
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="bg-white rounded-t-[2.5rem] md:rounded-[2rem] max-w-lg w-full p-6 sm:p-8 pb-8 md:pb-8 relative z-10 shadow-2xl border border-slate-100 flex flex-col gap-6"
              >
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-2 md:hidden shrink-0" />

                  {/* Title & Header */}
                  <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100">
                          <Clock size={24} />
                      </div>
                      <div>
                          <h3 className="text-xl font-bold text-slate-900">Appliquer la modification</h3>
                          <p className="text-sm font-medium text-slate-500 mt-1">
                              Comment souhaitez-vous appliquer cette modification du créneau horaire ?
                          </p>
                      </div>
                  </div>

                  {/* Options */}
                  <div className="flex flex-col gap-3">
                      {/* Option 1: All classes (Secondaire et Technique & Professionnel) */}
                      <button
                          onClick={handleSaveTimeSlotsAllClasses}
                          className="group relative flex items-start gap-3.5 p-4 rounded-2xl border-2 border-sky-100 bg-sky-50/50 hover:bg-sky-600 hover:border-sky-600 text-left transition-all cursor-pointer active:scale-[0.99]"
                      >
                          <div className="p-2 rounded-xl bg-sky-100 group-hover:bg-sky-500 text-sky-700 group-hover:text-white transition-colors shrink-0 mt-0.5">
                              <Users size={18} />
                          </div>
                          <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900 group-hover:text-white transition-colors">
                                  Appliquer à toutes les classes (Secondaire et Technique & Professionnel)
                              </span>
                              <span className="text-xs font-medium text-slate-500 group-hover:text-sky-100 transition-colors mt-0.5">
                                  Applique les nouveaux horaires au Général et au Technique. Les classes de la section Primaire restent inchangées.
                              </span>
                          </div>
                      </button>

                      {/* Option 2: Only this class */}
                      <button
                          onClick={handleSaveTimeSlotsSingleClass}
                          disabled={!selectedClass}
                          className={`group relative flex items-start gap-3.5 p-4 rounded-2xl border-2 text-left transition-all ${
                              selectedClass
                                  ? 'border-slate-200 hover:border-slate-800 bg-slate-50 hover:bg-slate-800 cursor-pointer active:scale-[0.99]'
                                  : 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                          }`}
                      >
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 transition-colors ${
                              selectedClass ? 'bg-slate-200 group-hover:bg-slate-700 text-slate-700 group-hover:text-white' : 'bg-slate-100 text-slate-400'
                          }`}>
                              <CheckCircle size={18} />
                          </div>
                          <div className="flex flex-col">
                              <span className={`text-sm font-bold transition-colors ${
                                  selectedClass ? 'text-slate-900 group-hover:text-white' : 'text-slate-400'
                              }`}>
                                  Appliquer uniquement à cette classe {selectedClass ? `(${selectedClass.name})` : ''}
                              </span>
                              <span className={`text-xs font-medium mt-0.5 transition-colors ${
                                  selectedClass ? 'text-slate-500 group-hover:text-slate-300' : 'text-slate-400'
                              }`}>
                                  {selectedClass 
                                      ? `Enregistre ces horaires uniquement pour la classe de ${selectedClass.name}.`
                                      : 'Sélectionnez une classe pour enregistrer uniquement pour elle.'}
                              </span>
                          </div>
                      </button>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end pt-2 border-t border-slate-100">
                      <button
                          onClick={() => setIsConfirmSaveModalOpen(false)}
                          className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-colors cursor-pointer"
                      >
                          Annuler
                      </button>
                  </div>
              </motion.div>
          </div>
      )}
      </AnimatePresence>

      <AnimatePresence>
        {reminderToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 left-6 sm:left-auto sm:max-w-md z-[550] bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 flex items-start gap-3 backdrop-blur-xl"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Bell size={18} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-white mb-0.5">{reminderToast.title}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{reminderToast.message}</p>
            </div>
            <button 
              onClick={() => setReminderToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

