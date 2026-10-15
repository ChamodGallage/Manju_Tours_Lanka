import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function createAdmin() {
  const adminEmail = process.argv[2];

  console.log("==================================================");
  console.log("🛡️ MANJU TOURS LANKA — Grant Admin Privileges");
  console.log("==================================================");

  if (!adminEmail) {
    console.error("Usage: npx tsx scripts/create-admin.ts <admin-email>");
    console.error("Example: npx tsx scripts/create-admin.ts admin@manjutourslanka.com\n");
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local.");
    console.error("The service_role secret key is required to manage administrative privileges.\n");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log(`\nSearching for user account: "${adminEmail}"...`);

  const { data: usersData, error: userError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (userError) {
    console.error("❌ Failed to list users:", userError.message);
    process.exit(1);
  }

  const user = usersData.users.find((u) => u.email?.toLowerCase() === adminEmail.toLowerCase());

  if (!user) {
    console.error(`❌ User not found with email: ${adminEmail}`);
    console.error("Please create the user first in Supabase Dashboard > Authentication > Users > Add User.");
    process.exit(1);
  }

  console.log(`✅ Found user ID: ${user.id}`);

  // 1. Update app_metadata with role = admin
  console.log("1. Setting app_metadata.role = 'admin'...");
  const { error: updateAuthErr } = await supabase.auth.admin.updateUserById(user.id, {
    app_metadata: { ...user.app_metadata, role: "admin" },
  });

  if (updateAuthErr) {
    console.warn("⚠️ Warning updating app_metadata:", updateAuthErr.message);
  } else {
    console.log("✅ Auth metadata updated with admin role.");
  }

  // 2. Insert into public.admins table
  console.log("2. Registering in public.admins table...");
  const { error: dbErr } = await supabase.from("admins").upsert({
    id: user.id,
    email: user.email,
    role: "admin",
  });

  if (dbErr) {
    console.error("❌ Failed to register in public.admins:", dbErr.message);
    console.error("Make sure you ran the SQL migration (supabase/migrations/20261012_site_images.sql) in SQL Editor.");
  } else {
    console.log("✅ Successfully registered in public.admins table!");
  }

  console.log("\n==================================================");
  console.log(`🎉 SUCCESS: ${adminEmail} is now an authorized administrator.`);
  console.log("You can now log in at: http://localhost:3000/admin/login");
  console.log("==================================================\n");
}

createAdmin().catch(console.error);
