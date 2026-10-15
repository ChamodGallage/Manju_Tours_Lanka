import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Calendar, CheckCircle2, ChevronRight, MessageCircle, Sparkles, Compass } from "lucide-react";
import { getDestinationBySlug } from "@/lib/queries/destinations";
import { getDestinationImages } from "@/lib/queries/site-images";
import { getToursByDestination } from "@/lib/queries/tours";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import CtaBanner from "@/components/home/CtaBanner";
import SafeImage from "@/components/ui/SafeImage";
import PhotoGallery from "@/components/ui/PhotoGallery";
import { normalizeImageMedia, normalizeGallery } from "@/lib/images";
import { generateDestinationSchema } from "@/lib/seo";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { destinationsSeed } = await import("@/lib/data/seed-dataset");
  return destinationsSeed.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const dest = await getDestinationBySlug(slug);

  if (!dest) {
    return { title: "Destination Not Found" };
  }

  return {
    title: `${dest.name} Travel Guide | Sri Lanka Destinations`,
    description: dest.tagline || dest.summary.slice(0, 160),
    openGraph: {
      title: `${dest.name} | Manju Tours Lanka`,
      description: dest.summary,
      type: "website",
    },
  };
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [dest, dbImages, relatedTours] = await Promise.all([
    getDestinationBySlug(slug),
    getDestinationImages(slug),
    getToursByDestination(slug),
  ]);

  if (!dest) {
    notFound();
  }

  const jsonLd = generateDestinationSchema(dest);
  const highlightsList: string[] = Array.isArray(dest.highlights) ? (dest.highlights as string[]) : [];
  
  // Use database hero photo if available, with graceful fallback to destination metadata
  const baseHero = (dest as typeof dest & { heroImageMetadata?: unknown }).heroImageMetadata ?? dest.heroImage;
  const effectiveHero = dbImages.heroImage?.src ? {
    src: dbImages.heroImage.src,
    alt: dbImages.heroImage.alt || dest.name,
    caption: dbImages.heroImage.caption || dest.tagline,
  } : baseHero;
  const heroImage = normalizeImageMedia(effectiveHero, dest.name, dest.tagline);

  // Use database gallery photos if available, else static gallery
  const effectiveGallery = dbImages.gallery && dbImages.gallery.length > 0 
    ? dbImages.gallery 
    : dest.galleryImages;
  const galleryImages = normalizeGallery(effectiveGallery, dest.name);

  const whatsappUrl = buildWhatsAppLink(
    `Hello Manju Tours Lanka! I am interested in visiting ${dest.name}. Could you advise on the best itinerary and timing?`
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <div className="bg-[#F4EFE6]/70 border-b border-[#E8E2D2] py-3 text-xs text-[#5B6770]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          <Link href="/" className="hover:text-[#0C5A70]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/destinations" className="hover:text-[#0C5A70]">Destinations</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#17202A] font-semibold">{dest.name}</span>
        </div>
      </div>

      {/* Natural Photo Hero Section */}
      <section className="bg-white pt-6 sm:pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative w-full rounded-3xl sm:rounded-4xl overflow-hidden shadow-xl border border-[#E8E2D2] bg-[#0C5A70] aspect-[16/9] sm:aspect-[2.2/1] max-h-[520px]">
            <SafeImage
              src={heroImage.src}
              alt={heroImage.alt}
              fallbackTitle={dest.name}
              fallbackCategory="destination"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1280px) 100vw, 1280px"
              focalPoint={heroImage.focalPoint}
            />

            {/* Very light bottom vignette only for text readability - preserving true natural colors */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-6 sm:p-10 lg:p-12 text-white">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <Badge variant="accent">{dest.region}</Badge>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-white">
                    <Clock className="w-3.5 h-3.5 text-[#25D366]" />
                    <span>Ideal Stay: {dest.idealDuration}</span>
                  </div>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-2 drop-shadow-md">
                  {dest.name}
                </h1>

                <p className="text-sm sm:text-lg text-[#FBF9F4]/95 font-medium leading-relaxed drop-shadow-sm mb-6 max-w-2xl">
                  {dest.tagline}
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    href={`/custom-tour?places=${encodeURIComponent(dest.name)}`}
                    variant="accent"
                    size="md"
                    className="font-bold shadow-md"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Add {dest.name.split(" ")[0]} to My Trip</span>
                  </Button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[#1E3F1D] bg-[#25D366] hover:bg-[#1EBE5D] hover:text-white transition-all shadow-md"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>Ask Manju via WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content (2 Cols) */}
          <div className="lg:col-span-2 space-y-10">
            {/* Summary Card */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D2] shadow-sm">
              <h2 className="text-xl font-bold text-[#17202A] mb-3">
                Overview & Traveler Introduction
              </h2>
              <p className="text-sm text-[#5B6770] leading-relaxed mb-6">
                {dest.summary}
              </p>

              <h3 className="text-base font-bold text-[#17202A] mb-3">
                History & Cultural Context
              </h3>
              <p className="text-sm text-[#5B6770] leading-relaxed">
                {dest.content}
              </p>
            </section>

            {/* Photo Gallery with Lightbox */}
            {galleryImages.length > 0 && (
              <PhotoGallery
                title={`${dest.name} Photography Showcase`}
                subtitle="True, natural captures of landmarks and local life."
                images={galleryImages}
                category="destination"
              />
            )}

            {/* Highlights */}
            {highlightsList.length > 0 && (
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D2] shadow-sm">
                <h2 className="text-xl font-bold text-[#17202A] mb-4">
                  Signature Highlights in {dest.name}
                </h2>
                <div className="space-y-3">
                  {highlightsList.map((hl, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2]/60"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#2B5829] shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-[#17202A] font-medium leading-relaxed">
                        {hl}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Local Insider Travel Advice from Manju Tours */}
            <section className="bg-[#2B5829]/5 border border-[#2B5829]/20 rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-3">
                <Compass className="w-5 h-5 text-[#2B5829]" />
                <h3 className="text-base font-bold text-[#17202A]">
                  Manju&apos;s Local Chauffeur Advice for {dest.name}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[#5B6770] leading-relaxed">
                &ldquo;Sri Lankan weather varies dramatically by altitude and mountain slopes. To experience {dest.name} without the crowds, we always recommend early morning starts before tourist coaches arrive. Having your own private vehicle means we can drop you at the entrance, wait comfortably with your luggage in AC, and take you to unhurried local lunch spots where locals eat authentic food.&rdquo;
              </p>
            </section>

            {/* Featured Tour Packages Visiting This Destination */}
            {relatedTours && relatedTours.length > 0 && (
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D2] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-[#17202A]">
                      Tours That Visit {dest.name}
                    </h3>
                    <p className="text-xs text-[#5B6770] mt-0.5">
                      Handcrafted private chauffeured itineraries featuring {dest.name}
                    </p>
                  </div>
                  <Link
                    href="/tours"
                    className="text-xs font-bold text-[#0C5A70] hover:underline"
                  >
                    View All Tours &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {relatedTours.slice(0, 2).map((tour) => (
                    <Link
                      key={tour.id}
                      href={`/tours/${tour.slug}`}
                      className="group rounded-2xl border border-[#E8E2D2] p-4 bg-[#FBF9F4] hover:bg-white hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#0C5A70] mb-1">
                          <span>{tour.durationDays} Days / {tour.durationNights} Nights</span>
                          <span className="text-[#2B5829]">{tour.startingPrice || "Custom Quote"}</span>
                        </div>
                        <h4 className="text-sm font-bold text-[#17202A] group-hover:text-[#0C5A70] transition-colors line-clamp-1">
                          {tour.title}
                        </h4>
                        <p className="text-xs text-[#5B6770] line-clamp-2 mt-1">
                          {tour.tagline || tour.overview}
                        </p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#E8E2D2]/60 flex items-center justify-between text-xs font-bold text-[#0C5A70]">
                        <span>Explore Route</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar (1 Col) */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D2] shadow-sm sticky top-24 space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#17202A] mb-3">
                  Planning Details
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2]/60">
                    <div className="flex items-center gap-2 text-[#0C5A70] font-bold uppercase text-[10px] mb-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Best Time to Visit</span>
                    </div>
                    <span className="text-[#17202A] font-semibold block">
                      {dest.bestTimeToVisit}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2]/60">
                    <div className="flex items-center gap-2 text-[#0C5A70] font-bold uppercase text-[10px] mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Recommended Length of Stay</span>
                    </div>
                    <span className="text-[#17202A] font-semibold block">
                      {dest.idealDuration}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Box */}
              <div className="pt-4 border-t border-[#E8E2D2] space-y-3">
                <Button
                  href={`/custom-tour?places=${encodeURIComponent(dest.name)}`}
                  variant="accent"
                  size="md"
                  className="w-full justify-center shadow-md font-bold text-xs"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Customize Trip with {dest.name.split(" ")[0]}</span>
                </Button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] shadow-md transition-all text-center"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Ask Manju About Timing & Hotels</span>
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <CtaBanner />
    </>
  );
}
