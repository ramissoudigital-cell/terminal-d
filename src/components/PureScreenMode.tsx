import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Sun, 
  Paintbrush, 
  Eraser, 
  RotateCcw, 
  Undo2, 
  Redo2, 
  Download, 
  Palette,
  ChevronUp,
  ChevronDown,
  Layers,
  ArrowLeft
} from 'lucide-react';

interface PureScreenModeProps {
  onNotify: (msg: string) => void;
  onExitPureMode?: () => void;
}

type DrawTool = 'brush' | 'eraser';

export const PureScreenMode: React.FC<PureScreenModeProps> = ({ onNotify, onExitPureMode }) => {
  // Screen light controls
  const [brightness, setBrightness] = useState<number>(100);
  const [tone, setTone] = useState<'pure' | 'warm' | 'cool'>('pure');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Toolbar states
  const [toolbarMinimized, setToolbarMinimized] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [drawingEnabled, setDrawingEnabled] = useState<boolean>(true);

  // Drawing tool states
  const [activeTool, setActiveTool] = useState<DrawTool>('brush');
  const [brushColor, setBrushColor] = useState<string>('#18181b');
  const [brushSize, setBrushSize] = useState<number>(4);
  const [eraserSize, setEraserSize] = useState<number>(24);

  // Canvas refs and history
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const colorInputRef = useRef<HTMLInputElement>(null);

  // Preset swatches
  const presetColors = [
    { label: 'Noir', value: '#18181b' },
    { label: 'Bleu cobalt', value: '#2563eb' },
    { label: 'Rouge bordeaux', value: '#dc2626' },
    { label: 'Vert émeraude', value: '#16a34a' },
    { label: 'Ambre', value: '#d97706' },
    { label: 'Violet', value: '#7c3aed' },
  ];

  const getBackgroundColor = useCallback(() => {
    switch (tone) {
      case 'warm':
        return '#fffdfa'; // Gentle warm light
      case 'cool':
        return '#f8fafc'; // Cool daylight
      default:
        return '#ffffff'; // Pure white
    }
  }, [tone]);

  // Save history state
  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const newHistory = historyRef.current.slice(0, historyIndex + 1);
      newHistory.push(imageData);
      // Limit history to 25 states to prevent memory leaks
      if (newHistory.length > 25) {
        newHistory.shift();
      }
      historyRef.current = newHistory;
      setHistoryIndex(newHistory.length - 1);
    } catch {
      // Ignored
    }
  }, [historyIndex]);

  // Setup / resize canvas
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Preserve existing content if resizing
    let tempCanvas: HTMLCanvasElement | null = null;
    if (canvas.width > 0 && canvas.height > 0) {
      tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(canvas, 0, 0);
      }
    }

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);

    if (tempCanvas) {
      ctx.drawImage(tempCanvas, 0, 0, width, height);
    } else {
      // Clear initially to transparent so background shines through
      ctx.clearRect(0, 0, width, height);
      // Push first blank state
      const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      historyRef.current = [initialData];
      setHistoryIndex(0);
    }
  }, []);

  useEffect(() => {
    setupCanvas();
    const handleResize = () => {
      setupCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setupCanvas]);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Keyboard shortcuts (B, E, Ctrl+Z, Ctrl+Y, F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key.toLowerCase() === 'b') {
        setActiveTool('brush');
        onNotify('Outil Pinceau sélectionné');
      } else if (e.key.toLowerCase() === 'e') {
        setActiveTool('eraser');
        onNotify('Outil Gomme sélectionné');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
        onNotify('Plein écran activé');
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
        onNotify('Plein écran désactivé');
      }
    } catch {
      onNotify('Mode plein écran non disponible');
    }
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newIndex = historyIndex - 1;
    const targetState = historyRef.current[newIndex];
    if (targetState) {
      ctx.putImageData(targetState, 0, 0);
      setHistoryIndex(newIndex);
    }
  };

  const handleRedo = () => {
    if (historyIndex >= historyRef.current.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newIndex = historyIndex + 1;
    const targetState = historyRef.current[newIndex];
    if (targetState) {
      ctx.putImageData(targetState, 0, 0);
      setHistoryIndex(newIndex);
    }
  };

  // Clear all drawings
  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    saveState();
    setShowClearConfirm(false);
    onNotify('Dessin effacé sur la page');
  };

  // Download canvas drawing as PNG with background applied
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas that combines the background color and drawings
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;

    // Fill background with current tone
    exportCtx.fillStyle = getBackgroundColor();
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw the strokes on top
    exportCtx.drawImage(canvas, 0, 0);

    const dataUrl = exportCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `dessin-plein-ecran-${Date.now()}.png`;
    a.click();
    onNotify('Dessin exporté en image PNG haute résolution');
  };

  // Coordinates helper
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

  // Drawing event handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawingEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    isDrawingRef.current = true;
    lastPointRef.current = coords;

    ctx.beginPath();
    ctx.arc(coords.x, coords.y, (activeTool === 'eraser' ? eraserSize : brushSize) / 2, 0, Math.PI * 2);
    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = brushColor;
      ctx.fill();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !drawingEnabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || !lastPointRef.current) return;

    const coords = getCoordinates(e);

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    
    // Smooth quadratic curve to midpoint
    const midX = (lastPointRef.current.x + coords.x) / 2;
    const midY = (lastPointRef.current.y + coords.y) / 2;
    ctx.quadraticCurveTo(lastPointRef.current.x, lastPointRef.current.y, midX, midY);

    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = eraserSize;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPointRef.current = coords;
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    lastPointRef.current = null;
    saveState();
  };

  return (
    <div 
      className="fixed inset-0 z-40 select-none overflow-hidden transition-colors"
      style={{
        backgroundColor: getBackgroundColor(),
        opacity: brightness / 100,
      }}
    >
      {/* 
        HTML5 Canvas Element over the full-screen view
        Allows seamless freehand drawing with brush, color picker & eraser 
      */}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
        className={`absolute inset-0 w-full h-full touch-none ${
          drawingEnabled 
            ? activeTool === 'eraser' 
              ? 'cursor-cell' 
              : 'cursor-crosshair'
            : 'pointer-events-none'
        }`}
      />

      {/* Floating Toolbar with Brush Tool, Color Picker, and Eraser */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 max-w-[95vw]">
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-zinc-200/90 flex flex-wrap items-center gap-2 md:gap-3 text-xs text-zinc-700">
          
          {/* Back button */}
          {onExitPureMode && (
            <>
              <button
                onClick={onExitPureMode}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:text-black rounded-lg hover:bg-zinc-100 transition-colors"
                title="Retour au mode page"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Retour</span>
              </button>
              <div className="h-4 w-px bg-zinc-200 hidden sm:block" />
            </>
          )}

          {/* Toggle Drawing layer */}
          <button
            onClick={() => {
              setDrawingEnabled(prev => !prev);
              onNotify(drawingEnabled ? 'Dessin désactivé (mode écran blanc pur)' : 'Dessin activé');
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              drawingEnabled
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
            title="Activer ou désactiver le dessin sur l'écran"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{drawingEnabled ? 'Dessin actif' : 'Écran pur'}</span>
          </button>

          {drawingEnabled && (
            <>
              <div className="h-4 w-px bg-zinc-200" />

              {/* Tool selector: Brush vs Eraser */}
              <div className="inline-flex rounded-lg p-0.5 bg-zinc-100 border border-zinc-200">
                <button
                  onClick={() => setActiveTool('brush')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeTool === 'brush'
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                  title="Pinceau / Brush (Raccourci: B)"
                >
                  <Paintbrush className="w-3.5 h-3.5" />
                  <span>Pinceau</span>
                </button>
                <button
                  onClick={() => setActiveTool('eraser')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeTool === 'eraser'
                      ? 'bg-white text-zinc-950 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                  title="Gomme / Eraser (Raccourci: E)"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Gomme</span>
                </button>
              </div>

              {/* Color Picker & Swatches (when brush is active) */}
              {activeTool === 'brush' && (
                <div className="flex items-center gap-1.5 pl-1">
                  {/* Preset quick swatches */}
                  <div className="flex items-center gap-1">
                    {presetColors.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setBrushColor(c.value)}
                        className={`w-4 h-4 rounded-full transition-transform ${
                          brushColor.toLowerCase() === c.value.toLowerCase()
                            ? 'scale-125 ring-2 ring-zinc-500 ring-offset-1'
                            : 'hover:scale-110 opacity-80'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.label}
                        aria-label={c.label}
                      />
                    ))}
                  </div>

                  {/* HTML5 Native Color Picker Button */}
                  <div className="relative flex items-center">
                    <button
                      onClick={() => colorInputRef.current?.click()}
                      className="flex items-center gap-1 p-1 rounded-md hover:bg-zinc-100 border border-zinc-200 transition-colors"
                      title="Sélecteur de couleur personnalisé"
                    >
                      <Palette className="w-3.5 h-3.5 text-zinc-600" />
                      <div 
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: brushColor }}
                      />
                    </button>
                    <input
                      ref={colorInputRef}
                      type="color"
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="sr-only"
                    />
                  </div>
                </div>
              )}

              {/* Size Slider */}
              <div className="flex items-center gap-1.5 pl-1">
                <span className="text-[11px] text-zinc-600 font-medium hidden sm:inline">
                  {activeTool === 'brush' ? 'Taille' : 'Largeur'}:
                </span>
                <input
                  type="range"
                  min={activeTool === 'brush' ? 1 : 8}
                  max={activeTool === 'brush' ? 48 : 80}
                  value={activeTool === 'brush' ? brushSize : eraserSize}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (activeTool === 'brush') {
                      setBrushSize(val);
                    } else {
                      setEraserSize(val);
                    }
                  }}
                  className="w-16 md:w-20 accent-zinc-800 cursor-pointer"
                  title="Épaisseur du trait"
                />
                <span className="font-mono text-[10px] text-zinc-600 w-5 text-right">
                  {activeTool === 'brush' ? brushSize : eraserSize}
                </span>
              </div>

              {/* Undo / Redo */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  className="p-1 rounded text-zinc-600 hover:text-zinc-950 disabled:opacity-30 disabled:hover:text-zinc-600 transition-colors"
                  title="Annuler (Ctrl+Z)"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={historyIndex >= historyRef.current.length - 1}
                  className="p-1 rounded text-zinc-600 hover:text-zinc-950 disabled:opacity-30 disabled:hover:text-zinc-600 transition-colors"
                  title="Rétablir (Ctrl+Y)"
                >
                  <Redo2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Clear canvas */}
              {showClearConfirm ? (
                <div className="flex items-center gap-1 bg-red-50 p-0.5 rounded-md border border-red-200">
                  <span className="text-[11px] text-red-700 px-1 font-medium">Effacer ?</span>
                  <button
                    onClick={handleClear}
                    className="px-2 py-0.5 bg-red-600 text-white rounded text-[10px] font-medium hover:bg-red-700"
                  >
                    Oui
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-0.5 bg-white text-zinc-700 rounded text-[10px] hover:bg-zinc-100"
                  >
                    Non
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="p-1 rounded text-zinc-500 hover:text-red-600 transition-colors"
                  title="Effacer tout le dessin"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Download PNG */}
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-medium transition-colors"
                title="Enregistrer le dessin en image PNG"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Exporter</span>
              </button>
            </>
          )}

          {/* Fullscreen & Lighting controls toggle */}
          <div className="h-4 w-px bg-zinc-200" />
          
          <button
            onClick={toggleFullscreen}
            className="p-1 text-zinc-600 hover:text-zinc-950 transition-colors rounded-md hover:bg-zinc-100"
            title={isFullscreen ? 'Quitter le plein écran' : 'Passer en plein écran'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Minimize / Expand secondary settings */}
          <button
            onClick={() => setToolbarMinimized(prev => !prev)}
            className="p-1 text-zinc-500 hover:text-zinc-800 transition-colors rounded-md"
            title="Options d'éclairage"
          >
            {toolbarMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Secondary expanded panel: Screen Brightness & White Tone */}
        {!toolbarMinimized && (
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-md border border-zinc-200/80 flex items-center gap-3 text-xs text-zinc-600">
            <div className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-zinc-500" />
              <span>Luminosité :</span>
              <input
                type="range"
                min="20"
                max="100"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-16 md:w-20 accent-zinc-800 cursor-pointer"
              />
              <span className="font-mono text-[10px] text-zinc-500 w-7 text-right">{brightness}%</span>
            </div>

            <div className="h-3 w-px bg-zinc-200" />

            <div className="flex items-center gap-1">
              <span>Nuance :</span>
              <button
                onClick={() => setTone('pure')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  tone === 'pure' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Pur
              </button>
              <button
                onClick={() => setTone('warm')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  tone === 'warm' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Chaud
              </button>
              <button
                onClick={() => setTone('cool')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  tone === 'cool' ? 'bg-zinc-800 text-white' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Froid
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subtle indicator in center on startup */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none text-zinc-600 text-xs">
        <span>Dessin libre plein écran · Pinceau (B) · Gomme (E) · Annuler (Ctrl+Z)</span>
      </div>
    </div>
  );
};
