"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  MessageCircle,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Compass,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { trackConversion } from "@/lib/analytics";
import type { PageSectionItem } from "@/types/database.types";

const HERO_SLIDES = [
  {
    src: "/images/destinations/sigiriya/hero.webp",
    alt: "Sigiriya Lion Rock citadel rising above morning jungle mist",
    focalPoint: "center 30%",
  },
  {
    src: "/images/destinations/ella/hero.webp",
    alt: "Red train crossing Nine Arch Bridge in Ella tea country",
    focalPoint: "center 40%",
  },
  {
    src: "/images/hero/hikkaduwa.webp",
    alt: "Golden sunset over palm-lined Hikkaduwa beach on Sri Lanka coast",
    focalPoint: "center",
  },
  {
    src: "/images/experiences/minneriya-elephants.webp",
    alt: "Wild Asian elephants gathering in Minneriya National Park",
    focalPoint: "center",
  },
];

interface HeroSlideItem {
  src: string;
  alt: string;
  focalPoint?: string;
}

interface HeroSectionProps {
  slides?: HeroSlideItem[];
  content?: PageSectionItem;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ slides, content }) => {
  const shouldReduceMotion = useReducedMotion();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hasHeroPhotos, setHasHeroPhotos] = useState(true);
  const effectiveSlides = slides && slides.length > 0 ? slides : HERO_SLIDES;

  const whatsappUrl = buildWhatsAppLink(
    "Hello Manju Tours Lanka! I saw your website and would love to start planning a custom tour to Sri Lanka."
  );

  // Soft crossfade timer if hero photos exist (only if motion is not reduced)
  useEffect(() => {
    if (shouldReduceMotion || !hasHeroPhotos) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % effectiveSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [shouldReduceMotion, hasHeroPhotos, effectiveSlides.length]);

  const categoryButtons = [
    {
      label: "Signature Tours",
      href: "#tours",
      icon: Compass,
      sub: "6 Handcrafted Blueprints",
    },
    {
      label: "Iconic Destinations",
      href: "#destinations",
      icon: MapPin,
      sub: "From Sigiriya to Mirissa",
    },
    {
      label: "8 Island Pillars",
      href: "#pillars",
      icon: Layers,
      sub: "Wild, Bliss, Heritage & More",
      highlight: true,
    },
    {
      label: "Curated Experiences",
      href: "#experiences",
      icon: Sparkles,
      sub: "Safaris, Scenic Trains & Cooking",
    },
    {
      label: "Plan Custom Trip",
      href: "/custom-tour",
      icon: Calendar,
      sub: "Free Quote in 24h",
      accent: true,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#0C5A70] text-white min-h-[90vh] lg:min-h-screen flex flex-col justify-between pt-12 pb-16 lg:pt-20 lg:pb-24">
      {/* Background Layer: Natural Photography Slideshow with slow crossfade */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {hasHeroPhotos ? (
          <div className="relative w-full h-full">
            {effectiveSlides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  style={slide.focalPoint ? { objectPosition: slide.focalPoint } : undefined}
                  className={`object-cover ${
                    shouldReduceMotion ? "" : "animate-[kenburns_12s_ease-out_infinite_alternate]"
                  }`}
                  onError={() => setHasHeroPhotos(false)}
                />
              </div>
            ))}
            {/* Natural, light gradient protection: keeps photography bright & vivid while ensuring text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#083B4A]/80 via-[#083B4A]/45 to-black/20" />
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0C5A70]/90 to-transparent" />
          </div>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#083B4A] via-[#0C5A70] to-[#1E3F1D]/80 opacity-95" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#E06D53]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#25D366]/15 rounded-full blur-3xl pointer-events-none" />
          </>
        )}
      </div>

      {/* Main Hero Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Headlines & High-Conversion CTAs */}
          <div className="lg:col-span-7">
            {/* Tagline Badge */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: -10 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-semibold tracking-wide text-[#FBF9F4] mb-5 shadow-xs"
            >
              <span className="w-2 h-2 rounded-full bg-[#E06D53] animate-pulse" />
              <span>{content?.badge || "Ayubowan! Local Chauffeur-Guides Based in Hikkaduwa"}</span>
            </motion.div>

            {/* Main H1 Title (Short, Warm, Welcoming) */}
            <motion.h1
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-5 drop-shadow-xs"
            >
              {content?.title || <>Your Personal <br className="hidden sm:inline" /><span className="text-[#FBF9F4] underline decoration-[#E06D53] decoration-4 underline-offset-8">Sri Lanka</span>{" "}Travel Planner.</>}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-[#FBF9F4]/90 font-normal leading-relaxed mb-7 max-w-2xl"
            >
              {content?.subtitle || "Skip rigid tour buses. Explore misty tea mountains, ancient UNESCO rock citadels, wild leopard safaris, and secret southern beaches with a dedicated local friend who drives and plans for you."}
            </motion.p>

            {/* High-Conversion CTAs */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8"
            >
              <Button
                href={content?.button_url || "/custom-tour"}
                variant="accent"
                size="lg"
                className="font-extrabold text-base shadow-xl hover:shadow-2xl justify-center group"
                onClick={() => trackConversion({ name: "plan_trip_click", source: "hero_primary" })}
              >
                <Sparkles className="w-5 h-5 text-white" />
                <span>{content?.button_text || "Plan My Custom Trip"}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackConversion({ name: "whatsapp_click", location: "hero_whatsapp_btn" })}
                className="inline-flex items-center justify-center gap-3 px-6 py-3.5 rounded-full text-base font-bold text-[#17202A] bg-[#25D366] hover:bg-[#1EBE5D] hover:text-white shadow-lg transition-all active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>WhatsApp Us Direct</span>
              </a>
            </motion.div>

            {/* Trust Guarantees */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0 }}
              animate={shouldReduceMotion ? {} : { opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/15 text-xs text-[#FBF9F4]/85"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>100% Private Car/Van</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Custom Daily Pacing</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Zero Tourist Traps</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>24/7 WhatsApp Care</span>
              </div>
            </motion.div>
          </div>

          {/* Desktop Right Column: Official Brand Logo Emblem Showcase */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:flex lg:col-span-5 justify-center items-center"
          >
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#E06D53]/30 to-[#25D366]/30 rounded-3xl blur-2xl opacity-70 group-hover:opacity-100 transition duration-500" />
              <div className="relative bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/40 max-w-sm flex flex-col items-center text-center">
                <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                  <Image
                    src="/images/logo.png"
                    alt="Manju Tours Lanka Official Logo"
                    width={320}
                    height={320}
                    className="w-full h-full object-contain"
                    priority
                  />
                </div>
                <div className="mt-2 pt-3 border-t border-[#E8E2D2] w-full">
                  <p className="text-xs font-bold text-[#0C5A70] tracking-wider uppercase">
                    Your Trusted Travel Partner in Sri Lanka
                  </p>
                  <p className="text-[11px] text-[#5B6770] mt-0.5 font-medium">
                    Hikkaduwa • Licensed Chauffeur & Tour Specialist
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Row of Large Category Buttons (Inspired by Reference, Rebuilt for Manju Tours) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-8 lg:mt-12">
        <div className="border-t border-white/15 pt-6">
          <div className="flex items-center justify-between mb-3 text-xs text-[#FBF9F4]/75 font-semibold">
            <span className="uppercase tracking-wider">Explore What Matters to You:</span>
            <span className="hidden sm:inline">Tap any category to jump into that dimension</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categoryButtons.map((btn, index) => {
              const Icon = btn.icon;
              return (
                <Link
                  key={index}
                  href={btn.href}
                  className={`group p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col justify-between text-left ${
                    btn.accent
                      ? "bg-[#E06D53] border-[#E06D53] text-white shadow-lg hover:bg-[#C8573D]"
                      : btn.highlight
                      ? "bg-white/15 backdrop-blur-md border-white/30 text-white hover:bg-white/25 hover:border-white/50"
                      : "bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:border-white/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>

                  <div>
                    <span className="block font-bold text-xs sm:text-sm tracking-tight text-white leading-tight">
                      {btn.label}
                    </span>
                    <span className="block text-[10px] text-white/80 font-medium mt-0.5 truncate">
                      {btn.sub}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
