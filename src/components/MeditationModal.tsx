import React from 'react';
import { X, RefreshCw, Copy, Check, Quote as QuoteIcon } from 'lucide-react';
import { Quote } from '../data/pascalData';

interface MeditationModalProps {
  quote: Quote | null;
  isOpen: boolean;
  onClose: () => void;
  onShuffle: () => void;
}

export const MeditationModal: React.FC<MeditationModalProps> = ({
  quote,
  isOpen,
  onClose,
  onShuffle,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !quote) return null;

  const handleCopy = () => {
    const text = `« ${quote.quote} » — Blaise Pascal (${quote.fragment})`;
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      
      {/* Backdrop click to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-[#FBF9F5] border border-[#D6CEBE] rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl z-10 text-[#1C1917]">
        
        {/* Header bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EBE6DF]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9A3412]">
            <QuoteIcon size={16} />
            <span>Méditation du Jour · Pensées</span>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#78716C] hover:text-[#1C1917] hover:bg-[#EBE6DF]/50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="py-6">
          <div className="text-xs text-[#78716C] mb-3 flex items-center gap-2">
            <span>{quote.categoryLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-[11px]">{quote.fragment}</span>
          </div>

          <blockquote className="font-serif italic text-xl sm:text-2xl text-[#1C1917] leading-relaxed mb-4">
            « {quote.quote} »
          </blockquote>

          <p className="text-xs text-[#57534E] leading-relaxed bg-[#F7F4EE] p-3.5 rounded-lg border border-[#EBE6DF]">
            {quote.context}
          </p>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-[#EBE6DF] flex items-center justify-between">
          <button
            onClick={onShuffle}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#EBE6DF]/60 hover:bg-[#EBE6DF] text-[#1C1917] transition-colors"
          >
            <RefreshCw size={14} />
            <span>Autre pensée</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#D6CEBE] hover:bg-white text-[#1C1917] transition-colors"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-600" />
                  <span className="text-emerald-700">Copié</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>Copier</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#1C1917] hover:bg-[#78350F] text-[#FBF9F5] transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
