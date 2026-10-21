import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Printer, Search, Plus, Phone, Mail, GraduationCap, MapPin, 
  Calendar, BookOpen, ShieldCheck, Edit3, Trash2, X, Check, 
  Sparkles, Award, ExternalLink, Filter, MessageSquare, ArrowLeft,
  Building2, ChevronRight, Lock, ChevronDown
} from 'lucide-react';
import { User, Teacher } from '../types';

export interface ResponsableUP {
  id: string;
  name: string;
  gender: 'M' | 'F';
  subject: string;
  roleUP: 'Coordonnateur Principal' | 'Animateur UP' | 'Rapporteur Général' | 'Membre du Bureau';
  school: string;
  zone: string;
  drena: string;
  phone: string;
  email: string;
  photoUrl: string;
  yearsOfExperience?: number;
  nextMeetingDate?: string;
  nextMeetingTopic?: string;
  notes?: string;
}

const DEFAULT_RESPONSABLES_UP: ResponsableUP[] = [];

const SUBJECTS_LIST = [
  'Mathématiques',
  'Français',
  'Anglais',
  'Physique-Chimie',
  'SVT',
  'Histoire-Géo',
  'EPS',
  'Philosophie',
  'Allemand',
  'Espagnol'
];

interface ResponsablesUPPageProps {
  currentUser?: User;
  teachers?: Teacher[];
  onNavigate?: (page: string) => void;
}

export const ResponsablesUPPage: React.FC<ResponsablesUPPageProps> = ({
  currentUser,
  teachers = [],
  onNavigate
}) => {
  const [responsables, setResponsables] = useState<ResponsableUP[]>(() => {
    const saved = localStorage.getItem('school_db_responsables_up');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_RESPONSABLES_UP;
      }
    }
    return DEFAULT_RESPONSABLES_UP;
  });

  const [selectedSubject, setSelectedSubject] = useState<string>('Mathématiques');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResponsable, setEditingResponsable] = useState<ResponsableUP | null>(null);
  const [isSubjectDropdownOpen, setIsSubjectDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: true } }));
      window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: true } }));
    } else {
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: false } }));
      window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: false } }));
    }
    return () => {
      window.dispatchEvent(new CustomEvent('modal-state-change', { detail: { isOpen: false } }));
      window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: false } }));
    };
  }, [isModalOpen]);

  // Form State
  const [formData, setFormData] = useState<Partial<ResponsableUP>>({
    name: '',
    gender: 'M',
    subject: 'Mathématiques',
    roleUP: 'Coordonnateur Principal',
    school: 'Dashboard',
    zone: 'Zone Pédagogique Abidjan-Sud',
    drena: 'DRENA Abidjan 2',
    phone: '',
    email: '',
    photoUrl: '',
    yearsOfExperience: 5,
    nextMeetingDate: '',
    nextMeetingTopic: '',
    notes: ''
  });

  useEffect(() => {
    if (responsables.length === 8 && responsables[0].name === 'M. Bamba Lassana') {
        setResponsables([]);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('school_db_responsables_up', JSON.stringify(responsables));
  }, [responsables]);

  const canEdit = currentUser?.role === 'director' || (currentUser?.accessLevel ?? 0) >= 5;

  const handleOpenAddModal = () => {
    setEditingResponsable(null);
    setFormData({
      name: '',
      gender: 'M',
      subject: selectedSubject || 'Mathématiques',
      roleUP: 'Coordonnateur Principal',
      school: 'Dashboard',
      zone: 'Zone Pédagogique Abidjan-Sud',
      drena: 'DRENA Abidjan 2',
      phone: '',
      email: '',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      yearsOfExperience: 8,
      nextMeetingDate: '',
      nextMeetingTopic: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (resp: ResponsableUP) => {
    setEditingResponsable(resp);
    setFormData(resp);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce responsable UP ?')) {
      setResponsables(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.school) {
      alert('Veuillez remplir au moins le nom, la matière et l\'établissement.');
      return;
    }

    if (editingResponsable) {
      setResponsables(prev => prev.map(r => r.id === editingResponsable.id ? ({ ...r, ...formData } as ResponsableUP) : r));
    } else {
      const newResp: ResponsableUP = {
        id: `up-${Date.now()}`,
        name: formData.name || 'Responsable UP',
        gender: formData.gender || 'M',
        subject: formData.subject || 'Mathématiques',
        roleUP: formData.roleUP || 'Coordonnateur Principal',
        school: formData.school || 'Dashboard',
        zone: formData.zone || 'Zone Pédagogique Abidjan-Sud',
        drena: formData.drena || 'DRENA Abidjan 2',
        phone: formData.phone || '+225 07 00 00 00 00',
        email: formData.email || 'responsable.up@education.ci',
        photoUrl: formData.photoUrl || `https://i.pravatar.cc/150?u=${Date.now()}`,
        yearsOfExperience: formData.yearsOfExperience || 5,
        nextMeetingDate: formData.nextMeetingDate || '',
        nextMeetingTopic: formData.nextMeetingTopic || '',
        notes: formData.notes || ''
      };
      setResponsables(prev => [newResp, ...prev]);
    }

    setIsModalOpen(false);
  };

  // Filter logic
  const filteredResponsables = responsables.filter(resp => {
    const matchesSubject = !selectedSubject || resp.subject.toLowerCase() === selectedSubject.toLowerCase();
    const matchesSearch = !searchTerm || (
      resp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resp.school.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resp.zone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resp.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resp.roleUP.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchesSubject && matchesSearch;
  });

  const handlePrint = () => {
    const list = filteredResponsables;
    const title = "LISTE DES RESPONSABLES UP DE LA ZONE";
    const subtitle = `Année Scolaire 2025 - 2026 (${list.length} responsable(s))`;
    try {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="utf-8">
              <title>${title}</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  @page { size: A4 portrait; margin: 10mm; }
                  .no-print { display: none !important; }
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
                body { background-color: white; color: #0f172a; font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
              </style>
            </head>
            <body>
              <div class="no-print" style="margin-bottom: 20px; padding: 14px 20px; background-color: #f8fafc; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; border-radius: 14px;">
                <div>
                  <strong style="font-size: 15px;">Impression</strong>
                  <p style="font-size: 12px; margin: 2px 0 0 0; color: #64748b;">${subtitle}</p>
                </div>
                <div style="display: flex; gap: 10px;">
                  <button onclick="window.print()" class="btn-print" style="padding: 9px 18px; background-color: #0ea5e9; color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                    Imprimer
                  </button>
                  <button onclick="window.close()" style="padding: 9px 14px; background-color: #cbd5e1; color: #334155; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                    Fermer
                  </button>
                </div>
              </div>

              <!-- Header -->
              <div class="mb-6 pb-4 border-b-2 border-slate-900 flex justify-between items-center">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 flex items-center justify-center shrink-0">
                    <img src="icone.png" alt="Logo" class="w-12 h-12 object-contain" />
                  </div>
                  <div class="text-left">
                    <h1 class="text-xl font-black uppercase text-slate-900">${title}</h1>
                    <p class="text-xs font-bold text-slate-600">${subtitle}</p>
                  </div>
                </div>
                <div class="text-right text-[11px] text-slate-700 space-y-0.5">
                  <p class="font-black uppercase text-slate-900 text-xs">DASHBOARD</p>
                  <p>Yopougon Niangon Sud Carrefour</p>
                  <p>Tél : 27 23 45 61 11 / 05 05 96 70 80</p>
                </div>
              </div>

              <!-- Table -->
              <div class="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-slate-100 border-b border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider">
                      <th class="py-4 px-4 w-12 text-center">N°</th>
                      <th class="py-4 px-6">Nom et Prénom</th>
                      <th class="py-4 px-6">Discipline</th>
                      <th class="py-4 px-6">Rôle UP</th>
                      <th class="py-4 px-6">Établissement</th>
                      <th class="py-4 px-6">Contact</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                    ${list.map((t, idx) => {
                        return `
                        <tr class="hover:bg-slate-50 transition-colors">
                          <td class="py-4 px-4 text-center text-slate-500 font-bold">
                            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">${idx + 1}</span>
                          </td>
                          <td class="py-4 px-6">
                            <p class="font-bold text-slate-900">${t.name}</p>
                          </td>
                          <td class="py-4 px-6">
                            <span class="inline-block px-3 py-1 rounded-lg text-xs font-bold border border-slate-200 bg-slate-50 text-slate-700">${t.subject}</span>
                          </td>
                          <td class="py-4 px-6">${t.roleUP}</td>
                          <td class="py-4 px-6">${t.school}</td>
                          <td class="py-4 px-6">${t.phone || '<span class="text-slate-400 italic">Non renseigné</span>'}</td>
                        </tr>
                        `;
                    }).join('')}
                  </tbody>
                </table>
              </div>

              <!-- Footer Stamp -->
              <div class="mt-8 pt-4 border-t border-slate-300 flex justify-between items-center text-xs">
                <p class="italic text-slate-500">Document officiel édité par la Direction des Études du Dashboard.</p>
                <div class="text-right">
                  <p class="font-bold text-slate-900">Le Directeur des Études</p>
                  <p class="font-black text-slate-900 uppercase">M. SEIDOU OUATTARA</p>
                </div>
              </div>

              <script>
                setTimeout(() => window.print(), 1000);
              </script>
            </body>
          </html>
        `);
        win.document.close();
      }
    } catch (e) {
      console.error(e);
      window.print();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#BFDBFE] overflow-hidden">
      {/* HEADER SECTION - Dashboard Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 sm:pt-7 pb-6 px-6 sm:px-8 shrink-0 relative z-10 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-white text-[22px] sm:text-[28px] font-bold tracking-tight leading-tight">
              Responsables UP de la Zone
            </h1>
            {!canEdit && (
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white/90 bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1 border border-white/30 shrink-0">
                <Lock size={12} className="shrink-0 text-white" />
                Mode lecture seule
              </span>
            )}
          </div>
          <p className="text-white/80 text-xs font-semibold mt-1">
            Unités Pédagogiques (UP) de la zone pour le suivi des programmes et examens
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 self-start sm:self-auto overflow-x-auto no-scrollbar max-w-full pb-0.5">
          {onNavigate && (
            <button
              onClick={() => onNavigate('conseil')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/50 text-slate-900 font-bold text-xs sm:text-sm transition-all shadow-xs shrink-0"
            >
              <ArrowLeft size={15} className="text-slate-900 shrink-0" />
              <span>Conseils CE</span>
            </button>
          )}

          {currentUser?.role !== 'student' && currentUser?.accessLevel !== 1 && currentUser?.role !== 'teacher' && currentUser?.accessLevel !== 3 && (
            <button
                onClick={handlePrint}
                className="btn-print hidden md:flex items-center gap-2 bg-white/20 px-3 py-2 rounded-xl border border-white/30 text-white hover:bg-white/30 transition-colors font-bold text-sm shadow-sm shrink-0"
                title="Imprimer la liste"
            >
                <Printer size={16} />
                Imprimer
            </button>
          )}
          {canEdit && (
            <button
              onClick={handleOpenAddModal}
              className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5 shrink-0"
            >
              <Plus size={16} className="shrink-0" />
              <span className="hidden sm:inline">Nouveau Responsable UP</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area with White Background (arrière-plan blanc) & Curved Top */}
      <main className="flex-1 bg-white rounded-t-[35px] sm:rounded-t-[40px] px-4 sm:px-8 pt-6 sm:pt-8 pb-24 overflow-y-auto custom-scrollbar shadow-2xl relative">

        {/* SEARCH BAR & SUBJECT PILLS */}
        <div className="space-y-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par nom, établissement, rôle ou zone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-slate-800 text-xs md:text-sm font-semibold rounded-2xl border border-transparent focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* MATIÈRES PILLS */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar max-w-full">
            {SUBJECTS_LIST.map((subj) => {
              const isSelected = selectedSubject === subj;
              const count = responsables.filter(r => r.subject.toLowerCase() === subj.toLowerCase()).length;
              return (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-4 py-2.5 rounded-full font-extrabold text-xs md:text-sm flex items-center gap-2 border transition-all whitespace-nowrap shrink-0 shadow-2xs ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 text-sky-600 ring-2 ring-sky-100/80'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <GraduationCap size={18} className={isSelected ? 'text-sky-600' : 'text-slate-400'} />
                  <span>{subj}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-sky-200 text-sky-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      {/* CARDS LIST SECTION */}
      <div className="p-4 sm:p-6 md:p-8 flex-1">
        {filteredResponsables.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 sm:p-12 text-center border border-slate-200 max-w-lg mx-auto shadow-sm my-8">
            <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">Aucun responsable UP trouvé</h3>
            <p className="text-xs md:text-sm text-slate-500 mb-6 font-medium">
              Aucun responsable UP enregistré pour la matière "{selectedSubject}".
            </p>
            {canEdit && (
              <button
                onClick={handleOpenAddModal}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs md:text-sm rounded-2xl transition-all shadow-md inline-flex items-center gap-2"
              >
                <Plus size={18} />
                <span>Ajouter un responsable UP pour {selectedSubject}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredResponsables.map((resp) => (
              <div 
                key={resp.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-4 sm:p-6 flex flex-col justify-between relative group"
              >
                {/* TOP HEADER OF CARD */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img 
                        src={resp.photoUrl} 
                        alt={resp.name} 
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-sky-100 border border-white shadow-2xs shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 uppercase tracking-wide mb-1 whitespace-nowrap">
                          {resp.subject}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 leading-snug truncate" title={resp.name}>
                          {resp.name}
                        </h3>
                        <p className="text-xs font-bold text-sky-700 flex items-center gap-1 mt-0.5 min-w-0" title={resp.roleUP}>
                          <Award size={13} className="shrink-0 text-sky-600" />
                          <span className="truncate">{resp.roleUP}</span>
                        </p>
                      </div>
                    </div>

                    {canEdit && (
                      <div className="flex items-center gap-0.5 opacity-90 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                        <button
                          onClick={() => handleOpenEditModal(resp)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
                          title="Modifier"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(resp.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* DETAILS BADGES */}
                  <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Building2 size={15} className="text-slate-400 shrink-0" />
                      <span className="font-bold text-slate-800">{resp.school}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={15} className="text-slate-400 shrink-0" />
                      <span>{resp.zone} • <strong className="text-slate-700">{resp.drena}</strong></span>
                    </div>

                    {resp.yearsOfExperience && (
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={15} className="text-emerald-500 shrink-0" />
                        <span>Expérience : <strong>{resp.yearsOfExperience} ans d'enseignement</strong></span>
                      </div>
                    )}
                  </div>

                  {/* UP MEETING NOTICE IF ANY */}
                  {resp.nextMeetingDate && (
                    <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                      <p className="font-extrabold text-slate-800 flex items-center gap-1.5 mb-1">
                        <Calendar size={14} className="text-sky-600" />
                        <span>Prochain Regroupement UP</span>
                      </p>
                      <p className="text-slate-600 font-semibold">{resp.nextMeetingDate}</p>
                      {resp.nextMeetingTopic && (
                        <p className="text-slate-500 text-[11px] font-medium mt-0.5 line-clamp-2">
                          "{resp.nextMeetingTopic}"
                        </p>
                      )}
                    </div>
                  )}

                  {resp.notes && (
                    <p className="text-xs text-slate-500 italic mt-3 line-clamp-2">
                      {resp.notes}
                    </p>
                  )}
                </div>

                {/* BOTTOM ACTION BUTTONS */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${resp.phone.replace(/\s+/g, '')}`}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Phone size={14} className="text-sky-600" />
                    <span>Appeler</span>
                  </a>

                  <a
                    href={`mailto:${resp.email}`}
                    className="flex-1 py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Mail size={14} className="text-sky-600" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsModalOpen(false);
                setIsSubjectDropdownOpen(false);
                setIsRoleDropdownOpen(false);
              }
            }}
          >
            <motion.div 
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white rounded-t-[32px] sm:rounded-3xl max-w-lg w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl border-t sm:border border-slate-100 p-6 md:p-8 custom-scrollbar"
            >
              {/* Mobile Bottom Sheet Handle */}
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden"></div>

              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                    <Award size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {editingResponsable ? 'Modifier le Responsable UP' : 'Nouveau Responsable UP'}
                    </h2>
                    <p className="text-xs font-semibold text-slate-500">Unité Pédagogique Régionale</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsSubjectDropdownOpen(false);
                    setIsRoleDropdownOpen(false);
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs md:text-sm">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Nom complet *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: M. Kouassi Jean-Baptiste"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none font-semibold text-slate-800 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* MATIERE DROPDOWN */}
                  <div className="relative">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Matière / Discipline *</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsSubjectDropdownOpen(!isSubjectDropdownOpen);
                        setIsRoleDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-white focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none font-extrabold text-slate-800 flex items-center justify-between transition-all cursor-pointer text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <BookOpen size={15} className="text-sky-600 shrink-0" />
                        <span className="truncate">{formData.subject || 'Mathématiques'}</span>
                      </div>
                      <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isSubjectDropdownOpen ? 'rotate-180 text-sky-600' : ''}`} />
                    </button>

                    {isSubjectDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-1.5 space-y-1 max-h-52 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar">
                        {SUBJECTS_LIST.map(sub => {
                          const isSel = formData.subject === sub;
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, subject: sub });
                                setIsSubjectDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                                isSel 
                                  ? 'bg-sky-50 text-sky-700 font-extrabold border border-sky-100' 
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isSel ? 'bg-sky-500' : 'bg-slate-300'}`}></span>
                                <span>{sub}</span>
                              </div>
                              {isSel && <Check size={14} className="text-sky-600" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ROLE DROPDOWN */}
                  <div className="relative">
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Rôle dans l'UP</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRoleDropdownOpen(!isRoleDropdownOpen);
                        setIsSubjectDropdownOpen(false);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 hover:bg-white focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none font-extrabold text-slate-800 flex items-center justify-between transition-all cursor-pointer text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Award size={15} className="text-sky-600 shrink-0" />
                        <span className="truncate">{formData.roleUP || 'Coordonnateur Principal'}</span>
                      </div>
                      <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isRoleDropdownOpen ? 'rotate-180 text-sky-600' : ''}`} />
                    </button>

                    {isRoleDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-1.5 space-y-1 max-h-52 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150 custom-scrollbar">
                        {[
                          'Coordonnateur Principal',
                          'Animateur UP',
                          'Rapporteur Général',
                          'Membre du Bureau'
                        ].map(role => {
                          const isSel = formData.roleUP === role;
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, roleUP: role as any });
                                setIsRoleDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3.5 py-2 rounded-xl font-bold text-xs flex items-center justify-between transition-all cursor-pointer ${
                                isSel 
                                  ? 'bg-sky-50 text-sky-700 font-extrabold border border-sky-100' 
                                  : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${isSel ? 'bg-sky-500' : 'bg-slate-300'}`}></span>
                                <span>{role}</span>
                              </div>
                              {isSel && <Check size={14} className="text-sky-600" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Établissement d'attache *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Dashboard"
                    value={formData.school || ''}
                    onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Zone Pédagogique</label>
                    <input
                      type="text"
                      placeholder="Ex: Zone Abidjan-Sud"
                      value={formData.zone || ''}
                      onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">DRENA / Direction</label>
                    <input
                      type="text"
                      placeholder="Ex: DRENA Abidjan 2"
                      value={formData.drena || ''}
                      onChange={(e) => setFormData({ ...formData, drena: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Téléphone</label>
                    <input
                      type="text"
                      placeholder="+225 07 00 00 00 00"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="exemple@education.ci"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Prochain regroupement / Date</label>
                  <input
                    type="text"
                    placeholder="Ex: 20 Novembre 2026"
                    value={formData.nextMeetingDate || ''}
                    onChange={(e) => setFormData({ ...formData, nextMeetingDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Ordre du jour / Thème UP</label>
                  <input
                    type="text"
                    placeholder="Ex: Harmonisation des sujets de devoirs communs"
                    value={formData.nextMeetingTopic || ''}
                    onChange={(e) => setFormData({ ...formData, nextMeetingTopic: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 focus:bg-white focus:border-sky-500 outline-none font-semibold text-slate-800 transition-all"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setIsSubjectDropdownOpen(false);
                      setIsRoleDropdownOpen(false);
                    }}
                    className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition-colors cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-extrabold shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                  >
                    {editingResponsable ? 'Enregistrer les modifications' : 'Ajouter le responsable'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </main>
    </div>
  );
};
