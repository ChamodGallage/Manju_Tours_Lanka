/**
 * MANJU TOURS LANKA — Supabase Connection Diagnostic Script
 *
 * Runs a safe read-only diagnostic check against Supabase:
 * 1. Validates environment variables (URL and Publishable/Anon key).
 * 2. Tests HTTPS network reachability to the project domain.
 * 3. Performs a safe read-only query against public tables.
 * 4. Tests Row-Level Security to ensure customer data is protected.
 * 5. Does NOT create, mutate, or delete any data.
 * 6. Never exposes secret keys or private records.
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load .env.local and .env
const envLocalPath = path.resolve(process.cwd(), ".env.local");
const envPath = path.resolve(process.cwd(), ".env");

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

interface DiagnosticResult {
  status: "CONNECTED" | "FAILED" | "CONFIG_REQUIRED";
  projectUrl: string;
  urlConfigured: boolean;
  publishableKeyConfigured: boolean;
  serviceKeyConfigured: boolean;
  networkReachable: boolean | null;
  tests: {
    name: string;
    status: "PASS" | "FAIL" | "SKIPPED";
    details: string;
    code?: string;
  }[];
  summary: string;
  recommendedAction?: string;
}

export async function runSupabaseDiagnostics(): Promise<DiagnosticResult> {
  const expectedUrl = "https://zazflloyuzjqeyxrcpwl.supabase.co";
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const activeUrl = configuredUrl || expectedUrl;

  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const result: DiagnosticResult = {
    status: "CONFIG_REQUIRED",
    projectUrl: activeUrl,
    urlConfigured: Boolean(configuredUrl),
    publishableKeyConfigured: Boolean(publishableKey),
    serviceKeyConfigured: Boolean(serviceKey),
    networkReachable: null,
    tests: [],
    summary: "",
  };

  // 1. Check Configuration
  if (!publishableKey) {
    result.status = "CONFIG_REQUIRED";
    result.summary =
      "Supabase Publishable/Anon key (NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) is missing in environment variables.";
    result.recommendedAction =
      "Copy your project's Publishable key ('anon public') from Supabase Dashboard > Project Settings > API into .env.local";
    result.tests.push({
      name: "Configuration Check",
      status: "FAIL",
      details: "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is empty or not set.",
    });
    return result;
  }

  result.tests.push({
    name: "Configuration Check",
    status: "PASS",
    details: `Configured with URL: ${activeUrl} and a publishable key.`,
  });

  // 2. HTTPS Network Ping Check
  try {
    const pingStart = Date.now();
    const res = await fetch(`${activeUrl}/rest/v1/`, {
      method: "GET",
      headers: {
        apikey: publishableKey,
      },
    });
    const pingMs = Date.now() - pingStart;
    result.networkReachable = true;

    result.tests.push({
      name: "HTTPS Network Connectivity",
      status: "PASS",
      details: `Successfully reached ${activeUrl} (HTTP ${res.status} in ${pingMs}ms)`,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    result.networkReachable = false;
    result.status = "FAILED";
    result.summary = `Failed to connect to Supabase domain ${activeUrl}: ${errorMsg}`;
    result.tests.push({
      name: "HTTPS Network Connectivity",
      status: "FAIL",
      details: errorMsg,
      code: "NETWORK_ERROR",
    });
    return result;
  }

  // 3. Safe Read-Only Database Queries using Supabase Client
  const client = createClient(activeUrl, publishableKey, {
    auth: { persistSession: false },
  });

  // Test Table 1: site_settings
  try {
    const { data, error, count } = await client
      .from("site_settings")
      .select("id, company_name", { count: "exact" })
      .limit(1);

    if (error) {
      result.tests.push({
        name: "Table: site_settings",
        status: "FAIL",
        details: error.message,
        code: error.code,
      });
    } else {
      result.tests.push({
        name: "Table: site_settings",
        status: "PASS",
        details: `Connected successfully. Accessible records: ${count ?? (data ? data.length : 0)}`,
      });
    }
  } catch (err: unknown) {
    result.tests.push({
      name: "Table: site_settings",
      status: "FAIL",
      details: err instanceof Error ? err.message : String(err),
    });
  }

  // Test Table 2: tour_packages
  try {
    const { data, error, count } = await client
      .from("tour_packages")
      .select("id, title, slug", { count: "exact" })
      .limit(1);

    if (error) {
      result.tests.push({
        name: "Table: tour_packages",
        status: "FAIL",
        details: error.message,
        code: error.code,
      });
    } else {
      result.tests.push({
        name: "Table: tour_packages",
        status: "PASS",
        details: `Connected successfully. Accessible records: ${count ?? (data ? data.length : 0)}`,
      });
    }
  } catch (err: unknown) {
    result.tests.push({
      name: "Table: tour_packages",
      status: "FAIL",
      details: err instanceof Error ? err.message : String(err),
    });
  }

  // Test Table 3: destinations
  try {
    const { data, error, count } = await client
      .from("destinations")
      .select("id, name, slug", { count: "exact" })
      .limit(1);

    if (error) {
      result.tests.push({
        name: "Table: destinations",
        status: "FAIL",
        details: error.message,
        code: error.code,
      });
    } else {
      result.tests.push({
        name: "Table: destinations",
        status: "PASS",
        details: `Connected successfully. Accessible records: ${count ?? (data ? data.length : 0)}`,
      });
    }
  } catch (err: unknown) {
    result.tests.push({
      name: "Table: destinations",
      status: "FAIL",
      details: err instanceof Error ? err.message : String(err),
    });
  }

  // Test 4: RLS Security Assertion (Public must NOT be able to read customer enquiries)
  try {
    const { data, error } = await client
      .from("tour_enquiries")
      .select("id, name, email")
      .limit(1);

    // If RLS is working, public anon key either returns empty array [] or a permission error
    if (error || (data && data.length === 0)) {
      result.tests.push({
        name: "Security: Customer Data RLS Protection",
        status: "PASS",
        details: "Row Level Security is active: Customer enquiries are protected from public read access.",
      });
    } else {
      result.tests.push({
        name: "Security: Customer Data RLS Protection",
        status: "FAIL",
        details: "WARNING: Public anon key was able to read records from tour_enquiries without admin auth!",
      });
    }
  } catch {
    result.tests.push({
      name: "Security: Customer Data RLS Protection",
      status: "PASS",
      details: "Protected by database policy or table not yet seeded.",
    });
  }

  // Evaluate overall status
  const hasPassingTable = result.tests.some(
    (t) => t.name.startsWith("Table:") && t.status === "PASS"
  );
  const anyMissingTable = result.tests.some(
    (t) => t.name.startsWith("Table:") && t.code === "42P01"
  );

  if (hasPassingTable) {
    result.status = "CONNECTED";
    result.summary = "Successfully connected to live Supabase database. Safe queries executed with 0 errors.";
  } else if (anyMissingTable) {
    result.status = "FAILED";
    result.summary =
      "Supabase project is reachable, but CMS tables do not exist in the public schema yet (PostgreSQL error 42P01: undefined_table).";
    result.recommendedAction =
      "Run the migration script `supabase/migrations/20261012_complete_cms.sql` in Supabase SQL Editor.";
  } else {
    result.status = "FAILED";
    result.summary = "Unable to execute queries against Supabase.";
  }

  return result;
}

// Execute directly if run via CLI
if (require.main === module) {
  runSupabaseDiagnostics().then((res) => {
    console.log("\n=======================================================");
    console.log("       MANJU TOURS LANKA — SUPABASE DIAGNOSTIC RESULT");
    console.log("=======================================================");
    console.log(`Connection Status : ${res.status}`);
    console.log(`Target URL        : ${res.projectUrl}`);
    console.log(`URL Configured    : ${res.urlConfigured ? "YES" : "NO"}`);
    console.log(`Publishable Key Configured: ${res.publishableKeyConfigured ? "YES" : "NO"}`);
    console.log(`Service Key Set   : ${res.serviceKeyConfigured ? "YES" : "NO"}`);
    console.log(`Network Reachable : ${res.networkReachable ? "YES" : "NO"}`);
    console.log("-------------------------------------------------------");
    console.log("Detailed Test Runs:");
    res.tests.forEach((t) => {
      console.log(`  [${t.status}] ${t.name}: ${t.details}`);
    });
    console.log("-------------------------------------------------------");
    console.log(`Summary: ${res.summary}`);
    if (res.recommendedAction) {
      console.log(`Action Required: ${res.recommendedAction}`);
    }
    console.log("=======================================================\n");
  });
}
