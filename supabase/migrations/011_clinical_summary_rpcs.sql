-- Migration 011: Clinical summary RPCs for the clinic dashboard
--
-- Three SECURITY DEFINER functions with clinic access guards:
--   get_patient_clinical_summaries — recent clinical summaries for a patient
--   get_daily_summary_panel       — all patient check-ins for a given date
--   get_weekly_summary            — aggregated panel stats for a date range

-- 1. get_patient_clinical_summaries(p_patient_id, p_limit)
-- Returns recent (date, clinical_summary) rows for a specific patient.
-- Used by the patient detail page.
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

GRANT EXECUTE ON FUNCTION public.get_patient_clinical_summaries(uuid, int) TO authenticated;


-- 2. get_daily_summary_panel(p_date)
-- Returns all patients in the clinician's clinic who have a recovery score
-- on the given date, along with their score, delta, clinical summary, and flag count.
-- Used by the daily summary page.
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

GRANT EXECUTE ON FUNCTION public.get_daily_summary_panel(date) TO authenticated;


-- 3. get_weekly_summary(p_start_date, p_end_date)
-- Aggregated panel stats for a date range: per-patient avg score, flag count,
-- check-in count, latest clinical summary, and latest score.
-- Used by the weekly email page.
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

GRANT EXECUTE ON FUNCTION public.get_weekly_summary(date, date) TO authenticated;
