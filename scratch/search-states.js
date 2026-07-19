const fs = require('fs')
const path = require('path')

const filePath = path.resolve(__dirname, '../src/components/mural/MuralCanvas.tsx')
const content = fs.readFileSync(filePath, 'utf8')

const lines = content.split('\n')
lines.forEach((line, idx) => {
  if (line.includes('useState(false)') || line.includes('useState<any>(null)')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`)
  }
})
