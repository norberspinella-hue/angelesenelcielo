const { spawn } = require('child_process')
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

const stripeKey = env.STRIPE_SECRET_KEY

if (!stripeKey) {
  console.error('Falta STRIPE_SECRET_KEY en .env.local')
  process.exit(1)
}

console.log('Iniciando stripe listen con API key de .env.local...')

const stripeProcess = spawn('stripe', [
  'listen',
  '--api-key',
  stripeKey,
  '--forward-to',
  'localhost:3000/api/webhooks/stripe'
], { stdio: 'inherit', shell: true })

stripeProcess.on('error', (err) => {
  console.error('Error al iniciar stripe CLI:', err)
})

stripeProcess.on('exit', (code) => {
  console.log('Stripe CLI finalizó con código:', code)
})
