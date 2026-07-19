const fs = require('fs')
const path = require('path')

const filePath = path.resolve(__dirname, '../src/components/mural/MuralCanvas.tsx')
const content = fs.readFileSync(filePath, 'utf8')

// Search for hovered or tooltip or popup in the code
const lines = content.split('\n')
lines.forEach((line, idx) => {
  if (line.toLowerCase().includes('hover') || line.toLowerCase().includes('tooltip') || line.toLowerCase().includes('popup')) {
    console.log(`Line ${idx + 1}: ${line.trim()}`)
  }
})
