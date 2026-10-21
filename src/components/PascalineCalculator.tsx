import React, { useState } from 'react';
import { RotateCcw, Volume2, VolumeX, Sparkles, Plus, Minus, Info } from 'lucide-react';
import { playMechanicalTick, playCascadeBell } from '../utils/audio';

const pascalineImg = '/src/assets/images/pascaline_calculator_1642_1792350875409.jpg';

const DIGIT_COLUMNS = [
  { label: 'Centaines de mille', weight: 100000 },
  { label: 'Dizaines de mille', weight: 10000 },
  { label: 'Milliers', weight: 1000 },
  { label: 'Centaines', weight: 100 },
  { label: 'Dizaines', weight: 10 },
  { label: 'Unités', weight: 1 },
];

export const PascalineCalculator: React.FC = () => {
  // Current values on each wheel [100000, 10000, 1000, 100, 10, 1]
  const [wheels, setWheels] = useState<number[]>([0, 0, 0, 0, 0, 0]);
  const [mode, setMode] = useState<'addition' | 'subtraction'>('addition');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeWheelIndex, setActiveWheelIndex] = useState<number | null>(null);
  const [sautoirActive, setSautoirActive] = useState<number | null>(null);
  const [inputVal, setInputVal] = useState<string>('');
  const [history, setHistory] = useState<string[]>([
    "Initialisation des 6 tambours d'affichage à zéro."
  ]);

  const currentTotal = wheels.reduce((acc, val, idx) => acc + val * DIGIT_COLUMNS[idx].weight, 0);

  const triggerSound = (pitch = 1) => {
    if (soundEnabled) {
      playMechanicalTick(pitch);
    }
  };

  const triggerBell = () => {
    if (soundEnabled) {
      playCascadeBell();
    }
  };

  // Add a single digit to a specific wheel position
  const rotateWheel = (wheelIdx: number, step: number) => {
    triggerSound(1 + (5 - wheelIdx) * 0.1);
    setActiveWheelIndex(wheelIdx);
    setTimeout(() => setActiveWheelIndex(null), 250);

    setWheels(prev => {
      const next = [...prev];
      let carry = mode === 'addition' ? step : -step;
      let currIdx = wheelIdx;

      let carryTriggered = false;

      while (carry !== 0 && currIdx >= 0) {
        const sum = next[currIdx] + carry;
        if (sum >= 10) {
          next[currIdx] = sum % 10;
          carry = Math.floor(sum / 10);
          carryTriggered = true;
          setSautoirActive(currIdx - 1);
          setTimeout(() => setSautoirActive(null), 500);
        } else if (sum < 0) {
          next[currIdx] = (sum + 10) % 10;
          carry = -1;
          carryTriggered = true;
        } else {
          next[currIdx] = sum;
          carry = 0;
        }
        currIdx--;
      }

      if (carryTriggered && soundEnabled) {
        setTimeout(triggerBell, 120);
      }

      return next;
    });

    const actionText = mode === 'addition' ? `+${step}` : `-${step}`;
    setHistory(prev => [
      `Roue des ${DIGIT_COLUMNS[wheelIdx].label.toLowerCase()} : impulsion de ${actionText} (Stylet appliqué)`,
      ...prev.slice(0, 5)
    ]);
  };

  // Direct addition of a number across wheels
  const handleAddDirectNumber = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(inputVal, 10);
    if (isNaN(num) || num <= 0) return;

    if (soundEnabled) triggerSound(1.2);

    setWheels(prev => {
      const current = prev.reduce((acc, v, idx) => acc + v * DIGIT_COLUMNS[idx].weight, 0);
      const target = mode === 'addition' ? (current + num) % 1000000 : Math.max(0, current - num);
      
      const str = target.toString().padStart(6, '0');
      const newWheels = str.split('').map(Number);

      if (soundEnabled) {
        setTimeout(triggerBell, 150);
      }
      return newWheels;
    });

    const opLabel = mode === 'addition' ? `Addition de ${num}` : `Soustraction de ${num}`;
    setHistory(prev => [
      `${opLabel} par engrenage mécanique`,
      ...prev.slice(0, 5)
    ]);
    setInputVal('');
  };

  // Zero out the machine (crown reset)
  const handleReset = () => {
    triggerSound(0.8);
    setWheels([0, 0, 0, 0, 0, 0]);
    setHistory(prev => ["Remise à zéro des cylindres par la clef régulatrice.", ...prev.slice(0, 5)]);
  };

  // Preset historical calculations
  const loadPreset = (title: string, value: number, note: string) => {
    triggerSound(1.1);
    const str = value.toString().padStart(6, '0');
    setWheels(str.split('').map(Number));
    setHistory(prev => [`[Scénario historique] ${title} : ${value} livres tournois (${note})`, ...prev.slice(0, 5)]);
  };

  return (
    <section id="pascaline" className="py-24 border-b border-[#EBE6DF] dark:border-[#292524] bg-[#F7F4EE]/50 dark:bg-[#1C1917]/50">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs uppercase tracking-widest text-[#9A3412] dark:text-[#D68C72] font-semibold mb-2">
            1642 · Première machine à calculer mécanique
          </div>
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[#1C1917] dark:text-[#FBF9F5] tracking-tight">
            La Pascaline Interactive
          </h2>
          <p className="mt-4 text-base lg:text-lg text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
            Conçue par Blaise Pascal à 19 ans pour assister son père commissaire des impôts à Rouen.
            Elle introduit le <em>sautoir</em>, une pièce révolutionnaire à gravité permettant la propagation automatique de la retenue sans bloquer les rouages.
          </p>
        </div>

        {/* Machine Casing Simulator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Visual & Interactive Brass Console (8 cols) */}
          <div className="lg:col-span-8 bg-[#2A1F18] dark:bg-[#292524] border border-[#453326] dark:border-[#44403C] rounded-xl shadow-xl overflow-hidden p-6 md:p-8 text-[#E6D5B8]">
            
            {/* Top Plate Status & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#523E2F]">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#C89B3C] font-semibold">
                  Cylindres d'Affichage Supérieurs
                </span>
                <p className="text-xs text-[#A89880] mt-0.5">
                  Fenêtres d'observation sous verre biseauté
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Mode Selector */}
                <div className="inline-flex rounded-md p-1 bg-[#1C140F] border border-[#523E2F]">
                  <button
                    onClick={() => { setMode('addition'); triggerSound(1); }}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                      mode === 'addition'
                        ? 'bg-[#C89B3C] text-[#1C140F] font-semibold shadow-xs'
                        : 'text-[#C7B79E] hover:text-[#FFF]'
                    }`}
                  >
                    Addition directe
                  </button>
                  <button
                    onClick={() => { setMode('subtraction'); triggerSound(1); }}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                      mode === 'subtraction'
                        ? 'bg-[#C89B3C] text-[#1C140F] font-semibold shadow-xs'
                        : 'text-[#C7B79E] hover:text-[#FFF]'
                    }`}
                  >
                    Complément à 9
                  </button>
                </div>

                {/* Sound Toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? "Couper le cliquetis sonore" : "Activer le cliquetis sonore"}
                  className="p-1.5 rounded bg-[#1C140F] text-[#C89B3C] hover:bg-[#38281D] transition-colors border border-[#523E2F]"
                >
                  {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>

                {/* Reset Button */}
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#1C140F] text-[#C7B79E] hover:text-white hover:bg-[#38281D] transition-colors border border-[#523E2F] text-xs font-medium"
                >
                  <RotateCcw size={13} />
                  <span>Mise à zéro</span>
                </button>
              </div>
            </div>

            {/* Display Windows (Lumières de lecture) */}
            <div className="py-8 bg-gradient-to-b from-[#1C140F] to-[#251A13] px-4 rounded-lg my-6 border border-[#3D2C20]">
              <div className="text-center mb-3">
                <span className="text-[11px] uppercase tracking-wider text-[#A89880]">
                  Valeur totale inscrite
                </span>
                <div className="font-mono tabular-nums text-4xl md:text-5xl font-bold tracking-widest text-[#F0E6D2] mt-1 drop-shadow-sm">
                  {currentTotal.toLocaleString('fr-FR')}
                </div>
              </div>

              {/* 6 Individual Apertures */}
              <div className="grid grid-cols-6 gap-2 sm:gap-4 max-w-xl mx-auto pt-2">
                {wheels.map((val, idx) => {
                  const displayDigit = mode === 'addition' ? val : 9 - val;
                  const isSautoir = sautoirActive === idx;
                  const isActive = activeWheelIndex === idx;

                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-14 sm:w-16 sm:h-18 rounded bg-[#0F0B08] border-2 flex items-center justify-center shadow-inner transition-all duration-200 relative overflow-hidden ${
                          isActive
                            ? 'border-[#E0B253] scale-105 shadow-[#E0B253]/20'
                            : isSautoir
                            ? 'border-[#9A3412] ring-2 ring-[#9A3412]/40'
                            : 'border-[#5A4332]'
                        }`}
                      >
                        {/* Roller Drum effect */}
                        <div className="text-center">
                          <span className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-[#E6D5B8]">
                            {displayDigit}
                          </span>
                          {mode === 'subtraction' && (
                            <span className="block text-[9px] text-[#8C7A68] -mt-1">
                              (compl. {val})
                            </span>
                          )}
                        </div>

                        {/* Metallic glare overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />
                      </div>

                      <span className="text-[10px] text-[#A89880] text-center mt-2 font-mono tabular-nums">
                        10^{5 - idx}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rotating Brass Star Wheels (Roues d'inscription à rayons) */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-widest text-[#C89B3C] font-semibold">
                  Roues d'Inscription à Rayons (Placez le stylet virtuel)
                </span>
                <span className="text-xs text-[#A89880] hidden sm:inline">
                  Cliquez sur un cran (0–9) pour tourner la roue
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {DIGIT_COLUMNS.map((col, wheelIdx) => (
                  <div
                    key={wheelIdx}
                    className="flex flex-col items-center p-3 rounded-lg bg-[#201712] border border-[#453326]"
                  >
                    <span className="text-[11px] font-medium text-[#C89B3C] text-center mb-2 line-clamp-1">
                      {col.label}
                    </span>

                    {/* Wheel Dial Graphic with Spokes */}
                    <div className="relative w-20 h-20 rounded-full border-4 border-[#C89B3C] bg-gradient-to-tr from-[#6E4B1F] via-[#9E7234] to-[#C89B3C] flex items-center justify-center shadow-md">
                      
                      {/* Center Hub */}
                      <div className="w-7 h-7 rounded-full bg-[#1C140F] border border-[#C89B3C] flex items-center justify-center z-10 shadow-xs">
                        <span className="text-[10px] font-mono font-bold text-[#E6D5B8]">
                          {wheels[wheelIdx]}
                        </span>
                      </div>

                      {/* Quick click controls to simulate stylus dragging */}
                      <button
                        onClick={() => rotateWheel(wheelIdx, 1)}
                        className="absolute -top-1 px-1.5 py-0.5 rounded text-[10px] bg-[#1C140F] text-[#C89B3C] hover:bg-[#3D2C20] border border-[#785427] font-mono tabular-nums"
                        title="Ajouter 1 cran"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => rotateWheel(wheelIdx, 5)}
                        className="absolute -bottom-1 px-1.5 py-0.5 rounded text-[10px] bg-[#1C140F] text-[#C89B3C] hover:bg-[#3D2C20] border border-[#785427] font-mono tabular-nums"
                        title="Ajouter 5 crans"
                      >
                        +5
                      </button>
                      <button
                        onClick={() => rotateWheel(wheelIdx, 9)}
                        className="absolute -left-1 px-1 py-0.5 rounded text-[9px] bg-[#1C140F] text-[#C89B3C] hover:bg-[#3D2C20] border border-[#785427] font-mono tabular-nums"
                        title="Ajouter 9 crans"
                      >
                        +9
                      </button>
                    </div>

                    {/* Spoke selector buttons */}
                    <div className="grid grid-cols-5 gap-1 mt-3 w-full">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
                        <button
                          key={digit}
                          onClick={() => rotateWheel(wheelIdx, digit)}
                          className="py-1 text-[10px] font-mono font-semibold rounded bg-[#2D2018] hover:bg-[#C89B3C] hover:text-[#1C140F] text-[#C7B79E] transition-colors text-center border border-[#453326]"
                        >
                          {digit}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Manual Amount Input */}
            <form onSubmit={handleAddDirectNumber} className="mt-8 pt-6 border-t border-[#453326] flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="pascaline-input" className="block text-xs uppercase tracking-wider text-[#A89880] mb-1">
                  Inscrire un montant direct (0 – 999 999)
                </label>
                <input
                  id="pascaline-input"
                  type="number"
                  min="1"
                  max="999999"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  placeholder="Ex : 1250"
                  className="w-full px-4 py-2 rounded bg-[#1C140F] border border-[#523E2F] text-white text-sm font-mono placeholder-[#6B5947] focus:outline-hidden focus:border-[#C89B3C]"
                />
              </div>

              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#C89B3C] hover:bg-[#DDB152] active:scale-[0.98] text-[#1C140F] font-semibold text-xs uppercase tracking-wider transition-all shadow-sm"
                >
                  {mode === 'addition' ? 'Ajouter au registre' : 'Soustraire'}
                </button>
              </div>
            </form>

            {/* Presets Row */}
            <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[#A89880]">Exemples historiques de Rouen (1645) :</span>
              <button
                onClick={() => loadPreset("Impôt foncier de Haute-Normandie", 2840, "Calcul des tailles royales")}
                className="px-2.5 py-1 rounded bg-[#201712] hover:bg-[#3D2C20] text-[#E6D5B8] border border-[#453326] transition-colors"
              >
                Taille royale : 2 840 livres
              </button>
              <button
                onClick={() => loadPreset("Registre de douane maritime", 14750, "Droits portuaires sur la Seine")}
                className="px-2.5 py-1 rounded bg-[#201712] hover:bg-[#3D2C20] text-[#E6D5B8] border border-[#453326] transition-colors"
              >
                Douane de Rouen : 14 750 livres
              </button>
            </div>

          </div>

          {/* Curatorial & Technical Explanations (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Museum Artifact Showcase */}
            <div className="bg-white border border-[#EBE6DF] rounded-xl overflow-hidden shadow-xs">
              <div className="relative aspect-video overflow-hidden bg-stone-900">
                <img
                  src={pascalineImg}
                  alt="La Pascaline originale de 1642 par Blaise Pascal conservée au Musée des Arts et Métiers"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[11px] uppercase tracking-widest text-[#E6D5B8] font-mono">
                    Artéfact Musée des Arts & Métiers
                  </span>
                  <div className="text-sm font-serif font-semibold">
                    Modèle authentique en laiton & noyer (c. 1652)
                  </div>
                </div>
              </div>

              <div className="p-5 text-sm">
                <div className="flex items-center gap-2 text-xs text-[#78716C] mb-3">
                  <span>Inventeur : Blaise Pascal</span>
                  <span aria-hidden="true">·</span>
                  <span>Privilège royal : 1649</span>
                </div>
                <p className="text-[#44403C] leading-relaxed text-xs">
                  Avant la Pascaline, les calculateurs utilisaient des jetons sur des abaques. Blaise conçoit plus de 50 prototypes avant d'obtenir la fiabilité désirée avec son cliquet à gravité.
                </p>
              </div>
            </div>

            {/* Le Sautoir Mechanism Deep Dive */}
            <div className="bg-white border border-[#EBE6DF] rounded-xl p-5 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9A3412] mb-2">
                <Sparkles size={14} />
                <span>L'Invention du Sautoir</span>
              </div>
              <h3 className="text-base font-serif font-bold text-[#1C1917] mb-2">
                La retenue par gravité
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Le défi des calculatrices mécaniques était le blocage : faire tourner simultanément plusieurs roues lors d'une retenue en cascade (ex. 99 999 + 1) demandait une force impossible.
              </p>
              <div className="mt-3 p-3 bg-[#FBF9F5] rounded border border-[#EBE6DF] text-xs text-[#57534E] space-y-1">
                <div className="font-semibold text-[#1C1917]">Principe mécanique :</div>
                <div>1. La roue en tournant de 6 à 9 soulève progressivement un cliquet lourd.</div>
                <div>2. Au passage du 9 vers le 0, le cliquet chute par gravité pure.</div>
                <div>3. La force de chute pousse la roue suivante d'un cran exact.</div>
              </div>
            </div>

            {/* Live History Journal */}
            <div className="bg-white border border-[#EBE6DF] rounded-xl p-5 shadow-xs">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#57534E] mb-2">
                Journal des impulsions mécaniques
              </div>
              <div className="space-y-1.5 font-mono text-[11px] text-[#78716C] max-h-36 overflow-y-auto">
                {history.map((log, i) => (
                  <div key={i} className="py-1 border-b border-[#F5F2EC] last:border-0 leading-tight">
                    {log}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
