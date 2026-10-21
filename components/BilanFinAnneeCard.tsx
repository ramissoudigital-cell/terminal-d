import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';

interface BilanFinAnneeCardProps {
    isTech?: boolean;
    t1Avg: number | null;
    t2Avg: number | null;
    t3Avg: number | null;
    t1Coef: number;
    t2Coef: number;
    t3Coef: number;
    t1Rank?: number | string;
    t2Rank?: number | string;
    t3Rank?: number | string;
    annualAvg: number | null;
    annualRank: number | string;
    
    decision: string;
    onDecisionChange: (val: string) => void;
    
    teacherName: string;
    onTeacherNameChange: (val: string) => void;
    isTeacherSigned: boolean;
    onToggleTeacherSigned: () => void;
    teacherSignature: string | null;
    
    // Director info
    faitA: string;
    onFaitAChange: (val: string) => void;
    faitLe: string;
    onFaitLeChange: (val: string) => void;
    directorName: string;
    onDirectorNameChange: (val: string) => void;
    signatureText: string;
    onSignatureTextChange: (val: string) => void;
    stampImage: string | null;
    onStampImageChange: (val: string | null) => void;
    
    canEditAppreciation: boolean;
    canEditDirectorSection: boolean;
    onLaunchCloture?: () => void;
    currentUser?: any;
}

export const BilanFinAnneeCard: React.FC<BilanFinAnneeCardProps> = ({
    isTech = false,
    t1Avg, t2Avg, t3Avg,
    t1Coef, t2Coef, t3Coef,
    t1Rank = '-', t2Rank = '-', t3Rank = '-',
    annualAvg, annualRank,
    decision, onDecisionChange,
    teacherName, onTeacherNameChange,
    isTeacherSigned, onToggleTeacherSigned, teacherSignature,
    faitA, onFaitAChange,
    faitLe, onFaitLeChange,
    directorName, onDirectorNameChange,
    signatureText, onSignatureTextChange,
    stampImage, onStampImageChange,
    canEditAppreciation, canEditDirectorSection,
    onLaunchCloture,
    currentUser
}) => {
    const userLevel = Number(currentUser?.accessLevel || 0);
    const isTeacherRole = currentUser?.role === 'teacher' || 
                          currentUser?.role === 'professeur' || 
                          currentUser?.role === 'prof' || 
                          currentUser?.role === 'enseignant' || 
                          Boolean(currentUser?.isTeacher);
    const isLevel5 = userLevel === 5 || currentUser?.role === 'admin' || currentUser?.role === 'superadmin' || currentUser?.role === 'fondateur';
    const isLevel1To4 = userLevel >= 1 && userLevel <= 4;

    const canShowCloture = Boolean(onLaunchCloture) && isLevel5 && !isLevel1To4 && !isTeacherRole;
    const [isEditingDecision, setIsEditingDecision] = useState(false);
    const [isEditingSignature, setIsEditingSignature] = useState(false);
    
    const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onStampImageChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const formatNumber = (num: number | null) => {
        if (num === null) return '-';
        return num.toFixed(2);
    };

    const getMoyXC = (avg: number | null, coef: number) => {
        if (avg === null) return '-';
        return (avg * coef).toFixed(2);
    };

    return (
        <div className="w-full flex flex-col rounded-[24px] bg-white border border-slate-100 overflow-hidden shadow-sm">
            {/* Header: BILAN DE FIN D'ANNEE */}
            <div className="bg-sky-50/60 py-2 px-4 border-b border-sky-100 flex items-center justify-center">
                <span className="text-[12px] font-bold text-sky-900 tracking-widest uppercase">
                    Bilan de fin d'année
                </span>
            </div>
            
            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                
                {/* Column 1: RECAPITULATIF */}
                <div className="flex-[1.2] p-4 flex flex-col gap-3">
                    <span className="text-[13px] font-bold text-slate-800 uppercase tracking-wide text-center decoration-sky-300 underline underline-offset-4 mb-2">
                        Récapitulatif
                    </span>
                    
                    <div className="w-full overflow-hidden border border-slate-200 rounded-lg">
                        <table className="w-full text-center text-[11px] sm:text-[12px]">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-1.5 font-bold text-slate-700 border-r border-slate-200"></th>
                                    <th className="p-1.5 font-bold text-slate-700 border-r border-slate-200">MOY.</th>
                                    <th className="p-1.5 font-bold text-slate-700 border-r border-slate-200">COEF</th>
                                    <th className="p-1.5 font-bold text-slate-700 border-r border-slate-200">MOY x C</th>
                                    <th className="p-1.5 font-bold text-slate-700">RANG</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isTech ? (
                                    <>
                                        <tr className="border-b border-slate-200">
                                            <td className="p-1.5 font-semibold text-slate-600 border-r border-slate-200">1e Sem</td>
                                            <td className="p-1.5 font-bold text-slate-800 border-r border-slate-200">{formatNumber(t1Avg)}</td>
                                            <td className="p-1.5 text-slate-700 border-r border-slate-200">{t1Coef}</td>
                                            <td className="p-1.5 font-medium text-slate-600 border-r border-slate-200">{getMoyXC(t1Avg, t1Coef)}</td>
                                            <td className="p-1.5 font-bold text-slate-800">{t1Rank}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-1.5 font-semibold text-slate-600 border-r border-slate-200">2e Sem</td>
                                            <td className="p-1.5 font-bold text-slate-800 border-r border-slate-200">{formatNumber(t2Avg)}</td>
                                            <td className="p-1.5 text-slate-700 border-r border-slate-200">{t2Coef}</td>
                                            <td className="p-1.5 font-medium text-slate-600 border-r border-slate-200">{getMoyXC(t2Avg, t2Coef)}</td>
                                            <td className="p-1.5 font-bold text-slate-800">{t2Rank}</td>
                                        </tr>
                                    </>
                                ) : (
                                    <>
                                        <tr className="border-b border-slate-200">
                                            <td className="p-1.5 font-semibold text-slate-600 border-r border-slate-200">1e Trim</td>
                                            <td className="p-1.5 font-bold text-slate-800 border-r border-slate-200">{formatNumber(t1Avg)}</td>
                                            <td className="p-1.5 text-slate-700 border-r border-slate-200">{t1Coef}</td>
                                            <td className="p-1.5 font-medium text-slate-600 border-r border-slate-200">{getMoyXC(t1Avg, t1Coef)}</td>
                                            <td className="p-1.5 font-bold text-slate-800">{t1Rank}</td>
                                        </tr>
                                        <tr className="border-b border-slate-200">
                                            <td className="p-1.5 font-semibold text-slate-600 border-r border-slate-200">2e Trim</td>
                                            <td className="p-1.5 font-bold text-slate-800 border-r border-slate-200">{formatNumber(t2Avg)}</td>
                                            <td className="p-1.5 text-slate-700 border-r border-slate-200">{t2Coef}</td>
                                            <td className="p-1.5 font-medium text-slate-600 border-r border-slate-200">{getMoyXC(t2Avg, t2Coef)}</td>
                                            <td className="p-1.5 font-bold text-slate-800">{t2Rank}</td>
                                        </tr>
                                        <tr>
                                            <td className="p-1.5 font-semibold text-slate-600 border-r border-slate-200">3e Trim</td>
                                            <td className="p-1.5 font-bold text-slate-800 border-r border-slate-200">{formatNumber(t3Avg)}</td>
                                            <td className="p-1.5 text-slate-700 border-r border-slate-200">{t3Coef}</td>
                                            <td className="p-1.5 font-medium text-slate-600 border-r border-slate-200">{getMoyXC(t3Avg, t3Coef)}</td>
                                            <td className="p-1.5 font-bold text-slate-800">{t3Rank}</td>
                                        </tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 mt-2">
                        <div className="flex justify-between items-center text-[12px]">
                            <span className="font-bold text-slate-700 uppercase">Moyenne Générale Annuelle</span>
                            <span className="font-black text-slate-900 text-[14px]">{formatNumber(annualAvg)} / 20</span>
                        </div>
                        <div className="flex justify-between items-center text-[12px]">
                            <span className="font-bold text-slate-700 uppercase">Rang Annuel</span>
                            <span className="font-black text-slate-900 text-[14px] underline underline-offset-2">{annualRank}</span>
                        </div>
                    </div>
                </div>
                
                {/* Column 2: Décision */}
                <div className="flex-1 p-4 flex flex-col items-center justify-between min-h-[160px]">
                    <div className="w-full flex flex-col items-center text-center">
                        <span className="text-[13px] font-bold text-slate-800 uppercase tracking-wide decoration-sky-300 underline underline-offset-4 mb-4">
                            Décision de fin d'année
                        </span>
                        
                        {isEditingDecision && canEditAppreciation ? (
                            <input
                                autoFocus
                                value={decision}
                                onChange={(e) => onDecisionChange(e.target.value)}
                                onBlur={() => setIsEditingDecision(false)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') setIsEditingDecision(false);
                                }}
                                className="w-full text-center text-lg font-bold text-red-500 border-b-2 border-red-200 outline-none focus:border-red-500 bg-transparent"
                                placeholder="Saisir la décision..."
                            />
                        ) : (
                            <div 
                                onClick={() => canEditAppreciation && setIsEditingDecision(true)}
                                className={`min-h-[32px] text-center w-full flex items-center justify-center ${canEditAppreciation ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                            >
                                {decision ? (
                                    <span style={{ fontFamily: "'Brush Script MT', 'Caveat', 'Cedarville Cursive', cursive" }} className="text-2xl font-bold text-red-500">
                                        {decision}
                                    </span>
                                ) : (
                                    <span className="text-slate-300 italic text-sm">
                                        {canEditAppreciation ? 'Cliquer pour ajouter la décision' : 'Aucune décision'}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="w-full flex flex-col items-center mt-6">
                        <span className="text-[11px] font-semibold text-slate-800 underline underline-offset-2 mb-1">
                            Nom/Signature du professeur principal
                        </span>
                        
                        <div className="h-14 w-full flex items-center justify-center relative my-1">
                            {isTeacherSigned && teacherSignature ? (
                                <img src={teacherSignature} alt="Signature Professeur" className="max-h-full max-w-[120px] object-contain opacity-80" />
                            ) : (
                                <div className="text-[10px] text-slate-400 italic flex items-center gap-2">
                                    <span>Non signé</span>
                                    {canEditAppreciation && (
                                        <button 
                                            onClick={onToggleTeacherSigned}
                                            className="px-2 py-0.5 bg-sky-100 text-sky-700 rounded hover:bg-sky-200 transition-colors font-medium"
                                        >
                                            Signer
                                        </button>
                                    )}
                                </div>
                            )}
                            {isTeacherSigned && canEditAppreciation && (
                                <button 
                                    onClick={onToggleTeacherSigned}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] text-red-500 hover:text-red-700 bg-red-50 px-1.5 py-0.5 rounded opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                                >
                                    Annuler
                                </button>
                            )}
                        </div>
                        
                        <input
                            type="text"
                            value={teacherName}
                            onChange={(e) => onTeacherNameChange(e.target.value)}
                            disabled={!canEditAppreciation}
                            placeholder="Nom du professeur"
                            className="bg-transparent text-center outline-none focus:border-b focus:border-sky-500 font-bold text-[12px] text-slate-800 w-full placeholder:text-slate-400 disabled:cursor-not-allowed uppercase"
                        />
                    </div>
                </div>
                
                {/* Column 3: Chef d'établissement */}
                <div className="flex-1 p-4 flex flex-col items-center justify-between min-h-[160px] text-center">
                    <div className="flex flex-col items-center">
                        <span className="text-[11px] font-bold text-slate-800 underline underline-offset-2">
                            Nom/Signature et Cachet du Chef d'Etablissement
                        </span>
                        
                        <div className="text-[10px] text-slate-600 font-medium my-1 flex items-center justify-center flex-wrap gap-1">
                            <span>Fait à</span>
                            <input 
                                type="text"
                                value={faitA}
                                onChange={(e) => onFaitAChange(e.target.value)}
                                disabled={!canEditDirectorSection}
                                placeholder="............"
                                className="bg-transparent text-center outline-none focus:border-b focus:border-sky-500 font-medium text-slate-700 max-w-[80px] px-1 py-0 placeholder:text-slate-400 disabled:cursor-not-allowed"
                            />
                            <span>, le</span>
                            <input 
                                type="text"
                                value={faitLe}
                                onChange={(e) => onFaitLeChange(e.target.value)}
                                disabled={!canEditDirectorSection}
                                placeholder="............"
                                className="bg-transparent text-center outline-none focus:border-b focus:border-sky-500 font-medium text-slate-700 max-w-[80px] px-1 py-0 placeholder:text-slate-400 disabled:cursor-not-allowed"
                            />
                        </div>

                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider mt-2 underline underline-offset-2">
                            DIRECTEUR DES ETUDES
                        </span>
                    </div>

                    <div className="relative h-16 w-full max-w-[200px] border-2 border-dashed border-slate-200 rounded-xl my-2 flex items-center justify-center bg-slate-50/50 group overflow-hidden">
                        {stampImage ? (
                            <div className="relative w-full h-full flex items-center justify-center p-1">
                                <img src={stampImage} alt="Cachet / Signature" className="max-h-full max-w-full object-contain" />
                                {canEditDirectorSection && (
                                    <button 
                                        onClick={() => onStampImageChange(null)}
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
                            >
                                <span 
                                    style={{ fontFamily: "'Brush Script MT', 'Caveat', 'Cedarville Cursive', cursive" }} 
                                    className="text-2xl font-bold text-blue-900 -rotate-2 select-none"
                                >
                                    {signatureText}
                                </span>
                            </div>
                        ) : (
                            <div className="w-full h-full relative flex items-center justify-center">
                                <textarea
                                    value={signatureText}
                                    onChange={(e) => onSignatureTextChange(e.target.value)}
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
                                    className="w-full h-full bg-transparent resize-none p-2 text-center text-[10px] font-serif italic text-slate-800 outline-none placeholder:text-slate-400 placeholder:italic disabled:cursor-not-allowed"
                                />
                                {canEditDirectorSection && (
                                    <label className="absolute bottom-1 right-1 text-[8px] bg-slate-200 hover:bg-slate-300 text-slate-600 px-1.5 py-0.5 rounded cursor-pointer opacity-30 hover:opacity-100 transition-opacity">
                                        📷 Img
                                        <input type="file" accept="image/*" className="hidden" onChange={handleStampUpload} />
                                    </label>
                                )}
                            </div>
                        )}
                    </div>

                    <input 
                        type="text"
                        value={directorName}
                        onChange={(e) => onDirectorNameChange(e.target.value)}
                        disabled={!canEditDirectorSection}
                        placeholder="Nom du Directeur"
                        className="bg-transparent text-center outline-none focus:border-b focus:border-sky-500 font-bold text-[12px] text-slate-800 w-full placeholder:text-slate-400 disabled:cursor-not-allowed uppercase"
                    />
                </div>
            </div>

            {canShowCloture && (
                <div className="w-full bg-slate-50/90 py-3.5 px-4 border-t border-slate-100 flex items-center justify-center">
                    <button
                        type="button"
                        onClick={onLaunchCloture}
                        className="px-6 py-2.5 bg-[#BFDBFE] hover:bg-[#93c5fd] text-blue-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-300/30 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer transform hover:scale-[1.02] active:scale-95 border border-blue-300/60"
                    >
                        <GraduationCap size={18} className="text-amber-500 animate-bounce" />
                        <span>Lancer la Clôture de l'Année</span>
                    </button>
                </div>
            )}
        </div>
    );
};
