/**
 * Guarda de servidor anti-producción para el sistema experimental multicarta.
 * Impide cualquier conexión o escritura accidental sobre Supabase Production o bases comerciales.
 */

export class StagingIsolationError extends Error {
  public readonly status = 503;
  constructor(message: string) {
    super(message);
    this.name = 'StagingIsolationError';
  }
}

// Identificador conocido del proyecto Supabase de producción (público en URLs de assets, jamás debe recibir escrituras multicarta)
const KNOWN_PRODUCTION_PROJECT_REFS = ['hmfdauxrpolpvbzlxenq'];

export interface DbTargetInfo {
  host: string;
  port: number;
  database: string;
  projectRef: string | null;
}

function extractProjectRefFromHost(host: string, user?: string): string | null {
  const cleanHost = host.toLowerCase();
  // Supabase direct: db.<ref>.supabase.co
  const dbMatch = cleanHost.match(/^db\.([a-z0-9]{15,30})\.supabase\.co$/);
  if (dbMatch) return dbMatch[1];

  // Supabase URL: <ref>.supabase.co
  const apiMatch = cleanHost.match(/^([a-z0-9]{15,30})\.supabase\.co$/);
  if (apiMatch) return apiMatch[1];

  // Supabase Pooler: postgres.<ref>@aws-0-xx.pooler.supabase.com
  if (cleanHost.includes('pooler.supabase.com') && user) {
    const userMatch = user.match(/^[^.]+\.([a-z0-9]{15,30})$/);
    if (userMatch) return userMatch[1];
  }

  return null;
}

export function assertStagingIsolation(dbConfig: {
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
}): DbTargetInfo {
  // 1. Verificar que no haya claves comerciales Stripe Live cargadas junto al entorno de pruebas multicarta
  const stripeKey = process.env.STRIPE_SECRET_KEY || '';
  if (process.env.NODE_ENV !== 'production' && (stripeKey.startsWith('sk_live_') || stripeKey.startsWith('rk_live_'))) {
    throw new StagingIsolationError('Aislamiento bloqueado: clave Stripe Live detectada en entorno de pruebas.');
  }

  // 2. Extraer destino efectivo de PostgreSQL
  let host = (dbConfig.host || '').toLowerCase();
  let port = dbConfig.port || 5432;
  let database = dbConfig.database || '';
  let user = dbConfig.user || '';

  if (dbConfig.connectionString) {
    let parsed: URL;
    try {
      parsed = new URL(dbConfig.connectionString);
    } catch {
      throw new StagingIsolationError('Aislamiento bloqueado: cadena de conexión PostgreSQL inválida.');
    }
    host = parsed.hostname.toLowerCase();
    port = parsed.port ? parseInt(parsed.port, 10) : 5432;
    database = parsed.pathname.replace(/^\//, '');
    user = decodeURIComponent(parsed.username || '');
  }

  if (!host || !database) {
    throw new StagingIsolationError('Aislamiento bloqueado: destino PostgreSQL incompleto.');
  }

  const projectRef = extractProjectRefFromHost(host, user);

  // 3. Bloqueo absoluto de identificadores de proyecto de producción
  const extraProdRefs = (process.env.PRODUCTION_SUPABASE_PROJECT_REF || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  const forbiddenRefs = new Set([...KNOWN_PRODUCTION_PROJECT_REFS, ...extraProdRefs]);

  if (projectRef && forbiddenRefs.has(projectRef)) {
    throw new StagingIsolationError('Aislamiento bloqueado: el destino PostgreSQL pertenece al proyecto de producción.');
  }

  const rawTargetString = `${host}:${database}:${user}`.toLowerCase();
  for (const ref of Array.from(forbiddenRefs)) {
    if (rawTargetString.includes(ref)) {
      throw new StagingIsolationError('Aislamiento bloqueado: referencia de proyecto productivo detectada en configuración DB.');
    }
  }

  // 4. Comprobar coherencia con NEXT_PUBLIC_SUPABASE_URL si está definida en entornos remotos
  const isLocalStaging = (host === '127.0.0.1' || host === 'localhost') && database.startsWith('cartas_');
  const publicSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (publicSupabaseUrl) {
    try {
      const pubHost = new URL(publicSupabaseUrl).hostname.toLowerCase();
      const pubRef = extractProjectRefFromHost(pubHost);

      if (!isLocalStaging && pubRef && forbiddenRefs.has(pubRef)) {
        throw new StagingIsolationError('Aislamiento bloqueado: NEXT_PUBLIC_SUPABASE_URL apunta a producción en un destino remoto.');
      }
      if (!isLocalStaging && projectRef && pubRef && projectRef !== pubRef) {
        throw new StagingIsolationError('Aislamiento bloqueado: discrepancia entre proyecto Supabase público y destino PostgreSQL.');
      }
    } catch (err) {
      if (err instanceof StagingIsolationError) throw err;
    }
  }

  // 5. Lista blanca estricta de destinos permitidos
  const allowedRemoteHosts = (process.env.COMMUNITY_ALLOWED_DB_HOSTS || '')
    .split(',')
    .map(h => h.trim().toLowerCase())
    .filter(Boolean);

  if (!isLocalStaging) {
    if (process.env.COMMUNITY_ALLOWED_ENV !== 'staging') {
      throw new StagingIsolationError('Aislamiento bloqueado: destino remoto requiere COMMUNITY_ALLOWED_ENV=staging.');
    }
    if (!allowedRemoteHosts.includes(host)) {
      throw new StagingIsolationError('Aislamiento bloqueado: el host PostgreSQL remoto no figura en COMMUNITY_ALLOWED_DB_HOSTS.');
    }
  }

  return { host, port, database, projectRef };
}

export function extractProjectRefFromJwt(token?: string): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    return typeof payload?.ref === 'string' ? payload.ref.toLowerCase() : null;
  } catch {
    return null;
  }
}

/**
 * Verificación exhaustiva de todas las variables de entorno de Preview / Staging.
 * Bloquea el arranque o despliegue si Preview hereda credenciales productivas de Supabase, Stripe o Storage.
 */
export function assertPreviewEnvironmentIsolation(env: NodeJS.ProcessEnv = process.env): { ok: true; stagingRef: string | null } {
  const extraProdRefs = (env.PRODUCTION_SUPABASE_PROJECT_REF || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  const forbiddenRefs = new Set([...KNOWN_PRODUCTION_PROJECT_REFS, ...extraProdRefs]);

  // 1. Nunca permitir activar la feature flag experimental en Vercel Production
  if (env.VERCEL_ENV === 'production' && env.COMMUNITY_MULTICARTA_ENABLED === 'true') {
    throw new StagingIsolationError('Bloqueo crítico: COMMUNITY_MULTICARTA_ENABLED=true no está permitido en Vercel Production.');
  }

  // 2. Exigir entorno explícito staging
  if (env.COMMUNITY_ALLOWED_ENV !== 'staging') {
    throw new StagingIsolationError('Bloqueo Preview: COMMUNITY_ALLOWED_ENV debe ser "staging".');
  }

  // 3. Bloquear claves Stripe Live
  const stripeSec = env.STRIPE_SECRET_KEY || '';
  const stripePub = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  if (stripeSec.startsWith('sk_live_') || stripeSec.startsWith('rk_live_') || stripePub.startsWith('pk_live_')) {
    throw new StagingIsolationError('Bloqueo Preview: detectadas claves comerciales Stripe Live en entorno Preview.');
  }

  // 4. Validar URL y JWTs de Supabase (Anon y Service Role) contra proyecto de producción
  const supaUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
  if (!supaUrl) {
    throw new StagingIsolationError('Bloqueo Preview: falta NEXT_PUBLIC_SUPABASE_URL de Staging.');
  }
  const urlRef = extractProjectRefFromHost(new URL(supaUrl).hostname);
  if (urlRef && forbiddenRefs.has(urlRef)) {
    throw new StagingIsolationError('Bloqueo Preview: NEXT_PUBLIC_SUPABASE_URL hereda el proyecto de Producción.');
  }

  const anonRef = extractProjectRefFromJwt(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const serviceRef = extractProjectRefFromJwt(env.SUPABASE_SERVICE_ROLE_KEY);
  if ((anonRef && forbiddenRefs.has(anonRef)) || (serviceRef && forbiddenRefs.has(serviceRef))) {
    throw new StagingIsolationError('Bloqueo Preview: las claves JWT de Supabase pertenecen al proyecto de Producción.');
  }
  if (urlRef && ((anonRef && anonRef !== urlRef) || (serviceRef && serviceRef !== urlRef))) {
    throw new StagingIsolationError('Bloqueo Preview: las claves Supabase no coinciden con el Project Ref de NEXT_PUBLIC_SUPABASE_URL.');
  }

  // 5. Validar secreto HMAC obligatorio
  if (!env.COMMUNITY_HMAC_SECRET || env.COMMUNITY_HMAC_SECRET.trim().length < 32) {
    throw new StagingIsolationError('Bloqueo Preview: falta COMMUNITY_HMAC_SECRET (mínimo 32 caracteres).');
  }

  // 6. Validar destino PostgreSQL efectivo
  if (!env.COMMUNITY_DB_URL) {
    throw new StagingIsolationError('Bloqueo Preview: falta COMMUNITY_DB_URL de Staging.');
  }
  assertStagingIsolation({ connectionString: env.COMMUNITY_DB_URL });

  return { ok: true, stagingRef: urlRef };
}
