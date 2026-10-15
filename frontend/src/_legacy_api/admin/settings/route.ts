import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { Database, SiteSettings } from "@/types/database.types";
import { getSiteSettings, DEFAULT_SITE_SETTINGS } from "@/lib/queries/site-settings";
import { normalizeSafeUrl } from "@/lib/sanitize";

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

// 1. GET: Fetch current site settings
export async function GET() {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) return NextResponse.json({ error: "Administrator access required." }, { status: 401 });
    const settings = await getSiteSettings();
    return NextResponse.json({ settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load site settings";
    return NextResponse.json({ error: message, settings: DEFAULT_SITE_SETTINGS });
  }
}

// 2. PUT: Update site settings
export async function PUT(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as admin." }, { status: 401 });
    }

    const body = await req.json();
    const urlFields = ["social_facebook", "social_instagram", "social_tripadvisor", "social_youtube", "logo_url", "favicon_url", "seo_og_image"] as const;
    for (const field of urlFields) {
      if (field in body) {
        const safeValue = normalizeSafeUrl(body[field]);
        if (safeValue === null || (safeValue && !safeValue.startsWith("/") && !/^https?:\/\//i.test(safeValue))) {
          return NextResponse.json({ error: `${field} must be a local path or HTTP(S) URL.` }, { status: 400 });
        }
        body[field] = safeValue;
      }
    }
    const client = getPrivilegedClient();

    const payload: Partial<SiteSettings> = {
      ...body,
      id: "global",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from("site_settings")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: `Settings save failed: ${error.message}` }, { status: 500 });

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
    revalidatePath("/admin/seo");

    return NextResponse.json({ success: true, settings: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
