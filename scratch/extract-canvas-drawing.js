const fs = require('fs')

const filePath = 'C:\\Users\\norbe\\.gemini\\antigravity\\brain\\2296d829-00a5-4831-89ec-d9bd0b658303\\.system_generated\\steps\\3647\\content.md'
const content = fs.readFileSync(filePath, 'utf8')

// Buscar ocurrencias de getContext("2d")
const regex2d = /getContext\("2d"\)/gi
let match;
while ((match = regex2d.exec(content)) !== null) {
  const index = match.index;
  console.log('\n--- Match getContext("2d") en índice:', index, '---')
  console.log(content.slice(Math.max(0, index - 250), Math.min(content.length, index + 350)).trim().replace(/\s+/g, ' '))
}

// Buscar drawImage
const regexDraw = /drawImage/gi
while ((match = regexDraw.exec(content)) !== null) {
  const index = match.index;
  console.log('\n--- Match drawImage en índice:', index, '---')
  console.log(content.slice(Math.max(0, index - 250), Math.min(content.length, index + 350)).trim().replace(/\s+/g, ' '))
}
