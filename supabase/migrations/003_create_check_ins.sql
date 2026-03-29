-- Migration 003: Create check_ins table
create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null default current_date,
  -- Mood & mental
  mood int check (mood between 1 and 5),
  anxiety int check (anxiety between 0 and 10),
  -- Sleep
  sleep_hours numeric(4,1),
  sleep_quality int check (sleep_quality between 1 and 5),
  fatigue int check (fatigue between 1 and 5),
  -- Physical
  pain int check (pain between 0 and 10),
  pain_location text,
  walk_ability int check (walk_ability between 1 and 5),
  -- Social support
  partner_support int check (partner_support between 1 and 5),
  family_support int check (family_support between 1 and 5),
  colleague_support int check (colleague_support between 1 and 5),
  -- Role transition
  readiness int check (readiness between 1 and 5),
  hardest_tag text,
  created_at timestamptz not null default now(),
  -- One check-in per user per day
  unique(user_id, date)
);

-- Enable RLS
alter table public.check_ins enable row level security;

-- Users can only read/write their own check-ins
create policy "Users can read own check-ins"
  on public.check_ins
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own check-ins"
  on public.check_ins
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own check-ins"
  on public.check_ins
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Clinics CANNOT see raw check_ins — by design (data privacy rule)
-- Service role full access (for server-side processing only)
create policy "Service role full access on check_ins"
  on public.check_ins
  for all
  to service_role
  using (true)
  with check (true);
