import React, { useState } from 'react';
import { AnalyticsData } from '../types';
import { ChevronDown, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSubjectCoef } from './TransactionList';
import { isTechnicalClass, formatPeriodLabel, getPeriodOptions } from '../src/utils/academicUtils';

interface AnalyticsChartProps {
    data: AnalyticsData[];
    gpa: number;
    totalPoints?: number;
    totalCoef?: number;
    studentClass?: string;
    selectedTrim?: string;
    onTrimChange?: (trim: string) => void;
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data, gpa, totalPoints, totalCoef, studentClass, selectedTrim: externalTrim, onTrimChange }) => {
  const [internalTrim, setInternalTrim] = useState('1er trim');
  const [showTrimDropdown, setShowTrimDropdown] = useState(false);

  const selectedTrim = externalTrim || internalTrim;
  const isTech = isTechnicalClass(studentClass);
  const periodOpts = getPeriodOptions(studentClass);

  const handleSelectTrim = (trim: string) => {
    setInternalTrim(trim);
    if (onTrimChange) {
      onTrimChange(trim);
    }
    setShowTrimDropdown(false);
  };

  // Safe calculation of the overall weighted average
  const overallAverage = React.useMemo(() => {
    if (totalPoints !== undefined && totalCoef !== undefined && totalCoef > 0) {
      return totalPoints / totalCoef;
    }
    if (!data || data.length === 0) return 0;
    let pts = 0;
    let cfs = 0;
    data.forEach(sub => {
      if (!sub || !sub.name) return;
      const coef = getSubjectCoef(studentClass, sub.name);
      if (coef === 0 || sub.name.toLowerCase().includes('informatique')) {
        const g = Number(sub.average || 0);
        if (g > 10) pts += (g - 10);
      } else {
        pts += Number(sub.average || 0) * coef;
        cfs += coef;
      }
    });
    return cfs > 0 ? pts / cfs : 0;
  }, [data, totalPoints, totalCoef, studentClass]);

  const safeData = data && data.length > 0 ? data : [{ name: 'Aucune donnée', value: 1, average: 0, fill: '#e5e7eb' }];
  
  const sortedData = [...safeData].sort((a, b) => (b.average || 0) - (a.average || 0));
  const bestSubject = sortedData[0];
  const secondBestSubject = sortedData[1] || bestSubject;

  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const gap = 12;
  
  const chartValues = safeData.map(sub => {
     const isBest = sub.name === bestSubject?.name;
     const isSecondBest = sub.name === secondBestSubject?.name && sub.name !== bestSubject?.name;
     const avg = sub.average || 0;
     return {
        ...sub,
        isBest,
        isSecondBest,
        chartWeight: isBest ? avg * 3 : (isSecondBest ? avg * 2.5 : avg)
     };
  });

  const totalWeight = chartValues.reduce((acc, sub) => acc + sub.chartWeight, 0);
  const availableLength = circumference - (gap * safeData.length);
  
  let currentOffset = 0;
  const chartSegments = chartValues.map(sub => {
     const length = totalWeight > 0 ? Math.max(0, (sub.chartWeight / totalWeight) * availableLength) : availableLength / safeData.length;
     const segment = {
       color: sub.fill,
       dasharray: `${length} ${circumference - length}`,
       offset: currentOffset,
       isBest: sub.isBest,
       isSecondBest: sub.isSecondBest
     };
     currentOffset -= (length + gap);
     return segment;
  });

  return (
    <div className="bg-white md:bg-transparent p-6 md:p-0 rounded-[2rem] md:rounded-none shadow-sm md:shadow-none w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">
          {isTech ? 'Moyennes par Matière (semestrielle)' : 'Moyennes par Matière (trimestrielle)'}
        </h2>
        <div className="relative">
          <button 
            onClick={() => setShowTrimDropdown(!showTrimDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-xl text-sm font-semibold hover:bg-sky-100 transition-colors"
          >
            {formatPeriodLabel(selectedTrim, studentClass)}
            <ChevronDown size={16} className={`transition-transform duration-200 ${showTrimDropdown ? 'rotate-180' : ''}`} />
          </button>
          {showTrimDropdown && (
            <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2">
              {periodOpts.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelectTrim(opt.id)}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-between ${
                    selectedTrim === opt.id ? 'text-sky-600 bg-sky-50/50' : 'text-slate-700'
                  }`}
                >
                  <span>{opt.shortLabel || opt.label}</span>
                  {selectedTrim === opt.id && <Check size={14} className="text-sky-600" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center justify-between flex-1 gap-6 w-full pt-2">
        {/* Chart */}
        <div className="relative w-[180px] h-[180px] flex-shrink-0 flex items-center justify-center pt-1 mx-auto">
          <svg className="w-full h-full transform -rotate-90 overflow-visible" viewBox="0 0 100 100">
             <defs>
                 <linearGradient id="lv2-grad-ac" x1="0%" y1="0%" x2="100%" y2="100%">
                     <stop offset="0%" stopColor="#f59e0b" />
                     <stop offset="100%" stopColor="#10b981" />
                 </linearGradient>
             </defs>
             {chartSegments.map((seg, i) => (
                <motion.circle
                   key={i}
                   cx="50"
                   cy="50"
                   r="38"
                   fill="transparent"
                   stroke={seg.color === '#10b981' && safeData[i]?.name.includes('L.V.2') ? 'url(#lv2-grad-ac)' : seg.color}
                   strokeWidth={seg.isBest ? "14" : "6"}
                   strokeLinecap="round"
                   strokeDasharray={seg.dasharray}
                   initial={{ strokeDashoffset: circumference }}
                   whileInView={{ strokeDashoffset: seg.offset }}
                   viewport={{ once: true }}
                   transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                />
             ))}
          </svg>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-gray-400 text-[10px] font-medium uppercase tracking-wider">Moyenne</span>
            <span className="text-xl font-bold text-gray-800">{overallAverage.toFixed(2)}</span>
            <span className="text-xs text-gray-400">/ 20</span>
          </div>
        </div>

        {/* Legend with Averages */}
        <div className="flex flex-col gap-3 w-full">
          {data && data.length > 0 ? (
              data.map((item, index) => (
                <div key={index} className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                      style={{ background: item.name.includes('L.V.2') ? 'linear-gradient(135deg, #f59e0b, #10b981)' : item.fill }}
                    ></div>
                    <span className="text-xs font-medium text-gray-500 truncate">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg flex-shrink-0">
                    <span className="text-xs font-bold text-gray-700">{Number(item.average || 0).toFixed(2)}</span>
                    <span className="text-[10px] text-gray-400 font-medium">/20</span>
                  </div>
                </div>
              ))
          ) : (
              <div className="text-xs text-gray-400 text-center italic mt-4">Aucune matière notée</div>
          )}

          {totalPoints !== undefined && totalCoef !== undefined && (
            <div className="mt-4 p-4 bg-sky-50/80 border border-sky-100 rounded-2xl flex flex-col gap-2.5 w-full">
                <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                    <span>Total des points</span>
                    <span className="text-slate-800 font-bold">{totalPoints.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-medium text-slate-600">
                    <span>Total des coefficients</span>
                    <span className="text-slate-800 font-bold">{totalCoef}</span>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
