import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load local environment variables (.env.local first, then .env)
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function runDiagnostics() {
  console.log("==================================================");
  console.log("🔎 MANJU TOURS LANKA — Supabase Connection Test");
  console.log("==================================================");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("\n1. Checking Environment Variables:");
  console.log(`- NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? "✅ Configured (" + supabaseUrl + ")" : "❌ MISSING"}`);
  console.log(`- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${publishableKey ? "✅ Configured" : "❌ MISSING"}`);
  console.log(`- SUPABASE_SERVICE_ROLE_KEY: ${serviceKey ? "✅ Configured (Secret Key)" : "⚠️ Not configured (optional for public forms)"}`);

  if (!supabaseUrl || !publishableKey) {
    console.log("\n❌ DIAGNOSTIC RESULT: Missing credentials.");
    console.log("Please create .env.local with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.\n");
    return;
  }

  const client = createClient(supabaseUrl, publishableKey);

  console.log("\n2. Testing Public Insert (Simulating website customer enquiry):");
  const testPayload = {
    name: "Automated Test Guest",
    email: "test-booking@example.com",
    phone: "+94771234567",
    country: "Sri Lanka",
    message: "Automated verification test from Manju Tours Lanka.",
    number_of_adults: 2,
    number_of_children: 0,
    travel_style: "Private Chauffeur",
    status: "TEST_VERIFICATION",
    source: "Supabase Connection Verification Script",
  };

  const { data: insertData, error: insertError } = await client
    .from("tour_enquiries")
    .insert(testPayload)
    .select("id")
    .single();

  if (insertError) {
    console.error(`❌ Insert failed: ${insertError.message}`);
    console.error(`Hint: ${insertError.hint || "Make sure you ran the SQL migration in Supabase SQL Editor."}`);
    console.error(`Code: ${insertError.code}`);
  } else {
    console.log(`✅ Success! Tour enquiry inserted. Record ID: ${insertData.id}`);
  }

  console.log("\n3. Testing Row Level Security (RLS) Protection:");
  console.log("Attempting to SELECT all tour_enquiries using anon public key...");
  const { data: readData, error: readError } = await client
    .from("tour_enquiries")
    .select("*");

  if (readError) {
    console.log(`✅ RLS Active! Select rejected with error: ${readError.message}`);
  } else if (!readData || readData.length === 0) {
    console.log("✅ RLS Active! 0 rows returned to unauthenticated anon caller. Customer data is safe!");
  } else {
    console.warn(`⚠️ SECURITY WARNING: Anon key read ${readData.length} records. Please check your RLS policies on tour_enquiries.`);
  }

  console.log("\n==================================================");
}

runDiagnostics().catch(console.error);
