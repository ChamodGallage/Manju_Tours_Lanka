-- ==============================================================================
-- MANJU TOURS LANKA — Supabase Migration: site_images table & Storage setup
-- ==============================================================================

-- 1. Ensure uuid-ossp extension is enabled
create extension if not exists "uuid-ossp";

-- 2. Ensure admins table exists
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

alter table public.admins enable row level security;

-- Only authenticated admins can read admin table
drop policy if exists "Admins viewable by admins only" on public.admins;
create policy "Admins viewable by admins only"
  on public.admins for select
  to authenticated
  using (
    exists (select 1 from public.admins where id = auth.uid())
    or (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin')
  );

-- 3. Security Helper Function: is_admin()
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins
    where id = auth.uid()
  ) or (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin');
$$;

-- 4. Centralized site_images Table
create table if not exists public.site_images (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  storage_path text default '',
  image_url text not null,
  page_key text not null default 'home',
  section_key text not null default 'general',
  category text not null default 'general',
  destination text default '',
  alt_text text not null default '',
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete set null
);

-- Indexes for lightning-fast queries
create index if not exists idx_site_images_page_section on public.site_images(page_key, section_key, is_active);
create index if not exists idx_site_images_destination on public.site_images(destination, is_active);
create index if not exists idx_site_images_category on public.site_images(category, is_active);
create index if not exists idx_site_images_display_order on public.site_images(display_order asc);
create index if not exists idx_site_images_created_at on public.site_images(created_at desc);

-- 5. Row Level Security (RLS) on site_images
alter table public.site_images enable row level security;

-- Policy 1: Public visitors can view active images (or admins view all including hidden)
drop policy if exists "Public can read active site images" on public.site_images;
create policy "Public can read active site images"
  on public.site_images for select
  using (is_active = true or public.is_admin());

-- Policy 2: Admins have full access to insert, update, delete site images
drop policy if exists "Admins can manage site images" on public.site_images;
create policy "Admins can manage site images"
  on public.site_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 6. Storage Bucket & Policies: site-images
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = true;

-- Storage Policy 1: Public can view images in site-images bucket
drop policy if exists "Public can read site-images" on storage.objects;
create policy "Public can read site-images"
  on storage.objects for select
  using (bucket_id = 'site-images');

-- Storage Policy 2: Only authorized admins can upload images
drop policy if exists "Admins can upload to site-images" on storage.objects;
create policy "Admins can upload to site-images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-images' and public.is_admin());

-- Storage Policy 3: Only authorized admins can update images
drop policy if exists "Admins can update site-images" on storage.objects;
create policy "Admins can update site-images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-images' and public.is_admin())
  with check (bucket_id = 'site-images' and public.is_admin());

-- Storage Policy 4: Only authorized admins can delete images
drop policy if exists "Admins can delete from site-images" on storage.objects;
create policy "Admins can delete from site-images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-images' and public.is_admin());
