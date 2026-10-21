import { ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export const BlankPage = ({ onBack }: { onBack: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.4 }}
      className="flex flex-col h-full bg-white"
    >
      <header className="px-6 pt-[60px] pb-4 flex items-center justify-between relative z-10 w-full">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800 transition-active active:scale-95">
          <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
        </button>
      </header>
      
      <div className="flex-1 px-6 py-6 flex flex-col">
          {/* Page Blanche */}
      </div>
    </motion.div>
  );
};
