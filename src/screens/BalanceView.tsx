import React, { useState } from "react";
import { motion } from "motion/react";
import { HelpCircle, ChevronRight, CreditCard, Gem, Sparkles, CircleDollarSign, Smile, ChevronLeft } from "lucide-react";

interface BalanceViewProps {
  onBack: () => void;
  onNavigateExpenses?: () => void;
  onNavigateNotifications?: () => void;
}

export const BalanceView: React.FC<BalanceViewProps> = ({ onBack, onNavigateExpenses }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="absolute inset-0 z-[100] w-full h-full bg-[#F4F5F7] flex flex-col overflow-hidden font-sans"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-16 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full border border-gray-100 bg-white flex items-center justify-center text-[#1A1A1A] shadow-sm transform active:scale-95 transition-all"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button
            className="bg-[#4A90E2] text-white font-semibold text-sm px-5 py-2.5 rounded-full active:scale-95 transition-transform"
          >
            Recharger
          </button>
        </div>
        <span className="text-[#888891] font-semibold text-[15px]">Carte</span>
        <button className="bg-white p-2.5 rounded-full shadow-sm border border-gray-100 text-[#1A1A1A] active:scale-95 transition-transform">
          <HelpCircle size={20} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-24 hide-scrollbar">
        {/* Balance Card Section */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mb-4 mt-2">
          <div className="flex flex-wrap items-center justify-between mb-8 gap-y-2">
            <div className="flex items-baseline">
              <span className="text-[40px] font-medium text-[#1A1A1A] tracking-tight leading-none">
                $7,000
              </span>
              <span className="text-[20px] font-medium text-[#1A1A1A] leading-none ml-1">
                .00
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-[1px] bg-gray-200"></div>
              <span className="text-[#888891] text-xs font-semibold whitespace-nowrap">
                Solde Carte
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-auto pt-4">
            <span className="text-[#1A1A1A] font-semibold text-sm">
              $7,000.00{" "}
              <span className="text-[#888891] font-medium ml-1">Disponible</span>
            </span>

            {/* Mini Vital Card */}
            <div className="w-[72px] h-[46px] bg-[#222327] rounded-xl flex flex-col justify-between p-2 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 rounded-full blur-xl -mr-4 -mt-4"></div>
              <span className="text-white text-[10px] font-bold tracking-wide z-10">
                taskup
              </span>
              <div className="flex justify-end z-10 mt-auto">
                <div className="flex -space-x-1.5 opacity-60">
                  <div className="w-3.5 h-3.5 rounded-full bg-white"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-white/50 mix-blend-overlay"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions & Graphic */}
        <div className="flex items-center justify-between px-2 mb-8">
          <div className="flex flex-col">
            <h2 className="text-[#1A1A1A] text-xl font-semibold mb-1">
              Aucune transaction
            </h2>
            <p className="text-[#888891] text-[13px] font-medium leading-relaxed max-w-[140px]">
              Vous n'avez pas encore de transactions
            </p>
          </div>
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Stylized Gem/Graphic Placeholder */}
            <div className="absolute w-[140%] h-[140%] -top-[10%] -left-[10%] bg-gradient-to-br from-white/80 to-white/0 rounded-full blur-xl opacity-60 pointer-events-none"></div>
            <div
              className="relative w-[70%] h-[70%] drop-shadow-xl z-10 animate-bounce"
              style={{ animationDuration: "4s" }}
            >
              <Gem className="w-full h-full text-[#4A90E2] fill-[#4A90E2]/80 stroke-1 stroke-[#4A90E2]" />
            </div>
            <div className="absolute bottom-0 w-[120%] h-12 bg-gradient-to-t from-gray-200 to-transparent opacity-40 blur-md rounded-[100%] z-0 translate-y-6"></div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 pt-10 pb-8 flex items-end justify-between gap-2 h-[200px] relative mt-16">
          {/* Dotted threshold line */}
          <div className="absolute left-6 right-6 bottom-14 border-t border-dashed border-gray-300">
            <div className="absolute -left-1 -top-1 w-2 h-2 rounded-full bg-gray-300"></div>
            <div className="absolute -right-1 -top-1 w-2 h-2 rounded-full bg-[#4A90E2] border border-white"></div>
          </div>

          <div className="w-[12%] bg-[#F4F5F7] rounded-full h-[40%]"></div>
          <div className="w-[12%] bg-[#F4F5F7] rounded-full h-[55%]"></div>
          <div className="w-[12%] bg-[#F4F5F7] rounded-full h-[45%]"></div>
          <div className="w-[12%] bg-[#F4F5F7] rounded-full h-[65%]"></div>
          <div className="w-[12%] bg-[#F4F5F7] rounded-full h-[50%]"></div>
          <div className="w-[12%] bg-[#F4F5F7] rounded-full h-[70%]"></div>
          <div className="w-[16%] bg-[#4A90E2] rounded-full h-full relative z-10 shadow-[0_4px_15px_rgba(74,144,226,0.4)]"></div>
        </div>
      </div>

      {/* Custom Bottom Nav */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#F4F5F7] pb-8 pt-4 px-6 flex justify-between items-center z-50">
        <div className="flex flex-col items-center gap-1.5 cursor-pointer opacity-100 text-[#1A1A1A]">
          <CreditCard size={24} strokeWidth={2.5} fill="#1A1A1A" color="white" />
          <span className="text-[10px] font-bold tracking-wide">Carte</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 cursor-pointer opacity-40">
          <Sparkles size={24} strokeWidth={2.5} />
          <span className="text-[10px] font-bold tracking-wide">Récompenses</span>
        </div>
        <div 
          className="flex flex-col items-center gap-1.5 cursor-pointer opacity-40"
          onClick={onNavigateExpenses}
        >
          <CircleDollarSign size={24} strokeWidth={2.5} />
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
