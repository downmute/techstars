# ReEntry — Project Context

> **UI Rule**: Before writing any UI code, always mock the design in Paper MCP first. See `.cursor/rules/ui-design.md` for the full design system.

---

## What We're Building

**ReEntry** is a postpartum recovery platform that turns daily health data into personalized action plans, helping women return to work successfully while giving clinics visibility into recovery between visits.

### Who pays / who uses it

| Role | Who |
|---|---|
| Primary buyer | Small OB/GYN clinics + certified postpartum practitioners |
| User | Postpartum women (free through their clinic) |
| Scale play | Employers (phase 2 — not MVP) |

### The data rule (non-negotiable)
Individual health data belongs to the woman only. Clinics see recovery trends and flags for their patient panel — never raw data. Employers (phase 2) see only retention outcomes, never health states. Enforced at the database level via Supabase Row Level Security.

---

## Two Products, One Backend

```
Mobile App (ReEntry)              Web Dashboard (Clinic)
─────────────────────             ─────────────────────
techstars/techstars/              techstars/dashboard/
Expo Router + React Native        Next.js (standalone)
Maria's world                     Dr. Kim's world
```

Both point to the same Supabase PostgreSQL backend hosted externally. The Next.js dashboard is deployed on Railway.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile app | Expo SDK 55, Expo Router, React Native, TypeScript |
| Web dashboard | Next.js (to be created at `/dashboard`) |
| State (mobile) | Zustand + AsyncStorage persistence |
| Backend / DB | Supabase (PostgreSQL + Auth + Row Level Security) |
| Hosting | Railway (Next.js dashboard) + Supabase (DB) |
| LLM | Groq (`llama-3.3-70b-versatile`) via streaming API |
| STT | Parakeet ONNX (on-device) + Groq Whisper fallback |
| TTS | PocketTTS ONNX (on-device) + expo-speech fallback |
| Search | Exa API |
| Auth | Google OAuth (expo-auth-session) for user calendar scope |

---

## Recovery Score — Clinical Grounding

Based on the **STORK (Stanford Obstetric Recovery Checklist)** published in *JAMA Network Open*, April 2025. STORK measures four domains: Physical health, Mental/emotional health, Motherhood experience & social support, Sleep & fatigue.

**Dynamic weighting by weeks postpartum** (STORK finding: mental health volatility peaks in weeks 0–6, physical/sleep improve continuously through week 12):

| Weeks Postpartum | Physical | Mental | Sleep |
|---|---|---|---|
| 0–6 | 25% | 45% | 30% |
| 6–12 | 40% | 25% | 35% |

**PPD flagging (EPDS-grounded proxy)**:
- Mood ≤ 2/5 for 3+ consecutive days → PPD risk flag
- Mood + energy declining 5+ days → escalate
- Sleep declining + mood declining together → highest priority
- Any "hopeless / not worth it" language in transcript → immediate flag

---

## Voice Model — Survey → Conversation → Discrepancy Detection

The acoustic underreporting detection approach:
1. User fills structured survey (6 domains, under 60 seconds)
2. Voice conversation begins — LLM is prompted with her survey scores
3. LLM probes for discrepancies ("You said 4/5 mood — how are you feeling about Monday?")
4. Groq Whisper `verbose_json` provides word-level timestamps → speaking rate computed
5. LLM cross-references: slow speech + positive survey scores = flag discrepancy
6. Recovery score is adjusted; if significant mismatch → clinic flag

Research basis: 2025 cross-sectional study (n=204) showed voice analysis achieved 100% sensitivity for detecting at-risk postpartum women, outperforming EPDS.

---

## Calendar Stress Forecasting

Already 70% built in the codebase:
- Google OAuth with `calendar.readonly` scope exists in `sign-in.tsx`
- `CalendarEvent` type defined
- Mock calendar data in `calendar-mock.ts` feeding the LLM

Remaining: swap `getMockEvents` for real Google Calendar API. Then add morning notification logic: LLM analyzes day density + current recovery score → generates personalized break recommendation.

---

## Existing Codebase State (post friend's changes — March 29, 2026)

The friend's commit (`feat: added voice agent and surveys`) added:
- **`daily-survey.tsx`** — full multi-section survey: mood (emoji 1-5), anxiety (0-10), sleep/fatigue (hours, quality, fatigue), physical recovery (pain, location, walk ability), social support (partner/family/colleagues), role transition (readiness, hardest challenge)
- **`wellbeing-chart.tsx`** — SVG line chart with 1W/1M/3M/6M views, gradient fill
- **`survey-state.ts`** — Zustand store with 6 score categories: `moodDepression`, `anxiety`, `sleepFatigue`, `physicalRecovery`, `socialSupport`, `roleTransition`
- **Home screen** (`(conversation)/index.tsx`) — Voice agent card + wellbeing chart + daily survey
- **Voice screen** (`(conversation)/voice.tsx`) — Dedicated voice check-in tab

Current color scheme is dark purple/indigo — **this needs to be replaced** with the warm rose/cream ReEntry palette.

---

## Feature List

| # | Feature | Surface | Notes |
|---|---|---|---|
| F1 | Onboarding (clinical) | Mobile | Repurpose existing 7-step flow for postpartum questions |
| F2 | Daily check-in survey | Mobile | Already built — needs ReEntry styling overhaul |
| F3 | Recovery Score | Mobile | STORK-grounded, dynamic weights, 0-100 display |
| F4 | User daily summary | Mobile | LLM-generated, sugar-coated, supportive friend tone |
| F5 | GCal stress forecasting | Mobile | 70% built — swap mock → real API + notification logic |
| F6 | Clinic dashboard patient panel | Web | Anonymized list, score trends, color-coded flags |
| F7 | Doctor daily summary | Web | Clinical, unfiltered LLM summary per patient |
| F8 | Smart doctor alerts | Web | Why flagged + differential + suggested next step |
| F9 | Data privacy / RLS | Backend | Supabase Row Level Security policies |
| F10 | Voice probe model | Mobile | Survey → LLM probe → discrepancy detection — **LAST** |

---

## Progress

| # | Feature | Status | Notes |
|---|---|---|---|
| UI | Mobile app redesign (ReEntry rebrand + warm palette) | ✅ Done | Warm rose/cream palette, premium wellness journal feel |
| UI | Clinic dashboard UI design | ✅ Done | 5 artboards in Paper MCP, light mode |
| Infra | Supabase project + schema | ✅ Done | 6 tables, RLS policies, auth trigger |
| Infra | Railway setup (Next.js dashboard) | 🟡 In progress | Next.js app built with mock data, deployment pending |
| F1 | Onboarding (clinical) | ✅ Done | STORK intake, clinic code, anonymous Supabase auth |
| F2 | Daily check-in survey | ✅ Done | STORK-grounded 10-item check-in, wired to Supabase, completion state added |
| F3 | Recovery Score | ✅ Done | STORK-grounded 5-category dynamic weighting + PPD flag detection + Supabase persistence |
| F4 | User daily summary | ✅ Done | Groq LLM warm recap, fire-and-forget, Supabase + Zustand persistence |
| F5 | GCal stress forecasting | ✅ Done | Real Google Calendar API, LLM break recommendations, recovery-calibrated, break notification |
| F6 | Clinic dashboard patient panel | ✅ Done | Auth, RPCs, real-time updates, anonymized patient list |
| F7 | Doctor daily summary | ✅ Done | Clinical LLM summary per patient, wired to dashboard daily/weekly/detail pages |
| F8 | Smart doctor alerts | ✅ Done | Live Supabase alerts, resolve action, real-time, severity filters |
| F9 | Data privacy / RLS | ✅ Done | Clinician role guards on all policies + RPCs, column-level leak fix, resolve_clinic_code RPC |
| F10 | Voice probe model | ⬜ Not started | Intentionally last |
