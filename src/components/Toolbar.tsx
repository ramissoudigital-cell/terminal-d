import React, { useState } from 'react';
import {
  AppMode,
  DrawTool,
  FontFamily,
  FontSize,
  PageWidth,
  PaperStyle,
} from '../types';
import {
  PenTool,
  Paintbrush,
  Highlighter,
  Eraser,
  Minus,
  Square,
  Circle,
  ArrowRight,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Printer,
  Maximize2,
  Minimize2,
  Eye,
  Volume2,
  VolumeX,
  Type,
  Copy,
  Check,
  ChevronUp,
  Settings2,
} from 'lucide-react';

interface ToolbarProps {
  mode: AppMode;
  setMode: (m: AppMode) => void;
  paperStyle: PaperStyle;
  setPaperStyle: (p: PaperStyle) => void;
  // Draw props
  drawTool: DrawTool;
  setDrawTool: (t: DrawTool) => void;
  drawColor: string;
  setDrawColor: (c: string) => void;
  lineWidth: number;
  setLineWidth: (w: number) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onExport: () => void;
  // Write props
  fontFamily: FontFamily;
  setFontFamily: (f: FontFamily) => void;
  fontSize: FontSize;
  setFontSize: (s: FontSize) => void;
  pageWidth: PageWidth;
  setPageWidth: (w: PageWidth) => void;
  focusMode: boolean;
  setFocusMode: (f: boolean) => void;
  onCopyText: () => void;
  // Audio
  ambiance: 'none' | 'rain' | 'breeze' | 'paper';
  setAmbiance: (a: 'none' | 'rain' | 'breeze' | 'paper') => void;
  // Display
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  onEnterPureMode: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
}

const COLOR_PALETTE = [
  { name: 'Noir', value: '#18181b' },
  { name: 'Gris', value: '#64748b' },
  { name: 'Bleu', value: '#2563eb' },
  { name: 'Rouge', value: '#dc2626' },
  { name: 'Vert', value: '#16a34a' },
  { name: 'Violet', value: '#9333ea' },
  { name: 'Jaune', value: '#eab308' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Blanc', value: '#ffffff' },
];

const STROKE_SIZES = [
  { label: 'Fin', size: 2 },
  { label: 'Moyen', size: 5 },
  { label: 'Épais', size: 10 },
  { label: 'Large', size: 20 },
];

export const Toolbar: React.FC<ToolbarProps> = ({
  mode,
  setMode,
  paperStyle,
  setPaperStyle,
  drawTool,
  setDrawTool,
  drawColor,
  setDrawColor,
  lineWidth,
  setLineWidth,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClear,
  onExport,
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  pageWidth,
  setPageWidth,
  focusMode,
  setFocusMode,
  onCopyText,
  ambiance,
  setAmbiance,
  isFullscreen,
  toggleFullscreen,
  onEnterPureMode,
  isCollapsed,
  setIsCollapsed,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopyText();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDark = paperStyle === 'dark';

  if (isCollapsed) {
    return (
      <div className="fixed bottom-6 right-6 z-50 no-print">
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 dark:bg-zinc-800/90 text-zinc-800 dark:text-zinc-200 shadow-xl border border-zinc-200/80 dark:border-zinc-700/80 backdrop-blur-md hover:scale-105 active:scale-95 transition-all text-sm font-medium"
          title="Afficher les outils"
        >
          <ChevronUp className="w-4 h-4" />
          <span>Outils</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[95vw] no-print">
      <div className="flex flex-col items-center gap-2">
        {/* Settings Popover Tray */}
        {showSettings && (
          <div
            className={`w-full max-w-md p-3 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all ${
              isDark
                ? 'bg-zinc-900/95 border-zinc-700/80 text-zinc-100'
                : 'bg-white/95 border-zinc-200/80 text-zinc-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-200/60 dark:border-zinc-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Personnalisation de la page
              </span>
              <button
                onClick={() => setShowSettings(false)}
                className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                Fermer
              </button>
            </div>

            {/* Paper texture styles */}
            <div className="mb-4">
              <label className="text-xs font-medium text-zinc-500 block mb-2">
                Type de papier
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {[
                  { id: 'blank', label: 'Blanc pur', icon: '⬜' },
                  { id: 'cream', label: 'Ivoire doux', icon: '📜' },
                  { id: 'grid', label: 'Quadrillé', icon: '🔲' },
                  { id: 'dots', label: 'Pointillé', icon: '⁖' },
                  { id: 'lines', label: 'Ligné', icon: '☰' },
                  { id: 'dark', label: 'Sombre', icon: '⬛' },
                  { id: 'ripple', label: 'RippleGrid', icon: '🌊' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPaperStyle(p.id as PaperStyle)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs transition-all border ${
                      paperStyle === p.id
                        ? 'border-zinc-900 bg-zinc-100 font-semibold dark:border-white dark:bg-zinc-800 text-zinc-900 dark:text-white ring-2 ring-zinc-400/30'
                        : 'border-zinc-200/60 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <span className="text-base mb-1">{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Write mode typography options */}
            {mode === 'write' && (
              <div className="space-y-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-500">Police:</span>
                    <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
                      {(
                        [
                          { id: 'sans', label: 'Sans' },
                          { id: 'serif', label: 'Serif' },
                          { id: 'mono', label: 'Mono' },
                          { id: 'handwriting', label: 'Écriture' },
                        ] as const
                      ).map((f) => (
                        <button
                          key={f.id}
                          onClick={() => setFontFamily(f.id)}
                          className={`px-2 py-1 rounded-md transition-all ${
                            fontFamily === f.id
                              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-medium'
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-500">Taille:</span>
                    <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
                      {(
                        [
                          { id: 'normal', label: 'A' },
                          { id: 'large', label: 'A+' },
                          { id: 'huge', label: 'A++' },
                        ] as const
                      ).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => setFontSize(s.id)}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            fontSize === s.id
                              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-bold'
                              : 'text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-500">Largeur:</span>
                    <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
                      {(
                        [
                          { id: 'narrow', label: 'Étroite' },
                          { id: 'medium', label: 'Normale' },
                          { id: 'wide', label: 'Large' },
                          { id: 'full', label: 'Pleine' },
                        ] as const
                      ).map((w) => (
                        <button
                          key={w.id}
                          onClick={() => setPageWidth(w.id)}
                          className={`px-2 py-1 rounded-md transition-all ${
                            pageWidth === w.id
                              ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-medium'
                              : 'text-zinc-600 dark:text-zinc-400'
                          }`}
                        >
                          {w.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setFocusMode(!focusMode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                      focusMode
                        ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                    }`}
                  >
                    <span>Mode Focus</span>
                    {focusMode && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}

            {/* Ambient sound picker */}
            <div className="pt-3 mt-3 border-t border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                {ambiance === 'none' ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                )}
                <span>Ambiance sonore :</span>
              </div>
              <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs">
                {[
                  { id: 'none', label: 'Silencieuse' },
                  { id: 'rain', label: 'Pluie' },
                  { id: 'breeze', label: 'Brise' },
                  { id: 'paper', label: 'Chuchotement' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setAmbiance(s.id as 'none' | 'rain' | 'breeze' | 'paper')}
                    className={`px-2 py-1 rounded-md transition-all ${
                      ambiance === s.id
                        ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-medium'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Floating Capsule Bar */}
        <div
          className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-2xl shadow-xl border backdrop-blur-xl transition-all overflow-x-auto max-w-[95vw] ${
            isDark
              ? 'bg-zinc-900/90 border-zinc-700/80 text-zinc-100'
              : 'bg-white/90 border-zinc-200/90 text-zinc-800'
          }`}
        >
          {/* Mode switch */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              onClick={() => setMode('write')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === 'write'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
              title="Écrire sur la page"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Écrire</span>
            </button>

            <button
              onClick={() => setMode('draw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mode === 'draw'
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
              title="Dessiner sur la page blanche"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dessiner</span>
            </button>

            <button
              onClick={onEnterPureMode}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 hover:bg-white/50`}
              title="Mode Page Vierge Absolue (Plein écran sans aucun élément)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Page Vierge</span>
            </button>
          </div>

          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700 mx-0.5" />

          {/* Contextual Drawing Tools */}
          {mode === 'draw' && (
            <div className="flex items-center gap-1">
              {/* Tool icons */}
              <div className="flex items-center gap-0.5">
                {[
                  { tool: 'pen', icon: PenTool, title: 'Stylo plume' },
                  { tool: 'brush', icon: Paintbrush, title: 'Pinceau' },
                  { tool: 'highlighter', icon: Highlighter, title: 'Surligneur' },
                  { tool: 'eraser', icon: Eraser, title: 'Gomme' },
                  { tool: 'line', icon: Minus, title: 'Ligne droite' },
                  { tool: 'arrow', icon: ArrowRight, title: 'Flèche' },
                  { tool: 'rect', icon: Square, title: 'Rectangle' },
                  { tool: 'circle', icon: Circle, title: 'Cercle' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = drawTool === item.tool;
                  return (
                    <button
                      key={item.tool}
                      onClick={() => setDrawTool(item.tool as DrawTool)}
                      className={`p-1.5 rounded-lg transition-all ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                      title={item.title}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>

              {/* Stroke sizes */}
              <div className="hidden lg:flex items-center gap-1 px-1 border-l border-zinc-200 dark:border-zinc-700">
                {STROKE_SIZES.map((s) => (
                  <button
                    key={s.size}
                    onClick={() => setLineWidth(s.size)}
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                      lineWidth === s.size
                        ? 'bg-zinc-200 dark:bg-zinc-700 font-bold'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                    title={`Épaisseur ${s.label}`}
                  >
                    <span
                      className="rounded-full bg-current"
                      style={{ width: `${Math.min(10, Math.max(3, s.size * 0.7))}px`, height: `${Math.min(10, Math.max(3, s.size * 0.7))}px` }}
                    />
                  </button>
                ))}
              </div>

              {/* Color dots (quick selection) */}
              <div className="flex items-center gap-1 pl-1 border-l border-zinc-200 dark:border-zinc-700">
                {COLOR_PALETTE.slice(0, 5).map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setDrawColor(c.value)}
                    style={{ backgroundColor: c.value }}
                    className={`w-4 h-4 rounded-full border transition-all ${
                      drawColor === c.value
                        ? 'ring-2 ring-offset-1 ring-blue-500 scale-110'
                        : 'border-zinc-300 dark:border-zinc-600 hover:scale-105'
                    }`}
                    title={c.name}
                  />
                ))}
              </div>

              {/* Undo / Redo */}
              <div className="flex items-center gap-0.5 pl-1 border-l border-zinc-200 dark:border-zinc-700">
                <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className={`p-1.5 rounded-lg transition-all ${
                    canUndo
                      ? 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      : 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                  }`}
                  title="Annuler (Ctrl+Z)"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onRedo}
                  disabled={!canRedo}
                  className={`p-1.5 rounded-lg transition-all ${
                    canRedo
                      ? 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      : 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                  }`}
                  title="Rétablir (Ctrl+Y)"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Contextual Writing Tools */}
          {mode === 'write' && (
            <div className="flex items-center gap-1">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                title="Copier le texte"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Copier</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-700 mx-0.5" />

          {/* Actions & Settings */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 rounded-lg transition-all ${
                showSettings
                  ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              title="Style de papier et réglages"
            >
              <Settings2 className="w-4 h-4" />
            </button>

            <button
              onClick={onExport}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              title="Télécharger / Exporter"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={() => window.print()}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              title="Imprimer la page"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onClear}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all"
              title="Effacer la page"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              title="Réduire la barre d'outils"
            >
              <ChevronUp className="w-4 h-4 rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
