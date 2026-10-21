import React, { useState } from 'react';
import { ChevronLeft, AlertCircle, UploadCloud, Send } from 'lucide-react';
import { motion } from 'motion/react';

interface ReportProblemViewProps {
  onBack: () => void;
}

export const ReportProblemView: React.FC<ReportProblemViewProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to send the report
    onBack();
  };

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
        <h1 className="text-[20px] font-bold text-gray-900 tracking-tight absolute left-0 right-0 text-center">Signaler un problème</h1>
        <div className="w-10 z-10"></div> {/* Spacer for centering */}
      </div>

      <div className="px-5 flex flex-col gap-6 items-center">
        <form onSubmit={handleSubmit} className="w-full bg-white/60 backdrop-blur-md rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-4 mb-6 flex gap-3 items-start">
            <AlertCircle size={20} className="text-orange-500 shrink-0 mt-0.5" />
            <p className="text-[13px] text-orange-800 font-medium">
              Veuillez décrire le problème rencontré avec le plus de détails possible pour que nous puissions vous aider efficacement.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Sujet du problème</label>
              <input 
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="Ex: Erreur de paiement..."
                required
                className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-[15px] font-semibold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-shadow"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Description détaillée</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez ce qu'il s'est passé..."
                required
                rows={5}
                className="w-full bg-white/50 border border-white/60 rounded-xl px-4 py-3 text-[15px] font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400/50 transition-shadow resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-500 uppercase tracking-wider pl-1">Pièces jointes (Optionnel)</label>
              <div className="w-full bg-white/50 border border-white/60 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/80 transition-colors">
                <UploadCloud size={32} className="text-gray-400" />
                <span className="text-[13px] font-medium text-gray-500">Appuyez pour ajouter une capture d'écran</span>
              </div>
            </div>
          </div>
          
          <button type="submit" className="w-full mt-8 py-4 bg-sky-500 hover:bg-sky-600 rounded-full text-white font-bold tracking-wide shadow-[0_8px_20px_rgba(14,165,233,0.3)] flex items-center justify-center gap-2 transition-transform active:scale-[0.98]">
            <Send size={18} />
            Envoyer le rapport
          </button>
        </form>
      </div>
    </div>
  );
};
