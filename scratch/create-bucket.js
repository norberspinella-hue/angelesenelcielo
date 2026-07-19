const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Cargar .env.local manualmente
const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8')
  envConfig.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (match) {
      const key = match[1]
      let value = match[2] || ''
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1)
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1)
      }
      process.env[key] = value.trim()
    }
  })
}

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
    return
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  console.log('Creando/verificando el bucket "pet-photos"...')
  const { data, error } = await supabase.storage.createBucket('pet-photos', {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/*']
  })
  
  if (error) {
    console.log('Resultado:', error.message)
  } else {
    console.log('Bucket "pet-photos" creado con éxito:', data)
  }
}

run()
