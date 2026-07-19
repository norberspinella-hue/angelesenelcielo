const fs = require('fs')
const path = require('path')

const filePath = 'C:\\Users\\norbe\\.gemini\\antigravity\\brain\\2296d829-00a5-4831-89ec-d9bd0b658303\\.system_generated\\steps\\3647\\content.md'

if (!fs.existsSync(filePath)) {
  console.error('El archivo no existe.')
  process.exit(1)
}

const content = fs.readFileSync(filePath, 'utf8')
console.log('Longitud del JS:', content.length, 'caracteres')

const keywords = [
  'drawImage',
  'getContext',
  'zoom',
  'scale',
  'cloudinary',
  'imgix',
  'amazonaws',
  'supabase',
  'storage',
  'width',
  'height',
  'http',
  'tiles',
  'tile',
  'mural',
  'canvas'
]

keywords.forEach(word => {
  const regex = new RegExp(`.{0,100}${word}.{0,100}`, 'gi')
  const matches = content.match(regex)
  if (matches) {
    console.log(`\n--- Matches para "${word}" (${matches.length}) ---`)
    matches.slice(0, 10).forEach((m, idx) => {
      console.log(`${idx + 1}: ${m.trim().replace(/\s+/g, ' ')}`)
    })
  } else {
    console.log(`\nNo se encontraron matches para "${word}"`)
  }
})
