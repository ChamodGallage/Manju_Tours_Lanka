import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { Database, GalleryCollectionItem } from "@/types/database.types";

const INITIAL_GALLERIES: GalleryCollectionItem[] = [
  {
    id: "gal-1",
    title: "Southern Coast & Pristine Beaches",
    slug: "southern-coast-beaches",
    description: "Golden palm-fringed sands, quiet surf breaks, and historic ramparts from Hikkaduwa to Mirissa.",
    category: "beaches",
    cover_image: "/images/hero-beach.webp",
    images: [
      { src: "/images/hero-beach.webp", alt: "Mirissa Secret Beach", caption: "Sunrise over palm tree hill in Mirissa" },
      { src: "/images/destinations/hikkaduwa/hero.webp", alt: "Hikkaduwa Coral Reef", caption: "Clear shallow waters and sea turtles" },
      { src: "/images/destinations/mirissa/hero.webp", alt: "Mirissa Harbor", caption: "Early morning whale safari departures" },
    ],
    display_order: 1,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "gal-2",
    title: "Misty Highlands & Scenic Railways",
    slug: "misty-highlands-railway",
    description: "Emerald Ceylon tea plantations, colonial estates, and the world-famous blue train through Ella.",
    category: "scenic",
    cover_image: "/images/hero-tea.webp",
    images: [
      { src: "/images/hero-tea.webp", alt: "Tea Estate Ella", caption: "Lush rolling hills of Nuwara Eliya" },
      { src: "/images/destinations/ella/hero.webp", alt: "Nine Arches Bridge", caption: "Historic stone viaduct nestled in the jungle" },
      { src: "/images/destinations/haputale/hero.webp", alt: "Lipton's Seat", caption: "Panoramic southern viewpoint at dawn" },
    ],
    display_order: 2,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "gal-3",
    title: "Ancient Kingdoms & Sacred Heritage",
    slug: "ancient-kingdoms-heritage",
    description: "UNESCO World Heritage fortresses, cave temples, and royal capitals steeped in 2,500 years of chronicles.",
    category: "heritage",
    cover_image: "/images/hero-sigiriya.webp",
    images: [
      { src: "/images/hero-sigiriya.webp", alt: "Sigiriya Lion Rock", caption: "Ancient palace atop a 200m vertical rock fortress" },
      { src: "/images/destinations/kandy/hero.webp", alt: "Temple of the Sacred Tooth Relic", caption: "Spiritual sanctuary in Kandy lake valley" },
    ],
    display_order: 3,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

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

// 1. GET: Fetch all gallery collections
export async function GET() {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) return NextResponse.json({ error: "Administrator access required." }, { status: 401 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!url || !publishableKey) {
      return NextResponse.json({ collections: INITIAL_GALLERIES });
    }

    const client = getPrivilegedClient();
    const { data, error } = await client
      .from("gallery_collections")
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return NextResponse.json({ collections: INITIAL_GALLERIES });
    }

    return NextResponse.json({ collections: data as GalleryCollectionItem[] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load galleries";
    return NextResponse.json({ error: message, collections: INITIAL_GALLERIES }, { status: 500 });
  }
}

// 2. POST: Create new gallery collection
export async function POST(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as admin." }, { status: 401 });
    }

    const body = await req.json();
    const { title, slug, description, category, cover_image, images, display_order, is_published } = body;

    if (!title || !slug) {
      return NextResponse.json({ error: "Title and slug are required." }, { status: 400 });
    }

    const client = getPrivilegedClient();
    const newCollection = {
      title,
      slug,
      description: description || "",
      category: category || "island-life",
      cover_image: cover_image || "/images/hero.webp",
      images: Array.isArray(images) ? images : [],
      display_order: Number(display_order) || 0,
      is_published: is_published ?? true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from("gallery_collections")
      .insert([newCollection])
      .select()
      .single();

    if (error) return NextResponse.json({ error: `Gallery save failed: ${error.message}` }, { status: 500 });

    revalidatePath("/admin/galleries");
    revalidatePath("/admin/photos");
    return NextResponse.json({ success: true, collection: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create gallery";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 3. PUT: Update existing gallery collection
export async function PUT(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as admin." }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Gallery ID is required." }, { status: 400 });
    }

    const client = getPrivilegedClient();
    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from("gallery_collections")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: `Gallery update failed: ${error.message}` }, { status: 500 });

    revalidatePath("/admin/galleries");
    return NextResponse.json({ success: true, collection: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update gallery";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 4. DELETE: Safely remove gallery collection
export async function DELETE(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as admin." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Gallery ID is required." }, { status: 400 });
    }

    const client = getPrivilegedClient();
    await client.from("gallery_collections").delete().eq("id", id);

    revalidatePath("/admin/galleries");
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete gallery";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
