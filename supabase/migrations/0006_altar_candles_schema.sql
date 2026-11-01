-- Migración 0006: Esquema autónomo para Altar de Luces (Cielo lleno de luces)
-- Totalmente aislado e independiente. CERO claves foráneas ni dependencias de integridad sobre tablas existentes.

CREATE TABLE IF NOT EXISTS public.altar_candles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_name VARCHAR(100) NOT NULL,
  species VARCHAR(20) NOT NULL DEFAULT 'perro' CHECK (species IN ('perro', 'gato', 'conejo', 'pajaro', 'caballo', 'otro')),
  author_name VARCHAR(100) NOT NULL DEFAULT 'Familia amorosa',
  dedication TEXT NOT NULL,
  photo_url VARCHAR(1000),
  
  -- Campos privados protegidos (nunca expuestos en consultas públicas anónimas)
  email VARCHAR(255),
  manage_token_hash VARCHAR(128),
  unsubscribe_token_hash VARCHAR(128),
  reminder_opt_in BOOLEAN NOT NULL DEFAULT true,
  commercial_opt_in BOOLEAN NOT NULL DEFAULT false,
  opted_out_at TIMESTAMPTZ,
  ip_hash VARCHAR(128),
  
  -- Vinculación puramente lógica con memoriales del Mural Global (SIN FK para aislamiento total)
  is_from_mural BOOLEAN NOT NULL DEFAULT false,
  is_eternal BOOLEAN NOT NULL DEFAULT false,
  memorial_id UUID,
  mural_plan VARCHAR(50),
  
  -- Interacción comunitaria y protectoras
  warmth_count INTEGER NOT NULL DEFAULT 1,
  is_shelter_pet BOOLEAN NOT NULL DEFAULT false,
  shelter_name VARCHAR(100),
  
  -- Control de estado y ciclo vital de la llama
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'reported', 'flagged')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  reignited_at TIMESTAMPTZ,
  reignite_count INTEGER NOT NULL DEFAULT 0,
  
  -- Campos de auditoría y prevención de duplicados de correo (idempotencia)
  pre_reminder_sent_at TIMESTAMPTZ,
  extinguished_notice_sent_at TIMESTAMPTZ
);

-- Índices de alto rendimiento para consultas y recuentos
CREATE INDEX IF NOT EXISTS idx_altar_candles_status_expires 
  ON public.altar_candles (status, expires_at);

CREATE INDEX IF NOT EXISTS idx_altar_candles_created_at 
  ON public.altar_candles (created_at DESC);

-- Restricción estricta de unicidad parcial: impide duplicar tarjetas de un mismo memorial
CREATE UNIQUE INDEX IF NOT EXISTS uq_altar_candles_memorial_id 
  ON public.altar_candles (memorial_id) WHERE memorial_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_altar_candles_manage_token 
  ON public.altar_candles (manage_token_hash) WHERE manage_token_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_altar_candles_ip_hash_created 
  ON public.altar_candles (ip_hash, created_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.altar_candles ENABLE ROW LEVEL SECURITY;

-- Revocación total de acceso a la tabla base con datos personales para roles públicos
REVOKE ALL ON public.altar_candles FROM anon, authenticated;

-- Acceso administrativo exclusivo para service_role (API Next.js de servidor)
DROP POLICY IF EXISTS "altar_candles_service_role_all" ON public.altar_candles;
CREATE POLICY "altar_candles_service_role_all" ON public.altar_candles
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Vista pública sanitizada (proyección estricta sin datos privados)
CREATE OR REPLACE VIEW public.altar_candles_public_view AS
SELECT 
  id,
  pet_name,
  species,
  author_name,
  dedication,
  photo_url,
  is_from_mural,
  is_eternal,
  warmth_count,
  is_shelter_pet,
  shelter_name,
  status,
  created_at,
  expires_at,
  reignited_at,
  reignite_count,
  memorial_id
FROM public.altar_candles
WHERE status = 'active';

-- Revocación total de acceso directo a la vista para anon y authenticated.
-- Toda la lectura pública se canaliza exclusivamente a través del endpoint de servidor Next.js (/api/community/candles).
REVOKE ALL ON public.altar_candles_public_view FROM anon, authenticated;
GRANT SELECT ON public.altar_candles_public_view TO service_role;

-- Tabla independiente para configuración y estado compartido en Vercel
CREATE TABLE IF NOT EXISTS public.altar_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by VARCHAR(100)
);

ALTER TABLE public.altar_settings ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.altar_settings FROM anon, authenticated;

DROP POLICY IF EXISTS "altar_settings_service_role_all" ON public.altar_settings;
CREATE POLICY "altar_settings_service_role_all" ON public.altar_settings
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Estado inicial desactivado por defecto (Fail-safe)
INSERT INTO public.altar_settings (key, value, updated_at, updated_by)
VALUES (
  'system_config',
  '{"persistence_enabled": false, "reminders_cron_enabled": false, "audit_log": [{"timestamp": "2026-11-01T17:20:00Z", "actor": "phase-a-setup", "reason": "Inicialización segura con altar y cron desactivados"}]}'::jsonb,
  now(),
  'setup'
)
ON CONFLICT (key) DO NOTHING;

-- Tabla de auditoría de ejecuciones cron para evitar concurrencia y registrar envíos
CREATE TABLE IF NOT EXISTS public.altar_cron_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  pre_reminders_sent INTEGER NOT NULL DEFAULT 0,
  extinguished_notices_sent INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'running',
  error_message TEXT
);

ALTER TABLE public.altar_cron_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.altar_cron_logs FROM anon, authenticated;

DROP POLICY IF EXISTS "altar_cron_logs_service_role_all" ON public.altar_cron_logs;
CREATE POLICY "altar_cron_logs_service_role_all" ON public.altar_cron_logs
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);
