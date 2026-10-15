import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Heart,
  Plane,
  Sun,
  Coins,
  ShieldAlert,
} from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { getSiteSettings } from "@/lib/queries/site-settings";

export async function Footer() {
  const settings = await getSiteSettings();
  const companyName = settings.company_name || process.env.NEXT_PUBLIC_COMPANY_NAME || "MANJU TOURS LANKA";
  const tagline = settings.tagline || process.env.NEXT_PUBLIC_COMPANY_TAGLINE || "Your Personal Sri Lanka Travel Planner";
  const address = settings.address || process.env.NEXT_PUBLIC_COMPANY_LOCATION || "Galle Road, Hikkaduwa, Southern Province, Sri Lanka";
  const phone = settings.phone || process.env.NEXT_PUBLIC_CONTACT_PHONE || "+94771234567";
  const email = settings.email || process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@manjutourslanka.com";
  const rawWhatsApp = (settings.whatsapp || phone).replace(/[^0-9]/g, "");
  const whatsappUrl = rawWhatsApp
    ? `https://wa.me/${rawWhatsApp}?text=${encodeURIComponent(
        settings.whatsapp_welcome_message || "Hello Manju Tours Lanka! I am visiting your website and have an enquiry."
      )}`
    : buildWhatsAppLink("Hello Manju Tours Lanka! I am visiting your website and have an enquiry.");

  return (
    <footer className="bg-[#083B4A] text-white pt-16 pb-24 md:pb-16 border-t border-[#0C5A70]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Emergency & Tourism Hotlines Ribbon */}
        <div className="bg-[#0C5A70]/60 rounded-3xl p-5 mb-14 border border-[#0C5A70] backdrop-blur-xs">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#E06D53]/20 text-[#E06D53] flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-[#E06D53]" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#E8E2D2]/80 block">
                  Official Island Hotlines & Emergency Care
                </span>
                <span className="text-sm font-extrabold text-white">
                  24/7 Visitor Safety & Police Assistance
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto text-xs">
              <div className="bg-[#083B4A]/80 p-2.5 rounded-xl border border-white/10">
                <span className="text-[10px] text-[#E8E2D2]/70 block font-semibold">Tourism Police (24/7)</span>
                <span className="font-extrabold text-sm text-[#25D366]">1912</span>
              </div>
              <div className="bg-[#083B4A]/80 p-2.5 rounded-xl border border-white/10">
                <span className="text-[10px] text-[#E8E2D2]/70 block font-semibold">Ambulance (Suwa Seriya)</span>
                <span className="font-extrabold text-sm text-white">1990</span>
              </div>
              <div className="bg-[#083B4A]/80 p-2.5 rounded-xl border border-white/10">
                <span className="text-[10px] text-[#E8E2D2]/70 block font-semibold">Police Emergency</span>
                <span className="font-extrabold text-sm text-white">119</span>
              </div>
              <div className="bg-[#083B4A]/80 p-2.5 rounded-xl border border-white/10">
                <span className="text-[10px] text-[#E8E2D2]/70 block font-semibold">Manju 24/7 Chauffeur</span>
                <span className="font-extrabold text-sm text-[#25D366]">{phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#0C5A70]/60">
          {/* Col 1: Brand & Positioning */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-white p-1 shadow-md shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="Manju Tours Lanka"
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white block">
                  {companyName}
                </span>
                <span className="text-xs text-[#E8E2D2]/80 font-medium tracking-wide">
                  {tagline}
                </span>
              </div>
            </div>

            <p className="text-sm text-[#E8E2D2]/85 leading-relaxed pr-4">
              We are a licensed local travel company based in Hikkaduwa. We craft bespoke chauffeured itineraries across ancient rock citadels, high-altitude tea trails, wild leopard safaris, and golden surf beaches.
            </p>

            <div className="flex items-center gap-2 pt-2 text-xs text-[#E8E2D2]/75">
              <ShieldCheck className="w-4 h-4 text-[#25D366]" />
              <span>Registered & Licensed Sri Lanka Tourist Chauffeur-Guide Service</span>
            </div>

            {/* Travel Essentials Quick Badges */}
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E06D53] block mb-2">
                Travel Essentials Snapshot:
              </span>
              <div className="space-y-1.5 text-xs text-[#E8E2D2]/80">
                <div className="flex items-center gap-2">
                  <Plane className="w-3.5 h-3.5 text-[#E06D53]" />
                  <span><strong>Visa:</strong> 30-day ETA required online prior to arrival</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-[#E06D53]" />
                  <span><strong>Best Months:</strong> Dec–Apr (Coast/Hills), May–Sep (East)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Coins className="w-3.5 h-3.5 text-[#E06D53]" />
                  <span><strong>Currency:</strong> Sri Lankan Rupee (LKR)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Top Destinations */}
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-[#E06D53] mb-4">
              Destinations
            </h3>
            <ul className="space-y-2.5 text-sm text-[#E8E2D2]/80">
              <li>
                <Link href="/destinations/sigiriya" className="hover:text-white transition-colors">
                  Sigiriya & Minneriya
                </Link>
              </li>
              <li>
                <Link href="/destinations/kandy" className="hover:text-white transition-colors">
                  Kandy Cultural Capital
                </Link>
              </li>
              <li>
                <Link href="/destinations/nuwara-eliya" className="hover:text-white transition-colors">
                  Nuwara Eliya Tea Valleys
                </Link>
              </li>
              <li>
                <Link href="/destinations/haputale" className="hover:text-white transition-colors">
                  Haputale & Lipton&apos;s Seat
                </Link>
              </li>
              <li>
                <Link href="/destinations/ella" className="hover:text-white transition-colors">
                  Ella & Nine Arch Bridge
                </Link>
              </li>
              <li>
                <Link href="/destinations/hikkaduwa" className="hover:text-white transition-colors">
                  Hikkaduwa Coast
                </Link>
              </li>
              <li>
                <Link href="/destinations/mirissa" className="hover:text-white transition-colors">
                  Mirissa & Whale Coast
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Tours & Stories */}
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-[#E06D53] mb-4">
              Tours & Planning
            </h3>
            <ul className="space-y-2.5 text-sm text-[#E8E2D2]/80">
              <li>
                <Link href="/tours" className="hover:text-white transition-colors">
                  All Signature Tours
                </Link>
              </li>
              <li>
                <Link href="/custom-tour" className="hover:text-white transition-colors font-medium text-white flex items-center gap-1.5">
                  <span>Custom Trip Planner</span>
                  <span className="text-[10px] bg-[#E06D53] px-1.5 py-0.5 rounded-full text-white">Free</span>
                </Link>
              </li>
              <li>
                <Link href="/experiences" className="hover:text-white transition-colors">
                  Curated Experiences
                </Link>
              </li>
              <li>
                <Link href="/stories" className="hover:text-white transition-colors font-semibold text-[#25D366]">
                  Island Stories & Guides
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Our Drivers & Fleet
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Request a Free Quote
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Local HQ & WhatsApp */}
          <div>
            <h3 className="text-sm font-bold tracking-wider uppercase text-[#E06D53] mb-4">
              Local Office
            </h3>
            <ul className="space-y-3 text-sm text-[#E8E2D2]/85">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#E06D53] shrink-0 mt-0.5" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#25D366] shrink-0" />
                <a href={`tel:${phone}`} className="hover:text-white transition-colors">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-[#25D366] shrink-0 fill-[#25D366]" />
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors font-semibold text-[#25D366]"
                >
                  Direct WhatsApp Chat
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E8E2D2] shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                  {email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#E8E2D2]/60 gap-4">
          <p>© 2026 {companyName}. All rights reserved.</p><Link href="/credits" className="hover:text-white transition-colors">Photo Credits</Link>
          <div className="flex items-center gap-1">
            <span>Crafted with pride in</span>
            <Heart className="w-3.5 h-3.5 text-[#E06D53] fill-[#E06D53]" />
            <span>Hikkaduwa, Sri Lanka</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
