ALTER TABLE public.recovery_scores
ADD COLUMN IF NOT EXISTS support_score numeric(5,2) CHECK (support_score >= 0 AND support_score <= 100);
