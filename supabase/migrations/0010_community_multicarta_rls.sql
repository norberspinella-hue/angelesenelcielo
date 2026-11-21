-- Migración 0010: Políticas RLS estrictas y principio de mínimo privilegio
-- Protege datos privados, sesiones, magic links y bloquea toda escritura anónima directa.

BEGIN;

-- 1. Garantizar existencia de roles estándar en PostgreSQL 16 local (no altera Supabase Cloud)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;
END
$$;

-- 2. Activar Row Level Security en todas las tablas del sistema multicarta
ALTER TABLE public.community_tributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribute_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribute_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_magic_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rollback_companion_letters ENABLE ROW LEVEL SECURITY;

-- 3. Revocar todos los permisos públicos por defecto y restringir escrituras
REVOKE ALL ON public.community_tributes FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.tribute_letters FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.tribute_guardians FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.guardian_magic_links FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.guardian_sessions FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.rollback_companion_letters FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.v_legacy_companion_letters FROM PUBLIC, anon, authenticated;

-- Conceder únicamente lectura SELECT sobre homenajes y cartas (filtrada por RLS)
GRANT SELECT ON public.community_tributes TO anon, authenticated;
GRANT SELECT ON public.tribute_letters TO anon, authenticated;

-- 4. Política de lectura pública de homenajes (solo publicados, públicos, no archivados, no eliminados)
DROP POLICY IF EXISTS tributes_anon_select ON public.community_tributes;
CREATE POLICY tributes_anon_select ON public.community_tributes
  FOR SELECT TO anon, authenticated
  USING (
    publication_status = 'published'
    AND visibility = 'public'
    AND is_archived = FALSE
    AND deleted_at IS NULL
  );

-- 5. Política de lectura pública de cartas (solo aprobadas, no archivadas, no eliminadas y con padre público válido)
DROP POLICY IF EXISTS letters_anon_select ON public.tribute_letters;
CREATE POLICY letters_anon_select ON public.tribute_letters
  FOR SELECT TO anon, authenticated
  USING (
    moderation_status = 'approved'
    AND is_archived = FALSE
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.community_tributes t
      WHERE t.id = tribute_letters.tribute_id
        AND t.publication_status = 'published'
        AND t.visibility = 'public'
        AND t.is_archived = FALSE
        AND t.deleted_at IS NULL
    )
  );

COMMIT;
