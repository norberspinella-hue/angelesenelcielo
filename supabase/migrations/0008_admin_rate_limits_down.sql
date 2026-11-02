-- Reversión de la Migración 0008 (Limitador de Intentos Administrativo)
-- Elimina de forma ordenada y controlada las funciones y la tabla SIN CASCADE.
-- Previa comprobación de dependencias externas.

BEGIN;

-- 1. Comprobar que no existen claves foráneas externas que apunten a admin_rate_limits
DO $$
DECLARE
  v_dep_count INTEGER;
BEGIN
  SELECT count(*)
  INTO v_dep_count
  FROM information_schema.table_constraints tc
  JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'admin_rate_limits'
    AND ccu.table_schema = 'public';

  IF v_dep_count > 0 THEN
    RAISE EXCEPTION 'Existen claves foráneas externas que referencian admin_rate_limits. Reversión abortada para proteger la integridad.';
  END IF;
END $$;

-- 2. Eliminar funciones RPC primero
DROP FUNCTION IF EXISTS public.check_admin_rate_limit(VARCHAR);
DROP FUNCTION IF EXISTS public.record_admin_failed_attempt(VARCHAR, VARCHAR, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS public.clear_admin_attempts(VARCHAR);

-- 3. Eliminar tabla sin CASCADE (usando RESTRICT explícito)
DROP TABLE IF EXISTS public.admin_rate_limits RESTRICT;

COMMIT;
