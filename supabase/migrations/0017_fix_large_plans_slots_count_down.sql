-- ============================================================================
-- Rollback NO DESTRUCTIVO de Migración 0017
--
-- Política de seguridad:
--   - Jamás degrada ni modifica slots_count de compras legítimas (16, 25 o 36).
--   - Impide estrechar el CHECK si existen registros con 16, 25 o 36 casillas;
--     en caso de rollback de aplicación, debe revertirse únicamente código
--     compatible conservando el esquema ampliado y el índice de unicidad.
-- ============================================================================

BEGIN;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.memorials WHERE slots_count IN (16, 25, 36)) THEN
    RAISE EXCEPTION 'Reversión bloqueada: existen registros válidos con 16, 25 o 36 casillas. Conservar esquema ampliado y memorials_stripe_session_id_uidx; revertir solo código compatible.';
  END IF;
END $$;

DROP INDEX IF EXISTS public.memorials_stripe_session_id_uidx;

ALTER TABLE public.memorials
  DROP CONSTRAINT IF EXISTS memorials_slots_count_check;

ALTER TABLE public.memorials
  ADD CONSTRAINT memorials_slots_count_check
  CHECK (slots_count IN (1, 4, 9));

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
  IF start_x < 0 OR start_y < 0 OR
     start_x + block_size > 1000 OR
     start_y + block_size > 1000 THEN
    RETURN false;
  END IF;

  SELECT count(*) INTO occupied_count
  FROM public.mural_slots
  WHERE x >= start_x AND x < start_x + block_size
    AND y >= start_y AND y < start_y + block_size
    AND status != 'available';

  RETURN occupied_count = 0;
END;
$$;

COMMIT;
