import React, { useState } from 'react';
import { Mountain, Compass, Wind, ArrowDown, Droplets } from 'lucide-react';

const puyDeDomeImg = '/src/assets/images/puy_de_dome_atmospheric_1792350876255.jpg';

export const PuyDeDomeExperiment: React.FC = () => {
  // Altitude in meters
  const [altitude, setAltitude] = useState<number>(1465); // Default to summit

  // Atmospheric physics formula: P(h) = P0 * exp(-M*g*h / (R*T))
  // Approximated: P(h) = 101325 * (1 - 2.25577e-5 * h)^5.25588
  const calculatePressure = (alt: number) => {
    const p0 = 101325; // Pa at sea level
    const pressurePa = p0 * Math.pow(1 - 0.0000225577 * alt, 5.25588);
    const pressureHpa = pressurePa / 100;
    const mmHg = (pressurePa / 133.322);
    const pouces = mmHg / 27.07; // 1 pouce de Paris c. 27.07 mm
    return {
      pa: Math.round(pressurePa),
      hpa: Math.round(pressureHpa * 10) / 10,
      mmHg: Math.round(mmHg * 10) / 10,
      pouces: Math.round(pouces * 10) / 10,
      weightKgPerCm2: (pressurePa / 98066.5).toFixed(3)
    };
  };

  const current = calculatePressure(altitude);

  // Mercury column height visualization (760mm max = 100%, 500mm = min)
  const mercuryHeightPercent = Math.max(20, Math.min(100, (current.mmHg / 760) * 100));

  const setLocation = (alt: number) => {
    setAltitude(alt);
  };

  return (
    <section id="pression" className="py-24 border-b border-[#EBE6DF] bg-[#F7F4EE]/60">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs uppercase tracking-widest text-[#9A3412] font-semibold mb-2">
            1648 · Expérience historique de la pesanteur de l'air
          </div>
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[#1C1917] tracking-tight">
            L'Expérience du Puy-de-Dôme & La Pression
          </h2>
          <p className="mt-4 text-base lg:text-lg text-[#57534E] leading-relaxed">
            Pour terrasser le dogme millénaire selon lequel « la nature a horreur du vide », Pascal imagine l'expérience décisive : si c'est la masse de l'atmosphère qui soutient le mercure de Torricelli, la colonne doit baisser au sommet d'une montagne.
          </p>
        </div>

        {/* 2-Column Balanced Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Visual Painting & Historical Narration (6 cols) */}
          <div className="lg:col-span-6 bg-white border border-[#EBE6DF] rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
            <div className="relative aspect-video overflow-hidden bg-stone-900">
              <img
                src={puyDeDomeImg}
                alt="Expérience barométrique au sommet du Puy-de-Dôme en septembre 1648 ordonnée par Blaise Pascal"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <span className="text-xs uppercase tracking-wider text-[#E6D5B8] font-mono">
                  19 Septembre 1648 · Auvergne
                </span>
                <div className="text-base font-serif font-bold text-white mt-0.5">
                  Florin Périer réalise les mesures au Puy-de-Dôme
                </div>
              </div>
            </div>

            <div className="p-6 text-sm text-[#44403C] space-y-4">
              <div className="text-xs uppercase tracking-widest text-[#78716C] font-semibold">
                Témoignage de Florin Périer à Blaise Pascal :
              </div>
              <blockquote className="font-serif italic text-[#1C1917] text-base leading-relaxed pl-4 border-l-2 border-[#9A3412]">
                « Nous fûmes ravis d'admiration et d'étonnement, et un sentiment si contraire à l'opinion reçue nous surprit tellement que nous voulûmes répéter l'épreuve cinq fois dans des lieux différents... »
              </blockquote>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Le tube témoin resté au couvent des Minimes à Clermont ne varia point, prouvant que seule l'altitude et la raréfaction de l'air expliquent la baisse du mercure.
              </p>
              
              <div className="pt-2 flex items-center gap-2 text-xs text-[#78716C]">
                <span>Hommage universel :</span>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#1C1917]">1 Pascal (Pa) = 1 N/m²</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Torricelli Barometer Simulator (6 cols) */}
          <div className="lg:col-span-6 bg-white border border-[#EBE6DF] rounded-xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#EBE6DF] mb-6">
                <div>
                  <h3 className="font-serif font-bold text-xl text-[#1C1917]">
                    Simulateur Barométrique de Pascal
                  </h3>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Variation de la colonne de vif-argent (mercure) selon l'altitude
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EBE6DF] text-[#9A3412]">
                  <Compass size={20} />
                </div>
              </div>

              {/* Altitude presets */}
              <div className="mb-6">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#57534E] block mb-2">
                  Lieux témoins de 1648 :
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setLocation(0)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      altitude === 0 ? 'bg-[#1C1917] text-white' : 'bg-[#F7F4EE] hover:bg-[#EBE6DF] text-[#44403C]'
                    }`}
                  >
                    Niveau de la mer (0 m)
                  </button>
                  <button
                    onClick={() => setLocation(400)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      altitude === 400 ? 'bg-[#1C1917] text-white' : 'bg-[#F7F4EE] hover:bg-[#EBE6DF] text-[#44403C]'
                    }`}
                  >
                    Clermont-Ferrand (400 m)
                  </button>
                  <button
                    onClick={() => setLocation(1465)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      altitude === 1465 ? 'bg-[#9A3412] text-white' : 'bg-[#F7F4EE] hover:bg-[#EBE6DF] text-[#44403C]'
                    }`}
                  >
                    Sommet Puy-de-Dôme (1 465 m)
                  </button>
                  <button
                    onClick={() => setLocation(2500)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                      altitude === 2500 ? 'bg-[#1C1917] text-white' : 'bg-[#F7F4EE] hover:bg-[#EBE6DF] text-[#44403C]'
                    }`}
                  >
                    Haute montagne (2 500 m)
                  </button>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-2 mb-8 bg-[#FAF8F5] p-4 rounded-xl border border-[#EBE6DF]">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-[#57534E] flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold">
                    <Mountain size={14} className="text-[#9A3412]" />
                    Altitude simulée :
                  </span>
                  <span className="font-mono tabular-nums text-lg font-bold text-[#1C1917]">
                    {altitude.toLocaleString('fr-FR')} mètres
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3500"
                  step="25"
                  value={altitude}
                  onChange={e => setAltitude(parseInt(e.target.value, 10))}
                  className="w-full accent-[#9A3412] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#A8A29E] font-mono">
                  <span>0 m (Océan)</span>
                  <span>1 465 m (Puy-de-Dôme)</span>
                  <span>3 500 m (Pics alpins)</span>
                </div>
              </div>

              {/* Physical Tube Visualizer + Realtime Readouts */}
              <div className="grid grid-cols-12 gap-4 items-center bg-[#FAF8F5] p-5 rounded-xl border border-[#EBE6DF]">
                
                {/* Mercury Glass Tube (4 cols) */}
                <div className="col-span-4 flex flex-col items-center">
                  <span className="text-[10px] uppercase font-mono text-[#78716C] mb-2 text-center">
                    Tube sous vide
                  </span>

                  {/* Glass Cylinder Container */}
                  <div className="relative w-10 h-52 bg-[#EBE6DF] rounded-t-full border-2 border-[#A8A29E] overflow-hidden shadow-inner flex flex-col justify-end p-1">
                    
                    {/* Vacuum Top (Le Vide de Pascal) */}
                    <div className="absolute top-2 inset-x-0 text-center">
                      <span className="text-[9px] font-mono uppercase text-[#78716C] font-semibold tracking-tighter">
                        Vide
                      </span>
                    </div>

                    {/* Mercury Liquid Level */}
                    <div
                      style={{ height: `${mercuryHeightPercent}%` }}
                      className="w-full bg-gradient-to-r from-[#94A3B8] via-[#CBD5E1] to-[#64748B] rounded-sm transition-all duration-300 shadow-md relative"
                    >
                      {/* Meniscus curvature */}
                      <div className="absolute -top-1 inset-x-0 h-1.5 bg-[#E2E8F0] rounded-full" />
                    </div>

                    {/* Reservoir basin at bottom */}
                  </div>
                  <span className="text-[10px] text-[#78716C] mt-2 font-mono tabular-nums">
                    {current.mmHg} mmHg
                  </span>
                </div>

                {/* Measurements Grid (8 cols) */}
                <div className="col-span-8 space-y-3">
                  <div className="p-3 bg-white rounded-lg border border-[#EBE6DF]">
                    <div className="text-[11px] uppercase tracking-wider text-[#78716C]">
                      Pression en Pascals (SI)
                    </div>
                    <div className="font-mono tabular-nums text-2xl font-bold text-[#1C1917]">
                      {current.pa.toLocaleString('fr-FR')} <span className="text-sm font-normal text-[#78716C]">Pa</span>
                    </div>
                    <div className="text-xs text-[#9A3412] font-mono tabular-nums mt-0.5">
                      {current.hpa.toLocaleString('fr-FR')} hPa (ou millibars)
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-[#EBE6DF]">
                      <span className="text-[10px] text-[#78716C] block uppercase font-mono">Hauteur de mercure</span>
                      <strong className="font-mono tabular-nums text-sm text-[#1C1917]">{current.mmHg} mm</strong>
                      <span className="block text-[10px] text-[#A8A29E] font-mono">~{current.pouces} pouces</span>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-[#EBE6DF]">
                      <span className="text-[10px] text-[#78716C] block uppercase font-mono">Pesanteur de l'air</span>
                      <strong className="font-mono tabular-nums text-sm text-[#1C1917]">{current.weightKgPerCm2}</strong>
                      <span className="block text-[10px] text-[#A8A29E]">kg / cm² au sol</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Insight */}
            <div className="mt-6 pt-4 border-t border-[#EBE6DF] text-xs text-[#78716C]">
              <strong>Conclusion de Pascal :</strong> « Le vide n'est pas impossible dans la nature, et elle n'en a point cette horreur qu'on lui suppose avec tant d'imagination. »
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
