import React from "react";
import Link from "next/link";
import { Clock, MapPin, ArrowRight } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SafeImage from "@/components/ui/SafeImage";
import { normalizeImageMedia } from "@/lib/images";
import { FadeIn } from "@/components/ui/Motion";

interface ExperienceItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  duration: string;
  location: string;
  summary: string;
  heroImage?: unknown;
}

interface ExperiencesShowcaseProps {
  experiences: ExperienceItem[];
}

export const ExperiencesShowcase: React.FC<ExperiencesShowcaseProps> = ({
  experiences,
}) => {
  return (
    <section className="py-20 lg:py-28 bg-[#FBF9F4] border-t border-[#E8E2D2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="secondary" className="mb-3">
                Unforgettable Memories
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17202A] tracking-tight">
                Curated Island Experiences
              </h2>
              <p className="text-base text-[#5B6770] mt-2 max-w-2xl">
                Add authentic moments to any custom itinerary—safaris, scenic trains, tea tastings, and local village cooking.
              </p>
            </div>

            <Button
              href="/experiences"
              variant="outline"
              size="md"
              className="self-start md:self-auto font-bold"
            >
              <span>View All Experiences</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.slice(0, 6).map((exp, index) => {
            const imageMedia = normalizeImageMedia(
              ((exp as typeof exp & { heroImageMetadata?: unknown }).heroImageMetadata ?? exp.heroImage) || `/images/experiences/${exp.slug}/hero.jpg`
            );

            return (
              <FadeIn key={exp.id} delay={index * 0.08}>
                <Link
                  href={`/experiences/${exp.slug}`}
                  className="bg-white rounded-3xl overflow-hidden border border-[#E8E2D2] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between group h-full"
                >
                  <div>
                    {/* Photo Container */}
                    <div className="relative h-48 w-full bg-[#F7F5EF] overflow-hidden">
                      <SafeImage
                        src={imageMedia.src}
                        alt={imageMedia.alt || `${exp.title} in Sri Lanka`}
                        fill
                        slotLabel={`${exp.title} Photo`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

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
                        <h3 className="text-lg font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:text-[#FBF9F4] transition-colors leading-snug">
                          {exp.title}
                        </h3>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-1 text-xs text-[#5B6770] font-medium mb-3">
                        <MapPin className="w-3.5 h-3.5 text-[#E06D53]" />
                        <span>{exp.location}</span>
                      </div>

                      <p className="text-xs text-[#5B6770] leading-relaxed line-clamp-3">
                        {exp.summary}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0 border-t border-[#E8E2D2]/60 mt-auto flex items-center justify-between text-xs font-bold text-[#0C5A70]">
                    <span>Experience Details</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
export default ExperiencesShowcase;
