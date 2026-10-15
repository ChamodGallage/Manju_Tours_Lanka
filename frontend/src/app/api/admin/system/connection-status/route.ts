import { NextResponse } from "next/server";
import { runSupabaseDiagnostics } from "../../../../../../scripts/test-supabase-connection";

export async function GET() {
  try {
    const result = await runSupabaseDiagnostics();
    return NextResponse.json(result);
  } catch (err: unknown) {
    return NextResponse.json(
      {
        status: "FAILED",
        error: err instanceof Error ? err.message : "Unknown error executing Supabase diagnostic test",
      },
      { status: 500 }
    );
  }
}
