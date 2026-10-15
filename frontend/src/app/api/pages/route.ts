import { NextResponse } from "next/server";
import { getPublishedPageSections } from "@/lib/queries/page-sections";
import { getRuntimePage } from "@/lib/data/pages-cms-dataset";

/** Public read endpoint for published page content used by public pages. */
export async function GET(request: Request) {
  const pageKey = new URL(request.url).searchParams.get("page");
  if (!pageKey || !/^[a-z0-9-]{1,80}$/.test(pageKey)) {
    return NextResponse.json({ error: "A valid page key is required." }, { status: 400 });
  }

  const page = getRuntimePage(pageKey);
  if (!page || !page.is_published || page.status !== "published") {
    return NextResponse.json({ error: "Published page not found." }, { status: 404 });
  }

  const sections = (await getPublishedPageSections(pageKey)).filter(
    (section) => section.is_visible && section.status === "published"
  );

  return NextResponse.json({
    page: {
      page_key: page.page_key,
      slug: page.slug,
      title: page.title,
    },
    sections,
  });
}
