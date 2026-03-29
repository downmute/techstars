-- Migration 010: Clinician registration + dashboard query RPCs
--
-- register_clinician: called after email/password sign-up on the dashboard.
-- Runs as SECURITY DEFINER so it can read the clinics table (service_role only)
-- and update auth.users metadata.

CREATE OR REPLACE FUNCTION public.register_clinician(p_clinic_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_clinic_id uuid;
BEGIN
  SELECT id INTO v_clinic_id
  FROM public.clinics
  WHERE lower(trim(name)) = lower(trim(p_clinic_code));

  IF v_clinic_id IS NULL THEN
    RAISE EXCEPTION 'Invalid clinic code: %', p_clinic_code;
  END IF;

  UPDATE public.users
  SET clinic_id = v_clinic_id
  WHERE id = auth.uid();

  UPDATE auth.users
  SET raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role":"clinician"}'::jsonb
  WHERE id = auth.uid();
END;
$$;

-- Allow authenticated users to call register_clinician
GRANT EXECUTE ON FUNCTION public.register_clinician(text) TO authenticated;

-- get_patient_panel: returns the patient list for the logged-in clinician's clinic.
-- Uses SECURITY DEFINER to bypass per-table RLS and return a single joined result.
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

GRANT EXECUTE ON FUNCTION public.get_patient_panel() TO authenticated;

-- get_patient_trend: returns the last N recovery scores for a patient (7-day sparkline).
-- Clinicians can only fetch trends for patients in their clinic.
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

GRANT EXECUTE ON FUNCTION public.get_patient_trend(uuid, int) TO authenticated;

-- get_patient_detail: returns full patient info + latest scores + flags for the detail view.
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

GRANT EXECUTE ON FUNCTION public.get_patient_detail(uuid) TO authenticated;

-- Clinician SELECT policy on users: clinicians can see basic profile data
-- for patients in their clinic (needed for the patient panel).
CREATE POLICY "Clinics can read patient profiles"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users clinician
      WHERE clinician.id = auth.uid()
        AND clinician.clinic_id = users.clinic_id
        AND clinician.id != users.id
    )
  );
