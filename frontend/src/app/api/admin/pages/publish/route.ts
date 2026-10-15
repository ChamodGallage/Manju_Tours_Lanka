import { NextRequest, NextResponse } from "next/server";
import { updateRuntimePage, getRuntimeSections, upsertRuntimeSection, getRuntimePage } from "@/lib/data/pages-cms-dataset";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { page_key, unpublish = false } = body;

    if (!page_key) {
      return NextResponse.json({ error: "page_key is required." }, { status: 400 });
    }

    if (unpublish) {
      if (page_key === "home") {
        return NextResponse.json({ error: "Home page cannot be unpublished." }, { status: 400 });
      }
      const page = updateRuntimePage(page_key, { is_published: false, status: "draft" });
      const pageMeta = getRuntimePage(page_key);
      if (pageMeta?.slug) revalidatePath(pageMeta.slug);
      revalidatePath("/admin/pages");
      return NextResponse.json({ success: true, page, message: "Page unpublished safely." });
    }

    // Publish page
    const page = updateRuntimePage(page_key, { is_published: true, status: "published" });

    // Mark all sections of this page as published
    const sections = getRuntimeSections(page_key);
    sections.forEach((sec) => {
      upsertRuntimeSection({
        ...sec,
        status: "published",
        is_draft: false,
      });
    });

    const pageMeta = getRuntimePage(page_key);
    if (pageMeta?.slug) {
      revalidatePath(pageMeta.slug);
    }
    revalidatePath("/admin/pages");

    return NextResponse.json({
      success: true,
      page,
      sections: getRuntimeSections(page_key),
      message: "Page and all draft changes published live!",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to publish page";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
