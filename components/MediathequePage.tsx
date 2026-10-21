import React, { useState, useEffect, useMemo } from 'react';
import { MediaDocument, User } from '../types';
import { 
  BookOpen, Search, Download, Eye, Plus, Filter, FileText, 
  CheckCircle, ArrowLeft, X, Layers, Award,
  ChevronRight, ChevronLeft, Printer,
  Edit3, Trash2, Save, FileDown, AlertTriangle, Upload, Image as ImageIcon,
  FileCheck, Calendar, UserCheck, Tag, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MediathequePageProps {
  currentUser?: User | null;
  onNavigate?: (page: string) => void;
}

const CATEGORIES = [
  'Roman',
  'Cahier d\'habiletés',
  'Support de cours',
  'Manuel scolaire',
  'Annales',
  'Exercices',
  'Épreuves',
  'Documents administratifs'
] as const;

const CLASS_LEVELS = [
  'Tous',
  'CP1',
  'CP2',
  'CE1',
  'CE2',
  'CM1',
  'CM2',
  '6ème',
  '5ème',
  '4ème',
  '3ème',
  '2nde',
  '1ère',
  'Tle'
] as const;

const SUBJECTS_LIST = [
  'Toutes les matières',
  'Français',
  'Mathématiques',
  'SVT',
  'Physique-Chimie',
  'Histoire-Géographie',
  'Histoire',
  'Géographie',
  'Anglais',
  'Philosophie',
  'EDHC / ECM',
  'EDHC',
  'Sciences et Technologies',
  'Éducation Musicale',
  'Espagnol',
  'Allemand',
  'Informatique',
  'EPS',
  'Administration / Vie Scolaire',
  'Autre'
];

// Helper to convert base64 data URLs into Blob objects for reliable browser viewing & downloading
const dataUrlToBlob = (dataUrl: string): Blob | null => {
  try {
    const parts = dataUrl.split(',');
    if (parts.length < 2) return null;
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error('Error converting dataUrl to Blob:', e);
    return null;
  }
};

export const MediathequePage: React.FC<MediathequePageProps> = ({ currentUser, onNavigate }) => {
  // 1. Storage & State Management (NO mock/demo data)
  const [documents, setDocuments] = useState<MediaDocument[]>(() => {
    const saved = localStorage.getItem('school_db_mediatheque');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Purge any legacy mock demo documents
          const clean = parsed.filter((d: any) => 
            d && d.id && 
            !String(d.id).startsWith('organibac-') && 
            d.id !== 'cahier-maths-3eme' && 
            d.id !== 'roman-lamertume-des-jours' && 
            d.id !== 'cahier-svt-43' && 
            d.id !== 'roman-climbie' && 
            d.id !== 'annale-pc-terminale'
          );
          return clean;
        }
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('Tous');
  const [selectedSubject, setSelectedSubject] = useState<string>('Toutes les matières');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [readingDoc, setReadingDoc] = useState<MediaDocument | null>(null);
  const [editingDoc, setEditingDoc] = useState<MediaDocument | null>(null);
  const [deletingDoc, setDeletingDoc] = useState<MediaDocument | null>(null);

  // New Document Form State
  const [formTitle, setFormTitle] = useState('');
  const [formAuthor, setFormAuthor] = useState('');
  const [formCategory, setFormCategory] = useState<string>(CATEGORIES[0]);
  const [formSubject, setFormSubject] = useState('Français');
  const [formClassLevel, setFormClassLevel] = useState<string>('3ème');
  const [formDescription, setFormDescription] = useState('');
  const [formCoverImage, setFormCoverImage] = useState<string | null>(null);
  const [formDocFile, setFormDocFile] = useState<{ url: string; name: string; size: string; type: string } | null>(null);
  const [formError, setFormError] = useState('');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('school_db_mediatheque', JSON.stringify(documents));
  }, [documents]);

  // 2. Access Control (RBAC) - Page accessible à tous les niveaux
  const canPublish = useMemo(() => {
    return true; // Accessible à tous les niveaux d'utilisateurs
  }, []);

  // Allowed to manage (Edit / Delete) ALL documents: Directeur (Level 5) or Admin
  const canManageAll = useMemo(() => {
    if (!currentUser) return false;
    const role = (currentUser.role || '').toLowerCase();
    const level = currentUser.accessLevel || 0;
    return level >= 5 || role === 'director' || role === 'admin';
  }, [currentUser]);

  // Check if user can edit/delete a specific document (Directeur or Author)
  const canEditOrDelete = (doc: MediaDocument) => {
    if (!currentUser) return false;
    if (canManageAll) return true;
    if (doc.addedById && String(doc.addedById) === String(currentUser.id)) return true;
    if (doc.addedBy && currentUser.name && doc.addedBy.toLowerCase() === currentUser.name.toLowerCase()) return true;
    return false;
  };

  // 3. Search and Filtering Logic
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        doc.title.toLowerCase().includes(q) ||
        doc.author.toLowerCase().includes(q) ||
        doc.subject.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q) ||
        doc.category.toLowerCase().includes(q);

      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesClass = selectedClass === 'Tous' || doc.classLevel === selectedClass || doc.classLevel === 'Tous';
      const matchesSubject = selectedSubject === 'Toutes les matières' || doc.subject.toLowerCase() === selectedSubject.toLowerCase();

      return matchesSearch && matchesCategory && matchesClass && matchesSubject;
    });
  }, [documents, searchQuery, selectedCategory, selectedClass, selectedSubject]);

  // Reset Add Form
  const resetForm = () => {
    setFormTitle('');
    setFormAuthor('');
    setFormCategory(CATEGORIES[0]);
    setFormSubject('Français');
    setFormClassLevel('3ème');
    setFormDescription('');
    setFormCoverImage(null);
    setFormDocFile(null);
    setFormError('');
  };

  // Handle Cover Photo Upload
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Veuillez sélectionner un fichier image valide (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormCoverImage(reader.result as string);
      setFormError('');
    };
    reader.readAsDataURL(file);
  };

  // Handle Document File Upload (PDF / EPUB)
  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const fileType = file.name.endsWith('.epub') ? 'epub' : 'pdf';

    const reader = new FileReader();
    reader.onload = () => {
      setFormDocFile({
        url: reader.result as string,
        name: file.name,
        size: `${sizeInMB} MB`,
        type: fileType
      });
      setFormError('');
    };
    reader.readAsDataURL(file);
  };

  // Handle Submit New Document
  const handleSubmitNewDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('Le titre du document est obligatoire.');
      return;
    }

    const newDoc: MediaDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: formTitle.trim(),
      author: formAuthor.trim() || (currentUser?.name ? `Prof. ${currentUser.name}` : 'Auteur non renseigné'),
      category: formCategory,
      subject: formSubject.trim() || 'Général',
      classLevel: formClassLevel,
      description: formDescription.trim() || 'Aucune description fournie.',
      coverImage: formCoverImage || undefined,
      fileUrl: formDocFile?.url || undefined,
      pdfUrl: formDocFile?.url || undefined,
      fileName: formDocFile?.name || undefined,
      fileType: formDocFile?.type || 'pdf',
      fileSize: formDocFile?.size || undefined,
      downloadCount: 0,
      viewCount: 0,
      addedBy: currentUser?.name || 'Utilisateur',
      addedById: currentUser?.id,
      addedDate: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };

    setDocuments(prev => [newDoc, ...prev]);
    setShowAddModal(false);
    resetForm();
  };

  // Edit Document Form State
  const [editCoverImage, setEditCoverImage] = useState<string | null>(null);
  const [editDocFile, setEditDocFile] = useState<{ url: string; name: string; size: string; type: string } | null>(null);

  // Active Blob URL for Modal Preview
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

  // Manage Blob URL creation and memory cleanup when inspecting a document
  useEffect(() => {
    if (!readingDoc) {
      setPreviewBlobUrl(null);
      return;
    }
    const rawUrl = readingDoc.pdfUrl || readingDoc.fileUrl;
    if (!rawUrl) {
      setPreviewBlobUrl(null);
      return;
    }
    if (rawUrl.startsWith('data:')) {
      const blob = dataUrlToBlob(rawUrl);
      if (blob) {
        const createdUrl = URL.createObjectURL(blob);
        setPreviewBlobUrl(createdUrl);
        return () => {
          URL.revokeObjectURL(createdUrl);
        };
      }
    }
    setPreviewBlobUrl(rawUrl);
  }, [readingDoc]);

  // Handle Start Editing
  const handleStartEdit = (doc: MediaDocument) => {
    setEditingDoc(doc);
    setEditCoverImage(doc.coverImage || null);
    if (doc.pdfUrl || doc.fileUrl) {
      setEditDocFile({
        url: doc.pdfUrl || doc.fileUrl || '',
        name: doc.fileName || `${doc.title}.pdf`,
        size: doc.fileSize || 'Fichier joint',
        type: doc.fileType || 'pdf'
      });
    } else {
      setEditDocFile(null);
    }
  };

  // Handle Edit Cover Photo Upload
  const handleEditCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setEditCoverImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Edit Document File Upload (PDF / EPUB)
  const handleEditDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const fileType = file.name.endsWith('.epub') ? 'epub' : 'pdf';

    const reader = new FileReader();
    reader.onload = () => {
      setEditDocFile({
        url: reader.result as string,
        name: file.name,
        size: `${sizeInMB} MB`,
        type: fileType
      });
    };
    reader.readAsDataURL(file);
  };

  // Handle Save Edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    const updatedDoc: MediaDocument = {
      ...editingDoc,
      coverImage: editCoverImage || undefined,
      fileUrl: editDocFile?.url || editingDoc.fileUrl,
      pdfUrl: editDocFile?.url || editingDoc.pdfUrl,
      fileName: editDocFile?.name || editingDoc.fileName,
      fileType: editDocFile?.type || editingDoc.fileType,
      fileSize: editDocFile?.size || editingDoc.fileSize,
    };

    setDocuments(prev => prev.map(d => d.id === editingDoc.id ? updatedDoc : d));
    setEditingDoc(null);
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    setDeletingDoc(null);
    if (readingDoc?.id === id) setReadingDoc(null);
  };

  // Handle Document Download Trigger
  const handleDownloadDocument = (doc: MediaDocument) => {
    // Increment download count
    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, downloadCount: (d.downloadCount || 0) + 1 } : d));

    const fileToDownload = doc.pdfUrl || doc.fileUrl;

    if (fileToDownload) {
      const extension = doc.fileType || (doc.fileName?.endsWith('.epub') ? 'epub' : 'pdf');
      const baseTitle = doc.fileName || `${doc.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.${extension}`;
      const downloadName = baseTitle.endsWith(`.${extension}`) ? baseTitle : `${baseTitle}.${extension}`;

      let targetUrl = fileToDownload;
      let tempBlobCreated = false;

      if (fileToDownload.startsWith('data:')) {
        const blob = dataUrlToBlob(fileToDownload);
        if (blob) {
          targetUrl = URL.createObjectURL(blob);
          tempBlobCreated = true;
        }
      }

      const link = document.createElement('a');
      link.href = targetUrl;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      if (tempBlobCreated) {
        setTimeout(() => URL.revokeObjectURL(targetUrl), 5000);
      }
    } else {
      // Generate clean HTML document blob if no file was uploaded
      const htmlContent = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>${doc.title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: 0 auto; line-height: 1.6; }
    .header { border-bottom: 3px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; }
    h1 { color: #0369a1; font-size: 24px; margin: 0 0 8px 0; }
    .badge { display: inline-block; padding: 4px 12px; background: #e0f2fe; color: #0369a1; border-radius: 20px; font-weight: bold; font-size: 12px; }
    .meta { color: #64748b; font-size: 14px; margin-top: 12px; }
    .content-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 12px; margin-top: 24px; }
    .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <span class="badge">${doc.category}</span>
    <h1>${doc.title}</h1>
    <div class="meta">Auteur / Éditeur : <strong>${doc.author}</strong> • Matière : <strong>${doc.subject}</strong> • Niveau : <strong>${doc.classLevel}</strong></div>
  </div>
  <div class="content-box">
    <h3>Description / Objectifs</h3>
    <p>${doc.description}</p>
  </div>
  <div class="footer">
    Publié le ${doc.addedDate || 'Récemment'} par ${doc.addedBy || 'Enseignant'} • Médiathèque Scolaire
  </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_document.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Handle Document View / Read Trigger
  const handleViewDocument = (doc: MediaDocument) => {
    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, viewCount: (d.viewCount || 0) + 1 } : d));
    setReadingDoc(doc);
  };

  // Helper for category badge styling
  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Roman': return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'Cahier d\'habiletés': return 'bg-sky-100 text-sky-900 border-sky-200';
      case 'Support de cours': return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'Manuel scolaire': return 'bg-indigo-100 text-indigo-900 border-indigo-200';
      case 'Annales': return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'Exercices': return 'bg-rose-100 text-rose-900 border-rose-200';
      case 'Épreuves': return 'bg-teal-100 text-teal-900 border-teal-200';
      case 'Documents administratifs': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-sky-100 text-sky-900 border-sky-200';
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold tracking-wide text-sky-200 border border-white/20">
            <BookOpen size={14} className="text-sky-300" />
            <span>Espace Médiathèque & Ressources Pédagogiques</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            Médiathèque Numérique
          </h1>
          <p className="text-sky-100 text-xs sm:text-sm leading-relaxed">
            Consultez, lisez et téléchargez les ouvrages, romans, supports de cours, cahiers d'habiletés et épreuves publiés par l'équipe pédagogique.
          </p>
        </div>

        {/* Action Button - Visible ONLY for Prof (Lvl 3), Éducateur (Lvl 2), Directeur (Lvl 5) */}
        {canPublish && (
          <div className="relative z-10 flex items-center gap-3 shrink-0">
            <button 
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-5 py-3.5 bg-white text-sky-900 hover:bg-sky-50 font-extrabold text-sm rounded-2xl shadow-lg transition-all active:scale-95 border border-sky-100"
            >
              <Plus size={18} className="text-sky-700" />
              <span>Ajouter un document</span>
            </button>
          </div>
        )}
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher par titre, auteur, matière, description..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Class Filter */}
          <div className="md:col-span-3">
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {CLASS_LEVELS.map(lvl => (
                <option key={lvl} value={lvl}>
                  {lvl === 'Tous' ? 'Tous les niveaux' : `Niveau : ${lvl}`}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div className="md:col-span-3">
            <select 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {SUBJECTS_LIST.map(sbj => (
                <option key={sbj} value={sbj}>{sbj}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'all' 
                ? 'bg-sky-600 text-white shadow-md' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Toutes les catégories ({documents.length})
          </button>

          {CATEGORIES.map(cat => {
            const count = documents.filter(d => d.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat 
                    ? 'bg-sky-600 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* CATALOG DISPLAY GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900">
            Documents disponibles ({filteredDocuments.length})
          </h3>
          {canPublish && (
            <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              Professeurs, Éducateurs & Direction peuvent publier
            </span>
          )}
        </div>

        {/* 1. EMPTY STATE: When NO documents exist in system */}
        {documents.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200/80 shadow-sm my-8">
            <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto">
              <BookOpen size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-800">Aucun document disponible pour le moment.</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Les enseignants et responsables pédagogiques pourront ajouter des romans, cours, épreuves et cahiers d'habiletés.
              </p>
            </div>
            {canPublish && (
              <button 
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                <Plus size={16} />
                <span>Publier le premier document</span>
              </button>
            )}
          </div>
        ) : filteredDocuments.length === 0 ? (
          /* 2. SEARCH EMPTY STATE: When filters return no items */
          <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-slate-200/80 shadow-sm">
            <Search size={40} className="mx-auto text-slate-300" />
            <h4 className="text-base font-bold text-slate-700">Aucun document ne correspond à vos critères.</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Essayez de réinitialiser vos filtres ou de modifier votre recherche textuelle.
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedClass('Tous');
                setSelectedSubject('Toutes les matières');
              }}
              className="text-xs font-bold text-sky-600 hover:underline pt-2"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          /* 3. DOCUMENT CARDS GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map(doc => {
              const userCanManage = canEditOrDelete(doc);

              return (
                <div 
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200/80 hover:border-sky-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Card Header & Cover */}
                    <div className="relative h-48 bg-slate-900 overflow-hidden flex items-center justify-center">
                      {doc.coverImage ? (
                        <img 
                          src={doc.coverImage} 
                          alt={doc.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" 
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-800 via-sky-900 to-indigo-950 p-6 flex flex-col justify-between text-white relative">
                          <div className="flex justify-between items-start z-10">
                            <BookOpen size={28} className="text-sky-300/80" />
                            <span className="text-[10px] font-black uppercase tracking-wider text-sky-200/80 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                              {doc.fileType?.toUpperCase() || 'DOCUMENT'}
                            </span>
                          </div>
                          <div className="z-10 space-y-1">
                            <p className="text-xs font-bold text-sky-300">{doc.subject}</p>
                            <h4 className="font-extrabold text-sm line-clamp-2 text-white">{doc.title}</h4>
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>

                      {/* Category Pill */}
                      <span className={`absolute top-3 left-3 px-2.5 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider shadow-md border ${getCategoryColor(doc.category)}`}>
                        {doc.category}
                      </span>

                      {/* Manage Actions (Edit / Delete) - Only if authorized */}
                      {userCanManage && (
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
                          <button 
                            onClick={() => handleStartEdit(doc)}
                            className="p-1.5 bg-slate-900/80 hover:bg-sky-600 text-white rounded-lg backdrop-blur-md transition-colors shadow-md"
                            title="Modifier ce document"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => setDeletingDoc(doc)}
                            className="p-1.5 bg-slate-900/80 hover:bg-rose-600 text-white rounded-lg backdrop-blur-md transition-colors shadow-md"
                            title="Supprimer ce document"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}

                      <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                        <p className="text-[11px] font-bold text-sky-200">{doc.subject} • Level : {doc.classLevel}</p>
                        <h4 className="font-bold text-sm line-clamp-1 text-white">{doc.title}</h4>
                      </div>
                    </div>

                    {/* Card Content Details */}
                    <div className="p-4 space-y-3">
                      <div>
                        <p className="text-xs font-bold text-slate-800">Auteur / Éditeur : <span className="font-medium text-slate-600">{doc.author}</span></p>
                        <p className="text-[11px] text-slate-400 font-medium">
                          Publié le {doc.addedDate || 'Récemment'} par <strong className="text-slate-600">{doc.addedBy || 'Enseignant'}</strong>
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-normal">
                        {doc.description}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1">
                        <span className="flex items-center gap-1">
                          <Download size={12} className="text-sky-600" />
                          {doc.downloadCount || 0} téléchargement(s)
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={12} className="text-amber-600" />
                          {doc.viewCount || 0} consultation(s)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center gap-2">
                    <button 
                      onClick={() => handleViewDocument(doc)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-bold text-xs rounded-xl transition-colors"
                    >
                      <Eye size={14} />
                      <span>Consulter</span>
                    </button>

                    <button 
                      onClick={() => handleDownloadDocument(doc)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
                      title="Télécharger le fichier"
                    >
                      <FileDown size={14} />
                      <span>Télécharger</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: ADD DOCUMENT MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[92vh] overflow-y-auto my-auto border border-slate-100"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-sky-100 text-sky-800 rounded-full text-[11px] font-bold">
                    <Plus size={12} />
                    <span>Nouveau document</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">Ajouter un document à la Médiathèque</h3>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitNewDocument} className="space-y-5">
                
                {/* 1. Titre & Auteur */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700">Titre du document *</label>
                    <input 
                      type="text"
                      required 
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Ex: Manuel de Français 3ème / Roman L'Amertume des Jours"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Auteur / Éditeur</label>
                    <input 
                      type="text"
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      placeholder="Ex: Bernard Dadié / Inspection Générale"
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Catégorie *</label>
                    <select 
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Matière & Niveau de Classe */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Matière</label>
                    <input 
                      type="text"
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="Ex: Français, Mathématiques, Histoire..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Niveau de classe *</label>
                    <select 
                      value={formClassLevel}
                      onChange={(e) => setFormClassLevel(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {CLASS_LEVELS.map(lvl => (
                        <option key={lvl} value={lvl}>{lvl === 'Tous' ? 'Tous les niveaux' : lvl}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 3. Description / Objectifs */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Description / Objectifs</label>
                  <textarea 
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Résumer le contenu de l'ouvrage, le sommaire ou les conseils d'utilisation..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  ></textarea>
                </div>

                {/* 4. Fichiers à joindre */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Fichiers à joindre</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Cover Image File Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <ImageIcon size={14} className="text-sky-600" />
                        <span>Photo de couverture (Image)</span>
                      </label>
                      <div className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl p-3 text-center transition-colors bg-slate-50/50">
                        {formCoverImage ? (
                          <div className="space-y-2">
                            <img src={formCoverImage} alt="Aperçu" className="h-20 w-auto mx-auto rounded-lg shadow-md object-cover" />
                            <button 
                              type="button" 
                              onClick={() => setFormCoverImage(null)}
                              className="text-[11px] font-bold text-rose-600 hover:underline"
                            >
                              Supprimer l'image
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer space-y-1 block">
                            <Upload size={20} className="mx-auto text-slate-400" />
                            <span className="text-xs font-bold text-sky-600 block">Choisir une image</span>
                            <span className="text-[10px] text-slate-400 block">PNG, JPG, WEBP</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleCoverUpload}
                              className="hidden" 
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* PDF / EPUB Document File Input */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <FileCheck size={14} className="text-emerald-600" />
                        <span>Fichier PDF / EPUB (Document)</span>
                      </label>
                      <div className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl p-3 text-center transition-colors bg-slate-50/50">
                        {formDocFile ? (
                          <div className="space-y-1 text-left bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                            <p className="text-xs font-bold text-emerald-900 truncate">{formDocFile.name}</p>
                            <p className="text-[10px] font-semibold text-emerald-700">{formDocFile.size} • Format {formDocFile.type.toUpperCase()}</p>
                            <button 
                              type="button" 
                              onClick={() => setFormDocFile(null)}
                              className="text-[11px] font-bold text-rose-600 hover:underline pt-1 block"
                            >
                              Changer de fichier
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer space-y-1 block">
                            <Upload size={20} className="mx-auto text-slate-400" />
                            <span className="text-xs font-bold text-emerald-600 block">Choisir le document PDF / EPUB</span>
                            <span className="text-[10px] text-slate-400 block">.pdf, .epub</span>
                            <input 
                              type="file" 
                              accept=".pdf,.epub,application/pdf,application/epub+zip" 
                              onChange={handleDocFileUpload}
                              className="hidden" 
                            />
                          </label>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Form Footer Buttons */}
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-md"
                  >
                    Publier le document
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: DOCUMENT READER / CONSULTATION MODAL */}
      <AnimatePresence>
        {readingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-5xl h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <BookOpen className="text-sky-400 shrink-0" size={24} />
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-white truncate">{readingDoc.title}</h3>
                    <p className="text-xs text-slate-400 truncate">{readingDoc.author} • {readingDoc.subject} • {readingDoc.classLevel}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  {previewBlobUrl && (
                    <button 
                      onClick={() => window.open(previewBlobUrl, '_blank')}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
                      title="Ouvrir dans une nouvelle fenêtre"
                    >
                      <Eye size={14} />
                      <span>Plein écran</span>
                    </button>
                  )}
                  <button 
                    onClick={() => handleDownloadDocument(readingDoc)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                  >
                    <FileDown size={14} />
                    <span>Télécharger PDF</span>
                  </button>
                  <button 
                    onClick={() => setReadingDoc(null)}
                    className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Body Content */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-5 bg-slate-100">
                
                {/* PDF / File Visual Preview Container */}
                {previewBlobUrl ? (
                  <div className="bg-slate-900 rounded-2xl p-3 border border-slate-800 shadow-lg space-y-2">
                    <div className="flex items-center justify-between px-2 text-xs font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <FileCheck size={16} className="text-emerald-400" />
                        <span>Fichier joint : <strong className="text-white">{readingDoc.fileName || 'Document PDF'}</strong></span>
                        {readingDoc.fileSize && <span className="text-slate-400">({readingDoc.fileSize})</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => window.open(previewBlobUrl, '_blank')}
                          className="text-sky-400 hover:underline text-xs flex items-center gap-1 font-bold"
                        >
                          <Eye size={13} />
                          <span>Ouvrir dans un onglet</span>
                        </button>
                      </div>
                    </div>

                    {readingDoc.fileUrl?.startsWith('data:image') ? (
                      <div className="bg-slate-950 p-4 rounded-xl flex items-center justify-center min-h-[400px]">
                        <img src={previewBlobUrl} alt={readingDoc.title} className="max-h-[65vh] mx-auto rounded-lg shadow-md object-contain" />
                      </div>
                    ) : (
                      <iframe 
                        src={previewBlobUrl} 
                        title={`Visualiseur ${readingDoc.title}`}
                        className="w-full h-[62vh] min-h-[420px] rounded-xl border border-slate-800 bg-white"
                      />
                    )}
                  </div>
                ) : (
                  <div className="bg-amber-50/90 border border-amber-200/80 p-5 rounded-2xl text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-1 text-center sm:text-left">
                      <h4 className="font-bold text-sm text-amber-900 flex items-center gap-2 justify-center sm:justify-start">
                        <FileCheck size={18} className="text-amber-600" />
                        <span>Aucun fichier PDF joint à cette fiche</span>
                      </h4>
                      <p className="text-xs text-amber-800">
                        Ce document a été publié avec la présentation seule. Vous pouvez cliquer sur "Télécharger PDF" pour exporter la fiche de cours complète.
                      </p>
                    </div>

                    {canEditOrDelete(readingDoc) && (
                      <button 
                        onClick={() => {
                          const docToEdit = readingDoc;
                          setReadingDoc(null);
                          handleStartEdit(docToEdit);
                        }}
                        className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
                      >
                        Joindre un PDF
                      </button>
                    )}
                  </div>
                )}

                {/* Metadata & Description Box */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${getCategoryColor(readingDoc.category)}`}>
                        {readingDoc.category}
                      </span>
                      <span className="text-xs font-bold text-slate-700">Matière : {readingDoc.subject}</span>
                      <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md">Classe : {readingDoc.classLevel}</span>
                    </div>

                    <span className="text-xs text-slate-500 font-semibold">
                      Publié par {readingDoc.addedBy || 'Enseignant'} le {readingDoc.addedDate || 'Récemment'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Présentation & Objectifs de l'ouvrage</h4>
                    <p className="text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                      {readingDoc.description}
                    </p>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="bg-white px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-600">
                <span>Médiathèque Numérique Scolaire</span>
                <button 
                  onClick={() => setReadingDoc(null)}
                  className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: EDIT DOCUMENT MODAL */}
      <AnimatePresence>
        {editingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 my-8"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Modifier le document</h3>
                  <p className="text-xs text-slate-500 font-semibold">Mettre à jour les informations et le fichier joint</p>
                </div>
                <button onClick={() => setEditingDoc(null)} className="p-2 text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Titre du document *</label>
                  <input 
                    type="text"
                    required 
                    value={editingDoc.title}
                    onChange={(e) => setEditingDoc({...editingDoc, title: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Auteur / Éditeur</label>
                    <input 
                      type="text"
                      value={editingDoc.author}
                      onChange={(e) => setEditingDoc({...editingDoc, author: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Catégorie</label>
                    <select 
                      value={editingDoc.category}
                      onChange={(e) => setEditingDoc({...editingDoc, category: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Matière</label>
                    <input 
                      type="text"
                      value={editingDoc.subject}
                      onChange={(e) => setEditingDoc({...editingDoc, subject: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Niveau de classe</label>
                    <select 
                      value={editingDoc.classLevel}
                      onChange={(e) => setEditingDoc({...editingDoc, classLevel: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {CLASS_LEVELS.map(lvl => (
                        <option key={lvl} value={lvl}>{lvl === 'Tous' ? 'Tous les niveaux' : lvl}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Description / Résumé</label>
                  <textarea 
                    rows={3}
                    value={editingDoc.description}
                    onChange={(e) => setEditingDoc({...editingDoc, description: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  ></textarea>
                </div>

                {/* Edit File Attachments */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Mettre à jour les fichiers joints</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Cover Image */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <ImageIcon size={14} className="text-sky-600" />
                        <span>Photo de couverture</span>
                      </label>
                      <div className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl p-3 text-center transition-colors bg-slate-50/50">
                        {editCoverImage ? (
                          <div className="space-y-2">
                            <img src={editCoverImage} alt="Aperçu" className="h-16 w-auto mx-auto rounded-lg shadow-md object-cover" />
                            <button 
                              type="button" 
                              onClick={() => setEditCoverImage(null)}
                              className="text-[11px] font-bold text-rose-600 hover:underline"
                            >
                              Supprimer l'image
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer space-y-1 block">
                            <Upload size={18} className="mx-auto text-slate-400" />
                            <span className="text-xs font-bold text-sky-600 block">Changer la couverture</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleEditCoverUpload}
                              className="hidden" 
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* PDF Document */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <FileCheck size={14} className="text-emerald-600" />
                        <span>Document PDF / EPUB</span>
                      </label>
                      <div className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl p-3 text-center transition-colors bg-slate-50/50">
                        {editDocFile ? (
                          <div className="space-y-1 text-left bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                            <p className="text-xs font-bold text-emerald-900 truncate">{editDocFile.name}</p>
                            <p className="text-[10px] font-semibold text-emerald-700">{editDocFile.size}</p>
                            <button 
                              type="button" 
                              onClick={() => setEditDocFile(null)}
                              className="text-[11px] font-bold text-rose-600 hover:underline pt-1 block"
                            >
                              Changer de PDF
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer space-y-1 block">
                            <Upload size={18} className="mx-auto text-slate-400" />
                            <span className="text-xs font-bold text-emerald-600 block">Joindre / Remplacer PDF</span>
                            <input 
                              type="file" 
                              accept=".pdf,.epub,application/pdf,application/epub+zip" 
                              onChange={handleEditDocFileUpload}
                              className="hidden" 
                            />
                          </label>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <button 
                    type="button" 
                    onClick={() => setEditingDoc(null)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-md"
                  >
                    <Save size={14} />
                    <span>Enregistrer les modifications</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deletingDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4 text-center"
            >
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle size={28} />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">Supprimer le document ?</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Êtes-vous sûr de vouloir supprimer définitivement <strong className="text-slate-800">« {deletingDoc.title} »</strong> de la médiathèque ?
                </p>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3 border-t border-slate-100">
                <button 
                  onClick={() => setDeletingDoc(null)}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Annuler
                </button>
                <button 
                  onClick={() => handleDeleteConfirm(deletingDoc.id)}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md"
                >
                  <Trash2 size={14} />
                  <span>Oui, Supprimer</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
