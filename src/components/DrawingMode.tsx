import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Pen, 
  Highlighter, 
  Eraser, 
  Undo2, 
  Redo2, 
  RotateCcw, 
  Download
} from 'lucide-react';

interface DrawingModeProps {
  onNotify: (msg: string) => void;
}

type ToolType = 'pen' | 'highlighter' | 'eraser';

export const DrawingMode: React.FC<DrawingModeProps> = ({ onNotify }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTool, setActiveTool] = useState<ToolType>('pen');
  const [activeColor, setActiveColor] = useState<string>('#18181b'); // Dark ink
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const colors = [
    { label: 'Noir d\'encre', value: '#18181b' },
    { label: 'Bleu cobalt', value: '#1d4ed8' },
    { label: 'Gris graphite', value: '#52525b' },
    { label: 'Rouge bordeaux', value: '#b91c1c' },
    { label: 'Vert sauge', value: '#15803d' },
  ];

  // Helper to save history step
  const pushHistory = useCallback((ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    try {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory(prev => {
        const newHistory = prev.slice(0, historyStep + 1);
        return [...newHistory, data];
      });
      setHistoryStep(prev => prev + 1);
    } catch {
      // Ignored if canvas tainted
    }
  }, [historyStep]);

  // Initialize canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.max(Math.floor(window.innerHeight * 0.72), 550);

    // Only set if changed
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;

      // Fill pure white initially
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Initial state in history
      const initialData = ctx.getImageData(0, 0, width, height);
      setHistory([initialData]);
      setHistoryStep(0);
    }
  }, []);

  // Handle undo
  const handleUndo = () => {
    if (historyStep <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newStep = historyStep - 1;
    ctx.putImageData(history[newStep], 0, 0);
    setHistoryStep(newStep);
  };

  // Handle redo
  const handleRedo = () => {
    if (historyStep >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newStep = historyStep + 1;
    ctx.putImageData(history[newStep], 0, 0);
    setHistoryStep(newStep);
  };

  // Coordinate retrieval helper
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (activeTool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = strokeWidth * 4;
      ctx.globalAlpha = 1.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    } else if (activeTool === 'highlighter') {
      ctx.strokeStyle = '#fef08a'; // Pastel highlighter yellow
      ctx.lineWidth = strokeWidth * 4;
      ctx.globalAlpha = 0.35;
      ctx.lineCap = 'square';
      ctx.lineJoin = 'round';
    } else {
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = strokeWidth;
      ctx.globalAlpha = 1.0;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.closePath();
    setIsDrawing(false);
    pushHistory(ctx, canvas);
  };

  // Clear drawing
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pushHistory(ctx, canvas);
    setShowClearConfirm(false);
    onNotify('Page de dessin remise à blanc.');
  };

  // Download image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const image = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = image;
    a.download = 'croquis-page-blanche.png';
    a.click();
    onNotify('Dessin téléchargé (format PNG)');
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center pt-2 pb-16 px-4 md:px-8">
      {/* Drawing Toolbar */}
      <div className="no-print w-full max-w-4xl mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600 border-b border-zinc-100 pb-3">
        {/* Tools */}
        <div className="flex items-center gap-1.5">
          <span className="text-zinc-600 font-medium mr-1">Outil :</span>
          <div className="inline-flex rounded-md p-0.5 bg-zinc-100 border border-zinc-200">
            <button
              onClick={() => {
                setActiveTool('pen');
                setStrokeWidth(3);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeTool === 'pen' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Pen className="w-3.5 h-3.5" />
              <span>Plume</span>
            </button>
            <button
              onClick={() => {
                setActiveTool('highlighter');
                setStrokeWidth(8);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeTool === 'highlighter' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Highlighter className="w-3.5 h-3.5" />
              <span>Surligneur</span>
            </button>
            <button
              onClick={() => {
                setActiveTool('eraser');
                setStrokeWidth(12);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeTool === 'eraser' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Gomme</span>
            </button>
          </div>
        </div>

        {/* Colors (only active if not eraser/highlighter) */}
        {activeTool === 'pen' && (
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-600 font-medium mr-1">Encre :</span>
            <div className="flex items-center gap-1.5 p-1 bg-zinc-50 border border-zinc-200 rounded-md">
              {colors.map(col => (
                <button
                  key={col.value}
                  onClick={() => setActiveColor(col.value)}
                  className={`w-4 h-4 rounded-full transition-transform ${
                    activeColor === col.value ? 'scale-125 ring-2 ring-zinc-400 ring-offset-1' : 'hover:scale-110 opacity-80'
                  }`}
                  style={{ backgroundColor: col.value }}
                  title={col.label}
                  aria-label={col.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* Thickness */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-600 font-medium">Trait :</span>
          <div className="inline-flex rounded-md p-0.5 bg-zinc-100 border border-zinc-200">
            <button
              onClick={() => setStrokeWidth(2)}
              className={`px-2 py-1 rounded text-xs ${strokeWidth <= 2 ? 'bg-white text-zinc-900 shadow-xs font-medium' : 'text-zinc-600'}`}
            >
              Fin
            </button>
            <button
              onClick={() => setStrokeWidth(4)}
              className={`px-2 py-1 rounded text-xs ${strokeWidth === 4 ? 'bg-white text-zinc-900 shadow-xs font-medium' : 'text-zinc-600'}`}
            >
              Moyen
            </button>
            <button
              onClick={() => setStrokeWidth(8)}
              className={`px-2 py-1 rounded text-xs ${strokeWidth >= 8 ? 'bg-white text-zinc-900 shadow-xs font-medium' : 'text-zinc-600'}`}
            >
              Épais
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={historyStep <= 0}
            className="p-1.5 text-zinc-600 hover:text-zinc-900 disabled:opacity-30 disabled:hover:text-zinc-600 transition-colors"
            title="Annuler (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRedo}
            disabled={historyStep >= history.length - 1}
            className="p-1.5 text-zinc-600 hover:text-zinc-900 disabled:opacity-30 disabled:hover:text-zinc-600 transition-colors"
            title="Rétablir"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-800 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors shadow-2xs ml-1"
            title="Télécharger le canvas en image PNG"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-semibold">Télécharger PNG</span>
          </button>

          {showClearConfirm ? (
            <div className="flex items-center gap-1 bg-red-50 p-0.5 rounded-md border border-red-200 ml-1">
              <span className="text-[11px] text-red-700 px-1 font-medium">Effacer ?</span>
              <button
                onClick={handleClear}
                className="px-2 py-0.5 bg-red-600 text-white rounded text-[11px] font-medium hover:bg-red-700"
              >
                Oui
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-0.5 bg-white text-zinc-700 rounded text-[11px] hover:bg-zinc-100"
              >
                Non
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-500 hover:text-red-600 transition-colors ml-1"
              title="Effacer le dessin"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Effacer</span>
            </button>
          )}
        </div>
      </div>

      {/* Canvas Paper Container */}
      <div 
        ref={containerRef}
        className="w-full max-w-4xl bg-white border border-zinc-200/90 rounded-lg md:rounded-xl shadow-[0_1px_12px_rgba(0,0,0,0.04)] overflow-hidden"
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full cursor-crosshair touch-none select-none block"
        />
      </div>

      {/* Quiet hint footer */}
      <div className="w-full max-w-4xl mt-3 px-2 flex items-center justify-between text-xs text-zinc-500">
        <span>Feuille de dessin tactile et souris</span>
        <span>Format vectorisé PNG exportable</span>
      </div>
    </div>
  );
};
