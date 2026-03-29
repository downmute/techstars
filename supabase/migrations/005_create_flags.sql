-- Migration 005: Create flags table
create table public.flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('ppd_risk', 'mood_decline', 'sleep_decline', 'language_alert', 'voice_discrepancy')),
  severity text not null check (severity in ('low', 'medium', 'high', 'urgent')),
  reason text not null,
  differential text,
  suggested_action text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.flags enable row level security;

-- Patients cannot read their own flags (clinical-only view)
-- Clinic users can read flags for their patients
create policy "Clinics can read flags for their patients"
  on public.flags
  for select
  to authenticated
  using (
    exists (
      select 1 from public.users u
      join public.users clinician on clinician.clinic_id = u.clinic_id
      where u.id = flags.user_id
        and clinician.id = auth.uid()
        and auth.uid() != flags.user_id
    )
  );

-- Clinics can mark flags as resolved
create policy "Clinics can update flags for their patients"
  on public.flags
  for update
  to authenticated
  using (
    exists (
      select 1 from public.users u
      join public.users clinician on clinician.clinic_id = u.clinic_id
      where u.id = flags.user_id
        and clinician.id = auth.uid()
        and auth.uid() != flags.user_id
    )
  );

-- Service role full access (flag generation happens server-side)
create policy "Service role full access on flags"
  on public.flags
  for all
  to service_role
  using (true)
  with check (true);
