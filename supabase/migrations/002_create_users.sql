-- Migration 002: Create users table
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  clinic_id uuid references public.clinics(id) on delete set null,
  weeks_postpartum int,
  delivery_type text check (delivery_type in ('vaginal', 'c-section')),
  feeding_method text check (feeding_method in ('breastfeeding', 'formula', 'mixed')),
  return_to_work_date date,
  work_setup text check (work_setup in ('in-office', 'hybrid', 'remote')),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.users enable row level security;

-- Users can read/update their own row
create policy "Users can read own profile"
  on public.users
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.users
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.users
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Service role full access
create policy "Service role full access on users"
  on public.users
  for all
  to service_role
  using (true)
  with check (true);
