import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { Database, DestinationItem } from "@/types/database.types";
import { mockDestinations } from "@/lib/data/mock-data";

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

// 1. GET: Fetch destinations with search & filters
export async function GET(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) return NextResponse.json({ error: "Administrator access required." }, { status: 401 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const region = searchParams.get("region");
    const status = searchParams.get("status"); // all, published, draft

    if (!url || !publishableKey) {
      let list = [...mockDestinations];
      if (search) list = list.filter((d) => d.name.toLowerCase().includes(search) || d.slug.includes(search));
      return NextResponse.json({ destinations: list });
    }

    const client = getPrivilegedClient();
    let query = client.from("destinations").select("*");

    if (status === "published") query = query.eq("is_published", true);
    if (status === "draft") query = query.eq("is_published", false);
    if (region && region !== "all") query = query.eq("region", region);

    const { data, error } = await query.order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      let list = [...mockDestinations];
      if (search) list = list.filter((d) => d.name.toLowerCase().includes(search) || d.slug.includes(search));
      return NextResponse.json({ destinations: list });
    }

    let destinations = (data as unknown as DestinationItem[]) || [];
    if (search) {
      destinations = destinations.filter(
        (d) => d.name.toLowerCase().includes(search) || d.slug.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ destinations });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// 2. POST: Create New Destination
export async function POST(req: NextRequest) {
  try {
    const user = await checkAdminUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const body = await req.json();
    const name = body.name?.trim();
    let slug = body.slug?.trim().toLowerCase();

    if (!name) {
      return NextResponse.json({ error: "Destination name is required." }, { status: 400 });
    }

    if (!slug) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    const client = getPrivilegedClient();

    // Check slug collision
    const { data: existing } = await client
      .from("destinations")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `A destination with slug "${slug}" already exists.` },
        { status: 400 }
      );
    }

    const payload = {
      name,
      slug,
      tagline: body.tagline?.trim() || "",
      region: body.region || "Cultural Triangle",
      summary: body.summary?.trim() || "",
      content: body.content?.trim() || "",
      hero_image: body.hero_image || body.heroImage?.src || "/images/destinations/sigiriya/hero.webp",
      hero_image_metadata: body.hero_image_metadata || null,
      gallery_images: body.gallery_images || body.galleryImages || [],
      highlights: body.highlights || [],
      best_time_to_visit: body.best_time_to_visit || body.bestTimeToVisit || "",
      ideal_duration: body.ideal_duration || body.idealDuration || "2 - 3 Days",
      travel_tips: body.travel_tips || "",
      latitude: parseFloat(body.latitude) || 0,
      longitude: parseFloat(body.longitude) || 0,
      display_order: parseInt(body.display_order ?? body.displayOrder ?? "0", 10),
      is_featured: Boolean(body.is_featured ?? body.isFeatured),
      is_published: Boolean(body.is_published ?? body.isPublished ?? true),
      seo_title: body.seo_title || `${name} Travel Guide | Sri Lanka Destinations`,
      seo_description: body.seo_description || body.summary?.slice(0, 160) || "",
    };

    const { data, error } = await client
      .from("destinations")
      .insert(payload as unknown as Record<string, unknown>)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/destinations");
    revalidatePath(`/destinations/${slug}`);
    revalidatePath("/");
    revalidatePath("/admin/destinations");

    return NextResponse.json({ success: true, destination: data });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// 3. PUT: Update Existing Destination
export async function PUT(req: NextRequest) {
  try {
    const user = await checkAdminUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const body = await req.json();
    const id = body.id;
    const name = body.name?.trim();
    const slug = body.slug?.trim().toLowerCase();

    if (!id || !name || !slug) {
      return NextResponse.json({ error: "ID, name, and slug are required." }, { status: 400 });
    }

    const client = getPrivilegedClient();

    // Check slug collision
    const { data: existingSlug } = await client
      .from("destinations")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (existingSlug) {
      return NextResponse.json(
        { error: `URL slug "${slug}" is already in use by another destination.` },
        { status: 400 }
      );
    }

    const updatePayload = {
      name,
      slug,
      tagline: body.tagline?.trim() || "",
      region: body.region || "Cultural Triangle",
      summary: body.summary?.trim() || "",
      content: body.content?.trim() || "",
      hero_image: body.hero_image || body.heroImage?.src || "/images/destinations/sigiriya/hero.webp",
      hero_image_metadata: body.hero_image_metadata || null,
      gallery_images: body.gallery_images || body.galleryImages || [],
      highlights: body.highlights || [],
      best_time_to_visit: body.best_time_to_visit || body.bestTimeToVisit || "",
      ideal_duration: body.ideal_duration || body.idealDuration || "2 - 3 Days",
      travel_tips: body.travel_tips || "",
      latitude: parseFloat(body.latitude) || 0,
      longitude: parseFloat(body.longitude) || 0,
      display_order: parseInt(body.display_order ?? body.displayOrder ?? "0", 10),
      is_featured: Boolean(body.is_featured ?? body.isFeatured),
      is_published: Boolean(body.is_published ?? body.isPublished),
      seo_title: body.seo_title || "",
      seo_description: body.seo_description || "",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from("destinations")
      .update(updatePayload as unknown as Record<string, unknown>)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/destinations");
    revalidatePath(`/destinations/${slug}`);
    revalidatePath("/");
    revalidatePath("/admin/destinations");

    return NextResponse.json({ success: true, destination: data });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

// 4. DELETE: Delete Destination
export async function DELETE(req: NextRequest) {
  try {
    const user = await checkAdminUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Destination ID is required." }, { status: 400 });
    }

    const client = getPrivilegedClient();

    const { data: destRecord } = await client
      .from("destinations")
      .select("id, slug, name")
      .eq("id", id)
      .maybeSingle();

    if (!destRecord) {
      return NextResponse.json({ error: "Destination not found." }, { status: 404 });
    }

    const destRec = destRecord as unknown as { id: string; slug: string; name: string };

    const { error } = await client.from("destinations").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/destinations");
    revalidatePath(`/destinations/${destRec.slug}`);
    revalidatePath("/");
    revalidatePath("/admin/destinations");

    return NextResponse.json({
      success: true,
      message: `Destination "${destRec.name}" deleted successfully.`,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
