import React, { useState } from 'react';
import { TIMELINE_EVENTS } from '../data/pascalData';
import { Bus, Clock, Calendar, Sparkles } from 'lucide-react';

export const TimelineSection: React.FC = () => {
  const [activeDomain, setActiveDomain] = useState<string>('all');

  const filteredEvents = TIMELINE_EVENTS.filter(
    e => activeDomain === 'all' || e.domain === activeDomain
  );

  return (
    <section id="chronologie" className="py-24 border-b border-[#EBE6DF] bg-[#FBF9F5]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs uppercase tracking-widest text-[#9A3412] font-semibold mb-2">
            1623 – 1662 · Trente-neuf années fulgurantes
          </div>
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[#1C1917] tracking-tight">
            Chronologie d'un Destin Prodigieux
          </h2>
          <p className="mt-4 text-base lg:text-lg text-[#57534E] leading-relaxed">
            De l'enfant surdoué démontrant Euclide en cachette au précurseur des transports collectifs modernes,
            Blaise Pascal a révolutionné chaque discipline qu'il a effleurée.
          </p>
        </div>

        {/* Domain Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-[#EBE6DF]/70 rounded-lg overflow-x-auto max-w-full mb-10 w-fit">
          {['all', 'Mathématiques', 'Invention', 'Physique', 'Philosophie', 'Société'].map(dom => (
            <button
              key={dom}
              onClick={() => setActiveDomain(dom)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeDomain === dom ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              {dom === 'all' ? 'Toutes les disciplines' : dom}
            </button>
          ))}
        </div>

        {/* Timeline River */}
        <div className="relative border-l-2 border-[#EBE6DF] ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-12">
          {filteredEvents.map((evt, idx) => (
            <div key={idx} className="relative group">
              
              {/* Dot marker */}
              <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#9A3412] group-hover:bg-[#9A3412] transition-colors" />

              {/* Year and Domain unboxed */}
              <div className="flex items-center gap-2 text-xs text-[#78716C] mb-1">
                <span className="font-mono font-bold text-sm text-[#9A3412] tabular-nums">
                  {evt.year}
                </span>
                <span aria-hidden="true">·</span>
                <span className="uppercase tracking-wider font-medium text-[11px]">
                  {evt.domain}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-serif font-bold text-[#1C1917] mb-2 group-hover:text-[#9A3412] transition-colors">
                {evt.title}
              </h3>
              <p className="text-sm text-[#57534E] leading-relaxed max-w-2xl">
                {evt.description}
              </p>
            </div>
          ))}
        </div>

        {/* Focus Feature: Les Carrosses à Cinq Sols (1662) */}
        <div className="mt-16 bg-white border border-[#EBE6DF] rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9A3412]">
                <Bus size={15} />
                <span>Le saviez-vous ? Paris, 18 mars 1662</span>
              </div>
              <h3 className="font-serif font-bold text-2xl text-[#1C1917]">
                L'Invention du Transport Public : Les Carrosses à Cinq Sols
              </h3>
              <p className="text-sm text-[#57534E] leading-relaxed">
                Avant sa mort prématurée, Pascal s'associe au duc de Roannez pour créer le <strong>premier réseau de transport urbain en commun du monde</strong>. Cinq lignes régulières traversent Paris (de la porte Saint-Antoine au Luxembourg), avec départ à heure fixe, même à vide, pour un tarif modique de 5 sols.
              </p>
              <div className="text-xs text-[#78716C] pt-1">
                Les profits étaient reversés aux pauvres de Paris et de Blois, conformément aux vœux charitables du philosophe.
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#F7F4EE] p-5 rounded-lg border border-[#EBE6DF] text-xs space-y-2">
              <div className="font-semibold text-[#1C1917]">Caractéristiques révolutionnaires :</div>
              <div className="flex items-center gap-2 text-[#57534E]">
                <Clock size={13} className="text-[#9A3412] shrink-0" />
                <span>Horaires réguliers programmés</span>
              </div>
              <div className="flex items-center gap-2 text-[#57534E]">
                <Calendar size={13} className="text-[#9A3412] shrink-0" />
                <span>Itinéraires fixes prédéterminés</span>
              </div>
              <div className="flex items-center gap-2 text-[#57534E]">
                <Sparkles size={13} className="text-[#9A3412] shrink-0" />
                <span>Tarif unique abordable (5 sols)</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
