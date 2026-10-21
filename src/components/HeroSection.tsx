import React from 'react';
import { Compass, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

const portraitImg = '/src/assets/images/portrait_blaise_pascal_1792350874618.jpg';

interface HeroSectionProps {
  onExplore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore }) => {
  return (
    <section id="haut" className="pt-12 pb-20 border-b border-[#EBE6DF] dark:border-[#292524] bg-[#FBF9F5] dark:bg-[#1C1917]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Curatorial Kicker */}
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#78716C] dark:text-[#A8A29E] mb-6">
          <span>Monographie Curatée</span>
          <span aria-hidden="true">·</span>
          <span>Siècle Classique Français</span>
          <span aria-hidden="true">·</span>
          <span>1623 – 1662</span>
        </div>

        {/* 2-Column Split: Editorial Monograph Intro + Oil Portrait */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          {/* Left Column: Text & Intellectual Rigor (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#1C1917] dark:text-[#FBF9F5] leading-[1.08] text-balance">
                Blaise Pascal
              </h1>
              <p className="font-serif italic text-xl sm:text-2xl text-[#9A3412] dark:text-[#D68C72] mt-2 mb-6">
                Le Roseau Pensant & L'Esprit de Finesse
              </p>

              {/* Editorial prose with drop cap */}
              <div className="text-base sm:text-lg text-[#44403C] dark:text-[#D6D3D1] leading-relaxed max-w-2xl space-y-4">
                <p className="first-letter:text-5xl first-letter:font-serif first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#9A3412] dark:first-letter:text-[#D68C72]">
                  Mathématicien visionnaire à seize ans, inventeur de la première machine arithmétique mécanique à dix-neuf, expérimentateur du vide sur le Puy-de-Dôme, pionnier du calcul des probabilités et prosateur incomparable des <em>Pensées</em>, Blaise Pascal incarne l'alliance souveraine de la rigueur géométrique et de la profondeur spirituelle.
                </p>
                <p className="text-sm text-[#57534E] dark:text-[#A8A29E]">
                  Cette page interactive vous invite à faire fonctionner sa <strong>Pascaline de 1642</strong>, à explorer les fractales de son <strong>Triangle arithmétique</strong>, à mesurer la colonne de mercure du baromètre et à sonder l'espérance mathématique de son célèbre <strong>Pari</strong>.
                </p>
              </div>
            </div>

            {/* Action Buttons & Accession Info */}
            <div className="pt-8 mt-6 border-t border-[#EBE6DF] dark:border-[#292524]">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <a
                  href="#pascaline"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1C1917] dark:bg-[#FBF9F5] hover:bg-[#78350F] dark:hover:bg-[#D6CEBE] text-[#FBF9F5] dark:text-[#1C1917] text-xs font-semibold uppercase tracking-wider transition-all shadow-xs"
                >
                  <span>Tester la Pascaline</span>
                  <ArrowRight size={14} />
                </a>
                <a
                  href="#triangle"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white dark:bg-[#292524] hover:bg-[#F7F4EE] dark:hover:bg-[#44403C] border border-[#D6CEBE] dark:border-[#44403C] text-[#1C1917] dark:text-[#FBF9F5] text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <span>Triangle de Pascal</span>
                </a>
                <a
                  href="#pression"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white dark:bg-[#292524] hover:bg-[#F7F4EE] dark:hover:bg-[#44403C] border border-[#D6CEBE] dark:border-[#44403C] text-[#1C1917] dark:text-[#FBF9F5] text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  <span>Pression barométrique</span>
                </a>
              </div>

              {/* Museum Accession Metadata definition */}
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#78716C] dark:text-[#A8A29E]">
                <div>
                  <dt className="uppercase font-mono text-[10px] text-[#A8A29E] dark:text-[#78716C]">Naissance</dt>
                  <dd className="font-medium text-[#1C1917] dark:text-[#FBF9F5] mt-0.5">19 juin 1623 · Clermont</dd>
                </div>
                <div>
                  <dt className="uppercase font-mono text-[10px] text-[#A8A29E] dark:text-[#78716C]">Mort</dt>
                  <dd className="font-medium text-[#1C1917] dark:text-[#FBF9F5] mt-0.5">19 août 1662 · Paris</dd>
                </div>
                <div>
                  <dt className="uppercase font-mono text-[10px] text-[#A8A29E] dark:text-[#78716C]">Unité SI</dt>
                  <dd className="font-medium text-[#1C1917] dark:text-[#FBF9F5] mt-0.5">Pascal (Pa = N/m²)</dd>
                </div>
                <div>
                  <dt className="uppercase font-mono text-[10px] text-[#A8A29E] dark:text-[#78716C]">Langage</dt>
                  <dd className="font-medium text-[#1C1917] dark:text-[#FBF9F5] mt-0.5">Pascal (Wirth, 1970)</dd>
                </div>
              </dl>
            </div>

          </div>

          {/* Right Column: Oil Portrait in Fine Museum Frame (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="bg-white dark:bg-[#292524] p-3 sm:p-4 rounded-xl border border-[#D6CEBE] dark:border-[#44403C] shadow-md">
              <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-stone-900 border border-[#EBE6DF] dark:border-[#44403C]">
                <img
                  src={portraitImg}
                  alt="Portrait à l'huile de Blaise Pascal attribué à l'atelier de Philippe de Champaigne"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 text-white text-xs">
                  <div className="font-serif italic text-sm">
                    « L'homme passe infiniment l'homme »
                  </div>
                </div>
              </div>
              <div className="pt-3 px-1 flex items-center justify-between text-[11px] text-[#78716C] dark:text-[#A8A29E]">
                <span>Portrait classique · Huile sur toile</span>
                <span className="font-mono text-[10px]">XVIIe Siècle</span>
              </div>
            </div>
          </div>

        </div>

        {/* 4-Column Historical Impact Strip */}
        <div className="mt-16 pt-10 border-t border-[#EBE6DF] dark:border-[#292524] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 bg-white dark:bg-[#292524] rounded-lg border border-[#EBE6DF] dark:border-[#44403C]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#9A3412] dark:text-[#D68C72] font-semibold block">1642 · Informatique</span>
            <div className="font-serif font-bold text-lg text-[#1C1917] dark:text-[#FBF9F5] mt-1">La Pascaline</div>
            <p className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1">
              Première calculatrice mécanique opérationnelle à retenue automatique.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-[#292524] rounded-lg border border-[#EBE6DF] dark:border-[#44403C]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#9A3412] dark:text-[#D68C72] font-semibold block">1648 · Physique</span>
            <div className="font-serif font-bold text-lg text-[#1C1917] dark:text-[#FBF9F5] mt-1">Pesanteur de l'Air</div>
            <p className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1">
              Réfutation de l'horreur du vide et mesure barométrique au Puy-de-Dôme.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-[#292524] rounded-lg border border-[#EBE6DF] dark:border-[#44403C]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#9A3412] dark:text-[#D68C72] font-semibold block">1654 · Mathématiques</span>
            <div className="font-serif font-bold text-lg text-[#1C1917] dark:text-[#FBF9F5] mt-1">Théorie des Hasards</div>
            <p className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1">
              Correspondance avec Fermat fondant le calcul moderne des probabilités.
            </p>
          </div>

          <div className="p-4 bg-white dark:bg-[#292524] rounded-lg border border-[#EBE6DF] dark:border-[#44403C]">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#9A3412] dark:text-[#D68C72] font-semibold block">1662 · Urbanisme</span>
            <div className="font-serif font-bold text-lg text-[#1C1917] dark:text-[#FBF9F5] mt-1">Carrosses à 5 Sols</div>
            <p className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1">
              Création à Paris du premier réseau de transports en commun au monde.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
