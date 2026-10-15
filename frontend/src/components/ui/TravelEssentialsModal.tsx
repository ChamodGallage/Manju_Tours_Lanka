"use client";

import React, { useState } from "react";
import { X, Plane, ShieldCheck, HelpCircle, PhoneCall, ExternalLink, MessageCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export type EssentialTab = "visa" | "transit" | "tips" | "hotlines";

interface TravelEssentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: EssentialTab;
}

export const TravelEssentialsModal: React.FC<TravelEssentialsModalProps> = ({
  isOpen,
  onClose,
  initialTab = "visa",
}) => {
  const [activeTab, setActiveTab] = useState<EssentialTab>(initialTab);
  const whatsappUrl = buildWhatsAppLink("Hello Manju Tours! I have a question regarding Sri Lanka travel essentials, visa, and route planning.");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#FBF9F4] rounded-3xl shadow-2xl border border-[#E8E2D2] overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-[#0C5A70] text-white flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#FBF9F4]/80 font-bold block">
              Essential Traveler Intelligence
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Sri Lanka Travel Essentials & FAQs
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E8E2D2] bg-white px-6 shrink-0 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab("visa")}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "visa"
                ? "border-[#E06D53] text-[#E06D53]"
                : "border-transparent text-[#5B6770] hover:text-[#17202A]"
            }`}
          >
            <Plane className="w-4 h-4" />
            <span>Visa & Entry</span>
          </button>
          <button
            onClick={() => setActiveTab("transit")}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "transit"
                ? "border-[#0C5A70] text-[#0C5A70]"
                : "border-transparent text-[#5B6770] hover:text-[#17202A]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Getting Around</span>
          </button>
          <button
            onClick={() => setActiveTab("tips")}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "tips"
                ? "border-[#2B5829] text-[#2B5829]"
                : "border-transparent text-[#5B6770] hover:text-[#17202A]"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Money & Etiquette</span>
          </button>
          <button
            onClick={() => setActiveTab("hotlines")}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "hotlines"
                ? "border-[#C8573D] text-[#C8573D]"
                : "border-transparent text-[#5B6770] hover:text-[#17202A]"
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Hotlines & Safety</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed text-[#17202A]">
          {activeTab === "visa" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-[#E8E2D2]">
                <h3 className="font-extrabold text-[#0C5A70] text-sm mb-1">
                  Electronic Travel Authorization (ETA)
                </h3>
                <p className="text-[#5B6770] leading-relaxed">
                  Most international visitors traveling to Sri Lanka for tourism require an approved Electronic Travel Authorization (ETA) prior to arrival. The standard tourist visa is valid for 30 days and can be applied for online.
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#0C5A70]">
                  <span>Official Portal: www.eta.gov.lk</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-[#E8E2D2]">
                  <h4 className="font-bold text-[#17202A] mb-1">Passport Validity</h4>
                  <p className="text-[#5B6770] text-xs">
                    Your passport must have at least <strong>6 months of remaining validity</strong> from your planned date of entry into Sri Lanka.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#E8E2D2]">
                  <h4 className="font-bold text-[#17202A] mb-1">Arrival Port</h4>
                  <p className="text-[#5B6770] text-xs">
                    Main gateway is <strong>Bandaranaike International Airport (CMB)</strong> in Katunayake, 30 km north of Colombo. Your Manju Tours driver meets you directly in the arrival hall.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "transit" && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-[#E8E2D2]">
                <h3 className="font-extrabold text-[#0C5A70] text-sm mb-1">
                  Why Chauffeur-Driven Is the Recommended Choice
                </h3>
                <p className="text-[#5B6770] leading-relaxed">
                  While Sri Lanka boasts modern four-lane expressways connecting Colombo to Galle and the airport, the mountain interior (Kandy, Nuwara Eliya, Ella) features narrow switchbacks, blind curves, and village buses.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-2xl border border-[#E8E2D2]">
                  <h4 className="font-bold text-[#0C5A70] mb-1">Private AC Sedans</h4>
                  <p className="text-[#5B6770]">Perfect for couples (1-2 guests). Effortless mountain navigation and luggage boot.</p>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-[#E8E2D2]">
                  <h4 className="font-bold text-[#2B5829] mb-1">High-Roof Vans</h4>
                  <p className="text-[#5B6770]">For families (3-6 guests). High seating, wide panoramic windows, dual AC blowers.</p>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-[#E8E2D2]">
                  <h4 className="font-bold text-[#E06D53] mb-1">4x4 Safari Jeeps</h4>
                  <p className="text-[#5B6770]">Elevated suspension open cruisers for Yala & Minneriya national parks.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tips" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-[#E8E2D2]">
                  <h4 className="font-bold text-[#17202A] mb-1">Currency & ATMs</h4>
                  <p className="text-[#5B6770] text-xs leading-relaxed">
                    Sri Lankan Rupee (LKR). Major hotels and restaurants accept Visa/Mastercard. Keep 100 and 500 LKR notes for roadside fresh king coconuts, tips, and village fruits.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#E8E2D2]">
                  <h4 className="font-bold text-[#17202A] mb-1">Temple Dress Code</h4>
                  <p className="text-[#5B6770] text-xs leading-relaxed">
                    When entering sacred Buddhist and Hindu temples (e.g. Temple of the Tooth), shoulders and knees must be covered. Shoes and hats are removed at the entrance.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#E8E2D2]">
                  <h4 className="font-bold text-[#17202A] mb-1">Power Plugs</h4>
                  <p className="text-[#5B6770] text-xs leading-relaxed">
                    Type D and Type G (standard UK 3-pin plugs). Voltage is 230V at 50Hz. All our private vehicles carry multi-port USB fast chargers.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-[#E8E2D2]">
                  <h4 className="font-bold text-[#17202A] mb-1">Hydration & Sun</h4>
                  <p className="text-[#5B6770] text-xs leading-relaxed">
                    We provide complimentary bottled mineral water throughout your transfers. Wear reef-safe sunscreen and a light sunhat for coastal ruins.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "hotlines" && (
            <div className="space-y-3">
              <div className="bg-[#0C5A70]/10 p-4 rounded-2xl border border-[#0C5A70]/20">
                <h4 className="font-extrabold text-[#0C5A70] text-sm mb-1">
                  Sri Lanka Official Tourism Police (24/7)
                </h4>
                <p className="text-xs text-[#5B6770]">
                  Dedicated emergency assistance and consumer protection for international travelers across all provinces:
                </p>
                <div className="mt-2 text-base font-extrabold text-[#0C5A70]">
                  Dial: 1912 (Toll-Free Islandwide)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-2xl border border-[#E8E2D2]">
                  <span className="font-bold text-[#17202A] block">1990 — Suwa Seriya Ambulance</span>
                  <span className="text-[#5B6770]">Free national emergency medical dispatch service</span>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-[#E8E2D2]">
                  <span className="font-bold text-[#17202A] block">119 — Sri Lanka Police Emergency</span>
                  <span className="text-[#5B6770]">Immediate islandwide police response</span>
                </div>
              </div>

              <div className="bg-[#25D366]/15 p-4 rounded-2xl border border-[#25D366]/30 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#1E3F1D] text-xs block">
                    Manju Tours Lanka 24/7 Guest Care:
                  </span>
                  <span className="font-extrabold text-sm text-[#1E3F1D]">
                    +94 77 123 4567
                  </span>
                </div>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-full bg-[#25D366] text-white font-bold text-xs flex items-center gap-1 hover:bg-[#1EBE5D] transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-[#E8E2D2] flex items-center justify-between shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] transition-all shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span>Ask Us On WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TravelEssentialsModal;
