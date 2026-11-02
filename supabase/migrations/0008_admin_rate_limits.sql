-- Migración 0008: Tabla y funciones atómicas de limitación de tasa administrativa (Rate Limiting)
-- Totalmente aislada e independiente. Comportamiento Fail-Closed, HMAC-SHA256, cero PII.

-- 1. Tabla relacional de control de intentos de acceso administrativo
CREATE TABLE IF NOT EXISTS public.admin_rate_limits (
  id VARCHAR(64) PRIMARY KEY,                         -- Hash HMAC-SHA256 seudonimizado (64 hex)
  scope VARCHAR(16) NOT NULL DEFAULT 'ip',            -- Ámbito: 'ip' o 'global'
  failed_attempts INTEGER NOT NULL DEFAULT 1,         -- Conteo atómico de intentos fallidos
  first_attempt_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()), -- Inicio de ventana deslizante
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),  -- Último intento registrado
  blocked_until TIMESTAMPTZ,                          -- Límite temporal de bloqueo activo (NULL si no bloqueado)
  expires_at TIMESTAMPTZ NOT NULL                     -- Fecha de purga automática
);

-- 2. Índice para acelerar la comprobación y purga de expirados
CREATE INDEX IF NOT EXISTS idx_admin_rate_limits_expires 
  ON public.admin_rate_limits (expires_at);

CREATE INDEX IF NOT EXISTS idx_admin_rate_limits_blocked 
  ON public.admin_rate_limits (blocked_until) WHERE blocked_until IS NOT NULL;

-- 3. Seguridad a nivel de fila (RLS) y permisos mínimos estrictos
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
SECURITY DEFINER
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

-- 5. Función atómica para registrar intento fallido y decidir bloqueo sin condiciones de carrera
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
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_window_start TIMESTAMPTZ := v_now - (p_window_seconds || ' seconds')::INTERVAL;
  v_lockout_until TIMESTAMPTZ := v_now + (p_lockout_seconds || ' seconds')::INTERVAL;
  v_expire_at TIMESTAMPTZ := v_lockout_until + INTERVAL '1 hour';
  v_rec RECORD;
  v_new_attempts INTEGER;
  v_new_blocked TIMESTAMPTZ := NULL;
BEGIN
  -- Bloqueo atómico a nivel de fila (FOR UPDATE)
  SELECT * INTO v_rec
  FROM public.admin_rate_limits
  WHERE id = p_key
  FOR UPDATE;

  IF NOT FOUND THEN
    -- Primer intento fallido para este identificador
    INSERT INTO public.admin_rate_limits (
      id, scope, failed_attempts, first_attempt_at, last_attempt_at, blocked_until, expires_at
    ) VALUES (
      p_key, p_scope, 1, v_now, v_now, NULL, v_now + (p_window_seconds || ' seconds')::INTERVAL + INTERVAL '1 hour'
    );
    RETURN QUERY SELECT false, 0, 1;
    RETURN;
  END IF;

  -- Si ya está bloqueado y el bloqueo sigue vigente, registrar el incremento y mantener el bloqueo
  IF v_rec.blocked_until IS NOT NULL AND v_rec.blocked_until > v_now THEN
    v_new_attempts := v_rec.failed_attempts + 1;
    UPDATE public.admin_rate_limits
    SET failed_attempts = v_new_attempts,
        last_attempt_at = v_now
    WHERE id = p_key;

    RETURN QUERY SELECT 
      true, 
      GREATEST(1, EXTRACT(EPOCH FROM (v_rec.blocked_until - v_now))::INTEGER),
      v_new_attempts;
    RETURN;
  END IF;

  -- Si la ventana anterior ya expiró, reiniciar conteo
  IF v_rec.first_attempt_at < v_window_start THEN
    v_new_attempts := 1;
    UPDATE public.admin_rate_limits
    SET failed_attempts = 1,
        first_attempt_at = v_now,
        last_attempt_at = v_now,
        blocked_until = NULL,
        expires_at = v_now + (p_window_seconds || ' seconds')::INTERVAL + INTERVAL '1 hour'
    WHERE id = p_key;

    RETURN QUERY SELECT false, 0, 1;
    RETURN;
  END IF;

  -- Dentro de la ventana deslizante: incremento atómico
  v_new_attempts := v_rec.failed_attempts + 1;
  IF v_new_attempts >= p_max_attempts THEN
    v_new_blocked := v_lockout_until;
    UPDATE public.admin_rate_limits
    SET failed_attempts = v_new_attempts,
        last_attempt_at = v_now,
        blocked_until = v_new_blocked,
        expires_at = v_expire_at
    WHERE id = p_key;

    RETURN QUERY SELECT 
      true,
      GREATEST(1, EXTRACT(EPOCH FROM (v_new_blocked - v_now))::INTEGER),
      v_new_attempts;
    RETURN;
  ELSE
    UPDATE public.admin_rate_limits
    SET failed_attempts = v_new_attempts,
        last_attempt_at = v_now
    WHERE id = p_key;

    RETURN QUERY SELECT false, 0, v_new_attempts;
    RETURN;
  END IF;
END;
$$;

-- 6. Función atómica para limpiar intentos tras autenticación legítima exitosa
CREATE OR REPLACE FUNCTION public.clear_admin_attempts(
  p_key VARCHAR(64)
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
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
