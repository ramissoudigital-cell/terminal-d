import React, { useRef, useEffect } from 'react';
import { FontChoice } from '../types';
import { Bold, Italic, Heading1, Heading2, Quote, List, Sparkles } from 'lucide-react';

interface TextEditorProps {
  title: string;
  content: string;
  fontChoice: FontChoice;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  isFocusMode: boolean;
  onTitleChange: (newTitle: string) => void;
  onContentChange: (newContent: string) => void;
  onTriggerInspiration: () => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  title,
  content,
  fontChoice,
  fontSize,
  isFocusMode,
  onTitleChange,
  onContentChange,
  onTriggerInspiration,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to fit content seamlessly
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(480, textareaRef.current.scrollHeight)}px`;
    }
  }, [content]);

  const getFontClass = () => {
    switch (fontChoice) {
      case 'cormorant':
        return 'font-cormorant';
      case 'lora':
        return 'font-lora';
      case 'jetbrains':
        return 'font-jetbrains';
      case 'jakarta':
      default:
        return 'font-jakarta';
    }
  };

  const getSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-base leading-relaxed';
      case 'lg':
        return 'text-xl leading-loose';
      case 'xl':
        return 'text-2xl leading-loose';
      case 'base':
      default:
        return 'text-lg leading-relaxed';
    }
  };

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = `${prefix}${selectedText || 'texte'}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    onContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText ? selectedText.length : 5));
    }, 10);
  };

  return (
    <div className={`w-full max-w-3xl mx-auto flex flex-col transition-all duration-300 ${isFocusMode ? 'py-8' : 'py-4'}`}>
      {/* Discreet Editorial Formatting Bar (hidden when printing) */}
      {!isFocusMode && (
        <div className="no-print flex items-center justify-between pb-6 mb-6 border-b border-neutral-200/60 dark:border-neutral-800/60 text-neutral-500">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              title="Gras (**texte**)"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*')}
              title="Italique (*texte*)"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <Italic className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />
            <button
              type="button"
              onClick={() => insertFormatting('# ')}
              title="Titre 1"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('## ')}
              title="Titre 2"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('> ')}
              title="Citation"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('- ')}
              title="Liste à puces"
              className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={onTriggerInspiration}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Étincelle d'écriture</span>
          </button>
        </div>
      )}

      {/* Page Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Titre de votre page..."
        className={`w-full bg-transparent border-none outline-none font-semibold text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 tracking-tight transition-opacity ${
          fontChoice === 'cormorant' ? 'font-cormorant text-3xl md:text-4xl' : 'font-jakarta text-2xl md:text-3xl'
        } ${isFocusMode ? 'opacity-40 hover:opacity-100 focus:opacity-100' : 'mb-6'}`}
      />

      {/* Main Prose Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Commencez à écrire librement. La page blanche vous écoute..."
        className={`w-full bg-transparent border-none outline-none resize-none text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 placeholder:italic transition-colors ${getFontClass()} ${getSizeClass()} min-h-[500px]`}
        spellCheck="true"
        autoFocus
      />
    </div>
  );
};
