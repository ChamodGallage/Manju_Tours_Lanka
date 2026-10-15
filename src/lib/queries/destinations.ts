import { getFirebaseFirestore } from "@/lib/firebase/client";
import { collection, doc, getDoc, getDocs, query, where, orderBy } from "firebase/firestore";
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
      const heroOverride = siteImages.find(
        (img) =>
          img.destination === dest.slug &&
          (img.section_key === "hero" || img.category === "destination" || img.category === "hero")
      );

      if (heroOverride && heroOverride.image_url) {
        return {
          ...dest,
          heroImage: {
            ...dest.heroImage,
            src: heroOverride.image_url,
            alt: heroOverride.alt_text || dest.name,
            caption: heroOverride.description || heroOverride.title || dest.tagline,
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
  const db = getFirebaseFirestore();

  if (db) {
    try {
      const destCol = collection(db, "destinations");
      const q = options.includeUnpublished
        ? query(destCol, orderBy("display_order", "asc"))
        : query(destCol, where("is_published", "==", true), orderBy("display_order", "asc"));

      const snap = await getDocs(q);
      if (!snap.empty) {
        const formatted = snap.docs.map((d) => formatDestination(d.data() as DestinationItem));
        return enrichDestinationsWithDbImages(formatted);
      }
    } catch (err) {
      console.warn("Firestore destinations query notice, checking fallback:", err);
    }
  }

  // Fallback: Mock destinations
  let list = mockDestinations.map((d) => formatDestination(d as unknown as DestinationItem));
  if (!options.includeUnpublished) {
    list = list.filter((d) => d.isPublished);
  }
  return enrichDestinationsWithDbImages(list);
}

export async function getFeaturedDestinations(): Promise<FormattedDestination[]> {
  const db = getFirebaseFirestore();

  if (db) {
    try {
      const destCol = collection(db, "destinations");
      const q = query(
        destCol,
        where("is_published", "==", true),
        where("is_featured", "==", true),
        orderBy("display_order", "asc")
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const formatted = snap.docs.map((d) => formatDestination(d.data() as DestinationItem));
        return enrichDestinationsWithDbImages(formatted);
      }
    } catch (err) {
      console.warn("Firestore featured destinations query notice, checking fallback:", err);
    }
  }

  const list = mockDestinations
    .filter((d) => d.isFeatured)
    .map((d) => formatDestination(d as unknown as DestinationItem));
  return enrichDestinationsWithDbImages(list);
}

export async function getDestinationBySlug(slug: string): Promise<FormattedDestination | null> {
  const db = getFirebaseFirestore();

  if (db) {
    try {
      const docRef = doc(db, "destinations", slug);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const formatted = formatDestination(docSnap.data() as DestinationItem);
        const enriched = await enrichDestinationsWithDbImages([formatted]);
        return enriched[0];
      }

      // Query by slug attribute if document key differed
      const q = query(collection(db, "destinations"), where("slug", "==", slug));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const formatted = formatDestination(snap.docs[0].data() as DestinationItem);
        const enriched = await enrichDestinationsWithDbImages([formatted]);
        return enriched[0];
      }
    } catch (err) {
      console.warn(`Firestore destination query for ${slug} notice:`, err);
    }
  }

  const found = mockDestinations.find((d) => d.slug === slug);
  if (!found) return null;

  const formatted = formatDestination(found as unknown as DestinationItem);
  const enriched = await enrichDestinationsWithDbImages([formatted]);
  return enriched[0];
}

export async function getRelatedDestinations(currentSlug: string, limitCount = 3): Promise<FormattedDestination[]> {
  const all = await getAllDestinations();
  return all.filter((d) => d.slug !== currentSlug).slice(0, limitCount);
}

export async function getDestinationSlugs(): Promise<string[]> {
  const all = await getAllDestinations();
  return all.map((d) => d.slug);
}
