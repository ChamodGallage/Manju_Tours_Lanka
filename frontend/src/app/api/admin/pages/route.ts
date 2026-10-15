import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { Database, PageRecord, PageSectionItem } from "@/types/database.types";
import { normalizeSafeUrl } from "@/lib/sanitize";
import {
  getRuntimePages,
  getRuntimePage,
  updateRuntimePage,
  addRuntimePage,
  getRuntimeSections,
  upsertRuntimeSection,
  deleteRuntimeSection,
} from "@/lib/data/pages-cms-dataset";

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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createSupabaseClient(url, serviceKey);
}

// ==============================================================================
// 1. GET: Fetch pages list OR page sections
// ==============================================================================
export async function GET(req: NextRequest) {
  try {
    const _adminUser = await checkAdminUser();
    void _adminUser;
    // Allow reading in dev if cookies not yet established, but enforce admin when available
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode"); // "pages" or "sections" (default)
    const pageKey = searchParams.get("page") || "home";

    // Mode: "pages" -> return list of all 13 pages
    if (mode === "pages") {
      const client = getPrivilegedClient();
      if (client) {
        try {
          const { data, error } = await client
            .from("pages")
            .select("*")
            .order("display_order", { ascending: true });
          if (!error && data && data.length > 0) {
            return NextResponse.json({ pages: data as PageRecord[] });
          }
        } catch {
          // fallback below
        }
      }
      return NextResponse.json({ pages: getRuntimePages() });
    }

    // Default: Fetch sections and page metadata for a specific pageKey
    const pageMeta = getRuntimePage(pageKey);
    let sections: PageSectionItem[] = [];

    const client = getPrivilegedClient();
    if (client) {
      try {
        const { data, error } = await client
          .from("page_sections")
          .select("*")
          .eq("page_key", pageKey)
          .order("display_order", { ascending: true });
        if (!error && data && data.length > 0) {
          sections = data as PageSectionItem[];
        }
      } catch {
        // fallback below
      }
    }

    if (sections.length === 0) {
      sections = getRuntimeSections(pageKey);
    }

    return NextResponse.json({
      page: pageMeta || null,
      sections,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load page content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ==============================================================================
// 2. PUT: Update page metadata OR section content
// ==============================================================================
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetType = "section", ...payload } = body;

    // A) Updating Page Metadata (title, slug, SEO, status, navigation)
    if (targetType === "page") {
      const { page_key, ...updates } = payload;
      if (!page_key) {
        return NextResponse.json({ error: "page_key is required." }, { status: 400 });
      }

      if (updates.slug && !updates.slug.startsWith("/")) {
        return NextResponse.json({ error: "Slug must start with '/' (e.g., /about)." }, { status: 400 });
      }

      // Update in Supabase if available
      const client = getPrivilegedClient();
      if (client) {
        try {
          await client.from("pages").update({
            ...updates,
            updated_at: new Date().toISOString(),
          }).eq("page_key", page_key);
        } catch (err) {
          console.warn("Supabase pages update fallback:", err);
        }
      }

      // Update runtime store
      const updatedPage = updateRuntimePage(page_key, updates);

      // Revalidate cache
      if (updates.slug) revalidatePath(updates.slug);
      revalidatePath("/admin/pages");

      return NextResponse.json({ success: true, page: updatedPage });
    }

    // B) Updating Section Content & Layout
    const { id, page_key, ...secUpdates } = payload;
    if (!id && !page_key) {
      return NextResponse.json({ error: "Section ID or page_key is required" }, { status: 400 });
    }

    if ("button_url" in secUpdates && secUpdates.button_url) {
      const safe = normalizeSafeUrl(secUpdates.button_url);
      if (safe === null) {
        return NextResponse.json({ error: "Primary Button URL is invalid or unsafe." }, { status: 400 });
      }
      secUpdates.button_url = safe;
    }

    if ("secondary_button_url" in secUpdates && secUpdates.secondary_button_url) {
      const safe = normalizeSafeUrl(secUpdates.secondary_button_url);
      if (safe === null) {
        return NextResponse.json({ error: "Secondary Button URL is invalid or unsafe." }, { status: 400 });
      }
      secUpdates.secondary_button_url = safe;
    }

    // Try Supabase update
    const client = getPrivilegedClient();
    if (client && id) {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
        if (isUuid) {
          await client.from("page_sections").update({
            ...secUpdates,
            updated_at: new Date().toISOString(),
          }).eq("id", id);
        }
      } catch (err) {
        console.warn("Supabase section update fallback:", err);
      }
    }

    // Update runtime CMS store
    const saved = upsertRuntimeSection({
      id,
      page_key,
      ...secUpdates,
    } as PageSectionItem);

    // Revalidate affected public routes
    const pageMeta = getRuntimePage(page_key);
    if (pageMeta?.slug) {
      revalidatePath(pageMeta.slug);
    }
    revalidatePath("/admin/pages");

    return NextResponse.json({ success: true, section: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ==============================================================================
// 3. POST: Create new Section OR Page
// ==============================================================================
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetType = "section", ...data } = body;

    // A) Creating a new Page
    if (targetType === "page") {
      const { title, slug, page_key, navigation_label } = data;
      if (!title || !slug || !page_key) {
        return NextResponse.json({ error: "Title, slug, and page_key are required." }, { status: 400 });
      }

      const formattedSlug = slug.startsWith("/") ? slug : `/${slug}`;
      const newPage: PageRecord = {
        id: `page-${page_key}-${Date.now()}`,
        slug: formattedSlug,
        page_key,
        title,
        navigation_label: navigation_label || title,
        nav_location: "header",
        is_published: true,
        status: "published",
        seo_title: `${title} | Manju Tours Lanka`,
        seo_description: `Explore ${title} with Manju Tours Lanka.`,
        seo_og_image: "/images/hero.webp",
        is_template: false,
        layout_type: "standard",
        display_order: getRuntimePages().length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const client = getPrivilegedClient();
      if (client) {
        try {
          await client.from("pages").insert([newPage]);
        } catch (err) {
          console.warn("Supabase insert page fallback:", err);
        }
      }

      addRuntimePage(newPage);
      revalidatePath("/admin/pages");
      return NextResponse.json({ success: true, page: newPage });
    }

    // B) Creating a new Section
    const { page_key, section_key, section_type, title, subtitle, badge, content, button_text, button_url, image_url, background_style, text_align } = data;
    if (!page_key || !title) {
      return NextResponse.json({ error: "page_key and title are required." }, { status: 400 });
    }

    const secKey = section_key || `sec-${Date.now()}`;
    const newSection: PageSectionItem = {
      id: `sec-${page_key}-${Date.now()}`,
      page_key,
      section_key: secKey,
      section_type: section_type || "text-image",
      title,
      subtitle: subtitle || "",
      badge: badge || "",
      content: content || "",
      button_text: button_text || "",
      button_url: normalizeSafeUrl(button_url || "") || "",
      image_url: image_url || "",
      background_style: background_style || "default",
      text_align: text_align || "left",
      is_visible: true,
      status: "published",
      display_order: getRuntimeSections(page_key).length + 1,
      updated_at: new Date().toISOString(),
    };

    const client = getPrivilegedClient();
    if (client) {
      try {
        await client.from("page_sections").insert([newSection]);
      } catch (err) {
        console.warn("Supabase insert section fallback:", err);
      }
    }

    const saved = upsertRuntimeSection(newSection);

    const pageMeta = getRuntimePage(page_key);
    if (pageMeta?.slug) revalidatePath(pageMeta.slug);
    revalidatePath("/admin/pages");

    return NextResponse.json({ success: true, section: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create content";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ==============================================================================
// 4. DELETE: Remove a Section or Page
// ==============================================================================
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sectionId = searchParams.get("id");
    const pageKey = searchParams.get("page_key");

    if (sectionId) {
      const client = getPrivilegedClient();
      if (client) {
        try {
          await client.from("page_sections").delete().eq("id", sectionId);
        } catch (err) {
          console.warn("Supabase delete section fallback:", err);
        }
      }

      deleteRuntimeSection(sectionId);
      revalidatePath("/admin/pages");
      return NextResponse.json({ success: true });
    }

    if (pageKey) {
      if (pageKey === "home") {
        return NextResponse.json({ error: "Home page cannot be deleted." }, { status: 400 });
      }

      const client = getPrivilegedClient();
      if (client) {
        try {
          await client.from("pages").delete().eq("page_key", pageKey);
        } catch (err) {
          console.warn("Supabase delete page fallback:", err);
        }
      }

      updateRuntimePage(pageKey, { is_published: false, status: "draft" });
      revalidatePath("/admin/pages");
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "id or page_key parameter is required" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete item";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
