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

-- 3. Seguridad a nivel de fila (RLS) y permisos mínimos exclusivos para service_role
ALTER TABLE public.admin_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.admin_rate_limits FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.admin_rate_limits TO service_role;

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
-- Protege contra condiciones de carrera incluso con tabla fría/vacía.
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

  -- 2. Operación atómica de inserción o actualización (inmune a carreras en tabla vacía)
  INSERT INTO public.admin_rate_limits AS arl (
    id, scope, failed_attempts, first_attempt_at, last_attempt_at, blocked_until, expires_at
  )
  VALUES (
    p_key, p_scope, 1, v_now, v_now, NULL, v_now + (p_window_seconds || ' seconds')::INTERVAL + INTERVAL '1 hour'
  )
  ON CONFLICT (id) DO UPDATE SET
    failed_attempts = CASE
      -- Si la ventana anterior ya expiró, reiniciar conteo a 1
      WHEN arl.first_attempt_at < v_window_start THEN 1
      -- Si está bloqueado o en ventana, incrementar
      ELSE arl.failed_attempts + 1
    END,
    first_attempt_at = CASE
      WHEN arl.first_attempt_at < v_window_start THEN v_now
      ELSE arl.first_attempt_at
    END,
    last_attempt_at = v_now,
    blocked_until = CASE
      -- Si ya está bloqueado y el bloqueo sigue vigente, mantener bloqueo
      WHEN arl.blocked_until IS NOT NULL AND arl.blocked_until > v_now THEN arl.blocked_until
      -- Si la ventana expiró, reiniciar sin bloqueo
      WHEN arl.first_attempt_at < v_window_start THEN NULL
      -- Si el nuevo intento alcanza o supera el máximo, activar bloqueo
      WHEN (arl.failed_attempts + 1) >= p_max_attempts THEN v_lockout_until
      ELSE NULL
    END,
    expires_at = CASE
      WHEN (arl.failed_attempts + 1) >= p_max_attempts OR (arl.blocked_until IS NOT NULL AND arl.blocked_until > v_now)
        THEN v_expire_at
      ELSE v_now + (p_window_seconds || ' seconds')::INTERVAL + INTERVAL '1 hour'
    END
  RETURNING arl.failed_attempts, arl.blocked_until INTO v_rec;

  -- 3. Limpieza oportunista de registros expirados (sin cron adicional)
  DELETE FROM public.admin_rate_limits
  WHERE expires_at < v_now;

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
CREATE OR REPLACE FUNCTION public.clear_admin_attempts(
  p_key VARCHAR(64)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  DELETE FROM public.admin_rate_limits WHERE id = p_key;
END;
$$;

-- 7. Revocación total de permisos públicos y concesión exclusiva a service_role
REVOKE EXECUTE ON FUNCTION public.check_admin_rate_limit(VARCHAR) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.record_admin_failed_attempt(VARCHAR, VARCHAR, INTEGER, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.clear_admin_attempts(VARCHAR) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.check_admin_rate_limit(VARCHAR) TO service_role;
GRANT EXECUTE ON FUNCTION public.record_admin_failed_attempt(VARCHAR, VARCHAR, INTEGER, INTEGER, INTEGER) TO service_role;
GRANT EXECUTE ON FUNCTION public.clear_admin_attempts(VARCHAR) TO service_role;

COMMIT;
