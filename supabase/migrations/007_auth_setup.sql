-- Migration 007: Auth setup — user role metadata
-- When a user signs up, auto-create their public.users row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Role enum used in app metadata
-- Patients: auth.users.raw_user_meta_data->>'role' = 'patient'
-- Clinicians: auth.users.raw_user_meta_data->>'role' = 'clinician'
-- This is set at sign-up time and used for RLS policy checks

-- Helper function: returns true if current user is a clinician
create or replace function public.is_clinician()
returns boolean
language sql
security definer
as $$
  select coalesce(
    (select raw_user_meta_data->>'role' = 'clinician'
     from auth.users
     where id = auth.uid()),
    false
  );
$$;
