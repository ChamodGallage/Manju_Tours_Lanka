import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database.types";

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

export async function POST(req: NextRequest) {
  try {
    const user = await checkAdminUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Admin session required." }, { status: 401 });
    }

    const body = await req.json();
    const items = body.items as Array<{ id: string; display_order: number }> | undefined;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Reorder items list is required." }, { status: 400 });
    }

    const client = getPrivilegedClient();

    // Execute updates
    for (const item of items) {
      if (item.id) {
        await client
          .from("tour_packages")
          .update({ display_order: item.display_order, updated_at: new Date().toISOString() } as unknown as { display_order: number })
          .eq("id", item.id);
      }
    }

    revalidatePath("/tours");
    revalidatePath("/");
    revalidatePath("/admin/packages");

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
