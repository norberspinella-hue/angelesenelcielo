-- ============================================================================
-- Migración 0017: Corrección comercial independiente y reversible para los
--                 planes 4×4 (16), 5×5 (25) y 6×6 (36) en Mural Global.
--
-- Alcance estricto:
--   - NO crea tablas ni reservas de espacios 3D (separado en 0018).
--   - Seguro para aplicar primero en Staging y después en Producción bajo
--     autorización explícita.
-- ============================================================================

BEGIN;

-- 1. Ampliar CHECK de memorials.slots_count para soportar los 6 planes (1, 4, 9, 16, 25, 36)
ALTER TABLE public.memorials
  DROP CONSTRAINT IF EXISTS memorials_slots_count_check;

ALTER TABLE public.memorials
  ADD CONSTRAINT memorials_slots_count_check
  CHECK (slots_count IN (1, 4, 9, 16, 25, 36));

-- 2. Backfill idempotente de los 6 registros históricos de Ángelito Protector (y 5x5/6x6 si existieran)
UPDATE public.memorials
SET slots_count = 16,
    updated_at = now()
WHERE plan_type::text = 'angelito_protector'
  AND slots_count <> 16;

UPDATE public.memorials
SET slots_count = 25,
    updated_at = now()
WHERE plan_type::text = 'galaxia_amor'
  AND slots_count <> 25;

UPDATE public.memorials
SET slots_count = 36,
    updated_at = now()
WHERE plan_type::text = 'vinculo_infinito'
  AND slots_count <> 36;

-- 3. Actualizar is_block_available para validar tamaños 1..6 y respetar holds vigentes
CREATE OR REPLACE FUNCTION public.is_block_available(
  start_x int,
  start_y int,
  block_size int
) RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  occupied_count int;
BEGIN
  IF block_size < 1 OR block_size > 6 THEN
    RETURN false;
  END IF;

  IF start_x < 0 OR start_y < 0 OR
     start_x + block_size > 1000 OR
     start_y + block_size > 1000 THEN
    RETURN false;
  END IF;

  SELECT count(*) INTO occupied_count
  FROM public.mural_slots
  WHERE x >= start_x AND x < start_x + block_size
    AND y >= start_y AND y < start_y + block_size
    AND (
      status IN ('occupied', 'blocked_admin', 'sponsor_private')
      OR (status = 'reserved_pending_payment' AND (reserved_until IS NULL OR reserved_until > now()))
    );

  RETURN occupied_count = 0;
END;
$$;

COMMIT;
