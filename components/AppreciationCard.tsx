import React, { useState, useEffect } from 'react';
import { Frown, Meh, Smile, ThumbsUp, Star, PenLine, X, Check, RefreshCw } from 'lucide-react';

interface AppreciationCardProps {
    rank: number;
    totalSize: number;
    canEdit?: boolean;
    canSign?: boolean;
    selectedAppreciation?: string | null;
    onSelectAppreciation?: (appreciation: string | null) => void;
    teacherName?: string;
    onTeacherNameChange?: (name: string) => void;
    isSigned?: boolean;
    onToggleSigned?: (signed: boolean) => void;
    teacherSignature?: string;
    onSaveSignature?: (signatureDataUrl: string, name: string) => void;
    onDeleteSignature?: () => void;
    isCustomRank?: boolean;
    onRankChange?: (newRank: number | null) => void;
    isCustomAppreciation?: boolean;
    onResetAppreciationToAuto?: () => void;
}

export const AppreciationCard: React.FC<AppreciationCardProps> = ({ 
    rank, 
    totalSize, 
    canEdit = true,
    canSign,
    selectedAppreciation: propSelectedAppreciation,
    onSelectAppreciation,
    teacherName: propTeacherName,
    onTeacherNameChange,
    isSigned: propIsSigned,
    onToggleSigned,
    teacherSignature,
    onSaveSignature,
    onDeleteSignature,
    isCustomRank,
    onRankChange,
    isCustomAppreciation,
    onResetAppreciationToAuto
}) => {
    const [localAppreciation, setLocalAppreciation] = useState<string | null>(null);
    const [localTeacherName, setLocalTeacherName] = useState('');
    const [localIsSigned, setLocalIsSigned] = useState(false);
    const [isEditingRank, setIsEditingRank] = useState(false);
    const [rankInput, setRankInput] = useState<string>(rank.toString());

    useEffect(() => {
        setRankInput(rank.toString());
    }, [rank]);

    const selectedAppreciation = propSelectedAppreciation !== undefined ? propSelectedAppreciation : localAppreciation;

    const handleSelectAppreciation = (label: string) => {
        const val = selectedAppreciation === label ? null : label;
        if (onSelectAppreciation) onSelectAppreciation(val);
        else setLocalAppreciation(val);
    };

    const appreciations = [
        { label: 'Mauvais', icon: Frown, color: 'text-red-500' },
        { label: 'Passable', icon: Meh, color: 'text-orange-500' },
        { label: 'Bien', icon: Smile, color: 'text-yellow-600' },
        { label: 'Très bien', icon: ThumbsUp, color: 'text-emerald-500' },
        { label: 'Excellent', icon: Star, color: 'text-amber-500' }
    ];

    return (
        <div className="p-5 rounded-[24px] flex flex-col gap-2 relative border border-slate-100 bg-white shadow-xs">
            {/* Top section: Rank */}
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-baseline gap-1">
                    {isEditingRank ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min={1}
                                max={totalSize || 100}
                                value={rankInput}
                                onChange={(e) => setRankInput(e.target.value)}
                                className="w-20 px-2 py-1 text-2xl font-black text-slate-800 border border-sky-400 rounded-xl outline-none focus:ring-2 focus:ring-sky-500"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const parsed = parseInt(rankInput, 10);
                                    if (!isNaN(parsed) && parsed > 0 && onRankChange) {
                                        onRankChange(parsed);
                                    }
                                    setIsEditingRank(false);
                                }}
                                className="p-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700 transition-colors"
                                title="Valider le rang manuel"
                            >
                                <Check size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setRankInput(rank.toString());
                                    setIsEditingRank(false);
                                }}
                                className="p-1.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-300 transition-colors"
                                title="Annuler"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ) : (
                        <>
                            <span className="text-4xl font-black text-slate-800">
                                {rank}<sup className="text-xl font-bold">{rank === 1 ? 'er' : 'ème'}</sup>
                            </span>
                            <span className="text-xl font-bold text-slate-600">/{totalSize}</span>
                        </>
                    )}
                </div>

                {canEdit && (
                    <div className="flex items-center gap-2">
                        {isCustomRank ? (
                            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-800">
                                <span>Rang Manuel</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (onRankChange) onRankChange(null);
                                        setIsEditingRank(false);
                                    }}
                                    className="text-amber-700 hover:text-amber-900 underline ml-1 cursor-pointer"
                                    title="Réinitialiser le rang en automatique"
                                >
                                    Auto
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setIsEditingRank(!isEditingRank)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                                title="Modifier le rang manuellement"
                            >
                                <PenLine size={12} />
                                <span>Modifier rang</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            <div className="h-px w-full bg-slate-100 my-2"></div>

            {/* Bottom section: Appreciation */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm font-bold text-slate-700">Appréciation du conseil de classe</span>
                    {canEdit && (
                        <div>
                            {isCustomAppreciation ? (
                                <button
                                    type="button"
                                    onClick={() => onResetAppreciationToAuto && onResetAppreciationToAuto()}
                                    className="text-xs bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-full font-bold hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer"
                                    title="Revenir à l'appréciation automatique"
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
                
                <div className="flex flex-wrap items-center gap-4 bg-slate-50/80 p-3 rounded-2xl w-fit border border-slate-100">
                    {appreciations.map((app, idx) => {
                        const Icon = app.icon;
                        const isSelected = selectedAppreciation === app.label;
                        return (
                            <button
                                key={idx}
                                onClick={() => canEdit && handleSelectAppreciation(app.label)}
                                className={`transition-all ${canEdit ? 'cursor-pointer hover:scale-110' : 'cursor-default'} ${isSelected ? app.color : 'text-slate-400'} ${canEdit && !isSelected ? 'hover:text-slate-600' : ''}`}
                                title={app.label}
                            >
                                <Icon size={28} strokeWidth={isSelected ? 2.5 : 2} fill={isSelected ? 'currentColor' : 'none'} fillOpacity={0.2} />
                            </button>
                        );
                    })}
                </div>

                {selectedAppreciation && (
                    <span className="text-lg font-black text-slate-800 capitalize animate-in fade-in slide-in-from-left-2">
                        {selectedAppreciation}
                    </span>
                )}
            </div>
        </div>
    );
};

