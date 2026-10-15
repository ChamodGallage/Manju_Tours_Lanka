import { getAdminSupabaseClient, getPublicSupabaseClient } from "../config/supabase.js";
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
    const client = getPublicSupabaseClient() || getAdminSupabaseClient();
    if (client) {
      try {
        let query = client.from("tour_packages").select("*").order("display_order", { ascending: true });
        if (!includeUnpublished) {
          query = query.eq("is_published", true);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as TourPackage[];
        }
      } catch (err) {
        logger.warn("Supabase packages fetch failed, using runtime fallback:", err);
      }
    }

    return runtimePackages
      .filter((p) => includeUnpublished || p.is_published)
      .sort((a, b) => a.display_order - b.display_order);
  },

  async getBySlug(slug: string): Promise<TourPackage | null> {
    const client = getPublicSupabaseClient() || getAdminSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("tour_packages")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        if (!error && data) {
          return data as TourPackage;
        }
      } catch (err) {
        logger.warn(`Supabase tour package fetch for '${slug}' failed:`, err);
      }
    }

    return runtimePackages.find((p) => p.slug === slug) || null;
  },

  async create(payload: Partial<TourPackage>): Promise<TourPackage> {
    const newPkg: TourPackage = {
      id: payload.id || `tour-${Date.now()}`,
      title: payload.title || "New Tour Package",
      slug: payload.slug || `tour-${Date.now()}`,
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

    const client = getAdminSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from("tour_packages").insert(newPkg).select().single();
        if (!error && data) {
          runtimePackages.push(data as TourPackage);
          return data as TourPackage;
        }
      } catch (err) {
        logger.warn("Supabase package insert failed, saved to runtime store:", err);
      }
    }

    runtimePackages.push(newPkg);
    return newPkg;
  },

  async update(id: string, updates: Partial<TourPackage>): Promise<TourPackage | null> {
    const client = getAdminSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("tour_packages")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single();
        if (!error && data) {
          const index = runtimePackages.findIndex((p) => p.id === id);
          if (index !== -1) runtimePackages[index] = data as TourPackage;
          return data as TourPackage;
        }
      } catch (err) {
        logger.warn("Supabase package update failed, updating runtime store:", err);
      }
    }

    const index = runtimePackages.findIndex((p) => p.id === id || p.slug === id);
    if (index === -1) return null;

    runtimePackages[index] = {
      ...runtimePackages[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return runtimePackages[index];
  },

  async delete(id: string): Promise<boolean> {
    const client = getAdminSupabaseClient();
    if (client) {
      try {
        await client.from("tour_packages").delete().eq("id", id);
      } catch (err) {
        logger.warn("Supabase package delete error:", err);
      }
    }

    const beforeLength = runtimePackages.length;
    runtimePackages = runtimePackages.filter((p) => p.id !== id && p.slug !== id);
    return runtimePackages.length < beforeLength;
  },
};
