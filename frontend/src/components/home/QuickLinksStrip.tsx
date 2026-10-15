"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Sparkles,
  Calendar,
  MessageCircle,
  Plane,
  Car,
  HelpCircle,
} from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import TravelEssentialsModal, { EssentialTab } from "@/components/ui/TravelEssentialsModal";

export const QuickLinksStrip: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<EssentialTab>("visa");

  const whatsappUrl = buildWhatsAppLink(
    "Hello Manju Tours Lanka! I'd like some quick advice on planning my Sri Lanka holiday."
  );

  const openModal = (tab: EssentialTab) => {
    setModalTab(tab);
    setModalOpen(true);
  };

  const quickLinks = [
    {
      label: "Things to Do",
      href: "/experiences",
      icon: Sparkles,
      type: "link" as const,
      color: "hover:border-[#E06D53] hover:text-[#E06D53]",
    },
    {
      label: "Find a Tour",
      href: "/tours",
      icon: Compass,
      type: "link" as const,
      color: "hover:border-[#0C5A70] hover:text-[#0C5A70]",
    },
    {
      label: "Plan My Trip",
      href: "/custom-tour",
      icon: Calendar,
      type: "link" as const,
      color: "bg-[#E06D53] text-white border-[#E06D53] hover:bg-[#C8573D]",
      highlight: true,
    },
    {
      label: "WhatsApp",
      href: whatsappUrl,
      icon: MessageCircle,
      type: "external" as const,
      color: "bg-[#25D366]/15 text-[#1E3F1D] border-[#25D366]/40 hover:bg-[#25D366]/25",
    },
    {
      label: "Visa Info",
      action: () => openModal("visa"),
      icon: Plane,
      type: "button" as const,
      color: "hover:border-[#0C5A70] hover:text-[#0C5A70]",
    },
    {
      label: "Getting Around",
      action: () => openModal("transit"),
      icon: Car,
      type: "button" as const,
      color: "hover:border-[#2B5829] hover:text-[#2B5829]",
    },
    {
      label: "Travel Tips",
      action: () => openModal("tips"),
      icon: HelpCircle,
      type: "button" as const,
      color: "hover:border-[#0C5A70] hover:text-[#0C5A70]",
    },
  ];

  return (
    <>
      <div className="relative -mt-6 sm:-mt-8 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-xl border border-[#E8E2D2] backdrop-blur-md">
          <div className="flex items-center justify-between mb-2 sm:mb-2.5 px-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#0C5A70] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E06D53] animate-pulse" />
              <span>Plan Your Dream Holiday • Quick Navigator</span>
            </span>
            <span className="hidden sm:inline text-[11px] text-[#5B6770] font-medium">
              Free custom itineraries in 24 hours
            </span>
          </div>

          {/* Quick links scrollable row */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-none no-scrollbar">
            {quickLinks.map((item, index) => {
              const Icon = item.icon;

              if (item.type === "link" && item.href) {
                return (
                  <Link
                    key={index}
                    href={item.href}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border border-[#E8E2D2] transition-all whitespace-nowrap shrink-0 shadow-xs ${
                      item.highlight
                        ? item.color
                        : `bg-[#FBF9F4] text-[#17202A] ${item.color}`
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              }

              if (item.type === "external" && item.href) {
                return (
                  <a
                    key={index}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all whitespace-nowrap shrink-0 shadow-xs ${item.color}`}
                  >
                    <Icon className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366] shrink-0" />
                    <span>{item.label}</span>
                  </a>
                );
              }

              return (
                <button
                  key={index}
                  onClick={item.action}
                  type="button"
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold bg-[#FBF9F4] text-[#17202A] border border-[#E8E2D2] transition-all whitespace-nowrap shrink-0 shadow-xs ${item.color}`}
                >
                  <Icon className="w-3.5 h-3.5 text-[#0C5A70] shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <TravelEssentialsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab={modalTab}
      />
    </>
  );
};

export default QuickLinksStrip;
