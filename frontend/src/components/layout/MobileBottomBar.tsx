"use client";

import React from "react";
import Link from "next/link";
import { Compass, MessageCircle, Sparkles } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { trackConversion } from "@/lib/analytics";

export const MobileBottomBar: React.FC = () => {
  const whatsappUrl = buildWhatsAppLink(
    "Hello Manju Tours Lanka! I am browsing your website from my mobile phone and would like to plan a tour."
  );

  const handleWhatsAppClick = () => {
    trackConversion({ name: "whatsapp_click", location: "mobile_bottom_bar" });
  };

  const handlePlanTripClick = () => {
    trackConversion({ name: "plan_trip_click", source: "mobile_bottom_bar" });
  };

  return (
    <aside
      aria-label="Quick Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FBF9F4]/98 backdrop-blur-lg border-t border-[#E8E2D2] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-3 py-2"
    >
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto items-center">
        {/* Tours */}
        <Link
          href="/tours"
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[#17202A] hover:bg-[#E8E2D2]/40 active:scale-95 transition-all text-center min-h-[52px]"
        >
          <Compass className="w-5 h-5 text-[#0C5A70] mb-0.5" />
          <span className="text-[11px] font-bold tracking-tight">Tours</span>
        </Link>

        {/* WhatsApp Deep Link */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleWhatsAppClick}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-[#25D366] text-white shadow-md active:scale-95 transition-all text-center min-h-[52px]"
          aria-label="Direct WhatsApp Enquiry"
        >
          <MessageCircle className="w-5 h-5 fill-white mb-0.5" />
          <span className="text-[11px] font-extrabold tracking-tight">WhatsApp</span>
        </a>

        {/* Plan Trip */}
        <Link
          href="/custom-tour"
          onClick={handlePlanTripClick}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-[#E06D53] text-white shadow-md active:scale-95 transition-all text-center min-h-[52px]"
          aria-label="Plan My Trip"
        >
          <Sparkles className="w-5 h-5 mb-0.5 text-[#FBF9F4]" />
          <span className="text-[11px] font-extrabold tracking-tight">Plan Trip</span>
        </Link>
      </div>
    </aside>
  );
};
export default MobileBottomBar;
