import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Info, Check } from 'lucide-react';

interface PaymentViewProps {
  onBack: () => void;
  onGoHome?: () => void;
}

export const PaymentView: React.FC<PaymentViewProps> = ({ onBack, onGoHome }) => {
  const [step, setStep] = useState<'booking' | 'payment' | 'finish'>('booking');
  const [paymentMethod, setPaymentMethod] = useState<string | null>('mastercard');
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const packages = [
    { id: 'standard', name: 'Projet Standard', price: 150.00, quantity: 1 },
  ];

  const totalAmount = packages.reduce((acc, pkg) => acc + (pkg.price * pkg.quantity), 0);
  const totalItems = packages.reduce((acc, p) => acc + p.quantity, 0);

  const renderStepper = () => {
    return (
      <div className="flex items-center justify-between w-full px-6 mb-8 mt-4">
        {/* Summary Step */}
        <div className="flex flex-col items-center">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold
            ${step === 'booking' ? 'bg-[#4A90E2] ring-4 ring-[#4A90E2]/20' : 'bg-[#4A90E2]'}`}
          >
            {step === 'booking' ? <div className="w-2.5 h-2.5 bg-white rounded-full"></div> : <Check size={12} strokeWidth={3} />}
          </div>
          <span className="text-[12px] mt-2 font-medium text-gray-800">Résumé</span>
        </div>
        
        <div className="flex-1 h-[2px] mx-2 bg-gray-200 relative top-[-10px]">
          {(step === 'payment' || step === 'finish') && <div className="absolute left-0 top-0 h-full bg-[#4A90E2] w-full" />}
        </div>
        
        {/* Payment Step */}
        <div className="flex flex-col items-center">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold
            ${step === 'payment' ? 'bg-[#4A90E2] ring-4 ring-[#4A90E2]/20' : step === 'finish' ? 'bg-[#4A90E2]' : 'bg-gray-200'}`}
          >
            {step === 'payment' ? <div className="w-2.5 h-2.5 bg-white rounded-full"></div> : step === 'finish' ? <Check size={12} strokeWidth={3} /> : ''}
          </div>
          <span className={`text-[12px] mt-2 font-medium ${step === 'payment' || step === 'finish' ? 'text-gray-800' : 'text-gray-400'}`}>Paiement</span>
        </div>

        <div className="flex-1 h-[2px] mx-2 bg-gray-200 relative top-[-10px]">
           {step === 'finish' && <div className="absolute left-0 top-0 h-full bg-[#4A90E2] w-full" />}
        </div>

        {/* Finish Step */}
        <div className="flex flex-col items-center">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold
            ${step === 'finish' ? 'bg-[#4A90E2] ring-4 ring-[#4A90E2]/20' : 'bg-gray-200'}`}
          >
             {step === 'finish' ? <Check size={12} strokeWidth={3} fill="currentColor" /> : ''}
          </div>
          <span className={`text-[12px] mt-2 font-medium ${step === 'finish' ? 'text-gray-800' : 'text-gray-400'}`}>Terminé</span>
        </div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 bg-[#f3f4f6] flex flex-col z-[60] overflow-hidden font-sans">
      {/* Header */}
      <div className="px-6 pt-14 pb-4 flex items-center justify-between z-10 bg-[#f3f4f6]">
        <button onClick={() => {
          if (step === 'booking') onBack();
          else if (step === 'payment') setStep('booking');
          else if (onGoHome) onGoHome();
          else onBack();
        }} className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-500 hover:text-black transition-colors active:scale-95">
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
        <h1 className="text-lg font-semibold text-black tracking-wide">
          {step === 'booking' ? 'Détails de la commande' : step === 'payment' ? 'Paiement' : 'Terminé'}
        </h1>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-500 hover:text-black transition-colors active:scale-95">
          <Info size={20} strokeWidth={2} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24 relative flex flex-col">
        {renderStepper()}

        <AnimatePresence mode="wait">
          {step === 'booking' && (
            <motion.div 
              key="booking"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-6 flex-1"
            >
              <div className="bg-white rounded-3xl p-6 shadow-sm mb-4">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Options Sélectionnées</h2>
                  <div className="space-y-4">
                    {packages.map(pkg => (
                      <div key={pkg.id} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900 text-lg">{pkg.name}</span>
                          <span className="text-sm text-[#4A90E2] font-medium">${pkg.price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-50 rounded-full px-4 py-2 border border-gray-200">
                          <span className="font-bold text-gray-900 text-center">x{pkg.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-dashed border-gray-200 relative pt-6 mb-2">
                  <div className="absolute -left-8 -top-3 w-6 h-6 bg-[#f3f4f6] rounded-full"></div>
                  <div className="absolute -right-8 -top-3 w-6 h-6 bg-[#f3f4f6] rounded-full"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 leading-tight pr-4">Projet Prestataire</h3>
                    </div>
                    <div className="bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-600 whitespace-nowrap">
                      {totalItems} Article{totalItems > 1 ? 's' : ''}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pb-2">
                    <div className="flex items-center text-gray-500 text-sm">
                       <span className="font-semibold">Travail à distance</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-400 font-medium mb-0.5">Montant Total</span>
                      <span className="font-bold text-[#4A90E2] text-xl">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div 
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="px-6 flex-1 flex flex-col"
            >
              <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm flex items-start">
                <div className="text-[#4A90E2] bg-[#E4EFFF] p-1.5 rounded-full mr-3 shrink-0">
                  <Info size={16} />
                </div>
                <p className="text-sm text-gray-600 leading-tight">
                  Veuillez finaliser le paiement dans les 18 minutes, sinon votre commande sera annulée.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { id: 'mastercard', name: 'Mastercard', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg', type: 'card' },
                  { id: 'visa', name: 'Visa', logo: 'https://i.pinimg.com/736x/43/ed/1d/43ed1d4685a1e776836cf19557cfca73.jpg', type: 'card' },
                  { id: 'paypal', name: 'PayPal', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg', type: 'online' },
                  { id: 'wave', name: 'Wave', logo: 'https://i.pinimg.com/736x/c1/04/e5/c104e55bb7db9b37d5f6f6248ffaad54.jpg', text: 'Wave', textColor: 'text-blue-500', type: 'mobile' }, 
                  { id: 'orange', name: 'Orange Money', logo: 'https://i.pinimg.com/736x/d4/0a/ae/d40aaed93de5fb669b845167963c6d9f.jpg', text: 'Orange Money', textColor: 'text-orange-500', type: 'mobile' },
                  { id: 'moov', name: 'Moov Money', logo: 'https://i.pinimg.com/736x/3f/1f/e1/3f1fe1842104c1890bd463a086b42eeb.jpg', text: 'Moov Money', textColor: 'text-blue-700', type: 'mobile' }, 
                  { id: 'mtn', name: 'MTN MoMo', logo: 'https://i.pinimg.com/736x/88/e6/3a/88e63a89774262bfc1510b6e90370e2a.jpg', text: 'MTN MoMo', textColor: 'text-yellow-600', type: 'mobile' },
                ].map((method) => (
                  <button 
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`bg-white rounded-2xl p-3 shadow-sm border-2 flex items-center justify-center transition-colors h-16 ${paymentMethod === method.id ? 'border-[#4A90E2] bg-[#E4EFFF]' : 'border-transparent'}`}
                  >
                     {method.logo && !imageErrors[method.id] ? (
                       <img 
                         src={method.logo} 
                         alt={method.name} 
                         referrerPolicy="no-referrer"
                         onError={() => setImageErrors(prev => ({ ...prev, [method.id]: true }))}
                         className={`object-contain max-w-[80px] ${['wave', 'orange', 'moov', 'mtn'].includes(method.id) ? 'h-10 rounded-lg' : method.id === 'visa' ? 'h-14 mix-blend-multiply' : 'h-5'}`} 
                       />
                     ) : (
                       <span className={`font-bold text-sm ${method.textColor || 'text-gray-700'}`}>{method.text || method.name}</span>
                     )}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="popLayout">
                {paymentMethod && (
                  <motion.div
                    key={paymentMethod}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-6"
                  >
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                      <h3 className="font-bold text-gray-900 mb-4 text-sm">
                        {['wave', 'orange', 'moov', 'mtn'].includes(paymentMethod) ? 'Détails Mobile Money' : 'Détails de paiement'}
                      </h3>
                      <div className="space-y-4">
                        {['wave', 'orange', 'moov', 'mtn'].includes(paymentMethod) ? (
                           <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Numéro de téléphone</label>
                            <input type="text" placeholder="+225 00 00 00 00" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/50 focus:border-[#4A90E2] transition-all" />
                          </div>
                        ) : paymentMethod === 'paypal' ? (
                          <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Adresse Email</label>
                            <input type="email" placeholder="email@example.com" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/50 focus:border-[#4A90E2] transition-all" />
                          </div>
                        ) : (
                          <>
                            <div>
                              <label className="text-xs font-medium text-gray-500 mb-1 block">Numéro de carte</label>
                              <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/50 focus:border-[#4A90E2] transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Date d'expiration</label>
                                <input type="text" placeholder="MM/YY" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/50 focus:border-[#4A90E2] transition-all" />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">CVV</label>
                                <input type="text" placeholder="123" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/50 focus:border-[#4A90E2] transition-all" />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-gray-500 mb-1 block">Nom sur la carte</label>
                              <input type="text" placeholder="Martin Lee" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4A90E2]/50 focus:border-[#4A90E2] transition-all" />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="mt-auto px-4 pb-4">
                 <p className="text-xs text-gray-400 text-center leading-relaxed">
                   En cliquant sur PAYER, vous acceptez les conditions générales et la politique de confidentialité.
                 </p>
              </div>
            </motion.div>
          )}

          {step === 'finish' && (
            <motion.div 
              key="finish"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-6 flex-1 flex flex-col items-center justify-center pt-10"
            >
              <div className="relative mb-10 w-28 h-28 flex items-center justify-center">
                 {/* Decorative elements / Confetti */}
                 <div className="absolute top-0 right-4 w-2 h-2 bg-yellow-400 rotate-45"></div>
                 <div className="absolute top-4 left-0 w-3 h-3 bg-red-400 rotate-12"></div>
                 <div className="absolute bottom-4 left-6 w-2 h-2 bg-blue-400 rotate-45"></div>
                 <div className="absolute bottom-0 right-8 w-2 h-2 bg-green-400"></div>
                 <div className="absolute -top-4 right-1/2 w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                 
                 <motion.div 
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-24 h-24 bg-[#4A90E2] rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(74,144,226,0.3)]"
                 >
                   <Check size={48} color="white" strokeWidth={3} />
                 </motion.div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">Félicitations !</h2>
              <p className="text-gray-500 text-center text-sm px-4 leading-relaxed mb-6">
                Merci pour votre paiement. Voici votre ID de transaction :<br />
                <span className="font-semibold text-gray-700">TRX-A0 123 A67 189</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Button */}
      <div className="absolute bottom-6 left-6 right-6">
        {step === 'booking' && (
          <button 
            onClick={() => setStep('payment')}
            disabled={totalItems === 0}
            className={`w-full text-white py-4 rounded-full font-semibold text-[16px] shadow-lg transition-colors ${totalItems === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0f1013] hover:bg-black'}`}
          >
            Passer au paiement
          </button>
        )}
        {step === 'payment' && (
          <button 
            onClick={() => setStep('finish')}
            className="w-full bg-[#0f1013] text-white py-4 rounded-full font-semibold text-[16px] shadow-lg hover:bg-black transition-colors"
          >
            Payer ${totalAmount.toFixed(2)}
          </button>
        )}
        {step === 'finish' && (
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                if (onGoHome) onGoHome();
                else onBack();
              }}
              className="w-full bg-[#0f1013] text-white py-4 rounded-full font-semibold text-[16px] shadow-lg hover:bg-black transition-colors"
            >
              Voir la commande
            </button>
            <button 
              onClick={() => {
                if (onGoHome) onGoHome();
                else onBack();
              }}
              className="w-full bg-white text-gray-800 border border-gray-200 py-4 rounded-full font-semibold text-[16px] hover:bg-gray-50 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
