-- ==============================================================================
-- MANJU TOURS LANKA — Supabase Migration: Full Website Page Builder & CMS
-- ==============================================================================

-- 1. Ensure uuid extension
create extension if not exists "uuid-ossp";

-- 2. Create pages table
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  page_key text unique not null,
  title text not null,
  navigation_label text default '',
  nav_location text default 'header', -- 'header', 'footer_quick_links', 'footer_legal', 'none'
  is_published boolean default true,
  status text not null default 'published', -- 'published', 'draft'
  seo_title text default '',
  seo_description text default '',
  seo_og_image text default '/images/hero.webp',
  seo_keywords text default '',
  is_template boolean default false,
  layout_type text default 'default',
  display_order int default 0,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

create index if not exists idx_pages_slug on public.pages(slug);
create index if not exists idx_pages_page_key on public.pages(page_key);
create index if not exists idx_pages_published on public.pages(is_published);
create index if not exists idx_pages_status on public.pages(status);
create index if not exists idx_pages_order on public.pages(display_order asc);

-- 3. Extend page_sections table with builder capabilities
alter table public.page_sections
  add column if not exists section_type text default 'hero',
  add column if not exists secondary_button_text text default '',
  add column if not exists secondary_button_url text default '',
  add column if not exists image_alt text default '',
  add column if not exists background_style text default 'default',
  add column if not exists background_color text default '',
  add column if not exists background_image text default '',
  add column if not exists text_align text default 'left',
  add column if not exists layout_options jsonb default '{}'::jsonb,
  add column if not exists status text default 'published',
  add column if not exists is_draft boolean default false;

-- 4. Enable RLS on pages
alter table public.pages enable row level security;

-- Policy: Public read published pages
drop policy if exists "Public can read published pages" on public.pages;
create policy "Public can read published pages"
  on public.pages for select
  using (is_published = true or public.is_admin());

-- Policy: Admins can manage all pages
drop policy if exists "Admins can manage pages" on public.pages;
create policy "Admins can manage pages"
  on public.pages for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 5. Seed all 13 core website pages
insert into public.pages (slug, page_key, title, navigation_label, nav_location, is_published, status, seo_title, seo_description, seo_og_image, is_template, display_order)
values
  ('/', 'home', 'Home Page', 'Home', 'none', true, 'published', 'Manju Tours Lanka | Authentic Private Tours & Chauffeur Guide', 'Handcrafted private tours, dedicated English-speaking chauffeur-guides, scenic hill country, and pristine coastal escapes in Sri Lanka.', '/images/hero.webp', false, 1),
  ('/about', 'about', 'About Us', 'About Manju', 'header', true, 'published', 'About Manju Tours Lanka | Local Travel Planner in Hikkaduwa', 'Meet Manju and the team behind Manju Tours Lanka. Local Sri Lankan chauffeur-guides based in Hikkaduwa offering authentic, unhurried, tailor-made private tours.', '/images/hero-beach.webp', false, 2),
  ('/contact', 'contact', 'Contact Us & WhatsApp', 'Contact', 'header', true, 'published', 'Contact Us & WhatsApp | Manju Tours Lanka', 'Get in touch with Manju Tours Lanka in Hikkaduwa. Fast WhatsApp replies, customized trip quotes, and private driver arrangements across Sri Lanka.', '/images/hero-sigiriya.webp', false, 3),
  ('/custom-tour', 'custom-tour', 'Custom Itinerary Planner', 'Plan My Trip', 'header', true, 'published', 'Custom Sri Lanka Tour Planner | Manju Tours Lanka', 'Design your dream Sri Lanka holiday. Interactive custom tour planner for private chauffeured journeys tailored to your pacing, budget, and travel style.', '/images/experience-essence.webp', false, 4),
  ('/credits', 'credits', 'Photo Credits & Licenses', 'Photo Credits', 'footer_legal', true, 'published', 'Photo Credits & Creative Commons Attributions', 'Creative Commons photo attributions and licensing acknowledgements for images used on Manju Tours Lanka.', '/images/hero.webp', false, 5),
  ('/tours', 'tours', 'Signature Tour Packages', 'Tours', 'header', true, 'published', 'Sri Lanka Private Tours & Handcrafted Itineraries', 'Explore handcrafted private Sri Lanka tour itineraries escorted by licensed English-speaking chauffeur-guides.', '/images/destinations/sigiriya/hero.webp', false, 6),
  ('/tours/[slug]', 'tour-detail-template', 'Tour Package Details (Shared Template)', 'Tour Details', 'none', true, 'published', 'Sri Lanka Tour Package Details', 'Comprehensive day-by-day itineraries, transparent inclusions, and private chauffeured travel specifications.', '/images/destinations/ella/hero.webp', true, 7),
  ('/destinations', 'destinations', 'Island Destinations Directory', 'Destinations', 'header', true, 'published', 'Sri Lanka Destinations & Regional Guides', 'Explore Sri Lanka iconic travel destinations: Sigiriya, Kandy, Nuwara Eliya, Haputale, Ella, Mirissa, and beyond.', '/images/destinations/sigiriya/hero.webp', false, 8),
  ('/destinations/[slug]', 'destination-detail-template', 'Destination Guide (Shared Template)', 'Destination Guide', 'none', true, 'published', 'Sri Lanka Destination Guide', 'Regional travel highlights, ideal duration, travel tips, and authentic local guidance.', '/images/destinations/mirissa/hero.webp', true, 9),
  ('/experiences', 'experiences', 'Curated Island Experiences', 'Experiences', 'header', true, 'published', 'Curated Sri Lanka Experiences & Activities', 'Whale watching cruises, open-top leopard safaris, scenic mountain railways, and authentic clay-pot cooking classes.', '/images/experiences/yala-leopard-jeep-safari/hero.webp', false, 10),
  ('/experiences/[slug]', 'experience-detail-template', 'Experience Guide (Shared Template)', 'Experience Guide', 'none', true, 'published', 'Sri Lanka Travel Activity & Experience Guide', 'Hand-picked, ethical, and privately hosted island activities.', '/images/experiences/mirissa-whale-watching/hero.webp', true, 11),
  ('/stories', 'stories', 'Island Stories & Travel Guides', 'Island Stories', 'header', true, 'published', 'Island Stories & Local Travel Guides', 'Insider secrets, realistic drive times, and ethical safari recommendations from local Sri Lankan chauffeur-guides.', '/images/hero-tea.webp', false, 12),
  ('/stories/[slug]', 'story-detail-template', 'Story Article (Shared Template)', 'Story Guide', 'none', true, 'published', 'Sri Lanka Travel Story & Guide Article', 'Detailed advice, practical logistics, and route recommendations.', '/images/hero.webp', true, 13)
on conflict (page_key) do update set
  title = excluded.title,
  navigation_label = excluded.navigation_label,
  seo_title = excluded.seo_title,
  seo_description = excluded.seo_description;
