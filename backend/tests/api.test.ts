import app from "../src/app.js";
import { Server } from "http";

let server: Server;
const TEST_PORT = 5099;
const BASE_URL = `http://localhost:${TEST_PORT}`;

async function runTests() {
  console.log("🚀 Starting Manju Tours Lanka Backend API Integration Tests...\n");

  await new Promise<void>((resolve) => {
    server = app.listen(TEST_PORT, () => {
      console.log(`Test server running on ${BASE_URL}`);
      resolve();
    });
  });

  const testResults: Array<{ name: string; status: "PASS" | "FAIL"; error?: string }> = [];

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      testResults.push({ name, status: "PASS" });
      console.log(`✅ PASS: ${name}`);
    } catch (err) {
      testResults.push({ name, status: "FAIL", error: err instanceof Error ? err.message : String(err) });
      console.error(`❌ FAIL: ${name} - ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  try {
    // 1. Health check
    await test("GET /api/health returns 200 with ok status", async () => {
      const res = await fetch(`${BASE_URL}/api/health`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.status !== "ok") throw new Error(`Expected status: ok, got ${data.status}`);
      if (!data.database) throw new Error("Missing database status");
    });

    // 2. Destinations public endpoint
    await test("GET /api/destinations returns destination list", async () => {
      const res = await fetch(`${BASE_URL}/api/destinations`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.destinations)) throw new Error("Missing destinations array");
      if (data.destinations.length < 5) throw new Error(`Expected at least 5 destinations, got ${data.destinations.length}`);
    });

    // 3. Tour packages public endpoint
    await test("GET /api/packages returns tour packages list", async () => {
      const res = await fetch(`${BASE_URL}/api/packages`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.packages)) throw new Error("Missing packages array");
      if (data.packages.length < 3) throw new Error(`Expected at least 3 packages, got ${data.packages.length}`);
    });

    // 4. Pages builder endpoint
    await test("GET /api/pages?mode=pages returns all 13 core pages", async () => {
      const res = await fetch(`${BASE_URL}/api/pages?mode=pages`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.pages)) throw new Error("Missing pages array");
      if (data.pages.length < 13) throw new Error(`Expected 13 pages, got ${data.pages.length}`);
    });

    // 5. Public enquiry submission
    await test("POST /api/enquiry creates booking enquiry with valid data", async () => {
      const res = await fetch(`${BASE_URL}/api/enquiry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Traveler",
          email: "traveler@example.com",
          phone: "+94771234567",
          country: "Australia",
          message: "Requesting a private chauffeur for a 10 day journey across Sri Lanka.",
          numberOfAdults: 2,
          numberOfChildren: 1,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error("Expected success: true");
    });

    // 6. Public contact submission
    await test("POST /api/contact receives direct message", async () => {
      const res = await fetch(`${BASE_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Website Visitor",
          email: "visitor@example.com",
          phone: "+447911123456",
          subject: "Inquiry about Ella Day Tour",
          message: "Do you offer private pickups from Nuwara Eliya hotels for day excursions?",
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error("Expected success: true");
    });

    // 7. Security: Unauthorized admin requests are rejected with 401
    await test("POST /api/destinations rejects unauthenticated request with 401", async () => {
      const res = await fetch(`${BASE_URL}/api/destinations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Unauthorized Place" }),
      });
      if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
    });

    await test("GET /api/admin/enquiries rejects unauthenticated request with 401", async () => {
      const res = await fetch(`${BASE_URL}/api/admin/enquiries`);
      if (res.status !== 401) throw new Error(`Expected 401 Unauthorized, got ${res.status}`);
    });

    console.log("\n================ BACKEND TEST SUMMARY ================");
    console.table(testResults);

    const hasFailure = testResults.some((t) => t.status === "FAIL");
    server.close();
    process.exit(hasFailure ? 1 : 0);
  } finally {
    if (server) server.close();
  }
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  if (server) server.close();
  process.exit(1);
});
