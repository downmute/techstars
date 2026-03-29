-- Migration 004: Create recovery_scores table
create table public.recovery_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null default current_date,
  -- STORK-grounded composite score (0-100)
  overall_score numeric(5,2) check (overall_score between 0 and 100),
  physical_score numeric(5,2) check (physical_score between 0 and 100),
  mental_score numeric(5,2) check (mental_score between 0 and 100),
  sleep_score numeric(5,2) check (sleep_score between 0 and 100),
  -- Voice session adjustment (applied if voice discrepancy detected)
  voice_adjustment numeric(5,2) default 0,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

-- Enable RLS
alter table public.recovery_scores enable row level security;

-- Users can read their own scores
create policy "Users can read own recovery scores"
  on public.recovery_scores
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Clinic users can read recovery_scores for patients linked to their clinic
-- (clinic_id match via users table — never raw check_ins)
create policy "Clinics can read patient recovery scores"
  on public.recovery_scores
  for select
  to authenticated
  using (
    exists (
      select 1 from public.users u
      join public.users clinician on clinician.clinic_id = u.clinic_id
      where u.id = recovery_scores.user_id
        and clinician.id = auth.uid()
        and auth.uid() != recovery_scores.user_id
    )
  );

-- Service role full access
create policy "Service role full access on recovery_scores"
  on public.recovery_scores
  for all
  to service_role
  using (true)
  with check (true);
