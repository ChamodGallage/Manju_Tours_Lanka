import { getBackendFirestore } from "../config/firebase.js";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { reviewsSeed } from "../data/seed-dataset.js";
import type { ReviewItem } from "../types/database.types.js";
import { logger } from "../utils/logger.js";

let runtimeReviews: ReviewItem[] = reviewsSeed.map((r, index) => ({
  id: `rev-${index + 1}`,
  author_name: r.authorName || "Traveler",
  author_country: r.authorCountry || "International",
  rating: r.rating || 5,
  review_date: r.reviewDate || "2026-01-01",
  travel_month: r.travelMonth || "January 2026",
  title: r.title || "Unforgettable Sri Lanka Holiday",
  comment: r.comment || "",
  source: r.source || "TripAdvisor",
  tour_title: "",
  is_verified: true,
  is_featured: r.isFeatured ?? true,
  is_published: true,
  display_order: index + 1,
  created_at: new Date("2026-01-01T00:00:00Z").toISOString(),
  updated_at: new Date("2026-01-01T00:00:00Z").toISOString(),
}));

export const reviewsService = {
  async getAll(): Promise<ReviewItem[]> {
    const db = getBackendFirestore();
    if (db) {
      try {
        const q = query(collection(db, "reviews"), where("is_published", "==", true));
        const snap = await getDocs(q);
        if (!snap.empty) {
          return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ReviewItem));
        }
      } catch (err) {
        logger.warn("Firestore reviews notice, using runtime reviews:", err);
      }
    }
    return runtimeReviews;
  },
};
