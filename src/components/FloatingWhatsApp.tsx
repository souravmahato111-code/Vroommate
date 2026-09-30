import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { generateDirectWhatsAppInquiry } from '../utils/whatsapp';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-end flex-col gap-2">
      {showTooltip && (
        <div className="relative bg-[#161c26] text-white border border-[#2ea043]/40 shadow-xl rounded-2xl px-4 py-2.5 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div>
            <span className="font-bold text-[#2ea043] block">Need a quick ride?</span>
            <span className="text-slate-300 text-[11px]">Chat on WhatsApp for instant booking</span>
          </div>
          <button
            type="button"
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 hover:text-white p-0.5"
            aria-label="Close message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <a
        href={generateDirectWhatsAppInquiry()}
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 rounded-full bg-[#2ea043] text-[#0d1117] grid place-items-center shadow-2xl shadow-[#2ea043]/40 hover:bg-[#3fb950] hover:scale-110 active:scale-95 transition-all duration-200 group"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-current transition-transform group-hover:rotate-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff7a1a] rounded-full border-2 border-[#0d1117] animate-ping" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff7a1a] rounded-full border-2 border-[#0d1117]" />
      </a>
    </div>
  );
};
