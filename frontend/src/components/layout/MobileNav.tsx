"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  X,
  MessageCircle,
  Phone,
  MapPin,
  Compass,
  Sparkles,
  Calendar,
  ChevronDown,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import Button from "@/components/ui/Button";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappUrl: string;
  phone: string;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  whatsappUrl,
  phone,
}) => {
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const [experiencesOpen, setExperiencesOpen] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-[#FBF9F4] h-full shadow-2xl flex flex-col justify-between p-6 z-10 overflow-y-auto border-l border-[#E8E2D2]">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[#E8E2D2]">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#E8E2D2] bg-white p-0.5 shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="Manju Tours Lanka"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-base text-[#17202A] block leading-tight">
                  MANJU TOURS
                </span>
                <span className="text-[11px] text-[#0C5A70] font-semibold">
                  Hikkaduwa, Sri Lanka
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-[#E8E2D2]/50 text-[#17202A] transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="mt-6 flex flex-col gap-1.5">
            {/* 1. Tours */}
            <Link
              href="/tours"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#17202A] hover:bg-[#E8E2D2]/60 transition-colors"
            >
              <Compass className="w-4 h-4 text-[#0C5A70]" />
              <span>Tours & Itineraries</span>
            </Link>

            {/* 2. Destinations Accordion */}
            <div className="rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 hover:bg-[#E8E2D2]/40 rounded-xl transition-colors">
                <Link
                  href="/destinations"
                  onClick={onClose}
                  className="flex items-center gap-3 text-sm font-bold text-[#17202A]"
                >
                  <MapPin className="w-4 h-4 text-[#0C5A70]" />
                  <span>Destinations</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setDestinationsOpen(!destinationsOpen)}
                  className="p-1 text-[#5B6770]"
                  aria-label="Toggle destinations list"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${destinationsOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              {destinationsOpen && (
                <div className="pl-11 pr-4 py-2 space-y-1.5 text-xs bg-white/70 rounded-xl mb-1 border border-[#E8E2D2]/60">
                  <Link href="/destinations/sigiriya" onClick={onClose} className="block py-1 text-[#17202A] hover:text-[#0C5A70]">Sigiriya Citadel</Link>
                  <Link href="/destinations/kandy" onClick={onClose} className="block py-1 text-[#17202A] hover:text-[#0C5A70]">Kandy Temple</Link>
                  <Link href="/destinations/nuwara-eliya" onClick={onClose} className="block py-1 text-[#17202A] hover:text-[#0C5A70]">Nuwara Eliya Tea</Link>
                  <Link href="/destinations/ella" onClick={onClose} className="block py-1 text-[#17202A] hover:text-[#0C5A70]">Ella & Nine Arch</Link>
                  <Link href="/destinations/hikkaduwa" onClick={onClose} className="block py-1 text-[#17202A] hover:text-[#0C5A70]">Hikkaduwa Coast</Link>
                  <Link href="/destinations/galle-fort" onClick={onClose} className="block py-1 text-[#17202A] hover:text-[#0C5A70]">Galle Dutch Fort</Link>
                  <Link href="/destinations" onClick={onClose} className="block py-1 font-bold text-[#0C5A70]">All Destinations →</Link>
                </div>
              )}
            </div>

            {/* 3. Experiences Accordion */}
            <div className="rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 hover:bg-[#E8E2D2]/40 rounded-xl transition-colors">
                <Link
                  href="/experiences"
                  onClick={onClose}
                  className="flex items-center gap-3 text-sm font-bold text-[#17202A]"
                >
                  <Sparkles className="w-4 h-4 text-[#0C5A70]" />
                  <span>Curated Experiences</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setExperiencesOpen(!experiencesOpen)}
                  className="p-1 text-[#5B6770]"
                  aria-label="Toggle experiences list"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${experiencesOpen ? "rotate-180" : ""}`} />
                </button>
              </div>

              {experiencesOpen && (
                <div className="pl-11 pr-4 py-2 space-y-1.5 text-xs bg-white/70 rounded-xl mb-1 border border-[#E8E2D2]/60">
                  <Link href="/experiences/yala-leopard-jeep-safari" onClick={onClose} className="block py-1 text-[#17202A] hover:text-[#0C5A70]">Yala Leopard Safari</Link>
                  <Link href="/experiences/kandy-ella-scenic-train" onClick={onClose} className="block py-1 text-[#17202A] hover:text-[#0C5A70]">Scenic Mountain Train</Link>
                  <Link href="/experiences/mirissa-whale-watching" onClick={onClose} className="block py-1 text-[#17202A] hover:text-[#0C5A70]">Blue Whale Cruise</Link>
                  <Link href="/experiences/hikkaduwa-village-cooking-class" onClick={onClose} className="block py-1 text-[#17202A] hover:text-[#0C5A70]">Clay-Pot Cooking Class</Link>
                  <Link href="/experiences" onClick={onClose} className="block py-1 font-bold text-[#0C5A70]">All Experiences →</Link>
                </div>
              )}
            </div>

            {/* 4. Plan My Trip (Highlighted) */}
            <Link
              href="/custom-tour"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-[#E06D53]/15 text-[#C8573D] border border-[#E06D53]/30"
            >
              <Calendar className="w-4 h-4 text-[#E06D53]" />
              <span>Plan My Custom Trip</span>
            </Link>

            {/* 5. Island Stories */}
            <Link
              href="/stories"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#17202A] hover:bg-[#E8E2D2]/60 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-[#0C5A70]" />
              <span>Island Stories & Guides</span>
            </Link>

            {/* 6. About Manju */}
            <Link
              href="/about"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#17202A] hover:bg-[#E8E2D2]/60 transition-colors"
            >
              <span>About Manju & Fleet</span>
            </Link>

            {/* 7. Contact */}
            <Link
              href="/contact"
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-[#17202A] hover:bg-[#E8E2D2]/60 transition-colors"
            >
              <span>Contact & Office</span>
            </Link>
          </nav>
        </div>

        {/* Action CTAs */}
        <div className="pt-6 border-t border-[#E8E2D2] flex flex-col gap-3">
          <Button
            href="/custom-tour"
            variant="accent"
            size="md"
            className="w-full justify-center text-sm font-bold"
            onClick={onClose}
          >
            <span>Plan My Custom Trip</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-full text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] transition-all shadow-md"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat on WhatsApp Direct</span>
          </a>

          <div className="flex items-center justify-center gap-2 text-xs text-[#5B6770] pt-1">
            <Phone className="w-3.5 h-3.5 text-[#0C5A70]" />
            <span>Call: {phone}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
