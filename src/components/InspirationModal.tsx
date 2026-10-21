import React, { useState } from 'react';
import { WRITING_SPARKS, WritingSpark } from '../utils/prompts';
import { X, Sparkles, Plus, Shuffle, ArrowRight } from 'lucide-react';

interface InspirationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertPrompt: (promptText: string) => void;
}

export const InspirationModal: React.FC<InspirationModalProps> = ({
  isOpen,
  onClose,
  onInsertPrompt,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('Tous');
  const [randomSpark, setRandomSpark] = useState<WritingSpark | null>(null);

  if (!isOpen) return null;

  const categories = ['Tous', 'Incipit', 'Sensations', 'Mystère', 'Philosophie', 'Micro-nouvelle'];

  const filteredSparks = activeCategory === 'Tous'
    ? WRITING_SPARKS
    : WRITING_SPARKS.filter(s => s.category === activeCategory);

  const drawRandom = () => {
    const idx = Math.floor(Math.random() * WRITING_SPARKS.length);
    setRandomSpark(WRITING_SPARKS[idx]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                Vaincre la Page Blanche
              </h3>
              <p className="text-xs text-neutral-500">
                Laissez-vous guider par une étincelle poétique ou narrative.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories Tab Bar */}
        <div className="px-6 py-2.5 border-b border-neutral-200/70 dark:border-neutral-800/70 flex items-center gap-2 overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={drawRandom}
            className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-medium hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Tirage au sort</span>
          </button>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3.5">
          {randomSpark && (
            <div className="p-4 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 mb-4 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-amber-800 dark:text-amber-400 mb-2 font-medium">
                <span>Tirage du moment · {randomSpark.category}</span>
                <span className="text-[11px] opacity-75">{randomSpark.context}</span>
              </div>
              <p className="font-cormorant text-lg italic text-neutral-900 dark:text-neutral-100 mb-3">
                « {randomSpark.text} »
              </p>
              <button
                onClick={() => {
                  onInsertPrompt(randomSpark.text);
                  onClose();
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-amber-900 dark:text-amber-200 hover:underline"
              >
                <span>Insérer sur la page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {filteredSparks.map((spark) => (
            <div
              key={spark.id}
              className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {spark.category}
                </span>
                <span className="text-[11px]">{spark.context}</span>
              </div>
              <p className="font-cormorant text-base md:text-lg text-neutral-800 dark:text-neutral-200 mb-3 leading-relaxed">
                « {spark.text} »
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    onInsertPrompt(spark.text);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white px-2.5 py-1 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Commencer avec cette phrase</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
