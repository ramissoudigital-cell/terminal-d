import React, { useState } from 'react';
import { ArrowLeft, Bookmark, MoreHorizontal, Check, Heart, MessageCircle, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function NewsDetailsView({ 
  onClose,
  imageUrl,
  publisherName,
  publisherAvatar,
  title,
  category
}: { 
  onClose: () => void;
  imageUrl?: string;
  publisherName?: string;
  publisherAvatar?: string;
  title?: string;
  category?: string;
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(128);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="absolute inset-0 w-full h-full flex flex-col bg-white overflow-hidden pointer-events-auto z-[100]"
    >
       {/* Background Image Area */}
       <div className="h-[52%] w-full relative shrink-0">
          <img src={imageUrl || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop"} className="w-full h-full object-cover" alt="Article background" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30"></div>
          
          {/* Header Actions */}
          <div className="absolute top-[48px] left-0 right-0 px-6 flex justify-between items-center z-10">
             <button onClick={onClose} className="w-[42px] h-[42px] rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/50 transition-colors cursor-pointer">
                <ArrowLeft size={20} className="text-white" />
             </button>
             <div className="flex gap-3">
                <button className="w-[42px] h-[42px] rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/50 transition-colors cursor-pointer">
                   <Bookmark size={20} className="text-white" />
                </button>
                <button className="w-[42px] h-[42px] rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/10 hover:bg-black/50 transition-colors cursor-pointer">
                   <MoreHorizontal size={20} className="text-white" />
                </button>
             </div>
          </div>

          {/* Title Area inside Image */}
          <div className="absolute bottom-[40px] left-6 right-6">
             <div className="bg-[#007AFF] text-white text-[13px] font-bold px-4 py-1.5 rounded-full inline-block mb-3 shadow-sm">
                {category || "Publication"}
             </div>
             <h1 className="text-[26px] font-bold text-white leading-[1.2] tracking-tight mb-2">
                {title || "Kylian Mbappé scores stunning hat-trick in Champions League clash"}
             </h1>
             <div className="flex items-center text-white/80 text-[13px] font-medium pt-1">
                <span className="text-white font-semibold">Tendance</span>
                <span className="mx-2">•</span>
                <span>Il y a 2 heures</span>
             </div>
          </div>
       </div>

       {/* Article Body (Overlaps the image) */}
       <div className="flex-1 bg-white rounded-t-[32px] -mt-[24px] relative z-20 px-6 pt-8 overflow-y-auto hide-scrollbar pb-10 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
          {/* Publisher */}
          <div className="flex items-center gap-3 mb-6">
             <div className="w-[40px] h-[40px] rounded-full bg-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                {publisherAvatar ? (
                  <img src={publisherAvatar} className="w-full h-full object-cover" alt="avatar" />
                ) : (
                  <span className="text-[#E51C24] font-extrabold text-[12px] tracking-tighter">SKY</span>
                )}
             </div>
             <span className="text-[17px] font-semibold text-[#1A1A1A]">{publisherName || "Sky Sports"}</span>
             <div className="flex items-center justify-center w-[16px] h-[16px] bg-[#007AFF] rounded-full -ml-1">
                <Check size={10} className="text-white" strokeWidth={3} />
             </div>
          </div>

          {/* Article Text */}
          <div className="text-[16px] text-[#1A1A1A] leading-[1.6] font-medium mb-8">
             <p className="mb-5">
                En tant que service des sports, nous sommes généralement assez doués pour repérer des ajustements tactiques qui sortent de l'ordinaire. Lors des matchs à fort enjeu, nous avons l'habitude de voir de subtils changements de formation, et bien qu'il y ait certainement des astuces tactiques utilisées dans les phases à élimination directe, elles sont plus difficiles à repérer.
             </p>
             <p className="text-gray-500 font-normal">
                À titre d'exemple, tout au long de la seconde mi-temps contre Madrid, l'attaquant vedette a exploité les demi-espaces avec une liberté sans précédent, détruisant complètement la ligne défensive adverse par des échanges rapides et une vitesse pure...
             </p>
          </div>

          <hr className="border-gray-100 mb-6" />

          {/* Action Buttons */}
          <div className="flex items-center justify-between px-2">
             <div className="flex gap-6">
                <button 
                  onClick={handleLike}
                  className="flex items-center gap-2 text-gray-500 hover:text-[#FF3B30] transition-colors group"
                >
                   <Heart 
                     size={24} 
                     className={`transition-colors ${isLiked ? 'fill-[#FF3B30] text-[#FF3B30]' : 'group-hover:text-[#FF3B30]'}`} 
                   />
                   <span className={`font-semibold ${isLiked ? 'text-[#FF3B30]' : ''}`}>{likeCount}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-500 hover:text-[#007AFF] transition-colors">
                   <MessageCircle size={24} />
                   <span className="font-semibold">45</span>
                </button>
             </div>
             <button className="flex items-center gap-2 text-gray-500 hover:text-[#1A1A1A] transition-colors">
                <Share2 size={24} />
             </button>
          </div>
       </div>
    </motion.div>
  );
}
