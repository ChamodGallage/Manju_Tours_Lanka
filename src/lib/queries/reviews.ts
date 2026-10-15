import { createClient } from "@supabase/supabase-js";
import { supabaseContentFetch } from "@/lib/supabase/fetch";
import prisma from "../db";
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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (url && publishableKey) {
    try {
      const client = createClient(url, publishableKey, {
        global: { fetch: supabaseContentFetch },
      });
      const { data, error } = await client
        .from("reviews")
        .select("*")
        .eq("is_featured", true)
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .retry(false);

      if (!error && data && data.length > 0) {
        return (data as unknown as DbReviewItem[]).map(formatDbReview);
      }
    } catch (err) {
      console.warn("Supabase getFeaturedReviews error, falling back:", err);
    }
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: "desc" },
    });
    if (reviews.length > 0) {
      return (reviews as Array<{
        id: string;
        authorName: string;
        authorCountry: string | null;
        rating: number;
        reviewDate: Date | null;
        travelMonth: string | null;
        title: string | null;
        comment: string;
        source: string | null;
        isVerified: boolean;
        isFeatured: boolean;
      }>).map((r) => ({
        id: r.id,
        authorName: r.authorName,
        authorCountry: r.authorCountry || "International Traveler",
        rating: r.rating,
        reviewDate: r.reviewDate ? r.reviewDate.toISOString() : "Recent",
        travelMonth: r.travelMonth || "",
        title: r.title || "",
        comment: r.comment,
        source: r.source || "TripAdvisor",
        tourTitle: undefined,
        isVerified: r.isVerified,
        isFeatured: r.isFeatured,
        isPublished: true,
        displayOrder: 0,
      }));
    }
  } catch {
    // ignore
  }

  return (mockReviews.filter((r) => r.isFeatured && r.isPublished !== false) as unknown as FormattedReview[]);
}

export async function getAllReviews(): Promise<FormattedReview[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (url && publishableKey) {
    try {
      const client = createClient(url, publishableKey, {
        global: { fetch: supabaseContentFetch },
      });
      const { data, error } = await client
        .from("reviews")
        .select("*")
        .eq("is_published", true)
        .order("display_order", { ascending: true })
        .retry(false);

      if (!error && data && data.length > 0) {
        return (data as unknown as DbReviewItem[]).map(formatDbReview);
      }
    } catch (err) {
      console.warn("Supabase getAllReviews error, falling back:", err);
    }
  }

  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (reviews.length > 0) {
      return (reviews as Array<{
        id: string;
        authorName: string;
        authorCountry: string | null;
        rating: number;
        reviewDate: Date | null;
        travelMonth: string | null;
        title: string | null;
        comment: string;
        source: string | null;
        isVerified: boolean;
        isFeatured: boolean;
      }>).map((r) => ({
        id: r.id,
        authorName: r.authorName,
        authorCountry: r.authorCountry || "International Traveler",
        rating: r.rating,
        reviewDate: r.reviewDate ? r.reviewDate.toISOString() : "Recent",
        travelMonth: r.travelMonth || "",
        title: r.title || "",
        comment: r.comment,
        source: r.source || "TripAdvisor",
        tourTitle: undefined,
        isVerified: r.isVerified,
        isFeatured: r.isFeatured,
        isPublished: true,
        displayOrder: 0,
      }));
    }
  } catch {
    // ignore
  }

  return (mockReviews as unknown as FormattedReview[]);
}
