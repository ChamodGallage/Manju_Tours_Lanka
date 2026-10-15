import { getFirebaseFirestore } from "@/lib/firebase/client";
import { collection, doc, getDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { mockTours } from "../data/mock-data";
import { getSiteImages } from "./site-images";
import type { TourPackage, ItineraryDay, PackageFaq } from "@/types/database.types";

export interface FormattedTour {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  overview: string;
  heroImage: string;
  heroImageMetadata?: {
    src?: string;
    alt?: string;
    caption?: string;
    focalPoint?: string;
    isStock?: boolean;
  } | null;
  galleryImages: Array<{ src: string; alt?: string; caption?: string }>;
  travelStyle: string;
  destinations: string[];
  durationDays: number;
  durationNights: number;
  startingPrice: string;
  currency: string;
  priceType: "per_person" | "per_group" | "custom_quote";
  minTravelers: number;
  maxTravelers: number;
  inclusions: string[];
  exclusions: string[];
  itinerary: ItineraryDay[];
  accommodationDetails?: string;
  transportDetails?: string;
  mealsIncluded?: string;
  activities: string[];
  highlights: string[];
  optionalActivities?: string[];
  suitableFor: string[];
  bookingConditions?: string;
  cancellationPolicy?: string;
  faqs: PackageFaq[];
  seoTitle?: string;
  seoDescription?: string;
  displayOrder: number;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  // snake_case aliases for direct DB field compatibility
  hero_image: string;
  hero_image_metadata?: {
    src?: string;
    alt?: string;
    caption?: string;
    focalPoint?: string;
    isStock?: boolean;
  } | null;
  gallery_images: Array<{ src: string; alt?: string; caption?: string }>;
  travel_style: string;
  duration_days: number;
  duration_nights: number;
  starting_price: string;
  price_type: "per_person" | "per_group" | "custom_quote";
  min_travelers: number;
  max_travelers: number;
  accommodation_details?: string;
  transport_details?: string;
  meals_included?: string;
  optional_activities?: string[];
  suitable_for: string[];
  booking_conditions?: string;
  cancellation_policy?: string;
  seo_title?: string;
  seo_description?: string;
  display_order: number;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Normalizes a database TourPackage row into FormattedTour with both camelCase and snake_case properties
 */
export function formatTourPackage(pkg: Partial<TourPackage> & { slug: string; title: string }): FormattedTour {
  const durationDays = Number(pkg.duration_days ?? (pkg as unknown as { durationDays?: number }).durationDays ?? 1);
  const durationNights = Number(pkg.duration_nights ?? (pkg as unknown as { durationNights?: number }).durationNights ?? Math.max(0, durationDays - 1));
  const travelStyle = pkg.travel_style || (pkg as unknown as { travelStyle?: string }).travelStyle || "Private Chauffeur";
  const startingPrice = pkg.starting_price || (pkg as unknown as { startingPrice?: string }).startingPrice || "Request a Quote";

  // Hero image resolution
  let heroImage = pkg.hero_image || "";
  if (!heroImage && pkg.hero_image_metadata?.src) {
    heroImage = pkg.hero_image_metadata.src;
  }
  if (!heroImage && (pkg as unknown as { heroImage?: string | { src: string } }).heroImage) {
    const rawHero = (pkg as unknown as { heroImage: string | { src: string } }).heroImage;
    heroImage = typeof rawHero === "string" ? rawHero : rawHero?.src || "";
  }
  if (!heroImage) {
    heroImage = `/images/destinations/sigiriya/hero.webp`;
  }

  // Gallery resolution
  let galleryImages: Array<{ src: string; alt?: string; caption?: string }> = [];
  if (Array.isArray(pkg.gallery_images) && pkg.gallery_images.length > 0) {
    galleryImages = pkg.gallery_images;
  } else if (Array.isArray((pkg as unknown as { galleryImages?: unknown[] }).galleryImages)) {
    const rawG = (pkg as unknown as { galleryImages: unknown[] }).galleryImages;
    galleryImages = rawG.map((img) => (typeof img === "string" ? { src: img, alt: pkg.title } : (img as { src: string; alt?: string })));
  }

  // Highlights / Activities resolution
  const activitiesList: string[] = Array.isArray(pkg.activities)
    ? pkg.activities
    : Array.isArray((pkg as unknown as { highlights?: string[] }).highlights)
    ? (pkg as unknown as { highlights: string[] }).highlights
    : [];

  // Destinations resolution
  const destinationsList: string[] = Array.isArray(pkg.destinations) ? pkg.destinations : [];

  // Itinerary resolution
  const itineraryList: ItineraryDay[] = Array.isArray(pkg.itinerary) ? (pkg.itinerary as ItineraryDay[]) : [];

  // Inclusions & Exclusions resolution
  const inclusionsList: string[] = Array.isArray(pkg.inclusions) ? pkg.inclusions : [];
  const exclusionsList: string[] = Array.isArray(pkg.exclusions) ? pkg.exclusions : [];

  // FAQs resolution
  const faqsList: PackageFaq[] = Array.isArray(pkg.faqs) ? (pkg.faqs as PackageFaq[]) : [];

  // Suitable for resolution
  const suitableForList: string[] = Array.isArray(pkg.suitable_for)
    ? pkg.suitable_for
    : ["Couples", "Families", "Culture Enthusiasts", "Photographers"];

  const isPublished = pkg.is_published ?? (pkg as unknown as { published?: boolean }).published ?? true;
  const isFeatured = pkg.is_featured ?? (pkg as unknown as { isFeatured?: boolean }).isFeatured ?? false;
  const displayOrder = pkg.display_order ?? (pkg as unknown as { displayOrder?: number }).displayOrder ?? 0;

  return {
    id: pkg.id || `tour-${pkg.slug}`,
    title: pkg.title,
    slug: pkg.slug,
    tagline: pkg.tagline || "",
    overview: pkg.overview || "",
    heroImage,
    heroImageMetadata: pkg.hero_image_metadata || null,
    galleryImages,
    travelStyle,
    destinations: destinationsList,
    durationDays,
    durationNights,
    startingPrice,
    currency: pkg.currency || "USD",
    priceType: pkg.price_type || "custom_quote",
    minTravelers: pkg.min_travelers ?? 1,
    maxTravelers: pkg.max_travelers ?? 12,
    inclusions: inclusionsList,
    exclusions: exclusionsList,
    itinerary: itineraryList,
    accommodationDetails: pkg.accommodation_details || "3-star to 5-star handpicked boutique villas and star hotels matching your preference",
    transportDetails: pkg.transport_details || "Private air-conditioned vehicle with dedicated English-speaking chauffeur-guide, fuel, highway tolls & parking fees included",
    mealsIncluded: pkg.meals_included || "Daily breakfast at all accommodation stops",
    activities: activitiesList,
    highlights: activitiesList,
    optionalActivities: pkg.optional_activities || [],
    suitableFor: suitableForList,
    bookingConditions: pkg.booking_conditions || "Flexible booking with custom quote. Pacing and route can be modified to your flight schedule.",
    cancellationPolicy: pkg.cancellation_policy || "Free cancellation up to 14 days before tour arrival date.",
    faqs: faqsList,
    seoTitle: pkg.seo_title || `${pkg.title} | Sri Lanka Private Tour`,
    seoDescription: pkg.seo_description || pkg.tagline || pkg.overview?.slice(0, 160) || "",
    displayOrder,
    isFeatured,
    isPublished,
    createdAt: pkg.created_at || new Date().toISOString(),
    updatedAt: pkg.updated_at || new Date().toISOString(),
    // Snake case mirrors
    hero_image: heroImage,
    hero_image_metadata: pkg.hero_image_metadata || null,
    gallery_images: galleryImages,
    travel_style: travelStyle,
    duration_days: durationDays,
    duration_nights: durationNights,
    starting_price: startingPrice,
    price_type: pkg.price_type || "custom_quote",
    min_travelers: pkg.min_travelers ?? 1,
    max_travelers: pkg.max_travelers ?? 12,
    accommodation_details: pkg.accommodation_details || "",
    transport_details: pkg.transport_details || "",
    meals_included: pkg.meals_included || "",
    optional_activities: pkg.optional_activities || [],
    suitable_for: suitableForList,
    booking_conditions: pkg.booking_conditions || "",
    cancellation_policy: pkg.cancellation_policy || "",
    seo_title: pkg.seo_title || "",
    seo_description: pkg.seo_description || "",
    display_order: displayOrder,
    is_featured: isFeatured,
    is_published: isPublished,
    created_at: pkg.created_at || new Date().toISOString(),
    updated_at: pkg.updated_at || new Date().toISOString(),
  };
}

/**
 * Enriches tours with photos managed in site_images if overridden
 */
async function enrichToursWithSiteImages(tours: FormattedTour[]): Promise<FormattedTour[]> {
  try {
    const siteImages = await getSiteImages();
    if (!siteImages || siteImages.length === 0) return tours;

    return tours.map((tour) => {
      const match = siteImages.find(
        (img) =>
          (img.id.includes(tour.slug) ||
            img.title.toLowerCase().includes(tour.slug.replace(/-/g, " ")) ||
            img.section_key === tour.slug) &&
          (img.page_key === "tours" || img.category === "tour")
      );
      if (match && match.image_url) {
        return {
          ...tour,
          heroImage: match.image_url,
          hero_image: match.image_url,
        };
      }
      return tour;
    });
  } catch {
    return tours;
  }
}

/**
 * Fetch all tour packages.
 * By default returns published tours, or all if includeUnpublished is true (for admin).
 */
export async function getAllTours(options: { includeUnpublished?: boolean } = {}): Promise<FormattedTour[]> {
  const db = getFirebaseFirestore();

  if (db) {
    try {
      const toursCol = collection(db, "tours");
      const q = options.includeUnpublished
        ? query(toursCol, orderBy("display_order", "asc"))
        : query(toursCol, where("is_published", "==", true), orderBy("display_order", "asc"));

      const snap = await getDocs(q);
      if (!snap.empty) {
        const formatted = snap.docs.map((d) =>
          formatTourPackage(d.data() as Partial<TourPackage> & { slug: string; title: string })
        );
        return enrichToursWithSiteImages(formatted);
      }
    } catch (err) {
      console.warn("Firestore tours query notice, checking fallback:", err);
    }
  }

  // Fallback: Static Seed Dataset
  let list = mockTours.map((t) => formatTourPackage(t as unknown as TourPackage));
  if (!options.includeUnpublished) {
    list = list.filter((t) => t.isPublished);
  }
  return enrichToursWithSiteImages(list);
}

/**
 * Fetch featured tour packages for the homepage showcase
 */
export async function getFeaturedTours(): Promise<FormattedTour[]> {
  const db = getFirebaseFirestore();

  if (db) {
    try {
      const toursCol = collection(db, "tours");
      const q = query(
        toursCol,
        where("is_published", "==", true),
        where("is_featured", "==", true),
        orderBy("display_order", "asc")
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const formatted = snap.docs.map((d) =>
          formatTourPackage(d.data() as Partial<TourPackage> & { slug: string; title: string })
        );
        return enrichToursWithSiteImages(formatted);
      }
    } catch (err) {
      console.warn("Firestore featured tours query notice, checking fallback:", err);
    }
  }

  // Fallback: Mock tours with isFeatured
  const list = mockTours
    .filter((t) => t.isFeatured)
    .map((t) => formatTourPackage(t as unknown as TourPackage));
  return enrichToursWithSiteImages(list);
}

/**
 * Fetch a single tour package by its unique slug
 */
export async function getTourBySlug(slug: string): Promise<FormattedTour | null> {
  const db = getFirebaseFirestore();

  if (db) {
    try {
      const docRef = doc(db, "tours", slug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const formatted = formatTourPackage(docSnap.data() as Partial<TourPackage> & { slug: string; title: string });
        const enriched = await enrichToursWithSiteImages([formatted]);
        return enriched[0];
      }

      // Query by slug field if key differed
      const q = query(collection(db, "tours"), where("slug", "==", slug));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const formatted = formatTourPackage(snap.docs[0].data() as Partial<TourPackage> & { slug: string; title: string });
        const enriched = await enrichToursWithSiteImages([formatted]);
        return enriched[0];
      }
    } catch (err) {
      console.warn(`Firestore tour query for ${slug} notice:`, err);
    }
  }

  // Fallback: Find in seed mock data
  const found = mockTours.find((t) => t.slug === slug);
  if (!found) return null;

  const formatted = formatTourPackage(found as unknown as TourPackage);
  const enriched = await enrichToursWithSiteImages([formatted]);
  return enriched[0];
}

/**
 * Fetch tours that visit a specific destination
 */
export async function getToursByDestination(destinationSlugOrName: string): Promise<FormattedTour[]> {
  const allTours = await getAllTours();
  const searchLower = destinationSlugOrName.toLowerCase().replace(/-/g, " ");

  return allTours.filter((tour) => {
    if (
      tour.destinations &&
      tour.destinations.some((d) => d.toLowerCase().includes(searchLower) || searchLower.includes(d.toLowerCase()))
    ) {
      return true;
    }
    const inOverview = tour.overview.toLowerCase().includes(searchLower);
    const inHighlights = tour.highlights.some((h) => h.toLowerCase().includes(searchLower));
    const inItinerary = tour.itinerary.some(
      (item) =>
        item.title.toLowerCase().includes(searchLower) || item.description.toLowerCase().includes(searchLower)
    );

    return inOverview || inHighlights || inItinerary;
  });
}
