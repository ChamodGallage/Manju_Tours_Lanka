import React from "react";
import HeroSection from "@/components/home/HeroSection";
import QuickLinksStrip from "@/components/home/QuickLinksStrip";
import ExperiencePillars from "@/components/home/ExperiencePillars";
import PlanTripWidget from "@/components/home/PlanTripWidget";
import FeaturedTours from "@/components/home/FeaturedTours";
import WhyUsSection from "@/components/home/WhyUsSection";
import DestinationsPreview from "@/components/home/DestinationsPreview";
import ExperiencesShowcase from "@/components/home/ExperiencesShowcase";
import IslandStoriesSection from "@/components/home/IslandStoriesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CtaBanner from "@/components/home/CtaBanner";
import { getFeaturedTours } from "@/lib/queries/tours";
import { getFeaturedDestinations } from "@/lib/queries/destinations";
import { getFeaturedExperiences } from "@/lib/queries/experiences";
import { getFeaturedReviews } from "@/lib/queries/reviews";
import { getHeroSlides, getPillarImages } from "@/lib/queries/site-images";
import { getPublishedPageSections, getSection } from "@/lib/queries/page-sections";
import { getPageByKey } from "@/lib/queries/pages";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/queries/site-settings";
import { normalizeSafeUrl } from "@/lib/sanitize";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, pageRecord] = await Promise.all([getSiteSettings(), getPageByKey("home")]);
  const title = pageRecord?.seo_title || settings.seo_title_default || "Manju Tours Lanka | Authentic Private Tours & Chauffeur Guide";
  const description = pageRecord?.seo_description || settings.seo_description_default || "Handcrafted private tours, dedicated English-speaking chauffeur-guides, scenic hill country, and pristine coastal escapes in Sri Lanka.";
  const ogImage = normalizeSafeUrl(pageRecord?.seo_og_image || settings.seo_og_image) || "/images/hero.webp";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage }],
    },
    alternates: { canonical: normalizeSafeUrl(settings.canonical_url) || "/" },
  };
}

export default async function HomePage() {
  const [
    featuredTours,
    featuredDestinations,
    featuredExperiences,
    featuredReviews,
    heroSlides,
    pillarImages,
    pageSections,
  ] = await Promise.all([
    getFeaturedTours(),
    getFeaturedDestinations(),
    getFeaturedExperiences(),
    getFeaturedReviews(),
    getHeroSlides(),
    getPillarImages(),
    getPublishedPageSections("home"),
  ]);

  const isVisible = (key: string) => {
    const sec = getSection(pageSections, key);
    return sec ? sec.is_visible : true;
  };

  return (
    <>
      {/* 1. Cinematic Full-Screen Hero with Short Welcome Headline & Category Buttons */}
      {isVisible("hero") && (
        <HeroSection slides={heroSlides} content={getSection(pageSections, "hero")} />
      )}

      {/* 2. "Plan Your Dream Holiday" Quick-Links Strip (Visa, Tours, Trips, Tips) */}
      {isVisible("quick_links") && <QuickLinksStrip />}

      {/* 3. Interactive Plan My Trip Widget (Hands off to /custom-tour) */}
      {isVisible("plan_trip") && <PlanTripWidget />}

      {/* 4. Eight Visual Experience Categories as Big Tiles (Wild, Pristine, Bliss, Scenic, Thrills, Festive, Heritage, Essence) */}
      {isVisible("pillars") && (
        <div id="pillars">
          <ExperiencePillars customImages={pillarImages} />
        </div>
      )}

      {/* 5. Featured Signature Tours */}
      {isVisible("featured_tours") && (
        <div id="tours">
          <FeaturedTours tours={featuredTours} />
        </div>
      )}

      {/* 6. Why Travel with Manju Tours Lanka (Local Chauffeur Trust) */}
      {isVisible("why_us") && (
        <WhyUsSection content={getSection(pageSections, "why_us")} />
      )}

      {/* 7. Iconic Destinations Preview */}
      {isVisible("destinations_preview") && (
        <div id="destinations">
          <DestinationsPreview destinations={featuredDestinations} />
        </div>
      )}

      {/* 8. Curated Island Experiences */}
      {isVisible("experiences_showcase") && (
        <div id="experiences">
          <ExperiencesShowcase experiences={featuredExperiences} />
        </div>
      )}

      {/* 9. Island Stories & Local Travel Guides */}
      {isVisible("stories_preview") && (
        <div id="stories">
          <IslandStoriesSection />
        </div>
      )}

      {/* 10. Guest Testimonials & Reviews */}
      {isVisible("testimonials") && (
        <TestimonialsSection reviews={featuredReviews} />
      )}

      {/* 11. High-Conversion Final CTA Banner */}
      {isVisible("cta_banner") && (
        <CtaBanner content={getSection(pageSections, "cta_banner")} />
      )}
    </>
  );
}
