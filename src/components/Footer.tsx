import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#EBE6DF] dark:border-[#292524] bg-[#F7F4EE] dark:bg-[#1C1917] py-14 text-[#78716C] dark:text-[#A8A29E]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#EBE6DF] dark:border-[#292524]">
          <div>
            <span className="font-serif text-xl font-bold text-[#1C1917] dark:text-[#FBF9F5] block">
              Blaise Pascal (1623 – 1662)
            </span>
            <p className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1 max-w-md">
              Monographie numérique dédiée à l'un des plus grands esprits de l'histoire humaine, inventeur, savant et moraliste.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-xs text-[#57534E] dark:text-[#A8A29E]">
            <a href="#pascaline" className="hover:text-[#1C1917] dark:hover:text-[#FBF9F5] transition-colors">La Pascaline</a>
            <a href="#triangle" className="hover:text-[#1C1917] dark:hover:text-[#FBF9F5] transition-colors">Triangle de Pascal</a>
            <a href="#pression" className="hover:text-[#1C1917] dark:hover:text-[#FBF9F5] transition-colors">Pression barométrique</a>
            <a href="#pari" className="hover:text-[#1C1917] dark:hover:text-[#FBF9F5] transition-colors">Le Pari</a>
            <a href="#pensees" className="hover:text-[#1C1917] dark:hover:text-[#FBF9F5] transition-colors">Pensées</a>
            <a href="#chronologie" className="hover:text-[#1C1917] dark:hover:text-[#FBF9F5] transition-colors">Chronologie</a>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span>Patrimoine scientifique & philosophique français</span>
            <span aria-hidden="true">·</span>
            <span>Clermont-Ferrand · Rouen · Port-Royal · Paris</span>
          </div>

          <div className="text-[11px] text-[#A8A29E] dark:text-[#78716C] font-mono">
            « Le cœur a ses raisons que la raison ne connaît point »
          </div>
        </div>
      </div>
    </footer>
  );
};
