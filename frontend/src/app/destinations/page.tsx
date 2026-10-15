import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, ArrowRight, Clock } from "lucide-react";
import { getAllDestinations } from "@/lib/queries/destinations";
import Badge from "@/components/ui/Badge";
import SafeImage from "@/components/ui/SafeImage";
import { normalizeImageMedia } from "@/lib/images";
import CtaBanner from "@/components/home/CtaBanner";

import { getPublishedPageSections, getSection } from "@/lib/queries/page-sections";
import { getPageByKey } from "@/lib/queries/pages";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByKey("destinations");
  return {
    title: page?.seo_title || "Sri Lanka Destinations & Regional Guides",
    description:
      page?.seo_description ||
      "Explore Sri Lanka's iconic travel destinations: Sigiriya, Kandy, Nuwara Eliya, Haputale, Ella, Mirissa, and beyond. Curated travel advice from local Hikkaduwa chauffeur-guides.",
    openGraph: {
      title: page?.seo_title || "Sri Lanka Destinations",
      description: page?.seo_description,
      images: [{ url: page?.seo_og_image || "/images/destinations/sigiriya/hero.webp" }],
    },
  };
}

interface DestinationRecord {
  id?: string;
  slug: string;
  name: string;
  tagline: string;
  region: string;
  idealDuration: string;
  summary: string;
  heroImage?: unknown;
}

export default async function DestinationsPage() {
  const [destinations, sections] = await Promise.all([
    getAllDestinations() as Promise<DestinationRecord[]>,
    getPublishedPageSections("destinations"),
  ]);
  const hero = getSection(sections, "hero");

  // Group by region
  const regions = Array.from(new Set(destinations.map((d: DestinationRecord) => d.region)));

  return (
    <>
      {/* Header Banner */}
      {hero?.is_visible !== false && (
        <section className="bg-[#0C5A70] text-white py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <Badge variant="accent" className="mb-4">
              {hero?.badge || "Island Geography & Heritage"}
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white">
              {hero?.title || "Iconic Sri Lankan Destinations"}
            </h1>
            <p className="text-base sm:text-lg text-[#FBF9F4]/90 leading-relaxed">
              {hero?.subtitle ||
                hero?.content ||
                "From the arid ancient citadels of the Cultural Triangle to the cool misty high-country tea estates and the golden palm-fringed southern shores."}
            </p>
          </div>
        </section>
      )}

      {/* Destinations Grouped by Region */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {regions.map((region: string) => {
          const regionDests = destinations.filter((d: DestinationRecord) => d.region === region);

          return (
            <div key={region} className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-[#E8E2D2]">
                <MapPin className="w-5 h-5 text-[#0C5A70]" />
                <h2 className="text-2xl font-extrabold text-[#17202A]">
                  {region}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regionDests.map((dest: DestinationRecord) => {
                  const imageMedia = normalizeImageMedia(
                    ((dest as typeof dest & { heroImageMetadata?: unknown }).heroImageMetadata ?? dest.heroImage) || `/images/destinations/${dest.slug}/hero.jpg`
                  );

                  return (
                    <Link
                      key={dest.id}
                      href={`/destinations/${dest.slug}`}
                      className="bg-white rounded-3xl overflow-hidden border border-[#E8E2D2] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Photo Container */}
                        <div className="relative h-48 w-full bg-[#F7F5EF] overflow-hidden">
                          <SafeImage
                            src={imageMedia.src}
                            alt={imageMedia.alt || `${dest.name}, Sri Lanka`}
                            fill
                            slotLabel={`${dest.name} Photo`}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

                          <div className="absolute top-3 left-3 z-10">
                            <span className="text-[11px] font-bold text-[#0C5A70] bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs">
                              {dest.region}
                            </span>
                          </div>
                          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 text-xs text-[#17202A] font-semibold bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs">
                            <Clock className="w-3.5 h-3.5 text-[#0C5A70]" />
                            <span>{dest.idealDuration}</span>
                          </div>

                          <div className="absolute bottom-3 left-4 right-4 z-10">
                            <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:text-[#FBF9F4] transition-colors">
                              {dest.name}
                            </h3>
                          </div>
                        </div>

                        <div className="p-6">
                          <p className="text-xs font-semibold text-[#E06D53] mb-2.5">
                            {dest.tagline}
                          </p>
                          <p className="text-xs text-[#5B6770] leading-relaxed line-clamp-3">
                            {dest.summary}
                          </p>
                        </div>
                      </div>

                      <div className="p-6 pt-0 border-t border-[#E8E2D2]/60 mt-auto flex items-center justify-between text-xs font-bold text-[#0C5A70]">
                        <span>Read Destination Guide</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      <CtaBanner />
    </>
  );
}
