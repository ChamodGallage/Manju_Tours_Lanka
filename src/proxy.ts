import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database.types";
import { supabaseAuthFetch } from "@/lib/supabase/fetch";

/** Protect admin pages and API routes with a verified Supabase session and admin role. */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/admin/");

  if (pathname === "/admin/login" || pathname === "/admin/forgot-password" || pathname === "/admin/reset-password") {
    return NextResponse.next();
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabasePublishableKey) {
    if (isApi) {
      return NextResponse.json({ error: "Admin services are not configured." }, { status: 503 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("notice", "setup_required");
    return NextResponse.redirect(loginUrl);
  }

  let response = NextResponse.next({ request });
  try {
    const supabase = createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
      global: { fetch: supabaseAuthFetch },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as CookieOptions)
          );
        },
      },
    });

    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      if (isApi) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
      return redirectToLogin(request, pathname);
    }

    const metadataRole = data.user.app_metadata?.role;
    let isAdmin = metadataRole === "admin";
    if (!isAdmin) {
      const { data: adminRow, error: adminError } = await supabase
        .from("admins")
        .select("id")
        .eq("id", data.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (adminError) throw adminError;
      isAdmin = Boolean(adminRow);
    }

    if (!isAdmin) {
      if (isApi) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
      return redirectToLogin(request, pathname, "not_admin");
    }

    return response;
  } catch (error) {
    console.error("Admin access verification failed.", error instanceof Error ? error.name : "unknown error");
    if (isApi) return NextResponse.json({ error: "Unable to verify administrator access." }, { status: 503 });
    return redirectToLogin(request, pathname, "verification_failed");
  }
}

function redirectToLogin(request: NextRequest, pathname: string, notice?: string) {
  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  if (notice) loginUrl.searchParams.set("notice", notice);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
