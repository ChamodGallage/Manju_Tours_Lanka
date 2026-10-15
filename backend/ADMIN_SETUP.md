# Admin Panel Setup

## Current workspace status

The project contains an admin UI at `/admin`, a Supabase login page at `/admin/login`, admin API routes, Supabase schema/migration files, and a first-admin provisioning script. The local `.env` currently has no Supabase URL, anon key, or service-role key, and no Supabase CLI is installed. Admin login, migrations, Storage access, password reset email delivery, and database-backed editing cannot be verified from this workspace yet.

## Configure an administrator

1. In the Supabase Dashboard, open the correct project and go to **Authentication → Users**. Create the administrator account with the email address you intend to use. That email is the admin login email. No password is stored in the website source.
2. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the untracked `.env.local` file for browser login and public reads. The browser login does not use a service-role/secret key. Admin API operations that need elevated database access separately require `SUPABASE_SERVICE_ROLE_KEY` on the server only; never add a `NEXT_PUBLIC_` prefix to it. Restart the dev server after changing environment variables.
3. Review the Supabase table schema and migration history before applying the SQL described below. The existing repo has several same-day migration files and overlapping schema snapshots; reconcile them with the target project instead of blindly running every file.
4. After the `admins` table exists, provision the account using `npx tsx scripts/create-admin.ts admin-email@example.com`. The script grants the role to that existing Supabase user; it does not create a password or invent an account. Do not run it with an account you did not intend to authorize.
5. Sign in at `http://localhost:3000/admin/login`. Use **Forgot password?** to request a reset email. In Supabase **Authentication → URL Configuration**, allow the local callback `http://localhost:3000/admin/reset-password` and the corresponding production URL before using password recovery in production.

## Apply the migration safely

The forward migration is `supabase/migrations/20261012120000_admin_role_hardening.sql`. It updates the admin predicate, adds publication and media metadata fields, and refreshes public/admin RLS policies. Read it alongside `supabase/schema.sql` and every existing migration. Confirm the actual project tables and policy names, take a database backup, and apply it in the Supabase SQL Editor or through the project's established migration process. Do not apply the overlapping snapshot files as a batch. No remote migration has been applied from this workspace.

The current migration folder includes multiple files with the same eight-digit version prefix and overlapping definitions. Supabase CLI history generally expects unique migration versions. Reconcile the existing files against `supabase migration list` for the actual project before adopting CLI-based migrations.

## Migrate existing images

After the reviewed migration has been applied and the `site-images` bucket is available, run:

```powershell
npx tsx scripts/seed-site-images.ts
```

The script requires `.env.local` and the server-only service-role key. It considers the entries in `DEFAULT_SITE_IMAGES`, checks for an existing object first, avoids overwriting objects, deduplicates repeated file bytes within the run, downloads and hashes each Storage object before saving its database reference, and preserves local files. It leaves a conflicting pre-existing Storage object untouched and reports that item as skipped. It does not currently migrate every unused raster in `public/`; consult `ASSET_INVENTORY.md` and select additional assets deliberately. Verify the output records and public page retrieval before considering any later cleanup. No cleanup is included.

## Admin URLs

- Dashboard: `/admin`
- Login: `/admin/login`
- Media Library: `/admin/photos`
- Password recovery: `/admin/forgot-password`
- Set a recovered password: `/admin/reset-password`
