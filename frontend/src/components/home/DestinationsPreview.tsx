import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import SafeImage from "@/components/ui/SafeImage";
import { normalizeImageMedia } from "@/lib/images";
import { FadeIn } from "@/components/ui/Motion";

interface DestinationItem {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  region: string;
  idealDuration: string;
  summary: string;
  heroImage?: unknown;
}

interface DestinationsPreviewProps {
  destinations: DestinationItem[];
}

export const DestinationsPreview: React.FC<DestinationsPreviewProps> = ({
  destinations,
}) => {
  return (
    <section className="py-20 lg:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <Badge variant="accent" className="mb-3">
              Iconic Island Wonders
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#17202A] tracking-tight">
              Must-Visit Sri Lanka Destinations
            </h2>
            <p className="text-base text-[#5B6770] mt-2 max-w-2xl">
              From the soaring heights of Sigiriya to the rolling tea country of Ella and the warm turquoise bays of Mirissa.
            </p>
          </div>

          <Button
            href="/destinations"
            variant="outline"
            size="md"
            className="self-start md:self-auto font-bold"
          >
            <span>View All Destinations</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.slice(0, 6).map((dest, index) => {
          const imageMedia = normalizeImageMedia(
            ((dest as typeof dest & { heroImageMetadata?: unknown }).heroImageMetadata ?? dest.heroImage) || `/images/destinations/${dest.slug}/hero.jpg`
          );

          return (
            <FadeIn key={dest.id} delay={index * 0.08}>
              <Link
                href={`/destinations/${dest.slug}`}
                className="group relative bg-white rounded-3xl overflow-hidden border border-[#E8E2D2] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between h-full"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#0C5A70] bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs">
                        {dest.region}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 z-10">
                      <span className="text-xs text-[#17202A] font-semibold bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-xs">
                        {dest.idealDuration}
                      </span>
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
                  <span>Discover Highlights & Guide</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
};
export default DestinationsPreview;
