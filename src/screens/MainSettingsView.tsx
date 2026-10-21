import React, { useState } from "react";
import { ChevronLeft, ChevronRight, User, Lock, Bell, HeadphonesIcon, AlertCircle, HelpCircle, Globe, LogOut, Shield } from "lucide-react";
import { motion } from "motion/react";

interface MainSettingsViewProps {
  onBack: () => void;
  onNavigateProfileDetail: () => void;
  onNavigatePassword: () => void;
  onNavigateNotifications: () => void;
  onNavigateAssistance: () => void;
  onNavigateReportProblem: () => void;
  onNavigateAbout: () => void;
  onNavigateLanguage: () => void;
  onNavigatePrivacyPolicy: () => void;
}

export const MainSettingsView: React.FC<MainSettingsViewProps> = ({ onBack, onNavigateProfileDetail, onNavigatePassword, onNavigateNotifications, onNavigateAssistance, onNavigateReportProblem, onNavigateAbout, onNavigateLanguage, onNavigatePrivacyPolicy }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className="absolute inset-0 z-[100] h-full bg-gradient-to-b from-blue-200 via-blue-100 to-blue-200 overflow-y-auto hide-scrollbar pb-12">
      {/* Header */}
      <div className="pt-14 px-6 flex items-center justify-center relative mb-8">
        <button 
          onClick={onBack}
          className="absolute left-6 w-10 h-10 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/80 transition-colors"
        >
          <ChevronLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="text-[20px] font-bold text-gray-900 tracking-tight">Paramètres</h1>
      </div>

      <div className="px-5 flex flex-col gap-8">
        {/* Profile Card */}
        <div className="bg-white/70 backdrop-blur-md rounded-[28px] p-5 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)] cursor-pointer active:scale-95 transition-transform">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80" 
                alt="Jane Cooper" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[17px] text-gray-900 mb-0.5">Jane Cooper</span>
              <span className="text-[13px] text-gray-500 font-medium">Vidéaste & photographe</span>
            </div>
          </div>
          <ChevronRight size={20} className="text-gray-400" />
        </div>

        {/* Other Settings Section */}
        <div>
          <h2 className="text-[15px] font-bold text-gray-800 mb-4 px-2">Autres paramètres</h2>
          
          <div className="bg-white/60 backdrop-blur-md rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
            <div className="flex flex-col px-2">
              <div onClick={onNavigateProfileDetail}>
                <SettingItem icon={<User size={20} />} label="Détails du profil" />
              </div>
              <div className="h-[1px] bg-gray-100/50 mx-4"></div>
              <div onClick={onNavigatePassword}>
                <SettingItem icon={<Lock size={20} />} label="Mot de passe" />
              </div>
              <div className="h-[1px] bg-gray-100/50 mx-4"></div>
              <div onClick={onNavigateNotifications}>
                <SettingItem icon={<Bell size={20} />} label="Notifications" />
              </div>
              <div className="h-[1px] bg-gray-100/50 mx-4"></div>
              <div onClick={onNavigatePrivacyPolicy}>
                <SettingItem icon={<Shield size={20} />} label="Politique de confidentialité" />
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white/60 backdrop-blur-md rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex flex-col px-2">
            <div onClick={onNavigateAssistance}>
              <SettingItem icon={<HeadphonesIcon size={20} />} label="Assistance" />
            </div>
            <div className="h-[1px] bg-gray-100/50 mx-4"></div>
            <div onClick={onNavigateReportProblem}>
              <SettingItem icon={<AlertCircle size={20} />} label="Signaler un problème" />
            </div>
            <div className="h-[1px] bg-gray-100/50 mx-4"></div>
            <div onClick={onNavigateAbout}>
              <SettingItem icon={<HelpCircle size={20} />} label="À propos de TASKup" />
            </div>
            <div className="h-[1px] bg-gray-100/50 mx-4"></div>
            <div onClick={onNavigateLanguage}>
              <SettingItem icon={<Globe size={20} />} label="Langue" />
            </div>
          </div>
        </div>
        
        {/* Log out Section */}
        <div className="bg-white/60 backdrop-blur-md rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)] mb-8">
          <div className="flex items-center gap-4 p-4 py-4.5 cursor-pointer hover:bg-white/30 transition-colors">
            <div className="text-gray-500">
              <LogOut size={20} className="rotate-180" />
            </div>
            <span className="text-[15px] font-medium text-gray-700">Se déconnecter</span>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper component for generic settings rows
const SettingItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => {
  return (
    <div className="flex justify-between items-center p-4 py-4.5 group hover:bg-white/30 transition-colors cursor-pointer active:bg-white/40">
      <div className="flex items-center gap-4">
        <div className="text-gray-500 group-hover:text-gray-900 transition-colors">
          {icon}
        </div>
        <span className="text-[15px] font-medium text-gray-700 group-hover:text-gray-900 transition-colors">{label}</span>
      </div>
      <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
    </div>
  );
};
