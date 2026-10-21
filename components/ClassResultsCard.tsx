import React, { useState } from 'react';

interface ClassResultsCardProps {
    minAverage: number;
    maxAverage: number;
    classAverage: number;
    canEditDirectorSection?: boolean;
    faitA?: string;
    onFaitAChange?: (val: string) => void;
    faitLe?: string;
    onFaitLeChange?: (val: string) => void;
    directorName?: string;
    onDirectorNameChange?: (val: string) => void;
    signatureText?: string;
    onSignatureTextChange?: (val: string) => void;
    stampImage?: string | null;
    onStampImageChange?: (val: string | null) => void;
}

export const ClassResultsCard: React.FC<ClassResultsCardProps> = ({ 
    minAverage, 
    maxAverage, 
    classAverage, 
    canEditDirectorSection = true,
    faitA: propFaitA,
    onFaitAChange,
    faitLe: propFaitLe,
    onFaitLeChange,
    directorName: propDirectorName,
    onDirectorNameChange,
    signatureText: propSignatureText,
    onSignatureTextChange,
    stampImage: propStampImage,
    onStampImageChange
}) => {
    const [localFaitA, setLocalFaitA] = useState('');
    const [localFaitLe, setLocalFaitLe] = useState('');
    const [localDirectorName, setLocalDirectorName] = useState('');
    const [localSignatureText, setLocalSignatureText] = useState('');
    const [localStampImage, setLocalStampImage] = useState<string | null>(null);

    const [isEditingSignature, setIsEditingSignature] = useState(false);

    const faitA = propFaitA !== undefined ? propFaitA : localFaitA;
    const faitLe = propFaitLe !== undefined ? propFaitLe : localFaitLe;
    const directorName = propDirectorName !== undefined ? propDirectorName : localDirectorName;
    const signatureText = propSignatureText !== undefined ? propSignatureText : localSignatureText;
    const stampImage = propStampImage !== undefined ? propStampImage : localStampImage;

    const handleFaitAChange = (val: string) => {
        if (onFaitAChange) onFaitAChange(val);
        else setLocalFaitA(val);
    };

    const handleFaitLeChange = (val: string) => {
        if (onFaitLeChange) onFaitLeChange(val);
        else setLocalFaitLe(val);
    };

    const handleDirectorNameChange = (val: string) => {
        if (onDirectorNameChange) onDirectorNameChange(val);
        else setLocalDirectorName(val);
    };

    const handleSignatureTextChange = (val: string) => {
        if (onSignatureTextChange) onSignatureTextChange(val);
        else setLocalSignatureText(val);
    };

    const handleStampImageChange = (val: string | null) => {
        if (onStampImageChange) onStampImageChange(val);
        else setLocalStampImage(val);
    };

    const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleStampImageChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="w-full flex flex-col rounded-[24px] bg-white border border-slate-100 overflow-hidden">
            {/* First section */}
            <div className="bg-sky-50/60 py-2 px-4 border-b border-sky-100 flex items-center justify-center">
                <span className="text-[12px] font-bold text-sky-900 tracking-widest uppercase">Résultats de la classe</span>
            </div>
            
            {/* Second section */}
            <div className="p-4 flex flex-col items-center gap-3 border-b border-slate-100">
                <span className="text-[14px] font-black text-slate-800 uppercase tracking-wide decoration-sky-300 underline underline-offset-4">Moyenne Générale</span>
                
                <div className="flex flex-col gap-2 w-full max-w-[280px] mt-1">
                    <div className="flex justify-between items-center bg-red-50/50 px-3.5 py-2 rounded-xl border border-red-100">
                        <span className="text-[12px] font-semibold text-slate-600">Moyenne la plus basse</span>
                        <span className="text-[15px] font-black text-red-600">{minAverage.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-emerald-50/50 px-3.5 py-2 rounded-xl border border-emerald-100">
                        <span className="text-[12px] font-semibold text-slate-600">Moyenne la plus élevée</span>
                        <span className="text-[15px] font-black text-emerald-600">{maxAverage.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-sky-50 px-3.5 py-2 rounded-xl border border-sky-200">
                        <span className="text-[12px] font-bold text-sky-900">Moyenne de classe</span>
                        <span className="text-[16px] font-black text-sky-700">{classAverage.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Third section: Signature & Chef d'établissement */}
            <div className="p-4 flex flex-col items-center gap-2.5 text-center">
                <span className="text-[13px] font-bold text-slate-800 uppercase tracking-wide">
                    Nom / Signature et cachet du chef d'établissement
                </span>
                
                <div className="text-[12px] text-slate-600 font-medium my-0.5 flex items-center justify-center flex-wrap gap-1">
                    <span>Fait à</span>
                    <input 
                        type="text"
                        value={faitA}
                        onChange={(e) => handleFaitAChange(e.target.value)}
                        disabled={!canEditDirectorSection}
                        placeholder="......................................."
                        className="bg-transparent text-center outline-none focus:border-b focus:border-sky-500 font-medium text-slate-700 max-w-[130px] px-1 py-0 placeholder:text-slate-400 disabled:cursor-not-allowed"
                    />
                    <span>, le</span>
                    <input 
                        type="text"
                        value={faitLe}
                        onChange={(e) => handleFaitLeChange(e.target.value)}
                        disabled={!canEditDirectorSection}
                        placeholder="........................."
                        className="bg-transparent text-center outline-none focus:border-b focus:border-sky-500 font-medium text-slate-700 max-w-[100px] px-1 py-0 placeholder:text-slate-400 disabled:cursor-not-allowed"
                    />
                </div>

                <span className="text-[13px] font-black text-slate-900 uppercase tracking-wider mt-1">
                    DIRECTEUR DES ÉTUDES
                </span>

                <div className="relative h-16 w-full max-w-[240px] border-2 border-dashed border-slate-200 rounded-xl my-1 flex items-center justify-center bg-slate-50/50 group overflow-hidden">
                    {stampImage ? (
                        <div className="relative w-full h-full flex items-center justify-center p-1">
                            <img src={stampImage} alt="Cachet / Signature" className="max-h-full max-w-full object-contain" />
                            {canEditDirectorSection && (
                                <button 
                                    onClick={() => handleStampImageChange(null)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Supprimer l'image"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ) : signatureText && signatureText.trim() !== '' && !isEditingSignature ? (
                        <div 
                            onClick={() => canEditDirectorSection && setIsEditingSignature(true)}
                            className={`w-full h-full flex flex-col items-center justify-center p-1 cursor-pointer group ${canEditDirectorSection ? 'hover:bg-sky-50/60' : ''}`}
                            title={canEditDirectorSection ? "Cliquer pour modifier la signature" : undefined}
                        >
                            <span 
                                style={{ fontFamily: "'Brush Script MT', 'Caveat', 'Cedarville Cursive', cursive" }} 
                                className="text-2xl font-bold text-blue-900 -rotate-2 select-none"
                            >
                                {signatureText}
                            </span>
                            {canEditDirectorSection && (
                                <span className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    (Cliquer pour modifier)
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full relative flex items-center justify-center">
                            <textarea
                                value={signatureText}
                                onChange={(e) => handleSignatureTextChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        setIsEditingSignature(false);
                                    }
                                }}
                                onBlur={() => setIsEditingSignature(false)}
                                autoFocus={isEditingSignature}
                                disabled={!canEditDirectorSection}
                                placeholder="(Emplacement signature & cachet)"
                                className="w-full h-full bg-transparent resize-none p-2 text-center text-[12px] font-serif italic text-slate-800 outline-none placeholder:text-slate-400 placeholder:italic placeholder:text-[11px] disabled:cursor-not-allowed"
                            />
                            {canEditDirectorSection && (
                                <label className="absolute bottom-1 right-1 text-[9px] bg-slate-200 hover:bg-slate-300 text-slate-600 px-1.5 py-0.5 rounded cursor-pointer opacity-30 hover:opacity-100 transition-opacity">
                                    📷 Image
                                    <input type="file" accept="image/*" className="hidden" onChange={handleStampUpload} />
                                </label>
                            )}
                        </div>
                    )}
                </div>

                <div className="text-[12px] font-semibold text-slate-700 flex items-center justify-center gap-1">
                    <span>Nom :</span>
                    <input 
                        type="text"
                        value={directorName}
                        onChange={(e) => handleDirectorNameChange(e.target.value)}
                        disabled={!canEditDirectorSection}
                        placeholder="..........................................."
                        className="bg-transparent text-center outline-none focus:border-b focus:border-sky-500 font-semibold text-slate-800 max-w-[150px] px-1 py-0 placeholder:text-slate-400 disabled:cursor-not-allowed"
                    />
                </div>
            </div>
        </div>
    );
};
