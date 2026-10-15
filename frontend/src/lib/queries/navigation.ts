import { createClient } from "@supabase/supabase-js";
import type { Database, NavigationItem } from "@/types/database.types";
import { supabaseContentFetch } from "@/lib/supabase/fetch";

export const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = [
  // Header Navigation
  { id: "nav-h-1", menu_location: "header", label: "Tours", url: "/tours", display_order: 1, is_external: false, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "nav-h-2", menu_location: "header", label: "Destinations", url: "/destinations", display_order: 2, is_external: false, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "nav-h-3", menu_location: "header", label: "Experiences", url: "/experiences", display_order: 3, is_external: false, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "nav-h-4", menu_location: "header", label: "Island Stories", url: "/stories", display_order: 4, is_external: false, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "nav-h-5", menu_location: "header", label: "About Manju", url: "/about", display_order: 5, is_external: false, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "nav-h-6", menu_location: "header", label: "Contact", url: "/contact", display_order: 6, is_external: false, is_active: true, created_at: "2026-01-01T00:00:00Z" },

  // Footer Quick Links
  { id: "nav-fq-1", menu_location: "footer_quick_links", label: "Signature Tours", url: "/tours", display_order: 1, is_external: false, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "nav-fq-2", menu_location: "footer_quick_links", label: "Custom Trip Planner", url: "/custom-tour", display_order: 2, is_external: false, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "nav-fq-3", menu_location: "footer_quick_links", label: "Curated Experiences", url: "/experiences", display_order: 3, is_external: false, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "nav-fq-4", menu_location: "footer_quick_links", label: "Island Stories & Guides", url: "/stories", display_order: 4, is_external: false, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "nav-fq-5", menu_location: "footer_quick_links", label: "About Our Team", url: "/about", display_order: 5, is_external: false, is_active: true, created_at: "2026-01-01T00:00:00Z" },

  // Footer Legal
  { id: "nav-fl-1", menu_location: "footer_legal", label: "Photo Credits & Attributions", url: "/credits", display_order: 1, is_external: false, is_active: true, created_at: "2026-01-01T00:00:00Z" },
  { id: "nav-fl-2", menu_location: "footer_legal", label: "Contact & Hikkaduwa Desk", url: "/contact", display_order: 2, is_external: false, is_active: true, created_at: "2026-01-01T00:00:00Z" },
];

export async function getNavigationItems(
  location: "header" | "footer_quick_links" | "footer_legal" | "all" = "header"
): Promise<NavigationItem[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (url && publishableKey) {
    try {
      const client = createClient<Database>(url, publishableKey, {
        global: { fetch: supabaseContentFetch },
      });
      let query = client.from("navigation_items").select("*").eq("is_active", true);
      if (location !== "all") {
        query = query.eq("menu_location", location);
      }
      const { data, error } = await query.order("display_order", { ascending: true }).retry(false);
      if (!error && data && data.length > 0) {
        return data as NavigationItem[];
      }
    } catch {
      // Fallback below
    }
  }

  if (location === "all") return DEFAULT_NAVIGATION_ITEMS;
  return DEFAULT_NAVIGATION_ITEMS.filter((item) => item.menu_location === location && item.is_active);
}
