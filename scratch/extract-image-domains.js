const fs = require('fs')

const filePath = 'C:\\Users\\norbe\\.gemini\\antigravity\\brain\\2296d829-00a5-4831-89ec-d9bd0b658303\\.system_generated\\steps\\3647\\content.md'
const content = fs.readFileSync(filePath, 'utf8')

// Extraer todas las URLs que comiencen con http o https
const regexUrl = /https?:\/\/[^\s"'`>]+/gi
const matches = content.match(regexUrl) || []

const uniqueUrls = [...new Set(matches)]
console.log('URLs encontradas:', uniqueUrls.length)
uniqueUrls.forEach((url, idx) => {
  console.log(`${idx + 1}: ${url}`)
})
