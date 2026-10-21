import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Search, 
  Check, 
  X, 
  BookOpen, 
  Calculator, 
  Languages, 
  Atom, 
  Dna, 
  Globe2, 
  Brain, 
  Activity, 
  Laptop, 
  Palette, 
  Music, 
  Scale, 
  TrendingUp, 
  Sparkles 
} from 'lucide-react';

export interface SubjectConfig {
  name: string;
  category: 'Sciences' | 'Lettres' | 'Langues' | 'Arts & Sport' | 'Général';
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
  colorEnd: string;
  bgGradient: string;
  gradient: string;
  bgLight: string;
}

export const SUBJECT_METADATA: Record<string, {
  category: 'Sciences' | 'Lettres' | 'Langues' | 'Arts & Sport' | 'Général';
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
  colorEnd: string;
  bgGradient: string;
  gradient: string;
  bgLight: string;
}> = {
  'Mathématiques': {
    category: 'Sciences',
    icon: Calculator,
    color: '#2563eb',
    colorEnd: '#4338ca',
    bgGradient: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)',
    gradient: 'from-blue-500 to-indigo-600',
    bgLight: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  'Français': {
    category: 'Lettres',
    icon: BookOpen,
    color: '#9333ea',
    colorEnd: '#7e22ce',
    bgGradient: 'linear-gradient(135deg, #9333ea 0%, #7e22ce 100%)',
    gradient: 'from-purple-500 to-violet-600',
    bgLight: 'bg-purple-50 text-purple-700 border-purple-200'
  },
  'Anglais': {
    category: 'Langues',
    icon: Languages,
    color: '#e11d48',
    colorEnd: '#be123c',
    bgGradient: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
    gradient: 'from-rose-500 to-red-600',
    bgLight: 'bg-rose-50 text-rose-700 border-rose-200'
  },
  'Histoire-Géographie': {
    category: 'Lettres',
    icon: Globe2,
    color: '#0891b2',
    colorEnd: '#0e7490',
    bgGradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
    gradient: 'from-cyan-500 to-teal-600',
    bgLight: 'bg-cyan-50 text-cyan-700 border-cyan-200'
  },
  'Physique-Chimie': {
    category: 'Sciences',
    icon: Atom,
    color: '#d97706',
    colorEnd: '#b45309',
    bgGradient: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    gradient: 'from-amber-500 to-yellow-600',
    bgLight: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  'SVT': {
    category: 'Sciences',
    icon: Dna,
    color: '#16a34a',
    colorEnd: '#15803d',
    bgGradient: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    gradient: 'from-emerald-500 to-green-600',
    bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  'Philosophie': {
    category: 'Lettres',
    icon: Brain,
    color: '#7c3aed',
    colorEnd: '#6d28d9',
    bgGradient: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
    gradient: 'from-violet-500 to-purple-600',
    bgLight: 'bg-violet-50 text-violet-700 border-violet-200'
  },
  'EPS': {
    category: 'Arts & Sport',
    icon: Activity,
    color: '#db2777',
    colorEnd: '#be185d',
    bgGradient: 'linear-gradient(135deg, #db2777 0%, #be185d 100%)',
    gradient: 'from-pink-500 to-rose-600',
    bgLight: 'bg-pink-50 text-pink-700 border-pink-200'
  },
  'Informatique': {
    category: 'Sciences',
    icon: Laptop,
    color: '#0284c7',
    colorEnd: '#0369a1',
    bgGradient: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    gradient: 'from-sky-500 to-blue-700',
    bgLight: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  'Espagnol': {
    category: 'Langues',
    icon: Languages,
    color: '#ea580c',
    colorEnd: '#c2410c',
    bgGradient: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
    gradient: 'from-orange-500 to-amber-600',
    bgLight: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  'Allemand': {
    category: 'Langues',
    icon: Languages,
    color: '#475569',
    colorEnd: '#334155',
    bgGradient: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
    gradient: 'from-slate-600 to-slate-800',
    bgLight: 'bg-slate-100 text-slate-700 border-slate-200'
  },
  'Arts Plastiques': {
    category: 'Arts & Sport',
    icon: Palette,
    color: '#ec4899',
    colorEnd: '#be185d',
    bgGradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    gradient: 'from-fuchsia-500 to-pink-600',
    bgLight: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200'
  },
  'Musique': {
    category: 'Arts & Sport',
    icon: Music,
    color: '#4f46e5',
    colorEnd: '#4338ca',
    bgGradient: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
    gradient: 'from-indigo-500 to-blue-600',
    bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200'
  },
  'EDHC': {
    category: 'Général',
    icon: Sparkles,
    color: '#f97316',
    colorEnd: '#ea580c',
    bgGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    gradient: 'from-orange-500 to-red-500',
    bgLight: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  'Économie Générale': {
    category: 'Général',
    icon: TrendingUp,
    color: '#0284c7',
    colorEnd: '#1d4ed8',
    bgGradient: 'linear-gradient(135deg, #0284c7 0%, #1d4ed8 100%)',
    gradient: 'from-sky-500 to-blue-600',
    bgLight: 'bg-sky-50 text-sky-700 border-sky-200'
  },
  'Droit': {
    category: 'Général',
    icon: Scale,
    color: '#0d9488',
    colorEnd: '#0f766e',
    bgGradient: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
    gradient: 'from-teal-500 to-emerald-600',
    bgLight: 'bg-teal-50 text-teal-700 border-teal-200'
  }
};

export const getSubjectMeta = (subjectName: string) => {
  if (SUBJECT_METADATA[subjectName]) {
    return SUBJECT_METADATA[subjectName];
  }
  // Fallback
  return {
    category: 'Général' as const,
    icon: BookOpen,
    color: '#2563eb',
    colorEnd: '#1d4ed8',
    bgGradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    gradient: 'from-blue-500 to-sky-600',
    bgLight: 'bg-blue-50 text-blue-700 border-blue-200'
  };
};

interface CustomSubjectSelectProps {
  value: string;
  onChange: (value: string) => void;
  subjects?: string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const CustomSubjectSelect: React.FC<CustomSubjectSelectProps> = ({
  value,
  onChange,
  subjects = Object.keys(SUBJECT_METADATA),
  placeholder = 'Sélectionner une matière...',
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click or Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const currentMeta = getSubjectMeta(value || subjects[0] || 'Mathématiques');
  const CurrentIcon = currentMeta.icon;

  const categories = useMemo(() => {
    const cats = new Set<string>();
    subjects.forEach(s => {
      const meta = getSubjectMeta(s);
      cats.add(meta.category);
    });
    return ['Tous', ...Array.from(cats)];
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter(sub => {
      const meta = getSubjectMeta(sub);
      const matchesCategory = selectedCategory === 'Tous' || meta.category === selectedCategory;
      const matchesSearch = sub.toLowerCase().includes(search.toLowerCase().trim());
      return matchesCategory && matchesSearch;
    });
  }, [subjects, selectedCategory, search]);

  const handleSelect = (sub: string) => {
    onChange(sub);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full group flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl bg-white border transition-all text-left shadow-xs hover:shadow-md cursor-pointer ${
          isOpen
            ? 'border-sky-500 ring-4 ring-sky-500/15 shadow-sky-500/10'
            : 'border-slate-200/90 hover:border-slate-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Subject Badge Icon with Guaranteed Gradient */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform"
            style={{
              background: currentMeta.bgGradient,
              backgroundColor: currentMeta.color,
              color: '#ffffff',
              boxShadow: `0 4px 12px ${currentMeta.color}35`
            }}
          >
            <CurrentIcon size={20} className="text-white drop-shadow-xs" />
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[14px] font-bold text-slate-800 leading-snug truncate">
              {value || placeholder}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 leading-none mt-0.5">
              {currentMeta.category} • Discipline officielle
            </span>
          </div>
        </div>

        {/* Right Arrow / Chevron */}
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            isOpen ? 'bg-sky-50 text-sky-600 rotate-180' : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'
          }`}
        >
          <ChevronDown size={16} className="transition-transform duration-200" />
        </div>
      </button>

      {/* DROPDOWN POPUP PANEL */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 right-0 z-50 mt-2 p-2.5 bg-white/95 backdrop-blur-2xl rounded-[24px] border border-slate-200/90 shadow-[0_20px_50px_-10px_rgba(15,23,42,0.22)] overflow-hidden flex flex-col max-h-[380px]"
          >
            {/* Header: Search Box */}
            <div className="relative mb-2">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une matière..."
                className="w-full bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-sky-500 rounded-xl py-2 pl-9 pr-8 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100 overflow-x-auto no-scrollbar mb-1 px-0.5">
              {categories.map((cat, idx) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={`cat-${cat}-${idx}`}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100/70 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Subjects List Scrollable Area */}
            <div className="overflow-y-auto flex-1 pr-1 space-y-1 custom-scrollbar max-h-[240px]">
              {filteredSubjects.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="text-xs font-semibold">Aucune matière trouvée</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Essayez avec un autre mot-clé</p>
                </div>
              ) : (
                filteredSubjects.map((sub, idx) => {
                  const isSelected = sub === value;
                  const meta = getSubjectMeta(sub);
                  const Icon = meta.icon;

                  return (
                    <button
                      key={`subj-${sub}-${idx}`}
                      type="button"
                      onClick={() => handleSelect(sub)}
                      className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-left cursor-pointer group ${
                        isSelected
                          ? 'bg-sky-50/90 text-sky-950 font-bold border border-sky-200/80 shadow-xs'
                          : 'hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Icon badge */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                          style={
                            isSelected
                              ? {
                                  background: meta.bgGradient,
                                  backgroundColor: meta.color,
                                  color: '#ffffff',
                                  boxShadow: `0 3px 10px ${meta.color}45`
                                }
                              : {
                                  backgroundColor: `${meta.color}18`,
                                  color: meta.color,
                                  border: `1px solid ${meta.color}25`
                                }
                          }
                        >
                          <Icon size={16} className={isSelected ? 'text-white drop-shadow-xs' : ''} />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span
                            className={`text-[13px] truncate ${
                              isSelected ? 'font-bold text-sky-950' : 'text-slate-800'
                            }`}
                          >
                            {sub}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                            <span
                              className="w-1.5 h-1.5 rounded-full inline-block"
                              style={{ backgroundColor: meta.color }}
                            />
                            {meta.category}
                          </span>
                        </div>
                      </div>

                      {/* Right Checkmark */}
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-xs shrink-0">
                          <Check size={14} strokeWidth={2.8} />
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono font-semibold text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity pr-1">
                          Choisir
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Bottom Footer Info */}
            <div className="pt-2 mt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium px-1">
              <span>{filteredSubjects.length} matière{filteredSubjects.length > 1 ? 's' : ''}</span>
              <span className="text-sky-600 font-semibold">Programme national</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomSubjectSelect;
