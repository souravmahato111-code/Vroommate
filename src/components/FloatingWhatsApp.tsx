import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { generateDirectWhatsAppInquiry } from '../utils/whatsapp';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 flex items-end flex-col gap-1.5 pointer-events-auto">
      {showTooltip && (
        <div className="relative bg-[#161c26]/95 backdrop-blur-md text-white border border-[#43f92f]/30 shadow-lg rounded-xl px-2.5 py-1.5 text-xs flex items-center gap-2 max-w-[210px] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="leading-tight">
            <span className="font-bold text-[#43f92f] text-[11px] block">Need a quick ride?</span>
            <span className="text-slate-300 text-[10px]">Chat on WhatsApp</span>
          </div>
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 hover:text-white p-0.5 shrink-0 rounded transition-colors"
            aria-label="Close message"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <a
        href={generateDirectWhatsAppInquiry()}
        target="_blank"
        rel="noopener noreferrer"
        className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#43f92f] text-[#0d1117] grid place-items-center shadow-lg shadow-[#43f92f]/30 hover:bg-[#5dfb4c] hover:scale-105 active:scale-95 transition-all duration-200 group relative"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-current transition-transform group-hover:rotate-6" />
        <span className="absolute 0 top-0.5 right-0.5 w-2.5 h-2.5 bg-[#ff7a1a] rounded-full border border-[#0d1117] animate-ping" />
        <span className="absolute 0 top-0.5 right-0.5 w-2.5 h-2.5 bg-[#ff7a1a] rounded-full border border-[#0d1117]" />
      </a>
    </div>
  );
};
