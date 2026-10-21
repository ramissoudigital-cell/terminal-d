import { ArrowLeft, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { categories } from '../data';

interface CategoriesListProps {
  onBack: () => void;
  onCategoryClick: (id: string) => void;
}

export const CategoriesList = ({ onBack, onCategoryClick }: CategoriesListProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.4 }}
      className="flex flex-col h-full bg-[#F0F8FF] pb-24"
    >
      {/* Header */}
      <header className="px-6 pt-[60px] pb-4 flex items-center justify-between relative z-10 bg-transparent">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-800 transition-active active:scale-95">
          <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
        </button>
        <span className="text-[1rem] font-bold text-[#2B2B36]">Toutes les offres</span>
        <div className="w-10 h-10"></div>
      </header>
      
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="relative group h-[48px] mb-6">
          {/* Outer pill-shaped glow aura */}
          <div className="absolute -inset-[2px] z-0 blur-[8px] rounded-[2rem] bg-black/5">
            <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="w-full h-full bg-[conic-gradient(from_0deg,#B294DE,#6CA6F1,#F3D76F,#B294DE)] opacity-100"
                />
              </div>
            </div>
          </div>

          {/* Inner Search Bar (clipped for precise glowing border) */}
          <div className="relative rounded-[2rem] p-[3px] shadow-[0_15px_40px_rgba(0,0,0,0.15)] overflow-hidden flex h-full z-10">
            {/* Animated gradient spinning border */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] aspect-square z-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="w-full h-full bg-[conic-gradient(from_0deg,#B294DE,#6CA6F1,#F3D76F,#B294DE)] opacity-90"
              />
            </div>
            
            <div className="relative w-full bg-white/95 rounded-[1.8rem] px-3 flex items-center backdrop-blur-md z-10 h-full">
              <div className="px-3">
                <Search size={20} className="text-[#4A90E2]" />
              </div>
              <input 
                type="text" 
                placeholder="Rechercher des offres..." 
                className="flex-1 bg-transparent border-none outline-none text-[15px] font-medium text-gray-700 placeholder:text-gray-400 py-1 h-full"
              />
            </div>
          </div>
        </div>

        <h2 className="text-[#2B2B36] text-[1.2rem] font-bold tracking-tight mb-1">Catégories d'offres</h2>
        <p className="text-[#888891] text-[0.8rem] mb-6">Trouvez le domaine qui correspond à vos besoins et cherchez des talents.</p>
        
        <div className="grid grid-cols-2 gap-4">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="flex flex-col gap-3 group cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
              onClick={() => onCategoryClick(category.id)}
            >
              <div 
                className="h-[140px] rounded-[1.25rem] overflow-hidden shadow-sm relative"
                style={{ backgroundColor: (category as any).bgColor || '#C5E0F5' }}
              >
                {((category as any).image || category.imageUrl) ? (
                  <div 
                    className={`absolute inset-0 z-0 opacity-90 transition-transform duration-500 group-hover:scale-110`}
                    style={{
                      backgroundImage: `url(${(category as any).image || category.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent"></div>
                )}
              </div>
              <div className="flex flex-col px-1">
                <span className="text-[#2B2B36] text-[1rem] font-bold tracking-tight truncate">{category.name}</span>
                <span className="text-[#888891] text-[0.7rem] font-medium tracking-wide">{category.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
