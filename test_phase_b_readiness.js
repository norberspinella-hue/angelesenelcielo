/**
 * PRUEBAS UNITARIAS DE AISLAMIENTO VERCEL/SUPABASE PARA FASE B
 */

const assert = require('assert');
const crypto = require('crypto');
const { verifyStagingEnv } = require('./scripts/verify-staging-isolation');

function makeFakeJwt(ref) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({ iss: 'supabase', ref, role: 'anon' })).toString('base64url');
  return `${header}.${payload}.sig`;
}

const VALID_STAGING_ENV = {
  VERCEL_ENV: 'preview',
  COMMUNITY_ALLOWED_ENV: 'staging',
  COMMUNITY_MULTICARTA_ENABLED: 'true',
  NEXT_PUBLIC_SUPABASE_URL: 'https://stagingprojref12345.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: makeFakeJwt('stagingprojref12345'),
  SUPABASE_SERVICE_ROLE_KEY: makeFakeJwt('stagingprojref12345'),
  COMMUNITY_DB_URL: 'postgresql://postgres.stagingprojref12345:pass@aws-0-eu-central-1.pooler.supabase.com:6543/postgres',
  COMMUNITY_ALLOWED_DB_HOSTS: 'aws-0-eu-central-1.pooler.supabase.com',
  COMMUNITY_HMAC_SECRET: crypto.randomBytes(32).toString('hex'),
  STRIPE_SECRET_KEY: 'sk_test_123',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_123',
};

// 1. Entorno staging válido -> 0 errores
assert.deepStrictEqual(verifyStagingEnv(VALID_STAGING_ENV), []);
console.log('✅ [ENV-01] Entorno Preview Staging válido aceptado.');

// 2. Bloqueo si hereda URL de producción
const errProdUrl = verifyStagingEnv({
  ...VALID_STAGING_ENV,
  NEXT_PUBLIC_SUPABASE_URL: 'https://hmfdauxrpolpvbzlxenq.supabase.co',
});
assert(errProdUrl.some(e => e.includes('hmfdauxrpolpvbzlxenq')));
console.log('✅ [ENV-02] Bloquea herencia de NEXT_PUBLIC_SUPABASE_URL de producción.');

// 3. Bloqueo si hereda JWT key de producción
const errProdJwt = verifyStagingEnv({
  ...VALID_STAGING_ENV,
  SUPABASE_SERVICE_ROLE_KEY: makeFakeJwt('hmfdauxrpolpvbzlxenq'),
});
assert(errProdJwt.some(e => e.includes('SUPABASE_SERVICE_ROLE_KEY')));
console.log('✅ [ENV-03] Bloquea herencia de JWT service_role de producción.');

// 4. Bloqueo si hereda Stripe Live
const errStripe = verifyStagingEnv({
  ...VALID_STAGING_ENV,
  STRIPE_SECRET_KEY: 'sk_live_abc',
});
assert(errStripe.some(e => e.includes('Stripe Live')));
console.log('✅ [ENV-04] Bloquea clave comercial Stripe Live en Preview.');

// 5. Bloqueo si COMMUNITY_MULTICARTA_ENABLED=true en Vercel Production
const errProdFlag = verifyStagingEnv({
  ...VALID_STAGING_ENV,
  VERCEL_ENV: 'production',
});
assert(errProdFlag.some(e => e.includes('Vercel Production')));
console.log('✅ [ENV-05] Bloquea activación de multicarta en Vercel Production.');

// 6. Bloqueo si falta COMMUNITY_HMAC_SECRET
const errNoHmac = verifyStagingEnv({
  ...VALID_STAGING_ENV,
  COMMUNITY_HMAC_SECRET: '',
});
assert(errNoHmac.some(e => e.includes('COMMUNITY_HMAC_SECRET')));
console.log('✅ [ENV-06] Bloquea arranque si falta COMMUNITY_HMAC_SECRET.');

console.log('\n================================================================');
console.log('✅ TODAS LAS PRUEBAS DE AISLAMIENTO FASE B SUPERADAS (6/6)');
console.log('================================================================');
