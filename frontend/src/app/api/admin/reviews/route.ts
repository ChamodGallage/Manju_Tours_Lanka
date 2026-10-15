import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { Database, ReviewItem } from "@/types/database.types";
import { mockReviews } from "@/lib/data/mock-data";

// Fallback formatted mock reviews if Supabase is unseeded
const FALLBACK_REVIEWS: ReviewItem[] = mockReviews.map((r, idx) => ({
  id: r.id || `mock-review-${idx + 1}`,
  author_name: r.authorName,
  author_country: r.authorCountry || "International Traveler",
  rating: r.rating || 5,
  review_date: r.reviewDate || "Recent",
  travel_month: r.travelMonth || "",
  title: r.title || "Unforgettable Sri Lanka Holiday",
  comment: r.comment,
  source: r.source || "TripAdvisor",
  tour_title: (r as unknown as { tourTitle?: string }).tourTitle || "Sri Lanka Tour",
  is_verified: (r as unknown as { isVerified?: boolean }).isVerified ?? true,
  is_featured: r.isFeatured ?? true,
  display_order: idx + 1,
  created_at: new Date(Date.now() - idx * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
}));

async function getAuthClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) return null;
  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {},
    },
  });
}

async function checkAdminUser() {
  const authClient = await getAuthClient();
  if (!authClient) return null;
  const { data: { user }, error: authError } = await authClient.auth.getUser();
  if (authError || !user) return null;
  if (user.app_metadata?.role === "admin") return user;
  const { data: adminRow, error: adminError } = await authClient
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  return adminError || !adminRow ? null : user;
}

function getPrivilegedClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations.");
  return createSupabaseClient(url, serviceKey);
}

// 1. GET: Fetch reviews with search and filter
export async function GET(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) return NextResponse.json({ error: "Administrator access required." }, { status: 401 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const featured = searchParams.get("featured"); // "all", "true", "false"

    if (!url || !publishableKey) {
      let list = [...FALLBACK_REVIEWS];
      if (featured === "true") list = list.filter((r) => r.is_featured);
      if (featured === "false") list = list.filter((r) => !r.is_featured);
      if (search) {
        list = list.filter(
          (r) =>
            r.author_name.toLowerCase().includes(search) ||
            r.comment.toLowerCase().includes(search) ||
            r.author_country.toLowerCase().includes(search)
        );
      }
      return NextResponse.json({ reviews: list });
    }

    const client = getPrivilegedClient();
    let query = client.from("reviews").select("*");

    if (featured === "true") query = query.eq("is_featured", true);
    if (featured === "false") query = query.eq("is_featured", false);

    const { data, error } = await query.order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      let list = [...FALLBACK_REVIEWS];
      if (featured === "true") list = list.filter((r) => r.is_featured);
      if (featured === "false") list = list.filter((r) => !r.is_featured);
      if (search) {
        list = list.filter(
          (r) =>
            r.author_name.toLowerCase().includes(search) ||
            r.comment.toLowerCase().includes(search) ||
            r.author_country.toLowerCase().includes(search)
        );
      }
      return NextResponse.json({ reviews: list });
    }

    let reviews = (data as unknown as ReviewItem[]) || [];
    if (search) {
      reviews = reviews.filter(
        (r) =>
          r.author_name.toLowerCase().includes(search) ||
          r.comment.toLowerCase().includes(search) ||
          r.author_country.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ reviews });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load reviews";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 2. POST: Create a new review
export async function POST(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as admin." }, { status: 401 });
    }

    const body = await req.json();
    const {
      author_name,
      author_country,
      rating,
      review_date,
      travel_month,
      title,
      comment,
      source,
      tour_title,
      is_verified,
      is_featured,
      is_published,
      display_order,
    } = body;

    if (!author_name || !comment) {
      return NextResponse.json({ error: "Author name and comment are required." }, { status: 400 });
    }

    const client = getPrivilegedClient();
    const newRecord = {
      author_name,
      author_country: author_country || "Guest",
      rating: Number(rating) || 5,
      review_date: review_date || new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      travel_month: travel_month || "",
      title: title || "",
      comment,
      source: source || "TripAdvisor",
      tour_title: tour_title || "",
      is_verified: is_verified ?? true,
      is_featured: is_featured ?? false,
      is_published: is_published ?? true,
      display_order: Number(display_order) || 0,
    };

    const { data, error } = await client.from("reviews").insert([newRecord]).select().single();

    if (error) return NextResponse.json({ error: `Review save failed: ${error.message}` }, { status: 500 });

    revalidatePath("/admin/reviews");
    revalidatePath("/");
    return NextResponse.json({ success: true, review: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create review";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 3. PUT: Update existing review
export async function PUT(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as admin." }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const client = getPrivilegedClient();
    const updatePayload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from("reviews")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: `Review update failed: ${error.message}` }, { status: 500 });

    revalidatePath("/admin/reviews");
    revalidatePath("/");
    return NextResponse.json({ success: true, review: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update review";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 4. DELETE: Safely remove review
export async function DELETE(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as admin." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 });
    }

    const client = getPrivilegedClient();
    await client.from("reviews").delete().eq("id", id);

    revalidatePath("/admin/reviews");
    revalidatePath("/");
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete review";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
