// E2E test script to test CMS API endpoints and pages
async function runTests() {
  const baseUrl = "http://localhost:3000";
  console.log(`Connecting to ${baseUrl}...`);

  const results = [];

  const test = async (name, fn) => {
    try {
      await fn();
      results.push({ name, status: "PASS" });
      console.log(`✅ PASS: ${name}`);
    } catch (err) {
      results.push({ name, status: "FAIL", error: err.message });
      console.error(`❌ FAIL: ${name} - ${err.message}`);
    }
  };

  // Test 1: Fetch pages list
  await test("GET /api/admin/pages?mode=pages", async () => {
    const res = await fetch(`${baseUrl}/api/admin/pages?mode=pages`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.pages || !Array.isArray(data.pages)) throw new Error("Missing pages array");
    if (data.pages.length < 13) throw new Error(`Expected at least 13 pages, got ${data.pages.length}`);
    console.log(`   Found ${data.pages.length} CMS managed pages.`);
  });

  // Test 2: Fetch home page and sections
  await test("GET /api/admin/pages?page=home", async () => {
    const res = await fetch(`${baseUrl}/api/admin/pages?page=home`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.page || data.page.page_key !== "home") throw new Error("Invalid page meta");
    if (!data.sections || data.sections.length === 0) throw new Error("Missing home sections");
    console.log(`   Home page returned ${data.sections.length} sections.`);
  });

  // Test 3: Test section update (PUT)
  await test("PUT /api/admin/pages (Update section draft)", async () => {
    const res = await fetch(`${baseUrl}/api/admin/pages`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: "section",
        page_key: "home",
        id: "sec-home-hero",
        title: "Discover Sri Lanka in Private Luxury & Authentic Warmth (Draft Test)",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error("Update not successful");
  });

  // Test 4: Test section reorder
  await test("POST /api/admin/pages/reorder", async () => {
    const res = await fetch(`${baseUrl}/api/admin/pages/reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page_key: "home",
        ordered_ids: ["sec-home-hero", "sec-home-pillars", "sec-home-quick-links", "sec-home-why-us", "sec-home-tours", "sec-home-destinations", "sec-home-reviews", "sec-home-contact", "sec-home-cta"],
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error("Reorder failed");
  });

  // Test 5: Test duplicate page
  await test("POST /api/admin/pages/duplicate", async () => {
    const res = await fetch(`${baseUrl}/api/admin/pages/duplicate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceKey: "about",
        newKey: "about-extended-test",
        newSlug: "/about-extended-test",
        newTitle: "About Extended Test",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error("Duplicate failed");
  });

  // Test 6: Test publishing
  await test("POST /api/admin/pages/publish", async () => {
    const res = await fetch(`${baseUrl}/api/admin/pages/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page_key: "home",
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success) throw new Error("Publish failed");
  });

  // Test 7: Verify public routes respond with 200
  const publicRoutes = [
    "/",
    "/about",
    "/tours",
    "/destinations",
    "/experiences",
    "/stories",
    "/custom-tour",
    "/contact",
    "/credits",
    "/admin/pages"
  ];

  for (const route of publicRoutes) {
    await test(`Public Route GET ${route}`, async () => {
      const res = await fetch(`${baseUrl}${route}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (!text.includes("<!DOCTYPE html>")) throw new Error("Response was not HTML");
    });
  }

  console.log("\n================ TEST SUMMARY ================");
  console.table(results);
}

runTests().catch(console.error);
