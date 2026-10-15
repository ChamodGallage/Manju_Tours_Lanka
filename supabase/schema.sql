-- ==============================================================================
-- MANJU TOURS LANKA — Supabase Database & Storage Schema
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ADMINS TABLE
-- Stores authorized admin user IDs linked to Supabase auth.users
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'admin',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. HELPER FUNCTION: Check if the requesting user is an admin
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
  );
$$;

-- 4. SITE SETTINGS TABLE (Hero, Branding, Contact Info)
create table if not exists public.site_settings (
  id text primary key default 'global',
  company_name text not null default 'MANJU TOURS LANKA',
  tagline text not null default 'Your Personal Sri Lanka Travel Planner',
  phone text not null default '+94 77 123 4567',
  whatsapp text not null default '+94 77 123 4567',
  email text not null default 'info@manjutourslanka.com',
  address text not null default 'Galle Road, Hikkaduwa, Southern Province, Sri Lanka',
  hero_badge text default 'Authentic Sri Lanka Private Chauffeur & Curated Tours',
  hero_title text default 'Discover Sri Lanka With A Trusted Local Guide & Private Chauffeur',
  hero_subtitle text default 'Personalized island tours, cultural heritage, scenic hill country, and pristine coastal escapes tailored around you from Hikkaduwa.',
  hero_image_url text default '/images/hero.webp',
  logo_url text default '/images/logo.png',
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. DESTINATIONS TABLE
create table if not exists public.destinations (
  id text primary key,
  title text not null,
  slug text unique not null,
  subtitle text default '',
  region text default '',
  description text default '',
  image_url text default '',
  duration_recommendation text default '',
  best_time_to_visit text default '',
  highlights jsonb default '[]'::jsonb,
  is_featured boolean default false,
  display_order int default 0,
  published boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_destinations_slug on public.destinations(slug);
create index if not exists idx_destinations_order on public.destinations(display_order);

-- 6. TOUR PACKAGES TABLE (Full CMS Management)
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

create index if not exists idx_tour_packages_slug on public.tour_packages(slug);
create index if not exists idx_tour_packages_published on public.tour_packages(is_published);
create index if not exists idx_tour_packages_featured on public.tour_packages(is_featured);
create index if not exists idx_tour_packages_display_order on public.tour_packages(display_order asc);
create index if not exists idx_tour_packages_travel_style on public.tour_packages(travel_style);
create index if not exists idx_tour_packages_created_at on public.tour_packages(created_at desc);

-- 7. GALLERY IMAGES TABLE (Unified photo manager for sections, tours, destinations)
create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  section text not null default 'general',
  destination_id text references public.destinations(id) on delete set null,
  tour_id text references public.tours(id) on delete set null,
  image_url text not null,
  storage_path text default '',
  alt_text text default '',
  sort_order int default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_gallery_section on public.gallery_images(section);
create index if not exists idx_gallery_dest on public.gallery_images(destination_id);
create index if not exists idx_gallery_tour on public.gallery_images(tour_id);

-- 8. CUSTOMER TOUR ENQUIRIES TABLE
create table if not exists public.tour_enquiries (
  id uuid primary key default gen_random_uuid(),
  tour_id text,
  tour_title text,
  name text not null,
  email text not null,
  phone text not null,
  country text not null,
  travel_start_date text,
  travel_end_date text,
  flexible_month text,
  number_of_adults int default 2,
  number_of_children int default 0,
  travel_style text default 'Private Chauffeur',
  message text not null,
  status text not null default 'NEW',
  source text default 'Website Tour Enquiry',
  ip_hash text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_tour_enquiries_created_at on public.tour_enquiries(created_at desc);
create index if not exists idx_tour_enquiries_email on public.tour_enquiries(email);
create index if not exists idx_tour_enquiries_status on public.tour_enquiries(status);

-- 8b. GENERAL INQUIRIES TABLE
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text default '',
  whatsapp text default '',
  travel_dates text default '',
  guests_count int default 2,
  tour_id text default '',
  destination_id text default '',
  message text default '',
  status text not null default 'new',
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.destinations enable row level security;
alter table public.tours enable row level security;
alter table public.gallery_images enable row level security;
alter table public.tour_enquiries enable row level security;
alter table public.inquiries enable row level security;

-- Tour Enquiries: Public can insert; public CANNOT read; only admins can read and manage
drop policy if exists "Public can submit tour enquiries" on public.tour_enquiries;
create policy "Public can submit tour enquiries"
  on public.tour_enquiries for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins can view tour enquiries" on public.tour_enquiries;
create policy "Admins can view tour enquiries"
  on public.tour_enquiries for select
  to authenticated
  using (public.is_admin());

drop policy if exists "Admins can manage tour enquiries" on public.tour_enquiries;
create policy "Admins can manage tour enquiries"
  on public.tour_enquiries for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admins: Only authenticated admins can read admin list
drop policy if exists "Admins viewable by admins only" on public.admins;
create policy "Admins viewable by admins only"
  on public.admins for select
  to authenticated
  using (public.is_admin());

-- Site Settings: Public can read; only admins can update/insert
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings for select
  using (true);

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
  on public.site_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Destinations: Public can read published; admins have full access
drop policy if exists "Public can read published destinations" on public.destinations;
create policy "Public can read published destinations"
  on public.destinations for select
  using (published = true or public.is_admin());

drop policy if exists "Admins can manage destinations" on public.destinations;
create policy "Admins can manage destinations"
  on public.destinations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Tour Packages: Public can read published; admins have full access
alter table public.tour_packages enable row level security;

drop policy if exists "Public can read published tour packages" on public.tour_packages;
create policy "Public can read published tour packages"
  on public.tour_packages for select
  using (is_published = true or public.is_admin());

drop policy if exists "Admins can manage tour packages" on public.tour_packages;
create policy "Admins can manage tour packages"
  on public.tour_packages for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Gallery Images: Public can read; admins have full access
drop policy if exists "Public can read gallery images" on public.gallery_images;
create policy "Public can read gallery images"
  on public.gallery_images for select
  using (true);

drop policy if exists "Admins can manage gallery images" on public.gallery_images;
create policy "Admins can manage gallery images"
  on public.gallery_images for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Inquiries: Public can insert inquiries; only admins can view and update
drop policy if exists "Public can submit inquiries" on public.inquiries;
create policy "Public can submit inquiries"
  on public.inquiries for insert
  with check (true);

drop policy if exists "Admins can manage inquiries" on public.inquiries;
create policy "Admins can manage inquiries"
  on public.inquiries for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ==============================================================================
-- 10. STORAGE BUCKET & STORAGE RLS POLICIES
-- ==============================================================================

-- Create bucket 'site-images' if it doesn't already exist
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do update set public = true;

-- Storage Policy 1: Anyone can view images from site-images
drop policy if exists "Public can read site-images" on storage.objects;
create policy "Public can read site-images"
  on storage.objects for select
  using (bucket_id = 'site-images');

-- Storage Policy 2: Only admins can upload files
drop policy if exists "Admins can upload to site-images" on storage.objects;
create policy "Admins can upload to site-images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-images' and public.is_admin());

-- Storage Policy 3: Only admins can update files
drop policy if exists "Admins can update site-images" on storage.objects;
create policy "Admins can update site-images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-images' and public.is_admin())
  with check (bucket_id = 'site-images' and public.is_admin());

-- Storage Policy 4: Only admins can delete files
drop policy if exists "Admins can delete from site-images" on storage.objects;
create policy "Admins can delete from site-images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-images' and public.is_admin());

-- ==============================================================================
-- 11. INITIAL SEED FOR SITE SETTINGS (Singleton Row)
-- ==============================================================================
insert into public.site_settings (
  id,
  company_name,
  tagline,
  phone,
  whatsapp,
  email,
  address,
  hero_badge,
  hero_title,
  hero_subtitle,
  hero_image_url,
  logo_url
) values (
  'global',
  'MANJU TOURS LANKA',
  'Your Personal Sri Lanka Travel Planner',
  '+94 77 123 4567',
  '+94 77 123 4567',
  'info@manjutourslanka.com',
  'Galle Road, Hikkaduwa, Southern Province, Sri Lanka',
  'Authentic Sri Lanka Private Chauffeur & Curated Tours',
  'Discover Sri Lanka With A Trusted Local Guide & Private Chauffeur',
  'Personalized island tours, cultural heritage, scenic hill country, and pristine coastal escapes tailored around you from Hikkaduwa.',
  '/images/hero.webp',
  '/images/logo.png'
)
on conflict (id) do nothing;
