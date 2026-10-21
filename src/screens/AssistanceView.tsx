import React from 'react';
import { ChevronLeft, Grid, Paperclip, Send, PenSquare, Play, Flame } from 'lucide-react';

interface AssistanceViewProps {
  onBack: () => void;
}

export const AssistanceView: React.FC<AssistanceViewProps> = ({ onBack }) => {
  return (
    <div className="absolute inset-0 z-[100] h-full bg-[#FDFDFE] overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <div className="pt-14 px-6 flex items-center justify-between pb-6">
        <button 
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-start text-[#131336] transition-opacity active:opacity-50"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
        <button className="w-10 h-10 flex items-center justify-end text-[#131336] transition-opacity active:opacity-50">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="2" fill="currentColor"/>
            <circle cx="15" cy="9" r="2" fill="currentColor"/>
            <circle cx="9" cy="15" r="2" fill="currentColor"/>
            <circle cx="15" cy="15" r="2" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div className="px-6 flex-1 overflow-y-auto hide-scrollbar flex flex-col pb-36">
        {/* Title Section */}
        <h1 className="text-[32px] font-bold text-[#131336] leading-tight mb-2 tracking-tight">We need support</h1>
        <p className="text-[14px] text-[#808092] mb-8 font-medium">This is the very begining of your legendary story</p>

        {/* Members Section */}
        <h2 className="text-[16px] font-semibold text-[#131336] mb-4">Members</h2>
        <div className="flex flex-row items-center mb-10">
          <div className="flex -space-x-3">
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80" className="relative z-40 w-11 h-11 rounded-full border-[2.5px] border-[#FDFDFE] object-cover shadow-sm" alt="Member" />
            <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80" className="relative z-30 w-11 h-11 rounded-full border-[2.5px] border-[#FDFDFE] object-cover shadow-sm bg-yellow-100" alt="Member" />
            <img src="https://images.unsplash.com/photo-1590031905470-a1a1feacbb0b?auto=format&fit=crop&q=80" className="relative z-20 w-11 h-11 rounded-full border-[2.5px] border-[#FDFDFE] object-cover shadow-sm bg-orange-100" alt="Member" />
            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80" className="relative z-10 w-11 h-11 rounded-full border-[2.5px] border-[#FDFDFE] object-cover shadow-sm bg-teal-900" alt="Member" />
            
            <div className="relative z-0 w-11 h-11 rounded-full bg-[#EAF7F3] flex items-center justify-center text-[#218F76] font-bold border-[1.5px] border-dashed border-[#A0D8CB] shadow-sm ml-2">
              <span className="text-[13px] tracking-tight">+12</span>
            </div>
          </div>
        </div>

        {/* Chat Timeline */}
        <div className="flex flex-col gap-6 w-full">
          {/* Audio Message (Left) */}
          <div className="flex gap-4 w-full justify-start items-start">
            <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80" className="w-[48px] h-[48px] rounded-[16px] object-cover shrink-0 shadow-sm mt-1 bg-pink-100" alt="Sender" />
            <div className="flex flex-col gap-1 items-end max-w-[75%]">
              <div className="bg-white rounded-[20px] rounded-tl-[6px] p-2.5 pr-5 shadow-[0_4px_25px_rgba(0,0,0,0.04)] flex items-center gap-4 h-[60px] min-w-[210px]">
                <div className="w-[38px] h-[38px] rounded-full bg-[#F4F3FF] flex items-center justify-center text-[#826BF0] shrink-0 ml-1">
                  <Play size={16} fill="currentColor" className="ml-0.5" />
                </div>
                <div className="flex items-center gap-[3px] h-6 flex-1 px-1">
                  <div className="w-[3px] h-3 bg-[#131336] rounded-full"></div>
                  <div className="w-[3px] h-5 bg-[#131336] rounded-full"></div>
                  <div className="w-[3px] h-[10px] bg-[#131336] rounded-full"></div>
                  <div className="w-[3px] h-3 bg-[#131336] rounded-full"></div>
                  <div className="w-[3px] h-[22px] bg-[#131336] rounded-full"></div>
                  <div className="w-[3px] h-[14px] bg-[#131336] rounded-full"></div>
                  <div className="w-[3px] h-[18px] bg-[#131336] rounded-full"></div>
                  <div className="w-[3px] h-[10px] bg-[#131336] rounded-full"></div>
                  <div className="w-[3px] h-[14px] bg-[#131336] rounded-full"></div>
                </div>
                <span className="text-[13px] font-bold text-[#131336]">1.29</span>
              </div>
              <span className="text-[11px] font-medium text-[#A6A6B4] mr-2">Nov 23, 2022</span>
            </div>
          </div>

          {/* Text Message (Right) */}
          <div className="flex gap-4 w-full justify-end items-start mt-2">
            <div className="flex flex-col gap-1 items-start max-w-[75%]">
              <div className="bg-[#050522] text-white rounded-[20px] rounded-br-[6px] p-4 px-5 shadow-[0_8px_30px_rgba(5,5,34,0.12)]">
                <p className="text-[14px] font-normal leading-relaxed">Yep, Its complete! People love this work</p>
              </div>
              <span className="text-[11px] font-medium text-[#A6A6B4] ml-2 mt-1">Nov 23, 2022</span>
            </div>
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80" className="w-[48px] h-[48px] rounded-[16px] object-cover shrink-0 shadow-sm mt-1 bg-pink-100" alt="Me" />
          </div>

          {/* Text Message (Left) */}
          <div className="flex gap-4 w-full justify-start items-start mt-2">
            <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80" className="w-[48px] h-[48px] rounded-[16px] object-cover shrink-0 shadow-sm mt-1 bg-pink-100" alt="Sender" />
            <div className="flex flex-col gap-1 items-end max-w-[75%]">
              <div className="bg-white rounded-[20px] rounded-tl-[6px] p-4 px-5 shadow-[0_4px_25px_rgba(0,0,0,0.04)]">
                 <p className="text-[14px] text-[#131336] font-normal leading-relaxed">We need to know it , because its about community.</p>
              </div>
              <span className="text-[11px] font-medium text-[#A6A6B4] mr-2 mt-1">Nov 23, 2022</span>
            </div>
          </div>

          {/* Text Message (Right) */}
          <div className="flex gap-4 w-full justify-end items-start mt-2">
            <div className="flex flex-col gap-1 items-start max-w-[75%]">
              <div className="bg-[#050522] text-white rounded-[20px] rounded-br-[6px] p-4 px-5 shadow-[0_8px_30px_rgba(5,5,34,0.12)]">
                <p className="text-[14px] font-normal leading-relaxed">Of course, Check inbox !</p>
              </div>
              <span className="text-[11px] font-medium text-[#A6A6B4] ml-2 mt-1">Nov 23, 2022</span>
            </div>
            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80" className="w-[48px] h-[48px] rounded-[16px] object-cover shrink-0 shadow-sm mt-1 bg-pink-100" alt="Me" />
          </div>

          {/* Typing indicator */}
          <div className="flex items-center gap-2 mt-2 ml-2 pb-2">
            <PenSquare size={14} className="text-[#131336]" strokeWidth={2.5} />
            <span className="text-[14px] font-medium text-[#131336] opacity-90 italic">Liza is typing ...</span>
          </div>
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="absolute inset-x-0 bottom-0 px-6 pb-8 pt-12 bg-gradient-to-t from-[#FDFDFE] via-[#FDFDFE] to-transparent pointer-events-none">
        <div className="bg-white rounded-[24px] h-[72px] flex items-center justify-between px-3 shadow-[0_15px_45px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 pointer-events-auto">
          <button className="w-12 h-12 flex items-center justify-center text-[#131336] hover:bg-gray-50 rounded-xl transition-colors ml-1">
            <Paperclip size={20} className="-rotate-45" />
          </button>
          
          <input 
            type="text" 
            placeholder="Write here ..." 
            className="flex-1 bg-transparent text-[15px] outline-none placeholder-[#A6A6B4] px-2 text-[#131336] font-medium h-full"
          />
          
          <button className="w-12 h-12 rounded-full border-[1.5px] border-gray-100 flex items-center justify-center text-[#131336] hover:bg-gray-50 shadow-sm transition-all mr-1 relative">
            <Send size={18} className="translate-x-[1px] translate-y-[1px]" />
          </button>
        </div>
      </div>
    </div>
  );
};
