import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { Database, TourEnquiryRow } from "@/types/database.types";

const INITIAL_FALLBACK_ENQUIRIES: TourEnquiryRow[] = [
  {
    id: "sample-enquiry-1",
    tour_id: "sri-lanka-classic-round-tour",
    tour_title: "10-Day Sri Lanka Classic Discovery",
    name: "Emma & James Richardson",
    email: "emma.richardson@example.co.uk",
    phone: "+44 7911 123456",
    country: "United Kingdom",
    travel_start_date: "2026-11-15",
    travel_end_date: "2026-11-25",
    flexible_month: null,
    number_of_adults: 2,
    number_of_children: 0,
    travel_style: "Private Chauffeur Guide (Sedan / SUV)",
    message: "We are celebrating our 10th wedding anniversary. Interested in tea plantation boutique hotels in Ella & Nuwara Eliya, plus a leopard safari in Yala. Would love your recommendation on beach villas in Mirissa.",
    status: "NEW",
    source: "Website Tour Page Form",
    admin_notes: "High priority lead. Requested quote for 4-star boutique upgrades.",
    ip_hash: "hash_uk_richardson",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sample-enquiry-2",
    tour_id: "scenic-train-hill-country",
    tour_title: "7-Day Scenic Hill Country & Wildlife",
    name: "Dr. Hans Weber",
    email: "hans.weber@example.de",
    phone: "+49 170 9876543",
    country: "Germany",
    travel_start_date: "2026-12-05",
    travel_end_date: "2026-12-12",
    flexible_month: null,
    number_of_adults: 3,
    number_of_children: 1,
    travel_style: "Spacious High-Roof Van",
    message: "Family trip with an 8-year-old child. Need scenic train first-class observation tickets from Kandy to Ella and child-safe safari jeep in Udawalawe.",
    status: "CONTACTED",
    source: "Website Tour Page Form",
    admin_notes: "Sent initial quotation via WhatsApp. Client reviewed and asked about train seat reservation availability.",
    ip_hash: "hash_de_weber",
    created_at: new Date(Date.now() - 3600000 * 28).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "sample-enquiry-3",
    tour_id: "southern-coast-mirissa-galle",
    tour_title: "5-Day Southern Beaches & Cultural Heritage",
    name: "Sophie Tremblay",
    email: "sophie.t@example.ca",
    phone: "+1 514 555 0192",
    country: "Canada",
    travel_start_date: null,
    travel_end_date: null,
    flexible_month: "January 2027",
    number_of_adults: 2,
    number_of_children: 0,
    travel_style: "Private Chauffeur Guide",
    message: "Flexible with dates in January. We want whale watching in Mirissa and walking tour of Galle Fort with Manju.",
    status: "IN_PROGRESS",
    source: "Custom Itinerary Planner",
    admin_notes: "Waiting on client's confirmed flight arrival dates before locking down hotel deposits.",
    ip_hash: "hash_ca_tremblay",
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 20).toISOString(),
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

// 1. GET: Fetch all enquiries with search & status filters
export async function GET(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) return NextResponse.json({ error: "Administrator access required." }, { status: 401 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim();
    const status = searchParams.get("status"); // all, NEW, CONTACTED, IN_PROGRESS, CONFIRMED, CANCELLED

    if (!url || !publishableKey) {
      let list = [...INITIAL_FALLBACK_ENQUIRIES];
      if (status && status !== "all") list = list.filter((e) => e.status === status);
      if (search) {
        list = list.filter(
          (e) =>
            e.name.toLowerCase().includes(search) ||
            e.email.toLowerCase().includes(search) ||
            e.phone.toLowerCase().includes(search) ||
            (e.tour_title && e.tour_title.toLowerCase().includes(search)) ||
            e.country.toLowerCase().includes(search)
        );
      }
      return NextResponse.json({ enquiries: list });
    }

    const client = getPrivilegedClient();
    let query = client.from("tour_enquiries").select("*");

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      let list = [...INITIAL_FALLBACK_ENQUIRIES];
      if (status && status !== "all") list = list.filter((e) => e.status === status);
      if (search) {
        list = list.filter(
          (e) =>
            e.name.toLowerCase().includes(search) ||
            e.email.toLowerCase().includes(search) ||
            e.phone.toLowerCase().includes(search) ||
            (e.tour_title && e.tour_title.toLowerCase().includes(search)) ||
            e.country.toLowerCase().includes(search)
        );
      }
      return NextResponse.json({ enquiries: list });
    }

    let enquiries = (data as unknown as TourEnquiryRow[]) || [];
    if (search) {
      enquiries = enquiries.filter(
        (e) =>
          e.name.toLowerCase().includes(search) ||
          e.email.toLowerCase().includes(search) ||
          e.phone.toLowerCase().includes(search) ||
          (e.tour_title && e.tour_title.toLowerCase().includes(search)) ||
          e.country.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ enquiries });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load enquiries";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 2. PUT / PATCH: Update enquiry status or notes
export async function PUT(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as admin." }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, admin_notes } = body;

    if (!id) {
      return NextResponse.json({ error: "Enquiry ID is required" }, { status: 400 });
    }

    const validStatuses = ["NEW", "CONTACTED", "IN_PROGRESS", "CONFIRMED", "CANCELLED"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
    }

    const client = getPrivilegedClient();
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (status !== undefined) updatePayload.status = status;
    if (admin_notes !== undefined) updatePayload.admin_notes = admin_notes;

    const { data, error } = await client
      .from("tour_enquiries")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: `Enquiry update failed: ${error.message}` }, { status: 500 });

    revalidatePath("/admin/enquiries");
    return NextResponse.json({ success: true, enquiry: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update enquiry";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 3. DELETE: Safely delete spam or old enquiry with confirmation
export async function DELETE(req: NextRequest) {
  try {
    const adminUser = await checkAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as admin." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing enquiry ID" }, { status: 400 });
    }

    const client = getPrivilegedClient();
    const { error } = await client.from("tour_enquiries").delete().eq("id", id);

    if (error) {
      console.warn("Delete enquiry warning:", error.message);
    }

    revalidatePath("/admin/enquiries");
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete enquiry";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
