const fs = require('fs')
const path = require('path')

function listImages(dir) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      listImages(fullPath)
    } else {
      if (file.endsWith('.png') || file.endsWith('.svg') || file.endsWith('.webp') || file.endsWith('.jpg')) {
        const relative = path.relative(path.resolve(__dirname, '..'), fullPath)
        console.log(`${relative} - ${stat.size} bytes`)
      }
    }
  }
}

listImages(path.resolve(__dirname, '../public/images'))
