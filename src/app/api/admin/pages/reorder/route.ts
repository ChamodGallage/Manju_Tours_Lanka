import { NextRequest, NextResponse } from "next/server";
import { reorderRuntimeSections, getRuntimePage } from "@/lib/data/pages-cms-dataset";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { page_key, ordered_ids } = body;

    if (!page_key || !Array.isArray(ordered_ids)) {
      return NextResponse.json(
        { error: "page_key and ordered_ids array are required." },
        { status: 400 }
      );
    }

    const reordered = reorderRuntimeSections(page_key, ordered_ids);

    const pageMeta = getRuntimePage(page_key);
    if (pageMeta?.slug) {
      revalidatePath(pageMeta.slug);
    }
    revalidatePath("/admin/pages");

    return NextResponse.json({ success: true, sections: reordered });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to reorder sections";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
