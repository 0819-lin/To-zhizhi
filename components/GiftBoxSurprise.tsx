
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface GiftBoxSurpriseProps {
  onOpen: () => void;
}

const GiftBoxSurprise: React.FC<GiftBoxSurpriseProps> = ({ onOpen }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isFullyOpen, setIsFullyOpen] = useState(false);

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);
    
    // Step 1: Play shake and lid fly for 1 second
    // Step 2: Trigger the big flash/fade
    setTimeout(() => {
      setIsFullyOpen(true);
    }, 800);

    // Step 3: Tell parent to show the tree
    setTimeout(() => {
      onOpen();
    }, 1400);
  };

  return (
    <div className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#050508] transition-all duration-1000 ${isFullyOpen ? 'bg-white opacity-0 pointer-events-none' : 'opacity-100'}`}>
      
      {/* Golden Flash Overlay */}
      <div className={`absolute inset-0 z-[210] bg-white transition-opacity duration-500 pointer-events-none ${isFullyOpen ? 'opacity-100' : 'opacity-0'}`} />

      {/* Dynamic Background Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
              animationDelay: `${Math.random() * 5}s`,
              opacity: Math.random() * 0.5
            }}
          />
        ))}
      </div>

      <div 
        onClick={handleOpen}
        className={`relative cursor-pointer group transition-all duration-700 ${isOpening ? 'scale-110' : 'hover:scale-105 active:scale-95'}`}
      >
        {/* Glow Effect */}
        <div className={`absolute inset-[-60px] bg-red-600/20 blur-[80px] rounded-full animate-pulse transition-all duration-1000 ${isOpening ? 'bg-yellow-500/60 scale-150 blur-[120px]' : 'group-hover:bg-red-500/40'}`} />
        
        {/* Gift Box Container */}
        <div className={`relative w-48 h-48 transition-all duration-300 ${isOpening ? 'animate-shake' : 'group-hover:animate-bounce-subtle'}`}>
          
          {/* Box Lid */}
          <div className={`absolute top-0 left-0 w-full h-12 bg-[#d42426] rounded-t-lg z-20 shadow-xl border-b border-black/10 transition-all duration-700 cubic-bezier(0.175, 0.885, 0.32, 1.275) ${isOpening ? '-translate-y-48 -rotate-12 opacity-0' : ''}`}>
             {/* Ribbon Top */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full bg-[#ffd700] shadow-inner" />
             {/* Ribbon Bow */}
             <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex gap-1">
                <div className="w-10 h-10 border-4 border-[#ffd700] rounded-full -rotate-45" />
                <div className="w-10 h-10 border-4 border-[#ffd700] rounded-full rotate-45" />
             </div>
          </div>

          {/* Box Body */}
          <div className={`absolute top-10 left-1 w-full h-36 bg-[#b91c1c] rounded-b-lg z-10 shadow-2xl overflow-hidden transition-all duration-500 ${isOpening ? 'bg-red-500 scale-95' : ''}`}>
             {/* Ribbon Middle */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full bg-[#ffd700] shadow-md" />
             {/* Decorative Shadow */}
             <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
             
             {/* Sparkle eruption inside */}
             {isOpening && (
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-yellow-200 rounded-full shadow-[0_0_80px_40px_rgba(255,255,255,1)] animate-ping" />
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className={`mt-20 text-center transition-all duration-500 ${isOpening ? 'opacity-0 -translate-y-4' : 'opacity-100'}`}>
        <h2 className="text-white text-xl font-black tracking-[0.2em] mb-4 flex items-center justify-center gap-3">
          <Sparkles className="text-yellow-500 animate-spin-slow" size={20} />
          一份来自 2025 的惊喜
          <Sparkles className="text-yellow-500 animate-spin-slow" size={20} />
        </h2>
        <p className="text-gray-500 text-[10px] uppercase tracking-[0.5em] animate-pulse">点击礼物盒 开启魔法空间</p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-8px, -2px) rotate(-3deg); }
          50% { transform: translate(8px, 2px) rotate(3deg); }
          75% { transform: translate(-8px, 2px) rotate(-3deg); }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
        }
        .group-hover\\:animate-bounce-subtle {
          animation: bounce-subtle 2s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GiftBoxSurprise;
