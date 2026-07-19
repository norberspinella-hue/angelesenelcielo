const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const envPath = path.resolve(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
  if (match) {
    const key = match[1]
    let value = match[2] || ''
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1)
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.slice(1, -1)
    }
    env[key] = value.trim()
  }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan variables de entorno de Supabase.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function update() {
  const testUrl = 'https://pub-807afcfbd2144a1ea45f8c11f2083070.r2.dev/photos/migrated_453_534_40ebfb29.jpg'
  console.log(`Actualizando slot (486, 497) con URL de prueba: "${testUrl}"...`)
  
  const { data, error } = await supabase
    .from('mural_slots')
    .update({ thumbnail_url: testUrl })
    .eq('x', 486)
    .eq('y', 497)
    .select()
  
  if (error) {
    console.error('Error al actualizar:', error)
  } else {
    console.log('Slot actualizado con éxito:', data)
  }
}

update()
