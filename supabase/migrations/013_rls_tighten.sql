-- Migration 013: RLS tightening — enforce clinician role checks, fix column-level
-- leaks on daily_summaries, add resolve_clinic_code RPC, add patient-facing
-- summary RPCs.
--
-- Addresses:
--   1. CRITICAL: clinic RLS policies + RPCs missing is_clinician() guard
--   2. HIGH:     daily_summaries SELECT exposes clinical_summary to patients
--   3. MEDIUM:   clinics table inaccessible to patients (resolveClinicId fails)
--   4. LOW:      is_clinician() missing SET search_path

-- ============================================================================
-- 0. Fix is_clinician() — add SET search_path = public
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_clinician()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT coalesce(
    (SELECT raw_user_meta_data->>'role' = 'clinician'
     FROM auth.users
     WHERE id = auth.uid()),
    false
  );
$$;


-- ============================================================================
-- 1. Tighten clinic-facing RLS policies — add is_clinician() guard
-- ============================================================================

-- Helper: checks if the calling user is in the same clinic as p_user_id.
-- SECURITY DEFINER so the internal query on public.users bypasses RLS,
-- preventing infinite recursion when used inside the users table's own policy.
CREATE OR REPLACE FUNCTION public.is_same_clinic(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users caller
    CROSS JOIN public.users target
    WHERE caller.id = auth.uid()
      AND target.id = p_user_id
      AND caller.clinic_id IS NOT NULL
      AND caller.clinic_id = target.clinic_id
      AND caller.id != target.id
  );
$$;

-- --- users: "Clinics can read patient profiles" ---
DROP POLICY IF EXISTS "Clinics can read patient profiles" ON public.users;
CREATE POLICY "Clinics can read patient profiles"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    public.is_clinician()
    AND public.is_same_clinic(users.id)
  );

-- --- recovery_scores: "Clinics can read patient recovery scores" ---
DROP POLICY IF EXISTS "Clinics can read patient recovery scores" ON public.recovery_scores;
CREATE POLICY "Clinics can read patient recovery scores"
  ON public.recovery_scores
  FOR SELECT
  TO authenticated
  USING (
    public.is_clinician()
    AND public.is_same_clinic(recovery_scores.user_id)
  );

-- --- flags: "Clinics can read flags for their patients" ---
DROP POLICY IF EXISTS "Clinics can read flags for their patients" ON public.flags;
CREATE POLICY "Clinics can read flags for their patients"
  ON public.flags
  FOR SELECT
  TO authenticated
  USING (
    public.is_clinician()
    AND public.is_same_clinic(flags.user_id)
  );

-- --- flags: "Clinics can update flags for their patients" ---
DROP POLICY IF EXISTS "Clinics can update flags for their patients" ON public.flags;
CREATE POLICY "Clinics can update flags for their patients"
  ON public.flags
  FOR UPDATE
  TO authenticated
  USING (
    public.is_clinician()
    AND public.is_same_clinic(flags.user_id)
  );

-- --- daily_summaries: "Clinics can read clinical summaries for their patients" ---
DROP POLICY IF EXISTS "Clinics can read clinical summaries for their patients" ON public.daily_summaries;
CREATE POLICY "Clinics can read clinical summaries for their patients"
  ON public.daily_summaries
  FOR SELECT
  TO authenticated
  USING (
    public.is_clinician()
    AND public.is_same_clinic(daily_summaries.user_id)
  );


-- ============================================================================
-- 2. Fix daily_summaries column-level leak — remove patient SELECT policy,
--    replace with RPCs that return only user_summary.
-- ============================================================================

DROP POLICY IF EXISTS "Users can read own user summary" ON public.daily_summaries;

-- Patient-facing RPC: get a single day's user_summary (never clinical_summary)
CREATE OR REPLACE FUNCTION public.get_my_daily_summary(p_date date DEFAULT current_date)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_summary text;
BEGIN
  SELECT ds.user_summary INTO v_summary
  FROM public.daily_summaries ds
  WHERE ds.user_id = auth.uid()
    AND ds.date = p_date;

  RETURN v_summary;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_daily_summary(date) TO authenticated;

-- Patient-facing RPC: get recent user_summaries (never clinical_summary)
CREATE OR REPLACE FUNCTION public.get_my_recent_summaries(p_limit int DEFAULT 7)
RETURNS TABLE (
  summary_date date,
  user_summary text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT ds.date AS summary_date, ds.user_summary
  FROM public.daily_summaries ds
  WHERE ds.user_id = auth.uid()
    AND ds.user_summary IS NOT NULL
  ORDER BY ds.date DESC
  LIMIT p_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_recent_summaries(int) TO authenticated;


-- ============================================================================
-- 3. Add resolve_clinic_code RPC — replaces broken direct clinics table access
-- ============================================================================

CREATE OR REPLACE FUNCTION public.resolve_clinic_code(p_code text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinic_id uuid;
BEGIN
  SELECT id INTO v_clinic_id
  FROM public.clinics
  WHERE lower(trim(name)) = lower(trim(p_code));

  RETURN v_clinic_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.resolve_clinic_code(text) TO authenticated;


-- ============================================================================
-- 4. Recreate all dashboard RPCs with is_clinician() guard
-- ============================================================================

-- --- get_patient_panel ---
CREATE OR REPLACE FUNCTION public.get_patient_panel()
RETURNS TABLE (
  patient_id uuid,
  weeks_postpartum int,
  delivery_type text,
  feeding_method text,
  return_to_work_date date,
  overall_score numeric,
  physical_score numeric,
  mental_score numeric,
  sleep_score numeric,
  score_date date,
  active_flags bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinic_id uuid;
BEGIN
  IF NOT public.is_clinician() THEN
    RETURN;
  END IF;

  SELECT u.clinic_id INTO v_clinic_id
  FROM public.users u
  WHERE u.id = auth.uid();

  IF v_clinic_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    u.id AS patient_id,
    u.weeks_postpartum,
    u.delivery_type,
    u.feeding_method,
    u.return_to_work_date,
    rs.overall_score,
    rs.physical_score,
    rs.mental_score,
    rs.sleep_score,
    rs.date AS score_date,
    (SELECT count(*) FROM public.flags f WHERE f.user_id = u.id AND f.resolved_at IS NULL) AS active_flags
  FROM public.users u
  LEFT JOIN LATERAL (
    SELECT r.overall_score, r.physical_score, r.mental_score, r.sleep_score, r.date
    FROM public.recovery_scores r
    WHERE r.user_id = u.id
    ORDER BY r.date DESC
    LIMIT 1
  ) rs ON true
  WHERE u.clinic_id = v_clinic_id
    AND u.id != auth.uid()
  ORDER BY rs.overall_score ASC NULLS LAST;
END;
$$;

-- --- get_patient_trend ---
CREATE OR REPLACE FUNCTION public.get_patient_trend(p_patient_id uuid, p_limit int DEFAULT 7)
RETURNS TABLE (
  score_date date,
  overall_score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinic_id uuid;
  v_patient_clinic uuid;
BEGIN
  IF NOT public.is_clinician() THEN
    RETURN;
  END IF;

  SELECT u.clinic_id INTO v_clinic_id FROM public.users u WHERE u.id = auth.uid();
  SELECT u.clinic_id INTO v_patient_clinic FROM public.users u WHERE u.id = p_patient_id;

  IF v_clinic_id IS NULL OR v_patient_clinic IS NULL OR v_clinic_id != v_patient_clinic THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT r.date AS score_date, r.overall_score
  FROM public.recovery_scores r
  WHERE r.user_id = p_patient_id
  ORDER BY r.date DESC
  LIMIT p_limit;
END;
$$;

-- --- get_patient_detail ---
CREATE OR REPLACE FUNCTION public.get_patient_detail(p_patient_id uuid)
RETURNS TABLE (
  patient_id uuid,
  weeks_postpartum int,
  delivery_type text,
  feeding_method text,
  return_to_work_date date,
  overall_score numeric,
  physical_score numeric,
  mental_score numeric,
  sleep_score numeric,
  score_date date,
  active_flags bigint,
  flag_id uuid,
  flag_type text,
  flag_severity text,
  flag_reason text,
  flag_differential text,
  flag_suggested_action text,
  flag_created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinic_id uuid;
  v_patient_clinic uuid;
BEGIN
  IF NOT public.is_clinician() THEN
    RETURN;
  END IF;

  SELECT u.clinic_id INTO v_clinic_id FROM public.users u WHERE u.id = auth.uid();
  SELECT u.clinic_id INTO v_patient_clinic FROM public.users u WHERE u.id = p_patient_id;

  IF v_clinic_id IS NULL OR v_patient_clinic IS NULL OR v_clinic_id != v_patient_clinic THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    u.id AS patient_id,
    u.weeks_postpartum,
    u.delivery_type,
    u.feeding_method,
    u.return_to_work_date,
    rs.overall_score,
    rs.physical_score,
    rs.mental_score,
    rs.sleep_score,
    rs.date AS score_date,
    (SELECT count(*) FROM public.flags f2 WHERE f2.user_id = u.id AND f2.resolved_at IS NULL) AS active_flags,
    fl.id AS flag_id,
    fl.type AS flag_type,
    fl.severity AS flag_severity,
    fl.reason AS flag_reason,
    fl.differential AS flag_differential,
    fl.suggested_action AS flag_suggested_action,
    fl.created_at AS flag_created_at
  FROM public.users u
  LEFT JOIN LATERAL (
    SELECT r.overall_score, r.physical_score, r.mental_score, r.sleep_score, r.date
    FROM public.recovery_scores r
    WHERE r.user_id = u.id
    ORDER BY r.date DESC
    LIMIT 1
  ) rs ON true
  LEFT JOIN public.flags fl ON fl.user_id = u.id AND fl.resolved_at IS NULL
  WHERE u.id = p_patient_id;
END;
$$;

-- --- get_patient_clinical_summaries ---
CREATE OR REPLACE FUNCTION public.get_patient_clinical_summaries(
  p_patient_id uuid,
  p_limit int DEFAULT 7
)
RETURNS TABLE (
  summary_date date,
  clinical_summary text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinic_id uuid;
  v_patient_clinic uuid;
BEGIN
  IF NOT public.is_clinician() THEN
    RETURN;
  END IF;

  SELECT u.clinic_id INTO v_clinic_id FROM public.users u WHERE u.id = auth.uid();
  SELECT u.clinic_id INTO v_patient_clinic FROM public.users u WHERE u.id = p_patient_id;

  IF v_clinic_id IS NULL OR v_patient_clinic IS NULL OR v_clinic_id != v_patient_clinic THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT ds.date AS summary_date, ds.clinical_summary
  FROM public.daily_summaries ds
  WHERE ds.user_id = p_patient_id
    AND ds.clinical_summary IS NOT NULL
  ORDER BY ds.date DESC
  LIMIT p_limit;
END;
$$;

-- --- get_daily_summary_panel ---
CREATE OR REPLACE FUNCTION public.get_daily_summary_panel(p_date date)
RETURNS TABLE (
  patient_id uuid,
  weeks_postpartum int,
  overall_score numeric,
  physical_score numeric,
  mental_score numeric,
  sleep_score numeric,
  score_delta numeric,
  clinical_summary text,
  active_flags bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinic_id uuid;
BEGIN
  IF NOT public.is_clinician() THEN
    RETURN;
  END IF;

  SELECT u.clinic_id INTO v_clinic_id
  FROM public.users u
  WHERE u.id = auth.uid();

  IF v_clinic_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    u.id AS patient_id,
    u.weeks_postpartum,
    rs.overall_score,
    rs.physical_score,
    rs.mental_score,
    rs.sleep_score,
    (rs.overall_score - COALESCE(prev.overall_score, rs.overall_score)) AS score_delta,
    ds.clinical_summary,
    (SELECT count(*) FROM public.flags f WHERE f.user_id = u.id AND f.resolved_at IS NULL) AS active_flags
  FROM public.users u
  INNER JOIN public.recovery_scores rs
    ON rs.user_id = u.id AND rs.date = p_date
  LEFT JOIN LATERAL (
    SELECT r2.overall_score
    FROM public.recovery_scores r2
    WHERE r2.user_id = u.id AND r2.date < p_date
    ORDER BY r2.date DESC
    LIMIT 1
  ) prev ON true
  LEFT JOIN public.daily_summaries ds
    ON ds.user_id = u.id AND ds.date = p_date
  WHERE u.clinic_id = v_clinic_id
    AND u.id != auth.uid()
  ORDER BY rs.overall_score ASC NULLS LAST;
END;
$$;

-- --- get_weekly_summary ---
CREATE OR REPLACE FUNCTION public.get_weekly_summary(
  p_start_date date,
  p_end_date date
)
RETURNS TABLE (
  patient_id uuid,
  weeks_postpartum int,
  check_in_count bigint,
  avg_score numeric,
  latest_score numeric,
  score_delta numeric,
  flag_count bigint,
  latest_clinical_summary text,
  latest_flag_reason text,
  latest_flag_severity text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinic_id uuid;
BEGIN
  IF NOT public.is_clinician() THEN
    RETURN;
  END IF;

  SELECT u.clinic_id INTO v_clinic_id
  FROM public.users u
  WHERE u.id = auth.uid();

  IF v_clinic_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    u.id AS patient_id,
    u.weeks_postpartum,
    (SELECT count(*) FROM public.recovery_scores r
     WHERE r.user_id = u.id AND r.date BETWEEN p_start_date AND p_end_date) AS check_in_count,
    (SELECT round(avg(r.overall_score), 1) FROM public.recovery_scores r
     WHERE r.user_id = u.id AND r.date BETWEEN p_start_date AND p_end_date) AS avg_score,
    latest_rs.overall_score AS latest_score,
    (latest_rs.overall_score - COALESCE(first_rs.overall_score, latest_rs.overall_score)) AS score_delta,
    (SELECT count(*) FROM public.flags f
     WHERE f.user_id = u.id AND f.created_at >= p_start_date::timestamptz
       AND f.created_at < (p_end_date + 1)::timestamptz) AS flag_count,
    latest_ds.clinical_summary AS latest_clinical_summary,
    latest_fl.reason AS latest_flag_reason,
    latest_fl.severity AS latest_flag_severity
  FROM public.users u
  LEFT JOIN LATERAL (
    SELECT r.overall_score
    FROM public.recovery_scores r
    WHERE r.user_id = u.id AND r.date BETWEEN p_start_date AND p_end_date
    ORDER BY r.date DESC
    LIMIT 1
  ) latest_rs ON true
  LEFT JOIN LATERAL (
    SELECT r.overall_score
    FROM public.recovery_scores r
    WHERE r.user_id = u.id AND r.date BETWEEN p_start_date AND p_end_date
    ORDER BY r.date ASC
    LIMIT 1
  ) first_rs ON true
  LEFT JOIN LATERAL (
    SELECT ds.clinical_summary
    FROM public.daily_summaries ds
    WHERE ds.user_id = u.id AND ds.date BETWEEN p_start_date AND p_end_date
      AND ds.clinical_summary IS NOT NULL
    ORDER BY ds.date DESC
    LIMIT 1
  ) latest_ds ON true
  LEFT JOIN LATERAL (
    SELECT fl.reason, fl.severity
    FROM public.flags fl
    WHERE fl.user_id = u.id AND fl.resolved_at IS NULL
    ORDER BY fl.created_at DESC
    LIMIT 1
  ) latest_fl ON true
  WHERE u.clinic_id = v_clinic_id
    AND u.id != auth.uid()
  ORDER BY latest_rs.overall_score ASC NULLS LAST;
END;
$$;

-- --- get_alerts_panel ---
CREATE OR REPLACE FUNCTION public.get_alerts_panel(
  p_include_resolved boolean DEFAULT false
)
RETURNS TABLE (
  flag_id uuid,
  patient_id uuid,
  flag_type text,
  flag_severity text,
  flag_reason text,
  flag_differential text,
  flag_suggested_action text,
  flag_created_at timestamptz,
  flag_resolved_at timestamptz,
  weeks_postpartum int,
  overall_score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinic_id uuid;
BEGIN
  IF NOT public.is_clinician() THEN
    RETURN;
  END IF;

  SELECT u.clinic_id INTO v_clinic_id
  FROM public.users u
  WHERE u.id = auth.uid();

  IF v_clinic_id IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    f.id          AS flag_id,
    f.user_id     AS patient_id,
    f.type        AS flag_type,
    f.severity    AS flag_severity,
    f.reason      AS flag_reason,
    f.differential AS flag_differential,
    f.suggested_action AS flag_suggested_action,
    f.created_at  AS flag_created_at,
    f.resolved_at AS flag_resolved_at,
    u.weeks_postpartum,
    latest_rs.overall_score
  FROM public.flags f
  INNER JOIN public.users u ON u.id = f.user_id
  LEFT JOIN LATERAL (
    SELECT r.overall_score
    FROM public.recovery_scores r
    WHERE r.user_id = f.user_id
    ORDER BY r.date DESC
    LIMIT 1
  ) latest_rs ON true
  WHERE u.clinic_id = v_clinic_id
    AND u.id != auth.uid()
    AND (
      f.resolved_at IS NULL
      OR (p_include_resolved AND f.resolved_at > now() - interval '7 days')
    )
  ORDER BY
    (f.resolved_at IS NOT NULL) ASC,
    CASE f.severity
      WHEN 'urgent' THEN 0
      WHEN 'high'   THEN 1
      WHEN 'medium' THEN 2
      WHEN 'low'    THEN 3
      ELSE 4
    END ASC,
    f.created_at DESC;
END;
$$;

-- --- resolve_flag ---
CREATE OR REPLACE FUNCTION public.resolve_flag(p_flag_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinic_id uuid;
  v_flag_clinic uuid;
  v_rows int;
BEGIN
  IF NOT public.is_clinician() THEN
    RETURN false;
  END IF;

  SELECT u.clinic_id INTO v_clinic_id
  FROM public.users u
  WHERE u.id = auth.uid();

  SELECT u.clinic_id INTO v_flag_clinic
  FROM public.flags f
  INNER JOIN public.users u ON u.id = f.user_id
  WHERE f.id = p_flag_id;

  IF v_clinic_id IS NULL OR v_flag_clinic IS NULL OR v_clinic_id != v_flag_clinic THEN
    RETURN false;
  END IF;

  UPDATE public.flags
  SET resolved_at = now()
  WHERE id = p_flag_id AND resolved_at IS NULL;

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$;
