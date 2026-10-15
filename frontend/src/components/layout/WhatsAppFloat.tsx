"use client";

import React, { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { trackConversion } from "@/lib/analytics";

export const WhatsAppFloat: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);
  const whatsappUrl = buildWhatsAppLink(
    "Hello Manju Tours Lanka! I'm planning my Sri Lanka trip and would love some help planning our route."
  );

  const handleClick = () => {
    trackConversion({ name: "whatsapp_click", location: "floating_widget" });
  };

  return (
    <div className="hidden md:flex fixed bottom-6 right-6 z-50 flex-col items-end gap-2">
      {/* Tooltip speech bubble */}
      {showTooltip && (
        <div className="relative bg-white text-[#17202A] px-4 py-2.5 rounded-2xl shadow-xl border border-[#E8E2D2] text-xs font-semibold flex items-center gap-2 animate-bounce-subtle">
          <span>Chat with Manju on WhatsApp!</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-[#5B6770] hover:text-black p-0.5"
            aria-label="Close tooltip"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-b border-r border-[#E8E2D2] transform rotate-45" />
        </div>
      )}

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
        aria-label="Direct chat with Manju Tours Lanka on WhatsApp"
      >
        <MessageCircle className="w-8 h-8 fill-white" />
      </a>
    </div>
  );
};
export default WhatsAppFloat;
