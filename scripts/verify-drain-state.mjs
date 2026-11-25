#!/usr/bin/env node
/**
 * Read-only drain & active-transaction check before maintenance or cutover/rollback.
 * Inspects Stripe open checkout sessions, active world_space_allocations holds, and recent activity.
 *
 * Usage:
 *   node scripts/verify-drain-state.mjs --env staging
 *   node scripts/verify-drain-state.mjs --env production
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Stripe = require('c:/Proyectos/Todas las mascotas van al cielo/Angeles en el cielo/node_modules/stripe');

function parseEnv(file) {
  const out = {};
  for (const l of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const eq = l.indexOf('=');
    if (eq === -1 || l.trim().startsWith('#')) continue;
    let v = l.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[l.slice(0, eq).trim()] = v;
  }
  return out;
}

const args = process.argv.slice(2);
const envMode = args.includes('--env') ? args[args.indexOf('--env') + 1] : 'staging';
assert(envMode === 'staging' || envMode === 'production');

const env = parseEnv(
  envMode === 'production'
    ? 'c:/Proyectos/Todas las mascotas van al cielo/Angeles en el cielo/.env.local'
    : 'c:/Proyectos/Todas las mascotas van al cielo/Angeles en el cielo/.env.staging.local'
);

const stripe = new Stripe(env.STRIPE_SECRET_KEY);
const openSessions = await stripe.checkout.sessions.list({ status: 'open', limit: 25 });

const headers = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
};

const holdsRes = await fetch(
  `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/world_space_allocations?status=eq.reserved_pending_payment&select=id,space_id,expires_at,created_at`,
  { headers }
);
const activeHolds = holdsRes.status === 200 ? await holdsRes.json() : [];

const muralHoldsRes = await fetch(
  `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/mural_slots?status=eq.reserved_pending_payment&select=x,y,reserved_until`,
  { headers }
);
const activeMuralHolds = muralHoldsRes.status === 200 ? await muralHoldsRes.json() : [];

const sinceIso = new Date(Date.now() - 10 * 60 * 1000).toISOString();
const recentMemsRes = await fetch(
  `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/memorials?created_at=gte.${encodeURIComponent(sinceIso)}&select=id,created_at,payment_status`,
  { headers }
);
const recentMems = recentMemsRes.status === 200 ? await recentMemsRes.json() : [];

const safeToSwitch =
  openSessions.data.length === 0 &&
  activeHolds.length === 0 &&
  activeMuralHolds.length === 0;

console.log(JSON.stringify({
  env: envMode,
  checkedAt: new Date().toISOString(),
  openStripeCheckoutCount: openSessions.data.length,
  active3DHoldsCount: activeHolds.length,
  activeMuralHoldsCount: activeMuralHolds.length,
  memorialsCreatedLast10m: recentMems.length,
  safeToSwitch,
}, null, 2));
