const fs = require('fs')
const path = require('path')

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f)
    let isDirectory = fs.statSync(dirPath).isDirectory()
    if (isDirectory) {
      if (f !== 'node_modules' && f !== '.next' && f !== '.git' && f !== '.gemini') {
        walkDir(dirPath, callback)
      }
    } else {
      callback(dirPath)
    }
  })
}

walkDir(path.resolve(__dirname, '..'), filePath => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx') || filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    const content = fs.readFileSync(filePath, 'utf8')
    if (content.includes("from('memorials')") && content.includes('.update(')) {
      console.log(`Found .update on memorials in: ${filePath}`)
      // Print the matching lines
      const lines = content.split('\n')
      lines.forEach((line, idx) => {
        if (line.includes('.update(')) {
          console.log(`  Line ${idx + 1}: ${line.trim()}`)
        }
      })
    }
  }
})
