# ReEntry — Build Planner

> **Canonical check-in UI**: `techstars/src/components/home/daily-survey.tsx` is the single source of truth for the daily check-in survey. All check-in UI edits go there. The old single-question mood picker (removed from `checkin.tsx`) should only be used as a historical reference — do NOT recreate it.

Steps are ordered to front-load design decisions, then infrastructure, then features. The voice model is intentionally last.

---

## Step 1 — Redesign Mobile App UI ✅ DONE

**Goal**: Rebrand Vela → ReEntry. Replace dark purple palette with warm rose/cream palette. All screens should feel like a premium wellness journal.

**Scope**:
- [x] Mock all key screens in Paper MCP first (home, check-in, recovery score, summary, onboarding)
- [x] Update `theme.ts` with the ReEntry color palette (rose/cream/blush/taupe)
- [x] Update `vela-colors.ts` — added `ReEntryColors` object, updated `OrbColors` to warm palette, changed `APP_BACKGROUND` to `#FAF7F4`
- [x] Redesign home screen (`(conversation)/index.tsx`) — recovery score SVG ring, daily reflection card, check-in/voice action buttons, calendar section
- [x] Redesign daily survey (`daily-survey.tsx`) — same questions, warm styling applied
- [x] Redesign onboarding screens — 7 screens redesigned/created: Welcome (brand splash), About You (clinical intake), Clinic Code, Return to Work, Notifications, Calendar, First Conversation (You're Ready)
- [x] Redesign voice screen — warm gradient background, orb, close/stop buttons, minimal UI
- [x] Added 4 new tabs: Home, Check-in (mood selection), Journal (historical reflections), Profile (user info + settings)
- [x] Created 6 new state fields in `app-state.ts`: `weeksPostpartum`, `deliveryType`, `feedingMethod`, `clinicCode`, `returnToWorkDate`, `workSetup`
- [ ] Update app name "Vela" → "ReEntry" throughout (`app.json`, copy, etc.) — defer to later

**Design rules**: See `.cursor/rules/ui-design.md`

**Build status**: TypeScript ✅ 0 errors (excluding pre-existing `survey-state.ts`), ESLint ✅ 0 errors

---

## Step 2 — Design Clinic Dashboard UI ✅ DONE

**Goal**: Design the web-facing clinic dashboard before building it. Clean, information-dense, light mode.

**Scope**:
- [x] Mock all dashboard screens in Paper MCP first — 5 artboards (D1–D5) at 1440×900
- [x] Patient panel: list view with recovery score trend, flag indicators, last check-in date
- [x] Individual patient detail view: score breakdown, 30-day trend chart, flag history
- [x] Smart alert view: why flagged + differential + suggested action
- [x] Doctor daily summary view: clinical panel summary for the day
- [x] Weekly summary email template design

**Design rules**: See `.cursor/rules/ui-design.md` — same palette, Tailwind, light mode default

---

## Step 3 — Supabase Setup ✅ DONE

**Goal**: Set up the database backend that both apps share.

**Scope**:
- [x] Create Supabase project (`rrtmadpuvryvohzkdmex`)
- [x] Set up Supabase MCP in Cursor (`~/.cursor/mcp.json` — restart Cursor to activate)
- [x] Define schema — all 6 tables created via SQL migrations in `supabase/migrations/`:
  - `clinics` (id, name, contact_email, created_at)
  - `users` (id, clinic_id, weeks_postpartum, delivery_type, feeding_method, return_to_work_date, work_setup, created_at)
  - `check_ins` (id, user_id, date, mood, anxiety, sleep_hours, sleep_quality, fatigue, pain, pain_location, walk_ability, partner_support, family_support, colleague_support, readiness, hardest_tag, created_at)
  - `recovery_scores` (id, user_id, date, overall_score, physical_score, mental_score, sleep_score, voice_adjustment, created_at)
  - `flags` (id, user_id, type, severity, reason, differential, suggested_action, resolved_at, created_at)
  - `daily_summaries` (id, user_id, date, user_summary, clinical_summary, created_at)
- [x] Set up Row Level Security policies on all tables (data privacy layer — F9)
  - Patients: read/write own rows only; cannot see flags or clinical_summary
  - Clinics: read recovery_scores, flags, clinical_summary for linked patients only — never raw check_ins
  - Service role: full access for server-side LLM processing
- [x] Configure Auth trigger: auto-creates `users` row on signup
- [x] `is_clinician()` helper function added for role-based access

---

## Step 4 — Railway Setup (partially done)

**Goal**: Deploy the Next.js dashboard to Railway.

**Scope**:
- [x] Initialize Next.js app at `/dashboard` in the repo — Next.js 16.2.1 + Tailwind v4 + TypeScript
- [x] Build all 5 dashboard screens with mock data (Patient Panel, Patient Detail, Smart Alerts, Daily Summary, Weekly Email)
- [x] ReEntry design system: Instrument Serif + DM Sans fonts, warm rose/cream palette via Tailwind `@theme`
- [x] 8 shared components: Sidebar, StatCard, PatientTable, ScoreBadge, Sparkline, StatusDot, TrendChart, FlagHistory
- [x] Build passes with 0 TypeScript errors, 0 ESLint errors
- [ ] Configure Railway project pointing to `/dashboard` folder
- [ ] Set environment variables (Supabase URL, anon key, service key)
- [ ] Verify build + deploy pipeline
- [ ] Set up basic auth protection for clinic routes
- [ ] Replace mock data with live Supabase queries

---

## Step 5 — F1: Onboarding (Clinical) ✅ DONE

**Goal**: Repurpose the existing 7-step onboarding flow for clinical postpartum intake.

**Scope**:
- [x] Replace generic "about you" questions with STORK-grounded intake: weeks postpartum, delivery type, feeding method, sleep situation, return-to-work date (`about-you.tsx` already built)
- [x] Add clinic code entry — links patient to clinic account (`clinic-code.tsx` already built)
- [x] Save clinical data to Supabase on completion — wired in `first-conversation.tsx` `handleStartCheckIn`:
  - Anonymous sign-in via `supabase.auth.signInAnonymously()` — creates a real user ID with no credentials required
  - Upserts `users` table row with all clinical intake fields
  - Fails gracefully offline — user continues, data syncs when reconnected
- [x] `src/lib/supabase.ts` — Supabase client created
- [x] `src/services/supabase/user-service.ts` — `signInAnonymously()` + `saveUserProfile()` 
- [x] `supabaseUserId` added to `app-state.ts` (persisted to AsyncStorage)
- [x] Remove Google Calendar prompt from required step (make optional, move to settings) — `calendar.tsx` already optional

---

## Step 6 — F2: Daily Check-in Survey (STORK-Grounded + Wired to Backend) ✅ DONE

**Goal**: Redesign the survey to be grounded in the STORK 4-domain model (JAMA Network Open, April 2025), wire to Supabase, and add completion state.

**Scope**:
- [x] Redesigned 15-question survey → 10-item STORK-grounded check-in (~60 seconds)
  - Domain 1 (Physical): pain NRS 0–10, physical function 1–5
  - Domain 2 (Mental & Emotional): mood 1–5 emoji, anxiety 1–5, hopelessness 1–5 (EPDS proxy — ≥4 triggers immediate PPD flag)
  - Domain 3 (Motherhood & Support): perceived support 1–5, baby care confidence 1–5
  - Domain 4 (Sleep & Fatigue): sleep quality 1–5, fatigue 1–5
  - Qualitative: "What's hardest right now?" single tag (feeds voice probe model)
- [x] Created `checkin-service.ts` — `saveCheckIn()` upserts to Supabase `check_ins` table (offline-graceful), `getCheckInForDate()` for retrieval
- [x] Created migration `008_alter_check_ins_stork.sql` — dropped 7 old columns, added 4 STORK-aligned columns (`hopelessness`, `physical_function`, `support`, `baby_care_confidence`), narrowed `anxiety` to 1–5
- [x] Updated `survey-state.ts` — removed `roleTransition` category, 5 remaining categories map to STORK domains
- [x] New `computeSurveyScores` maps raw answers → 5 Zustand scores (0–100 scale) with proper inverse scaling for negative indicators
- [x] Added "already completed today" state with summary view (score bars per domain + "Redo check-in")
- [x] Save flow: Zustand local (offline-first) → Supabase `check_ins` (best-effort async)
- [x] Fixed mood chip layout — 5 options now fit in a single even row (`flex: 1` instead of fixed width)
- [x] Trigger recovery score calculation on save (implemented in Step 7)

**Build status**: TypeScript ✅ 0 new errors (1 pre-existing in `survey-state.ts`), Biome ✅ 0 errors on changed files

---

## Step 7 — F3: Recovery Score ✅ DONE

**Goal**: Replace flat average `computeOverallWellbeing` with STORK-grounded dynamic weighting.

**Research finding**: STORK (JAMA Network Open, April 2025) does not prescribe explicit domain weights — it uses equal-weight scoring across 47 items. However, the multicenter assessment paper shows Physical + Sleep improve continuously through week 12 while Mental + Support plateau at week 6. This justifies dynamic weighting that upweights mental early and shifts toward physical/sleep later.

**Scope**:
- [x] Implemented 5-category dynamic weights based on `weeksPostpartum` from user profile
  - Weeks 0–6: moodDepression 25%, anxiety 15%, sleepFatigue 25%, physicalRecovery 20%, socialSupport 15%
  - Weeks 6–12+: moodDepression 15%, anxiety 10%, sleepFatigue 25%, physicalRecovery 35%, socialSupport 15%
- [x] Created `src/services/recovery-score-service.ts` — pure computation, returns `{ overall, physical, mental, sleep, support }` all 0–100
- [x] Display composite score (0–100) on home screen recovery ring (replaced flat average)
- [x] Show 4 sub-score bars (Physical / Mental / Sleep / Support) below progress card on home screen
- [x] Updated journal to use weighted scoring instead of flat average
- [x] Save computed score to `recovery_scores` table in Supabase via `recovery-score-supabase.ts`
- [x] Created `src/services/flag-service.ts` — PPD flag detection with 4 rules:
  - Hopelessness ≥ 4/5 → immediate urgent flag
  - Mood ≤ 40/100 for 3+ consecutive days → high-severity PPD risk
  - Mood declining 5+ days → high-severity escalation
  - Sleep + mood declining together → urgent co-decline flag
- [x] Flags saved to `flags` table in Supabase after each check-in
- [x] Wired into daily survey save flow: check-in → recovery score → flag detection (all Supabase writes best-effort async)
- [x] `computeOverallWellbeing` marked deprecated; kept for backward compat in `formatRecentSurveyContext`

**Build status**: TypeScript ✅ 0 errors, Biome ✅ 0 errors on all changed files

---

## Step 8 — F4: User Daily Summary (Sugar-coated)

**Goal**: LLM-generated daily recap shown to the woman after check-in. Warm, encouraging tone.

**Scope**:
- [ ] After check-in saves, call Groq with survey scores + last 7 days history
- [ ] Prompt: warm supportive friend tone, acknowledge effort, note progress, give one actionable tip
- [ ] Display as a "Today's reflection" card on home screen
- [ ] Save to `daily_summaries.user_summary` in Supabase
- [ ] Make historical summaries browsable ("Progress journal" view)

---

## Step 9 — F5: GCal Stress Forecasting

**Goal**: Use real Google Calendar data to send personalized break recommendations.

**Scope**:
- [ ] Swap `getMockEvents` for real Google Calendar API call using stored `googleAccessToken`
- [ ] Morning notification logic: fetch today's calendar → pass to LLM with recovery score → generate recommendation
- [ ] Notification format: "Your day looks busy. Between [2pm–3pm] you have a gap — I'd suggest a 10-min walk to decompress before [3pm meeting]"
- [ ] Recommendation calibrated to recovery score (lower score = more conservative)
- [ ] Fallback gracefully if no Google token is present

---

## Step 10 — F6: Clinic Dashboard — Patient Panel

**Goal**: Build the Next.js clinic dashboard patient panel view.

**Scope**:
- [ ] Auth: clinic login (Supabase auth, clinic role)
- [ ] Patient list: anonymized (Patient 1, Patient 2...), weeks PP, recovery score, 7-day trend sparkline, last check-in date
- [ ] Color-coded status: green (on track), amber (watch), red (needs follow-up)
- [ ] Click through to individual patient detail view
- [ ] Real-time updates via Supabase Realtime when new check-ins arrive

---

## Step 11 — F7: Doctor Daily Summary (Clinical)

**Goal**: Unfiltered clinical summary for the provider.

**Scope**:
- [ ] After each patient check-in, generate clinical summary via Groq
- [ ] Prompt: clinical, factual, no softening — list scores, trends, red flags, risk indicators
- [ ] Display in patient detail view on dashboard
- [ ] Include in weekly summary push (Monday email/notification to provider)

---

## Step 12 — F8: Smart Doctor Alerts

**Goal**: When a flag fires, give the doctor a clinical brief — not just a ping.

**Scope**:
- [ ] Alert contains: triggered pattern ("mood ≤2/5 for 4 consecutive days"), differential ("Possible PPD, sleep deprivation masking as depression, postpartum anxiety"), suggested action ("Schedule a 15-min phone check-in, consider EPDS screening")
- [ ] Alert card in dashboard with severity indicator
- [ ] "Mark resolved" action on each alert
- [ ] Notification to clinic (email or push) for high-severity flags

---

## Step 13 — F9: Data Privacy / RLS

**Goal**: Enforce the data firewall at the database level. This should actually be set up in Step 3 alongside the schema, but the full audit and tightening happens here.

**Scope**:
- [ ] Audit all Supabase RLS policies
- [ ] Patient: can only read/write their own rows
- [ ] Clinic: can read `recovery_scores` and `flags` for patients linked to their clinic — never raw `check_ins`
- [ ] Anonymization: clinic queries return patient IDs only, never PII
- [ ] Service role (server-side only) for generating summaries and alerts

---

## Step 14 — F10: Voice Probe Model (LAST)

**Goal**: After the daily survey, trigger a voice conversation that probes for discrepancies between reported scores and vocal patterns.

**Scope**:
- [ ] Post-survey flow: "Would you like to talk through today's check-in?" → triggers voice session
- [ ] System prompt includes today's survey scores and instructs LLM to probe for inconsistencies
- [ ] Groq Whisper called with `verbose_json` → extract word timestamps → compute speaking rate
- [ ] LLM cross-references: slow speech + high mood score → probe deeper
- [ ] If discrepancy detected: adjust recovery score, add note to clinical summary, consider flag
- [ ] Baseline speaking rate stored per user (first 3 sessions) for personalized comparison
