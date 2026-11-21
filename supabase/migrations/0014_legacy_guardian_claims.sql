-- Migración 0014: Custodia segura y auditable de colecciones históricas (sin auto-asignación)
-- Garantiza:
--   1. Ninguna colección histórica recibe guardián automáticamente por nombre, foto o dedicatoria pública.
--   2. Toda reclamación pasa por verificación privada + revisión administrativa + registro de decisión inmutable.
--   3. Cero exposición por Data API (RLS activo, REVOKE ALL para anon/authenticated).

BEGIN;

CREATE TABLE IF NOT EXISTS public.legacy_guardian_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id UUID NOT NULL REFERENCES public.community_tributes(id) ON DELETE CASCADE,
  legacy_memorial_id UUID,
  claimant_email_hash VARCHAR(64) NOT NULL,
  claimant_email_masked TEXT NOT NULL,
  verification_method TEXT NOT NULL CHECK (verification_method IN ('legacy_email_match', 'deletion_token_match', 'manual_private_proof')),
  private_proof_match BOOLEAN NOT NULL DEFAULT FALSE,
  private_proof_note TEXT,
  claim_status TEXT NOT NULL DEFAULT 'pending_review' CHECK (claim_status IN ('pending_review', 'approved', 'rejected')),
  decision_reason TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  assigned_guardian_id UUID REFERENCES public.tribute_guardians(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_legacy_guardian_claims_status
  ON public.legacy_guardian_claims (claim_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_legacy_guardian_claims_tribute
  ON public.legacy_guardian_claims (tribute_id);

CREATE TABLE IF NOT EXISTS public.legacy_guardian_claim_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID NOT NULL REFERENCES public.legacy_guardian_claims(id) ON DELETE CASCADE,
  tribute_id UUID NOT NULL REFERENCES public.community_tributes(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  decision_reason TEXT NOT NULL,
  reviewed_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.legacy_guardian_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_guardian_claim_decisions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.legacy_guardian_claims FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.legacy_guardian_claim_decisions FROM PUBLIC, anon, authenticated;

COMMIT;
