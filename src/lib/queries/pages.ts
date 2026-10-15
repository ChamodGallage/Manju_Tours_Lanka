import type { PageRecord } from "@/types/database.types";
import { getRuntimePages, getRuntimePage } from "@/lib/data/pages-cms-dataset";
import { getFirebaseFirestore } from "@/lib/firebase/client";
import { collection, doc, getDoc, getDocs, query, where, orderBy } from "firebase/firestore";

export async function getAllPages(statusFilter: "published" | "all" = "published"): Promise<PageRecord[]> {
  const db = getFirebaseFirestore();

  if (db) {
    try {
      const col = collection(db, "pages");
      const q = statusFilter === "published"
        ? query(col, where("is_published", "==", true), orderBy("display_order", "asc"))
        : query(col, orderBy("display_order", "asc"));

      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => d.data() as PageRecord);
      }
    } catch {
      // Fallback to runtime dataset
    }
  }

  const list = getRuntimePages();
  if (statusFilter === "published") {
    return list.filter((p) => p.is_published && p.status === "published");
  }
  return list;
}

export async function getPageBySlug(slug: string): Promise<PageRecord | null> {
  const db = getFirebaseFirestore();

  if (db) {
    try {
      const docRef = doc(db, "pages", slug);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as PageRecord;
      }
      const q = query(collection(db, "pages"), where("slug", "==", slug));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        return qSnap.docs[0].data() as PageRecord;
      }
    } catch {
      // Fallback
    }
  }

  return getRuntimePage(slug) || null;
}

export async function getPageByKey(pageKey: string): Promise<PageRecord | null> {
  const db = getFirebaseFirestore();

  if (db) {
    try {
      const docRef = doc(db, "pages", pageKey);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as PageRecord;
      }
      const q = query(collection(db, "pages"), where("page_key", "==", pageKey));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        return qSnap.docs[0].data() as PageRecord;
      }
    } catch {
      // Fallback
    }
  }

  return getRuntimePage(pageKey) || null;
}
