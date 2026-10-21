import React from 'react';

interface DirectorSignatureStampProps {
  date?: string;
  directorName?: string;
  directorSignature?: string;
  schoolName?: string;
  className?: string;
  teacherName?: string;
  teacherSignature?: string;
  stampMode?: 'blank' | 'digital';
}

export const DirectorSignatureStamp: React.FC<DirectorSignatureStampProps> = ({
  date,
  directorName = "M. TRAORÉ KASSIM",
  directorSignature,
  schoolName = "DASHBOARD",
  className = "",
  teacherName = "M. YALE ARLON",
  teacherSignature,
  stampMode = 'blank'
}) => {
  const currentDate = date || new Date().toLocaleDateString('fr-FR');
  const displayTeacherSig = teacherSignature === "" ? "" : (teacherSignature || (teacherName ? teacherName.split(' ').pop() : '') || 'Y. Arlon');
  const displayDirectorSig = directorSignature === "" ? "" : (directorSignature || 'T. Kassim');

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-4 items-center border-t-[1.5px] border-slate-900 pt-1 text-slate-900 ${className}`}>
      {/* 1. PROFESSEUR PRINCIPAL SIGNATURE */}
      <div className="flex-1 flex flex-col items-center justify-between text-center min-h-[50px] border-b md:border-b-0 print:border-b-0 md:border-r print:border-r border-slate-200 pb-1 md:pb-0 print:pb-0 pr-2">
        <div>
          <p className="uppercase text-[9.5px] font-bold text-slate-600">Le Professeur Principal</p>
          <p className="text-[8.5px] text-slate-400 italic">Visa & Signature</p>
        </div>
        
        <div className="my-1.5 flex items-center justify-center min-h-[38px]">
          {displayTeacherSig ? (
            displayTeacherSig.startsWith('data:image') || displayTeacherSig.startsWith('http') ? (
              <img src={displayTeacherSig} alt="Signature Professeur" className="max-h-10 max-w-[130px] object-contain" />
            ) : (
              <div className="font-serif italic text-blue-900 font-bold transform -rotate-2 select-none">
                <span style={{ fontFamily: "'Caveat', 'Brush Script MT', 'Dancing Script', cursive" }} className="text-xl text-blue-800">
                  {displayTeacherSig}
                </span>
              </div>
            )
          ) : (
            <div className="h-10" />
          )}
        </div>

        <p className="font-black text-[10.5px] uppercase text-slate-900">{teacherName}</p>
      </div>

      {/* 2. CACHET & TAMPON OFFICIEL ("LE GUICHET / CACHET") */}
      <div className="flex-1 flex flex-col items-center justify-center text-center min-h-[50px] border-r border-slate-200 px-2">
        <p className="uppercase text-[9px] font-bold text-slate-600 mb-0.5">Cachet & Tampon Officiel</p>
        
        {stampMode === 'digital' ? (
          <div className="relative w-20 h-20 flex items-center justify-center my-0.5 select-none">
            <svg viewBox="0 0 140 140" className="w-16 h-16 text-blue-800">
              <circle cx="70" cy="70" r="66" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="6 2 2 2" />
              <circle cx="70" cy="70" r="58" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="70" cy="70" r="42" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
              
              <path id="circlePathTop" d="M 16,70 A 54,54 0 0,1 124,70" fill="none" />
              <text fontSize="7.5" fontWeight="900" fill="currentColor">
                <textPath href="#circlePathTop" startOffset="50%" textAnchor="middle">
                  REPUBLIQUE DE COTE D'IVOIRE
                </textPath>
              </text>
              
              <path id="circlePathBottom" d="M 124,70 A 54,54 0 0,1 16,70" fill="none" />
              <text fontSize="7" fontWeight="900" fill="currentColor">
                <textPath href="#circlePathBottom" startOffset="50%" textAnchor="middle">
                  ★ MENA - DRE ABIDJAN 3 ★
                </textPath>
              </text>

              <text x="70" y="56" textAnchor="middle" fontSize="7.5" fontWeight="900" fill="currentColor">{schoolName}</text>
              <text x="70" y="66" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="currentColor">LE DIRECTEUR</text>
              <text x="70" y="75" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="currentColor">DES ÉTUDES</text>
              <text x="70" y="86" textAnchor="middle" fontSize="7" fontWeight="bold" fill="currentColor">★ CACHET OFFICIEL ★</text>
            </svg>
          </div>
        ) : (
          <div className="w-full max-w-[140px] h-14 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center p-0.5 my-0.5 bg-slate-50/50">
            <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-wider text-center">Emplacement du Cachet / Tampon</span>
            <span className="text-[7px] italic text-slate-400 text-center">(À apposer à l'impression)</span>
          </div>
        )}
      </div>

      {/* 3. DIRECTEUR DES ETUDES SIGNATURE */}
      <div className="flex-1 flex flex-col items-center justify-between text-center min-h-[50px] pl-2">
        <div>
          <p className="uppercase text-[9px] font-bold text-slate-600">Fait à Abidjan, le {currentDate}</p>
          <p className="uppercase text-[10px] font-black text-slate-900 underline">Le Directeur des Études</p>
        </div>

        <div className="my-1.5 flex items-center justify-center min-h-[38px]">
          {displayDirectorSig ? (
            displayDirectorSig.startsWith('data:image') || displayDirectorSig.startsWith('http') ? (
              <img src={displayDirectorSig} alt="Signature Directeur" className="max-h-10 max-w-[130px] object-contain" />
            ) : (
              <div className="relative font-serif italic text-blue-900 font-bold transform -rotate-2 select-none">
                <span style={{ fontFamily: "'Caveat', 'Brush Script MT', 'Dancing Script', cursive" }} className="text-xl text-blue-900">
                  {displayDirectorSig}
                </span>
              </div>
            )
          ) : (
            <div className="h-10" />
          )}
        </div>

        <p className="font-black text-[10.5px] uppercase text-slate-900">{directorName}</p>
      </div>
    </div>
  );
};

