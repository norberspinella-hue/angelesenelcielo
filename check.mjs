import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hmfdauxrpolpvbzlxenq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtZmRhdXhycG9scHZiemx4ZW5xIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk2OTQ3NywiZXhwIjoyMDk0NTQ1NDc3fQ.1uftsB929o5t3HXhPYqqvMbiGbLis_aDci1hr8JHsP8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Testing Supabase connection...');
  const { data, error } = await supabase.from('mural_slots').select('id').limit(1);
  if (error) {
    console.error('Connection failed:', error.message);
    process.exit(1);
  } else {
    console.log('Connection successful! Mural slots table exists.');
    process.exit(0);
  }
}

check();
