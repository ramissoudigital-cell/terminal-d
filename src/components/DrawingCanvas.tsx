import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { DrawTool, PaperStyle } from '../types';

export interface DrawingCanvasHandle {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
  exportImage: (paperStyle: PaperStyle) => void;
  isEmpty: () => boolean;
}

interface DrawingCanvasProps {
  tool: DrawTool;
  color: string;
  lineWidth: number;
  paperStyle: PaperStyle;
  onHistoryChange?: (canUndo: boolean, canRedo: boolean) => void;
}

interface Point {
  x: number;
  y: number;
}

export const DrawingCanvas = forwardRef<DrawingCanvasHandle, DrawingCanvasProps>(({
  tool,
  color,
  lineWidth,
  paperStyle,
  onHistoryChange,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawing = useRef(false);
  const startPoint = useRef<Point>({ x: 0, y: 0 });
  const points = useRef<Point[]>([]);
  const snapshotBeforeShape = useRef<ImageData | null>(null);

  const [undoStack, setUndoStack] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  // Update parent when history changes
  useEffect(() => {
    onHistoryChange?.(undoStack.length > 0, redoStack.length > 0);
  }, [undoStack.length, redoStack.length, onHistoryChange]);

  const saveState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const state = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setUndoStack((prev) => {
        const next = [...prev, state];
        if (next.length > 25) next.shift();
        return next;
      });
      setRedoStack([]);
    } catch {
      // ignore
    }
  }, []);

  // Initialize and handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    let backup: ImageData | null = null;

    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const dpr = window.devicePixelRatio || 1;
      const width = parent.clientWidth;
      const height = parent.clientHeight;

      // Save content before resize
      if (canvas.width > 0 && canvas.height > 0) {
        try {
          backup = ctx.getImageData(0, 0, canvas.width, canvas.height);
        } catch {
          backup = null;
        }
      }

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Restore content
      if (backup) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.putImageData(backup, 0, 0);
        ctx.restore();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    saveState();
    isDrawing.current = true;
    const pt = getCanvasCoordinates(e);
    startPoint.current = pt;
    points.current = [pt];

    if (['line', 'rect', 'circle', 'arrow'].includes(tool)) {
      snapshotBeforeShape.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    } else {
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y);
      applyToolStyle(ctx);
      // Draw a tiny dot on single click/tap
      ctx.lineTo(pt.x + 0.1, pt.y + 0.1);
      ctx.stroke();
    }
  };

  const applyToolStyle = (ctx: CanvasRenderingContext2D) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = lineWidth * 2;
    } else if (tool === 'highlighter') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth * 3.5;
      ctx.globalAlpha = 0.35;
    } else if (tool === 'brush') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth * 2.2;
      ctx.globalAlpha = 0.9;
    } else {
      // pen, shapes
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = 1.0;
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const pt = getCanvasCoordinates(e);

    if (['line', 'rect', 'circle', 'arrow'].includes(tool)) {
      // Restore canvas before drawing the preview shape
      if (snapshotBeforeShape.current) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.putImageData(snapshotBeforeShape.current, 0, 0);
        ctx.restore();
      }

      applyToolStyle(ctx);
      const s = startPoint.current;

      ctx.beginPath();
      if (tool === 'line') {
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      } else if (tool === 'rect') {
        const x = Math.min(s.x, pt.x);
        const y = Math.min(s.y, pt.y);
        const w = Math.abs(pt.x - s.x);
        const h = Math.abs(pt.y - s.y);
        ctx.strokeRect(x, y, w, h);
      } else if (tool === 'circle') {
        const radiusX = Math.abs(pt.x - s.x) / 2;
        const radiusY = Math.abs(pt.y - s.y) / 2;
        const centerX = Math.min(s.x, pt.x) + radiusX;
        const centerY = Math.min(s.y, pt.y) + radiusY;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (tool === 'arrow') {
        drawArrow(ctx, s.x, s.y, pt.x, pt.y, lineWidth * 3.5);
      }
    } else {
      // Freehand drawing with quadratic curve smoothing
      points.current.push(pt);
      applyToolStyle(ctx);

      const pts = points.current;
      if (pts.length > 2) {
        const lastTwo = pts.slice(-3);
        const xc = (lastTwo[1].x + lastTwo[2].x) / 2;
        const yc = (lastTwo[1].y + lastTwo[2].y) / 2;
        ctx.quadraticCurveTo(lastTwo[1].x, lastTwo[1].y, xc, yc);
        ctx.stroke();
      } else {
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      }
    }
  };

  const drawArrow = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    headLength: number
  ) => {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
  };

  const stopDraw = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    points.current = [];
    snapshotBeforeShape.current = null;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.closePath();
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
      }
    }
  };

  // Undo / Redo
  const undo = () => {
    if (undoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const currentImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const lastState = undoStack[undoStack.length - 1];

    setRedoStack((prev) => [...prev, currentImg]);
    setUndoStack((prev) => prev.slice(0, -1));

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.putImageData(lastState, 0, 0);
    ctx.restore();
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const currentImg = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const nextState = redoStack[redoStack.length - 1];

    setUndoStack((prev) => [...prev, currentImg]);
    setRedoStack((prev) => prev.slice(0, -1));

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.putImageData(nextState, 0, 0);
    ctx.restore();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveState();
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  };

  const exportImage = (currentPaper: PaperStyle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create export canvas with background color / texture rendered
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const expCtx = exportCanvas.getContext('2d');
    if (!expCtx) return;

    // Determine background color
    let bgColor = '#ffffff';
    if (currentPaper === 'cream') bgColor = '#faf8f5';
    if (currentPaper === 'dark') bgColor = '#18181b';

    expCtx.fillStyle = bgColor;
    expCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Render grid / lines / dots if applicable
    const dpr = window.devicePixelRatio || 1;
    if (currentPaper === 'grid') {
      const step = 24 * dpr;
      expCtx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
      expCtx.lineWidth = 1;
      for (let x = 0; x < exportCanvas.width; x += step) {
        expCtx.beginPath();
        expCtx.moveTo(x, 0);
        expCtx.lineTo(x, exportCanvas.height);
        expCtx.stroke();
      }
      for (let y = 0; y < exportCanvas.height; y += step) {
        expCtx.beginPath();
        expCtx.moveTo(0, y);
        expCtx.lineTo(exportCanvas.width, y);
        expCtx.stroke();
      }
    } else if (currentPaper === 'lines') {
      const step = 32 * dpr;
      expCtx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
      expCtx.lineWidth = 1;
      for (let y = step; y < exportCanvas.height; y += step) {
        expCtx.beginPath();
        expCtx.moveTo(0, y);
        expCtx.lineTo(exportCanvas.width, y);
        expCtx.stroke();
      }
    } else if (currentPaper === 'dots') {
      const step = 24 * dpr;
      expCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      for (let x = step / 2; x < exportCanvas.width; x += step) {
        for (let y = step / 2; y < exportCanvas.height; y += step) {
          expCtx.beginPath();
          expCtx.arc(x, y, 1.2 * dpr, 0, Math.PI * 2);
          expCtx.fill();
        }
      }
    }

    // Draw the artwork on top
    expCtx.drawImage(canvas, 0, 0);

    // Download
    const dataUrl = exportCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `page-blanche-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = dataUrl;
    link.click();
  };

  const isEmpty = () => {
    return undoStack.length === 0;
  };

  useImperativeHandle(ref, () => ({
    undo,
    redo,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
    clear,
    exportImage,
    isEmpty,
  }));

  return (
    <div className="absolute inset-0 w-full h-full cursor-crosshair touch-none select-none">
      <canvas
        ref={canvasRef}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
        className="w-full h-full block"
      />
    </div>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';
