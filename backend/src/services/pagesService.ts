import { getBackendFirestore } from "../config/firebase.js";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";
import {
  getRuntimePages,
  getRuntimePage,
  updateRuntimePage,
  addRuntimePage,
  getRuntimeSections,
  upsertRuntimeSection,
  deleteRuntimeSection,
  reorderRuntimeSections,
  duplicateRuntimePage,
} from "../data/pages-cms-dataset.js";
import type { PageRecord, PageSectionItem } from "../types/database.types.js";
import { logger } from "../utils/logger.js";

export const pagesService = {
  async getPages(): Promise<PageRecord[]> {
    const db = getBackendFirestore();
    if (db) {
      try {
        const q = query(collection(db, "pages"), orderBy("display_order", "asc"));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map((d) => d.data() as PageRecord);
        }
      } catch (err) {
        logger.warn("Firestore pages fetch notice, using runtime CMS dataset:", err);
      }
    }
    return getRuntimePages();
  },

  async getPage(keyOrSlug: string): Promise<PageRecord | null> {
    const db = getBackendFirestore();
    if (db) {
      try {
        const docRef = doc(db, "pages", keyOrSlug);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return snap.data() as PageRecord;
        }
        const q = query(collection(db, "pages"), where("slug", "==", keyOrSlug));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          return qSnap.docs[0].data() as PageRecord;
        }
      } catch (err) {
        logger.warn(`Firestore getPage for '${keyOrSlug}' notice:`, err);
      }
    }
    return getRuntimePage(keyOrSlug) || null;
  },

  async getPageSections(pageKey: string, publishedOnly = false): Promise<PageSectionItem[]> {
    const db = getBackendFirestore();
    if (db) {
      try {
        const col = collection(db, "page_sections");
        const q = publishedOnly
          ? query(col, where("page_key", "==", pageKey), where("is_visible", "==", true), orderBy("display_order", "asc"))
          : query(col, where("page_key", "==", pageKey), orderBy("display_order", "asc"));

        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map((d) => d.data() as PageSectionItem);
        }
      } catch (err) {
        logger.warn(`Firestore getPageSections for '${pageKey}' notice:`, err);
      }
    }

    const sections = getRuntimeSections(pageKey);
    if (publishedOnly) {
      return sections.filter((s) => s.is_visible && s.status === "published");
    }
    return sections;
  },

  async savePage(payload: Partial<PageRecord>): Promise<PageRecord> {
    const pageKey = payload.page_key;
    if (!pageKey) {
      throw new Error("Invalid page payload or missing page_key");
    }

    const existing = getRuntimePage(pageKey);
    const updatedRecord: PageRecord = {
      id: payload.id || existing?.id || `page-${Date.now()}`,
      slug: payload.slug || existing?.slug || `/${pageKey}`,
      page_key: pageKey,
      title: payload.title || existing?.title || "New Page",
      navigation_label: payload.navigation_label || existing?.navigation_label || "",
      nav_location: payload.nav_location || existing?.nav_location || "header",
      is_published: payload.is_published ?? existing?.is_published ?? true,
      status: payload.status || existing?.status || "published",
      seo_title: payload.seo_title || existing?.seo_title || "",
      seo_description: payload.seo_description || existing?.seo_description || "",
      seo_og_image: payload.seo_og_image || existing?.seo_og_image || "",
      seo_keywords: payload.seo_keywords || existing?.seo_keywords || "",
      is_template: payload.is_template ?? existing?.is_template ?? false,
      layout_type: payload.layout_type || existing?.layout_type || "default",
      display_order: payload.display_order ?? existing?.display_order ?? getRuntimePages().length + 1,
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const db = getBackendFirestore();
    if (db) {
      try {
        await setDoc(doc(db, "pages", pageKey), updatedRecord, { merge: true });
      } catch (err) {
        logger.warn("Firestore page save notice:", err);
      }
    }

    if (existing) {
      updateRuntimePage(pageKey, updatedRecord);
    } else {
      addRuntimePage(updatedRecord);
    }

    return updatedRecord;
  },

  async saveSection(payload: Partial<PageSectionItem>): Promise<PageSectionItem> {
    const sectionId = payload.id || `sec-${Date.now()}`;
    const sectionRecord: PageSectionItem = {
      id: sectionId,
      page_key: payload.page_key || "home",
      section_key: payload.section_key || `sec-${Date.now()}`,
      section_type: payload.section_type || "text-image",
      title: payload.title || "",
      subtitle: payload.subtitle || "",
      badge: payload.badge || "",
      content: payload.content || "",
      button_text: payload.button_text || "",
      button_url: payload.button_url || "",
      secondary_button_text: payload.secondary_button_text || "",
      secondary_button_url: payload.secondary_button_url || "",
      image_url: payload.image_url || "",
      secondary_image_url: payload.secondary_image_url || "",
      image_alt: payload.image_alt || "",
      background_style: payload.background_style || "default",
      background_color: payload.background_color || "",
      background_image: payload.background_image || "",
      text_align: payload.text_align || "left",
      layout_options: payload.layout_options || {},
      items: payload.items || [],
      is_visible: payload.is_visible ?? true,
      status: payload.status || "draft",
      display_order: payload.display_order ?? 0,
      updated_at: new Date().toISOString(),
    };

    const db = getBackendFirestore();
    if (db) {
      try {
        await setDoc(doc(db, "page_sections", sectionId), sectionRecord, { merge: true });
      } catch (err) {
        logger.warn("Firestore section save notice:", err);
      }
    }

    upsertRuntimeSection(sectionRecord);
    return sectionRecord;
  },

  async deleteSection(id: string): Promise<boolean> {
    const db = getBackendFirestore();
    if (db) {
      try {
        await deleteDoc(doc(db, "page_sections", id));
      } catch (err) {
        logger.warn("Firestore section delete notice:", err);
      }
    }
    return deleteRuntimeSection(id);
  },

  async reorderSections(pageKey: string, orderedIds: string[]): Promise<boolean> {
    const db = getBackendFirestore();
    if (db) {
      try {
        const updates = orderedIds.map((id, index) =>
          setDoc(doc(db, "page_sections", id), { display_order: index + 1 }, { merge: true })
        );
        await Promise.allSettled(updates);
      } catch (err) {
        logger.warn("Firestore sections reorder notice:", err);
      }
    }
    reorderRuntimeSections(pageKey, orderedIds);
    return true;
  },

  async duplicatePage(sourceKey: string, newTitle: string, newSlug: string, newKey: string): Promise<PageRecord | null> {
    const duplicated = duplicateRuntimePage(sourceKey, newTitle, newSlug, newKey);
    const db = getBackendFirestore();

    if (db && duplicated) {
      try {
        await setDoc(doc(db, "pages", newKey), duplicated);
        const sections = getRuntimeSections(newKey);
        for (const sec of sections) {
          await setDoc(doc(db, "page_sections", sec.id), sec);
        }
      } catch (err) {
        logger.warn("Firestore page duplicate sync notice:", err);
      }
    }

    return duplicated;
  },

  async publishPage(pageKey: string, unpublish = false): Promise<{ page: PageRecord | null; count: number }> {
    const newStatus = unpublish ? "draft" : "published";
    const isPub = !unpublish;

    const db = getBackendFirestore();
    if (db) {
      try {
        await setDoc(doc(db, "pages", pageKey), { status: newStatus, is_published: isPub }, { merge: true });
      } catch (err) {
        logger.warn("Firestore publish notice:", err);
      }
    }

    const updated = updateRuntimePage(pageKey, { status: newStatus, is_published: isPub });
    const sections = getRuntimeSections(pageKey);
    sections.forEach((s) => {
      s.status = newStatus;
    });

    return { page: updated || null, count: sections.length };
  },
};
