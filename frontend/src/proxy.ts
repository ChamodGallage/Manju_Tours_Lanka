import { NextResponse, type NextRequest } from "next/server";

/** Protect admin pages and API routes with Firebase authentication. */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/admin/");

  if (
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password" ||
    pathname === "/admin/reset-password"
  ) {
    return NextResponse.next();
  }

  const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!firebaseApiKey || !firebaseProjectId || firebaseApiKey.includes("paste-") || firebaseApiKey.trim() === "") {
    if (isApi) {
      return NextResponse.json({ error: "Firebase services are not configured." }, { status: 503 });
    }
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("notice", "setup_required");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
