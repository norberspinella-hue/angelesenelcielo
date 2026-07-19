const fs = require('fs')

const filePath = 'C:\\Users\\norbe\\.gemini\\antigravity\\brain\\2296d829-00a5-4831-89ec-d9bd0b658303\\.system_generated\\steps\\3647\\content.md'
const content = fs.readFileSync(filePath, 'utf8')

// Buscar donde se calcula 'c' y ver las líneas siguientes en el bucle
const index = content.indexOf('c=(l=d.zoom)<.1?0:l<.25?1:l<.7?2:l<1.8?3:4')
if (index !== -1) {
  console.log('\n--- Fragmento alrededor del cálculo de c ---')
  console.log(content.slice(index - 100, index + 1500).replace(/\s+/g, ' '))
} else {
  console.log('No se encontró el cálculo exacto de c.')
}
