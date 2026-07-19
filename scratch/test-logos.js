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

const fileUrl = 'file:///' + path.resolve(__dirname, 'preview-logos.html').replace(/\\/g, '/')
const destPath = 'C:\\Users\\norbe\\.gemini\\antigravity\\brain\\2296d829-00a5-4831-89ec-d9bd0b658303\\preview-logos-approved.png'

console.log(`Taking screenshot of ${fileUrl}...`)
const cmd = `"${foundPath}" --headless --disable-gpu --window-size=500,300 --screenshot="${destPath}" "${fileUrl}"`

exec(cmd, (err, stdout, stderr) => {
  if (err) {
    console.error('Error running browser screenshot:', err)
  } else {
    console.log('Screenshot captured successfully to:', destPath)
    if (fs.existsSync(destPath)) {
      console.log('Verified file exists on disk!')
    } else {
      console.log('File does NOT exist on disk!')
    }
  }
})
