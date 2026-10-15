import { getBackendFirestore } from "../src/config/firebase.js";
import {
  destinationsSeed,
  experiencesSeed,
  reviewsSeed,
  toursSeed,
} from "../../frontend/src/lib/data/seed-dataset.ts";

const db = getBackendFirestore();
if (!db) {
  throw new Error("Set FIREBASE_PROJECT_ID and Google Application Default Credentials before seeding.");
}

const now = new Date().toISOString();
type SeedTour = {
  slug: string;
  title: string;
  tagline?: string;
  overview?: string;
  heroImage?: unknown;
  galleryImages?: Array<string | Record<string, unknown>>;
  travelStyle?: string;
  destinations?: string[];
  durationDays?: number;
  durationNights?: number;
  startingPrice?: string;
  currency?: string;
  priceType?: string;
  minTravelers?: number;
  maxTravelers?: number;
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: unknown[];
  activities?: string[];
  highlights?: string[];
  optionalActivities?: string[];
  suitableFor?: string[];
  bookingConditions?: string;
  cancellationPolicy?: string;
  faqs?: unknown[];
  seoTitle?: string;
  seoDescription?: string;
  isFeatured?: boolean;
};

const heroImage = (image: unknown, fallback: string, alt: string) => {
  if (typeof image === "object" && image !== null && "src" in image) {
    const value = image as { src?: string; alt?: string; caption?: string; focalPoint?: string };
    return {
      src: value.src || fallback,
      alt: value.alt || alt,
      caption: value.caption || "",
      focalPoint: value.focalPoint || "center",
    };
  }
  return { src: typeof image === "string" ? image : fallback, alt, caption: "", focalPoint: "center" };
};

async function seed() {
  await db.collection("siteSettings").doc("default").set({
    id: "global",
    company_name: process.env.NEXT_PUBLIC_COMPANY_NAME || "MANJU TOURS LANKA",
    tagline: "Your Personal Sri Lanka Travel Planner & Chauffeur-Guide",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+94 77 123 4567",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+94 77 123 4567",
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@manjutourslanka.com",
    address: "Galle Road, Hikkaduwa, Southern Province, Sri Lanka",
    opening_hours: "Daily: 7:00 AM - 10:00 PM (Sri Lanka Time GMT+5:30)",
    currency: "USD",
    supported_currencies: ["USD", "EUR", "GBP", "AUD", "LKR"],
    social_facebook: "https://facebook.com",
    social_instagram: "https://instagram.com",
    social_tripadvisor: "https://tripadvisor.com",
    social_youtube: "https://youtube.com",
    whatsapp_welcome_message: "Hello Manju Tours Lanka! I am planning a holiday to Sri Lanka and would like some advice on an itinerary.",
    logo_url: "/images/logo.png",
    favicon_url: "/favicon.ico",
    seo_title_default: "Manju Tours Lanka | Authentic Private Tours & Chauffeur Guide",
    seo_description_default: "Handcrafted private tours, dedicated English-speaking chauffeur-guides, scenic hill country, and pristine coastal escapes in Sri Lanka.",
    seo_keywords_default: "Sri Lanka tours, private driver Sri Lanka, chauffeur guide Sri Lanka, Hikkaduwa tours",
    seo_og_image: "/images/hero.webp",
    canonical_url: "https://manjutourslanka.com/",
    updated_at: now,
  }, { merge: true });

  for (const [index, item] of destinationsSeed.entries()) {
    const hero = heroImage(item.heroImage, `/images/destinations/${item.slug}/hero.webp`, item.name);
    await db.collection("destinations").doc(item.slug).set({
      id: `dest-${item.slug}`,
      slug: item.slug,
      name: item.name,
      tagline: item.tagline || "",
      region: item.region || "Cultural Triangle",
      summary: item.summary || "",
      content: item.content || "",
      hero_image: hero.src,
      hero_image_metadata: hero,
      gallery_images: (item.galleryImages || []).map((image) => typeof image === "string" ? { src: image, alt: item.name } : image),
      highlights: item.highlights || [],
      best_time_to_visit: item.bestTimeToVisit || "",
      ideal_duration: item.idealDuration || "2 - 3 Days",
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
      display_order: index + 1,
      is_featured: item.isFeatured ?? false,
      is_published: true,
      seo_title: `${item.name} Travel Guide | Manju Tours Lanka`,
      seo_description: item.summary || "",
      created_at: now,
      updated_at: now,
    }, { merge: true });
  }

  for (const [index, item] of (toursSeed as SeedTour[]).entries()) {
    const hero = heroImage(item.heroImage, "/images/destinations/sigiriya/hero.webp", item.title);
    await db.collection("tours").doc(item.slug).set({
      id: `tour-${item.slug}`,
      slug: item.slug,
      title: item.title,
      tagline: item.tagline || "",
      overview: item.overview || "",
      hero_image: hero.src,
      hero_image_metadata: hero,
      gallery_images: (item.galleryImages || []).map((image) => typeof image === "string" ? { src: image, alt: item.title } : image),
      travel_style: item.travelStyle || "Private Chauffeur Guide",
      destinations: item.destinations || [],
      duration_days: item.durationDays || 7,
      duration_nights: item.durationNights || Math.max(0, (item.durationDays || 7) - 1),
      starting_price: item.startingPrice || "Custom Quote",
      currency: item.currency || "USD",
      price_type: item.priceType || "custom_quote",
      min_travelers: item.minTravelers ?? 1,
      max_travelers: item.maxTravelers ?? 12,
      inclusions: item.inclusions || [],
      exclusions: item.exclusions || [],
      itinerary: item.itinerary || [],
      activities: item.activities || item.highlights || [],
      highlights: item.highlights || item.activities || [],
      optional_activities: item.optionalActivities || [],
      suitable_for: item.suitableFor || [],
      booking_conditions: item.bookingConditions || "Flexible booking with custom quote.",
      cancellation_policy: item.cancellationPolicy || "Free cancellation up to 14 days before arrival.",
      faqs: item.faqs || [],
      seo_title: item.seoTitle || `${item.title} | Sri Lanka Private Tour`,
      seo_description: item.seoDescription || item.tagline || "",
      display_order: index + 1,
      is_featured: item.isFeatured ?? false,
      is_published: true,
      created_at: now,
      updated_at: now,
    }, { merge: true });
  }

  for (const [index, item] of experiencesSeed.entries()) {
    await db.collection("experiences").doc(item.slug).set({
      id: `exp-${item.slug}`,
      ...item,
      isPublished: true,
      displayOrder: index + 1,
      createdAt: now,
      updatedAt: now,
    }, { merge: true });
  }

  for (const [index, item] of reviewsSeed.entries()) {
    await db.collection("reviews").doc(`rev-${index + 1}`).set({
      id: `rev-${index + 1}`,
      author_name: item.authorName,
      author_country: item.authorCountry,
      rating: item.rating || 5,
      review_date: item.reviewDate || "2026-01-01",
      travel_month: item.travelMonth || "2026",
      title: item.title,
      comment: item.comment,
      source: item.source || "Direct Feedback",
      is_published: item.isPublished ?? true,
      is_featured: item.isFeatured ?? true,
      created_at: now,
      updated_at: now,
    }, { merge: true });
  }

  console.log(`Seeded Firestore project ${process.env.FIREBASE_PROJECT_ID}: ${destinationsSeed.length} destinations, ${toursSeed.length} tours, ${experiencesSeed.length} experiences, ${reviewsSeed.length} reviews, and site settings.`);
}

seed().catch((error) => {
  console.error("Firestore seed failed:", error);
  process.exitCode = 1;
});
