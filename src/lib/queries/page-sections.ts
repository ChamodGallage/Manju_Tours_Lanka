import { createClient } from "@supabase/supabase-js";
import type { Database, PageSectionItem } from "@/types/database.types";
import { normalizeSafeUrl } from "@/lib/sanitize";
import { supabaseContentFetch } from "@/lib/supabase/fetch";
import { getRuntimeSections } from "@/lib/data/pages-cms-dataset";

export async function getPublishedPageSections(pageKey: string): Promise<PageSectionItem[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (url && publishableKey) {
    try {
      const client = createClient<Database>(url, publishableKey, {
        global: { fetch: supabaseContentFetch },
      });
      const { data, error } = await client
        .from("page_sections")
        .select("*")
        .eq("page_key", pageKey)
        .eq("is_visible", true)
        .order("display_order", { ascending: true })
        .retry(false);

      if (!error && data && data.length > 0) {
        return (data as PageSectionItem[]).map((section) => ({
          ...section,
          button_url: normalizeSafeUrl(section.button_url) || "",
          secondary_button_url: normalizeSafeUrl(section.secondary_button_url) || "",
        }));
      }
    } catch {
      // Fallback below
    }
  }

  // Graceful fallback to seeded runtime CMS dataset
  const fallback = getRuntimeSections(pageKey).filter(
    (s) => s.is_visible && s.status !== "draft"
  );
  return fallback.map((section) => ({
    ...section,
    button_url: normalizeSafeUrl(section.button_url) || "",
    secondary_button_url: normalizeSafeUrl(section.secondary_button_url) || "",
  }));
}

export async function getAllPageSections(pageKey: string): Promise<PageSectionItem[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (url && publishableKey) {
    try {
      const client = createClient<Database>(url, publishableKey, {
        global: { fetch: supabaseContentFetch },
      });
      const { data, error } = await client
        .from("page_sections")
        .select("*")
        .eq("page_key", pageKey)
        .order("display_order", { ascending: true })
        .retry(false);

      if (!error && data && data.length > 0) {
        return data as PageSectionItem[];
      }
    } catch {
      // Fallback below
    }
  }

  return getRuntimeSections(pageKey);
}

export function getSection(sections: PageSectionItem[], key: string): PageSectionItem | undefined {
  return sections.find((section) => section.section_key === key);
}
