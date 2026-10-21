import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface NavbarProps {
  onRandomQuote: () => void;
  isDark: boolean;
  toggleDark: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onRandomQuote, isDark, toggleDark }) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FBF9F5]/95 dark:bg-[#1C1917]/95 backdrop-blur-md border-b border-[#EBE6DF] dark:border-[#292524]">
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#haut"
          className="font-serif text-2xl font-bold tracking-tight text-[#1C1917] dark:text-[#FBF9F5] hover:text-[#9A3412] dark:hover:text-[#D68C72] transition-colors whitespace-nowrap shrink-0"
        >
          Blaise Pascal
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#57534E] dark:text-[#A8A29E]">
          <a
            href="#pascaline"
            className="hover:text-[#1C1917] dark:hover:text-[#FBF9F5] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 border-transparent hover:border-[#9A3412] dark:hover:border-[#D68C72]"
          >
            La Pascaline
          </a>
          <a
            href="#triangle"
            className="hover:text-[#1C1917] dark:hover:text-[#FBF9F5] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 border-transparent hover:border-[#9A3412] dark:hover:border-[#D68C72]"
          >
            Triangle Arithmétique
          </a>
          <a
            href="#pression"
            className="hover:text-[#1C1917] dark:hover:text-[#FBF9F5] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 border-transparent hover:border-[#9A3412] dark:hover:border-[#D68C72]"
          >
            Pression & Vide
          </a>
          <a
            href="#pari"
            className="hover:text-[#1C1917] dark:hover:text-[#FBF9F5] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 border-transparent hover:border-[#9A3412] dark:hover:border-[#D68C72]"
          >
            Le Pari
          </a>
          <a
            href="#pensees"
            className="hover:text-[#1C1917] dark:hover:text-[#FBF9F5] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 border-transparent hover:border-[#9A3412] dark:hover:border-[#D68C72]"
          >
            Pensées
          </a>
          <a
            href="#chronologie"
            className="hover:text-[#1C1917] dark:hover:text-[#FBF9F5] transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 border-transparent hover:border-[#9A3412] dark:hover:border-[#D68C72]"
          >
            Chronologie
          </a>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleDark}
            className="p-2 rounded-lg bg-[#EBE6DF] dark:bg-[#292524] text-[#1C1917] dark:text-[#FBF9F5] hover:bg-[#D6CEBE] dark:hover:bg-[#44403C] transition-colors"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={onRandomQuote}
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#FBF9F5] dark:text-[#1C1917] bg-[#1C1917] dark:bg-[#FBF9F5] hover:bg-[#78350F] dark:hover:bg-[#D6CEBE] active:scale-[0.98] rounded-md transition-all whitespace-nowrap shrink-0 shadow-xs"
          >
            Méditation du Jour
          </button>
        </div>
      </div>
    </header>
  );
};
