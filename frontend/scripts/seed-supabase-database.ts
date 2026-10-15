/**
 * MANJU TOURS LANKA — Supabase Database Seeder
 *
 * Populates tour packages, iconic destinations, and guest reviews into Supabase.
 * Uses the server-only SUPABASE_SERVICE_ROLE_KEY for authorized data writes.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import { toursSeed, destinationsSeed, reviewsSeed } from "../src/lib/data/seed-dataset";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error("❌ Missing Supabase credentials in .env.local.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface SeedDestinationItem {
  name: string;
  slug: string;
  tagline?: string;
  region?: string;
  summary?: string;
  content?: string;
  heroImage?: { src?: string };
  galleryImages?: Array<{ src: string }>;
  highlights?: string[];
  bestTimeToVisit?: string;
  idealDuration?: string;
  travelTips?: string;
  latitude?: number;
  longitude?: number;
  displayOrder?: number;
  isFeatured?: boolean;
}

interface SeedDayItem {
  day?: number;
  title?: string;
  description?: string;
  accommodation?: string;
  meals?: string;
  activities?: string[];
}

interface SeedTourItem {
  title: string;
  slug: string;
  tagline?: string;
  overview?: string;
  heroImage?: { src?: string };
  galleryImages?: Array<{ src: string }>;
  travelStyle?: string;
  destinations?: string[];
  durationDays?: number;
  durationNights?: number;
  startingPrice?: string;
  startingPriceNumeric?: number;
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: SeedDayItem[];
  highlights?: string[];
  displayOrder?: number;
  isFeatured?: boolean;
}

async function seedDatabase() {
  console.log("\n==================================================");
  console.log("🚀 Starting Supabase Database Seeding...");
  console.log(`Target URL: ${supabaseUrl}`);
  console.log("==================================================\n");

  // 1. Seed Destinations
  console.log("📍 1. Seeding Destinations...");
  for (let i = 0; i < destinationsSeed.length; i++) {
    const d = destinationsSeed[i] as unknown as SeedDestinationItem;
    const payload = {
      name: d.name,
      slug: d.slug,
      tagline: d.tagline || "",
      region: d.region || "Cultural Triangle",
      summary: d.summary || "",
      content: d.content || "",
      hero_image: d.heroImage?.src || `/images/destinations/${d.slug}/hero.webp`,
      hero_image_metadata: d.heroImage || {},
      gallery_images: d.galleryImages || [],
      highlights: d.highlights || [],
      best_time_to_visit: d.bestTimeToVisit || "Year-round",
      ideal_duration: d.idealDuration || "2 - 3 Days",
      travel_tips: d.travelTips || "",
      latitude: d.latitude || 0,
      longitude: d.longitude || 0,
      display_order: d.displayOrder ?? i + 1,
      is_featured: Boolean(d.isFeatured),
      is_published: true,
      seo_title: `${d.name} Travel Guide | Manju Tours Lanka`,
      seo_description: d.summary ? d.summary.slice(0, 160) : "",
    };

    const { error } = await supabase
      .from("destinations")
      .upsert(payload, { onConflict: "slug" });

    if (error) {
      console.warn(`  ⚠️ Destination "${d.name}":`, error.message);
    } else {
      console.log(`  ✅ Destination synced: "${d.name}" (${d.slug})`);
    }
  }

  // 2. Seed Tour Packages
  console.log("\n🧭 2. Seeding Tour Packages...");
  for (let i = 0; i < toursSeed.length; i++) {
    const t = toursSeed[i] as unknown as SeedTourItem;
    const payload = {
      title: t.title,
      slug: t.slug,
      tagline: t.tagline || "",
      overview: t.overview || "",
      hero_image: t.heroImage?.src || "/images/destinations/sigiriya/hero.webp",
      hero_image_metadata: t.heroImage || {},
      gallery_images: t.galleryImages || [],
      travel_style: t.travelStyle || "Private Chauffeur Guide",
      destinations: t.destinations || [],
      duration_days: t.durationDays || 7,
      duration_nights: t.durationNights || 6,
      starting_price: t.startingPrice || "From $850 USD",
      starting_price_numeric: t.startingPriceNumeric || 850,
      currency: "USD",
      price_type: "per_person",
      min_travelers: 1,
      max_travelers: 8,
      inclusions: t.inclusions || [],
      exclusions: t.exclusions || [],
      itinerary: (t.itinerary || []).map((day: SeedDayItem, idx: number) => ({
        day: idx + 1,
        title: day.title || `Day ${idx + 1}`,
        description: day.description || "",
        accommodation: day.accommodation || "Comfortable Hotel / Boutique Villa",
        meals: day.meals || "Breakfast Included",
        activities: Array.isArray(day.activities) ? day.activities.join(", ") : "",
      })),
      accommodation_details: "Curated 3 to 4-star boutique hotels with daily breakfast included.",
      transport_details: "Private modern air-conditioned vehicle with dedicated English-speaking chauffeur-guide.",
      meals_included: "Daily breakfast included at hotels. Optional local lunches and dinners.",
      activities: t.highlights || [],
      optional_activities: [],
      suitable_for: ["Couples", "Families", "Solo Travelers", "Small Groups"],
      booking_conditions: "20% refundable deposit required upon booking confirmation.",
      cancellation_policy: "Free cancellation up to 14 days before tour arrival date.",
      faqs: [],
      seo_title: `${t.title} (${t.durationDays} Days) | Manju Tours Lanka`,
      seo_description: t.tagline || (t.overview ? t.overview.slice(0, 160) : ""),
      display_order: t.displayOrder ?? i + 1,
      is_featured: Boolean(t.isFeatured),
      is_published: true,
    };

    const { error } = await supabase
      .from("tour_packages")
      .upsert(payload, { onConflict: "slug" });

    if (error) {
      console.warn(`  ⚠️ Tour "${t.title}":`, error.message);
    } else {
      console.log(`  ✅ Tour package synced: "${t.title}" (${t.slug})`);
    }
  }

  // 3. Seed Reviews
  console.log("\n⭐ 3. Seeding Guest Reviews...");
  for (let i = 0; i < reviewsSeed.length; i++) {
    const r = reviewsSeed[i];
    const payload = {
      author_name: r.authorName,
      author_country: r.authorCountry || "International Traveler",
      rating: r.rating || 5,
      review_date: r.reviewDate || "2026-02-15",
      travel_month: r.travelMonth || "",
      title: r.title || "Unforgettable Tour in Sri Lanka",
      comment: r.comment,
      source: r.source || "TripAdvisor",
      tour_title: "10-Day Sri Lanka Discovery",
      is_verified: true,
      is_featured: Boolean(r.isFeatured),
      display_order: i + 1,
    };

    const { error } = await supabase.from("reviews").insert([payload]);
    if (error) {
      console.warn(`  ⚠️ Review "${r.authorName}":`, error.message);
    } else {
      console.log(`  ✅ Review synced: "${r.authorName}"`);
    }
  }

  console.log("\n==================================================");
  console.log("🎉 Seeding complete! Database populated successfully.");
  console.log("==================================================\n");
}

seedDatabase().catch((err) => {
  console.error("Seeding fatal error:", err);
  process.exit(1);
});
