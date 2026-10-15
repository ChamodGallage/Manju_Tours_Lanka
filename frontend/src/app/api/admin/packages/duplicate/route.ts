import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { Database, TourPackage, TourPackageInsert } from "@/types/database.types";
import { formatTourPackage } from "@/lib/queries/tours";

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

export async function POST(req: NextRequest) {
  try {
    const user = await checkAdminUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const body = await req.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ error: "Original package ID is required." }, { status: 400 });
    }

    const client = getPrivilegedClient();

    // Fetch original
    const { data: original, error: fetchErr } = await client
      .from("tour_packages")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchErr || !original) {
      return NextResponse.json({ error: "Tour package not found." }, { status: 404 });
    }

    const orig = original as unknown as TourPackage;

    // Determine unique new slug
    const baseSlug = `${orig.slug}-copy`;
    let newSlug = baseSlug;
    let counter = 1;

    while (true) {
      const { data: existing } = await client
        .from("tour_packages")
        .select("id")
        .eq("slug", newSlug)
        .maybeSingle();

      if (!existing) break;
      counter++;
      newSlug = `${baseSlug}-${counter}`;
    }

    const duplicatePayload: TourPackageInsert = {
      title: `${orig.title} (Copy)`,
      slug: newSlug,
      tagline: orig.tagline,
      overview: orig.overview,
      hero_image: orig.hero_image,
      hero_image_metadata: orig.hero_image_metadata,
      gallery_images: orig.gallery_images,
      travel_style: orig.travel_style,
      destinations: orig.destinations,
      duration_days: orig.duration_days,
      duration_nights: orig.duration_nights,
      starting_price: orig.starting_price,
      starting_price_numeric: orig.starting_price_numeric,
      currency: orig.currency,
      price_type: orig.price_type,
      min_travelers: orig.min_travelers,
      max_travelers: orig.max_travelers,
      inclusions: orig.inclusions,
      exclusions: orig.exclusions,
      itinerary: orig.itinerary,
      accommodation_details: orig.accommodation_details,
      transport_details: orig.transport_details,
      meals_included: orig.meals_included,
      activities: orig.activities,
      optional_activities: orig.optional_activities,
      suitable_for: orig.suitable_for,
      booking_conditions: orig.booking_conditions,
      cancellation_policy: orig.cancellation_policy,
      faqs: orig.faqs,
      seo_title: `${orig.title} (Copy)`,
      seo_description: orig.seo_description,
      display_order: (orig.display_order || 0) + 1,
      is_featured: false,
      is_published: false, // Save as Draft
      created_by: user.id,
    };

    const { data: created, error: insertErr } = await client
      .from("tour_packages")
      .insert(duplicatePayload as unknown as TourPackageInsert)
      .select()
      .single();

    if (insertErr) {
      console.error("Failed to duplicate tour_package:", insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    revalidatePath("/admin/packages");

    return NextResponse.json({
      success: true,
      package: formatTourPackage(created as unknown as TourPackage),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
