-- ============================================================================
-- Migración 0018 (PILOTO STAGING):
--   Inventario oficial de 3.630 ubicaciones 3D, conciliación de 16 proyecciones
--   históricas, reclamación de titularidad por Magic Link y reservas
--   coordinadas Mural Global <-> Mundo 3D.
--
--   Mantiene ventas reales desactivadas (`is_sellable = FALSE` por defecto).
--   NO aplicar en Supabase Production sin autorización comercial expresa.
-- ============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.world_spaces (
  space_id          TEXT PRIMARY KEY,
  zone              TEXT NOT NULL,
  scene             TEXT NOT NULL DEFAULT 'exterior',
  support_type      TEXT NOT NULL,
  display_name      TEXT NOT NULL,
  plan_id           TEXT NOT NULL CHECK (plan_id IN (
    'huellita', 'estrella_brillante', 'corazon_eterno',
    'angelito_protector', 'galaxia_amor', 'vinculo_infinito'
  )),
  occupancy_state   TEXT NOT NULL DEFAULT 'free' CHECK (occupancy_state IN (
    'free', 'historical_projection', 'review_hold', 'occupied', 'protected_special'
  )),
  is_sellable       BOOLEAN NOT NULL DEFAULT FALSE,
  is_reserved_admin BOOLEAN NOT NULL DEFAULT FALSE,
  supports_photo    BOOLEAN NOT NULL DEFAULT TRUE,
  coords_json       JSONB NOT NULL DEFAULT '{}'::jsonb,
  camera_json       JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata_json     JSONB NOT NULL DEFAULT '{}'::jsonb,
  catalog_version   TEXT NOT NULL DEFAULT 'piloto_v75.1',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.world_spaces
  ADD COLUMN IF NOT EXISTS scene TEXT NOT NULL DEFAULT 'exterior';

ALTER TABLE public.world_spaces
  ADD COLUMN IF NOT EXISTS occupancy_state TEXT NOT NULL DEFAULT 'free';

ALTER TABLE public.world_spaces
  DROP CONSTRAINT IF EXISTS world_spaces_occupancy_state_check;

ALTER TABLE public.world_spaces
  ADD CONSTRAINT world_spaces_occupancy_state_check
  CHECK (occupancy_state IN ('free', 'historical_projection', 'review_hold', 'occupied', 'protected_special'));

CREATE INDEX IF NOT EXISTS idx_world_spaces_plan_sellable
  ON public.world_spaces (plan_id, is_sellable, is_reserved_admin, occupancy_state);

CREATE TABLE IF NOT EXISTS public.world_space_allocations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id           TEXT NOT NULL REFERENCES public.world_spaces(space_id) ON DELETE RESTRICT,
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

CREATE INDEX IF NOT EXISTS idx_world_alloc_hold_token
  ON public.world_space_allocations (hold_token);

CREATE INDEX IF NOT EXISTS idx_world_alloc_expires
  ON public.world_space_allocations (expires_at)
  WHERE status = 'reserved_pending_payment';

-- Tokens de Magic Link exclusivos para titularidad comercial del Mural Global
-- (completamente independientes de community_guardian_tokens de Cartas al Cielo)
CREATE TABLE IF NOT EXISTS public.world_3d_claim_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memorial_id  UUID NOT NULL REFERENCES public.memorials(id) ON DELETE CASCADE,
  space_id     TEXT NOT NULL REFERENCES public.world_spaces(space_id) ON DELETE RESTRICT,
  email_hash   TEXT NOT NULL,
  token_hash   TEXT NOT NULL UNIQUE,
  expires_at   TIMESTAMPTZ NOT NULL,
  consumed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_world_3d_claim_memorial
  ON public.world_3d_claim_tokens (memorial_id, created_at DESC);

ALTER TABLE public.world_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_space_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.world_3d_claim_tokens ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.world_spaces FROM anon, authenticated;
REVOKE ALL ON public.world_space_allocations FROM anon, authenticated;
REVOKE ALL ON public.world_3d_claim_tokens FROM anon, authenticated;

DROP POLICY IF EXISTS "public_read_world_spaces" ON public.world_spaces;
CREATE POLICY "public_read_world_spaces"
  ON public.world_spaces FOR SELECT
  USING (TRUE);

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
  v_expires TIMESTAMPTZ := now() + make_interval(mins => GREATEST(1, LEAST(p_ttl_minutes, 60)));
  v_alloc_id UUID;
  v_space public.world_spaces%ROWTYPE;
  v_dx INT;
  v_dy INT;
BEGIN
  PERFORM public.release_expired_coordinated_holds();

  SELECT * INTO v_space
  FROM public.world_spaces
  WHERE space_id = p_space_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'WORLD_SPACE_NOT_FOUND'::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  IF v_space.plan_id <> p_plan_id THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'PLAN_MISMATCH'::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  IF v_space.is_reserved_admin OR v_space.occupancy_state <> 'free' THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'SPACE_PENDING_RECONCILIATION_OR_PROTECTED'::TEXT, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

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
EXCEPTION
  WHEN unique_violation THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'WORLD_SPACE_UNAVAILABLE'::TEXT, NULL::TIMESTAMPTZ;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_coordinated_hold(
  p_hold_token TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_alloc public.world_space_allocations%ROWTYPE;
BEGIN
  SELECT * INTO v_alloc
  FROM public.world_space_allocations
  WHERE hold_token = p_hold_token
    AND status = 'reserved_pending_payment'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  UPDATE public.world_space_allocations
  SET status = 'released',
      updated_at = now()
  WHERE id = v_alloc.id;

  IF v_alloc.mural_start_x IS NOT NULL AND v_alloc.mural_start_y IS NOT NULL AND v_alloc.block_size IS NOT NULL THEN
    UPDATE public.mural_slots
    SET status = 'available',
        reserved_until = NULL,
        updated_at = now()
    WHERE x >= v_alloc.mural_start_x AND x < v_alloc.mural_start_x + v_alloc.block_size
      AND y >= v_alloc.mural_start_y AND y < v_alloc.mural_start_y + v_alloc.block_size
      AND status = 'reserved_pending_payment'
      AND memorial_id IS NULL;
  END IF;

  RETURN TRUE;
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_world_3d_allocation(
  p_space_id TEXT,
  p_plan_id TEXT,
  p_memorial_id UUID,
  p_stripe_session_id TEXT,
  p_start_x INT,
  p_start_y INT,
  p_block_size INT,
  p_hold_token TEXT,
  p_entitlement_source TEXT DEFAULT 'new_checkout'
)
RETURNS TABLE (
  confirmed BOOLEAN,
  allocation_id UUID,
  reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_existing_mem UUID;
  v_space public.world_spaces%ROWTYPE;
  v_hold public.world_space_allocations%ROWTYPE;
  v_alloc_id UUID;
BEGIN
  -- Protección inamovible de Chloé y Juliette
  IF p_memorial_id IN (
    '2a755a51-b8a6-46cc-96da-965c402eb198'::uuid,
    '6dfba1cc-f7c9-446c-96d4-1d9bab3c2fc0'::uuid
  ) THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'SPECIAL_MEMORIAL_PROTECTED'::TEXT;
    RETURN;
  END IF;

  -- Idempotencia por memorial: si ya tiene plaza confirmada, devolver la misma sin duplicar ni reubicar
  SELECT id INTO v_existing_mem
  FROM public.world_space_allocations
  WHERE memorial_id = p_memorial_id
    AND status = 'occupied'
  LIMIT 1;

  IF v_existing_mem IS NOT NULL THEN
    RETURN QUERY SELECT TRUE, v_existing_mem, 'ALREADY_CONFIRMED'::TEXT;
    RETURN;
  END IF;

  PERFORM public.release_expired_coordinated_holds();

  SELECT * INTO v_space
  FROM public.world_spaces
  WHERE space_id = p_space_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'WORLD_SPACE_NOT_FOUND'::TEXT;
    RETURN;
  END IF;

  IF v_space.plan_id <> p_plan_id THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'PLAN_MISMATCH'::TEXT;
    RETURN;
  END IF;

  IF v_space.is_reserved_admin OR v_space.occupancy_state <> 'free' THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'SPACE_PENDING_RECONCILIATION_OR_PROTECTED'::TEXT;
    RETURN;
  END IF;

  -- Comprobar si otra familia distinta ocupó o reservó este space_id mientras tanto
  IF EXISTS (
    SELECT 1 FROM public.world_space_allocations
    WHERE space_id = p_space_id
      AND status IN ('reserved_pending_payment', 'occupied')
      AND (p_hold_token IS NULL OR hold_token <> p_hold_token)
  ) THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'WORLD_SPACE_CONFLICT_AFTER_EXPIRY'::TEXT;
    RETURN;
  END IF;

  -- Recuperar reserva vigente o caducada (pago tardío) por hold_token si aún sigue libre
  IF p_hold_token IS NOT NULL AND p_hold_token <> '' THEN
    SELECT * INTO v_hold
    FROM public.world_space_allocations
    WHERE hold_token = p_hold_token
      AND space_id = p_space_id
    ORDER BY created_at DESC
    LIMIT 1
    FOR UPDATE;
  END IF;

  IF FOUND AND v_hold.status IN ('reserved_pending_payment', 'expired') THEN
    UPDATE public.world_space_allocations
    SET status = 'occupied',
        memorial_id = p_memorial_id,
        stripe_session_id = COALESCE(p_stripe_session_id, stripe_session_id),
        mural_start_x = COALESCE(p_start_x, mural_start_x),
        mural_start_y = COALESCE(p_start_y, mural_start_y),
        block_size = COALESCE(p_block_size, block_size),
        entitlement_source = p_entitlement_source,
        confirmed_at = now(),
        expires_at = NULL,
        updated_at = now()
    WHERE id = v_hold.id
    RETURNING id INTO v_alloc_id;
  ELSE
    INSERT INTO public.world_space_allocations (
      space_id, plan_id, memorial_id, stripe_session_id,
      mural_start_x, mural_start_y, block_size,
      status, entitlement_source, hold_token, confirmed_at
    )
    VALUES (
      p_space_id, p_plan_id, p_memorial_id, p_stripe_session_id,
      p_start_x, p_start_y, p_block_size,
      'occupied', p_entitlement_source, COALESCE(NULLIF(p_hold_token, ''), gen_random_uuid()::text), now()
    )
    RETURNING id INTO v_alloc_id;
  END IF;

  UPDATE public.world_spaces
  SET occupancy_state = 'occupied',
      updated_at = now()
  WHERE space_id = p_space_id;

  RETURN QUERY SELECT TRUE, v_alloc_id, 'CONFIRMED'::TEXT;
EXCEPTION
  WHEN unique_violation THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, 'WORLD_SPACE_CONFLICT'::TEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_world_space_with_token(
  p_token_hash TEXT
)
RETURNS TABLE (
  claimed BOOLEAN,
  allocation_id UUID,
  memorial_id UUID,
  space_id TEXT,
  plan_id TEXT,
  reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
#variable_conflict use_column
DECLARE
  v_tok public.world_3d_claim_tokens%ROWTYPE;
  v_mem public.memorials%ROWTYPE;
  v_space public.world_spaces%ROWTYPE;
  v_mem_plan TEXT;
  v_coords TEXT[];
  v_x INT := NULL;
  v_y INT := NULL;
  v_alloc_id UUID;
BEGIN
  SELECT * INTO v_tok
  FROM public.world_3d_claim_tokens wct
  WHERE wct.token_hash = p_token_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, NULL::TEXT, NULL::TEXT, 'TOKEN_INVALID'::TEXT;
    RETURN;
  END IF;

  IF v_tok.consumed_at IS NOT NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, v_tok.memorial_id, v_tok.space_id, NULL::TEXT, 'TOKEN_ALREADY_USED'::TEXT;
    RETURN;
  END IF;

  IF v_tok.expires_at <= now() THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, v_tok.memorial_id, v_tok.space_id, NULL::TEXT, 'TOKEN_EXPIRED'::TEXT;
    RETURN;
  END IF;

  SELECT * INTO v_mem FROM public.memorials m WHERE m.id = v_tok.memorial_id;
  IF NOT FOUND OR v_mem.payment_status <> 'paid' OR v_mem.publication_status <> 'published' OR v_mem.moderation_status = 'rejected' THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, v_tok.memorial_id, v_tok.space_id, NULL::TEXT, 'MEMORIAL_INELIGIBLE'::TEXT;
    RETURN;
  END IF;

  IF COALESCE((v_mem.story_answers->>'isCommunity')::boolean, FALSE) THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, v_tok.memorial_id, v_tok.space_id, NULL::TEXT, 'COMMUNITY_FREE_NO_3D_RIGHT'::TEXT;
    RETURN;
  END IF;

  IF v_mem.expires_at IS NOT NULL AND v_mem.expires_at <= now() THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, v_tok.memorial_id, v_tok.space_id, NULL::TEXT, 'MEMORIAL_EXPIRED'::TEXT;
    RETURN;
  END IF;

  v_mem_plan := CASE v_mem.plan_type::text
    WHEN 'recuerdo_inicial' THEN 'huellita'
    WHEN 'huellita' THEN 'huellita'
    WHEN 'estrella_anual' THEN 'estrella_brillante'
    WHEN 'estrella_brillante' THEN 'estrella_brillante'
    WHEN 'recuerdo_eterno' THEN 'corazon_eterno'
    WHEN 'corazon_eterno' THEN 'corazon_eterno'
    WHEN 'angelito_protector' THEN 'angelito_protector'
    WHEN 'galaxia_amor' THEN 'galaxia_amor'
    WHEN 'vinculo_infinito' THEN 'vinculo_infinito'
    ELSE NULL
  END;

  SELECT * INTO v_space FROM public.world_spaces ws WHERE ws.space_id = v_tok.space_id FOR UPDATE;
  IF NOT FOUND OR v_space.plan_id <> v_mem_plan THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, v_tok.memorial_id, v_tok.space_id, v_mem_plan, 'PLAN_MISMATCH'::TEXT;
    RETURN;
  END IF;

  IF v_space.is_reserved_admin OR v_space.occupancy_state <> 'free' THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, v_tok.memorial_id, v_tok.space_id, v_mem_plan, 'SPACE_NOT_FREE'::TEXT;
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM public.world_space_allocations wsa WHERE wsa.memorial_id = v_tok.memorial_id AND wsa.status = 'occupied') THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, v_tok.memorial_id, v_tok.space_id, v_mem_plan, 'MEMORIAL_ALREADY_HAS_WORLD_SPACE'::TEXT;
    RETURN;
  END IF;

  IF v_mem.slot_assigned IS NOT NULL AND position(',' in v_mem.slot_assigned) > 0 THEN
    v_coords := string_to_array(v_mem.slot_assigned, ',');
    v_x := v_coords[1]::int;
    v_y := v_coords[2]::int;
  END IF;

  INSERT INTO public.world_space_allocations (
    space_id, plan_id, memorial_id, stripe_session_id,
    mural_start_x, mural_start_y, block_size,
    status, entitlement_source, hold_token, confirmed_at
  )
  VALUES (
    v_tok.space_id, v_mem_plan, v_tok.memorial_id, v_mem.stripe_session_id,
    v_x, v_y, LEAST(6, GREATEST(1, COALESCE(sqrt(v_mem.slots_count)::int, 1))),
    'occupied', 'existing_paid_memorial', 'claim-' || v_tok.id::text, now()
  )
  RETURNING id INTO v_alloc_id;

  UPDATE public.world_spaces ws
  SET occupancy_state = 'occupied',
      updated_at = now()
  WHERE ws.space_id = v_tok.space_id;

  UPDATE public.world_3d_claim_tokens wct
  SET consumed_at = now()
  WHERE wct.id = v_tok.id;

  RETURN QUERY SELECT TRUE, v_alloc_id, v_tok.memorial_id, v_tok.space_id, v_mem_plan, 'CLAIMED'::TEXT;
EXCEPTION
  WHEN unique_violation THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, v_tok.memorial_id, v_tok.space_id, v_mem_plan, 'CONFLICT'::TEXT;
END;
$$;

-- Incidencias recuperables cuando un pago Stripe se confirma pero la plaza 3D ya no pudo asignarse
CREATE TABLE IF NOT EXISTS public.world_3d_allocation_incidents (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id   TEXT NOT NULL UNIQUE,
  memorial_id         UUID NOT NULL REFERENCES public.memorials(id) ON DELETE CASCADE,
  requested_space_id  TEXT NOT NULL,
  plan_id             TEXT NOT NULL,
  reason              TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open', 'resolved_manual', 'refunded')),
  details             JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.world_3d_allocation_incidents ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.world_3d_allocation_incidents FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.extend_coordinated_hold_for_checkout(
  p_hold_token TEXT,
  p_space_id TEXT,
  p_stripe_session_id TEXT,
  p_ttl_minutes INT DEFAULT 35
)
RETURNS TABLE (
  extended BOOLEAN,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_alloc public.world_space_allocations%ROWTYPE;
  v_new_expires TIMESTAMPTZ := now() + make_interval(mins => GREATEST(30, LEAST(p_ttl_minutes, 1440)));
BEGIN
  SELECT * INTO v_alloc
  FROM public.world_space_allocations wsa
  WHERE wsa.hold_token = p_hold_token
    AND wsa.space_id = p_space_id
    AND wsa.status = 'reserved_pending_payment'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::TIMESTAMPTZ;
    RETURN;
  END IF;

  v_new_expires := GREATEST(COALESCE(v_alloc.expires_at, v_new_expires), v_new_expires);

  UPDATE public.world_space_allocations wsa
  SET expires_at = v_new_expires,
      stripe_session_id = p_stripe_session_id,
      updated_at = now()
  WHERE wsa.id = v_alloc.id;

  IF v_alloc.mural_start_x IS NOT NULL AND v_alloc.mural_start_y IS NOT NULL AND v_alloc.block_size IS NOT NULL THEN
    UPDATE public.mural_slots ms
    SET reserved_until = v_new_expires,
        updated_at = now()
    WHERE ms.x >= v_alloc.mural_start_x AND ms.x < v_alloc.mural_start_x + v_alloc.block_size
      AND ms.y >= v_alloc.mural_start_y AND ms.y < v_alloc.mural_start_y + v_alloc.block_size
      AND ms.status = 'reserved_pending_payment'
      AND ms.memorial_id IS NULL;
  END IF;

  RETURN QUERY SELECT TRUE, v_new_expires;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_coordinated_hold_by_session(
  p_stripe_session_id TEXT,
  p_hold_token TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_alloc public.world_space_allocations%ROWTYPE;
BEGIN
  SELECT * INTO v_alloc
  FROM public.world_space_allocations wsa
  WHERE (
    (p_stripe_session_id IS NOT NULL AND p_stripe_session_id <> '' AND wsa.stripe_session_id = p_stripe_session_id)
    OR (p_hold_token IS NOT NULL AND p_hold_token <> '' AND wsa.hold_token = p_hold_token)
  )
    AND wsa.status = 'reserved_pending_payment'
  ORDER BY wsa.created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  UPDATE public.world_space_allocations wsa
  SET status = 'released',
      updated_at = now()
  WHERE wsa.id = v_alloc.id;

  IF v_alloc.mural_start_x IS NOT NULL AND v_alloc.mural_start_y IS NOT NULL AND v_alloc.block_size IS NOT NULL THEN
    UPDATE public.mural_slots ms
    SET status = 'available',
        reserved_until = NULL,
        updated_at = now()
    WHERE ms.x >= v_alloc.mural_start_x AND ms.x < v_alloc.mural_start_x + v_alloc.block_size
      AND ms.y >= v_alloc.mural_start_y AND ms.y < v_alloc.mural_start_y + v_alloc.block_size
      AND ms.status = 'reserved_pending_payment'
      AND ms.memorial_id IS NULL;
  END IF;

  RETURN TRUE;
END;
$$;

COMMIT;
