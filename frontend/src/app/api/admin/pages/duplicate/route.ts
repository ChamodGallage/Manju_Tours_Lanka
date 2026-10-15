import { NextRequest, NextResponse } from "next/server";
import { duplicateRuntimePage } from "@/lib/data/pages-cms-dataset";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sourceKey, newTitle, newSlug, newKey } = body;

    if (!sourceKey || !newTitle || !newSlug || !newKey) {
      return NextResponse.json(
        { error: "sourceKey, newTitle, newSlug, and newKey are required." },
        { status: 400 }
      );
    }

    const formattedSlug = newSlug.startsWith("/") ? newSlug : `/${newSlug}`;
    const duplicated = duplicateRuntimePage(sourceKey, newTitle, formattedSlug, newKey);

    if (!duplicated) {
      return NextResponse.json({ error: "Source page not found." }, { status: 404 });
    }

    revalidatePath("/admin/pages");
    return NextResponse.json({ success: true, page: duplicated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to duplicate page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
