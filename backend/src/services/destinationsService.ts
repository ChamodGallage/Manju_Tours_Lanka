import { getAdminSupabaseClient, getPublicSupabaseClient } from "../config/supabase.js";
import { destinationsSeed } from "../data/seed-dataset.js";
import type { DestinationItem } from "../types/database.types.js";
import { logger } from "../utils/logger.js";

// In-memory runtime mirror for resilient local dev & tests
let runtimeDestinations: DestinationItem[] = destinationsSeed.map((d, index) => {
  const heroSrc = typeof d.heroImage === "object" ? d.heroImage?.src : `/images/destinations/${d.slug}/hero.webp`;
  const heroAlt = typeof d.heroImage === "object" ? d.heroImage?.alt : d.name;
  const heroCaption = typeof d.heroImage === "object" ? d.heroImage?.caption : (d.tagline || "");
  const focalPoint = typeof d.heroImage === "object" ? d.heroImage?.focalPoint : "center 30%";

  return {
    id: `dest-${index + 1}`,
    name: d.name,
    slug: d.slug,
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
    display_order: d.displayOrder ?? index,
    is_featured: d.isFeatured ?? false,
    is_published: true,
    seo_title: `${d.name} Travel Guide | Manju Tours Lanka`,
    seo_description: d.summary || "",
    created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
    updated_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  };
});

export const destinationsService = {
  async getAll(includeUnpublished = false): Promise<DestinationItem[]> {
    const client = getPublicSupabaseClient() || getAdminSupabaseClient();
    if (client) {
      try {
        let query = client.from("destinations").select("*").order("display_order", { ascending: true });
        if (!includeUnpublished) {
          query = query.eq("is_published", true);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as DestinationItem[];
        }
      } catch (err) {
        logger.warn("Supabase destinations fetch failed, using runtime fallback:", err);
      }
    }

    return runtimeDestinations
      .filter((d) => includeUnpublished || d.is_published)
      .sort((a, b) => a.display_order - b.display_order);
  },

  async getBySlug(slug: string): Promise<DestinationItem | null> {
    const client = getPublicSupabaseClient() || getAdminSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("destinations")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();
        if (!error && data) {
          return data as DestinationItem;
        }
      } catch (err) {
        logger.warn(`Supabase destination fetch for '${slug}' failed:`, err);
      }
    }

    return runtimeDestinations.find((d) => d.slug === slug) || null;
  },

  async create(payload: Partial<DestinationItem>): Promise<DestinationItem> {
    const newItem: DestinationItem = {
      id: payload.id || `dest-${Date.now()}`,
      name: payload.name || "New Destination",
      slug: payload.slug || `destination-${Date.now()}`,
      tagline: payload.tagline || "",
      region: payload.region || "Cultural Triangle",
      summary: payload.summary || "",
      content: payload.content || "",
      hero_image: payload.hero_image || "",
      hero_image_metadata: payload.hero_image_metadata || null,
      gallery_images: payload.gallery_images || [],
      highlights: payload.highlights || [],
      best_time_to_visit: payload.best_time_to_visit || "",
      ideal_duration: payload.ideal_duration || "2 - 3 Days",
      travel_tips: payload.travel_tips || "",
      latitude: payload.latitude || 0,
      longitude: payload.longitude || 0,
      display_order: payload.display_order ?? runtimeDestinations.length,
      is_featured: payload.is_featured ?? false,
      is_published: payload.is_published ?? true,
      seo_title: payload.seo_title || "",
      seo_description: payload.seo_description || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const client = getAdminSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client.from("destinations").insert(newItem).select().single();
        if (!error && data) {
          runtimeDestinations.push(data as DestinationItem);
          return data as DestinationItem;
        }
      } catch (err) {
        logger.warn("Supabase destination insert failed, saved to runtime store:", err);
      }
    }

    runtimeDestinations.push(newItem);
    return newItem;
  },

  async update(id: string, updates: Partial<DestinationItem>): Promise<DestinationItem | null> {
    const client = getAdminSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("destinations")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single();
        if (!error && data) {
          const index = runtimeDestinations.findIndex((d) => d.id === id);
          if (index !== -1) runtimeDestinations[index] = data as DestinationItem;
          return data as DestinationItem;
        }
      } catch (err) {
        logger.warn("Supabase destination update failed, applying to runtime store:", err);
      }
    }

    const index = runtimeDestinations.findIndex((d) => d.id === id || d.slug === id);
    if (index === -1) return null;

    runtimeDestinations[index] = {
      ...runtimeDestinations[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return runtimeDestinations[index];
  },

  async delete(id: string): Promise<boolean> {
    const client = getAdminSupabaseClient();
    if (client) {
      try {
        await client.from("destinations").delete().eq("id", id);
      } catch (err) {
        logger.warn("Supabase destination delete error:", err);
      }
    }

    const beforeLength = runtimeDestinations.length;
    runtimeDestinations = runtimeDestinations.filter((d) => d.id !== id && d.slug !== id);
    return runtimeDestinations.length < beforeLength;
  },
};
