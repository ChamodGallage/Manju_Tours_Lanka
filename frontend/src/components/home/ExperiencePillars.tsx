"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Badge from "@/components/ui/Badge";
import SafeImage from "@/components/ui/SafeImage";
import { FadeIn } from "@/components/ui/Motion";

interface PillarItem {
  id: string;
  name: string;
  theme: string;
  tagline: string;
  badge: string;
  description: string;
  image: string;
  href: string;
  focalPoint?: string;
}

const PILLARS: PillarItem[] = [
  {
    id: "wild",
    name: "Wild",
    theme: "Wildlife Safaris",
    tagline: "Elusive Yala Leopards & Elephant Gatherings",
    badge: "Sanctuary Wildlife",
    description: "Private dawn 4x4 safaris across Yala, Minneriya, and Wilpattu with licensed trackers.",
    image: "/images/destinations/yala-national-park/hero.webp",
    href: "/experiences/yala-leopard-jeep-safari",
    focalPoint: "center 45%",
  },
  {
    id: "pristine",
    name: "Pristine",
    theme: "Beaches & Marine Life",
    tagline: "Golden Surf Bays, Coral Reefs & Sea Turtles",
    badge: "Coast & Oceans",
    description: "The warm turquoise waters of Hikkaduwa, Mirissa blue whales, and secret palm-fringed coves.",
    image: "/images/experiences/mirissa-whale.webp",
    href: "/experiences/mirissa-whale-watching",
    focalPoint: "center",
  },
  {
    id: "bliss",
    name: "Bliss",
    theme: "Tea Country & Nature",
    tagline: "Misty Tea Estates, Waterfalls & Mountain Calm",
    badge: "Highland Serenity",
    description: "High-altitude cloud forests, colonial tea gardens in Nuwara Eliya, and quiet wellness.",
    image: "/images/destinations/nuwara-eliya/hero.webp",
    href: "/experiences/ceylon-artisan-tea-experience",
    focalPoint: "center",
  },
  {
    id: "scenic",
    name: "Scenic",
    theme: "Iconic Mountain Journeys",
    tagline: "World-Famous Mountain Train & Mountain Vistas",
    badge: "Highland Rail",
    description: "The iconic Kandy-to-Ella railway over Nine Arch Bridge and sweeping drops from Lipton's Seat.",
    image: "/images/destinations/ella/hero.webp",
    href: "/experiences/kandy-ella-scenic-train",
    focalPoint: "center 40%",
  },
  {
    id: "thrills",
    name: "Thrills",
    theme: "Active Adventures",
    tagline: "Dawn Rock Climbs, White-Water & 4x4 Trails",
    badge: "Active Expedition",
    description: "Sunrise above the jungle canopy at Pidurangala, river rafting in Kitulgala, and rugged trails.",
    image: "/images/experiences/sigiriya-sunrise-climb/hero.webp",
    href: "/experiences/sigiriya-sunrise-climb",
    focalPoint: "center",
  },
  {
    id: "festive",
    name: "Festive",
    theme: "Living Culture & Festivals",
    tagline: "Sacred Pageantry, Temple Drummers & Celebrations",
    badge: "Cultural Pageantry",
    description: "The sacred Kandy Esala Perahera processions, traditional mask carving, and coastal ceremonies.",
    image: "/images/destinations/kandy/gallery-1.webp",
    href: "/experiences",
    focalPoint: "center",
  },
  {
    id: "heritage",
    name: "Heritage",
    theme: "UNESCO Ancient Citadels",
    tagline: "5th-Century Sky Fortresses & Dutch Ocean Ramparts",
    badge: "UNESCO Heritage",
    description: "The wonder of Sigiriya Lion Rock, Dambulla cave murals, and walking the ocean ramparts of Galle Fort.",
    image: "/images/destinations/polonnaruwa/hero.webp",
    href: "/experiences/galle-fort-heritage-walk",
    focalPoint: "center",
  },
  {
    id: "essence",
    name: "Essence",
    theme: "Authentic Culinary Traditions",
    tagline: "Clay-Pot Village Curries & Fragrant Spice Traditions",
    badge: "Island Flavors",
    description: "Private cooking with rural families, harvesting true Ceylon cinnamon, and street food hoppers.",
    image: "/images/destinations/galle-fort/hero.webp",
    href: "/experiences/hikkaduwa-village-cooking-class",
    focalPoint: "center 35%",
  },
];

interface ExperiencePillarsProps {
  customImages?: Record<string, { image: string; alt: string; focalPoint?: string }>;
}

export const ExperiencePillars: React.FC<ExperiencePillarsProps> = ({ customImages }) => {
  return (
    <section className="py-20 lg:py-28 bg-[#FBF9F4] border-t border-[#E8E2D2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="accent" className="mb-3">
                Eight Ways to Fall in Love with Sri Lanka
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17202A] tracking-tight">
                Curated Travel Pillars
              </h2>
              <p className="text-base text-[#5B6770] mt-2 max-w-2xl">
                Every custom tour we craft weaves together these eight authentic dimensions of our island. Hand-picked, unhurried, and hosted by your dedicated chauffeur-guide.
              </p>
            </div>

            <Link
              href="/custom-tour"
              className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold text-white bg-[#0C5A70] hover:bg-[#083B4A] transition-all shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#E06D53]" />
              <span>Build an Itinerary With These Themes</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </FadeIn>

        {/* 8 Big Visual Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar, index) => {
            const currentImg = customImages?.[pillar.id]?.image || pillar.image;
            const currentAlt = customImages?.[pillar.id]?.alt || `${pillar.name} — ${pillar.tagline}`;
            const focalPoint = customImages?.[pillar.id]?.focalPoint || pillar.focalPoint;
            return (
            <FadeIn key={pillar.id} delay={index * 0.06}>
              <Link
                href={pillar.href}
                className="group relative h-96 rounded-3xl overflow-hidden border border-[#E8E2D2] shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-end p-6 select-none"
              >
                {/* Background Photo */}
                <SafeImage
                  src={currentImg}
                  alt={currentAlt}
                  fill
                  slotLabel={`${pillar.name} Visual Tile`}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  focalPoint={focalPoint}
                />

                {/* Soft natural bottom gradient for crystal clear text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />

                {/* Top Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="text-[11px] font-bold text-white tracking-wider uppercase bg-[#17202A]/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    {pillar.badge}
                  </span>
                </div>

                {/* Bottom Content */}
                <div className="relative z-10">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      {pillar.name}
                    </span>
                    <span className="text-xs font-semibold text-[#E06D53]">
                      • {pillar.theme}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white/95 leading-snug mb-2 line-clamp-1">
                    {pillar.tagline}
                  </h3>

                  <p className="text-xs text-white/80 line-clamp-2 leading-relaxed mb-4">
                    {pillar.description}
                  </p>

                  <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs font-bold text-white group-hover:text-[#FBF9F4]">
                    <span>Explore {pillar.name} Moments</span>
                    <ArrowRight className="w-4 h-4 text-[#E06D53] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExperiencePillars;
