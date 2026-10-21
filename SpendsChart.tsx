import React, { useState } from 'react';
import { ChartData } from '../types';
import { motion } from 'framer-motion';
import { isTechnicalClass, calculateAnnualAverage } from '../src/utils/academicUtils';

interface SpendsChartProps {
    data: ChartData[];
    overallAverage?: string;
    studentClass?: string;
}

export const SpendsChart: React.FC<SpendsChartProps> = ({ data, overallAverage, studentClass }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isTech = isTechnicalClass(studentClass);

  // Compute average from ChartData subset
  const getAvg = (arr: ChartData[]) => {
    if (!arr) return 0;
    const valid = arr.filter(a => a && typeof a.studentScore === 'number' && a.studentScore > 0);
    if (valid.length === 0) return 0;
    return valid.reduce((acc, curr) => acc + curr.studentScore, 0) / valid.length;
  };

  let t1Avg = 0;
  let t2Avg = 0;
  let t3Avg = 0;

  if (data && data.length > 0) {
    const trim1Item = data.find(item => 
      item && item.name && (
        item.name === '1er Trim' || 
        item.name === '1er Sem' || 
        item.name === '1er trim' || 
        item.name === '1er trim.' || 
        item.name === 'T1'
      )
    );
    const trim2Item = data.find(item => 
      item && item.name && (
        item.name === '2e Trim' || 
        item.name === '2ème Trim' || 
        item.name === '2e Sem' || 
        item.name === '2ème Sem' || 
        item.name === '2e trim' || 
        item.name === '2ème trim' || 
        item.name === '2ème trim.' || 
        item.name === 'T2'
      )
    );
    const trim3Item = data.find(item => 
      item && item.name && (
        item.name === '3e Trim' || 
        item.name === '3ème Trim' || 
        item.name === '3e trim' || 
        item.name === '3ème trim' || 
        item.name === '3ème trim.' || 
        item.name === 'T3'
      )
    );

    if (trim1Item || trim2Item || trim3Item) {
      t1Avg = trim1Item?.studentScore || 0;
      t2Avg = trim2Item?.studentScore || 0;
      t3Avg = trim3Item?.studentScore || 0;
    } else {
      t1Avg = getAvg(data.slice(0, 3));
      t2Avg = getAvg(data.slice(3, 6));
      t3Avg = getAvg(data.slice(6, 9));
    }
  }

  const parsedOverall = overallAverage ? parseFloat(overallAverage) : 0;

  const trimData = isTech ? [
    { label: '1er Sem', score: t1Avg },
    { label: '2e Sem', score: t2Avg || t3Avg }
  ] : [
    { label: '1er Trim', score: t1Avg },
    { label: '2e Trim', score: t2Avg },
    { label: '3e Trim', score: t3Avg }
  ];

  // Overall General Average calculation across trimesters using official coefficients (T1: 1, T2: 2, T3: 2)
  const computedAnnual = calculateAnnualAverage(
    t1Avg > 0 ? t1Avg : null,
    t2Avg > 0 ? t2Avg : null,
    t3Avg > 0 ? t3Avg : null,
    isTech
  );
  const generalAverage = computedAnnual !== null ? computedAnnual.toFixed(2) : "0.00";

  let displayAverage = generalAverage;
  let displayLabel = "Performance (Moyenne Générale Annuelle)";
  let displaySubtitle = "Moyenne Générale";

  if (hoveredIndex !== null && trimData[hoveredIndex]) {
      const selected = trimData[hoveredIndex];
      displayAverage = selected.score > 0 ? selected.score.toFixed(2) : "0.00";
      displayLabel = `Performance (${selected.label})`;
      displaySubtitle = `Moyenne ${selected.label}`;
  }

  const yAxisValues = [20, 15, 10, 5, 0];

  return (
    <div 
      className="bg-white p-5 sm:p-7 rounded-[2.2rem] shadow-sm border border-slate-100 w-full flex flex-col select-none cursor-pointer"
      onClick={() => setHoveredIndex(null)}
    >
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-6">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100 inline-block mb-1.5">
            Moyennes Trimestrielles
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 leading-tight transition-all">
            {displayLabel}
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-100 w-fit">
          <span className="text-xs sm:text-sm font-bold text-slate-500">{displaySubtitle} :</span>
          <span className="font-black text-sky-600 text-base sm:text-lg">{displayAverage}/20</span>
        </div>
      </div>

      <div className="w-full flex pb-12 pt-4 h-[290px] sm:h-[330px]">
        {/* Chart + Y Axis Container */}
        <div className="flex-1 flex relative h-full">
          {/* Y Axis */}
          <div className="w-9 sm:w-12 relative flex-shrink-0 z-20 bg-transparent flex flex-col justify-between items-end pr-2.5 sm:pr-4 py-1">
            {yAxisValues.map((val) => (
              <div 
                 key={val} 
                 className="text-xs sm:text-sm font-extrabold text-slate-400 sm:text-slate-500 whitespace-nowrap"
              >
                {val}
              </div>
            ))}
          </div>

          {/* Chart Area */}
          <div className="flex-1 relative flex items-end justify-around px-2 sm:px-8 overflow-visible border-l-2 border-b-2 border-slate-200/80">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {yAxisValues.map((val, i) => (
                    <div key={i} className="w-full h-[1.5px] bg-slate-100"></div>
                ))}
            </div>

            {trimData.map((item, i) => {
              const isHovered = hoveredIndex === i;
              const heightPercent = item.score > 0 ? Math.max((item.score / 20) * 100, 4) : 0;
              
              return (
                <div 
                  key={i} 
                  className="relative flex flex-col items-center group cursor-pointer h-full justify-between w-24 sm:w-32 z-10 pt-2"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setHoveredIndex(hoveredIndex === i ? null : i); 
                  }}
                >
                  {/* Floating / Above Score Badge */}
                  <div className="transition-transform duration-200">
                    <span className={`inline-flex items-center text-sm sm:text-base font-black px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border-2 shadow-xs transition-all whitespace-nowrap ${
                      isHovered
                        ? 'bg-slate-900 text-white border-slate-900 scale-105 shadow-md'
                        : item.score > 0
                        ? 'bg-sky-50 text-sky-900 border-sky-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {item.score > 0 ? item.score.toFixed(2) : '0.00'}
                      <span className="text-[11px] sm:text-xs opacity-75 ml-1 font-bold">/20</span>
                    </span>
                  </div>

                  {/* Vertical Bar */}
                  <div className="w-full flex justify-center relative items-end flex-1 max-h-[72%] pb-0.5">
                    {item.score === 0 ? (
                      <div className="w-14 sm:w-18 h-2 rounded-full bg-slate-200/90 transition-all duration-300"></div>
                    ) : (
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${heightPercent}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                        className={`w-14 sm:w-18 rounded-t-2xl transition-all duration-300 relative overflow-hidden ${
                          isHovered 
                            ? 'bg-gradient-to-t from-sky-600 to-sky-400 shadow-[0_8px_20px_rgba(14,165,233,0.35)] scale-[1.03]' 
                            : 'bg-gradient-to-t from-sky-500 to-sky-300 hover:from-sky-500 hover:to-sky-400 shadow-sm'
                        }`}
                      >
                        {/* Glossy top gradient */}
                        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/35 to-transparent"></div>
                      </motion.div>
                    )}
                  </div>

                  {/* X Axis Label */}
                  <div className="absolute -bottom-10 sm:-bottom-11 w-max">
                    <div className={`text-xs sm:text-sm font-black px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-2xl transition-all duration-200 ${
                      isHovered 
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25 scale-105' 
                        : 'text-slate-800 bg-white border-2 border-slate-200 shadow-xs'
                    }`}>
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
