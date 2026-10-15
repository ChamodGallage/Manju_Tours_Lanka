"use client";

import React from "react";
import { MessageCircle, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { trackConversion } from "@/lib/analytics";
import type { PageSectionItem } from "@/types/database.types";

export const CtaBanner: React.FC<{ content?: PageSectionItem }> = ({ content }) => {
  const whatsappUrl = buildWhatsAppLink(
    "Hello Manju Tours Lanka! I'm ready to plan my trip to Sri Lanka. Can you help me?"
  );

  return (
    <section className="py-20 lg:py-24 bg-[#083B4A] text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#0C5A70] to-[#083B4A] opacity-90 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#E06D53]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-xs sm:text-sm font-bold text-[#FBF9F4] tracking-wide mb-6">
          <Sparkles className="w-4 h-4 text-[#E06D53]" />
          <span>{content?.badge || "Start With a Free, No-Obligation Conversation"}</span>
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
          {content?.title || "Ready to Experience the Magic of Sri Lanka?"}
        </h2>

        <p className="text-base sm:text-lg text-[#FBF9F4]/85 max-w-2xl mx-auto mb-10 leading-relaxed">
          {content?.subtitle || "Tell us when you are arriving, where you dream of going, and who you are traveling with. We will design your personalized itinerary within 24 hours."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            href="/custom-tour"
            variant="accent"
            size="lg"
            className="w-full sm:w-auto font-extrabold text-base shadow-xl"
            onClick={() => trackConversion({ name: "plan_trip_click", source: "bottom_cta_banner" })}
          >
            <Sparkles className="w-5 h-5 text-white" />
            <span>Plan My Custom Trip</span>
          </Button>

          <a
            href={content?.button_url || whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackConversion({ name: "whatsapp_click", location: "bottom_cta_banner" })}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full text-base font-bold text-[#17202A] bg-[#25D366] hover:bg-[#1EBE5D] hover:text-white shadow-xl transition-all active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>{content?.button_text || "Chat on WhatsApp Direct"}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
export default CtaBanner;
