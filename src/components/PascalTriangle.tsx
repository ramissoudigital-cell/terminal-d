import React, { useState, useMemo } from 'react';
import { Eye, Calculator, Sparkles, Binary } from 'lucide-react';

// Generates Pascal Triangle matrix up to row maxRows
function generatePascalTriangle(maxRows: number): number[][] {
  const triangle: number[][] = [];
  for (let r = 0; r < maxRows; r++) {
    const row: number[] = new Array(r + 1).fill(1);
    for (let c = 1; c < r; c++) {
      row[c] = triangle[r - 1][c - 1] + triangle[r - 1][c];
    }
    triangle.push(row);
  }
  return triangle;
}

function factorial(n: number): number {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function isPrime(num: number): boolean {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

export const PascalTriangle: React.FC = () => {
  const [rowsCount, setRowsCount] = useState<number>(10);
  const [activeFilter, setActiveFilter] = useState<'none' | 'modulo2' | 'modulo3' | 'primes' | 'diagonals'>('modulo2');
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>({ r: 5, c: 2 });

  const triangle = useMemo(() => generatePascalTriangle(rowsCount), [rowsCount]);

  // Selected cell calculations
  const cellInfo = useMemo(() => {
    if (!selectedCell) return null;
    const { r, c } = selectedCell;
    const val = triangle[r]?.[c] ?? 1;
    const parent1 = (r > 0 && c > 0) ? triangle[r - 1][c - 1] : null;
    const parent2 = (r > 0 && c < r) ? triangle[r - 1][c] : null;
    return {
      n: r,
      k: c,
      val,
      parent1,
      parent2,
      formula: `C(${r}, ${c}) = ${r}! / (${c}! × ${r - c}!) = ${val}`
    };
  }, [selectedCell, triangle]);

  const getCellColor = (r: number, c: number, val: number): string => {
    const isSelected = selectedCell?.r === r && selectedCell?.c === c;
    const isParent1 = selectedCell?.r === r + 1 && selectedCell?.c === c + 1;
    const isParent2 = selectedCell?.r === r + 1 && selectedCell?.c === c;

    if (isSelected) {
      return 'bg-[#9A3412] text-white ring-2 ring-[#78350F] scale-110 z-20 font-bold';
    }
    if (isParent1 || isParent2) {
      return 'bg-[#EA580C]/20 border-[#EA580C] text-[#9A3412] font-bold ring-1 ring-[#EA580C]';
    }

    switch (activeFilter) {
      case 'modulo2':
        // Sierpinski Gasket: Odd numbers stand out
        return val % 2 !== 0
          ? 'bg-[#9A3412] text-[#FBF9F5] font-semibold'
          : 'bg-[#EBE6DF]/40 text-[#78716C]';

      case 'modulo3':
        if (val % 3 === 1) return 'bg-[#B45309] text-white font-medium';
        if (val % 3 === 2) return 'bg-[#1E3A8A] text-white font-medium';
        return 'bg-[#EBE6DF]/30 text-[#A8A29E]';

      case 'primes':
        // Row n prime test
        if (isPrime(r) && c > 0 && c < r) {
          return 'bg-[#15803D] text-white font-semibold';
        }
        return 'bg-[#F5F2EC] text-[#44403C]';

      case 'diagonals':
        if (c === 0 || c === r) return 'bg-stone-200 text-stone-700'; // 1s
        if (c === 1 || c === r - 1) return 'bg-blue-100 text-blue-900 font-semibold'; // Natural numbers
        if (c === 2 || c === r - 2) return 'bg-amber-100 text-amber-900 font-semibold'; // Triangular
        if (c === 3 || c === r - 3) return 'bg-emerald-100 text-emerald-900 font-semibold'; // Tetrahedral
        return 'bg-[#F5F2EC] text-[#44403C]';

      default:
        return 'bg-white hover:bg-[#F5F2EC] text-[#1C1917] border border-[#EBE6DF]';
    }
  };

  return (
    <section id="triangle" className="py-24 border-b border-[#EBE6DF] bg-[#FBF9F5]">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="text-xs uppercase tracking-widest text-[#9A3412] font-semibold mb-2">
            1654 · Traité du triangle arithmétique
          </div>
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-[#1C1917] tracking-tight">
            Le Triangle de Pascal Vivant
          </h2>
          <p className="mt-4 text-base lg:text-lg text-[#57534E] leading-relaxed">
            Bien plus qu'une table combinatoire, ce triangle recèle les fondements des probabilités modernes,
            du binôme de Newton et des géométries fractales découvertes des siècles plus tard.
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-6 p-4 bg-[#F7F4EE] rounded-xl border border-[#EBE6DF] mb-8">
          
          {/* Depth Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#57534E]">
              Profondeur ({rowsCount} lignes) :
            </span>
            <input
              type="range"
              min="4"
              max="13"
              value={rowsCount}
              onChange={e => setRowsCount(parseInt(e.target.value, 10))}
              className="accent-[#9A3412] cursor-pointer"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#EBE6DF]/70 rounded-lg overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveFilter('modulo2')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeFilter === 'modulo2' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Fractale de Sierpiński (Mod 2)
            </button>
            <button
              onClick={() => setActiveFilter('modulo3')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeFilter === 'modulo3' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Motifs Modulo 3
            </button>
            <button
              onClick={() => setActiveFilter('diagonals')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeFilter === 'diagonals' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Diagonales Remarquables
            </button>
            <button
              onClick={() => setActiveFilter('primes')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeFilter === 'primes' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Nombres Premiers
            </button>
            <button
              onClick={() => setActiveFilter('none')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeFilter === 'none' ? 'bg-white text-[#1C1917] shadow-xs' : 'text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Vue Standard
            </button>
          </div>
        </div>

        {/* Triangle Visualization Canvas & Inspector Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Triangle Display Area (8 cols) */}
          <div className="lg:col-span-8 bg-[#FAF8F5] border border-[#EBE6DF] rounded-xl p-6 sm:p-8 overflow-x-auto shadow-xs min-h-[460px] flex flex-col justify-center">
            
            <div className="flex flex-col items-center gap-2 min-w-[500px]">
              {triangle.map((row, r) => (
                <div key={r} className="flex items-center gap-1.5 sm:gap-2 justify-center">
                  
                  {/* Row index indicator */}
                  <span className="text-[10px] text-[#A8A29E] font-mono tabular-nums w-8 text-right select-none">
                    n={r}
                  </span>

                  {/* Row Cells */}
                  {row.map((val, c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCell({ r, c })}
                      className={`h-7 sm:h-9 min-w-7 sm:min-w-9 px-1.5 rounded-md flex items-center justify-center font-mono tabular-nums text-xs transition-all duration-150 cursor-pointer shadow-2xs ${getCellColor(r, c, val)}`}
                      title={`Ligne n=${r}, Colonne k=${c} : Valeur = ${val}`}
                    >
                      {val}
                    </button>
                  ))}

                  {/* Row Sum 2^n */}
                  <span className="text-[10px] text-[#78716C] font-mono tabular-nums w-12 text-left pl-2 select-none" title={`Somme = 2^${r}`}>
                    Σ={Math.pow(2, r)}
                  </span>
                </div>
              ))}
            </div>

            {/* Subtext info */}
            <div className="mt-8 pt-4 border-t border-[#EBE6DF] flex flex-wrap items-center justify-between text-xs text-[#78716C]">
              <span>Cliquez sur une case pour inspecter sa relation combinatoire.</span>
              <span>Somme de la ligne n : 2^n</span>
            </div>
          </div>

          {/* Combinatorial Inspector & Educational Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Cell Focus Inspector */}
            {cellInfo ? (
              <div className="bg-white border border-[#EBE6DF] rounded-xl p-6 shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#9A3412] font-semibold uppercase tracking-wider mb-3">
                  <span>Inspecteur Combinatoire</span>
                  <span className="font-mono">n={cellInfo.n}, k={cellInfo.k}</span>
                </div>

                <div className="text-3xl font-serif font-bold text-[#1C1917] mb-2 font-mono tabular-nums">
                  {cellInfo.val}
                </div>

                <div className="text-xs text-[#57534E] leading-relaxed mb-4">
                  Nombre de façons de choisir <strong>{cellInfo.k}</strong> éléments parmi un ensemble de <strong>{cellInfo.n}</strong> éléments.
                </div>

                {/* Recurrence Rule */}
                {cellInfo.parent1 !== null && cellInfo.parent2 !== null && (
                  <div className="p-3.5 bg-[#FBF9F5] border border-[#EBE6DF] rounded-lg text-xs space-y-2">
                    <div className="font-semibold text-[#1C1917] flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#9A3412]" />
                      <span>Règle d'addition de Pascal :</span>
                    </div>
                    <div className="font-mono text-[11px] text-[#44403C] bg-white p-2 rounded border border-[#EBE6DF]">
                      C({cellInfo.n}, {cellInfo.k}) = C({cellInfo.n - 1}, {cellInfo.k - 1}) + C({cellInfo.n - 1}, {cellInfo.k})
                    </div>
                    <div className="font-mono text-[11px] text-[#78716C]">
                      {cellInfo.parent1} + {cellInfo.parent2} = <strong>{cellInfo.val}</strong>
                    </div>
                  </div>
                )}

                {/* Binomial Theorem Application */}
                <div className="mt-4 pt-4 border-t border-[#EBE6DF]">
                  <span className="text-[11px] uppercase tracking-wider text-[#78716C] font-semibold block mb-1">
                    Développement du binôme (a + b)^{cellInfo.n}
                  </span>
                  <p className="text-xs font-mono text-[#57534E]">
                    Coefficient du terme : {cellInfo.val} · a^{cellInfo.n - cellInfo.k} b^{cellInfo.k}
                  </p>
                </div>
              </div>
            ) : null}

            {/* Sierpinski & Fermat Context */}
            <div className="bg-white border border-[#EBE6DF] rounded-xl p-6 shadow-xs">
              <h3 className="font-serif font-bold text-base text-[#1C1917] mb-2">
                Le Secret de la Géométrie Fractale
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Lorsque l'on colorie uniquement les nombres impairs (Modulo 2), le triangle de Pascal fait émerger de façon spontanée le <strong>tapis de Sierpiński</strong>, structure fractale découverte en 1915, plus de 250 ans après Pascal !
              </p>
              <div className="mt-4 pt-4 border-t border-[#EBE6DF] text-xs text-[#78716C]">
                <strong>Le problème des partis (1654) :</strong> En échangeant avec Fermat, Pascal utilisa ces coefficients pour calculer la répartition équitable de l'enjeu d'une partie interrompue.
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
