-- ============================================================================
-- Rollback reversible de Migración 0017 (solo en caso de necesitar volver atrás)
-- ============================================================================

BEGIN;

-- Restaura el estado previo de los registros 4x4/5x5/6x6 antes de re-aplicar el constraint anterior
UPDATE public.memorials
SET slots_count = 9,
    updated_at = now()
WHERE slots_count IN (16, 25, 36);

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
