import React from "react";
import type { Metadata } from "next";
import { getAllTours } from "@/lib/queries/tours";
import { getPublishedPageSections, getSection } from "@/lib/queries/page-sections";
import { getPageByKey } from "@/lib/queries/pages";
import TourFilterList from "@/components/tours/TourFilterList";
import Badge from "@/components/ui/Badge";
import CtaBanner from "@/components/home/CtaBanner";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageByKey("tours");
  return {
    title: page?.seo_title || "Sri Lanka Private Tours & Handcrafted Itineraries",
    description:
      page?.seo_description ||
      "Explore handcrafted private Sri Lanka tour itineraries escorted by licensed English-speaking chauffeur-guides.",
    openGraph: {
      title: page?.seo_title || "Sri Lanka Private Tours",
      description: page?.seo_description,
      images: [{ url: page?.seo_og_image || "/images/destinations/sigiriya/hero.webp" }],
    },
  };
}

export default async function ToursPage() {
  const [tours, sections] = await Promise.all([
    getAllTours(),
    getPublishedPageSections("tours"),
  ]);
  const hero = getSection(sections, "hero");

  return (
    <>
      {/* Header Banner */}
      {hero?.is_visible !== false && (
        <section className="bg-[#0C5A70] text-white py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
            <Badge variant="accent" className="mb-4">
              {hero?.badge || "Custom Chauffeured Packages"}
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-white">
              {hero?.title || "Handcrafted Sri Lanka Tour Packages"}
            </h1>
            <p className="text-base sm:text-lg text-[#FBF9F4]/90 leading-relaxed">
              {hero?.subtitle ||
                hero?.content ||
                "Every itinerary can be adjusted to match your exact dates, travel pace, and preferred hotels. All tours include private vehicle, driver-guide, fuel, and highway tolls."}
            </p>
          </div>
        </section>
      )}

      {/* Main Tours Content */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <TourFilterList initialTours={tours} />
      </section>

      {/* Conversion Banner */}
      <CtaBanner />
    </>
  );
}
