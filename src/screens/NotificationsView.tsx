import React from 'react';
import { ChevronLeft, Bell } from 'lucide-react';
import { motion } from 'motion/react';

interface NotificationsViewProps {
  onBack: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onBack }) => {
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
        <h1 className="text-[20px] font-bold text-gray-900 tracking-tight absolute left-0 right-0 text-center">Notifications</h1>
        <div className="w-10 z-10"></div> {/* Spacer */}
      </div>

      <div className="px-5 flex flex-col gap-4 pb-20">
        <NotificationItem 
          title="Nouveau message de Sarah"
          description="Salut ! Êtes-vous disponible demain pour discuter du projet ?"
          time="Il y a 5 min"
          unread={true}
        />
        <NotificationItem 
          title="Paiement reçu"
          description="Vous avez reçu un paiement de 150€ de Marc D."
          time="Il y a 2 heures"
        />
        <NotificationItem 
          title="Nouvelle mission disponible"
          description="Une mission correspondant à vos compétences vient d'être publiée près de chez vous."
          time="Hier"
        />
        <NotificationItem 
          title="Rappel: Réunion"
          description="Votre rendez-vous commence dans 30 minutes."
          time="Hier"
        />
      </div>
    </div>
  );
};

const NotificationItem = ({ title, description, time, unread = false }: { title: string, description: string, time: string, unread?: boolean }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`w-full bg-white/60 backdrop-blur-md rounded-[20px] p-4 flex gap-4 ${unread ? 'border-2 border-sky-400' : 'border border-gray-100/50 shadow-[0_4px_20px_rgb(0,0,0,0.02)]'}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${unread ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
        <Bell size={18} />
      </div>
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex justify-between items-start gap-2">
          <span className={`text-[15px] font-bold leading-tight ${unread ? 'text-gray-900' : 'text-gray-700'}`}>{title}</span>
          <span className="text-[11px] font-medium text-gray-400 whitespace-nowrap">{time}</span>
        </div>
        <p className="text-[13px] text-gray-500 leading-snug line-clamp-2">{description}</p>
      </div>
    </motion.div>
  );
};
