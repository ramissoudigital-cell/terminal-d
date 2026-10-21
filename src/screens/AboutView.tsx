import React from 'react';
import { ChevronLeft, Info, Shield, FileText, Globe } from 'lucide-react';
import { motion } from 'motion/react';

interface AboutViewProps {
  onBack: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onBack }) => {
  return (
    <div className="absolute inset-0 z-[100] h-full bg-gradient-to-b from-sky-200 via-cyan-100 to-sky-200 overflow-y-auto hide-scrollbar pb-12">
      {/* Header */}
      <div className="pt-14 px-6 flex items-center justify-between relative mb-8">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/80 transition-colors z-10"
        >
          <ChevronLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="text-[20px] font-bold text-gray-900 tracking-tight absolute left-0 right-0 text-center">À propos</h1>
        <div className="w-10 z-10"></div> {/* Spacer for centering */}
      </div>

      <div className="px-5 flex flex-col gap-6 items-center">
        {/* Logo and App Name */}
        <div className="flex flex-col items-center gap-3 mt-4 mb-2">
          <div className="w-24 h-24 bg-white/80 backdrop-blur-md rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.05)] flex items-center justify-center">
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-sky-500 to-blue-600">
              T
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">TASKup</h2>
          <p className="text-sm font-medium text-gray-500">Version 1.0.0</p>
        </div>

        {/* Description Section */}
        <div className="w-full bg-white/60 backdrop-blur-md rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <h3 className="text-[16px] font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Info size={20} className="text-sky-500" />
            Notre mission
          </h3>
          <p className="text-[14px] text-gray-700 leading-relaxed font-medium">
            TASKup est la plateforme de référence pour l'emploi de proximité. Notre application connecte instantanément les personnes ayant besoin d'aide avec des prestataires qualifiés et motivés dans leur région.
            <br/><br/>
            Notre objectif est de faciliter les échanges locaux, de créer de la valeur et de renforcer le tissu social de votre communauté en toute sécurité et simplicité.
          </p>
        </div>

        {/* Links Section */}
        <div className="w-full bg-white/60 backdrop-blur-md rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex flex-col px-2 py-2">
            <AboutItem icon={<Shield size={20} />} label="Politique de confidentialité" />
            <div className="h-[1px] bg-gray-100/50 mx-4"></div>
            <AboutItem icon={<FileText size={20} />} label="Conditions d'utilisation" />
            <div className="h-[1px] bg-gray-100/50 mx-4"></div>
            <AboutItem icon={<Globe size={20} />} label="Site Web Officiel" />
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center flex flex-col gap-1">
          <p className="text-sm text-gray-500 font-medium">© 2026 TASKup. Tous droits réservés.</p>
          <p className="text-xs text-gray-400">Conçu pour simplifier l'emploi de proximité.</p>
        </div>
      </div>
    </div>
  );
};

const AboutItem = ({ icon, label }: { icon: React.ReactNode, label: string }) => {
  return (
    <div className="flex items-center justify-between p-4 py-4.5 group hover:bg-white/30 transition-colors cursor-pointer rounded-2xl">
      <div className="flex items-center gap-4">
        <div className="text-gray-700">{icon}</div>
        <span className="text-[16px] font-semibold text-gray-800">{label}</span>
      </div>
      <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
        <ChevronLeft size={20} className="rotate-180" />
      </div>
    </div>
  );
};
