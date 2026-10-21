import React from 'react';
import { PageDocument } from '../types';
import { X, Plus, FileText, Trash2, Printer, Download, Sparkles } from 'lucide-react';

interface DocumentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  documents: PageDocument[];
  activeDocId: string;
  onSelectDoc: (id: string) => void;
  onCreateNewDoc: () => void;
  onDeleteDoc: (id: string) => void;
  onExportMarkdown: () => void;
  onExportText: () => void;
  onPrint: () => void;
}

export const DocumentDrawer: React.FC<DocumentDrawerProps> = ({
  isOpen,
  onClose,
  documents,
  activeDocId,
  onSelectDoc,
  onCreateNewDoc,
  onDeleteDoc,
  onExportMarkdown,
  onExportText,
  onPrint,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border-l border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col h-full animate-slideIn">
        {/* Drawer Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Mes Pages Blanches
            </h3>
            <p className="text-xs text-neutral-500">
              {documents.length} feuillet{documents.length > 1 ? 's' : ''} conservé{documents.length > 1 ? 's' : ''} en mémoire
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: Nouvelle page blanche */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => {
              onCreateNewDoc();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Créer une nouvelle page blanche</span>
          </button>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {documents.map((doc) => {
            const isActive = doc.id === activeDocId;
            return (
              <div
                key={doc.id}
                className={`group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                  isActive
                    ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-800/60 shadow-xs'
                    : 'border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
                onClick={() => {
                  onSelectDoc(doc.id);
                  onClose();
                }}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <FileText className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                      {doc.title || 'Page sans titre'}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      {doc.wordCount} mot{doc.wordCount > 1 ? 's' : ''} · {new Date(doc.lastModified).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </div>

                {documents.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Voulez-vous supprimer définitivement cette page ?')) {
                        onDeleteDoc(doc.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded text-neutral-400 hover:text-red-600 transition-opacity"
                    title="Supprimer la page"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Drawer Footer: Export Options */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2 bg-neutral-50/50 dark:bg-neutral-900/50">
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-400">
            Export & Impression
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={onExportText}
              className="flex flex-col items-center justify-center p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 mb-1 text-neutral-500" />
              <span>Texte (.txt)</span>
            </button>

            <button
              onClick={onExportMarkdown}
              className="flex flex-col items-center justify-center p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 mb-1 text-neutral-500" />
              <span>Markdown</span>
            </button>

            <button
              onClick={onPrint}
              className="flex flex-col items-center justify-center p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 mb-1 text-neutral-500" />
              <span>Imprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
