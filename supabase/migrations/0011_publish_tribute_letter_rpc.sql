-- Migración 0011: Funciones transaccionales atómicas (concurrencia, idempotencia y consumo único de Magic Link)
-- Privilegios restringidos exclusivamente al servidor (postgres / service_role). Nunca accesibles para anon/authenticated.

BEGIN;

-- 1. Publicación atómica de cartas con bloqueo pesimista FOR UPDATE sobre el homenaje padre
DROP FUNCTION IF EXISTS public.publish_tribute_letter(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.publish_tribute_letter(
  p_tribute_id UUID,
  p_title TEXT,
  p_category TEXT,
  p_content TEXT,
  p_author_name TEXT,
  p_display_date TEXT,
  p_envelope_color TEXT DEFAULT 'crema',
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  tribute_id UUID,
  letter_seq_num INT,
  title TEXT,
  category TEXT,
  content TEXT,
  author_name TEXT,
  display_date TEXT,
  envelope_color TEXT,
  moderation_status TEXT,
  created_at TIMESTAMPTZ,
  is_duplicate BOOLEAN
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_seq INT;
  v_existing RECORD;
  v_inserted RECORD;
BEGIN
  -- Comprobar idempotencia previa si se facilita clave
  IF p_idempotency_key IS NOT NULL AND length(trim(p_idempotency_key)) > 0 THEN
    SELECT tl.*
    INTO v_existing
    FROM public.tribute_letters tl
    WHERE tl.idempotency_key = p_idempotency_key;

    IF FOUND THEN
      IF v_existing.content = p_content AND v_existing.title = p_title AND v_existing.tribute_id = p_tribute_id THEN
        RETURN QUERY SELECT
          v_existing.id, v_existing.tribute_id, v_existing.letter_seq_num,
          v_existing.title, v_existing.category, v_existing.content,
          v_existing.author_name, v_existing.display_date, v_existing.envelope_color,
          v_existing.moderation_status, v_existing.created_at, TRUE;
        RETURN;
      ELSE
        RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT: La clave de idempotencia ya fue utilizada con distinto contenido';
      END IF;
    END IF;
  END IF;

  -- Bloqueo pesimista sobre la fila del homenaje padre para serializar la numeración por mascota
  PERFORM 1
  FROM public.community_tributes ct
  WHERE ct.id = p_tribute_id
    AND ct.deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'TRIBUTE_NOT_FOUND: El homenaje especificado no existe o fue eliminado';
  END IF;

  -- Reevaluar idempotencia dentro del bloqueo por si hubo carrera en la misma clave
  IF p_idempotency_key IS NOT NULL AND length(trim(p_idempotency_key)) > 0 THEN
    SELECT tl.*
    INTO v_existing
    FROM public.tribute_letters tl
    WHERE tl.idempotency_key = p_idempotency_key;

    IF FOUND THEN
      IF v_existing.content = p_content AND v_existing.title = p_title AND v_existing.tribute_id = p_tribute_id THEN
        RETURN QUERY SELECT
          v_existing.id, v_existing.tribute_id, v_existing.letter_seq_num,
          v_existing.title, v_existing.category, v_existing.content,
          v_existing.author_name, v_existing.display_date, v_existing.envelope_color,
          v_existing.moderation_status, v_existing.created_at, TRUE;
        RETURN;
      ELSE
        RAISE EXCEPTION 'IDEMPOTENCY_CONFLICT: La clave de idempotencia ya fue utilizada con distinto contenido';
      END IF;
    END IF;
  END IF;

  -- Calcular siguiente número correlativo consecutivo sin colisiones 23505
  SELECT COALESCE(MAX(tl.letter_seq_num), 0) + 1
  INTO v_seq
  FROM public.tribute_letters tl
  WHERE tl.tribute_id = p_tribute_id;

  INSERT INTO public.tribute_letters (
    tribute_id, letter_seq_num, title, category, content,
    author_name, display_date, envelope_color, idempotency_key
  )
  VALUES (
    p_tribute_id, v_seq, p_title, p_category, p_content,
    p_author_name, p_display_date, COALESCE(p_envelope_color, 'crema'), p_idempotency_key
  )
  RETURNING * INTO v_inserted;

  RETURN QUERY SELECT
    v_inserted.id, v_inserted.tribute_id, v_inserted.letter_seq_num,
    v_inserted.title, v_inserted.category, v_inserted.content,
    v_inserted.author_name, v_inserted.display_date, v_inserted.envelope_color,
    v_inserted.moderation_status, v_inserted.created_at, FALSE;
END;
$$;

-- 2. Consumo atómico de Magic Link de un solo uso (UPDATE ... WHERE used_at IS NULL AND expires_at > now())
CREATE OR REPLACE FUNCTION public.consume_guardian_magic_link(
  p_token_hash VARCHAR(64),
  p_tribute_slug TEXT DEFAULT NULL
)
RETURNS TABLE (
  guardian_id UUID,
  tribute_id UUID,
  tribute_slug TEXT,
  pet_name TEXT
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_consumed RECORD;
BEGIN
  IF p_token_hash IS NULL OR length(trim(p_token_hash)) <> 64 THEN
    RETURN;
  END IF;

  UPDATE public.guardian_magic_links gml
  SET used_at = v_now
  FROM public.tribute_guardians tg
  JOIN public.community_tributes ct ON ct.id = tg.tribute_id
  WHERE gml.guardian_id = tg.id
    AND gml.token_hash = p_token_hash
    AND gml.used_at IS NULL
    AND gml.expires_at > v_now
    AND ct.deleted_at IS NULL
    AND (p_tribute_slug IS NULL OR ct.slug = p_tribute_slug)
  RETURNING tg.id AS guardian_id, ct.id AS tribute_id, ct.slug AS tribute_slug, ct.pet_name AS pet_name
  INTO v_consumed;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- Marcar fecha de verificación del guardián si aún no la tenía
  UPDATE public.tribute_guardians
  SET verified_at = COALESCE(verified_at, v_now)
  WHERE id = v_consumed.guardian_id;

  RETURN QUERY SELECT v_consumed.guardian_id, v_consumed.tribute_id, v_consumed.tribute_slug, v_consumed.pet_name;
END;
$$;

-- 3. Privilegios estrictos: revocar de PUBLIC, anon y authenticated
REVOKE ALL ON FUNCTION public.publish_tribute_letter(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consume_guardian_magic_link(VARCHAR, TEXT) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.publish_tribute_letter(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO postgres;
GRANT EXECUTE ON FUNCTION public.consume_guardian_magic_link(VARCHAR, TEXT) TO postgres;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION public.publish_tribute_letter(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;
    GRANT EXECUTE ON FUNCTION public.consume_guardian_magic_link(VARCHAR, TEXT) TO service_role;
  END IF;
END
$$;

COMMIT;
