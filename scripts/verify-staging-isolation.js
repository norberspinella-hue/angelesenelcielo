/**
 * Script de verificación pre-despliegue para entornos Vercel Preview / Staging.
 * Bloquea el despliegue (exit 1) si Preview hereda credenciales de Producción.
 */

const KNOWN_PROD_REFS = ['hmfdauxrpolpvbzlxenq'];

function extractProjectRefFromJwt(token) {
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

function extractProjectRefFromHost(host, user = '') {
  const h = (host || '').toLowerCase();
  const m1 = h.match(/^(?:db\.)?([a-z0-9]{15,30})\.supabase\.co$/);
  if (m1) return m1[1];
  if (h.includes('pooler.supabase.com') && user) {
    const m2 = user.match(/^[^.]+\.([a-z0-9]{15,30})$/);
    if (m2) return m2[1];
  }
  return null;
}

function verifyStagingEnv(env = process.env) {
  const errors = [];
  const extraProd = (env.PRODUCTION_SUPABASE_PROJECT_REF || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  const forbidden = new Set([...KNOWN_PROD_REFS, ...extraProd]);

  if (env.VERCEL_ENV === 'production' && env.COMMUNITY_MULTICARTA_ENABLED === 'true') {
    errors.push('CRITICAL: COMMUNITY_MULTICARTA_ENABLED=true está prohibido en Vercel Production.');
  }

  if (env.COMMUNITY_ALLOWED_ENV !== 'staging') {
    errors.push('COMMUNITY_ALLOWED_ENV debe ser exactamente "staging".');
  }

  const stripeSec = env.STRIPE_SECRET_KEY || '';
  const stripePub = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
  if (stripeSec.startsWith('sk_live_') || stripeSec.startsWith('rk_live_') || stripePub.startsWith('pk_live_')) {
    errors.push('Detectadas claves Stripe Live (sk_live_/rk_live_/pk_live_) en entorno Preview.');
  }

  const supaUrl = env.NEXT_PUBLIC_SUPABASE_URL || '';
  let urlRef = null;
  if (!supaUrl) {
    errors.push('Falta NEXT_PUBLIC_SUPABASE_URL de Staging.');
  } else {
    try {
      urlRef = extractProjectRefFromHost(new URL(supaUrl).hostname);
      if (urlRef && forbidden.has(urlRef)) {
        errors.push(`NEXT_PUBLIC_SUPABASE_URL hereda el proyecto productivo (${urlRef}).`);
      }
    } catch {
      errors.push('NEXT_PUBLIC_SUPABASE_URL inválida.');
    }
  }

  const anonRef = extractProjectRefFromJwt(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const serviceRef = extractProjectRefFromJwt(env.SUPABASE_SERVICE_ROLE_KEY);
  if (anonRef && forbidden.has(anonRef)) errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY pertenece a Producción.');
  if (serviceRef && forbidden.has(serviceRef)) errors.push('SUPABASE_SERVICE_ROLE_KEY pertenece a Producción.');
  if (urlRef && anonRef && anonRef !== urlRef) errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY no coincide con NEXT_PUBLIC_SUPABASE_URL.');
  if (urlRef && serviceRef && serviceRef !== urlRef) errors.push('SUPABASE_SERVICE_ROLE_KEY no coincide con NEXT_PUBLIC_SUPABASE_URL.');

  if (!env.COMMUNITY_HMAC_SECRET || env.COMMUNITY_HMAC_SECRET.trim().length < 32) {
    errors.push('Falta COMMUNITY_HMAC_SECRET (mínimo 32 caracteres).');
  }

  const dbUrl = env.COMMUNITY_DB_URL || '';
  if (!dbUrl) {
    errors.push('Falta COMMUNITY_DB_URL de Staging.');
  } else {
    try {
      const parsed = new URL(dbUrl);
      const dbHost = parsed.hostname.toLowerCase();
      const dbUser = decodeURIComponent(parsed.username || '');
      const dbRef = extractProjectRefFromHost(dbHost, dbUser);
      if (dbRef && forbidden.has(dbRef)) {
        errors.push(`COMMUNITY_DB_URL apunta al proyecto productivo (${dbRef}).`);
      }
      const allowedHosts = (env.COMMUNITY_ALLOWED_DB_HOSTS || '').split(',').map(h => h.trim().toLowerCase()).filter(Boolean);
      const isLocal = dbHost === '127.0.0.1' || dbHost === 'localhost';
      if (!isLocal && !allowedHosts.includes(dbHost)) {
        errors.push(`Host PostgreSQL (${dbHost}) no está incluido en COMMUNITY_ALLOWED_DB_HOSTS.`);
      }
    } catch {
      errors.push('COMMUNITY_DB_URL inválida.');
    }
  }

  return errors;
}

if (require.main === module) {
  const errs = verifyStagingEnv(process.env);
  if (errs.length > 0) {
    console.error('❌ BLOQUEO DE AISLAMIENTO STAGING/PREVIEW:');
    errs.forEach(e => console.error('  - ' + e));
    process.exit(1);
  }
  console.log('✅ Aislamiento de variables Preview/Staging verificado sin credenciales productivas.');
}

module.exports = { verifyStagingEnv };
