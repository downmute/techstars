-- Migration 012: Smart alerts RPCs for the clinic dashboard
--
-- Two SECURITY DEFINER functions with clinic access guards:
--   get_alerts_panel  — all flags for the clinician's clinic (active + optionally recent resolved)
--   resolve_flag      — mark a single flag as resolved

-- 1. get_alerts_panel(p_include_resolved)
-- Returns all flags for patients in the clinician's clinic, with patient
-- context (weeks PP, latest recovery score). Ordered by unresolved first,
-- then severity (urgent > high > medium > low), then newest first.
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

GRANT EXECUTE ON FUNCTION public.get_alerts_panel(boolean) TO authenticated;


-- 2. resolve_flag(p_flag_id)
-- Sets resolved_at = now() on a flag, with clinic access guard.
-- Returns true on success, false if the flag doesn't exist or access denied.
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

GRANT EXECUTE ON FUNCTION public.resolve_flag(uuid) TO authenticated;
