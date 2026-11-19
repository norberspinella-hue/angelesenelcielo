import { NextRequest } from 'next/server';

/**
 * Control centralizado de activación de la funcionalidad multicarta.
 * 
 * Reglas de seguridad obligatorias:
 * 1. En PRODUCCIÓN (NODE_ENV === 'production'):
 *    - La funcionalidad multicarta permanece ESTRICTAMENTE DESHABILITADA a menos que
 *      la variable de servidor `COMMUNITY_MULTICARTA_ENABLED === 'true'` esté explícitamente encendida.
 *    - NUNCA se activa mediante parámetros de URL (?multicarta=true o ?v=multicarta).
 *    - Los endpoints experimentales devuelven 404 Not Found de inmediato.
 * 
 * 2. En DESARROLLO (NODE_ENV === 'development'):
 *    - Es el entorno autorizado para pruebas locales y demostraciones.
 *    - Para la página de UI `/comunidad`, se comprueba si el usuario envía `?multicarta=true` / `?v=multicarta`.
 *    - Para las llamadas de API internas en desarrollo, los endpoints quedan habilitados.
 */
export function isMulticartaFeatureEnabled(
  req?: NextRequest | Request | { searchParams?: URLSearchParams | Record<string, string | string[] | undefined> }
): boolean {
  const isServerFlagEnabled =
    process.env.COMMUNITY_MULTICARTA_ENABLED === 'true' ||
    process.env.FEATURE_MULTICARTA_ENABLED === 'true';

  const isProduction = process.env.NODE_ENV === 'production';
  const isDev = process.env.NODE_ENV === 'development';

  // 1. En PRODUCCIÓN: Exclusivamente la variable del servidor decide
  if (isProduction) {
    return isServerFlagEnabled;
  }

  // 2. En DESARROLLO LOCAL (entorno autorizado):
  if (isDev) {
    if (isServerFlagEnabled) return true;

    // Si es una petición a la página `/comunidad`, comprobar si viene con ?multicarta=true
    if (req && 'url' in req && typeof req.url === 'string') {
      try {
        const parsed = new URL(req.url, 'http://127.0.0.1');
        // Si es una llamada a la API en desarrollo, permitir
        if (parsed.pathname.startsWith('/api/community/')) {
          return true;
        }
        const m = parsed.searchParams.get('multicarta');
        const v = parsed.searchParams.get('v');
        if (m === 'true' || v === 'multicarta') return true;
      } catch {}
    }

    if (req && 'searchParams' in req && req.searchParams) {
      const sp = req.searchParams;
      if (typeof (sp as any).get === 'function') {
        const getter = sp as URLSearchParams;
        if (getter.get('multicarta') === 'true' || getter.get('v') === 'multicarta') return true;
      } else {
        const rec = sp as Record<string, string | string[] | undefined>;
        if (rec.multicarta === 'true' || rec.v === 'multicarta') return true;
      }
    }

    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('multicarta') === 'true' || urlParams.get('v') === 'multicarta') {
          return true;
        }
      } catch {}
    }

    // Por defecto en desarrollo para APIs y componentes
    return true;
  }

  return false;
}
