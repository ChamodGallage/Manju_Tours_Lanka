import { getBackendFirestore } from "../config/firebase.js";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { toursSeed } from "../data/seed-dataset.js";
import type { TourPackage } from "../types/database.types.js";
import { logger } from "../utils/logger.js";

let runtimePackages: TourPackage[] = toursSeed.map((t, index) => {
  const heroSrc = typeof t.heroImage === "object" ? t.heroImage?.src : `/images/destinations/${t.slug}/hero.webp`;
  const heroAlt = typeof t.heroImage === "object" ? t.heroImage?.alt : t.title;
  const heroCaption = typeof t.heroImage === "object" ? t.heroImage?.caption : (t.tagline || "");

  return {
    id: `tour-${index + 1}`,
    title: t.title,
    slug: t.slug,
    tagline: t.tagline || "",
    overview: t.overview || "",
    hero_image: heroSrc,
    hero_image_metadata: {
      src: heroSrc,
      alt: heroAlt,
      caption: heroCaption,
      focalPoint: "center 30%",
    },
    gallery_images: (t.galleryImages || []).map((g) => ({
      src: typeof g === "string" ? g : g.src,
      alt: typeof g === "object" ? g.alt : t.title,
      caption: typeof g === "object" ? g.caption : "",
    })),
    travel_style: t.travelStyle || "Private Chauffeur Guide",
    destinations: [],
    duration_days: t.durationDays ?? 7,
    duration_nights: t.durationNights ?? 6,
    starting_price: t.startingPrice || "From $850 USD",
    starting_price_numeric: 850,
    currency: "USD",
    price_type: "per_person",
    min_travelers: 1,
    max_travelers: 8,
    inclusions: t.inclusions || [],
    exclusions: t.exclusions || [],
    itinerary: (t.itinerary || []).map((day, idx) => ({
      day: day.day ?? idx + 1,
      title: day.title || `Day ${idx + 1}`,
      description: day.description || "",
      accommodation: "",
      meals: "",
      activities: "",
    })),
    accommodation_details: "",
    transport_details: "",
    meals_included: "",
    activities: t.highlights || [],
    optional_activities: [],
    suitable_for: [],
    booking_conditions: "",
    cancellation_policy: "",
    faqs: [],
    seo_title: `${t.title} | Private Sri Lanka Tour`,
    seo_description: t.overview || "",
    display_order: t.displayOrder ?? index,
    is_featured: t.isFeatured ?? false,
    is_published: true,
    created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
    updated_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  };
});

export const packagesService = {
  async getAll(includeUnpublished = false): Promise<TourPackage[]> {
    const db = getBackendFirestore();
    if (db) {
      try {
        const col = collection(db, "tours");
        const q = includeUnpublished
          ? query(col, orderBy("display_order", "asc"))
          : query(col, where("is_published", "==", true), orderBy("display_order", "asc"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map((d) => d.data() as TourPackage);
        }
      } catch (err) {
        logger.warn("Firestore packages fetch notice, using runtime fallback:", err);
      }
    }

    return runtimePackages
      .filter((p) => includeUnpublished || p.is_published)
      .sort((a, b) => a.display_order - b.display_order);
  },

  async getBySlug(slug: string): Promise<TourPackage | null> {
    const db = getBackendFirestore();
    if (db) {
      try {
        const docRef = doc(db, "tours", slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as TourPackage;
        }
        const q = query(collection(db, "tours"), where("slug", "==", slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs[0].data() as TourPackage;
        }
      } catch (err) {
        logger.warn(`Firestore tour package fetch for '${slug}' notice:`, err);
      }
    }

    return runtimePackages.find((p) => p.slug === slug) || null;
  },

  async create(payload: Partial<TourPackage>): Promise<TourPackage> {
    const slug = payload.slug || `tour-${Date.now()}`;
    const newPkg: TourPackage = {
      id: payload.id || `tour-${Date.now()}`,
      title: payload.title || "New Tour Package",
      slug,
      tagline: payload.tagline || "",
      overview: payload.overview || "",
      hero_image: payload.hero_image || "",
      hero_image_metadata: payload.hero_image_metadata || null,
      gallery_images: payload.gallery_images || [],
      travel_style: payload.travel_style || "Private Chauffeur Guide",
      destinations: payload.destinations || [],
      duration_days: payload.duration_days ?? 7,
      duration_nights: payload.duration_nights ?? 6,
      starting_price: payload.starting_price || "From $850 USD",
      starting_price_numeric: payload.starting_price_numeric ?? 850,
      currency: payload.currency || "USD",
      price_type: payload.price_type || "per_person",
      min_travelers: payload.min_travelers ?? 1,
      max_travelers: payload.max_travelers ?? 8,
      inclusions: payload.inclusions || [],
      exclusions: payload.exclusions || [],
      itinerary: payload.itinerary || [],
      accommodation_details: payload.accommodation_details || "",
      transport_details: payload.transport_details || "",
      meals_included: payload.meals_included || "",
      activities: payload.activities || [],
      optional_activities: payload.optional_activities || [],
      suitable_for: payload.suitable_for || [],
      booking_conditions: payload.booking_conditions || "",
      cancellation_policy: payload.cancellation_policy || "",
      faqs: payload.faqs || [],
      seo_title: payload.seo_title || "",
      seo_description: payload.seo_description || "",
      display_order: payload.display_order ?? runtimePackages.length,
      is_featured: payload.is_featured ?? false,
      is_published: payload.is_published ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const db = getBackendFirestore();
    if (db) {
      try {
        await setDoc(doc(db, "tours", slug), newPkg);
      } catch (err) {
        logger.warn("Firestore tour package insert notice:", err);
      }
    }

    runtimePackages.push(newPkg);
    return newPkg;
  },

  async update(idOrSlug: string, updates: Partial<TourPackage>): Promise<TourPackage | null> {
    const db = getBackendFirestore();
    let current = await this.getBySlug(idOrSlug);
    if (!current) {
      current = runtimePackages.find((p) => p.id === idOrSlug || p.slug === idOrSlug) || null;
    }
    if (!current) return null;

    const updatedRecord: TourPackage = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (db) {
      try {
        await setDoc(doc(db, "tours", current.slug), updatedRecord, { merge: true });
      } catch (err) {
        logger.warn(`Firestore tour package update for '${idOrSlug}' notice:`, err);
      }
    }

    const index = runtimePackages.findIndex((p) => p.id === current?.id || p.slug === current?.slug);
    if (index !== -1) {
      runtimePackages[index] = updatedRecord;
    }
    return updatedRecord;
  },

  async delete(idOrSlug: string): Promise<boolean> {
    const db = getBackendFirestore();
    const current = await this.getBySlug(idOrSlug);
    const targetSlug = current ? current.slug : idOrSlug;

    if (db) {
      try {
        await deleteDoc(doc(db, "tours", targetSlug));
      } catch (err) {
        logger.warn(`Firestore package delete for '${idOrSlug}' notice:`, err);
      }
    }

    const beforeLength = runtimePackages.length;
    runtimePackages = runtimePackages.filter((p) => p.id !== idOrSlug && p.slug !== idOrSlug);
    return runtimePackages.length < beforeLength;
  },
};
