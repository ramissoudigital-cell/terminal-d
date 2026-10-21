import React, { useState, useEffect, useRef } from 'react';
import { 
  Copy, 
  Download, 
  Printer, 
  RotateCcw, 
  Check, 
  AlignLeft, 
  AlignCenter, 
  AlignJustify,
  FileDown
} from 'lucide-react';

export type PaperStyle = 'plain' | 'lined' | 'grid' | 'dots';
export type FontChoice = 'editorial' | 'sans' | 'typewriter';

interface WritingModeProps {
  paperStyle: PaperStyle;
  setPaperStyle: (style: PaperStyle) => void;
  fontChoice: FontChoice;
  setFontChoice: (font: FontChoice) => void;
  onNotify: (msg: string) => void;
}

export const WritingMode: React.FC<WritingModeProps> = ({
  paperStyle,
  setPaperStyle,
  fontChoice,
  setFontChoice,
  onNotify,
}) => {
  const [title, setTitle] = useState(() => {
    return localStorage.getItem('page_blanche_title') || '';
  });
  const [content, setContent] = useState(() => {
    return localStorage.getItem('page_blanche_content') || '';
  });
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [alignment, setAlignment] = useState<'left' | 'center' | 'justify'>('left');
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem('page_blanche_title', title);
  }, [title]);

  useEffect(() => {
    localStorage.setItem('page_blanche_content', content);
  }, [content]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 480)}px`;
    }
  }, [content]);

  // Statistics calculation
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const handleCopy = async () => {
    const fullText = title ? `${title}\n\n${content}` : content;
    if (!fullText.trim()) {
      onNotify('La page blanche est encore vide.');
      return;
    }
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      onNotify('Texte copié dans le presse-papiers');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onNotify('Impossible de copier automatiquement');
    }
  };

  const handleDownloadTxt = () => {
    const fullText = title ? `${title}\n\n${content}` : content;
    if (!fullText.trim()) {
      onNotify('La page est vide, rien à télécharger.');
      return;
    }
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.trim() ? title.slice(0, 30).replace(/[^a-zA-Z0-9à-ÿ]/g, '_') : 'page-blanche'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Fichier texte téléchargé');
  };

  const handleDownloadMarkdown = () => {
    const fullText = title ? `# ${title}\n\n${content}` : content;
    if (!fullText.trim()) {
      onNotify('La page est vide, rien à télécharger.');
      return;
    }
    const blob = new Blob([fullText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.trim() ? title.slice(0, 30).replace(/[^a-zA-Z0-9à-ÿ]/g, '_') : 'page-blanche'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('Document Markdown téléchargé');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClear = () => {
    setTitle('');
    setContent('');
    localStorage.removeItem('page_blanche_title');
    localStorage.removeItem('page_blanche_content');
    setShowClearConfirm(false);
    onNotify('Nouvelle page blanche prête.');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Determine paper styling class
  const getPaperClass = () => {
    switch (paperStyle) {
      case 'lined':
        return 'paper-lined';
      case 'grid':
        return 'paper-grid';
      case 'dots':
        return 'paper-dots';
      default:
        return 'bg-white';
    }
  };

  // Determine font styling class
  const getFontClass = () => {
    switch (fontChoice) {
      case 'editorial':
        return 'font-editorial';
      case 'typewriter':
        return 'font-typewriter tracking-normal';
      default:
        return 'font-sans-clean';
    }
  };

  // Determine font size
  const getSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-base md:text-lg';
      case 'lg':
        return 'text-xl md:text-2xl';
      case 'xl':
        return 'text-2xl md:text-3xl';
      default:
        return 'text-lg md:text-xl';
    }
  };

  const getAlignClass = () => {
    switch (alignment) {
      case 'center':
        return 'text-center';
      case 'justify':
        return 'text-justify';
      default:
        return 'text-left';
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center pt-2 pb-16 px-4 md:px-8">
      {/* Secondary contextual formatting bar */}
      <div className="no-print w-full max-w-4xl mb-6 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600 border-b border-zinc-100 pb-3">
        {/* Paper style selector */}
        <div className="flex items-center gap-1">
          <span className="text-zinc-600 font-medium mr-1">Style de feuille :</span>
          <div className="inline-flex rounded-md p-0.5 bg-zinc-100 border border-zinc-200">
            <button
              onClick={() => setPaperStyle('plain')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                paperStyle === 'plain'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Page blanche unie"
            >
              Blanche
            </button>
            <button
              onClick={() => setPaperStyle('lined')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                paperStyle === 'lined'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Feuille lignée style carnet"
            >
              Lignées
            </button>
            <button
              onClick={() => setPaperStyle('grid')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                paperStyle === 'grid'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Quadrillage"
            >
              Quadrillée
            </button>
            <button
              onClick={() => setPaperStyle('dots')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                paperStyle === 'dots'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Pointillés carnet"
            >
              Points
            </button>
          </div>
        </div>

        {/* Font choice & Size */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <span className="text-zinc-600 font-medium mr-1">Police :</span>
            <div className="inline-flex rounded-md p-0.5 bg-zinc-100 border border-zinc-200">
              <button
                onClick={() => setFontChoice('editorial')}
                className={`px-2 py-1 rounded text-xs font-serif ${
                  fontChoice === 'editorial' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Sérif
              </button>
              <button
                onClick={() => setFontChoice('sans')}
                className={`px-2 py-1 rounded text-xs ${
                  fontChoice === 'sans' ? 'bg-white text-zinc-900 shadow-xs font-medium' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Sans
              </button>
              <button
                onClick={() => setFontChoice('typewriter')}
                className={`px-2 py-1 rounded text-xs font-mono ${
                  fontChoice === 'typewriter' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                Mono
              </button>
            </div>
          </div>

          {/* Size */}
          <div className="flex items-center gap-1">
            <div className="inline-flex rounded-md p-0.5 bg-zinc-100 border border-zinc-200">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-1 rounded text-xs ${fontSize === 'sm' ? 'bg-white text-zinc-900 shadow-xs font-medium' : 'text-zinc-600 hover:text-zinc-900'}`}
                title="Taille petite"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('base')}
                className={`px-2 py-1 rounded text-xs ${fontSize === 'base' ? 'bg-white text-zinc-900 shadow-xs font-medium' : 'text-zinc-600 hover:text-zinc-900'}`}
                title="Taille normale"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-1 rounded text-xs ${fontSize === 'lg' ? 'bg-white text-zinc-900 shadow-xs font-medium' : 'text-zinc-600 hover:text-zinc-900'}`}
                title="Taille grande"
              >
                A+
              </button>
            </div>
          </div>

          {/* Alignment */}
          <div className="hidden sm:flex items-center gap-1">
            <div className="inline-flex rounded-md p-0.5 bg-zinc-100 border border-zinc-200">
              <button
                onClick={() => setAlignment('left')}
                className={`p-1 rounded ${alignment === 'left' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'}`}
                title="Aligner à gauche"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setAlignment('center')}
                className={`p-1 rounded ${alignment === 'center' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'}`}
                title="Centrer"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setAlignment('justify')}
                className={`p-1 rounded ${alignment === 'justify' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'}`}
                title="Justifier"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors shadow-2xs"
            title="Copier tout le texte"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copier</span>
          </button>

          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors shadow-2xs"
            title="Télécharger en .txt"
          >
            <Download className="w-3.5 h-3.5" />
            <span>TXT</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors shadow-2xs"
            title="Télécharger en Markdown"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>MD</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-700 bg-white border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors shadow-2xs"
            title="Imprimer ou enregistrer en PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimer</span>
          </button>

          {showClearConfirm ? (
            <div className="flex items-center gap-1 bg-red-50 p-0.5 rounded-md border border-red-200">
              <span className="text-[11px] text-red-700 px-1 font-medium">Tout effacer ?</span>
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
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-500 hover:text-red-600 transition-colors"
              title="Effacer la page et recommencer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Effacer</span>
            </button>
          )}
        </div>
      </div>

      {/* Main blank sheet container */}
      <div 
        className={`w-full max-w-4xl min-h-[75vh] p-8 md:p-14 rounded-lg md:rounded-xl transition-all duration-200 ${
          paperStyle === 'plain'
            ? 'bg-white shadow-[0_1px_12px_rgba(0,0,0,0.04)] md:border md:border-zinc-200/80'
            : `${getPaperClass()} shadow-[0_1px_12px_rgba(0,0,0,0.04)] md:border md:border-zinc-200/80`
        }`}
      >
        {/* Title Field (optional, distraction-free) */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de votre page (optionnel)..."
          className={`w-full bg-transparent border-0 outline-none text-2xl md:text-3xl font-semibold text-zinc-900 placeholder-zinc-300 mb-6 ${getFontClass()} ${getAlignClass()}`}
        />

        {/* Writing Canvas / Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Commencez à écrire sur cette page blanche... Vos pensées, vos notes, vos idées se sauvegardent automatiquement."
          className={`w-full bg-transparent border-0 outline-none resize-none text-zinc-800 placeholder-zinc-400 leading-relaxed overflow-hidden ${getFontClass()} ${getSizeClass()} ${getAlignClass()}`}
          rows={14}
          autoFocus
        />
      </div>

      {/* Bottom Quiet Metadata Bar (No pills, typographic separators) */}
      <div className="no-print w-full max-w-4xl mt-4 px-2 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span>{wordCount} {wordCount === 1 ? 'mot' : 'mots'}</span>
          <span aria-hidden="true" className="text-zinc-300">·</span>
          <span>{charCount} {charCount === 1 ? 'signe' : 'signes'}</span>
          <span aria-hidden="true" className="text-zinc-300">·</span>
          <span>Lecture ~ {readingTimeMinutes} min</span>
        </div>

        <div className="flex items-center gap-2 text-zinc-500">
          <span>Sauvegarde locale automatique active</span>
        </div>
      </div>
    </div>
  );
};
