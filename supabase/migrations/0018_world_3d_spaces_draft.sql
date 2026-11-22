-- ============================================================================
-- Migración 0018 (BORRADOR / PENDIENTE DE APROBACIÓN FUTURA):
--   Tablas y RPCs de reservas coordinadas Mural Global <-> Mundo 3D
--   Separada deliberadamente de 0017 para no mezclar correcciones comerciales
--   de planes existentes con compras/reservas 3D todavía no activadas.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.world_spaces (
  space_id          TEXT PRIMARY KEY,
  zone              TEXT NOT NULL,
  support_type      TEXT NOT NULL,
  display_name      TEXT NOT NULL,
  plan_id           TEXT NOT NULL CHECK (plan_id IN (
    'huellita', 'estrella_brillante', 'corazon_eterno',
    'angelito_protector', 'galaxia_amor', 'vinculo_infinito'
  )),
  is_sellable       BOOLEAN NOT NULL DEFAULT FALSE,
  is_reserved_admin BOOLEAN NOT NULL DEFAULT FALSE,
  supports_photo    BOOLEAN NOT NULL DEFAULT TRUE,
  coords_json       JSONB NOT NULL DEFAULT '{}'::jsonb,
  camera_json       JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata_json     JSONB NOT NULL DEFAULT '{}'::jsonb,
  catalog_version   TEXT NOT NULL DEFAULT 'piloto_75_1',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_world_spaces_plan_sellable
  ON public.world_spaces (plan_id, is_sellable, is_reserved_admin);

CREATE TABLE IF NOT EXISTS public.world_space_allocations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id           TEXT NOT NULL,
  plan_id            TEXT NOT NULL CHECK (plan_id IN (
    'huellita', 'estrella_brillante', 'corazon_eterno',
    'angelito_protector', 'galaxia_amor', 'vinculo_infinito'
  )),
  memorial_id        UUID REFERENCES public.memorials(id) ON DELETE SET NULL,
  stripe_session_id  TEXT,
  mural_start_x      INT CHECK (mural_start_x >= 0 AND mural_start_x < 1000),
  mural_start_y      INT CHECK (mural_start_y >= 0 AND mural_start_y < 1000),
  block_size         INT CHECK (block_size BETWEEN 1 AND 6),
  status             TEXT NOT NULL CHECK (status IN (
    'reserved_pending_payment', 'occupied', 'expired', 'released', 'cancelled'
  )),
  entitlement_source TEXT NOT NULL DEFAULT 'new_checkout' CHECK (entitlement_source IN (
    'new_checkout', 'existing_paid_memorial', 'admin_migration'
  )),
  hold_token         TEXT NOT NULL,
  expires_at         TIMESTAMPTZ,
  confirmed_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_world_space_active_allocation
  ON public.world_space_allocations (space_id)
  WHERE status IN ('reserved_pending_payment', 'occupied');

CREATE UNIQUE INDEX IF NOT EXISTS uq_world_memorial_active_allocation
  ON public.world_space_allocations (memorial_id)
  WHERE memorial_id IS NOT NULL AND status = 'occupied';

CREATE INDEX IF NOT EXISTS idx_world_alloc_session
  ON public.world_space_allocations (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_world_alloc_expires
  ON public.world_space_allocations (expires_at)
  WHERE status = 'reserved_pending_payment';

ALTER TABLE public.world_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_space_allocations ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.world_spaces FROM anon, authenticated;
REVOKE ALL ON public.world_space_allocations FROM anon, authenticated;

DROP POLICY IF EXISTS "public_read_world_spaces" ON public.world_spaces;
CREATE POLICY "public_read_world_spaces"
  ON public.world_spaces FOR SELECT
  USING (is_sellable = TRUE OR is_reserved_admin = TRUE);

DROP POLICY IF EXISTS "public_read_confirmed_world_allocations" ON public.world_space_allocations;
CREATE POLICY "public_read_confirmed_world_allocations"
  ON public.world_space_allocations FOR SELECT
  USING (status = 'occupied');

CREATE OR REPLACE FUNCTION public.release_expired_coordinated_holds()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_released INT := 0;
BEGIN
  UPDATE public.world_space_allocations
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'reserved_pending_payment'
    AND expires_at IS NOT NULL
    AND expires_at <= now();

  GET DIAGNOSTICS v_released = ROW_COUNT;

  UPDATE public.mural_slots
  SET status = 'available',
      reserved_until = NULL,
      updated_at = now()
  WHERE status = 'reserved_pending_payment'
    AND memorial_id IS NULL
    AND reserved_until IS NOT NULL
    AND reserved_until <= now();

  RETURN v_released;
END;
$$;

CREATE OR REPLACE FUNCTION public.acquire_coordinated_hold(
  p_space_id TEXT,
  p_plan_id TEXT,
  p_start_x INT,
  p_start_y INT,
  p_block_size INT,
  p_hold_token TEXT,
  p_ttl_minutes INT DEFAULT 20
)
RETURNS TABLE (
  acquired BOOLEAN,
  allocation_id UUID,
  reason TEXT,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_expires TIMESTAMPTZ := now() + make_interval(mins => GREATEST(5, LEAST(p_ttl_minutes, 60)));
  v_alloc_id UUID;
  v_dx INT;
  v_dy INT;
BEGIN
  PERFORM public.release_expired_coordinated_holds();

  IF NOT public.is_block_available(p_start_x, p_start_y, p_block_size) THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'MURAL_BLOCK_UNAVAILABLE'::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.world_space_allocations
    WHERE space_id = p_space_id
      AND status IN ('reserved_pending_payment', 'occupied')
  ) THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'WORLD_SPACE_UNAVAILABLE'::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  FOR v_dx IN 0..(p_block_size - 1) LOOP
    FOR v_dy IN 0..(p_block_size - 1) LOOP
      INSERT INTO public.mural_slots (x, y, status, reserved_until)
      VALUES (p_start_x + v_dx, p_start_y + v_dy, 'reserved_pending_payment', v_expires)
      ON CONFLICT (x, y) DO UPDATE
        SET status = 'reserved_pending_payment',
            reserved_until = v_expires,
            updated_at = now()
      WHERE public.mural_slots.status = 'available'
         OR (public.mural_slots.status = 'reserved_pending_payment' AND public.mural_slots.reserved_until <= now());
    END LOOP;
  END LOOP;

  INSERT INTO public.world_space_allocations (
    space_id, plan_id, mural_start_x, mural_start_y, block_size,
    status, entitlement_source, hold_token, expires_at
  )
  VALUES (
    p_space_id, p_plan_id, p_start_x, p_start_y, p_block_size,
    'reserved_pending_payment', 'new_checkout', p_hold_token, v_expires
  )
  RETURNING id INTO v_alloc_id;

  RETURN QUERY SELECT TRUE, v_alloc_id, 'OK'::TEXT, v_expires;
END;
$$;

COMMIT;
