const fs = require('fs')

const filePath = 'C:\\Users\\norbe\\.gemini\\antigravity\\brain\\2296d829-00a5-4831-89ec-d9bd0b658303\\.system_generated\\steps\\3647\\content.md'
const content = fs.readFileSync(filePath, 'utf8')

// Buscar "function u(" or "let u = " or similar in the code
// Let's do a regex search for "function u(" or "const u ="
const regexU = /function\s+u\b/gi
let match;
while ((match = regexU.exec(content)) !== null) {
  const index = match.index;
  console.log('\n--- Match function u en:', index, '---')
  console.log(content.slice(Math.max(0, index - 100), Math.min(content.length, index + 400)).trim().replace(/\s+/g, ' '))
}
