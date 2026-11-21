/**
 * PRUEBA DE INSTALACIÓN LIMPIA EN BASE VACÍA (SIN ESQUEMA COMERCIAL 0000-0008)
 * Verifica que las migraciones 0009..0012 se ejecutan de forma autónoma en PostgreSQL 16 limpio.
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const tempPassPath = path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'pg_staging_pass.tmp');
const DB_PASS = fs.readFileSync(tempPassPath, 'utf8').trim();

const BASE_CONFIG = {
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: DB_PASS,
};

async function run() {
  const admin = new Client({ ...BASE_CONFIG, database: 'postgres' });
  await admin.connect();

  console.log('1. Creando base de datos completamente vacía: cartas_clean_test...');
  await admin.query(`DROP DATABASE IF EXISTS cartas_clean_test;`);
  await admin.query(`CREATE DATABASE cartas_clean_test;`);

  const cleanDb = new Client({ ...BASE_CONFIG, database: 'cartas_clean_test' });
  await cleanDb.connect();

  try {
    // Verificar 0 tablas al inicio
    const initTables = await cleanDb.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public';
    `);
    console.log(`Tablas iniciales en cartas_clean_test: ${initTables.rows.length}`);
    if (initTables.rows.length !== 0) {
      throw new Error('La base de datos de prueba no estaba vacía.');
    }

    // Ejecutar migraciones 0009..0012 dos veces consecutivas (instalación limpia + idempotencia)
    const migDir = path.join(__dirname, 'supabase', 'migrations');
    const files = [
      '0009_community_multicarta_schema.sql',
      '0010_community_multicarta_rls.sql',
      '0011_publish_tribute_letter_rpc.sql',
      '0012_community_rate_limits.sql',
    ];

    for (let pass = 1; pass <= 2; pass++) {
      console.log(`\nEjecutando migraciones 0009..0012 (pasada ${pass}/2)...`);
      for (const f of files) {
        const sql = fs.readFileSync(path.join(migDir, f), 'utf8');
        await cleanDb.query(sql);
        console.log(`  ✅ ${f}`);
      }
    }

    // Verificar tablas creadas y ausencia de memorials
    const afterTables = await cleanDb.query(`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
    `);
    const tableNames = afterTables.rows.map(r => r.tablename);
    console.log('\nTablas creadas:', tableNames.join(', '));

    const expectedTables = [
      'community_rate_limits',
      'community_tributes',
      'guardian_magic_links',
      'guardian_sessions',
      'rollback_companion_letters',
      'tribute_guardians',
      'tribute_letters',
    ];
    for (const t of expectedTables) {
      if (!tableNames.includes(t)) throw new Error(`Falta tabla esperada: ${t}`);
    }
    if (tableNames.includes('memorials')) {
      throw new Error('Error: memorials no debería existir en base limpia multicarta.');
    }

    // Verificar vista v_legacy_companion_letters
    const viewCheck = await cleanDb.query(`SELECT COUNT(*)::int AS c FROM public.v_legacy_companion_letters;`);
    console.log(`Vista v_legacy_companion_letters operativa (filas: ${viewCheck.rows[0].c}).`);

    // Verificar funciones RPC
    const fnRes = await cleanDb.query(`
      SELECT proname FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public'
        AND proname IN ('publish_tribute_letter', 'consume_guardian_magic_link', 'consume_community_rate_limit')
      ORDER BY proname;
    `);
    console.log('Funciones instaladas:', fnRes.rows.map(r => r.proname).join(', '));
    if (fnRes.rows.length !== 3) throw new Error('Faltan funciones esperadas.');

    // Verificar roles RLS en base limpia
    let anonBlocked = false;
    try {
      await cleanDb.query(`BEGIN; SET LOCAL ROLE anon; SELECT * FROM public.tribute_guardians; ROLLBACK;`);
    } catch (e) {
      await cleanDb.query('ROLLBACK');
      anonBlocked = e.code === '42501';
    }
    if (!anonBlocked) throw new Error('anon pudo leer tribute_guardians en base limpia!');
    console.log('✅ RLS y privilegios verificados en base vacía (anon bloqueado: 42501).');

    console.log('\n================================================================');
    console.log('✅ INSTALACIÓN LIMPIA EN BASE VACÍA: 100% SUPERADA');
    console.log('================================================================');
  } finally {
    await cleanDb.end();
    await admin.query(`DROP DATABASE IF EXISTS cartas_clean_test;`);
    await admin.end();
  }
}

run().catch(err => {
  console.error('❌ ERROR EN INSTALACIÓN LIMPIA:', err);
  process.exit(1);
});
