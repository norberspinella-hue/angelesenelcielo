-- Migración 0006: Esquema autónomo para Altar de Luces (Cielo lleno de luces)
-- Tabla independiente y aislada. No modifica ninguna tabla existente.

CREATE TABLE IF NOT EXISTS public.altar_candles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_name TEXT NOT NULL,
  species TEXT NOT NULL DEFAULT 'perro' CHECK (species IN ('perro', 'gato', 'conejo', 'pajaro', 'caballo', 'otro')),
  author_name TEXT NOT NULL DEFAULT 'Familia amorosa',
  dedication TEXT NOT NULL,
  photo_url TEXT,
  
  -- Campos privados protegidos (nunca expuestos en consultas públicas anónimas)
  email TEXT,
  manage_token_hash TEXT,
  unsubscribe_token_hash TEXT,
  reminder_opt_in BOOLEAN NOT NULL DEFAULT true,
  commercial_opt_in BOOLEAN NOT NULL DEFAULT false,
  opted_out_at TIMESTAMPTZ,
  ip_hash TEXT,
  
  -- Vinculación de solo lectura con memoriales del Mural Global
  is_from_mural BOOLEAN NOT NULL DEFAULT false,
  is_eternal BOOLEAN NOT NULL DEFAULT false,
  memorial_id UUID REFERENCES public.memorials(id) ON DELETE SET NULL,
  mural_plan TEXT,
  
  -- Interacción comunitaria y protectoras
  warmth_count INTEGER NOT NULL DEFAULT 1,
  is_shelter_pet BOOLEAN NOT NULL DEFAULT false,
  shelter_name TEXT,
  
  -- Control de estado y ciclo vital de la llama
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'reported', 'flagged')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  reignited_at TIMESTAMPTZ,
  reignite_count INTEGER NOT NULL DEFAULT 0
);

-- Índices de alto rendimiento para consultas públicas y cálculo de contadores
CREATE INDEX IF NOT EXISTS idx_altar_candles_status_expires 
  ON public.altar_candles (status, expires_at);

CREATE INDEX IF NOT EXISTS idx_altar_candles_created_at 
  ON public.altar_candles (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_altar_candles_memorial_id 
  ON public.altar_candles (memorial_id) WHERE memorial_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_altar_candles_manage_token 
  ON public.altar_candles (manage_token_hash) WHERE manage_token_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_altar_candles_ip_hash_created 
  ON public.altar_candles (ip_hash, created_at);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.altar_candles ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública limitada a homenajes activos
DROP POLICY IF EXISTS "altar_candles_public_read" ON public.altar_candles;
CREATE POLICY "altar_candles_public_read" ON public.altar_candles
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

-- Política de administración total para el cliente de servicio (Next.js server routes)
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

GRANT SELECT ON public.altar_candles_public_view TO anon, authenticated;
