import React, { useState, useMemo } from 'react';
import { Search, Copy, Check, Quote as QuoteIcon, Sparkles } from 'lucide-react';
import { PASCAL_QUOTES, Quote } from '../data/pascalData';

interface PenseesGalleryProps {
  highlightedQuoteId?: string | null;
}

export const PenseesGallery: React.FC<PenseesGalleryProps> = ({ highlightedQuoteId }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredQuotes = useMemo(() => {
    return PASCAL_QUOTES.filter(q => {
      const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        q.quote.toLowerCase().includes(query) ||
        q.context.toLowerCase().includes(query) ||
        q.fragment.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopy = (quote: Quote) => {
    const textToCopy = `« ${quote.quote} » — Blaise Pascal, ${quote.source} (${quote.fragment})`;
    navigator.clipboard.writeText(textToCopy).catch(() => {});
    setCopiedId(quote.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <section id="pensees" className="py-24 border-b border-[#EBE6DF] bg-[#F7F4EE]/40">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs uppercase tracking-widest text-[#9A3412] font-semibold mb-2">
            Fragmentarium · Les Pensées & Opuscules
          </div>
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[#1C1917] tracking-tight">
            Florilège des Pensées
          </h2>
          <p className="mt-4 text-base lg:text-lg text-[#57534E] leading-relaxed">
            Fragments inachevés d'une <em>Apologie de la religion chrétienne</em> retrouvés cousus dans la doublure de son pourpoint après sa mort en 1662. Une plongée vertigineuse dans la condition humaine.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#EBE6DF]/70 rounded-lg overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === 'all' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Toutes ({PASCAL_QUOTES.length})
            </button>
            <button
              onClick={() => setSelectedCategory('condition')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === 'condition' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Condition humaine
            </button>
            <button
              onClick={() => setSelectedCategory('coeur')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === 'coeur' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Cœur & Raison
            </button>
            <button
              onClick={() => setSelectedCategory('divertissement')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === 'divertissement' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Le Divertissement
            </button>
            <button
              onClick={() => setSelectedCategory('infini')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === 'infini' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Les Deux Infinis
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29E]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher une citation ou un mot..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-white border border-[#EBE6DF] text-[#1C1917] placeholder-[#A8A29E] focus:outline-hidden focus:border-[#9A3412]"
            />
          </div>
        </div>

        {/* Quotes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {filteredQuotes.map(quote => {
            const isHighlighted = highlightedQuoteId === quote.id;

            return (
              <div
                key={quote.id}
                id={`quote-${quote.id}`}
                className={`bg-white border rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-xs transition-all duration-300 relative ${
                  isHighlighted
                    ? 'border-[#9A3412] ring-2 ring-[#9A3412]/30 shadow-md'
                    : 'border-[#EBE6DF] hover:border-[#D6CEBE]'
                }`}
              >
                <div>
                  {/* Clean unboxed metadata header */}
                  <div className="flex items-center justify-between gap-4 text-xs text-[#78716C] mb-4 pb-3 border-b border-[#F5F2EC]">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#9A3412]">{quote.categoryLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono text-[11px]">{quote.fragment}</span>
                    </div>

                    <button
                      onClick={() => handleCopy(quote)}
                      title="Copier la citation"
                      className="flex items-center gap-1 text-[11px] text-[#78716C] hover:text-[#1C1917] transition-colors p-1 rounded hover:bg-[#F7F4EE]"
                    >
                      {copiedId === quote.id ? (
                        <>
                          <Check size={13} className="text-emerald-600" />
                          <span className="text-emerald-700 font-medium">Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Quote Body with Editorial Typography */}
                  <blockquote className="font-serif text-lg sm:text-xl text-[#1C1917] leading-relaxed mb-4">
                    « {quote.quote} »
                  </blockquote>
                </div>

                {/* Historical Context Deck */}
                <div className="pt-4 border-t border-[#F5F2EC]">
                  <p className="text-xs text-[#57534E] leading-relaxed">
                    {quote.context}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty Search Fallback */}
        {filteredQuotes.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-[#EBE6DF]">
            <p className="font-serif text-lg text-[#57534E]">
              Aucun fragment ne correspond à votre recherche.
            </p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#9A3412] hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
