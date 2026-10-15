"use client";

import React, { useState } from "react";
import { Clock, MessageCircle, SlidersHorizontal } from "lucide-react";
import Button from "@/components/ui/Button";
import SafeImage from "@/components/ui/SafeImage";
import { normalizeImageMedia } from "@/lib/images";
import { buildTourWhatsAppLink } from "@/lib/whatsapp";

interface TourItem {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  durationDays: number;
  durationNights: number;
  travelStyle: string;
  startingPrice?: string | null;
  highlights: unknown;
  overview: string;
  heroImage?: unknown;
}

interface TourFilterListProps {
  initialTours: TourItem[];
}

export const TourFilterList: React.FC<TourFilterListProps> = ({ initialTours }) => {
  const [selectedDuration, setSelectedDuration] = useState<string>("all");
  const [selectedStyle, setSelectedStyle] = useState<string>("all");

  const durations = [
    { label: "All Durations", value: "all" },
    { label: "3 - 5 Days", value: "short" },
    { label: "6 - 8 Days", value: "classic" },
    { label: "9+ Days", value: "long" },
  ];

  const styles = [
    { label: "All Travel Styles", value: "all" },
    { label: "Chauffeur Escorted", value: "chauffeur" },
    { label: "Cultural & Heritage", value: "cultural" },
    { label: "Wildlife & Safari", value: "wildlife" },
    { label: "Honeymoon & Luxury", value: "honeymoon" },
  ];

  const filteredTours = initialTours.filter((tour) => {
    // Duration filter
    if (selectedDuration === "short" && (tour.durationDays < 3 || tour.durationDays > 5)) return false;
    if (selectedDuration === "classic" && (tour.durationDays < 6 || tour.durationDays > 8)) return false;
    if (selectedDuration === "long" && tour.durationDays < 9) return false;

    // Style filter
    if (selectedStyle === "chauffeur" && !tour.travelStyle.toLowerCase().includes("chauffeur")) return false;
    if (selectedStyle === "cultural" && !tour.travelStyle.toLowerCase().includes("cultur")) return false;
    if (selectedStyle === "wildlife" && !tour.travelStyle.toLowerCase().includes("wild")) return false;
    if (selectedStyle === "honeymoon" && !tour.travelStyle.toLowerCase().includes("honeymoon")) return false;

    return true;
  });

  return (
    <div>
      {/* Filter Chips Bar */}
      <div className="bg-white rounded-3xl p-6 border border-[#E8E2D2] shadow-sm mb-10">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0C5A70] uppercase tracking-wider mb-4">
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filter Itineraries</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 justify-between">
          {/* Duration Chips */}
          <div>
            <span className="block text-xs font-bold text-[#17202A] mb-2">Trip Duration:</span>
            <div className="flex flex-wrap gap-2">
              {durations.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setSelectedDuration(d.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedDuration === d.value
                      ? "bg-[#0C5A70] text-white shadow-xs"
                      : "bg-[#FBF9F4] text-[#5B6770] border border-[#E8E2D2] hover:bg-[#E8E2D2]/40"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Style Chips */}
          <div>
            <span className="block text-xs font-bold text-[#17202A] mb-2">Travel Style:</span>
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setSelectedStyle(s.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedStyle === s.value
                      ? "bg-[#2B5829] text-white shadow-xs"
                      : "bg-[#FBF9F4] text-[#5B6770] border border-[#E8E2D2] hover:bg-[#E8E2D2]/40"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-[#E8E2D2]/60 flex items-center justify-between text-xs text-[#5B6770]">
          <span>
            Showing <strong>{filteredTours.length}</strong> of {initialTours.length} signature tours
          </span>
          {(selectedDuration !== "all" || selectedStyle !== "all") && (
            <button
              onClick={() => {
                setSelectedDuration("all");
                setSelectedStyle("all");
              }}
              className="text-[#E06D53] hover:underline font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Tours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredTours.map((tour) => {
          const highlightsList: string[] = Array.isArray(tour.highlights)
            ? (tour.highlights as string[])
            : [];
          const whatsappUrl = buildTourWhatsAppLink(tour.title, tour.durationDays);
          const imageMedia = normalizeImageMedia(
            ((tour as typeof tour & { heroImageMetadata?: unknown }).heroImageMetadata ?? tour.heroImage) || `/images/tours/${tour.slug}/hero.jpg`
          );

          return (
            <article
              key={tour.id}
              className="bg-white rounded-3xl overflow-hidden border border-[#E8E2D2] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Photo Hero Banner */}
                <div className="relative h-56 w-full bg-[#F7F5EF] overflow-hidden">
                  <SafeImage
                    src={imageMedia.src}
                    alt={imageMedia.alt || `${tour.title} Tour in Sri Lanka`}
                    fill
                    slotLabel={`${tour.title} Photo`}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                  <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white tracking-wider uppercase bg-[#17202A]/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full">
                      {tour.travelStyle}
                    </span>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-bold text-[#17202A] shadow-xs">
                      <Clock className="w-3.5 h-3.5 text-[#0C5A70]" />
                      <span>{tour.durationDays}D / {tour.durationNights}N</span>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 z-10">
                    <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:text-[#FBF9F4] transition-colors leading-snug">
                      {tour.title}
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-xs text-[#5B6770] font-medium leading-relaxed mb-4 line-clamp-2">
                    {tour.tagline}
                  </p>

                  <div className="space-y-2 mb-6">
                    <h4 className="text-[11px] font-bold tracking-wider uppercase text-[#0C5A70]">
                      Key Highlights:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#17202A]">
                      {highlightsList.slice(0, 3).map((hl, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#E06D53] font-bold mt-0.5">•</span>
                          <span className="line-clamp-1">{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-6 pt-0 border-t border-[#E8E2D2]/60 mt-auto flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs pt-3">
                  <span className="text-[#5B6770]">Starting Estimate:</span>
                  <span className="font-bold text-[#0C5A70] bg-[#0C5A70]/10 px-2.5 py-0.5 rounded-full">
                    {tour.startingPrice || "Request a Quote"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    href={`/tours/${tour.slug}`}
                    variant="primary"
                    size="sm"
                    className="w-full justify-center text-xs"
                  >
                    View Details
                  </Button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold text-[#1E3F1D] bg-[#25D366]/15 hover:bg-[#25D366]/30 border border-[#25D366]/30 transition-all text-center"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366] fill-[#25D366]" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
export default TourFilterList;
