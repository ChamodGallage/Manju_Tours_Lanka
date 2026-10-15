import { getBackendFirestore } from "../config/firebase.js";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import { DEFAULT_SITE_IMAGES } from "../data/site-images-dataset.js";
import type { SiteImage } from "../types/database.types.js";
import { logger } from "../utils/logger.js";

let runtimeImages: SiteImage[] = [...DEFAULT_SITE_IMAGES];

export const mediaService = {
  async getAll(filter?: {
    category?: string;
    destination?: string;
    pageKey?: string;
    sectionKey?: string;
  }): Promise<SiteImage[]> {
    const db = getBackendFirestore();
    if (db) {
      try {
        const q = query(collection(db, "gallery"), orderBy("display_order", "asc"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          let results = snap.docs.map((d) => d.data() as SiteImage);
          if (filter?.category) results = results.filter((i) => i.category === filter.category);
          if (filter?.destination) results = results.filter((i) => i.destination === filter.destination);
          if (filter?.pageKey) results = results.filter((i) => i.page_key === filter.pageKey);
          if (filter?.sectionKey) results = results.filter((i) => i.section_key === filter.sectionKey);
          if (results.length > 0) return results;
        }
      } catch (err) {
        logger.warn("Firestore gallery query notice:", err);
      }
    }

    let results = runtimeImages.filter((img) => img.is_active);
    if (filter?.category) results = results.filter((img) => img.category === filter.category);
    if (filter?.destination) results = results.filter((img) => img.destination === filter.destination);
    if (filter?.pageKey) results = results.filter((img) => img.page_key === filter.pageKey);
    if (filter?.sectionKey) results = results.filter((img) => img.section_key === filter.sectionKey);

    return results.sort((a, b) => a.display_order - b.display_order);
  },

  async upload(
    file: { buffer: Buffer; mimetype: string; originalname: string; size: number },
    metadata: {
      title?: string;
      description?: string;
      pageKey?: string;
      sectionKey?: string;
      category?: string;
      destination?: string;
      altText?: string;
    }
  ): Promise<SiteImage> {
    const id = `img-${Date.now()}`;
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, "_").toLowerCase();
    const imagePath = `/images/destinations/${metadata.destination || "hero"}/${cleanName}`;

    const imageRecord: SiteImage = {
      id,
      title: metadata.title || file.originalname,
      description: metadata.description || "",
      storage_path: imagePath,
      image_url: imagePath,
      page_key: metadata.pageKey || "global",
      section_key: metadata.sectionKey || "gallery",
      category: metadata.category || "gallery",
      destination: metadata.destination || "",
      alt_text: metadata.altText || metadata.title || file.originalname,
      display_order: runtimeImages.length + 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      original_filename: file.originalname,
      mime_type: file.mimetype,
      size_bytes: file.size,
    };

    const db = getBackendFirestore();
    if (db) {
      try {
        await setDoc(doc(db, "gallery", id), imageRecord);
      } catch (err) {
        logger.warn("Firestore gallery record insert notice:", err);
      }
    }

    runtimeImages.push(imageRecord);
    return imageRecord;
  },

  async replace(
    id: string,
    file: { buffer: Buffer; mimetype: string; originalname: string; size: number }
  ): Promise<SiteImage | null> {
    const existing = runtimeImages.find((img) => img.id === id);
    if (!existing) return null;

    const db = getBackendFirestore();
    existing.original_filename = file.originalname;
    existing.size_bytes = file.size;
    existing.mime_type = file.mimetype;
    existing.updated_at = new Date().toISOString();

    if (db) {
      try {
        await setDoc(doc(db, "gallery", id), existing, { merge: true });
      } catch (err) {
        logger.warn("Firestore image update notice:", err);
      }
    }

    return existing;
  },

  async delete(id: string): Promise<boolean> {
    const db = getBackendFirestore();
    if (db) {
      try {
        await deleteDoc(doc(db, "gallery", id));
      } catch (err) {
        logger.warn("Firestore image delete notice:", err);
      }
    }

    const beforeLen = runtimeImages.length;
    runtimeImages = runtimeImages.filter((img) => img.id !== id);
    return runtimeImages.length < beforeLen;
  },
};
