import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";
import { toursSeed } from "../src/lib/data/seed-dataset";
import type { TourPackageInsert } from "../src/types/database.types";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const TOUR_DESTINATIONS_MAP: Record<string, string[]> = {
  "grand-sri-lanka-odyssey": [
    "Negombo",
    "Sigiriya",
    "Dambulla",
    "Kandy",
    "Nuwara Eliya",
    "Ella",
    "Yala National Park",
    "Mirissa",
    "Galle Fort",
    "Hikkaduwa",
  ],
  "cultural-triangle-hill-country-classic": [
    "Sigiriya",
    "Polonnaruwa",
    "Dambulla",
    "Kandy",
    "Nuwara Eliya",
    "Ella",
  ],
  "southern-coast-marine-wildlife": [
    "Mirissa",
    "Galle Fort",
    "Yala National Park",
    "Hikkaduwa",
    "Bentota",
  ],
  "romantic-ceylon-honeymoon": [
    "Negombo",
    "Kandy",
    "Nuwara Eliya",
    "Ella",
    "Mirissa",
    "Galle Fort",
  ],
  "wild-lanka-safari-expedition": [
    "Wilpattu",
    "Minneriya",
    "Yala National Park",
    "Mirissa",
  ],
  "ceylon-highlights-express": [
    "Kandy",
    "Nuwara Eliya",
    "Galle Fort",
    "Colombo",
  ],
};

const DEFAULT_FAQS = [
  {
    question: "Can this tour itinerary be customized?",
    answer: "Yes, 100%! All itineraries with Manju Tours Lanka are private and flexible. You can adjust durations, swap destinations, select different hotels, and change daily start times.",
  },
  {
    question: "What vehicle is provided for this tour?",
    answer: "A modern, fully air-conditioned private vehicle (sedan car for 1–3 guests, or luxury microvan for 4+ guests) dedicated solely to your group throughout the journey.",
  },
  {
    question: "Are fuel, highway tolls, and driver lodging included?",
    answer: "Yes. All fuel, parking fees, expressway toll tickets, and driver meals and accommodation are included in our quotes with zero hidden charges.",
  },
];

async function seedTourPackages() {
  console.log("==================================================");
  console.log("🧭 MANJU TOURS LANKA — Seed Tour Packages to Supabase");
  console.log("==================================================");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local for this server-side seed operation.");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  console.log(`\nFound ${toursSeed.length} baseline tour packages in seed dataset.`);

  for (let i = 0; i < toursSeed.length; i++) {
    const tour = toursSeed[i];
    const heroImage =
      typeof tour.heroImage === "string"
        ? tour.heroImage
        : tour.heroImage?.src || "/images/destinations/sigiriya/hero.webp";

    const destinations = TOUR_DESTINATIONS_MAP[tour.slug] || ["Sigiriya", "Kandy", "Ella"];

    const payload: TourPackageInsert = {
      title: tour.title,
      slug: tour.slug,
      tagline: tour.tagline || "",
      overview: tour.overview || "",
      hero_image: heroImage,
      hero_image_metadata: typeof tour.heroImage === "object" ? tour.heroImage : null,
      gallery_images: Array.isArray(tour.galleryImages)
        ? tour.galleryImages.map((g) => (typeof g === "string" ? { src: g } : g))
        : [],
      travel_style: tour.travelStyle || "Private Chauffeur",
      destinations,
      duration_days: tour.durationDays,
      duration_nights: tour.durationNights,
      starting_price: tour.startingPrice || "Request a Quote",
      starting_price_numeric: 0,
      currency: "USD",
      price_type: "custom_quote",
      min_travelers: 1,
      max_travelers: 12,
      inclusions: tour.inclusions || [
        "Private air-conditioned luxury vehicle (Car / Van) for all days",
        "Dedicated professional English-speaking chauffeur-guide",
        "All fuel, highway toll charges, driver lodging & meals",
        "Airport pick-up and airport drop-off transfers",
      ],
      exclusions: tour.exclusions || [
        "International flights and Sri Lanka ETA tourist visa",
        "Entrance tickets to monuments and national parks",
        "Personal expenses, drinks and discretionary tips",
      ],
      itinerary: (tour.itinerary || []) as unknown as TourPackageInsert["itinerary"],
      accommodation_details: "3-star to 5-star handpicked boutique villas and star hotels matching your preference",
      transport_details: "Private air-conditioned vehicle with dedicated English-speaking chauffeur-guide, fuel, highway tolls & parking fees included",
      meals_included: "Daily breakfast at all accommodation stops, selected traditional dinners",
      activities: tour.highlights || [],
      optional_activities: ["Whale Watching Cruise", "Hot Air Balloon Flight", "Ayurvedic Spa"],
      suitable_for: ["Couples & Honeymooners", "Families with Kids", "Culture Enthusiasts", "Photographers"],
      booking_conditions: "Flexible booking with custom quote. Pacing and route can be modified to your flight schedule.",
      cancellation_policy: "Free cancellation up to 14 days before tour arrival date.",
      faqs: DEFAULT_FAQS,
      seo_title: `${tour.title} (${tour.durationDays} Days Tour) | Manju Tours Lanka`,
      seo_description: tour.tagline || tour.overview.slice(0, 160),
      display_order: tour.displayOrder ?? i + 1,
      is_featured: Boolean(tour.isFeatured),
      is_published: true,
    };

    console.log(`\nUpserting [${i + 1}/${toursSeed.length}]: "${tour.title}" (${tour.slug})...`);

    // Check if package exists by slug
    const { data: existing } = await supabase
      .from("tour_packages")
      .select("id")
      .eq("slug", tour.slug)
      .maybeSingle();

    if (existing) {
      const { error: updateErr } = await supabase
        .from("tour_packages")
        .update(payload)
        .eq("id", existing.id);

      if (updateErr) {
        console.warn(`  ⚠️ Update warning for "${tour.title}":`, updateErr.message);
      } else {
        console.log(`  ✅ Updated existing package ID: ${existing.id}`);
      }
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from("tour_packages")
        .insert(payload)
        .select("id")
        .single();

      if (insertErr) {
        console.warn(`  ⚠️ Insert warning for "${tour.title}":`, insertErr.message);
      } else {
        console.log(`  ✅ Inserted new package ID: ${inserted?.id}`);
      }
    }
  }

  console.log("\n==================================================");
  console.log("🎉 Seeding complete! All packages are synced with Supabase.");
  console.log("==================================================");
}

seedTourPackages().catch((err) => {
  console.error("Migration fatal error:", err);
  process.exit(1);
});
