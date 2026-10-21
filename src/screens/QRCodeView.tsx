import React, { useState, useRef } from 'react';
import { Upload, Wifi, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QRCodeViewProps {
  onBack: () => void;
}

export const QRCodeView: React.FC<QRCodeViewProps> = ({ onBack }) => {
  const [logoBase64, setLogoBase64] = useState<string | null>(() => {
    return localStorage.getItem('custom_qr_logo');
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setLogoBase64(result);
        localStorage.setItem('custom_qr_logo', result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="absolute inset-0 bg-[#F4F5F9] z-[100] h-full overflow-hidden flex flex-col font-sans px-5 pt-14 pb-8"
    >
      {/* top header */}
      <div className="flex justify-between items-center mb-6">
          <h1 className="text-[28px] font-bold text-[#2064E2] cursor-pointer" onClick={onBack}>Paiements</h1>
          <button className="text-[#2064E2]" onClick={onBack}>
            <Upload size={24} />
          </button>
      </div>
      
      {/* tabs */}
      <div className="flex border-b border-gray-200 mb-6 px-1">
          <button className="pb-3 border-b-2 border-[#2064E2] text-[#2064E2] font-semibold flex-1 text-center text-[15px]">Payer par QR/NFC</button>
          <button className="pb-3 text-gray-500 font-medium flex-1 text-center text-[15px]">Envoyer</button>
          <button className="pb-3 text-gray-500 font-medium flex-1 text-center text-[15px]">Demander</button>
      </div>
      
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-8 flex flex-col">
          {/* main card */}
          <div className="bg-white rounded-[1.5rem] p-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)] mb-4 flex flex-col items-center">
             <h2 className="font-bold text-[17px] text-gray-900 mb-6">Payer avec TASKup</h2>
             
             <div className="relative w-64 h-64 mb-8">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=PaymentToTaskup`} className="w-full h-full object-contain" alt="QR Code" />
                <div 
                   className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90px] h-[90px] bg-white flex items-center justify-center rounded-2xl p-1.5 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                   onClick={() => fileInputRef.current?.click()}
                   title="Cliquer pour changer le logo"
                >
                   {logoBase64 ? (
                     <img src={logoBase64} alt="Custom Logo" className="w-full h-full object-cover rounded-xl" />
                   ) : (
                     <div className="w-full h-full bg-[#2064E2] rounded-xl flex items-center justify-center text-white font-black text-3xl tracking-tighter">
                       T
                     </div>
                   )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
             </div>
             
             {/* toggle */}
             <div className="flex bg-gray-50 rounded-full p-1.5 w-full relative border border-gray-100">
                <div className="absolute left-1.5 top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-sm border border-gray-100/50"></div>
                <button className="flex-1 text-center py-2.5 text-[#2064E2] font-semibold text-[14px] z-10 w-1/2">Afficher mon code</button>
                <button className="flex-1 text-center py-2.5 text-gray-400 font-medium text-[14px] z-10 w-1/2">Scanner le code QR</button>
             </div>
          </div>

          {/* NFC Card */}
          <div className="bg-white rounded-[1.5rem] p-5 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
             <div className="flex items-center gap-2 mb-2">
                <Wifi className="rotate-90 text-gray-800" size={20} strokeWidth={2.5} />
                <h3 className="font-bold text-[15px] text-gray-900">NFC, Tap to Pay également <span className="text-[#34A853]">disponible</span></h3>
             </div>
             <p className="text-gray-400 text-[13px] font-medium leading-relaxed mb-4">
                Approchez votre téléphone de n'importe quel terminal pour payer avec TASKup
             </p>
             
             <div className="flex items-start gap-4 mb-4">
                <div className="w-[52px] h-[34px] bg-[#1C1C1E] rounded-md shrink-0 flex items-center justify-center overflow-hidden flex-col mt-0.5 shadow-md">
                    <span className="text-white text-[7px] font-bold tracking-widest uppercase">TASK</span>
                </div>
                <p className="text-[#2064E2] font-medium text-[12px] leading-[1.3] pr-2">
                   Carte TASKup liée à Apple Pay. Utilisable sur n'importe quel terminal sans contact !
                </p>
             </div>
             
             <div className="bg-[#E9F8ED] rounded-full py-2.5 flex items-center justify-center gap-1.5 w-full mt-2">
                <CheckCircle2 className="text-[#34A853]" size={16} fill="currentColor" color="white" />
                <span className="text-[#34A853] font-semibold text-[13px]">Prêt à payer</span>
             </div>
          </div>
      </div>
    </motion.div>
  );
};
