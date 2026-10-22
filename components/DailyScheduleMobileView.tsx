import React, { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight, Bell, Check, MapPin, X, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredTimeSlots, getLunchBreakIndex, getCourseSegments } from './SchedulePage';
import { scheduleCourseNotifications, cancelAllCourseNotifications, triggerImmediateCourseReminder } from '../src/services/NotificationScheduler';

export interface ScheduleEvent {
    id: string;
    day: number;
    start: number;
    duration: number;
    title: string;
    room: string;
    color: string;
    customTime?: string;
    teacherName?: string;
}

interface DailyScheduleMobileViewProps {
  onBack?: () => void;
  events: ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void;
  onEmptySlotClick: (day: number, start: number) => void;
  readOnly?: boolean;
  classNameTitle?: string;
  subtitle?: string;
  imageUrl?: string;
  currentUser?: any;
  teachersList?: any[];
  isEmbedded?: boolean;
  isTeacherSchedule?: boolean;
}

const DAYS = ['LUN', 'MAR', 'MER', 'JEU', 'VEN'];
const FULL_DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

const getTeacherNameForSubject = (subject: string, teachersList?: any[]): string => {
  if (teachersList && teachersList.length > 0) {
    const found = teachersList.find(t => {
      if (!t.subject) return false;
      const tSub = t.subject.toLowerCase();
      const sSub = subject.toLowerCase();
      return tSub === sSub || tSub.includes(sSub) || sSub.includes(tSub);
    });
    if (found) return found.name;
  }
  const fallbackMap: Record<string, string> = {
    'Philosophie': 'Mme.ZILF',
    'Physique-Chimie': "Mr.N'ZUE",
    'Français': 'Mr.LAGBO',
    'Anglais': 'Mr.DEJOU',
    'SVT': 'Mme.BAMBA',
    'Mathématiques': 'Mr.KOFFI',
    'Hist-Géo': 'Mr.KONAN TRESOR',
    'Histoire': 'Mr.KONAN TRESOR',
    'Géographie': 'Mr.KONAN TRESOR',
    'Informatique': 'David Legrand',
    'EPS': 'Michel Brun',
    'Espagnol': 'Mme MORENO Elena',
    'Allemand': 'M. SCHMIDT Karl',
    'Arts Plastiques': 'Mme MONET Claire',
    'Musique': 'M. SENGHOR David',
    'Devoir': 'Surveillant Général',
    'Étude': 'Surveillant Général',
  };
  return fallbackMap[subject] || 'Professeur de ' + subject;
};

export const DailyScheduleMobileView: React.FC<DailyScheduleMobileViewProps> = ({ 
    onBack, 
    events,
    onEventClick,
    onEmptySlotClick,
    readOnly,
    classNameTitle,
    subtitle,
    imageUrl,
    currentUser,
    teachersList,
    isEmbedded,
    isTeacherSchedule
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // 0 = Lundi, 4 = Vendredi
  const [isExpanded, setIsExpanded] = useState(false);
  const [dayDirection, setDayDirection] = useState(0);
  const [selectedEventDetail, setSelectedEventDetail] = useState<ScheduleEvent | null>(null);

  // Debounce guard to prevent double-skipping days (e.g. Capacitor duplicate touch & drag events)
  const lastSwipeTimeRef = React.useRef<number>(0);

  const goToNextDay = () => {
    const now = Date.now();
    if (now - lastSwipeTimeRef.current < 450) return;
    lastSwipeTimeRef.current = now;
    setDayDirection(1);
    setSelectedDayIndex((prev) => (prev + 1) % DAYS.length);
  };

  const goToPrevDay = () => {
    const now = Date.now();
    if (now - lastSwipeTimeRef.current < 450) return;
    lastSwipeTimeRef.current = now;
    setDayDirection(-1);
    setSelectedDayIndex((prev) => (prev - 1 + DAYS.length) % DAYS.length);
  };

  const touchStartXRef = React.useRef<number | null>(null);
  const touchStartYRef = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Minimum swipe threshold 50px, predominantly horizontal movement
    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.25 && Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        // Glissement de la droite vers la gauche -> Exactement 1 jour suivant
        goToNextDay();
      } else {
        // Glissement de la gauche vers la droite -> Exactement 1 jour précédent
        goToPrevDay();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
  };

  React.useEffect(() => {
    window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: true } }));
    window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: true } }));
    return () => {
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: false } }));
      window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: false } }));
    };
  }, []);

  const isLevel1User = readOnly || (currentUser && (
    currentUser.accessLevel === 1 || 
    currentUser.role === 'student' || 
    currentUser.role === 'parent' ||
    currentUser.role === 'élève' ||
    currentUser.role === 'étudiant'
  ));

  const [notifEnabled, setNotifEnabled] = useState(() => {
    return localStorage.getItem('course_notifications_enabled') === 'true';
  });
  const [toast, setToast] = useState<{ title: string; body: string } | null>(null);

  const handleToggleNotifications = async () => {
    const nextState = !notifEnabled;
    setNotifEnabled(nextState);
    localStorage.setItem('course_notifications_enabled', String(nextState));

    if (nextState) {
      // Setup actual background/capacitor notifications
      const timeSlots = getStoredTimeSlots();
      await scheduleCourseNotifications(events, timeSlots);

      const dayCourses = events.filter(e => e.day === selectedDayIndex && e.title);
      const sampleCourse = dayCourses[0] || events[0];
      const sampleTime = sampleCourse ? mobileTimeSlots[sampleCourse.start]?.start || '07h30' : '07h30';
      const sampleSubject = sampleCourse ? sampleCourse.title : 'Mathématiques';

      const toastTitle = "🔔 Rappels de cours activés !";
      const toastBody = `Rappels configurés. Vous recevrez une notification au début de chaque cours.`;
      
      setToast({ title: toastTitle, body: toastBody });
      setTimeout(() => setToast(null), 6000);
    } else {
      await cancelAllCourseNotifications();
      setToast({
        title: "Notifications désactivées",
        body: "Les rappels automatiques pour votre emploi du temps ont été désactivés."
      });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const hourHeight = 96;
  const startOfDayHour = 7.5; // 7h30
  const endOfDayHour = 17.5;  // 17h30

  // The schedule in SchedulePage uses 'start' as index (0 = 7h30, 1 = 8h30, etc.)
  // So startHour = 7.5 + start
  
  const parseColor = (colorClass: string) => {
    if (colorClass.includes('rose')) return { bg: '#fff1f2', text: '#e11d48', border: '#fecdd3' };
    if (colorClass.includes('pink')) return { bg: '#fdf2f8', text: '#db2777', border: '#fbcfe8' };
    if (colorClass.includes('fuchsia')) return { bg: '#fdf4ff', text: '#c026d3', border: '#f5d0fe' };
    if (colorClass.includes('purple')) return { bg: '#faf5ff', text: '#9333ea', border: '#e9d5ff' };
    if (colorClass.includes('violet')) return { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' };
    if (colorClass.includes('indigo')) return { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe' };
    if (colorClass.includes('sky')) return { bg: '#f0f9ff', text: '#0284c7', border: '#bae6fd' };
    if (colorClass.includes('cyan')) return { bg: '#ecfeff', text: '#0891b2', border: '#a5f3fc' };
    if (colorClass.includes('emerald')) return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
    if (colorClass.includes('green')) return { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' };
    if (colorClass.includes('lime')) return { bg: '#f7fee7', text: '#65a30d', border: '#d9f99d' };
    if (colorClass.includes('amber')) return { bg: '#fffbeb', text: '#d97706', border: '#fde68a' };
    if (colorClass.includes('orange')) return { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' };
    return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
  };

  const [storedTimeSlots, setStoredTimeSlots] = useState<string[]>(() => getStoredTimeSlots());

  useEffect(() => {
    const handleSlotsUpdate = () => {
      setStoredTimeSlots(getStoredTimeSlots());
    };
    window.addEventListener('school_time_slots_updated', handleSlotsUpdate);
    window.addEventListener('storage', handleSlotsUpdate);
    return () => {
      window.removeEventListener('school_time_slots_updated', handleSlotsUpdate);
      window.removeEventListener('storage', handleSlotsUpdate);
    };
  }, []);

  const morningEndIdx = getLunchBreakIndex(storedTimeSlots);
  const mobileTimeSlots: Array<{
    start: string;
    end: string;
    isBreak: boolean;
    label: string;
    slotIdx?: number;
  }> = [];

  storedTimeSlots.forEach((slotStr, i) => {
    const parts = slotStr.split(' - ');
    const isRecess = i === 3;
    mobileTimeSlots.push({
      start: parts[0] || slotStr,
      end: parts[1] || '',
      isBreak: isRecess,
      label: isRecess ? 'Récréation' : '',
      slotIdx: i
    });
    if (i === morningEndIdx) {
      mobileTimeSlots.push({
        start: '',
        end: '',
        isBreak: true,
        label: 'Pause Midi'
      });
    }
  });

  const getVisualIndex = (slotIdx: number) => (slotIdx <= morningEndIdx ? slotIdx : slotIdx + 1);

  const renderTimeline = (dayIndex: number) => {
    const dayEvents = events.filter(e => e.day === dayIndex);
    const topOffset = 28; // Clearance so 7h marker is never cut off at top

    return (
      <div className="relative pt-3 pb-24" style={{ height: `${mobileTimeSlots.length * hourHeight + topOffset + 50}px` }}>
        {/* The vertical dashed/grey line running down */}
        <div className="absolute left-[72px] top-3 bottom-0 w-px bg-transparent border-l-[1.5px] border-dashed border-[#e1e4ef] z-0"></div>

        {/* Time markers and Empty Clickable Slots */}
        {mobileTimeSlots.map((slot, vIdx) => (
          <React.Fragment key={vIdx}>
            {slot.start && (
              <div className="absolute left-0 w-full flex pointer-events-none" style={{ top: `${vIdx * hourHeight + topOffset}px` }}>
                <div className={`w-[70px] flex-shrink-0 text-[13px] pr-3 text-right whitespace-nowrap transform -translate-y-1/2 ${
                  slot.isBreak ? 'font-medium text-slate-400' : 'font-extrabold text-slate-900 tracking-tight'
                }`}>
                  {slot.start}
                </div>
              </div>
            )}
            
            {/* Clickable area for adding event */}
            {!readOnly && !slot.isBreak && slot.slotIdx !== undefined && (
                <div 
                  className="absolute left-[72px] right-3 h-24 z-0 cursor-pointer"
                  style={{ top: `${vIdx * hourHeight + topOffset}px` }}
                  onClick={() => onEmptySlotClick(dayIndex, slot.slotIdx!)}
                />
            )}

            {/* Break marker */}
            {slot.isBreak && (
                <div 
                  className="absolute left-[72px] right-3 flex items-center justify-center z-10"
                  style={{ top: `${vIdx * hourHeight + topOffset}px`, height: `${hourHeight}px` }}
                >
                  <div className="w-full h-[calc(100%-8px)] rounded-r-[24px] bg-slate-50 flex items-center justify-center border-l-[4px] border-slate-300 pointer-events-none shadow-sm">
                      <span className="font-bold text-slate-400 text-[13px] uppercase tracking-wider">{slot.label}</span>
                  </div>
                </div>
            )}
          </React.Fragment>
        ))}

        {/* End of day marker */}
        <div className="absolute left-0 w-full flex pointer-events-none" style={{ top: `${mobileTimeSlots.length * hourHeight + topOffset}px` }}>
            <div className="w-[70px] flex-shrink-0 text-[13px] font-extrabold text-slate-900 pr-3 text-right whitespace-nowrap transform -translate-y-1/2">
                {mobileTimeSlots[mobileTimeSlots.length - 1]?.end}
            </div>
        </div>

        {/* Events */}
        {dayEvents.flatMap((evt) => {
          const segments = getCourseSegments(evt, morningEndIdx, storedTimeSlots.length);
          return segments.map((seg, sIdx) => {
            const visualStart = getVisualIndex(seg.startSlot);
            const topPosition = visualStart * hourHeight + topOffset;
            const height = seg.span * hourHeight;
            const colors = parseColor(evt.color);
            
            // Compute end index safely
            const endSlotIndex = Math.min(seg.startSlot + seg.span - 1, storedTimeSlots.length - 1);
            const startParts = (storedTimeSlots[seg.startSlot] || '').split(' - ');
            const endParts = (storedTimeSlots[endSlotIndex] || '').split(' - ');

            return (
              <div 
                key={`${evt.id}-seg-${sIdx}`} 
                className="absolute left-[72px] right-3 pl-3.5 z-10 hover:z-30 transition-shadow pointer-events-auto"
                style={{ top: `${topPosition}px`, height: `${height}px` }}
                onClick={() => setSelectedEventDetail(evt)}
              >
                <div 
                  className="w-full h-full rounded-r-[24px] border-l-[4px] px-3.5 py-2.5 shadow-sm relative group overflow-hidden flex flex-col justify-between"
                  style={{
                    backgroundColor: colors.bg,
                    borderColor: colors.text,
                  }}
                >
                  <div>
                    <div className="flex items-center gap-1.5 mb-1 relative z-10">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors.text }}></div>
                      <h3 className="font-bold text-[14px] leading-tight truncate" style={{ color: colors.text }}>{evt.title}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 ml-3.5 mb-0.5 relative z-10 text-[12px] font-bold leading-tight" style={{ color: colors.text, opacity: 0.9 }}>
                      <GraduationCap size={13} className="shrink-0" style={{ color: colors.text }} />
                      <span className="truncate">
                        {isTeacherSchedule ? (classNameTitle || "Sarah Dubois") : (evt.teacherName?.trim() || getTeacherNameForSubject(evt.title, teachersList))}
                      </span>
                    </div>
                    {evt.room && (
                      <div className="flex items-center gap-1 ml-3.5 relative z-10" style={{ color: colors.text, opacity: 0.8 }}>
                        <MapPin size={11} className="shrink-0" />
                        <p className="text-[11px] font-semibold leading-tight truncate">{evt.room}</p>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-[11px] font-bold opacity-75 ml-3.5 relative z-10 leading-tight shrink-0 mt-1" style={{ color: colors.text }}>
                    {evt.customTime || `${startParts[0] || ''} - ${endParts[1] || ''}`}
                  </p>
                </div>
              </div>
            );
          });
        })}
      </div>
    );
  };

  const daySlideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0
    })
  };

  return (
    <motion.div 
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed md:absolute inset-0 z-[120] h-full bg-[#BFDBFE] overflow-hidden flex flex-col font-sans"
    >
      {/* Top Elements wrapper */}
      <motion.div 
        initial={false}
        animate={{ 
          height: isExpanded ? 50 : 'auto', 
          opacity: isExpanded ? 0 : 1,
          marginBottom: isExpanded ? 0 : undefined
        }}
        className="overflow-hidden flex-shrink-0 relative"
      >
        {/* Header */}
        <div className={`${isEmbedded ? 'pt-6' : 'pt-12'} px-6 flex flex-shrink-0 items-center justify-between mb-[20px] mt-0`}>
          <div className="flex items-center gap-3">
            {!isEmbedded && onBack && (
              <button 
                onClick={onBack}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md border border-white/50 text-slate-900 transition-colors shrink-0"
              >
                <ChevronLeft size={22} strokeWidth={2.5} />
              </button>
            )}
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt={classNameTitle || "Professeur"} 
                className="w-11 h-11 rounded-full object-cover border-2 border-white/80 shadow-md shrink-0" 
              />
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[20px] font-bold text-white leading-tight">
                  {classNameTitle ? classNameTitle.replace(/terminale/gi, 'Tle').replace(/TERMINALE/g, 'TLE') : "Emploi du temps"}
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-300/40 text-[10px] font-bold text-white shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                  <span>En direct</span>
                </span>
              </div>
              <span className="text-[12px] font-medium text-white/80">
                {subtitle || "Planning synchronisé en temps réel"}
              </span>
            </div>
          </div>
        </div>

        <div 
          className="relative overflow-hidden w-full px-4 sm:px-0"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
            {/* Week Strip */}
            <div className="mb-10 flex justify-between items-start text-center relative max-w-[22rem] mx-auto w-full px-4 h-[82px]">
                {DAYS.map((dayName, index) => (
                  <div 
                    key={index} 
                    className={
                        selectedDayIndex === index
                        ? "flex flex-col items-center justify-start bg-white rounded-full w-[46px] h-[82px] pt-[17px] shadow-[0_8px_20px_rgba(0,0,0,0.1)] z-10 transition-all duration-300 cursor-pointer"
                        : "flex flex-col items-center gap-3 cursor-pointer pt-[17px] w-[46px] transition-all duration-300"
                    } 
                    onClick={() => {
                        const now = Date.now();
                        lastSwipeTimeRef.current = now;
                        setDayDirection(index > selectedDayIndex ? 1 : -1);
                        setSelectedDayIndex(index);
                    }}
                  >
                    <span className={
                        selectedDayIndex === index 
                        ? "text-[12px] font-bold text-sky-600 mb-[6px]" 
                        : "text-[12px] font-bold text-slate-600 tracking-wider"
                    }>{dayName}</span>
                    
                    <div className={`w-1.5 h-1.5 rounded-full ${selectedDayIndex === index ? 'bg-sky-600 mt-auto mb-[14px]' : 'bg-transparent mt-[10px]'}`}></div>
                  </div>
                ))}
            </div>
        </div>
      </motion.div>

      {/* Schedule Sheet */}
      <motion.div layout className="flex-1 bg-white rounded-t-[36px] overflow-hidden flex flex-col relative w-full shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-10">
        {/* Drag handle */}
        <motion.div 
          onClick={() => setIsExpanded(!isExpanded)}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragEnd={(e, info) => {
            if (info.offset.y > 50 || info.velocity.y > 200) {
              if (isExpanded) {
                setIsExpanded(false);
              } else {
                onBack();
              }
            } else if (info.offset.y < -50 || info.velocity.y < -200) {
              setIsExpanded(true);
            }
          }}
          className="w-full flex justify-center pt-5 pb-4 bg-white relative z-20 cursor-grab active:cursor-grabbing"
        >
          <div className="w-9 h-[4px] bg-[#E1E5F1] rounded-full pointer-events-none"></div>
        </motion.div>
        
        {/* Day Header with indicator & Swipe Navigation controls */}
        <div className="px-6 mb-3 mt-1 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <h2 className="text-[22px] font-black text-slate-800 tracking-tight truncate">{FULL_DAYS[selectedDayIndex]}</h2>
            <span className="text-[11px] font-bold text-sky-700 bg-sky-50 border border-sky-200/60 px-2 py-0.5 rounded-full shrink-0">
              {selectedDayIndex + 1}/{DAYS.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={goToPrevDay}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title="Jour précédent (ou glisser vers la droite)"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>
            <button
              type="button"
              onClick={goToNextDay}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              title="Jour suivant (ou glisser vers la gauche)"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Timetable Scroll & Drag Area */}
        <div 
          className="flex-1 overflow-y-auto px-5 sm:px-6 relative pb-[100px] custom-scrollbar touch-pan-y"
        >
          <div className="relative pt-2">
            {/* Timetable grid setup with fluid slide animation */}
            <div className="relative overflow-visible w-full h-full">
              <AnimatePresence custom={dayDirection} mode="popLayout" initial={false}>
                <motion.div
                  key={selectedDayIndex}
                  custom={dayDirection}
                  variants={daySlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(_, info) => {
                    const swipeThreshold = 50;
                    if (info.offset.x < -swipeThreshold || info.velocity.x < -250) {
                      goToNextDay();
                    } else if (info.offset.x > swipeThreshold || info.velocity.x > 250) {
                      goToPrevDay();
                    }
                  }}
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.22 }
                  }}
                  style={{ touchAction: 'pan-y' }}
                  className="w-full h-full cursor-grab active:cursor-grabbing select-none"
                >
                  {renderTimeline(selectedDayIndex)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedEventDetail && (
          <div className="fixed inset-0 z-[400] flex flex-col justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedEventDetail(null)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full bg-white rounded-t-[32px] pt-2 pb-8 px-6 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col items-center"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mb-6" />
              
              <div className="w-full flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: parseColor(selectedEventDetail.color).bg, color: parseColor(selectedEventDetail.color).text }}>
                     <span className="font-bold text-xl">{selectedEventDetail.title.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">{selectedEventDetail.title}</h3>
                    <p className="text-slate-500 text-sm font-medium flex items-center gap-1.5 mt-1">
                      <MapPin size={14} /> {selectedEventDetail.room}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-slate-200 border-2 border-white shadow-sm">
                       <img src={isTeacherSchedule ? imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(classNameTitle || "Professeur")}&background=random` : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedEventDetail.teacherName?.trim() || getTeacherNameForSubject(selectedEventDetail.title, teachersList))}&background=random`} alt="Professeur" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Professeur</p>
                      <p className="text-slate-900 font-bold text-[15px]">
                        {isTeacherSchedule ? (classNameTitle || "Sarah Dubois") : (selectedEventDetail.teacherName?.trim() || getTeacherNameForSubject(selectedEventDetail.title, teachersList))}
                      </p>
                    </div>
                  </div>
                  <div className="h-px w-full bg-slate-200/60" />
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full shrink-0 bg-blue-50 text-blue-500 flex items-center justify-center border-2 border-white shadow-sm">
                      <span className="font-bold text-sm">{(storedTimeSlots[selectedEventDetail.start] || '').split('h')[0]}h</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">Horaire</p>
                      <p className="text-slate-900 font-bold text-[15px]">
                        {selectedEventDetail.customTime || `${(storedTimeSlots[selectedEventDetail.start] || '').split(' - ')[0] || ''} - ${(storedTimeSlots[Math.min(selectedEventDetail.start + selectedEventDetail.duration - 1, storedTimeSlots.length - 1)] || '').split(' - ')[1] || ''}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={async () => {
                       setNotifEnabled(true);
                       localStorage.setItem('course_notifications_enabled', 'true');
                       const timeSlots = getStoredTimeSlots();
                       const slotTime = selectedEventDetail.customTime || `${(storedTimeSlots[selectedEventDetail.start] || '').split(' - ')[0] || ''} - ${(storedTimeSlots[Math.min(selectedEventDetail.start + selectedEventDetail.duration - 1, storedTimeSlots.length - 1)] || '').split(' - ')[1] || ''}`;
                       
                       // 1. Envoi immédiat en temps réel (Capacitor Android + PWA iOS)
                       const res = await triggerImmediateCourseReminder(selectedEventDetail, slotTime);

                       // 2. Programmation des notifications récurrentes
                       await scheduleCourseNotifications(events, timeSlots);

                       setToast({ 
                         title: res.success ? "🔔 Rappel activé en temps réel" : "⚠️ Permissions requises", 
                         body: res.message || `Vous recevrez une notification pour le cours de ${selectedEventDetail.title}.` 
                       });
                       setSelectedEventDetail(null);
                    }}
                    className="flex-1 bg-emerald-50 text-emerald-600 font-bold py-3.5 rounded-xl border border-emerald-100 flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
                  >
                    <Bell size={18} />
                    Me rappeler
                  </button>
                  
                  {!readOnly && (
                    <button 
                      onClick={() => {
                        const evt = selectedEventDetail;
                        setSelectedEventDetail(null);
                        onEventClick(evt);
                      }}
                      className="flex-1 bg-[#1e231d] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-colors"
                    >
                      Modifier
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 left-4 right-4 z-[300] bg-slate-900/95 backdrop-blur-xl text-white p-4 rounded-2xl shadow-2xl border border-white/20 flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Bell size={20} />
            </div>
            <div className="flex-1 text-sm">
              <h4 className="font-bold text-white text-[15px] mb-0.5">{toast.title}</h4>
              <p className="text-slate-300 text-[13px] leading-snug">{toast.body}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLevel1User ? (
          <motion.button 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleToggleNotifications}
            title={notifEnabled ? "Rappels activés" : "Activer les rappels de cours"}
            className={`absolute bottom-8 right-6 w-14 h-14 rounded-2xl flex items-center justify-center text-white z-[250] transition-all duration-300 ${
              notifEnabled 
                ? 'bg-emerald-600 shadow-[0_8px_25px_rgba(16,185,129,0.45)] ring-4 ring-emerald-300/40' 
                : 'bg-[#5C7CFA] shadow-[0_8px_20px_rgba(92,124,250,0.35)]'
            }`}
          >
            <div className="relative">
              <Bell size={24} className={notifEnabled ? 'animate-bounce' : ''} strokeWidth={2.2} />
              {notifEnabled && (
                <span className="absolute -top-1 -right-1.5 bg-white text-emerald-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black shadow-sm">
                  ✓
                </span>
              )}
            </div>
          </motion.button>
        ) : (
          isExpanded && !readOnly && (
            <motion.button 
              initial={{ scale: 0, opacity: 0, paddingBottom: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => onEmptySlotClick(selectedDayIndex, 0)} // Default to 8h00
              className="absolute bottom-8 right-6 w-14 h-14 bg-[#5C7CFA] rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(92,124,250,0.35)] text-white z-[250]"
            >
              <Plus size={24} strokeWidth={2.5} />
            </motion.button>
          )
        )}
      </AnimatePresence>
    </motion.div>
  );
};
