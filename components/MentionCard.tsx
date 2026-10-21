import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface MentionCardProps { 
    canEdit?: boolean;
    selectedDistinctions?: string[];
    onDistinctionToggle?: (distinction: string) => void;
    selectedSanctions?: string[];
    onSanctionToggle?: (sanction: string) => void;
    isCustomMentions?: boolean;
    onResetMentionsToAuto?: () => void;
}

export const MentionCard: React.FC<MentionCardProps> = ({ 
    canEdit = true,
    selectedDistinctions: propSelectedDistinctions,
    onDistinctionToggle,
    selectedSanctions: propSelectedSanctions,
    onSanctionToggle,
    isCustomMentions,
    onResetMentionsToAuto
}) => {
    const [localDistinctions, setLocalDistinctions] = useState<string[]>([]);
    const [localSanctions, setLocalSanctions] = useState<string[]>([]);

    const selectedDistinctions = propSelectedDistinctions !== undefined ? propSelectedDistinctions : localDistinctions;
    const selectedSanctions = propSelectedSanctions !== undefined ? propSelectedSanctions : localSanctions;

    const distinctions = [
        "Tableau d'honneur + félicitation",
        "Tableau d'honneur + encouragement",
        "Tableau d'honneur"
    ];

    const sanctions = [
        "Avertissement travail",
        "Avertissement conduite",
        "Blâme travail",
        "Blâme conduite"
    ];

    const toggleDistinction = (dist: string) => {
        if (onDistinctionToggle) {
            onDistinctionToggle(dist);
        } else {
            setLocalDistinctions(prev => 
                prev.includes(dist) ? prev.filter(d => d !== dist) : [...prev, dist]
            );
        }
    };

    const toggleSanction = (sanc: string) => {
        if (onSanctionToggle) {
            onSanctionToggle(sanc);
        } else {
            setLocalSanctions(prev => 
                prev.includes(sanc) ? prev.filter(s => s !== sanc) : [...prev, sanc]
            );
        }
    };

    return (
        <div className="p-5 bg-white border border-slate-100 rounded-[24px] flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-sm font-bold text-slate-700">Mention du conseil de classe</span>
                {canEdit && (
                    <div>
                        {isCustomMentions ? (
                            <button
                                type="button"
                                onClick={() => onResetMentionsToAuto && onResetMentionsToAuto()}
                                className="text-xs bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full font-bold hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Revenir aux mentions automatiques"
                            >
                                <RefreshCw size={11} />
                                <span>Modifié (Remettre Auto)</span>
                            </button>
                        ) : (
                            <span className="text-[11px] font-extrabold bg-sky-50 text-sky-700 border border-sky-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                Automatique
                            </span>
                        )}
                    </div>
                )}
            </div>
            
            <div className="flex flex-col gap-2">
                <span className="text-[13px] font-black text-emerald-800 tracking-wider">DISTINCTION</span>
                <div className="flex flex-col gap-2">
                    {distinctions.map((dist, idx) => {
                        const isChecked = selectedDistinctions.includes(dist);
                        return (
                            <label key={idx} className={`flex items-center gap-2 select-none ${canEdit ? "cursor-pointer group" : "opacity-80"}`}>
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isChecked ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300 group-hover:border-emerald-400'}`}>
                                    {isChecked && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span className={`text-sm transition-colors ${isChecked ? 'text-emerald-700 font-bold' : 'font-medium text-slate-600 group-hover:text-slate-800'}`}>{dist}</span>
                                <input 
                                    type="checkbox" 
                                    className="hidden" 
                                    checked={isChecked}
                                    onChange={() => canEdit && toggleDistinction(dist)}
                                />
                            </label>
                        );
                    })}
                </div>
            </div>

            <div className="h-px w-full bg-slate-100 my-1"></div>

            <div className="flex flex-col gap-2">
                <span className="text-[13px] font-black text-red-800 tracking-wider">SANCTIONS</span>
                <div className="flex flex-col gap-2">
                    {sanctions.map((sanc, idx) => {
                        const isChecked = selectedSanctions.includes(sanc);
                        return (
                            <label key={idx} className={`flex items-center gap-2 select-none ${canEdit ? "cursor-pointer group" : "opacity-80"}`}>
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isChecked ? 'bg-red-500 border-red-500' : 'bg-white border-slate-300 group-hover:border-red-400'}`}>
                                    {isChecked && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span className={`text-sm transition-colors ${isChecked ? 'text-red-700 font-bold' : 'font-medium text-slate-600 group-hover:text-slate-800'}`}>{sanc}</span>
                                <input 
                                    type="checkbox" 
                                    className="hidden" 
                                    checked={isChecked}
                                    onChange={() => canEdit && toggleSanction(sanc)}
                                />
                            </label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

