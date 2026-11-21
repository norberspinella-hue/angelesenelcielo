-- Migración 0009: Esquema completo multicarta "Las cartas para mi angelito"
-- Totalmente aislada de la tabla histórica public.memorials (protección absoluta de memorials.dedication).
-- Idempotente y segura para ejecución repetida en PostgreSQL 16 local y Supabase Staging.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Homenajes por mascota (entidad padre independiente de memorials)
CREATE TABLE IF NOT EXISTS public.community_tributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  pet_name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('perro', 'gato', 'otro')),
  photo_url TEXT,
  years_or_dates TEXT,
  author_display_name TEXT NOT NULL,
  mural_reference_id TEXT,
  candles_count INT NOT NULL DEFAULT 0 CHECK (candles_count >= 0),
  hugs_count INT NOT NULL DEFAULT 0 CHECK (hugs_count >= 0),
  publication_status TEXT NOT NULL DEFAULT 'published' CHECK (publication_status IN ('published', 'pending_review', 'archived')),
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_community_tributes_public_feed
  ON public.community_tributes (created_at DESC)
  WHERE publication_status = 'published' AND visibility = 'public' AND is_archived = FALSE AND deleted_at IS NULL;

-- 2. Cartas individuales asociadas a un homenaje
CREATE TABLE IF NOT EXISTS public.tribute_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id UUID NOT NULL REFERENCES public.community_tributes(id) ON DELETE RESTRICT,
  letter_seq_num INT NOT NULL CHECK (letter_seq_num >= 1),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('despedida', 'cumpleanos', 'aniversario', 'espontanea')),
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  display_date TEXT NOT NULL,
  envelope_color TEXT NOT NULL DEFAULT 'crema' CHECK (envelope_color IN ('crema', 'lavanda', 'rosa')),
  moderation_status TEXT NOT NULL DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'pending_review', 'rejected')),
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMPTZ,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_tribute_letter_seq UNIQUE (tribute_id, letter_seq_num)
);

CREATE INDEX IF NOT EXISTS idx_tribute_letters_tribute_seq
  ON public.tribute_letters (tribute_id, letter_seq_num ASC)
  WHERE moderation_status = 'approved' AND is_archived = FALSE AND deleted_at IS NULL;

-- 3. Guardianes autorizados (zero email en claro en índices: solo blind index HMAC-SHA256)
CREATE TABLE IF NOT EXISTS public.tribute_guardians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id UUID NOT NULL REFERENCES public.community_tributes(id) ON DELETE RESTRICT,
  email_blind_index VARCHAR(64) NOT NULL,
  guardian_name TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_guardian_tribute_email UNIQUE (tribute_id, email_blind_index)
);

-- 4. Tokens efímeros de recuperación Magic Link (un solo uso, caducidad 15 min, separados de sesiones)
CREATE TABLE IF NOT EXISTS public.guardian_magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id UUID NOT NULL REFERENCES public.tribute_guardians(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_guardian_magic_links_active
  ON public.guardian_magic_links (token_hash)
  WHERE used_at IS NULL;

-- 5. Sesiones activas de guardián (cookies HttpOnly, 7 días, revocables individual o globalmente)
CREATE TABLE IF NOT EXISTS public.guardian_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_id UUID NOT NULL REFERENCES public.tribute_guardians(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_guardian_sessions_active
  ON public.guardian_sessions (guardian_id, token_hash)
  WHERE revoked_at IS NULL;

-- 6. Respaldo de cartas adicionales para rollback recuperable sin tocar memorials.dedication
CREATE TABLE IF NOT EXISTS public.rollback_companion_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id UUID NOT NULL,
  tribute_slug TEXT NOT NULL,
  letter_seq_num INT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  display_date TEXT NOT NULL,
  envelope_color TEXT NOT NULL,
  backed_up_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_rollback_letter UNIQUE (tribute_id, letter_seq_num)
);

-- 7. Vista de compatibilidad de lectura tras rollback (filtra estrictamente homenajes públicos válidos)
CREATE OR REPLACE VIEW public.v_legacy_companion_letters AS
SELECT
  rcl.id,
  rcl.tribute_id,
  rcl.tribute_slug,
  ct.pet_name,
  rcl.letter_seq_num,
  rcl.title,
  rcl.category,
  rcl.content,
  rcl.author_name,
  rcl.display_date,
  rcl.envelope_color,
  rcl.backed_up_at
FROM public.rollback_companion_letters rcl
JOIN public.community_tributes ct ON ct.id = rcl.tribute_id
WHERE ct.publication_status = 'published'
  AND ct.visibility = 'public'
  AND ct.is_archived = FALSE
  AND ct.deleted_at IS NULL;

COMMIT;
