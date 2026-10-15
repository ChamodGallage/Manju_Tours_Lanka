import type { PageSectionItem } from "@/types/database.types";
import { normalizeSafeUrl } from "@/lib/sanitize";
import { getRuntimeSections } from "@/lib/data/pages-cms-dataset";
import { getFirebaseFirestore } from "@/lib/firebase/client";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

export async function getPublishedPageSections(pageKey: string): Promise<PageSectionItem[]> {
  const db = getFirebaseFirestore();

  if (db) {
    try {
      const q = query(
        collection(db, "page_sections"),
        where("page_key", "==", pageKey),
        where("is_visible", "==", true),
        orderBy("display_order", "asc")
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => {
          const section = d.data() as PageSectionItem;
          return {
            ...section,
            button_url: normalizeSafeUrl(section.button_url) || "",
            secondary_button_url: normalizeSafeUrl(section.secondary_button_url) || "",
          };
        });
      }
    } catch {
      // Fallback below
    }
  }

  // Graceful fallback to seeded runtime CMS dataset
  const fallback = getRuntimeSections(pageKey).filter(
    (s) => s.is_visible && s.status !== "draft"
  );
  return fallback.map((section) => ({
    ...section,
    button_url: normalizeSafeUrl(section.button_url) || "",
    secondary_button_url: normalizeSafeUrl(section.secondary_button_url) || "",
  }));
}

export async function getAllPageSections(pageKey: string): Promise<PageSectionItem[]> {
  const db = getFirebaseFirestore();

  if (db) {
    try {
      const q = query(
        collection(db, "page_sections"),
        where("page_key", "==", pageKey),
        orderBy("display_order", "asc")
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as PageSectionItem);
      }
    } catch {
      // Fallback below
    }
  }

  return getRuntimeSections(pageKey);
}

export function getSection(sections: PageSectionItem[], key: string): PageSectionItem | undefined {
  return sections.find((section) => section.section_key === key);
}
