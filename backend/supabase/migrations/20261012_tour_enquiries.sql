-- ==============================================================================
-- MANJU TOURS LANKA — Supabase Migration: tour_enquiries table & RLS policies
-- ==============================================================================

-- 1. Create the tour_enquiries table if it doesn't already exist
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

-- 2. Indexes for fast query performance
create index if not exists idx_tour_enquiries_created_at on public.tour_enquiries(created_at desc);
create index if not exists idx_tour_enquiries_email on public.tour_enquiries(email);
create index if not exists idx_tour_enquiries_status on public.tour_enquiries(status);

-- 3. Enable Row Level Security (RLS)
alter table public.tour_enquiries enable row level security;

-- 4. RLS Policy: Public visitors (anon and authenticated) can submit enquiries
drop policy if exists "Public can submit tour enquiries" on public.tour_enquiries;
create policy "Public can submit tour enquiries"
  on public.tour_enquiries for insert
  to anon, authenticated
  with check (true);

-- 5. RLS Policy: STRICT SECURITY - Public visitors CANNOT read enquiries!
-- Only authenticated admins or service-role can view customer enquiries
drop policy if exists "Admins can view tour enquiries" on public.tour_enquiries;
create policy "Admins can view tour enquiries"
  on public.tour_enquiries for select
  to authenticated
  using (
    -- If using public.admins table:
    exists (select 1 from public.admins where id = auth.uid())
    -- Or if using auth.jwt app_metadata role:
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- 6. RLS Policy: Only admins can update enquiry status or details
drop policy if exists "Admins can update tour enquiries" on public.tour_enquiries;
create policy "Admins can update tour enquiries"
  on public.tour_enquiries for update
  to authenticated
  using (
    exists (select 1 from public.admins where id = auth.uid())
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- 7. RLS Policy: Only admins can delete enquiries
drop policy if exists "Admins can delete tour enquiries" on public.tour_enquiries;
create policy "Admins can delete tour enquiries"
  on public.tour_enquiries for delete
  to authenticated
  using (
    exists (select 1 from public.admins where id = auth.uid())
    or (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
