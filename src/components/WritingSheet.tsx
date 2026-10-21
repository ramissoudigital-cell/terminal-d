import React, { useRef, useEffect } from 'react';
import { FontFamily, FontSize, PageWidth, PaperStyle } from '../types';

interface WritingSheetProps {
  title: string;
  setTitle: (t: string) => void;
  content: string;
  setContent: (c: string) => void;
  fontFamily: FontFamily;
  fontSize: FontSize;
  pageWidth: PageWidth;
  paperStyle: PaperStyle;
  focusMode: boolean;
}

export const WritingSheet: React.FC<WritingSheetProps> = ({
  title,
  setTitle,
  content,
  setContent,
  fontFamily,
  fontSize,
  pageWidth,
  paperStyle,
  focusMode,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-resize textarea height to accommodate content smoothly
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(
        window.innerHeight - 240,
        textareaRef.current.scrollHeight + 80
      )}px`;
    }
  }, [content, fontSize, pageWidth]);

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono tracking-tight';
      case 'handwriting':
        return 'font-[cursive] italic';
      case 'sans':
      default:
        return 'font-sans';
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large':
        return 'text-lg leading-relaxed';
      case 'huge':
        return 'text-xl leading-loose';
      case 'normal':
      default:
        return 'text-base leading-relaxed';
    }
  };

  const getPageWidthClass = () => {
    switch (pageWidth) {
      case 'narrow':
        return 'max-w-lg';
      case 'wide':
        return 'max-w-3xl';
      case 'full':
        return 'max-w-5xl';
      case 'medium':
      default:
        return 'max-w-xl';
    }
  };

  const isDark = paperStyle === 'dark' || paperStyle === 'ripple';

  return (
    <div className="w-full min-h-screen py-12 px-6 md:px-12 flex justify-center transition-all duration-300">
      <div
        className={`w-full ${getPageWidthClass()} transition-all duration-300 flex flex-col ${
          focusMode ? 'opacity-100' : ''
        }`}
      >
        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre (optionnel)..."
          className={`w-full bg-transparent border-none outline-none font-medium mb-5 placeholder:opacity-30 transition-colors ${
            fontSize === 'huge' ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
          } ${getFontFamilyClass()} ${
            isDark
              ? 'text-zinc-100 placeholder:text-zinc-600'
              : 'text-zinc-900 placeholder:text-zinc-400'
          }`}
        />

        {/* Seamless Content Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Commencez à écrire sur votre page blanche..."
          spellCheck={true}
          className={`w-full bg-transparent border-none outline-none resize-none transition-colors ${getFontFamilyClass()} ${getFontSizeClass()} ${
            isDark
              ? 'text-zinc-200 placeholder:text-zinc-700'
              : 'text-zinc-800 placeholder:text-zinc-300'
          }`}
        />
        <div className={`mt-2 text-xs transition-colors ${isDark ? 'text-zinc-600' : 'text-zinc-400'}`}>
          {content.length} caractère{content.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};
