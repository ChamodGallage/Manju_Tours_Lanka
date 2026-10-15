import { getBackendFirestore } from "../config/firebase.js";
import { collection, getDocs, doc, getDoc, setDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
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
    const db = getBackendFirestore();
    if (db) {
      try {
        const col = collection(db, "destinations");
        const q = includeUnpublished
          ? query(col, orderBy("display_order", "asc"))
          : query(col, where("is_published", "==", true), orderBy("display_order", "asc"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map((d) => d.data() as DestinationItem);
        }
      } catch (err) {
        logger.warn("Firestore destinations query notice, using runtime dataset:", err);
      }
    }

    let items = [...runtimeDestinations];
    if (!includeUnpublished) {
      items = items.filter((d) => d.is_published);
    }
    return items.sort((a, b) => a.display_order - b.display_order);
  },

  async getBySlug(slug: string): Promise<DestinationItem | null> {
    const db = getBackendFirestore();
    if (db) {
      try {
        const docRef = doc(db, "destinations", slug);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data() as DestinationItem;
        }
        const q = query(collection(db, "destinations"), where("slug", "==", slug));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs[0].data() as DestinationItem;
        }
      } catch (err) {
        logger.warn(`Firestore destination lookup for ${slug} notice:`, err);
      }
    }

    return runtimeDestinations.find((d) => d.slug === slug) || null;
  },

  async create(payload: Partial<DestinationItem>): Promise<DestinationItem> {
    const slug = payload.slug || (payload.name ? payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `dest-${Date.now()}`);
    const newRecord: DestinationItem = {
      id: `dest-${Date.now()}`,
      slug,
      name: payload.name || "Untitled Destination",
      tagline: payload.tagline || "",
      region: payload.region || "Cultural Triangle",
      summary: payload.summary || "",
      content: payload.content || "",
      hero_image: payload.hero_image || `/images/destinations/${slug}/hero.webp`,
      hero_image_metadata: payload.hero_image_metadata || null,
      gallery_images: payload.gallery_images || [],
      highlights: payload.highlights || [],
      best_time_to_visit: payload.best_time_to_visit || "Year-round",
      ideal_duration: payload.ideal_duration || "2 - 3 Days",
      travel_tips: payload.travel_tips || "",
      latitude: payload.latitude || 0,
      longitude: payload.longitude || 0,
      display_order: payload.display_order ?? runtimeDestinations.length,
      is_featured: payload.is_featured ?? false,
      is_published: payload.is_published ?? true,
      seo_title: payload.seo_title || `${payload.name} Travel Guide | Manju Tours Lanka`,
      seo_description: payload.seo_description || payload.summary || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const db = getBackendFirestore();
    if (db) {
      try {
        await setDoc(doc(db, "destinations", slug), newRecord);
      } catch (err) {
        logger.warn("Failed saving new destination to Firestore:", err);
      }
    }

    runtimeDestinations.push(newRecord);
    return newRecord;
  },

  async update(idOrSlug: string, updates: Partial<DestinationItem>): Promise<DestinationItem | null> {
    const db = getBackendFirestore();
    let current = await this.getBySlug(idOrSlug);
    if (!current) {
      current = runtimeDestinations.find((d) => d.id === idOrSlug) || null;
    }
    if (!current) return null;

    const updatedRecord: DestinationItem = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    if (db) {
      try {
        await setDoc(doc(db, "destinations", current.slug), updatedRecord, { merge: true });
      } catch (err) {
        logger.warn(`Failed updating destination ${idOrSlug} in Firestore:`, err);
      }
    }

    const idx = runtimeDestinations.findIndex((d) => d.id === current?.id || d.slug === current?.slug);
    if (idx !== -1) {
      runtimeDestinations[idx] = updatedRecord;
    }

    return updatedRecord;
  },

  async delete(idOrSlug: string): Promise<boolean> {
    const db = getBackendFirestore();
    const current = await this.getBySlug(idOrSlug);
    const targetSlug = current ? current.slug : idOrSlug;

    if (db) {
      try {
        await deleteDoc(doc(db, "destinations", targetSlug));
      } catch (err) {
        logger.warn(`Failed deleting destination ${idOrSlug} from Firestore:`, err);
      }
    }

    runtimeDestinations = runtimeDestinations.filter((d) => d.id !== idOrSlug && d.slug !== idOrSlug);
    return true;
  },
};
