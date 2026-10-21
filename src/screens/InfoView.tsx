import React from "react";
import { ChevronLeft, Image as GalleryIcon, Download, MapPin } from "lucide-react";
import { motion } from "motion/react";

interface InfoViewProps {
  onBack?: () => void;
}

export const InfoView: React.FC<InfoViewProps> = ({ onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 50, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 25, duration: 0.6 }}
      className="absolute inset-0 pt-12 pb-28 px-6 bg-[#f8f9fa] overflow-y-auto hide-scrollbar z-50"
    >
      <div className="flex items-center gap-4 mb-6 pt-2">
        {onBack && (
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-colors shadow-sm"
          >
            <ChevronLeft size={24} className="text-gray-800" />
          </button>
        )}
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-800">Informations</h2>
          <p className="text-slate-500 text-sm">Détails du projet et contacts</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative rounded-3xl overflow-hidden h-48 shadow-lg group">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop"
            alt="Nova Grey Building"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <div>
              <h3 className="text-white font-bold text-xl">
                Nova Grey Residences
              </h3>
              <p className="text-white/80 text-xs">New York, NY</p>
            </div>
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div
            className="p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/60 backdrop-blur-md border border-white/40 shadow-sm hover:bg-white/80 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GalleryIcon size={20} />
            </div>
            <span className="text-xs font-bold text-slate-700">
              Voir la galerie
            </span>
          </div>

          <div
            className="p-4 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer bg-white/60 backdrop-blur-md border border-white/40 shadow-sm hover:bg-white/80 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Download size={20} />
            </div>
            <span className="text-xs font-bold text-slate-700">Documents</span>
          </div>
        </div>

        <div className="p-6 rounded-3xl space-y-4 bg-white/60 backdrop-blur-md border border-white/40 shadow-sm">
          <h4 className="font-bold text-slate-700">Aperçu du projet</h4>
          <p className="text-sm text-slate-500 leading-relaxed">
            Nova Grey représente le summum de la vie moderne. Doté d'une architecture de pointe, de matériaux durables et d'une intégration de maison intelligente. Situé au cœur du quartier de l'innovation.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-indigo-50/50 p-3 rounded-xl">
              <p className="text-xs text-slate-400 font-bold uppercase">
                Date de fin
              </p>
              <p className="text-slate-700 font-bold">Q4 2025</p>
            </div>
            <div className="bg-indigo-50/50 p-3 rounded-xl">
              <p className="text-xs text-slate-400 font-bold uppercase">
                Unités totales
              </p>
              <p className="text-slate-700 font-bold">142</p>
            </div>
          </div>
        </div>

        <div className="p-1 rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 shadow-sm">
          <button className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-500/30 flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <MapPin size={18} />
            Contacter l'équipe commerciale
          </button>
        </div>
      </div>
    </motion.div>
  );
};
