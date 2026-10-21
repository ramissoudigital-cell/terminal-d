import React, { useState } from 'react';
import { Menu, Plus, ChevronLeft, Bell } from 'lucide-react';
import { DailyScheduleView } from './DailyScheduleView';
import { AnimatePresence } from 'motion/react';

interface CalendarViewProps {
  onBack: () => void;
  mode?: 'personal' | 'freelancer';
}


const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

const generateCalendarData = (numMonths = 12) => {
  const data = [];
  const today = new Date();
  
  for (let i = 0; i < numMonths; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDayOfWeek = d.getDay(); // 0 is Sunday
    
    // Add some realistic looking dots randomly for demonstration
    const dots = [];
    if (Math.random() > 0.3) dots.push(4);
    if (Math.random() > 0.3) dots.push(11);
    if (Math.random() > 0.3) dots.push(18);
    if (Math.random() > 0.3) dots.push(26);
    
    const showYear = (i === 0) || (month === 0);
    
    let selectedDate = null;
    if (i === 0) {
      selectedDate = today.getDate();
    }
    
    data.push({
      month: monthNames[month],
      year: year.toString(),
      showYear,
      daysInMonth,
      startDayOfWeek,
      dots,
      selectedDate
    });
  }
  
  return data;
};

const daysOfWeek = ['DIM', 'LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM'];

export const CalendarView: React.FC<CalendarViewProps> = ({ onBack, mode = 'personal' }) => {
  const [showDailyView, setShowDailyView] = useState(false);
  const [calendarData] = useState(() => generateCalendarData(12));
  const currentYear = new Date().getFullYear();

  return (
    <>
      <div className="absolute inset-0 z-[100] h-full bg-[#4A90E2] overflow-y-auto hide-scrollbar font-sans text-white">
      {/* Header */}
      <div className="pt-14 px-6 flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-start text-blue-100 hover:text-white transition-colors"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <span className="text-[15px] font-medium text-white tracking-wide">{currentYear}</span>
        <button className="w-10 h-10 flex items-center justify-end text-blue-100 hover:text-white transition-colors">
          {mode === 'freelancer' ? <Bell size={20} strokeWidth={2} /> : <Plus size={20} strokeWidth={2} />}
        </button>
      </div>

      <div className="px-6 flex flex-col gap-10 pb-12">
        {calendarData.map((monthData, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="flex items-baseline gap-2 mb-6">
              <h2 className="text-[26px] font-light text-white tracking-wide">{monthData.month}</h2>
              {monthData.showYear && (
                <span className="text-[14px] font-medium text-blue-200">{monthData.year}</span>
              )}
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 mb-4">
              {daysOfWeek.map((day, i) => (
                <div key={i} className="text-center text-[10px] font-bold text-blue-200 tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-y-4">
              {/* Empty slots for start of month */}
              {Array.from({ length: monthData.startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10 text-center"></div>
              ))}

              {/* Days */}
              {Array.from({ length: monthData.daysInMonth }).map((_, i) => {
                const dayCounter = i + 1;
                const isSelected = dayCounter === monthData.selectedDate;
                const hasDot = monthData.dots.includes(dayCounter);

                return (
                  <div key={dayCounter} className="flex flex-col items-center justify-start h-11 relative">
                    <div 
                      onClick={() => setShowDailyView(true)}
                      className={`w-[34px] h-[34px] flex items-center justify-center rounded-full text-[15px] font-medium
                        ${isSelected ? 'bg-white text-[#4A90E2] shadow-[0_4px_12px_rgba(0,0,0,0.1)]' : 'text-white/90 hover:bg-white/10 cursor-pointer transition-colors'}
                      `}
                    >
                      {dayCounter}
                    </div>
                    {hasDot && (
                      <div className="w-[3px] h-[3px] rounded-full bg-white absolute bottom-[2px]"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      </div>
      <AnimatePresence>
        {showDailyView && <DailyScheduleView onBack={() => setShowDailyView(false)} mode={mode} />}
      </AnimatePresence>
    </>
  );
};
