-- ==============================================================================
-- MANJU TOURS LANKA — Supabase Migration: tour_packages table & RLS policies
-- ==============================================================================

-- 1. Ensure uuid-ossp extension is enabled
create extension if not exists "uuid-ossp";

-- 2. Ensure admins table & is_admin() function exist
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

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

-- 3. Tour Packages Table
create table if not exists public.tour_packages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  tagline text not null default '',
  overview text not null default '',
  hero_image text not null default '',
  hero_image_metadata jsonb default '{}'::jsonb,
  gallery_images jsonb not null default '[]'::jsonb,
  travel_style text not null default 'Private Chauffeur',
  destinations jsonb not null default '[]'::jsonb,
  duration_days int not null default 1,
  duration_nights int not null default 0,
  starting_price text not null default 'Request a Quote',
  starting_price_numeric numeric default 0,
  currency text not null default 'USD',
  price_type text not null default 'custom_quote', -- 'per_person', 'per_group', 'custom_quote'
  min_travelers int not null default 1,
  max_travelers int not null default 12,
  inclusions jsonb not null default '[]'::jsonb,
  exclusions jsonb not null default '[]'::jsonb,
  itinerary jsonb not null default '[]'::jsonb,
  accommodation_details text default '',
  transport_details text default 'Private air-conditioned vehicle with dedicated English-speaking chauffeur-guide, fuel, highway tolls & parking fees included',
  meals_included text default 'Daily breakfast at all accommodation stops',
  activities jsonb not null default '[]'::jsonb,
  optional_activities jsonb not null default '[]'::jsonb,
  suitable_for jsonb not null default '[]'::jsonb,
  booking_conditions text default 'Flexible booking with custom quote. Pacing and route can be modified to your flight schedule.',
  cancellation_policy text default 'Free cancellation up to 14 days before tour arrival date.',
  faqs jsonb not null default '[]'::jsonb,
  seo_title text default '',
  seo_description text default '',
  display_order int not null default 0,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete set null
);

-- Indexes for performance
create index if not exists idx_tour_packages_slug on public.tour_packages(slug);
create index if not exists idx_tour_packages_published on public.tour_packages(is_published);
create index if not exists idx_tour_packages_featured on public.tour_packages(is_featured);
create index if not exists idx_tour_packages_display_order on public.tour_packages(display_order asc);
create index if not exists idx_tour_packages_travel_style on public.tour_packages(travel_style);
create index if not exists idx_tour_packages_created_at on public.tour_packages(created_at desc);

-- 4. Row Level Security (RLS) on tour_packages
alter table public.tour_packages enable row level security;

-- Policy 1: Public visitors can view published tour packages (admins can view all including drafts)
drop policy if exists "Public can read published tour packages" on public.tour_packages;
create policy "Public can read published tour packages"
  on public.tour_packages for select
  using (is_published = true or public.is_admin());

-- Policy 2: Admins have full access to insert, update, delete tour packages
drop policy if exists "Admins can manage tour packages" on public.tour_packages;
create policy "Admins can manage tour packages"
  on public.tour_packages for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 5. Compatibility View for public.tours (if table does not exist as separate table)
do $$
begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'tours') then
    create or replace view public.tours as
      select
        id::text as id,
        title,
        slug,
        tagline as subtitle,
        (duration_days::text || ' Days / ' || duration_nights::text || ' Nights') as duration,
        '' as route,
        overview as description,
        starting_price_numeric as price_from,
        currency as price_currency,
        hero_image as image_url,
        activities as highlights,
        is_featured,
        display_order,
        is_published as published,
        created_at,
        updated_at
      from public.tour_packages;
  end if;
end $$;
