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

// 1. GET: Fetch global SEO settings
export async function GET() {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) return NextResponse.json({ error: "Administrator access required." }, { status: 401 });
    const settings = await getSiteSettings();
    return NextResponse.json({
      seo: {
        seo_title_default: settings.seo_title_default,
        seo_description_default: settings.seo_description_default,
        seo_keywords_default: settings.seo_keywords_default,
        seo_og_image: settings.seo_og_image,
        canonical_url: settings.canonical_url,
        google_analytics_id: settings.google_analytics_id || "",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load SEO settings";
    return NextResponse.json({ error: message, seo: DEFAULT_SITE_SETTINGS });
  }
}

// 2. PUT: Update SEO fields
export async function PUT(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as admin." }, { status: 401 });
    }

    const body = await req.json();
    const { seo_title_default, seo_description_default, seo_keywords_default, seo_og_image, canonical_url, google_analytics_id } = body;
    const safeImage = normalizeSafeUrl(seo_og_image || "");
    const safeCanonical = normalizeSafeUrl(canonical_url || "");
    if (safeImage === null || (safeImage && !safeImage.startsWith("/") && !/^https?:\/\//i.test(safeImage))) {
      return NextResponse.json({ error: "Social image must be a local path or HTTP(S) URL." }, { status: 400 });
    }
    if (safeCanonical === null || (safeCanonical && !safeCanonical.startsWith("/") && !/^https?:\/\//i.test(safeCanonical))) {
      return NextResponse.json({ error: "Canonical URL must be a local path or HTTP(S) URL." }, { status: 400 });
    }

    const client = getPrivilegedClient();
    const payload: Partial<SiteSettings> = {
      id: "global",
      seo_title_default,
      seo_description_default,
      seo_keywords_default,
      seo_og_image: safeImage || "/images/hero.webp",
      canonical_url: safeCanonical || "https://manjutourslanka.com/",
      google_analytics_id,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await client
      .from("site_settings")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) return NextResponse.json({ error: `SEO save failed: ${error.message}` }, { status: 500 });

    revalidatePath("/", "layout");
    revalidatePath("/admin/seo");

    return NextResponse.json({ success: true, seo: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save SEO settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
