import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";
import { supabaseAuthFetch } from "@/lib/supabase/fetch";

/**
 * Creates a Supabase client for use in browser / client components.
 * Uses public environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).
 * Never exposes the service-role secret key.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Supabase warning: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not configured in .env.local"
      );
    }
  }

  return createBrowserClient<Database>(
    supabaseUrl || "https://placeholder.supabase.co",
    supabasePublishableKey || "placeholder-anon-key",
    { global: { fetch: supabaseAuthFetch } }
  );
}

// Singleton instance for client-side use
let browserClientInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    return createClient();
  }
  if (!browserClientInstance) {
    browserClientInstance = createClient();
  }
  return browserClientInstance;
}
