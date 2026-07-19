const fs = require('fs')
const path = require('path')

function searchDir(dir) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        searchDir(fullPath)
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.css')) {
        const content = fs.readFileSync(fullPath, 'utf8')
        if (content.includes('Siempre en nuestros corazones')) {
          console.log(`Found in: ${fullPath}`)
        }
      }
    }
  }
}

searchDir(path.resolve(__dirname, '..'))
