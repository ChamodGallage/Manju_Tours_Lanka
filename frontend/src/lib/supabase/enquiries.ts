import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import type { TourEnquiryInsert } from "@/types/database.types";
import { supabaseContentFetch } from "@/lib/supabase/fetch";

/**
 * Inserts a tour enquiry into the Supabase `tour_enquiries` table using the public anon key.
 * This tests and adheres to the Row Level Security (RLS) policy: "Public can submit tour enquiries".
 * Public visitors cannot read any existing enquiries.
 */
export async function insertTourEnquiry(enquiry: TourEnquiryInsert) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    return {
      success: false,
      error: "Supabase credentials not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)",
    };
  }

  try {
    const supabase = createClient(supabaseUrl, supabasePublishableKey, {
      global: { fetch: supabaseContentFetch },
    });

    const id = enquiry.id || randomUUID();
    const { error } = await supabase
      .from("tour_enquiries")
      .insert([{ ...enquiry, id }]);

    if (error) {
      console.error("Supabase insertTourEnquiry error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to connect to Supabase";
    console.error("Supabase insertTourEnquiry exception:", message);
    return { success: false, error: message };
  }
}
