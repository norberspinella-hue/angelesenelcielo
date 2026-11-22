import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

function loadTsModule(relPath) {
  const fullPath = path.join(ROOT, relPath);
  const src = fs.readFileSync(fullPath, 'utf8');
  const transpiled = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: fullPath,
  }).outputText;

  const mod = { exports: {} };
  const customRequire = (spec) => {
    if (spec.startsWith('@/')) {
      const targetRel = spec.replace(/^@\//, 'src/') + '.ts';
      return loadTsModule(targetRel);
    }
    if (spec.startsWith('./') || spec.startsWith('../')) {
      const resolved = path.resolve(path.dirname(fullPath), spec) + '.ts';
      const relFromRoot = path.relative(ROOT, resolved);
      return loadTsModule(relFromRoot);
    }
    throw new Error(`Unexpected import in isolated test: ${spec}`);
  };

  const fn = new Function('require', 'module', 'exports', transpiled);
  fn(customRequire, mod, mod.exports);
  return mod.exports;
}

const plans = loadTsModule('src/lib/plans.ts');
const blockAvail = loadTsModule('src/lib/mural/blockAvailability.ts');
const contracts = loadTsModule('src/lib/world3d/contracts.ts');
const catalogService = loadTsModule('src/lib/world3d/catalogService.ts');

// 1. Auditoría de los 6 planes: 1, 4, 9, 16, 25, 36
const expectedPlans = [
  ['huellita', 'recuerdo_inicial', 1, 1],
  ['estrella_brillante', 'estrella_anual', 2, 4],
  ['corazon_eterno', 'recuerdo_eterno', 3, 9],
  ['angelito_protector', 'angelito_protector', 4, 16],
  ['galaxia_amor', 'galaxia_amor', 5, 25],
  ['vinculo_infinito', 'vinculo_infinito', 6, 36],
];

for (const [id, dbName, size, slotsCount] of expectedPlans) {
  const byId = blockAvail.resolveCanonicalPlanMetrics(id);
  const byDb = blockAvail.resolveCanonicalPlanMetrics(dbName);
  assert.equal(byId.size, size, `size mismatch for ${id}`);
  assert.equal(byId.slotsCount, slotsCount, `slotsCount mismatch for ${id}`);
  assert.equal(byDb.slotsCount, slotsCount, `slotsCount mismatch for dbName ${dbName}`);
  assert.equal(plans.PLANS[id].slotsCount, slotsCount);
}

// 2. Expansión exacta y validación de colisión N×N (especialmente 4x4, 5x5 y 6x6)
assert.equal(blockAvail.expandBlockCoordinates(524, 494, 4).length, 16);
assert.equal(blockAvail.expandBlockCoordinates(600, 600, 5).length, 25);
assert.equal(blockAvail.expandBlockCoordinates(610, 610, 6).length, 36);

assert.equal(blockAvail.isBlockGridValidAndFree(996, 996, 5, []).reason, 'OUT_OF_BOUNDS');
assert.equal(blockAvail.isBlockGridValidAndFree(100, 100, 6, []).ok, true);

const now = Date.parse('2026-11-22T19:45:00.000Z');
const activeHoldCell = [{
  x: 105,
  y: 105,
  status: 'reserved_pending_payment',
  reserved_until: new Date(now + 10 * 60_000).toISOString(),
}];
const expiredHoldCell = [{
  x: 105,
  y: 105,
  status: 'reserved_pending_payment',
  reserved_until: new Date(now - 60_000).toISOString(),
}];
assert.equal(blockAvail.isBlockGridValidAndFree(100, 100, 6, activeHoldCell, now).reason, 'COLLISION');
assert.equal(blockAvail.isBlockGridValidAndFree(100, 100, 6, expiredHoldCell, now).ok, true);

// 3. Verificar ausencia del parche truncador `slots_count: [1, 4, 9].includes(...)` en webhook y /gracias
const webhookSrc = fs.readFileSync(path.join(ROOT, 'src/app/api/webhooks/stripe/route.ts'), 'utf8');
const graciasSrc = fs.readFileSync(path.join(ROOT, 'src/app/api/gracias/session/route.ts'), 'utf8');
assert.equal(webhookSrc.includes('[1, 4, 9].includes'), false, 'Webhook still truncates large plans to 9');
assert.equal(graciasSrc.includes('[1, 4, 9].includes'), false, 'Gracias fallback still truncates large plans to 9');

// 4. Regla comercial Bosque y contratos agnósticos de Work
assert.equal(contracts.WORLD_3D_PLAN_DISTRIBUTION.estrella_brillante.forestIncludedNoSupplement, true);
assert.equal(contracts.WORLD_3D_PLAN_DISTRIBUTION.angelito_protector.muralSlotsCount, 16);
assert.equal(contracts.WORLD_3D_PLAN_DISTRIBUTION.galaxia_amor.muralSlotsCount, 25);
assert.equal(contracts.WORLD_3D_PLAN_DISTRIBUTION.vinculo_infinito.muralSlotsCount, 36);

assert.equal(contracts.isValidWorldSpaceId('pending_work_bosque_tree_01'), true);
assert.equal(contracts.isValidWorldSpaceId('../bad'), false);

const handshakeUrl = contracts.buildMuralSelectionUrlFrom3D('https://todaslasmascotasvanalcielo.com', {
  spaceId: 'work_castillo_ala_norte_01',
  planId: 'corazon_eterno',
});
assert.ok(handshakeUrl.includes('/mural-global?'));
assert.ok(handshakeUrl.includes('space_id=work_castillo_ala_norte_01'));
assert.ok(handshakeUrl.includes('plan=corazon_eterno'));
assert.ok(handshakeUrl.includes('source=cielo3d'));

// 5. Derecho de familias que ya pagaron (House como caso principal)
const housePaid = {
  id: 'c34c5b26-8252-46b2-bb81-bcdd11439e94',
  pet_name: 'House',
  species: 'perro',
  photo_url: 'https://example.com/house.jpg',
  dedication: 'Siempre con nosotros',
  plan_type: 'recuerdo_eterno',
  slots_count: 9,
  payment_status: 'paid',
  publication_status: 'published',
  visibility: 'public',
  moderation_status: 'approved',
  profile_slug: 'house-1791661708523',
  slot_assigned: '495,499',
  story_answers: {},
};
assert.equal(
  contracts.canExistingPaidMemorialClaimWorldSpace(housePaid, 'corazon_eterno', null, now).allowed,
  true
);
assert.equal(
  contracts.canExistingPaidMemorialClaimWorldSpace(housePaid, 'angelito_protector', null, now).reason,
  'PLAN_MISMATCH'
);
assert.equal(
  contracts.canExistingPaidMemorialClaimWorldSpace(housePaid, 'corazon_eterno', 'space_ocupado_1', now).reason,
  'MEMORIAL_ALREADY_HAS_WORLD_SPACE'
);

// 6. Catálogo 3D sin depender de altar_candles + desambiguación de House pagado vs comunitario
const mockMemorials = [
  housePaid,
  {
    id: '3ace33f4-cbd4-4ea8-9635-c808be30caee',
    pet_name: 'House',
    species: 'perro',
    photo_url: 'https://example.com/house-comm.jpg',
    dedication: 'Carta comunitaria',
    plan_type: 'recuerdo_inicial',
    slots_count: 1,
    payment_status: 'draft',
    publication_status: 'published',
    visibility: 'public',
    moderation_status: 'approved',
    profile_slug: 'house-1795348205274',
    slot_assigned: null,
    story_answers: { isCommunity: true },
  },
  {
    id: '13fc24d5-a064-4495-a16b-7db84c1bc76d',
    pet_name: 'Dino',
    species: 'perro',
    photo_url: 'https://example.com/dino.jpg',
    dedication: 'Dino 4x4 sin vela',
    plan_type: 'angelito_protector',
    slots_count: 9, // simulación del registro histórico truncado en BD antes de migración 0017
    payment_status: 'paid',
    publication_status: 'published',
    visibility: 'public',
    moderation_status: 'approved',
    profile_slug: 'dino-1794144313576',
    slot_assigned: '524,494',
    story_answers: {},
  },
];

const activeCandleSet = new Set([housePaid.id]); // Dino no tiene vela
const paidOnlyCatalog = catalogService.buildPublic3DMuralCatalog(mockMemorials, {
  includeCommunityFree: false,
  activeCandleMemorialIds: activeCandleSet,
});
assert.equal(paidOnlyCatalog.length, 2, 'Paid catalog must include House + Dino even without candle');
const houseEntry = paidOnlyCatalog.find((x) => x.memorialId === housePaid.id);
const dinoEntry = paidOnlyCatalog.find((x) => x.memorialId === '13fc24d5-a064-4495-a16b-7db84c1bc76d');
assert.equal(houseEntry.muralCoords.x, 495);
assert.equal(houseEntry.hasActiveCandle, true);
assert.equal(dinoEntry.hasActiveCandle, false);
assert.equal(dinoEntry.muralSlotsCount, 16, 'Catalog normalizes Dino 4x4 to 16 slots even before DB backfill');

const withCommunity = catalogService.buildPublic3DMuralCatalog(mockMemorials, {
  includeCommunityFree: true,
  activeCandleMemorialIds: activeCandleSet,
});
assert.equal(withCommunity.length, 3, 'Including community must preserve distinct IDs for both House records');

console.log(JSON.stringify({
  ok: true,
  checkedPlans: 6,
  housePaidId: houseEntry.memorialId,
  dinoNormalizedSlots: dinoEntry.muralSlotsCount,
  paidCatalogWithoutCandles: paidOnlyCatalog.map((i) => ({ name: i.petName, plan: i.planId, slots: i.muralSlotsCount, hasCandle: i.hasActiveCandle })),
}, null, 2));
