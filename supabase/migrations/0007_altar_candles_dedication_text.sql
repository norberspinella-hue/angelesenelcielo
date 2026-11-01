-- Migración 0007: Modificación segura de dedication a TEXT en altar_candles
-- Resuelve la dependencia de regla/vista en PostgreSQL (rule _RETURN on view altar_candles_public_view)
-- Totalmente transaccional: Si ocurre cualquier fallo, revierte de inmediato mediante ROLLBACK.

BEGIN;

-- 1. Eliminar temporalmente solo la vista pública dependiente (SIN usar CASCADE)
DROP VIEW IF EXISTS public.altar_candles_public_view;

-- 2. Modificar el tipo de columna dedication de VARCHAR(500) a TEXT en la tabla base
ALTER TABLE public.altar_candles 
  ALTER COLUMN dedication TYPE TEXT;

-- 3. Recrear exactamente la misma vista pública sanitizada (17 columnas y filtro status = 'active')
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

-- 4. Restablecer la política de seguridad estricta para la vista
-- Revocación total para roles públicos/anónimos; lectura exclusiva para el backend (service_role)
REVOKE ALL ON public.altar_candles_public_view FROM anon, authenticated;
GRANT SELECT ON public.altar_candles_public_view TO service_role;

-- 5. Verificación automatizada de integridad dentro de la transacción
DO $$
DECLARE
  v_col_type TEXT;
  v_count INT;
BEGIN
  -- Verificar que la columna en la tabla base es de tipo TEXT
  SELECT data_type INTO v_col_type
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'altar_candles' 
    AND column_name = 'dedication';

  IF v_col_type <> 'text' THEN
    RAISE EXCEPTION 'Fallo de verificación: dedication no es de tipo TEXT (se detectó: %)', v_col_type;
  END IF;

  -- Verificar que las 3 velas existentes (Chloé, House, Mary Margaret) continúan intactas
  SELECT COUNT(*) INTO v_count
  FROM public.altar_candles;

  IF v_count <> 3 THEN
    RAISE EXCEPTION 'Fallo de verificación: el recuento de velas existentes cambió (esperado: 3, actual: %)', v_count;
  END IF;
END $$;

COMMIT;
