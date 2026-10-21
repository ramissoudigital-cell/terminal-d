import React, { useState } from 'react';
import { Plus, ChevronLeft, Bell, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CreateEventView } from './CreateEventView';

interface DailyScheduleViewProps {
  onBack: () => void;
  mode?: 'personal' | 'freelancer';
}

export const DailyScheduleView: React.FC<DailyScheduleViewProps> = ({ onBack, mode = 'personal' }) => {
  const [selectedDay, setSelectedDay] = useState(19);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleActionClick = () => {
    if (mode === 'freelancer') {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else {
      setShowCreateEvent(true);
    }
  };

  const getEventsForDay = (day: number) => {
    if (day === 19) {
      return (
        <div className="relative pt-2">
          {/* 08:00 Block */}
          <div className="h-[96px] relative flex">
            <div className="w-[54px] flex-shrink-0 text-[13px] font-bold text-[#3B415A] pr-4 h-full">
              08.00
            </div>
            {/* Ticks */}
            <div className="absolute left-[45px] top-[24px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[48px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[72px] text-[#DCE0EA] font-thin text-[10px]">-</div>

            {/* Event at 08.00 */}
            <div className="flex-1 pl-4 z-10">
                <div className="bg-[#FFF8F3] rounded-r-2xl border-l-[3px] border-[#FFA96A] p-[18px] relative top-4">
                  <div className="flex items-center gap-2 mb-[6px]">
                    <div className="w-1 h-1 rounded-full bg-[#FFA96A]"></div>
                    <h3 className="text-[#3B415A] font-bold text-[15px]">{mode === 'freelancer' ? 'Occupé' : 'Conférence de Design'}</h3>
                  </div>
                  <p className="text-[#9BA5B7] text-[13px] font-medium ml-3 mb-4">{mode === 'freelancer' ? 'Indisponible' : 'Salle de Conférence'}</p>
                  <div className="flex -space-x-[10px] ml-3">
                    <img src="https://i.pravatar.cc/150?u=12" alt="Avatar" className="w-[28px] h-[28px] rounded-full border-2 border-white object-cover" />
                    <img src="https://i.pravatar.cc/150?u=13" alt="Avatar" className="w-[28px] h-[28px] rounded-full border-2 border-white object-cover" />
                    <img src="https://i.pravatar.cc/150?u=14" alt="Avatar" className="w-[28px] h-[28px] rounded-full border-2 border-white object-cover" />
                  </div>
                </div>
            </div>
          </div>

          {/* 09:00 Block */}
          <div className="h-[96px] relative flex">
            <div className="w-[54px] flex-shrink-0 text-[13px] font-bold text-[#3B415A] pr-4 pt-2">
              09.00
            </div>
            {/* Ticks */}
            <div className="absolute left-[45px] top-[32px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[56px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[80px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            
            {/* Event spilling from 08:00 takes up part of this space, leaving empty below it */}
          </div>

          {/* 10:00 Block */}
          <div className="h-[96px] relative flex z-10">
            <div className="w-[54px] flex-shrink-0 text-[13px] font-bold text-[#3B415A] pr-4 pt-2">
              10.00
            </div>
            {/* Ticks */}
            <div className="absolute left-[45px] top-[32px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[56px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[80px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            
            <div className="flex-1 pl-4 mb-2">
                {/* Event spans 10.00 to approx 11.30 */}
                <div className="bg-[#f0f5ff] rounded-r-2xl border-l-[3px] border-[#6688FC] p-[18px] flex justify-between items-start h-[130px] mt-2">
                  <div>
                    <div className="flex items-center gap-2 mb-[6px]">
                      <div className="w-1 h-1 rounded-full bg-[#6688FC]"></div>
                      <h3 className="text-[#3B415A] font-bold text-[15px]">{mode === 'freelancer' ? 'Occupé' : 'Réunion Renumics'}</h3>
                    </div>
                    <p className="text-[#9BA5B7] text-[13px] font-medium ml-3 mb-4">{mode === 'freelancer' ? 'Indisponible' : 'Salle de Réunion A2'}</p>
                    <div className="flex -space-x-[10px] ml-3">
                      <img src="https://i.pravatar.cc/150?u=41" alt="Avatar" className="w-[28px] h-[28px] rounded-full border-2 border-white object-cover" />
                      <img src="https://i.pravatar.cc/150?u=42" alt="Avatar" className="w-[28px] h-[28px] rounded-full border-2 border-white object-cover" />
                    </div>
                  </div>
                  <button className="text-[#6688FC] p-[2px] transition hover:opacity-80">
                    <Bell size={18} strokeWidth={2.5} />
                  </button>
                </div>
            </div>
          </div>

          {/* 11:00 Block */}
          <div className="h-[96px] relative flex">
            <div className="w-[54px] flex-shrink-0 text-[13px] font-bold text-[#3B415A] pr-4 pt-2">
              11.00
            </div>
            {/* Ticks */}
            <div className="absolute left-[45px] top-[32px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[56px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[80px] text-[#DCE0EA] font-thin text-[10px]">-</div>
          </div>

          {/* 12:00 Block */}
          <div className="h-[96px] relative flex">
            <div className="w-[54px] flex-shrink-0 text-[13px] font-bold text-[#3B415A] pr-4 pt-2">
              12.00
            </div>
            {/* Ticks */}
            <div className="absolute left-[45px] top-[32px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[56px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[80px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            
            <div className="flex-1 pl-4 z-10 w-full mb-4">
              {/* Hatched background effect */}
              <div className="rounded-r-2xl border-l-[3px] border-[#DCE0EA] p-[18px] relative overflow-hidden h-[78px] flex items-center mt-2 group" style={{
                background: 'repeating-linear-gradient( 135deg, #F3F5FA, #F3F5FA 3px, #ffffff 3px, #ffffff 8px )'
              }}>
                <div className="absolute inset-0 border border-[#F3F5FA] rounded-r-2xl pointer-events-none"></div>
                <div className="flex items-center gap-2 relative z-10 -mt-2">
                  <div className="w-1 h-1 rounded-full bg-[#9BA5B7]"></div>
                  <h3 className="text-[#3B415A] font-bold text-[15px]">Pause Déjeuner</h3>
                </div>
              </div>
            </div>
          </div>

          {/* 13:00 Block */}
          <div className="h-[96px] relative flex">
            <div className="w-[54px] flex-shrink-0 text-[13px] font-bold text-[#3B415A] pr-4 pt-2">
              13.00
            </div>
            {/* Ticks */}
            <div className="absolute left-[45px] top-[32px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[56px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[80px] text-[#DCE0EA] font-thin text-[10px]">-</div>

            <div className="flex-1 pl-4 z-10">
                <div className="bg-[#fff2f9] rounded-r-2xl border-l-[3px] border-[#ee57b3] p-[18px] mt-4 min-h-[90px]">
                  <div className="flex items-center gap-2 mb-[6px]">
                    <div className="w-1 h-1 rounded-full bg-[#ee57b3]"></div>
                    <h3 className="text-[#3B415A] font-bold text-[15px]">{mode === 'freelancer' ? 'Occupé' : 'Entraînement'}</h3>
                  </div>
                  <p className="text-[#9BA5B7] text-[13px] font-medium ml-3">{mode === 'freelancer' ? 'Indisponible' : 'Centre de Gym Zapp'}</p>
                </div>
            </div>
          </div>

          {/* 14:00 Block */}
          <div className="h-[48px] relative flex">
            <div className="w-[54px] flex-shrink-0 text-[13px] font-bold text-[#3B415A] pr-4 pt-2">
              14.00
            </div>
          </div>

        </div>
      );
    }

    if (day === 20) {
      return (
        <div className="relative pt-2">
          {/* 08:00 Block */}
          <div className="h-[96px] relative flex">
            <div className="w-[54px] flex-shrink-0 text-[13px] font-bold text-[#3B415A] pr-4 h-full">
              08.00
            </div>
            {/* Ticks */}
            <div className="absolute left-[45px] top-[24px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[48px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[72px] text-[#DCE0EA] font-thin text-[10px]">-</div>

            {/* Event at 08.00 */}
            <div className="flex-1 pl-4 z-10 mb-2">
                <div className="bg-[#f2faf7] rounded-r-2xl border-l-[3px] border-[#36C495] p-[18px] relative top-4">
                  <div className="flex items-center gap-2 mb-[6px]">
                    <div className="w-1 h-1 rounded-full bg-[#36C495]"></div>
                    <h3 className="text-[#3B415A] font-bold text-[15px]">{mode === 'freelancer' ? 'Occupé' : 'Entretien avec Pika'}</h3>
                  </div>
                  <p className="text-[#9BA5B7] text-[13px] font-medium ml-3 mb-4">{mode === 'freelancer' ? 'Indisponible' : 'Espace de travail Estuary'}</p>
                  <div className="flex -space-x-[10px] ml-3">
                    <img src="https://i.pravatar.cc/150?u=19" alt="Avatar" className="w-[28px] h-[28px] rounded-full border-2 border-white object-cover" />
                  </div>
                </div>
            </div>
          </div>

          {/* 09:00 Block */}
          <div className="h-[96px] relative flex">
            <div className="w-[54px] flex-shrink-0 text-[13px] font-bold text-[#3B415A] pr-4 pt-2">
              09.00
            </div>
            {/* Ticks */}
            <div className="absolute left-[45px] top-[32px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[56px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[80px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            
            {/* Event at 09.00 */}
            <div className="flex-1 pl-4 z-10 opacity-60">
                <div className="bg-[#FFF8F3] rounded-r-2xl border-l-[3px] border-[#FFA96A] p-[18px] relative top-4">
                  <div className="flex items-center gap-2 mb-[6px]">
                    <div className="w-1 h-1 rounded-full bg-[#FFA96A]"></div>
                    <h3 className="text-[#3B415A] font-bold text-[15px]">Manoo Consulting</h3>
                  </div>
                  <p className="text-[#9BA5B7] text-[13px] font-medium ml-3 mb-4">Salle de Réunion A1</p>
                  <div className="flex -space-x-[10px] ml-3">
                    <img src="https://i.pravatar.cc/150?u=22" alt="Avatar" className="w-[28px] h-[28px] rounded-full border-2 border-white object-cover" />
                    <img src="https://i.pravatar.cc/150?u=23" alt="Avatar" className="w-[28px] h-[28px] rounded-full border-2 border-white object-cover" />
                  </div>
                </div>
            </div>
          </div>

          {/* 10:00 Block */}
          <div className="h-[96px] relative flex z-10">
            <div className="w-[54px] flex-shrink-0 text-[13px] font-bold text-[#3B415A] pr-4 pt-2">
              10.00
            </div>
            {/* Ticks */}
            <div className="absolute left-[45px] top-[32px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[56px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[80px] text-[#DCE0EA] font-thin text-[10px]">-</div>
          </div>

          {/* 11:00 Block */}
          <div className="h-[96px] relative flex">
            <div className="w-[54px] flex-shrink-0 text-[13px] font-bold text-[#3B415A] pr-4 pt-2">
              11.00
            </div>
            {/* Ticks */}
            <div className="absolute left-[45px] top-[32px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[56px] text-[#DCE0EA] font-thin text-[10px]">-</div>
            <div className="absolute left-[45px] top-[80px] text-[#DCE0EA] font-thin text-[10px]">-</div>
          </div>
        </div>
      );
    }
  };

  const getDayClass = (day: number) => {
    return selectedDay === day
      ? "flex flex-col items-center justify-start bg-white rounded-full w-[46px] h-[82px] pt-[14px] shadow-[0_8px_20px_rgba(0,0,0,0.1)] absolute z-10 transition-all duration-300 transform -translate-y-3"
      : "flex flex-col items-center gap-3 cursor-pointer pt-3 transition-all duration-300";
  };

  const getDayTextClass = (day: number, isLabel: boolean = false) => {
    if (selectedDay === day) {
      return isLabel ? "text-[10px] font-bold text-[#4A90E2] mb-2" : "text-[16px] font-bold text-[#4A90E2] mb-[10px]";
    }
    return isLabel ? "text-[10px] font-bold text-blue-200 tracking-wider" : "text-[14px] font-medium text-white/90";
  };

  return (
    <motion.div 
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-[200] h-full bg-[#4A90E2] overflow-hidden flex flex-col font-sans"
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
        <div className="pt-14 px-6 flex flex-shrink-0 items-center justify-between mb-8">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-start text-blue-100 hover:text-white transition-colors pointer-events-auto -ml-2">
            <ChevronLeft size={26} strokeWidth={2.5} />
          </button>
          <span className="text-[17px] font-medium text-white tracking-wide">2019</span>
          <button 
            onClick={handleActionClick}
            className="w-10 h-10 flex items-center justify-end text-blue-100 hover:text-white transition-colors pointer-events-auto"
          >
            {mode === 'freelancer' ? <Bell size={22} strokeWidth={2} /> : <Plus size={22} strokeWidth={2} />}
          </button>
        </div>

        {/* Month Strip */}
        <div className="flex justify-center items-center gap-7 mb-8 px-6 text-white overflow-hidden whitespace-nowrap">
          <span className="text-[18px] font-medium text-blue-200 opacity-80">Novembre</span>
          <span className="text-[26px] font-bold text-white relative bottom-0.5">
            Décembre
          </span>
          <span className="text-[18px] font-medium text-blue-200 opacity-80">Janvier</span>
          <span className="text-[18px] font-medium text-blue-200 opacity-80 hidden sm:block">Février</span>
        </div>

        {/* Week Strip */}
        <div className="px-6 mb-12 flex justify-between items-start text-center relative max-w-sm mx-auto w-full">
          {[{ dayName: 'DIM', num: 15 }, { dayName: 'LUN', num: 16 }, { dayName: 'MAR', num: 17 }, { dayName: 'MER', num: 18 }, { dayName: 'JEU', num: 19 }, { dayName: 'VEN', num: 20 }, { dayName: 'SAM', num: 21 }].map((d) => (
            <div key={d.num} className={getDayClass(d.num)} onClick={() => setSelectedDay(d.num)}>
              <span className={getDayTextClass(d.num, true)}>{d.dayName}</span>
              <span className={getDayTextClass(d.num, false)}>{d.num}</span>
              <div className={`w-1 h-1 rounded-full ${selectedDay === d.num ? 'bg-[#4A90E2] mt-auto mb-[14px]' : 'bg-transparent mt-[2px]'}`}></div>
            </div>
          ))}
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
          className="w-full flex justify-center pt-5 pb-5 bg-white relative z-20 cursor-grab active:cursor-grabbing"
        >
          <div className="w-9 h-[4px] bg-[#E1E5F1] rounded-full pointer-events-none"></div>
        </motion.div>

        <div className="flex-1 overflow-y-auto px-6 relative pb-[100px] custom-scrollbar">
          
          <div className="relative">
            {/* The vertical dashed/grey line running down */}
            <div className="absolute left-[54px] top-2 bottom-0 w-px bg-transparent border-l border-dashed border-[#dcdfe9] z-0"></div>

            {/* Current time line */}
            <div className="absolute left-[54px] right-0 top-[152px] flex items-center z-20 -translate-y-1/2">
                <div className="absolute -left-1 w-[9px] h-[9px] rounded-full bg-[#5C7CFA] ring-4 ring-white"></div>
                <div className="w-full h-px bg-[#5C7CFA] opacity-30"></div>
            </div>

            {/* Timetable grid setup */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDay}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {getEventsForDay(selectedDay) || (
                  <div className="relative pt-2 text-center text-gray-400 mt-10 font-medium">Aucun événement pour ce jour.</div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.button 
            initial={{ scale: 0, opacity: 0, paddingBottom: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleActionClick}
            className="absolute bottom-8 right-6 w-14 h-14 bg-[#5C7CFA] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(92,124,250,0.35)] text-white z-[250]"
          >
            {mode === 'freelancer' ? <Bell size={24} strokeWidth={2.5} /> : <Plus size={24} strokeWidth={2.5} />}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[300] bg-[#262F44] text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-lg whitespace-nowrap"
          >
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check size={14} className="text-green-400" />
            </div>
            <span className="text-[14px] font-medium tracking-wide">Vous serez notifié lorsqu'il sera libre</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateEvent && <CreateEventView onBack={() => setShowCreateEvent(false)} />}
      </AnimatePresence>
    </motion.div>
  );
};
