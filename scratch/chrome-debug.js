const fs = require('fs')
const { exec } = require('child_process')
const path = require('path')

const paths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
]

let foundPath = null
for (const p of paths) {
  if (fs.existsSync(p)) {
    foundPath = p
    break
  }
}

if (!foundPath) {
  console.log('No browser executable found.')
  process.exit(1)
}

const targetUrl = 'http://localhost:3000/mural-global'
// Guardar log en el directorio actual
const logPath = path.resolve(__dirname, 'chrome_debug.log')
if (fs.existsSync(logPath)) {
  fs.unlinkSync(logPath)
}

console.log(`Starting headless browser with logging to inspect console...`)
const cmd = `"${foundPath}" --headless --disable-gpu --enable-logging --log-file="${logPath}" "${targetUrl}"`

const child = exec(cmd)

setTimeout(() => {
  child.kill()
  console.log('Browser closed. Reading logs:')
  if (fs.existsSync(logPath)) {
    const logs = fs.readFileSync(logPath, 'utf8')
    console.log(logs)
  } else {
    console.log('No log file generated.')
  }
}, 5000)
