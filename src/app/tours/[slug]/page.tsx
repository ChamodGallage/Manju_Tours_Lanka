import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  CheckCircle2,
  Car,
  Hotel,
  Utensils,
  ShieldCheck,
  HelpCircle,
  MapPin,
  Users,
} from "lucide-react";
import { getTourBySlug, getAllTours } from "@/lib/queries/tours";
import ItineraryAccordion from "@/components/tours/ItineraryAccordion";
import TourInclusions from "@/components/tours/TourInclusions";
import TourEnquirySidebar from "@/components/tours/TourEnquirySidebar";
import Badge from "@/components/ui/Badge";
import CtaBanner from "@/components/home/CtaBanner";
import SafeImage from "@/components/ui/SafeImage";
import PhotoGallery from "@/components/ui/PhotoGallery";
import { normalizeImageMedia, normalizeGallery } from "@/lib/images";
import { generateTourSchema } from "@/lib/seo";

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const tours = await getAllTours();
    return tours.map((t) => ({ slug: t.slug }));
  } catch {
    const { toursSeed } = await import("@/lib/data/seed-dataset");
    return toursSeed.map((t) => ({ slug: t.slug }));
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);

  if (!tour) {
    return { title: "Tour Not Found" };
  }

  return {
    title: tour.seoTitle || `${tour.title} (${tour.durationDays} Days Tour)`,
    description: tour.seoDescription || tour.tagline || tour.overview.slice(0, 160),
    openGraph: {
      title: `${tour.title} | Manju Tours Lanka`,
      description: tour.tagline,
      type: "website",
    },
  };
}

interface ItineraryItem {
  day: number;
  title: string;
  description: string;
  accommodation?: string;
  meals?: string;
}

export default async function TourDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const tour = await getTourBySlug(slug);

  if (!tour) {
    notFound();
  }

  const jsonLd = generateTourSchema(tour);
  const highlightsList: string[] = Array.isArray(tour.highlights) ? (tour.highlights as string[]) : [];
  const itineraryList: ItineraryItem[] = Array.isArray(tour.itinerary) ? (tour.itinerary as unknown as ItineraryItem[]) : [];
  const inclusionsList: string[] = Array.isArray(tour.inclusions) ? (tour.inclusions as string[]) : [];
  const exclusionsList: string[] = Array.isArray(tour.exclusions) ? (tour.exclusions as string[]) : [];
  const destinationsList: string[] = Array.isArray(tour.destinations) ? tour.destinations : [];
  const faqsList = Array.isArray(tour.faqs) ? tour.faqs : [];
  const suitableForList = Array.isArray(tour.suitableFor) ? tour.suitableFor : [];

  const heroImage = normalizeImageMedia(
    (tour as typeof tour & { heroImageMetadata?: unknown }).heroImageMetadata ?? tour.heroImage,
    tour.title,
    tour.tagline
  );
  const galleryImages = normalizeGallery(tour.galleryImages, tour.title);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Bar */}
      <div className="bg-[#F4EFE6]/70 border-b border-[#E8E2D2] py-3 text-xs text-[#5B6770]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
          <Link href="/" className="hover:text-[#0C5A70]">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/tours" className="hover:text-[#0C5A70]">Tours</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#17202A] font-semibold truncate max-w-xs">{tour.title}</span>
        </div>
      </div>

      {/* Natural Photo Hero Section */}
      <section className="bg-white pt-6 sm:pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative w-full rounded-3xl sm:rounded-4xl overflow-hidden shadow-xl border border-[#E8E2D2] bg-[#0C5A70] aspect-[16/9] sm:aspect-[2.2/1] max-h-[500px]">
            <SafeImage
              src={heroImage.src}
              alt={heroImage.alt}
              fallbackTitle={tour.title}
              fallbackCategory="tour"
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1280px) 100vw, 1280px"
              focalPoint={heroImage.focalPoint}
            />

            {/* Light bottom vignette preserving natural photography brilliance */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-6 sm:p-10 lg:p-12 text-white">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2.5 mb-3">
                  <Badge variant="accent">
                    {tour.durationDays} Days / {tour.durationNights} Nights
                  </Badge>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white">
                    {tour.travelStyle}
                  </span>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#25D366]/20 text-[#25D366]">
                    100% Private Chauffeured
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight mb-2 drop-shadow-md">
                  {tour.title}
                </h1>

                <p className="text-sm sm:text-lg text-[#FBF9F4]/95 font-medium leading-relaxed drop-shadow-xs max-w-2xl">
                  {tour.tagline}
                </p>

                {/* Destinations Covered Pills */}
                {destinationsList.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-white/20">
                    <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider mr-1">
                      Route:
                    </span>
                    {destinationsList.map((dest, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white flex items-center gap-1"
                      >
                        <MapPin className="w-2.5 h-2.5 text-[#E06D53]" />
                        <span>{dest}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tour Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Left Content (2 Cols) */}
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D2] shadow-sm">
              <h2 className="text-xl font-bold text-[#17202A] mb-4">
                Tour Overview
              </h2>
              <p className="text-sm text-[#5B6770] leading-relaxed">
                {tour.overview}
              </p>

              {/* Suitable For Traveller Types */}
              {suitableForList.length > 0 && (
                <div className="mt-6 pt-6 border-t border-[#E8E2D2]/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#0C5A70] uppercase tracking-wider mb-3">
                    <Users className="w-4 h-4" />
                    <span>Ideal For</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suitableForList.map((type, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-[#FBF9F4] text-[#17202A] border border-[#E8E2D2]"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Photo Gallery with Lightbox */}
            {galleryImages.length > 0 && (
              <PhotoGallery
                title={`${tour.title} Visual Journey`}
                subtitle="Real glimpses of the destinations and experiences on this route."
                images={galleryImages}
                category="tour"
              />
            )}

            {/* Highlights */}
            {highlightsList.length > 0 && (
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D2] shadow-sm">
                <h2 className="text-xl font-bold text-[#17202A] mb-4">
                  Signature Tour Highlights
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {highlightsList.map((hl, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2]/60">
                      <CheckCircle2 className="w-4 h-4 text-[#2B5829] shrink-0 mt-0.5" />
                      <span className="text-xs font-medium text-[#17202A] leading-snug">
                        {hl}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Day-by-Day Accordion (Section 32) */}
            <section>
              <ItineraryAccordion itinerary={itineraryList} />
            </section>

            {/* Logistics & Standards (Vehicle, Chauffeur, Hotels, Meals) */}
            <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D2] shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-[#17202A] mb-2">
                Trip Logistics & Comfort Standards
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {tour.transportDetails && (
                  <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0C5A70] uppercase mb-1.5">
                      <Car className="w-4 h-4 text-[#0C5A70]" />
                      <span>Private Transport</span>
                    </div>
                    <p className="text-xs text-[#5B6770] leading-relaxed">
                      {tour.transportDetails}
                    </p>
                  </div>
                )}

                {tour.accommodationDetails && (
                  <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0C5A70] uppercase mb-1.5">
                      <Hotel className="w-4 h-4 text-[#0C5A70]" />
                      <span>Accommodations</span>
                    </div>
                    <p className="text-xs text-[#5B6770] leading-relaxed">
                      {tour.accommodationDetails}
                    </p>
                  </div>
                )}

                {tour.mealsIncluded && (
                  <div className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#0C5A70] uppercase mb-1.5">
                      <Utensils className="w-4 h-4 text-[#0C5A70]" />
                      <span>Meal Plan</span>
                    </div>
                    <p className="text-xs text-[#5B6770] leading-relaxed">
                      {tour.mealsIncluded}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Inclusions & Exclusions */}
            <section>
              <TourInclusions
                inclusions={inclusionsList}
                exclusions={exclusionsList}
              />
            </section>

            {/* Frequently Asked Questions */}
            {faqsList.length > 0 && (
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D2] shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="w-5 h-5 text-[#0C5A70]" />
                  <h2 className="text-xl font-bold text-[#17202A]">
                    Frequently Asked Questions
                  </h2>
                </div>

                <div className="space-y-3">
                  {faqsList.map((faq, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-[#FBF9F4] border border-[#E8E2D2]/80">
                      <h4 className="text-xs font-bold text-[#17202A] mb-1.5">
                        {faq.question}
                      </h4>
                      <p className="text-xs text-[#5B6770] leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Booking & Cancellation Trust Policy */}
            <section className="p-6 rounded-3xl bg-[#2B5829]/5 border border-[#2B5829]/20 flex items-start gap-4">
              <ShieldCheck className="w-6 h-6 text-[#2B5829] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#17202A]">
                  Guaranteed Flexibility & Direct Operator Support
                </h4>
                <p className="text-xs text-[#5B6770] leading-relaxed">
                  {tour.bookingConditions || "Every tour itinerary by Manju Tours Lanka is completely customizable. You speak directly with local planners, not a generic call center."}
                </p>
                {tour.cancellationPolicy && (
                  <p className="text-xs text-[#2B5829] font-medium pt-1">
                    {tour.cancellationPolicy}
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* Sticky Right Sidebar (1 Col) */}
          <aside className="lg:col-span-1">
            <TourEnquirySidebar
              tourId={tour.id}
              tourTitle={tour.title}
              durationDays={tour.durationDays}
              durationNights={tour.durationNights}
              travelStyle={tour.travelStyle}
              startingPrice={tour.startingPrice}
            />
          </aside>
        </div>
      </div>

      <CtaBanner />
    </>
  );
}
