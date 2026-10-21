import React from "react";
import { motion } from "motion/react";
import {
  HelpCircle,
  Utensils,
  X,
  Coins,
  CreditCard,
  Sparkles,
  CircleDollarSign,
  Smile,
  ChevronLeft,
} from "lucide-react";

interface ExpensesViewProps {
  onBack: () => void;
  onNavigateNotifications?: () => void;
  onNavigateBalance?: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  onBack,
  onNavigateBalance,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 z-[200] bg-[#F4F5F7] overflow-y-auto hide-scrollbar font-sans flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-16 pb-4 shrink-0">
        <button className="bg-[#4A90E2] text-white font-semibold text-sm px-5 py-2.5 rounded-full active:scale-95 transition-transform shadow-sm">
          Recevoir
        </button>
        <span className="text-[#1A1A1A] font-extrabold text-[22px] tracking-tight">
          taskup
        </span>
        <button className="bg-white p-2.5 rounded-full shadow-sm text-black active:scale-95 transition-transform border border-gray-100">
          <HelpCircle size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-32 hide-scrollbar">
        {/* Main Chart Card */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mb-6 mt-2 relative">
          <div className="text-center mb-8">
            <span className="text-[#1A1A1A] font-semibold text-[15px]">
              Juin 2022 - Juin 2023
            </span>
          </div>

          {/* Circular Chart */}
          <div className="relative w-64 h-64 mx-auto mb-8 flex items-center justify-center">
            {/* SVG Ring (Blue instead of Green) */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              {/* Active track */}
              <circle
                cx="128"
                cy="128"
                r="120"
                fill="none"
                stroke="#4A90E2"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="753.6"
                strokeDashoffset="90"
                style={{
                  transformOrigin: "center",
                  transform: "rotate(20deg)",
                }}
              />
            </svg>

            {/* Gap Cover / Close button */}
            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 flex flex-col items-center justify-center">
              <div className="bg-white w-16 h-8 -mb-4"></div>
              <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#888891] active:scale-90 transition-transform">
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Inner Content */}
            <div className="flex flex-col items-center justify-center z-10 w-[180px] h-[180px] bg-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-gray-50/50">
              <Utensils
                size={24}
                className="text-[#5F6368] mb-2"
                strokeWidth={2}
              />
              <div className="flex items-baseline mb-1">
                <span className="text-[#1A1A1A] text-[34px] font-medium tracking-tight leading-none">
                  $9,100
                </span>
                <span className="text-[#888891] text-[20px] font-medium leading-none ml-[2px]">
                  .51
                </span>
              </div>
              <span className="text-[#888891] text-[13px] font-medium mt-1">
                Restaurants
              </span>
            </div>
          </div>

          {/* Time Selector */}
          <div className="flex justify-between items-center gap-3 mt-4 mb-2">
            <button className="flex-1 bg-[#F5F5F7] text-[#1A1A1A] font-medium text-[15px] py-3.5 rounded-[20px] transition-colors">
              Semaine
            </button>
            <button className="flex-1 bg-[#F5F5F7] text-[#1A1A1A] font-medium text-[15px] py-3.5 rounded-[20px] transition-colors">
              Mois
            </button>
            <button className="flex-1 bg-[#1A1A1A] text-white font-medium text-[15px] py-3.5 rounded-[20px] shadow-md transition-colors">
              Année
            </button>
          </div>
        </div>

        {/* Cash back credit Card */}
        <div className="bg-white rounded-[24px] p-5 flex items-center justify-between shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="bg-transparent flex items-center justify-center">
              <Coins size={24} className="text-[#1A1A1A]" strokeWidth={2} />
            </div>
            <span className="text-[#1A1A1A] font-semibold text-[16px]">
              Crédit Cash back
            </span>
          </div>
          <div className="flex items-baseline">
            <span className="text-[#1A1A1A] text-[16px] font-bold tracking-tight">
              +$1,100
            </span>
            <span className="text-[#A0A0A0] text-[12px] font-bold ml-[1px]">
              .00
            </span>
          </div>
        </div>
      </div>

      {/* Custom Bottom Nav */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#F4F5F7] pb-8 pt-4 px-6 flex justify-between items-center z-50">
        <div
          className="flex flex-col items-center gap-1.5 cursor-pointer opacity-40"
          onClick={onNavigateBalance}
        >
          <CreditCard size={24} strokeWidth={2.5} />
          <span className="text-[10px] font-bold tracking-wide">Carte</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 cursor-pointer opacity-40">
          <Sparkles size={24} strokeWidth={2.5} />
          <span className="text-[10px] font-bold tracking-wide">
            Récompenses
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5 cursor-pointer opacity-100 text-[#1A1A1A]">
          <CircleDollarSign
            size={24}
            strokeWidth={2.5}
            fill="#1A1A1A"
            color="white"
          />
          <span className="text-[10px] font-bold tracking-wide">Dépenses</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 cursor-pointer opacity-40">
          <Smile size={24} strokeWidth={2.5} />
          <span className="text-[10px] font-bold tracking-wide">Profil</span>
        </div>
      </div>
    </motion.div>
  );
};
