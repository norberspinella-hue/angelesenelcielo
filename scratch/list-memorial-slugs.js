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

async function query() {
  console.log('Consultando slugs de memoriales...')
  
  const { data, error } = await supabase
    .from('memorials')
    .select('pet_name, profile_slug, visibility')
    .not('profile_slug', 'is', null)
    .limit(5)
  
  if (error) {
    console.error('Error al consultar:', error)
  } else {
    console.log('Registros encontrados:')
    data.forEach((row, idx) => {
      console.log(`${idx + 1}: Mascota: "${row.pet_name}" | Slug: "${row.profile_slug}" | Visibilidad: "${row.visibility}"`)
    })
  }
}

query()
