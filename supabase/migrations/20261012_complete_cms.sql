-- ==============================================================================
-- MANJU TOURS LANKA — Supabase Migration: Complete Website Management CMS
-- ==============================================================================

-- 1. Ensure uuid-ossp extension is enabled
create extension if not exists "uuid-ossp";

-- 2. Admins table & security helper
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

-- 3. Site Settings Table (Business info, contact, socials, currencies, SEO defaults)
create table if not exists public.site_settings (
  id text primary key default 'global',
  company_name text not null default 'MANJU TOURS LANKA',
  tagline text not null default 'Your Personal Sri Lanka Travel Planner',
  phone text not null default '+94 77 123 4567',
  whatsapp text not null default '+94 77 123 4567',
  email text not null default 'info@manjutourslanka.com',
  address text not null default 'Galle Road, Hikkaduwa, Southern Province, Sri Lanka',
  opening_hours text default 'Daily: 7:00 AM – 10:00 PM (Sri Lanka Time GMT+5:30)',
  currency text default 'USD',
  supported_currencies jsonb default '["USD", "EUR", "GBP", "AUD", "LKR"]'::jsonb,
  social_facebook text default 'https://facebook.com',
  social_instagram text default 'https://instagram.com',
  social_tripadvisor text default 'https://tripadvisor.com',
  social_youtube text default '',
  whatsapp_welcome_message text default 'Hello Manju Tours Lanka! I am planning a holiday to Sri Lanka and would like some advice on an itinerary.',
  logo_url text default '/images/logo.png',
  favicon_url text default '/favicon.ico',
  seo_title_default text default 'Manju Tours Lanka | Authentic Private Tours & Chauffeur Guide',
  seo_description_default text default 'Handcrafted private tours, dedicated English-speaking chauffeur-guides, scenic hill country, and pristine coastal escapes in Sri Lanka.',
  seo_keywords_default text default 'Sri Lanka tours, private driver Sri Lanka, chauffeur guide Sri Lanka, Hikkaduwa tours, Sri Lanka holiday packages',
  seo_og_image text default '/images/hero.webp',
  google_analytics_id text default '',
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- Seed singleton settings row if missing
insert into public.site_settings (id)
values ('global')
on conflict (id) do nothing;

-- 4. Destinations Table
create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  tagline text not null default '',
  region text not null default 'Cultural Triangle',
  summary text not null default '',
  content text not null default '',
  hero_image text not null default '',
  hero_image_metadata jsonb default '{}'::jsonb,
  gallery_images jsonb not null default '[]'::jsonb,
  highlights jsonb not null default '[]'::jsonb,
  best_time_to_visit text default '',
  ideal_duration text default '2 - 3 Days',
  travel_tips text default '',
  latitude numeric default 0,
  longitude numeric default 0,
  display_order int default 0,
  is_featured boolean default false,
  is_published boolean default true,
  seo_title text default '',
  seo_description text default '',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_destinations_slug on public.destinations(slug);
create index if not exists idx_destinations_published on public.destinations(is_published);
create index if not exists idx_destinations_featured on public.destinations(is_featured);
create index if not exists idx_destinations_order on public.destinations(display_order asc);

-- 5. Customer Enquiries Table
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
  status text not null default 'NEW', -- NEW, CONTACTED, IN_PROGRESS, CONFIRMED, CANCELLED
  source text default 'Website Tour Enquiry',
  admin_notes text default '',
  ip_hash text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_tour_enquiries_status on public.tour_enquiries(status);
create index if not exists idx_tour_enquiries_created_at on public.tour_enquiries(created_at desc);

-- 6. Reviews & Testimonials Table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_country text not null default '',
  rating int not null default 5,
  review_date text not null default '',
  travel_month text default '',
  title text not null default '',
  comment text not null,
  source text not null default 'TripAdvisor',
  tour_title text default '',
  is_verified boolean default true,
  is_featured boolean default false,
  display_order int default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_reviews_featured on public.reviews(is_featured);
create index if not exists idx_reviews_created on public.reviews(created_at desc);

-- 7. Page Content & Sections Table (Home, About, Contact, Custom Tour)
create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_key text not null, -- 'home', 'about', 'contact', 'custom-tour'
  section_key text not null, -- 'hero', 'why-us', 'quick-links', 'cta-banner', 'about-story', etc.
  title text not null default '',
  subtitle text default '',
  badge text default '',
  content text default '',
  button_text text default '',
  button_url text default '',
  image_url text default '',
  secondary_image_url text default '',
  items jsonb default '[]'::jsonb, -- structured cards, pillars, features
  is_visible boolean default true,
  display_order int default 0,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create unique index if not exists idx_page_section_unique on public.page_sections(page_key, section_key);

-- 8. Navigation Menus Table (Header & Footer Links)
create table if not exists public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  menu_location text not null default 'header', -- 'header', 'footer_quick_links', 'footer_legal'
  label text not null,
  url text not null,
  display_order int default 0,
  is_external boolean default false,
  is_active boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_navigation_location on public.navigation_items(menu_location, display_order);

-- 9. Gallery Collections Table
create table if not exists public.gallery_collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text default '',
  category text not null default 'island-life', -- 'beaches', 'wildlife', 'culture', 'heritage', 'scenic'
  cover_image text not null default '',
  images jsonb not null default '[]'::jsonb, -- Array of { src, alt, caption }
  display_order int default 0,
  is_published boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_gallery_collections_slug on public.gallery_collections(slug);
create index if not exists idx_gallery_collections_category on public.gallery_collections(category);

-- ==============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.destinations enable row level security;
alter table public.tour_enquiries enable row level security;
alter table public.reviews enable row level security;
alter table public.page_sections enable row level security;
alter table public.navigation_items enable row level security;
alter table public.gallery_collections enable row level security;

-- Admins Table
drop policy if exists "Admins viewable by admins only" on public.admins;
create policy "Admins viewable by admins only"
  on public.admins for select
  to authenticated
  using (public.is_admin());

-- Site Settings
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

-- Destinations
drop policy if exists "Public can read published destinations" on public.destinations;
create policy "Public can read published destinations"
  on public.destinations for select
  using (is_published = true or public.is_admin());

drop policy if exists "Admins can manage destinations" on public.destinations;
create policy "Admins can manage destinations"
  on public.destinations for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Tour Enquiries: Public insert only; strictly protected from public read
drop policy if exists "Public can submit tour enquiries" on public.tour_enquiries;
create policy "Public can submit tour enquiries"
  on public.tour_enquiries for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Admins can view and manage tour enquiries" on public.tour_enquiries;
create policy "Admins can view and manage tour enquiries"
  on public.tour_enquiries for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Reviews
drop policy if exists "Public can read reviews" on public.reviews;
create policy "Public can read reviews"
  on public.reviews for select
  using (true);

drop policy if exists "Admins can manage reviews" on public.reviews;
create policy "Admins can manage reviews"
  on public.reviews for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Page Sections
drop policy if exists "Public can read page sections" on public.page_sections;
create policy "Public can read page sections"
  on public.page_sections for select
  using (is_visible = true or public.is_admin());

drop policy if exists "Admins can manage page sections" on public.page_sections;
create policy "Admins can manage page sections"
  on public.page_sections for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Navigation Items
drop policy if exists "Public can read navigation items" on public.navigation_items;
create policy "Public can read navigation items"
  on public.navigation_items for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admins can manage navigation items" on public.navigation_items;
create policy "Admins can manage navigation items"
  on public.navigation_items for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Gallery Collections
drop policy if exists "Public can read published gallery collections" on public.gallery_collections;
create policy "Public can read published gallery collections"
  on public.gallery_collections for select
  using (is_published = true or public.is_admin());

drop policy if exists "Admins can manage gallery collections" on public.gallery_collections;
create policy "Admins can manage gallery collections"
  on public.gallery_collections for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
