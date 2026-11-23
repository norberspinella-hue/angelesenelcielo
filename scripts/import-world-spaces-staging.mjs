import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { Pool } = require('c:/Proyectos/Todas las mascotas van al cielo/Angeles en el cielo/node_modules/pg');

const APP_DIR = 'c:/Proyectos/Todas las mascotas van al cielo/Angeles en el cielo';
const PILOT_DIR = 'c:/Proyectos/Todas las mascotas van al cielo/piloto-75-1-preview';

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

const env = parseEnv(path.join(APP_DIR, '.env.staging.local'));
// Guardia estricta: SOLO Staging nvdijkffjgnvqwdcaocy
assert(env.NEXT_PUBLIC_SUPABASE_URL?.includes('nvdijkffjgnvqwdcaocy'), 'STAGING ONLY');
assert(env.COMMUNITY_DB_URL?.includes('nvdijkffjgnvqwdcaocy'), 'STAGING DB ONLY');

const CATEGORY_TO_PLAN = {
  1: 'huellita',
  2: 'estrella_brillante',
  3: 'corazon_eterno',
  4: 'angelito_protector',
  5: 'galaxia_amor',
  6: 'vinculo_infinito',
};

const { buildSpaceInventory } = await import('file:///' + path.join(PILOT_DIR, 'public/cielo3d/space-inventory.js'));
const { LEGACY_PRIMARY_SPACES, SPECIAL_MEMORIALS } = await import('file:///' + path.join(PILOT_DIR, 'public/cielo3d/primary-spaces.js'));

const jsonPayload = JSON.parse(fs.readFileSync(path.join(PILOT_DIR, 'inventario/espacios.json'), 'utf8'));
const spacesFromJson = jsonPayload.spaces;
const spacesFromGeom = buildSpaceInventory();

assert.equal(spacesFromJson.length, 3630, 'Inventory JSON must have exact 3,630 spaces');
assert.equal(spacesFromGeom.length, 3630, 'Geometry space-inventory.js must match 3,630 spaces');

const geomById = new Map(spacesFromGeom.map((s) => [s.space_id, s]));
const seenIds = new Set();
const legacySpaceIds = new Set(Object.values(LEGACY_PRIMARY_SPACES));

// Verify zero duplicates, geometry parity, and Chloé/Juliette protection
for (const s of spacesFromJson) {
  assert(!seenIds.has(s.space_id), `Duplicate space_id: ${s.space_id}`);
  seenIds.add(s.space_id);
  assert.equal(s.sales_enabled, false, `sales_enabled must be false on ${s.space_id}`);
  assert(!SPECIAL_MEMORIALS.has(s.memorial_id || ''), `Special memorial leaked into inventory: ${s.space_id}`);
  const g = geomById.get(s.space_id);
  assert(g, `Missing geometry match for ${s.space_id}`);
  assert.equal(g.category, s.category, `Category mismatch on ${s.space_id}`);
  assert.equal(g.zone, s.zone, `Zone mismatch on ${s.space_id}`);
  assert(Math.abs(g.position.x - s.position.x) < 0.002 && Math.abs(g.position.z - s.position.z) < 0.002, `Coord mismatch on ${s.space_id}`);
}
assert.equal(seenIds.size, 3630);
assert.equal(legacySpaceIds.size, 16);

const cleanDbUrl = env.COMMUNITY_DB_URL.replace(/[?&]sslmode=[^&]+/gi, '').replace(/\?$/, '');
const pool = new Pool({
  connectionString: cleanDbUrl,
  ssl: { rejectUnauthorized: true, ca: env.COMMUNITY_DB_CA_CERT.replace(/\\n/g, '\n') },
});

const c = await pool.connect();
try {
  const migrationSql = fs.readFileSync(path.join(APP_DIR, 'supabase/migrations/0018_world_3d_spaces_draft.sql'), 'utf8');
  await c.query(migrationSql);

  // Batch upsert 3,630 rows cleanly
  const BATCH = 300;
  for (let i = 0; i < spacesFromJson.length; i += BATCH) {
    const chunk = spacesFromJson.slice(i, i + BATCH);
    const values = [];
    const placeholders = [];
    chunk.forEach((s, idx) => {
      const base = idx * 12;
      const isLegacy = legacySpaceIds.has(s.space_id);
      const planId = CATEGORY_TO_PLAN[s.category];
      const displayName = `${s.zone} · ${s.space_id}`;
      placeholders.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9}, $${base + 10}::jsonb, $${base + 11}::jsonb, $${base + 12}::jsonb)`
      );
      values.push(
        s.space_id,
        s.zone,
        s.scene,
        s.photo?.shape || 'frame',
        displayName,
        planId,
        isLegacy ? 'historical_projection' : 'free',
        false, // is_sellable ALWAYS false until authorized
        isLegacy, // is_reserved_admin = true for the 16 historical projections pending reconciliation
        JSON.stringify({ position: s.position, yaw: s.yaw, support: s.support, photo: s.photo }),
        JSON.stringify({ camera: s.camera, approach: s.approach }),
        JSON.stringify({
          category: s.category,
          pilot_altar: Boolean(s.pilot_altar),
          historical_projection_memorial_id: Object.entries(LEGACY_PRIMARY_SPACES).find(([, v]) => v === s.space_id)?.[0] || null,
          sales_enabled: false,
        })
      );
    });

    await c.query(
      `INSERT INTO public.world_spaces (
         space_id, zone, scene, support_type, display_name, plan_id,
         occupancy_state, is_sellable, is_reserved_admin, coords_json, camera_json, metadata_json
       )
       VALUES ${placeholders.join(', ')}
       ON CONFLICT (space_id) DO UPDATE SET
         zone = EXCLUDED.zone,
         scene = EXCLUDED.scene,
         support_type = EXCLUDED.support_type,
         display_name = EXCLUDED.display_name,
         plan_id = EXCLUDED.plan_id,
         occupancy_state = CASE
           WHEN public.world_spaces.occupancy_state = 'occupied' THEN 'occupied'
           ELSE EXCLUDED.occupancy_state
         END,
         is_sellable = FALSE,
         is_reserved_admin = EXCLUDED.is_reserved_admin,
         coords_json = EXCLUDED.coords_json,
         camera_json = EXCLUDED.camera_json,
         metadata_json = EXCLUDED.metadata_json,
         updated_at = now()`,
      values
    );
  }

  const summaryRes = await c.query(`
    SELECT
      count(*)::int AS total,
      count(*) FILTER (WHERE is_sellable = FALSE)::int AS not_sellable,
      count(*) FILTER (WHERE occupancy_state = 'historical_projection')::int AS historical_projections,
      count(*) FILTER (WHERE occupancy_state = 'free')::int AS free_count,
      count(*) FILTER (WHERE zone = 'bosque' AND plan_id = 'estrella_brillante')::int AS bosque_2x2_count
    FROM public.world_spaces
  `);
  const byPlan = await c.query(`
    SELECT plan_id, count(*)::int AS cnt FROM public.world_spaces GROUP BY plan_id ORDER BY cnt DESC
  `);

  console.log(JSON.stringify({
    ok: true,
    stagingRef: 'nvdijkffjgnvqwdcaocy',
    geometryMatchesCount: spacesFromGeom.length,
    summary: summaryRes.rows[0],
    byPlan: byPlan.rows,
    specialProtectedIds: [...SPECIAL_MEMORIALS],
  }, null, 2));
} finally {
  c.release();
  await pool.end();
}
