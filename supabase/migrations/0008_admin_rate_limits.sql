-- Migración 0008: Tabla y funciones atómicas de limitación de tasa administrativa (Rate Limiting)
-- Totalmente aislada e independiente. Comportamiento Fail-Closed, HMAC-SHA256, cero PII.
-- Ejecutable como transacción atómica y reversible.

BEGIN;

-- 1. Tabla relacional de control de intentos de acceso administrativo
CREATE TABLE IF NOT EXISTS public.admin_rate_limits (
  id VARCHAR(64) PRIMARY KEY,                         -- Hash HMAC-SHA256 seudonimizado (64 hex)
  scope VARCHAR(16) NOT NULL DEFAULT 'ip' CHECK (scope IN ('ip', 'global')), -- Ámbito restringido
  failed_attempts INTEGER NOT NULL DEFAULT 1 CHECK (failed_attempts >= 0),   -- Conteo atómico
  first_attempt_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()), -- Inicio de ventana
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),  -- Último intento
  blocked_until TIMESTAMPTZ,                          -- Límite temporal de bloqueo activo
  expires_at TIMESTAMPTZ NOT NULL                     -- Fecha de purga automática
);

-- 2. Índices para acelerar la comprobación y la purga oportunista de registros expirados
CREATE INDEX IF NOT EXISTS idx_admin_rate_limits_expires 
  ON public.admin_rate_limits (expires_at);

CREATE INDEX IF NOT EXISTS idx_admin_rate_limits_blocked 
  ON public.admin_rate_limits (blocked_until) WHERE blocked_until IS NOT NULL;

-- 3. Seguridad a nivel de fila (RLS) y revocación pública
ALTER TABLE public.admin_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_rate_limits FROM PUBLIC;

-- 4. Función atómica para comprobar si un identificador está bloqueado
CREATE OR REPLACE FUNCTION public.check_admin_rate_limit(
  p_key VARCHAR(64)
)
RETURNS TABLE (
  is_blocked BOOLEAN,
  remaining_seconds INTEGER,
  current_attempts INTEGER
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_rec RECORD;
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
BEGIN
  -- 1. Validación estricta: rechazar claves nulas o vacías
  IF p_key IS NULL OR length(trim(p_key)) = 0 THEN
    RAISE EXCEPTION 'p_key no puede ser nula ni vacía';
  END IF;

  SELECT failed_attempts, blocked_until
  INTO v_rec
  FROM public.admin_rate_limits
  WHERE id = p_key;

  IF FOUND AND v_rec.blocked_until IS NOT NULL AND v_rec.blocked_until > v_now THEN
    RETURN QUERY SELECT 
      true,
      GREATEST(1, EXTRACT(EPOCH FROM (v_rec.blocked_until - v_now))::INTEGER),
      v_rec.failed_attempts;
  ELSE
    RETURN QUERY SELECT 
      false,
      0,
      COALESCE(v_rec.failed_attempts, 0);
  END IF;
END;
$$;

-- 5. Función atómica para registrar intento fallido mediante INSERT ... ON CONFLICT DO UPDATE
-- Jerarquía estricta: un bloqueo activo SIEMPRE prevalece sobre el reinicio de ventana.
CREATE OR REPLACE FUNCTION public.record_admin_failed_attempt(
  p_key VARCHAR(64),
  p_scope VARCHAR(16) DEFAULT 'ip',
  p_max_attempts INTEGER DEFAULT 5,
  p_window_seconds INTEGER DEFAULT 900,   -- 15 minutos
  p_lockout_seconds INTEGER DEFAULT 900  -- 15 minutos
)
RETURNS TABLE (
  is_blocked BOOLEAN,
  remaining_seconds INTEGER,
  current_attempts INTEGER
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_window_start TIMESTAMPTZ;
  v_lockout_until TIMESTAMPTZ;
  v_expire_at TIMESTAMPTZ;
  v_rec RECORD;
BEGIN
  -- 1. Validación estricta de parámetros
  IF p_max_attempts < 1 OR p_window_seconds < 1 OR p_lockout_seconds < 1 THEN
    RAISE EXCEPTION 'Parámetros de limitador inválidos: deben ser mayores a cero';
  END IF;

  IF p_scope NOT IN ('ip', 'global') THEN
    RAISE EXCEPTION 'Scope inválido: sólo se admite ''ip'' o ''global''';
  END IF;

  v_window_start := v_now - (p_window_seconds || ' seconds')::INTERVAL;
  v_lockout_until := v_now + (p_lockout_seconds || ' seconds')::INTERVAL;
  v_expire_at := v_lockout_until + INTERVAL '1 hour';

  -- 2. Operación atómica de inserción o actualización con precedencia estricta del bloqueo
  INSERT INTO public.admin_rate_limits AS arl (
    id, scope, failed_attempts, first_attempt_at, last_attempt_at, blocked_until, expires_at
  )
  VALUES (
    p_key, p_scope, 1, v_now, v_now, NULL, v_now + (p_window_seconds || ' seconds')::INTERVAL + INTERVAL '1 hour'
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Conteo de intentos fallidos
    failed_attempts = CASE
      -- REGLA 1: Si hay un bloqueo activo vigente, NUNCA reiniciar por expiración de ventana.
      WHEN arl.blocked_until IS NOT NULL AND arl.blocked_until > v_now THEN
        arl.failed_attempts + 1
      -- REGLA 2: Si el bloqueo anterior ya venció, iniciar una nueva ventana desde 1
      WHEN arl.blocked_until IS NOT NULL AND arl.blocked_until <= v_now THEN
        1
      -- REGLA 3: Si la ventana inicial ya expiró (sin bloqueo), reiniciar a 1
      WHEN arl.first_attempt_at < v_window_start THEN
        1
      -- REGLA 4: Dentro de la ventana deslizante normal, incrementar
      ELSE
        arl.failed_attempts + 1
    END,

    -- Inicio de ventana deslizante
    first_attempt_at = CASE
      -- Si hay bloqueo activo vigente, conservar el inicio original intacto
      WHEN arl.blocked_until IS NOT NULL AND arl.blocked_until > v_now THEN
        arl.first_attempt_at
      -- Si el bloqueo anterior venció o la ventana anterior expiró, nueva marca de inicio
      WHEN (arl.blocked_until IS NOT NULL AND arl.blocked_until <= v_now) OR (arl.first_attempt_at < v_window_start) THEN
        v_now
      ELSE
        arl.first_attempt_at
    END,

    -- Último intento registrado siempre se actualiza a v_now
    last_attempt_at = v_now,

    -- Límite temporal de bloqueo activo
    blocked_until = CASE
      -- REGLA A: Si ya está bloqueado y el bloqueo sigue vigente, PRESERVAR EL BLOQUEO ACTIVO
      WHEN arl.blocked_until IS NOT NULL AND arl.blocked_until > v_now THEN
        arl.blocked_until
      -- REGLA B: Si el bloqueo anterior venció, queda libre de bloqueo (nueva ventana)
      WHEN arl.blocked_until IS NOT NULL AND arl.blocked_until <= v_now THEN
        NULL
      -- REGLA C: Si la ventana anterior venció sin bloqueo, queda libre de bloqueo
      WHEN arl.first_attempt_at < v_window_start THEN
        NULL
      -- REGLA D: Dentro de la ventana, si este nuevo intento alcanza o supera el umbral, ACTIVAR BLOQUEO
      WHEN (arl.failed_attempts + 1) >= p_max_attempts THEN
        v_lockout_until
      ELSE
        NULL
    END,

    -- Fecha de purga automática
    expires_at = CASE
      WHEN arl.blocked_until IS NOT NULL AND arl.blocked_until > v_now THEN
        arl.blocked_until + INTERVAL '1 hour'
      WHEN (arl.failed_attempts + 1) >= p_max_attempts THEN
        v_expire_at
      ELSE
        v_now + (p_window_seconds || ' seconds')::INTERVAL + INTERVAL '1 hour'
    END
  RETURNING arl.failed_attempts, arl.blocked_until INTO v_rec;

  -- 3. Limpieza oportunista acotada de registros expirados (máximo 50 por invocación, sin contención ni bloqueos prolongados)
  DELETE FROM public.admin_rate_limits
  WHERE id IN (
    SELECT id
    FROM public.admin_rate_limits
    WHERE expires_at < v_now
    LIMIT 50
    FOR UPDATE SKIP LOCKED
  );

  -- 4. Retornar estado del bloqueo
  IF v_rec.blocked_until IS NOT NULL AND v_rec.blocked_until > v_now THEN
    RETURN QUERY SELECT 
      true, 
      GREATEST(1, EXTRACT(EPOCH FROM (v_rec.blocked_until - v_now))::INTEGER),
      v_rec.failed_attempts;
  ELSE
    RETURN QUERY SELECT 
      false, 
      0, 
      v_rec.failed_attempts;
  END IF;
END;
$$;

-- 6. Función atómica para limpiar intentos tras autenticación legítima exitosa
-- PROTECCIÓN CONCURRENTE: si existe un bloqueo activo, NO lo elimina.
CREATE OR REPLACE FUNCTION public.clear_admin_attempts(
  p_key VARCHAR(64)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM public.admin_rate_limits
  WHERE id = p_key
    AND (blocked_until IS NULL OR blocked_until <= timezone('utc'::text, now()));
END;
$$;

-- 7. Revocación de permisos públicos
REVOKE EXECUTE ON FUNCTION public.check_admin_rate_limit(VARCHAR) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.record_admin_failed_attempt(VARCHAR, VARCHAR, INTEGER, INTEGER, INTEGER) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.clear_admin_attempts(VARCHAR) FROM PUBLIC;

-- 8. Concesión exclusiva a roles de infraestructura si existen en el entorno
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT ALL ON public.admin_rate_limits TO service_role;
    GRANT EXECUTE ON FUNCTION public.check_admin_rate_limit(VARCHAR) TO service_role;
    GRANT EXECUTE ON FUNCTION public.record_admin_failed_attempt(VARCHAR, VARCHAR, INTEGER, INTEGER, INTEGER) TO service_role;
    GRANT EXECUTE ON FUNCTION public.clear_admin_attempts(VARCHAR) TO service_role;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON public.admin_rate_limits FROM anon;
    REVOKE EXECUTE ON FUNCTION public.check_admin_rate_limit(VARCHAR) FROM anon;
    REVOKE EXECUTE ON FUNCTION public.record_admin_failed_attempt(VARCHAR, VARCHAR, INTEGER, INTEGER, INTEGER) FROM anon;
    REVOKE EXECUTE ON FUNCTION public.clear_admin_attempts(VARCHAR) FROM anon;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON public.admin_rate_limits FROM authenticated;
    REVOKE EXECUTE ON FUNCTION public.check_admin_rate_limit(VARCHAR) FROM authenticated;
    REVOKE EXECUTE ON FUNCTION public.record_admin_failed_attempt(VARCHAR, VARCHAR, INTEGER, INTEGER, INTEGER) FROM authenticated;
    REVOKE EXECUTE ON FUNCTION public.clear_admin_attempts(VARCHAR) FROM authenticated;
  END IF;
END $$;

COMMIT;
