import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { Database, NavigationItem } from "@/types/database.types";
import { normalizeSafeUrl } from "@/lib/sanitize";

const INITIAL_NAV_ITEMS: NavigationItem[] = [
  // Header Navigation
  { id: "nav-h-1", menu_location: "header", label: "Tours", url: "/tours", display_order: 1, is_external: false, is_active: true, created_at: new Date().toISOString() },
  { id: "nav-h-2", menu_location: "header", label: "Destinations", url: "/destinations", display_order: 2, is_external: false, is_active: true, created_at: new Date().toISOString() },
  { id: "nav-h-3", menu_location: "header", label: "About Us", url: "/about", display_order: 3, is_external: false, is_active: true, created_at: new Date().toISOString() },
  { id: "nav-h-4", menu_location: "header", label: "Custom Itinerary", url: "/custom-tour", display_order: 4, is_external: false, is_active: true, created_at: new Date().toISOString() },
  { id: "nav-h-5", menu_location: "header", label: "Contact", url: "/contact", display_order: 5, is_external: false, is_active: true, created_at: new Date().toISOString() },

  // Footer Quick Links
  { id: "nav-fq-1", menu_location: "footer_quick_links", label: "All Tour Packages", url: "/tours", display_order: 1, is_external: false, is_active: true, created_at: new Date().toISOString() },
  { id: "nav-fq-2", menu_location: "footer_quick_links", label: "Sri Lanka Destinations", url: "/destinations", display_order: 2, is_external: false, is_active: true, created_at: new Date().toISOString() },
  { id: "nav-fq-3", menu_location: "footer_quick_links", label: "Design Custom Tour", url: "/custom-tour", display_order: 3, is_external: false, is_active: true, created_at: new Date().toISOString() },
  { id: "nav-fq-4", menu_location: "footer_quick_links", label: "Travel Reviews", url: "/#stories", display_order: 4, is_external: false, is_active: true, created_at: new Date().toISOString() },

  // Footer Legal
  { id: "nav-fl-1", menu_location: "footer_legal", label: "Terms & Booking Conditions", url: "/terms", display_order: 1, is_external: false, is_active: true, created_at: new Date().toISOString() },
  { id: "nav-fl-2", menu_location: "footer_legal", label: "Privacy Policy", url: "/privacy", display_order: 2, is_external: false, is_active: true, created_at: new Date().toISOString() },
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

// 1. GET: Fetch navigation items
export async function GET(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) return NextResponse.json({ error: "Administrator access required." }, { status: 401 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location"); // header, footer_quick_links, footer_legal, or all

    if (!url || !publishableKey) {
      let list = [...INITIAL_NAV_ITEMS];
      if (location && location !== "all") list = list.filter((n) => n.menu_location === location);
      return NextResponse.json({ items: list });
    }

    const client = getPrivilegedClient();
    let query = client.from("navigation_items").select("*");

    if (location && location !== "all") {
      query = query.eq("menu_location", location);
    }

    const { data, error } = await query.order("display_order", { ascending: true });

    if (error || !data || data.length === 0) {
      let list = [...INITIAL_NAV_ITEMS];
      if (location && location !== "all") list = list.filter((n) => n.menu_location === location);
      return NextResponse.json({ items: list });
    }

    return NextResponse.json({ items: data as NavigationItem[] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load navigation items";
    return NextResponse.json({ error: message, items: INITIAL_NAV_ITEMS }, { status: 500 });
  }
}

// 2. POST: Create navigation item
export async function POST(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as admin." }, { status: 401 });
    }

    const body = await req.json();
    const { menu_location, label, url, display_order, is_external, is_active } = body;

    if (!menu_location || !label || !url) {
      return NextResponse.json({ error: "menu_location, label, and url are required." }, { status: 400 });
    }
    const safeUrl = normalizeSafeUrl(url);
    if (!safeUrl) return NextResponse.json({ error: "Navigation URL must be a local path or a safe web/contact URL." }, { status: 400 });

    const client = getPrivilegedClient();
    const newItem = {
      menu_location,
      label,
      url: safeUrl,
      display_order: Number(display_order) || 0,
      is_external: is_external ?? false,
      is_active: is_active ?? true,
    };

    const { data, error } = await client.from("navigation_items").insert([newItem]).select().single();

    if (error) return NextResponse.json({ error: `Navigation save failed: ${error.message}` }, { status: 500 });

    revalidatePath("/", "layout");
    revalidatePath("/admin/navigation");
    return NextResponse.json({ success: true, item: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create navigation item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 3. PUT: Update navigation item
export async function PUT(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as admin." }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "Navigation Item ID is required." }, { status: 400 });
    }
    if ("url" in updates) {
      const safeUrl = normalizeSafeUrl(updates.url);
      if (!safeUrl) return NextResponse.json({ error: "Navigation URL must be a local path or a safe web/contact URL." }, { status: 400 });
      updates.url = safeUrl;
    }

    const client = getPrivilegedClient();
    const { data, error } = await client
      .from("navigation_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: `Navigation update failed: ${error.message}` }, { status: 500 });

    revalidatePath("/", "layout");
    revalidatePath("/admin/navigation");
    return NextResponse.json({ success: true, item: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update navigation item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 4. DELETE: Safely remove navigation item
export async function DELETE(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as admin." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Navigation Item ID is required." }, { status: 400 });
    }

    const client = getPrivilegedClient();
    await client.from("navigation_items").delete().eq("id", id);

    revalidatePath("/", "layout");
    revalidatePath("/admin/navigation");
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete navigation item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
