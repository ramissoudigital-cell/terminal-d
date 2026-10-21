import React from 'react';
import { RippleGrid } from './RippleGrid';

interface CreditCardProps {
  cardNumber?: string;
  cardHolder?: string;
  expiry?: string;
  cvv?: string;
  balance?: string;
  className?: string;
}

export const CreditCard: React.FC<CreditCardProps> = ({
  cardNumber = '•••• •••• •••• 4892',
  cardHolder = 'CELINE AFFOUE',
  expiry = '08/28',
  cvv = '382',
  balance = '$7,000.00',
  className = '',
}) => {
  return (
    <div
      className={`relative w-full max-w-sm h-56 rounded-3xl overflow-hidden shadow-2xl border border-white/20 p-6 flex flex-col justify-between text-white ${className}`}
    >
      {/* RippleGrid Background with #6bd4ff */}
      <div className="absolute inset-0 z-0 bg-[#0f172a] pointer-events-auto">
        <RippleGrid
          color="#6bd4ff"
          variant="lines"
          cellSize={48}
          lineWidth={1}
          glow={0.6}
          rippleStrength={1}
          rippleSpeed={1}
          rippleSize={1}
          autoRipple="center"
          rippleInterval={2.6}
          tilt={0}
          rotation={0}
          fade={0.5}
          opacity={1}
          mouseInteraction
          clickRipple
          intro
          lightMode={false}
          className="absolute inset-0 w-full h-full"
        />
      </div>

      {/* Card Content Overlay */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-8 rounded-md bg-gradient-to-tr from-amber-200 to-yellow-400 opacity-90 shadow-sm border border-white/30 flex items-center justify-center">
            <div className="w-6 h-4 border border-black/20 rounded-xs flex flex-col justify-between p-0.5">
              <div className="w-full h-[1px] bg-black/20"></div>
              <div className="w-full h-[1px] bg-black/20"></div>
            </div>
          </div>
          <span className="font-bold tracking-wider text-sm">taskup</span>
        </div>
        <span className="text-xs font-mono tracking-widest text-[#6bd4ff]">DEBIT</span>
      </div>

      <div className="relative z-10 my-auto">
        <div className="text-[20px] sm:text-2xl font-mono tracking-widest font-semibold drop-shadow-md">
          {cardNumber}
        </div>
      </div>

      <div className="relative z-10 flex items-end justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-300 opacity-80">
            Titulaire
          </div>
          <div className="text-sm font-bold tracking-wide uppercase">
            {cardHolder}
          </div>
        </div>
        <div className="flex gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-300 opacity-80">
              Expire
            </div>
            <div className="text-xs font-mono font-semibold">{expiry}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-zinc-300 opacity-80">
              CVV
            </div>
            <div className="text-xs font-mono font-semibold">{cvv}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCard;
