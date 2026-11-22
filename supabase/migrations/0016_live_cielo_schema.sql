-- ============================================================================
-- Migración 0016: LIVE · Cielo interactivo (TikTok LIVE)
-- Idempotente, RLS estricto, Realtime seguro y RPC transaccional live_aprobar.
-- ============================================================================

BEGIN;

-- 1. Enum de estado del homenaje en directo (idempotente)
DO $$
BEGIN
  CREATE TYPE public.live_estado AS ENUM ('pendiente', 'aprobado', 'rechazado', 'quitado');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- 2. Sesiones de directo (histórico limpio al pulsar "Nuevo directo")
CREATE TABLE IF NOT EXISTS public.live_sesiones (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo     TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at   TIMESTAMPTZ
);

-- 3. Ajustes globales de emisión (fila única id = 1)
CREATE TABLE IF NOT EXISTS public.live_ajustes (
  id              INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  sesion_id       UUID REFERENCES public.live_sesiones(id),
  max_perritos    INT NOT NULL DEFAULT 40 CHECK (max_perritos BETWEEN 1 AND 150),
  por_usuario     INT NOT NULL DEFAULT 1 CHECK (por_usuario BETWEEN 1 AND 20),
  comando         TEXT NOT NULL DEFAULT '!angel',
  centro          TEXT NOT NULL DEFAULT 'Ángeles en el Cielo',
  ritmo           TEXT NOT NULL DEFAULT 'normal' CHECK (ritmo IN ('normal', 'rapido')),
  auto_aprobar    BOOLEAN NOT NULL DEFAULT FALSE,
  instruccion     BOOLEAN NOT NULL DEFAULT TRUE,
  escena_output   TEXT NOT NULL DEFAULT 'video' CHECK (escena_output IN ('video', 'cielo')),
  tiktok_usuario  TEXT,
  lector_activo   BOOLEAN NOT NULL DEFAULT FALSE,
  lector_estado   TEXT NOT NULL DEFAULT 'desconectado' CHECK (lector_estado IN ('desconectado', 'conectando', 'conectado', 'error')),
  lector_detalle  TEXT,
  lector_visto_at TIMESTAMPTZ,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.live_ajustes (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 4. Perritos / estrellas participantes por sesión
CREATE TABLE IF NOT EXISTS public.live_perritos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id      UUID NOT NULL REFERENCES public.live_sesiones(id) ON DELETE CASCADE,
  estado         public.live_estado NOT NULL DEFAULT 'pendiente',
  nombre         TEXT NOT NULL CHECK (char_length(nombre) BETWEEN 2 AND 24),
  tiempo         TEXT NOT NULL DEFAULT '' CHECK (char_length(tiempo) <= 20),
  tiktok_usuario TEXT,
  tiktok_apodo   TEXT,
  texto_original TEXT,
  origen         TEXT NOT NULL DEFAULT 'chat' CHECK (origen IN ('chat', 'manual', 'prueba')),
  slot           INT,
  sube_at        TIMESTAMPTZ,
  duracion_ms    INT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  aprobado_at    TIMESTAMPTZ,
  quitado_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_live_perritos_sesion_estado
  ON public.live_perritos (sesion_id, estado, created_at);

CREATE INDEX IF NOT EXISTS idx_live_perritos_sesion_usuario
  ON public.live_perritos (sesion_id, lower(tiktok_usuario));

CREATE UNIQUE INDEX IF NOT EXISTS live_slot_unico
  ON public.live_perritos (sesion_id, slot)
  WHERE estado = 'aprobado';

-- Asegurar eventos completos en Realtime ante transiciones de estado
ALTER TABLE public.live_perritos REPLICA IDENTITY FULL;
ALTER TABLE public.live_ajustes REPLICA IDENTITY FULL;

-- 5. RLS y privilegios mínimos para anon/authenticated
ALTER TABLE public.live_sesiones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_ajustes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_perritos ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.live_sesiones FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.live_ajustes  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.live_perritos FROM PUBLIC, anon, authenticated;

-- Garantizar existencia de roles estándar en entornos PostgreSQL locales
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
END
$$;

-- El output (anon) solo lee columnas visuales de live_ajustes (oculta tiktok_usuario/lector_* internos)
GRANT SELECT (
  id, sesion_id, max_perritos, por_usuario, comando, centro,
  ritmo, auto_aprobar, instruccion, escena_output, updated_at
) ON public.live_ajustes TO anon, authenticated;

GRANT SELECT ON public.live_perritos TO anon, authenticated;

DROP POLICY IF EXISTS "anon ve aprobados" ON public.live_perritos;
CREATE POLICY "anon ve aprobados" ON public.live_perritos
  FOR SELECT TO anon, authenticated
  USING (
    estado = 'aprobado'
    AND sesion_id = (SELECT a.sesion_id FROM public.live_ajustes a WHERE a.id = 1)
  );

DROP POLICY IF EXISTS "anon ve ajustes" ON public.live_ajustes;
CREATE POLICY "anon ve ajustes" ON public.live_ajustes
  FOR SELECT TO anon, authenticated
  USING (id = 1);

-- Vista pública explícita con ajustes de escena (compatible con consultas PostgREST sin exponer datos del lector)
CREATE OR REPLACE VIEW public.live_ajustes_publicos AS
SELECT
  id, sesion_id, max_perritos, por_usuario, comando, centro,
  ritmo, instruccion, escena_output, updated_at
FROM public.live_ajustes
WHERE id = 1;

REVOKE ALL ON public.live_ajustes_publicos FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.live_ajustes_publicos TO anon, authenticated;

-- 6. Publicación Supabase Realtime (si existe en el servidor)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'live_perritos'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.live_perritos;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'live_ajustes'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.live_ajustes;
    END IF;
  END IF;
END
$$;

-- 7. Sesión inicial solo si live_ajustes aún no tiene sesion_id
DO $$
DECLARE
  v_sid UUID;
BEGIN
  SELECT sesion_id INTO v_sid FROM public.live_ajustes WHERE id = 1;
  IF v_sid IS NULL THEN
    INSERT INTO public.live_sesiones (titulo) VALUES ('Primer directo') RETURNING id INTO v_sid;
    UPDATE public.live_ajustes SET sesion_id = v_sid, updated_at = now() WHERE id = 1;
  END IF;
END
$$;

-- 8. RPC transaccional de aprobación: bloquea fila de ajustes, asigna menor slot libre y encadena sube_at
CREATE OR REPLACE FUNCTION public.live_aprobar(
  p_id UUID,
  p_nombre TEXT DEFAULT NULL,
  p_tiempo TEXT DEFAULT NULL
)
RETURNS public.live_perritos
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_aj           public.live_ajustes%ROWTYPE;
  v_row          public.live_perritos%ROWTYPE;
  v_norm_user    TEXT;
  v_total_aprob  INT;
  v_user_aprob   INT;
  v_slot         INT;
  v_duracion_ms  INT;
  v_fin_ultimo   TIMESTAMPTZ;
  v_sube_at      TIMESTAMPTZ;
  v_clean_nombre TEXT;
  v_clean_tiempo TEXT;
  v_result       public.live_perritos%ROWTYPE;
BEGIN
  -- Serializar aprobaciones y cambios de ajustes sobre la fila única id = 1
  SELECT * INTO v_aj
  FROM public.live_ajustes
  WHERE id = 1
  FOR UPDATE;

  IF NOT FOUND OR v_aj.sesion_id IS NULL THEN
    RAISE EXCEPTION 'SESION_NO_ACTIVA';
  END IF;

  -- Bloquear la fila pendiente dentro de la sesión activa
  SELECT * INTO v_row
  FROM public.live_perritos
  WHERE id = p_id
    AND sesion_id = v_aj.sesion_id
    AND estado = 'pendiente'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'PERRITO_NO_PENDIENTE';
  END IF;

  -- 1. Límite total de estrellas activas en el cielo
  SELECT count(*)::int INTO v_total_aprob
  FROM public.live_perritos
  WHERE sesion_id = v_aj.sesion_id AND estado = 'aprobado';

  IF v_total_aprob >= v_aj.max_perritos THEN
    RAISE EXCEPTION 'CIELO_LLENO';
  END IF;

  -- 2. Límite por usuario normalizado (lo añadido a mano sin usuario no cuenta)
  v_norm_user := NULLIF(lower(regexp_replace(trim(COALESCE(v_row.tiktok_usuario, '')), '^@+', '')), '');
  IF v_norm_user IS NOT NULL THEN
    SELECT count(*)::int INTO v_user_aprob
    FROM public.live_perritos
    WHERE sesion_id = v_aj.sesion_id
      AND estado = 'aprobado'
      AND lower(regexp_replace(trim(COALESCE(tiktok_usuario, '')), '^@+', '')) = v_norm_user;

    IF v_user_aprob >= v_aj.por_usuario THEN
      RAISE EXCEPTION 'LIMITE_USUARIO';
    END IF;
  END IF;

  -- 3. Menor entero >= 0 libre para esta sesión
  SELECT s.n INTO v_slot
  FROM generate_series(0, GREATEST(0, v_aj.max_perritos - 1)) AS s(n)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.live_perritos p
    WHERE p.sesion_id = v_aj.sesion_id
      AND p.estado = 'aprobado'
      AND p.slot = s.n
  )
  ORDER BY s.n ASC
  LIMIT 1;

  IF v_slot IS NULL THEN
    RAISE EXCEPTION 'CIELO_LLENO';
  END IF;

  -- 4. Duración según ritmo vigente al momento de aprobar
  v_duracion_ms := CASE WHEN v_aj.ritmo = 'rapido' THEN 8745 ELSE 15900 END;

  -- 5. Horario sincronizado en servidor: greatest(now() + 1s, fin_del_ultimo)
  SELECT MAX(p.sube_at + make_interval(secs => COALESCE(p.duracion_ms, 15900) / 1000.0))
  INTO v_fin_ultimo
  FROM public.live_perritos p
  WHERE p.sesion_id = v_aj.sesion_id
    AND p.estado = 'aprobado'
    AND p.sube_at IS NOT NULL;

  v_sube_at := GREATEST(
    now() + interval '1 second',
    COALESCE(v_fin_ultimo, now() + interval '1 second')
  );

  -- 6. Saneo opcional de nombre y tiempo corregidos en línea
  IF p_nombre IS NOT NULL AND length(trim(p_nombre)) > 0 THEN
    v_clean_nombre := left(trim(regexp_replace(regexp_replace(p_nombre, '[^[:alnum:] ''.\-&]', '', 'g'), '\s+', ' ', 'g')), 24);
    IF char_length(v_clean_nombre) < 2 THEN
      RAISE EXCEPTION 'NOMBRE_INVALIDO';
    END IF;
  ELSE
    v_clean_nombre := v_row.nombre;
  END IF;

  IF p_tiempo IS NOT NULL THEN
    v_clean_tiempo := left(trim(regexp_replace(p_tiempo, '\s+', ' ', 'g')), 20);
  ELSE
    v_clean_tiempo := v_row.tiempo;
  END IF;

  UPDATE public.live_perritos
  SET
    estado         = 'aprobado',
    nombre         = v_clean_nombre,
    tiempo         = v_clean_tiempo,
    tiktok_usuario = COALESCE(v_norm_user, tiktok_usuario),
    slot           = v_slot,
    sube_at        = v_sube_at,
    duracion_ms    = v_duracion_ms,
    aprobado_at    = now()
  WHERE id = v_row.id
  RETURNING * INTO v_result;

  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.live_aprobar(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.live_aprobar(UUID, TEXT, TEXT) TO postgres;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION public.live_aprobar(UUID, TEXT, TEXT) TO service_role;
  END IF;
END
$$;

-- 9. RPC atómica de ingesta con bloqueo por usuario (evita carreras en ráfagas y aplica antispam exacto)
CREATE OR REPLACE FUNCTION public.live_ingestar(
  p_nombre         TEXT,
  p_tiempo         TEXT DEFAULT '',
  p_usuario        TEXT DEFAULT NULL,
  p_apodo          TEXT DEFAULT NULL,
  p_texto_original TEXT DEFAULT NULL,
  p_origen         TEXT DEFAULT 'chat'
)
RETURNS TABLE (
  ingest_status TEXT,
  perrito_id    UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_sesion_id  UUID;
  v_norm_user  TEXT;
  v_dup_exists BOOLEAN;
  v_recent_cnt INT;
  v_new_id     UUID;
BEGIN
  SELECT sesion_id INTO v_sesion_id FROM public.live_ajustes WHERE id = 1;
  IF v_sesion_id IS NULL THEN
    RAISE EXCEPTION 'SESION_NO_ACTIVA';
  END IF;

  v_norm_user := NULLIF(lower(regexp_replace(trim(COALESCE(p_usuario, '')), '^@+', '')), '');

  -- Serializar peticiones concurrentes del mismo usuario en la sesión activa
  IF v_norm_user IS NOT NULL THEN
    PERFORM pg_advisory_xact_lock(hashtext(v_sesion_id::text || ':' || v_norm_user));

    SELECT EXISTS (
      SELECT 1 FROM public.live_perritos
      WHERE sesion_id = v_sesion_id
        AND estado = 'pendiente'
        AND lower(regexp_replace(trim(COALESCE(tiktok_usuario, '')), '^@+', '')) = v_norm_user
        AND lower(nombre) = lower(trim(p_nombre))
    ) INTO v_dup_exists;

    IF v_dup_exists THEN
      RETURN QUERY SELECT 'ignored_duplicate'::TEXT, NULL::UUID;
      RETURN;
    END IF;

    SELECT count(*)::int INTO v_recent_cnt
    FROM public.live_perritos
    WHERE sesion_id = v_sesion_id
      AND estado = 'pendiente'
      AND lower(regexp_replace(trim(COALESCE(tiktok_usuario, '')), '^@+', '')) = v_norm_user
      AND created_at >= now() - interval '20 seconds';

    IF v_recent_cnt >= 1 THEN
      RETURN QUERY SELECT 'rate_limited'::TEXT, NULL::UUID;
      RETURN;
    END IF;
  END IF;

  -- Mantener máximo 200 pendientes por sesión descartando los más antiguos
  DELETE FROM public.live_perritos
  WHERE id IN (
    SELECT id FROM public.live_perritos
    WHERE sesion_id = v_sesion_id AND estado = 'pendiente'
    ORDER BY created_at DESC
    OFFSET 199
  );

  INSERT INTO public.live_perritos (
    sesion_id, estado, nombre, tiempo, tiktok_usuario, tiktok_apodo, texto_original, origen
  )
  VALUES (
    v_sesion_id,
    'pendiente',
    left(trim(p_nombre), 24),
    left(trim(COALESCE(p_tiempo, '')), 20),
    v_norm_user,
    NULLIF(left(trim(COALESCE(p_apodo, '')), 80), ''),
    NULLIF(left(trim(COALESCE(p_texto_original, '')), 300), ''),
    CASE WHEN p_origen IN ('chat', 'manual', 'prueba') THEN p_origen ELSE 'chat' END
  )
  RETURNING id INTO v_new_id;

  RETURN QUERY SELECT 'pending'::TEXT, v_new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.live_ingestar(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.live_ingestar(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO postgres;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION public.live_ingestar(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO service_role;
  END IF;
END
$$;

COMMIT;
