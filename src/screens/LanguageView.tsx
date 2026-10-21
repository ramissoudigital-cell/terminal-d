import React, { useState } from 'react';
import { ChevronLeft, Check, Globe } from 'lucide-react';
import { motion } from 'motion/react';

interface LanguageViewProps {
  onBack: () => void;
}

const languages = [
  { id: 'fr', name: 'Français', region: 'France', prefix: 'FR' },
  { id: 'en', name: 'English', region: 'United States, UK', prefix: 'EN' },
  { id: 'es', name: 'Español', region: 'España, América Latina', prefix: 'ES' },
  { id: 'de', name: 'Deutsch', region: 'Deutschland', prefix: 'DE' },
  { id: 'it', name: 'Italiano', region: 'Italia', prefix: 'IT' },
  { id: 'pt', name: 'Português', region: 'Portugal, Brasil', prefix: 'PT' },
];

export const LanguageView: React.FC<LanguageViewProps> = ({ onBack }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('fr');

  return (
    <div className="absolute inset-0 z-[100] h-full bg-gradient-to-b from-sky-200 via-cyan-100 to-sky-200 overflow-y-auto hide-scrollbar pb-12 w-full font-sans">
      {/* Header */}
      <div className="pt-14 px-6 flex items-center justify-between relative mb-8">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/80 transition-colors z-10 shadow-sm"
        >
          <ChevronLeft size={22} className="text-gray-800" />
        </button>
        <h1 className="text-[20px] font-bold text-gray-900 tracking-tight absolute left-0 right-0 text-center">Langue</h1>
        <div className="w-10 z-10"></div> {/* Spacer for centering */}
      </div>

      <div className="px-5 flex flex-col gap-6 items-center max-w-2xl mx-auto w-full">
        {/* Info Card */}
        <div className="w-full bg-white/50 backdrop-blur-md rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-start gap-4 border border-white/40">
          <div className="w-10 h-10 bg-sky-100/80 rounded-full flex items-center justify-center text-sky-500 shrink-0 mt-0.5">
            <Globe size={20} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-gray-900 mb-1">Préférences linguistiques</h3>
            <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
              Sélectionnez la langue dans laquelle vous souhaitez utiliser TASKup. Ce paramètre s'appliquera à toute l'interface.
            </p>
          </div>
        </div>

        {/* Languages List */}
        <div className="w-full bg-white/60 backdrop-blur-md rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50">
          <div className="flex flex-col p-2">
            {languages.map((language, index) => {
              const isSelected = selectedLanguage === language.id;
              
              return (
                <React.Fragment key={language.id}>
                  <motion.div 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedLanguage(language.id)}
                    className={`flex items-center justify-between p-3 px-4 rounded-[20px] cursor-pointer transition-all duration-300 ${isSelected ? 'bg-white shadow-[0_2px_15px_rgba(0,0,0,0.04)]' : 'hover:bg-white/40'}`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Language Prefix Badge */}
                      <div className={`w-[42px] h-[42px] rounded-[14px] flex items-center justify-center font-bold text-[13px] tracking-wide transition-colors ${isSelected ? 'bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-500'}`}>
                        {language.prefix}
                      </div>
                      
                      <div className="flex flex-col">
                        <span className={`text-[16px] font-bold transition-colors ${isSelected ? 'text-sky-600' : 'text-gray-800'}`}>
                          {language.name}
                        </span>
                        <span className="text-[12px] font-medium text-gray-400">
                          {language.region}
                        </span>
                      </div>
                    </div>
                    
                    {/* Checkmark */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-sky-500 scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                  </motion.div>
                  
                  {index < languages.length - 1 && (
                    <div className="h-[1px] bg-gray-200/50 mx-6 my-1"></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
