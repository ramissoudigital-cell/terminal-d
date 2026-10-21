import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { calculateAnnualAverage, getStudentTrimesterAverage, getNextClass, isTechnicalClass } from '../src/utils/academicUtils';
import { Check, AlertTriangle, ArrowRight, UserCheck, UserX, Save, RotateCcw, X, GraduationCap } from 'lucide-react';

interface BilanFinAnneeProps {
    students: any[];
    onUpdateAllStudents: (updatedStudents: any[]) => void;
    onClose: () => void;
}

export const BilanFinAnnee: React.FC<BilanFinAnneeProps> = ({ students, onUpdateAllStudents, onClose }) => {
    const [minAverage, setMinAverage] = useState<number>(10);
    const [hasValidated, setHasValidated] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [manualDecisions, setManualDecisions] = useState<Record<string, 'Admis' | 'Redoublant'>>({});

    const processedStudents = useMemo(() => {
        return students.map(s => {
            const t1 = getStudentTrimesterAverage(s, '1er trim');
            const t2 = getStudentTrimesterAverage(s, '2ème trim');
            const t3 = getStudentTrimesterAverage(s, '3ème trim');
            
            const isTech = isTechnicalClass(s.class || '');
            const annualAvg = calculateAnnualAverage(t1, t2, t3, isTech);
            
            const isComplete = t1 !== null && t2 !== null && t3 !== null;
            
            let autoDecision: 'Admis' | 'Redoublant' = 'Redoublant';
            if (annualAvg !== null && annualAvg >= minAverage) {
                autoDecision = 'Admis';
            }
            
            const finalDecision = manualDecisions[s.id] || autoDecision;
            
            return {
                ...s,
                t1, t2, t3,
                annualAvg,
                isComplete,
                autoDecision,
                finalDecision,
                nextClass: finalDecision === 'Admis' ? getNextClass(s.class || '') : s.class
            };
        });
    }, [students, minAverage, manualDecisions]);

    const stats = useMemo(() => {
        return {
            total: processedStudents.length,
            admis: processedStudents.filter(s => s.finalDecision === 'Admis').length,
            redoublants: processedStudents.filter(s => s.finalDecision === 'Redoublant').length,
            incompletes: processedStudents.filter(s => !s.isComplete).length
        };
    }, [processedStudents]);

    const handleApplyClick = () => {
        setShowConfirmModal(true);
    };

    const handleConfirmApply = () => {
        setIsApplying(true);
        setShowConfirmModal(false);
        
        const currentYear = new Date().getFullYear();
        const schoolYear = `${currentYear - 1}-${currentYear}`;

        const updatedStudents = processedStudents.map(s => {
            // Create history entry
            const historyEntry = {
                year: schoolYear,
                class: s.class,
                annualAvg: s.annualAvg,
                decision: s.finalDecision,
                status: s.finalDecision
            };
            
            // Destructure processing properties out so no undefined fields are passed
            const { t1, t2, t3, annualAvg, isComplete, autoDecision, finalDecision, nextClass, ...cleanStudent } = s;

            return {
                ...cleanStudent,
                class: nextClass,
                annualDecision: finalDecision,
                history: [...(cleanStudent.history || []), historyEntry],
                // Clear current year trimesters and grades for the new year
                trimesters: {},
                grades: [],
                subjects: (cleanStudent.subjects || []).map((sub: any) => ({
                    ...sub,
                    value: 0,
                    average: 0,
                    grades: []
                }))
            };
        });

        setTimeout(() => {
            onUpdateAllStudents(updatedStudents);
            setIsApplying(false);
            setHasValidated(true);
        }, 600);
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-center items-center">
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] w-full md:max-w-5xl h-[90vh] md:h-[85vh] shadow-2xl relative flex flex-col overflow-hidden"
            >
                {hasValidated ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Check className="w-12 h-12 text-emerald-600 animate-bounce" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-3">Année scolaire clôturée avec succès !</h2>
                        <p className="text-slate-600 max-w-md mx-auto mb-8 leading-relaxed">
                            Toutes les décisions ont été enregistrées. Les élèves admis sont désormais dans leur nouvelle classe et l'historique de l'année écoulée a été sauvegardé.
                        </p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/25 transition-all transform hover:scale-[1.02] cursor-pointer"
                        >
                            Fermer et retourner au tableau de bord
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600">
                                    <GraduationCap size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800">Clôture de l'Année Scolaire</h2>
                                    <p className="text-sm text-slate-500">Validation des passages et redoublements</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                                    <span className="text-slate-500 text-sm font-medium mb-1">Total Élèves</span>
                                    <span className="text-3xl font-bold text-slate-800">{stats.total}</span>
                                </div>
                                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm flex flex-col">
                                    <span className="text-emerald-600 text-sm font-medium mb-1 flex items-center gap-1"><UserCheck size={16}/> Admis</span>
                                    <span className="text-3xl font-bold text-emerald-700">{stats.admis}</span>
                                </div>
                                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 shadow-sm flex flex-col">
                                    <span className="text-rose-600 text-sm font-medium mb-1 flex items-center gap-1"><UserX size={16}/> Redoublants</span>
                                    <span className="text-3xl font-bold text-rose-700">{stats.redoublants}</span>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 shadow-sm flex flex-col">
                                    <span className="text-amber-600 text-sm font-medium mb-1 flex items-center gap-1"><AlertTriangle size={16}/> Incomplets</span>
                                    <span className="text-3xl font-bold text-amber-700">{stats.incompletes}</span>
                                </div>
                            </div>

                            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
                                <div>
                                    <h3 className="font-semibold text-slate-800">Moyenne de passage exigée</h3>
                                    <p className="text-xs text-slate-500">Moyenne annuelle minimum pour l'admission automatique.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        min="0" max="20" step="0.25"
                                        value={minAverage}
                                        onChange={(e) => setMinAverage(Number(e.target.value))}
                                        className="w-20 px-3 py-2 text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-sky-500 font-bold"
                                    />
                                    <span className="text-slate-500 font-medium">/ 20</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[800px]">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                                                <th className="p-4 font-semibold">Élève</th>
                                                <th className="p-4 font-semibold">Classe Actuelle</th>
                                                <th className="p-4 font-semibold">Moy. Annuelle</th>
                                                <th className="p-4 font-semibold">Décision</th>
                                                <th className="p-4 font-semibold">Classe Suivante</th>
                                                <th className="p-4 font-semibold">Action Manuelle</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {processedStudents.map(s => (
                                                <tr key={s.id} className={`hover:bg-slate-50 transition-colors ${!s.isComplete ? 'bg-amber-50/30' : ''}`}>
                                                    <td className="p-4">
                                                        <div className="font-semibold text-slate-800">{s.name}</div>
                                                        <div className="text-xs text-slate-500">{s.studentId || 'Sans matricule'}</div>
                                                    </td>
                                                    <td className="p-4 text-slate-600 font-medium">{s.class}</td>
                                                    <td className="p-4">
                                                        {s.annualAvg !== null ? (
                                                            <span className={`font-bold ${s.annualAvg >= minAverage ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                                {s.annualAvg.toFixed(2)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-amber-500 text-sm italic">Incomplet</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                                            s.finalDecision === 'Admis' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                                        }`}>
                                                            {s.finalDecision}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-slate-600 font-medium flex items-center gap-2">
                                                        {s.finalDecision === 'Admis' && s.class !== s.nextClass ? (
                                                            <>
                                                                <ArrowRight size={14} className="text-slate-400" />
                                                                <span className="text-sky-600 font-bold">{s.nextClass}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4">
                                                        <select
                                                            value={s.finalDecision}
                                                            onChange={(e) => setManualDecisions(prev => ({ ...prev, [s.id]: e.target.value as any }))}
                                                            className="text-sm border-slate-200 rounded-lg focus:ring-sky-500 focus:border-sky-500 py-1.5"
                                                        >
                                                            <option value="Admis">Admis</option>
                                                            <option value="Redoublant">Redoublant</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-white border-t border-slate-100 shrink-0 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleApplyClick}
                                disabled={isApplying}
                                className="px-6 py-2.5 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-700 shadow-md shadow-sky-600/20 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <Save size={18} />
                                {isApplying ? "Application en cours..." : "Appliquer les décisions"}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>

            {/* CONFIRMATION MODAL OVERLAY */}
            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={() => setShowConfirmModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl z-10 border border-slate-100 text-center"
                        >
                            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                Confirmer la clôture de l'année scolaire ?
                            </h3>
                            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                                Vous êtes sur le point de valider les décisions pour <strong className="text-slate-800">{stats.total} élèves</strong> :
                            </p>

                            <div className="grid grid-cols-2 gap-3 mb-6 text-left">
                                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                                    <div className="text-xs text-emerald-600 font-medium">Admis (passage)</div>
                                    <div className="text-lg font-bold text-emerald-700">{stats.admis} élève(s)</div>
                                </div>
                                <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                                    <div className="text-xs text-rose-600 font-medium">Redoublants</div>
                                    <div className="text-lg font-bold text-rose-700">{stats.redoublants} élève(s)</div>
                                </div>
                            </div>

                            <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl mb-6 text-left border border-amber-200">
                                ⚠️ Cette action est irréversible. Les classes des élèves admis seront mises à jour, leurs moyennes réinitialisées et inscrites dans l'historique scolaire.
                            </p>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmModal(false)}
                                    className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmApply}
                                    className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                                >
                                    <Check size={18} />
                                    Oui, appliquer les décisions
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
