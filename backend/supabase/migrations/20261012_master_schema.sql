-- ==============================================================================
-- MANJU TOURS LANKA — MASTER DATABASE MIGRATION & STORAGE SETUP
-- Project URL: https://zazflloyuzjqeyxrcpwl.supabase.co
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/zazflloyuzjqeyxrcpwl
-- 2. In the left navigation, click "SQL Editor" -> "New query".
-- 3. Paste this ENTIRE file into the editor and click "Run".
-- 4. All tables, security functions, RLS policies, storage bucket, and seeds will be created.
-- ==============================================================================

-- 1. ENABLE EXTENSIONS
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 2. ADMINISTRATORS TABLE & SECURITY DEFINER HELPER
-- ==============================================================================
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

-- ==============================================================================
-- 3. SITE SETTINGS TABLE (Company contact, phone, WhatsApp, socials, currencies)
-- ==============================================================================
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

-- ==============================================================================
-- 4. DESTINATIONS TABLE
-- ==============================================================================
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
create index if not exists idx_destinations_order on public.destinations(display_order asc);

-- ==============================================================================
-- 5. TOUR PACKAGES TABLE
-- ==============================================================================
create table if not exists public.tour_packages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  tagline text not null default '',
  overview text not null default '',
  hero_image text not null default '',
  hero_image_metadata jsonb default '{}'::jsonb,
  gallery_images jsonb not null default '[]'::jsonb,
  travel_style text not null default 'Private Chauffeur Guide',
  destinations jsonb not null default '[]'::jsonb,
  duration_days int not null default 7,
  duration_nights int not null default 6,
  starting_price text not null default 'From $850 USD',
  starting_price_numeric numeric default 850,
  currency text not null default 'USD',
  price_type text not null default 'per_person', -- 'per_person', 'per_group', 'custom_quote'
  min_travelers int default 1,
  max_travelers int default 8,
  inclusions jsonb not null default '[]'::jsonb,
  exclusions jsonb not null default '[]'::jsonb,
  itinerary jsonb not null default '[]'::jsonb,
  accommodation_details text default '',
  transport_details text default '',
  meals_included text default '',
  activities jsonb not null default '[]'::jsonb,
  optional_activities jsonb default '[]'::jsonb,
  suitable_for jsonb default '[]'::jsonb,
  booking_conditions text default '',
  cancellation_policy text default '',
  faqs jsonb default '[]'::jsonb,
  seo_title text default '',
  seo_description text default '',
  display_order int default 0,
  is_featured boolean default false,
  is_published boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete set null
);

create index if not exists idx_tour_packages_slug on public.tour_packages(slug);
create index if not exists idx_tour_packages_published on public.tour_packages(is_published);
create index if not exists idx_tour_packages_featured on public.tour_packages(is_featured);
create index if not exists idx_tour_packages_order on public.tour_packages(display_order asc);

-- ==============================================================================
-- 6. PAGE CONTENT & SECTIONS TABLE (Headings, heroes, paragraphs, buttons)
-- ==============================================================================
create table if not exists public.page_sections (
  id text primary key,
  page_key text not null,       -- 'home', 'about', 'contact', 'custom-tour'
  section_key text not null,    -- 'hero', 'why_us', 'cta_banner', etc.
  title text not null default '',
  subtitle text default '',
  badge text default '',
  content text default '',
  button_text text default '',
  button_url text default '',
  image_url text default '',
  secondary_image_url text default '',
  items jsonb default '[]'::jsonb,
  is_visible boolean default true,
  display_order int default 0,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create unique index if not exists idx_page_sections_key on public.page_sections(page_key, section_key);

-- Also create page_content view for seamless compatibility
create or replace view public.page_content as
select * from public.page_sections;

-- ==============================================================================
-- 7. SITE IMAGES TABLE (Centralized website photo management hub)
-- ==============================================================================
create table if not exists public.site_images (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  storage_path text not null,
  image_url text not null,
  page_key text not null default 'global',
  section_key text not null default 'hero',
  category text not null default 'hero',       -- 'hero', 'pillar', 'destination', 'tour', 'gallery'
  destination text default '',
  alt_text text default '',
  display_order int default 0,
  is_active boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) on delete set null
);

create index if not exists idx_site_images_category on public.site_images(category);
create index if not exists idx_site_images_active on public.site_images(is_active);
create index if not exists idx_site_images_order on public.site_images(display_order asc);

-- ==============================================================================
-- 8. CUSTOMER TOUR ENQUIRIES & BOOKINGS TABLE
-- ==============================================================================
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
  travel_style text default 'Private Chauffeur Guide',
  message text not null,
  status text not null default 'NEW', -- NEW, CONTACTED, IN_PROGRESS, CONFIRMED, CANCELLED
  source text default 'Website Tour Enquiry',
  admin_notes text default '',
  ip_hash text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_tour_enquiries_status on public.tour_enquiries(status);
create index if not exists idx_tour_enquiries_created on public.tour_enquiries(created_at desc);

-- ==============================================================================
-- 9. GUEST REVIEWS & TESTIMONIALS TABLE
-- ==============================================================================
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_country text not null default 'International Traveler',
  rating int not null default 5,
  review_date text not null default '',
  travel_month text default '',
  title text not null default '',
  comment text not null,
  source text not null default 'TripAdvisor',
  tour_title text default '',
  is_verified boolean default true,
  is_featured boolean default true,
  display_order int default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_reviews_featured on public.reviews(is_featured);
create index if not exists idx_reviews_order on public.reviews(display_order asc);

-- ==============================================================================
-- 10. NAVIGATION MENUS TABLE (Header & Footer Links)
-- ==============================================================================
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

create index if not exists idx_navigation_location on public.navigation_items(menu_location, display_order asc);

-- ==============================================================================
-- 11. GALLERY COLLECTIONS TABLE
-- ==============================================================================
create table if not exists public.gallery_collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text default '',
  category text not null default 'island-life',
  cover_image text not null default '',
  images jsonb not null default '[]'::jsonb,
  display_order int default 0,
  is_published boolean default true,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_gallery_collections_slug on public.gallery_collections(slug);

-- ==============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.admins enable row level security;
alter table public.site_settings enable row level security;
alter table public.destinations enable row level security;
alter table public.tour_packages enable row level security;
alter table public.page_sections enable row level security;
alter table public.site_images enable row level security;
alter table public.tour_enquiries enable row level security;
alter table public.reviews enable row level security;
alter table public.navigation_items enable row level security;
alter table public.gallery_collections enable row level security;

-- Admins Table: Only admins can inspect the admin roster
drop policy if exists "Admins viewable by admins only" on public.admins;
create policy "Admins viewable by admins only"
  on public.admins for select to authenticated
  using (public.is_admin());

-- Site Settings: Public read, Admin manage
drop policy if exists "Public can read site settings" on public.site_settings;
create policy "Public can read site settings"
  on public.site_settings for select using (true);

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
  on public.site_settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Destinations: Public read published, Admin manage all
drop policy if exists "Public can read published destinations" on public.destinations;
create policy "Public can read published destinations"
  on public.destinations for select
  using (is_published = true or public.is_admin());

drop policy if exists "Admins can manage destinations" on public.destinations;
create policy "Admins can manage destinations"
  on public.destinations for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Tour Packages: Public read published, Admin manage all
drop policy if exists "Public can read published tour packages" on public.tour_packages;
create policy "Public can read published tour packages"
  on public.tour_packages for select
  using (is_published = true or public.is_admin());

drop policy if exists "Admins can manage tour packages" on public.tour_packages;
create policy "Admins can manage tour packages"
  on public.tour_packages for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Page Sections: Public read visible, Admin manage all
drop policy if exists "Public can read visible page sections" on public.page_sections;
create policy "Public can read visible page sections"
  on public.page_sections for select
  using (is_visible = true or public.is_admin());

drop policy if exists "Admins can manage page sections" on public.page_sections;
create policy "Admins can manage page sections"
  on public.page_sections for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Site Images: Public read active, Admin manage all
drop policy if exists "Public can read active site images" on public.site_images;
create policy "Public can read active site images"
  on public.site_images for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admins can manage site images" on public.site_images;
create policy "Admins can manage site images"
  on public.site_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Tour Enquiries: Public insert only; strictly protected from public read access
drop policy if exists "Public can submit tour enquiries" on public.tour_enquiries;
create policy "Public can submit tour enquiries"
  on public.tour_enquiries for insert to anon, authenticated
  with check (true);

drop policy if exists "Admins can view and manage tour enquiries" on public.tour_enquiries;
create policy "Admins can view and manage tour enquiries"
  on public.tour_enquiries for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Reviews: Public read, Admin manage
drop policy if exists "Public can read reviews" on public.reviews;
create policy "Public can read reviews"
  on public.reviews for select using (true);

drop policy if exists "Admins can manage reviews" on public.reviews;
create policy "Admins can manage reviews"
  on public.reviews for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Navigation Items: Public read active, Admin manage all
drop policy if exists "Public can read active navigation items" on public.navigation_items;
create policy "Public can read active navigation items"
  on public.navigation_items for select
  using (is_active = true or public.is_admin());

drop policy if exists "Admins can manage navigation items" on public.navigation_items;
create policy "Admins can manage navigation items"
  on public.navigation_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Gallery Collections: Public read published, Admin manage all
drop policy if exists "Public can read published gallery collections" on public.gallery_collections;
create policy "Public can read published gallery collections"
  on public.gallery_collections for select
  using (is_published = true or public.is_admin());

drop policy if exists "Admins can manage gallery collections" on public.gallery_collections;
create policy "Admins can manage gallery collections"
  on public.gallery_collections for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ==============================================================================
-- 13. SUPABASE STORAGE SETUP: 'site-images' BUCKET & POLICIES
-- ==============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-images',
  'site-images',
  true,
  10485760, -- 10MB limit
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];

-- Storage RLS: Public read, Admin upload/update/delete
drop policy if exists "Public Access for Site Images" on storage.objects;
create policy "Public Access for Site Images"
  on storage.objects for select
  using (bucket_id = 'site-images');

drop policy if exists "Admins Can Upload Site Images" on storage.objects;
create policy "Admins Can Upload Site Images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'site-images' and public.is_admin());

drop policy if exists "Admins Can Update Site Images" on storage.objects;
create policy "Admins Can Update Site Images"
  on storage.objects for update to authenticated
  using (bucket_id = 'site-images' and public.is_admin());

drop policy if exists "Admins Can Delete Site Images" on storage.objects;
create policy "Admins Can Delete Site Images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'site-images' and public.is_admin());

-- ==============================================================================
-- 14. SEED INITIAL PAGE SECTIONS
-- ==============================================================================
insert into public.page_sections (id, page_key, section_key, title, subtitle, badge, content, button_text, button_url, image_url, display_order)
values
  ('home-hero', 'home', 'hero', 'Sri Lanka With A Trusted Local Guide', 'Tailor-made private chauffeur-guide journeys crafted around your dreams, comfort, and pace.', 'Authentic Island Tourism', 'From the mist-crowned tea estates of Ella to leopard encounters in Yala and quiet golden beaches in Mirissa.', 'Explore Signature Tours', '/tours', '/images/hero.webp', 1),
  ('home-why-us', 'home', 'why_us', 'Why Independent Travelers Choose Manju Tours', 'Genuine Island Hospitality • 100% Private Air-Conditioned Fleet • Zero Tourist Traps', 'The Manju Tours Difference', 'We provide licensed tourist chauffeur-guides who prioritize your safety, respect your rhythm, and never steer you toward overpriced commission shops.', 'Learn About Us', '/about', '', 2),
  ('home-cta', 'home', 'cta_banner', 'Ready to Experience Authentic Sri Lanka?', 'Speak directly with Manju on WhatsApp to design your tailor-made holiday with honest advice and zero booking pressure.', 'Personalized Planning', 'Prompt replies, free route suggestions, and guaranteed fair local pricing.', 'Chat on WhatsApp', 'https://wa.me/94771234567', '/images/experience-essence.webp', 3),
  ('about-hero', 'about', 'hero', 'About Manju Tours Lanka', 'Two decades of guiding independent travelers across the cultural heart and wild landscapes of Sri Lanka.', 'Our Story', 'Founded on genuine warmth, personal chauffeur care, and a passion for showing guests the real island.', 'Plan Your Journey', '/custom-tour', '/images/hero-beach.webp', 1),
  ('contact-hero', 'contact', 'hero', 'Get in Touch With Us', 'We are based in Hikkaduwa & Colombo and available 7 days a week to answer questions and craft your itinerary.', 'Direct Contact', 'Whether you need airport pickup, a single day excursion, or a 14-day grand island tour, we are here to help.', 'Message on WhatsApp', 'https://wa.me/94771234567', '/images/hero-sigiriya.webp', 1),
  ('custom-tour-hero', 'custom-tour', 'hero', 'Design Your Tailor-Made Itinerary', 'Tell us your travel style, preferred pace, and must-see destinations. We will handle all logistics.', 'Bespoke Holidays', 'Complete flexibility to alter routes, pause for photos, and savor delicious local cuisine whenever you wish.', 'Submit Travel Request', '#custom-form', '/images/hero-tea.webp', 1)
on conflict (id) do nothing;
