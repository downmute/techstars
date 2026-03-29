-- Migration 009: Add INSERT/UPDATE policies for client-side recovery score + flag persistence
--
-- recovery_scores and flags were originally designed for service_role only,
-- but the mobile app computes scores and detects flags client-side and needs
-- to write them via the anon key (authenticated role).

-- Allow patients to insert their own recovery scores
CREATE POLICY "Users can insert own recovery scores"
  ON public.recovery_scores FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow patients to update own recovery scores (needed for upsert on conflict)
CREATE POLICY "Users can update own recovery scores"
  ON public.recovery_scores FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow patients to insert flags (client-side PPD detection)
CREATE POLICY "Users can insert own flags"
  ON public.flags FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
