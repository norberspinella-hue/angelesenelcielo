-- Migración 0012: Tabla y función atómica de Rate Limiting persistente para Comunidad / Guardianes
-- Adecuada para entornos multi-instancia / serverless sin depender de memoria del proceso.
-- Claves seudonimizadas con HMAC-SHA256 (cero PII).

BEGIN;

CREATE TABLE IF NOT EXISTS public.community_rate_limits (
  id VARCHAR(64) PRIMARY KEY,
  action VARCHAR(32) NOT NULL CHECK (action IN ('recover', 'verify', 'create_tribute', 'publish_letter', 'revoke')),
  attempts INTEGER NOT NULL DEFAULT 1 CHECK (attempts >= 0),
  first_attempt_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  blocked_until TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_community_rate_limits_expires
  ON public.community_rate_limits (expires_at);

ALTER TABLE public.community_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.community_rate_limits FROM PUBLIC, anon, authenticated;

-- Función atómica que registra la solicitud y devuelve si está permitida dentro de la ventana
CREATE OR REPLACE FUNCTION public.consume_community_rate_limit(
  p_key VARCHAR(64),
  p_action VARCHAR(32),
  p_max_attempts INTEGER DEFAULT 10,
  p_window_seconds INTEGER DEFAULT 900,
  p_lockout_seconds INTEGER DEFAULT 900
)
RETURNS TABLE (
  allowed BOOLEAN,
  remaining_attempts INTEGER,
  retry_after_seconds INTEGER
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_now TIMESTAMPTZ := timezone('utc'::text, now());
  v_rec RECORD;
  v_new_attempts INTEGER;
  v_blocked_until TIMESTAMPTZ;
BEGIN
  IF p_key IS NULL OR length(trim(p_key)) = 0 THEN
    RAISE EXCEPTION 'p_key no puede estar vacía';
  END IF;

  IF p_max_attempts < 1 OR p_window_seconds < 1 OR p_lockout_seconds < 1 THEN
    RAISE EXCEPTION 'Parámetros de límite inválidos';
  END IF;

  -- Limpieza oportunista acotada de registros expirados
  DELETE FROM public.community_rate_limits
  WHERE id IN (
    SELECT crl.id FROM public.community_rate_limits crl
    WHERE crl.expires_at < v_now
    LIMIT 25
  );

  INSERT INTO public.community_rate_limits (
    id, action, attempts, first_attempt_at, last_attempt_at, blocked_until, expires_at
  )
  VALUES (
    p_key, p_action, 1, v_now, v_now, NULL, v_now + make_interval(secs => GREATEST(p_window_seconds, p_lockout_seconds))
  )
  ON CONFLICT (id) DO UPDATE
  SET
    -- Si el bloqueo sigue activo, mantenerlo y no reiniciar intentos
    attempts = CASE
      WHEN public.community_rate_limits.blocked_until IS NOT NULL AND public.community_rate_limits.blocked_until > v_now
        THEN public.community_rate_limits.attempts
      WHEN public.community_rate_limits.first_attempt_at + make_interval(secs => p_window_seconds) <= v_now
        THEN 1
      ELSE public.community_rate_limits.attempts + 1
    END,
    first_attempt_at = CASE
      WHEN public.community_rate_limits.blocked_until IS NOT NULL AND public.community_rate_limits.blocked_until > v_now
        THEN public.community_rate_limits.first_attempt_at
      WHEN public.community_rate_limits.first_attempt_at + make_interval(secs => p_window_seconds) <= v_now
        THEN v_now
      ELSE public.community_rate_limits.first_attempt_at
    END,
    last_attempt_at = v_now,
    blocked_until = CASE
      WHEN public.community_rate_limits.blocked_until IS NOT NULL AND public.community_rate_limits.blocked_until > v_now
        THEN public.community_rate_limits.blocked_until
      WHEN (
        CASE
          WHEN public.community_rate_limits.first_attempt_at + make_interval(secs => p_window_seconds) <= v_now THEN 1
          ELSE public.community_rate_limits.attempts + 1
        END
      ) > p_max_attempts
        THEN v_now + make_interval(secs => p_lockout_seconds)
      ELSE NULL
    END,
    expires_at = v_now + make_interval(secs => GREATEST(p_window_seconds, p_lockout_seconds))
  RETURNING public.community_rate_limits.attempts, public.community_rate_limits.blocked_until
  INTO v_rec;

  v_new_attempts := v_rec.attempts;
  v_blocked_until := v_rec.blocked_until;

  IF v_blocked_until IS NOT NULL AND v_blocked_until > v_now THEN
    RETURN QUERY SELECT
      FALSE,
      0,
      GREATEST(1, EXTRACT(EPOCH FROM (v_blocked_until - v_now))::INTEGER);
  ELSE
    RETURN QUERY SELECT
      TRUE,
      GREATEST(0, p_max_attempts - v_new_attempts),
      0;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_community_rate_limit(VARCHAR, VARCHAR, INTEGER, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_community_rate_limit(VARCHAR, VARCHAR, INTEGER, INTEGER, INTEGER) TO postgres;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    GRANT EXECUTE ON FUNCTION public.consume_community_rate_limit(VARCHAR, VARCHAR, INTEGER, INTEGER, INTEGER) TO service_role;
  END IF;
END
$$;

COMMIT;
