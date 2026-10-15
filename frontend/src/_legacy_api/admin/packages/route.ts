import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { Database, TourPackage, TourPackageInsert } from "@/types/database.types";
import { mockTours } from "@/lib/data/mock-data";
import { formatTourPackage } from "@/lib/queries/tours";

/**
 * Helper to get an authenticated Supabase server client from cookies
 */
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

/**
 * Verifies if the request is from an authenticated admin user.
 */
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

/**
 * Elevated client for administrative DB updates
 */
function getPrivilegedClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations.");
  return createSupabaseClient(url, serviceKey);
}

// ==============================================================================
// 1. GET: Fetch packages with search, category, destination, status, and sort
// ==============================================================================
export async function GET(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) return NextResponse.json({ error: "Administrator access required." }, { status: 401 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const style = searchParams.get("style");
    const destination = searchParams.get("destination")?.toLowerCase();
    const status = searchParams.get("status"); // 'all', 'published', 'draft'
    const featured = searchParams.get("featured"); // 'all', 'true', 'false'
    const sortBy = searchParams.get("sortBy") || "display_order"; // display_order, title, duration, price

    if (!url || !publishableKey) {
      // Fallback to formatted seed mock tours
      let list = mockTours.map((t) => formatTourPackage(t as unknown as TourPackage));
      if (search) {
        list = list.filter((t) => t.title.toLowerCase().includes(search) || t.slug.includes(search));
      }
      return NextResponse.json({
        packages: list,
        warning: "Supabase not configured in .env.local; returning seed packages",
      });
    }

    const client = getPrivilegedClient();
    let query = client.from("tour_packages").select("*");

    if (status === "published") query = query.eq("is_published", true);
    if (status === "draft") query = query.eq("is_published", false);
    if (featured === "true") query = query.eq("is_featured", true);
    if (featured === "false") query = query.eq("is_featured", false);
    if (style && style !== "all") query = query.ilike("travel_style", `%${style}%`);

    let ascending = true;
    let orderColumn = "display_order";
    if (sortBy === "title") orderColumn = "title";
    else if (sortBy === "duration") orderColumn = "duration_days";
    else if (sortBy === "price") orderColumn = "starting_price_numeric";
    else if (sortBy === "created_at") {
      orderColumn = "created_at";
      ascending = false;
    }

    const { data, error } = await query.order(orderColumn, { ascending });

    if (error) {
      console.warn("Supabase query error for tour_packages, fallback to seed:", error.message);
      return NextResponse.json({
        packages: mockTours.map((t) => formatTourPackage(t as unknown as TourPackage)),
      });
    }

    let packages = (data as unknown as TourPackage[]) || [];

    // Fallback if DB table is unseeded
    if (packages.length === 0) {
      packages = mockTours.map((t) => formatTourPackage(t as unknown as TourPackage)) as unknown as TourPackage[];
    }

    // Apply client-side search and destination filter for JSON fields
    if (search) {
      packages = packages.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          p.slug.toLowerCase().includes(search) ||
          p.tagline?.toLowerCase().includes(search) ||
          p.overview?.toLowerCase().includes(search)
      );
    }

    if (destination && destination !== "all") {
      packages = packages.filter((p) => {
        const dests = Array.isArray(p.destinations) ? p.destinations : [];
        return dests.some((d) => d.toLowerCase().includes(destination));
      });
    }

    return NextResponse.json({
      packages: packages.map((p) => formatTourPackage(p)),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ==============================================================================
// 2. POST: Create New Tour Package
// ==============================================================================
export async function POST(req: NextRequest) {
  try {
    const user = await checkAdminUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const body = await req.json();
    const title = body.title?.trim();
    let slug = body.slug?.trim().toLowerCase();

    if (!title) {
      return NextResponse.json({ error: "Package title is required." }, { status: 400 });
    }

    // Auto-generate slug if blank
    if (!slug) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    const client = getPrivilegedClient();

    // Check slug uniqueness
    const { data: existingSlug } = await client
      .from("tour_packages")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingSlug) {
      return NextResponse.json(
        { error: `A tour package with URL slug "${slug}" already exists. Please choose a unique slug.` },
        { status: 400 }
      );
    }

    const durationDays = Math.max(1, parseInt(body.duration_days ?? body.durationDays ?? "1", 10));
    const durationNights = Math.max(0, parseInt(body.duration_nights ?? body.durationNights ?? String(durationDays - 1), 10));

    // Numeric price extraction for sorting
    const priceStr = String(body.starting_price ?? body.startingPrice ?? "Request a Quote");
    const numericMatch = priceStr.replace(/[^0-9.]/g, "");
    const priceNumeric = numericMatch ? parseFloat(numericMatch) : 0;

    const payload: TourPackageInsert = {
      title,
      slug,
      tagline: body.tagline?.trim() || "",
      overview: body.overview?.trim() || "",
      hero_image: body.hero_image || body.heroImage || "",
      hero_image_metadata: body.hero_image_metadata || body.heroImageMetadata || null,
      gallery_images: body.gallery_images || body.galleryImages || [],
      travel_style: body.travel_style || body.travelStyle || "Private Chauffeur",
      destinations: body.destinations || [],
      duration_days: durationDays,
      duration_nights: durationNights,
      starting_price: priceStr,
      starting_price_numeric: priceNumeric,
      currency: body.currency || "USD",
      price_type: body.price_type || body.priceType || "custom_quote",
      min_travelers: Math.max(1, parseInt(body.min_travelers ?? body.minTravelers ?? "1", 10)),
      max_travelers: Math.max(1, parseInt(body.max_travelers ?? body.maxTravelers ?? "12", 10)),
      inclusions: body.inclusions || [],
      exclusions: body.exclusions || [],
      itinerary: body.itinerary || [],
      accommodation_details: body.accommodation_details || body.accommodationDetails || "",
      transport_details: body.transport_details || body.transportDetails || "",
      meals_included: body.meals_included || body.mealsIncluded || "",
      activities: body.activities || body.highlights || [],
      optional_activities: body.optional_activities || body.optionalActivities || [],
      suitable_for: body.suitable_for || body.suitableFor || [],
      booking_conditions: body.booking_conditions || body.bookingConditions || "",
      cancellation_policy: body.cancellation_policy || body.cancellationPolicy || "",
      faqs: body.faqs || [],
      seo_title: body.seo_title || body.seoTitle || "",
      seo_description: body.seo_description || body.seoDescription || "",
      display_order: parseInt(body.display_order ?? body.displayOrder ?? "0", 10),
      is_featured: Boolean(body.is_featured ?? body.isFeatured),
      is_published: Boolean(body.is_published ?? body.isPublished ?? true),
      created_by: user.id,
    };

    const { data, error } = await client
      .from("tour_packages")
      .insert(payload as unknown as TourPackageInsert)
      .select()
      .single();

    if (error) {
      console.error("Failed to insert tour_package:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Revalidate website paths for instant updates without re-deploy
    revalidatePath("/tours");
    revalidatePath(`/tours/${slug}`);
    revalidatePath("/");
    revalidatePath("/admin/packages");

    return NextResponse.json({
      success: true,
      package: formatTourPackage(data as unknown as TourPackage),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ==============================================================================
// 3. PUT: Update Existing Tour Package
// ==============================================================================
export async function PUT(req: NextRequest) {
  try {
    const user = await checkAdminUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const body = await req.json();
    const id = body.id;
    const title = body.title?.trim();
    let slug = body.slug?.trim().toLowerCase();

    if (!id || !title) {
      return NextResponse.json({ error: "Package ID and title are required." }, { status: 400 });
    }

    if (!slug) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    const client = getPrivilegedClient();

    // Check slug collision with any other package
    const { data: existingSlug } = await client
      .from("tour_packages")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (existingSlug) {
      return NextResponse.json(
        { error: `URL slug "${slug}" is already used by another tour package.` },
        { status: 400 }
      );
    }

    const durationDays = Math.max(1, parseInt(body.duration_days ?? body.durationDays ?? "1", 10));
    const durationNights = Math.max(0, parseInt(body.duration_nights ?? body.durationNights ?? String(durationDays - 1), 10));

    const priceStr = String(body.starting_price ?? body.startingPrice ?? "Request a Quote");
    const numericMatch = priceStr.replace(/[^0-9.]/g, "");
    const priceNumeric = numericMatch ? parseFloat(numericMatch) : 0;

    const updatePayload = {
      title,
      slug,
      tagline: body.tagline?.trim() || "",
      overview: body.overview?.trim() || "",
      hero_image: body.hero_image || body.heroImage || "",
      hero_image_metadata: body.hero_image_metadata || body.heroImageMetadata || null,
      gallery_images: body.gallery_images || body.galleryImages || [],
      travel_style: body.travel_style || body.travelStyle || "Private Chauffeur",
      destinations: body.destinations || [],
      duration_days: durationDays,
      duration_nights: durationNights,
      starting_price: priceStr,
      starting_price_numeric: priceNumeric,
      currency: body.currency || "USD",
      price_type: body.price_type || body.priceType || "custom_quote",
      min_travelers: Math.max(1, parseInt(body.min_travelers ?? body.minTravelers ?? "1", 10)),
      max_travelers: Math.max(1, parseInt(body.max_travelers ?? body.maxTravelers ?? "12", 10)),
      inclusions: body.inclusions || [],
      exclusions: body.exclusions || [],
      itinerary: body.itinerary || [],
      accommodation_details: body.accommodation_details || body.accommodationDetails || "",
      transport_details: body.transport_details || body.transportDetails || "",
      meals_included: body.meals_included || body.mealsIncluded || "",
      activities: body.activities || body.highlights || [],
      optional_activities: body.optional_activities || body.optionalActivities || [],
      suitable_for: body.suitable_for || body.suitableFor || [],
      booking_conditions: body.booking_conditions || body.bookingConditions || "",
      cancellation_policy: body.cancellation_policy || body.cancellationPolicy || "",
      faqs: body.faqs || [],
      seo_title: body.seo_title || body.seoTitle || "",
      seo_description: body.seo_description || body.seoDescription || "",
      display_order: parseInt(body.display_order ?? body.displayOrder ?? "0", 10),
      is_featured: Boolean(body.is_featured ?? body.isFeatured),
      is_published: Boolean(body.is_published ?? body.isPublished),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from("tour_packages")
      .update(updatePayload as unknown as TourPackageInsert)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update tour_package:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Revalidate website paths
    revalidatePath("/tours");
    revalidatePath(`/tours/${slug}`);
    revalidatePath("/");
    revalidatePath("/admin/packages");

    return NextResponse.json({
      success: true,
      package: formatTourPackage(data as unknown as TourPackage),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ==============================================================================
// 4. DELETE: Delete Tour Package with Enquiry Protection
// ==============================================================================
export async function DELETE(req: NextRequest) {
  try {
    const user = await checkAdminUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Package ID is required." }, { status: 400 });
    }

    const client = getPrivilegedClient();

    // Fetch the package first to get slug/title for revalidation and enquiry checking
    const { data: tourRecord } = await client
      .from("tour_packages")
      .select("id, slug, title")
      .eq("id", id)
      .maybeSingle();

    if (!tourRecord) {
      return NextResponse.json({ error: "Tour package not found." }, { status: 404 });
    }

    const tourRec = tourRecord as unknown as { id: string; slug: string; title: string };

    // Check if customer enquiries reference this tour
    const { count: enquiryCount } = await client
      .from("tour_enquiries")
      .select("id", { count: "exact", head: true })
      .or(`tour_id.eq.${id},tour_id.eq.${tourRec.slug},tour_title.eq.${tourRec.title}`);

    // Delete the tour package record (enquiries remain completely intact)
    const { error } = await client
      .from("tour_packages")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete tour_package:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Revalidate
    revalidatePath("/tours");
    revalidatePath(`/tours/${tourRec.slug}`);
    revalidatePath("/");
    revalidatePath("/admin/packages");

    let message = "Tour package successfully removed.";
    if (enquiryCount && enquiryCount > 0) {
      message += ` Note: ${enquiryCount} historical customer enquiries for this tour have been safely preserved.`;
    }

    return NextResponse.json({
      success: true,
      message,
      enquiryCount: enquiryCount || 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
