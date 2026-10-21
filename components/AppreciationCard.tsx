import React, { useState, useRef, useEffect } from 'react';
import { Frown, Meh, Smile, ThumbsUp, Star, PenLine, Trash2, Upload, X, Check, RefreshCw, Lock, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

    // Signature Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'draw' | 'upload'>('draw');
    const [inputName, setInputName] = useState('');
    const [penColor, setPenColor] = useState('#1e3a8a');
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isModalOpen) {
            window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: true } }));
            window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: true } }));
        } else {
            window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: false } }));
            window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: false } }));
        }
        return () => {
            window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: false } }));
            window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: false } }));
        };
    }, [isModalOpen]);

    const selectedAppreciation = propSelectedAppreciation !== undefined ? propSelectedAppreciation : localAppreciation;
    const teacherName = propTeacherName !== undefined ? propTeacherName : localTeacherName;
    const isSigned = propIsSigned !== undefined ? propIsSigned : (localIsSigned || Boolean(teacherSignature));
    const effectiveCanSign = canSign !== undefined ? canSign : canEdit;

    useEffect(() => {
        if (isModalOpen) {
            setInputName(teacherName || 'Professeur Principal');
            setHasDrawn(false);
            setUploadedImage(null);
        }
    }, [isModalOpen, teacherName]);

    useEffect(() => {
        if (isModalOpen && activeTab === 'draw' && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.lineWidth = 2.5;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = penColor;
            }
        }
    }, [isModalOpen, activeTab, penColor]);

    const handleSelectAppreciation = (label: string) => {
        const val = selectedAppreciation === label ? null : label;
        if (onSelectAppreciation) onSelectAppreciation(val);
        else setLocalAppreciation(val);
    };

    const handleTeacherNameChange = (val: string) => {
        if (onTeacherNameChange) onTeacherNameChange(val);
        else setLocalTeacherName(val);
    };

    const handleToggleSigned = (signed: boolean) => {
        if (onToggleSigned) onToggleSigned(signed);
        else setLocalIsSigned(signed);
    };

    // Canvas drawing helpers
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.strokeStyle = penColor;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
        setIsDrawing(true);
        setHasDrawn(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
    };

    const downloadCanvasPNG = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const safeName = (teacherName || 'signature').toLowerCase().replace(/[^a-z0-9à-ÿ]/gi, '-');
        link.download = `signature-${safeName}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setUploadedImage(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveModal = () => {
        let finalSignatureUrl = '';
        if (activeTab === 'draw' && canvasRef.current && hasDrawn) {
            finalSignatureUrl = canvasRef.current.toDataURL('image/png');
        } else if (activeTab === 'upload' && uploadedImage) {
            finalSignatureUrl = uploadedImage;
        } else {
            // Text signature fallback
            finalSignatureUrl = inputName.trim() || teacherName || 'Professeur Principal';
        }

        const nameToSave = inputName.trim() || teacherName || 'Professeur Principal';
        handleTeacherNameChange(nameToSave);
        handleToggleSigned(true);

        if (onSaveSignature) {
            onSaveSignature(finalSignatureUrl, nameToSave);
        }

        setIsModalOpen(false);
    };

    const handleDelete = () => {
        if (onDeleteSignature) {
            onDeleteSignature();
        }
        handleToggleSigned(false);
    };

    const appreciations = [
        { label: 'Mauvais', icon: Frown, color: 'text-red-500' },
        { label: 'Passable', icon: Meh, color: 'text-orange-500' },
        { label: 'Bien', icon: Smile, color: 'text-yellow-600' },
        { label: 'Très bien', icon: ThumbsUp, color: 'text-emerald-500' },
        { label: 'Excellent', icon: Star, color: 'text-amber-500' }
    ];

    const isImageSig = teacherSignature && (teacherSignature.startsWith('data:image') || teacherSignature.startsWith('http') || teacherSignature.startsWith('blob'));

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

            {/* Signature section */}
            <div className="mt-4 flex flex-col items-end border-t border-slate-100 pt-4">
                <span className="text-[11px] font-bold text-slate-600 mb-2 uppercase tracking-wide">Signature du professeur principal</span>
                
                {(teacherSignature || isSigned) ? (
                    <div className="flex flex-col items-end gap-1.5">
                        <div className="bg-slate-50 p-2 rounded-2xl border border-slate-100 flex flex-col items-center justify-center min-h-[64px] min-w-[160px] max-w-[220px]">
                            {isImageSig ? (
                                <img src={teacherSignature} alt="Signature Professeur" className="max-h-14 max-w-full object-contain" />
                            ) : (
                                <span 
                                    style={{ fontFamily: "'Brush Script MT', 'Caveat', 'Cedarville Cursive', cursive" }} 
                                    className="text-3xl text-slate-800 -rotate-3 px-2 py-1 select-none"
                                >
                                    {teacherName || 'Professeur Principal'}
                                </span>
                            )}
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider border-t border-slate-200 pt-1 mt-1 w-full text-center">
                                {teacherName || 'Professeur Principal'}
                            </span>
                        </div>

                        {/* Action buttons for authorized users */}
                        {effectiveCanSign && (
                            <div className="flex items-center gap-2 mt-1">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(true)}
                                    className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                                    title="Remplacer la signature"
                                >
                                    <PenLine size={13} />
                                    <span>Remplacer</span>
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleDelete}
                                    className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                                    title="Supprimer la signature"
                                >
                                    <Trash2 size={13} />
                                    <span>Supprimer</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-end gap-1">
                        {effectiveCanSign ? (
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(true)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/25 flex items-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
                            >
                                <PenLine size={14} />
                                <span>Signer (Prof. Principal)</span>
                            </button>
                        ) : (
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100/90 border border-slate-200/90 px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs">
                                <Lock size={12} className="text-slate-400 shrink-0" />
                                <span>Non signé par le professeur principal</span>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL DE SIGNATURE DU PROFESSEUR PRINCIPAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end justify-center p-0 md:items-center md:justify-center md:p-4">
                        <motion.div
                            initial={isMobile ? { y: "100%", opacity: 0 } : { opacity: 0, scale: 0.95 }}
                            animate={isMobile ? { y: 0, opacity: 1 } : { opacity: 1, scale: 1 }}
                            exit={isMobile ? { y: "100%", opacity: 0 } : { opacity: 0, scale: 0.95 }}
                            transition={isMobile ? { type: "spring", damping: 25, stiffness: 300 } : { duration: 0.2 }}
                            className="bg-white rounded-t-[2.5rem] rounded-b-none md:rounded-3xl max-w-lg w-full p-6 pb-8 md:p-6 shadow-2xl space-y-5 border-t border-slate-100 md:border border-slate-100 relative"
                        >
                            {/* Drag Handle Indicator for Mobile Bottom Sheet */}
                            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-1 md:hidden" />
                            {/* Header */}
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-base sm:text-lg font-extrabold text-slate-800 whitespace-nowrap tracking-tight">Signature du Professeur Principal</h3>
                                    <p className="text-xs text-slate-500 truncate">Ajouter ou remplacer la signature officielle pour le bulletin</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0 ml-2"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Nom du Professeur */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Nom & Prénom du Professeur Principal
                                </label>
                                <input
                                    type="text"
                                    value={inputName}
                                    onChange={(e) => setInputName(e.target.value)}
                                    placeholder="Ex: M. KOUASSI ERIC"
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold text-slate-800"
                                />
                            </div>

                            {/* Tab selection */}
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('draw')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                                        activeTab === 'draw' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <PenLine size={14} />
                                    <span>Dessiner</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('upload')}
                                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                                        activeTab === 'upload' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    <Upload size={14} />
                                    <span>Importer une image</span>
                                </button>
                            </div>

                            {/* TAB 1: DRAW CANVAS */}
                            {activeTab === 'draw' && (
                                <div className="space-y-3">
                                    <div className="flex flex-row items-center justify-between gap-2 flex-wrap">
                                        <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Tracer votre signature ci-dessous :</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-400">Couleur :</span>
                                            {['#1e3a8a', '#0f172a', '#b91c1c'].map((color) => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setPenColor(color)}
                                                    className={`w-5 h-5 rounded-full border-2 transition-transform ${
                                                        penColor === color ? 'scale-125 border-blue-500' : 'border-transparent opacity-80 hover:opacity-100'
                                                    }`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                            <button
                                                type="button"
                                                onClick={downloadCanvasPNG}
                                                className="ml-2 text-xs text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-bold transition-all shadow-2xs"
                                                title="Télécharger le tracé au format PNG"
                                            >
                                                <Download size={13} />
                                                <span>Télécharger PNG</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={clearCanvas}
                                                className="text-xs text-slate-500 hover:text-rose-600 px-2 py-1 rounded-lg flex items-center gap-1 font-medium transition-colors"
                                            >
                                                <RefreshCw size={12} />
                                                <span>Effacer</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-2 flex items-center justify-center relative touch-none">
                                        <canvas
                                            ref={canvasRef}
                                            width={420}
                                            height={160}
                                            onMouseDown={startDrawing}
                                            onMouseMove={draw}
                                            onMouseUp={stopDrawing}
                                            onMouseLeave={stopDrawing}
                                            onTouchStart={startDrawing}
                                            onTouchMove={draw}
                                            onTouchEnd={stopDrawing}
                                            className="w-full h-[160px] bg-white rounded-xl cursor-crosshair shadow-inner"
                                        />
                                        {!hasDrawn && (
                                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 text-xs font-medium italic">
                                                Dessinez votre signature ici avec la souris ou au doigt
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: UPLOAD IMAGE */}
                            {activeTab === 'upload' && (
                                <div className="space-y-3">
                                    <label className="block text-xs font-semibold text-slate-600">
                                        Sélectionnez un fichier image (PNG, JPG, WebP) :
                                    </label>
                                    
                                    {uploadedImage ? (
                                        <div className="relative border border-slate-200 rounded-2xl p-4 bg-slate-50 flex flex-col items-center justify-center gap-2">
                                            <img src={uploadedImage} alt="Aperçu Signature" className="max-h-28 max-w-full object-contain" />
                                            <button
                                                type="button"
                                                onClick={() => setUploadedImage(null)}
                                                className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 mt-1"
                                            >
                                                <X size={12} />
                                                <span>Changer d'image</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-6 bg-slate-50/50 hover:bg-blue-50/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center">
                                            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                                <Upload size={20} />
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-slate-700 block">Cliquez pour parcourir ou glissez un fichier</span>
                                                <span className="text-[10px] text-slate-400 block mt-0.5">PNG, JPG ou WebP avec fond transparent de préférence</span>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                            )}

                            {/* Actions Footer */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors text-xs"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveModal}
                                    className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 transition-all text-xs flex items-center justify-center gap-2"
                                >
                                    <Check size={16} />
                                    <span>Enregistrer la signature</span>
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

