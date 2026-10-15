"use client";

import React, { useState } from "react";
import { MessageCircle, ShieldCheck, Sparkles, Send } from "lucide-react";
import { buildTourWhatsAppLink } from "@/lib/whatsapp";
import TourEnquiryForm from "@/components/forms/TourEnquiryForm";

interface TourEnquirySidebarProps {
  tourId: string;
  tourTitle: string;
  durationDays: number;
  durationNights: number;
  travelStyle: string;
  startingPrice?: string | null;
}

export const TourEnquirySidebar: React.FC<TourEnquirySidebarProps> = ({
  tourId,
  tourTitle,
  durationDays,
  durationNights,
  travelStyle,
  startingPrice,
}) => {
  const [showForm, setShowForm] = useState(false);
  const whatsappUrl = buildTourWhatsAppLink(tourTitle, durationDays);

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D2] shadow-xl sticky top-24 space-y-6">
      {/* Pricing and quick specs */}
      <div>
        <div className="flex items-center justify-between text-xs text-[#5B6770] mb-1">
          <span>Starting Price:</span>
          <span className="font-bold text-[#0C5A70] bg-[#0C5A70]/10 px-2 py-0.5 rounded-full">
            {startingPrice || "Request a Quote"}
          </span>
        </div>
        <p className="text-[11px] text-[#5B6770] italic">
          *Customized to your season, group size, and hotel category.
        </p>
      </div>

      <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2] space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-[#5B6770]">Duration:</span>
          <span className="font-bold text-[#17202A]">{durationDays} Days / {durationNights} Nights</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#5B6770]">Travel Style:</span>
          <span className="font-bold text-[#17202A]">{travelStyle}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#5B6770]">Vehicle:</span>
          <span className="font-bold text-[#17202A]">Private AC Car / Van</span>
        </div>
      </div>

      {/* Primary WhatsApp Deep Link CTA */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-full text-sm font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] shadow-md transition-all active:scale-98"
      >
        <MessageCircle className="w-5 h-5 fill-white" />
        <span>Ask Questions on WhatsApp</span>
      </a>

      {/* Toggle Custom Enquiry Form */}
      <div>
        {!showForm ? (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full py-3.5 px-4 rounded-full text-xs font-bold text-[#0C5A70] border-2 border-[#0C5A70] hover:bg-[#0C5A70] hover:text-white transition-all text-center flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Customize This Tour Itinerary</span>
          </button>
        ) : (
          <div className="pt-2">
            <h4 className="text-xs font-bold text-[#0C5A70] uppercase tracking-wider mb-3">
              Request Your Custom Quote
            </h4>
            <TourEnquiryForm
              tourId={tourId}
              tourTitle={tourTitle}
              defaultStyle={travelStyle}
              onSuccess={() => setShowForm(false)}
            />
          </div>
        )}
      </div>

      {/* Trust Badges */}
      <div className="pt-4 border-t border-[#E8E2D2]/60 space-y-2 text-[11px] text-[#5B6770]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2B5829] shrink-0" />
          <span>Zero Booking Fees • Pay Upon Arrival Option</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#E06D53] shrink-0" />
          <span>Free Itinerary Adjustments & Hotel Swaps</span>
        </div>
      </div>
    </div>
  );
};
export default TourEnquirySidebar;
