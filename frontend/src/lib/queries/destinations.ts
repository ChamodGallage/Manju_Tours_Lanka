import { createClient } from "@supabase/supabase-js";
import { supabaseContentFetch } from "@/lib/supabase/fetch";
import prisma from "../db";
import { mockDestinations } from "../data/mock-data";
import { getSiteImages } from "./site-images";
import type { DestinationItem } from "@/types/database.types";

export interface FormattedDestination {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  region: string;
  summary: string;
  content: string;
  heroImage: {
    src: string;
    alt: string;
    caption: string;
    focalPoint?: string;
  };
  galleryImages: Array<{ src: string; alt?: string; caption?: string }>;
  highlights: string[];
  bestTimeToVisit: string;
  idealDuration: string;
  travelTips?: string;
  latitude: number | null;
  longitude: number | null;
  displayOrder: number;
  isFeatured: boolean;
  isPublished: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export function formatDestination(dest: Partial<DestinationItem> & { name: string; slug: string }): FormattedDestination {
  let heroSrc = dest.hero_image || "";
  let heroAlt = dest.name || "";
  let heroCaption = dest.tagline || "";
  let focalPoint = "center 30%";

  if (dest.hero_image_metadata) {
    heroSrc = dest.hero_image_metadata.src || heroSrc;
    heroAlt = dest.hero_image_metadata.alt || heroAlt;
    heroCaption = dest.hero_image_metadata.caption || heroCaption;
    focalPoint = dest.hero_image_metadata.focalPoint || focalPoint;
  }

  if (!heroSrc && (dest as unknown as { heroImage?: { src?: string } }).heroImage?.src) {
    heroSrc = (dest as unknown as { heroImage: { src: string } }).heroImage.src;
  }

  if (!heroSrc) {
    heroSrc = `/images/destinations/${dest.slug}/hero.webp`;
  }

  const galleryImages: Array<{ src: string; alt?: string; caption?: string }> = Array.isArray(dest.gallery_images)
    ? dest.gallery_images
    : Array.isArray((dest as unknown as { galleryImages?: unknown[] }).galleryImages)
    ? ((dest as unknown as { galleryImages: Array<{ src: string }> }).galleryImages)
    : [];

  return {
    id: dest.id || `dest-${dest.slug}`,
    name: dest.name,
    slug: dest.slug,
    tagline: dest.tagline || "",
    region: dest.region || "Cultural Triangle",
    summary: dest.summary || "",
    content: dest.content || "",
    heroImage: {
      src: heroSrc,
      alt: heroAlt,
      caption: heroCaption,
      focalPoint,
    },
    galleryImages,
    highlights: Array.isArray(dest.highlights) ? dest.highlights : [],
    bestTimeToVisit: dest.best_time_to_visit || (dest as unknown as { bestTimeToVisit?: string }).bestTimeToVisit || "Year-round",
    idealDuration: dest.ideal_duration || (dest as unknown as { idealDuration?: string }).idealDuration || "2 - 3 Days",
    travelTips: dest.travel_tips || "",
    latitude: dest.latitude ? Number(dest.latitude) : null,
    longitude: dest.longitude ? Number(dest.longitude) : null,
    displayOrder: dest.display_order ?? (dest as unknown as { displayOrder?: number }).displayOrder ?? 0,
    isFeatured: dest.is_featured ?? (dest as unknown as { isFeatured?: boolean }).isFeatured ?? false,
    isPublished: dest.is_published ?? (dest as unknown as { isPublished?: boolean }).isPublished ?? true,
    seoTitle: dest.seo_title || "",
    seoDescription: dest.seo_description || "",
    createdAt: dest.created_at || new Date().toISOString(),
    updatedAt: dest.updated_at || new Date().toISOString(),
  };
}

async function enrichDestinationsWithDbImages(dests: FormattedDestination[]): Promise<FormattedDestination[]> {
  try {
    const siteImages = await getSiteImages();
    if (!siteImages || siteImages.length === 0) return dests;

    return dests.map((dest) => {
      const match = siteImages.find(
        (img) =>
          img.destination === dest.slug &&
          (img.section_key === "hero" || img.category === "hero" || img.category === "destination")
      );
      if (match && match.image_url) {
        return {
          ...dest,
          heroImage: {
            src: match.image_url,
            alt: match.alt_text || dest.name,
            caption: match.description || dest.tagline || "",
            focalPoint: "center 30%",
          },
        };
      }
      return dest;
    });
  } catch {
    return dests;
  }
}

export async function getAllDestinations(options: { includeUnpublished?: boolean } = {}): Promise<FormattedDestination[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (url && publishableKey) {
    try {
      const client = createClient(url, publishableKey, {
        global: { fetch: supabaseContentFetch },
      });
      let query = client.from("destinations").select("*");

      if (!options.includeUnpublished) {
        query = query.eq("is_published", true);
      }

      const { data, error } = await query.order("display_order", { ascending: true }).retry(false);

      if (!error && data && data.length > 0) {
        const formatted = (data as unknown as DestinationItem[]).map(formatDestination);
        return enrichDestinationsWithDbImages(formatted);
      }
    } catch (err) {
      console.warn("Supabase destinations query notice, checking fallback:", err);
    }
  }

  // Fallback 1: Prisma if configured
  try {
    const destinations = await prisma.destination.findMany({
      orderBy: { displayOrder: "asc" },
    });
    if (destinations.length > 0) {
      const formatted = (destinations as unknown as DestinationItem[]).map(formatDestination);
      return enrichDestinationsWithDbImages(formatted);
    }
  } catch {
    // expected if DATABASE_URL is not set
  }

  // Fallback 2: Mock destinations
  let list = mockDestinations.map((d) => formatDestination(d as unknown as DestinationItem));
  if (!options.includeUnpublished) {
    list = list.filter((d) => d.isPublished);
  }
  return enrichDestinationsWithDbImages(list);
}

export async function getFeaturedDestinations(): Promise<FormattedDestination[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (url && publishableKey) {
    try {
      const client = createClient(url, publishableKey, {
        global: { fetch: supabaseContentFetch },
      });
      const { data, error } = await client
        .from("destinations")
        .select("*")
        .eq("is_published", true)
        .eq("is_featured", true)
        .order("display_order", { ascending: true })
        .retry(false);

      if (!error && data && data.length > 0) {
        const formatted = (data as unknown as DestinationItem[]).map(formatDestination);
        return enrichDestinationsWithDbImages(formatted);
      }
    } catch (err) {
      console.warn("Supabase featured destinations query notice, checking fallback:", err);
    }
  }

  const list = mockDestinations
    .filter((d) => d.isFeatured)
    .map((d) => formatDestination(d as unknown as DestinationItem));
  return enrichDestinationsWithDbImages(list);
}

export async function getDestinationBySlug(slug: string): Promise<FormattedDestination | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (url && publishableKey) {
    try {
      const client = createClient(url, publishableKey, {
        global: { fetch: supabaseContentFetch },
      });
      const { data, error } = await client
        .from("destinations")
        .select("*")
        .eq("slug", slug)
        .maybeSingle()
        .retry(false);

      if (!error && data) {
        const formatted = formatDestination(data as unknown as DestinationItem);
        const enriched = await enrichDestinationsWithDbImages([formatted]);
        return enriched[0];
      }
    } catch (err) {
      console.warn(`Supabase destination query for ${slug} notice:`, err);
    }
  }

  const found = mockDestinations.find((d) => d.slug === slug);
  if (!found) return null;

  const formatted = formatDestination(found as unknown as DestinationItem);
  const enriched = await enrichDestinationsWithDbImages([formatted]);
  return enriched[0];
}
