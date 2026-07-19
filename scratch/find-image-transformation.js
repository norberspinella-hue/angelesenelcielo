const fs = require('fs')

const filePath = 'C:\\Users\\norbe\\.gemini\\antigravity\\brain\\2296d829-00a5-4831-89ec-d9bd0b658303\\.system_generated\\steps\\3647\\content.md'
const content = fs.readFileSync(filePath, 'utf8')

// Buscar la definición de la función/hook x (carga de imagen)
// Busquemos patrones como "function x(" o "const x = " o "x = " o la llamada "x("
const regexX = /function\s+x\b/gi
let match;
while ((match = regexX.exec(content)) !== null) {
  const index = match.index;
  console.log('\n--- Match function x en:', index, '---')
  console.log(content.slice(Math.max(0, index - 100), Math.min(content.length, index + 400)).trim().replace(/\s+/g, ' '))
}

// Vamos a buscar la función que hace la carga de imagen e.g., Image()
const regexImage = /new\s+Image/gi
while ((match = regexImage.exec(content)) !== null) {
  const index = match.index;
  console.log('\n--- Match new Image en:', index, '---')
  console.log(content.slice(Math.max(0, index - 250), Math.min(content.length, index + 350)).trim().replace(/\s+/g, ' '))
}
