-- Migration 006: Create daily_summaries table
create table public.daily_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  date date not null default current_date,
  -- Sugar-coated version shown to the woman (warm, supportive friend tone)
  user_summary text,
  -- Unfiltered clinical version shown only to the provider
  clinical_summary text,
  created_at timestamptz not null default now(),
  unique(user_id, date)
);

-- Enable RLS
alter table public.daily_summaries enable row level security;

-- Users can only read their own user_summary (never clinical_summary)
create policy "Users can read own user summary"
  on public.daily_summaries
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Clinics can read clinical_summary for their patients (never user_summary)
create policy "Clinics can read clinical summaries for their patients"
  on public.daily_summaries
  for select
  to authenticated
  using (
    exists (
      select 1 from public.users u
      join public.users clinician on clinician.clinic_id = u.clinic_id
      where u.id = daily_summaries.user_id
        and clinician.id = auth.uid()
        and auth.uid() != daily_summaries.user_id
    )
  );

-- Users can insert their own daily summaries (client-side after check-in)
create policy "Users can insert own daily summaries"
  on public.daily_summaries
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update their own daily summaries (upsert on redo)
create policy "Users can update own daily summaries"
  on public.daily_summaries
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Service role full access (LLM generation happens server-side)
create policy "Service role full access on daily_summaries"
  on public.daily_summaries
  for all
  to service_role
  using (true)
  with check (true);
