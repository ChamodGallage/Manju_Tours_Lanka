import React from "react";
import type { Metadata } from "next";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import { getAllExperiences } from "@/lib/queries/experiences";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SafeImage from "@/components/ui/SafeImage";
import { normalizeImageMedia } from "@/lib/images";
import CtaBanner from "@/components/home/CtaBanner";

import { getPublishedPageSections, getSection } from "@/lib/queries/page-sections";
import { getPageByKey } from "@/lib/queries/pages";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByKey("experiences");
  return {
    title: page?.seo_title || "Sri Lanka Experiences & Activities | Manju Tours Lanka",
    description:
      page?.seo_description ||
      "Immerse yourself in authentic Sri Lankan travel experiences: blue whale cruises, open-top leopard safaris, scenic tea country train journeys, and traditional village cooking.",
    openGraph: {
      title: page?.seo_title || "Sri Lanka Experiences",
      description: page?.seo_description,
      images: [{ url: page?.seo_og_image || "/images/experiences/yala-leopard-jeep-safari/hero.webp" }],
    },
  };
}

interface ExperienceRecord {
  id?: string;
  slug: string;
  title: string;
  category: string;
  duration: string;
  location: string;
  summary: string;
  heroImage?: unknown;
}

export default async function ExperiencesPage() {
  const [experiences, sections] = await Promise.all([
    getAllExperiences() as Promise<ExperienceRecord[]>,
    getPublishedPageSections("experiences"),
  ]);
  const hero = getSection(sections, "hero");

  return (
    <>
      {hero?.is_visible !== false && (
        <section className="bg-[#0C5A70] text-white py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <Badge variant="accent" className="mb-4">
              {hero?.badge || "Authentic Island Activities"}
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white">
              {hero?.title || "Curated Sri Lanka Experiences"}
            </h1>
            <p className="text-base sm:text-lg text-[#FBF9F4]/90 leading-relaxed">
              {hero?.subtitle ||
                hero?.content ||
                "Enhance any custom chauffeured journey with unforgettable local activities. Hand-picked, ethical, and privately hosted."}
            </p>
          </div>
        </section>
      )}

      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experiences.map((exp: ExperienceRecord) => {
            const imageMedia = normalizeImageMedia(
              ((exp as typeof exp & { heroImageMetadata?: unknown }).heroImageMetadata ?? exp.heroImage) || `/images/experiences/${exp.slug}/hero.jpg`
            );

            return (
              <article
                key={exp.id}
                className="bg-white rounded-3xl overflow-hidden border border-[#E8E2D2] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Container */}
                  <div className="relative h-52 w-full bg-[#F7F5EF] overflow-hidden">
                    <SafeImage
                      src={imageMedia.src}
                      alt={imageMedia.alt || `${exp.title} in Sri Lanka`}
                      fill
                      slotLabel={`${exp.title} Photo`}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-[11px] font-bold text-[#2B5829] bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs">
                        {exp.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 text-xs text-[#17202A] font-semibold bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs">
                      <Clock className="w-3.5 h-3.5 text-[#0C5A70]" />
                      <span>{exp.duration}</span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 z-10">
                      <h2 className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:text-[#FBF9F4] transition-colors leading-snug">
                        {exp.title}
                      </h2>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-1.5 text-xs text-[#5B6770] font-medium mb-3">
                      <MapPin className="w-3.5 h-3.5 text-[#E06D53]" />
                      <span>{exp.location}</span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#5B6770] leading-relaxed line-clamp-3">
                      {exp.summary}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 border-t border-[#E8E2D2]/60 mt-auto flex items-center justify-between">
                  <Button
                    href={`/experiences/${exp.slug}`}
                    variant="primary"
                    size="sm"
                    className="text-xs"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>

                  <Button
                    href={`/custom-tour?experience=${encodeURIComponent(exp.title)}`}
                    variant="ghost"
                    size="sm"
                    className="text-xs font-bold text-[#E06D53] hover:text-[#C8573D]"
                  >
                    + Add to Tour
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
