-- Forward migration: make database authorization depend on an explicit admin row.
-- Review the remote schema and migration history before applying this file.

create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
alter table public.reviews add column if not exists is_published boolean not null default true;
alter table public.site_settings add column if not exists canonical_url text not null default 'https://manjutourslanka.com/';
alter table public.site_images
  add column if not exists original_filename text not null default '',
  add column if not exists mime_type text not null default '',
  add column if not exists width integer,
  add column if not exists height integer,
  add column if not exists size_bytes bigint,
  add column if not exists focal_point text not null default 'center';

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins as a
    where a.id = (select auth.uid())
      and a.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "Admins viewable by admins only" on public.admins;
create policy "Admins viewable by admins only"
  on public.admins for select to authenticated
  using (public.is_admin());

revoke insert, update, delete, truncate, references, trigger on public.admins from anon, authenticated;

-- Public website content is readable only when published/visible/active.
-- Explicit admin policies remain responsible for all writes.
drop policy if exists "Public can read active site images" on public.site_images;
create policy "Public can read active site images"
  on public.site_images for select to anon, authenticated
  using (is_active = true or public.is_admin());

drop policy if exists "Public can read published destinations" on public.destinations;
create policy "Public can read published destinations"
  on public.destinations for select to anon, authenticated
  using (is_published = true or public.is_admin());

drop policy if exists "Public can read published tour packages" on public.tour_packages;
create policy "Public can read published tour packages"
  on public.tour_packages for select to anon, authenticated
  using (is_published = true or public.is_admin());

drop policy if exists "Public can read visible page sections" on public.page_sections;
create policy "Public can read visible page sections"
  on public.page_sections for select to anon, authenticated
  using (is_visible = true or public.is_admin());

drop policy if exists "Public can read reviews" on public.reviews;
drop policy if exists "Public can read published reviews" on public.reviews;
create policy "Public can read published reviews"
  on public.reviews for select to anon, authenticated
  using (is_published = true or public.is_admin());

drop policy if exists "Public can read active navigation items" on public.navigation_items;
create policy "Public can read active navigation items"
  on public.navigation_items for select to anon, authenticated
  using (is_active = true or public.is_admin());

drop policy if exists "Public can read published gallery collections" on public.gallery_collections;
create policy "Public can read published gallery collections"
  on public.gallery_collections for select to anon, authenticated
  using (is_published = true or public.is_admin());

-- Customer records stay private; policies must require an authenticated admin.
drop policy if exists "Admins can view and manage tour enquiries" on public.tour_enquiries;
create policy "Admins can view and manage tour enquiries"
  on public.tour_enquiries for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- The site-images bucket can be public for image delivery; writes require explicit admin membership.
drop policy if exists "Admins Can Upload Site Images" on storage.objects;
drop policy if exists "Admins Can Update Site Images" on storage.objects;
drop policy if exists "Admins Can Delete Site Images" on storage.objects;
create policy "Admins Can Upload Site Images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'site-images' and public.is_admin());
create policy "Admins Can Update Site Images"
  on storage.objects for update to authenticated
  using (bucket_id = 'site-images' and public.is_admin())
  with check (bucket_id = 'site-images' and public.is_admin());
create policy "Admins Can Delete Site Images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'site-images' and public.is_admin());
