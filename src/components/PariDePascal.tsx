import React, { useState } from 'react';
import { Scale, CheckCircle2, AlertCircle, Sparkles, BookOpen } from 'lucide-react';

export const PariDePascal: React.FC = () => {
  // Subjective probability p that God exists (from 0.01 to 0.99)
  const [prob, setProb] = useState<number>(0.5);
  // Value placed on earthly pleasures sacrificed
  const [stakeCost, setStakeCost] = useState<number>(50);

  // Expected Value of believing: p * (+Infinity) - (1-p) * stakeCost = +Infinity
  // Expected Value of not believing: p * (-Infinity) + (1-p) * worldlyEnjoyment = -Infinity
  const isInfinityDominant = prob > 0;

  return (
    <section id="pari" className="py-24 border-b border-[#EBE6DF] bg-[#FBF9F5]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs uppercase tracking-widest text-[#9A3412] font-semibold mb-2">
            Pensées · Fragment 418 « Infini rien »
          </div>
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[#1C1917] tracking-tight">
            Le Pari de Pascal
          </h2>
          <p className="mt-4 text-base lg:text-lg text-[#57534E] leading-relaxed">
            Considéré par les mathématiciens et économistes comme le premier texte fondateur de la théorie de la décision et de l'utilité espérée.
            « Vous êtes embarqué : il faut gager, ce n'est pas volontaire. »
          </p>
        </div>

        {/* Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Decision Matrix & Interactive Math (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#EBE6DF] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-[#EBE6DF]">
              <div>
                <h3 className="font-serif font-bold text-xl text-[#1C1917]">
                  Matrice de Décision Binaire
                </h3>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Analyse des gains et des pertes selon le choix de vie
                </p>
              </div>
              <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EBE6DF] text-[#9A3412]">
                <Scale size={20} />
              </div>
            </div>

            {/* The 2x2 Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse min-w-[420px]">
                <thead>
                  <tr className="border-b border-[#EBE6DF]">
                    <th className="p-3 text-[#78716C] uppercase font-mono tracking-wider">Choix / Vérité</th>
                    <th className="p-3 bg-[#FAF8F5] font-semibold text-[#1C1917]">Dieu existe (Probabilité p)</th>
                    <th className="p-3 bg-[#FAF8F5] font-semibold text-[#1C1917]">Dieu n'existe pas (1 - p)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE6DF]">
                  <tr className="bg-emerald-50/50 hover:bg-emerald-50 transition-colors">
                    <td className="p-3 font-semibold text-[#1C1917] border-r border-[#EBE6DF]">
                      <span className="block text-[#15803D] font-bold">Parier pour Dieu</span>
                      <span className="text-[11px] text-[#57534E]">Vivre dans la vertu et la foi</span>
                    </td>
                    <td className="p-3 text-emerald-900 font-semibold border-r border-[#EBE6DF]">
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                        <span>Gain Infini (+∞)</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 block mt-0.5">Félicité éternelle</span>
                    </td>
                    <td className="p-3 text-[#57534E]">
                      <span className="font-mono tabular-nums text-stone-800">Perte minime finie (-{stakeCost})</span>
                      <span className="text-[11px] text-[#78716C] block mt-0.5">Quelques plaisirs futiles sacrifiés</span>
                    </td>
                  </tr>

                  <tr className="bg-rose-50/30 hover:bg-rose-50 transition-colors">
                    <td className="p-3 font-semibold text-[#1C1917] border-r border-[#EBE6DF]">
                      <span className="block text-[#B91C1C] font-bold">Parier contre Dieu</span>
                      <span className="text-[11px] text-[#57534E]">Vivre dans le libertinage</span>
                    </td>
                    <td className="p-3 text-rose-900 font-semibold border-r border-[#EBE6DF]">
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        <AlertCircle size={16} className="text-rose-600 shrink-0" />
                        <span>Perte Infinie (-∞)</span>
                      </div>
                      <span className="text-[11px] text-rose-700 block mt-0.5">Damnation / Ruine éternelle</span>
                    </td>
                    <td className="p-3 text-[#57534E]">
                      <span className="font-mono tabular-nums text-stone-800">Gain fini éphémère (+{stakeCost})</span>
                      <span className="text-[11px] text-[#78716C] block mt-0.5">Jouissances terrestres passagères</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Slider for Subjective Probability */}
            <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#EBE6DF] space-y-4">
              <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-[#57534E]">
                <span>Probabilité subjective accordée à l'existence de Dieu (p) :</span>
                <span className="font-mono text-sm text-[#9A3412] font-bold">{Math.round(prob * 100)} %</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.99"
                step="0.01"
                value={prob}
                onChange={e => setProb(parseFloat(e.target.value))}
                className="w-full accent-[#9A3412] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#A8A29E] font-mono">
                <span>0.01 (Sceptique absolu)</span>
                <span>0.50 (Doute égal)</span>
                <span>0.99 (Quasi-certitude)</span>
              </div>
            </div>

            {/* Expected Utility Verdict */}
            <div className="p-4 bg-[#FBF9F5] rounded-xl border border-[#9A3412]/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9A3412]">
                <Sparkles size={14} />
                <span>Calcul mathématique de l'espérance mathématique (E)</span>
              </div>
              <div className="font-mono text-xs text-[#1C1917] bg-white p-3 rounded border border-[#EBE6DF] leading-relaxed">
                E(Parier pour Dieu) = {prob.toFixed(2)} × (+∞) - {(1 - prob).toFixed(2)} × {stakeCost} = <strong className="text-[#15803D] text-sm">+∞ (Infini)</strong>
                <br />
                E(Parier contre) = {prob.toFixed(2)} × (-∞) + {(1 - prob).toFixed(2)} × {stakeCost} = <strong className="text-[#B91C1C] text-sm">-∞ (Négatif infini)</strong>
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed pt-1">
                Dès lors que la probabilité <em>p</em> n'est pas rigoureusement nulle ($p &gt; 0$), le produit d'une probabilité finie par un gain infini surpasse toute mise finie.
              </p>
            </div>

          </div>

          {/* Right Column: Historical Text & Philosophical Analysis (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* The Original Text Excerpt */}
            <div className="bg-white border border-[#EBE6DF] rounded-xl p-6 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-3">
                <BookOpen size={14} className="text-[#9A3412]" />
                <span>Extrait original manuscrit</span>
              </div>
              <blockquote className="font-serif italic text-sm text-[#1C1917] leading-relaxed space-y-3">
                <p>
                  « Pesons le gain et la perte, en prenant croix que Dieu est. Estimons ces deux cas : si vous gagnez, vous gagnez tout ; si vous perdez, vous ne perdez rien. Gagez donc qu'il est, sans hésiter. »
                </p>
                <p>
                  « Cela est démonstratif ; et si les hommes sont capables de quelque vérité, celle-là en est une. »
                </p>
              </blockquote>
              <div className="mt-4 pt-3 border-t border-[#EBE6DF] text-[11px] text-[#78716C] font-mono">
                Blaise Pascal · Pensées (c. 1658)
              </div>
            </div>

            {/* Why This Revolutionized Modern Economics */}
            <div className="bg-white border border-[#EBE6DF] rounded-xl p-6 shadow-xs">
              <h4 className="font-serif font-bold text-base text-[#1C1917] mb-2">
                Aux origines de la théorie des jeux
              </h4>
              <p className="text-xs text-[#57534E] leading-relaxed mb-3">
                Avant Pascal, la raison philosophique cherchait à démontrer l'existence de Dieu par des preuves métaphysiques abstraites (preuves cosmologiques ou ontologiques).
              </p>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Pascal opère un basculement radical : il transfère la question du terrain de la <strong>certitude métaphysique</strong> vers celui de la <strong>décision rationnelle en univers d'incertitude</strong>. Trois siècles avant John von Neumann et Oskar Morgenstern, la notion d'espérance d'utilité était née.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
