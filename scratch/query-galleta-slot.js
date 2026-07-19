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

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function query() {
  const { data, error } = await supabase
    .from('mural_slots')
    .select('*')
    .eq('memorial_id', '8d52074a-07b8-467e-a8d1-65c5f9da4211')
  
  if (error) {
    console.error(error)
  } else {
    console.log('Galleta slots:', JSON.stringify(data, null, 2))
  }
}

query()
