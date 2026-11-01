import { createClient } from '@supabase/supabase-js';
import { CandlesService } from '../lib/altar/candlesService';

// Script de importación de solo lectura desde el Mural Global hacia Altar de Luces
async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hmfdauxrpolpvbzlxenq.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtZmRhdXhycG9scHZiemx4ZW5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk2OTQ3NywiZXhwIjoyMDk0NTQ1NDc3fQ.1uftsB929o5t3HXhPYqqvMbiGbLis_aDci1hr8JHsP8';

  const supabase = createClient(supabaseUrl, serviceKey);

  console.log('--- IMPORTACIÓN CONTROLADA DE MEMORIALES REALES ---');

  // Consulta de solo lectura filtrando memoriales publicados y pagados
  const { data: memorials, error } = await supabase
    .from('memorials')
    .select('id, pet_name, species, photo_url, dedication, plan_type, publication_status, payment_status, visibility, created_at')
    .eq('publication_status', 'published')
    .eq('payment_status', 'paid')
    .eq('visibility', 'public');

  if (error) {
    console.error('Error al consultar memoriales:', error);
    process.exit(1);
  }

  console.log(`Memoriales públicos y pagados encontrados: ${memorials.length}`);

  const result = await CandlesService.importMemorials(memorials);

  console.log(`Resultado de importación:`);
  console.log(`- Importados: ${result.imported}`);
  console.log(`- Omitidos (ya existían): ${result.skipped}`);

  const stats = await CandlesService.getStats();
  console.log(`Estado del Altar:`);
  console.log(`- Llamas activas: ${stats.active_candles_count}`);
  console.log(`- Total histórico: ${stats.total_historical_candles}`);
}

main().catch(err => {
  console.error('Error en script:', err);
  process.exit(1);
});
