#!/usr/bin/env node
/**
 * Read-only logical snapshot & SHA-256 verifier for Supabase (Staging or Production).
 * Never mutates the target database; writes snapshot locally under %LOCALAPPDATA%\Cielo3D-Backups.
 *
 * Usage:
 *   node scripts/backup-supabase-readonly.mjs --env staging
 *   node scripts/backup-supabase-readonly.mjs --env production
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const TABLES = [
  'memorials',
  'mural_slots',
  'certificates',
  'altar_candles',
  'altar_settings',
  'altar_cron_logs',
  'community_tributes',
  'community_tribute_reactions',
  'tribute_guardians',
  'tribute_letters',
  'guardian_magic_links',
  'guardian_sessions',
  'legacy_guardian_claims',
  'legacy_guardian_claim_decisions',
  'email_logs',
  'live_sesiones',
  'live_ajustes',
  'live_perritos',
  'admin_rate_limits',
  'community_rate_limits',
];

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
assert(envMode === 'staging' || envMode === 'production', 'Invalid --env');

const envFile =
  envMode === 'production'
    ? 'c:/Proyectos/Todas las mascotas van al cielo/Angeles en el cielo/.env.local'
    : 'c:/Proyectos/Todas las mascotas van al cielo/Angeles en el cielo/.env.staging.local';

const env = parseEnv(envFile);
const baseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
assert(baseUrl && serviceKey, 'Missing Supabase credentials in env file');
if (envMode === 'staging') assert(baseUrl.includes('nvdijkffjgnvqwdcaocy'));
if (envMode === 'production') assert(baseUrl.includes('hmfdauxrpolpvbzlxenq'));

const ts = new Date().toISOString().replace(/[:.]/g, '-');
const localBase = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || '.', 'AppData', 'Local');
const outDir = path.join(localBase, 'Cielo3D-Backups', `Supabase-${envMode}-${ts}`);
fs.mkdirSync(outDir, { recursive: true, mode: 0o700 });

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
};

// Capture OpenAPI schema definition (tables, RPC signatures)
const schemaRes = await fetch(`${baseUrl}/rest/v1/`, { headers });
assert.equal(schemaRes.status, 200, 'Failed to read OpenAPI schema');
const openapiText = await schemaRes.text();
fs.writeFileSync(path.join(outDir, 'openapi-schema.json'), openapiText, 'utf8');

const tableManifest = {};
for (const table of TABLES) {
  let offset = 0;
  const pageSize = 500;
  const allRows = [];
  let missing = false;
  while (true) {
    const res = await fetch(`${baseUrl}/rest/v1/${table}?select=*&limit=${pageSize}&offset=${offset}`, { headers });
    if (res.status === 404) {
      missing = true;
      break;
    }
    assert.equal(res.status, 200, `Error reading ${table}: HTTP ${res.status}`);
    const page = await res.json();
    allRows.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }
  if (missing) {
    tableManifest[table] = { exists: false, rows: 0, sha256: null };
    continue;
  }
  const serialized = JSON.stringify(allRows, null, 2);
  fs.writeFileSync(path.join(outDir, `${table}.json`), serialized, { encoding: 'utf8', mode: 0o600 });
  const sha256 = crypto.createHash('sha256').update(serialized).digest('hex');
  tableManifest[table] = { exists: true, rows: allRows.length, sha256 };
}

const manifest = {
  environment: envMode,
  supabaseUrl: baseUrl,
  capturedAt: new Date().toISOString(),
  schemaSha256: crypto.createHash('sha256').update(openapiText).digest('hex'),
  tables: tableManifest,
};
const manifestText = JSON.stringify(manifest, null, 2);
fs.writeFileSync(path.join(outDir, 'manifest.json'), manifestText, { encoding: 'utf8', mode: 0o600 });
const manifestSha256 = crypto.createHash('sha256').update(manifestText).digest('hex');

console.log(JSON.stringify({ ok: true, outDir, manifestSha256, capturedAt: manifest.capturedAt, tableCount: TABLES.length }, null, 2));
