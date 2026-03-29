-- Migration 008: Align check_ins with STORK 4-domain model
--
-- STORK domains mapped to columns:
--   Domain 1 (Physical):            pain (0-10), physical_function (1-5)
--   Domain 2 (Mental & Emotional):  mood (1-5), anxiety (1-5), hopelessness (1-5)
--   Domain 3 (Motherhood & Support): support (1-5), baby_care_confidence (1-5)
--   Domain 4 (Sleep & Fatigue):     sleep_quality (1-5), fatigue (1-5)
--   Qualitative:                    hardest_tag (text)

-- Drop columns that no longer map to the condensed STORK check-in
alter table public.check_ins
  drop column if exists sleep_hours,
  drop column if exists pain_location,
  drop column if exists walk_ability,
  drop column if exists partner_support,
  drop column if exists family_support,
  drop column if exists colleague_support,
  drop column if exists readiness;

-- Narrow anxiety from 0-10 to 1-5 to match Likert scale
alter table public.check_ins
  drop constraint if exists check_ins_anxiety_check;
alter table public.check_ins
  add constraint check_ins_anxiety_check check (anxiety between 1 and 5);

-- Add STORK-grounded columns
alter table public.check_ins
  add column if not exists hopelessness int check (hopelessness between 1 and 5),
  add column if not exists physical_function int check (physical_function between 1 and 5),
  add column if not exists support int check (support between 1 and 5),
  add column if not exists baby_care_confidence int check (baby_care_confidence between 1 and 5);

-- Add column comments for clinical traceability
comment on column public.check_ins.mood is 'STORK Domain 2 — mood (1=worst, 5=best). EPDS items 1-2 proxy.';
comment on column public.check_ins.anxiety is 'STORK Domain 2 — worry/anxiety intensity (1=none, 5=constant). EPDS items 4-5 proxy.';
comment on column public.check_ins.hopelessness is 'STORK Domain 2 — hopelessness/worthlessness (1=none, 5=extreme). EPDS items 9-10 proxy. >=4 triggers immediate PPD flag.';
comment on column public.check_ins.pain is 'STORK Domain 1 — pain interference NRS (0=none, 10=worst).';
comment on column public.check_ins.physical_function is 'STORK Domain 1 — ability to do usual activities (1=unable, 5=fully).';
comment on column public.check_ins.sleep_quality is 'STORK Domain 4 — subjective sleep quality (1=terrible, 5=great).';
comment on column public.check_ins.fatigue is 'STORK Domain 4 — current fatigue level (1=energized, 5=exhausted).';
comment on column public.check_ins.support is 'STORK Domain 3 — perceived social support (1=very alone, 5=very supported).';
comment on column public.check_ins.baby_care_confidence is 'STORK Domain 3 — confidence caring for baby (1=not confident, 5=very confident).';
comment on column public.check_ins.hardest_tag is 'Qualitative tag — feeds voice probe model and LLM daily summaries.';
