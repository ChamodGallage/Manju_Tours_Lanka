"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  Menu,
  ChevronDown,
  MapPin,
  Sparkles,
  ArrowRight,
  Train,
  Shield,
} from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import Button from "@/components/ui/Button";
import MobileNav from "./MobileNav";

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"destinations" | "experiences" | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const whatsappUrl = buildWhatsAppLink(
    "Hello Manju Tours Lanka! I am planning a trip to Sri Lanka and would like some travel advice."
  );

  // Close dropdown and mobile menu on route change
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FBF9F4]/95 backdrop-blur-md border-b border-[#E8E2D2] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20" ref={navRef}>
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-xs border border-[#E8E2D2] bg-white flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/images/logo.png"
                alt="Manju Tours Lanka Logo"
                width={56}
                height={56}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#17202A] leading-tight">
                MANJU TOURS <span className="text-[#0C5A70]">LANKA</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#0C5A70] tracking-wider uppercase">
                Your Trusted Travel Partner
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Strict 8 core items with Simple Mega Menus) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {/* 1. Tours */}
            <Link
              href="/tours"
              className="text-sm font-semibold text-[#17202A] hover:text-[#0C5A70] transition-colors py-2"
            >
              Tours
            </Link>

            {/* 2. Destinations (Mega Menu) */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("destinations")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "destinations" ? null : "destinations")}
                className={`text-sm font-semibold transition-colors py-2 flex items-center gap-1 ${
                  activeDropdown === "destinations" ? "text-[#0C5A70]" : "text-[#17202A] hover:text-[#0C5A70]"
                }`}
                aria-expanded={activeDropdown === "destinations"}
              >
                <span>Destinations</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === "destinations" ? "rotate-180" : ""
                }`} />
              </button>

              {/* Destinations Mega Menu Dropdown (3 Columns) */}
              {activeDropdown === "destinations" && (
                <div className="absolute top-full -left-20 w-[680px] bg-white rounded-3xl p-6 shadow-2xl border border-[#E8E2D2] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-3 gap-6">
                    {/* Col 1: Cultural Triangle */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0C5A70] uppercase tracking-wider mb-3 pb-1 border-b border-[#E8E2D2]">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Cultural Triangle</span>
                      </div>
                      <ul className="space-y-2 text-xs">
                        <li>
                          <Link href="/destinations/sigiriya" className="block p-1.5 rounded-lg hover:bg-[#FBF9F4] group/item">
                            <span className="font-bold text-[#17202A] group-hover/item:text-[#0C5A70] block">Sigiriya</span>
                            <span className="text-[11px] text-[#5B6770]">Ancient 5th-century sky citadel</span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/destinations/kandy" className="block p-1.5 rounded-lg hover:bg-[#FBF9F4] group/item">
                            <span className="font-bold text-[#17202A] group-hover/item:text-[#0C5A70] block">Kandy</span>
                            <span className="text-[11px] text-[#5B6770]">Sacred Temple of the Tooth Relic</span>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Col 2: Central Highlands */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#2B5829] uppercase tracking-wider mb-3 pb-1 border-b border-[#E8E2D2]">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Central Highlands</span>
                      </div>
                      <ul className="space-y-2 text-xs">
                        <li>
                          <Link href="/destinations/nuwara-eliya" className="block p-1.5 rounded-lg hover:bg-[#FBF9F4] group/item">
                            <span className="font-bold text-[#17202A] group-hover/item:text-[#2B5829] block">Nuwara Eliya</span>
                            <span className="text-[11px] text-[#5B6770]">Little England & tea estates</span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/destinations/ella" className="block p-1.5 rounded-lg hover:bg-[#FBF9F4] group/item">
                            <span className="font-bold text-[#17202A] group-hover/item:text-[#2B5829] block">Ella</span>
                            <span className="text-[11px] text-[#5B6770]">Nine Arch Bridge & peak hikes</span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/destinations/haputale" className="block p-1.5 rounded-lg hover:bg-[#FBF9F4] group/item">
                            <span className="font-bold text-[#17202A] group-hover/item:text-[#2B5829] block">Haputale</span>
                            <span className="text-[11px] text-[#5B6770]">Lipton&apos;s Seat panoramic ridge</span>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Col 3: Southern & Coast */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#E06D53] uppercase tracking-wider mb-3 pb-1 border-b border-[#E8E2D2]">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>South & Coast</span>
                      </div>
                      <ul className="space-y-2 text-xs">
                        <li>
                          <Link href="/destinations/hikkaduwa" className="block p-1.5 rounded-lg hover:bg-[#FBF9F4] group/item">
                            <span className="font-bold text-[#17202A] group-hover/item:text-[#E06D53] block">Hikkaduwa</span>
                            <span className="text-[11px] text-[#5B6770]">Home base, reefs & turtle bay</span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/destinations/galle-fort" className="block p-1.5 rounded-lg hover:bg-[#FBF9F4] group/item">
                            <span className="font-bold text-[#17202A] group-hover/item:text-[#E06D53] block">Galle Fort</span>
                            <span className="text-[11px] text-[#5B6770]">UNESCO 17th-century Dutch citadel</span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/destinations/mirissa" className="block p-1.5 rounded-lg hover:bg-[#FBF9F4] group/item">
                            <span className="font-bold text-[#17202A] group-hover/item:text-[#E06D53] block">Mirissa</span>
                            <span className="text-[11px] text-[#5B6770]">Blue whales & Coconut Tree Hill</span>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Mega Menu Footer */}
                  <div className="mt-4 pt-4 border-t border-[#E8E2D2] flex items-center justify-between text-xs">
                    <Link
                      href="/destinations"
                      className="font-bold text-[#0C5A70] hover:underline flex items-center gap-1"
                    >
                      <span>View All 10 Island Destinations</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <span className="text-[#5B6770]">All routes customized to your group</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Experiences (Mega Menu) */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("experiences")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "experiences" ? null : "experiences")}
                className={`text-sm font-semibold transition-colors py-2 flex items-center gap-1 ${
                  activeDropdown === "experiences" ? "text-[#0C5A70]" : "text-[#17202A] hover:text-[#0C5A70]"
                }`}
                aria-expanded={activeDropdown === "experiences"}
              >
                <span>Experiences</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  activeDropdown === "experiences" ? "rotate-180" : ""
                }`} />
              </button>

              {/* Experiences Mega Menu Dropdown (3 Columns) */}
              {activeDropdown === "experiences" && (
                <div className="absolute top-full -left-48 w-[680px] bg-white rounded-3xl p-6 shadow-2xl border border-[#E8E2D2] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-3 gap-6">
                    {/* Col 1: Wildlife & Ocean */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0C5A70] uppercase tracking-wider mb-3 pb-1 border-b border-[#E8E2D2]">
                        <Shield className="w-3.5 h-3.5" />
                        <span>Wildlife & Safaris</span>
                      </div>
                      <ul className="space-y-2 text-xs">
                        <li>
                          <Link href="/experiences/yala-leopard-jeep-safari" className="block p-1.5 rounded-lg hover:bg-[#FBF9F4] group/item">
                            <span className="font-bold text-[#17202A] group-hover/item:text-[#0C5A70] block">Yala Leopard Safari</span>
                            <span className="text-[11px] text-[#5B6770]">4x4 open-top dawn expedition</span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/experiences/mirissa-whale-watching" className="block p-1.5 rounded-lg hover:bg-[#FBF9F4] group/item">
                            <span className="font-bold text-[#17202A] group-hover/item:text-[#0C5A70] block">Blue Whale Watching</span>
                            <span className="text-[11px] text-[#5B6770]">Offshore Indian Ocean cruise</span>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Col 2: Heritage & Culture */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#E06D53] uppercase tracking-wider mb-3 pb-1 border-b border-[#E8E2D2]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Culture & Heritage</span>
                      </div>
                      <ul className="space-y-2 text-xs">
                        <li>
                          <Link href="/experiences/sigiriya-sunrise-climb" className="block p-1.5 rounded-lg hover:bg-[#FBF9F4] group/item">
                            <span className="font-bold text-[#17202A] group-hover/item:text-[#E06D53] block">Sigiriya Dawn Climb</span>
                            <span className="text-[11px] text-[#5B6770]">Sunrise over ancient boulder ruins</span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/experiences/galle-fort-heritage-walk" className="block p-1.5 rounded-lg hover:bg-[#FBF9F4] group/item">
                            <span className="font-bold text-[#17202A] group-hover/item:text-[#E06D53] block">Galle Fort Rampart Walk</span>
                            <span className="text-[11px] text-[#5B6770]">Dutch colonial history & lighthouse</span>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Col 3: Scenic & Culinary */}
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#2B5829] uppercase tracking-wider mb-3 pb-1 border-b border-[#E8E2D2]">
                        <Train className="w-3.5 h-3.5" />
                        <span>Scenic & Culinary</span>
                      </div>
                      <ul className="space-y-2 text-xs">
                        <li>
                          <Link href="/experiences/kandy-ella-scenic-train" className="block p-1.5 rounded-lg hover:bg-[#FBF9F4] group/item">
                            <span className="font-bold text-[#17202A] group-hover/item:text-[#2B5829] block">Scenic Mountain Train</span>
                            <span className="text-[11px] text-[#5B6770]">World-famous tea country rail</span>
                          </Link>
                        </li>
                        <li>
                          <Link href="/experiences/hikkaduwa-village-cooking-class" className="block p-1.5 rounded-lg hover:bg-[#FBF9F4] group/item">
                            <span className="font-bold text-[#17202A] group-hover/item:text-[#2B5829] block">Clay-Pot Cooking Class</span>
                            <span className="text-[11px] text-[#5B6770]">Authentic spices & village rice</span>
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Mega Menu Footer */}
                  <div className="mt-4 pt-4 border-t border-[#E8E2D2] flex items-center justify-between text-xs">
                    <Link
                      href="/experiences"
                      className="font-bold text-[#0C5A70] hover:underline flex items-center gap-1"
                    >
                      <span>View All Curated Experiences</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <span className="text-[#5B6770]">Privately hosted by licensed guides</span>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Island Stories (Blog / Guides) */}
            <Link
              href="/stories"
              className="text-sm font-semibold text-[#17202A] hover:text-[#0C5A70] transition-colors py-2"
            >
              Island Stories
            </Link>

            {/* 5. About Manju */}
            <Link
              href="/about"
              className="text-sm font-semibold text-[#17202A] hover:text-[#0C5A70] transition-colors py-2"
            >
              About Manju
            </Link>

            {/* 6. Contact */}
            <Link
              href="/contact"
              className="text-sm font-semibold text-[#17202A] hover:text-[#0C5A70] transition-colors py-2"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Right CTAs: 7. WhatsApp + 8. Plan My Trip */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold text-[#1E3F1D] bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/30 transition-all"
              aria-label="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366] fill-[#25D366]" />
              <span>WhatsApp Us</span>
            </a>

            <Button
              href="/custom-tour"
              variant="accent"
              size="md"
              className="shadow-sm font-bold tracking-wide"
            >
              Plan My Trip
            </Button>
          </div>

          {/* Mobile Right Controls: WhatsApp button + Hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-[#25D366] text-white hover:bg-[#1EBE5D] transition-colors shadow-xs"
              aria-label="WhatsApp Us"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
            </a>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl border border-[#E8E2D2] bg-white text-[#17202A] hover:bg-[#E8E2D2]/30 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        whatsappUrl={whatsappUrl}
        phone="+94 77 123 4567"
      />
    </header>
  );
};

export default Header;
