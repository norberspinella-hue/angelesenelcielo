-- Migración 0013: Puente no destructivo con public.memorials, reacciones persistentes y compatibilidad de moderación
-- Garantiza:
--   1. Relación 1:1 única por legacy_memorial_id (cero fusiones por coincidencia de nombre).
--   2. Preservación absoluta de memorials.dedication, slugs, fotos, fechas y contadores históricos.
--   3. Cero asignación automática de guardianes sin identidad verificada.
--   4. Tabla de reacciones comunitarias con protección anti-duplicado por ip_hash.

BEGIN;

-- 1. Ampliar community_tributes con enlace histórico y contador de apoyo
ALTER TABLE public.community_tributes
  ADD COLUMN IF NOT EXISTS legacy_memorial_id UUID UNIQUE,
  ADD COLUMN IF NOT EXISTS legacy_profile_slug TEXT,
  ADD COLUMN IF NOT EXISTS support_count INT NOT NULL DEFAULT 0 CHECK (support_count >= 0);

-- Ampliar acciones permitidas en community_rate_limits para incluir reacciones y moderación
ALTER TABLE public.community_rate_limits
  DROP CONSTRAINT IF EXISTS community_rate_limits_action_check;
ALTER TABLE public.community_rate_limits
  ADD CONSTRAINT community_rate_limits_action_check
  CHECK (action IN ('recover', 'verify', 'create_tribute', 'publish_letter', 'revoke', 'react'));

-- Vincular clave foránea ON DELETE RESTRICT únicamente si existe public.memorials en la base destino
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'memorials'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_schema = 'public' AND constraint_name = 'fk_community_tributes_legacy_memorial'
  ) THEN
    ALTER TABLE public.community_tributes
      ADD CONSTRAINT fk_community_tributes_legacy_memorial
      FOREIGN KEY (legacy_memorial_id) REFERENCES public.memorials(id) ON DELETE RESTRICT;
  END IF;
END
$$;

-- 2. Tabla de reacciones comunitarias (velas, abrazos y apoyo) con protección anti-duplicados
CREATE TABLE IF NOT EXISTS public.community_tribute_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tribute_id UUID NOT NULL REFERENCES public.community_tributes(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('candle', 'hug', 'support')),
  ip_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_tribute_reaction_ip UNIQUE (tribute_id, reaction_type, ip_hash)
);

CREATE INDEX IF NOT EXISTS idx_community_tribute_reactions_tribute
  ON public.community_tribute_reactions (tribute_id, reaction_type);

ALTER TABLE public.community_tribute_reactions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.community_tribute_reactions FROM PUBLIC, anon, authenticated;

-- 3. Función atómica de registro de velas/abrazos/apoyo sin inflación ni duplicados
CREATE OR REPLACE FUNCTION public.record_community_tribute_reaction(
  p_tribute_id UUID,
  p_reaction_type TEXT,
  p_ip_hash VARCHAR(64)
)
RETURNS TABLE (
  recorded BOOLEAN,
  already_reacted BOOLEAN,
  candles_count INT,
  hugs_count INT,
  support_count INT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_inserted_id UUID;
  v_trib RECORD;
BEGIN
  IF p_reaction_type NOT IN ('candle', 'hug', 'support') THEN
    RAISE EXCEPTION 'Tipo de reacción inválido';
  END IF;

  IF p_ip_hash IS NULL OR length(trim(p_ip_hash)) <> 64 THEN
    RAISE EXCEPTION 'Hash IP inválido';
  END IF;

  -- Comprobar que el homenaje existe y es público y válido
  SELECT ct.id, ct.candles_count, ct.hugs_count, ct.support_count
  INTO v_trib
  FROM public.community_tributes ct
  WHERE ct.id = p_tribute_id
    AND ct.publication_status = 'published'
    AND ct.visibility = 'public'
    AND ct.is_archived = FALSE
    AND ct.deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'TRIBUTE_NOT_FOUND';
  END IF;

  INSERT INTO public.community_tribute_reactions (tribute_id, reaction_type, ip_hash)
  VALUES (p_tribute_id, p_reaction_type, p_ip_hash)
  ON CONFLICT (tribute_id, reaction_type, ip_hash) DO NOTHING
  RETURNING id INTO v_inserted_id;

  IF v_inserted_id IS NULL THEN
    RETURN QUERY SELECT FALSE, TRUE, v_trib.candles_count, v_trib.hugs_count, v_trib.support_count;
    RETURN;
  END IF;

  UPDATE public.community_tributes ct
  SET
    candles_count = CASE WHEN p_reaction_type = 'candle' THEN ct.candles_count + 1 ELSE ct.candles_count END,
    hugs_count = CASE WHEN p_reaction_type = 'hug' THEN ct.hugs_count + 1 ELSE ct.hugs_count END,
    support_count = CASE WHEN p_reaction_type = 'support' THEN ct.support_count + 1 ELSE ct.support_count END,
    updated_at = timezone('utc'::text, now())
  WHERE ct.id = p_tribute_id
  RETURNING ct.candles_count, ct.hugs_count, ct.support_count
  INTO v_trib;

  RETURN QUERY SELECT TRUE, FALSE, v_trib.candles_count, v_trib.hugs_count, v_trib.support_count;
END;
$$;

REVOKE ALL ON FUNCTION public.record_community_tribute_reaction(UUID, TEXT, VARCHAR) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_community_tribute_reaction(UUID, TEXT, VARCHAR) TO postgres;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION public.record_community_tribute_reaction(UUID, TEXT, VARCHAR) TO service_role;
  END IF;
END
$$;

-- 4. Función idempotente de migración no destructiva desde public.memorials (solo comunitarios)
CREATE OR REPLACE FUNCTION public.migrate_legacy_community_memorials()
RETURNS TABLE (
  migrated_tributes INT,
  migrated_letters INT,
  skipped_existing INT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_tributes INT := 0;
  v_letters INT := 0;
  v_skipped INT := 0;
  v_rec RECORD;
  v_new_tribute_id UUID;
  v_mapped_species TEXT;
  v_mapped_pub_status TEXT;
  v_mapped_archived BOOLEAN;
  v_mapped_mod_status TEXT;
  v_author TEXT;
  v_years TEXT;
  v_candles INT;
  v_hugs INT;
  v_support INT;
  v_display_date TEXT;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'memorials'
  ) THEN
    RETURN QUERY SELECT 0, 0, 0;
    RETURN;
  END IF;

  FOR v_rec IN
    SELECT m.*
    FROM public.memorials m
    WHERE (m.story_answers->>'isCommunity') = 'true'
    ORDER BY m.created_at ASC
  LOOP
    -- Comprobar si ya fue migrado por su ID único histórico (nunca agrupar por pet_name)
    SELECT ct.id INTO v_new_tribute_id
    FROM public.community_tributes ct
    WHERE ct.legacy_memorial_id = v_rec.id;

    IF FOUND THEN
      v_skipped := v_skipped + 1;
      CONTINUE;
    END IF;

    v_mapped_species := CASE
      WHEN v_rec.species::text = 'perro' THEN 'perro'
      WHEN v_rec.species::text = 'gato' THEN 'gato'
      ELSE 'otro'
    END;

    v_mapped_archived := (v_rec.publication_status::text IN ('archived', 'expired'));
    v_mapped_pub_status := CASE
      WHEN v_rec.publication_status::text = 'published' THEN 'published'
      WHEN v_rec.publication_status::text IN ('archived', 'expired') THEN 'archived'
      ELSE 'pending_review'
    END;

    v_mapped_mod_status := CASE
      WHEN v_rec.moderation_status = 'approved' THEN 'approved'
      WHEN v_rec.moderation_status = 'rejected' THEN 'rejected'
      ELSE 'pending_review'
    END;

    v_author := COALESCE(NULLIF(trim(v_rec.story_answers->>'authorName'), ''), 'Familia de ' || v_rec.pet_name);
    v_years := NULLIF(trim(COALESCE(v_rec.story_answers->>'yearsOrDates', '')), '');
    v_candles := GREATEST(0, COALESCE((v_rec.story_answers->>'candlesCount')::int, 0));
    v_hugs := GREATEST(0, COALESCE((v_rec.story_answers->>'hugsCount')::int, 0));
    v_support := GREATEST(0, COALESCE((v_rec.story_answers->>'supportCount')::int, 0));
    v_display_date := to_char(v_rec.created_at AT TIME ZONE 'UTC', 'DD Mon YYYY');

    INSERT INTO public.community_tributes (
      legacy_memorial_id,
      legacy_profile_slug,
      slug,
      pet_name,
      species,
      photo_url,
      years_or_dates,
      author_display_name,
      candles_count,
      hugs_count,
      support_count,
      publication_status,
      visibility,
      is_archived,
      created_at,
      updated_at
    )
    VALUES (
      v_rec.id,
      v_rec.profile_slug,
      v_rec.profile_slug,
      v_rec.pet_name,
      v_mapped_species,
      NULLIF(trim(COALESCE(v_rec.photo_url, '')), ''),
      v_years,
      v_author,
      v_candles,
      v_hugs,
      v_support,
      v_mapped_pub_status,
      v_rec.visibility::text,
      v_mapped_archived,
      v_rec.created_at,
      v_rec.updated_at
    )
    ON CONFLICT (legacy_memorial_id) DO NOTHING
    RETURNING id INTO v_new_tribute_id;

    IF v_new_tribute_id IS NOT NULL THEN
      v_tributes := v_tributes + 1;

      INSERT INTO public.tribute_letters (
        tribute_id,
        letter_seq_num,
        title,
        category,
        content,
        author_name,
        display_date,
        envelope_color,
        moderation_status,
        is_archived,
        idempotency_key,
        created_at
      )
      VALUES (
        v_new_tribute_id,
        1,
        'Para ' || v_rec.pet_name,
        'despedida',
        COALESCE(NULLIF(trim(v_rec.dedication), ''), 'Recuerdo en homenaje'),
        v_author,
        v_display_date,
        'crema',
        v_mapped_mod_status,
        v_mapped_archived,
        'legacy-memorial-' || v_rec.id::text,
        v_rec.created_at
      )
      ON CONFLICT (idempotency_key) DO NOTHING;

      IF FOUND THEN
        v_letters := v_letters + 1;
      END IF;
    END IF;
  END LOOP;

  RETURN QUERY SELECT v_tributes, v_letters, v_skipped;
END;
$$;

REVOKE ALL ON FUNCTION public.migrate_legacy_community_memorials() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.migrate_legacy_community_memorials() TO postgres;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION public.migrate_legacy_community_memorials() TO service_role;
  END IF;
END
$$;

COMMIT;
