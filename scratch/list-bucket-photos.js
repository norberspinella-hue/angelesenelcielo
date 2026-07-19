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

async function list() {
  console.log('Listando bucket pet-photos...')
  
  // Listar original
  const { data: dataOrig, error: errOrig } = await supabase.storage
    .from('pet-photos')
    .list('pets/original')
  
  if (errOrig) {
    console.error('Error listando original:', errOrig)
  } else {
    console.log('Originals:', dataOrig.map(f => f.name))
  }
  
  // Listar thumbnails
  const { data: dataThumb, error: errThumb } = await supabase.storage
    .from('pet-photos')
    .list('pets/thumbnails')
  
  if (errThumb) {
    console.error('Error listando thumbnails:', errThumb)
  } else {
    console.log('Thumbnails:', dataThumb.map(f => f.name))
  }
}

list()
