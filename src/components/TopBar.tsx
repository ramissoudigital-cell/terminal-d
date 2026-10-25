import React from 'react';
import { EditorMode } from '../types';
import { Maximize2, Minimize2 } from 'lucide-react';

interface TopBarProps {
  currentMode: EditorMode;
  onSelectMode: (mode: EditorMode) => void;
  onOpenPaperModal: () => void;
  onOpenInspirationModal: () => void;
  onOpenDocsDrawer: () => void;
  isZenMode: boolean;
  onToggleZenMode: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentMode,
  onSelectMode,
  onOpenPaperModal,
  onOpenInspirationModal,
  onOpenDocsDrawer,
  isZenMode,
  onToggleZenMode,
}) => {
  return (
    <header className="no-print flex items-center justify-between gap-8 px-6 py-3.5 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm border-b border-neutral-200/80 dark:border-neutral-800 transition-colors">
      {/* Zone 1: Brand Wordmark (single element, no descriptor tags or badges) */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-lg font-cormorant font-semibold tracking-wide text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
          Page Blanche
        </span>
      </div>

      {/* Zone 2: 4-5 single-line navigation controls */}
      <nav className="flex items-center gap-6 text-sm font-medium text-neutral-600 dark:text-neutral-400">
        <button
          onClick={() => onSelectMode('text')}
          className={`hover:text-neutral-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentMode === 'text'
              ? 'text-neutral-950 dark:text-white font-semibold underline underline-offset-8 decoration-neutral-400'
              : ''
          }`}
        >
          Écriture
        </button>

        <button
          onClick={() => onSelectMode('draw')}
          className={`hover:text-neutral-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            currentMode === 'draw'
              ? 'text-neutral-950 dark:text-white font-semibold underline underline-offset-8 decoration-neutral-400'
              : ''
          }`}
        >
          Croquis
        </button>

        <button
          onClick={onOpenPaperModal}
          className="hover:text-neutral-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Grains de papier
        </button>

        <button
          onClick={onOpenInspirationModal}
          className="hover:text-neutral-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Inspirations
        </button>

        <button
          onClick={onOpenDocsDrawer}
          className="hover:text-neutral-950 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Mes pages
        </button>
      </nav>

      {/* Zone 3: Primary Actions (Zen mode) */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onToggleZenMode}
          title={isZenMode ? "Quitter le plein écran" : "Plein écran sans distraction"}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-neutral-900 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isZenMode ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Fenêtré</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Plein écran</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
