/**
 * MANJU TOURS LANKA — Cloud Firestore Seeding & Migration Script
 *
 * Populates Cloud Firestore with:
 * 1. Destinations (all 11 iconic Sri Lanka locations)
 * 2. Tour Packages (all signature itineraries with day-by-day maps)
 * 3. Site Settings (branding, WhatsApp, contact, SEO defaults)
 * 4. Guest Reviews & Testimonials
 *
 * Safe to run multiple times (idempotent setDoc).
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load .env.local and .env
const envLocalPath = path.resolve(process.cwd(), ".env.local");
const frontendEnvLocalPath = path.resolve(process.cwd(), "frontend/.env.local");
const envPath = path.resolve(process.cwd(), ".env");

if (fs.existsSync(envLocalPath)) dotenv.config({ path: envLocalPath });
if (fs.existsSync(frontendEnvLocalPath)) dotenv.config({ path: frontendEnvLocalPath });
if (fs.existsSync(envPath)) dotenv.config({ path: envPath });

import { destinationsSeed, toursSeed, reviewsSeed } from "../frontend/src/lib/data/seed-dataset";

async function runSeed() {
  console.log("==================================================");
  console.log("🌴 MANJU TOURS LANKA — Firestore Seeding Script");
  console.log("==================================================");

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !projectId || apiKey.includes("paste-") || projectId.includes("paste-")) {
    console.error("❌ Firebase Web App configuration is missing or contains placeholder values.");
    console.error("Please add the 6 NEXT_PUBLIC_FIREBASE_* variables to .env.local and try again.\n");
    process.exit(1);
  }

  const app = getApps().length > 0 ? getApp() : initializeApp({
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  });

  const db = getFirestore(app);

  console.log(`📡 Connected to Firebase Project: ${projectId}`);

  // 1. Seed Site Settings
  console.log("\n1. Seeding Site Settings (siteSettings/default)...");
  const siteSettingsData = {
    company_name: process.env.NEXT_PUBLIC_COMPANY_NAME || "MANJU TOURS LANKA",
    tagline: process.env.NEXT_PUBLIC_COMPANY_TAGLINE || "Your Personal Sri Lanka Travel Planner",
    location: process.env.NEXT_PUBLIC_COMPANY_LOCATION || "Galle Road, Hikkaduwa, Southern Province, Sri Lanka",
    whatsapp_number: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+94771234567",
    contact_phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+94771234567",
    contact_email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@manjutourslanka.com",
    site_url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    seo_title_default: "Manju Tours Lanka | Authentic Private Tours & Chauffeur Guide",
    seo_description_default: "Handcrafted private tours, dedicated English-speaking chauffeur-guides, scenic hill country, and pristine coastal escapes in Sri Lanka.",
    seo_og_image: "/images/hero.webp",
    canonical_url: "/",
    updated_at: new Date().toISOString(),
  };
  await setDoc(doc(db, "siteSettings", "default"), siteSettingsData, { merge: true });
  console.log("✅ Site settings seeded successfully.");

  // 2. Seed Destinations
  console.log(`\n2. Seeding ${destinationsSeed.length} Destinations...`);
  let destCount = 0;
  for (const d of destinationsSeed) {
    const heroSrc = typeof d.heroImage === "object" ? d.heroImage?.src : `/images/destinations/${d.slug}/hero.webp`;
    const heroAlt = typeof d.heroImage === "object" ? d.heroImage?.alt : d.name;
    const heroCaption = typeof d.heroImage === "object" ? d.heroImage?.caption : (d.tagline || "");
    const focalPoint = typeof d.heroImage === "object" ? d.heroImage?.focalPoint : "center 30%";

    const destinationDoc = {
      id: `dest-${d.slug}`,
      slug: d.slug,
      name: d.name,
      tagline: d.tagline || "",
      region: d.region || "Cultural Triangle",
      summary: d.summary || "",
      content: d.content || "",
      hero_image: heroSrc,
      hero_image_metadata: {
        src: heroSrc,
        alt: heroAlt,
        caption: heroCaption,
        focalPoint,
      },
      gallery_images: (d.galleryImages || []).map((g) => ({
        src: typeof g === "string" ? g : g.src,
        alt: typeof g === "object" ? g.alt : d.name,
        caption: typeof g === "object" ? g.caption : "",
      })),
      highlights: d.highlights || [],
      best_time_to_visit: d.bestTimeToVisit || "",
      ideal_duration: (d as unknown as { idealDuration?: string }).idealDuration || "2 - 3 Days",
      travel_tips: (d as unknown as { travelTips?: string }).travelTips || "",
      latitude: d.latitude || 0,
      longitude: d.longitude || 0,
      display_order: destCount,
      is_featured: d.isFeatured ?? true,
      is_published: true,
      seo_title: `${d.name} Travel Guide | Manju Tours Lanka`,
      seo_description: d.summary || "",
      created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
      updated_at: new Date().toISOString(),
    };

    await setDoc(doc(db, "destinations", d.slug), destinationDoc, { merge: true });
    destCount++;
    console.log(`   - [${destCount}/${destinationsSeed.length}] ${d.name} (${d.slug})`);
  }
  console.log(`✅ ${destCount} destinations seeded successfully.`);

  // 3. Seed Tour Packages
  console.log(`\n3. Seeding ${toursSeed.length} Tour Packages...`);
  let tourCount = 0;
  for (const t of toursSeed) {
    const rawHero = typeof t.heroImage === "object" ? t.heroImage?.src : t.heroImage || `/images/destinations/sigiriya/hero.webp`;
    const heroAlt = typeof t.heroImage === "object" ? t.heroImage?.alt : t.title;

    const tourDoc = {
      id: `tour-${t.slug}`,
      slug: t.slug,
      title: t.title,
      tagline: t.tagline || "",
      overview: t.overview || "",
      hero_image: rawHero,
      hero_image_metadata: {
        src: rawHero,
        alt: heroAlt,
      },
      gallery_images: (t.galleryImages || []).map((img) =>
        typeof img === "string" ? { src: img, alt: t.title } : img
      ),
      travel_style: t.travelStyle || "Private Chauffeur Guide",
      destinations: t.destinations || [],
      duration_days: t.durationDays || 7,
      duration_nights: t.durationNights || Math.max(0, (t.durationDays || 7) - 1),
      starting_price: t.startingPrice || "Custom Quote",
      currency: t.currency || "USD",
      price_type: t.priceType || "custom_quote",
      min_travelers: t.minTravelers ?? 1,
      max_travelers: t.maxTravelers ?? 12,
      inclusions: t.inclusions || [],
      exclusions: t.exclusions || [],
      itinerary: t.itinerary || [],
      accommodation_details: t.accommodationDetails || "Handpicked 3-star to 5-star boutique villas and star hotels",
      transport_details: t.transportDetails || "Private air-conditioned vehicle with dedicated English-speaking chauffeur-guide",
      meals_included: t.mealsIncluded || "Daily breakfast at all accommodation stops",
      activities: t.activities || t.highlights || [],
      highlights: t.highlights || t.activities || [],
      optional_activities: t.optionalActivities || [],
      suitable_for: t.suitableFor || ["Couples", "Families", "Culture Enthusiasts"],
      booking_conditions: t.bookingConditions || "Flexible booking with custom quote.",
      cancellation_policy: t.cancellationPolicy || "Free cancellation up to 14 days before tour arrival date.",
      faqs: t.faqs || [],
      seo_title: t.seoTitle || `${t.title} | Sri Lanka Private Tour`,
      seo_description: t.seoDescription || t.tagline || t.overview?.slice(0, 160) || "",
      display_order: tourCount,
      is_featured: t.isFeatured ?? true,
      is_published: true,
      created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
      updated_at: new Date().toISOString(),
    };

    await setDoc(doc(db, "tours", t.slug), tourDoc, { merge: true });
    tourCount++;
    console.log(`   - [${tourCount}/${toursSeed.length}] ${t.title} (${t.slug})`);
  }
  console.log(`✅ ${tourCount} tour packages seeded successfully.`);

  // 4. Seed Reviews
  console.log(`\n4. Seeding ${reviewsSeed.length} Reviews...`);
  let revCount = 0;
  for (const r of reviewsSeed) {
    const revDoc = {
      id: `rev-${revCount + 1}`,
      author_name: r.authorName,
      author_country: r.authorCountry,
      rating: r.rating || 5,
      review_date: r.reviewDate || "2026-01-01",
      travel_month: r.travelMonth || "2026",
      title: r.title,
      comment: r.comment,
      source: r.source || "Direct Feedback",
      is_published: r.isPublished ?? true,
      is_featured: r.isFeatured ?? true,
      created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
    };
    await setDoc(doc(db, "reviews", `rev-${revCount + 1}`), revDoc, { merge: true });
    revCount++;
  }
  console.log(`✅ ${revCount} reviews seeded successfully.`);

  console.log("\n==================================================");
  console.log("🎉 Firestore Seeding Completed Successfully!");
  console.log(`Total Destinations: ${destCount}`);
  console.log(`Total Tours       : ${tourCount}`);
  console.log(`Total Reviews     : ${revCount}`);
  console.log(`Site Settings     : default`);
  console.log("==================================================");
}

runSeed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
