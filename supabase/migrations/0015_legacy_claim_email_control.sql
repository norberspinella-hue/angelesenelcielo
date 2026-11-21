-- Migración 0015: Verificación de control de correo histórico, prevención de duplicados y confirmación en reclamaciones
BEGIN;

ALTER TABLE public.legacy_guardian_claims
  ADD COLUMN IF NOT EXISTS control_token_hash VARCHAR(64) UNIQUE,
  ADD COLUMN IF NOT EXISTS control_token_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS email_control_verified BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_control_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS uq_legacy_claim_pending_tribute_email
  ON public.legacy_guardian_claims (tribute_id, claimant_email_hash)
  WHERE claim_status = 'pending_review';

COMMIT;
