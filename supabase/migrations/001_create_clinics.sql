-- Migration 001: Create clinics table
create table public.clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_email text not null unique,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.clinics enable row level security;

-- Only service role can manage clinics
create policy "Service role full access on clinics"
  on public.clinics
  for all
  to service_role
  using (true)
  with check (true);
