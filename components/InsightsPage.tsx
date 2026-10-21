
import React, { useState, useMemo, useEffect } from 'react';
import { Search, X, Filter, AlertCircle, CheckCircle, Send, ArrowLeft, Download, Layers, TrendingUp, Wallet, PieChart, ChevronRight, School, Smartphone, FileText, Mail, ExternalLink, Copy, MessageSquare, Check, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

// --- MOCK DATA & TYPES ---

const normalizeClassName = (rawName: string): string => {
    if (!rawName) return 'Non assigné';
    let name = rawName.trim();
    
    name = name
        .replace(/^Seconde\b/i, '2nde')
        .replace(/^Première\b/i, '1ère')
        .replace(/^Premiere\b/i, '1ère')
        .replace(/^Terminale\b/i, 'Tle')
        .replace(/^6eme\b/i, '6ème')
        .replace(/^5eme\b/i, '5ème')
        .replace(/^4eme\b/i, '4ème')
        .replace(/^3eme\b/i, '3ème')
        .replace(/^1ere\b/i, '1ère');

    return name;
};

interface StudentFinancial {
    id: string;
    name: string;
    class: string;
    parentName: string;
    parentPhone: string;
    photoUrl?: string;
    tuitionTotal: number;
    tuitionPaid: number;
    status: 'paid' | 'partial' | 'unpaid';
}

export const DEFAULT_LEVEL_TUITIONS: Record<string, number> = {
    '6ème': 90000,
    '5ème': 90000,
    '4ème': 90000,
    '3ème': 100000,
    '2nde': 110000,
    '1ère': 110000,
    'Tle': 110000,
};

export const getTuitionForClass = (rawClassName: string, customRates: Record<string, number> = {}): number => {
    if (!rawClassName) return 90000;
    const normCls = normalizeClassName(rawClassName);

    // Exact class match (e.g., "6ème 1")
    if (typeof customRates[normCls] === 'number' && !isNaN(customRates[normCls])) {
        return customRates[normCls];
    }

    const lower = normCls.toLowerCase();

    // 6ème, 5ème, 4ème => 90 000 FCFA
    if (lower.includes('6ème') || lower.includes('6eme')) return customRates['6ème'] ?? 90000;
    if (lower.includes('5ème') || lower.includes('5eme')) return customRates['5ème'] ?? 90000;
    if (lower.includes('4ème') || lower.includes('4eme')) return customRates['4ème'] ?? 90000;

    // 3ème => 100 000 FCFA
    if (lower.includes('3ème') || lower.includes('3eme')) return customRates['3ème'] ?? 100000;

    // 2nde, 1ère, Tle => 110 000 FCFA
    if (lower.includes('2nde') || lower.includes('2e') || lower.includes('seconde')) return customRates['2nde'] ?? 110000;
    if (lower.includes('1ère') || lower.includes('1ere') || lower.includes('1er') || lower.includes('premiere')) return customRates['1ère'] ?? 110000;
    if (lower.includes('tle') || lower.includes('terminale')) return customRates['Tle'] ?? 110000;

    return 90000;
};


const getClassSortRank = (cls: string): number => {
    const lower = cls.toLowerCase();
    if (lower.includes('6è') || lower.includes('6e')) return 10;
    if (lower.includes('5è') || lower.includes('5e')) return 20;
    if (lower.includes('4è') || lower.includes('4e')) return 30;
    if (lower.includes('3è') || lower.includes('3e')) return 40;
    if (lower.includes('2n') || lower.includes('2e') || lower.includes('sec')) return 50;
    if (lower.includes('1è') || lower.includes('1e') || lower.includes('prem')) return 60;
    if (lower.includes('tle') || lower.includes('term')) return 70;
    return 999;
};

const compareClassNames = (clsA: string, clsB: string) => {
    const rankA = getClassSortRank(clsA);
    const rankB = getClassSortRank(clsB);
    if (rankA !== rankB) {
        return rankA - rankB;
    }
    return clsA.localeCompare(clsB, 'fr', { numeric: true });
};

const chartData = [
  { name: 'Jan', revenue: 4000000 },
  { name: 'Fév', revenue: 3000000 },
  { name: 'Mar', revenue: 2000000 },
  { name: 'Avr', revenue: 2780000 },
  { name: 'Mai', revenue: 1890000 },
  { name: 'Juin', revenue: 2390000 },
  { name: 'Juil', revenue: 3490000 },
];

interface InsightsPageProps {
    currentUser?: any;
    allStudents?: any[];
}

export const InsightsPage: React.FC<InsightsPageProps> = ({ currentUser, allStudents }) => {
  const [payments, setPayments] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('school_db_financials');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {};
      }
    }
    return {};
  });

  const [customTuitions, setCustomTuitions] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('school_db_tuition_rates');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return {}; }
    }
    return {};
  });

  const [showEditTuitionModal, setShowEditTuitionModal] = useState(false);
  const [tuitionForm, setTuitionForm] = useState<Record<string, string>>({});

  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [classSearchTerm, setClassSearchTerm] = useState('');
  
  // États pour la vue détaillée
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<StudentFinancial | null>(null);
  const [modalMode, setModalMode] = useState<'details' | 'payment' | 'message'>('details');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const openEditTuitionModal = () => {
    setTuitionForm({
      'Primaire': String(customTuitions['Primaire'] ?? 60000),
      '6ème': String(customTuitions['6ème'] ?? 90000),
      '5ème': String(customTuitions['5ème'] ?? 90000),
      '4ème': String(customTuitions['4ème'] ?? 90000),
      '3ème': String(customTuitions['3ème'] ?? 100000),
      '2nde': String(customTuitions['2nde'] ?? 110000),
      '1ère': String(customTuitions['1ère'] ?? 110000),
      'Tle': String(customTuitions['Tle'] ?? 110000),
    });
    setShowEditTuitionModal(true);
  };

  const handleSaveTuitions = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Record<string, number> = { ...customTuitions };
    Object.entries(tuitionForm).forEach(([key, val]) => {
      const num = parseFloat(val);
      if (!isNaN(num) && num >= 0) {
        updated[key] = num;
      }
    });
    setCustomTuitions(updated);
    localStorage.setItem('school_db_tuition_rates', JSON.stringify(updated));
    window.dispatchEvent(new Event('school_db_tuition_rates_updated'));
    setShowEditTuitionModal(false);
  };

  // Derive real financials list from real students
  const financials: StudentFinancial[] = useMemo(() => {
    let rawStudents: any[] = (allStudents && allStudents.length > 0)
      ? allStudents
      : (() => {
          const saved = localStorage.getItem('school_db_students');
          if (saved) {
            try { return JSON.parse(saved); } catch (e) { return []; }
          }
          return [];
        })();

    if (currentUser?.section === 'Primaire') {
        rawStudents = rawStudents.filter(s => /^(CP1|CP2|CE1|CE2|CM1|CM2)/i.test(s.class));
    } else if (currentUser?.section === 'Secondaire') {
        rawStudents = rawStudents.filter(s => !/^(CP1|CP2|CE1|CE2|CM1|CM2)/i.test(s.class));
    }

    return rawStudents.map(s => {
      const paid = payments[s.id] ?? 0;
      const total = getTuitionForClass(s.class || 'Non assigné', customTuitions);
      let status: 'paid' | 'partial' | 'unpaid' = 'unpaid';
      if (paid >= total) status = 'paid';
      else if (paid > 0) status = 'partial';

      return {
        id: s.id,
        name: s.name,
        class: normalizeClassName(s.class || 'Non assigné'),
        parentName: s.parentPhone ? `Parent de ${s.name}` : 'Parent d\'élève',
        parentPhone: s.parentPhone || '',
        photoUrl: s.photoUrl,
        tuitionTotal: total,
        tuitionPaid: paid,
        status
      };
    });
  }, [allStudents, payments, customTuitions]);

  useEffect(() => {
    const isHidden = !!selectedClass || !!selectedStudentForAction;
    window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden } }));
    return () => {
      window.dispatchEvent(new CustomEvent('hide-bottom-nav', { detail: { isHidden: false } }));
    };
  }, [selectedClass, selectedStudentForAction]);

  useEffect(() => {
    const targetStudentId = localStorage.getItem('insights_target_student');
    const targetClass = localStorage.getItem('insights_target_class');

    if ((targetStudentId || targetClass) && financials.length > 0) {
      if (targetStudentId) {
        const found = financials.find(s => String(s.id) === String(targetStudentId) || (s.name && targetStudentId && s.name.toLowerCase().includes(String(targetStudentId).toLowerCase())));
        if (found) {
          setSelectedClass(found.class);
          setSelectedStudentForAction(found);
          setModalMode('details');
          setPaymentAmount('');
          setMessageContent(buildDefaultMessage(found));
        } else if (targetClass) {
          const normCls = normalizeClassName(targetClass);
          setSelectedClass(normCls);
        }
      } else if (targetClass) {
        const normCls = normalizeClassName(targetClass);
        setSelectedClass(normCls);
      }
      localStorage.removeItem('insights_target_student');
      localStorage.removeItem('insights_target_class');
    }
  }, [financials]);

  const canPrint = currentUser && (
     currentUser.role === 'educator' || currentUser.accessLevel === 2 ||
     currentUser.role === 'cashier' || currentUser.accessLevel === 4 ||
     currentUser.role === 'director' || currentUser.role === 'admin' || currentUser.accessLevel === 5
  );

  const buildDefaultMessage = (student: StudentFinancial) => {
      const reste = student.tuitionTotal - student.tuitionPaid;
      return `Bonjour ${student.parentName || 'Parent'},\n\nNous vous rappelons que pour l'élève ${student.name} (${student.class}), le reste à payer sur la scolarité est de ${reste.toLocaleString()} FCFA.\n\nMerci de bien vouloir vous rapprocher de la comptabilité du Dashboard pour régulariser cette situation.\n\nCordialement,\nLa Direction - Dashboard.`;
  };

  const openActionModal = (student: StudentFinancial) => {
      setSelectedStudentForAction(student);
      setModalMode('details');
      setPaymentAmount('');
      setMessageContent(buildDefaultMessage(student));
  };

  const openMessageModal = (student: StudentFinancial) => {
      setSelectedStudentForAction(student);
      setModalMode('message');
      setMessageContent(buildDefaultMessage(student));
  };

  const handleCopyMessage = () => {
      navigator.clipboard.writeText(messageContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSendWhatsappApp = () => {
      if (!selectedStudentForAction) return;
      const formattedPhone = selectedStudentForAction.parentPhone.replace(/\s/g, '').replace(/^0/, '+225');
      navigator.clipboard.writeText(messageContent);
      window.location.href = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(messageContent)}`;
  };

  const handleSendWhatsappWeb = () => {
      if (!selectedStudentForAction) return;
      const formattedPhone = selectedStudentForAction.parentPhone.replace(/\s/g, '').replace(/^0/, '+225');
      navigator.clipboard.writeText(messageContent);
      window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(messageContent)}`, '_blank');
  };

  const handleSendEmail = () => {
      if (!selectedStudentForAction) return;
      const subject = `Rappel de scolarité - ${selectedStudentForAction.name} (${selectedStudentForAction.class})`;
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(messageContent)}`;
  };

  const handlePrintStudentTicket = (student: StudentFinancial | null, paymentEncaisse?: number) => {
    if (!student) return;
    const receiptNo = `REC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const dateStr = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const reste = Math.max(0, student.tuitionTotal - student.tuitionPaid);
    const isSolde = student.tuitionPaid >= student.tuitionTotal;

    // Determine color theme based on student class (matching student card colors)
    const getClassReceiptTheme = (className: string) => {
      const c = (className || '').toLowerCase();
      
      if (c.includes('6ème') || c.includes('6eme') || c.includes('5ème') || c.includes('5eme')) {
        // Bleu & Jaune (6ème/5ème)
        return {
          barLeft1: '#0ea5e9', // Blue
          barLeft2: '#eab308', // Yellow
          barRight1: '#eab308',
          barRight2: '#0ea5e9',
          titleColor: '#0284c7',
          badgeBg: '#0ea5e9',
          badgeText: '#ffffff',
          accentBorder: '#eab308',
          tagLabel: '6ème / 5ème (Bleu & Jaune)'
        };
      }
      
      if (c.includes('4ème') || c.includes('4eme') || c.includes('3ème') || c.includes('3eme')) {
        // Bleu & Vert (4ème/3ème)
        return {
          barLeft1: '#0284c7', // Blue
          barLeft2: '#10b981', // Green
          barRight1: '#10b981',
          barRight2: '#0284c7',
          titleColor: '#0369a1',
          badgeBg: '#10b981',
          badgeText: '#ffffff',
          accentBorder: '#10b981',
          tagLabel: '4ème / 3ème (Bleu & Vert)'
        };
      }
      
      if (c.includes('2nde') || c.includes('seconde') || c.includes('1ère') || c.includes('1ere') || c.includes('première')) {
        // Bleu & Blanc (2nde/1ère)
        return {
          barLeft1: '#0284c7', // Royal Blue
          barLeft2: '#38bdf8', // Light Blue / White accent
          barRight1: '#38bdf8',
          barRight2: '#0284c7',
          titleColor: '#0369a1',
          badgeBg: '#0284c7',
          badgeText: '#ffffff',
          accentBorder: '#38bdf8',
          tagLabel: '2nde / 1ère (Bleu & Blanc)'
        };
      }
      
      if (c.includes('tle') || c.includes('terminale')) {
        // Terminale (Indigo & Gold/White)
        return {
          barLeft1: '#312e81', // Deep Indigo
          barLeft2: '#6366f1', // Indigo Accent
          barRight1: '#6366f1',
          barRight2: '#312e81',
          titleColor: '#312e81',
          badgeBg: '#4f46e5',
          badgeText: '#ffffff',
          accentBorder: '#6366f1',
          tagLabel: 'Terminale (Carte Officielle)'
        };
      }

      // Default fallback (Bleu & Jaune)
      return {
        barLeft1: '#0ea5e9',
        barLeft2: '#eab308',
        barRight1: '#eab308',
        barRight2: '#0ea5e9',
        titleColor: '#0284c7',
        badgeBg: '#0ea5e9',
        badgeText: '#ffffff',
        accentBorder: '#eab308',
        tagLabel: 'Scolarité (Bleu & Jaune)'
      };
    };

    const theme = getClassReceiptTheme(student.class);

    const renderSingleReceiptCard = (copyLabel: string) => `
      <div class="bg-white border border-slate-300 rounded-2xl shadow-sm relative overflow-hidden my-2 p-5">
        <!-- LEFT SIDE COLORED ACCENT BARS (Matching Student Card Class Theme) -->
        <div class="absolute left-0 top-0 bottom-0 w-3.5 flex flex-col z-20">
          <div class="h-1/2 w-full" style="background-color: ${theme.barLeft1};"></div>
          <div class="h-1/2 w-full" style="background-color: ${theme.barLeft2}; clip-path: polygon(0 0, 100% 15%, 100% 100%, 0 100%);"></div>
        </div>
        <div class="absolute left-3.5 top-0 bottom-0 w-1.5 opacity-80" style="background-color: ${theme.barLeft2};"></div>

        <!-- RIGHT SIDE COLORED ACCENT BARS (Matching Student Card Class Theme) -->
        <div class="absolute right-0 top-0 bottom-0 w-3.5 flex flex-col z-20">
          <div class="h-1/2 w-full" style="background-color: ${theme.barRight1}; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 85%);"></div>
          <div class="h-1/2 w-full" style="background-color: ${theme.barRight2};"></div>
        </div>
        <div class="absolute right-3.5 top-0 bottom-0 w-1.5 opacity-80" style="background-color: ${theme.barRight1};"></div>

        <!-- MAIN RECEIPT CONTENT -->
        <div class="px-5 py-1">
          <!-- HEADER ROW -->
          <div class="flex justify-between items-start border-b border-slate-200 pb-3 mb-3">
            <!-- LOGO & SCHOOL NAME -->
            <div class="flex items-center gap-3">
              <img src="icone.png" alt="Logo Dashboard" class="h-11 w-auto object-contain shrink-0" onError="this.style.display='none'" />
              <div>
                <h1 class="text-base font-black uppercase tracking-tight" style="color: ${theme.titleColor};">DASHBOARD</h1>
                <p class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Enseignement Général • Abidjan</p>
                <p class="text-[9px] text-slate-400 font-medium">Tél: +225 07 00 00 00 00 • Email: contact@dashboard.ci</p>
              </div>
            </div>

            <!-- BADGE TITLE & DATE & COPY LABEL -->
            <div class="text-right">
              <div class="flex items-center justify-end gap-1.5 mb-1">
                <span class="inline-block border px-2.5 py-1 rounded-xl font-black text-xs uppercase tracking-wider shadow-2xs" style="border-color: ${theme.titleColor}; color: ${theme.titleColor}; bg-slate-50">
                  REÇU DE CAISSE
                </span>
                <span class="inline-block px-2 py-1 rounded-xl font-extrabold text-[9px] uppercase tracking-wider text-white shadow-2xs" style="background-color: ${theme.badgeBg};">
                  ${copyLabel}
                </span>
              </div>
              <p class="text-[11px] font-mono font-bold text-slate-700">N° ${receiptNo}</p>
              <p class="text-[10px] font-bold text-slate-500">Date : <span class="text-slate-900 font-extrabold">${dateStr}</span></p>
            </div>
          </div>

          <!-- FORM FIELDS -->
          <div class="space-y-2.5 text-xs">
            <!-- LINE 1: RECEIVED FROM -->
            <div class="flex items-baseline gap-2 border-b border-slate-200 pb-1">
              <span class="font-extrabold text-slate-600 whitespace-nowrap">Reçu de (Received with thanks from) :</span>
              <span class="font-black text-slate-900 uppercase text-sm tracking-wide flex-1 px-1" style="color: ${theme.titleColor};">
                ${student.name}
              </span>
            </div>

            <!-- LINE 2: CLASS & MATRICULE & CONTACT -->
            <div class="grid grid-cols-3 gap-3 border-b border-slate-200 pb-1">
              <div class="flex items-baseline gap-1.5">
                <span class="font-bold text-slate-500">Classe :</span>
                <span class="font-black px-2 py-0.5 rounded text-white text-[11px]" style="background-color: ${theme.badgeBg};">
                  ${student.class}
                </span>
              </div>
              <div class="flex items-baseline gap-1.5">
                <span class="font-bold text-slate-500">Matricule :</span>
                <span class="font-mono font-bold text-slate-900">${student.id}</span>
              </div>
              <div class="flex items-baseline gap-1.5 truncate">
                <span class="font-bold text-slate-500">Parent / Tél :</span>
                <span class="font-semibold text-slate-800 truncate">${student.parentName} (${student.parentPhone || 'N/A'})</span>
              </div>
            </div>

            <!-- LINE 3: AMOUNT RECEIVED THIS TRANSACTION -->
            <div class="flex items-baseline gap-2 border-b border-slate-200 pb-1 bg-slate-50 p-1.5 rounded-lg">
              <span class="font-extrabold text-slate-700 whitespace-nowrap">Montant Versé (Amount Paid) :</span>
              <span class="font-black text-emerald-700 text-sm tracking-wider">
                ${paymentEncaisse ? paymentEncaisse.toLocaleString() : student.tuitionPaid.toLocaleString()} FCFA
              </span>
              <span class="text-[10px] text-slate-500 font-medium ml-auto italic">
                (${paymentEncaisse ? 'Encaissement direct du jour' : 'Total reçu cumulé'})
              </span>
            </div>

            <!-- LINE 4: PURPOSE -->
            <div class="flex items-baseline gap-2 border-b border-slate-200 pb-1">
              <span class="font-extrabold text-slate-600 whitespace-nowrap">Pour le compte de (For) :</span>
              <span class="font-bold text-slate-800 flex-1 px-1">
                Frais de Scolarité Annuelle & Inscription (${student.class})
              </span>
            </div>

            <!-- FINANCIAL SUMMARY TABLE -->
            <div class="my-2 border border-slate-200 rounded-lg overflow-hidden bg-white">
              <table class="w-full text-[11px]">
                <thead class="bg-slate-100 text-slate-700 font-extrabold uppercase border-b border-slate-200">
                  <tr>
                    <th class="py-1.5 px-3 text-left">Frais Total Scolarité</th>
                    <th class="py-1.5 px-3 text-center">Cumul Encaissé</th>
                    <th class="py-1.5 px-3 text-right">Reste Solde à Payer</th>
                    <th class="py-1.5 px-3 text-center">Statut de Règlement</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 font-bold text-slate-800">
                  <tr>
                    <td class="py-1.5 px-3">${student.tuitionTotal.toLocaleString()} FCFA</td>
                    <td class="py-1.5 px-3 text-center text-emerald-600">${student.tuitionPaid.toLocaleString()} FCFA</td>
                    <td class="py-1.5 px-3 text-right ${reste > 0 ? 'text-amber-600' : 'text-emerald-600'}">
                      ${reste.toLocaleString()} FCFA
                    </td>
                    <td class="py-1.5 px-3 text-center">
                      <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        isSolde ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                      }">
                        ${isSolde ? '✓ SCOLARITÉ SOLDÉE' : 'EN COURS DE RÈGLEMENT'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          <!-- FOOTER SIGNATURES & STAMP SECTION -->
          <div class="mt-3 pt-2 border-t border-slate-200 grid grid-cols-3 gap-4 items-end text-xs">
            <!-- BOX 1: NET AMOUNT -->
            <div>
              <div class="border border-slate-800 rounded-lg p-1.5 text-center bg-slate-50">
                <span class="text-[9px] uppercase font-bold text-slate-500 block">Montant Payé / Amount</span>
                <span class="font-black text-sm text-slate-900">
                  ${(paymentEncaisse || student.tuitionPaid).toLocaleString()} FCFA
                </span>
              </div>
            </div>

            <!-- BOX 2: RECEIVED BY -->
            <div class="text-center">
              <p class="font-extrabold text-slate-700 uppercase mb-5 text-[10px]">Reçu par / Received by</p>
              <div class="w-2/3 mx-auto border-b border-slate-400"></div>
              <p class="text-[9px] text-slate-400 font-medium mt-0.5">Signature du Caissier</p>
            </div>

            <!-- BOX 3: AUTHORIZED SIGNATURE / STAMP -->
            <div class="text-center flex flex-col items-center">
              <div class="w-14 h-14 rounded-full border border-sky-800 text-sky-900 flex flex-col items-center justify-center p-0.5 text-[6px] font-black uppercase text-center leading-none opacity-85 transform -rotate-6">
                <span>DASHBOARD</span>
                <span class="my-0.5 border-t border-b border-sky-800 px-0.5 py-0.5">La Caisse</span>
                <span>ABIDJAN</span>
              </div>
              <p class="font-extrabold text-slate-800 uppercase text-[9px] mt-0.5">Cachet & Signature Autorisée</p>
            </div>
          </div>

          <div class="mt-2 text-center text-[8px] text-slate-400 font-mono border-t border-dashed border-slate-200 pt-1">
            Document officiel délivré par le Dashboard • Conservé pour valoir ce que de droit
          </div>
        </div>
      </div>
    `;

    try {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="utf-8">
              <title>Reçu de Caisse - ${student.name} - Dashboard</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  @page { size: A4 portrait; margin: 5mm; }
                  .no-print { display: none !important; }
                  body { background-color: #ffffff !important; padding: 0 !important; }
                }
                body { background-color: #f1f5f9; color: #0f172a; font-family: system-ui, -apple-system, sans-serif; padding: 15px; }
              </style>
            </head>
            <body>
              <!-- CONTROL BAR -->
              <div class="no-print max-w-4xl mx-auto mb-4 p-3 bg-slate-900 text-white rounded-2xl flex justify-between items-center shadow-lg font-sans">
                <div>
                  <strong class="text-sm font-bold flex items-center gap-2">
                    <span>🧾 Ticket de Caisse / Double Exemplaire (A4)</span>
                  </strong>
                  <p class="text-[11px] text-slate-400">${student.name} (${student.class}) • Couleur Classe: ${theme.tagLabel}</p>
                </div>
                <div class="flex gap-2">
                  <button onclick="window.print()" class="btn-print hidden sm:flex px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors items-center gap-1.5 cursor-pointer shadow-xs">
                    🖨️ Imprimer la Feuille A4 (2 Exemplaires)
                  </button>
                  <button onclick="window.close()" class="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer">
                    Fermer
                  </button>
                </div>
              </div>

              <!-- MAIN SHEET CONTAINER (Full A4 Page Height & Width) -->
              <div class="max-w-4xl mx-auto space-y-2">
                <!-- COPY 1: EXEMPLAIRE ÉLÈVE / PARENT -->
                ${renderSingleReceiptCard('EXEMPLAIRE ÉLÈVE / PARENT')}

                <!-- CUT LINE SEPARATOR -->
                <div class="relative my-2 text-center">
                  <div class="absolute inset-0 flex items-center" aria-hidden="true">
                    <div class="w-full border-t-2 border-dashed border-slate-400"></div>
                  </div>
                  <div class="relative inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[9px] font-mono font-bold uppercase tracking-widest border border-slate-300">
                    <span>✂️ LIGNE DE DÉCOUPE • SOUCHE CAISSE & COMPTABILITÉ</span>
                  </div>
                </div>

                <!-- COPY 2: EXEMPLAIRE CAISSE / COMPTABILITÉ -->
                ${renderSingleReceiptCard('EXEMPLAIRE CAISSE / COMPTABILITÉ')}
              </div>
            </body>
          </html>
        `);
        win.document.close();
        win.focus();
      }
    } catch (err) {
      console.error("Print receipt error", err);
      window.print();
    }
  };

  const handlePrintGeneralReport = () => {
    const isClassView = !!selectedClass;
    const title = isClassView 
      ? `RAPPORT FINANCIER — CLASSE DE ${selectedClass.toUpperCase()}`
      : `RAPPORT FINANCIER GLOBAL — BILAN DE SCOLARITÉ`;
    const dateStr = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const listToPrint = isClassView
      ? financials.filter(s => s.class === selectedClass)
      : financials;

    const totalExpected = listToPrint.reduce((acc, curr) => acc + curr.tuitionTotal, 0);
    const totalCollected = listToPrint.reduce((acc, curr) => acc + curr.tuitionPaid, 0);
    const totalOutstanding = totalExpected - totalCollected;

    try {
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(`
          <!DOCTYPE html>
          <html lang="fr">
            <head>
              <meta charset="utf-8">
              <title>${title} - Dashboard</title>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                @media print {
                  @page { size: A4 landscape; margin: 10mm; }
                  .no-print { display: none !important; }
                }
                body { background-color: #f8fafc; color: #0f172a; font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
              </style>
            </head>
            <body>
              <div class="no-print" style="margin-bottom: 20px; padding: 14px 20px; background-color: #0f172a; color: white; display: flex; justify-content: space-between; align-items: center; border-radius: 12px; font-family: sans-serif;">
                <div>
                  <strong style="font-size: 15px;">${title}</strong>
                  <p style="font-size: 12px; margin: 2px 0 0 0; color: #94a3b8;">Généré le ${dateStr}</p>
                </div>
                <div style="display: flex; gap: 10px;">
                  <button onclick="window.print()" class="btn-print" style="padding: 9px 18px; background-color: #0284c7; color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                    🖨️ Imprimer ce Rapport
                  </button>
                  <button onclick="window.close()" style="padding: 9px 14px; background-color: #334155; color: white; font-weight: bold; border: none; border-radius: 8px; cursor: pointer; font-size: 13px;">
                    Fermer
                  </button>
                </div>
              </div>

              <!-- HEADER -->
              <div class="mb-6 pb-4 border-b-2 border-slate-900 flex justify-between items-center">
                <div>
                  <h1 class="text-xl font-black uppercase text-slate-900">Dashboard</h1>
                  <p class="text-xs text-slate-500 font-bold uppercase">${title}</p>
                </div>
                <div class="text-right text-xs">
                  <p class="font-bold text-slate-800">Date: ${dateStr}</p>
                  <p class="text-slate-500 font-medium">Total Élèves: ${listToPrint.length}</p>
                </div>
              </div>

              <!-- SUMMARY CARDS -->
              <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="border border-slate-200 bg-white p-3.5 rounded-xl shadow-xs">
                  <p class="text-[10px] uppercase font-bold text-slate-400">Total Attendu</p>
                  <p class="text-lg font-black text-slate-800">${totalExpected.toLocaleString()} FCFA</p>
                </div>
                <div class="border border-emerald-200 bg-emerald-50/50 p-3.5 rounded-xl shadow-xs">
                  <p class="text-[10px] uppercase font-bold text-emerald-600">Total Encaissé</p>
                  <p class="text-lg font-black text-emerald-700">${totalCollected.toLocaleString()} FCFA</p>
                </div>
                <div class="border border-amber-200 bg-amber-50/50 p-3.5 rounded-xl shadow-xs">
                  <p class="text-[10px] uppercase font-bold text-amber-600">Reste à Recouvrer</p>
                  <p class="text-lg font-black text-amber-700">${totalOutstanding.toLocaleString()} FCFA</p>
                </div>
              </div>

              <!-- TABLE -->
              <div class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-xs">
                <table class="w-full text-xs">
                  <thead class="bg-slate-100 text-slate-700 font-extrabold uppercase border-b border-slate-200">
                    <tr>
                      <th class="py-2.5 px-3 text-left">#</th>
                      <th class="py-2.5 px-3 text-left">Matricule</th>
                      <th class="py-2.5 px-3 text-left">Nom & Prénom(s)</th>
                      <th class="py-2.5 px-3 text-left">Classe</th>
                      <th class="py-2.5 px-3 text-left">Parent / Tél</th>
                      <th class="py-2.5 px-3 text-right">Scolarité Total</th>
                      <th class="py-2.5 px-3 text-right">Déjà Payé</th>
                      <th class="py-2.5 px-3 text-right">Reste</th>
                      <th class="py-2.5 px-3 text-center">Statut</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 text-slate-800">
                    ${listToPrint.map((s, idx) => {
                      const reste = s.tuitionTotal - s.tuitionPaid;
                      return `
                        <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}">
                          <td class="py-2 px-3 font-bold text-slate-400">${idx + 1}</td>
                          <td class="py-2 px-3 font-mono font-bold text-slate-700">${s.id}</td>
                          <td class="py-2 px-3 font-bold text-slate-900">${s.name}</td>
                          <td class="py-2 px-3 font-semibold text-sky-700">${s.class}</td>
                          <td class="py-2 px-3 text-slate-600">${s.parentName} (${s.parentPhone || '-'})</td>
                          <td class="py-2 px-3 text-right font-medium">${s.tuitionTotal.toLocaleString()} FCFA</td>
                          <td class="py-2 px-3 text-right font-bold text-emerald-600">${s.tuitionPaid.toLocaleString()} FCFA</td>
                          <td class="py-2 px-3 text-right font-bold ${reste > 0 ? 'text-amber-600' : 'text-emerald-600'}">${reste.toLocaleString()} FCFA</td>
                          <td class="py-2 px-3 text-center">
                            <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              s.tuitionPaid >= s.tuitionTotal ? 'bg-emerald-100 text-emerald-800' : s.tuitionPaid > 0 ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                            }">
                              ${s.tuitionPaid >= s.tuitionTotal ? 'Soldé' : s.tuitionPaid > 0 ? 'Partiel' : 'Non Payé'}
                            </span>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>

              <div class="mt-8 pt-4 border-t border-slate-300 flex justify-between items-center text-xs">
                <p class="text-slate-500 font-medium">Service de la Comptabilité & Caisse — Dashboard</p>
                <div class="text-center font-bold text-slate-800">
                  <p>Le Chef d'Établissement / La Caisse</p>
                  <div class="h-12"></div>
                  <p class="text-[10px] text-slate-400 font-mono">Cachet & Signature</p>
                </div>
              </div>
            </body>
          </html>
        `);
        win.document.close();
        win.focus();
      }
    } catch (err) {
      console.error("Print general report error", err);
      window.print();
    }
  };

  const handlePayment = () => {
      if (!selectedStudentForAction) return;
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) return;
      
      const currentPaid = payments[selectedStudentForAction.id] ?? 0;
      const newPaid = Math.min(selectedStudentForAction.tuitionTotal, currentPaid + amount);

      const updatedPayments = {
          ...payments,
          [selectedStudentForAction.id]: newPaid
      };

      setPayments(updatedPayments);
      localStorage.setItem('school_db_financials', JSON.stringify(updatedPayments));

      const updatedStudent: StudentFinancial = {
          ...selectedStudentForAction,
          tuitionPaid: newPaid,
          status: newPaid >= selectedStudentForAction.tuitionTotal ? 'paid' : 'partial'
      };

      // Automatically print payment receipt ticket
      handlePrintStudentTicket(updatedStudent, amount);

      setSelectedStudentForAction(null);
      setPaymentAmount('');
  };

  // --- STATS GLOBALES (Tout l'établissement) ---
  const globalStats = useMemo(() => {
      const totalExpected = financials.reduce((acc, curr) => acc + curr.tuitionTotal, 0);
      const totalCollected = financials.reduce((acc, curr) => acc + curr.tuitionPaid, 0);
      const totalOutstanding = totalExpected - totalCollected;
      const recoveryRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;
      return { totalCollected, totalOutstanding, recoveryRate };
  }, [financials]);

  // --- REGROUPEMENT PAR CLASSE POUR LA VUE GRILLE ---
  const classGroups = useMemo(() => {
      const groups: Record<string, { total: number, collected: number, count: number, unpaidCount: number }> = {};
      
      const primaryClasses = ['CP1', 'CP2', 'CE1', 'CE2', 'CM1', 'CM2'];
      const secondaryClasses = [
          '6ème 1', '6ème 2', '5ème 1', '5ème 2', 
          '4ème 1', '4ème 2', '3ème 1', '3ème 2', 
          '2nde C1', '2nde C2', '2nde A1', '2nde A2',
          '1ère D1', '1ère D2', '1ère A1', '1ère A2',
          'Tle D1', 'Tle D2', 'Tle A1', 'Tle A2'
      ];

      const sectionToUse = currentUser?.section || 'Secondaire';
      const standardClasses = sectionToUse === 'Primaire' ? primaryClasses : secondaryClasses;

      standardClasses.forEach(cls => {
          const normCls = normalizeClassName(cls);
          if (!groups[normCls]) {
              groups[normCls] = { total: 0, collected: 0, count: 0, unpaidCount: 0 };
          }
      });

      financials.forEach(s => {
          const normCls = normalizeClassName(s.class);
          const isPrimary = primaryClasses.some(p => normCls.toLowerCase().startsWith(p.toLowerCase()));
          const isMatchSection = (sectionToUse === 'Primaire' && isPrimary) || (sectionToUse !== 'Primaire' && !isPrimary);

          if (isMatchSection) {
              if (!groups[normCls]) {
                  groups[normCls] = { total: 0, collected: 0, count: 0, unpaidCount: 0 };
              }
              groups[normCls].total += s.tuitionTotal;
              groups[normCls].collected += s.tuitionPaid;
              groups[normCls].count += 1;
              if (s.status !== 'paid') groups[normCls].unpaidCount += 1;
          }
      });

      let entries = Object.entries(groups);

      if (classSearchTerm.trim()) {
          const query = classSearchTerm.toLowerCase();
          entries = entries.filter(([cls]) => cls.toLowerCase().includes(query));
      }

      return entries.sort((a, b) => compareClassNames(a[0], b[0]));
  }, [financials, classSearchTerm, currentUser]);

  // --- FILTRAGE POUR LA VUE DÉTAILLÉE ---
  const detailedList = useMemo(() => {
      if (!selectedClass) return [];
      const targetNorm = normalizeClassName(selectedClass);
      
      return financials
        .filter(s => normalizeClassName(s.class) === targetNorm)
        .filter(s => {
            if (searchTerm && !s.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            if (filter === 'paid') return s.status === 'paid';
            if (filter === 'unpaid') return s.status !== 'paid';
            return true;
        })
        .sort((a, b) => (a.tuitionTotal - a.tuitionPaid) - (b.tuitionTotal - b.tuitionPaid)).reverse();
  }, [financials, selectedClass, filter, searchTerm]);


  const formatCurrency = (amount: number) => {
      return amount.toLocaleString('fr-FR') + ' FCFA';
  };

  // --- RENDER UNIFIÉ ---
  return (
    <>
      {!selectedClass ? (
        /* --- VUE 1 : GRILLE DES CLASSES --- */
        <div className="flex flex-col h-full animate-in fade-in duration-300 relative z-10 bg-[#BFDBFE] pt-12 md:pt-8">
            
            {/* Unified Header */}
        <div className="hidden md:flex justify-between items-center mt-5 mb-8 px-8 shrink-0">
            <div>
                <h1 className="text-white text-[28px] font-bold tracking-tight">Finances & Scolarité</h1>
                <p className="text-white/70 text-sm mt-1">Suivi des paiements par classe.</p>
            </div>
            
            <div className="flex items-center space-x-3">
                <div className="flex items-center gap-3 bg-white/20 px-4 py-2 rounded-xl border border-white/30 w-full md:w-96 text-white">
                  <Search className="text-white" size={20} />
                  <input 
                    type="text" 
                    placeholder="Rechercher une classe..." 
                    value={classSearchTerm}
                    onChange={(e) => setClassSearchTerm(e.target.value)}
                    className="bg-transparent border-none outline-none text-white placeholder-white/70 font-medium w-full"
                  />
                </div>
                {canPrint && (
                    <button 
                        onClick={handlePrintGeneralReport}
                        title="Imprimer le Rapport Financier"
                        className="btn-print hidden sm:flex w-10 h-10 rounded-full bg-white/40 items-center justify-center backdrop-blur-md border border-white/50 hover:bg-white/60 transition-colors text-slate-900 shrink-0 active:scale-95 cursor-pointer"
                    >
                        <Printer className="w-5 h-5" strokeWidth={2} />
                    </button>
                )}
            </div>
        </div>

        {/* Mobile App Bar */}
        <div className="md:hidden flex justify-between items-center mb-8 px-6 shrink-0">
            <div>
                <h1 className="text-white text-[28px] font-bold tracking-tight">Finances</h1>
            </div>
            {canPrint && (
                <button 
                    onClick={handlePrintGeneralReport}
                    title="Imprimer le Rapport Financier"
                    className="btn-print hidden sm:flex w-10 h-10 rounded-full bg-white/40 items-center justify-center backdrop-blur-md border border-white/50 hover:bg-white/60 transition-colors text-slate-900 shrink-0 active:scale-95 cursor-pointer"
                >
                    <Printer className="w-5 h-5" strokeWidth={2} />
                </button>
            )}
        </div>

        <div className="flex-1 bg-white rounded-t-[40px] px-6 pt-8 pb-24 md:pb-0 shadow-2xl relative overflow-y-auto custom-scrollbar border-t border-white/50 md:border-none">
            {/* Grid Classes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {classGroups.map(([className, data]) => {
                    const percentage = data.total > 0 ? (data.collected / data.total) * 100 : 0;
                    const remainder = data.total - data.collected;

                    return (
                        <div 
                            key={className}
                            onClick={() => setSelectedClass(className)}
                            className="bg-white p-6 rounded-[2rem] shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer border border-transparent hover:border-sky-100 group flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
                                    <Layers size={24} />
                                </div>
                                <div className="text-right">
                                    <span className="block text-lg font-bold text-gray-800">{className}</span>
                                    <span className="text-xs text-gray-400 font-medium">{data.count} Élèves</span>
                                </div>
                            </div>

                            <div className="mt-2 mb-6">
                                <div className="flex justify-between text-xs font-bold mb-2">
                                    <span className={percentage === 100 && data.count > 0 ? 'text-emerald-600' : 'text-gray-500'}>
                                        {percentage.toFixed(0)}% Payé
                                    </span>
                                    <span className="text-gray-300">{formatCurrency(data.total)}</span>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${percentage === 100 && data.count > 0 ? 'bg-emerald-500' : 'bg-sky-500'}`} 
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-50">
                                <div>
                                    {data.count === 0 ? (
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Prix Scolarité</p>
                                            <p className="text-xs font-bold text-slate-700">{formatCurrency(getTuitionForClass(className, customTuitions))}</p>
                                        </div>
                                    ) : remainder > 0 ? (
                                        <>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Reste à payer</p>
                                            <p className="text-sm font-black text-sky-600">{formatCurrency(remainder)}</p>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-sm bg-emerald-50 px-2 py-1 rounded-lg">
                                            <CheckCircle size={14}/> Soldé
                                        </div>
                                    )}
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom Tariff Summary Banner */}
            <div className="mt-8 mb-4 p-5 bg-sky-50/80 border border-sky-100 rounded-3xl flex flex-col lg:flex-row items-center justify-between gap-4 text-sky-900">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center font-black shrink-0 shadow-md shadow-sky-200">
                        <Wallet size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-sky-500">Tarifs de Scolarité par Niveau</p>
                        <p className="text-xs sm:text-sm font-bold text-slate-800 flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                            {currentUser?.section === 'Primaire' ? (
                                <span>Primaire (CP1 - CM2) : <strong className="text-sky-600">{formatCurrency(customTuitions['Primaire'] ?? 60000)}</strong></span>
                            ) : (
                                <>
                                    <span>6e/5e/4e : <strong className="text-sky-600">{formatCurrency(customTuitions['6ème'] ?? 90000)}</strong></span>
                                    <span>•</span>
                                    <span>3e : <strong className="text-sky-600">{formatCurrency(customTuitions['3ème'] ?? 100000)}</strong></span>
                                    <span>•</span>
                                    <span>2nde/1ère/Tle : <strong className="text-sky-600">{formatCurrency(customTuitions['2nde'] ?? 110000)}</strong></span>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={openEditTuitionModal}
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2"
                    >
                        <span>⚙️ Modifier les tarifs</span>
                    </button>
                    <div className="text-xs font-semibold bg-white px-4 py-2 rounded-xl border border-sky-100 text-slate-600 shadow-sm">
                        {financials.length} élève{financials.length > 1 ? 's' : ''} inscrit{financials.length > 1 ? 's' : ''}
                    </div>
                </div>
            </div>
        </div>
      </div>
      ) : (
        /* --- VUE 2 : DÉTAIL CLASSE --- */
        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300 relative z-10 bg-[#BFDBFE] pt-6 md:pt-4">
        
        {/* Unified Header */}
        <div className="flex flex-col gap-4 mb-4 px-6 md:px-8 shrink-0">
            <button 
                onClick={() => setSelectedClass(null)}
                className="flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit group"
            >
                <div className="p-1 rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                    <ArrowLeft size={16} />
                </div>
                <span className="font-bold text-sm">Retour aux classes</span>
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 text-white flex items-center justify-center border border-white/30">
                        <School size={28} />
                    </div>
                    <div>
                        <h1 className="text-white text-[28px] font-bold tracking-tight">{selectedClass}</h1>
                        <p className="text-white/70 text-sm font-medium">Suivi des paiements</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center bg-white/20 p-1 rounded-xl w-full md:w-auto overflow-x-auto border border-white/30">
                     <button 
                        onClick={() => setFilter('all')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === 'all' ? 'bg-white text-[#0ea5e9] shadow-sm' : 'text-white/70 hover:text-white'}`}
                      >
                          Tout
                      </button>
                      <button 
                        onClick={() => setFilter('paid')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === 'paid' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-white/70 hover:text-white'}`}
                      >
                          Soldés
                      </button>
                      <button 
                        onClick={() => setFilter('unpaid')}
                        className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${filter === 'unpaid' ? 'bg-rose-50 text-rose-600 shadow-sm' : 'text-white/70 hover:text-white'}`}
                      >
                          Impayés
                      </button>
                </div>
            </div>
        </div>

        <div className="flex-1 min-h-0 bg-white rounded-t-[40px] pt-6 pb-0 shadow-2xl relative overflow-hidden flex flex-col border-t border-white/50 md:border-none">
            <div className="px-6 md:px-8 flex flex-col flex-1 min-h-0">
                {/* Search Bar */}
                <div className="relative w-full md:w-96 mb-4 shrink-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Rechercher un élève dans cette classe..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-sky-500 text-sm font-medium transition-colors"
                    />
                </div>

                {/* Liste Élèves */}
                <div className="flex-1 min-h-0 flex flex-col -mx-6 md:-mx-8">
                    <div className="grid grid-cols-12 px-6 md:px-8 py-4 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0">
                    <div className="col-span-5 md:col-span-4">Élève</div>
                    <div className="col-span-4 md:col-span-3 hidden md:block">Parent</div>
                    <div className="col-span-4 md:col-span-3 text-center">État Paiement</div>
                    <div className="col-span-3 md:col-span-2 text-right">Reste</div>
                </div>
                
                <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pb-24 md:pb-0">
                {detailedList.map((student) => {
                    const percentage = (student.tuitionPaid / student.tuitionTotal) * 100;
                    const remainder = student.tuitionTotal - student.tuitionPaid;
                    const isPaid = remainder === 0;

                    return (
                        <div key={student.id} className="grid grid-cols-12 items-center px-6 md:px-8 py-4 border-b border-gray-50 hover:bg-sky-50 cursor-pointer transition-colors group" onClick={() => openActionModal(student)}>
                             {/* Name */}
                             <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 ${isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-sky-100 text-sky-600'}`}>
                                      {student.photoUrl ? (
                                        <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                                      ) : (
                                        student.name.charAt(0)
                                      )}
                                  </div>
                                  <div>
                                      <p className="font-bold text-gray-800 text-sm">{student.name}</p>
                                      <p className="text-[10px] text-gray-400 md:hidden">{student.parentPhone}</p>
                                  </div>
                             </div>

                             {/* Parent (Desktop) */}
                             <div className="col-span-4 md:col-span-3 hidden md:block">
                                  <p className="text-sm font-bold text-gray-600">{student.parentName}</p>
                                  <p className="text-xs text-gray-400 flex items-center gap-1">
                                      <Smartphone size={12} /> {student.parentPhone}
                                  </p>
                             </div>

                             {/* Progress */}
                             <div className="col-span-4 md:col-span-3 px-2">
                                  <div className="flex justify-between text-[10px] font-bold mb-1">
                                      <span className="text-gray-500">{formatCurrency(student.tuitionPaid)}</span>
                                      <span className="text-gray-300">/ {formatCurrency(student.tuitionTotal)}</span>
                                  </div>
                                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-gradient-to-r from-orange-400 to-sky-500'}`} 
                                        style={{ width: `${percentage}%` }}
                                      ></div>
                                  </div>
                             </div>

                             {/* Reste & Action */}
                             <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-2">
                                  {!isPaid ? (
                                      <>
                                        <div className="text-right mr-1">
                                            <p className="font-bold text-sky-600 text-sm">{formatCurrency(remainder)}</p>
                                            <p className="text-[10px] text-sky-400 font-medium">À payer</p>
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); openMessageModal(student); }}
                                            className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center hover:bg-sky-600 hover:text-white transition-all shadow-sm"
                                            title="Envoyer Rappel"
                                        >
                                            <Send size={14} />
                                        </button>
                                      </>
                                  ) : (
                                      <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg">
                                          <CheckCircle size={14} /> Soldé
                                      </div>
                                  )}
                                  {canPrint && (
                                      <button 
                                          onClick={(e) => { e.stopPropagation(); handlePrintStudentTicket(student); }}
                                          className="btn-print hidden sm:flex w-8 h-8 rounded-xl bg-slate-100 text-slate-700 items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm shrink-0"
                                          title="Imprimer Ticket / Reçu"
                                      >
                                          <Printer size={14} />
                                      </button>
                                  )}
                             </div>
                        </div>
                    );
                })}

                {detailedList.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                        <Filter size={48} className="mb-4 opacity-20" />
                        <p>Aucun élève trouvé avec ces critères.</p>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

      {/* Action Modal */}
      <AnimatePresence>
        {selectedStudentForAction && (
          <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center p-4 md:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedStudentForAction(null)}
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-2xl z-10 w-full max-w-xl md:max-w-2xl flex flex-col relative overflow-hidden my-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-start mb-6">
                 <div className="flex items-center gap-4">
                     <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black bg-sky-100 text-sky-600 shadow-inner shrink-0 overflow-hidden`}>
                          {selectedStudentForAction.photoUrl ? (
                            <img src={selectedStudentForAction.photoUrl} alt={selectedStudentForAction.name} className="w-full h-full object-cover" />
                          ) : (
                            selectedStudentForAction.name.charAt(0)
                          )}
                     </div>
                     <div>
                         <h3 className="text-xl font-bold text-gray-800 leading-tight">{selectedStudentForAction.name}</h3>
                         <span className="inline-block bg-sky-50 text-sky-600 text-xs font-bold px-3 py-1 rounded-lg mt-1">
                             {selectedStudentForAction.class}
                         </span>
                     </div>
                 </div>
                 <button onClick={() => setSelectedStudentForAction(null)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors shrink-0">
                     <X size={20} />
                 </button>
              </div>
              
              <AnimatePresence mode="wait">
                  {modalMode === 'details' && (
                    <motion.div 
                        key="details"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col w-full"
                    >
                        <div className="bg-gray-50/80 rounded-2xl p-5 mb-6 border border-gray-100">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Contact Parent</p>
                            <div className="text-base font-bold text-gray-800 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                    <Smartphone size={16} className="text-sky-500" />
                                </div>
                                {selectedStudentForAction.parentPhone}
                            </div>
                            <p className="text-sm text-gray-500 font-medium mt-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                {selectedStudentForAction.parentName}
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-sky-50/50 rounded-2xl border border-sky-100 mb-6">
                            <div>
                                <p className="text-[10px] text-sky-500 font-bold uppercase tracking-wider mb-1">Reste à payer</p>
                                <p className="text-xl font-bold text-sky-700">
                                    {(selectedStudentForAction.tuitionTotal - selectedStudentForAction.tuitionPaid).toLocaleString()} FCFA
                                </p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-sky-100">
                                <AlertCircle size={18} className="text-sky-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {canPrint && (
                                <button
                                    onClick={() => handlePrintStudentTicket(selectedStudentForAction)}
                                    className="btn-print hidden sm:flex col-span-1 sm:col-span-2 py-3.5 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors items-center justify-center gap-2 text-sm shadow-md"
                                >
                                    <Printer size={18} />
                                    Imprimer Ticket de caisse / Reçu
                                </button>
                            )}
                            <button
                                onClick={() => setModalMode('message')}
                                className="py-4 rounded-2xl font-bold bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                                <Send size={18} />
                                Message aux parents
                            </button>
                            <button
                                onClick={() => setModalMode('payment')}
                                disabled={selectedStudentForAction.tuitionTotal - selectedStudentForAction.tuitionPaid <= 0}
                                className={`py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm transition-all ${
                                    selectedStudentForAction.tuitionTotal - selectedStudentForAction.tuitionPaid <= 0
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200'
                                }`}
                            >
                                {selectedStudentForAction.tuitionTotal - selectedStudentForAction.tuitionPaid <= 0 ? (
                                    <>
                                        <CheckCircle size={18} />
                                        Soldé
                                    </>
                                ) : (
                                    <>
                                        <Wallet size={18} />
                                        Encaisser
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                  )}
                  
                  {modalMode === 'payment' && (
                    <motion.div 
                        key="payment"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col w-full"
                    >
                        <button 
                            onClick={() => setModalMode('details')}
                            className="flex items-center gap-2 text-sm text-gray-500 font-bold mb-6 hover:text-gray-800 transition-colors w-fit"
                        >
                            <ArrowLeft size={16} /> Retour
                        </button>
                        <h4 className="font-bold text-gray-800 text-lg mb-2">Nouvel encaissement</h4>
                        <p className="text-sm text-gray-500 mb-6">Montant restant : <span className="font-bold text-sky-600">{(selectedStudentForAction.tuitionTotal - selectedStudentForAction.tuitionPaid).toLocaleString()} FCFA</span></p>
                        
                        <div className="mb-8 relative">
                            <input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="0"
                                className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-emerald-500 rounded-2xl px-6 py-4 text-2xl font-bold text-gray-800 outline-none transition-all pr-20"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-gray-400">FCFA</span>
                        </div>
                        
                        <button
                            onClick={handlePayment}
                            disabled={!paymentAmount || parseFloat(paymentAmount) <= 0}
                            className="w-full py-4 rounded-2xl font-bold bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CheckCircle size={18} />
                            Valider l'encaissement
                        </button>
                    </motion.div>
                  )}
                  
                  {modalMode === 'message' && (
                    <motion.div 
                        key="message"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col w-full"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <button 
                                onClick={() => setModalMode('details')}
                                className="flex items-center gap-2 text-sm text-gray-500 font-bold hover:text-gray-800 transition-colors w-fit"
                            >
                                <ArrowLeft size={16} /> Retour
                            </button>
                            <span className="text-xs font-semibold px-3 py-1 bg-sky-50 text-sky-600 rounded-full">
                                Rappel de paiement
                            </span>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Destinataire</p>
                                <p className="text-sm font-bold text-slate-800">{selectedStudentForAction.parentName} ({selectedStudentForAction.parentPhone})</p>
                                <p className="text-xs text-slate-500">Élève : <span className="font-semibold text-slate-700">{selectedStudentForAction.name}</span> ({selectedStudentForAction.class})</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Solde Débiteur</p>
                                <p className="text-base font-extrabold text-sky-600">
                                    {(selectedStudentForAction.tuitionTotal - selectedStudentForAction.tuitionPaid).toLocaleString()} FCFA
                                </p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-xs font-bold text-gray-700">Message personnalisé :</label>
                                <button
                                    onClick={handleCopyMessage}
                                    className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded-lg transition-colors"
                                >
                                    {isCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                    {isCopied ? 'Copié !' : 'Copier'}
                                </button>
                            </div>
                            <textarea
                                value={messageContent}
                                onChange={(e) => setMessageContent(e.target.value)}
                                placeholder="Tapez votre message ici..."
                                className="w-full h-36 bg-gray-50 border border-gray-200 focus:bg-white focus:border-sky-500 rounded-2xl p-3.5 text-sm font-medium text-gray-800 outline-none transition-all resize-none custom-scrollbar"
                            />
                        </div>

                        {/* Buttons Section */}
                        <div className="flex flex-col gap-2.5">
                            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Envoyer le message via :</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <button
                                    onClick={handleSendWhatsappApp}
                                    disabled={!messageContent.trim()}
                                    className="py-3 px-4 rounded-xl font-bold bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md shadow-green-100 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Smartphone size={16} />
                                    WhatsApp App
                                </button>
                                
                                <button
                                    onClick={handleSendWhatsappWeb}
                                    disabled={!messageContent.trim()}
                                    className="py-3 px-4 rounded-xl font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ExternalLink size={16} />
                                    WhatsApp Web
                                </button>
                            </div>

                            <button
                                onClick={handleSendEmail}
                                disabled={!messageContent.trim()}
                                className="w-full py-3 px-4 rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-100 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Mail size={16} />
                                Envoyer le message sur E-mail
                            </button>
                        </div>
                    </motion.div>
                  )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal d'édition des tarifs de scolarité */}
      <AnimatePresence>
        {showEditTuitionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button
                onClick={() => setShowEditTuitionModal(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold">
                  <Wallet size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Frais de Scolarité</h3>
                  <p className="text-xs text-slate-500">Modifier le tarif annuel par niveau d'étude (FCFA)</p>
                </div>
              </div>

              <form onSubmit={handleSaveTuitions} className="space-y-4">
                {currentUser?.section === 'Primaire' && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">École Primaire (CP1 - CM2)</h4>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Tarif annuel Primaire :</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={tuitionForm['Primaire'] ?? '60000'}
                          onChange={(e) => setTuitionForm({ ...tuitionForm, 'Primaire': e.target.value })}
                          className="w-full p-3 bg-white rounded-xl border border-slate-200 font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 pr-16"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">FCFA</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Collège (Premier Cycle)</h4>
                  
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Classes de 6ème, 5ème, 4ème :</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={tuitionForm['6ème'] ?? '90000'}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTuitionForm({ ...tuitionForm, '6ème': val, '5ème': val, '4ème': val });
                        }}
                        className="w-full p-3 bg-white rounded-xl border border-slate-200 font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">FCFA</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Classe de 3ème :</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={tuitionForm['3ème'] ?? '100000'}
                        onChange={(e) => setTuitionForm({ ...tuitionForm, '3ème': e.target.value })}
                        className="w-full p-3 bg-white rounded-xl border border-slate-200 font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">FCFA</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Lycée (Second Cycle)</h4>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Classes de 2nde (A / C) :</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={tuitionForm['2nde'] ?? '110000'}
                        onChange={(e) => setTuitionForm({ ...tuitionForm, '2nde': e.target.value })}
                        className="w-full p-3 bg-white rounded-xl border border-slate-200 font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">FCFA</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Classes de 1ère (A / D) :</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={tuitionForm['1ère'] ?? '110000'}
                        onChange={(e) => setTuitionForm({ ...tuitionForm, '1ère': e.target.value })}
                        className="w-full p-3 bg-white rounded-xl border border-slate-200 font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">FCFA</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Classes de Terminale (Tle A / D) :</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={tuitionForm['Tle'] ?? '110000'}
                        onChange={(e) => setTuitionForm({ ...tuitionForm, 'Tle': e.target.value })}
                        className="w-full p-3 bg-white rounded-xl border border-slate-200 font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">FCFA</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditTuitionModal(false)}
                    className="flex-1 py-3.5 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3.5 rounded-xl font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-200 transition-all text-xs"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default InsightsPage;