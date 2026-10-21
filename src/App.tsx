import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AppMode,
  DrawTool,
  FontFamily,
  FontSize,
  PageWidth,
  PaperStyle,
} from './types';
import { DrawingCanvas, DrawingCanvasHandle } from './components/DrawingCanvas';
import { WritingSheet } from './components/WritingSheet';
import { Toolbar } from './components/Toolbar';
import { RippleGrid } from './components/RippleGrid';
import { ambientAudio } from './utils/audio';
import { EyeOff, AlertTriangle } from 'lucide-react';

export default function App() {
  // Mode & paper
  const [mode, setMode] = useState<AppMode>('write');
  const [paperStyle, setPaperStyle] = useState<PaperStyle>('ripple');
  const [isPureBlank, setIsPureBlank] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Writing state with local storage
  const [title, setTitle] = useState<string>(() => {
    return localStorage.getItem('page_blanche_title') || '';
  });
  const [content, setContent] = useState<string>(() => {
    return localStorage.getItem('page_blanche_content') || '';
  });

  // Typography state
  const [fontFamily, setFontFamily] = useState<FontFamily>('sans');
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [pageWidth, setPageWidth] = useState<PageWidth>('medium');
  const [focusMode, setFocusMode] = useState<boolean>(false);

  // Drawing state
  const canvasRef = useRef<DrawingCanvasHandle | null>(null);
  const [drawTool, setDrawTool] = useState<DrawTool>('pen');
  const [drawColor, setDrawColor] = useState<string>('#ffffff');
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Audio ambiance
  const [ambiance, setAmbiance] = useState<'none' | 'rain' | 'breeze' | 'paper'>('none');

  // Clear confirmation modal
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Persist text changes
  useEffect(() => {
    localStorage.setItem('page_blanche_title', title);
  }, [title]);

  useEffect(() => {
    localStorage.setItem('page_blanche_content', content);
  }, [content]);

  // Handle dark mode color adjustment when paper style switches
  useEffect(() => {
    if ((paperStyle === 'dark' || paperStyle === 'ripple') && drawColor === '#18181b') {
      setDrawColor('#ffffff');
    } else if (paperStyle !== 'dark' && paperStyle !== 'ripple' && drawColor === '#ffffff') {
      setDrawColor('#18181b');
    }
  }, [paperStyle, drawColor]);

  // Audio effect
  useEffect(() => {
    ambientAudio.setAmbiance(ambiance, 0.25);
    return () => {
      ambientAudio.stop();
    };
  }, [ambiance]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isPureBlank) {
          setIsPureBlank(false);
        } else if (isCollapsed) {
          setIsCollapsed(false);
        }
      }

      // Drawing Undo / Redo
      if (mode === 'draw') {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
          if (e.shiftKey) {
            e.preventDefault();
            canvasRef.current?.redo();
          } else {
            e.preventDefault();
            canvasRef.current?.undo();
          }
        } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
          e.preventDefault();
          canvasRef.current?.redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, isPureBlank, isCollapsed]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  }, []);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Text metrics
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Copy text handler
  const handleCopyText = () => {
    const fullText = title ? `${title}\n\n${content}` : content;
    navigator.clipboard.writeText(fullText);
  };

  // Export handler
  const handleExport = () => {
    if (mode === 'draw') {
      canvasRef.current?.exportImage(paperStyle);
    } else {
      const fullText = title ? `${title}\n\n${content}` : content;
      const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeTitle = title.trim()
        ? title.trim().toLowerCase().replace(/[^a-z0-9]/gi, '-').slice(0, 30)
        : 'page-blanche';
      link.download = `${safeTitle}-${new Date().toISOString().slice(0, 10)}.txt`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Clear handler
  const handleClear = () => {
    if (mode === 'draw') {
      canvasRef.current?.clear();
    } else {
      setTitle('');
      setContent('');
    }
    setShowClearConfirm(false);
  };

  // Paper styling class
  const getPaperBgClass = () => {
    switch (paperStyle) {
      case 'cream':
        return 'bg-[#faf8f5] text-zinc-900';
      case 'grid':
        return 'bg-white paper-grid text-zinc-900';
      case 'dots':
        return 'bg-white paper-dots text-zinc-900';
      case 'lines':
        return 'bg-white paper-lines text-zinc-900';
      case 'dark':
        return 'bg-[#18181b] text-zinc-100';
      case 'ripple':
        return 'bg-zinc-950 text-zinc-100';
      case 'blank':
      default:
        return 'bg-white text-zinc-900';
    }
  };

  return (
    <div
      className={`min-h-screen w-full relative transition-colors duration-300 overflow-x-hidden selection:bg-zinc-700 selection:text-white ${getPaperBgClass()}`}
    >
      {/* RippleGrid WebGL Background when ripple paper style is selected */}
      {paperStyle === 'ripple' && (
        <div className="absolute inset-0 z-0 pointer-events-auto">
          <RippleGrid
            color="#ffffff"
            variant="lines"
            cellSize={48}
            lineWidth={1}
            glow={0.6}
            rippleStrength={1}
            rippleSpeed={1}
            rippleSize={1}
            autoRipple="center"
            rippleInterval={2.6}
            tilt={0}
            rotation={0}
            fade={0.5}
            opacity={0.85}
            mouseInteraction
            clickRipple
            intro
            lightMode={false}
            className="absolute inset-0 w-full h-full"
          />
        </div>
      )}

      {/* Top subtle info bar */}
      {!isPureBlank && mode === 'write' && (
        <div className="fixed top-4 right-5 z-40 flex items-center gap-3 text-xs text-zinc-400 font-mono no-print select-none opacity-60 hover:opacity-100 transition-opacity">
          <span>{wordCount} mots</span>
          <span>•</span>
          <span>{charCount} caractères</span>
          {wordCount > 50 && (
            <>
              <span>•</span>
              <span>~{readingTime} min</span>
            </>
          )}
        </div>
      )}

      {/* Main Workspace */}
      <main className="w-full min-h-screen relative z-10">
        {mode === 'write' ? (
          <WritingSheet
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            fontFamily={fontFamily}
            fontSize={fontSize}
            pageWidth={pageWidth}
            paperStyle={paperStyle}
            focusMode={focusMode}
          />
        ) : (
          <DrawingCanvas
            ref={canvasRef}
            tool={drawTool}
            color={drawColor}
            lineWidth={lineWidth}
            paperStyle={paperStyle}
            onHistoryChange={(u, r) => {
              setCanUndo(u);
              setCanRedo(r);
            }}
          />
        )}
      </main>

      {/* Pure Blank Mode Exit Button */}
      {isPureBlank && (
        <div className="fixed bottom-6 right-6 z-50 no-print">
          <button
            onClick={() => setIsPureBlank(false)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs backdrop-blur-md transition-all shadow-lg hover:scale-105 active:scale-95"
            title="Quitter le mode page vierge (ou appuyer sur Échap)"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Quitter le mode vierge</span>
          </button>
        </div>
      )}

      {/* Bottom Floating Toolbar */}
      {!isPureBlank && (
        <Toolbar
          mode={mode}
          setMode={setMode}
          paperStyle={paperStyle}
          setPaperStyle={setPaperStyle}
          drawTool={drawTool}
          setDrawTool={setDrawTool}
          drawColor={drawColor}
          setDrawColor={setDrawColor}
          lineWidth={lineWidth}
          setLineWidth={setLineWidth}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={() => canvasRef.current?.undo()}
          onRedo={() => canvasRef.current?.redo()}
          onClear={() => setShowClearConfirm(true)}
          onExport={handleExport}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          fontSize={fontSize}
          setFontSize={setFontSize}
          pageWidth={pageWidth}
          setPageWidth={setPageWidth}
          focusMode={focusMode}
          setFocusMode={setFocusMode}
          onCopyText={handleCopyText}
          ambiance={ambiance}
          setAmbiance={setAmbiance}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          onEnterPureMode={() => setIsPureBlank(true)}
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
        />
      )}

      {/* Confirmation Modal for Clearing Page */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs no-print">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl text-zinc-100">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-semibold">
                Effacer la page blanche ?
              </h3>
            </div>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              {mode === 'write'
                ? 'Le texte écrit sur cette page sera entièrement effacé. Cette action est irréversible.'
                : 'Tous les tracés et dessins sur cette page blanche seront supprimés.'}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-zinc-800 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors"
              >
                Effacer tout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
