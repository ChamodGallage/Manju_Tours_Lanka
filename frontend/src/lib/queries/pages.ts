import { createClient } from "@supabase/supabase-js";
import type { Database, PageRecord } from "@/types/database.types";
import { supabaseContentFetch } from "@/lib/supabase/fetch";
import { getRuntimePages, getRuntimePage } from "@/lib/data/pages-cms-dataset";

export async function getAllPages(statusFilter: "published" | "all" = "published"): Promise<PageRecord[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (url && publishableKey) {
    try {
      const client = createClient<Database>(url, publishableKey, {
        global: { fetch: supabaseContentFetch },
      });
      let query = client.from("pages").select("*");
      if (statusFilter === "published") {
        query = query.eq("is_published", true).eq("status", "published");
      }
      const { data, error } = await query.order("display_order", { ascending: true }).retry(false);
      if (!error && data && data.length > 0) {
        return data as PageRecord[];
      }
    } catch {
      // Fallback to runtime dataset
    }
  }

  const list = getRuntimePages();
  if (statusFilter === "published") {
    return list.filter((p) => p.is_published && p.status === "published");
  }
  return list;
}

export async function getPageBySlug(slug: string): Promise<PageRecord | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (url && publishableKey) {
    try {
      const client = createClient<Database>(url, publishableKey, {
        global: { fetch: supabaseContentFetch },
      });
      const { data, error } = await client
        .from("pages")
        .select("*")
        .eq("slug", slug)
        .maybeSingle()
        .retry(false);
      if (!error && data) {
        return data as PageRecord;
      }
    } catch {
      // Fallback
    }
  }

  return getRuntimePage(slug) || null;
}

export async function getPageByKey(pageKey: string): Promise<PageRecord | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (url && publishableKey) {
    try {
      const client = createClient<Database>(url, publishableKey, {
        global: { fetch: supabaseContentFetch },
      });
      const { data, error } = await client
        .from("pages")
        .select("*")
        .eq("page_key", pageKey)
        .maybeSingle()
        .retry(false);
      if (!error && data) {
        return data as PageRecord;
      }
    } catch {
      // Fallback
    }
  }

  return getRuntimePage(pageKey) || null;
}
