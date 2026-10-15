import { getFirebaseFirestore } from "@/lib/firebase/client";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { mockReviews } from "../data/mock-data";
import type { ReviewItem as DbReviewItem } from "@/types/database.types";

export interface FormattedReview {
  id: string;
  authorName: string;
  authorCountry: string;
  rating: number;
  reviewDate: string;
  travelMonth: string;
  title: string;
  comment: string;
  source: string;
  tourTitle?: string;
  isVerified: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  displayOrder: number;
}

function formatDbReview(r: Partial<DbReviewItem> & { author_name?: string; comment?: string }): FormattedReview {
  return {
    id: r.id || `rev-${Math.random()}`,
    authorName: r.author_name || (r as unknown as { authorName?: string }).authorName || "Guest",
    authorCountry: r.author_country || (r as unknown as { authorCountry?: string }).authorCountry || "International Traveler",
    rating: r.rating || 5,
    reviewDate: r.review_date || (r as unknown as { reviewDate?: string }).reviewDate || "Recent",
    travelMonth: r.travel_month || (r as unknown as { travelMonth?: string }).travelMonth || "",
    title: r.title || (r as unknown as { title?: string }).title || "",
    comment: r.comment || "",
    source: r.source || (r as unknown as { source?: string }).source || "TripAdvisor",
    tourTitle: r.tour_title || (r as unknown as { tourTitle?: string }).tourTitle || undefined,
    isVerified: r.is_verified ?? (r as unknown as { isVerified?: boolean }).isVerified ?? true,
    isFeatured: r.is_featured ?? (r as unknown as { isFeatured?: boolean }).isFeatured ?? true,
    isPublished: r.is_published ?? true,
    displayOrder: r.display_order ?? (r as unknown as { displayOrder?: number }).displayOrder ?? 0,
  };
}

export async function getFeaturedReviews(): Promise<FormattedReview[]> {
  const db = getFirebaseFirestore();

  if (db) {
    try {
      const q = query(
        collection(db, "reviews"),
        where("is_featured", "==", true),
        where("is_published", "==", true)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => formatDbReview({ id: d.id, ...d.data() } as DbReviewItem));
      }
    } catch (err) {
      console.warn("Firestore getFeaturedReviews error, falling back:", err);
    }
  }

  return mockReviews.filter((r) => r.isFeatured).map((r) => formatDbReview(r as unknown as DbReviewItem));
}

export async function getAllReviews(options: { includeUnpublished?: boolean } = {}): Promise<FormattedReview[]> {
  const db = getFirebaseFirestore();

  if (db) {
    try {
      const colRef = collection(db, "reviews");
      const q = options.includeUnpublished
        ? query(colRef, orderBy("created_at", "desc"))
        : query(colRef, where("is_published", "==", true), orderBy("created_at", "desc"));

      const snap = await getDocs(q);
      if (!snap.empty) {
        return snap.docs.map((d) => formatDbReview({ id: d.id, ...d.data() } as DbReviewItem));
      }
    } catch (err) {
      console.warn("Firestore getAllReviews error, falling back:", err);
    }
  }

  let list = mockReviews.map((r) => formatDbReview(r as unknown as DbReviewItem));
  if (!options.includeUnpublished) {
    list = list.filter((r) => r.isPublished);
  }
  return list;
}
