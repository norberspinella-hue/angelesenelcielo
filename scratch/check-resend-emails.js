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

const resendApiKey = env.RESEND_API_KEY

if (!resendApiKey) {
  console.error('Falta RESEND_API_KEY en .env.local')
  process.exit(1)
}

async function checkEmails() {
  console.log('Consultando API de Resend para listar emails enviados...')
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('Error de API de Resend:', data)
      return
    }
    
    console.log('Últimos emails procesados por Resend:')
    if (data.data && data.data.length > 0) {
      data.data.forEach((email, idx) => {
        console.log(`${idx + 1}: ID: ${email.id} | De: ${email.from} | Para: ${JSON.stringify(email.to)} | Asunto: "${email.subject}" | Creado: ${email.created_at}`)
      })
    } else {
      console.log('No se encontraron emails en la cuenta.')
    }
  } catch (error) {
    console.error('Error al realizar la petición:', error)
  }
}

checkEmails()
