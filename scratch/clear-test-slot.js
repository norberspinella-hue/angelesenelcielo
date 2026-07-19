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
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Faltan variables de entorno de Supabase Admin (URL o Service Key).')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
})

async function clear() {
  console.log('Limpiando slot (486, 497) a cadena vacía...')
  
  const { data, error } = await supabase
    .from('mural_slots')
    .update({ thumbnail_url: '' })
    .eq('x', 486)
    .eq('y', 497)
    .select()
  
  if (error) {
    console.error('Error al actualizar:', error)
  } else {
    console.log('Slot limpiado con éxito:', data)
  }
}

clear()
