import React from 'react';
import { EditorMode, FontChoice, PaperStyle } from '../types';
import { TextEditor } from './TextEditor';
import { DrawingCanvas } from './DrawingCanvas';

interface PaperPageProps {
  mode: EditorMode;
  paperStyle: PaperStyle;
  title: string;
  content: string;
  fontChoice: FontChoice;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  isFocusMode: boolean;
  canvasDataUrl?: string;
  wordCount: number;
  lastModified: number;
  onTitleChange: (val: string) => void;
  onContentChange: (val: string) => void;
  onSaveCanvas: (dataUrl: string) => void;
  onTriggerInspiration: () => void;
}

export const PaperPage: React.FC<PaperPageProps> = ({
  mode,
  paperStyle,
  title,
  content,
  fontChoice,
  fontSize,
  isFocusMode,
  canvasDataUrl,
  wordCount,
  lastModified,
  onTitleChange,
  onContentChange,
  onSaveCanvas,
  onTriggerInspiration,
}) => {
  const isDarkPaper = paperStyle === 'dark-ink';

  const getPaperClasses = () => {
    switch (paperStyle) {
      case 'cotton-ivory':
        return 'bg-[#FAF8F5] text-neutral-900 border-stone-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]';
      case 'lined':
        return 'bg-white paper-lines text-neutral-900 border-neutral-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]';
      case 'dot-grid':
        return 'bg-white paper-dots text-neutral-900 border-neutral-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]';
      case 'grid':
        return 'bg-white paper-grid text-neutral-900 border-neutral-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]';
      case 'dark-ink':
        return 'bg-[#141416] paper-dots-dark text-neutral-100 border-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.4)]';
      case 'pure-white':
      default:
        return 'bg-white text-neutral-900 border-neutral-200/90 shadow-[0_8px_30px_rgb(0,0,0,0.04)]';
    }
  };

  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="w-full flex justify-center py-6 px-4 md:px-8 transition-colors">
      <div
        className={`print-page w-full max-w-4xl min-h-[820px] rounded-lg border p-8 md:p-14 flex flex-col justify-between transition-all duration-300 relative ${getPaperClasses()}`}
      >
        {/* Paper Content */}
        <div className="w-full flex-1">
          {mode === 'text' ? (
            <TextEditor
              title={title}
              content={content}
              fontChoice={fontChoice}
              fontSize={fontSize}
              isFocusMode={isFocusMode}
              onTitleChange={onTitleChange}
              onContentChange={onContentChange}
              onTriggerInspiration={onTriggerInspiration}
            />
          ) : (
            <DrawingCanvas
              initialDataUrl={canvasDataUrl}
              onSaveCanvas={onSaveCanvas}
              isDarkPaper={isDarkPaper}
            />
          )}
        </div>

        {/* Unboxed Metadata Footer with Typographic Separators (Strict Zero-Pill) */}
        {!isFocusMode && (
          <footer className="no-print pt-8 mt-12 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-wrap items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-600 dark:text-neutral-300">
                {mode === 'text' ? 'Feuillet de texte' : 'Feuillet de croquis'}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {mode === 'text' ? `${wordCount} mots` : 'Tracé vectoriel'}
              </span>
              {mode === 'text' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{readingTime} min de lecture</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span>Modifié à {new Date(lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span aria-hidden="true">·</span>
              <span>Sauvegardé localement</span>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};
