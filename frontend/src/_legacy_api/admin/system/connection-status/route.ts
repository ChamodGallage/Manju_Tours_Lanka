import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
    const res = await fetch(`${backendUrl}/api/health`, { next: { revalidate: 0 } });
    if (!res.ok) {
      return NextResponse.json({ status: "DEGRADED", message: `Backend responded with HTTP ${res.status}` });
    }
    const data = await res.json();
    return NextResponse.json({
      status: "HEALTHY",
      backend: data,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        status: "STANDALONE_MODE",
        message: "Backend server offline or running in decoupled preview mode",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 200 }
    );
  }
}
