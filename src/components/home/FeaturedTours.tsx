import React from "react";
import { Clock, ArrowRight, MessageCircle } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SafeImage from "@/components/ui/SafeImage";
import { normalizeImageMedia } from "@/lib/images";
import { FadeIn } from "@/components/ui/Motion";
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
  heroImage?: unknown;
}

interface FeaturedToursProps {
  tours: TourItem[];
}

export const FeaturedTours: React.FC<FeaturedToursProps> = ({ tours }) => {
  return (
    <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <Badge variant="primary" className="mb-3">
              Handcrafted Signature Journeys
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17202A] tracking-tight">
              Popular Sri Lanka Private Tours
            </h2>
            <p className="text-base text-[#5B6770] mt-2 max-w-2xl">
              Each itinerary is a starting blueprint. Every route, hotel level, and pace is 100% customizable to your group.
            </p>
          </div>

          <Button
            href="/tours"
            variant="outline"
            size="md"
            className="self-start md:self-auto font-bold"
          >
            <span>View All 6 Itineraries</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </FadeIn>

      {/* Tours Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tours.map((tour, index) => {
          const highlightsList: string[] = Array.isArray(tour.highlights)
            ? (tour.highlights as string[])
            : [];
          const whatsappUrl = buildTourWhatsAppLink(tour.title, tour.durationDays);
          const imageMedia = normalizeImageMedia(
            ((tour as typeof tour & { heroImageMetadata?: unknown }).heroImageMetadata ?? tour.heroImage) || `/images/tours/${tour.slug}/hero.jpg`
          );

          return (
            <FadeIn key={tour.id} delay={index * 0.1}>
              <article className="bg-white rounded-3xl overflow-hidden border border-[#E8E2D2] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group h-full">
                <div>
                  {/* Photo Hero Container */}
                  <div className="relative h-60 w-full overflow-hidden bg-[#F7F5EF]">
                    <SafeImage
                      src={imageMedia.src}
                      alt={imageMedia.alt || `${tour.title} Tour in Sri Lanka`}
                      fill
                      slotLabel={`${tour.title} Photo`}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    {/* Soft readability vignette at bottom without heavy dark filter */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-bold text-[#17202A] shadow-sm">
                      <Clock className="w-3.5 h-3.5 text-[#0C5A70]" />
                      <span>{tour.durationDays} Days / {tour.durationNights} Nights</span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <span className="inline-block text-[11px] font-bold text-white tracking-wider uppercase bg-[#17202A]/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full mb-1">
                        {tour.travelStyle}
                      </span>
                      <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] group-hover:text-[#FBF9F4] transition-colors leading-snug">
                        {tour.title}
                      </h3>
                    </div>
                  </div>

                  {/* Content Details */}
                  <div className="p-6">
                    <p className="text-xs text-[#5B6770] font-medium leading-relaxed mb-4 line-clamp-2">
                      {tour.tagline}
                    </p>

                    {/* Highlights Bullet List */}
                    <div className="space-y-2 mb-6">
                      <h4 className="text-[11px] font-bold tracking-wider uppercase text-[#0C5A70]">
                        Signature Highlights:
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
                    <span className="text-[#5B6770]">Pricing:</span>
                    <span className="font-bold text-[#0C5A70] bg-[#0C5A70]/10 px-2 py-0.5 rounded-full">
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
                      View Tour
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
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
};
export default FeaturedTours;
