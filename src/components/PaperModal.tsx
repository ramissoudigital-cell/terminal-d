import React from 'react';
import { FontChoice, PaperStyle } from '../types';
import { X, Check } from 'lucide-react';

interface PaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStyle: PaperStyle;
  onSelectStyle: (style: PaperStyle) => void;
  currentFont: FontChoice;
  onSelectFont: (font: FontChoice) => void;
  currentFontSize: 'sm' | 'base' | 'lg' | 'xl';
  onSelectFontSize: (size: 'sm' | 'base' | 'lg' | 'xl') => void;
}

const PAPERS: { id: PaperStyle; name: string; description: string; previewClass: string }[] = [
  {
    id: 'pure-white',
    name: 'Blanc Pur',
    description: 'Une feuille immaculée, épurée et sans apprêt.',
    previewClass: 'bg-white border-neutral-300',
  },
  {
    id: 'cotton-ivory',
    name: 'Vélin Coton Ivoire',
    description: 'Teinte crème chaude, douce pour les yeux et inspirante.',
    previewClass: 'bg-[#FAF8F5] border-stone-300',
  },
  {
    id: 'lined',
    name: 'Feuillet Ligné',
    description: 'Lignes directrices douces pour une écriture fluide.',
    previewClass: 'bg-white paper-lines border-neutral-300',
  },
  {
    id: 'dot-grid',
    name: 'Grille de Points',
    description: 'Points discrets pour croquis, calligraphie ou notes.',
    previewClass: 'bg-white paper-dots border-neutral-300',
  },
  {
    id: 'grid',
    name: 'Quadrillage',
    description: 'Papier millimétré classique pour plans et réflexion structurée.',
    previewClass: 'bg-white paper-grid border-neutral-300',
  },
  {
    id: 'dark-ink',
    name: 'Nuit d\'Encre',
    description: 'Papier sombre texturé pour les sessions nocturnes.',
    previewClass: 'bg-[#141416] paper-dots-dark border-neutral-700',
  },
];

const FONTS: { id: FontChoice; name: string; category: string; previewText: string }[] = [
  {
    id: 'cormorant',
    name: 'Cormorant Garamond',
    category: 'Sérif Littéraire',
    previewText: 'La grâce des lettres classiques et des manuscrits.',
  },
  {
    id: 'lora',
    name: 'Lora Roman',
    category: 'Roman Contemporain',
    previewText: 'Équilibré, aéré, conçu pour les longs récits.',
  },
  {
    id: 'jakarta',
    name: 'Plus Jakarta Sans',
    category: 'Moderne Épuré',
    previewText: 'Clair, net et résolument minimaliste.',
  },
  {
    id: 'jetbrains',
    name: 'JetBrains Mono',
    category: 'Machine à Écrire',
    previewText: 'Régularité mécanique pour l’esprit précis.',
  },
];

export const PaperModal: React.FC<PaperModalProps> = ({
  isOpen,
  onClose,
  currentStyle,
  onSelectStyle,
  currentFont,
  onSelectFont,
  currentFontSize,
  onSelectFontSize,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Grains de papier & Typographie
            </h3>
            <p className="text-xs text-neutral-500">Personnalisez le toucher visuel de votre page.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Paper Grain Selection */}
          <section>
            <h4 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-3">
              Texture du Papier
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PAPERS.map((paper) => {
                const isSelected = currentStyle === paper.id;
                return (
                  <button
                    key={paper.id}
                    onClick={() => onSelectStyle(paper.id)}
                    className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white bg-neutral-50 dark:bg-neutral-800/50'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded border ${paper.previewClass}`} />
                      {isSelected && <Check className="w-4 h-4 text-neutral-900 dark:text-white" />}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100 block">
                        {paper.name}
                      </span>
                      <span className="text-[11px] text-neutral-500 line-clamp-1">
                        {paper.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Typography Selection */}
          <section>
            <h4 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-3">
              Police de Caractères
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FONTS.map((font) => {
                const isSelected = currentFont === font.id;
                return (
                  <button
                    key={font.id}
                    onClick={() => onSelectFont(font.id)}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-neutral-900 dark:border-white ring-1 ring-neutral-900 dark:ring-white bg-neutral-50 dark:bg-neutral-800/50'
                        : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                        {font.name}
                      </span>
                      <span className="text-[10px] text-neutral-400">{font.category}</span>
                    </div>
                    <p className={`text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1 ${
                      font.id === 'cormorant' ? 'font-cormorant text-sm' :
                      font.id === 'lora' ? 'font-lora text-sm' :
                      font.id === 'jetbrains' ? 'font-jetbrains text-xs' : 'font-jakarta'
                    }`}>
                      {font.previewText}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Font Size Selection */}
          <section>
            <h4 className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-3">
              Taille du Texte
            </h4>
            <div className="flex items-center gap-2">
              {(
                [
                  { id: 'sm', label: 'Petite (16px)' },
                  { id: 'base', label: 'Normale (18px)' },
                  { id: 'lg', label: 'Grande (20px)' },
                  { id: 'xl', label: 'Confort (24px)' },
                ] as const
              ).map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSelectFontSize(s.id)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                    currentFontSize === s.id
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white'
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-md hover:bg-neutral-800 transition-colors"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};
