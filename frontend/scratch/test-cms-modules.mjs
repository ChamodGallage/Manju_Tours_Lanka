import {
  getRuntimePages,
  getRuntimePage,
  updateRuntimePage,
  addRuntimePage,
  getRuntimeSections,
  upsertRuntimeSection,
  reorderRuntimeSections,
  deleteRuntimeSection,
  duplicateRuntimePage,
} from "../src/lib/data/pages-cms-dataset.ts";
import { getNavigationItems } from "../src/lib/queries/navigation.ts";
import { getAllPages, getPageBySlug, getPageByKey } from "../src/lib/queries/pages.ts";
import { getPublishedPageSections, getAllPageSections } from "../src/lib/queries/page-sections.ts";

async function runModuleTests() {
  console.log("Starting Page Management System Integration Tests...\n");
  const testResults = [];

  const runTest = async (name, fn) => {
    try {
      await fn();
      testResults.push({ name, status: "PASS" });
      console.log(`✅ PASS: ${name}`);
    } catch (err) {
      testResults.push({ name, status: "FAIL", error: err.message });
      console.error(`❌ FAIL: ${name} - ${err.message}`);
    }
  };

  // 1. Audit all 13 pages
  await runTest("All 13 core pages exist in CMS dataset", async () => {
    const pages = await getAllPages();
    if (!Array.isArray(pages) || pages.length < 13) {
      throw new Error(`Expected at least 13 pages, got ${pages.length}`);
    }
    const expectedKeys = [
      "home", "about", "contact", "custom-tour", "credits",
      "tours", "tour-detail-template",
      "destinations", "destination-detail-template",
      "experiences", "experience-detail-template",
      "stories", "story-detail-template"
    ];
    for (const key of expectedKeys) {
      const found = pages.find((p) => p.page_key === key);
      if (!found) throw new Error(`Missing page with key: ${key}`);
      if (!found.slug) throw new Error(`Page ${key} missing slug`);
      if (!found.title) throw new Error(`Page ${key} missing title`);
      if (!found.seo_title) throw new Error(`Page ${key} missing SEO title`);
    }
  });

  // 2. Audit sections for each page
  await runTest("Every page has at least one configured editable section", async () => {
    const pages = await getAllPages();
    for (const p of pages) {
      const sections = await getAllPageSections(p.page_key);
      if (!sections || sections.length === 0) {
        throw new Error(`Page ${p.page_key} has 0 sections configured`);
      }
      for (const s of sections) {
        if (!s.section_type) throw new Error(`Section ${s.id} missing section_type`);
        if (!s.title) throw new Error(`Section ${s.id} missing title`);
      }
    }
  });

  // 3. Test Section Upsert (Draft creation)
  await runTest("Section creation and editing (Draft update)", async () => {
    const newSection = {
      id: "sec-test-temp-1",
      page_key: "home",
      section_key: "sec-home-promo-draft",
      section_type: "cta",
      title: "Exclusive Ceylon Winter Escape 2026",
      subtitle: "Book direct for chauffeur perks",
      content: "Save 15% on tailor-made tours booked 60 days ahead.",
      button_text: "Reserve VIP Vehicle",
      button_url: "/custom-tour",
      background_style: "emerald",
      text_align: "center",
      display_order: 99,
      is_visible: true,
      status: "draft",
    };
    upsertRuntimeSection(newSection);

    const sections = await getAllPageSections("home");
    const found = sections.find((s) => s.id === "sec-test-temp-1");
    if (!found) throw new Error("Created section not found in home sections");
    if (found.title !== "Exclusive Ceylon Winter Escape 2026") throw new Error("Title mismatch");
    if (found.status !== "draft") throw new Error("Status should be draft");
  });

  // 4. Test Section Reordering
  await runTest("Section reordering", async () => {
    const originalSections = await getAllPageSections("home");
    const idList = originalSections.map((s) => s.id);
    const reversedIds = [...idList].reverse();
    reorderRuntimeSections("home", reversedIds);

    const reordered = await getAllPageSections("home");
    if (reordered[0].id !== reversedIds[0]) {
      throw new Error(`Reorder failed: first element is ${reordered[0].id}, expected ${reversedIds[0]}`);
    }

    // Restore original order
    reorderRuntimeSections("home", idList);
  });

  // 5. Test Section Deletion
  await runTest("Section deletion", async () => {
    deleteRuntimeSection("sec-test-temp-1");
    const sections = await getAllPageSections("home");
    const found = sections.find((s) => s.id === "sec-test-temp-1");
    if (found) throw new Error("Section should have been deleted");
  });

  // 6. Test Page Settings and SEO Update
  await runTest("Page metadata, SEO and navigation update", async () => {
    const original = await getPageByKey("about");
    if (!original) throw new Error("About page not found");

    updateRuntimePage("about", {
      seo_title: "Meet Manju & Our Certified Drivers | Manju Tours",
      navigation_label: "Our Story & Chauffeurs",
    });

    const updated = await getPageByKey("about");
    if (!updated || updated.seo_title !== "Meet Manju & Our Certified Drivers | Manju Tours") {
      throw new Error("SEO title not updated");
    }
    if (updated.navigation_label !== "Our Story & Chauffeurs") {
      throw new Error("Navigation label not updated");
    }

    // Restore
    updateRuntimePage("about", {
      seo_title: original.seo_title,
      navigation_label: original.navigation_label,
    });
  });

  // 7. Test Duplicate Page
  await runTest("Duplicate Page with cloned sections", async () => {
    const duplicated = duplicateRuntimePage(
      "destinations",
      "Special Destinations 2027",
      "/destinations-2027",
      "destinations-2027"
    );
    if (!duplicated) throw new Error("Duplicate function returned null");
    if (duplicated.page_key !== "destinations-2027") throw new Error("Duplicate key mismatch");
    if (duplicated.slug !== "/destinations-2027") throw new Error("Duplicate slug mismatch");
    if (duplicated.status !== "draft") throw new Error("Duplicated page must start as draft");

    const duplicatedSections = await getAllPageSections("destinations-2027");
    if (duplicatedSections.length === 0) {
      throw new Error("Duplicated page has no copied sections");
    }
  });

  // 8. Test Navigation Assignment and Queries
  await runTest("Navigation menu integration & header links", async () => {
    const headerNav = await getNavigationItems("header");
    if (!headerNav || headerNav.length < 5) throw new Error("Header navigation items missing or incomplete");

    const footerNav = await getNavigationItems("footer_quick_links");
    if (!footerNav || footerNav.length < 4) throw new Error("Footer quick links missing or incomplete");

    const legalNav = await getNavigationItems("footer_legal");
    if (!legalNav || legalNav.length < 2) throw new Error("Footer legal items missing or incomplete");

    console.log(`   Header items: ${headerNav.length}, Footer quick items: ${footerNav.length}, Legal items: ${legalNav.length}`);
  });

  // 9. Test Published Sections Filter
  await runTest("Draft vs Published section filtering", async () => {
    // Add draft section
    const draftSec = {
      id: "sec-home-draft-filter-test",
      page_key: "home",
      section_key: "sec-home-draft-filter-test",
      section_type: "custom",
      title: "Secret Unreleased Promo",
      status: "draft",
      is_visible: true,
      display_order: 999,
      updated_at: new Date().toISOString(),
    };
    upsertRuntimeSection(draftSec);

    const publicSections = await getPublishedPageSections("home");
    const foundInPublic = publicSections.find((s) => s.id === "sec-home-draft-filter-test");
    if (foundInPublic) {
      throw new Error("Draft section appeared in getPublishedPageSections!");
    }

    deleteRuntimeSection("sec-home-draft-filter-test");
  });

  console.log("\n================ TEST SUMMARY RESULTS ================");
  console.table(testResults);
}

runModuleTests().catch(console.error);
